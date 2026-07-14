const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");

const footerAddress =
  "Assessment &amp; Processing Department:<br>Quaerens Ltd<br>3rd Floor, Broadstone Mill<br>Stockport Business and Innovation Centre<br>Stockport SK5 7DL<br>United Kingdom<br><br>Registered office / Administration, Media &amp; Correspondence Department:<br>Quaerens Ltd<br>71-75 Shelton Street<br>Covent Garden<br>London WC2H 9JQ<br>United Kingdom";

const contactAddress =
  "Assessment & Processing Department: Quaerens Ltd, 3rd Floor, Broadstone Mill, Stockport Business and Innovation Centre, Stockport SK5 7DL, United Kingdom. Registered office / Administration, Media & Correspondence Department: Quaerens Ltd, 71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom.";

const replacements = [
  [
    "Address: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ",
    `Addresses:<br>${footerAddress}`,
  ],
  [
    "Address: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ",
    `Addresses:<br>${footerAddress}`,
  ],
  [
    "<li>Address: 71–75 Shelton Street, Covent Garden, London WC2H 9JQ</li>",
    `<li>${contactAddress}</li>`,
  ],
  [
    "<li>Address: 71-75 Shelton Street, Covent Garden, London WC2H 9JQ</li>",
    `<li>${contactAddress}</li>`,
  ],
  [
    "<p><strong>Registered office:</strong><br>71-75 Shelton Street<br>Covent Garden<br>London<br>WC2H 9JQ</p>",
    "<p><strong>Assessment &amp; Processing Department:</strong><br>Quaerens Ltd<br>3rd Floor, Broadstone Mill<br>Stockport Business and Innovation Centre<br>Stockport SK5 7DL<br>United Kingdom</p><p><strong>Registered office / Administration, Media &amp; Correspondence Department:</strong><br>Quaerens Ltd<br>71-75 Shelton Street<br>Covent Garden<br>London WC2H 9JQ<br>United Kingdom</p>",
  ],
];

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".html")) out.push(full);
  }
  return out;
}

let changed = 0;

for (const file of walk(publicDir)) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;

  for (const [from, to] of replacements) {
    html = html.split(from).join(to);
  }

  if (html !== before) {
    fs.writeFileSync(file, html, "utf8");
    changed += 1;
    console.log(`updated ${path.relative(__dirname, file)}`);
  }
}

console.log(`Done. Updated ${changed} HTML files.`);
