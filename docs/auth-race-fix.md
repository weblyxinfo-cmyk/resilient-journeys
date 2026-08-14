# Auth race condition — /admin cold-load bug

## Příčina

`AuthProvider` (`src/hooks/useAuth.tsx`) volal `supabase.rpc('has_role', ...)` a
`supabase.from('profiles')...` synchronně (přes `await` v async funkci) přímo
uvnitř `onAuthStateChange` callbacku — konkrétně při zpracování `INITIAL_SESSION`
eventu, který je jediný, co nastane při studeném načtení stránky s obnovenou
session (typicky přímý přechod na `/admin` nebo F5).

Toto je zdokumentované chování GoTrue klienta v `@supabase/supabase-js`: volání
metod klienta (`.from()`, `.rpc()`, `.auth.*`) z těla `onAuthStateChange`
callbacku se může zaseknout na interním session locku, protože samotný
callback běží uvnitř inicializace, na kterou tato volání čekají. Proto se
`Promise.all([fetchProfile, rpc('has_role')])` v `handleSession()` opakovaně
nedostal pod 6s timeout — nešlo o pomalou síť, ale o deadlock.

Když timeout vypršel, kód (`useAuth.tsx:112-128`, staré znění) nastavil
`loading = false` s `isAdmin` stále `false` a naplánoval retry přes
`setTimeout(..., 100)`. Jenže `Admin.tsx` mělo `useEffect`, který na `!loading`
okamžitě vyhodnotil `!isAdmin` jako "není admin" a zavolal
`navigate('/dashboard')` — dřív, než retry stihl `isAdmin` doplnit. Odtud tichý
redirect bez jakékoli hlášky.

Druhý symptom (burst `AbortError` na záložce Page Text) měl jinou příčinu:
`AdminCMS.tsx` renderuje živé náhledy sekcí jako `<iframe src="/route?cmsPreview=1#anchor">`
na stejnou doménu. Každý iframe nastartoval celou aplikaci včetně
`AuthProvider`, tedy vlastní `getSession()` / `fetchProfile()` /
`rpc('has_role')`. Několik souběžných instancí se pralo o Supabase session
lock (`navigator.locks`) → `AbortError: signal is aborted without reason`.

## Oprava

### 1. Odstranění deadlocku (`src/hooks/useAuth.tsx:96-139`)

Nová funkce `checkRoleAndProfile(userId)` obaluje veškerá Supabase volání
(`fetchProfile` + `rpc('has_role')`) do `setTimeout(..., 0)`. Díky tomu se
nikdy neprovedou synchronně v těle `onAuthStateChange` callbacku (viz použití
na `useAuth.tsx:175`) — vykonají se až v dalším tiku event loopu, mimo GoTrue
inicializační kontext, takže se o session lock neperou. Toto je oficiálně
doporučený postup pro tento typ deadlocku.

Zároveň jsem odstranil duplicitní `supabase.auth.getSession()` volání, které
běželo paralelně vedle `onAuthStateChange` listeneru a řešilo se dedup flagem
(`initialSessionHandled`). `onAuthStateChange` spolehlivě vystřelí
`INITIAL_SESSION` hned po přihlášení k odběru, takže druhé volání bylo
zbytečné a jen zvyšovalo šanci na kolizi na locku (relevantní i pro iframe
scénář, viz níže).

### 2. Rozdělení `loading` a stavu role (`useAuth.tsx:19-35`, `47-54`, `247-264`)

`AuthContextType` má nově:
- `roleLoading: boolean` — `true`, dokud se pro přihlášeného uživatele teprve
  zjišťuje profil/role.
- `roleError: boolean` — `true`, pokud zjišťování role selhalo nebo vypršel
  timeout (8s, `useAuth.tsx:108`). **Timeout nikdy nenastaví `isAdmin = false`
  ani nevede k závěru "není admin"** — jen přepne `roleError` a `roleLoading`
  na výsledek "zatím nevím", ne "ne".
- `retryRoleCheck(): void` — znovu spustí `checkRoleAndProfile` pro aktuální
  session (`useAuth.tsx:141-145`).

