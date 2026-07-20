"use strict";

const fs = require("fs");
const path = require("path");

function arg(name) {
  const index = process.argv.indexOf("--" + name);
  return index >= 0 ? process.argv[index + 1] : "";
}

const id = arg("id");
const name = arg("name");
const prefix = (arg("prefix") || "QC").toUpperCase();

if (!/^[a-z0-9-]+$/.test(id || "")) {
  console.error("Use --id with lowercase letters, numbers and hyphens only.");
  process.exit(1);
}

if (!name) {
  console.error("Use --name \"Builder Name\".");
  process.exit(1);
}

if (!/^[A-Z0-9]{1,4}$/.test(prefix)) {
  console.error("Use --prefix with 1 to 4 uppercase letters or numbers.");
  process.exit(1);
}

const root = path.join(process.cwd(), "public", "builders", id);
if (fs.existsSync(root)) {
  console.error("Builder already exists: " + root);
  process.exit(1);
}

fs.mkdirSync(root, { recursive: true });

const files = {
  [`${id}.config.js`]: `"use strict";\n\nmodule.exports = {\n  id: "${id}",\n  productName: "${name}",\n  shortName: "${name}",\n  pageTitle: "${name} | Quaerens",\n  h1: "${name}",\n  canonicalUrl: "https://www.quaerens.co.uk/${id}.html",\n  storageNamespace: "${id}",\n  schemaVersion: 1,\n  packPrefix: "${prefix}",\n  stages: [\n    { id: "start", label: "Start" },\n    { id: "details", label: "Details" },\n    { id: "evidence", label: "Evidence" },\n    { id: "review", label: "Review" },\n    { id: "ready", label: "Ready to submit" }\n  ],\n  essentialFields: []\n};\n`,
  [`${id}.questions.js`]: `"use strict";\n\nmodule.exports = [];\n`,
  [`${id}.analysis.js`]: `"use strict";\n\nmodule.exports = { analyse(data) { return { data }; } };\n`,
  [`${id}.evidence.js`]: `"use strict";\n\nmodule.exports = [];\n`,
  [`${id}.documents.js`]: `"use strict";\n\nmodule.exports = { buildDocumentModel() { return null; } };\n`,
  [`${id}.submission.js`]: `"use strict";\n\nmodule.exports = { entries: [] };\n`,
  [`${id}.resources.js`]: `"use strict";\n\nmodule.exports = [];\n`,
  [`${id}.tests.js`]: `"use strict";\n\nconst assert = require('assert');\nassert.ok(true);\n`
};

Object.entries(files).forEach(([file, content]) => fs.writeFileSync(path.join(root, file), content, "utf8"));
console.log("Created builder scaffold at " + root);
