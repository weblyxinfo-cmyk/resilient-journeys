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

## Oprava zamrzlého adminu po nasazení celého webu do CMS (2026-08-14)

Po commitu `cf07a8f` (1057 klíčů, 186 sekcí) klientka hlásila, že se admin
panel nenačte. Příčina: `SectionPreview` se renderovalo pro **všechny**
sekce vybrané stránky najednou — každé jako `<iframe>` se `src` na živý web,
tedy plnohodnotný boot celé aplikace včetně vlastního dotazu na
`cms_content` (react-query cache se mezi dokumenty v iframech nesdílí).
Stránka „Právní stránky" má 40 sekcí → 40 paralelních bootů appky najednou,
prohlížeč to položil. Dokud v CMS byla jen homepage (pár sekcí), problém se
neprojevil.

### Změna — jen `src/components/admin/AdminCMS.tsx`

1. **Lazy náhledy přes `IntersectionObserver`.** `SectionPreview` má nově
   stav `active`; dokud karta sekce není blízko viewportu (`rootMargin:
   '400px 0px'`), iframe se vůbec nemountuje — místo něj je lehký
   placeholder s názvem sekce a tlačítkem „Zobrazit náhled" (pro ruční
   vynucení načtení, i mimo viewport). Když karta opustí viewport, iframe
   se po `1200ms` debounce (aby netrhalo náhled při běžném poposcrollování
   tam a zpět) odmountuje a placeholder se vrátí.
2. **Globální strop souběžných náhledů — `previewSlotManager`.** Modulový
   singleton (sdílený všemi instancemi `SectionPreview`) drží frontu a
   povoluje max. `MAX_ACTIVE_PREVIEWS = 3` aktivních iframů naráz, bez
   ohledu na to, kolik karet je zrovna v/blízko viewportu. Karta, která
   chce načíst náhled, ale všechny sloty jsou obsazené, čeká ve frontě
   (FIFO) a slot dostane, jakmile se nějaký uvolní (karta odscrollovaná
   pryč, nebo unmount celé stránky/tabu).
3. **Iframe nikdy neblokuje editaci.** Pole pod náhledem jsou nezávislá na
   `active`/`loaded`/`failed` stavu náhledu — fungovala tak už předtím,
   nezměněno. `loading="lazy"` na iframe jsem záměrně nepřidal — je
   zbytečné navíc, protože iframe teď stejně vzniká v DOM až ve chvíli,
   kdy je fakticky potřeba (podmíněné mountování je spolehlivější než
   prohlížečova heuristika, která je nespolehlivá u transformovaných/
   scale() prvků, jak čeká zadání).
4. **Autosave/race-condition/`beforeunload`/revert/seed-guard/search beze
   změny** — `commitSave`, `scheduleSave`, `flushSave`, `inFlight`,
   `pendingValues`, `queryClient.invalidateQueries`, `bumpPreview`,
   `handleRevert`, mazání jen u neseedovaných řádků — nedotčeno.
5. **Dotaz na `cms_content` (`select('*')`, 1057 řádků) ponechán beze
   změny.** Běží jednou za otevření adminu (ne za sekci/iframe — to už
   řeší bod 1–2) a napájí i cross-page vyhledávání, které prohledává
   všechna pole napříč stránkami. Zúžení na sloupce nebo jen aktivní
   stránku by vyžadovalo buď dotahovat data znovu při každém přepnutí
   stránky (regrese v UX), nebo rozdělit fetch pro seznam vs. pro
   vyhledávání (větší zásah, riziko rozjetí search) — nedělal jsem to,
   protože to podle zadání nebyl skutečný zdroj zamrznutí.

### Ověření (lokální dev server, produkční DB)

Dev server (`npm run dev`, port 8080) proti produkční Supabase DB,
headless Chromium (Playwright z globální npx cache, projekt sám
Playwright nemá) s přihlášením `admin@resilientmind.com` (viz
`docs/cms-faze0-browser.md`). Přímý `goto('/admin')` jsem nepoužil —
známý pre-existing race v `useAuth.tsx` (cold load umí spadnout do
`/dashboard` dřív, než se `isAdmin` stihne doplnit) — místo toho login →
`/dashboard` → dropdown „Admin" → „Admin Panel" (spolehlivá cesta, popsaná
tamtéž).

