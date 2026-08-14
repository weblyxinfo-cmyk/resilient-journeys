# CMS final seed — celý web (fáze 2, závěr)

Jeden průchod generující seed pro všechny t() klíče, které 7 paralelních
agentů napojilo na `useCms()` (viz `docs/cms-keys-*.json` +
`docs/cms-faze2-membership.md`). Hodnota (`value`/`default_value`) je vždy
vzatá z fallbacku v kódu (TS compiler API), metadata (`page`/`section`/
`label`/`sort_order`/`field_type`) z JSON souborů, jak zadal team-lead.

## Migrace — v pořadí nasazení

Všechny s `ON CONFLICT DO NOTHING` (obsah) / `ON CONFLICT (page, section_key)
DO NOTHING` (sekce) — nic v produkci se nepřepíše.

| # | Soubor | Řádků |
|---|---|---|
| 1 | `20260814120000_seed_cms_navbar.sql` | 14 |
| 2 | `20260814120100_seed_cms_shared.sql` | 79 |
| 3 | `20260814120200_seed_cms_homepage_pricing_card.sql` | 18 |
| 4 | `20260814120300_seed_cms_membership.sql` | 98 |
| 5 | `20260814120400_seed_cms_pricing.sql` | 22 |
| 6 | `20260814120500_seed_cms_pricing_success.sql` | 40 |
| 7 | `20260814120600_seed_cms_checkout.sql` | 22 |
| 8 | `20260814120700_seed_cms_checkout_success.sql` | 18 |
| 9 | `20260814120800_seed_cms_booking.sql` | 40 |
| 10 | `20260814120900_seed_cms_booking_success.sql` | 30 |
| 11 | `20260814121000_seed_cms_resilient_hub.sql` | 120 |
| 12 | `20260814121100_seed_cms_resilient_hubs.sql` | 124 |
| 13 | `20260814121200_seed_cms_endometriosis.sql` | 38 |
| 14 | `20260814121300_seed_cms_free_guide.sql` | 36 |
| 15 | `20260814121400_seed_cms_thank_you.sql` | 21 |
| 16 | `20260814121500_seed_cms_blog.sql` | 11 |
| 17 | `20260814121600_seed_cms_blog_post.sql` | 10 |
| 18 | `20260814121700_seed_cms_workshopy.sql` | 18 |
| 19 | `20260814121800_seed_cms_workshop_post.sql` | 11 |
| 20 | `20260814121900_seed_cms_workshop_inquiry_form.sql` | 37 |
| 21 | `20260814122000_seed_cms_workshop_registration.sql` | 22 |
| 22 | `20260814122100_seed_cms_legal.sql` | 175 |
| 23 | `20260814122200_seed_cms_sections_phase2.sql` | 177 sekcí |

**Součet nového obsahu: 1004 řádků `cms_content` + 177 řádků `cms_sections`.**
Migrace #1–22 (obsah) mohou jít v libovolném pořadí mezi sebou (žádné
závislosti), #23 (sekce) logicky až po nich. Nezasahují do 53 existujících
řádků `cms_content` ani do 9 existujících `cms_sections` (homepage/about) —
jiné klíče, jiné `(page, section_key)` páry.

Necommitoval jsem, nepushoval, žádné `git add -A`. Nic neběželo proti
produkci — migrace jsou jen soubory, čeká na nasazení.

## Kontrola: kolik `t()` klíčů, kolik řádků

- Statický TS-parser (`scripts/cms-seed.mjs`) najde **1044** unikátních
  `t("klíč", "fallback")` volání v kódu.
