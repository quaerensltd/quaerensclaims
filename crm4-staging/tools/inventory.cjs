'use strict';
// Read-only discovery. Never recursively reads arbitrary repository files.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const seeds = [
  'admin-centre.html', 'crm2-login.html', 'crm2.html', 'crm2-platform.js',
  'crm-workspace.js', 'staff-dashboard.html', 'lister-leads.html',
  'lister-callbacks.html', 'lister-intro-emails.html', 'manager-dashboard.html',
  'manager-panel.html', 'manager-leads-overview.html', 'manager-lead-upload.html',
  'manager-weekly-attendance.html', 'manager-intro-emails-overview.html',
  'closer-dashboard.html', 'closer-panel.html', 'client-file.html',
  'client-search.html', 'agenda.html', 'agreement-generator.html',
  'crm2-assessment-builder.html', 'crm2-assessment-assistant.html',
  'crm2-assessment-reproject.js', 'processing-dashboard.html',
  'processing-panel.html', 'processing-case-detail.html', 'client-portal.html',
  'client-portal-admin.html'
];
function safeAsset(relative) {
  return typeof relative === 'string' && !relative.includes('\\') &&
    !relative.split('/').some(part => !part || part === '..' || part.startsWith('.')) &&
    !/secret|credential|service.?account/i.test(relative) &&
    /\.(?:html|js|mjs|css)$/.test(relative);
}
function describe(relative, bytes) {
  const source = bytes.toString('utf8');
  const values = re => [...new Set([...source.matchAll(re)].map(m => m[1]))].sort();
  const references = [
    ...values(/(?:src|href)\s*=\s*["']([^"'#?]+)/g),
    ...values(/(?:from\s*|import\s*)["']([^"']+)["']/g)
  ];
  const local = [];
  for (const ref of references) {
    if (/^(?:https?:|data:|mailto:|tel:|\/\/)/i.test(ref)) continue;
    const resolved = path.posix.normalize(ref.startsWith('/') ? ref.slice(1) : path.posix.join(path.posix.dirname(relative), ref));
    if (safeAsset(resolved)) local.push(resolved);
  }
  return {
    path: relative,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    dependencies: [...new Set(local)].sort(),
    callables: [...new Set([
      ...values(/httpsCallable\([^,]+,\s*["']([^"']+)["']/g),
      ...values(/\bcall\(\s*["']([^"']+)["']/g)
    ])].sort(),
    collections: values(/(?:collection|doc)\(\s*db\s*,\s*["']([^"']+)["']/g),
    hasFirebaseInitialisation: /initializeApp\s*\(/.test(source),
    productionReferencePresent: /quaerensclaims|cloudfunctions\.net|run\.app/.test(source)
  };
}
function inventory(publicRoot) {
  const root = fs.realpathSync(publicRoot);
  const pending = [...seeds], visited = new Set(), assets = [], missing = [];
  while (pending.length) {
    const relative = pending.shift();
    if (!safeAsset(relative) || visited.has(relative)) continue;
    visited.add(relative);
    const file = path.resolve(root, relative);
    if (!fs.existsSync(file)) { missing.push(relative); continue; }
    const actual = fs.realpathSync(file);
    if (!actual.startsWith(root + path.sep)) throw new Error('Asset escapes public root');
    const asset = describe(relative, fs.readFileSync(actual));
    pending.push(...asset.dependencies.filter(ref => !ref.endsWith('.html')));
    assets.push(asset);
  }
  return { schemaVersion: 1, mode: 'discovery-not-parity-certification', assets, missing: missing.sort() };
}
module.exports = { inventory, describe, safeAsset, seeds };
if (require.main === module) {
  if (!process.argv[2]) throw new Error('Specify an explicit public source directory');
  process.stdout.write(JSON.stringify(inventory(process.argv[2]), null, 2) + '\n');
}
