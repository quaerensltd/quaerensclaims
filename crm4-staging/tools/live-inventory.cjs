'use strict';
// GET-only public-source inspection. Does not execute scripts, authenticate,
// invoke callables, retrieve records or persist application/configuration bytes.
const fs = require('node:fs');
const crypto = require('node:crypto');
const { describe, safeAsset, seeds } = require('./inventory.cjs');
async function inspect(manifest, deploymentId) {
  const fingerprints = new Map(manifest.filter(f => f.path.startsWith('public/')).map(f => [f.path.slice(7), f.uid]));
  const queue = [...seeds], visited = new Set(), assets = [], missing = [];
  while (queue.length) {
    const relative = queue.shift();
    if (!safeAsset(relative) || visited.has(relative)) continue;
    visited.add(relative);
    if (!fingerprints.has(relative)) { missing.push(relative); continue; }
    const response = await fetch('https://www.quaerens.co.uk/' + relative, {
      method: 'GET', redirect: 'error', signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error(`${relative}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const sha1 = crypto.createHash('sha1').update(bytes).digest('hex');
    if (sha1 !== fingerprints.get(relative)) throw new Error(`${relative}: production fingerprint mismatch`);
    const asset = describe(relative, bytes);
    assets.push(asset);
    queue.push(...asset.dependencies.filter(ref => !ref.endsWith('.html')));
  }
  return { deploymentId, inspectedAt: new Date().toISOString(),
    mode: 'read-only-static-discovery-not-complete-runtime-closure', assets, missing };
}
module.exports = { inspect };
if (require.main === module) {
  if (!process.argv[2] || !process.argv[3]) throw new Error('Expected public fingerprint manifest and deployment ID');
  inspect(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3])
    .then(result => process.stdout.write(JSON.stringify(result, null, 2) + '\n'))
    .catch(error => { console.error(error.message); process.exitCode = 1; });
}
