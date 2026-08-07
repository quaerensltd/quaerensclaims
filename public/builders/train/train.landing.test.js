"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const publicDir = path.resolve(__dirname, "../..");
const page = fs.readFileSync(path.join(publicDir, "train-delay.html"), "utf8");
const runtime = fs.readFileSync(path.join(__dirname, "train.page.js"), "utf8");
const vercel = JSON.parse(fs.readFileSync(path.resolve(publicDir, "../vercel.json"), "utf8"));

assert.ok(page.includes('id="train-tool"'));
assert.ok(page.includes('id="train-builder"'));
assert.ok(page.indexOf('class="train-landing"') < page.indexOf('id="train-tool"'));
assert.strictEqual((page.match(/class="train-icon"/g) || []).length, 4);
assert.ok(page.includes('/images/framework-a/upherotraindelay.png'));
assert.ok(page.includes('/images/framework-a/upherotraindelaybooklet.png'));
assert.ok(page.includes('href="#train-rights"'));
assert.ok(page.includes('id="train-rights"'));
assert.ok(page.includes('src="builders/train/train.compensation.js"'));
assert.ok(page.includes('src="builders/train/train.documents.js"'));
assert.ok(page.includes('class="section qcb-builder-wrap train-modern-builder"'));
assert.ok(page.includes('class="qcb-builder qcb-framework-v1 train-modern-shell"'));
assert.ok(page.includes('class="card qcb-form qcb-airbnb-stage"'));
assert.ok(page.includes('class="sticky qcb-airbnb-preview"'));
assert.ok(page.includes('id="train-builder-modern-styles"'));
assert.ok(runtime.includes('const runtimeRoot = typeof globalThis'));
assert.ok(runtime.includes('tab.setAttribute("aria-selected", String(selected))'));
assert.ok(vercel.redirects.some(item => item.source === "/freetraindelay.html" && item.destination === "/train-delay.html" && item.permanent === true));

console.log("Train Framework A landing acceptance tests passed");
