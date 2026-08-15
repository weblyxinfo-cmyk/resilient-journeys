# Workshop payments: optional Stripe Payment Link override

Adds a "bring your own Stripe Payment Link" escape hatch on top of the
built-in Stripe Checkout flow (`docs/workshop-stripe.md`). Silvie can now
paste a Payment Link created directly in the Stripe Dashboard
(`https://buy.stripe.com/...`) into a workshop, and set up its price herself
without a developer — at the cost of some of the guarantees the built-in
flow has. Read "What is lost" below before relying on this for a real
workshop.

## How the two paths are chosen

The decision is made **server-side**, in `workshop-registration-create`, by
reading `blog_posts.stripe_payment_link` for the workshop being registered
for — not by the browser's copy of the workshop object. Two reasons:

1. The browser's copy could be stale (cached page, old tab left open) —
   reading fresh from the DB at submit time is the same reasoning the
   existing `expectedPriceEur` check already uses for price.
2. It keeps `WorkshopRegistration.tsx` **unchanged**. The component already
   does `if (data?.checkout_url) window.location.href = data.checkout_url`
   after the registration call succeeds; the edge function now returns that
   same `checkout_url` field for both paths — either a real Stripe Checkout
   Session URL, or the payment link with tracking parameters appended. The
   component doesn't need to know or care which one it got.

Concretely, in `loadWorkshopConfig` (`workshop-registration-create/index.ts`):

- Empty/NULL `stripe_payment_link` → `stripePaymentLink: null` → behavior is
  byte-for-byte what it was before this change: Stripe Checkout Session
  created, `expectedPriceEur` enforced, `payment_status: 'pending'`.
- Non-empty and passes `isValidStripePaymentLink` → the registration row is
  still inserted first (so Silvie has a record even if the visitor never
  completes payment), then the function returns immediately with
  `checkout_url` = the payment link plus `?client_reference_id=<registration
  id>&prefilled_email=<email>` — no Stripe API call is made by this
  function in that branch at all.
- Non-empty but fails validation (shouldn't happen — AdminBlog.tsx validates
  on save — but the column has no DB-level format constraint) → treated as
  if the field were empty, logged, falls back to the built-in Checkout path.
  Never redirects anywhere on the strength of an unvalidated stored value.

## URL validation

Same allow-list, enforced in **two independent places**, both required
because either one alone would let a directly-edited DB row bypass it:

- `AdminBlog.tsx`, client-side, on save — blocks the form submit with a
  Czech error toast if the field is non-empty and invalid.
- `workshop-registration-create/index.ts`, server-side, on every
  registration — the value that actually decides where a visitor's browser
  goes, re-checked because the DB column has no format constraint of its
  own and could in theory hold something else.

Both use the identical rule: `https://` only, and hostname is exactly
`buy.stripe.com` or ends with `.stripe.com` (checked via `new URL(...).
hostname`, not string matching, so `buy.stripe.com.evil.com` or
`notstripe.com` are correctly rejected — only a real Stripe subdomain
passes).

## What is lost with an external link, and what isn't

The team lead's brief flagged two problems with a plain Stripe Payment
Link. Here's the actual outcome after this change:

### 1. "Webhook has nothing to match the registration to" — **solved**

Stripe Payment Links accept `client_reference_id` and `prefilled_email` as
URL query parameters and copy them onto the Checkout Session created when
someone pays through the link — this is what makes the matching below
possible at all. **Verification caveat:** this sandbox has no internet
access, so I could not open Stripe's live docs to double-check the exact
wording, and I'm not treating "I recall this" as good enough on its own —
see the character-set/length reasoning two paragraphs down for why the
implementation doesn't actually need to trust the exact documented limits.
If you want to confirm the mechanism itself before relying on this for a
real paid workshop, the fastest check is Stripe's own dashboard: open a test
Payment Link, append `?client_reference_id=test123` to it, complete a test
payment, and look at the resulting Checkout Session's `client_reference_id`
field in the Stripe Dashboard or via `stripe.checkout.sessions.retrieve`.

`workshop-registration-create` appends the new registration's own id as
`client_reference_id` **and overwrites** any `client_reference_id` /
`prefilled_email` the pasted link might already carry — it uses
`URLSearchParams.set()`, not `.append()`, specifically so a link someone
customized elsewhere can't end up with two conflicting values or, worse,
one Stripe keeps and ours getting silently dropped. `stripe-webhook` only
finds *our* id in `session.client_reference_id`, never the visitor's.

