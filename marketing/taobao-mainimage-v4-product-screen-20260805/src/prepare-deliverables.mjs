import { mkdir, copyFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'

const dependencyRoot = process.env.CODEX_NODE_MODULES
if (!dependencyRoot) throw new Error('CODEX_NODE_MODULES is required')
const runtimeRequire = createRequire(path.join(dependencyRoot, '__entry.js'))
const sharp = runtimeRequire('sharp')

const projectRoot = path.resolve(import.meta.dirname, '..')
const runRoot = path.resolve(
  projectRoot,
  '../../.codex/gpt-orchestrator/runs/20260805-product-screen-v4/outputs',
)
const sourceRoot = path.join(projectRoot, 'source')

const accepted = [
  {
    provider: 'gemini',
    input: 'gemini/01-qr-lottery-gemini-v2.png',
    output: 'gemini/01-qr-lottery.png',
  },
  {
    provider: 'gemini',
    input: 'gemini/02-list-lottery-gemini.png',
    output: 'gemini/02-imported-list-lottery.png',
  },
  {
    provider: 'gemini',
    input: 'gemini/03-interactive-game-gemini.png',
    output: 'gemini/03-interactive-game.png',
    cleanup: 'ranking-numerals',
  },
  {
    provider: 'chatgpt',
    input: 'chatgpt/02-blue-gold-lottery-chatgpt.png',
    output: 'chatgpt/01-qr-lottery.png',
  },
  {
    provider: 'chatgpt',
    input: 'chatgpt/02-imported-list-lottery-chatgpt-v2.png',
    output: 'chatgpt/02-imported-list-lottery.png',
  },
  {
    provider: 'chatgpt',
    input: 'chatgpt/03-interactive-game-chatgpt.png',
    output: 'chatgpt/03-interactive-game.png',
  },
]

const cleanupOverlay = Buffer.from(`
  <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
    <g fill="#10295a">
      <rect x="792" y="668" width="31" height="38" rx="12"/>
      <rect x="792" y="779" width="31" height="38" rx="12"/>
      <rect x="792" y="889" width="31" height="38" rx="12"/>
    </g>
  </svg>
`)

await Promise.all([
  mkdir(path.join(sourceRoot, 'gemini'), { recursive: true }),
  mkdir(path.join(sourceRoot, 'chatgpt'), { recursive: true }),
])

for (const item of accepted) {
  const inputPath = path.join(runRoot, item.input)
  const outputPath = path.join(sourceRoot, item.output)

  if (item.cleanup === 'ranking-numerals') {
    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'cover' })
      .composite([{ input: cleanupOverlay }])
      .png({ compressionLevel: 9 })
      .toFile(outputPath)
    continue
  }

  const metadata = await sharp(inputPath).metadata()
  if (metadata.width === 1024 && metadata.height === 1024) {
    await copyFile(inputPath, outputPath)
  } else {
    await sharp(inputPath)
      .resize(1024, 1024, { fit: 'cover' })
      .png({ compressionLevel: 9 })
      .toFile(outputPath)
  }
}

console.log(`Prepared ${accepted.length} accepted 1024×1024 images in ${sourceRoot}`)
