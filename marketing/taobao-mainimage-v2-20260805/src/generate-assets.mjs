import fs from 'node:fs/promises'
import path from 'node:path'
import { createRequire } from 'node:module'
import { items } from './content.mjs'

const require = createRequire(import.meta.url)
const sharp = require('/Users/ufun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp')
const root = path.resolve(new URL('..', import.meta.url).pathname)
const outDir = path.join(root, 'deliverables')
const thumbDir = path.join(root, 'thumbnails')

const xml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

function overlaySvg(item, size) {
  const scale = size / 2048
  const s = (n) => Math.round(n * scale)
  const titleSize = s(126)
  const subtitleSize = s(42)
  const tagSize = s(36)
  const badgeSize = s(30)
  const tagY = s(332)
  const tags = item.tags
    .map((tag, index) => {
      const x = s(96 + index * 250)
      const w = s(210)
      return `
        <rect x="${x}" y="${tagY}" width="${w}" height="${s(62)}" rx="${s(31)}"
          fill="${item.palette.chipFill}" stroke="${item.palette.chipStroke}" stroke-width="${s(2)}"/>
        <text x="${x + w / 2}" y="${tagY + s(42)}" text-anchor="middle"
          font-size="${tagSize}" font-weight="700" fill="#fff">${xml(tag)}</text>`
    })
    .join('')

  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${item.palette.scrim}"/>
      <stop offset="0.72" stop-color="rgba(0,0,0,0.16)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${s(8)}" stdDeviation="${s(8)}" flood-color="#000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="${size}" height="${s(520)}" fill="url(#topScrim)"/>
  <rect x="${s(96)}" y="${s(76)}" width="${s(300)}" height="${s(48)}" rx="${s(24)}"
    fill="rgba(0,0,0,0.35)" stroke="${item.palette.accent}" stroke-width="${s(2)}"/>
  <circle cx="${s(124)}" cy="${s(100)}" r="${s(8)}" fill="${item.palette.accent}"/>
  <text x="${s(146)}" y="${s(111)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${badgeSize}" font-weight="700" fill="#FFFFFF">${xml(item.badge)}</text>
  <text x="${s(96)}" y="${s(236)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${titleSize}" font-weight="900" letter-spacing="0" fill="${item.palette.title}" filter="url(#shadow)">${xml(item.title)}</text>
  <text x="${s(104)}" y="${s(302)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${subtitleSize}" font-weight="700" letter-spacing="0" fill="${item.palette.subtitle}" filter="url(#shadow)">${xml(item.subtitle)}</text>
  ${tags}
</svg>`)
}

async function renderItem(item, size) {
  const source = path.join(root, item.source)
  const base = sharp(source)
    .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.04, brightness: 1.02 })
    .sharpen({ sigma: 0.6, m1: 0.9, m2: 1.6 })

  const png = path.join(outDir, `${item.id}-${size}.png`)
  const jpg = path.join(outDir, `${item.id}-${size}.jpg`)
  const buffer = await base
    .composite([{ input: overlaySvg(item, size), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  await fs.writeFile(png, buffer)
  await sharp(buffer).jpeg({ quality: 94, mozjpeg: true }).toFile(jpg)
  return { png, jpg }
}

async function makeThumb(item) {
  const input = path.join(outDir, `${item.id}-1440.jpg`)
  const out = path.join(thumbDir, `${item.id}-360.jpg`)
  await sharp(input).resize(360, 360, { fit: 'cover' }).jpeg({ quality: 88 }).toFile(out)
  return out
}

async function contactSheet() {
  const cell = 680
  const gap = 24
  const width = cell * 3 + gap * 4
  const height = cell + gap * 2
  const composites = []
  for (let i = 0; i < items.length; i += 1) {
    const file = path.join(outDir, `${items[i].id}-2048.jpg`)
    const input = await sharp(file).resize(cell, cell).jpeg({ quality: 92 }).toBuffer()
    composites.push({ input, left: gap + i * (cell + gap), top: gap })
  }
  await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: '#07101f',
    },
  })
    .composite(composites)
    .jpeg({ quality: 92 })
    .toFile(path.join(root, 'contact-sheet-2048.jpg'))
}

await fs.mkdir(outDir, { recursive: true })
await fs.mkdir(thumbDir, { recursive: true })

const manifest = []
for (const item of items) {
  const large = await renderItem(item, 2048)
  const upload = await renderItem(item, 1440)
  const thumb = await makeThumb(item)
  manifest.push({ ...item, outputs: { large, upload, thumb } })
}
await contactSheet()
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({ generated_at: new Date().toISOString(), items: manifest }, null, 2))

console.log(`Generated ${items.length} main-image directions in ${root}`)
