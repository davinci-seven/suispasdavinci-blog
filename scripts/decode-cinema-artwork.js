const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'source', 'cinema', 'img');

const assets = [
  { name: 'workflow-automation', chunks: 3 },
  { name: 'ai-production', chunks: 3 },
  { name: 'writing-public', chunks: 2 },
  { name: 'final-montreal-v11', chunks: 2 },
];

function cleanBase64(s) {
  return s.replace(/[^A-Za-z0-9+/=]/g, '');
}

for (const asset of assets) {
  const buffers = [];
  for (let i = 0; i < asset.chunks; i++) {
    const chunkPath = path.join(imgDir, `${asset.name}.webp.b64.${i}`);
    if (!fs.existsSync(chunkPath)) {
      throw new Error(`Missing cinematic chunk: ${chunkPath}`);
    }
    const b64 = cleanBase64(fs.readFileSync(chunkPath, 'utf8'));
    buffers.push(Buffer.from(b64, 'base64'));
  }
  const out = path.join(imgDir, `${asset.name}.webp`);
  fs.writeFileSync(out, Buffer.concat(buffers));
  console.log(`[cinema] decoded ${path.basename(out)} (${fs.statSync(out).size} bytes)`);
}
