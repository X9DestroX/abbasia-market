# ABBASIA.SHOP — Seller onboarding setup

## Included
- Customer account link to apply as a seller.
- French/Arabic seller application form.
- Authenticated seller application API with server-side validation.
- Admin-only pending application review page and approve/reject endpoint.
- Seller profile creation and role promotion in one database transaction after approval.
- Seller dashboard with product/order summary and recent seller orders.

## 1. Install and generate

```powershell
npm install
npx prisma generate
npx prisma validate
```

## 2. Apply the database migration

```powershell
npx prisma migrate dev --name seller_onboarding
```

This adds the `SellerApplication` table and `SellerApplicationStatus` enum. It does not reset existing tables or records.

## 3. Promote your own account to the first super administrator

After confirming your own registered account email, run this in Supabase SQL Editor, replacing the placeholder with that exact email:

```sql
UPDATE public."User"
SET "role" = 'SUPER_ADMIN'
WHERE "email" = 'YOUR_REGISTERED_EMAIL';

SELECT "id", "email", "role"
FROM public."User"
WHERE "email" = 'YOUR_REGISTERED_EMAIL';
```

Only do this for an account you control. Do not expose or accept admin role changes from the public registration form.

## 4. Routes

- Customer seller application: `/seller/apply`
- Approved seller dashboard: `/seller`
- Admin application review: `/admin/sellers`

The review page and decision API both check the authenticated user's database role (`ADMIN` or `SUPER_ADMIN`). A customer cannot approve their own application.

## 5. Verify

```powershell
npx tsc --noEmit
npm run dev
```

Test with a normal customer account first: submit an application, then sign in using the separately promoted super-admin account and approve it at `/admin/sellers`. The applicant's role changes to `SELLER` only after approval.
