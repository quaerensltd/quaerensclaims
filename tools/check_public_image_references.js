const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicRoot = path.join(root, "public");
const textExts = new Set([".html", ".js", ".css", ".json", ".mjs", ".cjs", ".xml", ".svg"]);
const imagePattern = /(?:src|href|poster|content|url|image|backgroundImage)\s*[:=]\s*["'`(]([^"'`)]+?\.(?:png|jpe?g|webp|avif|svg))(?:[?#][^"'`)]*)?["'`)]|url\(["']?([^"')]+?\.(?:png|jpe?g|webp|avif|svg))(?:[?#][^"')]+)?["']?\)/gi;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function existsForRef(ref, file) {
  if (/^(?:https?:|data:|mailto:|tel:|#)/i.test(ref)) return true;
  const clean = ref.replace(/^\/+/, "");
  const candidates = [];
  if (ref.startsWith("/")) candidates.push(path.join(publicRoot, clean));
  candidates.push(path.join(path.dirname(file), ref));
  candidates.push(path.join(publicRoot, clean));
  return candidates.some((candidate) => fs.existsSync(candidate));
}

const broken = [];
for (const file of walk(publicRoot).filter((f) => textExts.has(path.extname(f).toLowerCase()))) {
  const text = fs.readFileSync(file, "utf8");
  for (const match of text.matchAll(imagePattern)) {
    const ref = match[1] || match[2];
    if (ref && !existsForRef(ref, file)) {
      broken.push({
        file: path.relative(root, file).replace(/\\/g, "/"),
        ref,
      });
    }
  }
}

if (broken.length) {
  console.error(JSON.stringify({ broken }, null, 2));
  process.exit(1);
}

console.log("No broken public image references found.");
