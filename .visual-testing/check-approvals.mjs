#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const ROOT = path.join(process.cwd(), '.visual-testing')
const LAST_RUN_FILE = path.join(ROOT, 'last-run.json')
const DECISIONS_DIR = path.join(ROOT, 'decisions')

function readLastRunId() {
  if (!fs.existsSync(LAST_RUN_FILE)) return null
  try {
    const payload = JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf-8'))
    return payload.runId || null
  }
  catch (err) {
    console.warn('[Check Approvals] Failed to parse last-run.json:', err.message)
    return null
  }
}

const runId = readLastRunId()
if (!runId) {
  console.log('⚠️ No last run found. Skipping approval check.')
  process.exit(0)
}

const decisionsFile = path.join(DECISIONS_DIR, `${runId}.json`)
if (!fs.existsSync(decisionsFile)) {
  console.log(`⚠️ No decisions found for run ${runId}.`)
  process.exit(0)
}

let payload
try {
  payload = JSON.parse(fs.readFileSync(decisionsFile, 'utf-8'))
}
catch (parseError) {
  console.error(`❌ Failed to parse decisions file at ${decisionsFile}:`, parseError.message)
  process.exit(1)
}
const decisions = payload.decisions || {}
const rejected = Object.entries(decisions).filter(([, v]) => v?.status === 'rejected')

if (rejected.length > 0) {
  console.error(`❌ ${rejected.length} visual change(s) rejected:`)
  for (const [key] of rejected) {
    console.error(` - ${key}`)
  }
  process.exit(1)
}

console.log('✅ No rejected visual changes found.')
