# ABBASIA.SHOP Complete Edition

This consolidated delivery includes the existing Next.js marketplace and Supabase/Prisma backend, customer/seller/admin workflows, checkout and tracking, plus Android/iOS React Native source under `mobile/`.

## Start the web app (Windows PowerShell)
```powershell
npm ci
npx prisma generate
npx prisma migrate status
npm run dev
```
Keep your existing `.env` and `.env.local`. Do not reset the database.

## Start the mobile app
```powershell
cd mobile
Copy-Item .env.example .env
# Fill in the EXPO_PUBLIC_* values
npm install
npx expo start
```
Read `docs/RELEASE-AND-DEPLOYMENT.md` and `mobile/README.md` before deployment.
