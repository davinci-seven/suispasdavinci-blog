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

// HQ v14 files are four text slices of one base64 string. Join first, decode once.
function rebuildHQJoined(name, chunkCount, outName = name) {
  let b64 = '';
  for (let i = 0; i < chunkCount; i++) {
    const p = path.join(imgDir, `${name}.webp.hq.b64.${i}`);
    if (!fs.existsSync(p)) throw new Error(`Missing HQ cinema chunk: ${p}`);
    b64 += cleanBase64(fs.readFileSync(p, 'utf8'));
  }
  const buf = Buffer.from(b64, 'base64');
  assertWebP(buf, outName);
  fs.writeFileSync(path.join(imgDir, `${outName}.webp`), buf);
  console.log(`[cinema] rebuilt ${outName}.webp (${buf.length} bytes)`);
}

rebuildJoined('beijing-departure', 2);
rebuildJoined('montreal-arrival', 3);
rebuildJoined('workflow-automation', 2);
rebuildIndependent('ai-production', 3);

// 07/08: write both new versioned names and legacy names so even a cached v13 stylesheet gets the repaired images.
rebuildHQJoined('writing-public-v14', 4, 'writing-public-v14');
rebuildHQJoined('writing-public-v14', 4, 'writing-public');
rebuildHQJoined('final-montreal-v14', 4, 'final-montreal-v14');
rebuildHQJoined('final-montreal-v14', 4, 'final-montreal');
