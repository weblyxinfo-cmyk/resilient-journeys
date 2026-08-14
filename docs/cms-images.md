# CMS — obrázky

Napojení všech hardcodovaných obrázků na webu na `cms_content` (`field_type='image_url'`), podle zadání „i fotky v tom membershop jdou upravovat". Vynechány obrázky, které se už řídí z DB samy (blog/workshopy z `blog_posts`, videa, `booking_cards`, náhledy videí v `VideoPreviewCard`).

## Poznámka k `field_type`

Zadání říkalo `field_type: 'image'`, ale `cms_content` má CHECK constraint
(`20260211000000_add_homepage_intro_video.sql`):
`CHECK (field_type IN ('text', 'textarea', 'html', 'image_url', 'video_url'))`.
`'image'` by insert shodil. Použil jsem `'image_url'` — stejnou hodnotu, kterou
už `AdminCMS.tsx` plně umí (viz níže), a stejnou, kterou pro obrázky odhaduje
i `scripts/cms-seed.mjs` (`guessFieldType`).

## Nalezené obrázky a klíče

| Klíč | Soubor:řádek | Stránka/sekce | Hodnota |
|---|---|---|---|
| `shared_hero_background_image` | `src/components/Hero.tsx:14`, `src/components/PageHero.tsx:14`, `src/components/Pricing.tsx:31`, `src/components/Services.tsx:164` | shared / hero_background | `/hero-bg.jpg` |
| `homepage_why_join_image` | `src/components/Services.tsx:202` | homepage / why_join | `/why-join.jpg` |
| `shared_about_preview_photo` | `src/components/AboutPreview.tsx:23` | shared / about_preview | `/silvie.jpg` |
| `about_intro_photo` | `src/pages/About.tsx:52` | about / intro | `/silvie.jpg` |
| `membership_hero_photo` | `src/pages/Membership.tsx:163` | membership / hero | `/membership-hero-photo.jpg` |
| `membership_transformation_photo` | `src/pages/Membership.tsx:313` | membership / transformation | `/membership-transformation.jpg` |
| `workshops_silk_photo_1/2/3` | `src/pages/Workshopy.tsx:110,117,124` | workshopy / silk_paintings | `/workshops/workshop-1..3.jpg` |
| `workshops_kids_photo_1/2` | `src/pages/Workshopy.tsx:157,164` | workshopy / kids_parents | `/workshops/workshop-4..5.jpg` |
| `workshops_adults_photo_1..4` | `src/pages/Workshopy.tsx:197,204,211,218` | workshopy / adults | `/workshops/workshop-6..9.jpg` |
| `shared_logo_image` | `src/components/Logo.tsx:7` | shared / logo | `/assets/resilient-mind-logo.png` |

16 klíčů celkem, 10 souborů.

`shared_hero_background_image` je jeden klíč pro 4 různá místa v kódu — je to
doslova stejný soubor (`hero-bg.jpg`) použitý jako pozadí na homepage i v
hlavičce (`PageHero`) každé vnitřní stránky (O mně, Ceník, Rezervace,
Členství, Workshopy, Resilient Hub/Huby, Zdarma průvodce...). Jedna změna v
adminu = změna všude, kde se to pozadí používá — stejný vzor jako už
existující sdílený klíč `shared_silvie_bio_short` (Membership.tsx +
ResilientHubs.tsx).

**Vynechán `about-portrait.jpg`** (`src/assets/`) — v kódu se nikde
nepoužívá (mrtvý soubor), není co napojit.

## Importy z `src/assets/`

Dva klíče (`shared_hero_background_image`, `homepage_why_join_image`) mají
ve `t()` volání jako fallback importovanou proměnnou (`heroBg`,
`whyJoinImage`), ne řetězec — přesně podle zadání, aby fungovaly i než se
CMS řádek načte / kdyby chyběl. Kvůli tomu je `scripts/cms-seed.mjs`
(TS-based, vyžaduje string literal) přeskočí s `[skip]` varováním při
`cms:gen`/`cms:check` — to je očekávané, ne chyba.

Pro DB hodnotu ale hashované jméno z buildu (`hero-bg-zBW4aAl3.jpg`) nejde
použít — je jiné při každém buildu. Řešení: oba soubory jsem zkopíroval
(nový soubor, nic přejmenované/smazané) do `public/hero-bg.jpg` a
`public/why-join.jpg` — bitově identická kopie stejné fotky, jen na stabilní
cestě. Seed migrace ukazuje na tuto kopii. Dokud admin fotku nenahradí, web
vypadá identicky (fallback z importu i DB hodnota z `public/` jsou stejný
obrázek).

Ověřeno v `dist/` po `npm run build`:
- `dist/assets/hero-bg-zBW4aAl3.jpg`, `dist/assets/why-join-R50Ju3yp.jpg` — hashované bundlované verze (fallback).
- `dist/hero-bg.jpg`, `dist/why-join.jpg` — stabilní kopie z `public/` (DB hodnota).
- Klíče (`shared_hero_background_image` atd.) jsou v příslušných JS chunkách — `t()` volání se správně zkompilovala.

Ostatní klíče (silvie.jpg, membership-*, workshop-*.jpg, logo) už byly v
`public/` jako obyčejné řetězcové cesty — tam je fallback stejný string jako
DB hodnota, žádný trik potřeba.

## Migrace (soubory, NESPUŠTĚNY)

- `supabase/migrations/20260814140000_seed_cms_images.sql` — 16 řádků do `cms_content`, `ON CONFLICT (key) DO NOTHING`.
- `supabase/migrations/20260814140100_seed_cms_sections_images.sql` — 2 nové sekce do `cms_sections` (`shared/hero_background`, `shared/logo` — jediné sekce, které ještě neexistovaly; zbytek klíčů padl do už seedlých sekcí přesně podle jejich existujících anchorů, viz `20260814122200_seed_cms_sections_phase2.sql`).
- `supabase/migrations/20260814140200_add_cms_images_storage.sql` — nový storage bucket, viz níže.

