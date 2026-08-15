# Inquiry / registration email notifications

## Problem

`workshop_inquiries` (filled by `WorkshopInquiryForm.tsx`) and
`workshop_registrations` (filled by `WorkshopRegistration.tsx`) only ever got
written to the DB. No trigger, no edge function call, no email — the form
promises "I'll respond within 24–48 hours" but nothing tells the site owner a
new row exists. She only finds out by opening `/admin?tab=inquiries`.

## How this project sends email (existing pattern)

All transactional email goes through **Brevo's transactional email API**
(`POST https://api.brevo.com/v3/smtp/email`), called directly with `fetch`
from inside Deno edge functions — see `supabase/functions/send-free-guide/index.ts`,
`supabase/functions/send-membership-confirmation/index.ts`, and the inline
`sendMembershipEmail` in `supabase/functions/verify-checkout/index.ts`. There is
no shared email helper module; each function inlines its own HTML template and
Brevo call. Sender is always `contact@resilientmind.io`. The only secret
needed is `BREVO_API_KEY` (already configured, since the other functions
depend on it). I reused this exact pattern — no new provider, no new secret.

DB access from an edge function (when needed) uses
`createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)` — see
`supabase/functions/verify-checkout/index.ts:80-83`.

## What I built

**`supabase/functions/notify-inquiry/index.ts`** (new file, not deployed).

- Accepts `{ type: "inquiry" | "registration", name, email, workshopTitle?, company?, groupSize?, message?, phone?, note? }`.
- **Recipient is never taken from the request.** It reads `cms_content` where
  `key = 'shared_contact_email'` (the same key `Footer.tsx` already reads
  client-side via `useCms`) using a service-role client
  (`notify-inquiry/index.ts:150-166`). If the query fails or returns no value,
  it falls back to the hardcoded constant `FALLBACK_CONTACT_EMAIL =
  "contact@resilientmind.io"` (`notify-inquiry/index.ts:14`) — the lookup
  failing can't lose the notification.
- **Reply-To is set to the inquirer's own email/name**
  (`notify-inquiry/index.ts:183`), so she can hit "reply" in her mail client
  and answer directly — this was the main ask.
- Subject: `New Workshop Inquiry — <name>` or `New Workshop Registration —
  <name>` (`notify-inquiry/index.ts:36`). Body lists every filled field
  (blank/null fields are dropped, not shown as empty rows) plus a button
  linking to `https://www.resilientmind.io/admin?tab=inquiries`
  (verified this is the correct admin tab path — `Admin.tsx` reads the open
  tab from the `?tab=` query param and `AdminInquiries` is mounted under
  `value="inquiries"`).
- All copy is in English, matching the rest of the site's transactional email
  (same reasoning as the English deviation noted in `docs/qr-payment-fix.md`).
- HTML-escapes every field value before interpolating it into the email body
  (`escapeHtml`, `notify-inquiry/index.ts:24-29`) so a message like
  `<script>` in a user-submitted field can't break the HTML.
- **Always returns HTTP 200** with `{ success: false, error }` on any failure
  (missing `BREVO_API_KEY`, Brevo API error, etc.) — same convention as the
  other functions in this repo (e.g. `brevo-add-contact/index.ts:94-98`).

## Forms wired up

Checked every form that inserts into a public-facing table
(`grep -rln "insert(" src/components src/pages`). Two had the exact same gap
and are now both fixed; one more is a pre-existing separate gap I left alone
(see "Out of scope" below).

1. **`WorkshopInquiryForm.tsx:47-64`** — after the successful `insert` into
   `workshop_inquiries`, calls
   `supabase.functions.invoke('notify-inquiry', { body: { type: 'inquiry', ... } })`.
2. **`WorkshopRegistration.tsx:83-97`** — after the successful `insert` into
   `workshop_registrations`, calls the same function with `type: 'registration'`
   (includes `phone`/`note` instead of `company`/`groupSize`/`message`). This
   one matters at least as much as the inquiry form — it's a paid booking.

