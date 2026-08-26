import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import sharp from '/Users/ufun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js'

const projectRoot = path.resolve(import.meta.dirname, '..')
const workspaceRoot = path.resolve(projectRoot, '..')
const sourceRoot = path.join(workspaceRoot, 'taobao-mainimage-v4-product-screen-20260805')
const outputRoot = path.join(projectRoot, 'deliverables')

await mkdir(outputRoot, { recursive: true })

const font = 'PingFang SC, Hiragino Sans GB, Microsoft YaHei, sans-serif'

const mainOverlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#120205" stop-opacity="0.98"/>
      <stop offset="1" stop-color="#120205" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#120205" stop-opacity="0"/>
      <stop offset="1" stop-color="#120205" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="270" fill="url(#top)"/>
  <rect y="790" width="1024" height="234" fill="url(#bottom)"/>
  <rect x="58" y="54" width="184" height="44" rx="22" fill="#f6ce73" fill-opacity="0.18" stroke="#f6ce73" stroke-opacity="0.68"/>
  <text x="150" y="84" text-anchor="middle" fill="#ffe4a2" font-family="${font}" font-size="23" font-weight="700">名单抽奖系统</text>
  <text x="58" y="175" fill="#ffffff" font-family="${font}" font-size="78" font-weight="800" letter-spacing="2">导入名单抽奖</text>
  <text x="62" y="229" fill="#f2d99f" font-family="${font}" font-size="31" font-weight="600">名单直接导入 · 现场大屏随机抽取</text>
  <g font-family="${font}" font-size="25" font-weight="700" fill="#fff5d4">
    <rect x="58" y="906" width="252" height="62" rx="31" fill="#6e1a20" stroke="#eecb77" stroke-opacity="0.72"/>
    <text x="184" y="946" text-anchor="middle">Excel 名单</text>
    <rect x="332" y="906" width="252" height="62" rx="31" fill="#6e1a20" stroke="#eecb77" stroke-opacity="0.72"/>
    <text x="458" y="946" text-anchor="middle">多人同时抽取</text>
    <rect x="606" y="906" width="360" height="62" rx="31" fill="#f2c762"/>
    <text x="786" y="946" text-anchor="middle" fill="#541116">中奖结果大屏显示</text>
  </g>
</svg>
`)

const screenOverlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#050716" stop-opacity="0.94"/>
      <stop offset="0.34" stop-color="#050716" stop-opacity="0"/>
      <stop offset="0.72" stop-color="#050716" stop-opacity="0"/>
      <stop offset="1" stop-color="#050716" stop-opacity="0.96"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#shade)"/>
  <text x="58" y="112" fill="#ffffff" font-family="${font}" font-size="68" font-weight="800">名单大屏抽奖</text>
  <text x="60" y="164" fill="#b9c8ff" font-family="${font}" font-size="29" font-weight="600">姓名列表滚动 · 停止后锁定中奖结果</text>
  <rect x="58" y="885" width="908" height="82" rx="24" fill="#13172d" fill-opacity="0.9" stroke="#55d9ff" stroke-opacity="0.48"/>
  <text x="512" y="937" text-anchor="middle" fill="#ffffff" font-family="${font}" font-size="31" font-weight="700">员工抽奖 · 嘉宾抽奖 · 客户名单抽奖</text>
</svg>
`)

const geminiSource = path.join(sourceRoot, 'source/gemini/02-imported-list-lottery.png')
const demoSource = path.join(sourceRoot, 'demos/previews/02-list-lottery.png')

async function writePair(input, overlay, basename, options = {}) {
  const image = sharp(input)
    .resize(1024, 1024, { fit: options.fit ?? 'cover', position: options.position ?? 'centre' })
    .composite([{ input: overlay }])

  await image.clone().png({ compressionLevel: 9 }).toFile(path.join(outputRoot, `${basename}.png`))
  await image.clone().jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(path.join(outputRoot, `${basename}.jpg`))
}

await writePair(geminiSource, mainOverlay, '07-list-screen-main-v2-1024')
await writePair(demoSource, screenOverlay, '08-list-screen-live-v2-1024', { fit: 'cover', position: 'centre' })

console.log('Generated two 1024×1024 list-lottery product-screen main images')
