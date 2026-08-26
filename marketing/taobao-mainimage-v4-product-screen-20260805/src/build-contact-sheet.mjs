import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const dependencyRoot = process.env.CODEX_NODE_MODULES
if (!dependencyRoot) throw new Error('CODEX_NODE_MODULES is required')
const runtimeRequire = createRequire(path.join(dependencyRoot, '__entry.js'))
const sharp = runtimeRequire('sharp')

const projectRoot = path.resolve(import.meta.dirname, '..')
const sourceRoot = path.join(projectRoot, 'source')
const outputRoot = path.join(projectRoot, 'deliverables')

const tile = 400
const gap = 24
const left = 42
const top = 124
const rowGap = 82
const width = left * 2 + tile * 3 + gap * 2
const height = top + tile * 2 + rowGap + 48

const columns = [
  { title: 'A  扫码抽奖', file: '01-qr-lottery.png' },
  { title: 'B  导入名单抽奖', file: '02-imported-list-lottery.png' },
  { title: 'C  大屏互动游戏', file: '03-interactive-game.png' },
]
const rows = [
  { title: 'GEMINI', provider: 'gemini', y: top },
  { title: 'GPT 5.6 SOL', provider: 'chatgpt', y: top + tile + rowGap },
]

const composites = []
for (const row of rows) {
  for (const [index, column] of columns.entries()) {
    const input = await sharp(path.join(sourceRoot, row.provider, column.file))
      .resize(tile, tile, { fit: 'cover' })
      .png()
      .toBuffer()
    composites.push({
      input,
      left: left + index * (tile + gap),
      top: row.y,
    })
  }
}

const textOverlay = Buffer.from(`
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#071123"/>
    <text x="${left}" y="52" fill="#ffffff" font-family="PingFang SC, Noto Sans CJK SC, sans-serif" font-size="30" font-weight="700">淘宝主图 V4 · 纯前端大屏方向对比</text>
    <text x="${left}" y="87" fill="#91a7c7" font-family="PingFang SC, Noto Sans CJK SC, sans-serif" font-size="17">无后台 · 无操作流程 · 无舞台场景 · 1024×1024 成品</text>
    ${columns.map((column, index) => `
      <text x="${left + index * (tile + gap)}" y="${top - 20}" fill="#dbe8ff" font-family="PingFang SC, Noto Sans CJK SC, sans-serif" font-size="21" font-weight="600">${column.title}</text>
    `).join('')}
    ${rows.map(row => `
      <rect x="${left}" y="${row.y + tile + 14}" width="146" height="38" rx="19" fill="#17335f"/>
      <text x="${left + 73}" y="${row.y + tile + 40}" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="16" font-weight="700">${row.title}</text>
    `).join('')}
  </svg>
`)

await mkdir(outputRoot, { recursive: true })
const outputPath = path.join(outputRoot, 'contact-sheet-6-directions.png')
await sharp({
  create: {
    width,
    height,
    channels: 4,
    background: '#071123',
  },
})
  .composite([{ input: textOverlay }, ...composites])
  .png({ compressionLevel: 9 })
  .toFile(outputPath)

console.log(outputPath)
