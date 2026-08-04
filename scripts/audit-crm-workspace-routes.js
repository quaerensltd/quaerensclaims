const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..", "public");
const seeds = [
  "staff-dashboard.html", "lister-leads.html", "lister-callbacks.html", "lister-intro-emails.html",
  "manager-dashboard.html", "manager-panel.html", "manager-leads-overview.html", "manager-risk-dashboard.html",
  "manager-lead-upload.html", "manager-intro-emails-overview.html", "manager-weekly-attendance.html",
  "closer-dashboard.html", "closer-panel.html", "closer-detail.html", "client-file.html", "client-search.html",
  "agenda.html", "dialer.html", "agreement-generator.html"
];
const existing = new Set(fs.readdirSync(root));
const routePattern = /(?:href|action)=["'](\/[^"'#?]+(?:\.html)?)[^"']*["']|(?:location(?:\.href|\.replace)?\s*=|location\.replace\()\s*["'`](\/[^"'`?]+(?:\.html)?)/g;
const collectionPattern = /(?:collection|doc)\(db\s*,\s*["']([^"']+)["']/g;
const roleFor = file => file.startsWith("manager-") ? "Manager" : file.startsWith("lister-") || file === "staff-dashboard.html" ? "Lister" : file.startsWith("closer-") ? "Closer" : "Shared";
const rows = [];
for (const file of seeds) {
  if (!existing.has(file)) continue;
  const source = fs.readFileSync(path.join(root, file), "utf8");
  const routes = new Set();
  const collections = new Set();
  for (const match of source.matchAll(routePattern)) routes.add(match[1] || match[2]);
  for (const match of source.matchAll(collectionPattern)) collections.add(match[1]);
  rows.push({ file, role: roleFor(file), workspaceAware: source.includes("/crm-workspace.js"), routes:[...routes].sort(), collections:[...collections].sort() });
}
process.stdout.write(JSON.stringify(rows, null, 2));
