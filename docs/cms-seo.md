# CMS: SEO texty (meta title/description/keywords)

Napojení posledního zbývajícího kusu CMS — titulků a popisků pro vyhledávače
na všech veřejných stránkách, které používají `src/components/SEO.tsx`.

## Co bylo napojeno

21 stránek, 45 nových CMS klíčů (`docs/cms-keys-seo.json`,
`supabase/migrations/20260815110000_seed_cms_seo.sql`):

| Stránka | Soubor | Klíče |
|---|---|---|
| Homepage | `Index.tsx` | `homepage_seo_title`, `homepage_seo_description` |
| O mně | `About.tsx` | `about_seo_title`, `about_seo_description` |
| Blog | `Blog.tsx` | `blog_seo_title`, `blog_seo_description` |
| Detail článku | `BlogPost.tsx` | `blog_post_seo_title_suffix` (viz níže) |
| Booking | `Booking.tsx` | `booking_seo_title`, `booking_seo_description` |
| Booking success | `BookingSuccess.tsx` | `booking_success_seo_title`, `booking_success_seo_description` |
| Cookies | `Cookies.tsx` | `cookies_seo_title`, `cookies_seo_description` |
| Endometriosis Hub | `EndometriosisHub.tsx` | `endometriosis_seo_title`, `endometriosis_seo_description` |
| Free Guide | `FreeGuide.tsx` | `free_guide_seo_title`, `free_guide_seo_description` |
| Free Guide — poděkování | `FreeGuideThankYou.tsx` | `thank_you_seo_title`, `thank_you_seo_description` |
| Checkout success | `CheckoutSuccess.tsx` | `checkout_success_seo_title`, `checkout_success_seo_description` |
| Membership | `Membership.tsx` | `membership_seo_title`, `membership_seo_description`, `membership_seo_keywords` |
| 404 | `NotFound.tsx` | `notfound_seo_title`, `notfound_seo_description` |
| Pricing | `Pricing.tsx` | `pricing_seo_title_prefix/suffix`, `pricing_seo_description_prefix/middle/suffix` (viz níže) |
| Pricing success | `PricingSuccess.tsx` | `pricing_success_seo_title`, `pricing_success_seo_description` |
| Privacy | `Privacy.tsx` | `privacy_seo_title`, `privacy_seo_description` |
| Resilient Hub | `ResilientHub.tsx` | `resilient_hub_seo_title`, `resilient_hub_seo_description`, `resilient_hub_seo_keywords` |
| Resilient Hubs | `ResilientHubs.tsx` | `resilient_hubs_seo_title`, `resilient_hubs_seo_description` |
| Terms | `Terms.tsx` | `terms_seo_title`, `terms_seo_description` |
| Detail workshopu | `WorkshopPost.tsx` | `workshop_post_seo_title_suffix` (viz níže) |
| Workshopy | `Workshopy.tsx` | `workshopy_seo_title`, `workshopy_seo_description` |

Všechny fallbacky jsou přesně stávající texty z kódu — nic nebylo
přeformulováno ani optimalizováno.

**`Membership2.tsx` (`membership2_seo_title`/`membership2_seo_description`)
už bylo napojeno dřív — nezakládal jsem duplicitní klíče, jen jsem je při
kontrole vynechal.**

`Checkout.tsx` a `Admin.tsx` žádnou `<SEO>` komponentu nepoužívají, takže
tam nebylo co napojit. `Auth.tsx` (4× `<SEO>`) jsem nesahal — je mimo mé
zadání, edituje ho jiný souběžný agent.

### Zvláštní případy

- **`BlogPost.tsx` a `WorkshopPost.tsx`** — titulek je `${post.title} | Resilient Mind Blog}`
  resp. `${workshop.title} | Resilient Mind Workshops}`. Název článku/workshopu
  a popisek (`excerpt`/`content`) jsou čistě dynamická data z DB bez
  jakéhokoli statického fallbacku — do CMS jde tedy jen ta pevná část za
  názvem (`blog_post_seo_title_suffix` = "Resilient Mind Blog",
  `workshop_post_seo_title_suffix` = "Resilient Mind Workshops").
- **`Pricing.tsx`** — titulek i popisek obsahují živé ceny z `useMembershipTiers()`
  (`basicMonthlyPrice`, cena ročního plánu), ne pevné číslo jako jinde. Aby
  cena zůstala vždy aktuální a nezamrzla v CMS, rozdělil jsem text na části
  před/mezi/za cenou (`pricing_seo_title_prefix/suffix`,
  `pricing_seo_description_prefix/middle/suffix`) — stejný vzor jako už
  existující `checkout_pay_button_prefix` v `Checkout.tsx`. Cenu samotnou
  jsem se nedotkl.
- **`ResilientHubs.tsx`** — "From €37" v popisku je psané natvrdo (ne
  proměnná), takže celý text šel do CMS jako jeden kus beze změny, přesně
  jak bylo zadáno.

## Ověření

- `npx tsc --noEmit` — bez chyb.
- `npm run build` — projde, bez chyb.

## DŮLEŽITÉ: omezení se sociálními sítěmi (pro klientku)

Web je single-page aplikace bez server-side renderingu — `vercel.json`
přesměrovává všechny cesty na `index.html` a `SEO.tsx` vykresluje meta tagy
až v prohlížeči pomocí JavaScriptu (`react-helmet-async`).

**Důsledek:**
- **Google** si JavaScript při indexaci spustí, takže nově napojené SEO texty
  z CMS se v jeho výsledcích vyhledávání *projeví normálně* — tahle část
  funguje.
- **Facebook, LinkedIn, WhatsApp a Twitter/X ale JavaScript při náhledu
  odkazu nespouštějí.** Jejich roboti čtou jen statický obsah přímo ze
  souboru `index.html` (řádky 18–36), který obsahuje jeden pevný text pro
  celý web. Když se tedy v administraci upraví meta description libovolné
  stránky, **náhled odkazu sdíleného na Facebooku/WhatsAppu/LinkedInu/Twitteru
  se nezmění** — pořád ukáže starý text z `index.html`.

Tohle není chyba, kterou by způsobilo napojení na CMS — je to už dnes takhle
rozbité, nezávisle na téhle práci, a týká se to úplně všech stránek stejně
(i před CMS by úprava textu v kódu měla stejný efekt). Skutečná oprava je
**prerendering nebo server-side rendering** (např. přes Vite SSG plugin nebo
přechod na framework s SSR) — to je samostatný, netriviální úkol, který jsem
podle zadání neřešil, jen ho tady zaznamenávám, ať to může klientka vzít na
vědomí.
