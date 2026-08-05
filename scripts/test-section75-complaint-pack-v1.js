const fs = require("fs");
const path = require("path");

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "public", "section75support.html"), "utf8");
const runtime = fs.readFileSync(path.join(root, "public", "airbnb-complaint-pack-v3.js"), "utf8");
const categories = fs.readFileSync(path.join(root, "public", "complaint-builder", "config", "framework-a-categories-v1.4.js"), "utf8");
const css = fs.readFileSync(path.join(root, "public", "complaint-builder", "styles", "framework-v1-builder.css"), "utf8");
const failures = [];
const requireText = (source, value, label) => { if (!source.includes(value)) failures.push(label); };
const rejectText = (source, value, label) => { if (source.includes(value)) failures.push(label); };

requireText(html, '<link rel="canonical" href="https://www.quaerens.co.uk/section75support.html"', "canonical URL preserved");
requireText(html, "FAQPage", "FAQ schema preserved");
requireText(html, 'data-qcb-builder="section75" data-qcb-version="4"', "Framework v1 builder enabled");
requireText(html, "/complaint-builder/styles/framework-v1-builder.css", "shared framework presentation loaded");
requireText(html, "/airbnb-complaint-pack-v3.js", "shared Framework v1 runtime loaded");
requireText(html, "Free Section 75 Complaint Pack Builder&trade;", "approved product name used");
requireText(html, "Merchant", "merchant question present");
requireText(html, "Credit card provider", "card-provider question present");
requireText(html, "Amount paid by credit card", "card-payment amount present");
requireText(html, "What was promised?", "promise question present");
requireText(html, "What actually happened?", "actual outcome question present");
requireText(html, "Has your claim been rejected?", "rejection question present");
requireText(html, "Has a Final Response been received?", "final-response question present");
requireText(html, "data-qcb-timeline", "shared chronology surface present");
requireText(html, "data-qcb-evidence", "shared evidence surface present");
requireText(html, "data-qcb-losses", "shared financial surface present");
requireText(html, "data-qcb-download-pdf", "PDF action present");
requireText(html, "data-qcb-download-word", "Word action present");
requireText(html, "data-qcb-download-txt", "TXT action present");
requireText(html, "data-qcb-copy-letter", "copy-letter action present");
requireText(html, "data-qcb-copy-email", "copy-email action present");
requireText(html, "data-qcb-print", "print action present");
requireText(html, "Quaerens Intake Gateway", "Gateway boundary stated");
requireText(html, 'type="application/x-obsolete" data-retired-reason="Guided Support must use the Quaerens Intake Gateway"', "legacy direct callback is non-executable");
rejectText(html, '<form class="quaerens-callback-form', "no live direct callback form");
requireText(categories, "Credit card statement", "Section 75 evidence catalogue present");
requireText(runtime, "function eligibilityResult", "non-promissory eligibility guide present");
requireText(runtime, "Consumer Credit Act 1974", "Section 75 complaint wording present");
requireText(runtime, "FREE SECTION 75 COMPLAINT PACK", "Section 75 PDF cover present");
requireText(runtime, "Section-75", "Section 75 export filenames present");
requireText(runtime, "window.setTimeout(renderPreview, 220)", "220ms preview debounce preserved");
requireText(runtime, 'document.querySelectorAll(\'[data-qcb-version="4"]\')', "shared runtime initialises configured implementations");
requireText(css, "prefers-reduced-motion", "reduced-motion support preserved");
requireText(css, "@media(max-width:760px)", "mobile reflow preserved");

if (failures.length) {
  console.error(`Section 75 Framework v1 checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Section 75 Complaint Pack Framework v1 static checks passed (34/34).");
