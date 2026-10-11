'use strict';
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const { describe } = require('./inventory.cjs');
async function catalog() {
  const root = path.resolve(__dirname, '..'), clone = require('../clone-manifest.json');
  const names = new Set();
  for (const file of clone.records.filter(f => /\.(js|html)$/.test(f.target))) {
    const text = fs.readFileSync(path.join(root, 'local-public', file.target));
    describe(file.target, text).callables.forEach(n => names.add(n.replace(/^crm4/, 'crm2')));
  }
  const token = cp.execFileSync('powershell.exe', ['-NoProfile', '-Command', 'gcloud auth print-access-token'], { encoding: 'utf8', stdio: ['ignore','pipe','pipe'] }).trim();
  let next = '', functions = [];
  do {
    const fields = 'nextPageToken,functions(name,state,buildConfig(entryPoint,source))';
    const url = 'https://cloudfunctions.googleapis.com/v2/projects/quaerensclaims/locations/us-central1/functions?pageSize=1000&fields=' + encodeURIComponent(fields) + (next ? '&pageToken=' + encodeURIComponent(next) : '');
    const response = await fetch(url, { headers: { Authorization: 'Bearer ' + token }, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('Function metadata HTTP ' + response.status);
    const data = await response.json(); functions.push(...(data.functions || [])); next = data.nextPageToken;
  } while (next);
  const matched = functions.filter(f => names.has(f.buildConfig?.entryPoint)).map(f => ({ name: f.buildConfig.entryPoint, state: f.state, source: f.buildConfig.source }));
  const result = { mode: 'read-only-source-metadata-no-secrets-no-callable-invocation', matched, missing: [...names].filter(n => !matched.some(f => f.name === n)).sort() };
  fs.writeFileSync(path.join(root, 'backend-catalog.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ references: names.size, matched: matched.length, missing: result.missing }));
}
catalog().catch(e => { console.error(e.message); process.exitCode = 1; });
