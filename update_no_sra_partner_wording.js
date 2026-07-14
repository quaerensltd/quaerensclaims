const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && full.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

const neutralRegulatedWording =
  "Quaerens is not a law firm or FCA-authorised claims management company. We help organise evidence and prepare information for review. Where legal advice or regulated claims work may be required, we will explain this clearly before any next step is taken.";

const neutralFooterWording =
  "If, after review, the information suggests the matter may require legal advice or regulated claims work, Quaerens will explain this clearly before any next step is taken. No outcome is guaranteed and any next step depends on the facts, documents and eligibility checks.";

const replacements = [
  [
    "Quaerens can help organise the evidence and complaint pack. If the matter requires regulated claims management or legal work, suitable cases may be referred to an FCA-authorised CMC or SRA-regulated legal partner.",
    "Quaerens can help organise the evidence and complaint pack. If the matter may require legal advice or regulated claims work, we will explain this clearly before any next step is taken.",
  ],
  [
    "Quaerens is not a law firm or FCA-authorised claims management company. We help organise evidence and prepare information for review. Where regulated claims work is required, suitable matters may be referred to authorised legal or claims-management partners.",
    neutralRegulatedWording,
  ],
  [
    "Quaerens is not a law firm and does not provide legal advice. Where regulated claims management or legal work is required, suitable matters may be referred to FCA-authorised claims-management or SRA-regulated legal partners.",
    "Quaerens is not a law firm and does not provide legal advice. Where legal advice or regulated claims work may be required, we will explain this clearly before any next step is taken.",
  ],
  [
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. We do not promise outcomes. Where a matter requires regulated claims management, legal advice, court representation or specialist case handling, suitable matters may be referred to authorised legal or claims-management partners.",
    "Quaerens provides practical dispute support, evidence organisation and complaint preparation assistance. We do not promise outcomes. Where a matter may require regulated claims management, legal advice, court representation or specialist case handling, we will explain this clearly before any next step is taken.",
  ],
  [
    "Free, no-obligation review by our specialist team and external legal partners",
    "Free, no-obligation review by our specialist team",
  ],
  [
    "Quaerens is an approachable, assistance service. We work with you to prepare the right documents and guide your next steps. We’re not a law firm — instead, we connect you with trusted external legal partners when specialist advice is needed.",
    "Quaerens is an approachable assistance service. We work with you to prepare the right documents and guide your next steps. We are not a law firm and do not provide legal advice. Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "Quaerens is an approachable, assistance service. We work with you to prepare the right documents and guide your next steps. Weâ€™re not a law firm â€” instead, we connect you with trusted external legal partners when specialist advice is needed.",
    "Quaerens is an approachable assistance service. We work with you to prepare the right documents and guide your next steps. We are not a law firm and do not provide legal advice. Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "If, after review, the information suggests the client may have a viable case, Quaerens may refer the matter to suitable legal partners for the next stage. Referral is not guaranteed and depends on the facts, documents and eligibility checks.",
    neutralFooterWording,
  ],
  [
    "Where regulated claims work is needed, Quaerens may refer suitable APP fraud matters to authorised claims management or legal partners.",
    "Where legal advice or regulated claims work may be needed, Quaerens will explain this clearly before any next step is taken.",
  ],
  [
    "Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or legal partner.",
    "Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or specialist advice route.",
  ],
  [
    "Quaerens is not a law firm and does not provide legal advice. If a review suggests that legal or regulated claims work is required, suitable matters may be referred to authorised legal or claims-management partners.",
    "Quaerens is not a law firm and does not provide legal advice. If a review suggests that legal advice or regulated claims work may be required, Quaerens will explain this clearly before any next step is taken.",
  ],
  [
    "Where specialist advice is needed, we may connect users with trusted external legal partners.",
    "Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "Whether you're enforcing debts abroad or navigating international disputes, our network of legal partners helps you take control — across Europe and beyond.",
    "Whether you're enforcing debts abroad or navigating international disputes, our structured support helps you take control across Europe and beyond.",
  ],
  [
    "“Our UK company faced difficulties recovering a commercial debt from a Spanish client. Quaerens coordinated with experienced legal partners abroad and secured a successful resolution within eight weeks.”",
    "“Our UK company faced difficulties recovering a commercial debt from a Spanish client. Quaerens helped organise the next-step process abroad and supported a successful resolution within eight weeks.”",
  ],
  [
    "External legal partner referral where appropriate",
    "Clear next-step explanation where specialist advice may be needed",
  ],
  [
    "Quaerens helps consumers organise the facts, understand possible routes and prepare stronger complaints or claim documents. Where specialist legal advice is needed, we can help connect suitable cases with external legal partners.",
    "Quaerens helps consumers organise the facts, understand possible routes and prepare stronger complaints or claim documents. Where specialist legal advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "Quaerens is an approachable assistance service. We help prepare documents, guide next steps and connect suitable cases with trusted external legal partners when specialist advice is needed.",
    "Quaerens is an approachable assistance service. We help prepare documents and guide next steps. Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "We’re not a law firm — instead, we connect you with trusted external legal partners when specialist advice is needed.",
    "We are not a law firm and do not provide legal advice. Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "Weâ€™re not a law firm â€” instead, we connect you with trusted external legal partners when specialist advice is needed.",
    "We are not a law firm and do not provide legal advice. Where specialist advice or regulated work may be needed, we will explain this clearly before any next step is taken.",
  ],
  [
    "Connect you with trusted external legal partners where specialist advice is needed.",
    "Explain clearly where specialist advice or regulated work may be needed.",
  ],
  [
    "Where regulated claims work, legal advice or representation is required, suitable matters may be referred to authorised legal or claims-management partners.",
    "Where regulated claims work, legal advice or representation may be required, we will explain this clearly before any next step is taken.",
  ],
  ["Partner route where needed", "Regulated work explained clearly"],
  [
    "Monday to Friday, 9:00am to 5:30pm UK time.",
    "Phone support Monday-Friday 09:00-17:00. Email support Monday-Friday 09:00-19:00 and Saturday-Sunday 12:00-17:00.",
  ],
  [
    "Address: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ",
    "Registered office and correspondence: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ<br>Assessment and processing: 3rd Floor, Broadstone Mill, Stockport Business and Innovation Centre, Stockport SK5 7DL",
  ],
];

