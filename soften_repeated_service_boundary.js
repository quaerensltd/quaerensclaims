const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

const replacements = [
  [
    /Quaerens is a UK consumer dispute support platform\. The site helps visitors organise evidence, understand complaint routes and prepare practical next steps across property, finance, travel, digital platform and everyday consumer issues\. Quaerens is not a law firm and does not guarantee outcomes\./g,
    "Quaerens is a UK consumer dispute support platform. The site helps visitors organise evidence, understand complaint routes and prepare practical next steps across property, finance, travel, digital platform and everyday consumer issues. Quaerens provides practical dispute support and does not guarantee outcomes.",
  ],
  [
    /Quaerens is not a law firm\. We provide document preparation, claim guidance and referral support through external specialists where appropriate\./g,
    "Quaerens provides document preparation, claim guidance and practical referral support through external specialists where appropriate.",
  ],
  [
    /We are not a law firm\. If specialist legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    "If specialist legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm or FCA-authorised claims management company\. We help organise evidence and prepare information for review\. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    "Quaerens helps organise evidence and prepare information for review. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm or FCA-authorised claims management company\. We help organise evidence and prepare information for review\. Where legal advice or regulated claims work may be required, we will explain this clearly before any next step is taken\./g,
    "Quaerens helps organise evidence and prepare information for review. Where legal advice or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice\. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice\. If a review suggests that legal advice, court representation or regulated claims work may be required, Quaerens will explain this clearly before any next step is taken\./g,
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. If a review suggests that legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice\. If a matter appears to need regulated claims management, legal advice, court representation or specialist case handling, we explain this clearly before any next step is taken\./g,
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. If a matter appears to need regulated claims management, legal advice, court representation or specialist case handling, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice/g,
    "Quaerens provides practical dispute support and document preparation assistance",
  ],
  [
    /We are not a law firm and do not provide legal advice\./g,
    "Our support is focused on evidence organisation, practical dispute preparation and clearer next-step planning.",
  ],
  [
    /We are not a law firm\. If specialist advice may be needed, we explain this clearly before any next step is taken\./g,
    "If specialist advice may be needed, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm\. We provide structured review and document support\. We do not provide legal advice or guarantee outcomes\./g,
    "Quaerens provides structured review and document support. We do not guarantee outcomes, and if legal advice or specialist input may be needed we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm\. We provide structured escalation support and drafting assistance for new build complaints\. We do not guarantee outcomes\./g,
    "Quaerens provides structured escalation support and drafting assistance for new build complaints. We do not guarantee outcomes.",
  ],
  [
    /We are a professional service company, not a law firm, focused on delivering a clear, reliable, and efficient resolution\./g,
    "We are a professional service company focused on clear, reliable and efficient dispute support.",
  ],
  [
    /We are a professional service company, not a law firm, focused on helping people present their position clearly and responsibly\./g,
    "We are a professional service company focused on helping people present their position clearly and responsibly.",
  ],
  [
    /We are not a law firm and we do not guarantee outcomes; our work is evidence organisation, practical dispute support and clear route guidance\./g,
    "Our work is evidence organisation, practical dispute support and clear route guidance. We do not guarantee outcomes.",
  ],
  [
    /Quaerens is not a law firm and does not guarantee outcomes\./g,
    "Quaerens provides practical dispute support and does not guarantee outcomes.",
  ],
  [
    /No\. Quaerens is not a law firm and does not provide Spanish legal advice\./g,
    "No. Quaerens does not provide Spanish legal advice.",
  ],
  [
    /Quaerens helps organise evidence and complaint preparation\. We are not a law firm, do not provide regulated mortgage advice and do not guarantee outcomes\./g,
    "Quaerens helps organise evidence and complaint preparation. We do not provide regulated mortgage advice and we do not guarantee outcomes.",
  ],
];

let changed = 0;

for (const file of walk(publicDir)) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }

  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    changed += 1;
    console.log(`updated ${path.relative(__dirname, file)}`);
  }
}

console.log(`Done. Updated ${changed} HTML files.`);
