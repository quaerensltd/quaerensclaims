const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const runtime = read("public/airbnb-complaint-pack-v3.js");
const component = read("public/complaint-builder/components/applicant-details.js");
const css = read("public/complaint-builder/styles/framework-v1-builder.css");
const pages = ["public/airbnb-refunds.html", "public/section75support.html", "public/freeholidaycompensation.html"].map(read);
const checks = [
  [component.includes("crypto.getRandomValues"), "reference uses a cryptographically secure browser generator"],
  [/QCP-\$\{new Date/.test(component), "reference uses the approved QCP format"],
  [!component.includes("localStorage") && !component.includes("fetch("), "shared applicant component does not transmit or independently persist data"],
  [component.includes('name="applicantFirstName"') && component.includes('name="applicantPostcode"'), "primary applicant fields exist"],
  [component.includes('name="jointComplaint"') && component.includes('name="jointAddressDifferent"'), "conditional joint-applicant fields exist"],
  [component.includes('aria-controls="qcb-joint-fields"'), "joint controls expose accessible relationships"],
  [runtime.includes("const MAX_STEP") && runtime.includes("Step ${step} of ${MAX_STEP}"), "shared navigation supports the permanent first step"],
  [runtime.includes("frameworkVersion: \"1.2\"") && component.includes("function metadata(root)"), "Framework C/B handoff metadata is exposed"],
  [runtime.includes("I confirm that the information contained in this Complaint Pack is true and accurate to the best of my knowledge."), "standard declaration is present"],
  [runtime.includes("data-footer=\"${esc(text(d.f.complaintPackReference))}"), "live preview footers carry the pack reference"],
  [runtime.includes("pdfSafe(text(d.f.complaintPackReference))") && runtime.includes("<footer>${esc(text(d.f.complaintPackReference))}"), "PDF and Word footers carry the pack reference"],
  [runtime.includes("complaintLetterCore(d)") && runtime.includes("coverEmailCore(d)"), "letters and emails are personalised by the shared engine"],
  [pages.every((html) => html.includes("/complaint-builder/components/applicant-details.js?v=1.2.2")), "all certified builders load the shared component"],
  [pages.every((html) => html.includes("/airbnb-complaint-pack-v3.js?v=1.3.0")), "all certified builders load the same versioned runtime"],
  [css.includes(".qcb-reference-card") && css.includes(".qcb-conditional-panel[hidden]"), "shared responsive presentation exists"]
];
const failures = checks.filter(([pass]) => !pass);
checks.forEach(([pass, label]) => console.log(`${pass ? "PASS" : "FAIL"}: ${label}`));
if (failures.length) process.exit(1);
console.log(`Framework A v1.2 Applicant Details and reference validation passed (${checks.length}/${checks.length}).`);
