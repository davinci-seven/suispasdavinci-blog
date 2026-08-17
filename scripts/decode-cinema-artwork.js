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

function rebuildJoined(name, chunkCount, outName = name) {
  let b64 = '';
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.fix.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing cinema repair chunk: ${p}`);
    b64 += cleanBase64(fs.readFileSync(p, 'utf8'));
  }
  const buf = Buffer.from(b64, 'base64');
  assertWebP(buf, outName);
  fs.writeFileSync(path.join(imgDir, `${outName}.webp`), buf);
  console.log(`[cinema] rebuilt ${outName}.webp (${buf.length} bytes)`);
}

function rebuildJoinedLegacy(name, chunkCount, outName = name) {
  let b64 = '';
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing cinematic chunk: ${p}`);
    b64 += cleanBase64(fs.readFileSync(p, 'utf8'));
  }
  const buf = Buffer.from(b64, 'base64');
  assertWebP(buf, outName);
  fs.writeFileSync(path.join(imgDir, `${outName}.webp`), buf);
  console.log(`[cinema] rebuilt ${outName}.webp (${buf.length} bytes)`);
}

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
rebuildJoined('writing-public', 4);
// These two files are slices of one base64 stream, not independently encoded chunks.
rebuildJoinedLegacy('final-montreal-v11', 2, 'final-montreal');
