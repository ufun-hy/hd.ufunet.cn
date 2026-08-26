import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from '/Users/ufun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js';
import { guides } from './guide-specs.mjs';

const root = path.resolve(import.meta.dirname, '..');
const outDir = path.join(root, 'references');

const avatarGrid = (c, startX, startY, cols, rows, size, gap) => Array.from({ length: cols * rows }, (_, index) => {
  const x = startX + (index % cols) * gap;
  const y = startY + Math.floor(index / cols) * gap;
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="${index % 4 === 0 ? c.hot : c.soft}" opacity="${index % 3 === 0 ? 0.95 : 0.68}"/>`;
}).join('');

const common = (g, body) => `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="48%" r="72%">
      <stop offset="0" stop-color="${g.colors.panel}"/>
      <stop offset="0.56" stop-color="${g.colors.bg}"/>
      <stop offset="1" stop-color="#020711"/>
    </radialGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="12" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <path d="M80 148h864" stroke="${g.colors.accent}" stroke-opacity="0.2" stroke-width="2"/>
  <circle cx="512" cy="520" r="390" fill="none" stroke="${g.colors.accent}" stroke-opacity="0.08" stroke-width="2"/>
  <circle cx="512" cy="520" r="330" fill="none" stroke="${g.colors.soft}" stroke-opacity="0.09" stroke-width="2"/>
  ${body}
</svg>`;

const lottery = g => common(g, `
  ${avatarGrid(g.colors, 92, 256, 5, 8, 16, 54)}
  ${avatarGrid(g.colors, 730, 256, 5, 8, 16, 54)}
  <circle cx="512" cy="500" r="178" fill="#020711" opacity="0.56"/>
  <circle cx="512" cy="500" r="154" fill="none" stroke="${g.colors.accent}" stroke-width="9" opacity="0.76" filter="url(#glow)"/>
  <circle cx="512" cy="500" r="102" fill="${g.colors.soft}" opacity="0.82"/>
  <circle cx="512" cy="469" r="34" fill="#fff" opacity="0.84"/>
  <path d="M444 575c9-62 127-62 136 0" fill="#fff" opacity="0.84"/>
  <rect x="372" y="693" width="280" height="30" rx="15" fill="${g.colors.hot}" opacity="0.88"/>
  <rect x="426" y="748" width="172" height="15" rx="8" fill="#fff" opacity="0.46"/>
  <rect x="327" y="824" width="370" height="74" rx="37" fill="#ffffff" opacity="0.08"/>
  ${avatarGrid(g.colors, 377, 861, 6, 1, 17, 55)}
  <circle cx="852" cy="164" r="58" fill="${g.colors.hot}" opacity="0.15"/>
  <path d="M826 154h52v48h-52zM839 137h26v17h-26z" fill="${g.colors.hot}" opacity="0.88"/>
`);

const names = g => common(g, `
  <path d="M86 248h852M86 792h852" stroke="${g.colors.hot}" stroke-opacity="0.22" stroke-width="2"/>
  <circle cx="512" cy="510" r="282" fill="#120205" opacity="0.45"/>
  <rect x="176" y="312" width="672" height="92" rx="46" fill="#ffffff" opacity="0.08"/>
  <rect x="246" y="346" width="532" height="24" rx="12" fill="#fff" opacity="0.3"/>
  <rect x="128" y="430" width="768" height="176" rx="38" fill="${g.colors.soft}" opacity="0.3" stroke="${g.colors.hot}" stroke-width="8" filter="url(#glow)"/>
  <rect x="216" y="474" width="592" height="52" rx="26" fill="${g.colors.hot}" opacity="0.9"/>
  <rect x="322" y="550" width="380" height="26" rx="13" fill="#fff" opacity="0.68"/>
  <rect x="176" y="636" width="672" height="78" rx="39" fill="#ffffff" opacity="0.07"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${208+i*126}" y="662" width="98" height="26" rx="13" fill="${i===2?g.colors.hot:'#fff'}" opacity="${i===2?0.88:0.28}"/>`).join('')}
  <rect x="264" y="826" width="496" height="70" rx="35" fill="#ffffff" opacity="0.07"/>
  ${[0,1,2,3,4].map(i=>`<rect x="${296+i*92}" y="847" width="70" height="30" rx="15" fill="${g.colors.accent}" opacity="${0.35+i*0.1}"/>`).join('')}
  <circle cx="146" cy="170" r="56" fill="${g.colors.hot}" opacity="0.15"/>
  <path d="M122 160h48v44h-48zM134 144h24v16h-24z" fill="${g.colors.hot}" opacity="0.88"/>
`);

const race = g => common(g, `
  <rect x="70" y="196" width="714" height="694" rx="34" fill="#020711" opacity="0.28"/>
  <rect x="804" y="224" width="154" height="628" rx="28" fill="#020711" opacity="0.34"/>
  <path d="M160 790L690 276" stroke="#fff" stroke-opacity="0.2" stroke-width="2"/>
  <path d="M245 790L706 276M330 790L722 276M415 790L738 276M500 790L754 276M585 790L770 276" stroke="#fff" stroke-opacity="0.16" stroke-width="2"/>
  ${['#42d7ff','#ffbd3f','#d45cff','#80ef6e','#ff6262','#7c8cff'].map((color,i)=>`<circle cx="${210+i*82}" cy="${710-i*61}" r="25" fill="${color}" filter="url(#glow)"/><path d="M${210+i*82} ${680-i*61}v-40" stroke="${color}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>`).join('')}
  <path d="M695 252v565" stroke="#fff" stroke-opacity="0.55" stroke-width="5" stroke-dasharray="16 16"/>
  <rect x="112" y="814" width="620" height="26" rx="13" fill="#fff" opacity="0.09"/>
  <rect x="112" y="814" width="426" height="26" rx="13" fill="${g.colors.accent}" opacity="0.7"/>
  ${[0,1,2,3,4,5].map((i)=>`<rect x="814" y="${270+i*78}" width="110" height="54" rx="16" fill="${i<3?g.colors.hot:g.colors.soft}" opacity="${0.82-i*0.07}"/><circle cx="838" cy="${297+i*78}" r="12" fill="#fff" opacity="0.72"/><rect x="860" y="${289+i*78}" width="44" height="16" rx="8" fill="#fff" opacity="0.4"/>`).join('')}
`);

await fs.mkdir(outDir, { recursive: true });
for (const guide of guides) {
  const svg = guide.type === 'lottery' ? lottery(guide) : guide.type === 'names' ? names(guide) : race(guide);
  await sharp(Buffer.from(svg)).png().toFile(path.join(outDir, `${guide.id}.png`));
}
