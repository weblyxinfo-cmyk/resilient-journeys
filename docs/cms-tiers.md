# Členské tarify a huby — CMS report

Implementace `membership_tiers` + `hub_products`. Migrace a edge funkce jsou hotové jako
soubory — **nic nebylo spuštěno proti DB a `create-checkout` nebyl nasazen**, podle zadání.

## 1. Migrace — pořadí nasazení

Nasazovat **v tomto pořadí, jednu po druhé**, přes cílený Management API dotaz (viz
`docs/cms-mapa.md` §1.6), ne `supabase db push`:

1. `supabase/migrations/20260814150000_create_membership_tiers.sql` — tabulka + RLS + trigger + index
2. `supabase/migrations/20260814150100_seed_membership_tiers.sql` — 4 řádky, hodnoty 1:1 ze `src/lib/pricing.ts`
3. `supabase/migrations/20260814150200_create_hub_products.sql` — tabulka + RLS + trigger + index
4. `supabase/migrations/20260814150300_seed_hub_products.sql` — 2 řádky (127 €, 147 €), hodnoty 1:1 z `hubConfigs` v `create-checkout` (ne z `Checkout.tsx`, i když se shodují — `create-checkout` je zdroj skutečně účtované částky)

Všechny seedy jsou `ON CONFLICT (...) DO NOTHING`, obě `CREATE TABLE` jsou `IF NOT EXISTS`,
RLS policies `DROP POLICY IF EXISTS` — bezpečné znovu-spustit.

Po migracích: nasadit edge funkci `create-checkout` (`supabase functions deploy create-checkout`),
**teprve pak** frontend. Mezi deployem edge funkce a frontendu je okno, kdy staré bundly v
prohlížečích posílají jen `planId`/`hub_slug` bez `expectedPriceEur` — to je v pořádku, kontrola
ceny je no-op, pokud pole chybí (viz §3), takže staré klienty checkout nerozbije.

## 2. Datový model

**`membership_tiers`**: `tier_key` (unique, PK pro logiku), `name`, `subtitle`, `description`,
`price_eur NUMERIC(10,2) CHECK (>=5 AND <=2000)`, `billing_interval` (`month`/`year`),
`membership_type` (`basic`/`premium`), `period_label`, `button_text`, `badge`, `quote`,
`savings_note`, `features JSONB`, `ideal_for JSONB`, `highlighted`, `hidden`, `is_active`,
`sort_order`. RLS: `SELECT USING (is_active)` veřejně, `ALL USING/WITH CHECK (has_role(admin))` pro admina.

**`hub_products`**: `hub_slug` (unique), `name`, `description`, `price_eur NUMERIC(10,2) CHECK
(>=5 AND <=2000)`, `is_active`. Stejný RLS vzor.

`price_eur >= 5`: záměrně dolní hranice, ne horní — nebezpečný překlep je dolů (37 → 3.7), viz
`docs/cms-review.md` §B3.

## 3. Edge funkce `supabase/functions/create-checkout/index.ts` — přepsána celá

- `loadPlanConfig(supabaseClient, tierKey)` a `loadHubConfig(supabaseClient, hubSlug)` — čtou
  `membership_tiers`/`hub_products`. **Fail-closed, žádný hardcoded fallback ceny**: chyba dotazu,
  chybějící řádek, nebo neplatná cena (`price_eur` nekonvertibilní na kladné celé centy) → funkce
  vrátí `null` → handler odpoví `400` s textem *"Checkout is temporarily unavailable. Please try
  again in a moment."* Stripe session se v tomto případě vůbec nevytvoří.
- **`expectedPriceEur`** — klient (PricingCards, Checkout) pošle cenu, kterou vykreslil. Funkce ji
  porovná (v centech, po zaokrouhlení) s cenou z DB. Při neshodě `400` s textem *"The price has
  just changed. Please refresh the page and try again."* Pokud pole chybí/není číslo, kontrola se
  přeskočí (zpětná kompatibilita se starými bundly, viz §1).
- Legacy aliasy `monthly_basic`/`yearly_basic`/`monthly_premium`/`yearly_premium` jsou mapované na
  `tier_key` v kódu (`LEGACY_TIER_ALIASES`), nejsou duplikované v DB.
- `GET /functions/v1/create-checkout?diagnose=1` — nový, admin-only, **nikdy nevytvoří Stripe
  session**. Ověří admin roli přes `supabaseClient.rpc('has_role', {_user_id, _role:'admin'})`
  (stejný vzor jako `useAuth.tsx:99`), pak vrátí JSON pole
  `[{tier_key, unit_amount, currency}, ...]` pro všechny aktivní tarify i huby — `unit_amount` je
  přesně to, co by šlo do Stripu (`price_eur × 100`, zaokrouhleno).