In both places the `.invoke(...)` call is **not awaited into the try/catch
that controls the success UI** — it's fired with `.catch()` only, after
`setSubmitted(true)` already ran. If Brevo is down or the function throws, the
form still shows its success screen and the DB row is already saved; only
`console.error(...)` records the failure. This satisfies the "email failure
must not shows an error to the visitor" requirement.

## Duplicates / abuse

- **Double-submit protection already existed**: both forms disable their
  submit button while `submitting` is `true` (`disabled={submitting}`), so a
  user can't fire two notification emails from one click/double-click. A
  genuine second form submission is a second, distinct inquiry/registration
  and *should* generate its own notification — that's correct behavior, not a
  duplicate.
- **No open relay**: the function takes no recipient field from the caller at
  all — only `cms_content.shared_contact_email` or the hardcoded fallback are
  ever used as `to`. A malicious caller of the function can only control what
  appears in the email *body* (already HTML-escaped) and the `Reply-To`
  (their own address — harmless, that's the whole point of Reply-To).

## Out of scope (flagged, not touched)

`BookingForm.tsx` (`src/components/booking/BookingForm.tsx:118-119`) inserts
directly into `session_bookings` (1:1 coaching session booking) with the same
"no email sent" gap — `booking-create/index.ts` even has a `// TODO: Send
confirmation email` at line 267, but `BookingForm.tsx` doesn't call that
function at all; it inserts into the table directly. This is a materially
different, bigger flow (coach calendar/availability, its own edge function
already half-built for it) and touches the booking system the task
explicitly said not to touch (`booking_cards`, `create-checkout`). I left it
alone and am flagging it here for a separate task.

## Secrets required

Same as the rest of the project — no new ones:

- `BREVO_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

(All three are already set for the other functions in this project, since
`verify-checkout` and `stripe-webhook` already use the service-role client.)

## What happens on failure

- `notify-inquiry` itself never returns a non-200 status; any internal error
  is caught and logged with `console.error`, and the function still responds
  `{ success: false, error }` with status 200.
- The calling forms only `.catch()` the invoke call and `console.error` —
  they never touch `submitting`/`toast`/`setSubmitted`, all of which already
  ran before the notification call. The user-visible outcome (DB row saved,
  success screen shown) is identical whether or not the email goes out.

## How to test safely (no deploy, no real email to the client)

Deno isn't installed in this environment, so I couldn't run
`supabase functions serve` here. Recommended verification, in order of
increasing realism, none of which touches production:

1. **Local dry run** (`supabase start` + `supabase functions serve
   notify-inquiry --env-file supabase/.env.local`) with a **test Brevo
   sandbox key or your own inbox** as `to` — temporarily point
   `cms_content.shared_contact_email` at your own test address in a local DB,
   never in production, then submit `WorkshopInquiryForm` / `WorkshopRegistration`
   against `localhost`.
2. **curl the function directly** once deployed to a preview/staging Supabase
   project (not production):
   ```bash
   curl -i -X POST "$SUPABASE_URL/functions/v1/notify-inquiry" \
     -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{"type":"inquiry","name":"Test User","email":"you@yourdomain.com","message":"test"}'
   ```
   Check the response body for `success: true` and a `messageId`, and confirm
   the email lands in **your own inbox**, not the client's.
3. Verified statically instead (no deploy available in this session): ran the
   pure templating logic (`buildEmail`/`escapeHtml`) outside Deno with sample
   inquiry and registration payloads — subject lines, field-row generation,
   and HTML-escaping of a `<script>`-containing field all produced the
   expected output.
4. `npx tsc --noEmit` and `npm run build` both pass (frontend changes only;
   the edge function is plain Deno/TS and isn't part of the Vite/tsc build
   graph, consistent with the other `supabase/functions/*`).

I did **not** deploy the function and did **not** send any email to
`contact@resilientmind.io` or any other real address.
