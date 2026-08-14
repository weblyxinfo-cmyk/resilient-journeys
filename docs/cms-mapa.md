# Kompletní CMS — end-to-end mapa

## Zadání
Všechny texty a ceny na webu musí být editovatelné z admin panelu, uložit se do Supabase a projevit se na webu — včetně částky, kterou reálně účtuje Stripe.

---

## 0. Co jsem ověřil proti realitě (a co bylo v poznámkách špatně)

| Tvrzení z paměti | Realita |
|---|---|
| `cms_content` má ~15 řádků, 6 vzniklo ručně | **52 řádků**, dotaz na prod přes PostgREST. Všechny seed migrace už proběhly. |
| Migrace na prod nikdy neproběhly | Proběhly, ale **nejsou v ledgeru**. `supabase_migrations.schema_migrations` končí na `20260303100000`; 6 migrací v repu chybí. |
| Ceny hardcoded na 5 místech | **11 míst** (viz §2). |
| `Membership2` = duplikát | ~95 % shodné, ale **liší se SEO (`noindex`) a layout hera**; FAQ bit-identické. |
| Stripe může používat fixní Price IDs | **Nepoužívá.** Inline `price_data`. Grep na `price_1|prod_|STRIPE_PRICE` = 0 nálezů. |

**Nově nalezeno:** `site_settings` je mrtvá past — viz §2.4.

---

## 1. Databáze

### 1.1 `cms_content` zůstává pro singletony
`/Users/lunagroup/resilient-journeys/supabase/migrations/20260206100000_fix_missing_columns.sql:14-25` — `key UNIQUE`, `value`, `description`, `page`, `section`, `field_type`. Struktura je dostatečná. Doplnit:

```sql
ALTER TABLE public.cms_content ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
```

**RLS cleanup (ověřeno na prod):** `cms_content` má **duplicitní politiky** — 2× SELECT (`Anyone can read cms_content` + `Anyone can view cms content`) a 2× ALL (`Admins can manage cms_content` + `Admins can manage cms content`), a **žádná z ALL nemá `WITH CHECK`**. Funkčně to není rozbité (Postgres u `FOR ALL` bez `WITH CHECK` použije `USING` i pro kontrolu zápisu), ale je to nekonzistentní s `booking_cards`. Sjednotit na jednu SELECT + jednu ALL s explicitním `WITH CHECK (has_role(auth.uid(),'admin'))`.

### 1.2 Nové tabulky — jen tam, kde na tom závisí logika nebo peníze

**`membership_tiers`** — POVINNÁ. Nahrazuje `src/lib/pricing.ts:20-138`. Bez ní nejde cena do Stripe.
```
tier_key TEXT UNIQUE          -- basic_monthly | basic_yearly | premium_monthly | premium_yearly
name TEXT NOT NULL
price_eur NUMERIC(10,2) NOT NULL
billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month','year'))
membership_type TEXT NOT NULL CHECK (membership_type IN ('basic','premium'))
period_label TEXT             -- "/month"
subtitle TEXT, description TEXT
features JSONB DEFAULT '[]'   -- CHECK jsonb_typeof = 'array'
ideal_for JSONB DEFAULT '[]'
button_text TEXT, badge TEXT, quote TEXT, savings_note TEXT
highlighted BOOLEAN DEFAULT false
hidden BOOLEAN DEFAULT false  -- basic_yearly a premium_yearly mají dnes hidden:true
is_active BOOLEAN DEFAULT true
sort_order INTEGER DEFAULT 0
CHECK (price_eur > 0 AND price_eur <= 2000)   -- LIVE Stripe: pojistka proti překlepu
```

**`hub_products`** — jednorázové nákupy. Dnes na 4 místech s nesouhlasnými čísly.
```
hub_slug TEXT UNIQUE          -- transformed_self | endometriosis
name TEXT, description TEXT
price_eur NUMERIC(10,2) NOT NULL CHECK (price_eur > 0 AND price_eur <= 2000)
is_active BOOLEAN DEFAULT true
```

**`faq_items`** — dnes ve 3 souborech.
```
id UUID PK
group_key TEXT NOT NULL       -- 'membership'
question TEXT, answer TEXT
sort_order INTEGER, is_active BOOLEAN DEFAULT true
```

