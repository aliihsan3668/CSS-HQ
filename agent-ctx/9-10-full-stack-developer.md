# Task 9-10 — /cart and /checkout pages

## Goal
Build the cart page, the checkout page (single-page multi-section), and a public `/api/payment-methods` endpoint that exposes payment account/title text safely to buyers.

## Files created
- `src/app/api/payment-methods/route.ts` — public GET endpoint
- `src/app/cart/page.tsx` — full cart page
- `src/app/checkout/page.tsx` — single-page checkout with auth gate

## Key implementation notes
- Cart page derives bundle-suggestion pricing from the per-subject price embedded in cart items (defaults: 1500 per subject, 6000/6000/11000/8999 bundles). Avoids needing an extra pricing fetch on a client-only page.
- Cart suggestions logic:
  - If user has ≥1 compulsory subject but no compulsory/full bundle → suggest Compulsory Bundle.
  - Same for optional.
  - If fewer than 12 subjects covered and no full bundle → suggest Full Bundle (gold accent, launch pricing applied by default).
- Checkout auth gate uses `useSession()` + `router.replace("/login?callbackUrl=/checkout")`. While `status === "loading"` shows spinner.
- Checkout fetches `/api/payment-methods` to populate radio cards. Each card shows account (with copy button), title, and per-method instructions.
- Receipt upload supports images + PDF up to 5MB. Uses `FileReader.readAsDataURL` to convert to a data URL. Image preview shown for images, PDF icon for PDFs.
- Submit posts `{ items, paymentMethod, paymentNotes, receiptDataUrl, receiptFilename }` to `/api/checkout`. On success: clears cart, toasts "Order submitted! Awaiting verification.", redirects to `/dashboard/orders/{orderId}`.
- Mobile: sticky bottom bar with total + submit button. Desktop: inline submit at the bottom of the main column + sticky sidebar with summary/support/trust badges.

## Verification
- `bun run lint` → 0 errors, 0 warnings (after removing one unused eslint-disable).
- `curl /cart` → 200
- `curl /checkout` → 307 (redirect to /login when unauthenticated — expected)
- `curl /api/payment-methods` → 200 with proper JSON containing all 5 methods, accounts, titles, instructions.

## Conventions followed
- `bg-brand-gradient` for primary CTAs, `bg-gold-gradient` for full-bundle highlight.
- Consistent with established Card/ring patterns from other pages (border-0 ring-1 ring-border).
- framer-motion for subtle entrance animations.
- Sonner `toast` for notifications (already wired in root layout).
- shadcn RadioGroup, Card, Button, Badge, Separator, Skeleton, Textarea, Label all used.
