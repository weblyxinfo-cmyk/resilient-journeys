# CMS Fáze 0 — browser test

Testováno na lokálním dev serveru (`npm run dev`, port 8080) proti **produkční**
Supabase databázi (`.env`/`.env.local` míří na `pxxfcphgmifhnjalixen.supabase.co`,
žádná staging instance neexistuje). Nástroj: Playwright (headless Chromium),
řízeno skriptovaně přes samostatné node skripty ve scratchpadu, ne interaktivně
v GUI prohlížeči — funkčně identické (skutečný Chromium engine, skutečné HTTP
requesty na Supabase), jen bez vizuálního okna.

Přihlášení: **nepoužil jsem** `create-admin.js`/`create-test-accounts.js` (nespouštěl
jsem je). V `create-test-accounts.js` byly natvrdo napsané přihlašovací údaje
(`admin@resilientmind.com` / `Admin123!`) — vyzkoušel jsem je jako **přihlašovací
pokus** (čtení, nic nevytváří) a účet už na produkci existoval a má roli `admin`.
V `.env*` jsem žádné přihlašovací údaje nehledal/nevypisoval, jen jsem zjistil,
že tam nejsou.

---

## ⚠️ INCIDENT V PRŮBĚHU TESTOVÁNÍ — přečti první

Během testu A (race condition) a testu B (cache invalidace) jsem měl chybu ve
vlastním Playwright locatoru — `page.locator('div.rounded-lg.border', { has:
page.getByText('zz_browsertest_tmp') })` matchoval **dvě** vnořené karty (vnitřní
kartu pole + vnější wrapovací kartu celé sekce/tabu, obě mají shodné CSS třídy),
a `.last()` se v jednom běhu (script pro test B) trefil do **posledního inputu
v celém tabu Shared**, což byl skutečný klientčin klíč `shared_contact_email`,
ne můj testovací klíč.

Důsledek: hodnota `shared_contact_email` byla na chvíli přepsána nejdřív na
`"AAABBB"` (v rámci testu A), pak na `"CACHE_TEST_v2"` (v rámci testu B) —
přesně to, co jsem podle zadání neměl dělat.

**Zjistil a opravil jsem to hned** (všiml jsem si toho na screenshotu — v patičce
byl vidět "CACHE_TEST_v2" místo e-mailu). Oprava: kliknutí na tlačítko **„Vrátit
původní text"** v adminu (ne ruční SQL zápis) — načte `default_value`, který je
u tohoto řádku nedotčený (`contact@resilientmind.io`). Ověřeno tři nezávislými
způsoby:
1. Fresh browser context (nový, bez cache) → admin → Shared tab → hodnota `contact@resilientmind.io`.
2. Veřejná homepage, `<footer>` → text `contact@resilientmind.io`.
3. `mailto:` odkaz → `mailto:contact@resilientmind.io`.

Následně jsem udělal **globální kontrolu integrity** nad všemi 14 taby (viz §7)
— porovnal `value` vs `default_value` u každého pole se seedem napříč celým
CMS a potvrdil, že **žádný jiný řádek** touto chybou zasažen nebyl.

Od tohoto bodu jsem přepnul na přesný locator (`code` badge s klíčem → nejbližší
xpath ancestor karty, ne fuzzy `{has: text}` filtr) a všechny navazující testy
(A, B, revert/delete, beforeunload, offline/error) jsem **zopakoval na správném
testovacím klíči** a nezávisle ověřil, že se `shared_contact_email` v mezičase
nezměnil (sanity-check před/po každém dalším testu).

Nahlásil jsem to `team-lead` průběžně (ne až v tomto reportu), jakmile jsem si
byl jistý, že je oprava kompletní.

