import { readdir } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.resolve('public/uploads')
const wranglerBin = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url))
const files = await readdir(directory).catch(() => [])
if (!files.length) {
  console.log('No local uploads found.')
  process.exit(0)
}

for (const file of files) {
  const contentTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif' }
  const contentType = contentTypes[path.extname(file).toLowerCase()] || 'application/octet-stream'
  const result = spawnSync(process.execPath, [wranglerBin, 'r2', 'object', 'put', `professor-website-media/${file}`, '--file', path.join(directory, file), '--content-type', contentType, '--remote'], { stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
console.log(`Uploaded ${files.length} media files to R2.`)
