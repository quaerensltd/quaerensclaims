$ErrorActionPreference = "Continue"

$base = "C:\Users\CasaT\quaerensclaims\document_work\borji_report"
$docs = @(
  "02_Mary_Borji_Formal_Complaint_Letter_Protect_Insulation.doc",
  "03_Mary_Borji_Letter_of_Authority.doc",
  "04_Mary_Borji_Evidence_Checklist_and_Next_Steps.doc"
)

foreach ($name in $docs) {
  $docPath = Join-Path $base $name
  $pdfPath = [System.IO.Path]::ChangeExtension($docPath, ".pdf")
  $word = $null
  $doc = $null

  try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($docPath, $false, $true)
    $doc.ExportAsFixedFormat($pdfPath, 17)
    Write-Host "Created: $pdfPath"
  }
  catch {
    Write-Host "FAILED: $docPath"
    Write-Host $_.Exception.Message
  }
  finally {
    try {
      if ($doc -ne $null) {
        $doc.Close($false)
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($doc)
      }
    } catch {}

    try {
      if ($word -ne $null) {
        $word.Quit()
        [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
      }
    } catch {}

    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
    Start-Sleep -Seconds 2
  }
}