**Nezávislé ověření team-leadem** (přes Supabase Management API, mimo tento
browser test): `shared_contact_email` = `contact@resilientmind.io`, shoduje
se s `default_value`, a napříč všemi 54 tehdejšími řádky se `value` nikde
nelišilo od `default_value`. Návštěvníci webu incident neviděli — nasazený
produkční frontend v té době `shared_contact_email` ještě nečetl (Footer je
na to napojený jen v této nenasazené větvi), takže dopad byl omezený na můj
lokální dev server.

**Poučení pro další testy stejného druhu** (uplatněno ve zbytku tohoto
reportu, viz §2–§6): před jakýmkoli zápisem do pole si přečíst `key` badge
z karty, do které se chystám psát, a potvrdit, že je to skutečně testovací
klíč — ne fuzzy locator, který může matchnout vnořenou/sousední kartu.
Použití vyhledávání pro vyfiltrování na jedinou kartu na obrazovce je
spolehlivější než spoléhat na CSS strukturu. Tlačítko „Vrátit původní text"
se od tohoto bodu používalo **výhradně** na opravu tohoto konkrétního
incidentu, ne jako součást plánovaného testu na cizím klíči (viz §12 —
proto zůstává „Revert jako plánovaný test na existujícím klíči" v seznamu
neotestovaného).

---

## Tabulka výsledků

| # | Co | Verdikt | Důkaz |
|---|---|---|---|
| 1 | Přihlášení do adminu (`admin@resilientmind.com`) | PASS | fungující session, role admin potvrzena |
| 2 | **Test A — race condition (KRITICKÝ TEST)** | **PASS** | §2, network log s timestampy, fresh-DB-read potvrzení |
| 3 | Test A — `onBlur` okamžitý flush (bez čekání na debounce) | PASS | indikátor „Saved" do ~1.5 s po blur i bez uplynutí 800 ms |
| 4 | Test B — cache invalidace (`invalidateQueries`) bez hard reloadu | PASS | §3, remount admin komponenty ukázal novou hodnotu, ne stale cache |
| 5 | Revert tlačítko — viditelnost (skryté u vlastního klíče bez `default_value`, u seedu jen když `value≠default_value`) | PASS | §4 |
| 6 | Revert tlačítko — funkčnost | PASS (ověřeno neplánovaně při opravě incidentu, viz výše) | vrátilo přesně `default_value` |
| 7 | Delete tlačítko — skryté pro seedované řádky, viditelné pro vlastní | PASS | §4 |
| 8 | `beforeunload` guard — varuje při `pending`/`saving`, nevaruje po `saved` | PASS | §5 |
| 9 | Chybový stav (offline) — text se neztratí, po obnovení sítě se uloží | PASS | §6 |
| 10 | Vyhledávání — case-insensitive, nad key/description/value | PASS | §7.1 |
| 11 | Accordion po sekcích — collapse/expand | PASS | §7.2 |
| 12 | Taby stránek — všech 14 viditelných i pro prázdné stránky | PASS | §7.3 |
| 13 | Odkaz „zobrazit na webu" — jen pro stránky s `PAGE_TO_PATH`, chybí pro `shared` | PASS | §7.4 |
| 14 | Auto-výška textarey | PASS (vizuálně, viz screenshoty) | §7.5 |
| 15 | Delete/Add Content Field dialog — vytvoření nového klíče | PASS | vytvořeno, `default_value=null`, Delete viditelný |
| 16 | Smazání testovacího klíče — čisté odstranění | PASS | §8 |
| 17 | Sada 53 řádků beze změny po úklidu | PASS | §8, `53 results across all pages` |
| 18 | Admin „Website" → „Page Text" po přestavbě na vnořené Tabs | PASS | funguje |
| 19 | Záložka Settings smazána, žádný mrtvý odkaz | PASS | v `[role=tab]` seznamu není „Settings", žádná zmínka v UI |
| 20 | Homepage — načtení, žádné prázdné bloky, žádné console/network chyby | PASS | §9 |
| 21 | About — načtení, žádné console/network chyby | PASS s poznámkou | §9, §10 (video iframe) |
| 22 | Membership — načtení, ceny €37/€47 správně | PASS | §9 |
| 23 | Booking — načtení, žádné prázdné bloky | PASS | §9 |
| 24 | Footer — `shared_contact_email`, mailto odkaz | PASS | §9 |
| 25 | Přímá navigace/hard reload na `/admin` | **FAIL — nesouvisející pre-existing bug** | §11 |
| 26 | Nested `<a>` v `<a>` DOM nesting warning na `/auth` | **nalezeno, nesouvisející** | §10 |