Registration ids are Postgres UUIDs: exactly 36 characters, always
lowercase hex digits and hyphens (`8-4-4-4-12` groups). That's a fixed,
narrow character set and a fixed, short length — so even without confirming
Stripe's exact undocumented limits, our specific values can't be the thing
that breaks (the brief's own guess of "alphanumeric + dash, ~200 chars" was
generous by roughly 5x on length alone).

`stripe-webhook` gained a new branch in `checkout.session.completed`,
placed right after the existing metadata-based `workshop_registration_id`
branch and before the membership branch: if `session.client_reference_id`
is set, it updates the matching `workshop_registrations` row
(`payment_status: 'external'` → `'paid'`, `status: 'confirmed'`, plus
`stripe_session_id` and the paid-amount fields below) using the exact same
`.eq("payment_status", "external")` guard-then-`select` idempotency pattern
the existing branches use, so retries/duplicate events are safe no-ops.

This confirmation is a normal Stripe webhook event fired directly by Stripe
to our endpoint — it does **not** depend on the visitor's browser ever
returning to resilientmind.io. So `payment_status` flipping to `'paid'` and
Silvie's notification email work automatically, the same as the built-in
flow, **without any manual Stripe Dashboard configuration**.

What isn't solved: if Silvie ever edits/regenerates the Payment Link so it
no longer matches what `stripe_payment_link` says (or types the URL by hand
elsewhere without the query params, e.g. shares it directly instead of
through the site), `client_reference_id` is never set, this branch never
fires, and the registration stays `'external'` forever — a manual check in
Stripe Dashboard is the only recovery. This is inherent to using someone
else's payment page, not something code can close off completely.

### 2. "Price can drift from what the web shows" — **can't prevent it, but it's no longer silent**

The Payment Link's price lives in Stripe's own configuration, entirely
outside `blog_posts.workshop_price`, and nothing in code can force those
two to match — `expectedPriceEur` is skipped when `stripe_payment_link` is
set (see `workshop-registration-create/index.ts`) because there is nothing
authoritative left to compare it against at *registration* time.

What's new: `stripe-webhook`'s `client_reference_id` branch now also writes
`paid_amount_cents`/`paid_currency` from `session.amount_total` /
`session.currency` — Stripe's own record of what was actually charged —
onto the registration row (migration
`20260815160000_add_workshop_registration_paid_amount.sql`). This is only
known *after* payment, so it can't stop a mismatched charge from happening,
but it does mean the mismatch is no longer invisible after the fact:
AdminInquiries.tsx now shows "Zaplaceno 25 € ≠ web 35 €" (in red) under the
Payment badge, comparing that actual charge to the workshop's *current*
`workshop_price` at page-load time, for every registration where this field
is set — which stays true even once `payment_status` reads `'paid'` the
same as any built-in-checkout row, so an external-link payment doesn't
blend back in once confirmed. The admin field's inline warning still tells
Silvie to keep the two numbers in sync by hand up front; this is the
after-the-fact safety net for when that doesn't happen.

### 3. New, minor: the success page may not be reached

`/workshopy/success` (`WorkshopRegistrationSuccess.tsx`, unchanged by this
work) looks up the registration by `?session_id=` in the URL. For the
built-in flow that page is reachable because we set `success_url` on the
Checkout Session ourselves. For a Payment Link, Stripe only redirects there
if Silvie manually configures the Payment Link's "After payment" redirect
in the Stripe Dashboard to
`https://www.resilientmind.io/workshopy/success?session_id={CHECKOUT_SESSION_ID}`.
Without that step, a visitor paying via the link simply never lands back on
our site (Stripe shows its own generic confirmation instead) — payment
confirmation and the email to Silvie still happen regardless, only the
visitor-facing confirmation page is affected. Even with that step
configured, if the webhook hasn't finished by the time the browser gets
back (a real possibility, since nothing throttles how fast Stripe redirects
vs. delivers the webhook), the success page will show "we couldn't find
your registration" once and not retry — unlike the built-in flow, where
`stripe_session_id` is already on the row before the redirect happens, so
the row is always found immediately and only `payment_status` needs
polling. Left as-is: fixing it would mean either giving the success page a
find-by-`client_reference_id` fallback or a longer polling window, and
that's more surface area than this narrow, Dashboard-config-dependent edge
case is worth touching right now.

## Where this shows up in the admin

**AdminBlog.tsx**, inside the existing "Paid Workshop" card, only when that
switch is on: a new "Platební odkaz ze Stripe (nepovinné)" text field, with
an explanatory line always shown below it, and a short amber warning that
only appears once the field has a value — covering both caveats above
(price sync, and that automatic confirmation, while it does work, is less
guaranteed than the built-in flow) without being alarming when the field is
empty (the default, most common state).

