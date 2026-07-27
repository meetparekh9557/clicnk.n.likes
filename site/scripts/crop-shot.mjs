// Crops a raw website screenshot down to the part worth showing in a case
// study, rather than pasting a full-page capture that renders as an
// unreadable sliver.
//
// The default crop is the top of the page at a 16:10 ratio: navigation,
// hero and the first content block. That is the region a visitor actually
// judges a site on, and cropping both the before and the after to the same
// ratio makes the comparison fair instead of flattering.
//
// Usage:
//   node scripts/crop-shot.mjs --in=public/work/aidbylaw-old.png \
//        --out=public/work/aidbylaw-old.png [--ratio=1.6] [--offset=0] [--width=1440]
//
//   --ratio   width ÷ height of the crop (default 1.6, i.e. 16:10)
//   --offset  fraction of the image height to skip before cropping
//             (0 = start at the very top; 0.1 = skip the first 10%)
//   --width   output width in px; the file is resized to this after cropping
import sharp from 'sharp';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/s);
    return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
  })
);

const inPath = resolve(ROOT, args.in || '');
const outPath = resolve(ROOT, args.out || args.in || '');
const ratio = parseFloat(args.ratio || '1.6');
const offset = parseFloat(args.offset || '0');
const outWidth = parseInt(args.width || '1440', 10);

if (!args.in || !existsSync(inPath)) {
  console.error(`Input not found: ${args.in || '(none given)'}`);
  process.exit(1);
}

const img = sharp(inPath);
const meta = await img.metadata();
const top = Math.round(meta.height * offset);
// Never crop taller than what remains below the offset.
const height = Math.min(Math.round(meta.width / ratio), meta.height - top);

const buf = await sharp(inPath)
  .extract({ left: 0, top, width: meta.width, height })
  .resize({ width: outWidth, withoutEnlargement: true })
  .png({ quality: 90, compressionLevel: 9 })
  .toBuffer();

const { writeFileSync } = await import('node:fs');
writeFileSync(outPath, buf);
const out = await sharp(buf).metadata();
console.log(
  `cropped ${args.in}: ${meta.width}x${meta.height} -> ${out.width}x${out.height}` +
    ` (ratio ${ratio}, offset ${offset})  ${(buf.length / 1024).toFixed(0)}KB`
);
