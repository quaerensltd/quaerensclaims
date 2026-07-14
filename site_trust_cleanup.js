const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  });
}

const replacements = [
  [
    /We use this to contact you about your request\. This is not legal advice and does not start a paid service\./g,
    'We use this to contact you about your request. Sending the form does not start a paid service.'
  ],
  [
    /This guidance is for document organisation and complaint preparation\. It is not legal advice and does not guarantee an outcome\./g,
    'This guidance is for document organisation and complaint preparation. Outcomes depend on the documents, timing, evidence and organisation involved.'
  ],
  [
    /This guidance is for document organisation and complaint preparation\. It is not legal advice and does not guarantee compensation\./g,
    'This guidance is for document organisation and complaint preparation. Compensation depends on the documents, timing, evidence and organisation involved.'
  ],
  [
    /This guidance is for document organisation and complaint preparation\. It is not legal advice and does not guarantee a refund\./g,
    'This guidance is for document organisation and complaint preparation. Refund routes depend on the documents, timing, evidence and organisation involved.'
  ],
  [
    /This guide is general information, not legal advice\. The right route depends on/g,
    'This guide is general information. The right route depends on'
  ],
  [
    /If legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    'If specialist or regulated support may be required, we explain this clearly before any next step is taken.'
  ],
  [
    /If legal advice, court representation or regulated claims work may be required, Quaerens will explain this clearly before any next step is taken\./g,
    'If specialist or regulated support may be required, Quaerens will explain this clearly before any next step is taken.'
  ],
  [
    /If a review suggests that legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    'If a review suggests that specialist or regulated support may be required, we explain this clearly before any next step is taken.'
  ],
  [
    /If, after review, the information suggests the matter may require legal advice, regulated claims work or specialist input, Quaerens will explain this clearly before any next step is taken\./g,
    'If, after review, the information suggests the matter may require specialist or regulated support, Quaerens will explain this clearly before any next step is taken.'
  ],
  [
    /If a matter appears to need regulated claims management, legal advice, court representation or specialist case handling, we explain this clearly before any next step is taken\./g,
    'If a matter appears to need specialist or regulated case handling, we explain this clearly before any next step is taken.'
  ],
  [
    /If a matter may require regulated claims work, legal advice, court representation or specialist input, we explain this clearly before any next step is taken\./g,
    'If a matter may require specialist or regulated input, we explain this clearly before any next step is taken.'
  ],
  [
    /If specialist legal advice may be needed, we explain this clearly before any next step is taken\./g,
    'If specialist input may be needed, we explain this clearly before any next step is taken.'
  ],
  [
    /If specialist legal advice, court representation or regulated claims work may be required, we explain this clearly before any next step is taken\./g,
    'If specialist or regulated support may be required, we explain this clearly before any next step is taken.'
  ],
  [
    /If legal advice or specialist input may be needed we explain this clearly before any next step is taken\./g,
    'If specialist input may be needed we explain this clearly before any next step is taken.'
  ],
  [
    /If legal advice, representation or regulated claims work may be required, Quaerens will explain this clearly before any next step is taken\./g,
    'If specialist or regulated support may be required, Quaerens will explain this clearly before any next step is taken.'
  ],
  [
    /Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider, legal advice or specialist input\./g,
    'Depending on the dispute, escalation may involve a complaints team, ombudsman, regulator, card provider or specialist input.'
  ],
  [
    /We do not provide legal advice or guarantee outcomes\./g,
    'We explain possible next steps clearly and do not guarantee outcomes.'
  ],
  [
    /does not provide legal advice and does not guarantee the airline will approve my claim/g,
    'helps prepare the claim letter and does not guarantee the airline will approve my claim'
  ],
  [
    /We do not provide legal advice and we do not take a percentage of your compensation\./g,
    'We help prepare your documents and we do not take a percentage of your compensation.'
  ],
  [
    /This is not legal advice, a refund promise or a guaranteed outcome\./g,
    'This is an information-only summary, not a refund promise or a guaranteed outcome.'
  ],
  [
    /It is not legal advice\./g,
    'It is practical guidance only.'
  ],
  [
    /This is not legal advice/g,
    'This is practical guidance'
  ],
  [
    /not legal advice/g,
    'practical guidance'
  ],
  [
    /legal advice, court representation or regulated claims work/g,
    'specialist or regulated support'
  ],
  [
    /legal advice, court representation or specialist input/g,
    'specialist input'
  ],
  [
    /legal advice, regulated claims work or specialist input/g,
    'specialist or regulated support'
  ],
  [
    /regulated claims work, legal advice, court representation or specialist input/g,
    'specialist or regulated input'
  ],
  [
    /regulated claims management, legal advice, court representation or specialist case handling/g,
    'specialist or regulated case handling'
  ],
  [
    /specialist legal advice/g,
    'specialist input'
  ],
  [
    /Spanish legal advice/g,
    'Spanish property dispute support'
  ],
  [
    /legal advice/g,
    'specialist input'
  ],
  [
    /not a law firm/g,
    'a practical dispute support service'
  ],
  [
    /Not a law firm/g,
    'Practical dispute support'
  ],
  [
    /legal adviser/g,
    'specialist adviser'
  ],
  [
    /legal advisor/g,
    'specialist adviser'
  ]
];

let changed = 0;
const changedFiles = [];

for (const file of walk(publicDir)) {
  if (!/\.(html|txt|xml|json|js)$/i.test(file)) continue;
  let text = fs.readFileSync(file, 'utf8');
  const original = text;
  for (const [pattern, replacement] of replacements) {
    text = text.replace(pattern, replacement);
  }
  if (text !== original) {
    fs.writeFileSync(file, text, 'utf8');
    changed += 1;
    changedFiles.push(path.relative(__dirname, file));
  }
}

console.log(`Updated ${changed} public files.`);
for (const file of changedFiles) console.log(file);