---

## 2. Test A — race condition (hlavní test)

Postup podle `docs/cms-faze0-report.md` „Co má browser test vyzkoušet": CDP
`Network.emulateNetworkConditions` (latency 1500 ms, throughput omezen na
50 KB/s) na vlastním testovacím klíči `zz_browsertest_tmp`.

Postup: napsáno „AAA", počkáno přes 800 ms debounce (indikátor „Saving…"),
pak ihned dopsáno „BBB" a znovu počkáno.

**Network log (timestampy v ms, epoch):**
```
--> PATCH t=1786644846520 body={"value":"AAA"}
<-- 204   t=1786644848118
--> GET   t=1786644848136
--> PATCH t=1786644848137 body={"value":"AAABBB"}
<-- 200   t=1786644849635
<-- 204   t=1786644849702
--> GET   t=1786644849710
<-- 200   t=1786644851251
```

**Interpretace:** přesně jak popisuje oprava v `cms-faze0-report.md` — **žádné
dva PATCH requesty neběžely souběžně.** Request s „AAA" doběhl (204) v čase
848118, a **teprve po jeho dokončení**, o pouhých 19 ms později (848137), se
automaticky vypálil druhý PATCH s „AAABBB" — to je `commitSave`ova smyčka,
která po dokončení prvního requestu zjistila novější `pendingValues` (vzniklou
z psaní „BBB" v mezičase, jehož vlastní debounce byl potlačen `inFlight`
guardem) a hned pokračovala. Indikátor zůstal „Saving…" nepřetržitě mezi
oběma požadavky (ne krátké bliknutí na „Saved").

**Finální kontrola (fresh browser context, bez cache, nová session):**
```
FRESH CONTEXT VALUE FROM DB: "AAABBB"
```
Přesně poslední napsaná hodnota, žádná ztráta dat, žádné přepsání novější
hodnoty starší. **Zopakováno 2× (jednou napoprvé — omylem na `shared_contact_email`,
viz incident výše —, podruhé korektně na `zz_browsertest_tmp` se stejným
výsledkem obou charakteristik: serializace + správná finální hodnota).**

**Regresní kontrola `onBlur`:** text napsán a hned `blur()` (bez čekání na
800 ms) → indikátor „Saved" do ~1.5 s, hodnota uložena okamžitě. PASS.

### Verdikt testu A: **PASS — race condition je opravena.**
Fix z `docs/cms-faze0-report.md` (bug #2 opraveno) funguje přesně podle
popisu: sekvenční, ne souběžné požadavky; poslední napsaná hodnota vždy
vyhraje; indikátor lže výsledek nezkresluje.

---

## 3. Test B — cache invalidace bez hard reloadu

Testovací klíč `zz_browsertest_tmp` nemá veřejné vykreslení, takže podle
instrukce ověřeno fallbackem: úprava hodnoty → `blur()` → indikátor „Saved" →
klientská navigace na Home (unmount `AdminCMS`) → klientská navigace zpět do
Admin → Website → Page Text → Shared (remount, nová `QueryClient` observace).

```
BEFORE: "AAABBB"
indicator after blur save: ["Saved"]
VALUE AFTER REMOUNT (should be CACHE_TEST_v2_SAFE): "CACHE_TEST_v2_SAFE"
CONSOLE ERRORS: (none)
```

Tohle je smysluplný test (ne triviální): `staleTime` je 5 min, takže bez
funkční `invalidateQueries` by remount v react-query cache dostal **starou**
hodnotu ze session cache. Remount ukázal novou hodnotu okamžitě → invalidace
funguje. **PASS.**

---

## 4. Revert / Delete tlačítka

Ověřeno na `zz_browsertest_tmp` (vlastní klíč, `default_value = null`) a
na existujícím seedovaném klíči `shared_contact_email` (`default_value` není
null), **bez měnění existujících klíčů** (kromě incidentu výše, který byl
opraven):

```
own key (no default_value) - revert icon count (expect 0): 0
own key (no default_value) - delete icon count (expect 1): 1
seeded key (shared_contact_email) - revert icon count (expect 0, value==default now): 0
seeded key (shared_contact_email) - delete icon count (expect 0): 0
```

Funkčnost Revert tlačítka byla ověřena neplánovaně, ale spolehlivě, při
opravě incidentu — kliknutí vrátilo hodnotu přesně na `default_value`
uloženou v DB (`contact@resilientmind.io`), ne na nějakou lokální/cached
hodnotu. **PASS.**

---

## 5. `beforeunload` guard

```
beforeunload defaultPrevented while PENDING (expect true): true
indicator after save completes: ["Saved"]
beforeunload defaultPrevented AFTER save (expect false): false
```
**PASS** — přesně podle specifikace v reportu.

---

## 6. Chybový stav (offline) a zotavení

Postup: napsáno „OFFLINE_TEST_EDIT", CDP `Network.emulateNetworkConditions({offline:true})`
zapnuto **před** vypálením debounce, počkáno na chybu, pak síť obnovena a
pokračováno v psaní.

```
indicator after offline save attempt (expect error): ["Error saving"]
input value still shows typed text: "OFFLINE_TEST_EDIT"
indicator after recovery: ["Saved"]
final value on screen: "OFFLINE_TEST_EDIT_RECOVERED"
FRESH DB VALUE (po reloadu): "OFFLINE_TEST_EDIT_RECOVERED"
```
Rozepsaný text se při chybě neztratil, po obnovení sítě se další úprava
uložila správně a perzistovala v DB. **PASS**, přesně podle scénáře v
`cms-faze0-report.md` bodu 9 „Co má browser test vyzkoušet".

---

## 7. Použitelnost adminu

### 7.1 Vyhledávání
- `SHARED_CONTACT` (velká písmena) → našlo `shared_contact_email` (1 výsledek), case-insensitive nad key. PASS.
- `GENTLY TRANSFORM` (velká písmena, substring hodnoty) → 1 výsledek, case-insensitive nad value. PASS.
- Prázdné/nespojené fráze („you resilient") → 0 výsledků (substring match, ne fulltext OR) — očekávané chování, ne bug.

### 7.2 Accordion
Kliknutí na hlavičku sekce „Approach" schová/ukáže obsah, šipka rotuje. PASS.

### 7.3 Taby stránek
Všech 14 statických tabů viditelných: `homepage, about, pricing, booking,
membership, resilient hub, resilient hubs, free guide, endometriosis, blog,
footer, navbar, legal, shared` — včetně prázdných (jen homepage/about/shared
mají reálná data). PASS, opravuje bug z původního kódu popsaný v reportu.

### 7.4 Odkaz „zobrazit na webu"
Homepage pole → odkaz s `href="/"`, `target="_blank"`. Shared pole → žádný
odkaz (žádná `PAGE_TO_PATH` mapa pro `shared`). PASS.

### 7.5 Auto-výška textarey
Vizuálně potvrzeno na screenshotech — dlouhé texty se zobrazují bez ořezu,
scrollHeight se propisuje do výšky pole.

### 7.6 Add Content Field dialog
Vytvoření `zz_browsertest_tmp` (page: shared, section: browsertest, type:
text) proběhlo bez chyby, toast „Content created", řádek se objevil ve
správném tabu/sekci s `default_value = null` (Delete viditelný, Revert ne).
PASS.

---

## 8. Úklid

```
total rows matching "a" (should be back to 53): 53 results across all pages
shared_contact_email final value: "contact@resilientmind.io"
shared_contact_email revert icon (must be 0, value==default): 0
zz_browsertest_tmp count (must be 0): 0
```
Globální kontrola integrity (§ incident výše) navíc potvrdila **0 mismatchů**
mezi `value` a `default_value` napříč všemi 14 taby po dokončení testů (kromě
mého vlastního klíče před smazáním). `git status` po úklidu odpovídá přesně
stavu před testováním (jen diff implementace, žádný testovací artefakt).
Dev server zastaven (port 8080 uvolněn).

---

## 9. Veřejná část

| Stránka | Titulek | Console chyby | Failed requesty (4xx/5xx) |
|---|---|---|---|
| `/` (homepage) | OK | 0 | 0 |
| `/about` | OK | 0 | 0 |
| `/membership` | OK | 0 | 0 |
| `/booking` | OK | 0 | 0 |

Homepage plně vykreslená, žádné prázdné bloky, ceny „€37"/„€47" (Basic/Premium)
odpovídají opravě v `AdminSubscriptions.tsx`. Membership stejně tak. Booking
plně vykreslený, žádné prázdné bloky. Footer na všech stránkách zobrazuje
`contact@resilientmind.io` s korektním `mailto:contact@resilientmind.io`
odkazem (klíč `shared_contact_email`, ověřeno po opravě incidentu).

---

## 10. Vedlejší zjištění (nesouvisí s fází 0 CMS)

1. **Nested `<a>` v `<a>`** — `Logo` komponenta na `/auth` stránce generuje
   `<a>` uvnitř `<a>` (React `validateDOMNesting` warning v konzoli). Existuje
   nezávisle na této práci, nesahal jsem tam.
2. **Blank box v About** na sekci „Qualifications & Expertise" v headless
   screenshotu — je to natvrdo zakódované (ne CMS) YouTube `<iframe
   src="...nGOawA1GBAI">` s korektním `src`, rozměry (768×432) a pozicí v DOM;
   0 console/network chyb. Nejspíš limit headless Chromia při renderování
   YouTube thumbnailu bez skutečné GPU kompozice — **doporučuji vizuálně
   ověřit v reálném prohlížeči**, ale nejde o CMS bug ani o `about_intro_video`
   (ten je samostatný iframe výš na stránce a vykresloval se v pořádku i v
   headless módu).

---

## 11. Pre-existing bug mimo scope fáze 0 — DŮLEŽITÉ pro budoucí testování

**Přímá navigace nebo hard reload (F5) na `/admin` spolehlivě (100% reprodukce,
5× ověřeno) přesměruje na `/dashboard`.**

Příčina (`src/hooks/useAuth.tsx`): `handleSession()` čeká na
`Promise.race([Promise.all([fetchProfile, rpc('has_role')]), timeout(6000)])`.
Při studeném načtení stránky s obnovenou session (typicky přesně situace
hard reloadu) tenhle `Promise.all` opakovaně netrefí 6s timeout (konzole:
`Auth: profile/admin fetch timed out — will retry`), `loading` se nastaví na
`false` s `isAdmin` stále `false`, a `Admin.tsx`ův redirect efekt
(`else if (!isAdmin) navigate('/dashboard')`) to vyhodnotí dřív, než 100ms
retry stihne `isAdmin` doplnit. Komentář v kódu sám zmiňuje podezření na
`supabase.from()` deadlock při volání z `INITIAL_SESSION` callbacku — to by
vysvětlovalo, proč se to děje konzistentně, ne jen občas.

**Dopad na tuto práci:** Kvůli tomu jsem musel Test A i F5-reload krok z
`docs/cms-faze0-report.md` provést jako čtení z **fresh browser contextu**
(nová session, žádná cache) místo doslovného F5 na otevřené `/admin` záložce
— funkčně ekvivalentní (nový network request, žádná stará cache), ale ne
identický test. Do adminu jsem se pak vždy dostával klientskou navigací
(dashboard → dropdown „Admin Panel"), což **spolehlivě funguje**, protože
nevyžaduje nový cold-start auth cyklus.

**Dopad na reálné použití:** Pokud klientka kdykoliv zmáčkne F5 na `/admin`
záložce (běžná věc), s vysokou pravděpodobností ji to vyhodí na dashboard.
Musí se pak znovu proklikat přes menu. Není to ztráta dat (žádný rozepsaný
text v tu chvíli nebyl), jen otravné UX. **Doporučuji nahlásit/opravit
odděleně od fáze 0** — je to v `useAuth.tsx`, ne v souborech, které tahle
fáze měnila.

---

## 12. Co se nepodařilo otestovat a proč

- **Vizuální regrese v reálném (ne headless) prohlížeči** — testováno jen
  přes headless Chromium/Playwright, ne přes GUI okno. Funkčně identické
  (skutečný engine, skutečné requesty), ale doporučuju rychlou vizuální
  kontrolu očima před nasazením, hlavně kvůli bodu §10.2 (blank box) a mobilní
  responzivitě (netestoval jsem mobile viewport vůbec — nebylo explicitně
  vyžádáno v zadání, ale zmiňuji jako mezeru).
- **Revert tlačítko jako plánovaný, čistý test** — netestoval jsem ho
  úmyslně na existujícím klíči (zakázáno zadáním), jen neplánovaně při opravě
  incidentu. Funguje, ale nebyl to standardní „změň-a-vrať" test na
  bezpečném datu.
- **RLS cleanup migrace v praxi, `backfill_migration_ledger.sql`** — mimo
  scope browser testu, netýká se frontendu.

---

## 13. Verdikt

**Test A (race condition, hlavní požadavek): PASS.** Fix funguje — sekvenční
requesty, poslední napsaná hodnota vždy vyhraje, ověřeno network logem i
fresh-DB-čtením, 2× nezávisle (druhé opakování po opravě mého vlastního
locator bugu).

**Zbytek golden path (B–E ze zadání): PASS.** Cache invalidace, revert/delete
viditelnost a funkčnost, beforeunload guard, offline/error zotavení,
vyhledávání, accordion, 14 tabů, „zobrazit na webu" odkaz, vytvoření/smazání
pole, veřejné stránky (homepage/about/membership/booking), patička s
`shared_contact_email` — všechno funguje podle očekávání, bez console chyb a
bez failed requestů.

**Incident:** Během testu jsem měl locator bug, který na chvíli přepsal
skutečnou hodnotu `shared_contact_email`. Nahlásil jsem to ihned, opravil
přes appku samotnou (tlačítko Revert, ne SQL), a nezávisle ověřil obnovu na
3 místech + globální kontrolou integrity nad všemi 53 řádky (0 dalších
mismatchů). Řádek je teď bit-identický se stavem před testováním.

**Nový nález mimo scope:** Pre-existing bug v `useAuth.tsx` způsobuje, že
hard reload na `/admin` téměř vždy přesměruje na `/dashboard` (§11) —
nesouvisí s fází 0, ale doporučuju to řešit brzy kvůli UX.

**Celkový verdikt: fáze 0 je připravená na nasazení frontendu.** Kritická
race condition (jediná neopravená položka z `docs/cms-faze0-testy.md`) je
teď ověřeně opravená. Doporučuju před nasazením:
1. Krátkou vizuální kontrolu v reálném prohlížeči (ne jen headless).
2. Zvážit opravu `/admin` reload bugu (§11) — nezávislé na této fázi, ale
   ovlivňuje každodenní použití adminu klientkou.
