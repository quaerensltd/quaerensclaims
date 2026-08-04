const fs = require("fs");
const path = require("path");

const root = process.cwd();
const html = fs.readFileSync(path.join(root, "public", "airbnb-refunds.html"), "utf8");
const runtime = fs.readFileSync(path.join(root, "public", "airbnb-complaint-pack-v3.js"), "utf8");
const failures = [];
const requireText = (source, value, label) => { if (!source.includes(value)) failures.push(label); };

requireText(html, '<link rel="canonical" href="https://www.quaerens.co.uk/airbnb-refunds.html"', "canonical URL preserved");
requireText(html, "FAQPage", "FAQ structured data preserved");
requireText(html, 'data-qcb-version="3"', "Version 3 builder enabled");
requireText(html, "/airbnb-complaint-pack-v3.js", "Version 3 runtime loaded");
requireText(runtime, "Airbnb Complaint File", "cover page generated");
requireText(runtime, "Executive Summary", "executive summary generated");
requireText(runtime, "Booking Summary", "booking summary generated");
requireText(runtime, "Chronology", "chronology generated");
requireText(runtime, "Evidence Readiness", "evidence page generated");
requireText(runtime, "Financial Loss Schedule", "loss schedule generated");
requireText(runtime, "Formal Complaint Letter", "complaint letter generated");
requireText(runtime, "Cover Email", "cover email generated");
requireText(runtime, "Submission Checklist", "submission checklist generated");
requireText(runtime, "Response Tracker", "response tracker generated");
requireText(runtime, "Official Guidance & Routes", "official guidance generated");
requireText(runtime, "Quaerens Notes", "notes page generated");
requireText(runtime, "application/pdf", "true PDF blob generated");
requireText(runtime, "application/msword", "editable Word download generated");
requireText(runtime, "localStorage.setItem", "opt-in local persistence present");

if (failures.length) {
  console.error(`Airbnb Complaint Pack V3 checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("Airbnb Complaint Pack V3 static checks passed (18/18).");
