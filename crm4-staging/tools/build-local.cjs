'use strict';
// Mechanical clone of fingerprint-verified public CRM sources; never executes them.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { seeds } = require('./inventory.cjs');
const root = path.resolve(__dirname, '..');
const hash = b => crypto.createHash('sha1').update(b).digest('hex');
const route = p => p.replace(/crm2/g, 'crm4');
const crmPage = p => seeds.includes(p) || /^(?:crm2|manager-|lister-|closer-|processing-|case-action|paid-client|client-|staff-|agreement-|agenda|dialer|login|admin(?:-|\.)|dashboard-quaerens)/.test(p);
const eligible = p => !/(?:^|\/)(?:\.|.*(?:secret|credential|service.account))/i.test(p) &&
  !p.includes('..') && !p.includes('\\') && /\.(?:html|js|mjs|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(p);
function transform(source, modules) {
  let text = source.replace(/\r\n/g, '\n').replace(/crm2/g, 'crm4').replace(/CRM2/g, 'CRM4');
  // CRM4-specific entry routing; keep the existing Processing screen/workflow.
  if (text.includes('export const roleRoutes = Object.freeze({')) text = text.replace('administrator: "/manager-dashboard.html"', 'administrator: "/manager-dashboard.html",\n  processing: "/processing-dashboard.html"');
  text = text.replace(/(?<!if \(authLoader\) )authLoader\.style\.display = "none";/g, 'if (authLoader) authLoader.style.display = "none";');
  // Table cards must be allowed to shrink inside grid tracks on narrow screens.
  if (/Quaerens (Manager|Closer) Dashboard/.test(text)) text = text.replace('.card { background:', '.card { min-width: 0; background:');
  // CRM4 Manager UI uses the existing governed action instead of broad client
  // writes. The backend remains responsible for transitions and audit history.
  text = text.replace('        await updateDoc(doc(db,currentSubmissionCollection,selectedSubmission.id),patch);', `        if (isCrm2(currentContext)) {
          const action = ({ approved: 'APPROVE', rejected: 'REJECT', more_info_needed: 'REQUEST_INFORMATION' })[finalDecision] || 'SAVE_REVIEW';
          await httpsCallable(functions, 'crm4ManagerUpdateLead')({ leadId: selectedSubmission.id, action, managerNotes: notes, managerOutcome: outcome });
          await refreshSelectedSubmission();
          showModalMessage('Manager review updated.');
          return;
        }
        await updateDoc(doc(db,currentSubmissionCollection,selectedSubmission.id),patch);`);
  text = text.replace(/https:\/\/us-central1-quaerensclaims\.cloudfunctions\.net\//g, 'http://127.0.0.1:5001/demo-quaerens-crm4/us-central1/');
  // Public Firebase client configuration is not carried into the clone.
  for (const key of ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId', 'measurementId', 'databaseURL']) {
    text = text.replace(new RegExp('((?:["\\\']?' + key + '["\\\']?)\\s*:\\s*)["\\\'][^"\\\']*["\\\']', 'g'),
      (_, prefix) => prefix + JSON.stringify(key === 'projectId' ? 'demo-quaerens-crm4' : 'crm4-local-only'));
  }
  text = text.replace(/https:\/\/www\.gstatic\.com\/firebasejs\/([\d.]+)\/firebase-(app|auth|firestore|functions|storage)\.js/g,
    (_, version, service) => { modules.add(`${version}/${service}`); return `/__crm4/sdk/${version}/${service}.js`; });
  text = text.replace(/(<script\s+src=["']https:\/\/www\.gstatic\.com\/firebasejs\/[\d.]+\/firebase-storage-compat\.js["']><\/script>)/g,
    '$1<script src="/__crm4/compat.js"></script>');
  return text.replace(/^[\t ]+$/gm, '').replace(/\s+$/, '') + '\n';
}
function compatWrapper() {
  return `(() => {
    if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');
    const original = firebase.initializeApp.bind(firebase);
    firebase.initializeApp = () => {
      const app = original({projectId:'demo-quaerens-crm4',apiKey:'demo-emulator-only',authDomain:'localhost',storageBucket:'demo-quaerens-crm4.appspot.com'});
      app.auth().useEmulator('http://127.0.0.1:9099');
      app.functions('us-central1').useEmulator('127.0.0.1',5001);
      app.storage().useEmulator('127.0.0.1',9199);
      return app;
    };
    if (firebase.apps.length) throw new Error('CRM4 compat must connect before application initialisation');
  })();\n`;
}
function wrapper(version, service) {
  const url = `https://www.gstatic.com/firebasejs/${version}/firebase-${service}.js`;
  const base = `export * from ${JSON.stringify(url)};\nimport * as sdk from ${JSON.stringify(url)};\n`;
  const guard = `if (!['localhost','127.0.0.1','[::1]'].includes(location.hostname)) throw new Error('CRM4 local only');\n`;
  if (service === 'app') return base + guard + `export function initializeApp(){return sdk.getApps().find(a=>a.name==='[DEFAULT]')||sdk.initializeApp({projectId:'demo-quaerens-crm4',apiKey:'demo-emulator-only',authDomain:'localhost',storageBucket:'demo-quaerens-crm4.appspot.com'});}\n`;
  const names = { auth: ['Auth', "'http://127.0.0.1:9099'"], firestore: ['Firestore', "'127.0.0.1',8080"], functions: ['Functions', "'127.0.0.1',5001"], storage: ['Storage', "'127.0.0.1',9199"] };
  const [name, endpoint] = names[service];
  return base + guard + `const connected=new WeakSet();\nexport function get${name}(...args){const value=sdk.get${name}(...args);if(value.app.options.projectId!=='demo-quaerens-crm4')throw new Error('CRM4 project mismatch');if(!connected.has(value)){sdk.connect${name}Emulator(value,${endpoint});connected.add(value);}return value;}\n`;
}
async function build(manifest, deploymentId) {
  const files = new Map(manifest.map(f => [f.path.replace(/^public\//, ''), f]).filter(([p, f]) => f.path.startsWith('public/') && eligible(p)));
  const extras = [...files.keys()].filter(p => /^(?:crm2|manager-|lister-|closer-|processing-|case-action|paid-client|client-portal)/.test(p));
  const queue = [...seeds, ...extras], done = new Set(), modules = new Set(), records = [], missing = [], blocked = [];
  const out = path.join(root, 'local-public');
  while (queue.length) {
    const p = queue.shift();
    if (!eligible(p) || done.has(p)) continue;
    done.add(p);
    const metadata = files.get(p);
    if (!metadata) { missing.push(p); continue; }
    const response = await fetch('https://www.quaerens.co.uk/' + p, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${p}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (hash(bytes) !== metadata.uid) throw new Error(`${p}: baseline drift`);
    let result = bytes;
    if (/\.(?:html|js|mjs|css)$/.test(p)) {
      const source = bytes.toString('utf8');
      const references = [...source.matchAll(/["'`]([^"'`\s<>]+\.(?:html|js|mjs|css|png|jpg|jpeg|svg|webp|ico|woff2?))(?:[?#][^"'`\s<>]*)?["'`]/g)].map(m => m[1]);
      for (const ref of references) {
        if (/^(?:https?:|data:|\/\/)/.test(ref)) continue;
        const clean = ref.split(/[?#]/)[0];
        const local = path.posix.normalize(clean.startsWith('/') ? clean.slice(1) : path.posix.join(path.posix.dirname(p), clean));
        if (eligible(local) && !/^crm3/.test(local) && (!local.endsWith('.html') || crmPage(local))) queue.push(local);
      }
      result = Buffer.from(transform(source, modules));
      if (/firebase\.initializeApp/.test(source) && !result.includes('/__crm4/compat.js')) blocked.push({ path: route(p), reason: 'Compatibility SDK adapter unavailable' });
    }
    const target = path.join(out, route(p));
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, result);
    records.push({ source: p, target: route(p), sourceSha1: metadata.uid, cloneSha1: hash(result) });
  }
  fs.mkdirSync(path.join(out, '__crm4'), { recursive: true });
  fs.writeFileSync(path.join(out, '__crm4/compat.js'), compatWrapper());
  for (const key of modules) {
    const [version, service] = key.split('/'), target = path.join(out, '__crm4/sdk', version, service + '.js');
    fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, wrapper(version, service));
  }
  const report = { deploymentId, mode: 'LOCAL_EMULATOR_ONLY', records, modules: [...modules].sort(), support: ['__crm4/compat.js'], missing: [...new Set(missing)].sort(), blocked };
  fs.writeFileSync(path.join(root, 'clone-manifest.json'), JSON.stringify(report, null, 2) + '\n');
  return report;
}
module.exports = { transform, wrapper, compatWrapper, eligible, build };
if (require.main === module) build(JSON.parse(fs.readFileSync(process.argv[2])), process.argv[3]).then(r => console.log(JSON.stringify({ files: r.records.length, blocked: r.blocked, missing: r.missing }))).catch(e => { console.error(e.message); process.exitCode = 1; });
