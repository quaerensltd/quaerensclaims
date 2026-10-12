'use strict';
// Selective ZIP reads: never download an entire production source archive.
// Only directory metadata and explicitly selected JavaScript source are read.
const cp = require('node:child_process'), zlib = require('node:zlib');
async function sourceDirectory(bucket, object, generation) {
  const token = cp.execFileSync('powershell.exe', ['-NoProfile', '-Command', 'gcloud auth print-access-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const base = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(object)}?generation=${generation}`;
  const headers = { Authorization: `Bearer ${token}` };
  const meta = await fetch(base, { headers });
  if (!meta.ok) throw new Error(`Source metadata HTTP ${meta.status}`);
  const { size } = await meta.json();
  async function range(start, length) {
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(length) || start < 0 || length < 1 || start + length > Number(size)) throw new Error('Invalid archive range');
    const res = await fetch(base + '&alt=media', { headers: { ...headers, Range: `bytes=${start}-${start + length - 1}` } });
    if (res.status !== 206) { await res.body?.cancel(); throw new Error('Partial source reads not supported; refusing whole archive'); }
    const b = Buffer.from(await res.arrayBuffer());
    if (b.length !== length) throw new Error('Unexpected range length'); return b;
  }
  const end = await range(Number(size) - 22, 22);
  if (end.readUInt32LE(0) !== 0x06054b50 || end.readUInt16LE(20) !== 0) throw new Error('Unsupported ZIP directory');
  const central = await range(end.readUInt32LE(16), end.readUInt32LE(12));
  const entries = [];
  for (let p = 0; p < central.length;) {
    if (central.readUInt32LE(p) !== 0x02014b50) throw new Error('Invalid ZIP directory entry');
    const nameLength = central.readUInt16LE(p + 28), extra = central.readUInt16LE(p + 30), comment = central.readUInt16LE(p + 32);
    const name = central.subarray(p + 46, p + 46 + nameLength).toString('utf8');
    entries.push({ name, flags: central.readUInt16LE(p + 8), method: central.readUInt16LE(p + 10), size: central.readUInt32LE(p + 20), offset: central.readUInt32LE(p + 42) });
    p += 46 + nameLength + extra + comment;
  }
  async function readEntry(name) {
    const entry = entries.find(e => e.name === name); if (!entry) throw new Error('Source entry absent');
    if (entry.flags & 1 || entry.size > 10_000_000) throw new Error('Unsupported source entry');
    const header = await range(entry.offset, 30);
    if (header.readUInt32LE(0) !== 0x04034b50) throw new Error('Invalid ZIP source header');
    const payload = await range(entry.offset + 30 + header.readUInt16LE(26) + header.readUInt16LE(28), entry.size);
    if (entry.method === 0) return payload;
    if (entry.method === 8) return zlib.inflateRawSync(payload, { maxOutputLength: 20_000_000 });
    throw new Error('Unsupported source compression');
  }
  async function readJavaScript(name) {
    if (!/^[\w/-]+\.(?:js|cjs|mjs)$/.test(name) || /secret|credential|service.?account|node_modules/i.test(name)) throw new Error('Source path not authorised');
    return readEntry(name);
  }
  async function readInformationBrochure() {
    const bytes = await readEntry('internal-assets/client-information-brochure-en-2026-08-13.pdf');
    if (require('node:crypto').createHash('sha256').update(bytes).digest('hex') !== '6188112b85b08f495cf6a83485dd4e6fa44b5fe6cd38ae7509468be64351fcf6') throw Error('Brochure hash mismatch');
    return bytes;
  }
  return { entries, readJavaScript, readInformationBrochure };
}
module.exports = { sourceDirectory };
