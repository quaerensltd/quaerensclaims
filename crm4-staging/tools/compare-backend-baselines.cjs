'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { sourceDirectory } = require('./backend-source.cjs');
const catalog = require('../backend-catalog.json');
(async () => {
  const samples = ['crm2AssessmentAssistantGenerateDraft', 'crm2ManagerGetLinkedAssessment', 'crm2AdminCreateUser'];
  const results = [];
  for (const name of samples) {
    const f = catalog.matched.find(f => f.name === name), source = f.source.storageSource;
    const directory = await sourceDirectory(source.bucket, source.object, source.generation);
    const hashes = {};
    for (const p of ['index.js', 'workspaceIdentityAccess.js', 'crm2AssessmentAssistant.js', 'frameworkB.js', 'crm2OperationalFlow.js']) {
      if (directory.entries.some(e => e.name === p)) hashes[p] = crypto.createHash('sha256').update(await directory.readJavaScript(p)).digest('hex');
    }
    results.push({ callable: name, source, hashes });
  }
  const compared = [...new Set(results.flatMap(r => Object.keys(r.hashes)))].map(file => ({ file, versions: new Set(results.map(r => r.hashes[file] || 'absent')).size }));
  fs.writeFileSync(path.resolve(__dirname, '../backend-baseline-comparison.json'), JSON.stringify({ results, compared }, null, 2) + '\n');
  console.log(JSON.stringify(compared));
})().catch(e => { console.error(e.message); process.exitCode = 1; });
