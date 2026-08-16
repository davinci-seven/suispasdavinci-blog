const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'source', 'cinema', 'img');

function cleanBase64(s) {
  return s.replace(/[^A-Za-z0-9+/=]/g, '');
}

function assertWebP(buf, name) {
  const ok = buf.length > 1000 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP';
  if (!ok) throw new Error(`Invalid WebP rebuilt for ${name} (${buf.length} bytes)`);
}

// Repair chunks are slices of ONE base64 string. Join first, decode once.
function rebuildJoined(name, chunkCount) {
  let b64 = '';
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.fix.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing cinema repair chunk: ${p}`);
    b64 += cleanBase64(fs.readFileSync(p, 'utf8'));
  }
  const buf = Buffer.from(b64, 'base64');
  assertWebP(buf, name);
  fs.writeFileSync(path.join(imgDir, `${name}.webp`), buf);
  console.log(`[cinema] rebuilt ${name}.webp (${buf.length} bytes)`);
}

// Some original assets were split as slices of one base64 string using .b64.N names.
// They must be joined before decoding; decoding each slice independently corrupts the WebP.
function rebuildLegacyJoined(name, chunkCount, outName = name) {
  let b64 = '';
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing legacy cinema chunk: ${p}`);
    b64 += cleanBase64(fs.readFileSync(p, 'utf8'));
  }
  const buf = Buffer.from(b64, 'base64');
  assertWebP(buf, outName);
  fs.writeFileSync(path.join(imgDir, `${outName}.webp`), buf);
  console.log(`[cinema] rebuilt ${outName}.webp (${buf.length} bytes)`);
}

// A few assets were intentionally encoded per chunk; decode those chunks independently.
function rebuildIndependent(name, chunkCount, outName = name) {
  const buffers = [];
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing cinematic chunk: ${p}`);
    buffers.push(Buffer.from(cleanBase64(fs.readFileSync(p, 'utf8')), 'base64'));
  }
  const buf = Buffer.concat(buffers);
  assertWebP(buf, outName);
  fs.writeFileSync(path.join(imgDir, `${outName}.webp`), buf);
  console.log(`[cinema] rebuilt ${outName}.webp (${buf.length} bytes)`);
}

rebuildJoined('beijing-departure', 2);
rebuildJoined('montreal-arrival', 3);
rebuildJoined('workflow-automation', 2);
rebuildIndependent('ai-production', 3);

// 07/08: use the original intact base64 slices. The later repair chunks were malformed.
rebuildLegacyJoined('writing-public', 2);
// final-montreal.webp is already committed as a real binary asset, so no rebuild is needed for 08.
