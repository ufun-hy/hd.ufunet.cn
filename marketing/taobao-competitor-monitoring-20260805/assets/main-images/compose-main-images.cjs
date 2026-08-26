const path = require('path');
const sharp = require('sharp');

const assetDir = __dirname;
const font = 'PingFang SC, Noto Sans CJK SC, Arial, sans-serif';

function escapeXml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character]);
}

function chip(text, x, width) {
  return `
    <rect x="${x}" y="408" width="${width}" height="54" rx="27" fill="#FFFFFF" fill-opacity="0.16"/>
    <text x="${x + width / 2}" y="444" text-anchor="middle" font-family="${font}" font-size="28" font-weight="600" fill="#F8FAFC">${escapeXml(text)}</text>`;
}

function overlay({ badge, title, subtitle, chips }) {
  const chipMarkup = chips.map((item) => chip(item.text, item.x, item.width)).join('');
  return Buffer.from(`
  <svg width="1440" height="1440" viewBox="0 0 1440 1440" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#071124" stop-opacity="0.92"/>
        <stop offset="1" stop-color="#0A1730" stop-opacity="0.58"/>
      </linearGradient>
    </defs>
    <rect x="58" y="64" width="720" height="450" rx="44" fill="url(#panel)"/>
    <rect x="94" y="104" width="178" height="52" rx="26" fill="#37D5FF" fill-opacity="0.22" stroke="#70E6FF" stroke-opacity="0.70"/>
    <text x="183" y="139" text-anchor="middle" font-family="${font}" font-size="28" font-weight="700" fill="#C8F6FF">${escapeXml(badge)}</text>
    <text x="92" y="257" font-family="${font}" font-size="82" font-weight="800" fill="#FFFFFF" letter-spacing="1">${escapeXml(title)}</text>
    <text x="94" y="337" font-family="${font}" font-size="38" font-weight="500" fill="#D9E8FF">${escapeXml(subtitle)}</text>
    ${chipMarkup}
  </svg>`);
}

const jobs = [
  {
    input: '724-shake-main-v1-base.png',
    output: '724-shake-main-v1.png',
    badge: '现场互动',
    title: '摇一摇互动游戏',
    subtitle: '手机参与 · 大屏实时互动',
    chips: [
      { text: '年会', x: 92, width: 124 },
      { text: '婚礼', x: 230, width: 124 },
      { text: '现场活动', x: 368, width: 170 },
    ],
  },
  {
    input: '726-race-main-v1-base.png',
    output: '726-race-main-v1.png',
    badge: '大屏赛马',
    title: '摇一摇赛马游戏',
    subtitle: '手机竞速 · 大屏实时排名',
    chips: [
      { text: '扫码参与', x: 92, width: 170 },
      { text: '多人竞速', x: 276, width: 170 },
      { text: '年会婚礼', x: 460, width: 170 },
    ],
  },
];

Promise.all(jobs.map((job) => sharp(path.join(assetDir, job.input))
  .resize(1440, 1440, { fit: 'cover' })
  .composite([{ input: overlay(job), top: 0, left: 0 }])
  .png()
  .toFile(path.join(assetDir, job.output))))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
