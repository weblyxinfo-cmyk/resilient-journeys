#!/usr/bin/env node
// CMS seed generator + verifier.
//
// Problem this solves (docs/cms-review.md §C1): manually retyping hundreds of
// `t("key", "fallback")` strings into SQL seed migrations is a guaranteed
// source of typos and lost apostrophes. This walks src/ with the TypeScript
// compiler API (not regex — several fallbacks contain quotes/apostrophes)
// and:
//   - `node scripts/cms-seed.mjs` (or `npm run cms:gen`)   generates a seed
//     migration for any t() key that doesn't have one yet, copying the
//     fallback text verbatim so the DB value starts bit-identical to it.
//   - `node scripts/cms-seed.mjs --check` (or `npm run cms:check`) verifies,
//     without touching the database, that (a) every t() key has a seed
//     migration, (b) the seeded value matches the code's fallback, and
//     (c) no key is used with two different fallback texts.
//
// "Has a seed migration" is checked against files in supabase/migrations/,
// not against the live database — this script must never connect to
// production (see the hard constraints in docs/cms-faze0-report.md).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const MIGRATIONS_DIR = path.join(ROOT, 'supabase', 'migrations');

// Maps a repo-relative source file to the cms_content `page` value its t()
// keys belong to. Deliberately explicit rather than guessed from the path —
// a component like Services.tsx renders on the homepage but its filename
// gives no clue, and getting `page` wrong makes a key invisible in the admin
// (docs/cms-mapa.md §5.1). Add an entry here when wiring a new file to
// useCms().
const FILE_PAGE_MAP = {
  'src/components/Hero.tsx': 'homepage',
  'src/components/Services.tsx': 'homepage',
  'src/components/IntroVideo.tsx': 'homepage',
  'src/components/Footer.tsx': 'footer',
  'src/pages/About.tsx': 'about',
  'src/components/__CmsSeedTest.tsx': 'homepage',
};

const FIELD_NAME_WORDS = new Set([
  'title', 'subtitle', 'description', 'text', 'price', 'label', 'image',
  'img', 'url', 'badge', 'cta', 'link', 'quote', 'name', 'value', 'heading',
  'subheading', 'content', 'prefix', 'suffix', 'highlight',
]);

function listSourceFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// Finds every `t("key", "fallback")` call using the TS compiler API. A
// regex would mis-handle the multi-line calls and the apostrophes/quotes
// that show up in real fallback text (e.g. About.tsx's "Hi, I'm").
function collectTCalls() {
  const calls = [];
  const warnings = [];

  for (const file of listSourceFiles(SRC_DIR)) {
    const text = fs.readFileSync(file, 'utf8');
    if (!text.includes('useCms')) continue; // cheap pre-filter

    const relFile = path.relative(ROOT, file).split(path.sep).join('/');
    const sourceFile = ts.createSourceFile(
      file,
      text,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    );

    const visit = (node) => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 't' &&
        node.arguments.length === 2
      ) {
        const [keyArg, fallbackArg] = node.arguments;
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

        if (!ts.isStringLiteralLike(keyArg) || !ts.isStringLiteralLike(fallbackArg)) {
          warnings.push(
            `${relFile}:${line + 1} — t() call with a non-literal key or fallback, skipped (can't generate a static seed for it)`,
          );
        } else {
          calls.push({ file: relFile, line: line + 1, key: keyArg.text, fallback: fallbackArg.text });
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  return { calls, warnings };
}

// --- Minimal SQL reader for supabase/migrations/*.sql ----------------------
//
// Not a general SQL parser: it only understands the two shapes this repo's
// cms_content seeds actually use —
//   INSERT INTO [public.]cms_content (col, col, ...) VALUES (...), (...) ...
//   UPDATE [public.]cms_content SET col = '...' [, ...] WHERE key = '...' ...
// — enough to answer "what value will this key end up with once every
// migration in the repo has been applied", which is what the verifier needs.

function parseTuple(text, startParenIndex) {
  // Parses one `(a, 'b', NULL, ...)` starting at the '(' and returns
  // [{ value, quoted }, ...] plus the index just past the matching ')'.
  const fields = [];
  let i = startParenIndex + 1;
  let field = '';
  let quoted = false;
  let inString = false;

  while (i < text.length) {
    const ch = text[i];
    if (inString) {
      if (ch === "'") {
        if (text[i + 1] === "'") {
          field += "'";
          i += 2;
          continue;
        }
        inString = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (/\s/.test(ch)) {
      // Whitespace between tokens (e.g. the newline/indent before the next
      // field in a multi-line tuple) is never part of an unquoted token and
      // must not leak into a following quoted string as leading whitespace.
      i++;
      continue;
    }
    if (ch === "'") {
      inString = true;
      quoted = true;
      i++;
      continue;
    }
    if (ch === ',') {
      fields.push({ value: quoted ? field : field.trim(), quoted });
      field = '';
      quoted = false;
      i++;
      continue;
    }
    if (ch === ')') {
      fields.push({ value: quoted ? field : field.trim(), quoted });
      i++;
      break;
    }
    field += ch;
    i++;
  }
  return { fields, next: i };
}

function fieldToValue(field) {
  if (!field) return null;
  if (field.quoted) return field.value;
  return field.value === 'NULL' ? null : field.value;
}

// Skips whitespace and `-- line comment`s starting at index i, returning the
// index of the next significant character. Used between VALUES tuples,
// where a trailing `-- from file:line` comment (see renderMigration) can sit
// between a tuple's closing ')' and the separating ','.
function skipTrivia(text, i) {
  for (;;) {
    while (i < text.length && /\s/.test(text[i])) i++;
    if (text[i] === '-' && text[i + 1] === '-') {
      while (i < text.length && text[i] !== '\n') i++;
      continue;
    }
    break;
  }
  return i;
}

// Returns Map<key, { value, file }> — the value each key would end up with
// after every migration in supabase/migrations/ (in filename/chronological
// order) is applied, tracking INSERT (only sets if unset, same as
// ON CONFLICT DO NOTHING) and UPDATE ... SET value = '...' WHERE key = '...'.
function collectSeededState() {
  const state = new Map();
  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const insertRe = /INSERT\s+INTO\s+(?:public\.)?cms_content\s*\(([^)]+)\)\s*VALUES/gi;
  const updateRe = /UPDATE\s+(?:public\.)?cms_content\s+SET([\s\S]*?)WHERE([\s\S]*?);/gi;

  for (const filename of files) {
    const text = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');

    // INSERTs
    let m;
    insertRe.lastIndex = 0;
    while ((m = insertRe.exec(text))) {
      const columns = m[1].split(',').map((c) => c.trim().toLowerCase());
      const keyIdx = columns.indexOf('key');
      const valueIdx = columns.indexOf('value');
      if (keyIdx === -1 || valueIdx === -1) continue;

      let i = m.index + m[0].length;
      // Skip to the first '(' of the tuple list, then read tuples separated
      // by commas until we hit something that isn't a tuple start (i.e.
      // "ON CONFLICT" or the terminating ';'). Rows commonly carry a trailing
      // `-- from file:line` comment (see renderMigration below), so trivia
      // between tuples/commas must skip line comments as well as whitespace
      // -- otherwise a comment sitting between ')' and ',' hides the comma
      // from this parser (and, if it hid the comma from Postgres too, would
      // be a real SQL syntax error -- see the comma placement in
      // renderMigration).
      i = skipTrivia(text, i);
      while (text[i] === '(') {
        const { fields, next } = parseTuple(text, i);
        const key = fieldToValue(fields[keyIdx]);
        const value = fieldToValue(fields[valueIdx]);
        if (key && !state.has(key)) {
          state.set(key, { value: value ?? '', file: filename });
        }
        i = skipTrivia(text, next);
        if (text[i] === ',') {
          i = skipTrivia(text, i + 1);
        } else {
          break;
        }
      }
    }

    // UPDATE ... SET value = '...' WHERE key = '...'
    updateRe.lastIndex = 0;
    while ((m = updateRe.exec(text))) {
      const setClause = m[1];
      const whereClause = m[2];
      const valueMatch = setClause.match(/\bvalue\s*=\s*'((?:[^']|'')*)'/i);
      const keyMatch = whereClause.match(/\bkey\s*=\s*'((?:[^']|'')*)'/i);
      if (!valueMatch || !keyMatch) continue;
      const key = keyMatch[1].replace(/''/g, "'");
      const value = valueMatch[1].replace(/''/g, "'");
      state.set(key, { value, file: filename });
    }
  }

  return state;
}

// --- Heuristics for newly-discovered keys -----------------------------------

function guessSectionAndDescription(page, key) {
  const pageToken = page.replace(/-/g, '');
  let rest = key;
  if (rest.startsWith(`${page}_`)) rest = rest.slice(page.length + 1);
  else if (rest.startsWith(`${pageToken}_`)) rest = rest.slice(pageToken.length + 1);

  const parts = rest.split('_').filter(Boolean);
  while (parts.length > 1 && FIELD_NAME_WORDS.has(parts[parts.length - 1])) parts.pop();
  while (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) parts.pop();

  const section = parts.length ? parts.join('_') : null;
  const pageLabel = page.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const description = section
    ? `${pageLabel} — ${section.replace(/_/g, ' ')} (auto-generated, please review)`
    : `${pageLabel} (auto-generated, please review)`;
  return { section, description };
}

function guessFieldType(key, fallback) {
  if (/video/i.test(key)) return 'video_url';
  if (/(^|_)(image|img)(_|$)/i.test(key)) return 'image_url';
  if (/_html$/i.test(key)) return 'html';
  if (fallback.length > 80 || fallback.includes('\n')) return 'textarea';
  return 'text';
}

function sqlLiteral(value) {
  return value === null ? 'NULL' : `'${value.replace(/'/g, "''")}'`;
}

function buildTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  );
}

function renderMigration(rows) {
  const header =
    '-- Auto-generated by `npm run cms:gen` (scripts/cms-seed.mjs).\n' +
    '-- value/default_value are copied verbatim from the t("key", "fallback")\n' +
    '-- call in the listed source file, so this is a no-op for what the page\n' +
    '-- renders. section/description/field_type are best-effort guesses —\n' +
    '-- review before committing.\n\n';
  // The trailing `-- from file:line` comment must come AFTER the comma that
  // separates this tuple from the next one, not before it — a comma placed
  // after a `--` comment is itself commented out, which turns
  // `VALUES (a) -- ...,\n(b)` into `VALUES (a) (b)`, a SQL syntax error
  // (missing comma between the VALUES tuples). Each row therefore carries
  // its own trailing comma except the last one.
  const lines = rows.map((r, idx) => {
    const comma = idx < rows.length - 1 ? ',' : '';
    return (
      `  (${sqlLiteral(r.key)}, ${sqlLiteral(r.value)}, ${sqlLiteral(r.value)}, ${sqlLiteral(r.description)}, ` +
      `${sqlLiteral(r.page)}, ${sqlLiteral(r.section)}, ${sqlLiteral(r.field_type)})${comma} -- from ${r.file}:${r.line}`
    );
  });
  return (
    `${header}INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type) VALUES\n` +
    `${lines.join('\n')}\nON CONFLICT (key) DO NOTHING;\n`
  );
}

function groupByKey(calls) {
  const byKey = new Map();
  for (const call of calls) {
    if (!byKey.has(call.key)) byKey.set(call.key, []);
    byKey.get(call.key).push(call);
  }
  return byKey;
}

function runGenerate() {
  const { calls, warnings } = collectTCalls();
  warnings.forEach((w) => console.warn(`[skip] ${w}`));

  const seeded = collectSeededState();
  const byKey = groupByKey(calls);
  const missingFileMappings = new Set();
  const newRows = [];

  for (const [key, occurrences] of byKey) {
    if (seeded.has(key)) continue; // already has a migration, nothing to do
    const first = occurrences[0];
    const page = FILE_PAGE_MAP[first.file];
    if (!page) {
      missingFileMappings.add(first.file);
      continue;
    }
    const { section, description } = guessSectionAndDescription(page, key);
    const field_type = guessFieldType(key, first.fallback);
    newRows.push({
      key,
      value: first.fallback,
      description,
      page,
      section,
      field_type,
      file: first.file,
      line: first.line,
    });
  }

  if (missingFileMappings.size) {
    console.error('\nAdd these files to FILE_PAGE_MAP in scripts/cms-seed.mjs before generating seeds for their t() calls:');
    for (const f of missingFileMappings) console.error(`  - ${f}`);
  }

  if (newRows.length === 0) {
    console.log('No new t() keys to seed — everything already has a migration.');
    return missingFileMappings.size ? 1 : 0;
  }

  const filename = `${buildTimestamp()}_cms_autogen_seed.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);
  fs.writeFileSync(filepath, renderMigration(newRows));
  console.log(`Wrote ${newRows.length} new row(s) to supabase/migrations/${filename}`);
  console.log('This migration is NOT applied to any database — review it, then deploy like any other migration.');
  return missingFileMappings.size ? 1 : 0;
}

function runCheck() {
  const { calls, warnings } = collectTCalls();
  const seeded = collectSeededState();
  const byKey = groupByKey(calls);

  let failed = false;

  for (const w of warnings) {
    console.warn(`[skip] ${w}`);
  }

  for (const [key, occurrences] of byKey) {
    const fallbacks = new Set(occurrences.map((o) => o.fallback));
    if (fallbacks.size > 1) {
      failed = true;
      console.error(`[duplicate-fallback] "${key}" is used with ${fallbacks.size} different fallback texts:`);
      for (const o of occurrences) console.error(`    ${o.file}:${o.line} → ${JSON.stringify(o.fallback)}`);
      continue;
    }

    const [fallback] = fallbacks;
    const seededRow = seeded.get(key);
    if (!seededRow) {
      failed = true;
      console.error(`[missing-seed] "${key}" (${occurrences[0].file}:${occurrences[0].line}) has no seed migration.`);
      continue;
    }
    if (seededRow.value !== fallback) {
      failed = true;
      console.error(
        `[value-mismatch] "${key}": migration value ${JSON.stringify(seededRow.value)} (${seededRow.file}) ` +
          `!== code fallback ${JSON.stringify(fallback)} (${occurrences[0].file}:${occurrences[0].line})`,
      );
    }
  }

  if (!failed) {
    console.log(`OK — ${byKey.size} t() key(s) checked against supabase/migrations/, all seeded and matching.`);
    return 0;
  }
  return 1;
}

const mode = process.argv.includes('--check') ? 'check' : 'generate';
const exitCode = mode === 'check' ? runCheck() : runGenerate();
process.exit(exitCode);
