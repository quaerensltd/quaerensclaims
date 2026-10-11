'use strict';
// Preserve callable-specific deployed JavaScript. No archive, env or credential
// files are copied. Bundles remain unserved and unregistered until verified.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { sourceDirectory } = require('./backend-source.cjs');
const catalog = require('../backend-catalog.json');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function transform(source) {
  if (/-----BEGIN (?:RSA |EC )?PRIVATE KEY-----|["'](?:sk_live_|re_)[A-Za-z0-9]{20,}/.test(source)) throw new Error('Credential-shaped literal; source not materialised');
  return source.replace(/\r\n/g, '\n').replace(/crm2/g, 'crm4').replace(/CRM2/g, 'CRM4');
}
async function materialize(name) {
  const definition = catalog.matched.find(f => f.name === name);
  if (!definition || definition.state !== 'ACTIVE') throw new Error('Active catalog entry required');
  const source = definition.source.storageSource;
  const directory = await sourceDirectory(source.bucket, source.object, source.generation);
  const root = path.resolve(__dirname, '../backend-sources', name.replace(/^crm2/, 'crm4'));
  const entryModules = {
    crm2AssessmentAssistantGenerateDraft: 'crm2AssessmentAssistant.js',
    crm2ManagerGetLinkedAssessment: 'crm2OperationalFlow.js',
    crm2ListerCreateReferralLead: 'crm2ManualReferral.js',
    crm2CloserBookAdministrationOnboarding: 'crm2AdministrationOnboarding.js',
    processingListOperationalDashboard: 'processingOperations.js'
  };
  if (!entryModules[name]) throw new Error('Reviewed entry module mapping required');
  const pending = [entryModules[name]], seen = new Set(), records = [], unresolved = new Set(), packages = new Set();
  while (pending.length) {
    const file = pending.shift(); if (seen.has(file)) continue; seen.add(file);
    let bytes;
    try { bytes = await directory.readJavaScript(file); }
    catch (error) { throw new Error(`${file}: ${error.message}`); }
    const text = bytes.toString('utf8');
    const converted = transform(text);
    for (const match of text.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
      const ref = match[1];
      if (!ref.startsWith('.')) { packages.add(ref); continue; }
      const candidate = path.posix.normalize(path.posix.join(path.posix.dirname(file), ref));
      const resolved = [candidate, candidate + '.js', candidate + '/index.js'].find(p => directory.entries.some(e => e.name === p));
      if (!resolved || !/\.(?:js|cjs|mjs)$/.test(resolved) || /secret|credential|service.?account/i.test(resolved)) { unresolved.add(candidate); continue; }
      pending.push(resolved);
    }
    const targetName = file.replace(/crm2/g, 'crm4'), target = path.resolve(root, targetName);
    if (!target.startsWith(root + path.sep)) throw new Error('Escaping source path');
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, converted);
    records.push({ original: file, target: targetName, originalSha256: sha(bytes), cloneSha256: sha(Buffer.from(converted)) });
  }
  const result = { callable: name.replace(/^crm2/, 'crm4'), originalCallable: name, source,
    executable: false, reason: 'Provider adapters, runtime assets and backend isolation acceptance pending',
    records, packages: [...packages].sort(), unresolved: [...unresolved].sort() };
  fs.writeFileSync(path.join(root, 'source-manifest.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ callable: result.callable, sourceFiles: records.length, unresolved: result.unresolved }));
  return result;
}
module.exports = { materialize, transform };
if (require.main === module) materialize(process.argv[2]).catch(error => { console.error(error.message); process.exitCode = 1; });
