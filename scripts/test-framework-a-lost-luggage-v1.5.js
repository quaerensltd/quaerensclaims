const fs = require("fs");
const assert = require("assert");

const read = (path) => fs.readFileSync(path, "utf8");
const page = read("public/lost-luggage.html");
const registry = read("public/complaint-builder/config/framework-a-categories-v1.4.js");
const runtime = read("public/airbnb-complaint-pack-v3.js");
const metrics = read("public/complaint-builder/metrics/framework-a-metrics-config.js");

assert.match(page, /data-qcb-builder="baggage"/);
assert.match(page, /qcb-builder-grid qcb-airbnb-shell/);
assert.match(page, /data-qcb-preview/);
assert.match(page, /data-qcb-applicant|applicant-details\.js/);
assert.match(page, /framework-v1-builder\.css/);
assert.doesNotMatch(page, /builders\/baggage\/baggage\.(?:page|documents)\.js/);
assert.doesNotMatch(page, /id="previewText"|Step 1 of 8: Journey/);
assert.match(page, /href="#baggage-builder"/);
assert.match(page, /id="baggage-passenger-rights"|education\.id = 'baggage-passenger-rights'/);
assert.match(page, /Build My Lost Luggage Pack/);
assert.match(page, /class="language"/);

assert.match(registry, /version: "1\.5"/);
assert.match(registry, /baggage:\s*\{/);
assert.match(registry, /metricsId: "lost-luggage"/);
assert.match(registry, /Property Irregularity Report/);
assert.match(runtime, /const isBaggage = builderId === "baggage"/);
assert.match(runtime, /title:"Lost Luggage Complaint File"/);
assert.match(runtime, /title:"Help the Next Person"/);
assert.match(runtime, /Quaerens-\$\{isBaggage \? "Lost-Luggage"/);
assert.match(metrics, /FRAMEWORK_A_VERSION = "1\.5"/);
assert.match(metrics, /"lost-luggage": "Lost Luggage"/);

const sharedScripts = [
  "public/airbnb-complaint-pack-v3.js",
  "public/complaint-builder/components/applicant-details.js",
  "public/complaint-builder/components/help-the-next-person.js",
  "public/complaint-builder/metrics/framework-a-metrics.js"
];
sharedScripts.forEach((file) => assert.ok(fs.existsSync(file), `${file} missing`));

console.log("Framework A v1.5 Lost Luggage conformance passed.");
