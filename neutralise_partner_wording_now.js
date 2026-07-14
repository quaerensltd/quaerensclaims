const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

const neutralRegulated =
  "Quaerens is not a law firm or FCA-authorised claims management company. We help organise evidence and prepare information for review. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.";

const neutralFooter =
  "If, after review, the information suggests the matter may require legal advice, regulated claims work or specialist input, Quaerens will explain this clearly before any next step is taken. No outcome is guaranteed and any next step depends on the facts, documents and eligibility checks.";

const exactReplacements = [
  [
    /Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance\. We do not promise outcomes, and where a case needs legal advice, court representation or regulated claims management, suitable matters may be referred to authorised legal or claims-management partners\./g,
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. We do not promise outcomes. If a matter appears to require legal advice, court representation, regulated claims management or specialist case handling, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm or FCA-authorised claims management company\. We help organise evidence and prepare information for review\. Where regulated claims work, legal advice or representation is required, suitable matters may be referred to authorised legal or claims-management partners\./g,
    neutralRegulated,
  ],
  [
    /Quaerens can help organise the evidence and complaint pack\. If the matter requires regulated claims management or legal work, suitable cases may be referred to an FCA-authorised CMC or SRA-regulated legal partner\./g,
    "Quaerens can help organise the evidence and complaint pack. If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice\. Where regulated claims management or legal work is required, suitable matters may be referred to FCA-authorised claims-management or SRA-regulated legal partners\./g,
    "Quaerens is not a law firm and does not provide legal advice. If regulated claims management or legal work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Where regulated claims work is needed, Quaerens may refer suitable APP fraud matters to authorised claims management or legal partners\./g,
    "Quaerens can help organise evidence for APP fraud refund complaints. If legal advice or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or legal partner\./g,
    "Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or another clearly explained specialist route.",
  ],
  [
    /Quaerens is not a law firm and does not provide legal advice\. If a review suggests that legal or regulated claims work is required, suitable matters may be referred to authorised legal or claims-management partners\./g,
    "Quaerens is not a law firm and does not provide legal advice. If a review suggests that legal or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
  [
    /If, after review, the information suggests the client may have a viable case, Quaerens may refer the matter to suitable legal partners for the next stage\. No outcome is guaranteed and any next step depends on the facts, documents and eligibility checks\./g,
    neutralFooter,
  ],
  [
    /If, after review, the information suggests the matter may have a viable route, Quaerens may refer the matter to suitable legal partners for the next stage\. No outcome is guaranteed and any next step depends on the facts, documents and eligibility checks\./g,
    neutralFooter,
  ],
  [
    /Free, no-obligation review by our specialist team and external legal partners/g,
    "Free, no-obligation review by our specialist team",
  ],
  [
    /We’re not a law firm — instead, we connect you with trusted external legal partners when specialist advice is needed\./g,
    "We are not a law firm and do not provide legal advice. If specialist advice may be needed, we explain that clearly before any next step is taken.",
  ],
  [
    /External legal partner referral where appropriate/g,
    "Clear next-step guidance where specialist input may be needed",
  ],
  [
    /where specialist legal advice is needed, we can help connect suitable cases with external legal partners/g,
    "where specialist legal advice may be needed, we explain that clearly before any next step is taken",
  ],
  [
    /connect suitable cases with trusted external legal partners when specialist advice is needed/g,
    "explain clearly when specialist advice may be needed before any next step is taken",
  ],
  [
    /Connect you with trusted external legal partners where specialist advice is needed\./g,
    "Explain clearly if specialist advice, legal advice or regulated claims work may be needed before any next step is taken.",
  ],
  [
    /Where specialist advice is needed, we may connect users with trusted external legal partners\./g,
    "If specialist advice, legal advice or regulated claims work may be needed, we explain this clearly before any next step is taken.",
  ],
  [/network of legal partners/g, "specialist support network"],
  [/legal partners abroad/g, "specialist support contacts abroad"],
  [/Monday to Friday, 9:00am to 5:30pm UK time\./g, "Phone support Monday to Friday, 9:00am to 5:00pm UK time. Email support Monday to Friday, 9:00am to 7:00pm, and Saturday to Sunday, 12:00pm to 5:00pm."],
  [
    /Where regulated claims work, legal advice or representation is required, suitable matters may be referred to authorised legal or claims-management partners\./g,
    "If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken.",
  ],
];

const broadReplacements = [
  [/SRA-regulated/gi, "regulated"],
  [/FCA-authorised CMC/gi, "regulated route"],
  [/trusted external legal partners/gi, "specialist support routes"],
  [/external legal partners/gi, "specialist support routes"],
  [/authorised legal or claims-management partners/gi, "appropriate specialist routes"],
  [/authorised claims management or legal partners/gi, "appropriate specialist routes"],
  [/claims-management partners/gi, "specialist routes"],
  [/legal partners/gi, "specialist support routes"],
  [/legal partner/gi, "specialist route"],
];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.isFile() && entry.name.endsWith(".html") ? [full] : [];
  });
}

let changed = 0;
for (const file of walk(publicDir)) {
  let text = fs.readFileSync(file, "utf8");
  const original = text;
  for (const [from, to] of exactReplacements) text = text.replace(from, to);
  for (const [from, to] of broadReplacements) text = text.replace(from, to);
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    changed++;
  }
}

console.log(`Updated ${changed} HTML files.`);
