'use strict';
// No SDK, network, credentials or production delivery. In-memory receipts only.
function createLocalProviders() {
  const receipts = [], keys = new Map();
  return { receipts, resend: { emails: { async send(payload, options = {}) {
    const recipients = [payload.to, payload.cc, payload.bcc].flat(2).filter(Boolean);
    if (!recipients.length || recipients.some(email => !/^[^@\s]+@(?:crm4\.)?example\.test$/.test(email) && !['support@quaerens.co.uk', 'info@quaerens.co.uk'].includes(email))) throw Error('Only synthetic or captured internal recipients permitted');
    const key = options.idempotencyKey;
    if (key && keys.has(key)) return keys.get(key);
    const result = { data: { id: 'local-capture-' + (receipts.length + 1) } };
    receipts.push({ id: result.data.id, recipients, subject: String(payload.subject || ''), delivered: false });
    if (key) keys.set(key, result);
    return result;
  } } } };
}
module.exports = { createLocalProviders };
