"use strict";
const fs=require("fs");
function edit(file,fn){const before=fs.readFileSync(file,"utf8");const after=fn(before);if(after===before)throw new Error(`No governance change made: ${file}`);fs.writeFileSync(file,after);}
edit("docs/platform/complaint-packs/quaerens-complaint-pack-framework-v1.md",s=>s
 .replace(/v1\.5/g,"v1.6")
 .replace(/Framework version: \*\*1\.5\*\*[^\r\n]*/,"Framework version: **1.6** — Governed Category Adapter Contract")
 .replace("### Version 1.5 baggage extension",`### Version 1.6 governed Category Adapter Contract\n\nVersion 1.6 introduces one allow-listed, category-scoped adapter contract for specialist behaviour. Approved adapters may provide derived calculations, quality/completion rules, analysis, complaint and email wording, guidance, cover metadata and twelve-page content composition. They cannot mount UI, navigate, render previews, export, send data, register metrics or replace Framework C. All shared engines remain single implementations. Car Finance and Cruise Compensation certify this contract.\n\n### Version 1.5 baggage extension`)
 .replace("Airbnb, Section 75, Holiday Compensation, Flight and Lost Luggage are the configured implementations through Version 1.5.","Airbnb, Section 75, Holiday Compensation, Flight, Lost Luggage, Car Finance and Cruise Compensation are the configured implementations through Version 1.6."));
edit("docs/platform/complaint-packs/quaerens-complaint-pack-framework-governance.md",s=>s
 .replace("The Version 1.5 declarative category contract is mandatory.","The Version 1.6 declarative category and governed adapter contracts are mandatory. Specialist adapters are allow-listed, category-scoped and cannot replace shared UI, preview, output, metrics or Framework C behaviour.")
 .replace(/current shared framework version is v1\.5/g,"current shared framework version is v1.6"));
edit("docs/platform/roadmap/quaerens-product-roadmap-v1.md",s=>s
 .replace(/\| Car Finance \| High \|([^\r\n]*)\| Planned \| Framework A; category evidence and guidance; regression \| TBD \| TBD \|/,"| Car Finance | High |$1| Live | Framework A v1.6 governed specialist adapter; full regression | Category v1 / Framework A v1.6 | Completed |")
 .replace(/\| Cruise Compensation \| Medium \|([^\r\n]*)\| Planned \| Framework A; route configuration \| TBD \| TBD \|/,"| Cruise Compensation | Medium |$1| Live | Framework A v1.6 governed specialist adapter; full regression | Category v1 / Framework A v1.6 | Completed |"));
