// scripts/gen-secrets.mjs
//
// Генерирует стойкие hex-секреты (64 символа = 32 байт, как `openssl rand -hex 32`)
// и вписывает их в .env-файлы. По умолчанию заполняет только ПУСТЫЕ или СЛАБЫЕ
// значения — уже стойкие секреты не трогает (иначе разлогинишь всех, у кого живой
// токен). Флаг --force перегенерирует всё принудительно.
//
// Запуск:
//   node scripts/gen-secrets.mjs           → .env (по умолчанию)
//   node scripts/gen-secrets.mjs --force   → перегенерить всё принудительно
//   node scripts/gen-secrets.mjs <file>    → указать другой env-файл

import { randomBytes } from 'node:crypto'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Те же ключи и правило стойкости, что в server/src/configs/index.ts.
const SECRET_KEYS = ['JWT_SECRET', 'COOKIE_SECRET']
const HEX_SECRET = /^[0-9a-f]{64}$/i
const isStrong = (v) => HEX_SECRET.test(v) && new Set(v).size >= 10

const genSecret = () => randomBytes(32).toString('hex') // 64 hex-символов (openssl rand -hex 32)

const args = process.argv.slice(2)
const force = args.includes('--force')
const files = args.filter((a) => !a.startsWith('--'))
if (files.length === 0) files.push('.env')

const updateFile = (relPath) => {
  const file = resolve(process.cwd(), relPath)
  // Читаем существующий файл построчно, чтобы не затереть остальные переменные
  // и комментарии — трогаем только строки нужных ключей.
  const lines = existsSync(file) ? readFileSync(file, 'utf8').split(/\r?\n/) : []

  console.log(`\n${relPath}:`)
  for (const key of SECRET_KEYS) {
    const idx = lines.findIndex((l) => new RegExp(`^\\s*${key}\\s*=`).test(l))
    const current = idx >= 0 ? lines[idx].slice(lines[idx].indexOf('=') + 1).trim() : ''

    if (!force && isStrong(current)) {
      console.log(`  = ${key}: уже стойкий, пропускаю`)
      continue
    }

    const line = `${key}=${genSecret()}`
    if (idx >= 0) lines[idx] = line
    else lines.push(line)
    console.log(`  + ${key}: сгенерирован`)
  }

  // Нормализуем хвостовые пустые строки и гарантируем один \n в конце.
  writeFileSync(file, lines.join('\n').replace(/\n+$/, '') + '\n', 'utf8')
}

for (const f of files) updateFile(f)
console.log('\nГотово.')
