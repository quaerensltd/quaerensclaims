$ErrorActionPreference = "Stop"

$outDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$docxPath = Join-Path $outDir "Mary_Borji_Spray_Foam_Assessment_Report.docx"
$tmp = Join-Path $outDir "_docx_build"

if (Test-Path $tmp) { Remove-Item -LiteralPath $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "word") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "word\_rels") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tmp "docProps") | Out-Null

function X([string]$s) {
  return [System.Security.SecurityElement]::Escape($s)
}

function P([string]$text, [string]$style = "Normal") {
  $escaped = X $text
  return "<w:p><w:pPr><w:pStyle w:val=""$style""/></w:pPr><w:r><w:t xml:space=""preserve"">$escaped</w:t></w:r></w:p>"
}

function Bullet([string]$text) {
  $escaped = X $text
  return "<w:p><w:pPr><w:pStyle w:val=""Bullet""/><w:numPr><w:ilvl w:val=""0""/><w:numId w:val=""1""/></w:numPr></w:pPr><w:r><w:t xml:space=""preserve"">$escaped</w:t></w:r></w:p>"
}

function Cell([string]$text, [string]$style = "Normal") {
  return "<w:tc><w:tcPr><w:tcW w:w=""3000"" w:type=""dxa""/></w:tcPr>$(P $text $style)</w:tc>"
}

function Row([string[]]$cells, [bool]$header = $false) {
  $style = if ($header) { "TableHeader" } else { "Normal" }
  $xml = "<w:tr>"
  foreach ($c in $cells) { $xml += Cell $c $style }
  $xml += "</w:tr>"
  return $xml
}

function Table($rows) {
  $xml = @"
<w:tbl>
  <w:tblPr>
    <w:tblStyle w:val="TableGrid"/>
    <w:tblW w:w="0" w:type="auto"/>
    <w:tblBorders>
      <w:top w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
      <w:left w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
      <w:bottom w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
      <w:right w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
      <w:insideH w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
      <w:insideV w:val="single" w:sz="6" w:space="0" w:color="D7E4F5"/>
    </w:tblBorders>
  </w:tblPr>
"@
  foreach ($r in $rows) { $xml += $r }
  $xml += "</w:tbl>"
  return $xml
}

$content = ""
$content += P "Quaerens Claims" "Brand"
$content += P "Spray Foam Loft Insulation Assessment" "Subtitle"
$content += P "Prepared for: Mrs Mary Borji    Report date: 12 June 2026    Reference: Borji / Spray Foam / Initial Review" "Meta"
$content += P "Initial Assessment Report: Spray Foam Loft Insulation" "Title"
$content += P "Property: 11 Richland Road, Liverpool, L13 7BN" "Meta"
$content += P "Assessment summary: Based on the information supplied, Mrs Borji appears to have a potentially arguable spray foam loft insulation complaint arising from alleged failure to warn, negligent installation, excessive humidity within the loft, deterioration of roof timbers, and subsequent roof replacement costs." "Callout"
$content += P "The available facts suggest the matter should be investigated further once the installer/company name, installation paperwork, grant voucher, roofing inspection findings, photographs and replacement roof invoice are collated." "Callout"

$content += P "Client and Product Details" "Heading1"
$content += Table @(
  (Row @("Client", "Mary Borji") $true),
  (Row @("Telephone", "+44 7817 717776")),
  (Row @("Email", "marycborji@gmail.com")),
  (Row @("Address", "11 Richland Road, Liverpool, L13 7BN")),
  (Row @("Product", "Spray foam loft insulation")),
  (Row @("Installer/company", "TBC")),
  (Row @("Installation date", "March 2021")),
  (Row @("Installation value", "GBP 7,000, paid by Green Homes Scheme; original grant voucher available"))
)

$content += P "1. Background" "Heading1"
$content += P "Mrs Borji reports that spray foam loft insulation was installed at her property in or around March 2021. The product cost was approximately GBP 7,000 and was paid through the Green Homes Scheme. Mrs Borji holds the original grant voucher."
$content += P "Mrs Borji states that, at the point of sale or installation, she was not made aware of the potential structural, mortgage, resale or property value implications associated with spray foam loft insulation. She further reports that the installation was carried out negligently and to an unacceptable standard."
$content += P "A later inspection by a local roofing company reportedly identified excessive humidity levels in the loft and significant deterioration of the timber roof structure. Mrs Borji has photographic evidence of the damage. Due to the severity of the deterioration, a substantial section of the roof required replacement in or around January 2026 at an estimated cost of GBP 5,800. Spray foam insulation also remains present on the loft floor."

