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
URL query parameters (documented Stripe behavior) and copy them onto the
Checkout Session created when someone pays through the link.
`workshop-registration-create` appends the new registration's own id as
`client_reference_id` before redirecting. `stripe-webhook` gained a new
branch in `checkout.session.completed`, placed right after the existing
metadata-based `workshop_registration_id` branch and before the membership
branch: if `session.client_reference_id` is set, it updates the matching
`workshop_registrations` row (`payment_status: 'external'` →
`'paid'`, `status: 'confirmed'`, and now also stores `stripe_session_id`)
using the exact same `.eq("payment_status", "external")` guard-then-`select`
idempotency pattern the existing branches use, so retries/duplicate events
are safe no-ops.

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

### 2. "Price can drift from what the web shows" — **not solved, documented**

The Payment Link's price lives in Stripe's own configuration, entirely
outside `blog_posts.workshop_price`. `expectedPriceEur` is skipped when
`stripe_payment_link` is set (see `workshop-registration-create/index.ts`)
because there is nothing authoritative left to compare it against — the
price the visitor sees on the workshop page is just whatever
`workshop_price` says, independent of the real charge. The admin field's
inline warning tells Silvie to keep both numbers in sync by hand; nothing
in code enforces it, because there's no way to read a Payment Link's price
back from its public URL.

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
itself the same as any other.

## Migration (apply in this order, after `20260815140100`)

1. `20260815150000_add_workshop_stripe_payment_link.sql` — adds
   `blog_posts.stripe_payment_link TEXT` (nullable, no default — empty
   means "use the built-in checkout", per the brief) and extends
   `workshop_registrations.payment_status`'s check constraint from
   `pending|paid|expired` to also allow `external`. No backfill needed:
   every existing row's `payment_status` is already one of the first three
   values.

## Deploy order (functions, after the migration — not done here)

1. `workshop-registration-create` — reads/validates `stripe_payment_link`,
   branches before the Stripe API call.
2. `stripe-webhook` — new `client_reference_id` branch.

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

## Build status

`npx tsc --noEmit` and `npm run build` both pass. No Stripe session or
Checkout Session was created at any point implementing or verifying this,
and nothing was deployed or run against the production database — the
migration exists only as a file, and both edge functions were only edited
and read, never invoked.
