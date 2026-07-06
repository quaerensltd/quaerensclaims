$ErrorActionPreference = "Stop"

$docs = @(
  "C:\Users\CasaT\quaerensclaims\document_work\borji_report\01_Mary_Borji_Spray_Foam_Assessment_Report_Updated.doc",
  "C:\Users\CasaT\quaerensclaims\document_work\borji_report\02_Mary_Borji_Formal_Complaint_Letter_Protect_Insulation.doc",
  "C:\Users\CasaT\quaerensclaims\document_work\borji_report\03_Mary_Borji_Letter_of_Authority.doc",
  "C:\Users\CasaT\quaerensclaims\document_work\borji_report\04_Mary_Borji_Evidence_Checklist_and_Next_Steps.doc"
)

$word = New-Object -ComObject Word.Application
$word.Visible = $false

try {
  foreach ($docPath in $docs) {
    if (-not (Test-Path -LiteralPath $docPath)) {
      throw "Missing document: $docPath"
    }

    $pdfPath = [System.IO.Path]::ChangeExtension($docPath, ".pdf")
    $doc = $word.Documents.Open($docPath, $false, $true)
    $doc.ExportAsFixedFormat($pdfPath, 17)
    $doc.Close($false)
    Write-Host "Created: $pdfPath"
  }
}
finally {
  $word.Quit()
}
