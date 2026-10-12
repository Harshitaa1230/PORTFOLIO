import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = process.cwd()
const figmaPath = resolve(root, 'src/data/figma.json')
const outPath = resolve(root, 'src/data/figma-aspects.json')

const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN
const force = process.argv.includes('--force')

function parseScreen(url) {
  try {
    const parsed = new URL(url)
    if (!/(^|\.)figma\.com$/.test(parsed.hostname)) return null
    const parts = parsed.pathname.split('/').filter(Boolean)
    const key = parts[1]
    if (!key) return null
    const rawNode = parsed.searchParams.get('node-id') || parsed.searchParams.get('node_id')
    if (!rawNode) return null
    return { key, nodeId: rawNode.replace('-', ':') }
  } catch {
    return null
  }
}

async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return fallback
  }
}

const figmaData = await readJson(figmaPath, [])
const screens = figmaData.flatMap((project) => project.screens || [])
const existing = await readJson(outPath, {})

if (!token) {
  await writeFile(outPath, `${JSON.stringify(existing, null, 2)}\n`)
  process.stdout.write('figma-aspects: FIGMA_TOKEN / FIGMA_ACCESS_TOKEN not set — keeping existing ratios\n')
  process.exit(0)
}

const pending = screens
  .map((url) => ({ url, parsed: parseScreen(url) }))
  .filter((screen) => screen.parsed && (force || existing[screen.url] == null))

if (pending.length === 0) {
  process.stdout.write('figma-aspects: all ratios up to date\n')
  process.exit(0)
}

const byKey = new Map()
for (const { url, parsed } of pending) {
  if (!byKey.has(parsed.key)) byKey.set(parsed.key, [])
  byKey.get(parsed.key).push({ url, nodeId: parsed.nodeId })
}

const result = { ...existing }

for (const [key, items] of byKey) {
  const ids = [...new Set(items.map((item) => item.nodeId))]
  const endpoint = `https://api.figma.com/v1/files/${encodeURIComponent(key)}/nodes?ids=${encodeURIComponent(ids.join(','))}`
  try {
    const response = await fetch(endpoint, { headers: { 'X-Figma-Token': token } })
    if (!response.ok) {
      process.stdout.write(`figma-aspects: ${key} → HTTP ${response.status}, skipping\n`)
      continue
    }
    const body = await response.json()
    const nodes = body.nodes || {}
    for (const item of items) {
      const box = nodes[item.nodeId]?.document?.absoluteBoundingBox
      if (box && box.width > 0 && box.height > 0) {
        result[item.url] = Math.round((box.width / box.height) * 10000) / 10000
      }
    }
    process.stdout.write(`figma-aspects: ${key} → resolved ${ids.length} node(s)\n`)
  } catch (error) {
    process.stdout.write(`figma-aspects: ${key} → ${error.message}, skipping\n`)
  }
}

await writeFile(outPath, `${JSON.stringify(result, null, 2)}\n`)
process.stdout.write(`figma-aspects: wrote ${Object.keys(result).length} ratio(s)\n`)