- Navíc **13 klíčů** je použito jen nepřímo — `t(item.key, item.label)`, kde
  `item` pochází z pole/objektu s literálními `key`/`label` definovanými o
  pár řádků výš (`Navbar.tsx` `navLinks` — 7 klíčů, `AboutPreview.tsx`
  `skills` — 3 klíče, `VideoPreviewCard.tsx` `membershipBadges` — 3 klíče).
  Statický parser tohle neumí sledovat (proto 4 varování `[skip]` při
  `cms:check`/`cms:gen` — to jsou přesně tahle 4 místa volání), ale všech 13
  klíčů už mělo kompletní metadata v `docs/cms-keys-shared.json` od
  shared-agenta, takže jsem jejich fallback ověřil ručně (`grep` přímo na
  definici pole) a zahrnul do seedu. **`cms:check` je vůči těmto 13 klíčům
  slepý** — nekontroluje je (nejsou v jeho `byKey`), takže jejich shoda s
  kódem není strojově ověřená týmž nástrojem, jen mnou ručně. Řádky:
  `navbar_link_home/about/resilient_hub/membership/blog/workshops/booking`,
  `shared_about_preview_skill_1/2/3`,
  `shared_video_card_badge_free/basic/premium`.
- Součet: 1044 + 13 = **1057** unikátních `t()` klíčů v celém kódu.
- Z toho 53 už mělo seed z dřívějška (homepage/about/`shared_contact_email`,
  migrace `20260806130000` a starší) — nedotčeno, nepřegenerováno.
- **1057 − 53 = 1004** — přesně tolik řádků nové migrace vkládají. Beze
  zbytku, žádný klíč navíc, žádný chybějící.

Řádků podle stránky (`page`):

```
legal                    175       booking-success            30
resilient-hubs           124       workshop-registration       22
resilient-hub            120       pricing                     22
membership                98       checkout                    22
shared                    79       thank-you                   21
booking                   40       workshopy                   18
pricing-success           40       homepage (nová sekce)       18
endometriosis              38       checkout-success            18
workshop-inquiry-form     37       navbar                       14
free-guide                36       blog                         11
                                    workshop-post                11
                                    blog-post                    10
```

## Ověření

```
$ npm run cms:check
[skip] src/components/AboutPreview.tsx:84 — t() call with a non-literal key or fallback, skipped
[skip] src/components/Navbar.tsx:65 — t() call with a non-literal key or fallback, skipped
[skip] src/components/Navbar.tsx:153 — t() call with a non-literal key or fallback, skipped
[skip] src/components/VideoPreviewCard.tsx:92 — t() call with a non-literal key or fallback, skipped
OK — 1044 t() key(s) checked against supabase/migrations/, all seeded and matching.
```
0 `missing-seed`, 0 `value-mismatch`, 0 `duplicate-fallback`, 0 `label-mismatch`.

```
$ npx tsc --noEmit
(žádný výstup, exit 0)
```

```
$ npm run build
✓ built in 2.53s
```
Bez chyb.

## Nesoulady, na které jsem narazil, a jak jsem je vyřešil

### 1. `docs/cms-faze2-membership.md` neměl JSON, jen seznam 117 klíčů
Dopsal jsem metadata (`section`, `section_title`, `label`, `sort_order`,
`field_type`, `route`, `anchor`) sám česky, ve stejném stylu jako ostatní 6
souborů — ověřeno čtením `Membership.tsx`/`Membership2.tsx` řádek po řádku,
17 logických sekcí (`hero`, `problem`, `empathy`, `solution`, `getitems`,
`benefits`, `transformation`, `transformation2`, `about`, `offer`,
`teaser_basic`, `teaser_premium`, `howto`, `final_cta`, `membership2_seo` —
15, ne 17, protože `whydifferent`/`faq` z původního plánu spadly do bodu 2
níže).

### 2. 19 ze 117 „membership" klíčů jsou ve skutečnosti klíče stránky Resilient Hubs
`Membership.tsx`/`Membership2.tsx` mají komentáře „preserved from
/resilient-hubs" u sekcí 10 (Why Different) a části sekce 9b (How to Get
Started/FAQ) — obsah byl doslova zkopírován z `ResilientHubs.tsx`, **se
stejnými `t()` klíči a stejným fallbackem** (ověřeno diffem, `cms:check`
nehlásí `duplicate-fallback`). To znamená, že tyhle klíče mají jen JEDEN
řádek v `cms_content` a upravují se z jednoho místa pro všechny tři
stránky. `docs/cms-keys-hubs.json` (autor: cms-hubs agent) je už kompletně
popisuje pod `page='resilient-hubs'` — nechal jsem tuhle volbu být (metadata
mají přednost) a **nedopisoval jsem je znovu pod `page='membership'`**, aby
neexistovaly dva řádky pro jeden klíč. Zbylo tak jen 117 − 19 = **98** klíčů
skutečně unikátních pro Membership stránky.

