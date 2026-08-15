# Workshop payments: bank-transfer QR → Stripe Checkout

Replaces the manual bank-transfer flow (QR code + Silvie checking the bank
account by hand) with Stripe Checkout, card payment, `mode: 'payment'`
(one-time, not a subscription). No login required — workshop visitors are
anonymous, same as the existing booking flow for consultations.

## Architecture

### Where the registration row is created

`workshop_registrations` is written **before** redirecting to Stripe, not
after payment succeeds. New edge function `workshop-registration-create`
does, in order:

1. Fail-closed price/title lookup from `blog_posts` (`loadWorkshopConfig`,
   same pattern as `create-checkout`'s `loadPlanConfig`/`loadHubConfig`): a
   query error, or a workshop that's missing/unpublished/not
   `is_paid_workshop`, refuses the request (400) and creates nothing —
   never a Stripe session, never a DB row.
2. `expectedPriceEur` check against the DB price (same purpose as
   `create-checkout`'s check — closes the stale-cache window).
3. Insert into `workshop_registrations` with `status: 'pending'`,
   `payment_status: 'pending'`.
4. Create the Stripe Checkout session (`mode: 'payment'`, inline
   `price_data` from the DB row, 1h expiry), with
   `metadata: { type: 'workshop_registration', workshop_registration_id, workshop_id, email }`.
5. Update the registration row with `stripe_session_id`.
6. Return `{ registration_id, checkout_url }` to the browser, which
   redirects to `checkout_url` immediately.

This mirrors `booking-create` → `session_bookings` exactly (insert row
`pending_payment` → create Stripe session → store `stripe_session_id`), which
is the established anonymous-payment pattern already in this codebase.

**Why create the row before payment, not in the webhook:** if the row only
existed after the webhook fired, the registration's own data (name, email,
phone, note) would have to round-trip through Stripe session metadata with
no local record until payment completes — losing it if metadata handling
ever changed, and giving Silvie zero visibility into "someone started
checkout" between step 4 and a successful payment. Creating it first means
the data is safe in Postgres from the moment the visitor submits the form,
and payment_status is the only thing left for the webhook to flip.

### How a paid registration is recognized

Two independent fields on `workshop_registrations`, added by
`20260815130000_add_workshop_payment_status.sql`:

- **`status`** — Silvie's own logistics field, unchanged in meaning
  (pending/confirmed/paid/cancelled, editable in AdminInquiries). The
  webhook now also sets it to `'confirmed'` on payment, so a paid
  registration moves itself out of the "Pending Registrations" stat card —
  no manual step required.
- **`payment_status`** — `'pending' | 'paid' | 'expired'`, Stripe truth
  only. Set to `'pending'` by `workshop-registration-create`, flipped to
  `'paid'` or `'expired'` **only** by `stripe-webhook`. Never written by the
  client or by AdminInquiries — there's no "mark as paid" button for it, so
  Silvie can't accidentally create a false-paid row. This is the field that
  keeps unpaid and paid registrations from ever looking the same: an unpaid
  registration is always `payment_status = 'pending'`, full stop, however
  long ago it was submitted.

AdminInquiries.tsx now shows a **Payment** badge (Awaiting payment / Paid /
Expired) next to the existing **Status** badge, in both the table and the
detail dialog.

### Confirmation: webhook, not the success page

`stripe-webhook`'s `checkout.session.completed` handler gained a branch for
`session.metadata.workshop_registration_id` (placed before the existing
`user_id` membership branch, alongside the existing `booking_id` branch,
since workshop registrations are anonymous like bookings):

```
UPDATE workshop_registrations
SET payment_status = 'paid', status = 'confirmed'
WHERE id = :registration_id AND payment_status = 'pending'
RETURNING name, email, phone, note, workshop_id
```

The `.eq("payment_status", "pending")` guard plus reading back the updated
row is the idempotency mechanism: a Stripe retry of the same event (or any
other re-delivery) updates zero rows the second time, so the notification
email fires exactly once regardless of how many times the webhook is
called. Retries are automatic on Stripe's side — if this handler throws
(e.g. the DB is briefly unreachable), the function returns a non-2xx status
and Stripe retries the event later on its own schedule; nothing needs to
run manually to recover.

On success, it looks up the workshop title and calls the existing
`notify-inquiry` function server-to-server (service-role key), with
`type: 'registration'` — the same admin notification email the old manual
flow used, just now triggered by payment instead of by form submission.
`notify-inquiry` itself is unchanged and, per its own code, always responds
200 even if the email send fails internally — so an email outage never
turns into a failed webhook or a retried payment confirmation.

`checkout.session.expired` (fires ~1h after checkout starts if unpaid) gained
a matching branch that sets `payment_status = 'expired'`, guarded the same
way (`.eq("payment_status", "pending")`) so a late expiry event can never
overwrite an already-paid row.

The success page (`/workshopy/success`, `WorkshopRegistrationSuccess.tsx`)
only **reads** — it does not activate anything and has no fallback
write path like `verify-checkout` has for memberships. It looks up the
registration by `stripe_session_id` (public read, see RLS below) and polls
up to 3 times (2s/4s/6s) while `payment_status` is still `'pending'`, purely
so the common case (webhook already ran by the time Stripe redirects back)
shows "Paid" instantly instead of a needless spinner. If a visitor closes
the tab right after paying, before this page even loads, the registration
is still confirmed and the email still sent — the webhook doesn't depend on
this page running at all.

### Duplicates

- **Webhook retried / success page refreshed** — the `.eq("payment_status",
  "pending")` guard in the webhook update makes the paid-transition and the
  email idempotent (see above). The success page never writes, only reads,
  so refreshing it is always safe.
- **Double form submission** — the submit button disables synchronously
  (`setSubmitting(true)` is the first line of the handler, existing pattern
  already used elsewhere in this codebase) before the network call starts.
  A genuine double-click could in theory still create two `pending`
  registration rows with two separate Stripe sessions before Stripe
  processes either — but only a completed payment ever flips a row to
  `paid`, so at worst this leaves one harmless extra `pending` row, never
  two paid ones or two emails.
- **Unique index** on `stripe_session_id` (partial, `WHERE stripe_session_id
  IS NOT NULL`) prevents two registration rows from ever being linked to the
  same Stripe session.

### What happens on DB or webhook outage

- **DB unreachable during `workshop-registration-create`'s price lookup**:
  fail-closed, 400, no Stripe session created, no charge possible. Same
  message as `create-checkout`: "Registration is temporarily unavailable.
  Please try again in a moment."
- **DB unreachable when inserting the registration row**: 400, no Stripe
  session created (checked before the Stripe call).
- **Stripe API error creating the session**: 400 returned to the browser;
  the registration row is left `pending` with no `stripe_session_id` — a
  harmless orphan, structurally identical to what already happens today if
  `booking-create`'s Stripe call fails. It never becomes visible as paid.
- **`stripe_session_id` update fails after the Stripe session was created
  successfully**: payment can still proceed (Stripe already has the
  session), the webhook still confirms it via `workshop_registration_id` in
  the metadata — only the anonymous success-page lookup by
  `stripe_session_id` would fail to find the row, a display-only fallback,
  not the confirmation path.
- **Webhook throws / DB down when processing `checkout.session.completed`**:
  function returns non-2xx, Stripe retries automatically on its own
  schedule (standard Stripe behavior, unchanged from the existing webhook).
  The idempotency guard means a retry that finally succeeds is safe.
- **`notify-inquiry` down or Brevo failing**: payment confirmation
  (`payment_status = 'paid'`) is unaffected — the email call happens after
  the DB update, and `notifyWorkshopRegistrationPaid` catches and only logs.
  Silvie's notification is delayed/lost in this case; the registration
  itself is not.

## Migrations (apply in this order)

1. `20260815130000_add_workshop_payment_status.sql` — adds
   `payment_status` (check constraint `pending|paid|expired`, default
   `pending`) and `stripe_session_id` to `workshop_registrations`; backfills
   historical rows (`status IN ('paid','confirmed')` → `payment_status =
   'paid'`, judgment call — there's no better signal for pre-Stripe rows);
   unique partial index on `stripe_session_id`; index on `payment_status`;
   new anonymous SELECT policy (`stripe_session_id IS NOT NULL`), mirroring
   the existing `session_bookings` policy from
   `20260128000000_booking_system.sql` — a row becomes publicly readable
   only once it's linked to a Stripe session, i.e. once its exact id/session
   id has already been handed to that one visitor via the redirect URL.
2. `20260815140000_seed_cms_workshop_stripe_checkout.sql` — 3 new CMS keys
   for `WorkshopRegistration.tsx` (security note, cancelled-payment notice,
   payment-error message).
3. `20260815140100_seed_cms_workshop_registration_success.sql` — new page
   `workshop-registration-success` (`cms_sections` + `cms_content`) for
   `/workshopy/success`.

## New/changed functions (deploy in this order, after migrations)

1. `create-checkout` — `?diagnose=1` now also returns every paid, published
   workshop as `{ tier_key: "workshop:<slug>", unit_amount, currency }`
   alongside tiers/hubs, so an admin can verify all three price sources from
   one call.
2. `workshop-registration-create` — new function, see architecture above.
3. `stripe-webhook` — new `workshop_registration_id` branches in
   `checkout.session.completed` and `checkout.session.expired`, plus the
   `notifyWorkshopRegistrationPaid` helper.

`booking-stripe-webhook` and `verify-checkout` are untouched — they only
handle bookings and memberships respectively and have no workshop logic.

## Verifying without a real payment

Stripe is live — do not click the "Register" button in a browser against
production. Verify instead with:

1. **Read the code.** `workshop-registration-create`'s `loadWorkshopConfig`
   is the only place that decides the charge amount — confirm it always
   reads `workshop_price`/`workshop_currency` from `blog_posts` and returns
   `null` (→ 400, no session) on any error or missing/unpublished/non-paid
   row, and that `expectedPriceEur` is compared before the Stripe call.
2. **`GET /functions/v1/create-checkout?diagnose=1`** as an admin (existing
   auth flow — log in as admin, GET with the user's bearer token). Confirms
   the DB→cents mapping for every currently paid+published workshop
   (`tier_key: "workshop:<slug>"`) without creating anything.
3. **Read-only DB check**: `SELECT id, slug, workshop_price,
   workshop_currency, is_paid_workshop, is_published FROM blog_posts WHERE
   category = 'workshop'` — confirms exactly which workshops
   `workshop-registration-create` will accept and at what price, independent
   of the diagnose endpoint.
4. **RLS check**: as an anonymous/anon-key client, `SELECT * FROM
   workshop_registrations WHERE id = '<some existing pending row>'` should
   return nothing (no `stripe_session_id` yet); a row that does have a
   `stripe_session_id` should be readable — confirms the new policy behaves
   as intended without needing an actual checkout.
5. Do **not** call `workshop-registration-create` with real data outside of
   a test/staging Stripe key — it always creates a live Checkout session on
   success.

## Orphaned / no longer used

- **CMS keys** (left in `cms_content`, not deleted, per instructions):
  - `workshopform_reg_success_title`, `_success_text_pre`,
    `_success_text_post`, `_qr_pay_label`, `_qr_caption`, `_qr_title`,
    `_qr_scan_caption` (from `20260814122000_seed_cms_workshop_registration.sql`)
    — the inline post-submit "you're registered" panel with the embedded QR
    code no longer renders; its content moved to the new
    `/workshopy/success` page under different keys.
  - `workshopform_reg_qr_missing_name_title`, `_qr_missing_name_text`,
    `_qr_iban_label`, `_qr_amount_label`, `_qr_message_label` (from
    `20260815120000_seed_cms_qr_fallback_texts.sql`) — the "QR code isn't
    ready, here are the bank details" fallback no longer renders; there's no
    QR code to fall back from anymore.
  - The `cms_sections` row for `('workshop-registration', 'qr', ...)` (from
    the same migration) is now an empty section — no `cms_content` rows
    reference `section = 'qr'` anymore.
  - `workshopform_reg_form_submit_loading` and `_form_submit_prefix` are
    **still used** (button's loading/idle label) — not orphaned, just
    reused with the same meaning.
- **`src/lib/paymentQr.ts`** (`generateSpayd`, `generateEpcQr`,
  `shouldUseEpc`) — no longer imported anywhere in `src/`. Not deleted, per
  instructions (`shouldUseEpc` was also used by `AdminBlog.tsx` until this
  change removed that usage too).
- **`qrcode.react` dependency** (`package.json`) — no longer imported
  anywhere in `src/`. Not removed.
- **`blog_posts.payment_iban`, `.payment_message`,
  `.payment_beneficiary_name`** — columns and existing data untouched. The
  admin form fields for them in `AdminBlog.tsx` are now hidden (removed from
  the JSX) but the underlying `formData` state and save payload still
  round-trip whatever value is already in the DB, so no data is lost or
  silently cleared on the next save of an existing paid workshop.

## What to click through

1. **Admin → Blog → Workshopy**: open an existing paid workshop. Confirm
   the IBAN/payment message/beneficiary name fields are gone from the form,
   price/currency are still there, and saving still works.
2. **Admin → Inquiries → Registrations tab**: confirm the new **Payment**
   column appears (will show "Awaiting payment" or "Paid" for existing rows
   per the migration's backfill) alongside the existing **Status** column,
   and the detail dialog shows both.
3. Once functions are deployed, a real (or Stripe test-mode, if you switch
   keys) checkout end-to-end: submit the workshop form → redirected to
   Stripe → pay → redirected to `/workshopy/success` → registration shows
   "You're Registered!" and the Payment badge in admin flips to "Paid" →
   confirmation email arrives via `notify-inquiry`.
4. Cancel a checkout instead of paying → redirected back to the workshop
   page with the "Payment was cancelled" notice above the form.

## Build status

`npx tsc --noEmit` and `npm run build` both pass. No Stripe Checkout session
was created at any point while implementing or verifying this — all
verification was done by reading the code and (for the reviewer, not run
here) the admin-only `?diagnose=1` endpoint. Fail-closed is intact
throughout: every price/config lookup that can fail refuses the
registration/checkout rather than falling back to a request- or code-supplied
amount.
