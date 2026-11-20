# ABBASIA.SHOP Order Management v0.5

## Added
- Customer orders page: `/account/orders`
- Seller order workflow: `/seller/orders`
- Admin order monitoring: `/admin/orders`
- API endpoint `/api/orders` (GET and PATCH) with role-aware access control
- Customer cancellation only while parent order is PENDING
- Seller-specific order status transitions: PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED (seller can cancel PENDING/CONFIRMED)
- Admin status control and COD payment recording action
- Audit log entries for status/payment actions
- Links from seller dashboard and seller-application admin page

## Install
This update adds no database schema changes and no migration is required. Preserve `.env` and `.env.local`.

Run:
```powershell
npx tsc --noEmit
npm run dev
```

## Routes
- Customer: `/account/orders`
- Seller: `/seller/orders`
- Admin: `/admin/orders`

## Important
The latest supplied ZIP was used as the source. This package adds order-management screens and actions to the existing schema. It does not include checkout/cart files if they are absent from the supplied ZIP; retain the separately installed working checkout version in your local project when merging, or verify checkout after replacement.
