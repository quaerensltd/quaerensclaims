const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

const component = read("public/complaint-builder/components/help-the-next-person.js");
const runtime = read("public/airbnb-complaint-pack-v3.js");
const styles = read("public/complaint-builder/styles/framework-v1-builder.css");
const builders = [
  ["Airbnb", read("public/airbnb-refunds.html")],
  ["Section 75", read("public/section75support.html")],
  ["Holiday", read("public/freeholidaycompensation.html")]
];

check(runtime.includes('import("/complaint-builder/components/help-the-next-person.js?v=1.0.0")'), "shared runtime loads the component once");
check(component.includes('.qcb-step-page[data-qcb-step="7"]'), "component targets the shared completion step");
check(component.includes('completion.querySelector(".qcb-separate-support")'), "component mounts after Optional Guided Support separation");
check(component.includes("Leave an Honest Review"), "honest-review wording is exact");
check(!component.includes(">Leave a Review<"), "generic review wording is not used");
check(component.includes("We are not asking for a positive review."), "review sentiment pressure is explicitly rejected");
check(component.includes("Share This Tool"), "share action wording is exact");
check(component.includes("navigator.share"), "native mobile and desktop share behaviour exists");
check(component.includes("navigator.clipboard.writeText"), "copy-link fallback exists");
check(component.includes('role="status" aria-live="polite"'), "share feedback is screen-reader accessible");
check(component.includes("Thank you for using The Quaerens Platform."), "shared thank-you message is present");
check(component.includes("thank you for helping the next person."), "shared closing wording is present");
check(!/donat|\btip\b|fundrais|payment request/i.test(component), "component contains no donation, tip, payment or fundraising request");
check(styles.includes(".qcb-help-next-person"), "shared framework stylesheet owns presentation");
check(styles.includes(".qcb-help-options{display:grid"), "shared component uses framework cards");
check(styles.includes(".qcb-help-options{grid-template-columns:1fr}"), "component stacks responsively on mobile");
check(styles.includes("prefers-reduced-motion") && styles.includes(".qcb-help-next-person{animation:none"), "component respects reduced motion");
check(styles.includes(".qcb-btn:focus-visible"), "component actions inherit visible focus treatment");
check(styles.includes(".qcb-help-next-person,.cta-button"), "component is excluded from Complaint Pack printing");

for (const [name, html] of builders) {
  check(html.includes("/complaint-builder/styles/framework-v1-builder.css?v=20260805-help-next-person"), `${name} loads the cache-versioned shared stylesheet`);
  check(html.includes("/airbnb-complaint-pack-v3.js"), `${name} loads the shared runtime`);
  check((html.match(/data-qcb-step="7"/g) || []).length >= 1, `${name} exposes the shared completion mount`);
  check(!html.includes("data-qcb-help-next-person"), `${name} does not duplicate component markup`);
}

if (failures.length) {
  console.error(`Help the Next Person Version 1 checks failed:\n- ${failures.join("\n- ")}`);
  process.exit(1);
}

console.log("Help the Next Person Version 1 shared-framework checks passed.");
