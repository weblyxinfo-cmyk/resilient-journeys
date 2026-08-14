# CMS Fáze 2 — Membership report

Implementace podle zadání team-lead + `docs/cms-mapa.md` + `docs/cms-review.md`.
Scope: `Membership.tsx` + `Membership2.tsx` + FAQ (`faq_items` tabulka). Ceny
(`€37`, `€47`), `src/lib/pricing.ts` a `create-checkout` nedotčeny.

**Koordinace se 7 paralelními agenty (aktualizace v půlce práce):** team-lead
následně požádal, abych (1) nesahal na `ResilientHubs.tsx` — vlastní ho jiný
agent, (2) nespouštěl `npm run cms:gen` ani needitoval `scripts/cms-seed.mjs`
— seed pro celý web se generuje jedním průchodem na konci, ať se agenti
nepřepisují v migracích. Původně jsem obojí udělal (FAQ napojení na
`ResilientHubs.tsx` + spuštěný generátor); oboje jsem **vrátil zpět**, viz
sekce „Co bylo vráceno" níže. Zbytek zadání platí beze změny.

## Změněné / vytvořené soubory

### FAQ tabulka + hook + admin
- `supabase/migrations/20260814100000_create_faq_items.sql` — nová tabulka
  `faq_items` (`group_key`, `question`, `answer`, `sort_order`, `is_active`),
  RLS (`FOR SELECT USING (is_active)` + admin `FOR ALL`), unique
  `(group_key, question)` kvůli bezpečnému `ON CONFLICT DO NOTHING` seedu,
  index `(group_key, is_active, sort_order)`, trigger `updated_at`.
- `supabase/migrations/20260814100100_seed_faq_items.sql` — 12 řádků: 6×
  `group_key='membership'` (text z `Membership.tsx`/`Membership2.tsx`, ověřeno
  diffem jako bit-identické), 6× `group_key='hubs'` (text z
  `ResilientHubs.tsx`, liší se otázka 2 a odpověď 6 — potvrzeno diffem, i
  když samotné napojení `ResilientHubs.tsx` teď dělá jiný agent).
- `src/hooks/useFaqItems.tsx` — nový hook, vzor `useBookingCards.tsx`.
  `useFaqItems(groupKey, fallback)`, `staleTime: 5 min`, fallback při prázdném
  výsledku nebo chybě dotazu (stránka nikdy nezobrazí prázdné FAQ). Hotový a
  použitelný i pro `group_key='hubs'` — čeká jen na to, až ho do
  `ResilientHubs.tsx` zapojí jeho vlastník.
- `src/components/admin/AdminFaq.tsx` — nový formulářový editor, vzor
  `AdminBookingCards.tsx`. Add/edit/remove/reorder (swap `sort_order` se
  sousedem), toggle viditelnosti, seskupeno podle `group_key` (dnes
  `membership`, `hubs` — přidání dalšího group_key vyžaduje úpravu konstanty
  `GROUPS` v souboru).
- `src/pages/Admin.tsx:7,17,157-171` — import `AdminFaq` + ikona
  `HelpCircle`, nový podtab „FAQ" pod Website vedle „Page Text".
- `src/integrations/supabase/types.ts` (řádek ~408, posouvá se — jiný agent
  souběžně upravoval stejný soubor kvůli `label`/`cms_sections`) — přidán typ
  tabulky `faq_items` (Row/Insert/Update), umístěno alfabeticky mezi
  `coach_blocked_dates` a `lead_magnets`.

### `Membership.tsx` (přepsáno celé, `src/pages/Membership.tsx`)
- Lokální `faqs` pole nahrazeno `useFaqItems('membership', fallbackFaqs)` —
  `fallbackFaqs` je stejné pole jako předtím, teď jen fallback pro hook.
  `faqPage(faqs)` v JSON-LD beze změny (stejný shape `{q, a}`).
- Všechny statické texty obaleny do `t("klíč", "původní text")` —
  namespace `membership_*`, plus 2 sdílené `shared_silvie_bio_*`.
- **SEO/meta props `<SEO title=… description=… keywords=…>` a JSON-LD
  `product()`/`breadcrumb()` texty NEBYLY napojeny** — podle
  `docs/cms-review.md` §D/B5 patří meta/SEO do samostatné fáze, mimo zadání
  team-lead pro tento úkol (ten explicitně žádal SEO klíče jen pro
  Membership2). Čísla `price: "37"/"47"` v JSON-LD zůstávají nedotčená, jak
  bylo zadáno.