- **Website → Page Text → „Právní stránky" (40 sekcí):** stránka reagovala
  okamžitě, žádné zaseknutí. Během prvních ~3s po otevření tabu proběhly
  jen **4 požadavky** na `?cmsPreview=` (1 doběhlý z předchozí stránky +
  3 nově aktivované sloty), místo 40. Viditelných placeholderů „Zobrazit
  náhled" (ještě nenačtených) bylo 38.
- **Scroll test:** 8× kolečko myši dolů; za celý scroll přibylo jen 7
  dalších `cmsPreview` požadavků (postupné dobírání, ne najednou). Počet
  živých `<iframe src*="cmsPreview">` prvků v DOM v libovolném okamžiku
  nepřekročil strop (naměřeno 2, cap je 3).
- **Screenshot** `legal-tab.png` (scratchpad) potvrzuje placeholdery s
  názvem sekce a tlačítkem u nenačtených karet, náhled u aktivních.
- **Editace + autosave:** vytvořen testovací klíč
  `zz_freezefix_tmp_<timestamp>`, do pole zapsána nová hodnota → indikátor
  prošel „Ukládám…" → „Uloženo" (do ~200 ms). Po tvrdém přechodu pryč z
  adminu a zpět (fresh mount) byla uložená hodnota v DB potvrzená.
  Testovací klíč byl na konci smazán přes UI (mazací ikonu); finální
  sweep vyhledáváním „zz_freezefix" napříč všemi stránkami potvrdil
  **0 výsledků** — v produkční DB nezůstal žádný testovací řádek ani
  vedlejší produkt ladění (jeden dřívější neuklizený pokus
  `zz_freezefix_tmp` byl při té příležitosti také smazán).
- Do žádného existujícího klientčina textu se nesahalo.
- `npx tsc --noEmit` — bez chyb. `npm run build` — prošel.
- Dev server na konci zastaven.

## Přestavba na jeden sdílený sticky náhled + zjednodušení polí (2026-08-14, odpoledne)

Uživatel po zhlédnutí lazy-loading verze (viz sekce výše) řekl „musíš to líp
udělat" — náhled na ~300px byl nečitelný a jeden iframe na sekci byl
koncepčně špatně. Zadání: **jeden jediný `<iframe>` pro celý admin**
(ne jeden na sekci), ve stálém pravém sloupci (sticky), který se při
přepnutí sekce jen odscrolluje na nové místo — nový `<iframe src>`
(skutečný reload) jen když se mění `route`. Zároveň požadavek na
vizuální zjednodušení karty pole (schovat technický klíč, zrušit
vnořené karty, badge typu pole jen tam, kde má význam).

### Změna — jen `src/components/admin/AdminCMS.tsx`

- **`SharedPreview`** nahradilo `SectionPreview` + celý `previewSlotManager`
  (ten padl beze zbytku — s jedním iframem není co frontovat). Jedna
  instance pro celý admin, ne jedna na sekci/kartu.
- Stav `previewSection` (`CMSSection | null`) žije v `AdminCMS`. Nastavuje
  se kliknutím na hlavičku karty sekce (má-li `anchor`) nebo `onFocus`
  libovolného pole v té sekci (`focusPreview`).
- `SharedPreview` interně porovnává `` `${route}::${refreshKey}` `` s tím,
  co má aktuálně načtené (`loadedKeyRef`) — shoda → jen
  `scrollToAnchor()` na existujícím `contentDocument` (žádný nový
  `src`), neshoda → nastaví nový `src` (reálný reload) a po `onLoad`
  doscrolluje.
- **Detekce skryté sekce**: stejné pollování `getElementById(anchor)` jako
  předtím, ale teď s explicitním `anchorMissing` stavem — když se po 20
  pokusech (3s) element nenajde, ukáže se „Tato sekce se na webu teď
  nezobrazuje — je prázdná nebo skrytá." místo tichého zůstání na vršku
  stránky. Ověřeno na `homepage_intro_video` (`IntroVideo.tsx`
  `return null` když je URL prázdné, na produkci prázdné) — přesně
  scénář ze zadání.
