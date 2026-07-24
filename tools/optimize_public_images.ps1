param(
  [int]$JpegQuality = 90,
  [int]$MinimumBytes = 300000
)

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path ".").Path
$InventoryPath = Join-Path $Root "docs\image-asset-inventory.json"
$ReviewRoot = Join-Path $Root "image-review"
$UnusedRoot = Join-Path $ReviewRoot "unused-public-images"
$OriginalsRoot = Join-Path $ReviewRoot "converted-originals"

if (!(Test-Path $InventoryPath)) {
  throw "Missing $InventoryPath. Run node .\tools\image_asset_audit.js first."
}

Add-Type -AssemblyName System.Drawing

function Ensure-Directory($Path) {
  if (!(Test-Path $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-RelativePath($BasePath, $TargetPath) {
  $baseUri = New-Object System.Uri(($BasePath.TrimEnd('\') + '\'))
  $targetUri = New-Object System.Uri($TargetPath)
  return [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()).Replace('/', '\')
}

function Get-JpegCodec {
  return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
}

function Save-Jpeg($Image, $Target, $Quality) {
  $codec = Get-JpegCodec
  $parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $parameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [int64]$Quality)
  $Image.Save($Target, $codec, $parameters)
}

function Has-Alpha($Image) {
  $flags = [System.Drawing.Imaging.ImageFlags]$Image.Flags
  if (($flags -band [System.Drawing.Imaging.ImageFlags]::HasAlpha) -eq [System.Drawing.Imaging.ImageFlags]::HasAlpha) {
    return $true
  }
  $pixelFormat = $Image.PixelFormat.ToString()
  return $pixelFormat -match "Alpha|PAlpha|Argb"
}

function Move-PreservePath($AbsoluteFile, $DestinationRoot) {
  $relative = Get-RelativePath $Root $AbsoluteFile
  $destination = Join-Path $DestinationRoot $relative
  Ensure-Directory (Split-Path $destination -Parent)
  Move-Item -LiteralPath $AbsoluteFile -Destination $destination -Force
  return Get-RelativePath $Root $destination
}

function Update-References($OldName, $NewName) {
  $textExtensions = @(".html", ".js", ".css", ".json", ".mjs", ".cjs", ".xml", ".txt", ".md", ".svg")
  $files = Get-ChildItem -Path (Join-Path $Root "public") -Recurse -File | Where-Object {
    $textExtensions -contains $_.Extension.ToLowerInvariant()
  }
  $changed = @()
  foreach ($file in $files) {
    $content = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8
    if ($null -eq $content) { continue }
    if ($content.Contains($OldName)) {
      $updated = $content.Replace($OldName, $NewName)
      if ($updated -ne $content) {
        $written = $false
        for ($attempt = 1; $attempt -le 6; $attempt++) {
          try {
            Set-Content -LiteralPath $file.FullName -Value $updated -Encoding UTF8 -NoNewline
            $written = $true
            break
          } catch {
            Start-Sleep -Milliseconds (250 * $attempt)
          }
        }
        if (-not $written) {
          throw "Could not update references in $($file.FullName)"
        }
        $changed += Get-RelativePath $Root $file.FullName
      }
    }
  }
  return $changed
}

Ensure-Directory $UnusedRoot
Ensure-Directory $OriginalsRoot

$inventory = (Get-Content -Path $InventoryPath -Raw -Encoding UTF8 | ConvertFrom-Json).inventory
$summary = [ordered]@{
  movedUnused = @()
  convertedPngToJpg = @()
  recompressedJpg = @()
  retained = @()
}

foreach ($item in $inventory | Where-Object { -not $_.referenced }) {
  $source = Join-Path $Root $item.path
  if (Test-Path $source) {
    $summary.movedUnused += Move-PreservePath $source $UnusedRoot
  }
}

$candidates = $inventory | Where-Object {
  $_.referenced -and
  -not $_.transparency -and
  $_.fileSize -gt $MinimumBytes -and
  ($_.extension -eq ".png" -or $_.extension -eq ".jpg" -or $_.extension -eq ".jpeg")
} | Sort-Object fileSize -Descending

foreach ($item in $candidates) {
  $source = Join-Path $Root $item.path
  if (!(Test-Path $source)) { continue }

  $image = $null
  try {
    $image = [System.Drawing.Image]::FromFile((Resolve-Path $source).Path)
    if (Has-Alpha $image) {
      $summary.retained += [ordered]@{ path = $item.path; reason = "alpha/transparency detected by Windows imaging" }
      continue
    }

    if ($item.extension -eq ".png") {
      $target = [System.IO.Path]::ChangeExtension($source, ".jpg")
      if (Test-Path $target) {
        $oldSize = (Get-Item $source).Length
        $newSize = (Get-Item $target).Length
        if ($newSize -lt [int64]($oldSize * 0.85)) {
          $oldName = [System.IO.Path]::GetFileName($source)
          $newName = [System.IO.Path]::GetFileName($target)
          $changedRefs = Update-References $oldName $newName
          $image.Dispose()
          $image = $null
          $movedOriginal = Move-PreservePath $source $OriginalsRoot
          $summary.convertedPngToJpg += [ordered]@{
            old = $item.path
            new = Get-RelativePath $Root $target
            oldBytes = $oldSize
            newBytes = $newSize
            referencesUpdated = $changedRefs
            originalMovedTo = $movedOriginal
            resumed = $true
          }
          continue
        } else {
          $summary.retained += [ordered]@{ path = $item.path; reason = "matching jpg already exists but was not materially smaller" }
          continue
        }
      }
      $temp = "$target.tmp"
      Save-Jpeg $image $temp $JpegQuality
        $oldSize = (Get-Item $source).Length
        $newSize = (Get-Item $temp).Length
      if ($newSize -lt [int64]($oldSize * 0.85)) {
        Move-Item -LiteralPath $temp -Destination $target -Force
        $oldName = [System.IO.Path]::GetFileName($source)
        $newName = [System.IO.Path]::GetFileName($target)
        $changedRefs = Update-References $oldName $newName
        $image.Dispose()
        $image = $null
        $movedOriginal = Move-PreservePath $source $OriginalsRoot
        $summary.convertedPngToJpg += [ordered]@{
          old = $item.path
          new = Get-RelativePath $Root $target
          oldBytes = $oldSize
          newBytes = $newSize
          referencesUpdated = $changedRefs
          originalMovedTo = $movedOriginal
        }
      } else {
        Remove-Item -LiteralPath $temp -Force
        $summary.retained += [ordered]@{ path = $item.path; reason = "jpeg conversion was not materially smaller" }
      }
    } else {
      $target = "$source.tmp"
      Save-Jpeg $image $target $JpegQuality
      $oldSize = (Get-Item $source).Length
      $newSize = (Get-Item $target).Length
      if ($newSize -lt [int64]($oldSize * 0.95)) {
        $image.Dispose()
        $image = $null
        Move-Item -LiteralPath $target -Destination $source -Force
        $summary.recompressedJpg += [ordered]@{
          path = $item.path
          oldBytes = $oldSize
          newBytes = $newSize
        }
      } else {
        Remove-Item -LiteralPath $target -Force
        $summary.retained += [ordered]@{ path = $item.path; reason = "recompression was not materially smaller" }
      }
    }
  } finally {
    if ($image) { $image.Dispose() }
  }
}

$summaryPath = Join-Path $Root "docs\image-optimisation-summary.json"
$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $summaryPath -Encoding UTF8
$summary | ConvertTo-Json -Depth 4
