let idCounter = 0;

export const palette = {
  ink: '#071326',
  navy: '#0a1e3e',
  blue: '#184e9e',
  cyan: '#4dd7ff',
  violet: '#8b5cf6',
  gold: '#ffd166',
  white: '#f8fbff',
  muted: '#b7c9e8',
  panel: '#0f284f',
  green: '#3fe0a0',
};

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function unique(prefix) {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function svgDocument(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1440" height="1440" viewBox="0 0 1440 1440">
    <style>
      text{font-family:'PingFang SC','Hiragino Sans GB','Heiti SC',sans-serif}
      .heavy{font-weight:900}.bold{font-weight:750}.medium{font-weight:600}
    </style>
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#050d1e"/><stop offset=".48" stop-color="#102c62"/><stop offset="1" stop-color="#180d3c"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="35%" r="70%">
        <stop offset="0" stop-color="#2e7dff" stop-opacity=".34"/><stop offset=".58" stop-color="#8b5cf6" stop-opacity=".1"/><stop offset="1" stop-color="#060e20" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="line" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#4dd7ff"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="22" stdDeviation="24" flood-color="#000" flood-opacity=".48"/></filter>
      <filter id="softGlow" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="1440" height="1440" fill="url(#bg)"/>
    <rect width="1440" height="1440" fill="url(#halo)"/>
    <g opacity=".14">${Array.from({length: 19}, (_, i) => `<path d="M0 ${90 + i * 74} H1440" stroke="#8db7ff" stroke-width="1"/>`).join('')}${Array.from({length: 19}, (_, i) => `<path d="M${50 + i * 78} 0 V1440" stroke="#8db7ff" stroke-width="1"/>`).join('')}</g>
    ${body}
  </svg>`;
}

export function header(kicker, title, subtitle) {
  return `<g>
    <rect x="74" y="62" width="280" height="52" rx="26" fill="#102d57" stroke="#4dd7ff" stroke-opacity=".7"/>
    <circle cx="108" cy="88" r="8" fill="#4dd7ff" filter="url(#softGlow)"/>
    <text x="132" y="98" fill="#9fe9ff" font-size="25" class="bold">${esc(kicker)}</text>
    <text x="72" y="224" fill="${palette.white}" font-size="112" class="heavy" letter-spacing="2">${esc(title)}</text>
    <text x="76" y="282" fill="${palette.muted}" font-size="34" class="medium">${esc(subtitle)}</text>
    <rect x="74" y="316" width="1292" height="4" rx="2" fill="url(#line)" opacity=".8"/>
  </g>`;
}

export function imageFrame(href, x, y, width, height, radius = 28, align = 'xMidYMid slice') {
  const clip = unique('clip');
  return `<g filter="url(#shadow)">
    <clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/></clipPath>
    <rect x="${x - 3}" y="${y - 3}" width="${width + 6}" height="${height + 6}" rx="${radius + 3}" fill="#06142a" stroke="url(#line)" stroke-width="3"/>
    <image href="${esc(href)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${align}" clip-path="url(#${clip})"/>
  </g>`;
}

export function glassPanel(x, y, width, height, radius = 30) {
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="#0a2247" fill-opacity=".92" stroke="#77b9ff" stroke-opacity=".35" stroke-width="2" filter="url(#shadow)"/>`;
}

export function chip(text, x, y, width, color = palette.cyan) {
  return `<g><rect x="${x}" y="${y}" width="${width}" height="58" rx="29" fill="#0d2a52" stroke="${color}" stroke-opacity=".7"/><text x="${x + width / 2}" y="${y + 39}" text-anchor="middle" fill="${palette.white}" font-size="26" class="bold">${esc(text)}</text></g>`;
}

export function flowStep(n, title, subtitle, x, y, width = 292) {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="154" rx="28" fill="#0d2852" stroke="#639fff" stroke-opacity=".42"/>
    <circle cx="${x + 48}" cy="${y + 46}" r="28" fill="url(#line)"/><text x="${x + 48}" y="${y + 57}" text-anchor="middle" fill="#071326" font-size="30" class="heavy">${n}</text>
    <text x="${x + 90}" y="${y + 55}" fill="${palette.white}" font-size="30" class="heavy">${esc(title)}</text>
    <text x="${x + 28}" y="${y + 112}" fill="${palette.muted}" font-size="23" class="medium">${esc(subtitle)}</text>
  </g>`;
}

export function browserChrome(x, y, width, height, title = '活动大屏') {
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="26" fill="#06152d" stroke="#6fb9ff" stroke-opacity=".45" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="${width}" height="58" rx="26" fill="#102b56"/>
    <rect x="${x}" y="${y + 32}" width="${width}" height="26" fill="#102b56"/>
    <circle cx="${x + 32}" cy="${y + 29}" r="7" fill="#ff6b81"/><circle cx="${x + 56}" cy="${y + 29}" r="7" fill="#ffd166"/><circle cx="${x + 80}" cy="${y + 29}" r="7" fill="#42e2a6"/>
    <text x="${x + 112}" y="${y + 38}" fill="#b9cef0" font-size="21" class="medium">${esc(title)}</text>
  </g>`;
}

export function phoneFrame(x, y, width, height, body) {
  return `<g filter="url(#shadow)">
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="48" fill="#050b17" stroke="#8cc7ff" stroke-width="3"/>
    <rect x="${x + 15}" y="${y + 18}" width="${width - 30}" height="${height - 36}" rx="36" fill="#f4f8ff"/>
    <rect x="${x + width / 2 - 42}" y="${y + 12}" width="84" height="10" rx="5" fill="#202b3f"/>
    ${body}
  </g>`;
}

export function scanIcon(x, y, size) {
  const s = size;
  const q = s * .28;
  return `<g stroke="#2d79ff" stroke-width="12" fill="none" stroke-linecap="round">
    <path d="M${x + q} ${y}H${x}V${y + q} M${x + s - q} ${y}H${x + s}V${y + q} M${x} ${y + s - q}V${y + s}H${x + q} M${x + s} ${y + s - q}V${y + s}H${x + s - q}"/>
    <circle cx="${x + s / 2}" cy="${y + s / 2}" r="${s * .18}" stroke="#7b5cff"/>
  </g>`;
}

export function spreadsheet(x, y, width, height) {
  const cols = [0, .23, .5, .76, 1];
  const rows = [0, .18, .38, .58, .78, 1];
  return `<g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#f8fbff"/>
    <rect x="${x}" y="${y}" width="${width}" height="${height * .18}" rx="18" fill="#2f7be7"/>
    <rect x="${x}" y="${y + height * .12}" width="${width}" height="${height * .06}" fill="#2f7be7"/>
    ${cols.slice(1, -1).map(v => `<path d="M${x + width * v} ${y}V${y + height}" stroke="#cbd7e8" stroke-width="2"/>`).join('')}
    ${rows.slice(1, -1).map(v => `<path d="M${x} ${y + height * v}H${x + width}" stroke="#cbd7e8" stroke-width="2"/>`).join('')}
    <text x="${x + 24}" y="${y + height * .12}" fill="#fff" font-size="24" class="bold">姓名</text><text x="${x + width * .27}" y="${y + height * .12}" fill="#fff" font-size="24" class="bold">部门</text><text x="${x + width * .55}" y="${y + height * .12}" fill="#fff" font-size="24" class="bold">号码</text><text x="${x + width * .81}" y="${y + height * .12}" fill="#fff" font-size="24" class="bold">分组</text>
    ${['张*','李*','王*','赵*'].map((v,i)=>`<text x="${x + 24}" y="${y + height * (.31 + i*.2)}" fill="#27364e" font-size="23" class="medium">${v}</text><text x="${x + width*.27}" y="${y + height * (.31 + i*.2)}" fill="#52627a" font-size="21">${['市场部','产品部','行政部','嘉宾组'][i]}</text><text x="${x + width*.55}" y="${y + height * (.31 + i*.2)}" fill="#52627a" font-size="21">${1001+i}</text><text x="${x + width*.81}" y="${y + height * (.31 + i*.2)}" fill="#52627a" font-size="21">${['A组','A组','B组','VIP'][i]}</text>`).join('')}
  </g>`;
}