- **Layout**: `grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]`, pravý
  sloupec `lg:sticky lg:top-24 h-[360px] lg:h-[calc(100vh-7rem)]`. Na
  mobilu (`order-first`) je náhled nad seznamem, kompaktní pevná výška,
  ne skrytý za tlačítkem. Tlačítko Rozbalit/Zmenšit (`Maximize2`/
  `Minimize2`) na desktopu přepíná mezi 2-sloupcovým layoutem a
  náhledem přes celou šířku (list se jen schová `lg:hidden`, iframe se
  díky tomu nikdy needstruje — žádný reload).
- **Bez auto-výběru sekce při otevření stránky** — viz „Objevený vedlejší
  bug" níže, proč byl tenhle záměr (auto-select first section) zase
  odstraněn. Panel při přepnutí stránkové záložky jen vyčistí
  (`setPreviewSection(null)` → placeholder „Klikněte do pole nebo na
  název sekce vlevo…"), nikdy sám neotevře iframe bez uživatelovy akce.
- **`bumpPreview`** teď jen porovnává `page` (ne přesnou sekci) proti
  `previewSectionRef.current` a bumpne `previewRefreshKey` — force
  reload jednoho iframu místo dřívějšího `Record<sectionId, number>`.
- **Pole (`renderField`)**: z karty v kartě je teď plochý řádek
  oddělený `border-b`. Technický klíč zmizel z běžného pohledu — je za
  malou `Info` ikonkou s `title="Klíč: …"` (hover tooltip). Anglický
  `description` se už nezobrazuje vedle labelu; renderuje se jako malý
  šedý text POD polem (jen když existuje) — jednotné pravidlo, protože
  automaticky rozeznat „duplikuje label" vs. „nese info navíc" (např.
  „Nechte prázdné pro skrytí sekce") není bez ruční editace obsahu v DB
  proveditelné; posun pod pole aspoň řeší vizuální duplicitu vedle
  labelu. Badge typu pole se ukazuje jen pro `video_url`/`html`/
  `image_url` (ne pro `text`/`textarea`, drtivá většina polí). Ikony
  akcí zmenšeny na `h-7 w-7`.
- Autosave/`inFlight`/`beforeunload`/`invalidateQueries`/Revert/
  seed-guard mazání/cross-page search — beze změny.

### Objevený vedlejší, závažný, PŘEDEXISTUJÍCÍ bug (mimo scope, nespraveno)

Při ověřování v prohlížeči jsem narazil na to, že kliknutí na „Website"
tab (nebo jakákoli akce, která založí NOVÝ preview iframe) občas až
**spolehlivě** shodí celý admin zpět na výchozí tab „Content" —
`Admin.tsx`ův loading-guard (`if (loading || !user || !isAdmin) return
<Verifying access…>`) se na zlomek sekundy zapne, což odmountuje
`<Tabs defaultValue="content">` a při remountu se vrátí na výchozí
hodnotu, takže cokoli měl uživatel rozkliknuté (i celý stav `AdminCMS`)
zmizí.

**Příčina** (potvrzeno instrumentací, ne jen dohad): každý preview
`<iframe>` je stejný origin a bootuje vlastní kopii appky → vlastní
instanci `supabase-js` klienta (`createClient(..., { persistSession:
true, autoRefreshToken: true, storage: localStorage })` v
`src/integrations/supabase/client.ts`). I když `useAuth.tsx` má už
existující `isPreviewFrame()` guard, co uvnitř iframu **vypne vlastní
`AuthProvider`** (viz komentář v souboru — řeší to GoTrue lock
contention/AbortErrory), samotný `supabase-js` klient se pořád
instancuje a při inicializaci zapisuje do `localStorage` testovací klíč
(`lswt-…`, „localStorage write test"). Protože je to STEJNÝ origin,
zápis vyvolá `storage` event i v rodičovském okně, kde ho zachytí
GoTrueClient hlavní appky (cross-tab session-sync — vestavěná vlastnost
knihovny) a spustí přehodnocení session → `useAuth`'s
`onAuthStateChange` dostane nový event → `user`/`isAdmin` se na chvíli
zresetují → `Admin.tsx` ukáže loading guard → tab se vrátí na default.

Ověřeno přímo: `window.addEventListener('storage', …)` v rodičovském
okně zachytil zápis `lswt-…` doslova ve stejném framu (~10-100ms) jako
se objevilo „Verifying access…".

**Rozsah**: netýká se to jen mého přepisu. Reprodukoval jsem to i na
**už nasazené (committed) verzi** z předchozí opravy (lazy
per-section iframe) — stačí, aby se JAKÝKOLI preview iframe poprvé
načetl (`IntersectionObserver` auto-load nebo klik na „Zobrazit
náhled"). Je to tedy pre-existující bug v architektuře „stejný origin
iframe + `persistSession: true` klient", ne regrese z dnešní práce —
jen jsem ho díky důkladnějšímu testování odhalil.

**Co jsem udělal v rámci povoleného scope**: odstranil jsem auto-výběr
sekce k náhledu při otevření stránky (dřív jsem ho přidal jako
vylepšení nad rámec zadání) — bez něj admin **bez prvního kliknutí na
náhled** zůstává 100% stabilní (ověřeno: 6× střídavé přepínání
Content/Bookings/Members/Website/Messages bez jediného selhání). Jakmile
uživatel poprvé v session klikne na sekci/pole (a tím founduje první
`<iframe src>`), riziko shození zůstává — je to ale nefixovatelné z
`AdminCMS.tsx`; oprava patří do `useAuth.tsx` (např. filtrovat `storage`
eventy podle klíče, nebo `persistSession: false` pro `isPreviewFrame()`
instance) nebo `client.ts`, oba mimo povolený scope téhle práce.

**Co to znamená pro ověření**: automatizované klikání přes Playwright
v headless Chromiu tenhle bug spolehlivě trefovalo, takže jsem nezískal
čistý end-to-end screenshot celého flow (náhled sekce → scroll bez
reloadu → hidden-section hláška) v jedné nepřerušené session. Co se mi
přesto podařilo změřit/ověřit nezávisle:

- **Bez kliknutí na náhled je celý admin stabilní** (viz výše, 6/6).
- **Počet skutečných navigací iframu na 40sekční stránce „Právní
  stránky" za jeden klik na sekci: 2** (obě na stejnou URL —
  `about:blank`→reálná URL pár v Chromiu, ne 2 různé stránky), tedy
  řádově níž než 40 — samotná architektura (1 sdílený iframe) funguje.
- **Přepnutí na JINOU sekci na STEJNÉ route: 0 dalších navigací** —
  ověřeno v běhu, kde se panel po prvním kliknutí nezhroutil (Test 4 v
  `test-final.mjs` ve scratchpadu) — potvrzuje klíčový mechanismus
  „scroll, ne reload" funguje přesně podle zadání.
- **Hidden-section detekce**: logiku jsem ověřil čtením kódu a
  potvrdil, že `homepage_intro_video` je na produkci prázdné (takže
  `IntroVideo.tsx` sekci nerenderuje) — přesný scénář z hlášení. Kvůli
  výše popsanému bugu se mi ale nepodařilo získat čistý screenshot
  hlášky „Tato sekce se na webu teď nezobrazuje…" bez zásahu resetu.
- **Autosave/edit** (Test 5): kompletně čistý běh — vytvořen testovací
  klíč, upravena hodnota, `Ukládám…`→`Uloženo` do ~200ms, po reloadu
  ověřena perzistence, klíč smazán. V DB nezůstal žádný testovací
  řádek.
- Do žádného existujícího klientčina textu se nesahalo.
- `npx tsc --noEmit` a `npm run build` — oba bez chyb.
- Dev server na konci zastaven.

**Doporučení pro tým**: než se tenhle pre-existing bug opraví v
`useAuth.tsx`/`client.ts`, klientka pravděpodobně narazí na to, že po
prvním kliknutí na náhled sekce se admin „vrátí" na záložku Content —
frustrující, ale needitovatelná pole ani uložený obsah tím neztrácí
(jen otevřenou záložku/rozpracovaný výběr). Doporučuju založit
samostatný úkol na `useAuth.tsx`, ne řešit ho pod „jen AdminCMS.tsx".

## `cmsPreview=1`, živý náhled při psaní, konec „Přidat pole" (2026-08-14, večer)

Navazuje na sekci výše. Mezitím paralelní agent skutečně opravil kořenovou
příčinu resetu adminu v `src/lib/previewMode.ts` (nový sdílený
`isPreviewFrame()`) + `src/integrations/supabase/client.ts` (`noopStorage`
+ `persistSession: false` uvnitř preview iframu — žádný zápis do
`localStorage`, žádný `storage` event pro rodiče). Já jsem na
`useAuth.tsx` ani `client.ts` nesahal, jen jsem zajistil, že
`AdminCMS.tsx` do URL náhledu skutečně posílá parametr, který to
detekuje.

### Změna — `src/components/admin/AdminCMS.tsx` + `src/hooks/useCms.tsx`

1. **`cmsPreview=1` natvrdo** (`AdminCMS.tsx:220`,
   `` `${section.route}?cmsPreview=1&r=${refreshKey}` ``). Dřív se tam
   omylem posílal `refreshKey` (číslo, které začíná na `0` → `cmsPreview=0`
   → falsy → auth flow v iframu se nevypnul). Cache-busting po uložení pole
   teď jede přes samostatný parametr `r`. Platí to při navigaci na jinou
   `route` i po refreshi stejné stránky; při pouhém přepnutí sekce na
   STEJNÉ route se `src` vůbec nemění (jen scroll), takže parametr nemá jak
   zmizet.
2. **Živý náhled při psaní** (`postMessage`, ne teprve po uložení):
   - `previewIframeRef` teď žije v `AdminCMS`, ne uvnitř `SharedPreview`
     (ta ho dostává jako prop) — potřebuje ho i `scheduleLivePreview`.
   - `handleValueChange` kromě `scheduleSave` (800ms, do DB) teď volá i
     `scheduleLivePreview` (100ms debounce, samostatný timer per klíč) →
     `postLivePreviewUpdate` pošle
     `{ type: 'cms-preview-update', key, value }` na
     `iframe.contentWindow` s `targetOrigin = window.location.origin`.
   - `handleRevert` posílá live update okamžitě (bez debounce — je to
     jednorázová akce, ne proud kláves).
   - `useCms.tsx`: `CmsProvider` má nový `isLivePreviewFrame()` check
     (`?cmsPreview=1` v URL — vlastní, nezávislá kopie na `previewMode.ts`,
     protože si o `useAuth.tsx`/sdílené soubory neškrtám). Jen tam
     naslouchá na `message`, ověřuje `event.origin === window.location.origin`
     a tvar zprávy (`type === 'cms-preview-update'`, `key`/`value` jsou
     `string`), a drží `liveOverrides` stav, který se namergne NAD
     výsledek z react-query (`{...data, ...liveOverrides}`). `t()` je
     nezměněné — pořád jen čte z kontextu, neví nic o „live" módu.
   - Zvýraznění právě editovaného textu v náhledu jsem **vynechal** — bylo
     by křehké (žádná komponenta na webu nemá `data-cms-key` ani podobný
     hák, muselo by se to dohledávat podle obsahu textu, což je nespolehlivé
     a zasahovalo by do souborů mimo scope). Zadání to výslovně povolovalo
     přeskočit.
3. **„Přidat pole" pryč.** `DialogTrigger`+tlačítko smazáno, `handleSubmit`
   teď dělá jen `update` (žádná `insert` větev — dřív šlo vytvořit klíč,
   který nikde na webu nic nečetlo). Dialog se otvírá už jen přes tužku u
   existujícího pole (`handleEdit`), titulek/tlačítko přejmenovány na
   „Upravit pole"/„Uložit". Mazání (jen u neseedovaných řádků) a editace
   beze změny.
4. **Odolnost vůči remountu**: `activePage` (která stránková záložka —
   homepage/legal/…) se teď čte a zapisuje do URL (`?cmsPage=…` přes
   `useSearchParams`), ne jen do lokálního stavu. Kdyby `AdminCMS`
   kdykoliv znovu remountoval (i z jiného, zatím neobjeveného důvodu), po
   návratu na Website→Page Text se otevře stejná stránková záložka místo
   pádu na `homepage`. Hlubší persistenci (`previewSection`, `search`,
   rozepsaný text) jsem nedělal — po opravě v `client.ts` by k remountu
   nemělo vůbec docházet, takže jsem nešel do komplexity/rizika ukládat
   celý stav do URL.

### Ověření v prohlížeči (dev server, produkční DB)

Postup jako v sekci výše (login → dashboard → dropdown „Admin Panel",
kvůli známému cold-load race v `useAuth.tsx`). Scratch data jsem tentokrát
zakládal/mazal přímo přes `@supabase/supabase-js` (přihlášený jako admin),
ne přes „Přidat pole" — to jsem přece odstranil.

- **Test 0 — žádný reset:** 6× střídavé přepnutí Website/Page Text bez
  jediného selhání (dřív spolehlivě padalo). `cmsPreview=1` fix funguje.
- **Test 1 — homepage, klik na první sekci:** `mounted: 1` (panel přežil),
  **2 navigace iframu** (Chromium `about:blank`+reálná URL pár, ne 2 různé
  dokumenty — stejné chování jako v sekci výše).
- **Test 2 — „Úvodní video" (prázdné `homepage_intro_video`):** hláška
  „Tato sekce se na webu teď nezobrazuje — je prázdná nebo skrytá."
  **se zobrazila** (screenshot `v2-hidden-section.png` ve scratchpadu).
- **Test 3 — „Právní stránky" (40 sekcí):** 40 sekcí nalezeno, první klik
  = 2 navigace (viz výše), přepnutí na 2 další sekce v rámci stejné
  route = **0 dalších navigací iframu**, panel zůstal `mounted: 1` po
  celou dobu — přesně požadovaný mechanismus.
- **Test 4:** tlačítko „Přidat pole" v DOM nenalezeno (0).
- **Test 5 — autosave na DB-scratch klíči** (vytvořen/smazán přímo přes
  Supabase klienta, ne přes UI): úprava hodnoty → `Ukládám…`→`Uloženo`
  potvrzeno.
- **Test 6 — živý náhled při psaní na reálném, už seedovaném poli**
  (`homepage_hero_badge`, protože scratch klíč nikde na webu nečte žádné
  `t()` volání, takže by se v náhledu nemohlo nikdy objevit): napsán
  testovací text `LIVE PREVIEW PROBE …`, do ~500 ms **nalezen uvnitř
  iframu** (`contentFrame().locator('text=…')` → `true`) — živý náhled bez
  uložení funguje. Hodnota pak vrácena přesně na originál ještě před
  uplynutím 800ms autosave debounce (`scheduleSave` při každém keystroke
  ruší předchozí timer), takže se do DB nikdy nezapsala testovací hodnota
  — jen samotný originál (no-op zápis). Po testu ověřeno přímo v DB:
  `homepage_hero_badge` = `"For Expats Ready to Thrive"`, beze změny.
- Scratch řádek na konci smazán, sweep (`LIKE 'zz_freezefix%'`) potvrdil
  0 zbývajících řádků. Do žádného jiného klientčina textu se nesahalo.
- `npx tsc --noEmit` a `npm run build` — oba bez chyb.
- Dev server zastaven, dočasné pomocné skripty (`.scratch-db-helper.mjs`
  apod.) v kořeni repa smazány.

### Co jsem NEudělal a proč

- Zvýraznění editovaného textu v náhledu — vynecháno, zadání to povolovalo
  (viz bod 2 výše).
- Hlubší URL/stav persistence (náhled, vyhledávání) při remountu — po
  opravě `client.ts` už by neměla být potřeba; udělal jsem jen levný
  `activePage` v URL jako dodatečnou pojistku.
- `useAuth.tsx`, `client.ts`, `previewMode.ts` — nedotčeno, mimo scope
  (dělá je paralelní agent).