- **Chybové texty jsou anglicky**, ne česky — web je celý anglický (potvrzeno v
  `docs/cms-review.md` C7), takže reálný platící zákazník by jinak dostal český toast na
  anglickém webu. Významově odpovídají zadání.
- **Nezměněno a ověřeno, že to nepotřebuje změnu:** `verify-checkout`, `stripe-webhook`,
  `send-membership-confirmation` — pracují jen s `membership_type`/`product_type` z metadat
  Stripe session, ne s částkou (`stripe-webhook/index.ts:122,151,173,189`, `verify-checkout/
  index.ts:106-146`, `send-membership-confirmation/index.ts:18`).

## 4. Frontend

- **`src/hooks/useMembershipTiers.tsx`** — nový. `fallback = MEMBERSHIP_TIERS` ze `src/lib/
  pricing.ts` (needitováno, zůstává jako fallback jak žádalo zadání). Vrací `{ tiers,
  visibleTiers, getTier(id) }`.
- **`src/hooks/useHubProducts.tsx`** — nový, vzor `useBookingCards.tsx`. `fallback` je parametr
  (jako u `useBookingCards`/`useFaqItems`), volající komponenta si nese vlastní fallback pole.
- **`src/components/PricingCards.tsx`** — `getVisibleTiers()`/`getTierPrice()` nahrazeny
  `useMembershipTiers()`. `createCheckoutSession` nyní bere i `expectedPriceEur` a posílá ho v
  těle požadavku na `create-checkout`.
- **`src/pages/Pricing.tsx:20-51`** — JSON-LD `offers[].price` čte `getTier('basic_monthly')`/
  `getTier('premium_monthly')` ze stejného hooku jako `PricingCards`, i meta title/description
  („from €37"/„from €370") teď interpolují skutečnou cenu.
- **`src/pages/Membership.tsx`** — JSON-LD offers (řádky u `product({...offers})`) i vizuální
  cena v teaser kartách (`€37`/`€47` u `membership_teaser_basic`/`_premium`, kolem řádků 383 a
  422) čtou ze stejného hooku. **Text teaserů (nadpisy, odrážky, CTA) nezměněn** — jak žádalo
  zadání, `membership_teaser_*` klíče v `cms_content` zůstávají samostatné a needitované.
- **`src/pages/Membership2.tsx`** — identická úprava, stejná dvě místa.
- **`src/pages/Checkout.tsx`** — **nad rámec explicitního výčtu souborů v zadání, ale ve stejné
  kategorii rizika**: `Checkout.tsx` je druhý (a jediný další) volající `create-checkout`, dřív s
  `MEMBERSHIP_TIERS` napevno importovaným a s vlastní hardcoded `hubInfo` mapou (127/147 €) — přesně
  ta třída nesouladu, kterou řeší B2. Přepsáno na `useMembershipTiers()` + `useHubProducts()` a
  posílá `expectedPriceEur` u obou větví (plán i hub). Popisky hubů (`t("checkout_hub_..._name")`)
  zůstaly beze změny, jen cena a description teď mají DB jako zdroj pravdy.
