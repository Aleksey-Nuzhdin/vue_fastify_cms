// @ts-check
/**
 * Codegen orchestrator.
 *
 * Discovers every sibling `gen-*.mjs` script and runs them. Each generator stays
 * self-contained (runnable on its own); this just fans out to all of them and
 * forwards CLI args, so `--watch` propagates to every generator.
 *
 * Usage:
 *   node shared/scripts/index.mjs           # run all generators once
 *   node shared/scripts/index.mjs --watch   # run all generators in watch mode
 */
import { readdirSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const SELF = 'index.mjs'

/** @param {string} f */
const isGenerator = (f) => f.startsWith('gen-') && f.endsWith('.mjs') && f !== SELF

const scripts = readdirSync(HERE).filter(isGenerator).sort()
const args = process.argv.slice(2)
const watch = args.includes('--watch')

if (scripts.length === 0) {
  console.log(`[codegen] no gen-*.mjs scripts found in ${HERE}`)
  process.exit(0)
}

console.log(
  `[codegen] ${watch ? 'watching' : 'running'} ${scripts.length} generator(s): ${scripts.join(', ')}`,
)

const children = scripts.map((s) =>
  spawn(process.execPath, [join(HERE, s), ...args], { stdio: 'inherit' }),
)

let failed = 0
let pending = children.length

children.forEach((child, i) => {
  child.on('exit', (code) => {
    if (code) {
      failed++
      console.error(`[codegen] ${scripts[i]} exited with code ${code}`)
    }
    // In one-shot mode, exit once every generator has finished.
    if (--pending === 0 && !watch) process.exit(failed ? 1 : 0)
  })
})

// In watch mode the children stay alive; make sure Ctrl+C tears them all down.
const shutdown = () => {
  for (const c of children) c.kill()
  process.exit(failed ? 1 : 0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
