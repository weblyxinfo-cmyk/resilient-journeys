# CMS phase 3: přihlášená členská sekce (app UI)

Napojení poslední odložené části webu na CMS: `Dashboard.tsx`, `Profile.tsx`,
`VideoPlayer.tsx`, `Auth.tsx`. Stejný vzor jako zbytek webu (`useCms().t(key,
fallback)`), viz `src/components/Services.tsx`.

## Počty klíčů

| Soubor | Klíčů | Sekcí |
|---|---:|---:|
| `src/pages/Dashboard.tsx` | 52 | 10 |
| `src/pages/Profile.tsx` | 42 | 6 |
| `src/pages/VideoPlayer.tsx` | 25 | 6 |
| `src/pages/Auth.tsx` | 61 | 10 |
| **Celkem** | **180** | **32** |

Ověřeno automaticky (viz níže): každý `t()` klíč použitý v těchto 4 souborech
má odpovídající řádek v `docs/cms-keys-appui.json` a hodnota v seed migraci se
znak po znaku shoduje s fallbackem v kódu (0 rozdílů, 0 chybějících klíčů
oběma směry).

## Jak jsem řešil hlášky s proměnnými

Podle zadání jsem u textů skládaných z proměnných nepoužil rozbití na
fragmenty přes `+`/šablonové literály, ale zástupný znak v jednom CMS poli,
nahrazovaný až při vykreslení pomocí `.replace()`:

- `dashboard_header_welcome_title`: `"Welcome, {name}"` →
  `t(...).replace('{name}', profile?.full_name || 'member')`
- `dashboard_sessions_credits_description`: `"Your annual consultation
  credits for {year}"` → `.replace('{year}', String(new
  Date().getFullYear()))`
- `videoplayer_denied_badge`: `"Requires {membership} membership"` →
  `.replace('{membership}', membershipLabels[requiredMembership])`

Tam, kde je proměnná zalitá do formátování uvnitř věty (tučné písmo přes
`<strong>`), jsem šablonu s `.replace()` nepoužil, protože by to zničilo
formátování — místo toho jsem zachoval JSX strukturu a text kolem `<strong>`
rozdělil na dvě CMS pole (text_before / text_after), přesně podle mezer
v původním JSX, takže vykreslený výsledek je znak po znaku identický:

- `VideoPlayer.tsx`: „This video is available for members with **Premium**
  level or higher...“ → `videoplayer_denied_text_before` +
  `<strong>{membershipLabels[...]}</strong>` + `videoplayer_denied_text_after`
- `Auth.tsx` (resetSent view): „We've sent a password reset link to
  **email@x.com**. Please check...“ → `auth_resetsent_description_before` +
  `<strong>{forgotEmail}</strong>` + `auth_resetsent_description_after`

Podmínky, za kterých se která hláška zobrazuje, jsem nikde neměnil — jen
nahradil string literály za `t(key, stejný literál)` na stejném místě ve
stejné větvi `if`/ternárního výrazu. Nejcitlivější místo bylo `handleLogin`/
`handleRegister`/`handleResetPassword` v `Auth.tsx`, kde se text vybírá podle
obsahu `error.message` ze Supabase (`error.message.includes(...)`) — tato
podmínka zůstala beze změny, mění se jen zdroj textu, který se do proměnné
`message` přiřadí.

## Co jsem vědomě nenapojil a proč

1. **Zod validační hlášky** (`z.string().email('Please enter a valid email
   address')`, `.min(6, '...')`, `.min(2, '...')` v `Auth.tsx`) — schémata
   jsou definovaná na úrovni modulu, mimo komponentu, takže nemají přístup k
   `useCms()`. Přesun schémat dovnitř komponenty by je nechal znovu vytvářet
   při každém renderu a nejde o čistě textovou úpravu, ale o restrukturalizaci
   validační logiky, což je mimo zadání „jen texty, nesahej na logiku".
   Zůstaly jako natvrdo napsané anglické texty.
2. **SEO `title`/`description` na `<SEO>` komponentě** (v `Auth.tsx` 4×) —
   nenapojeno, protože to není zavedená konvence ani jinde na webu (ověřeno
   na `About.tsx`, `BlogPost.tsx` — SEO props jsou všude ponechány jako
   literály).
3. **Chybové zprávy z externích zdrojů** (`err.message`, `error.message` ze
   Supabase) — zůstávají dynamické, CMS řídí jen statický fallback text, který
   se použije, když `err.message`/`error.message` chybí (`err instanceof
   Error ? err.message : t(...)`, `error.message || t(...)`).
4. **Vypočítané hodnoty** (`{completedVideos} / {totalAccessibleVideos}`,
   `{monthsUnlocked} / 12`, `{premiumCredits.total - premiumCredits.used} /
   {premiumCredits.total}`, `{resource.file_size_mb.toFixed(1)} MB`,
   `resource.resource_type` badge) — nejsou text, ale data; napojeny jsou jen
   pevné popisky okolo (`Completed`, `Months Unlocked`, `Sessions
   remaining`...).
5. **Technické `aria-label` atributy** — ve 4 zpracovávaných souborech žádné
   nejsou (formuláře používají viditelné `<Label>`, ne aria-label), takže
   nebylo co vynechávat.
6. **`scripts/cms-seed.mjs`** — needitováno (souběžně na něm pracuje jiný
   agent), i když by šlo doplnit `FILE_PAGE_MAP` o tyto 4 soubory. `npm run
   cms:check` funguje bez závislosti na té mapě (ta se používá jen při
   generování nových seedů přes `cms:gen`) a potvrdil 0 nesrovnalostí.

## Ověření

- `npx tsc --noEmit` — bez chyb.
- `npm run build` — úspěšný build.
- `npm run cms:check` — **1287** `t()` klíčů v celém `src/` zkontrolováno
  proti `supabase/migrations/`, včetně těchto 180 nových — vše sedí (1 staré
  upozornění na `about_intro_photo` label mismatch, nesouvisí s touto prací).
- Vlastní skript porovnal 180 `t()` volání v těchto 4 souborech proti
  `docs/cms-keys-appui.json` (1:1 shoda klíčů) a proti seed migraci (1:1 shoda
  fallback hodnot, 0 rozdílů).

## Soubory

- `src/pages/Dashboard.tsx`, `src/pages/Profile.tsx`,
  `src/pages/VideoPlayer.tsx`, `src/pages/Auth.tsx` — napojení na CMS,
  `id="cms-<page>-<section>"` přidané na obalující elementy jednotlivých
  sekcí.
- `docs/cms-keys-appui.json` — metadata všech 180 klíčů (page/section/label/
  sort_order/field_type/route/anchor).
- `supabase/migrations/20260815100000_seed_cms_appui.sql` — seed pro
  `cms_content` (180 řádků, `ON CONFLICT (key) DO NOTHING`).
- `supabase/migrations/20260815100100_seed_cms_sections_appui.sql` — seed pro
  `cms_sections` (32 řádků, `ON CONFLICT (page, section_key) DO NOTHING`).
