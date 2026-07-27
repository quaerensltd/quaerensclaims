const fs = require("fs");
const path = require("path");

const root = process.cwd();
const publicDir = path.join(root, "public");
const docsDir = path.join(root, "docs");
const reportsDir = path.join(root, "reports");

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(root, file).replace(/\\/g, "/");
}

function match(html, regex) {
  const found = html.match(regex);
  return found ? (found[1] || found[0]).replace(/\s+/g, " ").trim() : "";
}

function classify(file, html) {
  const name = path.basename(file);
  const p = rel(file);
  if (p.includes("/internal/") || name.includes("dashboard") || name.includes("admin") || name.includes("panel")) return "internal/admin";
  if (name.startsWith("category-")) return "category hub";
  if (name.startsWith("knowledge-") || p.includes("/knowledge/") || name.includes("knowledge-centre") || name.includes("knowledge-hub")) return "knowledge";
  if (name.includes("claim-form") || name.includes("thank-you") || name === "thankyou.html") return "form/thank-you";
  if (html.includes("Complaint Pack Builder") || html.includes("Consumer Complaint File") || html.includes("complaint-builder")) return "complaint builder";
  if (["privacy.html", "terms.html", "gdpr.html", "contact.html", "about-quaerens.html"].includes(name)) return "company/legal";
  if (name.includes("response") || name.includes("landing") || name.includes("instagram") || name.includes("tiktok")) return "campaign";
  if (name.includes("hub")) return "hub";
  return "service/content";
}

function auditFile(file) {
  const html = fs.readFileSync(file, "utf8");
  const header = match(html, /<header[\s\S]*?<\/header>/i);
  const footer = match(html, /<footer[\s\S]*?<\/footer>/i);
  const logoImgs = [...header.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const textOnlyLogo = /<a[^>]*class=["'][^"']*\blogo\b[^"']*["'][^>]*>\s*Quaerens\s*<\/a>/i.test(header);
  const hasApprovedLogo = logoImgs.some((src) => src.includes("quaerens-logo.png") || src.includes("/images/logo-"));
  const canonical = match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const robots = match(html, /<meta[^>]+name=["']robots["'][^>]+content=["']([^"']+)["']/i);
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const h1 = match(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, "");
  const imageRefs = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1]);
  const missingImages = imageRefs
    .filter((src) => src.startsWith("/") || !/^[a-z]+:/i.test(src))
    .map((src) => src.startsWith("/") ? path.join(publicDir, src.slice(1)) : path.join(path.dirname(file), src))
    .filter((imgPath) => !fs.existsSync(imgPath))
    .map((imgPath) => rel(imgPath));

  return {
    file: rel(file),
    type: classify(file, html),
    title,
    h1,
    canonical,
    robots,
    header: {
      hasHeader: Boolean(header),
      textOnlyLogo,
      hasApprovedLogo,
      logoImages: logoImgs,
    },
    footer: {
      hasFooter: Boolean(footer),
      footerClass: match(footer, /class=["']([^"']+)["']/i),
      hasCompanyColumn: /Company/i.test(footer),
      hasContactColumn: /Get in touch|Contact/i.test(footer),
    },
    risks: {
      duplicateHtmllessUrlRisk: /href=["'][^"']+(?<!\.html)["']/i.test(html),
      malformedUtf8Hint: /ðŸ|Â|âœ|â€™|â€“/.test(html),
      missingImages,
    },
  };
}

function writeReports(items) {
  fs.mkdirSync(docsDir, { recursive: true });
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, "platform-ui-audit.json"), JSON.stringify({
    generatedAt: new Date().toISOString(),
    baselineCommit: "d50e4554d580cecd86a52fdc485708005ce80ed0",
    totalHtmlFiles: items.length,
    summary: {
      textOnlyLogoHeaders: items.filter((i) => i.header.textOnlyLogo).length,
      approvedLogoHeaders: items.filter((i) => i.header.hasApprovedLogo).length,
      missingFooter: items.filter((i) => !i.footer.hasFooter).length,
      malformedUtf8Hints: items.filter((i) => i.risks.malformedUtf8Hint).length,
      brokenImageReferences: items.reduce((sum, i) => sum + i.risks.missingImages.length, 0),
    },
    pages: items,
  }, null, 2));

  const textLogoPages = items.filter((i) => i.header.textOnlyLogo).map((i) => `- ${i.file}`).join("\n") || "- None found";
  const missingFooterPages = items.filter((i) => !i.footer.hasFooter && i.type !== "internal/admin").map((i) => `- ${i.file}`).join("\n") || "- None found";
  const brokenImagePages = items.filter((i) => i.risks.missingImages.length).map((i) => `- ${i.file}: ${i.risks.missingImages.join(", ")}`).join("\n") || "- None found";

  const markdown = `# Quaerens Platform UI Audit

Generated: ${new Date().toISOString()}

Baseline commit: \`d50e4554d580cecd86a52fdc485708005ce80ed0\`

## Scope

Audited ${items.length} public HTML files for header logo usage, footer presence, UTF-8 risk markers, canonical preservation and broken local image references.

This audit intentionally does not start clean URL migration. Existing \`.html\` URLs, canonical URLs, sitemap URLs and structured-data URLs are treated as fixed during this design-system pass.

## Summary

- Text-only Quaerens logo headers: ${items.filter((i) => i.header.textOnlyLogo).length}
- Headers already using approved logo imagery: ${items.filter((i) => i.header.hasApprovedLogo).length}
- Non-internal pages missing a footer: ${items.filter((i) => !i.footer.hasFooter && i.type !== "internal/admin").length}
- Pages with malformed UTF-8 risk markers: ${items.filter((i) => i.risks.malformedUtf8Hint).length}
- Broken local image references found: ${items.reduce((sum, i) => sum + i.risks.missingImages.length, 0)}

## Text-Only Logo Headers To Replace

${textLogoPages}

## Non-Internal Pages Missing Footer

${missingFooterPages}

## Broken Local Image References

${brokenImagePages}

## Design-System Notes

- Homepage footer in \`public/index.html\` must remain the expanded homepage footer.
- Non-homepage public pages should use the compact footer pattern derived from \`public/travel-claims-hub.html\`.
- Public headers should use an approved Quaerens logo image where available, linked to the homepage, with meaningful alt text.
- Builder pages may use approved specialist logo variants, but should not fall back to plain text where an image exists.
`;
  fs.writeFileSync(path.join(docsDir, "QUAERENS-PLATFORM-UI-AUDIT.md"), markdown);
}

const files = walk(publicDir);
const items = files.map(auditFile).sort((a, b) => a.file.localeCompare(b.file));
writeReports(items);
console.log(`Audited ${items.length} HTML files.`);
console.log(`Text-only logo headers: ${items.filter((i) => i.header.textOnlyLogo).length}`);
console.log(`Broken local image references: ${items.reduce((sum, i) => sum + i.risks.missingImages.length, 0)}`);
