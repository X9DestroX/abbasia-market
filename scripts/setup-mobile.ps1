$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..\mobile')
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env'; Write-Warning 'Edit mobile\.env and enter your API and Supabase public values.' }
npm install
Write-Host 'Mobile dependencies installed. Start with: npx expo start' -ForegroundColor Green
