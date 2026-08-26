import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { assets, copyPolicy } from './content.mjs';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const root = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(root, '../..');
const runDir = path.join(repo, '.codex/gpt-orchestrator/runs/20260805-104000-taobao-gemini-gpt-images');
const sourceDir = path.join(runDir, 'outputs/generated-frontend-only');
const finalDir = path.join(root, 'deliverables');
const thumbDir = path.join(root, 'thumbnails');

function escapeXml(value) {
  return String(value).replace(/[<>&'\"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[char]);
}

function tagsMarkup(tags, accent) {
  let x = 810;
  return tags.map((tag) => {
    const width = 62 + [...tag].length * 29;
    const node = `
      <g transform="translate(${x} 242)">
        <rect width="${width}" height="56" rx="28" fill="#050B18" fill-opacity=".58" stroke="${accent}" stroke-opacity=".72" stroke-width="2"/>
        <text x="${width / 2}" y="38" text-anchor="middle" class="tag">${escapeXml(tag)}</text>
      </g>`;
    x += width + 16;
    return node;
  }).join('');
}

function overlaySvg(asset) {
  const titleSize = [...asset.title].length >= 7 ? 102 : 114;
  return Buffer.from(`
    <svg width="1440" height="1440" viewBox="0 0 1440 1440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#030713" stop-opacity=".40"/>
          <stop offset=".86" stop-color="#030713" stop-opacity=".02"/>
          <stop offset="1" stop-color="#030713" stop-opacity="0"/>
        </linearGradient>
        <filter id="textShadow" x="-30%" y="-50%" width="160%" height="220%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#000" flood-opacity=".72"/>
        </filter>
        <style>
          .brand{font:700 27px 'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif;letter-spacing:5px;fill:#fff}
          .title{font:900 ${titleSize}px 'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif;letter-spacing:-3px;fill:#fff}
          .subtitle{font:650 35px 'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif;letter-spacing:1px;fill:${asset.accentSoft}}
          .tag{font:650 25px 'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif;fill:#fff}
        </style>
      </defs>
      <rect width="1440" height="338" fill="url(#topShade)"/>
      <g filter="url(#textShadow)">
        <rect x="74" y="48" width="10" height="34" rx="5" fill="${asset.accent}"/>
        <text x="102" y="76" class="brand">有范互动</text>
        <text x="70" y="194" class="title">${escapeXml(asset.title)}</text>
        <rect x="74" y="218" width="112" height="7" rx="3.5" fill="${asset.accent}"/>
        <text x="74" y="278" class="subtitle">${escapeXml(asset.subtitle)}</text>
        ${tagsMarkup(asset.tags, asset.accent)}
      </g>
    </svg>`);
}

await fs.mkdir(finalDir, { recursive: true });
await fs.mkdir(thumbDir, { recursive: true });

for (const asset of assets) {
  const input = path.join(sourceDir, asset.source);
  const png = path.join(finalDir, `${asset.id}-1440.png`);
  const jpg = path.join(finalDir, `${asset.id}-1440.jpg`);
  const thumb = path.join(thumbDir, `${asset.id}-360.png`);

  const base = sharp(input).resize(1440, 1440, { fit: 'fill' });
  await base.clone().composite([{ input: overlaySvg(asset) }]).png({ compressionLevel: 9 }).toFile(png);
  await sharp(png).jpeg({ quality: 93, chromaSubsampling: '4:4:4' }).toFile(jpg);
  await sharp(png).resize(360, 360, { fit: 'fill' }).png().toFile(thumb);
}

const tiles = [];
for (let i = 0; i < assets.length; i += 1) {
  const asset = assets[i];
  const thumb = await sharp(path.join(finalDir, `${asset.id}-1440.png`)).resize(420, 420).toBuffer();
  tiles.push({ input: thumb, left: (i % 3) * 420, top: Math.floor(i / 3) * 420 });
}
await sharp({ create: { width: 1260, height: 840, channels: 3, background: '#071126' } })
  .composite(tiles)
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(path.join(root, 'contact-sheet-1260.jpg'));

const mobileTiles = [];
for (let i = 0; i < assets.length; i += 1) {
  mobileTiles.push({
    input: path.join(thumbDir, `${assets[i].id}-360.png`),
    left: (i % 3) * 360,
    top: Math.floor(i / 3) * 360,
  });
}
await sharp({ create: { width: 1080, height: 720, channels: 3, background: '#071126' } })
  .composite(mobileTiles)
  .jpeg({ quality: 92, chromaSubsampling: '4:4:4' })
  .toFile(path.join(root, 'contact-sheet-mobile-1080.jpg'));

const manifest = {
  version: 1,
  generatedAt: new Date().toISOString(),
  campaign: 'taobao-frontend-screen-20260805',
  sourceRun: runDir,
  generatorSurface: 'ChatGPT Web Create Image',
  generatorModelLabel: '创建图片',
  promptAuthor: 'Gemini Web Pro',
  direction: 'Buyer-visible front-end large-screen effects only; no scenes, flows, or management backend.',
  copyPolicy,
  assets,
};
await fs.writeFile(path.join(root, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({ finalDir, thumbDir, assets: assets.map((asset) => asset.id) }, null, 2));