let changed = 0;
for (const file of walk(root)) {
  let text = fs.readFileSync(file, "utf8");
  const before = text;

  for (const [from, to] of replacements) {
    text = text.split(from).join(to);
  }

  text = text.replace(
    /suitable matters may be referred to authorised legal or claims-management partners\./g,
    "we will explain this clearly before any next step is taken."
  );
  text = text.replace(
    /suitable matters may be referred to FCA-authorised claims-management or SRA-regulated legal partners\./g,
    "we will explain this clearly before any next step is taken."
  );
  text = text.replace(
    /suitable cases may be referred to an FCA-authorised CMC or SRA-regulated legal partner\./g,
    "we will explain this clearly before any next step is taken."
  );
  text = text.replace(
    /suitable matters may be referred to authorised legal or claims-management partners/g,
    "we will explain this clearly before any next step is taken"
  );
  text = text.replace(/trusted external legal partners/g, "clear specialist next-step guidance");
  text = text.replace(/external legal partners/g, "specialist next-step guidance");
  text = text.replace(/legal partners/g, "specialist next-step routes");
  text = text.replace(/legal partner/g, "specialist next-step route");
  text = text.replace(/SRA-regulated/g, "regulated");

  if (text !== before) {
    fs.writeFileSync(file, text, "utf8");
    changed += 1;
    console.log("updated", path.relative(__dirname, file));
  }
}

console.log(`Updated ${changed} file(s).`);
