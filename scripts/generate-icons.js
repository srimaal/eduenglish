import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function createPng(width, height, r, g, b, isMaskable = false) {
  // Simple uncompressed or deflate-compressed RGBA PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // Compression method
  ihdrData.writeUInt8(0, 11); // Filter method
  ihdrData.writeUInt8(0, 12); // Interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data: filter byte (0) + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = width * 0.45;
  const innerRadius = width * 0.35;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Warm Amber brand background (#b45309 -> 180, 83, 9)
      let pr = r;
      let pg = g;
      let pb = b;
      let pa = 255;

      // Draw rounded emblem center or gold ring
      if (dist <= outerRadius && dist >= outerRadius - Math.max(3, width * 0.04)) {
        // Gold accent ring (#fde68a -> 253, 230, 138)
        pr = 253; pg = 230; pb = 138;
      } else if (dist < innerRadius) {
        // Center disc (#d97706 -> 217, 119, 6)
        pr = 217; pg = 119; pb = 6;
      }

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
      rawData[pixelOffset + 3] = pa;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function createChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  chunk.writeUInt32BE(crc32(crcTarget), 8 + len);
  return chunk;
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons in public/
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, 180, 83, 9));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, 180, 83, 9));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, 180, 83, 9, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, 180, 83, 9));

// Also write public/icon.svg
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="190" fill="none" stroke="#fde68a" stroke-width="14" stroke-dasharray="8 6"/>
  <text x="256" y="275" font-family="system-ui, -apple-system, sans-serif" font-size="160" font-weight="900" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">SG</text>
  <text x="256" y="380" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="700" fill="#fef3c7" text-anchor="middle">SINGLISH</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgIcon);

console.log('All PWA icons created successfully in public/!');
