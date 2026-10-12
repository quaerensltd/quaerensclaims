'use strict';
const http = require('node:http'), fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../local-public');
const mime = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript', '.css':'text/css', '.png':'image/png', '.svg':'image/svg+xml', '.jpg':'image/jpeg', '.webp':'image/webp' };
// Network isolation also covers old direct fetches that do not use Firebase SDKs.
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.gstatic.com https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://127.0.0.1:9099 http://127.0.0.1:8080 http://127.0.0.1:5001 http://127.0.0.1:9199 ws://127.0.0.1:8080; frame-src 'self' blob:; form-action 'none'; object-src 'none'; base-uri 'self'";
function handler(req, res) {
  res.setHeader('Content-Security-Policy', csp); res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow'); res.setHeader('X-Content-Type-Options', 'nosniff');
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); return res.end(); }
  if (p === '/') p = '/crm4-login.html';
  const file = path.resolve(root, '.' + p);
  const manifest = JSON.parse(fs.readFileSync(path.join(root, '../clone-manifest.json')));
  const allowed = manifest.records.some(x => '/' + x.target === p) || manifest.modules.some(x => '/__crm4/sdk/' + x + '.js' === p) || (manifest.support || []).some(x => '/' + x === p);
  if (!allowed) { res.writeHead(404); return res.end('Not a CRM4 asset'); }
  if (!file.startsWith(root + path.sep) || /(?:^|\/)\.|crm2|crm3/.test(p) || manifest.blocked.some(x => '/' + x.path === p)) { res.writeHead(403); return res.end('Route not isolated'); }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile() || !fs.realpathSync(file).startsWith(root + path.sep)) { res.writeHead(404); return res.end('Not available in CRM4'); }
  res.setHeader('Content-Type', (mime[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
  res.writeHead(200); if (req.method === 'HEAD') return res.end(); fs.createReadStream(file).pipe(res);
}
module.exports = { handler, csp };
if (require.main === module) http.createServer(handler).listen(4404, '127.0.0.1', () => console.log('CRM4 local only: http://127.0.0.1:4404'));