- Karty na `:378-451` (dřív `:366-439`) — vlastní klíče
  `membership_teaser_basic_*` / `membership_teaser_premium_*`, **ne**
  napojeno na `src/lib/pricing.ts` ani na budoucí `membership_tiers` (review
  §B4 — jiná formulace bulletů než pricing.ts, sjednocení by tiše změnilo
  marketingový text). Čísla `€37`/`€47` zůstávají hardcoded v JSX.
- Sekce „9b. How to Get Started" (`:468-511`) — existuje jen v
  `Membership.tsx`, ne v `Membership2.tsx`. Klíče `membership_howto_*` proto
  nejsou skutečně sdílené, i když leží v namespace `membership_*` (viz níže).

### `Membership2.tsx` (přepsáno celé, `src/pages/Membership2.tsx`)
- Sdílí naprostou většinu klíčů s `Membership.tsx` (stejný `t("key", …)` s
  identickým fallbackem — generátor by jinak spadl na
  `[duplicate-fallback]` při finálním `cms:gen`).
- `faqs` napojeno na stejný `useFaqItems('membership', fallbackFaqs)`.
- Vlastní klíče (nejsou v `Membership.tsx`, protože ten obsah tam vůbec
  není):
  - `membership2_seo_title`, `membership2_seo_description` — `<SEO>` props
    na `:66-67` (zadáno explicitně team-leadem).
  - `membership2_solution_badge` — badge „The gentle path home" v sekci 4,
    kterou `Membership.tsx` nemá.
  - `membership2_transformation_*` (17 klíčů) — celá sekce 7 „Before/After"
    je jen v `Membership2.tsx`; `Membership.tsx` má na stejném místě obrázek
    + caption (`membership_transformation_image_alt`/`_caption`, sdílené jen
    ta caption, protože ten samý text je i na konci M2 sekce 7).

⚠️ **Odchylka od zadání, kterou jsem musel udělat vědomě:** team-lead napsal
„Vlastní má jen SEO (`:59-62`)". Po diffu obou souborů to neplatí beze zbytku
— `Membership2.tsx` má navíc unikátní badge (solution) a celou Before/After
sekci (transformation), `Membership.tsx` má navíc unikátní „How to Get
Started" sekci. Dal jsem těmto místům vlastní klíče (`membership2_*` resp.
`membership_howto_*`) místo násilného sdílení, protože obsah v druhém
souboru fyzicky neexistuje — sdílet klíč s jiným fallbackem v každém
souboru by finální generátor odmítl jako `duplicate-fallback`.

### Bio Silvie — ověřeno, sdíleno
- `shared_silvie_bio_short` — „Developed by Silvie, an expatriate of 13+
  years…" — ověřeno bit-identické na `Membership.tsx:328`/`Membership2.tsx:375`.
  **Vědomé zjednodušení:** originál má `<span className="font-medium">Silvie</span>`
  (jen jméno tučně/medium). Team-lead pojmenoval klíč v jednotném čísle
  (`shared_silvie_bio_short`, ne `_prefix`/`_name`/`_suffix`), takže jsem
  celou větu sloučil do jednoho řetězce a ten jeden inline `font-medium` na
  slově „Silvie" zmizel. Vizuálně nepatrný rozdíl (odstavec je už tak
  `text-muted-foreground`), ale je to reálná změna renderu, kterou tu
  zaznamenávám.
- `shared_silvie_bio_long` — „Silvie has 13+ years of expatriate
  experience…" — ověřeno bit-identické na `Membership.tsx:519`/`Membership2.tsx:516`.
  Žádná inline stylizace, 1:1 přesun.

## Co bylo vráceno (koordinace se 7 paralelními agenty)

1. **`ResilientHubs.tsx`** — původně jsem přejmenoval lokální `faqs` na
   `fallbackFaqs` a napojil na `useFaqItems('hubs', fallbackFaqs)`. **Vráceno
   na původní stav** (soubor teď opět beze změny, identický se stavem před
   mým zásahem) — vlastní ho jiný agent, `useFaqItems('hubs', …)` čeká na
   něj, tabulka i seed pro `group_key='hubs'` jsou hotové a funkční.
2. **`scripts/cms-seed.mjs`** — vrácen `FILE_PAGE_MAP` na původní stav (bez
   `Membership.tsx`/`Membership2.tsx`).
3. **`npm run cms:gen`** vygenerovaný soubor
   `supabase/migrations/20260814114351_seed_cms_membership.sql` (117 klíčů,
   ručně doladěné `section`/`description`) — **smazán**. Team-lead generuje
   seedy pro celý web jedním průchodem na konci, aby si agenti nepřepsali
   migrace navzájem.
