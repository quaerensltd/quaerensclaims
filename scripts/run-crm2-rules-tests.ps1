$ErrorActionPreference = "Stop"
$javaHome = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot "..\.tools\java") -Directory | Select-Object -First 1
if (-not $javaHome) { throw "Portable Java runtime not found under .tools/java." }
$env:JAVA_HOME = $javaHome.FullName
$env:PATH = (Join-Path $javaHome.FullName "bin") + ";" + $env:PATH
$env:FIREBASE_EMULATORS_PATH = Join-Path $PSScriptRoot "..\.firebase-emulators"
$firebase = Join-Path $PSScriptRoot "..\node_modules\.bin\firebase.cmd"
if (-not (Test-Path -LiteralPath $firebase)) { throw "Project-local Firebase CLI is not installed." }
& $firebase emulators:exec --project quaerensclaims-crm2-test --only firestore "node scripts/crm2-firestore.rules.test.js"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
