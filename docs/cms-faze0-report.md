# CMS Fáze 0 — report

Implementace podle zadání v `docs/cms-mapa.md` + `docs/cms-review.md`. Žádný nový
text nešel do CMS — cílem bylo udělat admin použitelný a další práci strojovou.

## Změněné / vytvořené soubory

### Admin — AdminCMS.tsx (hlavní blok)
- `src/components/admin/AdminCMS.tsx` — přepsáno celé:
  - Debounced autosave (800 ms) místo jen `onBlur`, plus okamžitý flush při `onBlur` (přepnutí pole/tabu uloží ihned, nečeká se na debounce).
  - Indikátor stavu u každého pole (`Ukládám…` / `Uloženo` / chyba) — komponenta `SaveIndicator`.
  - `beforeunload` guard — varuje při zavření okna, pokud existuje pole se stavem `pending`/`saving`.
  - `queryClient.invalidateQueries({ queryKey: ['cms_content'] })` po každém uložení/smazání/vytvoření — public `useCms` cache (`staleTime: 5 min` v `src/hooks/useCms.tsx:34`) se už neukazuje starým obsahem.
  - Neblokující save — `commitSave` už nevolá `fetchContent()` (refetch všech řádků), jen upraví lokální stav daného řádku.
  - Vyhledávání nad `key` + `description` + `value` — při aktivním hledání se ukazuje plochý seznam napříč všemi stránkami (s badge stránky), jinak normální tab/accordion pohled.
  - Grupování po `section` uvnitř tabu přes shadcn `Accordion` (výchozí stav: všechny sekce rozbalené, jen teď jde sbalit).
  - Auto-výška textarey (`AutoTextarea` komponenta, `scrollHeight`).
  - `page` select v dialogu Add/Edit rozšířen na `PAGES` konstantu (14 hodnot): homepage, about, pricing, booking, membership, resilient-hub, resilient-hubs, free-guide, endometriosis, blog, footer, navbar, legal, shared.
  - Taby teď vychází ze statického seznamu `PAGES`, ne z existujících řádků — stránka bez seedu má tab i tak (opraven bug z `AdminCMS.tsx:43-44` v původním kódu).
  - Tlačítko „Vrátit původní text" (`RotateCcw` ikona) — zobrazí se, jen když `default_value !== null && value !== default_value`, uloží okamžitě.
  - Tlačítko Delete skryté pro seedované řádky (`default_value !== null`) — zůstává jen pro ručně přidané.
  - Odkaz „zobrazit na webu" (`ExternalLink`) — jen pro stránky s jasnou route (`PAGE_TO_PATH` mapa); `footer`/`navbar`/`legal`/`shared` nemají jednu URL, tam se odkaz nezobrazuje.

### Oprava chyby v cenách
- `src/components/admin/AdminSubscriptions.tsx:30,124,205` — `27` → `37` na všech třech místech (plán `basic_monthly.price`, `calculateMonthlyRevenue()` výpočet i komentář, badge „€27/month" → „€37/month"). Statistiky obratu teď počítají reálnou cenu.
- `src/components/Services.tsx:20` — ověřeno, fallback `"from €37"` je správně, nic se neměnilo.

### Generátor + verifikátor seedů
- `scripts/cms-seed.mjs` — nový soubor. Používá TS compiler API (ne regex) k nalezení všech `t("key", "fallback")` volání v `src/`.
  - `npm run cms:gen` — pro každý `t()` klíč, který ještě nemá seed migraci, vygeneruje `supabase/migrations/<timestamp>_cms_autogen_seed.sql` s hodnotou bit-identickou s fallbackem, `default_value` = stejná hodnota, odhadnutými `section`/`description`/`field_type`. Vyžaduje explicitní `FILE_PAGE_MAP` (soubor → `page`) — u neznámého souboru skript nahlásí chybu místo hádání špatné stránky.
  - `npm run cms:check` — bez připojení k databázi ověří ze souborů v `supabase/migrations/`: (a) každý `t()` klíč má seed migraci, (b) hodnota v migraci odpovídá fallbacku v kódu, (c) žádný klíč není použit s dvěma různými fallbacky. Nenulový exit kód při chybě.
  - Malý SQL parser uvnitř (`parseTuple`, `collectSeededState`) umí číst jak `INSERT ... VALUES (...)`, tak `UPDATE ... SET value = '...' WHERE key = '...'` (repo používá guardované UPDATE pro opravu starších hodnot — `20260806130000_seed_homepage_about_cms.sql`), zpracovává soubory chronologicky podle názvu.
  - Otestováno: `npm run cms:check` nad reálným repem prošlo (53 klíčů, žádná chyba) po doplnění dvou chybějících seedů (viz níže). Generátor otestován na dočasném testovacím souboru s apostrofem + uvozovkami — escaping (`''`) fungoval správně, testovací soubor i vygenerovaná migrace byly po ověření smazány.
