# ABBASIA MARKET Mobile — v1.1.3 patch

This patch is based on the uploaded `abbasia-market(3).zip`.

## Fixes
- Adds Android top safe-area inset to the home header so the brand row sits below the status bar.
- Replaces the corrupted checkout arrow in the cart with a native Ionicons arrow.
- Makes the checkout action a centered row with readable label and icon.
- Replaces the corrupted back arrow on the login screen.
- Audited all included TypeScript/TSX/JSON/Markdown files for UTF-8 decoding and common mojibake markers. No remaining matches were found.
- Confirmed French, Arabic, and English translation dictionaries each contain the same 61 keys.

## Apply
1. Back up your current `mobile` folder.
2. Extract this ZIP over the marketplace project root, allowing the three changed files to be replaced.
3. Open PowerShell in `D:\DESTROX\Projects\abbasia-market\mobile`.
4. Run:
   ```powershell
   npx tsc --noEmit
   npx expo-doctor
   npx expo start --clear
   ```

## Files changed
- `mobile/app/(tabs)/index.tsx`
- `mobile/app/(tabs)/cart.tsx`
- `mobile/app/login.tsx`

No backend, database, environment, package, EAS, or signing configuration was changed.
