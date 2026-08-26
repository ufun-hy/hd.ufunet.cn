import fs from 'node:fs';
import path from 'node:path';
import { squareCards, detailPanels, videoCopy } from './content.mjs';
import { svgDocument, frameImage, eyebrow, headline, subline, tag, smallCard, palette, esc } from './design-system.mjs';

const root = path.resolve(import.meta.dirname, '..');
const svgDir = path.join(root, 'exports', 'svg');
fs.mkdirSync(svgDir, { recursive: true });

function pngData(relativePath) {
  return `data:image/png;base64,${fs.readFileSync(path.join(root, relativePath)).toString('base64')}`;
}

// Embed sources so CoreSVG can render deterministic exports without external-file placeholders.
const sources = {
  'packet-wall': pngData('source/packet-wall.png'),
  'winner-modal': pngData('source/winner-modal.png'),
  'frame-03s': pngData('source-frames/frame-03s.png'),
  'frame-11s': pngData('source-frames/frame-11s.png'),
  'frame-20s': pngData('source-frames/frame-20s.png'),
  'frame-30s': pngData('source-frames/frame-30s.png'),
};

function save(file, content) {
  fs.writeFileSync(path.join(svgDir, file), content, 'utf8');
}

function squareBase(item, sourceY = 232, sourceH = 390) {
  const tagWidth = 170;
  const gap = 18;
  const start = (800 - (tagWidth * 3 + gap * 2)) / 2;
  return `
    ${eyebrow('HBWALL · 活动互动大屏', 400, 58)}
    ${headline(item.title, 400, 126, 52)}
    ${subline(item.subtitle, 400, 176, 23)}
    ${frameImage(sources[item.source], 54, sourceY, 692, sourceH, 24)}
    ${item.tags.map((value, index) => tag(value, start + index * (tagWidth + gap), 682, tagWidth, 50)).join('')}
    <text x="400" y="774" text-anchor="middle" fill="#d9aa86" font-size="14" letter-spacing="2">REAL INTERFACE · DETERMINISTIC COPY</text>`;
}

for (const item of squareCards) {
  let body = squareBase(item);

  if (item.file === '03-configurable-800.svg') {
    body = `
      ${eyebrow('CONFIGURABLE', 400, 58)}
      ${headline(item.title, 400, 126, 52)}
      ${subline(item.subtitle, 400, 176, 23)}
      ${frameImage(sources[item.source], 54, 214, 692, 330, 24)}
      ${smallCard('红包数量', '按轮次配置', 54, 580, 160, 94)}
      ${smallCard('每行列数', '控制展示密度', 231, 580, 160, 94)}
      ${smallCard('红包尺寸', '配合大屏比例', 408, 580, 160, 94)}
      ${smallCard('奖品信息', '图片与名称', 585, 580, 160, 94)}
      ${item.tags.map((value, index) => tag(value, 105 + index * 202, 708, 186, 48)).join('')}`;
  }

  if (item.file === '04-state-feedback-800.svg') {
    body = `
      ${eyebrow('STATE FEEDBACK', 400, 58)}
      ${headline(item.title, 400, 126, 52)}
      ${subline(item.subtitle, 400, 176, 23)}
      ${frameImage(sources[item.source], 54, 214, 692, 400, 24)}
      <g><rect x="78" y="638" width="644" height="72" rx="18" fill="#2d090b" stroke="#d99345" stroke-opacity=".55"/><circle cx="120" cy="674" r="18" fill="#f5bd59"/><path d="M112 674l6 6 12-14" fill="none" stroke="#541012" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><text x="154" y="682" fill="${palette.cream}" font-size="21" font-weight="700">奖品图片 · 奖品名称 · 中奖状态</text></g>
      ${item.tags.map((value, index) => tag(value, 105 + index * 202, 730, 186, 48)).join('')}`;
  }

  if (item.file === '05-scenes-notice-800.svg') {
    body = `
      <image href="${sources[item.source]}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" opacity=".16"/>
      <rect width="800" height="800" fill="#2a0305" opacity=".78"/>
      ${eyebrow('EVENT SCENARIOS', 400, 62)}
      ${headline(item.title, 400, 132, 52)}
      ${subline(item.subtitle, 400, 182, 23)}
      ${smallCard('企业年会', '礼品抽奖互动', 72, 254, 310, 120)}
      ${smallCard('答谢庆典', '现场结果展示', 418, 254, 310, 120)}
      ${smallCard('商场活动', '大屏互动抽奖', 72, 398, 310, 120)}
      ${smallCard('婚庆会务', '喜庆主题界面', 418, 398, 310, 120)}
      <g filter="url(#shadow)"><rect x="72" y="566" width="656" height="142" rx="24" fill="#fff0cf"/><text x="110" y="616" fill="#8c1b13" font-size="28" font-weight="800">下单前确认</text><text x="110" y="654" fill="#51231c" font-size="20">交付方式 · 部署环境 · 屏幕分辨率</text><text x="110" y="686" fill="#51231c" font-size="20">活动模式 · 奖品与背景素材</text></g>
      ${item.tags.map((value, index) => tag(value, 105 + index * 202, 730, 186, 48)).join('')}`;
  }

  save(item.file, svgDocument(800, 800, body));
}