`loading` teď pokrývá jen "znám session/uživatele" (nastaví se `false`, jakmile
dorazí libovolný auth event), `roleLoading`/`roleError` řeší zvlášť "znám roli".

### 3. Odstranění tichého redirectu (`src/pages/Admin.tsx`)

`useEffect` (řádek 27-38) teď čeká na `roleLoading === false` a
`roleError === false`, než se rozhodne o `navigate('/dashboard')`. Nikdy tedy
nepřesměruje, dokud je role skutečně neznámá.

Render má tři stavy místo jednoho:
- `loading || !user || roleLoading` → spinner "Verifying access..." (řádek
  39-47).
- `roleError` → obrazovka s hláškou "We couldn't verify your access rights.
  This is usually temporary." a tlačítkem **Try again**, které volá
  `retryRoleCheck()` (řádek 49-63).
- `!isAdmin` (role potvrzena, ale žádná) → krátký spinner, než efekt zavolá
  `navigate('/dashboard')` — toto je jediná cesta na dashboard a nastane jen
  po potvrzeném "not admin".

### 4. Preview režim — CMS náhledy nespouští auth (`useAuth.tsx:39-45`, `147-156`)

Detekce: `new URLSearchParams(window.location.search).has('cmsPreview')` (hlavní
signál, parametr přidává `AdminCMS.tsx` do `src` iframů) doplněná o
`window.self !== window.top` jako fallback.

Pokud je detekován preview režim, hlavní `useEffect` v `AuthProvider` se vůbec
nepřipojí na `onAuthStateChange`, nezavolá žádné Supabase auth API — jen
okamžitě nastaví `loading = false`, `roleLoading = false` (uživatel zůstává
`null`/nepřihlášen). Veřejný CMS obsah (`cms_content`) se dál načítá anonymně
přes `useCms`, to jsem neměnil.

`AdminCMS.tsx` jsem podle zadání needitoval — parametr `?cmsPreview=` do `src`
iframu už přidává (`AdminCMS.tsx:270`), stačilo zajistit, že ho `useAuth`
respektuje.

## Ověření (dev server, produkční DB, jen čtení/navigace)

Testováno Playwright skriptem (headless Chromium) proti `npm run dev` na
`http://localhost:8080`, účet `admin@resilientmind.com`. Každý `page.goto()`
na `/admin` je skutečný full page reload (Vite websocket se pokaždé
reconnectuje) — jde tedy přesně o scénář "studený start s obnovenou session"
z hlášeného bugu, ne o SPA přechod v rámci běžícího runtime.

| # | Test | Výsledek |
|---|------|----------|
| 1 | Přímý `page.goto('/admin')` po přihlášení, 3× po sobě | **PASS** — všechny 3× načetly admin, žádný redirect |
| 2 | Tvrdý reload (`page.reload()`) na `/admin` | **PASS** — admin zůstal načtený |
| 3 | Navigace přes menu (Account → Admin Panel) | **PASS** — funguje beze změny |
| 4 | `/?cmsPreview=1` — kontrola síťových requestů | **PASS** — 0 volání na `rpc/has_role`, `/rest/v1/profiles`, `/auth/v1/*` |
| 5 | Sign out → Sign in | **PASS** — obojí funguje |

Build/typecheck:
- `npx tsc --noEmit` → bez chyb
- `npm run build` → prošel (`vite build`, žádné TS/build chyby)

Dev server byl po ověření zastaven. Nebyl měněn žádný obsah v DB, jen čtecí
operace (login/logout, navigace).

## Co se stane při skutečné chybě ověření

Pokud `checkRoleAndProfile` selže (chyba z RPC, chyba profilu, nebo vyprší 8s
timeout), uživatel na `/admin` uvidí obrazovku s hláškou "We couldn't verify
your access rights. This is usually temporary." a tlačítkem **Try again**
(`retryRoleCheck()`), které znovu spustí kontrolu role pro aktuální session.
Nikdy nedojde k tichému přesměrování na `/dashboard` — tam se dostane jen
uživatel, u kterého se roli podařilo ověřit a vyšla `false`.
