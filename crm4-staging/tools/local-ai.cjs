'use strict';
const { AsyncLocalStorage } = require('node:async_hooks');
const context = new AsyncLocalStorage(), originalFetch = globalThis.fetch;
let installed = false;
function fixture(category) {
  const schema = require('../backend-sources/crm4AssessmentAssistantGenerateDraft/crm4AssessmentAssistantSchema.js');
  const output = {};
  for (const [key, definition] of Object.entries(schema.OUTPUT_SCHEMA.properties)) if (definition.type === 'array') output[key] = [];
  return { ...output, reportType: 'AI_ASSISTED', category, client: { firstName: 'Synthetic', lastName: 'Assessment' }, jointClient: null, address: '1 Synthetic Street, Test Town, ZZ1 1ZZ, United Kingdom', contact: { email: 'assessment@example.test', mobile: '07700900000', telephone: '', secondaryEmail: '' },
    reportedFacts: [{ label: 'Condition', value: 'Synthetic test reports damp after installation.', status: 'CLIENT_REPORTED', source: 'Explicit synthetic fixture' }],
    financialItems: [{ label: 'Installation cost', amount: 3800, status: 'CLIENT_REPORTED', basis: 'Synthetic client narrative' }, { label: 'Damp treatment', amount: 1550, status: 'CLIENT_REPORTED', basis: 'Synthetic client narrative; separate scope subject to verification' }, { label: 'Removal cost', amount: 3800, status: 'CLIENT_REPORTED', basis: 'Synthetic client narrative; separate scope subject to verification' }],
    missingInformation: ['Synthetic invoices and technical evidence not supplied'], evidenceRequired: ['Invoices and scope confirmation'], reportModules: schema.CATEGORIES[category], caseDirection: 'Synthetic assessment only; evidence review required' };
}
function install() {
  if (installed) return; installed = true;
  globalThis.fetch = async (url, options) => {
    if (!context.getStore()) return originalFetch(url, options);
    const address = String(url);
    if (address === 'https://api.openai.com/v1/responses') {
      const body = JSON.parse(options.body), input = JSON.parse(body.input[1].content[0].text);
      if (!JSON.stringify(input).includes('CRM4_SYNTHETIC_ASSESSMENT')) throw Error('Explicit synthetic assessment marker required');
      return new Response(JSON.stringify({ id: 'crm4-local-synthetic-response', output_text: JSON.stringify(fixture(input.category)) }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (new URL(address).hostname !== '127.0.0.1' && !(new URL(address).protocol === 'https:' && context.getStore().includes(new URL(address).hostname))) throw Error('External network disabled during local handler invocation');
    return originalFetch(url, options);
  };
}
function isolated(handler, allowedHosts = []) { install(); return request => context.run(allowedHosts, () => handler(request)); }
module.exports = { fixture, isolated };
