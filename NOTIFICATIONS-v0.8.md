# ABBASIA.SHOP v0.8 — Notifications

## Included
- Authenticated in-app notification inbox at `/account/notifications`.
- List latest 50 notifications; unread styling; mark one or all as read.
- API: `GET /api/notifications`, `PATCH /api/notifications`.
- Order status events create notifications for the customer.
- Delivery assignment/progress events create notifications for the customer.
- Notification records are private to their owning authenticated user.

## Database update
This release adds the `Notification` table. It does not change or delete existing records. Run:

```powershell
npx prisma migrate dev
npx prisma generate
npx tsc --noEmit
npm run dev
```

Migration: `20261118160000_customer_notifications`. Keep `.env`, `.env.local`, and existing Supabase configuration.

## WhatsApp/SMS
This release creates the in-app notification foundation only. It does not send WhatsApp/SMS messages and does not require provider credentials. A verified provider can be connected in a later release with explicit opt-in and delivery logging.
