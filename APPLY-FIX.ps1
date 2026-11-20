$ErrorActionPreference = "Stop"

# Run this script from D:\DESTROX\Projects\abbasia-market
$mobile = Join-Path (Get-Location).Path "mobile"
$sourceRoot = Join-Path $PSScriptRoot "mobile"
$files = @("src\storage.ts", "src\supabase.ts", "src\i18n.tsx")

if (!(Test-Path (Join-Path $mobile "package.json"))) {
    throw "Could not find mobile\package.json. Run this script from the marketplace project root."
}
foreach ($file in $files) {
    if (!(Test-Path (Join-Path $sourceRoot $file))) {
        throw "Patch file missing: $file"
    }
}

$backupRoot = Join-Path (Split-Path $mobile -Parent) ("mobile-storage-backup-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backupRoot | Out-Null

foreach ($file in $files) {
    $target = Join-Path $mobile $file
    $source = Join-Path $sourceRoot $file
    $targetDir = Split-Path $target -Parent
    if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    if (Test-Path $target) {
        $backupFile = Join-Path $backupRoot ($file -replace '[\\/:*?"<>|]', '_')
        Copy-Item $target $backupFile
    }
    $content = [System.IO.File]::ReadAllText($source, [System.Text.Encoding]::UTF8)
    [System.IO.File]::WriteAllText($target, $content, (New-Object System.Text.UTF8Encoding($false)))
}

Write-Host "Cross-platform storage patch applied." -ForegroundColor Green
Write-Host "Backup: $backupRoot" -ForegroundColor Cyan
Set-Location $mobile

Write-Host "`nRunning TypeScript validation..." -ForegroundColor Yellow
& npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { throw "TypeScript validation failed. Do not build yet." }
Write-Host "TypeScript passed." -ForegroundColor Green

Write-Host "`nRunning Expo Doctor..." -ForegroundColor Yellow
& npx expo-doctor
if ($LASTEXITCODE -ne 0) { throw "Expo Doctor reported an issue. Review its output." }
