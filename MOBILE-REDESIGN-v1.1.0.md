# ABBASIA.SHOP Premium Mobile Redesign — v1.1.0

## Delivered in this source package
- Replaced the mobile WebView home screen with a native React Native marketplace home.
- Added a premium navy/gold visual system, product search, category shortcuts, promotional content, live product cards and quick-add actions.
- Added a native category tab and preserved scanner, cart, account, login and checkout flows.
- Added French, Arabic and English mobile translations and XAF formatting (`FCFA`, `فرنك سيفا`, `XAF`).
- Enabled native RTL direction for Arabic using `I18nManager`; restart the app after switching language if the system direction does not update immediately.
- Extended the existing public products API response with the already-existing `sku` column so QR/barcode scans can match `id`, `slug` or `sku`.
- Preserved Supabase Auth, the existing order POST contract, Prisma schema, all migrations, production site and EAS project/package IDs.
- No production database migration or production data change was made.

## Important integration boundaries
- The app continues to use the existing Next.js `/api/products` and `/api/orders` endpoints.
- The native cart remains in SecureStore and is not shared with the website's browser localStorage cart.
- Barcode lookup requires the barcode value to be stored in `Product.sku`.
- The project ZIP intentionally excludes `.env` secrets, private keys, node_modules, build output and Git metadata. Public mobile Supabase configuration is available through `mobile/.env.example` and safe public fallbacks.

## Validation
- TypeScript/TSX syntax transpilation passed for all 14 mobile TypeScript files.
- Full dependency-aware `tsc --noEmit`, `expo-doctor`, and device testing must be run in the developer's Windows environment after `npm ci`.
