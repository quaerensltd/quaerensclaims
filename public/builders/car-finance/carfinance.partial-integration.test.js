"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const config = require("./carfinance.config");
const {
  createCarFinancePackReference,
  createDraftEnvelope,
  normaliseDraftEnvelope,
  storageKeys
} = require("./carfinance.storage");
const { resolveCarFinanceReadinessShell, SHELL_STATUSES } = require("./carfinance.status");
const { SECTION_NAMES, toDocumentModel } = require("./carfinance.document-adapter");
const { SUPPORTED_EXPORTS, canExport, describeExportSupport, createExportManifest } = require("./carfinance.export-adapter");
const { registry } = require("../../complaint-builder/registry");

const categorySource = fs.readFileSync(path.join(__dirname, "../../complaint-builder/config/framework-a-categories-v1.4.js"), "utf8");
const runtimeSource = fs.readFileSync(path.join(__dirname, "../../airbnb-complaint-pack-v3.js"), "utf8");
const applicantSource = fs.readFileSync(path.join(__dirname, "../../complaint-builder/components/applicant-details.js"), "utf8");
const frameworkCss = fs.readFileSync(path.join(__dirname, "../../complaint-builder/styles/framework-v1-builder.css"), "utf8");

const pagePath = path.join(__dirname, "../../car-finance.html");
const page = fs.readFileSync(pagePath, "utf8");

assert.strictEqual(config.id, "car-finance", "Car Finance builder id");
assert.strictEqual(config.frameworkVersion, "QCBF 1.2", "Car Finance records QCBF 1.2");
assert.strictEqual(config.migrationStatus, "partial integration", "Car Finance is partial integration only");
assert.strictEqual(config.status, "partial integration", "config status is partial integration");
assert.strictEqual(config.publicPage, "/car-finance.html", "public page unchanged");
assert.strictEqual(config.packPrefix, "QC", "Car Finance uses shared QC pack prefix");
assert.strictEqual(config.storageNamespace, "qcbf-car-finance", "Car Finance storage namespace");
assert.ok(config.legacyStorageKeys.includes("quaerensCarFinanceToolDraftV1"), "legacy draft key retained");
assert.ok(config.exportSupport.includes("PDF"), "PDF export recorded");
assert.ok(config.exportSupport.includes("Word/RTF"), "Word/RTF export recorded");
assert.ok(config.exportSupport.includes("TXT"), "TXT export recorded");

const registryEntry = registry.get("car-finance");
assert.strictEqual(registryEntry.status, "partial integration", "central registry records partial integration");
assert.strictEqual(registryEntry.frameworkVersion, "QCBF 1.2", "central registry exposes framework version");
assert.strictEqual(registryEntry.packPrefix, "QC", "central registry exposes QC prefix");
assert.ok(registryEntry.modules.includes("storage-adapter"), "central registry records storage adapter");
assert.ok(registryEntry.modules.includes("document-adapter"), "central registry records document adapter");
assert.ok(registryEntry.exportSupport.includes("PDF"), "central registry records export support");
assert.strictEqual(registry.get("flight").status, "migrated", "Flight remains migrated");
assert.strictEqual(registry.get("holiday").status, "migrated", "Holiday remains migrated");

const ref = createCarFinancePackReference(null, { date: new Date("2026-07-22T12:00:00Z"), randomSource: () => 0.123456 });
assert.match(ref, /^QC-2026-[A-Z0-9]{6}$/, "pack reference format");
assert.strictEqual(createCarFinancePackReference(ref), ref, "existing pack reference is stable");
assert.strictEqual(createCarFinancePackReference("QF-2026-ABC123", { date: new Date("2026-07-22T12:00:00Z"), randomSource: () => 0.222222 }).slice(0, 8), "QC-2026-", "non-Car Finance prefix is replaced");

const envelope = createDraftEnvelope({ step: 3, answers: { fullName: "Example Customer" }, packReference: ref });
assert.strictEqual(envelope.meta.packReference, ref, "draft envelope stores pack reference");
assert.strictEqual(envelope.meta.storageNamespace, "qcbf-car-finance", "draft envelope stores namespace");
const normalised = normaliseDraftEnvelope({ step: 4, answers: { lender: "Example Finance" }, packReference: ref });
assert.strictEqual(normalised.step, 4, "legacy draft step is normalised");
assert.strictEqual(normalised.meta.packReference, ref, "legacy draft retains pack reference");
assert.strictEqual(storageKeys.session, "qcbf:car-finance:1:draft", "session storage key");
assert.strictEqual(storageKeys.remembered, "qcbf:car-finance:1:remembered", "remembered storage key");
assert.ok(!storageKeys.session.includes("flight"), "storage does not collide with Flight");
assert.ok(!storageKeys.session.includes("holiday"), "storage does not collide with Holiday");

