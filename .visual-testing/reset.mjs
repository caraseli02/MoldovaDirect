#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), '.visual-testing')
const TARGETS = [
  path.join(ROOT, 'baselines'),
  path.join(ROOT, 'snapshots'),
  path.join(ROOT, 'reports'),
  path.join(ROOT, 'decisions'),
  path.join(ROOT, '.current-run-id'),
  path.join(ROOT, 'last-run.json'),
]

const force = process.argv.includes('--force')
if (!force) {
  console.error('Refusing to reset without --force')
  process.exit(1)
}

for (const target of TARGETS) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true })
    console.log(`Removed ${target}`)
  }
}

console.log('✅ Visual testing data reset complete.')
