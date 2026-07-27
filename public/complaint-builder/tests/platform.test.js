"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { registry, platformMetadata } = require("../registry");
const dashboard = require("../platform-dashboard");
const { documentModel, heading, paragraph } = require("../documents/DocumentModel");
const { renderText } = require("../documents/TextRenderer");
const { renderPrintHtml } = require("../documents/PrintRenderer");

const root = path.resolve(__dirname, "../../..");
const publicRoot = path.join(root, "public");

function readPublic(file) {
  return fs.readFileSync(path.join(publicRoot, file), "utf8");
}

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null,
    setItem: (key, value) => { data[key] = value; },
    removeItem: (key) => { delete data[key]; },
    dump: () => ({ ...data })
  };
}

assert.strictEqual(platformMetadata.platformName, "The Quaerens Consumer Complaint Platform", "public platform name");
assert.strictEqual(platformMetadata.outputName, "Quaerens Complaint Packs™", "Complaint Pack public product name");
assert.strictEqual(platformMetadata.evidenceEngineName, "Powered by the Quaerens Evidence Engine™", "Evidence Engine attribution");
assert.ok(!JSON.stringify(platformMetadata).includes("®"), "metadata must not use registered trademark symbol");

const expectedProducts = ["flight", "holiday", "baggage", "train", "parking", "car-finance", "gym", "cruise"];
expectedProducts.forEach((id) => {
  const entry = registry.get(id);
  assert.ok(entry, id + " registered");
  assert.strictEqual(entry.dashboardVisible, true, id + " visible on dashboard");
  assert.ok(entry.productName, id + " has product name");
  assert.ok(entry.packName, id + " has pack name");
  assert.ok(entry.canonicalUrl.startsWith("https://www.quaerens.co.uk/"), id + " has canonical URL");
  assert.ok(Array.isArray(entry.storageKeys) && entry.storageKeys.length, id + " has storage keys");
  assert.ok(Array.isArray(entry.supportedExports) && entry.supportedExports.includes("PDF"), id + " supports PDF export");
});

const publicProducts = registry.publicProducts();
assert.ok(publicProducts.length >= expectedProducts.length, "registry exposes public products");
assert.ok(publicProducts.every((product) => product.isLive === true), "public products are live entries");

const emptyResult = dashboard.discoverSavedPacks(memoryStorage());
assert.deepStrictEqual(emptyResult.packs, [], "empty browser storage returns no drafts");
assert.deepStrictEqual(emptyResult.errors, [], "empty browser storage returns no errors");

const savedStore = memoryStorage({
  "qcbf-train-draft-v1": JSON.stringify({
    state: {
      meta: { packReference: "QT-2026-ABC123", updatedAt: "2026-07-27" },
      operator: "Example Rail",
      primaryIssue: "Train cancelled",
      readiness: { status: "Ready to Submit" }
    }
  }),
  "qcbf-gym-draft": JSON.stringify({
    state: {
      meta: { packReference: "QG-2026-GYM001", updatedAt: "2026-07-26" },
      gymName: "Example Gym",
      primaryIssue: "Cancellation refused",
      status: "Needs Evidence"
    }
  }),
  "qcbf-cruise-draft": "{ broken json"
});
const savedResult = dashboard.discoverSavedPacks(savedStore);
assert.strictEqual(savedResult.packs.length, 2, "valid local drafts are discovered");
assert.strictEqual(savedResult.errors.length, 1, "corrupted draft is reported without breaking dashboard");
assert.ok(savedResult.packs.some((pack) => pack.packReference === "QT-2026-ABC123"), "train draft appears");
assert.ok(savedResult.packs.some((pack) => pack.packReference === "QG-2026-GYM001"), "gym draft appears");

const platformPage = readPublic("complaint-platform.html");
assert.ok(platformPage.includes("<meta charset=\"UTF-8\">"), "platform page declares UTF-8");
assert.ok(platformPage.includes("<meta name=\"robots\" content=\"index, follow\">"), "platform page is indexable");
assert.ok(platformPage.includes("<h1>The Quaerens Consumer Complaint Platform</h1>"), "platform page H1");
assert.ok(platformPage.includes("Quaerens Complaint Packs™"), "platform page mentions product name");
assert.ok(platformPage.includes("Powered by the Quaerens Evidence Engine™"), "platform page mentions Evidence Engine");
assert.ok(/"@type"\s*:\s*"FAQPage"/.test(platformPage), "platform page includes FAQ schema");
assert.ok(!platformPage.includes("®"), "platform page does not use registered trademark symbol");

const dashboardPage = readPublic("my-complaint-packs.html");
assert.ok(dashboardPage.includes("<meta charset=\"UTF-8\">"), "dashboard page declares UTF-8");
assert.ok(dashboardPage.includes("<meta name=\"robots\" content=\"noindex, follow\">"), "dashboard is noindex follow");
assert.ok(dashboardPage.includes("<h1>My Complaint Packs</h1>"), "dashboard page H1");
assert.ok(dashboardPage.includes("stored locally in this browser"), "dashboard page states local storage");

const model = documentModel({ title: "Quaerens Consumer Complaint File", packReference: "QA-2026-TEST01" }, [
  heading("Complaint Summary", 1),
  paragraph("Example complaint pack content.")
]);
const text = renderText(model);
assert.ok(text.includes("QUAERENS COMPLAINT PACK™"), "text export includes Complaint Pack brand");
assert.ok(text.includes("Powered by the Quaerens Evidence Engine™"), "text export includes Evidence Engine brand");
const print = renderPrintHtml(model);
assert.ok(print.includes("Quaerens Complaint Pack™"), "print export includes Complaint Pack brand");
assert.ok(print.includes("Powered by the Quaerens Evidence Engine™"), "print export includes Evidence Engine brand");

console.log("Platform branding and dashboard tests passed");
