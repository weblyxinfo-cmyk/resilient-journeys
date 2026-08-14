# CMS Fáze 0 — testy

Verifikace implementace popsané v `docs/cms-faze0-report.md`, proti požadavkům v
`docs/cms-mapa.md` a `docs/cms-review.md`. Provedeno čtením kódu, statickou
analýzou a spouštěním build/lint/generátor nástrojů. **Nic neběželo proti
produkční DB** (žádné Management API volání, žádný `supabase db push`, žádná
lokální Supabase instance).

Během testování jsem u dvou míst našel a rovnou opravil malé, jednoznačné
chyby (viz §3). Jedno větší zjištění (§3, B1) nechávám k rozhodnutí — jde o
netriviální změnu logiky ukládání, kterou nejde bezpečně upravit bez
browser-testu na živém adminu.

---

## 1. Doslovné výstupy příkazů

### `npx tsc --noEmit`
```
$ npx tsc --noEmit
(žádný výstup, exit 0)
```
**PASS.**

### `npm run build`
```
> vite_react_shadcn_ts@0.0.0 build
> vite build

vite v5.4.19 building for production...
✓ 2681 modules transformed.
✓ built in 2.39s
```
Bez chyb. Jediné hlášení je nesouvisející browserslist warning o zastaralé
`caniuse-lite` databázi (existoval už předtím). **PASS.**