`membership_hero_photo`/`membership_transformation_photo` mají `section` už
seedlý (`hero`, `transformation` v `20260814122200_seed_cms_sections_phase2.sql`),
ale ty sekce v `Membership.tsx` zatím nemají `id="cms-membership-*"` anchor
v JSX (žádný z 13 sekcí stránky ho nemá) — pole se v adminu ihned zobrazí a
editují, jen bez preview-scrollu, dokud anchor nepřibude. Neřešil jsem to
sám — `Membership.tsx` zjevně souběžně edituje jiný agent (`impl-membership`)
a přidání `id` do stejného souboru bych s ním mohl kolidovat.

`npm run cms:check` proti novým migracím čistý (žádný `missing-seed` ani
`value-mismatch`/`label-mismatch` pro nově přidané klíče; zbylé `[skip]`/
`[missing-seed]` řádky ve výstupu jsou z nesouvisejících souborů, mimo tento
úkol).

## Vedlejší nález (nesahal jsem na to)

`membership_hero_image_alt` a `membership_transformation_image_alt`
(`20260814120300_seed_cms_membership.sql`) mají `field_type='image_url'`,
ale jsou to alt-text řetězce (popisek fotky pro accessibility), ne URL
obrázku — pravděpodobně omyl `cms:gen` heuristiky (klíč obsahuje `_image_`).
V adminu se u nich pod textovým polem zkusí vykreslit `<img src="text alt
popisku">` → rozbitá ikonka. Needituje se to samo, jen se tím pole needitovatelné
nestane. Nechávám na review, není to má sekce.

## `CmsImageField.tsx`

`src/components/admin/CmsImageField.tsx` — samostatná komponenta,
`AdminCMS.tsx` ani `useCms.tsx` jsem needitoval.

Rozhraní: `{ value: string; onChange: (newUrl: string) => void; disabled?: boolean }`.
Náhled aktuální fotky, textový `Input` s URL (zůstává — stejná možnost ruční
úpravy URL jako měl původní `<Input>` v `AdminCMS`), tlačítko „Nahrát novou
fotku" → upload do `cms-images` bucketu → `onChange(publicUrl)`, indikátor
průběhu (`Nahrávám…`), validace typu (JPG/PNG/WEBP) a velikosti (max 5 MB)
s toast hláškou při chybě/nedodržení. „Vrátit původní" nepotřebuje vlastní
kód — `AdminCMS.tsx` už má obecné tlačítko Revert (porovnává
`value`/`default_value`, funguje pro libovolný `field_type`) — protože
komponenta je plně řízená (`value` prop), revert v ní automaticky naskočí.

**Zapojení do `AdminCMS.tsx`** (jeden řádek, v `renderField`, tam kde se dnes
`isSingleLine` větví na `<Input>`):

```tsx
{item.field_type === 'image_url' ? (
  <CmsImageField value={item.value} onChange={(v) => handleValueChange(item, v)} />
) : isSingleLine ? (
  <Input ... /> // původní řádek beze změny
) : (
  <AutoTextarea ... />
)}
```
(+ import `CmsImageField` nahoře a `onBlur={() => flushSave(item.id)}` buď
zůstane na vnějším `<Input>`, nebo se doplní do `CmsImageField` — upload
sám o sobě `flushSave` nevyvolá, spolehne se na `AUTOSAVE_DELAY_MS` debounce
po `onChange`; pokud chceš uložit ihned po uploadu, přidej do
`CmsImageField`'s `handleFile` po `onChange(...)` ještě `flushSave(item.id)`.)

## Storage bucket

Nový bucket `cms-images` (`20260814140200_add_cms_images_storage.sql`),
veřejně čitelný (`public: true`), stejný vzor jako `blog-images`/`resources`
(`storage.from('cms-images').upload()` + `.getPublicUrl()`).

Na rozdíl od `blog-images`/`resources` (kde smí nahrávat kterýkoli
přihlášený uživatel) jsem zápis omezil jen na adminy —
`public.has_role(auth.uid(), 'admin')` — stejná podmínka jako u
`cms_content`/`cms_sections` RLS. Oddělený od `blog-images`, aby editor
blogu omylem nepřepsal soubor používaný jako CMS fotka (nebo naopak).

## Soubory

- Kód: `src/components/Hero.tsx`, `src/components/PageHero.tsx`, `src/components/Services.tsx`, `src/components/Pricing.tsx`, `src/components/AboutPreview.tsx`, `src/components/Logo.tsx`, `src/pages/About.tsx`, `src/pages/Membership.tsx`, `src/pages/Workshopy.tsx`
- Nová komponenta: `src/components/admin/CmsImageField.tsx`
- Nové obrázky (kopie, nic smazáno/přejmenováno): `public/hero-bg.jpg`, `public/why-join.jpg`
- Drobná úprava generátoru (jen přidání 2 řádků do `FILE_PAGE_MAP`, nespouštěl jsem `cms:gen`): `scripts/cms-seed.mjs`
- Migrace: `supabase/migrations/20260814140000_seed_cms_images.sql`, `20260814140100_seed_cms_sections_images.sql`, `20260814140200_add_cms_images_storage.sql`

## Ověření

- `npx tsc --noEmit` — čisté.
- `npm run build` — projde, `dist/` obsahuje jak hashované bundlované assety, tak stabilní `public/` kopie (viz výše).
- `npx eslint` na dotčené soubory — bez chyb.
- `npm run cms:check` — bez chyb/mismatchů pro nově přidané klíče.
