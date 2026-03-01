const fs = require('fs');
const zlib = require('zlib');

function createMinimalPNG(size) {
  const width = size, height = size;
  const rawData = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    rawData[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const offset = y * (width * 4 + 1) + 1 + x * 4;
      const cx = x / width - 0.5, cy = y / height - 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const intensity = Math.max(0, 1 - dist * 2.5);
      rawData[offset] = Math.min(255, Math.floor(255 * intensity));
      rawData[offset + 1] = Math.min(255, Math.floor(120 * intensity));
      rawData[offset + 2] = Math.min(255, Math.floor(30 * intensity));
      rawData[offset + 3] = 255;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function crc32(buf) {
    let c, table = [];
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c;
    }
    c = 0xFFFFFFFF;
    for (let i = 0; i < buf.length; i++) c = table[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function chunk(type, data) {
    const typeData = Buffer.concat([Buffer.from(type), data]);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(typeData));
    return Buffer.concat([len, typeData, crc]);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflated),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/android-chrome-192x192.png', createMinimalPNG(192));
fs.writeFileSync('public/android-chrome-512x512.png', createMinimalPNG(512));
fs.writeFileSync('public/favicon.ico', createMinimalPNG(32));
console.log('Created PWA icons: 192x192, 512x512, favicon');