- `package.json` — přidány skripty `"cms:gen"` a `"cms:check"`.

### Migrace (soubory — NIC z toho neběželo proti produkci)
- `supabase/migrations/20260813090000_cms_content_sort_and_default.sql` — `ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0`, `ADD COLUMN IF NOT EXISTS default_value TEXT`, backfill `default_value = value` pro existující řádky.
- `supabase/migrations/20260813090100_cms_content_rls_cleanup.sql` — DROP obou duplicitních SELECT i ALL politik (`Anyone can read cms_content` / `Anyone can view cms content`, `Admins can manage cms_content` / `Admins can manage cms content`), CREATE jedné SELECT + jedné ALL s explicitním `WITH CHECK (has_role(auth.uid(),'admin'))`.
- `supabase/migrations/20260813090200_seed_shared_contact_email.sql` — nový klíč `shared_contact_email` v `cms_content` (viz Footer níže).
- `supabase/migrations/20260813090300_seed_about_intro_video.sql` — doplňuje seed pro `about_intro_video` (řádek existoval na prod už dřív, vytvořený ručně před napojením na CMS, ale nikdy neměl migraci — `cms:check` to odhalilo jako `missing-seed`). `ON CONFLICT DO NOTHING`, takže na produkci je to no-op a klientčinu skutečnou hodnotu videa nepřepíše.
- `supabase/backfill_migration_ledger.sql` — **NENÍ v `supabase/migrations/`, záměrně.** Backfill ledgeru pro 6 migrací aplikovaných na prod ručně (`docs/cms-mapa.md` §1.6). Obsahuje instrukce ke spuštění v komentáři. **Nespouštěno.**