save(videoCopy.file, svgDocument(800, 800, `
  <image href="${sources['frame-03s']}" x="0" y="0" width="800" height="800" preserveAspectRatio="xMidYMid slice" opacity=".72"/>
  <rect width="800" height="800" fill="url(#bg)" opacity=".52"/>
  <rect x="42" y="42" width="716" height="716" rx="36" fill="none" stroke="url(#goldStroke)" stroke-width="2"/>
  ${eyebrow('PRODUCT VIDEO · 真实操作录屏', 400, 92)}
  ${headline(videoCopy.title, 400, 174, 54)}
  ${subline(videoCopy.subtitle, 400, 222, 22)}
  <g filter="url(#shadow)"><circle cx="400" cy="430" r="76" fill="#fbda92" opacity=".96"/><path d="M383 391 L383 469 L449 430 Z" fill="#8f1212"/></g>
  ${videoCopy.tags.map((value, index) => tag(value, 105 + index * 202, 690, 186, 50)).join('')}
`));

function detailCommon(panel, index) {
  return `
    ${eyebrow(`${String(index + 1).padStart(2, '0')} · ${panel.eyebrow}`, 375, 66)}
    ${headline(panel.title, 375, 130, 43)}
    ${panel.lines.map((line, i) => subline(line, 375, 181 + i * 36, 20, 'middle', i === 0 ? palette.cream : palette.muted)).join('')}`;
}

