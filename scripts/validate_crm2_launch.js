const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = relative => fs.readFileSync(path.join(root, relative), "utf8");
const pages = [
  "public/crm2.html", "public/crm2-login.html", "public/crm2-lister.html",
  "public/crm2-manager.html", "public/crm2-closer.html", "public/crm2-admin.html",
  "public/crm2-cases.html", "public/crm2-case.html", "public/crm2-lead-new.html",
  "public/crm2-assessment-builder.html"
];

for (const page of pages) {
  const html = read(page);
  assert.match(html, /noindex/i, `${page} must be noindex`);
  const scripts = [...html.matchAll(/<script\s+type="module"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const [, source] of scripts) new vm.SourceTextModule(source, { identifier: page });
}

for (const script of ["public/crm2-platform.js", "public/crm2-auth.js", "public/crm2-dashboard.js"]) {
  new vm.SourceTextModule(read(script), { identifier: script });
}

const rules = read("firestore.rules");
assert.match(rules, /match \/crm2Memberships\/\{uid\}/);
assert.match(rules, /allow write: if false;/);
assert.match(rules, /request\.resource\.data\.workspaceId == "CRM2"/);
assert.match(rules, /request\.resource\.data\.source == "manual_crm2"/);
assert.match(rules, /collection != "crm2Leads"/);
assert.match(rules, /collection != "crm2Assessments"/);

const allClient = pages.map(read).join("\n") + read("public/crm2-platform.js");
assert.doesNotMatch(allClient, /leadAssignments|claimSubmissions|processingCases/);
assert.match(read("public/crm2-case.html"), /Send to Processing — Integration Pending/);
assert.match(read("public/crm2-assessment-builder.html"), /Send to Processing — Integration Pending/);
assert.match(read("public/admin-centre.html"), /href="\/crm2-login\.html"/);
assert.match(read("functions/index.js"), /request\.auth\.token\.platformAdmin !== true/);
assert.match(read("functions/index.js"), /CRM2_ROLES = new Set\(\["lister", "manager", "closer", "administrator"\]\)/);
assert.match(read("functions/index.js"), /workspaceId: "CRM2"/);
assert.match(read("functions/index.js"), /generatePasswordResetLink/);
assert.doesNotMatch(read("functions/index.js"), /password\s*:/i);
assert.doesNotMatch(read("functions/scripts/bootstrap-crm2-admin.js"), /AIza|BEGIN PRIVATE KEY|password\s*:/i);
assert.match(read("public/crm2-assessment-builder.html"), /quaerens\.crm2\.assessmentDraft\.v1/);
assert.match(read("public/crm2-assessment-builder.html"), /Sales promises reviewed/);

JSON.parse(read("package.json"));
JSON.parse(read("firebase.json"));
console.log(`CRM2 launch static validation passed (${pages.length} protected routes).`);