### Mrtvá záložka Settings
- `src/components/admin/AdminSettings.tsx` — smazán soubor.
- `src/pages/Admin.tsx` — odstraněn tab „Settings" i import; tab „Website" přestavěn na vnořené `Tabs` (podtab „Page Text" → `AdminCMS`), připraveno pro budoucí `AdminMembershipTiers`/`AdminFaq`/atd. Odstraněn i teď nepoužitý import ikony `Settings`.
- `src/components/Footer.tsx` — `contact@resilientmind.io` nahrazeno `t("shared_contact_email", "contact@resilientmind.io")` na obou místech (mailto link i zobrazený text, řádky 21 a 80 v původním souboru).
- **Tabulka `site_settings` v DB NEBYLA smazána** — podle zadání zůstává na později, po ověření, že ji už nic nepoužívá.

### Typy
- `src/integrations/supabase/types.ts` — ručně doplněny `sort_order: number` a `default_value: string | null` do `cms_content` (`Row`/`Insert`/`Update`). Nejde přes prod (`supabase gen types`), musí se to udělat znovu, až migrace poběží proti produkci — viz „Co musí uživatel udělat" níže.

## Výsledek `tsc --noEmit`
```
$ npx tsc --noEmit
(žádný výstup, exit 0)
```

## Výsledek `npm run build`
```
✓ 2681 modules transformed.
✓ built in 2.36s
```
Bez chyb. (Jediné hlášení je nesouvisející browserslist warning o zastaralé `caniuse-lite` databázi, existovalo už předtím.)

## `npm run lint`
Repo mělo před touto prací 67 existujících ESLint chyb (hlavně `no-explicit-any` v edge funkcích a jiných stránkách, `no-require-imports` v `tailwind.config.ts`) — žádná z nich není v souborech, které jsem měnil. Nový/upravený kód (`AdminCMS.tsx`, `Admin.tsx`, `Footer.tsx`, `AdminSubscriptions.tsx`, `scripts/cms-seed.mjs`) prochází lintem bez chyb i varování.

## Co jsem NEudělal a proč
- **Ledger backfill nebyl spuštěn** — připraven jako `supabase/backfill_migration_ledger.sql`, mimo `migrations/`, s instrukcí to ověřit a spustit ručně (tvrdé omezení #1).
- **Žádná migrace neběžela proti produkci** — všechny 4 nové soubory v `supabase/migrations/` čekají na `supabase db push` (nebo cílené spuštění) od uživatele.
- **`site_settings` tabulka nebyla smazána** — jen záložka a čtení z ní v kódu. Tabulka čeká na explicitní rozhodnutí uživatele.
- **Nepushoval jsem do gitu** ani `git add -A`/`git add .` — commit jsem nedělal vůbec (nebylo požadováno), soubory zůstávají jako lokální změny.
- Nesahal jsem na `create-checkout`, `src/lib/pricing.ts`, `membership_tiers`, `booking_cards` ani booking edge funkce (tvrdá omezení #3, #4).

## Co musí uživatel nasadit ručně (a v jakém pořadí)
1. **Ověřit ledger** (`SELECT version FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;`), pak spustit `supabase/backfill_migration_ledger.sql` — **před** jakýmkoli `supabase db push`, jinak CLI zkusí znovu aplikovat už-aplikované migrace.
2. Spustit 4 nové migrace v `supabase/migrations/` (jsou idempotentní — `ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT DO NOTHING`):
   - `20260813090000_cms_content_sort_and_default.sql`
   - `20260813090100_cms_content_rls_cleanup.sql`
   - `20260813090200_seed_shared_contact_email.sql`
   - `20260813090300_seed_about_intro_video.sql`
3. Po nasazení migrací **regenerovat `src/integrations/supabase/types.ts`** (`supabase gen types typescript`) — ruční doplnění `sort_order`/`default_value` v tomto reportu je jen dočasná náhrada, aby `tsc` prošel bez připojení k prod DB.
4. Nasadit frontend (Vercel) — obsahuje přepsaný `AdminCMS.tsx`, opravu cen v `AdminSubscriptions.tsx`, `Footer.tsx` napojený na `shared_contact_email`, a odstraněnou záložku Settings.
5. Klikací zkouška admina na existujících 52+1 klíčích (jak žádá plán) — hledání, accordion po sekcích, autosave indikátor, revert tlačítko, „zobrazit na webu" odkaz.
6. Rozhodnout a případně smazat `site_settings` tabulku (mimo scope téhle fáze).

## Jak spustit generátor a verifikátor
```bash
npm run cms:check   # ověří, že každý t() klíč v src/ má seed migraci a hodnota sedí s fallbackem
npm run cms:gen      # vygeneruje supabase/migrations/<timestamp>_cms_autogen_seed.sql pro nové t() klíče
```
Před `cms:gen` na nový soubor je nutné do `scripts/cms-seed.mjs` (`FILE_PAGE_MAP`) přidat mapování souboru na `page` — skript to jinak nahlásí a pro dané klíče nic nevygeneruje (raději selže nahlas, než aby uhodl špatnou stránku).
Aktuální stav: `npm run cms:check` prochází nad všemi 53 `t()` klíči v repu (52 původních + `shared_contact_email`).

## Oprava bugu #2 — race condition při ukládání

Sáhnuto výhradně do `src/components/admin/AdminCMS.tsx`. Nic jiného
nezměněno (opravy testera z `docs/cms-faze0-testy.md` — SQL generátor,
RLS reorder, `matchesSearch` na NULL — zůstávají nedotčené).

### Co bylo špatně

`commitSave(id)` (`AdminCMS.tsx`) četla `pendingValues.current[id]` jako
lokální hodnotu na začátku funkce a pak čekala na síťový `await
supabase...update(...)`. Když se pro stejné `id` spustilo `commitSave`
podruhé dřív, než první request doběhl (typicky: debounce vypálí uložení
„A", uživatel píše dál, druhý debounce vypálí uložení „B" dřív, než se
vrátí odpověď na „A"), běžely oba requesty nezávisle na sobě. Pokud
starší request („A") doběhl síťově později, přepsal v DB novější hodnotu
(„B") — a `status` u obou requestů skončil na `saved`, takže v UI nebyl
žádný signál, že se text ztratil.

### Řešení — serializace uložení per-`id`

- **`inFlight` ref** (`AdminCMS.tsx:124`) — `Record<string, boolean>`, značí, jestli pro dané `id` právě běží síťový request.
- **`commitSave(id)`** (`AdminCMS.tsx:268-314`) přepsána na smyčku:
  - Na začátku (`AdminCMS.tsx:269-270`) se vždy smaže `timers.current[id]` (timer, který vyvolal toto volání, už je spotřebovaný) a pokud `inFlight.current[id]` je `true`, funkce se okamžitě vrátí — **nespouští druhý request**. Nejnovější hodnota už je v `pendingValues.current[id]` (zapsaná synchronně v `handleValueChange`/`scheduleSave`, JS je jednovláknové, takže žádná ztráta při zápisu), takže ji vyzvedne již běžící volání.
  - Pokud `inFlight` není nastaven, funkce ho nastaví na `true` (`AdminCMS.tsx:275`) a vstoupí do `while (valueToSave !== undefined)` smyčky (`AdminCMS.tsx:278-305`): pošle update, a **po dokončení requestu** porovná `pendingValues.current[id]` s hodnotou, kterou právě uložila (`AdminCMS.tsx:295-304`). Pokud se nezměnila, smaže `pendingValues.current[id]` a smyčka končí. Pokud se mezitím objevila novější hodnota (ať už z probíhajícího psaní, nebo z druhého `commitSave` volání, které bylo výše potlačeno), smyčka **pokračuje a uloží i tu** — teprve pak nastaví `status` na `saved`.
  - `inFlight.current[id] = false` se nastaví ve `finally` bloku (`AdminCMS.tsx:311-313`), takže se uvolní i při chybě.
  - Chybový stav (`AdminCMS.tsx:282-289`): `pendingValues.current[id]` se **nemaže** — rozepsaná/needošlá hodnota zůstává k dispozici pro další pokus (další edit nebo blur), `status` přejde na `error`, funkce se vrátí (smyčka a `inFlight` guard se korektně ukončí přes `finally`).

### Proč to pokrývá i případ, kdy se hodnota změní během běžícího requestu

Protože kontrola „přišla novější hodnota?" neběží při spuštění requestu,
ale **po jeho dokončení**, zachytí jakoukoliv editaci, ke které došlo
kdykoliv v mezičase — ať přišla jako druhé volání `commitSave` (potlačené
guardem), nebo jen jako aktualizace `pendingValues.current[id]` bez
dalšího volání `commitSave` (např. by k tomu teoreticky mohlo dojít, kdyby
nový debounce timer ještě nestihl vypálit). V obou případech smyčka najde
při kontrole novější hodnotu a pošle ji jako další request — poslední
hodnota, kterou uživatel napsal, je vždy ta, která se jako poslední zapíše
do DB. Protože JS je jednovláknové, mezi zápisem do `pendingValues.current`
(synchronní, uvnitř event handleru) a čtením ve smyčce (po `await`) nemůže
dojít k žádné skutečné datové race — jediné místo, kde se běh interleaved,
je `await` na síť, a přesně to smyčka ošetřuje.

`status` zůstává `saving` po celou dobu řetězce (i mezi jednotlivými
iteracemi smyčky), takže se nikdy neukáže „Uloženo", dokud doopravdy
neskončí i navazující re-run — indikátor nelže. `beforeunload` guard
(`AdminCMS.tsx:146-156`) beze změny funguje správně, protože počítá
`status === 'pending' || 'saving'`, a `saving` trvá po celou dobu řetězce
uložení včetně re-runů.

`flushSave` (`onBlur`, `AdminCMS.tsx:325-330`) a `handleRevert`
(`AdminCMS.tsx:337-344`) volají `commitSave` beze změny — obě cesty teď
těží ze stejné serializace: pokud narazí na `inFlight`, nic nespustí a
spolehnou se na již běžící smyčku; pokud ne, spustí novou.

### Co má browser test vyzkoušet

Pro vynucení timingu (starší request doběhne později než novější) je
potřeba buď (a) uměle zpomalit síť, nebo (b) rychlé psaní se dvěma pauzami
přes 800 ms, kde je reálná latence k Supabase proměnlivá. Postup:

1. Otevřít Admin → Website Content Manager, otevřít DevTools → Network,
   nastavit **Network throttling** na „Slow 3G" (nebo použít
   `Network → Add custom throttling` s vysokou/proměnlivou latencí), aby
   requesty na `supabase.co` trvaly řádově sekundy.
2. Vybrat libovolné textové pole (např. `homepage` tab, libovolný text field).
3. Napsat text „AAA", počkat **přesně přes 800 ms** (sledovat, že se u
   pole objeví `Ukládám…`), pak okamžitě (do 1–2 s, než první request
   doběhne kvůli throttlingu) dopsat „BBB" a znovu počkat přes 800 ms, aby
   vypálil druhý debounce.
4. Sledovat v Network tabu, že jdou **dva samostatné PATCH/PUT requesty**
   na `cms_content` (ne jeden sloučený) — a že indikátor u pole zůstává
   `Ukládám…` nepřetržitě mezi nimi, ne že by krátce blikl na „Uloženo" a
   zase zpět.
5. Po doběhnutí obou requestů zkontrolovat: indikátor ukáže „Uloženo",
   a pole obsahuje přesně `AAABBB` (poslední napsaná hodnota).
6. **Klíčová kontrola:** znovu načíst stránku (F5, tvrdý reload) a ověřit,
   že se z DB načte `AAABBB`, ne `AAA` — tj. že v DB skutečně skončila
   poslední hodnota, ne ta starší, i kdyby síť požadavky prohodila.
7. Zopakovat s vypnutým throttlingem jako sanity check normálního
   (neracujícího) uložení — jeden request, `Ukládám…` → `Uloženo` do 1 s.
8. Regresní kontrola `onBlur`: napsat text a okamžitě (bez čekání na
   800 ms) kliknout mimo pole — musí se ihned spustit request a hodnota se
   uloží (chování `flushSave` beze změny).
9. Regresní kontrola chyby: s throttlingem zapnutým dočasně přerušit síť
   (DevTools → Offline) uprostřed psaní, počkat na `Chyba při ukládání`,
   pak zapnout síť zpět a pokračovat v psaní — ověřit, že rozepsaný text
   nezmizel a že se po dalším uložení zapíše správně (návaznost na error
   stav).

### Výstupy ověření

```
$ npx tsc --noEmit
(žádný výstup, exit 0)
```

```
$ npm run build
✓ 2681 modules transformed.
✓ built in 2.45s
```
Bez chyb (jen nesouvisející browserslist warning, existoval už předtím).

```
$ npm run lint
✖ 83 problems (67 errors, 16 warnings)
```
Stejný počet a stejná sada jako v `docs/cms-faze0-testy.md` §1 — potvrzeno
`grep -c "AdminCMS.tsx"` nad výstupem lintu: **0 shod**, žádná nová chyba
v opraveném souboru.

```
$ npm run cms:check
OK — 53 t() key(s) checked against supabase/migrations/, all seeded and matching.
```

### Dodatek — `default_value: undefined` před nasazením migrace `090000`

Dokud sloupec `default_value` na produkci neexistuje, `select('*')` (`AdminCMS.tsx:162`) ho vrátí jako `undefined`, ne `null`, což by obešlo všechny tři striktní `=== null`/`!== null` kontroly (Revert, Delete, `handleRevert`) a mohlo vést k uložení `undefined` přes reálnou hodnotu. Opraveno normalizací `default_value: row.default_value ?? null` na jednom místě v `fetchContent` (`AdminCMS.tsx:175-186`), stejným vzorem jako u `value`; ověřeno `npx tsc --noEmit` (exit 0) a `npm run build` (bez chyb).
