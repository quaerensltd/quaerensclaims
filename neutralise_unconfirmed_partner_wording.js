const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");

const regulated =
  "Quaerens is not a law firm or FCA-authorised claims management company. We help organise evidence and prepare information for review. If legal advice, court representation or regulated claims work may be required, we will explain this clearly before any next step is taken.";

const footer =
  "If, after review, the information suggests the matter may require legal advice or regulated claims work, Quaerens will explain this clearly before any next step is taken. No outcome is guaranteed and any next step depends on the facts, documents and eligibility checks.";

const hours =
  "Phone support Monday-Friday 09:00-17:00. Email support Monday-Friday 09:00-19:00 and Saturday-Sunday 12:00-17:00.";

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const replacements = [
  [
    "Quaerens is not a law firm or FCA-authorised claims management company. We help organise evidence and prepare information for review. Where regulated claims work is required, suitable matters may be referred to authorised legal or claims-management partners.",
    regulated,
  ],
  [
    "Quaerens is not a law firm and does not provide legal advice. Where regulated claims management or legal work is required, suitable matters may be referred to FCA-authorised claims-management or SRA-regulated legal partners.",
    regulated,
  ],
  [
    "Quaerens can help organise the evidence and complaint pack. If the matter requires regulated claims management or legal work, suitable cases may be referred to an FCA-authorised CMC or SRA-regulated legal partner.",
    "Quaerens can help organise the evidence and complaint pack. If the matter may require legal advice, court representation or regulated claims work, we will explain this clearly before any next step is taken.",
  ],
  [
    "Where regulated claims work is needed, Quaerens may refer suitable APP fraud matters to authorised claims management or legal partners.",
    "Where legal advice, court representation or regulated claims work may be required, Quaerens will explain this clearly before any next step is taken.",
  ],
  [
    "If, after review, the information suggests the client may have a viable case, Quaerens may refer the matter to suitable legal partners for the next stage. Referral is not guaranteed and depends on the facts, documents and eligibility checks.",
    footer,
  ],
  ["Monday to Friday, 9:00am to 5:30pm UK time.", hours],
  ["Partner route where needed", "Regulated work explained"],
  ["External legal partner referral", "Specialist next-step route"],
  ["trusted external legal partners", "specialist next-step routes"],
  ["external legal partners", "specialist next-step routes"],
  ["legal partners abroad", "independent specialist routes abroad"],
  ["legal partners", "specialist support routes"],
  ["legal partner", "specialist support route"],
  ["SRA-regulated", "regulated"],
  ["FCA-authorised CMC", "appropriate regulated route"],
];

const regexReplacements = [
  [
    /Where regulated claims work(?:, legal advice or representation)? is required, suitable matters may be referred to authorised legal or claims-management partners\./g,
    "If legal advice, court representation or regulated claims work may be required, we will explain this clearly before any next step is taken.",
  ],
  [
    /Where a matter requires regulated claims management, legal advice, court representation or specialist case handling, suitable matters may be referred to authorised legal or claims-management partners\./g,
    "If a matter may require legal advice, court representation, regulated claims work or specialist case handling, we will explain this clearly before any next step is taken.",
  ],
  [
    /Connect you with specialist next-step routes where specialist advice is needed\./g,
    "Explain where specialist advice may be required before any next step is taken.",
  ],
  [
    /connect you with specialist next-step routes when specialist advice is needed\./g,
    "explain where specialist advice may be required before any next step is taken.",
  ],
  [
    /Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or specialist support route\./g,
    "Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or a clearly explained specialist route.",
  ],
];

let changed = 0;

for (const file of walk(root)) {
  const before = fs.readFileSync(file, "utf8");
  let after = before;

  for (const [from, to] of replacements) {
    after = after.split(from).join(to);
  }

  for (const [pattern, to] of regexReplacements) {
    after = after.replace(pattern, to);
  }

  if (after !== before) {
    fs.writeFileSync(file, after, "utf8");
    console.log(`updated ${path.relative(__dirname, file)}`);
    changed += 1;
  }
}

console.log(`Neutralised wording in ${changed} file(s).`);
