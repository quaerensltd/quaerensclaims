const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = process.cwd();
const imageRoot = path.join(root, "public", "images");
const publicRoot = path.join(root, "public");
const docPath = path.join(root, "docs", "IMAGE-ASSET-AUDIT.md");
const inventoryJson = path.join(root, "docs", "image-asset-inventory.json");

const textExts = new Set([
  ".html",
  ".js",
  ".css",
  ".json",
  ".mjs",
  ".cjs",
  ".xml",
  ".txt",
  ".md",
  ".svg",
]);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function readUInt24BE(buf, offset) {
  return (buf[offset] << 16) + (buf[offset + 1] << 8) + buf[offset + 2];
}

function dimensions(file) {
  const buf = fs.readFileSync(file);
  if (buf.length < 32) return {};
  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    const colorType = buf[25];
    return {
      width: buf.readUInt32BE(16),
      height: buf.readUInt32BE(20),
      alpha: colorType === 4 || colorType === 6,
      format: "png",
    };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      const len = buf.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return {
          width: buf.readUInt16BE(offset + 7),
          height: buf.readUInt16BE(offset + 5),
          alpha: false,
          format: "jpg",
        };
      }
      offset += 2 + len;
    }
  }
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "WEBP") {
    const chunk = buf.slice(12, 16).toString("ascii");
    if (chunk === "VP8X") {
      return {
        width: 1 + readUInt24BE(buf, 24),
        height: 1 + readUInt24BE(buf, 27),
        alpha: Boolean(buf[20] & 0x10),
        format: "webp",
      };
    }
  }
  return {};
}

function guessType(name, ext, info) {
  const lower = name.toLowerCase();
  if (lower.includes("logo")) return "logo";
  if (ext === ".svg") return "svg/vector";
  if (info.alpha) return "transparent icon or cutout";
  if (lower.includes("hero")) return "hero image";
  if (lower.includes("cred-") || lower.includes("guide") || lower.includes("hub")) return "educational graphic";
  if (lower.includes("screenshot")) return "screenshot";
  if (info.width && info.height && Math.max(info.width, info.height) < 500) return "small UI asset";
  return "photograph or generated illustration";
}

function bytes(n) {
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

fs.mkdirSync(path.dirname(docPath), { recursive: true });

const textFiles = walk(publicRoot).filter((file) => textExts.has(path.extname(file).toLowerCase()));
const textIndex = textFiles.map((file) => ({
  file,
  rel: path.relative(root, file).replace(/\\/g, "/"),
  text: fs.readFileSync(file, "utf8"),
}));

const imageFiles = walk(imageRoot).filter((file) => /\.(png|jpe?g|svg|webp|avif)$/i.test(file));
const hashMap = new Map();
const inventory = imageFiles.map((file) => {
  const stat = fs.statSync(file);
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const base = path.basename(file);
  const ext = path.extname(file).toLowerCase();
  const info = dimensions(file);
  const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  if (!hashMap.has(hash)) hashMap.set(hash, []);
  hashMap.get(hash).push(rel);
  const pages = textIndex
    .filter(({ text }) => text.includes(base) || text.includes(rel) || text.includes(rel.replace(/^public\//, "")))
    .map(({ rel }) => rel);
  return {
    filename: base,
    path: rel,
    extension: ext,
    width: info.width || null,
    height: info.height || null,
    fileSize: stat.size,
    fileSizeLabel: bytes(stat.size),
    transparency: Boolean(info.alpha),
    referenced: pages.length > 0,
    pages,
    hash,
    likelyType: guessType(base, ext, info),
  };
});

for (const item of inventory) {
  const group = hashMap.get(item.hash);
  item.duplicateHash = group.length > 1 ? group : [];
}

const exactDuplicates = [...hashMap.entries()].filter(([, files]) => files.length > 1);
const byExt = inventory.reduce((acc, item) => {
  acc[item.extension] = (acc[item.extension] || 0) + 1;
  return acc;
}, {});
const largest = [...inventory].sort((a, b) => b.fileSize - a.fileSize).slice(0, 50);
const unused = inventory.filter((item) => !item.referenced);

const near = [];
const signature = new Map();
for (const item of inventory) {
  const sig = `${item.width}x${item.height}:${item.extension}:${item.likelyType}`;
  if (!signature.has(sig)) signature.set(sig, []);
  signature.get(sig).push(item);
}
for (const [sig, group] of signature.entries()) {
  if (group.length > 1) {
    near.push({
      signature: sig,
      files: group.map((item) => `${item.path} (${item.fileSizeLabel})`),
    });
  }
}

fs.writeFileSync(inventoryJson, JSON.stringify({ generatedAt: new Date().toISOString(), inventory }, null, 2));

let md = "";
md += "# Image Asset Audit\n\n";
md += `Generated: ${new Date().toISOString()}\n\n`;
md += "## Baseline\n\n";
md += `- Image folder: \`${path.relative(root, imageRoot).replace(/\\/g, "/")}\`\n`;
md += `- Image count: ${inventory.length}\n`;
md += `- Image size: ${bytes(inventory.reduce((sum, item) => sum + item.fileSize, 0))}\n`;
md += `- Count by extension: ${Object.entries(byExt).map(([ext, count]) => `${ext || "(none)"} ${count}`).join(", ")}\n\n`;
md += "## 50 Largest Images\n\n";
md += "| File | Size | Dimensions | Referenced | Likely type |\n";
md += "| --- | ---: | --- | --- | --- |\n";
for (const item of largest) {
  md += `| \`${item.path}\` | ${item.fileSizeLabel} | ${item.width || "?"}x${item.height || "?"} | ${item.referenced ? "yes" : "no"} | ${item.likelyType} |\n`;
}
md += "\n## Exact Duplicates\n\n";
if (exactDuplicates.length === 0) {
  md += "No exact duplicate image hashes were found.\n\n";
} else {
  for (const [, files] of exactDuplicates) {
    md += `- ${files.map((file) => `\`${file}\``).join(", ")}\n`;
  }
  md += "\n";
}
md += "## Unused Images\n\n";
md += "The following images were not referenced by filename/path in public HTML, JS, CSS, JSON, XML, TXT, MD or SVG files. Unused does not automatically mean safe to delete; review before removal.\n\n";
for (const item of unused) {
  md += `- \`${item.path}\` (${item.fileSizeLabel}, ${item.width || "?"}x${item.height || "?"}, ${item.likelyType})\n`;
}
md += "\n## Likely Near-Duplicate Groups\n\n";
md += "Grouped by matching dimensions, extension and likely role. These require visual review before any deletion.\n\n";
for (const group of near.slice(0, 120)) {
  md += `- ${group.signature}: ${group.files.join("; ")}\n`;
}
md += "\n## Full Inventory\n\n";
md += "See `docs/image-asset-inventory.json` for dimensions, hash, transparency, reference status and referencing pages for every image.\n";

fs.writeFileSync(docPath, md);

console.log(JSON.stringify({
  images: inventory.length,
  sizeBytes: inventory.reduce((sum, item) => sum + item.fileSize, 0),
  unused: unused.length,
  exactDuplicateGroups: exactDuplicates.length,
  audit: path.relative(root, docPath),
  inventory: path.relative(root, inventoryJson),
}, null, 2));
