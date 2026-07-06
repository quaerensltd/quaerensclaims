const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");

const replacements = [
  ["EspaÃ±ol", "Español"],
  ["FranÃ§ais", "Français"],
  ["âœ…", "✓"],
  ["âœ”", "✓"],
  ["âœ“", "✓"],
  ["âœ•", "×"],
  ["âŒ", "✕"],
  ["â“", "?"],
  ["âš ï¸", "⚠"],
  ["âœˆï¸", "✈"],
  ["âœ‰", "✉"],
  ["â„", "❄"],
  ["â„¹", "ℹ"],
  ["â—", "●"],
  ["âˆ’", "−"],
  ["ðŸ‡«ðŸ‡·", "FR"],
  ["ðŸ‡ªðŸ‡¸", "ES"],
  ["ðŸ‡·ðŸ‡´", "RO"],
  ["ðŸ‡µðŸ‡¹", "PT"],
  ["ðŸ‘´", "Pension"],
  ["ðŸ¦", "Bank"],
  ["ðŸ’³", "Card"],
  ["ðŸ“ˆ", "Investment"],
  ["ðŸ ", "Home"],
  ["ðŸ§¾", "Document"],
  ["ðŸš—", "Car"],
  ["ðŸ”Œ", "Energy"],
  ["ðŸ©º", "Medical"],
  ["ðŸ”„", "Refund"],
  ["ðŸ’·", "Debt"],
  ["ðŸ‹ï¸â€â™‚ï¸", "Gym"],
  ["â–¾", "▾"],
  ["â–²", "▲"],
  ["â–¼", "▼"],
  ["â‚¬", "€"],
  ["Â£", "£"],
  ["Â©", "©"],
  ["Â·", "·"],
  ["Â ", " "],
  ["â€“", "–"],
  ["â€”", "—"],
  ["â€™", "’"],
  ["â€˜", "‘"],
  ["â€œ", "“"],
  ["â€", "”"],
  ["â€¢", "•"],
  ["â†’", "→"],
  ["â†", "←"],
  ["â†‘", "↑"],
  ["â˜€", "☀"],
  ["clÃ¡usula", "cláusula"],
  ["PortuguÃªs", "Português"],
  ["RomÃ¢nÄƒ", "Română"],
  ["WiderÃ¸e", "Widerøe"],
  ["CÃ´te", "Côte"],
  ["ExupÃ©ry", "Exupéry"],
  ["MÃ©rignac", "Mérignac"],
  ["DÃ¼sseldorf", "Düsseldorf"],
  ["prÃ³ximos", "próximos"],
  ["â€", "”"],
  ["ï¸", ""],
  ["â€", ""],
];

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.isFile() && full.toLowerCase().endsWith(".html")) files.push(full);
  }
  return files;
}

let touched = 0;
let replacementsMade = 0;

for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  let text = original;
  for (const [from, to] of replacements) {
    const count = text.split(from).length - 1;
    if (count) {
      replacementsMade += count;
      text = text.split(from).join(to);
    }
  }
  if (text !== original) {
    fs.writeFileSync(file, text, "utf8");
    touched += 1;
  }
}

console.log(`Updated ${touched} HTML files`);
console.log(`Applied ${replacementsMade} replacements`);
