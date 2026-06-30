# CSS HQ — Premium CSS Exam Notes Marketplace

A market-ready, Vercel-deployable platform for selling premium CSS exam notes digitally. Built by Ali Ihsan.

## Features

- **12 CSS subjects** (6 compulsory + 6 optional) with full notes, MCQ banks, model answers, past papers
- **Browse flow**: Compulsory / Optional tabs → subject detail → add to cart
- **3 bundle options**: Compulsory (6,000 PKR), Optional (6,000 PKR), Full (11,000 PKR, launch price 8,999 PKR)
- **Per-subject purchase**: 1,500 PKR each
- **Local payments**: JazzCash, EasyPaisa, NayaPay, SadaPay, Payoneer (manual verification)
- **Student dashboard**: purchased notes, order history, in-browser PDF viewer
- **Admin panel**: order review + approve/reject, subject management, PDF upload, payment settings
- **Email notifications** (Resend): admin gets notified on new order, student gets notified on approval/rejection
- **Protected PDFs**: download route verifies purchase before serving bytes
- **Dark mode**, mobile-first responsive, sticky footer, WhatsApp FAB

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS 4 + shadcn/ui (New York)
- Prisma ORM (SQLite for dev, Neon Postgres for production)
- NextAuth.js v4 (credentials provider)
- Vercel Blob (PDF storage) with local /public/uploads fallback for dev
- Resend (transactional email)
- Zustand (cart state) + TanStack Query (server state)

## Local development

```bash
bun install
bun run db:push        # create SQLite schema
bun run scripts/seed.ts        # seed 12 subjects + admin user + settings
bun run scripts/generate-pdfs.ts  # generate placeholder PDFs
bun run dev            # start dev server on http://localhost:3000
```

### Admin login (dev)
- Email: `aliihsan.devs@gmail.com`
- Password: `admin12345`
- **Change this password immediately after first login in production!**

## Deploy to Vercel (free tier)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "CSS HQ — initial release"
git branch -M main
git remote add origin https://github.com/<your-username>/css-hq.git
git push -u origin main
```

### Step 2 — Create free accounts (5 minutes total)
1. **[Neon](https://neon.tech)** — free Postgres database
   - Create a project, copy the `DATABASE_URL` (it looks like `postgresql://...`)
2. **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** — free 1GB file storage
   - On Vercel: go to your project → Storage → Create Blob Store → copy the `BLOB_READ_WRITE_TOKEN`
3. **[Resend](https://resend.com)** — free email (3,000/month)
   - Sign up, add & verify your sending domain (or use `onboarding@resend.dev` for testing)
   - Copy your `RESEND_API_KEY`

### Step 3 — Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework preset: **Next.js** (auto-detected)
4. Add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...` (from Neon) |
| `BLOB_READ_WRITE_TOKEN` | (from Vercel Blob) |
| `NEXTAUTH_SECRET` | generate with `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` (your Vercel URL) |
| `RESEND_API_KEY` | (from Resend) |
| `RESEND_FROM_EMAIL` | `CSS HQ <notes@yourdomain.com>` (or `onboarding@resend.dev` for testing) |

5. Click **Deploy**. Vercel builds and deploys in ~2 minutes.

### Step 4 — Initialize the production database
After deploy, run the seed script against your production DB once:

```bash
# Set DATABASE_URL to your Neon URL temporarily, or run via Vercel CLI:
bun run scripts/seed.ts
bun run scripts/generate-pdfs.ts
```

Or use `prisma studio` to manage data via UI:
```bash
DATABASE_URL="postgresql://..." npx prisma studio
```

### Step 5 — Configure your real payment account numbers
1. Sign in as admin (`aliihsan.devs@gmail.com` / your new password)
2. Go to **/admin/settings**
3. Replace the `0300-XXXXXXX` placeholders with your real JazzCash/EasyPaisa/NayaPay/SadaPay/Payoneer accounts
4. Save — changes go live immediately

### Step 6 — Upload your real PDFs
1. Go to **/admin/subjects**
2. Click **Manage** on any subject
3. Delete the placeholder PDF
4. Upload your real notes PDF (drag & drop, up to 25MB each)
5. Repeat for all 12 subjects

### Optional — Custom domain
On Vercel: Project Settings → Domains → add `csshq.com` (or whatever you own). Vercel handles SSL automatically. Free.

## Production checklist

- [ ] Change admin password (sign in → sign out → use forgot password flow, or directly update DB)
- [ ] Update payment account numbers in `/admin/settings`
- [ ] Replace placeholder PDFs with real notes via `/admin/subjects`
- [ ] Verify `NEXTAUTH_URL` matches your production domain
- [ ] Verify Resend sending domain is approved
- [ ] Test a full purchase flow end-to-end with a real (small) payment
- [ ] Add Google Analytics or Vercel Analytics (optional)
- [ ] Add `robots.txt` / sitemap (optional)

## How the payment flow works

Since JazzCash/EasyPaisa/NayaPay/SadaPay don't offer easy merchant APIs for individuals in Pakistan, CSS HQ uses the proven **manual verification model**:

1. Student picks subjects → checks out
2. Sees your account numbers + pays via their app
3. Uploads payment screenshot/receipt
4. You (admin) get an instant email + see the order in `/admin/orders`
5. You verify the money arrived in your app → click "Approve"
6. Student gets access instantly + an email notification

You keep 100% of the money (no gateway fees), and students trust this model because it's how most Pakistani digital sellers operate.

## File structure

```
prisma/schema.prisma              # DB schema (User, Subject, Order, Purchase, Setting, etc.)
scripts/seed.ts                   # Seeds 12 subjects + admin user + settings
scripts/generate-pdfs.ts          # Generates placeholder PDFs for each subject
src/lib/auth.ts                   # NextAuth config
src/lib/db.ts                     # Prisma client
src/lib/storage.ts                # Vercel Blob + local fallback
src/lib/settings.ts               # Settings cache + pricing helpers
src/lib/subjects.ts               # Subject queries
src/lib/email.ts                  # Resend email templates
src/lib/cart-store.ts             # Zustand cart store
src/app/api/                      # All API routes
src/app/(public)/                 # Landing, subjects, cart, checkout, login, signup
src/app/dashboard/                # Student dashboard + PDF viewer
src/app/admin/                    # Admin panel
src/components/                   # All UI components
```

## Support

- WhatsApp: +92 308 5202620
- Email: aliihsan.devs@gmail.com

---

Built with ❤️ for CSS aspirants, by a CSS aspirant.
