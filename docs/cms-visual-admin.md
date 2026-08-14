# CMS vizuální admin — report

Cíl: přestavět `AdminCMS.tsx` z plochého seznamu klíčů na strukturu
**stránka → sekce (v pořadí, jak jdou na webu) → živý náhled té sekce →
lidsky popsaná pole pod ním**, aby v tom klientka (netechnická terapeutka)
poznala, kde na webu který text je, bez nutnosti umět číst klíče jako
`homepage_approach_1_description`.

Zachována je beze změny logiky autosave/race-condition/invalidace/revert
implementace z `docs/cms-faze0-report.md` — přenesena, ne přepsána od nuly.

## Migrace (soubory — nic z toho neběželo proti produkci)

Pořadí spuštění je dané časovými razítky, musí jít v tomto pořadí:

1. `supabase/migrations/20260814110000_cms_content_add_label.sql` —
   `ADD COLUMN IF NOT EXISTS label TEXT` na `cms_content`. Nullable, aditivní.
2. `supabase/migrations/20260814110100_create_cms_sections.sql` — nová
   tabulka `cms_sections` (`page`, `section_key`, `title`, `description`,
   `anchor`, `route`, `sort_order`, `is_active`, `UNIQUE(page, section_key)`).
   RLS podle vzoru `20260807100000_create_booking_cards.sql`: `FOR SELECT
   USING (true)`, `FOR ALL USING/WITH CHECK (public.has_role(auth.uid(),
   'admin'))`. Index na `(page, sort_order)`, trigger na `updated_at`.
3. `supabase/migrations/20260814110200_seed_cms_sections.sql` — 9 řádků:
   7 sekcí homepage (`hero`, `intro_video`, `why_join`, `approach`,
   `who_its_for`, `ways_to_work`, `services`), 1 about (`intro`), 1 shared
   (`contact`). Pořadí a `anchor` ověřeno proti skutečnému JSX (viz níže).
4. `supabase/migrations/20260814110300_backfill_cms_content_labels_and_sort_order.sql`
   — jeden `UPDATE ... FROM (VALUES ...)` doplňující `label` (česky) a
   `sort_order` (po 10 v rámci sekce, v pořadí, jak pole renderují na
   stránce) pro všech 53 stávajících klíčů. Plain UPDATE bez guardu — `label`
   a `sort_order` klient v adminu needituje (jen `value`), takže opakované
   spuštění je vždy bezpečné.

Po nasazení **regenerovat `src/integrations/supabase/types.ts`**
(`supabase gen types typescript`) — ruční doplnění `label` do `cms_content`
a nové tabulky `cms_sections` v tomto repu (viz níže) je jen dočasná náhrada,
aby `tsc` prošel bez připojení k prod DB, stejně jako u `default_value`/
`sort_order` ve Fázi 0.

## Kotvy ve webu (`id="cms-<page>-<section>"`)

Jen atributy `id` na obalující element, žádný text se neměnil:

- `src/components/Hero.tsx:10` — `cms-homepage-hero`
- `src/components/IntroVideo.tsx:23` — `cms-homepage-intro_video`
- `src/components/Services.tsx:171` — `cms-homepage-why_join` (blok „Why Join Resilient Mind?")
- `src/components/Services.tsx:213` — `cms-homepage-approach` („Why Our Approach Works")
- `src/components/Services.tsx:235` — `cms-homepage-who_its_for` („For Expats Ready to Thrive")
- `src/components/Services.tsx:252` — `cms-homepage-ways_to_work` („Ways to Work Together")
- `src/components/Services.tsx:283` — `cms-homepage-services` (karty služeb)
- `src/pages/About.tsx:47` — `cms-about-intro`
- `src/components/Footer.tsx:81` — `cms-shared-contact` (Footer je na všech stránkách, kotva stačí jednou)

Pozor: `Services.tsx` je v kódu **jeden** `<section>`, ale renderuje pět
skupin polí v jiném pořadí, než jsou v poli deklarovány (`services` je
deklarované první, ale na stránce se vykresluje **poslední**). Kotvy jsou
proto na pěti vnořených `<div>` uvnitř té sekce, ne na `<section>` samotné —
ověřeno čtením skutečného JSX, ne odhadem z názvu proměnné.

## `AdminCMS.tsx` — přestavěno celé

`src/components/admin/AdminCMS.tsx`:

- **Struktura**: výběr stránky (`Tabs`, české názvy z `PAGE_LABELS`, ne
  slugy) → uvnitř karty po sekcích v pořadí `cms_sections.sort_order` →
  v každé kartě nahoře `SectionPreview` (pokud sekce má `anchor`), pod ním
  pole v pořadí `cms_content.sort_order`.
- **`SectionPreview`** (nová komponenta v tomtéž souboru): `<iframe
  src={route}?cmsPreview={refreshKey}#{anchor}>`, zmenšený přes CSS
  `transform: scale(0.3)` na kontejner vysoký 300 px, `pointerEvents: 'none'`.
  - **Scroll na sekci**: web je čistě klientská SPA (Vite, ne SSR) — prohlížeč
    načte skoro prázdný `index.html` a React domontuje obsah až po
    doběhnutí CMS dotazu, takže vestavěný jednorázový scroll-na-`#fragment`
    obvykle proběhne dřív, než cílový element vůbec existuje. Řešeno
    polling smyčkou v `onLoad`: `iframe.contentDocument.getElementById(anchor)`
    kontrolovaným každých 150 ms po dobu ~3 s, `scrollIntoView()` jakmile se
    objeví. Stejný origin, žádný `postMessage` nebyl potřeba.
  - **Refresh po uložení**: `commitSave` po úspěšném zápisu zavolá
    `bumpPreview(page, section)`, která najde odpovídající `cms_sections.id`
    a inkrementuje čítač v `previewRefresh` — ten je součástí `key` i `src`
    iframu, takže se vynutí reload a znovu-scroll. Klientka tak vidí výsledek
    bez jakékoli akce navíc.
  - **Pád náhledu**: `onError` nastaví `failed`, karta pak místo iframu
    ukáže „Náhled se nepodařilo načíst" + odkaz „Otevřít stránku v nové
    záložce" — formulář pod tím zůstává plně funkční, nic se neblokuje.
- **Pole (`renderField`)**: nahoře `item.label || humanizovaný klíč`
  tučně, malý šedý `<code>` s technickým klíčem hned pod inputem (vždy
  viditelný, ale nedominuje), `item.description` (pro vývojáře) jako drobný
  text nad ním. Beze změny zůstávají: `SaveIndicator`, tlačítko „Zobrazit na
  webu" (per-page fallback), „Vrátit původní text" (`default_value`),
  Delete jen pro ručně přidané řádky.
- **„Ostatní"**: klíč, jehož `section` nemá odpovídající řádek v
  `cms_sections` pro danou stránku (nebo `section IS NULL`), spadne do
  karty „Ostatní" na konci stránky — bez náhledu, ale plně editovatelný.
  S dnešními daty (53/53 klíčů má sekci) se tahle karta nikde nezobrazí;
  existuje jako záchranná síť pro budoucí ručně přidaná pole.
- **Vyhledávání**: doplňkový režim nad `key`/`label`/`description`/`value`,
  výsledky teď nesou badge „Stránka · Sekce" (lidské názvy, ne slugy).
- **Zachováno beze změny**: debounced autosave (800 ms) + `SaveIndicator`,
  `inFlight` serializace uložení (viz `docs/cms-faze0-report.md` „Oprava
  bugu #2"), `beforeunload` guard, `queryClient.invalidateQueries({queryKey:
  ['cms_content']})` po každém uložení, `flushSave` na `onBlur`, revert na
  `default_value`, skrytí Delete u seedovaných řádků. Přidané `label` je
  jediné nové pole ve formuláři „Přidat/Upravit pole".
- Texty adminu (labely, toasty) přeloženy do češtiny — admin je pro
  netechnickou českou klientku.

## `useCms.tsx` — nepovinný 3. argument `t()`

`src/hooks/useCms.tsx:52` — `t(key, fallback, label?)`. `label` se za běhu
nikde nepoužívá (runtime chování `t()` je beze změny), čte ho jen generátor
níže. Zpětně kompatibilní — všech stávajících 53+ volání s dvěma argumenty
funguje beze změny.

## `scripts/cms-seed.mjs` — `label` + `sort_order`

Formát pro dalších ~1000 klíčů (zdůvodnění v hlavičce souboru):

```ts
t("homepage_hero_title", "You Transform Uncertainty Into Your Greatest Strength", "Nadpis — druhý řádek")
```

- **`label`**: musí napsat člověk (česká fráze), nedá se rozumně uhodnout
  ze jména klíče. Přidán jako 3. argument `t()` přímo v místě použití —
  jeden zdroj pravdy, žádný samostatný soubor „klíč → label", který by se
  časem rozešel s kódem. Vynechání 3. argumentu je v pořádku (`label =
  NULL`, admin ukáže klíč) — `cms:gen` na to jen upozorní na konci výpisu
  (kolik nových řádků nemá label), `cms:check` hlásí `[label-mismatch]`
  jako **varování, ne chybu** (nerozbije stávající zelený běh nad 53 klíči,
  žádné z nich 3-argumentové volání nepoužívají).
- **`sort_order`**: generuje se automaticky — čítač po 10 pro každou dvojici
  `(page, section)`, v pořadí, v jakém `t()` volání skript najde (soubor po
  souboru, v souboru shora dolů). To sedí pro typický případ (pole se v kódu
  píšou v pořadí, v jakém renderují), ale ne vždy — `Services.tsx` je právě
  ten protipříklad (pole `services` je v kódu deklarováno první, na stránce
  se ale vykresluje poslední). Vygenerovaný `sort_order` je proto vyznačen
  v hlavičce migrace jako „review before committing", stejně jako
  `section`/`description` guessy, které tahle poznámka měla už předtím.
- `runGenerate` teď generuje 9sloupcový `INSERT` (`..., label, sort_order`)
  místo 7sloupcového.
- `collectSeededState` umí přečíst `label` z `INSERT` sloupcového seznamu
  generickým `columns.indexOf('label')` (stejný mechanismus jako `key`/
  `value`) — funguje jen pro `INSERT`y, které skript sám vygeneroval;
  jednorázový bulk `UPDATE ... FROM (VALUES ...)` v
  `20260814110300_backfill_...sql` (53 stávajících klíčů) tenhle parser
  záměrně neumí obecně — je to jednorázová ruční migrace, ne něco, co
  generátor bude produkovat znovu.

## Ověření

```
$ npx tsc --noEmit
(žádný výstup, exit 0)

$ npm run build
✓ 2681 modules transformed.
✓ built in 2.52s
```

Bez chyb (jen nesouvisející browserslist warning, existoval už předtím).

```
$ npm run lint
✖ 83 problems (67 errors, 16 warnings)
```

Stejný počet jako baseline v `docs/cms-faze0-report.md` (67/16) — žádný z
mnou upravených souborů (`AdminCMS.tsx`, `Hero.tsx`, `IntroVideo.tsx`,
`Services.tsx`, `About.tsx`, `Footer.tsx`, `cms-seed.mjs`) se ve výpisu
neobjevuje. `useCms.tsx` má jedno **pre-existující** varování
(`react-refresh/only-export-components` — soubor exportuje komponentu i
hook dohromady, to je struktura souboru odedávna, nezměnil jsem ji).

```
$ npm run cms:check
```
Hlásí `[missing-seed]` pro ~90 `membership_*`/`membership2_*` klíčů. To
**nesouvisí s touto prací** — je to Membership.tsx/Membership2.tsx, na
kterých podle zadání paralelně pracuje jiný agent, a na které jsem
schválně nesahal. Ověřeno: žádný z nahlášených klíčů není homepage/about/
shared (těch se `cms:check` netýká, jsou v pořádku).

## Co nasadit a v jakém pořadí

1. 4 nové migrace v `supabase/migrations/` (viz seznam výše, v tomto pořadí
   — časová razítka na sebe navazují a `sort_order`/`label` backfill
   (migrace 4) předpokládá, že sloupec `label` z migrace 1 už existuje).
2. Regenerovat `src/integrations/supabase/types.ts`.
3. Nasadit frontend (Vercel) — `AdminCMS.tsx` přestavěn, `Hero.tsx`/
   `IntroVideo.tsx`/`Services.tsx`/`About.tsx`/`Footer.tsx` mají nové `id`
   atributy (bez vizuální změny), `useCms.tsx` má nepovinný 3. argument.
4. `scripts/cms-seed.mjs` se nasazuje jako součást repa, nic zvláštního
   navíc — použije se při psaní další fáze textů.

## Co proklikat v adminu (pro posouzení)

1. Admin → Website → Page Text. Výchozí tab „Domovská stránka" — mělo by
   být vidět 7 karet (Úvodní obrazovka, Úvodní video, Proč se připojit,
   Proč náš přístup funguje, Pro koho to je, Způsoby spolupráce, Karty
   služeb), každá s náhledem nahoře a poli pod ním.
2. V kartě „Úvodní obrazovka" změnit text pole „Nadpis — druhý řádek",
   počkat na „Uloženo" — náhled by se měl sám obnovit a ukázat nový text
   (může to chvíli trvat, náhled čeká, až se v iframu domontuje web a
   dotáhne CMS data).
3. Kliknout „Otevřít na webu" u libovolné sekce — otevře se `/` (nebo
   `/about`) rovnou naskrolovaná na danou sekci.
4. Přepnout na tab „O mně" — karta „Úvodní sekce (Kdo jsem)" s náhledem.
5. Přepnout na tab „Sdílené (více stránek)" — karta „Patička webu —
   kontakt" s polem „Kontaktní e-mail".
6. Vyzkoušet vyhledávání (např. „Skool" nebo „video") — výsledky by měly
   nést badge se stránkou a sekcí.
7. Zkusit odpojit síť uprostřed načítání náhledu (DevTools → Offline,
   pak reload karty) — místo rozbité stránky by se mělo objevit „Náhled
   se nepodařilo načíst" s funkčním odkazem, pole pod tím zůstávají
   editovatelná.
8. Regresní test race-condition uložení z `docs/cms-faze0-report.md`
   (Slow 3G throttling, dvě rychlá uložení za sebou) — logika je
   nezměněná, ale stojí za to ověřit, že přežila přesun do nové struktury.

## Co jsem NEudělal a proč

- **Membership.tsx/Membership2.tsx** — netknuto, hard constraint (paralelní
  agent). `cms:check` proto hlásí `missing-seed` pro jejich klíče — to je
  jejich rozpracovaná práce, ne regrese z téhle fáze.
- **Žádná migrace neběžela proti produkci**, žádné `git add -A`/`git add .`,
  žádný commit ani push.
- **`site_settings`** — mimo scope, beze změny (stejně jako ve Fázi 0).
- Nesahal jsem na `src/lib/pricing.ts`, `create-checkout`, `booking_cards`,
  booking edge funkce.
