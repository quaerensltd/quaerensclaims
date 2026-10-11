'use strict';
const { sourceDirectory } = require('./backend-source.cjs');
(async () => {
  const directory = await sourceDirectory('gcf-v2-sources-57715464932-us-central1', 'crm2AssessmentAssistantGenerateDraft/function-source.zip', '1790087937796311');
  const index = await directory.readJavaScript('index.js');
  console.log(JSON.stringify({ entries: directory.entries.length, javascriptFiles: directory.entries.filter(e => /\.js$/.test(e.name)).length,
    indexBytes: index.length, localModules: [...index.toString().matchAll(/require\(['"](\.\/[^'"]+)/g)].map(m => m[1]) }));
  console.log(index.toString().split('\n').filter(line => /register|require\("\.\//.test(line)).join('\n'));
  const assistant = (await directory.readJavaScript('crm2AssessmentAssistant.js')).toString();
  console.log(assistant.split('\n').filter(line => /module.exports|function register|require\(/.test(line)).join('\n'));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