**AdminInquiries.tsx**: `payment_status = 'external'` gets its own badge —
amber, labeled "Verify manually" — next to the existing "Awaiting payment /
Paid / Expired". This is what actually lets Silvie *see* the distinction the
brief asked for: a registration sitting on "Verify manually" for a while is
the signal to go check Stripe by hand; one that flips to "Paid" confirmed
itself the same as any other. Underneath that badge (both the table and the
detail dialog), any registration with a recorded `paid_amount_cents` shows
the actual amount paid, in red with "≠ web ..." appended if it doesn't match
`workshop_price`.

## Migration (apply in this order, after `20260815140100`)

1. `20260815150000_add_workshop_stripe_payment_link.sql` — adds
   `blog_posts.stripe_payment_link TEXT` (nullable, no default — empty
   means "use the built-in checkout", per the brief) and extends
   `workshop_registrations.payment_status`'s check constraint from
   `pending|paid|expired` to also allow `external`. No backfill needed:
   every existing row's `payment_status` is already one of the first three
   values.
2. `20260815160000_add_workshop_registration_paid_amount.sql` — adds
   `workshop_registrations.paid_amount_cents` and `.paid_currency`, both
   nullable, no default. Only ever written by `stripe-webhook`'s
   `client_reference_id` branch; stays NULL for every built-in-checkout
   registration and for every external one that hasn't (yet, or ever) been
   matched by that branch.

## Deploy order (functions, after both migrations — not done here)

1. `workshop-registration-create` — reads/validates `stripe_payment_link`,
   branches before the Stripe API call.
2. `stripe-webhook` — new `client_reference_id` branch, now also capturing
   `paid_amount_cents`/`paid_currency`.

Neither function's existing behavior changes when `stripe_payment_link` is
NULL/empty — confirmed by reading the diff: every new branch is gated on
`workshop.stripePaymentLink` / `session.client_reference_id` /
`payment_status = 'external'` being truthy, none of which can happen unless
a workshop has the new field set. `create-checkout` and
`booking-stripe-webhook` are untouched.

## No new public-facing CMS text

The redirect is transparent to the visitor — same form, same "Register —
€X" button, same "Payment is secured by Stripe. You'll be redirected to
complete your purchase by card." note (`workshopform_reg_security_note`),
which is accurate for a Stripe Payment Link too. No new
`workshopform_reg_*` keys were needed, so there's no CMS seed migration in
this change. `AdminBlog.tsx`'s new field/labels are plain hardcoded admin
UI strings, same convention as the existing "Paid Workshop" / "Price" /
"Currency" labels in that file — not CMS-driven, matching how the rest of
that admin form already works.

## What works automatically vs. what doesn't (summary)

**Works automatically, no manual step required:**
- Registration is saved the moment the visitor submits the form, for both
  paths.
- Confirmation of an external-link payment (`payment_status: 'external' →
  'paid'`, `status → 'confirmed'`) and Silvie's notification email — driven
  by Stripe's own webhook, independent of whether the visitor's browser
  ever returns to the site.
- Recording what was actually charged (`paid_amount_cents`/`paid_currency`)
  and flagging a mismatch against `workshop_price` in AdminInquiries.tsx.
- URL validation (`https://` + Stripe domain), both on save in the admin
  and again at registration time.
- Overwriting any `client_reference_id`/`prefilled_email` already present
  in a pasted link, so ours is always the one Stripe reports back.

**Does NOT work automatically / needs a manual step or a manual check:**
- Keeping `workshop_price` in sync with the Payment Link's actual Stripe
  price — nothing enforces this; the admin warning and the after-the-fact
  mismatch badge are the only safeguards.
- Landing the visitor on `/workshopy/success` after paying via the link —
  requires Silvie to configure the Payment Link's "After payment" redirect
  in the Stripe Dashboard by hand; without it the visitor sees Stripe's own
  generic confirmation instead (payment confirmation itself is unaffected).
- Recovering a registration that never matched (link shared/used without
  the `client_reference_id` parameter) — stays `'external'` forever;
  Stripe Dashboard is the only way to check it.

## Build status

`npx tsc --noEmit` and `npm run build` both pass. No Stripe session or
Checkout Session was created at any point implementing or verifying this,
and nothing was deployed or run against the production database — the
migration exists only as a file, and both edge functions were only edited
and read, never invoked.
