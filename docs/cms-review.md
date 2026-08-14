# CMS plán — review

Review vrstva nad `docs/cms-mapa.md`. Všechna tvrzení níže jsou ověřená proti kódu v `/Users/lunagroup/resilient-journeys`, pokud není výslovně uvedeno jinak.

---

# A) Ověření nosných tvrzení

| # | Tvrzení | Verdikt | Důkaz |
|---|---|---|---|
| §4.1 | Stripe nepoužívá fixní Price IDs, inline `price_data` | **POTVRZENO** | `supabase/functions/create-checkout/index.ts:158-165` (hub, `price_data.unit_amount`) a `:191-201` (subscription, `price_data` + `recurring`). Nikde `price: "price_..."`. Cena z DB se reálně strhne. |
| §2.4 | `site_settings` nikdo nečte | **POTVRZENO** | Jediné výskyty: `src/components/admin/AdminSettings.tsx:39,62,78,100,121`, migrace `20260111083221_...sql:36-63`, `src/integrations/supabase/types.ts:687`. Žádný reader na webu. |
| §5.1 | AdminCMS zobrazuje jen řádky v DB | **POTVRZENO, a je to horší** | `AdminCMS.tsx:50-64` + `:161`. Navíc `:43-44` odvozuje **seznam tabů** z existujících řádků — stránka bez jediného seedu nemá v adminu ani záložku. |
| §5.2/6 | Chybí invalidace react-query cache | **POTVRZENO** | `AdminCMS.tsx:27` lokální `useState`, nikde `queryClient`. `useCms.tsx:17-35` `staleTime: 5 min`, jeden `QueryClient` (`App.tsx:89`). Reálný projev: klientka uloží, překlikne na web klientskou navigací a **až 5 minut vidí starou hodnotu**. Hard reload to opraví. Fix = 1 řádek. |
| §3.1 | Napojené jsou jen 4 komponenty | **POTVRZENO** | `useCms` importuje pouze `Hero.tsx`, `IntroVideo.tsx`, `Services.tsx`, `About.tsx`. |
| §1.6 | Ledger rozsynchronizovaný | **NEOVĚŘENO ZDE** (nešel jsem na prod API) | 6 jmenovaných souborů v repu existuje. Navržený backfill je logicky správný **za předpokladu**, že tvrzení o prod stavu platí — ověřit dotazem na `supabase_migrations.schema_migrations` těsně před backfillem, ne spoléhat na starší zjištění. |