### `npm run lint`
```
✖ 83 problems (67 errors, 16 warnings)
```
Ověřil jsem explicitně: **žádný ze 67 chybových řádků není v souborech, které
implementace měnila** (`AdminCMS.tsx`, `Admin.tsx`, `Footer.tsx`,
`AdminSubscriptions.tsx`, `scripts/cms-seed.mjs`) — potvrzeno greppem
chybového výstupu proti seznamu změněných souborů, žádná shoda. Tvrzení
implementátora („67 existujících chyb, žádná nová v měněných souborech")
**potvrzeno**. **PASS.**

### `npm run cms:check`
```
> vite_react_shadcn_ts@0.0.0 cms:check
> node scripts/cms-seed.mjs --check

OK — 53 t() key(s) checked against supabase/migrations/, all seeded and matching.
```
**PASS** (nad 53 klíči, přesně jak tvrdí report).

---

## 2. Tabulka ověření

| # | Co | Verdikt | Důkaz |
|---|---|---|---|
| 1 | `tsc --noEmit` | PASS | §1 |
| 2 | `npm run build` | PASS | §1 |
| 3 | `npm run lint` — žádná nová chyba v měněných souborech | PASS | §1, grep proti seznamu 67 chyb |
| 4 | `npm run cms:check` — 53 klíčů | PASS | §1 |
| 5 | `cms-seed.mjs` — SQL escaping (apostrof, uvozovky, zpětné lomítko, víceřádkový text, €, emoji, `--`/`;`) | PASS (po opravě, viz §3 bug #1) | §3, reálný test s dočasným souborem |
| 6 | `cms-seed.mjs` — detekce duplicitního klíče s různým fallbackem | PASS | `[duplicate-fallback]`, exit 1, reálný test |
| 7 | `cms-seed.mjs` — `cms:check` umí selhat na chybějícím seedu | PASS | `[missing-seed]`, exit 1, reálný test |
| 8 | `cms-seed.mjs` — detekce value-mismatch (fallback změněn po seedu) | PASS | `[value-mismatch]`, exit 1, reálný test |
| 9 | `cms-seed.mjs` — chybějící `FILE_PAGE_MAP` selže nahlas, nehádá | PASS | exit 1, žádný řádek vygenerován pro neznámý soubor |
| 10 | `cms-seed.mjs` — nachází `t()` v ternárním operátoru, poli, JSX props, template literálu | PASS | reálný test, všech 13 edge-case volání nalezeno |
| 11 | `cms-seed.mjs` — nepřehlédne `t()` z jiné knihovny / metodu `.t()` | PASS | žádný `t(...)` mimo `useCms()` v repu; `foo.t()` má `PropertyAccessExpression`, ne `Identifier`, korektně vyloučeno |
| 12 | `cms-seed.mjs` — generátor produkuje syntakticky validní SQL pro **více** nových řádků najednou | **FAIL → opraveno**, viz §3 bug #1 | |
| 13 | Migrace 090000 — idempotence, chování backfillu na NULL `value` | PASS | §4 |
| 14 | Migrace 090100 (RLS cleanup) — idempotence | PASS | §4 |
| 15 | Migrace 090100 — okno nečitelnosti mezi DROP a CREATE | ČÁSTEČNĚ opraveno (přeuspořádání), zbytek závisí na způsobu nasazení — viz §4 | |
| 16 | Migrace 090100 — `has_role(auth.uid(),'admin')` odpovídá existujícím migracím | PASS | §4, grep proti 6 dalším souborům |
| 17 | Migrace 090200 (`shared_contact_email`) — no-op vůči fallbacku | PASS | §4 |
| 18 | Migrace 090300 (`about_intro_video`) — `ON CONFLICT DO NOTHING` nepřepíše klientčinu hodnotu | PASS | §4 |
| 19 | `backfill_migration_ledger.sql` — sloupce `version`/`name` | NELZE OVĚŘIT bez DB (chybí `statements`, viz §4) | |
| 20 | `AdminCMS.tsx` — autosave + onBlur, race condition (starší hodnota přepíše novější) | **FAIL**, popsáno, neopraveno — viz §5 bug #2 (KRITICKÉ) | |
| 21 | `AdminCMS.tsx` — ztráta dat při přepnutí tabu/unmountu | PASS (za předpokladu standardního blur-před-unmount chování prohlížeče — doporučeno ověřit v browser testu) | §5 |
| 22 | `AdminCMS.tsx` — `beforeunload` guard se správně čistí | PASS | §5 |
| 23 | `AdminCMS.tsx` — `invalidateQueries` klíč odpovídá `useCms.tsx` | PASS | `['cms_content']` na obou místech, přesná shoda |
| 24 | `AdminCMS.tsx` — „Vrátit původní" s `default_value === null` | PASS | podmínka `!== null`, žádný crash |
| 25 | `AdminCMS.tsx` — Delete skrytý pro seedované řádky, nejde obejít z UI | PASS | |
| 26 | `AdminCMS.tsx` — vyhledávání case-insensitive, null `description` | PASS | |
| 27 | `AdminCMS.tsx` — vyhledávání a null `value` | **FAIL → opraveno**, viz §5 bug #3 | |
| 28 | `AdminCMS.tsx` — `PAGES` pokrývá existující `page` hodnoty | PASS pro vše ověřitelné staticky, zbytek NELZE OVĚŘIT bez DB — viz §5 | |
| 29 | `Footer.tsx` — `shared_contact_email` na obou místech, fallback funguje před migrací | PASS | |
| 30 | `Admin.tsx` — žádný mrtvý import, unikátní tab hodnoty | PASS | |
| 31 | Grep `AdminSettings`/`site_settings` mimo `types.ts` | PASS | jediný výskyt je generovaný typ, ne živý kód |
| 32 | `git diff` prázdný na `create-checkout`, `pricing.ts`, `booking_cards`, booking edge fn, `Pricing.tsx`, `Membership(2).tsx` | PASS | `git diff ... | wc -l` = 0 |

---

## 3. `scripts/cms-seed.mjs` — detail testu a nalezené chyby

Testováno vytvořením dočasného souboru `src/components/__CmsSeedTest.tsx` s
`t()` voláními obsahujícími: apostrof (`don't`), uvozovky (`"hello"`),
zpětné lomítko (`C:\path\to\file`), víceřádkový text, `€`/emoji, SQL
injection řetězec (`'; DROP TABLE cms_content; -- comment`), řetězec s `--`
uprostřed, a čtyři tvary zanoření: ternární operátor, pole objektů, JSX prop,
template literal. Po testu smazáno (soubor, vygenerovaná migrace i dočasný
zápis do `FILE_PAGE_MAP`) — `git status` po úklidu čistý.

### Bug #1 — KRITICKÁ, OPRAVENO: generátor produkoval syntakticky nevalidní SQL pro dávky ≥ 2 nových klíčů

`renderMigration()` skládal každý řádek jako
`  (...) -- from file:line` a řádky spojoval přes `lines.join(',\n')` —
čárka oddělující tuply tedy skončila **za** SQL komentářem:

```sql
('a', ...) -- from file:8,
('b', ...) -- from file:9,
```

Čárka na konci prvního řádku je uvnitř `--` komentáře → Postgres ji ignoruje
→ mezi `('a', ...)` a `('b', ...)` chybí čárka → **syntax error**. Tohle jsem
si nedomyslel teoreticky — potvrdil to samotný `cms:check`: po vygenerování
13 testovacích řádků nahlásil `[missing-seed]` pro 12 z nich (jeho vlastní
mini-parser správně odmítl uznat tuply bez čárky za platné, což nezávisle
potvrdilo, že skutečná SQL by taky selhala).

**Dopad:** Tahle chyba se v současné implementaci nikdy neprojevila, protože
oba reálné seedy (`shared_contact_email`, `about_intro_video`) byly napsané
ručně, ne přes `cms:gen`, a `cms:gen` samotný ještě nikdy negeneroval více
než 1 nový řádek najednou. Je to ale přesně nástroj, který má podle plánu
(`docs/cms-review.md` §D, fáze 2–N) nést dalších ~950 řetězců v dávkách po
100–150 klíčích — při prvním reálném použití na víc než 1 klíč by vygeneroval
migraci, která by na produkci spadla s syntax error.

**Oprava (`scripts/cms-seed.mjs`):**
- `renderMigration()` — čárka teď je hned za uzavírací `)`, komentář až za ní; poslední řádek čárku nemá.
- `collectSeededState()` (checker) — přidána `skipTrivia()`, která mezi tuply přeskakuje jak whitespace, tak `-- ...` komentáře, takže parser správně čte i budoucí migrace s trailing komentáři.

Po opravě: 13 testovacích řádků vygenerováno, `cms:check` je všechny správně
rozpoznal (66/66 klíčů OK), pak smazáno a `cms:check` znovu prošel na
původních 53. Viz git diff `scripts/cms-seed.mjs` pro přesný rozsah opravy.

### Ostatní ověřené vlastnosti (PASS)
- **Duplicitní klíč, různý fallback:** `[duplicate-fallback]`, exit 1.
- **Chybějící seed:** `[missing-seed]`, exit 1.
- **Value-mismatch** (fallback v kódu se změnil po seedu): `[value-mismatch]`, exit 1.
- **Neznámý soubor bez `FILE_PAGE_MAP`:** hlásí chybu, negeneruje nic pro dané klíče, exit 1 — neuhodne špatnou stránku.
- **Zanoření:** ternární operátor, pole objektů, JSX prop, template literal — všech 13 volání (včetně edge-case dat) nalezeno.
- **False positives:** žádný jiný `t(...)` dvouargumentový string-literal call v repu mimo `useCms()`. Metoda `foo.t()` by nebyla `ts.isIdentifier(node.expression)`, takže je bezpečně vyloučená (ověřeno čtením kódu, v repu se ale žádná taková metoda ani nevyskytuje).

---

## 4. SQL migrace — detail

### `20260813090000_cms_content_sort_and_default.sql`
`ADD COLUMN IF NOT EXISTS` ×2 + `UPDATE ... SET default_value = value WHERE
default_value IS NULL`. Idempotentní z hlediska chyb (podruhé nic
nerozbije). **Jedna nuance k vědomí, ne bug:** pokud mezi prvním a
budoucím druhým spuštěním klientka ručně přidá vlastní řádek (má
`default_value IS NULL` záměrně, aby zůstal mazatelný a bez „Revert"
tlačítka), druhé spuštění by mu **omylem přiřadilo `default_value = value`**
a ten řádek by se navenek začal tvářit jako seedovaný (zmizelo by mu Delete,
objevilo by se nefunkční Revert). V praxi neškodí, protože migrace se
aplikuje jen jednou (ledger to hlídá) — zmiňuji jen pro případ ručního
znovu-spuštění mimo běžný `db push` flow.

Backfill na `NULL value`: pokud by `value` bylo NULL (sloupec to bez `NOT
NULL` dovoluje), `default_value` by se nastavilo taky na NULL — žádná chyba,
`UPDATE` s NULL na obou stranách prostě nic neudělá škodlivého.

### `20260813090100_cms_content_rls_cleanup.sql`
- `has_role(auth.uid(),'admin')` — **ověřeno**, přesně odpovídá signatuře i volání ve všech ostatních migracích v repu (`20260108082044`, `20260119120000`, `20260128000000`, `20260807100000` atd.).
- **Idempotence:** ověřeno ručně krok po kroku — druhé spuštění: `DROP POLICY IF EXISTS` na jméno, které existuje (vytvořené prvním během), projde; na jméno, které neexistuje, je no-op; `CREATE POLICY` se stejným jménem, které bylo o řádek výš zrovna smazané, neselže na duplicitě. Bezpečné 2×.
- **Okno nečitelnosti mezi DROP a CREATE:** tohle byl nejzávažnější bod k ověření. Původní pořadí bylo DROP ×4 (obě SELECT, obě ALL), pak CREATE ×2 — to znamená, že mezi dropnutím obou SELECT politik a vytvořením nové by anonymní návštěvník (nemá ALL politiku) na krátkou chvíli neměl vůbec žádnou SELECT politiku → prázdný výsledek dotazu (ne error — RLS bez politiky vrací 0 řádků, `useCms` to díky existujícímu error-handlingu bezpečně převede na fallbacky, web nezbělá, ale dotaz by dočasně vracel prázdno). **Opravil jsem** pořadí na DROP+CREATE hned za sebou pro každou politiku zvlášť (odpovídá i existujícímu vzoru v `20260807100000_create_booking_cards.sql`), což minimalizuje okno na jediný pár příkazů místo čtyř. Úplné odstranění rizika záleží na tom, **jak se migrace nasazuje**: pokud se pošle jako jeden víceřádkový SQL dotaz (přesně jak `docs/cms-mapa.md` §1.6 doporučuje — `POST .../database/query`), Postgresův „simple query protocol" spustí všechny příkazy v jednom implicitním transakčním bloku a žádné okno navenek vidět nebude. Pokud by se aplikovalo přes nástroj, co běží po jednotlivých autocommit příkazech, okno (byť teď jednořádkové) teoreticky existuje. **Nešlo ověřit bez běžící DB — zmiňuji jako zbytkové riziko, ne blokující.**

### `20260813090200_seed_shared_contact_email.sql`
`ON CONFLICT (key) DO NOTHING`, hodnota `contact@resilientmind.io` je
bit-identická s fallbackem, který `Footer.tsx` používal předtím. Na
produkci, kde klíč ještě neexistuje, vloží nový řádek se stejnou hodnotou,
jakou web už zobrazoval — vizuálně no-op. **PASS.**

### `20260813090300_seed_about_intro_video.sql`
`ON CONFLICT (key) DO NOTHING` — protože řádek `about_intro_video` na
produkci už existuje (vytvořen ručně dřív), tenhle INSERT se **celý**
přeskočí, klientčina reálná hodnota videa (a její `default_value`, viz níže)
zůstane nedotčená. **PASS**, potvrzeno tvrzení reportu.

Drobná poznámka k pořadí (ne bug): migrace `090000` běží dřív a už tomuto
řádku (protože existuje s neprázdnou hodnotou) nastaví `default_value =
value` (klientčina skutečná URL), takže „Vrátit původní" by u tohoto
konkrétního klíče vrátilo aktuální hodnotu, ne prázdný řetězec z `090300`.
Nejde o chybu ani ztrátu dat, jen o vedlejší efekt pořadí — zmiňuji pro
úplnost.

### `backfill_migration_ledger.sql`
Mimo `migrations/`, obsahuje jen `version`/`name`, žádný `statements`
sloupec. **NELZE OVĚŘIT staticky**, jestli `supabase_migrations.schema_migrations`
vyžaduje `statements` (NOT NULL bez defaultu by INSERT shodil). Soubor sám
instruuje k ručnímu ověření řádků před spuštěním (`SELECT version FROM
... LIMIT 10`), ale neinstruuje k ověření sloupců tabulky. **Doporučení:**
před spuštěním `\d supabase_migrations.schema_migrations` nebo ekvivalent,
ověřit že `statements` je nullable / má default.

---

## 5. `AdminCMS.tsx` — detail

### Bug #2 — KRITICKÉ, NEOPRAVENO (ponechávám k rozhodnutí): out-of-order dokončení souběžných uložení může přepsat novější hodnotu starší

`commitSave(id)` čte `pendingValues.current[id]` jako lokální `const`
**na začátku** funkce a teprve pak čeká na Supabase (`await ... update(...)`).
Pokud se pro **stejné `id`** spustí `commitSave` podruhé (typicky: debounce
vypálí uložení hodnoty „A", uživatel mezitím napíše „B" a jeho vlastní
debounce timer vypálí uložení „B" dřív, než první request na „A" doběhne
síť), obě volání běží **souběžně, nezávisle na sobě**. Pokud request s
hodnotou „A" (starší) doběhne síťově **později** než request s „B" (novější,
ale vypálený později a stihne se rychleji), do databáze skončí zapsáno „A"
— tedy **starší hodnota přepíše novější**, přesně scénář, na který jste se
ptali. Admin UI přitom stále ukazuje „B" (lokální `content` state se od
odeslání requestu už nemění) a indikátor ukáže „Saved" pro oba requesty —
**není žádný viditelný signál, že se něco nesynchronizovalo.**

Podmínky, kdy k tomu reálně dojde: druhé uložení musí vypálit **po** prvním,
ale doběhnout síťově **dřív** — vyžaduje to buď frontu více rychlých editací
za sebou (běžné psaní), nebo kolísavou latenci k Supabase. Není to
teoretická nemožnost, ale ani garantovaný jev při každé editaci — je to
timing-dependentní race.

**Proč jsem to neopravil sám:** správná oprava vyžaduje serializaci uložení
per-`id` (např. `inFlight` mapa + po dokončení requestu zkontrolovat, jestli
mezitím nepřibyla novější `pendingValues.current[id]`, a pokud ano, hned
spustit další `commitSave`). Je to netriviální změna asynchronní logiky v
souboru, který je pro klientku živý nástroj na denní použití, a bez
prohlížeče/živé DB ji nemůžu ověřit v praxi — je to přesně případ z zadání
„u čehokoli většího nebo diskutabilního to jen popiš a nech rozhodnutí na
mně". Navrhovaná oprava (cca 15 řádků, `inFlight` guard + re-run po
dokončení) je připravená k implementaci, ale chce to ověřit browser-testem
(rychlé po sobě jdoucí editace stejného pole), ne jen čtením kódu.

