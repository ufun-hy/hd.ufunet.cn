let idCounter = 0;

export const palette = {
  dark: '#160304',
  red: '#5e0609',
  red2: '#9f1114',
  gold: '#f6bd59',
  goldLight: '#ffe7ae',
  cream: '#fff2d6',
  white: '#fffaf0',
  muted: '#dfbba7',
};

export function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function unique(prefix = 'id') {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function defs() {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#140203"/>
        <stop offset="0.48" stop-color="#680609"/>
        <stop offset="1" stop-color="#250203"/>
      </linearGradient>
      <radialGradient id="halo" cx="50%" cy="42%" r="64%">
        <stop offset="0" stop-color="#d34724" stop-opacity=".42"/>
        <stop offset=".56" stop-color="#75070a" stop-opacity=".12"/>
        <stop offset="1" stop-color="#130203" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#521014" stop-opacity=".95"/>
        <stop offset="1" stop-color="#250608" stop-opacity=".98"/>
      </linearGradient>
      <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#a85f24"/>
        <stop offset=".5" stop-color="#ffe0a0"/>
        <stop offset="1" stop-color="#9b4b1e"/>
      </linearGradient>
      <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="4" r="1.1" fill="#ffd27a" opacity=".18"/>
        <circle cx="26" cy="20" r=".8" fill="#ffd27a" opacity=".12"/>
      </pattern>
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000" flood-opacity=".62"/>
      </filter>
      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>`;
}

export function background(width, height) {
  return `
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#halo)"/>
    <rect width="${width}" height="${height}" fill="url(#dots)"/>
    <circle cx="${width * 0.12}" cy="${height * 0.15}" r="${width * 0.24}" fill="#c61718" opacity=".08"/>
    <circle cx="${width * 0.9}" cy="${height * 0.78}" r="${width * 0.3}" fill="#e95228" opacity=".05"/>
    <path d="M0 ${height * 0.93} C ${width * 0.25} ${height * 0.86}, ${width * 0.65} ${height}, ${width} ${height * 0.9}" fill="none" stroke="#f7b955" stroke-opacity=".11" stroke-width="2"/>
  `;
}

export function frameImage(href, x, y, width, height, radius = 22, opacity = 1, align = 'xMidYMid slice') {
  const clip = unique('clip');
  return `
    <clipPath id="${clip}"><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}"/></clipPath>
    <g filter="url(#shadow)">
      <rect x="${x - 2}" y="${y - 2}" width="${width + 4}" height="${height + 4}" rx="${radius + 2}" fill="#2a0506" stroke="url(#goldStroke)" stroke-width="3"/>
      <image href="${esc(href)}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="${align}" clip-path="url(#${clip})" opacity="${opacity}"/>
    </g>`;
}

export function eyebrow(text, x, y, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${palette.gold}" font-size="18" font-weight="700" letter-spacing="3">${esc(text)}</text>`;
}

export function headline(text, x, y, size = 54, anchor = 'middle') {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${palette.white}" font-size="${size}" font-weight="800" letter-spacing="1">${esc(text)}</text>`;
}

export function subline(text, x, y, size = 24, anchor = 'middle', color = palette.cream) {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-size="${size}" font-weight="500">${esc(text)}</text>`;
}

export function tag(text, x, y, width = 154, height = 48) {
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="#2a0809" stroke="#d99648" stroke-opacity=".65"/><text x="${x + width / 2}" y="${y + height / 2 + 8}" text-anchor="middle" fill="${palette.goldLight}" font-size="19" font-weight="700">${esc(text)}</text></g>`;
}

export function smallCard(title, subtitle, x, y, width, height) {
  return `<g><rect x="${x}" y="${y}" width="${width}" height="${height}" rx="18" fill="#401013" stroke="#c77b3f" stroke-opacity=".5"/><text x="${x + width / 2}" y="${y + 42}" text-anchor="middle" fill="${palette.gold}" font-size="22" font-weight="800">${esc(title)}</text><text x="${x + width / 2}" y="${y + 75}" text-anchor="middle" fill="${palette.cream}" font-size="16">${esc(subtitle)}</text></g>`;
}

export function svgDocument(width, height, body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <style>text{font-family:'Hiragino Sans GB','Heiti SC','PingFang SC',sans-serif}</style>
    ${defs()}
    ${background(width, height)}
    ${body}
  </svg>`;
}