- **`src/lib/pricing.ts`** — nezměněno, zůstává jako fallback (import v `useMembershipTiers.tsx`).
- **Nedotčeno, mimo scope zadání:** `ResilientHubs.tsx:57` (meta „From €37"), `EndometriosisHub.tsx`
  vizuální €147 — to je marketingový text plánovaný na fázi 2, ne checkout.

## 5. Admin

- **`src/components/admin/AdminMembershipTiers.tsx`** — nový, vzor `AdminBookingCards.tsx`.
  Odrážky (`features`, `ideal_for`) přes tlačítka Add/Remove, ne JSON. `tier_key` needitovatelný u
  existujících řádků (disabled input), editovatelný jen při vytváření nového tarifu. Popisky česky.
  **Změna ceny**: pokud se `price_eur` liší od hodnoty při otevření dialogu, `Uložit` neuloží rovnou,
  ale otevře potvrzovací dialog, kde je nutné **opsat přesnou novou částku** do textového pole
  (tlačítko je disabled, dokud se neshoduje), + červené varování při změně >30 %, + trvalá věta u
  pole ceny „Změna platí jen pro nová předplatná. Stávající klienti platí dál původní částku."
  `hidden` je v UI přepnuté na kladný smysl („Zobrazit na webu"), `is_active` odděleně jako
  „Aktivní (nabízet k prodeji)" — vypnutí `is_active` shodí i `create-checkout` (fail-closed).
- **`src/components/admin/AdminHubProducts.tsx`** — stejný vzor, bez odrážek/intervalu/typu
  (huby jsou jednorázový nákup, ne subscription), stejný potvrzovací dialog na cenu.
- **`src/pages/Admin.tsx`** — oba komponenty zapojené jako nové podzáložky „Membership Tiers" a
  „Hub Products" pod hlavní záložkou **Website**, vedle „Page Text" a „FAQ" (vnořené `Tabs` tam
  už existovaly).

## 6. `types.ts`

Ruční doplnění (CLI generování vyžaduje živé schéma, tabulky ještě nejsou v DB) — `hub_products`
mezi `faq_items`/`lead_magnets`, `membership_tiers` mezi `lead_magnets`/`premium_credits`,
zachovaná abecední konvence souboru.

## 7. Jak ověřit cenu bez reálné platby

1. **Bez Stripe (doporučeno jako první krok po nasazení):** přihlásit se jako admin, zavolat
   ```
   GET https://<project>.supabase.co/functions/v1/create-checkout?diagnose=1
   Authorization: Bearer <admin access token>
   apikey: <anon key>
   ```
   Odpověď je JSON pole `{tier_key, unit_amount, currency}` pro všechny aktivní tarify i huby.
   Zkontrolovat, že `unit_amount` = `price_eur × 100` (např. tarif €37 → `3700`). Chytí 99 % chyb
   v mapování DB→centy dřív, než se vytvoří jediná Stripe session.
2. **Stripe test mode:** nasadit dočasnou kopii funkce jako `create-checkout-testmode` se
   `STRIPE_TEST_SECRET_KEY`, projít checkout s testovací kartou `4242 4242 4242 4242`, po ověření
   smazat. (Doporučeno v `docs/cms-review.md` §C4, nedělal jsem — vyžaduje nasazení, což je mimo
   moje omezení.)
3. **LIVE bez zaplacení:** v adminu nastavit rozlišitelnou cenu (např. €47.11), kliknout na
   tlačítko na `/pricing`, na Stripe stránce zkontrolovat částku a **odejít bez zaplacení**, cenu
   vrátit zpět. Dělat mimo špičku.

Žádnou Stripe session jsem v rámci této práce nevytvořil.

## 8. Co se stane při výpadku DB

- **Veřejné stránky** (`/pricing`, `/membership`, `/membership2`): `useMembershipTiers`/
  `useHubProducts` spadnou zpět na `MEMBERSHIP_TIERS`/hardcoded fallback — stránka nikdy
  nezobrazí prázdno ani nulovou cenu, ale zobrazuje **starou** cenu, dokud se DB nezotaví.
- **`create-checkout`**: opačně, **fail-closed** — žádný fallback. Pokud `membership_tiers`/
  `hub_products` dotaz selže nebo řádek chybí, vrátí `400` a nevytvoří Stripe session. Důsledek:
  při výpadku DB může návštěvník chvíli vidět (starou) cenu na webu, ale tlačítko „Zaplatit"
  nefunguje, dokud se DB nezotaví — to je záměr (viz §B1 v `docs/cms-review.md`).

## 9. Co má uživatel v adminu proklikat

1. **Website → Membership Tiers** — zkontrolovat, že všechny 4 tarify (Basic Monthly €37, Basic
   Yearly €370, Premium Monthly €47, Premium Yearly €470) sedí, otevřít jeden a ověřit, že
   `tier_key` nejde upravit u existujícího tarifu.
2. Zkusit **změnit cenu** u jednoho tarifu (např. o pár centů) → ověřit, že se objeví potvrzovací
   dialog s nutností opsat novou částku, a že tlačítko „Potvrdit" je zablokované, dokud se text
   neshoduje.
3. **Website → Hub Products** — zkontrolovat oba huby (Transformed Self €127, Endometriosis
   Management €147), stejný test potvrzovacího dialogu.
4. Na `/pricing` a `/membership` ověřit, že se karty a ceny zobrazují stejně jako předtím (nic
   vizuálně nezměněno kromě zdroje dat).
5. Provést krok 1 z §7 (`?diagnose=1`) po nasazení edge funkce, než se cokoliv zaplatí.

## Build

`npx tsc --noEmit` → bez chyb (exit 0). `npm run build` → úspěšně (`dist/` vygenerován, žádné
TypeScript ani Vite chyby).
