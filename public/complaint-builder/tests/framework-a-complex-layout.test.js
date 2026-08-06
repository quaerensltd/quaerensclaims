"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "../..");
const categorySource = fs.readFileSync(path.join(root, "complaint-builder/config/framework-a-categories-v1.4.js"), "utf8");
const runtimeSource = fs.readFileSync(path.join(root, "airbnb-complaint-pack-v3.js"), "utf8");
const css = fs.readFileSync(path.join(root, "complaint-builder/styles/framework-v1-builder.css"), "utf8");
const applicant = fs.readFileSync(path.join(root, "complaint-builder/components/applicant-details.js"), "utf8");

assert.match(categorySource, /id: "car-finance", adapter: "car-finance", layoutProfile: "complex"/);
["airbnb", "section75", "holiday", "flight", "cruise", "baggage"].forEach((id) => {
  const categoryLine = categorySource.split(/\r?\n/).find((line) => line.includes(`id: "${id}"`));
  assert.ok(categoryLine, `${id} remains registered`);
  assert.ok(!categoryLine.includes("layoutProfile"), `${id} retains the standard layout profile`);
});
assert.match(runtimeSource, /const layoutProfile = category\.layoutProfile \|\| "standard"/);
assert.match(runtimeSource, /\["standard", "complex"\]\.includes\(layoutProfile\)/);
assert.doesNotMatch(runtimeSource, /builderId\s*===?\s*["']car-finance["']/);
assert.doesNotMatch(runtimeSource, /car-finance\.html/);
assert.match(css, /\[data-qcb-layout-profile="complex"\]\.qcb-builder-wrap/);
assert.match(css, /grid-template-columns:\s*minmax\(0,1\.75fr\) minmax\(410px,\.95fr\)/);
assert.match(css, /@media\(max-width:1180px\)/);
assert.match(css, /@media\(max-width:820px\)/);
assert.match(css, /@media\(max-width:560px\)/);
["full", "third", "two-thirds", "half"].forEach((span) => {
  assert.ok(css.includes(`data-qcb-span="${span}"`), `complex profile supports ${span} fields`);
});
assert.match(applicant, /data-qcb-span="two-thirds"/);
assert.match(applicant, /data-qcb-span="third"/);

console.log("Framework A complex layout profile tests passed");
