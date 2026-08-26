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

const s = (size, n) => Math.round((size / 2048) * n)

function overlaySvg(item, size) {
  const titleSize = s(size, 132)
  const subtitleSize = s(size, 44)
  const tagSize = s(size, 35)
  const badgeSize = s(size, 30)
  const tagY = s(size, 350)
  const tagWidths = [220, 220, 220]
  const tags = item.tags
    .map((tag, index) => {
      const x = s(size, 96 + index * 252)
      const w = s(size, tagWidths[index])
      return `
        <rect x="${x}" y="${tagY}" width="${w}" height="${s(size, 62)}" rx="${s(size, 31)}"
          fill="${item.palette.chipFill}" stroke="${item.palette.chipStroke}" stroke-width="${s(size, 2)}"/>
        <text x="${x + w / 2}" y="${tagY + s(size, 42)}" text-anchor="middle"
          font-size="${tagSize}" font-weight="700" fill="#FFFFFF">${xml(tag)}</text>`
    })
    .join('')

  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="topScrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${item.palette.scrim}"/>
      <stop offset="0.68" stop-color="rgba(0,0,0,0.18)"/>
      <stop offset="1" stop-color="rgba(0,0,0,0)"/>
    </linearGradient>
    <linearGradient id="titleGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#FFFFFF"/>
      <stop offset="1" stop-color="${item.palette.accent}"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="${s(size, 8)}" stdDeviation="${s(size, 9)}" flood-color="#000000" flood-opacity="0.52"/>
    </filter>
  </defs>
  <rect width="${size}" height="${s(size, 620)}" fill="url(#topScrim)"/>
  <rect x="${s(size, 96)}" y="${s(size, 76)}" width="${s(size, 286)}" height="${s(size, 48)}" rx="${s(size, 24)}"
    fill="rgba(0,0,0,0.34)" stroke="${item.palette.accent}" stroke-width="${s(size, 2)}"/>
  <circle cx="${s(size, 124)}" cy="${s(size, 100)}" r="${s(size, 8)}" fill="${item.palette.accent}"/>
  <text x="${s(size, 146)}" y="${s(size, 111)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${badgeSize}" font-weight="700" fill="#FFFFFF">${xml(item.badge)}</text>
  <text x="${s(size, 96)}" y="${s(size, 240)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${titleSize}" font-weight="900" letter-spacing="0" fill="url(#titleGrad)" filter="url(#shadow)">${xml(item.title)}</text>
  <text x="${s(size, 104)}" y="${s(size, 310)}" font-family="PingFang SC, Heiti SC, Microsoft YaHei, Arial, sans-serif"
    font-size="${subtitleSize}" font-weight="700" letter-spacing="0" fill="${item.palette.subtitle}" filter="url(#shadow)">${xml(item.subtitle)}</text>
  ${tags}
</svg>`)
}

async function baseCanvas(item, size) {
  const source = path.join(root, item.source)
  const sourceMeta = await sharp(source).metadata()
  const crop = item.sourceCrop
    ? {
        left: 0,
        top: item.sourceCrop.top ?? 0,
        width: sourceMeta.width,
        height: sourceMeta.height - (item.sourceCrop.top ?? 0) - (item.sourceCrop.bottom ?? 0),
      }
    : null
  const focusedSource = crop ? await sharp(source).extract(crop).png().toBuffer() : source

  const background = await sharp(focusedSource)
    .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .blur(22)
    .modulate({ brightness: 0.62, saturation: 1.12 })
    .composite([
      {
        input: {
          create: {
            width: size,
            height: size,
            channels: 4,
            background: 'rgba(0, 8, 28, 0.36)',
          },
        },
        blend: 'over',
      },
    ])
    .png()
    .toBuffer()

  if (item.layout === 'square-cover') {
    return sharp(focusedSource)
      .resize(size, size, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
      .modulate({ saturation: 1.03, brightness: 1.02 })
      .sharpen({ sigma: 0.55, m1: 0.85, m2: 1.45 })
      .png()
      .toBuffer()
  }

  const screenWidth = s(size, 1900)
  const screen = await sharp(focusedSource)
    .resize({ width: screenWidth, fit: 'inside', kernel: sharp.kernel.lanczos3 })
    .modulate({ saturation: 1.04, brightness: 1.04 })
    .sharpen({ sigma: 0.6, m1: 0.9, m2: 1.55 })
    .png()
    .toBuffer()
  const screenMeta = await sharp(screen).metadata()
  const left = Math.round((size - screenMeta.width) / 2)
  const top = Math.round(size * 0.39)

  return sharp(background)
    .composite([
      {
        input: screen,
        left,
        top,
      },
      {
        input: {
          create: {
            width: size,
            height: size,
            channels: 4,
            background: 'rgba(0, 0, 0, 0)',
          },
        },
        blend: 'over',
      },
    ])
    .png()
    .toBuffer()
}

async function renderItem(item, size) {
  const canvas = await baseCanvas(item, size)
  const buffer = await sharp(canvas)
    .composite([{ input: overlaySvg(item, size), left: 0, top: 0 }])
    .png({ compressionLevel: 9 })
    .toBuffer()

  const png = path.join(outDir, `${item.id}-${size}.png`)
  const jpg = path.join(outDir, `${item.id}-${size}.jpg`)
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

console.log(`Generated ${items.length} product-shape main-image directions in ${root}`)
