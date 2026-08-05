const fs = require("fs");
const path = require("path");

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "public", "freeholidaycompensation.html"), "utf8");
const runtime = fs.readFileSync(path.join(root, "public", "airbnb-complaint-pack-v3.js"), "utf8");
const categories = fs.readFileSync(path.join(root, "public", "complaint-builder", "config", "framework-a-categories-v1.4.js"), "utf8");
const css = fs.readFileSync(path.join(root, "public", "complaint-builder", "styles", "framework-v1-builder.css"), "utf8");
const failures = [];
const requireText = (source, value, label) => { if (!source.includes(value)) failures.push(label); };
const rejectText = (source, value, label) => { if (source.includes(value)) failures.push(label); };

requireText(html, '<link rel="canonical" href="https://www.quaerens.co.uk/freeholidaycompensation.html"', "canonical URL preserved");
requireText(html, "FAQPage", "FAQ schema preserved");
requireText(html, 'data-qcb-builder="holiday" data-qcb-version="4"', "Holiday configured implementation enabled");
requireText(html, "/complaint-builder/styles/framework-v1-builder.css", "shared framework presentation loaded");
requireText(html, "framework-v1-builder.css?v=20260805-help-next-person", "cache-versioned framework stylesheet loaded");
requireText(html, "/airbnb-complaint-pack-v3.js", "shared Framework v1 runtime loaded");
requireText(html, "Free Holiday Compensation Complaint Pack Builder&trade;", "approved product name used");
requireText(html, "Package Holiday", "package-holiday question present");
requireText(html, "Flight + Hotel", "flight-and-hotel option present");
requireText(html, "What was promised?", "promise question present");
requireText(html, "What actually happened?", "actual-outcome question present");
requireText(html, "How did the supplier respond?", "supplier-response question present");
requireText(html, "What outcome do you want?", "requested-outcome question present");
requireText(html, "data-qcb-timeline", "shared chronology surface present");
requireText(html, "data-qcb-evidence", "shared evidence surface present");
requireText(html, "data-qcb-losses", "shared financial surface present");
requireText(html, "data-qcb-download-pdf", "PDF action present");
requireText(html, "data-qcb-download-word", "Word action present");
requireText(html, "data-qcb-download-txt", "TXT action present");
requireText(html, "data-qcb-copy-letter", "copy-letter action present");
requireText(html, "data-qcb-copy-email", "copy-email action present");
requireText(html, "data-qcb-print", "print action present");
requireText(html, "Gateway integration pending", "Gateway boundary stated professionally");
requireText(html, 'class="holiday-reassurance-section"', "overlapping reassurance section present");
requireText(html, 'class="holiday-reassurance-panel"', "shared reassurance outer panel present");
requireText(html, 'grid-template-columns:repeat(5,minmax(0,1fr))', "five equal desktop columns present");
requireText(html, 'min-height:132px', "equal-height premium cards present");
requireText(html, '@media(max-width:900px)', "tablet reassurance reflow present");
requireText(html, '@media(max-width:520px)', "mobile reassurance stack present");
requireText(html, 'margin-top:-2.5rem', "hero-boundary overlap present");
requireText(html, 'holiday-reassurance-section + .section', "next-section spacing controlled");
requireText(html, "qcb-builder-grid qcb-airbnb-shell", "shared two-column shell class restored");
requireText(html, "qcb-form qcb-airbnb-stage", "shared builder panel class restored");
requireText(html, "qcb-preview qcb-airbnb-preview", "shared preview panel class restored");
requireText(html, "qcb-step-pills qcb-step-map", "shared step-map class restored");
requireText(html, "qcb-field-grid qcb-form-grid", "shared field-grid class restored");
rejectText(html, "/builders/holiday/holiday.page.js", "legacy standalone Holiday runtime is not loaded");
requireText(runtime, 'const isHoliday = builderId === "holiday"', "Holiday category configuration present");
requireText(categories, "ATOL certificate", "holiday evidence catalogue present");
requireText(runtime, "Package Travel and Linked Travel Arrangements Regulations 2018", "holiday official guidance present");
requireText(runtime, "FREE HOLIDAY COMPENSATION COMPLAINT PACK", "Holiday PDF cover present");
requireText(runtime, 'isHoliday ? "Holiday" : "Airbnb"', "Holiday export filenames present");
requireText(runtime, "window.setTimeout(renderPreview, 220)", "220ms preview debounce preserved");
requireText(runtime, "Holiday Complaint File", "12-page holiday case model present");
requireText(css, "prefers-reduced-motion", "reduced-motion support preserved");
requireText(css, "@media(max-width:760px)", "mobile reflow preserved");
requireText(css, ".qcb-builder-wrap{max-width:1480px", "shared framework wrapper base present");
requireText(css, ".qcb-btn{display:inline-flex", "shared framework button base present");
requireText(css, ".qcb-airbnb-shell{display:grid", "shared desktop grid present");

if (failures.length) {
  console.error(`Holiday Framework v1 checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Holiday Complaint Pack Framework v1 static checks passed (49/49).");
