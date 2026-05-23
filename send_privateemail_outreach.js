#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const tls = require('tls');
const net = require('net');

const root = __dirname;
const args = new Set(process.argv.slice(2));
const dryRun = !args.has('--send');
const only = [...args].find(arg => arg.startsWith('--only='))?.slice('--only='.length).toLowerCase();
const limit = Number([...args].find(arg => arg.startsWith('--limit='))?.slice('--limit='.length) || '5');
const singleTo = [...args].find(arg => arg.startsWith('--to='))?.slice('--to='.length);
const singleSubject = [...args].find(arg => arg.startsWith('--subject='))?.slice('--subject='.length);
const singleBodyFile = [...args].find(arg => arg.startsWith('--body-file='))?.slice('--body-file='.length);

function loadEnv(file) {
  if (!fs.existsSync(file)) return {};
  const env = {};
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = { ...process.env, ...loadEnv(path.join(root, '.env')) };

function requireEnv(name) {
  if (!env[name]) throw new Error('Missing ' + name + ' in .env');
  return env[name];
}

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function csvEscape(value) {
  value = String(value ?? '');
  return /[",\r\n]/.test(value) ? '"' + value.replace(/"/g, '""') + '"' : value;
}

function readTracker() {
  const trackerPath = path.join(root, 'seo-backlink-outreach-tracker.csv');
  const lines = fs.readFileSync(trackerPath, 'utf8').trimEnd().split(/\r?\n/);
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(line => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, i) => [header, values[i] || '']));
  });
  return { trackerPath, headers, rows };
}

function writeTracker(trackerPath, headers, rows) {
  const text = [
    headers.map(csvEscape).join(','),
    ...rows.map(row => headers.map(header => csvEscape(row[header])).join(',')),
  ].join('\n') + '\n';
  fs.writeFileSync(trackerPath, text, 'utf8');
}

