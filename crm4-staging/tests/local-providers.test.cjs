'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { createLocalProviders } = require('../tools/local-providers.cjs');
test('capture adapter is idempotent and never records delivery', async () => {
  const provider = createLocalProviders();
  const payload = { to: 'synthetic@example.test', subject: 'Synthetic test' };
  const first = await provider.resend.emails.send(payload, { idempotencyKey: 'synthetic' });
  assert.deepEqual(await provider.resend.emails.send(payload, { idempotencyKey: 'synthetic' }), first);
  assert.equal(provider.receipts.length, 1); assert.equal(provider.receipts[0].delivered, false);
});
test('capture adapter rejects real-client recipients including cc and bcc', async () => {
  for (const field of ['to', 'cc', 'bcc']) {
    const provider = createLocalProviders();
    await assert.rejects(() => provider.resend.emails.send({ to: 'synthetic@example.test', [field]: 'person@example.com' }));
    assert.equal(provider.receipts.length, 0);
  }
});
test('internal notification targets are captured, not delivered', async () => {
  const provider = createLocalProviders();
  await provider.resend.emails.send({ to: 'support@quaerens.co.uk', cc: ['info@quaerens.co.uk'] });
  assert.equal(provider.receipts[0].delivered, false);
});
