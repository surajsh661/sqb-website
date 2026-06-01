// Center the production-capability icons. The six PNGs were sliced from one
// sheet, so every glass plate is the SAME size (~306x301) but sits at a
// different position inside its 360x360 canvas — which reads as "not centered"
// in the tile row. We detect each plate via a luminance projection profile
// (robust to a glyph poking past the plate edge), then shift the whole image so
// the plate center lands at the canvas center. No resize: the shift only ever
// discards dark vignette/shadow tail, never the plate body. Zero dependencies.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const DIR = path.resolve('public/cap');
const BACKUP = path.join(DIR, '_orig');

// ---- CRC32 ----
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }

// ---- decode 8-bit RGBA PNG ----
function decode(file) {
  const b = fs.readFileSync(file);
  let o = 8, w = 0, h = 0, bitDepth = 0, colorType = 0; const idat = [];
  while (o < b.length) {
    const len = b.readUInt32BE(o); const type = b.toString('ascii', o + 4, o + 8); const data = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); bitDepth = data[8]; colorType = data[9]; }
    else if (type === 'IDAT') idat.push(data); else if (type === 'IEND') break;
    o += 12 + len;
  }
  if (bitDepth !== 8 || colorType !== 6) throw new Error(`${file}: expected 8-bit RGBA`);
  const inf = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, st = w * bpp, out = Buffer.alloc(h * st); let pos = 0;
  for (let y = 0; y < h; y++) {
    const f = inf[pos++]; const cur = out.subarray(y * st, y * st + st); const prev = y > 0 ? out.subarray((y - 1) * st, (y - 1) * st + st) : null;
    for (let x = 0; x < st; x++) {
      const raw = inf[pos++]; const a = x >= bpp ? cur[x - bpp] : 0; const bb = prev ? prev[x] : 0; const cc = x >= bpp && prev ? prev[x - bpp] : 0; let v;
      switch (f) {
        case 0: v = raw; break; case 1: v = raw + a; break; case 2: v = raw + bb; break; case 3: v = raw + ((a + bb) >> 1); break;
        case 4: { const p = a + bb - cc, pa = Math.abs(p - a), pb = Math.abs(p - bb), pc = Math.abs(p - cc); v = raw + (pa <= pb && pa <= pc ? a : pb <= pc ? bb : cc); break; }
        default: throw new Error('bad filter ' + f);
      }
      cur[x] = v & 0xff;
    }
  }
  return { w, h, data: out };
}

// ---- encode 8-bit RGBA PNG ----
function encode(w, h, data) {
  const bpp = 4, st = w * bpp, rows = Buffer.alloc(h * (st + 1));
  for (let y = 0; y < h; y++) { rows[y * (st + 1)] = 0; data.copy(rows, y * (st + 1) + 1, y * st, y * st + st); }
  const deflated = zlib.deflateSync(rows, { level: 9 });
  const chunk = (type, payload) => { const len = Buffer.alloc(4); len.writeUInt32BE(payload.length, 0); const tb = Buffer.from(type, 'ascii'); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([tb, payload])), 0); return Buffer.concat([len, tb, payload, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflated), chunk('IEND', Buffer.alloc(0))]);
}

const lum = (d, i) => { const al = d[i + 3] / 255; return (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * al; };

// Plate center via luminance projection relative to the corner (vignette) baseline.
function plateCenter(w, h, data) {
  let cs = 0, cn = 0; const P = 12;
  for (const [ox, oy] of [[0, 0], [w - P, 0], [0, h - P], [w - P, h - P]]) for (let y = 0; y < P; y++) for (let x = 0; x < P; x++) { cs += lum(data, ((oy + y) * w + (ox + x)) * 4); cn++; }
  const th = cs / cn + 10;
  const col = new Array(w).fill(0), row = new Array(h).fill(0);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (lum(data, (y * w + x) * 4) > th) { col[x]++; row[y]++; }
  const span = (arr, len) => { const need = len * 0.30; let a = -1, b = -1; for (let i = 0; i < arr.length; i++) if (arr[i] >= need) { if (a < 0) a = i; b = i; } return [a, b]; };
  const [x0, x1] = span(col, h), [y0, y1] = span(row, w);
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
}

// Shift content by (dx,dy) on the same-size canvas; exposed edges -> transparent.
function shift(w, h, data, dx, dy) {
  const out = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    const sy = y - dy; if (sy < 0 || sy >= h) continue;
    for (let x = 0; x < w; x++) {
      const sx = x - dx; if (sx < 0 || sx >= w) continue;
      const s = (sy * w + sx) * 4, d = (y * w + x) * 4;
      out[d] = data[s]; out[d + 1] = data[s + 1]; out[d + 2] = data[s + 2]; out[d + 3] = data[s + 3];
    }
  }
  return out;
}

fs.mkdirSync(BACKUP, { recursive: true });
for (const f of fs.readdirSync(DIR).filter((n) => n.endsWith('.png'))) {
  const src = path.join(DIR, f), bak = path.join(BACKUP, f);
  if (!fs.existsSync(bak)) fs.copyFileSync(src, bak);
  const { w, h, data } = decode(bak); // always from pristine original
  const { cx, cy } = plateCenter(w, h, data);
  const dx = Math.round(w / 2 - cx), dy = Math.round(h / 2 - cy);
  fs.writeFileSync(src, encode(w, h, shift(w, h, data, dx, dy)));
  console.log(`${f}: plate center (${cx.toFixed(0)},${cy.toFixed(0)}) -> shift (${dx >= 0 ? '+' : ''}${dx}, ${dy >= 0 ? '+' : ''}${dy})`);
}
console.log('done — plates centered');