function readMessages() {
  const file = path.join(root, 'seo-outreach-round-one-ready-to-send.md');
  const text = fs.readFileSync(file, 'utf8');
  const sections = text.split(/\n## /).slice(1);
  const map = new Map();
  for (const section of sections) {
    const title = section.split('\n')[0].trim();
    const subject = section.match(/^Subject:\s*(.+)$/m)?.[1]?.trim();
    const body = section.match(new RegExp('\\x60{3}text\\n([\\s\\S]*?)\\n\\x60{3}'))?.[1]?.trim();
    if (title && subject && body) map.set(title, { subject, body });
  }
  return map;
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function encodeBase64(value) {
  return Buffer.from(String(value), 'utf8').toString('base64');
}

function normalizeBody(body) {
  const signatureName = env.OUTREACH_SIGNATURE_NAME || env.SMTP_USER || '';
  return body.replace(/\[Your name\]/g, signatureName).replace(/\r?\n/g, '\r\n') + '\r\n';
}

function smtpRead(socket) {
  return new Promise((resolve, reject) => {
    let data = '';
    const onData = chunk => {
      data += chunk.toString('utf8');
      const lines = data.split(/\r?\n/).filter(Boolean);
      const last = lines[lines.length - 1] || '';
      if (/^\d{3} /.test(last)) {
        socket.off('data', onData);
        socket.off('error', onError);
        resolve(data);
      }
    };
    const onError = err => {
      socket.off('data', onData);
      reject(err);
    };
    socket.on('data', onData);
    socket.on('error', onError);
  });
}

async function smtpCommand(socket, command, expected = /^[23]/) {
  if (command) socket.write(command + '\r\n');
  const reply = await smtpRead(socket);
  const code = reply.slice(0, 3);
  if (!expected.test(code)) {
    throw new Error('SMTP command failed: ' + command + '\n' + reply);
  }
  return reply;
}

function foldHeader(name, value) {
  return name + ': ' + String(value).replace(/\r?\n/g, ' ');
}

function messageId(fromEmail) {
  const domain = fromEmail.split('@')[1] || 'quaerens.co.uk';
  return '<' + Date.now() + '.' + Math.random().toString(16).slice(2) + '@' + domain + '>';
}

async function sendSmtp({ to, subject, body }) {
  const host = env.SMTP_HOST || 'mail.privateemail.com';
  const port = Number(env.SMTP_PORT || '465');
  const secure = String(env.SMTP_SECURE || 'true').toLowerCase() !== 'false';
  const user = requireEnv('SMTP_USER');
  const pass = requireEnv('SMTP_PASS');
  const from = env.OUTREACH_FROM || user;
  const fromEmail = (from.match(/<([^>]+)>/)?.[1] || from).trim();
  const socket = secure
    ? tls.connect({ host, port, servername: host, rejectUnauthorized: true })
    : net.connect({ host, port });
  socket.setTimeout(30000);
  await new Promise((resolve, reject) => {
    socket.once('secureConnect', resolve);
    socket.once('connect', () => { if (!secure) resolve(); });
    socket.once('error', reject);
    socket.once('timeout', () => reject(new Error('SMTP connection timed out')));
  });
  await smtpCommand(socket, null);
  await smtpCommand(socket, 'EHLO quaerens.co.uk');
  await smtpCommand(socket, 'AUTH LOGIN', /^334/);
  await smtpCommand(socket, encodeBase64(user), /^334/);
  await smtpCommand(socket, encodeBase64(pass), /^235/);
  await smtpCommand(socket, 'MAIL FROM:<' + fromEmail + '>');
  await smtpCommand(socket, 'RCPT TO:<' + to + '>');
  await smtpCommand(socket, 'DATA', /^354/);
  const headers = [
    foldHeader('From', from),
    foldHeader('To', to),
    foldHeader('Subject', subject),
    foldHeader('Date', new Date().toUTCString()),
    foldHeader('Message-ID', messageId(fromEmail)),
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ].join('\r\n');
  socket.write(headers + '\r\n\r\n' + normalizeBody(body).replace(/^\./gm, '..') + '\r\n.\r\n');
  await smtpCommand(socket, null);
  await smtpCommand(socket, 'QUIT', /^[23]/);
  socket.end();
}

async function main() {
  if (singleTo || singleSubject || singleBodyFile) {
    if (!singleTo || !singleSubject || !singleBodyFile) {
      throw new Error('Single-send mode requires --to=, --subject= and --body-file=');
    }
    const bodyPath = path.isAbsolute(singleBodyFile) ? singleBodyFile : path.join(root, singleBodyFile);
    const body = fs.readFileSync(bodyPath, 'utf8');
    if (dryRun) {
      console.log(JSON.stringify({ dryRun, single: true, to: singleTo, subject: singleSubject, bodyFile: bodyPath }, null, 2));
      return;
    }
    await sendSmtp({ to: singleTo, subject: singleSubject, body });
    console.log(JSON.stringify({ dryRun, sent: 1, to: singleTo, subject: singleSubject }, null, 2));
    return;
  }

  const { trackerPath, headers, rows } = readTracker();
  const messages = readMessages();
  const today = new Date().toISOString().slice(0, 10);
  let sent = 0;
  const report = [];

  for (const row of rows) {
    if (limit && sent >= limit) break;
    if (row.Status !== 'Ready to send') continue;
    if (only && !row['Target site'].toLowerCase().includes(only)) continue;
    const contact = row['Contact email or form'].trim();
    const msg = messages.get(row['Target site']);
    if (!msg) {
      report.push({ site: row['Target site'], status: 'skipped', reason: 'No message in round-one file' });
      continue;
    }
    if (!isEmail(contact)) {
      report.push({ site: row['Target site'], status: 'skipped', reason: 'Contact is a form URL, not an email address', contact });
      continue;
    }
    if (dryRun) {
      report.push({ site: row['Target site'], status: 'dry-run', to: contact, subject: msg.subject });
      continue;
    }
    await sendSmtp({ to: contact, subject: msg.subject, body: msg.body });
    row['Email sent'] = today;
    row.Status = 'Sent';
    row.Notes = (row.Notes ? row.Notes + ' | ' : '') + 'Sent by outreach SMTP script';
    sent++;
    report.push({ site: row['Target site'], status: 'sent', to: contact, subject: msg.subject });
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  if (!dryRun && sent) writeTracker(trackerPath, headers, rows);
  console.log(JSON.stringify({ dryRun, sent, report }, null, 2));
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
