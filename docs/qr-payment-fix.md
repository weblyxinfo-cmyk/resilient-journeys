# Oprava QR plateb na workshopy — SPAYD → EPC (Girocode)

## Problém
`WorkshopRegistration.tsx` generovalo pro všechny workshopy QR ve formátu **SPAYD**, což čtou jen české/slovenské bankovní aplikace. Workshopy se ale platí na španělský IBAN v EUR — zahraniční účastnice si tak nemohly QR kódem zaplatit.

## Co se změnilo

### `src/lib/paymentQr.ts` (nový soubor)
Sdílená logika, aby ji nebylo nutné duplikovat mezi formulářem a adminem:
- `shouldUseEpc(iban, currency)` — rozhoduje formát: **EPC**, pokud `currency === 'EUR'` **nebo** IBAN nezačíná `CZ`; jinak **SPAYD**.
- `generateSpayd(...)` — beze změny logiky, jen přesunuto z `WorkshopRegistration.tsx`.
- `generateEpcQr(...)` — nový generátor EPC069-12 (Girocode):
  - 12 řádků dle spec (`BCD`/`002`/`1`/`SCT`/BIC/jméno/IBAN/částka/účel/strukt. reference/zpráva/info), oddělovač `\n`.
  - BIC řádek je vždy prázdný (verze `002` to pro SEPA země povoluje, BIC v datech nemáme).
  - Trailing prázdné řádky se ořezávají (spec to povoluje a šetří to místo v QR).
  - Jméno příjemce ořezáno na 70 znaků, zpráva pro příjemce na 140 znaků.
  - Částka formátována jako `EUR16.00` (tečka jako oddělovač, bez mezery za měnou).
  - Pokud by i tak výsledný payload přesáhl limit **331 bajtů** (UTF‑8), funkce dál zkracuje zprávu pro příjemce, dokud se nevejde.

### `src/components/WorkshopRegistration.tsx:1-70`
- Nový povinný prop `beneficiaryName: string | null`.
- `useEpc = shouldUseEpc(iban, currency)` — určuje formát.
- `qrString` — vygeneruje EPC nebo SPAYD podle `useEpc`; pokud je potřeba EPC a `beneficiaryName` chybí, `qrString` je `null`.
- `missingBeneficiaryName` — `true`, když je potřeba EPC a jméno není vyplněné.
- Oba render bloky (success stav `:112-138` a stav před odesláním formuláře `:181-208`) teď:
  - zobrazí QR, pokud `qrString` existuje (přidán `level="M"` na `QRCodeSVG` — EPC spec doporučuje error-correction level M, dřív se používal defaultní `L`),
  - jinak při `missingBeneficiaryName` zobrazí hlášku + IBAN/částku/zprávu textem, ať se dá zaplatit ručně,
  - jinak (chybí IBAN) nic — beze změny oproti původnímu chování.
- Nové CMS klíče (fallback anglicky, stejná konvence jako zbytek souboru): `workshopform_reg_qr_missing_name_title`, `workshopform_reg_qr_missing_name_text`, `workshopform_reg_qr_iban_label`, `workshopform_reg_qr_amount_label`, `workshopform_reg_qr_message_label`.

### `src/pages/WorkshopPost.tsx`
- `Workshop` interface: přidán `payment_beneficiary_name: string | null` (`:32`).
- `<WorkshopRegistration ... beneficiaryName={workshop.payment_beneficiary_name} />` (`:263`). Query používá `select('*')`, takže nový sloupec načte automaticky po nasazení migrace.

### `src/components/admin/AdminBlog.tsx`
- `BlogPost` interface + `formData` + `resetForm` + `handleEdit` + `handleSubmit` payload: přidáno pole `payment_beneficiary_name`.
- Nový input ve formuláři workshopu, hned pod „Payment Message / Note" (`:605-620` po úpravě): popisek **„Jméno majitele účtu (povinné pro QR platbu ze zahraničí)"**, pod ním červené upozornění, pokud je prázdné.
- V tabulce workshopů (`:714-726` po úpravě) přibyl badge **„Missing beneficiary name"**, když je workshop placený, IBAN vyžaduje EPC formát a jméno chybí — použito `shouldUseEpc` ze sdílené knihovny.
- Import `shouldUseEpc` z `@/lib/paymentQr`.

### `src/integrations/supabase/types.ts`
Přidán `payment_beneficiary_name: string | null` (Row) / `payment_beneficiary_name?: string | null` (Insert, Update) do `blog_posts`.

### Migrace (soubor, nespuštěno)
`supabase/migrations/20260814130000_add_payment_beneficiary_name.sql`:
```sql
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS payment_beneficiary_name TEXT;
```

## Jak se pozná, který formát se použije
```
useEpc = currency.toUpperCase() === 'EUR' || !cleanIban(iban).startsWith('CZ')
```
- `EUR` + španělský IBAN → **EPC** (oba workshopy níže).
- `CZK` + český IBAN → **SPAYD** (stávající česká varianta, beze změny).

## Vygenerovaný EPC řetězec pro oba workshopy
Jméno majitele účtu (`payment_beneficiary_name`) v `blog_posts` **ještě není vyplněné** — dokud administrátorka doplní jméno v adminu, `missingBeneficiaryName` bude `true` a místo QR se zobrazí platební údaje textem. Níže je ukázka výstupu `generateEpcQr()` s placeholder jménem, aby šlo ověřit přesný formát; s reálným jménem se změní jen řádek 6.

**Workshop „Putting Yourself First…" (16 EUR):**
```
BCD
002
1
SCT

<JMÉNO MAJITELE ÚČTU>
ES6715830001159005414319
EUR16.00


Workshop EFT
```
(99 bajtů s placeholder jménem — daleko pod limitem 331 B)

**Workshop „…(Dénia)" (35 EUR):**
```
BCD
002
1
SCT

<JMÉNO MAJITELE ÚČTU>
ES6715830001159005414319
EUR35.00


Workshop EFT
```

Ověřeno: IBAN bez mezer, `EURxx.00` bez mezery a s tečkou, zpráva 12 znaků (limit 140), jméno pod limitem 70 znaků, trailing prázdné řádky (pole 12 „info pro plátce") správně odstraněny, `QRCodeSVG` dostává přesně tento řetězec jako `value`.

## Co musí uživatel doplnit v adminu
Pro oba EFT workshopy (a jakýkoli budoucí workshop v EUR nebo s ne-českým IBAN) je potřeba v Adminu → Blog → Workshops → Edit doplnit nové pole **„Jméno majitele účtu"** (jméno, na které je vedený účet `ES6715830001159005414319`) — bez něj se QR kód nezobrazí a návštěvníkům se ukážou platební údaje textem.

## Ověření
- `npx tsc --noEmit` — bez chyb.
- `npm run build` — build proběhl bez chyb.