**`program_quarters`** — pole `programs` v `src/pages/ResilientHub.tsx:14-111`, 4 × (title, months, focus, quote + 3 moduly × 3 pole) = **52 řetězců**. Přes klíče v `cms_content` by to bylo 52 řádků bez struktury.
```
id UUID PK
quarter_number INTEGER UNIQUE
title TEXT, months_label TEXT, focus TEXT, quote TEXT
modules JSONB DEFAULT '[]'    -- [{name,title,description}] — vzor booking_cards.extra_sections
sort_order INTEGER, is_active BOOLEAN DEFAULT true
```

### 1.3 Kde tabulku NEDĚLAT
Krátké bullet listy a feature karty (`Membership.tsx:277-281`, `:224-244`, `ResilientHubs.tsx:138-142`, `:313-319`) → indexované klíče v `cms_content` (`membership_benefits_1` … `_4`). Je jich fixní počet, klientka je nebude přidávat/mazat, a vlastní tabulka na 4 stringy je overhead.

### 1.4 Naming konvence
**Držet stávající snake_case `page_section_index_field`** (`homepage_services_1_title`) — 52 existujících řádků už tak vypadá. Ne tečkovou notaci. Ke každému řádku povinně vyplnit `description` česky/anglicky lidsky („Membership — nadpis sekce FAQ"), protože právě `description` je jediné, podle čeho se klientka v adminu zorientuje.

### 1.5 Názvy migrací (konvence z repa: `YYYYMMDDHHMMSS_snake_name.sql`)
```
supabase/migrations/20260813100000_cms_rls_cleanup_and_sort.sql
supabase/migrations/20260813100100_create_membership_tiers.sql
supabase/migrations/20260813100200_seed_membership_tiers.sql
supabase/migrations/20260813100300_create_hub_products.sql
supabase/migrations/20260813100400_create_faq_items.sql
supabase/migrations/20260813100500_create_program_quarters.sql
supabase/migrations/20260813101000_seed_cms_membership.sql
supabase/migrations/20260813101100_seed_cms_hubs.sql
supabase/migrations/20260813101200_seed_cms_shared_layout.sql   -- footer, navbar, hero, legal
```

### 1.6 ⚠️ Migrace na produkci

**Ledger je rozsynchronizovaný.** Na produkci je aplikováno 34 migrací (`20260108082044` … `20260303100000`). V repu je 40. Chybí v ledgeru:

```
20260806120000_add_eft_reiki_session_type
20260806130000_seed_homepage_about_cms
20260807090000_seed_intro_video_texts
20260807100000_create_booking_cards
20260807100100_seed_booking_cards
20260807110000_seed_homepage_services
```

Jejich **efekty na DB ale jsou** — `booking_cards` existuje se 6 řádky, `cms_content` má všech 52 klíčů. Byly aplikovány ručně přes Management API bez zápisu do ledgeru.

Prošel jsem všech 6 na idempotenci: `ALTER TYPE … ADD VALUE IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`, `DROP POLICY IF EXISTS`, `ON CONFLICT (key/card_key) DO NOTHING`, a `UPDATE … WHERE value = '<stará hodnota>'` (guardované na starou hodnotu, takže nepřepíšou klientčiny editace — viz komentář na `20260806130000_seed_homepage_about_cms.sql:10-11`). **Žádná není destruktivní.**

**Doporučený postup:**
1. Backfill ledgeru, ať je `db push` napříště bezpečný:
   ```sql
   INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
     ('20260806120000','add_eft_reiki_session_type'), … 
   ON CONFLICT (version) DO NOTHING;
   ```
   (Tabulka má sloupce `version TEXT`, `statements TEXT[]`, `name TEXT` — ověřeno.)
2. Nové migrace pouštět **cíleně** přes `POST https://api.supabase.com/v1/projects/pxxfcphgmifhnjalixen/database/query`, jednu po druhé, a po každé zapsat řádek do ledgeru. Token: `security find-generic-password -s "Supabase CLI" -a supabase -w` → strip `go-keyring-base64:` → `base64 -d`.
3. **Nikdy `supabase db push` bez předchozího `db diff`.**

---

## 2. Ceny — VŠECHNA místa

### 2.1 Členské ceny €37/€47 (11 míst)
| Soubor | Řádek | Co |
|---|---|---|
| `src/lib/pricing.ts` | 24, 51, 82, 109 | `price: 37 / 370 / 47 / 470` — zdroj pro `PricingCards` |
| `supabase/functions/create-checkout/index.ts` | 32-40 | `priceAmount: 3700/37000/4700/47000` — **účtovaná částka** |
| `src/pages/Pricing.tsx` | 18-19 | meta title + description „from €37 … from €370" |
| `src/pages/Pricing.tsx` | 35, 43 | JSON-LD `offers[].price` |
| `src/pages/Membership.tsx` | 76, 81 | JSON-LD `product()` offers |
| `src/pages/Membership.tsx` | 372, 411 | vizuální `€37` / `€47` v kartách |
| `src/pages/Membership2.tsx` | 76, 81 | JSON-LD |
| `src/pages/Membership2.tsx` | ~369, ~408 | vizuální ceny |
| `src/pages/ResilientHubs.tsx` | 57 | meta description „From €37" |
| `src/components/admin/AdminSubscriptions.tsx` | 47, 55, 123-124 | statistiky obratu; **komentář na :123 říká „basic = 27€"** a `:124` počítá `stats.basic * 27` — špatně, má být 37 |
| `src/components/admin/AdminUsers.tsx` | 345 | `<SelectItem>Premium (€47/month)</SelectItem>` |

### 2.2 Ostatní ceny
| Soubor | Řádek | Co |
|---|---|---|
| `src/components/Pricing.tsx` | 8-20 | `SESSION_TIER` €107 + 5 feature stringů (samostatná hardcoded karta, **není** v `booking_cards`) |
| `src/components/Hero.tsx` | 73 | „Book Individual Session (€107/hour)" |
| `src/pages/Booking.tsx` | 371 | meta „from €107/hour" |
| `src/pages/EndometriosisHub.tsx` | 44, 168 | €147 ×2 |
| `src/pages/Checkout.tsx` | 61-62 | `endometriosis: 147`, `transformed_self: 127` — **jen zobrazení** |
| `supabase/functions/create-checkout/index.ts` | 50, 55 | `12700`, `14700` — **účtovaná částka hubů** |
| `src/components/booking/SessionTypeSelector.tsx` | 103, 113 | `price_eur: 127/147` — **mrtvý kód**, nic ho neimportuje (potvrzeno komentářem v `20260807100000_create_booking_cards.sql:7-10`) |
| `supabase/functions/booking-create/index.ts` | 23-30 | fallback mapa — **správně, nechat** |

### 2.3 Chyby k opravě
- `src/components/Services.tsx:20` — `t("homepage_services_1_price", "from €37")`. Fallback je OK, **ale hodnota v DB může být jiná** — ověřit řádek `homepage_services_1_price` v `cms_content`. Zadání zmiňovalo „from €27"; v kódu je dnes €37, takže buď bylo opraveno, nebo je €27 v DB.
- `src/pages/ResilientHubs.tsx:57` — meta description „From €37" je **správně**, ne €27.
- `AdminSubscriptions.tsx:123-124` — reálná chyba, `27` místo `37`.

### 2.4 🔴 `site_settings` — mrtvá past v adminu
`src/components/admin/AdminSettings.tsx:38-121` čte a zapisuje tabulku `site_settings`. Na produkci obsahuje `site_title`, `site_description`, `contact_email`, **`hero_title` = "Find Your Resilient Mind"**, **`hero_subtitle`**, **`about_text`**.

**Grep potvrdil: `site_settings` nečte žádná stránka ani komponenta.** Klientka může v záložce Settings přepsat „Homepage hero title" a na webu se **nestane nic** — hero čte `homepage_hero_title` z `cms_content` (`src/components/Hero.tsx:35`). Tohle musí pryč: buď záložku zrušit, nebo ji přemapovat na `cms_content`. Nechat to v současném stavu = klientka nahlásí „CMS nefunguje".

### 2.5 Bio Silvie — 3 znění
| Soubor | Řádek | Znění |
|---|---|---|
| `src/components/AboutPreview.tsx:52` | „…my own **13 years** of living and thriving abroad." | |
| `src/pages/About.tsx:91` | identické (už jako `t("about_intro_text", …)`) | |
| `src/pages/ResilientHubs.tsx:82` | „Using my **13 years** of experience…" | |
| `src/pages/ResilientHubs.tsx:86` | „Created by Silvie — an expatriate of **13+ years**…" | |
| `src/pages/Membership.tsx:328` + `Membership2.tsx:375` | „Developed by Silvie, an expatriate of **13+ years**…" | |
| `Membership.tsx:519` / `Membership2.tsx:516` / `ResilientHubs.tsx:410` | „Silvie has **13+ years** of expatriate experience…" | |

**Návrh:** `AboutPreview.tsx:52` napojit na existující `about_intro_text` (stejný text, už je v DB). Zbytek pod 2 sdílené klíče: `shared_silvie_bio_short`, `shared_silvie_bio_long`.

### 2.6 FAQ — 3 soubory
`src/pages/Membership.tsx:29-54` a `src/pages/Membership2.tsx:29-54` jsou **bit-identické** (ověřeno diffem). `src/pages/ResilientHubs.tsx:26-51` má 4 z 6 shodných; liší se otázka 2 („How much time do I need?" vs „…per week?") a odpověď 6.

→ tabulka `faq_items` s `group_key='membership'`, do ní 8 unikátních položek, ResilientHubs si vybere svých 6.

---

## 3. Frontend

`CmsProvider` je v `src/App.tsx:93`, **obaluje `<BrowserRouter>` (řádek 98)**, takže pokrývá všechny routy včetně `/admin` a `*`. ✅

### 3.1 Napojené (nic nedělat)
| Soubor | `t()` calls |
|---|---|
| `src/components/Services.tsx` | 37 (řádky 14-156) |
| `src/components/Hero.tsx` | 7 (26, 32-35, 41-56) |
| `src/pages/About.tsx` | 5 (11, 77, 82, 84, 89) |
| `src/components/IntroVideo.tsx` | 3 (6, 30, 34) |

### 3.2 Zbývá napojit — podle skutečného obsahu, ne odhadem

| Soubor | Odhad | Strategie |
|---|---|---|
| `src/pages/ResilientHub.tsx` | **~130** | `programs` (`:14-111`) → `program_quarters`. Zbytek (`:157-497`, vč. 2 Additional Hubs bloků na `:406-486`) → klíče `hub_*` |
| `src/pages/ResilientHubs.tsx` | **~120** | FAQ (`:26-51`) → `faq_items`. `PricingCards` už bude z `membership_tiers`. Zbytek klíče `hubs_*` |
| `src/pages/Membership.tsx` | **~110** | FAQ → `faq_items`. Karty `:366-439` → `membership_tiers`. Zbytek klíče `membership_*` |
| `src/pages/Membership2.tsx` | **~110** | **Sdílet klíče s Membership.** Vlastní jen 2: `membership2_seo_title`, `membership2_seo_description` (`:59-62`) |
| `src/pages/Terms.tsx` | ~60 | 1 klíč `field_type='html'` na sekci (~8 sekcí), ne per-odstavec |
| `src/pages/Privacy.tsx` | ~45 | dtto |
| `src/pages/Cookies.tsx` | ~40 | dtto |
| `src/pages/EndometriosisHub.tsx` | ~35 | klíče `endo_*` + cena z `hub_products` |
| `src/pages/FreeGuide.tsx` | ~35 | klíče `freeguide_*` (`:95-318`) |
| `src/pages/Pricing.tsx` | ~30 | „What's Included" pole `:114-140` → klíče `pricing_included_1_*` |
| `src/components/Pricing.tsx` | ~20 | `SESSION_TIER` (`:8-20`) → nový řádek v `booking_cards` nebo klíče `homepage_session_*` |
| `src/components/FreeGuideKit.tsx` | ~20 | klíče `freeguidekit_*` |
| `src/components/LeadMagnet.tsx` | ~15 | klíče `leadmagnet_*` |
| `src/components/Footer.tsx` | ~12 | `:15-18` tagline, `:55` „Explore", `:57-62` odkazy, `:78-81` kontakt, `:105-117` právní. Sociální URL (`:27,35,43`) taky |
| `src/components/Navbar.tsx` | ~13 | `navLinks` (`:16-24`) + account menu (`:84-120`) |
| `src/components/AboutPreview.tsx` | ~8 | sjednotit s About |
| `src/components/CookieBanner.tsx` | ~6 | |
| `src/pages/NotFound.tsx` | ~4 | |
| `src/pages/Blog.tsx` / `Workshopy.tsx` | ~10 / ~10 | jen page chrome, obsah je z DB |
| `src/pages/PricingSuccess.tsx` | ~40 | |
| `src/pages/BookingSuccess.tsx` | ~30 | |
| `src/pages/CheckoutSuccess.tsx` | ~25 | |
| `src/pages/Checkout.tsx` | ~25 | ceny z `hub_products` |
| `src/pages/FreeGuideThankYou.tsx` | ~15 | |
| `src/pages/Booking.tsx` | ~40 | karty už v DB; zbývá page chrome `:365-888` |

**Celkem veřejný marketing: ~900 řetězců.** Ne 665.

Přihlášená app UI (mimo scope „texty na webu", ale je to v repu): `Dashboard.tsx` ~90, `Profile.tsx` ~45, `VideoPlayer.tsx` ~40, `Auth.tsx` ~40 → dalších ~215.

### 3.3 Meta/SEO
`src/components/SEO.tsx` je čistě prop-driven. Napojení = předat `t()` hodnoty jako props na ~25 místech (`title`, `description`, `keywords`). Technicky triviální — ale viz §5.2 / §6.3.

### 3.4 Mrtvý kód
`src/components/booking/SessionTypeSelector.tsx` — nic ho neimportuje. Buď smazat, nebo ignorovat; **nezapojovat na CMS.**

---

## 4. Server / edge funkce

### 4.1 🟢 KLÍČOVÁ ODPOVĚĎ: Stripe Price IDs neexistují

`supabase/functions/create-checkout/index.ts:191-201`:
```ts
line_items: [{
  price_data: {
    currency: "eur",
    product_data: { name: planConfig.name, description: … },
    unit_amount: planConfig.priceAmount,
    recurring: { interval: planConfig.interval },
  },
  quantity: 1,
}],
```

Inline `price_data`, ne `price: "price_xxx"`. Grep `price_1|prod_|STRIPE_PRICE` napříč `src/`, `supabase/`, `.env*` → **0 nálezů**.

**Závěr: změna ceny v CMS změní částku, kterou Stripe reálně strhne.** Není potřeba sahat na produkty ve Stripe dashboardu. Stripe si při každém checkoutu vytvoří ad-hoc cenu.

⚠️ Dvě upozornění:
- U `mode: 'subscription'` platí nová cena **jen pro nové odběry**. Existující subscriptions běží dál na staré ceně. To je správné chování, ale klientka to musí vědět.
- `allow_promotion_codes: true` (`:155`, `:188`) — slevové kódy zůstávají funkční.

### 4.2 Co upravit

**`supabase/functions/create-checkout/index.ts`** — jediná funkce, která potřebuje DB:
- `:26-41` `planConfigs` → `loadPlanConfig(supabaseClient, productType)` čtoucí `membership_tiers`, mapa zůstává jako fallback. Vzor: `loadSessionConfig()` v `supabase/functions/booking-create/index.ts:47-90` — včetně `console.error` při nevalidní ceně a návratu na fallback.
- `:44-59` `hubConfigs` → `loadHubConfig()` čtoucí `hub_products`.
- Service-role klient už existuje na `:93-96`, není potřeba nic zavádět.
- Legacy aliasy `monthly_basic` / `yearly_premium` (`:37-40`) — mapovat na `tier_key` v kódu, ne duplikovat v DB.

**Nepotřebují změnu (ověřeno):**
- `stripe-webhook/index.ts` — pracuje jen s `membership_type` a `product_type` z metadat (`:122`, `:151`, `:178-189`). Žádná cena.
- `verify-checkout/index.ts` — dtto (`:110-146`).
- `send-membership-confirmation/index.ts` — jen `tierLabel` (`:18`). V e-mailu není částka.
- `booking-create`, `booking-available-days`, `booking-available-slots` — už čtou z `booking_cards`.
- `create-portal-session`, `brevo-add-contact`, `send-free-guide`, `membership-cleanup`, `booking-stripe-webhook`.

**Deploy:** edge funkce se nasazují zvlášť, nejdou přes Vercel. Po změně `create-checkout` je nutný `supabase functions deploy create-checkout` s access tokenem.

---

## 5. Admin vrstva

### 5.1 🔴 Nejdůležitější věc, kterou nesmíme přehlédnout
`src/components/admin/AdminCMS.tsx:50-64` a `:161` — admin zobrazuje **jen řádky, které v DB existují**. Klíč, který je v kódu jako `t("foo", "fallback")` ale nemá řádek v `cms_content`, je pro klientku **neviditelný a needitovatelný**.

→ **Každý napojený klíč MUSÍ mít seed migraci** s aktuální hodnotou, `page`, `section`, `description` a `field_type`. To je hlavní objem práce, ne úpravy JSX.

### 5.2 `AdminCMS.tsx` při ~900 klíčích
Dnes: `Tabs` po `page` (`:285-292`) → plochý seznam všech řádků stránky (`:307-378`). Při 130 klíčích na `resilient-hub` je to nepoužitelný scroll.

Návrh (`src/components/admin/AdminCMS.tsx`):
1. **Vyhledávání** nad `key` + `description` + `value` — nad `:285`. Nejdůležitější jediná změna.
2. **Sekundární grupování po `section`** uvnitř tabu — accordion. Sloupec `section` už existuje a je vyplněný.
3. **Auto-výška textarey** podle délky hodnoty místo statického `rows` (`:356`).
4. **`page` select rozšířit** — `:214-221` má natvrdo 6 hodnot, chybí `membership`, `resilient-hubs`, `free-guide`, `footer`, `legal`, `shared`.
5. **Neblokující save.** `handleQuickSave` na `:147-159` volá `fetchContent()` po každém blur → refetch všech ~900 řádků při každém opuštění pole. Nahradit lokálním update stavu.
6. **Invalidace public cache** — `AdminCMS` používá vlastní `useState`, ne react-query, takže po uložení **neinvaliduje `queryKey: ['cms_content']`**. Doplnit `queryClient.invalidateQueries({queryKey:['cms_content']})`, jinak admin vidí novou hodnotu a web starou.
7. **Skrýt tlačítko Delete** u seedovaných klíčů — smazání řádku = klíč zmizí z adminu navždy a text se vrátí na fallback bez varování.

### 5.3 Nové admin komponenty
| Soubor | Napojení | Poznámka |
|---|---|---|
| `src/components/admin/AdminMembershipTiers.tsx` | `src/pages/Admin.tsx` — nový sub-tab pod „Members" nebo „Website" | **Confirm dialog při změně ceny** — LIVE Stripe |
| `src/components/admin/AdminHubProducts.tsx` | dtto | dtto |
| `src/components/admin/AdminFaq.tsx` | sub-tab pod „Website" | add/remove/reorder |
| `src/components/admin/AdminProgramQuarters.tsx` | sub-tab pod „Content" | vzor `AdminBookingCards.tsx` (formulářový editor JSONB) |

`src/pages/Admin.tsx:159-162` — „Website" tab dnes renderuje jen `<AdminCMS />`. Předělat na vnořené `Tabs` jako u „Content" (`:92-117`).

### 5.4 `AdminSettings` — rozhodnout
`src/pages/Admin.tsx:170-172` + `src/components/admin/AdminSettings.tsx`. Zápis do `site_settings`, nikdo nečte. **Doporučení: záložku odstranit** a hodnoty, které dávají smysl (`contact_email`), přesunout do `cms_content` jako `shared_contact_email` a napojit na `Footer.tsx:21,80`.

---

## 6. Edge cases a rizika

### 6.1 Chování při chybě — dnes správné, nesahat
`src/hooks/useCms.tsx:30` — prázdná hodnota se do mapy nezapíše → `t()` na `:48` vrátí fallback. Chybějící klíč → fallback. Chyba fetche → `data === undefined` → `{}` → všechny fallbacky. **Web nikdy nezbělá.** ✅

Jediná mezera: pokud klientka smaže řádek úplně, nedostane žádné varování a text se tiše vrátí na starý hardcoded. Viz §5.2 bod 7.

### 6.2 Výkon
Dnes 52 řádků. Při ~900 řádcích včetně právních textů: hrubý odhad **250–500 KB nekomprimovaně**, gzip stlačí opakující se text velmi dobře (odhad 40–80 KB po drátě). Dotaz není blokující (`useQuery` bez `suspense`), `staleTime: 5 min` (`:34`).

Pokud to bude vadit, nejlevnější optimalizace: **právní texty (`Terms`/`Privacy`/`Cookies`) vyjmout z globálního fetche** — filtr `.neq('page','legal')` v `useCms.tsx:22` a načítat je per-page vlastním dotazem. Ušetří to největší část payloadu za jediný řádek kódu.

Nedělat prefetch přes `page` filtr v `CmsProvider` — provider je nad routerem, nezná aktuální route.

### 6.3 SEO / meta tagy u SPA
`vercel.json:5-10` přepisuje všechno na `/index.html`. V `package.json` **není žádný prerender/SSG plugin** — `"build": "vite build"`. `SEO.tsx` používá `react-helmet-async`, tedy čistě klientský render.

Důsledek:
- **Google** JS renderuje → CMS-driven meta tagy fungovat budou.
- **Facebook / LinkedIn / Twitter / WhatsApp** JS nerenderují → čtou statické tagy z `index.html:18-36`. Per-page OG tagy **jsou rozbité už dnes**, nezávisle na CMS.

Napojení SEO na CMS tedy funguje pro Google a nic nezhorší. **Skutečná oprava OG tagů = prerender, což je samostatná úloha mimo tenhle scope.** Explicitně to klientce říct, ať neočekává, že po editaci meta description se změní náhled na Facebooku.

### 6.4 Co může rozbít živý web / živé platby

| Riziko | Dopad | Mitigace |
|---|---|---|
| Překlep v ceně (`37` → `3.7`) | **Reálná ztráta peněz, LIVE Stripe** | `CHECK (price_eur > 0 AND price_eur <= 2000)` + confirm dialog v adminu + zobrazení „Bude se účtovat €X" |
| `create-checkout` čte z DB, dotaz selže | Checkout hodí 400 | Fallback mapa v kódu **musí zůstat**, přesně jak to dělá `loadSessionConfig` v `booking-create/index.ts:52-56` |
| Cena v DB vs. cena v JSON-LD | Google Merchant nesoulad, ne peníze | Napojit JSON-LD na stejný zdroj (`Pricing.tsx:35,43`, `Membership.tsx:76,81`) |
| `supabase db push` na produkci | Přepis dat | Ledger backfill + jen cílené Management API dotazy |
| Smazání řádku v AdminCMS | Tichý návrat na starý text | Skrýt Delete |
| Změna `tier_key` v adminu | `create-checkout` nenajde plán → „Invalid plan" | `tier_key` v adminu **read-only** |
| Migrace přepíše klientčiny texty | Ztráta obsahu | Všechny seedy `ON CONFLICT (key) DO NOTHING`, UPDATE jen guardované na starou hodnotu |
| Deploy frontendu bez deploye edge funkce | Web ukáže novou cenu, Stripe strhne starou | Nasadit `create-checkout` **před** frontendem |

---

## 7. Otázky před implementací

1. **Rozsah.** ~900 řetězců veřejného marketingu je zásadně víc než odhadovaných 665. Navrhuju fázovat:
   - **Fáze 1** (má největší hodnotu): `membership_tiers` + `hub_products` + `create-checkout` + `ResilientHubs.tsx` + `Membership(2).tsx` + `faq_items` + oprava `site_settings` → ~350 klíčů, pokrývá to, co klientka reálně mění.
   - **Fáze 2:** `ResilientHub.tsx` + `program_quarters` + `Pricing` + `EndometriosisHub` + `FreeGuide` → ~250.
   - **Fáze 3:** Footer, Navbar, právní stránky, success stránky → ~200.
   - **Fáze 4:** SEO/meta + app UI (Dashboard/Profile/Auth) → ~250.

   **Doporučuju fáze 1+2+3 udělat teď** (to je „všechny texty na webu") a fázi 4 nabídnout jako navazující. Pokud lead řekne „všechno najednou", udělám všechno.

2. **`Membership2.tsx`** — potvrdit, že sdílené klíče s `Membership.tsx` jsou OK. Znamená to, že editace textu na `/membership` změní i `/membership2`. Vzhledem k tomu, že `Membership2` má `noindex` a je to zjevně záložní verze, dává to smysl — ale je to nevratné rozhodnutí o chování.

3. **Právní stránky** — jeden `html` blok na sekci (~8 na stránku), nebo jeden velký blok na celou stránku? Doporučuju per-sekci: klientka najde, co hledá, a nerozbije celý dokument jedním špatným paste.

4. **Roční tarify** (`basic_yearly`, `premium_yearly`) mají dnes `hidden: true` v `src/lib/pricing.ts:75,134`. Má být `hidden` editovatelné v adminu (klientka je může zapnout), nebo zůstat natvrdo skryté?

5. **`AdminSettings` / `site_settings`** — smazat záložku, nebo přemapovat na `cms_content`? Doporučuju smazat a `contact_email` přesunout do CMS.

Nic z toho není blokující — pokud se lead nevyjádří, jedu podle svých doporučení výše.