4. `npm run cms:check` teď na `Membership.tsx`/`Membership2.tsx` hlásí
   `missing-seed` pro všech 117 klíčů — **to je očekávané** (viz zadání
   team-leada), neřešeno. Ověřeno jen `tsc --noEmit` a `npm run build`.

## Seznam klíčů pro finální `cms:gen` (117 unikátních)

Až se bude spouštět finální generátor, `src/pages/Membership.tsx` a
`src/pages/Membership2.tsx` je potřeba přidat do `FILE_PAGE_MAP` →
`page: 'membership'`. Sekce/description z mého smazaného návrhu (17
logických sekcí místo generátorem odhadnutých — `hero`, `problem`,
`empathy`, `solution`, `what_you_get`, `benefits`, `transformation`, `about`,
`offer`, `teaser_basic`, `teaser_premium`, `how_to_get_started`,
`why_different`, `faq`, `final_cta`, `membership2`) jsou zachyceny v historii
téhle konverzace, případně je můžu znovu vygenerovat na požádání.

Kompletní seznam klíčů (abecedně):

```
membership2_seo_description
membership2_seo_title
membership2_solution_badge
membership2_transformation_after_1
membership2_transformation_after_2
membership2_transformation_after_3
membership2_transformation_after_4
membership2_transformation_after_5
membership2_transformation_after_label
membership2_transformation_after_title
membership2_transformation_before_1
membership2_transformation_before_2
membership2_transformation_before_3
membership2_transformation_before_4
membership2_transformation_before_label
membership2_transformation_before_title
membership2_transformation_subtitle
membership2_transformation_title_em
membership2_transformation_title_prefix
membership2_transformation_title_suffix
membership_about_body
membership_about_cta
membership_benefits_1
membership_benefits_2
membership_benefits_3
membership_benefits_4
membership_benefits_title_highlight
membership_benefits_title_prefix
membership_empathy_body
membership_empathy_title
membership_faq_subtitle
membership_faq_title
membership_final_body
membership_final_cta
membership_final_cta_note
membership_final_title_highlight
membership_final_title_prefix
membership_final_title_suffix
membership_getitems_1_desc
membership_getitems_1_title
membership_getitems_2_desc
membership_getitems_2_title
membership_getitems_3_desc
membership_getitems_3_title
membership_getitems_4_desc
membership_getitems_4_title
membership_getitems_subtitle
membership_getitems_title_highlight
membership_getitems_title_prefix
membership_hero_badge
membership_hero_cta
membership_hero_cta_note
membership_hero_description
membership_hero_image_alt
membership_hero_pillar_1
membership_hero_pillar_2
membership_hero_pillar_3
membership_hero_pillar_4
membership_hero_subtitle_em
membership_hero_subtitle_prefix
membership_hero_subtitle_suffix
membership_hero_title_highlight
membership_hero_title_prefix
membership_hero_title_suffix
membership_howto_badge_1
membership_howto_badge_2
membership_howto_badge_3
membership_howto_note
membership_howto_step_1
membership_howto_step_2
membership_howto_step_3
membership_howto_step_4
membership_howto_title
membership_offer_badge_1
membership_offer_badge_2
membership_offer_badge_3
membership_offer_explore_cta
membership_offer_title_highlight
membership_offer_title_prefix
membership_problem_body
membership_problem_lead
membership_problem_title
membership_solution_body
membership_solution_title_highlight
membership_solution_title_prefix
membership_solution_title_suffix
membership_teaser_basic_cta
membership_teaser_basic_feature_1
membership_teaser_basic_feature_2
membership_teaser_basic_feature_3
membership_teaser_basic_feature_4
membership_teaser_basic_period
membership_teaser_basic_subtitle
membership_teaser_basic_title
membership_teaser_premium_badge
membership_teaser_premium_cta
membership_teaser_premium_feature_1
membership_teaser_premium_feature_2
membership_teaser_premium_feature_3
membership_teaser_premium_feature_4
membership_teaser_premium_period
membership_teaser_premium_subtitle
membership_teaser_premium_title
membership_transformation_caption
membership_transformation_image_alt
membership_whydifferent_1_title
membership_whydifferent_2_desc
membership_whydifferent_2_title
membership_whydifferent_3_desc
membership_whydifferent_3_title
membership_whydifferent_4_desc
membership_whydifferent_4_title
membership_whydifferent_subtitle
membership_whydifferent_title_highlight
membership_whydifferent_title_prefix
shared_silvie_bio_long
shared_silvie_bio_short
```

