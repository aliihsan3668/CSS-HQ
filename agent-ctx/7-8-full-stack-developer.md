# Task 7-8 — full-stack-developer

Built `/subjects` (browse) and `/subjects/[slug]` (detail) pages for the CSS HQ marketplace.

## Files created
- `src/components/subjects/bundle-banner.tsx` — client bundle banner (Compulsory/Optional) with useCart + savings badge
- `src/components/subjects/full-bundle-hero.tsx` — client Full Bundle hero (launch vs standard price, strikethrough, save badge, add-to-cart id="bundle-full")
- `src/components/subjects/subject-buy-bar.tsx` — client "Add to cart" + "Buy now" (buy now → /checkout) with `hero` / `card` variants
- `src/app/subjects/page.tsx` — server component, force-dynamic. Header + counts + Full Bundle hero + Tabs(Compulsory/Optional) with subject grid + BundleBanner under each tab + bottom per-subject note
- `src/app/subjects/[slug]/page.tsx` — server component, force-dynamic, awaited params, notFound() on miss. Two-column layout: hero + What's included + stats grid + sample preview questions (likelihood badges) + long desc; sticky right pricing card + trust badges + WhatsApp link. JSON-LD Product schema.

## Smoke tests
- `/subjects` → 200
- `/subjects/current-affairs` → 200
- `/subjects/does-not-exist-xyz` → 404
- `bun run lint` — clean
- dev.log shows clean compiles, no errors/warnings

See `/home/z/my-project/worklog.md` (appended) for full work record.
