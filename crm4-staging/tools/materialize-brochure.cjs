'use strict';
// One explicitly pinned public document asset, never arbitrary archive entries.
async function materialize(callable = 'crm4AssessmentAssistantFinalise') {
  if (!['crm4AssessmentAssistantFinalise', 'crm4AssessmentAssistantFinaliseCorrection'].includes(callable)) throw Error('Unapproved brochure consumer');
  const fs = require('node:fs'), path = require('node:path');
  const root = path.resolve(__dirname, '../backend-sources', callable);
  const { source } = require(path.join(root, 'source-manifest.json'));
  const directory = await require('./backend-source.cjs').sourceDirectory(source.bucket, source.object, source.generation);
  const bytes = await directory.readInformationBrochure();
  fs.mkdirSync(path.join(root, 'internal-assets'), { recursive: true });
  fs.writeFileSync(path.join(root, 'internal-assets/client-information-brochure-en-2026-08-13.pdf'), bytes);
  console.log('Pinned information brochure SHA256 verified; no other archive assets copied.');
}
if (require.main === module) materialize(process.argv[2]).catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { materialize };