FAQ (`faq_items`, mimo `cms_content`, **už nasazeno-připraveno** —
migrace `20260814100000`/`20260814100100` nikým nesmazané): 12 řádků, 6×
`group_key='membership'`, 6× `group_key='hubs'`.

## Výstupy ověření
```
$ npx tsc --noEmit
(žádný výstup, exit 0)
```
```
$ npm run build
✓ built in ~2.4s
```
Bez chyb (jen nesouvisející browserslist warning, existoval už předtím).

`npm run cms:check` a `npm run lint` **nebyly spuštěny jako gate** po
posledním revertu (team-lead: „stačí tsc --noEmit a npm run build") —
`cms:check` teď záměrně hlásí 117× `missing-seed` pro Membership klíče, což
je očekávané, dokud neproběhne finální `cms:gen`.

## Co nasadit a v jakém pořadí
1. `supabase/migrations/20260814100000_create_faq_items.sql` — vytvoří
   tabulku `faq_items` + RLS.
2. `supabase/migrations/20260814100100_seed_faq_items.sql` — naplní 12 FAQ
   položek (obě skupiny, `membership` i `hubs`).
3. Finální `cms:gen` průchod (dělá team-lead) → seed migrace pro 117
   Membership klíčů + zbytek webu.
4. Po nasazení migrací **regenerovat `src/integrations/supabase/types.ts`**
   přes `supabase gen types typescript` — ruční doplnění `faq_items` typu je
   jen dočasná náhrada, ať `tsc` projde bez připojení k prod DB.
5. Nasadit frontend (Vercel) — obsahuje přepsaný `Membership.tsx`,
   `Membership2.tsx`, nový `AdminFaq.tsx` a `useFaqItems.tsx`, rozšířený
   `Admin.tsx`. `ResilientHubs.tsx` beze změny (čeká na svého vlastníka).
6. Klikací zkouška: `/membership`, `/membership2`, Admin → Website → Page
   Text (klíče se objeví v tabu „membership" až po finálním seedu), Admin →
   Website → FAQ (add/edit/remove/reorder pro obě skupiny funguje hned po
   kroku 1–2, nezávisle na finálním seedu).

## Co jsem NEudělal a proč
- **Žádná migrace neběžela proti produkci** — vše čeká na `supabase db push`
  / cílené spuštění (tvrdé omezení #1).
- **Necommitoval jsem, nepushoval, žádné `git add -A`** (tvrdé omezení #2) —
  repo navíc není `git` inicializované (`Is a git repository: No`).
- **Nesahal jsem na** `src/lib/pricing.ts`, `create-checkout`,
  `booking_cards`, booking edge funkce, `AdminCMS.tsx` (tvrdá omezení #3).
- **SEO/meta props `Membership.tsx`** (title/description/keywords, JSON-LD
  `product()`/`breadcrumb()` texty) — vědomě mimo scope, viz sekce výše.
  Pouze `Membership2.tsx` má SEO napojené, protože to team-lead výslovně
  zadal jako jediný unikátní obsah stránky.
- **`ResilientHubs.tsx`** — nedotčeno (vráceno na původní stav po revizi
  koordinace), vlastní ho jiný agent.
- **`npm run cms:gen` / `scripts/cms-seed.mjs`** — nepoužito/nezměněno podle
  revidovaného zadání; seed generuje team-lead jedním průchodem na konci.
- Region/typografická nuance u `shared_silvie_bio_short` (ztráta
  `font-medium` na slově „Silvie") — zdokumentováno výše, ne opraveno, protože
  oprava by vyžadovala rozdělit klíč na 3 (proti zadanému jednotnému
  pojmenování).

## Klíčové soubory
- `/Users/lunagroup/resilient-journeys/src/pages/Membership.tsx`
- `/Users/lunagroup/resilient-journeys/src/pages/Membership2.tsx`
- `/Users/lunagroup/resilient-journeys/src/hooks/useFaqItems.tsx`
- `/Users/lunagroup/resilient-journeys/src/components/admin/AdminFaq.tsx`
- `/Users/lunagroup/resilient-journeys/src/pages/Admin.tsx`
- `/Users/lunagroup/resilient-journeys/src/integrations/supabase/types.ts`
- `/Users/lunagroup/resilient-journeys/supabase/migrations/20260814100000_create_faq_items.sql`
- `/Users/lunagroup/resilient-journeys/supabase/migrations/20260814100100_seed_faq_items.sql`

`src/pages/ResilientHubs.tsx` a `scripts/cms-seed.mjs` jsou zpět ve stavu
před mým zásahem — zmíněny jen pro kontext v sekci „Co bylo vráceno".