$content += P "2. Known Losses and Costs" "Heading1"
$content += Table @(
  (Row @("Item", "Details", "Amount") $true),
  (Row @("Spray foam loft insulation", "Installed March 2021. Company/installer to be confirmed. Paid by Green Homes Scheme, original grant voucher available.", "GBP 7,000")),
  (Row @("Roof replacement works", "Substantial section of roof reportedly replaced following timber deterioration and humidity issues. Roofing company details and invoice to be confirmed.", "GBP 5,800")),
  (Row @("Current identified financial impact", "Subject to documentary evidence and causation review.", "GBP 12,800"))
)
$content += P "Note: The installation cost was grant-funded, so recovery treatment may depend on the grant scheme documents, installer obligations, whether the grant created a recoverable loss to Mrs Borji, and whether the defective works caused consequential property loss." "Meta"

$content += P "3. Key Allegations to Investigate" "Heading1"
$content += Bullet "Failure to explain potential mortgage, survey, resale, property value and structural implications of spray foam loft insulation."
$content += Bullet "Potentially negligent or substandard installation of spray foam insulation."
$content += Bullet "Excessive humidity within the loft space after installation."
$content += Bullet "Deterioration of roof timbers allegedly linked to the installation and/or its effect on ventilation and inspection."
$content += Bullet "Need for substantial roof replacement works in January 2026."
$content += Bullet "Remaining spray foam insulation on the loft floor, which may continue to affect property condition, valuation, mortgageability or future remediation."

$content += P "4. Evidence Required" "Heading1"
$content += Bullet "Green Homes Scheme grant voucher and any grant approval documents."
$content += Bullet "Original installation contract, quotation, invoice, guarantee and product literature."
$content += Bullet "Name, trading address and status of the installer/company."
$content += Bullet "Any sales brochures, emails, calls, messages or representations made before installation."
$content += Bullet "Photographs of the spray foam installation, loft floor foam, timber deterioration and any visible humidity/damp issues."
$content += Bullet "Roofing company inspection report, humidity readings, comments on timber condition and causation opinion."
$content += Bullet "Roof replacement quotation, invoice, scope of works and payment evidence."
$content += Bullet "Any mortgage, valuation, surveyor or estate agent comments relating to spray foam or property value."

$content += P "5. Assessment of Potential Claim Routes" "Heading1"
$content += P "Mis-selling / failure to warn" "Heading2"
$content += P "If the installer or sales agent failed to explain known or reasonably foreseeable risks, including mortgage refusal, inspection restrictions, timber condition issues, ventilation problems, resale concerns or remediation costs, Mrs Borji may have a complaint that the product was misrepresented or unsuitable for the property."
$content += P "Negligent installation / defective workmanship" "Heading2"
$content += P "The reported humidity and timber deterioration raise a potential workmanship issue. This route will depend heavily on the roofing company's findings, whether the damage can be linked to the spray foam installation, and whether the works failed to meet reasonable standards at the time."
$content += P "Consequential loss" "Heading2"
$content += P "The roof replacement cost of GBP 5,800 may be relevant as consequential loss if evidence supports that the defective installation caused or materially contributed to the deterioration requiring replacement."
$content += P "Grant-funded works" "Heading2"
$content += P "Because the installation was paid through the Green Homes Scheme, it will be important to identify the contracting party, the installer, any scheme administrator, any warranty or guarantee provider, and any complaint mechanism connected to the grant-funded installation."
$content += P "Important uncertainty: The company/installer is currently marked as TBC. The strength and route of any complaint may change significantly once the installer identity, trading status, guarantee position and grant documents are confirmed." "Warning"

$content += P "6. Preliminary View" "Heading1"
$content += P "On the information currently available, Mrs Borji's case appears suitable for further review. The strongest areas appear to be the alleged failure to warn about foreseeable spray foam risks, the alleged negligent installation, and the claimed property damage requiring roof replacement."
$content += P "The case would be strengthened by an independent or detailed roofing report confirming the likely cause of the timber deterioration and explaining how the spray foam installation affected ventilation, humidity, inspection or roof condition."

