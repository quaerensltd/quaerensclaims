'use strict';
// Development transport only. Business authorization remains in copied handlers.
const http = require('node:http');
const { createLocalHandlers } = require('./local-handlers.cjs');
const origin = 'http://127.0.0.1:4404';
async function start(port = 5001) {
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== '127.0.0.1:9099') throw Error('Loopback Auth emulator required');
  const runtime = createLocalHandlers();
  const auth = require('firebase-admin/auth').getAuth(runtime.app);
  const server = http.createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
    if (req.headers.origin && req.headers.origin !== origin) return reply(403, { error: { status: 'PERMISSION_DENIED', message: 'Local origin required' } });
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Firebase-GMPID');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
    const ticketMatch = /^\/__local-document\/([a-f0-9]{64})$/.exec(req.url);
    if (req.method === 'GET' && ticketMatch) {
      const ticket = runtime.downloadTickets.get(ticketMatch[1]);
      if (!ticket || ticket.expires <= Date.now()) {
        runtime.downloadTickets.delete(ticketMatch[1]);
        return reply(404, { error: { status: 'NOT_FOUND' } });
      }
      res.writeHead(200, { 'Content-Type': 'application/octet-stream', 'Content-Disposition': 'attachment; filename="synthetic-document"', 'X-Content-Type-Options': 'nosniff' });
      return res.end(ticket.bytes);
    }
    if (req.method !== 'POST') return reply(405, { error: { status: 'INVALID_ARGUMENT' } });
    const match = /^\/demo-quaerens-crm4\/us-central1\/([A-Za-z0-9]+)$/.exec(req.url);
    if (!match || !Object.hasOwn(runtime.handlers, match[1])) return reply(404, { error: { status: 'NOT_FOUND', message: 'Callable not enabled locally' } });
    let decoded;
    try {
      if (!/^Bearer \S+$/.test(req.headers.authorization || '')) throw Error();
      decoded = await auth.verifyIdToken(req.headers.authorization.slice(7));
    } catch { return reply(401, { error: { status: 'UNAUTHENTICATED', message: 'Valid demo-emulator sign-in required' } }); }
    try {
      let body = '', length = 0;
      const bodyLimit = match[1] === 'crm4CloserSendAgreement' ? 9500000 : 65536;
      for await (const chunk of req) { length += chunk.length; if (length > bodyLimit) throw Object.assign(Error('Request too large'), { code: 'invalid-argument' }); body += chunk; }
      let parsed;
      try { parsed = JSON.parse(body); } catch { throw Object.assign(Error('Valid JSON required'), { code: 'invalid-argument' }); }
      if (!parsed || Object.keys(parsed).some(key => key !== 'data')) throw Object.assign(Error('Callable data envelope required'), { code: 'invalid-argument' });
      const result = await runtime.handlers[match[1]]({ data: parsed.data, auth: { uid: decoded.uid, token: decoded } });
      reply(200, { result });
    } catch (error) {
      const codes = { 'invalid-argument': 400, 'unauthenticated': 401, 'permission-denied': 403, 'not-found': 404, 'failed-precondition': 400, 'already-exists': 409 };
      const code = Object.hasOwn(codes, error.code) ? error.code : 'internal';
      reply(codes[code] || 500, { error: { status: code.replaceAll('-', '_').toUpperCase(), message: code === 'internal' ? 'Local operation failed' : error.message } });
    }
  });
  server.requestTimeout = 15000;
  server.headersTimeout = 10000;
  try { await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); }); }
  catch (error) { await runtime.close(); throw error; }
  return { runtime, port: server.address().port, async close() { await new Promise(resolve => server.close(resolve)); await runtime.close(); } };
}
module.exports = { start };
if (require.main === module) start().then(service => {
  console.log('CRM4 local authenticated callables: 127.0.0.1:' + service.port);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => { await service.close(); process.exit(0); });
}).catch(error => { console.error(error.message); process.exitCode = 1; });
