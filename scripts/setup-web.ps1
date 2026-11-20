$ErrorActionPreference = 'Stop'
if (-not (Test-Path '.env')) { throw 'Missing .env. Keep your real Supabase credentials; do not use placeholders.' }
if (-not (Test-Path '.env.local')) { Write-Warning 'No .env.local found. Confirm Supabase public environment values are configured.' }
npm ci
npx prisma generate
npx prisma migrate status
Write-Host 'Setup complete. Start with: npm run dev' -ForegroundColor Green
