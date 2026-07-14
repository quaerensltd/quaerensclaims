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

const htmlLinkNote =
  'Please save <a href="tel:+442080500725">+44 (0)20 8050 0725</a> as Quaerens before requesting a call back, so you will recognise our calls!';

const htmlLinkNoteWithClass =
  'Please save <a href="tel:+442080500725" class="text-blue-700 font-extrabold no-underline">+44 (0)20 8050 0725</a> as Quaerens before requesting a call back, so you will recognise our calls!';

const plainNote =
  "Please save +44 (0)20 8050 0725 as Quaerens before requesting a call back, so you will recognise our calls!";

const successNote =
  "Thank you. Your call back request has been sent to our intake team. Please save +44 (0)20 8050 0725 as Quaerens so you will recognise our calls!";

const successNoteCallback =
  "Thank you. Your callback request has been sent. Please save +44 (0)20 8050 0725 as Quaerens so you will recognise our calls!";

const replacements = [
  [
    /Please save <a href="tel:\+442080500725" class="text-blue-700 font-extrabold no-underline">\+44 \(0\)20 8050 0725<\/a> as Quaerens before requesting a call back, so you know it is us if your phone marks unknown numbers as spam\./g,
    htmlLinkNoteWithClass,
  ],
  [
    /Please save <a href="tel:\+442080500725">\+44 \(0\)20 8050 0725<\/a> as Quaerens before requesting a call back, so you know it is us if your phone marks unknown numbers as spam\./g,
    htmlLinkNote,
  ],
  [
    /Some networks mark unfamiliar business numbers as spam\. Saving <a href="tel:\+442080500725">(\+44 \(0\)20 8050 0725)<\/a> as Quaerens helps you recognise us if you request a call\./g,
    'Please save <a href="tel:+442080500725">$1</a> as Quaerens before requesting a call back, so you will recognise our calls!',
  ],
  [
    /Some networks mark unfamiliar business numbers as spam\. Saving <a href="tel:\+442080500725" class="text-blue-700 font-extrabold no-underline">(\+44 \(0\)20 8050 0725)<\/a> as Quaerens helps you recognise us if you request a call\./g,
    'Please save <a href="tel:+442080500725" class="text-blue-700 font-extrabold no-underline">$1</a> as Quaerens before requesting a call back, so you will recognise our calls!',
  ],
  [
    /Some networks mark unfamiliar business numbers as spam\. Saving \+44 \(0\)20 8050 0725 as Quaerens helps you recognise us if you request a call\./g,
    plainNote,
  ],
  [
    /Save \+44 \(0\)20 8050 0725 as Quaerens so you recognise our call if your phone screens unknown numbers\./g,
    "Please save +44 (0)20 8050 0725 as Quaerens before requesting a call back, so you will recognise our calls!",
  ],
  [
    /Save \+44 \(0\)20 8050 0725 as Quaerens so you recognise us if your phone screens unknown numbers\./g,
    "Please save +44 (0)20 8050 0725 as Quaerens before requesting a call back, so you will recognise our calls!",
  ],
  [
    /Save <a href="tel:\+442080500725">\+44 \(0\)20 8050 0725<\/a> as Quaerens so you recognise us if your phone screens unknown numbers\./g,
    htmlLinkNote,
  ],
  [
    /Save \+44 \(0\)20 8050 0725 as Quaerens before submitting, so you recognise our callback\./g,
    "Please save +44 (0)20 8050 0725 as Quaerens before requesting a call back, so you will recognise our calls!",
  ],
  [
    /Thank you\. Your call back request has been sent to our intake team\. Some networks mark unfamiliar business numbers as spam\. Saving \+44 \(0\)20 8050 0725 as Quaerens helps you recognise us if you request a call\./g,
    successNote,
  ],
  [
    /Request received\. Thank you - your call back request has been sent to our intake team\. Some networks mark unfamiliar business numbers as spam\. Saving \+44 \(0\)20 8050 0725 as Quaerens helps you recognise us if you request a call\./g,
    successNote,
  ],
  [
    /Thank you\. Your callback request has been sent to the Quaerens intake team\. Some networks mark unfamiliar business numbers as spam\. Saving \+44 \(0\)20 8050 0725 as Quaerens helps you recognise us if you request a call\./g,
    "Thank you. Your callback request has been sent to the Quaerens intake team. Please save +44 (0)20 8050 0725 as Quaerens so you will recognise our calls!",
  ],
  [
    /Thank you\. Your callback request has been sent\. Some networks mark unfamiliar business numbers as spam\. Saving \+44 \(0\)20 8050 0725 as Quaerens helps you recognise us if you request a call\./g,
    successNoteCallback,
  ],
];

let changed = 0;

for (const file of walk(publicDir)) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  for (const [from, to] of replacements) {
    html = html.replace(from, to);
  }

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
    console.log(`updated ${path.relative(__dirname, file)}`);
  }
}

console.log(`Done. Updated ${changed} HTML files.`);