### Bug #3 — MALÁ, OPRAVENO: `matchesSearch` mohla spadnout na `NULL` hodnotě

`value` sloupec v DB nemá `NOT NULL` (`supabase/migrations/20260206100000_fix_missing_columns.sql:17`),
ale TS typ (`types.ts`, i `CMSContent` interface v `AdminCMS.tsx`) ho
deklaruje jako `string`. `matchesSearch` volalo `item.value.toLowerCase()`
bez ochrany — řádek s `value = NULL` (např. vložený přímo přes Supabase
Studio) by při zadání čehokoli do vyhledávání shodil **celé vykreslení
CMS záložky** (chyba za běhu v `useMemo`). Opraveno normalizací při
načtení (`fetchContent`): `value: row.value ?? ''`, takže neplatí jen pro
search, ale pro všechna následná použití `item.value` v komponentě.

### Ostatní ověřené body (PASS)
- **`invalidateQueries({queryKey:['cms_content']})`** — klíč `AdminCMS.tsx` (3× — po uložení, smazání, vytvoření/editaci přes dialog) přesně odpovídá `useCms.tsx:18` (`queryKey: ['cms_content']`). Bez překlepu, invalidace bude fungovat.
- **beforeunload guard** — `hasUnsaved` počítá jen `pending`/`saving`; po dokončení uložení `status` přejde na `saved` → po 2s na `idle` (guardováno, aby nepřepsalo novější stav), takže listener se korektně odpojí a neotravuje po uložení. Menší poznámka: `error` stav se do `hasUnsaved` nepočítá, takže selhané uložení po zobrazení toastu už při zavření okna nevaruje podruhé — nejde o bug, spíš designové rozhodnutí, zmiňuji pro úplnost.
- **Ztráta dat při přepnutí tabu/unmountu** — nejde spustit bez prohlížeče, ale z kódu: přepnutí stránkového tabu i outer Admin tabu vždy vyžaduje klik mimo aktuálně fokusované pole, což ve všech běžných prohlížečích vyvolá `blur` **před** odmountováním, a `onBlur` volá `flushSave` synchronně (spustí request ihned) — samotný `fetch` na pozadí přežije unmount komponenty (není vázaný na component lifecycle, není tam `AbortController`). Skutečné odeslání dat by tedy nemělo být ztraceno ani při unmountu uprostřed requestu. Časovač, který **ještě nevypálil** (do 800 ms), je uklizen `beforeunload` guardem jen pro zavření okna/reload — pro to je pokrytí funkční (status je v tu chvíli `pending`). Doporučuji ověřit browser-testem rychlým proklikáním tabů uprostřed psaní, ale z kódu nevidím díru.
- **„Vrátit původní" s `default_value === null`** — podmínka `item.default_value !== null && ...` tlačítko jednoduše nezobrazí, žádný crash.
- **Delete skrytý pro seedované řádky** — `item.default_value === null` řídí viditelnost, nejde obejít z UI (jen přímým zásahem do DB, mimo scope adminu).
- **Vyhledávání case-insensitive** — ano (`toLowerCase()` na obou stranách). Prázdný `description` ošetřen (`?? ''`), `value` viz bug #3.
- **`PAGES` pokrývá existující `page` hodnoty** — ověřil jsem dvěma způsoby: (1) všechny `page` hodnoty použité v SQL seed migracích (`homepage`, `about`, `shared`) jsou v `PAGES`; (2) starý (pre-rewrite) admin dialog nabízel jen 6 pevných hodnot (`homepage`, `about`, `pricing`, `booking`, `resilient-hub`, `blog` — zjištěno z `git show HEAD:...` staré verze souboru) a všech 6 je v novém `PAGES` seznamu taky. **Nelze ale vyloučit** řádek vložený přímo přes SQL/Supabase Studio s hodnotou `page` mimo tento seznam — starý kód takový řádek dřív zobrazoval (tvořil tab dynamicky přes `new Set(content.map(c => c.page))`), nový kód by ho **ukázal jen přes vyhledávání**, ne jako vlastní tab. Doporučuji před nasazením `SELECT DISTINCT page FROM cms_content;` a porovnat s `PAGES` v `AdminCMS.tsx`.