Výjimka: `membership_howto_badge_1/2/3` (3 odznaky pod krokovým návodem)
existují **jen** v `Membership.tsx`, ne v `ResilientHubs.tsx` — ty proto
mají vlastní řádek pod `page='membership'`, `section='howto'`, se
zdokumentovanou poznámkou, že zbytek stejného vizuálního bloku (nadpis,
kroky, závěrečná věta) se edituje na stránce Resilient Hubs.

Zdokumentováno i ve `FILE_PAGE_MAP` (viz níže) a v hlavičkách
`20260814120300_seed_cms_membership.sql` / `..._resilient_hubs.sql`.

### 3. Duplicitní klíč uvnitř `docs/cms-keys-hubs.json`
`membership_howto_note` má v `cms-keys-hubs.json` **dva** řádky s různým
`section`/`sort_order`/`label` (`details` sort=180 vs `pricing` sort=100).
Ověřil jsem v `ResilientHubs.tsx` — klíč se v kódu skutečně volá dvakrát
(řádky 185 a 478), pokaždé se stejným fallbackem, takže oba JSON řádky
popisují reálná místa v kódu. Jenže `cms_content.key` je `UNIQUE` — jeden
klíč může mít jen jeden řádek. Ponechal jsem variantu `section='pricing'`
(sort_order 100, hned pod krokovým návodem — odpovídá umístění stejné věty
v `Membership.tsx`), variantu `section='details'` jsem zahodil. Úprava textu
se pak projeví na obou místech stránky, což je i tak správné chování (stejný
klíč = stejný text všude).

### 4. Homepage má 18 nových řádků navíc k původním 53
`src/components/Pricing.tsx` (teaser karta „1:1 Session" vložená na
homepage, ne stránka `/pricing`) měl v `docs/cms-keys-pricing.json` vlastní
klíče pod `page='homepage'`, novou sekcí (`session_header`, `session_kroky`,
`session_popis`, `session_karta`) — nekoliduje s existujícími
`homepage_hero_*`/`services_*` klíči, samostatná migrace
(`20260814120200_seed_cms_homepage_pricing_card.sql`), cena zůstává mimo
CMS.

### 5. Žádné jiné rozpory
Žádný `t()` klíč v kódu nezůstal bez metadat (mimo očekávaných 53
pre-existing) a žádný klíč z JSON/membership seznamu nechyběl v kódu — ověřeno
skriptem před generováním migrací (viz sekce Ověření výše, `cms:check`
`0 missing-seed`).

## Změny mimo migrace
- `scripts/cms-seed.mjs` — rozšířen `FILE_PAGE_MAP` o všechny nově napojené
  soubory (page hodnoty z JSON, ne odhad). `Membership.tsx`/`Membership2.tsx`
  → `'membership'` s komentářem vysvětlujícím bod 2 výše (proč `cms:gen`
  přesto nikdy nevygeneruje duplicitní řádek pro těch 19 sdílených klíčů —
  jakmile mají seed migraci, `cms:gen` je přeskočí bez ohledu na
  `FILE_PAGE_MAP`). Žádné `.tsx` soubory jsem needitoval — nesoulady šlo
  vyřešit čistě na úrovni metadat/generátoru.
- Žádné jiné soubory.

## Co nasadit a v jakém pořadí
1. Migrace #1–22 z tabulky výše (libovolné pořadí mezi sebou).
2. Migrace #23 (`cms_sections`).
3. `supabase gen types typescript` (typy `types.ts` se týkají hlavně
   `faq_items` z fáze membership — u `cms_content`/`cms_sections` se nic ve
   sloupcích nemění, jen přibývají řádky).
4. Nasadit frontend (žádná `.tsx` změna z mé strany, jen `scripts/cms-seed.mjs`
   — nemá vliv na běh webu).
5. Klikací zkouška: Admin → Website → Page Text — nové taby po stránkách by
   měly ukázat obsah s českými popisky; Admin → Website → Sections (pokud
   existuje UI nad `cms_sections`) by měl ukázat 177 nových sekcí.
