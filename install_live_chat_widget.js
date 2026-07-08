const fs = require("fs");
const path = require("path");

const publicDir = path.join(__dirname, "public");
const scriptTag = '<script type="module" src="/quaerens-live-chat.js"></script>';
const internalPattern = /(^|\/)(admin(?:-.+)?|.+-admin|.*dashboard.*|.*portal.*|.*detail.*|lister.*|manager.*|processing.*|staff.*|agreement-generator|live-chat-admin|login|dialer|closer.*|client-.*|intake.*|assessment.*)\.html$/i;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      patchFile(full);
    }
  }
}

function patchFile(file) {
  const rel = path.relative(publicDir, file).replaceAll("\\", "/");
  let html = fs.readFileSync(file, "utf8");
  if (internalPattern.test(rel)) {
    const cleaned = html.replace(/\s*<script type="module" src="\/quaerens-live-chat\.js"><\/script>\s*/g, "\n");
    if (cleaned !== html) {
      fs.writeFileSync(file, cleaned);
      console.log(`removed ${rel}`);
    }
    return;
  }

  if (html.includes("/quaerens-live-chat.js")) return;
  if (!/<\/body>/i.test(html)) return;

  html = html.replace(/<\/body>/i, `  ${scriptTag}\n</body>`);
  fs.writeFileSync(file, html);
  console.log(`patched ${rel}`);
}

walk(publicDir);
