import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const runDir = path.resolve(import.meta.dirname, '..');
const backgroundsDir = path.join(runDir, 'outputs', 'backgrounds');
const finalDir = path.join(runDir, 'outputs', 'final');
const thumbnailDir = path.join(runDir, 'outputs', 'thumbnails');

const assets = [
  {
    id: 'qr-electric',
    source: path.join(backgroundsDir, 'qr', 'qr-electric.png'),
    title: '扫码抽奖',
    subtitle: '微信扫码 · 全员参与',
    tags: ['现场互动', '即时开奖', '大屏展示'],
    accent: '#28F3FF',
    accentSoft: '#B8FAFF',
  },
  {
    id: 'qr-warm-gold',
    source: path.join(backgroundsDir, 'qr', 'qr-warm-gold.png'),
    title: '扫码抽奖',
    subtitle: '微信扫码 · 全员参与',
    tags: ['现场互动', '即时开奖', '大屏展示'],
    accent: '#FFD27A',
    accentSoft: '#FFF1CC',
  },
  {
    id: 'list-clean-enterprise',
    source: path.join(backgroundsDir, 'list', 'list-clean-enterprise.png'),
    title: '名单抽奖',
    subtitle: '名单导入 · 现场可控',
    tags: ['姓名滚动', '结果展示', '活动抽取'],
    accent: '#72F0D3',
    accentSoft: '#D9FFF6',
  },
  {
    id: 'list-ceremony-gold',
    source: path.join(backgroundsDir, 'list', 'list-ceremony-gold.png'),
    title: '名单抽奖',
    subtitle: '名单导入 · 现场可控',
    tags: ['姓名滚动', '结果展示', '活动抽取'],
    accent: '#F3C969',
    accentSoft: '#FFF0C7',
  },
  {
    id: 'game-neon-crowd',
    source: path.join(backgroundsDir, 'game', 'game-neon-crowd.png'),
    title: '大屏互动游戏',
    subtitle: '全员互动 · 点燃现场',
    tags: ['摇一摇', '红包雨', '现场竞技'],
    accent: '#5CF1FF',
    accentSoft: '#D1FBFF',
  },
  {
    id: 'game-festival-warm',
    source: path.join(backgroundsDir, 'game', 'game-festival-warm.png'),
    title: '大屏互动游戏',
    subtitle: '全员互动 · 点燃现场',
    tags: ['摇一摇', '红包雨', '现场竞技'],
    accent: '#FFD06B',
    accentSoft: '#FFF0C7',
  },
];

function escapeXml(value) {
  return value.replace(/[<>&'\"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;',
  })[char]);
}

function tagMarkup(tags, accent) {
  let x = 108;
  return tags.map((tag) => {
    const width = 78 + [...tag].length * 40;
    const markup = `
      <g transform="translate(${x} 478)">
        <rect width="${width}" height="72" rx="36" fill="rgba(8,15,28,.74)" stroke="${accent}" stroke-opacity=".66" stroke-width="2"/>
        <text x="${width / 2}" y="47" text-anchor="middle" class="tag">${escapeXml(tag)}</text>
      </g>`;
    x += width + 20;
    return markup;
  }).join('');
}

function overlaySvg(asset) {
  const titleSize = asset.title.length >= 6 ? 122 : 150;
  return Buffer.from(`
    <svg width="1440" height="1440" viewBox="0 0 1440 1440" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="#060B15" stop-opacity=".92"/>
          <stop offset=".42" stop-color="#070D18" stop-opacity=".72"/>
          <stop offset=".7" stop-color="#070D18" stop-opacity=".12"/>
          <stop offset="1" stop-color="#070D18" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#050A12" stop-opacity=".55"/>
          <stop offset=".38" stop-color="#050A12" stop-opacity="0"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/>
          <feOffset dy="8" result="offset"/>
          <feColorMatrix in="offset" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0" result="shadow"/>
          <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <style>
          .cn { font-family: 'PingFang SC', 'Heiti SC', sans-serif; }
          .brand { font: 600 30px 'PingFang SC', 'Heiti SC', sans-serif; letter-spacing: 5px; fill: #fff; }
          .title { font: 800 ${titleSize}px 'PingFang SC', 'Heiti SC', sans-serif; letter-spacing: -5px; fill: #fff; }
          .subtitle { font: 600 44px 'PingFang SC', 'Heiti SC', sans-serif; letter-spacing: 1px; fill: ${asset.accentSoft}; }
          .tag { font: 600 32px 'PingFang SC', 'Heiti SC', sans-serif; fill: #fff; }
        </style>
      </defs>
      <rect width="1040" height="1440" fill="url(#shade)"/>
      <rect width="1440" height="720" fill="url(#topShade)"/>
      <g transform="translate(108 92)">
        <rect width="12" height="42" rx="6" fill="${asset.accent}"/>
        <text x="32" y="34" class="brand">有范互动</text>
      </g>
      <g filter="url(#shadow)">
        <text x="102" y="310" class="title">${escapeXml(asset.title)}</text>
        <rect x="108" y="346" width="128" height="8" rx="4" fill="${asset.accent}"/>
        <text x="108" y="423" class="subtitle">${escapeXml(asset.subtitle)}</text>
        ${tagMarkup(asset.tags, asset.accent)}
      </g>
    </svg>
  `);
}

await fs.mkdir(finalDir, { recursive: true });
await fs.mkdir(thumbnailDir, { recursive: true });

for (const asset of assets) {
  try {
    await fs.access(asset.source);
  } catch {
    console.warn(`${asset.id}: background not ready, skipped`);
    continue;
  }
  const output = path.join(finalDir, `${asset.id}.png`);
  const thumbnail = path.join(thumbnailDir, `${asset.id}-360.png`);
  const base = sharp(asset.source).resize(1440, 1440, { fit: 'cover', position: 'centre' });
  await base
    .composite([{ input: overlaySvg(asset), top: 0, left: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(output);
  await sharp(output).resize(360, 360, { fit: 'cover' }).png().toFile(thumbnail);
  console.log(`${asset.id}: ${output}`);
}
