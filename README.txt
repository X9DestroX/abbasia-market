ABBASIA MARKET MOBILE — v1.1.2
SAFE-AREA + UTF-8 REPAIR PATCH

WHAT THIS PATCH FIXES
1. Android bottom tab bar now uses the device's actual bottom safe-area inset.
2. SafeAreaProvider is installed at the app root so inset values are available.
3. French mojibake in mobile source strings is repaired (examples: Catégories, Abéché, même, Découvrez).
4. Arabic language label is restored to العربية.
5. src/i18n.tsx is restored from the clean UTF-8 source, including French, Arabic and English translations.
6. Expo app version is updated to 1.1.2.

INSTALL
1. Extract this ZIP directly inside:
   D:\DESTROX\Projects\abbasia-market
2. Open PowerShell in that project root.
3. Run:
   powershell -ExecutionPolicy Bypass -File .\ABBASIA-MARKET-v1.1.2-SAFE-AREA-UTF8-FIX\APPLY-FIX.ps1
4. The script creates a timestamped backup OUTSIDE the mobile folder, copies only the listed source files, then runs TypeScript and Expo Doctor.
5. If both checks pass, launch the app with:
   cd .\mobile
   npx expo start --clear

IMPORTANT
- Do not replace the entire mobile folder.
- Existing .env/.env.local files and credentials are not included or changed.
- Backend, database, API contracts, EAS project ID and package identifier are preserved.
- No APK build is included; test the app visually first.
