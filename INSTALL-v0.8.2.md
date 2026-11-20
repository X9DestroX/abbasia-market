# ABBASIA.SHOP v0.8.2 — Core marketplace patch

## Included
- Homepage cart badge reads persistent `abbasia-cart` localStorage data.
- Product Add buttons save product identity, price, image, seller, quantity and demo flag.
- Header cart and account icons navigate to `/cart` and `/account`.
- Cart changes dispatch a same-tab update event.
- Authenticated `POST /api/orders` creates an order, seller orders, COD payment, stock movements, customer notification and audit record in one serializable transaction.
- Account header exposes the notifications page.

## Install
Merge the `src/` folder into the existing project. Do not replace `.env`, `.env.local`, `.git`, `node_modules`, `.next`, or your existing Prisma migrations.

No schema changes or migration are included.

Run:
```powershell
npx prisma generate
npx tsc --noEmit
npm run dev
```

## Important
- Demo products remain non-orderable.
- The order endpoint verifies the authenticated Supabase user and re-reads product prices and stock from PostgreSQL; it does not trust client-submitted prices.
- The endpoint decrements stock and records inventory movements transactionally.
- This patch does not migrate historical orders between user accounts.