detailPanels.forEach((panel, index) => {
  let body = detailCommon(panel, index);

  if (index === 0) {
    body = `
      <image href="${sources[panel.source]}" x="0" y="0" width="750" height="900" preserveAspectRatio="xMidYMid slice" opacity=".54"/>
      <rect width="750" height="900" fill="url(#bg)" opacity=".58"/>
      <rect x="32" y="32" width="686" height="836" rx="30" fill="none" stroke="url(#goldStroke)" stroke-width="2"/>
      ${eyebrow(panel.eyebrow, 375, 106)}
      ${headline(panel.title, 375, 196, 56)}
      ${subline(panel.lines[0], 375, 248, 22)}
      ${subline(panel.lines[1], 375, 284, 19, 'middle', palette.muted)}
      ${frameImage(sources[panel.source], 58, 352, 634, 326, 24)}
      ${tag('真实界面', 112, 736, 154, 50)}${tag('自由开奖', 298, 736, 154, 50)}${tag('奖品同屏', 484, 736, 154, 50)}
      <text x="375" y="844" text-anchor="middle" fill="#d3a47e" font-size="15" letter-spacing="2">INTERACTIVE PACKET WALL</text>`;
  } else if (index === 1) {
    body += `${frameImage(sources[panel.source], 52, 266, 646, 350, 22)}
      <g><rect x="52" y="654" width="646" height="130" rx="22" fill="#3c0c0f" stroke="#c77b3f" stroke-opacity=".5"/><text x="88" y="700" fill="${palette.gold}" font-size="22" font-weight="800">同屏信息</text><text x="88" y="739" fill="${palette.cream}" font-size="20">本轮礼品 · 红包编号 · 已中奖内容 · 中奖记录</text></g>`;
  } else if (index === 2) {
    body += `${frameImage(sources[panel.source], 52, 254, 646, 296, 22)}
      ${smallCard('红包数量', '按轮次配置', 52, 590, 150, 110)}
      ${smallCard('每行列数', '调整密度', 217, 590, 150, 110)}
      ${smallCard('红包尺寸', '配合屏幕', 382, 590, 150, 110)}
      ${smallCard('奖品信息', '图片与名称', 547, 590, 150, 110)}
      <text x="375" y="782" text-anchor="middle" fill="${palette.muted}" font-size="18">实际可用配置以活动后台与当前版本为准</text>`;
  } else if (index === 3) {
    body += `${frameImage(sources[panel.source], 52, 254, 646, 288, 22)}
      <g>
        <circle cx="142" cy="666" r="42" fill="#f1b44f"/><text x="142" y="678" text-anchor="middle" fill="#501011" font-size="32" font-weight="800">1</text><text x="142" y="730" text-anchor="middle" fill="${palette.cream}" font-size="20" font-weight="700">选择红包</text>
        <path d="M198 666 H300" stroke="#e2a050" stroke-width="2" stroke-dasharray="8 8"/>
        <circle cx="375" cy="666" r="42" fill="#f1b44f"/><text x="375" y="678" text-anchor="middle" fill="#501011" font-size="32" font-weight="800">2</text><text x="375" y="730" text-anchor="middle" fill="${palette.cream}" font-size="20" font-weight="700">点击开奖</text>
        <path d="M431 666 H532" stroke="#e2a050" stroke-width="2" stroke-dasharray="8 8"/>
        <circle cx="608" cy="666" r="42" fill="#f1b44f"/><text x="608" y="678" text-anchor="middle" fill="#501011" font-size="32" font-weight="800">3</text><text x="608" y="730" text-anchor="middle" fill="${palette.cream}" font-size="20" font-weight="700">展示结果</text>
      </g>
      <text x="375" y="812" text-anchor="middle" fill="${palette.muted}" font-size="17">自由模式下由现场操作人员点击开启</text>`;
  } else if (index === 4) {
    body += `${frameImage(sources[panel.source], 52, 264, 646, 336, 22)}
      <g><rect x="86" y="642" width="578" height="122" rx="22" fill="#3c0c0f" stroke="#d7964a" stroke-opacity=".55"/><text x="375" y="688" text-anchor="middle" fill="${palette.gold}" font-size="22" font-weight="800">弹窗动态内容</text><text x="375" y="730" text-anchor="middle" fill="${palette.cream}" font-size="20">奖项 · 奖品图片 · 奖品名称 · 红包编号</text></g>`;
  } else if (index === 5) {
    body += `${frameImage(sources[panel.source], 52, 254, 646, 310, 22)}
      ${smallCard('已中奖', '状态标记', 52, 612, 196, 112)}
      ${smallCard('奖品图片', '原位展示', 277, 612, 196, 112)}
      ${smallCard('奖品名称', '同屏回填', 502, 612, 196, 112)}
      <text x="375" y="800" text-anchor="middle" fill="${palette.muted}" font-size="18">红包较多时，页面保留滚动浏览能力</text>`;
  } else if (index === 6) {
    body = `
      <image href="${sources[panel.source]}" x="0" y="0" width="750" height="900" preserveAspectRatio="xMidYMid slice" opacity=".13"/>
      <rect width="750" height="900" fill="#310507" opacity=".88"/>
      ${detailCommon(panel, index)}
      ${smallCard('企业年会', '现场礼品抽奖', 66, 300, 292, 130)}
      ${smallCard('答谢活动', '宾客互动环节', 392, 300, 292, 130)}
      ${smallCard('会务庆典', '大屏结果展示', 66, 464, 292, 130)}
      ${smallCard('商场婚庆', '喜庆主题互动', 392, 464, 292, 130)}
      <g><rect x="66" y="650" width="618" height="110" rx="22" fill="#fff0d3"/><text x="375" y="695" text-anchor="middle" fill="#861a15" font-size="23" font-weight="800">不同现场条件不同，建议先确认再下单</text><text x="375" y="732" text-anchor="middle" fill="#51231c" font-size="18">活动日期 · 屏幕环境 · 奖品数量 · 操作模式</text></g>`;
  } else if (index === 7) {
    body = `
      <image href="${sources[panel.source]}" x="0" y="0" width="750" height="900" preserveAspectRatio="xMidYMid slice" opacity=".1"/>
      <rect width="750" height="900" fill="#250405" opacity=".9"/>
      ${detailCommon(panel, index)}
      <g><rect x="64" y="282" width="622" height="430" rx="26" fill="#fff1d6" filter="url(#shadow)"/>
        <text x="104" y="344" fill="#8b1813" font-size="25" font-weight="800">请确认以下信息</text>
        ${['交付方式与部署环境', '现场电脑与屏幕分辨率', '活动模式与操作流程', '红包、奖品及背景素材', '演示奖品不包含实物'].map((text, i) => `<circle cx="112" cy="${401 + i * 58}" r="11" fill="#d0913e"/><text x="142" y="${409 + i * 58}" fill="#4c241f" font-size="21" font-weight="600">${esc(text)}</text>`).join('')}
      </g>
      <text x="375" y="784" text-anchor="middle" fill="${palette.goldLight}" font-size="19">确认完成后，再按双方约定处理订单</text>`;
  }

  save(panel.file, svgDocument(750, 900, body));
});

console.log(JSON.stringify({svgDir, squares: squareCards.length + 1, detailPanels: detailPanels.length}, null, 2));
