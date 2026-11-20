# ABBASIA.SHOP — Release and Deployment

## Architecture
- Web: Next.js App Router + TypeScript.
- Data: Supabase PostgreSQL through Prisma 7.
- Identity: Supabase Auth; passwords remain managed by Supabase.
- Product images: Supabase Storage (`product-images`).
- Mobile: Expo / React Native in `mobile/`, sharing Supabase Auth and the web API.
- Initial payment: Cash on Delivery (XAF). Mobile Money needs a payment-provider contract and credentials.

## Preserve the existing database
This delivery does not reset, truncate, or recreate your Supabase database. Keep existing `.env` and `.env.local`. Never run `prisma migrate reset` against production.

Before applying a future migration: take a Supabase backup, review the SQL, apply reviewed migrations with `npx prisma migrate deploy`, then run `npx prisma generate`.

## Required web environment
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

`.env.example` contains placeholders only. Do not replace your existing environment files with it.

## Local Windows setup
```powershell
cd D:\DESTROX\Projects\abbasia-market
npm ci
npx prisma generate
npx prisma migrate status
npx tsc --noEmit
npm run dev
```
Open `http://localhost:3000`.

## Production deployment
1. Push the web project to a private Git repository.
2. Import it into Vercel.
3. Configure all four environment variables in Vercel.
4. Use build command `npx prisma generate && npm run build`.
5. Apply reviewed migrations from a trusted environment with `npx prisma migrate deploy`.
6. Verify `/api/health/db`, sign-in, catalogue, cart, checkout, seller workspace, admin workspace, notifications and tracking.

## Supabase Storage
Confirm a `product-images` bucket exists and review its policies. Public product image URLs are expected by the storefront; uploads must remain restricted to authenticated approved sellers and administrators.

## Android and iOS
See `mobile/README.md`. Copy `mobile/.env.example` to `mobile/.env`; set the deployed API URL and the same Supabase URL/publishable key. Use EAS Build to create signed platform builds. Apple Developer and Google Play Console accounts are required for store distribution.

## Pre-launch checklist
- [ ] Verify Supabase Auth email confirmation and password recovery URLs.
- [ ] Verify admin routes enforce roles on the server.
- [ ] Verify seller approval and product moderation.
- [ ] Verify stock cannot become negative under concurrent checkout.
- [ ] Verify delivery assignment and customer tracking.
- [ ] Configure backups, monitoring, privacy policy, terms, returns policy and customer support.
- [ ] Configure a payment gateway only after provider onboarding and server-side webhook verification.
- [ ] Confirm company details, taxes, delivery coverage and seller agreements for Chad.
- [ ] Build and test Android/iOS binaries on real devices before store submission.

## Release limitations
The mobile folder is application source, not signed APK/IPA files. Native builds, signing, store credentials, push-notification credentials and final device QA remain release steps. Cash on Delivery is the only payment method enabled in this release.