const readiness = resolveCarFinanceReadinessShell({
  data: { fullName: "Example Customer", lender: "Example Finance", agreementType: "PCP", agreementRef: "ABC123" },
  evidence: ["Signed finance agreement", "Statement of account"]
});
assert.ok(SHELL_STATUSES.includes(readiness.frameworkStatus), "readiness shell returns a known status");
assert.notStrictEqual(readiness.frameworkStatus, "Ready to Submit", "readiness shell does not promote to final specialist status");

const model = toDocumentModel({ summary: "Summary text", letter: "Letter text" }, { packReference: ref });
assert.strictEqual(model.meta.builderId, "car-finance", "document model records builder id");
assert.strictEqual(model.meta.packReference, ref, "document model records pack reference");
assert.deepStrictEqual(model.sections.map((section) => section.name), SECTION_NAMES, "document adapter exposes expected sections");

SUPPORTED_EXPORTS.forEach((type) => assert.strictEqual(canExport(type), true, `${type} export is supported`));
assert.strictEqual(canExport("airline-json"), false, "unrelated export is not supported");
assert.ok(describeExportSupport().formats.includes("pdf"), "export descriptor includes PDF");
assert.strictEqual(createExportManifest(ref).packReference, ref, "export manifest records pack reference");

[
  'data-qcb-builder="car-finance"',
  'data-qcb-version="4"',
  "framework-a-category-adapters-v1.6.js",
  "framework-a-car-finance-adapter-v1.6.js",
  "applicant-details.js",
  "airbnb-complaint-pack-v3.js?v=1.6.0",
  "data-qcb-preview",
  "data-qcb-download-pdf",
  "data-qcb-download-word",
  "data-qcb-download-txt"
].forEach((marker) => assert.ok(page.includes(marker), `Framework A v1.6 marker present: ${marker}`));

[
  "function calcAgreement",
  "function redressMode",
  "CAR_FINANCE_STATUS_CONFIG",
  "window.jspdf",
  "quaerensCarFinanceToolDraftV1"
].forEach((marker) => assert.ok(!page.includes(marker), `legacy live runtime retired: ${marker}`));

assert.ok(page.includes('<meta charset="UTF-8"'), "page declares UTF-8");
assert.ok(page.includes("complaintPackReference") || page.includes("applicant-details.js"), "page inherits QCP reference wiring");
assert.ok(categorySource.includes('id: "car-finance", adapter: "car-finance", layoutProfile: "complex"'), "Car Finance opts into the declarative complex layout profile");
assert.ok(runtimeSource.includes('category.layoutProfile || "standard"'), "shared runtime resolves the declared layout profile");
assert.ok(runtimeSource.includes("root.dataset.qcbLayoutProfile = layoutProfile"), "shared runtime exposes the profile to the shared shell");
assert.ok(!runtimeSource.includes('builderId === "car-finance"'), "shared runtime contains no Car Finance layout branch");
assert.ok(!runtimeSource.includes("car-finance.html"), "shared runtime contains no Car Finance route branch");
assert.ok(applicantSource.includes('data-qcb-span="two-thirds"'), "shared Applicant Details exposes reusable field-span metadata");
assert.ok(frameworkCss.includes('[data-qcb-layout-profile="complex"].qcb-builder-wrap'), "shared stylesheet defines the opt-in complex profile");
assert.ok(frameworkCss.includes('[data-qcb-layout-profile="complex"] .qcb-group-heading'), "complex profile includes reusable section-heading treatment");
assert.ok(page.includes('class="qcb-group-heading"'), "Car Finance groups dense fields into readable sections");
assert.ok(page.includes('data-qcb-span="full"'), "Car Finance declares full-width fields where the content requires it");

const ids = [...page.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepStrictEqual([...new Set(duplicates)], [], "page should not contain duplicate HTML ids");

const scripts = [...page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/gi)]
  .filter((match) => !/\ssrc=/i.test(match[1]))
  .filter((match) => {
    const type = match[1].match(/\stype=["']([^"']+)["']/i);
    return !type || /(?:text|application)\/javascript|module/i.test(type[1]);
  })
  .map((match) => match[2])
  .filter((script) => script.trim());
scripts.forEach((script, index) => {
  assert.doesNotThrow(() => new Function(script), `inline script ${index + 1} parses`);
});

console.log("Car Finance Framework A v1.6 migration tests passed");