$content += P "7. Recommended Next Steps" "Heading1"
$content += Bullet "Confirm the installer/company name, trading details and current company status."
$content += Bullet "Obtain and review the Green Homes Scheme voucher and all installation documents."
$content += Bullet "Request a written report or letter from the roofing company confirming humidity findings, timber deterioration, photographs, works required and likely causation."
$content += Bullet "Prepare a chronology from March 2021 installation through to January 2026 roof replacement."
$content += Bullet "Calculate the full loss position, including roof replacement, inspection costs, remaining remediation, any future removal cost and any property value or mortgage impact."
$content += Bullet "Once evidence is complete, send a formal letter of complaint to the responsible installer, scheme party, warranty provider or other appropriate route."

$content += P "8. Documents Still TBC" "Heading1"
$content += Bullet "Installer/company name and address."
$content += Bullet "Roofing company name and written report."
$content += Bullet "Roof replacement invoice and payment proof."
$content += Bullet "Full photographic evidence set."
$content += Bullet "Any guarantee, warranty or grant scheme complaint documentation."
$content += P "Disclaimer: This report is an initial assessment based only on the information supplied. It is not a final legal opinion and does not guarantee recovery. Further review of documents, causation evidence and responsible parties is required before a formal claim route can be confirmed." "Meta"

$documentXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    $content
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:color w:val="102033"/></w:rPr><w:pPr><w:spacing w:after="140"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Brand"><w:name w:val="Brand"/><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="1260AD"/></w:rPr><w:pPr><w:spacing w:after="80"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:rPr><w:b/><w:caps/><w:sz w:val="20"/><w:color w:val="5F6F82"/></w:rPr><w:pPr><w:spacing w:after="180"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="42"/><w:color w:val="102033"/></w:rPr><w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="1260AD"/></w:rPr><w:pPr><w:spacing w:before="260" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="102033"/></w:rPr><w:pPr><w:spacing w:before="160" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Meta"><w:name w:val="Meta"/><w:rPr><w:sz w:val="19"/><w:color w:val="66778B"/></w:rPr><w:pPr><w:spacing w:after="100"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Callout"><w:name w:val="Callout"/><w:rPr><w:sz w:val="22"/><w:color w:val="0F4F99"/></w:rPr><w:pPr><w:shd w:fill="EEF6FF"/><w:spacing w:before="80" w:after="80"/><w:ind w:left="180" w:right="180"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Warning"><w:name w:val="Warning"/><w:rPr><w:b/><w:sz w:val="22"/><w:color w:val="92400E"/></w:rPr><w:pPr><w:shd w:fill="FFF8ED"/><w:spacing w:before="100" w:after="100"/><w:ind w:left="180" w:right="180"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Bullet"><w:name w:val="Bullet"/><w:rPr><w:sz w:val="22"/><w:color w:val="102033"/></w:rPr><w:pPr><w:spacing w:after="80"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="TableHeader"><w:name w:val="Table Header"/><w:rPr><w:b/><w:sz w:val="21"/><w:color w:val="123B63"/></w:rPr><w:pPr><w:shd w:fill="EEF6FF"/><w:spacing w:after="60"/></w:pPr></w:style>
</w:styles>
"@

$numberingXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="0">
    <w:multiLevelType w:val="hybridMultilevel"/>
    <w:lvl w:ilvl="0">
      <w:start w:val="1"/>
      <w:numFmt w:val="bullet"/>
      <w:lvlText w:val="•"/>
      <w:lvlJc w:val="left"/>
      <w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr>
      <w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol" w:hint="default"/></w:rPr>
    </w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$docRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"@

$core = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Mary Borji Spray Foam Assessment Report</dc:title>
  <dc:creator>Quaerens Claims</dc:creator>
  <cp:lastModifiedBy>Quaerens Claims</cp:lastModifiedBy>
</cp:coreProperties>
"@

$app = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Word</Application>
</Properties>
"@

Set-Content -LiteralPath (Join-Path $tmp "[Content_Types].xml") -Value $contentTypes -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "_rels\.rels") -Value $rels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "word\document.xml") -Value $documentXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "word\styles.xml") -Value $stylesXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "word\numbering.xml") -Value $numberingXml -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "word\_rels\document.xml.rels") -Value $docRels -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "docProps\core.xml") -Value $core -Encoding UTF8
Set-Content -LiteralPath (Join-Path $tmp "docProps\app.xml") -Value $app -Encoding UTF8

if (Test-Path $docxPath) { Remove-Item -LiteralPath $docxPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tmp, $docxPath)
Remove-Item -LiteralPath $tmp -Recurse -Force

Write-Host "Created $docxPath"
