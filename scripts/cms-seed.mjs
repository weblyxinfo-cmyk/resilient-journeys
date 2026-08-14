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
//
// --- label + sort_order (docs/cms-visual-admin.md) --------------------------
//
// The visual admin shows a client-facing `label` above each field ("Nadpis",
// not "homepage_hero_title") and orders fields within a section by
// `sort_order`. A heuristic can guess `section`/`description`/`field_type`
// well enough from the key and fallback (see below), but it cannot invent a
// good Czech label — that has to come from a person. Rather than maintaining
// a second file mapping key → label that inevitably drifts from the t() call
// it describes, `t()` takes an optional third argument:
//
//   t("homepage_hero_title", "You Transform Uncertainty...", "Nadpis — druhý řádek")
//
// It does nothing at runtime (see the comment in src/hooks/useCms.tsx) — this
// script is the only reader. `cms:gen` picks it up as `label` for the
// generated row; a t() call left at two arguments generates a row with
// `label = NULL` (admin falls back to showing the key) and `cms:check` warns
// (not fails — this is a style nudge, not a build break) so it isn't
// forgotten wholesale on a big migration.
//
// `sort_order` is assigned automatically: rows are numbered in steps of 10,
// per (page, section), in the order their t() calls are found — which is
// each file's top-to-bottom source order, files walked in directory order.
// This matches the rendered page order for the common case (a section's
// fields are usually written in the order they render), but not always —
// e.g. Services.tsx declares its `services`/`approaches`/`whoItsFor` arrays
// in a different order than the JSX below renders them. Generated
// sort_order, like the guessed section/description, is a starting point —
// check it against the actual page before merging, same as the rest of the
// generated migration.

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

  // CMS phase 2 (docs/cms-final-seed.md) — added when the rest of the site
  // was wired to useCms(). page values match docs/cms-keys-*.json, the
  // metadata source those seed migrations were generated from.
  'src/components/Navbar.tsx': 'navbar',
  'src/components/CookieBanner.tsx': 'shared',
  // Rendered inside every page that wraps its hero in <PageHero> and in the
  // navbar/footer logo respectively — one shared background image / one
  // shared logo file, not per-page content (docs/cms-images.md).
  'src/components/PageHero.tsx': 'shared',
  'src/components/Logo.tsx': 'shared',
  'src/pages/NotFound.tsx': 'shared',
  'src/components/AboutPreview.tsx': 'shared',
  'src/components/Testimonials.tsx': 'shared',
  'src/components/CategorySection.tsx': 'shared',
  'src/components/VideoPreviewCard.tsx': 'shared',
  'src/components/FreeGuideKit.tsx': 'shared',
  'src/components/LeadMagnet.tsx': 'shared',
  // Pricing.tsx is two different files with the same basename: the homepage
  // teaser component renders embedded on "/", the page component is the
  // dedicated "/pricing" route. Both map to the page their content actually
  // belongs to per docs/cms-keys-pricing.json.
  'src/components/Pricing.tsx': 'homepage',
  'src/pages/Pricing.tsx': 'pricing',
  'src/components/ProgramOverview.tsx': 'resilient-hub',
  'src/components/WorkshopInquiryForm.tsx': 'workshop-inquiry-form',
  'src/components/WorkshopRegistration.tsx': 'workshop-registration',
  'src/pages/Blog.tsx': 'blog',
  'src/pages/BlogPost.tsx': 'blog-post',
  'src/pages/Booking.tsx': 'booking',
  'src/pages/BookingSuccess.tsx': 'booking-success',
  'src/pages/Checkout.tsx': 'checkout',
  'src/pages/CheckoutSuccess.tsx': 'checkout-success',
  'src/pages/Cookies.tsx': 'legal',
  'src/pages/EndometriosisHub.tsx': 'endometriosis',
  'src/pages/FreeGuide.tsx': 'free-guide',
  'src/pages/FreeGuideThankYou.tsx': 'thank-you',
  // membership_whydifferent_*/faq_*/howto_title/howto_step_*/howto_note are
  // literally the same t() key+fallback as ResilientHubs.tsx (content
  // copy-pasted from /resilient-hubs, see the "preserved from
  // /resilient-hubs" comments in both files) and are already seeded under
  // page='resilient-hubs' by the time this map matters for cms:gen — a
  // fresh run skips any key that already has a migration regardless of
  // what page this map says, so the mismatch for those ~19 keys is
  // harmless. See docs/cms-final-seed.md.
  'src/pages/Membership.tsx': 'membership',
  'src/pages/Membership2.tsx': 'membership',
  'src/pages/PricingSuccess.tsx': 'pricing-success',
  'src/pages/Privacy.tsx': 'legal',
  'src/pages/ResilientHub.tsx': 'resilient-hub',
  'src/pages/ResilientHubs.tsx': 'resilient-hubs',
  'src/pages/Terms.tsx': 'legal',
  'src/pages/WorkshopPost.tsx': 'workshop-post',
  'src/pages/Workshopy.tsx': 'workshopy',
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
        (node.arguments.length === 2 || node.arguments.length === 3)
      ) {
        const [keyArg, fallbackArg, labelArg] = node.arguments;
        const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

        if (!ts.isStringLiteralLike(keyArg) || !ts.isStringLiteralLike(fallbackArg)) {
          warnings.push(
            `${relFile}:${line + 1} — t() call with a non-literal key or fallback, skipped (can't generate a static seed for it)`,
          );
        } else if (labelArg && !ts.isStringLiteralLike(labelArg)) {
          warnings.push(
            `${relFile}:${line + 1} — t() call with a non-literal label (3rd argument), skipped (can't generate a static seed for it)`,
          );
        } else {
          calls.push({
            file: relFile,
            line: line + 1,
            key: keyArg.text,
            fallback: fallbackArg.text,
            label: labelArg ? labelArg.text : undefined,
          });
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

// Returns Map<key, { value, label, file }> — the value/label each key would
// end up with after every migration in supabase/migrations/ (in filename/
// chronological order) is applied, tracking INSERT (only sets if unset, same
// as ON CONFLICT DO NOTHING) and UPDATE ... SET value = '...' WHERE key =
// '...'. `label` is only ever populated from an INSERT whose column list
// happens to include it (i.e. one this script generated) — no migration in
// this repo backfills label via a single-key guarded UPDATE, so that shape
// isn't taught to read it; see 20260814110300_backfill_cms_content_labels_and_sort_order.sql
// for how the one-time legacy backfill did it instead (a bulk statement this
// parser deliberately doesn't try to understand generically).
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
      const labelIdx = columns.indexOf('label');
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
        const label = labelIdx !== -1 ? fieldToValue(fields[labelIdx]) : undefined;
        if (key && !state.has(key)) {
          state.set(key, { value: value ?? '', label, file: filename });
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

function sqlInteger(value) {
  return String(value);
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
    '-- renders. section/description/field_type are best-effort guesses, and\n' +
    '-- so is sort_order if this section already has rows in the database —\n' +
    '-- review all of it, and label (from the t() call\'s 3rd argument, if any)\n' +
    '-- before committing.\n\n';
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
      `${sqlLiteral(r.page)}, ${sqlLiteral(r.section)}, ${sqlLiteral(r.field_type)}, ${sqlLiteral(r.label)}, ` +
      `${sqlInteger(r.sort_order)})${comma} -- from ${r.file}:${r.line}`
    );
  });
  return (
    `${header}INSERT INTO public.cms_content (key, value, default_value, description, page, section, field_type, label, sort_order) VALUES\n` +
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
  // sort_order counter per (page, section) — see the header comment for why
  // this is a starting point, not a guarantee, when a section already has
  // rows in the database.
  const sortCounters = new Map();
  const nextSortOrder = (page, section) => {
    const groupKey = `${page}::${section ?? ''}`;
    const value = (sortCounters.get(groupKey) ?? 0) + 10;
    sortCounters.set(groupKey, value);
    return value;
  };

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
      label: first.label ?? null,
      sort_order: nextSortOrder(page, section),
      file: first.file,
      line: first.line,
    });
  }

  const missingLabels = newRows.filter((r) => r.label === null);
  if (missingLabels.length) {
    console.warn(
      `\n${missingLabels.length} new row(s) have no label (t() called with only 2 arguments) — ` +
        'they will show the raw key in the admin until someone adds one:',
    );
    for (const r of missingLabels) console.warn(`  - ${r.key} (${r.file}:${r.line})`);
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
  let labelWarnings = 0;

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

    // Style nudge, not a failure: a key can be seeded fine (an existing
    // legacy row, or one seeded by hand) without ever going through a 3-arg
    // t() call, so a missing label here doesn't mean anything is broken —
    // just that the admin will show this field's raw key until someone adds
    // one, either as the 3rd t() argument or directly in the admin.
    const codeLabel = occurrences[0].label;
    if (codeLabel && seededRow.label !== codeLabel) {
      labelWarnings += 1;
      console.warn(
        `[label-mismatch] "${key}": code passes label ${JSON.stringify(codeLabel)} ` +
          `(${occurrences[0].file}:${occurrences[0].line}) but the seed migration has ` +
          `${JSON.stringify(seededRow.label ?? null)} (${seededRow.file}) — admin shows the seeded value.`,
      );
    }
  }

  if (!failed) {
    console.log(`OK — ${byKey.size} t() key(s) checked against supabase/migrations/, all seeded and matching.`);
    if (labelWarnings) console.log(`(${labelWarnings} label mismatch warning(s) above — not a failure.)`);
    return 0;
  }
  return 1;
}

const mode = process.argv.includes('--check') ? 'check' : 'generate';
const exitCode = mode === 'check' ? runCheck() : runGenerate();
process.exit(exitCode);
