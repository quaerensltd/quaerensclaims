param([Parameter(Mandatory=$true)][string]$Manifest,[Parameter(Mandatory=$true)][string]$Sha256)
$ErrorActionPreference='Stop'
$workspaceRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
Set-Location -LiteralPath $workspaceRoot
Write-Host 'CRM4 private synthetic bootstrap. Enter passwords only in the private prompts. Do not copy them into chat.'
& node (Join-Path $PSScriptRoot 'run.cjs') $Manifest $Sha256
if ($LASTEXITCODE -ne 0) { Write-Host 'Stopped safely. No automatic retry. Codex will inspect the non-sensitive receipts.' }