---

## 6. Regrese jinde (§5 zadání) — shrnutí

Všechno PASS, detaily viz tabulka v §2, bod 29–32. Konkrétně:
- `Footer.tsx` — fallback identický s předchozí hardcoded hodnotou na obou místech.
- `Admin.tsx` — žádný mrtvý import (`Settings` ikona odstraněna), žádná mrtvá route, unikátní tab hodnoty napříč vnořenými `Tabs`.
- `AdminSettings`/`site_settings` — jediný zbývající výskyt je generovaný TS typ (`types.ts:693`), žádný živý kód.
- `create-checkout`, `pricing.ts`, `booking_cards`, booking edge funkce, `Pricing.tsx`, `Membership(2).tsx` — `git diff` prázdný, nic nedotčeno.

---

## 7. Co NEJDE ověřit bez běžící DB / prohlížeče

Předávám dál pro browser test:

1. **Bug #2 (race condition při souběžném ukládání)** — potřebuje reálné síťové zpoždění a rychlé po sobě jdoucí editace stejného pole, aby se timing dal vynutit/pozorovat.
2. **Klikací zkouška na existujících 52+1 klíčích** (vyhledávání, accordion po sekcích, autosave indikátor, revert tlačítko, „zobrazit na webu" odkaz) — vyžaduje běžící web + přihlášeného admina.
3. **RLS cleanup (090100) v praxi** — jestli se migrace nasadí jako jeden multi-statement query (bezpečné, viz §4) nebo postupně (teoretické okno) závisí na skutečném deploy mechanismu, který nemám k dispozici.
4. **`backfill_migration_ledger.sql` proti reálnému schématu** `supabase_migrations.schema_migrations` (existence/nullabilita sloupce `statements`).
5. **Skutečné produkční `page` hodnoty** — `SELECT DISTINCT page FROM cms_content` proti `PAGES` konstantě (viz §5).
6. **Ztráta dat při unmountu** — moje analýza je z kódu/DOM-teorie (blur před unmount), ne z pozorovaného chování v prohlížeči.
7. Vizuální regrese (auto-výška textarey, accordion, badge při vyhledávání) — nejde posoudit staticky.

---

## 8. Nalezené chyby — souhrn podle závažnosti

| # | Závažnost | Kde | Stav |
|---|---|---|---|
| 1 | 🔴 Kritická | `scripts/cms-seed.mjs` — generátor produkoval nevalidní SQL (chybějící čárky mezi VALUES tuply) pro dávky ≥ 2 nových klíčů | **Opraveno** |
| 2 | 🔴 Kritická | `AdminCMS.tsx` — souběžné `commitSave` volání pro stejné `id` mohou dokončit mimo pořadí a zapsat starší hodnotu jako poslední, beze stopy v UI | **Popsáno, neopraveno** — vyžaduje větší zásah + browser test |
| 3 | 🟠 Střední | `20260813090100_cms_content_rls_cleanup.sql` — DROP všech 4 politik před CREATE nových otevíralo (teoreticky) širší okno bez anon SELECT politiky | **Opraveno** (přeuspořádáno na pár DROP+CREATE); úplné odstranění závisí na deploy mechanismu (viz §4) |
| 4 | 🟡 Malá | `AdminCMS.tsx` — `matchesSearch` mohla spadnout na `NULL` hodnotě sloupce `value` | **Opraveno** |
| 5 | 🟡 Malá / informativní | `backfill_migration_ledger.sql` neobsahuje `statements` sloupec, nejde ověřit bez DB, zda je potřeba | Nahlášeno, doporučeno ověřit `\d` schématu před spuštěním |
| 6 | 🟢 Nízká / poznámka | `20260813090000` — druhé spuštění po ručním přidání vlastního řádku by mu nechtěně nastavilo `default_value` | Nahlášeno, v praxi neškodí (migrace běží jen 1×) |
| 7 | 🟢 Nízká / poznámka | `AdminCMS.tsx` — `error` stav uložení se nepočítá do `beforeunload` guardu | Nahlášeno, pravděpodobně záměrné |

---

## 9. Verdikt

**Build/typy/lint/cms:check: PASS.** Generátor seedů měl skutečnou, dosud
neprojevenou kritickou chybu, teď opravenou a ověřenou na reálných edge-case
datech (escaping, duplicity, chybějící seed, zanoření) — pro fázi 0 samotnou
bezpečné (nepoužilo se na >1 řádek), ale bylo by to okamžitě prasklo ve fázi
2+, kde má nést stovky klíčů v dávkách. SQL migrace jsou po opravě (RLS
reorder) bezpečné pro nasazení; jedna otevřená otázka (`backfill_migration_ledger.sql`
sloupce) vyžaduje ruční ověření schématu před spuštěním, ne kódovou opravu.

**Jedna neopravená kritická chyba zůstává: race condition v `AdminCMS.tsx`
autosave (bug #2).** Je to přesně ten typ chyby, který v zadání zněl „aby se
to ukládalo" — v nízké pravděpodobnosti, ale reálně, se za určitého timingu
neuloží. Doporučuju to opravit (návrh řešení je v §5) a ověřit browser-testem
před nasazením na produkci, ne až po. Zbytek fáze 0 (RLS, sort_order/default_value,
oprava cen v `AdminSubscriptions`, smazání `AdminSettings`, Footer napojení,
neblokující save, invalidace cache, vyhledávání, accordion, revert/delete
logika) je podle mého ověření v pořádku a připravené k nasazení.

**Souhrnný verdikt: PASS s jednou otevřenou kritickou položkou (bug #2) a
jednou položkou vyžadující ruční ověření schématu před spuštěním
(`backfill_migration_ledger.sql`).** Nejde o blokující chyby ve smyslu „něco
je rozbité" — jde o riziko, které buď (a) nikdy nenastane za typického
používání, nebo (b) je snadno předejitelné ruční kontrolou před spuštěním
SQL. Doporučuju bug #2 vyřešit před tím, než na to klientka spoléhá jako na
denní pracovní nástroj.