Konvence seedů je v repu už zavedená a dobrá (`20260807110000_seed_homepage_services.sql:1-2` — „generated from the fallbacks in Services.tsx"). Na to stavět.

---

# B) Závažné nálezy (podle závažnosti)

## B1. 🔴 Fallback mapa v `create-checkout` je špatný default — má se fail-closed

Plán (§4.2, §6.4) říká „fallback mapa **musí zůstat**", podle vzoru `booking-create/index.ts:52-90`. **U předplatného je to jiná situace než u rezervace.**

- Jednorázová chybná rezervace = jeden refund. Chybné **subscription** = Stripe si tu částku pamatuje a strhává ji **každý měsíc**, dokud to někdo ručně neopraví v Stripe dashboardu (ad-hoc cena, nejde přepnout na jinou „Price"). Tichá ztráta €10/měsíc × N klientů.
- Argument „fallback drží dostupnost" navíc neplatí: funkce **už teď tvrdě závisí na DB** — `:119-123` čte `profiles`. Když je DB nedostupná, checkout stejně nefunguje správně.
- Bonus nález (existující bug, ne z plánu): `:119` destrukturuje jen `data`, chybu `.single()` zahazuje. Při výpadku DB tedy `customerId === undefined` → vytvoří se **nový Stripe zákazník** a `:136-139` update tiše selže → duplicitní customer.

**Doporučení:** u `membership_tiers` a `hub_products` **fail closed** — když dotaz selže nebo řádek chybí, vrátit 400 „Checkout je dočasně nedostupný, zkuste to za chvíli". Neúspěšný checkout je vratný, špatné předplatné ne. Hardcoded mapu nechat **výhradně** jako fallback pro `name`/`description`, ne pro částku.

## B2. 🔴 Plán neřeší nesoulad „co web ukazuje" vs „co Stripe strhne"

`PricingCards.tsx:70-77` posílá do funkce **jen `planId`**. Částka se nikde neporovnává. Reálné scénáře po přechodu na DB:

- Klientka změní €47 → €57. Návštěvník má v prohlížeči 5 minut starou CMS cache (`staleTime`) nebo starší JS bundle z CDN → vidí €47, klikne, Stripe mu naúčtuje €57. Nikde to nezachytí.
- Opačně při fail-open fallbacku (B1): web €57, Stripe €47.

**Doporučení (levné, ~10 řádků):** klient pošle `expectedPriceEur` (to, co má vykreslené), funkce ho porovná s DB a při neshodě vrátí chybu „Cena se právě změnila, obnovte stránku". Tím zmizí celá tato třída problémů včetně stale cache. Tohle je podle mě **důležitější pojistka než `CHECK` a confirm dialog dohromady**.

## B3. 🟠 `CHECK (price_eur <= 2000)` chytá špatný typ překlepu

Nebezpečný překlep je **dolů**, ne nahoru: `37` → `3.7` (projde), `47` → `4` (projde), `37` → `0.37` (projde). Horní hranice chrání jen před `3700`, což je scénář, kde klient prostě nezaplatí — nulová škoda.

**Doporučení:** `CHECK (price_eur >= 5 AND price_eur <= 2000)` + v adminu tvrdší potvrzení: dialog, do kterého se musí **opsat nová částka** (vzor Stripe/GitHub „type the name to confirm"), a varování při změně o víc než 30 %.

## B4. 🟠 Karty na `Membership.tsx:366-439` nejsou tiery — napojení na `membership_tiers` změní texty

Ověřil jsem: tyhle karty **nevolají checkout**, jsou to teasery s `<Link to="/pricing">` (`:392-397`, `:431-437`). A mají **jinou formulaci** než `src/lib/pricing.ts` — např. „Access to the private Skool community" (`Membership.tsx:420`) vs. „Access to the Premium Community (Skool)" (`pricing.ts:91`), jiný počet bulletů, jiný `description`.

Plán (§3.2) je namapovat na `membership_tiers` → **tichá změna marketingového textu na živém webu**.

**Doporučení:** z `membership_tiers` brát **jen cenu**, copy nechat jako `cms_content` klíče `membership_teaser_*`.

## B5. 🟠 Právní stránky jako `html` blok = vizuální regrese

`Terms.tsx:38-80` má třídy na **každém elementu** (`text-2xl font-serif font-semibold`, `text-muted-foreground font-sans mb-2`, `pl-6`). Kontejner má sice `prose` a `@tailwindcss/typography` je nainstalované (`package.json:71`), ale výsledek bude vypadat **jinak** — prose defaulty místo `font-serif`/gold.

Navíc: v aplikaci **dnes neexistuje žádná cesta, jak CMS HTML vykreslit** — `dangerouslySetInnerHTML` je jen v `src/components/ui/chart.tsx:70`. Plán tenhle krok nezmiňuje vůbec (sanitizace, typografické třídy, co když klientka nalepí Word HTML).

**Doporučení:** právní stránky **odložit do samostatné fáze** a řešit jako Markdown (ne HTML) s vlastním rendererem, nebo je do CMS nedávat vůbec — mění se jednou za rok a mění je právník, ne klientka.

## B6. 🟠 Nové tabulky potřebují explicitní public SELECT policy

Plán v §1.2 uvádí sloupce, ale ne RLS. `membership_tiers`, `hub_products`, `faq_items`, `program_quarters` čte **anonymní návštěvník**. Bez `FOR SELECT USING (true)` (resp. `USING (is_active)`) se ceny nenačtou a s fail-closed z B1 **spadne celý checkout pro nepřihlášené i přihlášené**. Vzor je správně v `20260807100000_create_booking_cards.sql:60`.

Zároveň: `hidden` tiery budou pro anon čitelné přes PostgREST. Nevýznamné, ale policy má filtrovat `is_active`, ne `hidden`.

## B7. 🟡 Stripe Billing Portal je druhá cenová plocha, kterou DB neřídí

`create-portal-session/index.ts:65-68` volá `billingPortal.sessions.create` **bez `configuration`** → default konfigurace z dashboardu. Pokud má zapnuté „switch plans", nabízí produkty/ceny **z Stripe dashboardu**, ne naše ad-hoc ceny. Plán tvrdí, že tahle funkce změnu nepotřebuje — technicky ano, ale je to místo, kde klient může vidět jinou cenu.

**Doporučení:** ověřit v Stripe dashboardu, že portal má plan-switching **vypnutý** (jen zrušení + platební metoda). Jednorázová kontrola, ne kód.

## B8. 🟡 Objem je podhodnocený, chybí celé soubory

`§3.2` neuvádí vůbec: `src/components/ProgramOverview.tsx` (na obou hub stránkách), `CategorySection.tsx`, `VideoPreviewCard.tsx`, `WorkshopInquiryForm.tsx`, `WorkshopRegistration.tsx`, `src/pages/WorkshopPost.tsx`, `src/pages/BlogPost.tsx`, `PageHero.tsx`, chrome kolem `Testimonials.tsx`. `Workshopy.tsx` je odhadnuté na ~10, hrubý sken dává řádově 70+ kandidátních řádků.

Realistický objem není ~900, ale **1000–1100**. Na fázování to nic nemění, ale odhad „jedním průchodem" tím padá ještě víc.

## B9. 🟡 AdminCMS ukládá jen `onBlur` → tichá ztráta editace

`AdminCMS.tsx:344,355` — save se pustí až při `onBlur`. Klientka napíše text, zavře záložku / klikne na jiný admin tab → **změna je pryč bez varování**. Není žádný indikátor „neuloženo". Tohle je přesně stížnost „psala jsem to a neuložilo se" a plán to nezmiňuje.

**Doporučení:** debounced autosave (800 ms) + stavový indikátor u pole („Ukládám… / Uloženo") + `beforeunload` guard při rozpracované změně.

---

# C) Co v plánu chybí

## C1. Jak dostat 1000 textů do seedů bez překlepů — zásadní mezera

Plán říká „každý klíč musí mít seed", ale neříká **jak**. Manuální přepis 1000 řetězců do SQL je garantovaný zdroj překlepů a ztracených apostrofů (`''` escaping!).

**Mechanizovatelné, a repo k tomu má nástroje** (`typescript` 5.8.3 v devDeps):

1. Krok 1 — čistě mechanická úprava JSX: text se obalí `t("klíč", <původní text beze změny>)`. Text se **nepřepisuje**, jen přesouvá do druhého argumentu.
2. Krok 2 — **generátor**: skript nad TS compiler API projde `src/`, najde všechna volání `t(string, string)`, a vygeneruje seed SQL. Hodnota v DB je pak z definice **bit-identická s fallbackem**.
3. Krok 3 — **verifikátor**: stejný skript v kontrolním režimu ověří, že (a) každý `t()` klíč má řádek v DB, (b) `value === fallback` u čerstvě naseedovaných, (c) žádný klíč není použit 2× s různým fallbackem.

Tenhle skript je podle mě **první věc, co se má napsat**. Bez něj je fáze 1 ruční práce s neověřitelným výsledkem.

## C2. Ověření, že se obsah nezměnil (regrese)

Plán nemá žádný verifikační krok. C1/krok 3 pokrývá „DB === fallback". Zbývá „fallback === to, co tam bylo před úpravou" — na to stačí `git diff` filtrovaný na změny mimo `t(`, ale **repo není git**. To je vážné: bez verzování se u 1000 mechanických úprav nedá dokázat, že se text nezměnil, ani se vrátit.

**Doporučení: před jakoukoli implementací inicializovat git a udělat baseline commit.** Bez toho bych do toho nešel.

## C3. Není žádná testovací infrastruktura

V `package.json` není vitest, jest ani playwright. Úkoly „Testy změněných souborů" a „Browser test golden path" tedy znamenají **manuální kontrolu**, ne automatiku. Přeformulovat na: verifikační skript (C1) + checklist stránek v prohlížeči.

## C4. Jak otestovat cenové vlákno bez reálné platby

Plán to neřeší vůbec. Tři úrovně, doporučuju všechny tři:

1. **Bez Stripe:** verifikace, že `loadPlanConfig` vrátí správnou částku — dočasný `GET /functions/v1/create-checkout?diagnose=1` (admin-only) vracející JSON `{tier_key, unit_amount}`. Chytí 99 % chyb v mapování DB→centy (typicky `× 100` a `Math.round`).
2. **Stripe test mode, plný E2E:** nasadit **dočasnou kopii** funkce jako `create-checkout-testmode`, která čte `STRIPE_TEST_SECRET_KEY` (nový secret) a **stejnou produkční DB**. Projít celý tok s kartou `4242 4242 4242 4242`. Ověří přesně to, co potřebujeme — že hodnota z `membership_tiers` doputuje do `unit_amount` — za nula korun. Webhook se v test módu nespustí (endpoint je live), což nevadí, testujeme cenu. Po ověření funkci smazat.
3. **LIVE bez zaplacení:** vytvoření checkout session nic nestojí. Nastavit v adminu rozlišitelnou cenu (např. €47.11), kliknout na tlačítko, **na Stripe stránce zkontrolovat částku a odejít**, cenu vrátit zpět. Ověří i produkční klíč. Dělat mimo špičku a s okamžitým revertem.

Rozhodně **ne** „změníme cenu a počkáme, jestli si někdo koupí".

## C5. Existující předplatitelé

Plán to zmiňuje jednou větou (§4.1). Doplnit tvrdě do adminu: u ceny text „Změna platí **jen pro nová předplatná**. Stávající klienti platí dál původní částku." Bez toho klientka změní cenu, uvidí ve výpisu staré částky a nahlásí to jako bug.

## C6. Regenerace `src/integrations/supabase/types.ts`

Plán to nezmiňuje. Po každé nové tabulce nutná regenerace, jinak TS neprojde. **Není to automatika** — je to ruční krok na 4 místech.

## C7. Jednojazyčnost

Web je čistě anglický (`Terms.tsx`, `Hero.tsx`, všechny fallbacky). Struktura `cms_content` **nemá jazykový sloupec**. Pokud se do roka plánuje čeština/španělština, je to 1000 řádků k migraci. Levná pojistka teď: přidat `locale TEXT NOT NULL DEFAULT 'en'` a UNIQUE na `(key, locale)` místo `key`. Stojí to 5 řádků migrace, ušetří přepis celé tabulky. **Nutno se zeptat klientky.**

## C8. Preview / undo / historie

- **Historie verzí:** zbytečný scope creep. Zamítnout.
- **Preview:** zbytečné — web je živý, klientka si otevře stránku vedle. Stačí u každého klíče odkaz „zobrazit na webu" (`page` už je v DB). 10 minut práce.
- **Undo:** **potřebné**, ale ne jako historie. Sloupec `default_value TEXT` naplněný při seedu + tlačítko „Vrátit původní text". Řeší reálný strach klientky („co když to rozbiju") za cenu jednoho sloupce, a zároveň nahrazuje §5.2/7 (skrytí Delete) — smazaný řádek už nebude nevratný.

---

# D) Doporučený rozsah a postup

Fázování v mapě má správnou myšlenku, ale **špatnou hranici u fáze 1** — míchá peníze (ověřitelné, rizikové, malé) s objemem textu (neriskantní, obrovské). To jsou dvě různé práce s různým způsobem ověření a nemají být v jednom nasazení.

**Fáze 0 — infrastruktura a bezpečnost (žádný nový text)**
git baseline · ledger backfill · RLS cleanup + `sort_order` + `default_value` · oprava `AdminSubscriptions.tsx:123-124` (27→37) · fixy AdminCMS (invalidace cache, autosave+indikátor, vyhledávání, accordion po `section`, `page` select, neblokující save, revert místo delete) · **generátor + verifikátor seedů (C1)** · smazat `AdminSettings`/`site_settings`.
→ Po téhle fázi je admin použitelný a další práce je strojová. Ověření: klikací zkouška na existujících 52 klíčích.

**Fáze 1 — peníze, samostatné nasazení**
`membership_tiers` + `hub_products` + `create-checkout` (fail-closed, expected-price check) + `PricingCards` + JSON-LD + admin komponenty s confirm dialogem.
→ Ověření: C4 body 1–3. Pořadí deploye: **migrace → edge funkce → frontend**. Odpověď na dotaz „stačí edge před frontendem": **samo o sobě nestačí**, protože mezi deploji jsou v prohlížečích staré bundly — proto B2 (expected-price check), který okno nesouladu uzavře úplně.

**Fáze 2–N — text, po stránkách**
Ne „fáze 1+2+3 najednou". Řezat po **jedné stránce = jeden seed + jeden JSX soubor + jedna vizuální kontrola**. Realistický ověřitelný blok je **100–150 klíčů**; 800 v jednom průchodu se rozsype — ne kvůli složitosti, ale protože se to nedá zkontrolovat a jedna chyba se schová mezi 800 dalšími. Pořadí podle hodnoty pro klientku: `Membership(2)` + `faq_items` → `ResilientHubs` → `ResilientHub` + `program_quarters` → `EndometriosisHub` + `FreeGuide` + `Pricing` → Footer/Navbar/success stránky → chybějící soubory z B8.

**Právní stránky (B5) a SEO/meta ven z hlavního proudu.** SEO má smysl (funguje pro Google), ale je to mechanická práce navíc a klientka z ní nic nepocítí — až nakonec.

**App UI (Dashboard/Profile/Auth/VideoPlayer): souhlasím, nedávat.**

- Pro: konzistence, klientka by mohla měnit i texty v členské sekci.
- Proti (silnější): (a) je to **produktové UI, ne marketing** — texty jsou svázané se stavy a logikou, chybný text tam rozbije srozumitelnost funkce, ne jen dojem; (b) `Auth.tsx` má chybové hlášky mapované na stavy — editovatelná chybová hláška je past; (c) +250 klíčů zdvojnásobí to, čím musí klientka v adminu prolistovat, aby našla nadpis na homepage; (d) klientka to za rok neotevře.

**Nedělat.** Pokud přijde konkrétní požadavek, doplní se jednotlivý klíč za 5 minut.

**Plochý editor vs. strukturované formuláře: hybrid, a hranice je jasná.**
Strukturovaný formulář jen tam, kde je **opakující se struktura nebo peníze** — `membership_tiers`, `hub_products`, `faq_items`, `program_quarters` (+ existující `booking_cards`). To je 4 nové komponenty a mají jasnou návratnost.
Pro prózu (nadpis, odstavec, CTA) **plochý key/value se search + accordion stačí** a je správný nástroj: formulář na stránku znamená 20 admin komponent, které se musí udržovat v zákrytu s JSX — každá změna designu = změna na dvou místech. To se během roka rozejde a skončí to hůř než plochý editor. Kritické pro použitelnost není forma editoru, ale **kvalita `description` u každého klíče** (§1.4 to má správně) a fungující vyhledávání.

---

# E) Rozhodnutí pro uživatele

| # | Otázka | Doporučení |
|---|---|---|
| 1 | **Fallback ceny v `create-checkout`** — fail-open (mapa v kódu) nebo fail-closed (chyba)? | **Fail-closed.** Neúspěšný checkout je vratný, špatné předplatné se strhává donekonečna. |
| 2 | **Kontrola ceny klient↔server** (`expectedPriceEur`) — přidat? | **Ano.** ~10 řádků, ruší celou třídu „web ukázal jednu cenu, Stripe strhl jinou". |
| 3 | **Git** — inicializovat repo a baseline commit před implementací? | **Ano, blokující.** Bez verzování nejde u 1000 mechanických úprav prokázat, že se obsah nezměnil, ani se vrátit. |
| 4 | **Fázování** — 1+2+3 najednou, nebo po stránkách? | **Fáze 0 (infra) → Fáze 1 (ceny, samostatný deploy) → text po stránkách po ~100–150 klíčích.** „Kompletně" zůstává cílem, mění se jen velikost ověřitelného kroku. |
| 5 | **App UI (Dashboard/Profile/Auth/VideoPlayer, ~250 klíčů)** do CMS? | **Ne.** Produktové UI, klientka needituje, zaplevelí admin. |
| 6 | **Právní stránky** (Terms/Privacy/Cookies) do CMS? | **Odložit / nedělat.** HTML blok změní vzhled a v aplikaci není renderer. Mění je právník jednou za rok. Pokud ano, tak Markdown a samostatná fáze. |
| 7 | **`Membership2.tsx`** — sdílené klíče s `Membership.tsx`? | **Ano, sdílet.** Má `noindex`, je to záložní varianta. Vlastní jen 2 SEO klíče. |
| 8 | **Karty `Membership.tsx:366-439`** — z `membership_tiers` nebo vlastní klíče? | **Vlastní `membership_teaser_*` klíče, jen cena z tieru.** Jinak se tiše změní marketingový text. |
| 9 | **Roční tarify `hidden`** | **Editovatelné v adminu** (checkbox „Zobrazit na webu"). Klientka je zjevně chce jednou zapnout, a je to jediný způsob, jak to udělat bez vývojáře — což je celý smysl zadání. |
| 10 | **`AdminSettings` / `site_settings`** | **Smazat záložku i tabulku**, `contact_email` přesunout do `cms_content` a napojit na `Footer.tsx`. Ponechat = klientka bude editovat pole, která nic nedělají. |
| 11 | **Undo** — sloupec `default_value` + tlačítko „Vrátit původní"? | **Ano.** Jeden sloupec, řeší strach z rozbití i nevratné mazání. Historii verzí **ne**. |
| 12 | **Preview** — stavět? | **Ne**, jen odkaz „zobrazit na webu" u každého klíče. |
| 13 | **Vícejazyčnost** — přidat `locale` sloupec preventivně? | **Ano, pokud je lokalizace do roka reálná.** 5 řádků teď vs. migrace 1000 řádků později. **Potřebuju odpověď od klientky.** |
| 14 | **Test cenového vlákna** | **Všechny 3 úrovně z C4**, primárně dočasná kopie funkce se Stripe **test** klíčem. |
| 15 | **`CHECK` na cenu** | `price_eur >= 5 AND <= 2000` + confirm dialog s **opsáním částky** + varování při změně > 30 %. |
| 16 | **Stripe Billing Portal** | Jednorázově ověřit v dashboardu, že plan-switching je vypnutý (ne kód). |

---

## Klíčové soubory

- `/Users/lunagroup/resilient-journeys/supabase/functions/create-checkout/index.ts`
- `/Users/lunagroup/resilient-journeys/src/components/admin/AdminCMS.tsx`
- `/Users/lunagroup/resilient-journeys/src/hooks/useCms.tsx`
- `/Users/lunagroup/resilient-journeys/src/components/PricingCards.tsx`
- `/Users/lunagroup/resilient-journeys/src/lib/pricing.ts`
- `/Users/lunagroup/resilient-journeys/supabase/migrations/20260807110000_seed_homepage_services.sql` (vzor seedu)
- `/Users/lunagroup/resilient-journeys/supabase/migrations/20260807100000_create_booking_cards.sql` (vzor tabulky + RLS)

---

## Celkový závěr

**Plán je v jádru správný a jeho nosná tvrzení obstála** — zejména §4.1 (cena z DB se reálně strhne) a §5.1 (nutnost seedu pro každý klíč). Vyžaduje ale úpravy ve třech oblastech, než se do něj pustí implementátor: fail-closed cena + kontrola očekávané ceny (B1, B2), git baseline a codegen seedů (C1, C2), a přeříznutí fází tak, aby peníze byly samostatné nasazení oddělené od objemu textu (D).
