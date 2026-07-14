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

const plainSave =
  "Please save our number as Quaerens before requesting a call back, so you will recognise our calls. In the UK, save it as 020 8050 0725. Outside the UK, save it as +44 20 8050 0725.";

const linkSave =
  'Please save our number as Quaerens before requesting a call back, so you will recognise our calls. In the UK, save it as <a href="tel:02080500725">020 8050 0725</a>. Outside the UK, save it as <a href="tel:+442080500725">+44 20 8050 0725</a>.';

const linkSaveStyled =
  'Please save our number as Quaerens before requesting a call back, so you will recognise our calls. In the UK, save it as <a href="tel:02080500725" class="text-blue-700 font-extrabold no-underline">020 8050 0725</a>. Outside the UK, save it as <a href="tel:+442080500725" class="text-blue-700 font-extrabold no-underline">+44 20 8050 0725</a>.';

const replacements = [
  [
    /Please save \+44 \(0\)20 8050 0725 as Quaerens before requesting a call back, so you will recognise our calls!/g,
    plainSave,
  ],
  [
    /Please save <a href="tel:\+442080500725">\+44 \(0\)20 8050 0725<\/a> as Quaerens before requesting a call back, so you will recognise our calls!/g,
    linkSave,
  ],
  [
    /Please save <a href="tel:\+442080500725" class="text-blue-700 font-extrabold no-underline">\+44 \(0\)20 8050 0725<\/a> as Quaerens before requesting a call back, so you will recognise our calls!/g,
    linkSaveStyled,
  ],
  [
    /Please save \+44 \(0\)20 8050 0725 as Quaerens so you will recognise our calls!/g,
    plainSave,
  ],
  [
    /Please save our number as Quaerens before requesting a call back, so you will recognise our calls!/g,
    plainSave,
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
