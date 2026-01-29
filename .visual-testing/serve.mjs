#!/usr/bin/env node
/**
 * Simple HTTP server for viewing visual test reports
 * Run: node .visual-testing/serve.mjs
 */

import http from 'http'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = 3333

const VISUAL_ROOT = __dirname
const BASELINES_DIR = path.join(VISUAL_ROOT, 'baselines')
const SNAPSHOTS_DIR = path.join(VISUAL_ROOT, 'snapshots')
const DECISIONS_DIR = path.join(VISUAL_ROOT, 'decisions')
const LAST_RUN_FILE = path.join(VISUAL_ROOT, 'last-run.json')

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
}

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(payload))
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      }
      catch (error) {
        reject(error)
      }
    })
  })
}

function isSafeSegment(segment) {
  return typeof segment === 'string'
    && segment.length > 0
    && segment.length < 100
    && /^[a-zA-Z0-9_-]+$/.test(segment)
}

function readLastRunId() {
  if (!fs.existsSync(LAST_RUN_FILE)) return null
  try {
    const payload = JSON.parse(fs.readFileSync(LAST_RUN_FILE, 'utf-8'))
    return payload.runId || null
  }
  catch (err) {
    console.warn('[Serve] Failed to parse last-run.json:', err.message)
    return null
  }
}

function readDecisions(runId) {
  const file = path.join(DECISIONS_DIR, `${runId}.json`)
  if (!fs.existsSync(file)) {
    return { runId, decisions: {} }
  }
  try {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
  }
  catch (err) {
    console.error(`[Serve] Failed to read decisions for run ${runId}:`, err.message)
    return { runId, decisions: {} }
  }
}

function writeDecisions(runId, decisions) {
  fs.mkdirSync(DECISIONS_DIR, { recursive: true })
  const file = path.join(DECISIONS_DIR, `${runId}.json`)
  fs.writeFileSync(file, JSON.stringify({ runId, decisions }, null, 2))
  return { runId, decisions }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)

  if (url.pathname.startsWith('/api/')) {
    const runIdFromQuery = url.searchParams.get('runId') || readLastRunId()

    if (url.pathname === '/api/run' && req.method === 'GET') {
      return json(res, 200, { runId: runIdFromQuery })
    }

    if (url.pathname === '/api/decisions' && req.method === 'GET') {
      if (!runIdFromQuery) return json(res, 200, { decisions: {} })
      const data = readDecisions(runIdFromQuery)
      return json(res, 200, data)
    }

    if ((url.pathname === '/api/approve' || url.pathname === '/api/reject') && req.method === 'POST') {
      try {
        const payload = await readJsonBody(req)
        const runId = payload.runId || runIdFromQuery
        const feature = payload.feature
        const name = payload.name

        if (!runId || !isSafeSegment(feature) || !isSafeSegment(name)) {
          return json(res, 400, { error: 'Invalid payload' })
        }

        const snapshotPath = path.join(SNAPSHOTS_DIR, runId, feature, `${name}.png`)
        const baselinePath = path.join(BASELINES_DIR, feature, `${name}.png`)

        if (!fs.existsSync(snapshotPath)) {
          return json(res, 404, { error: 'Snapshot not found' })
        }

        if (url.pathname === '/api/approve') {
          fs.mkdirSync(path.dirname(baselinePath), { recursive: true })
          fs.copyFileSync(snapshotPath, baselinePath)
        }

        const current = readDecisions(runId)
        const key = `${feature}/${name}`
        current.decisions[key] = { status: url.pathname === '/api/approve' ? 'approved' : 'rejected', at: new Date().toISOString() }
        const updated = writeDecisions(runId, current.decisions)
        return json(res, 200, updated)
      }
      catch (err) {
        console.error('[API] Request failed:', err)
        return json(res, 400, { error: 'Bad request', details: err.message })
      }
    }

    return json(res, 404, { error: 'Not found' })
  }

  let filePath = path.join(__dirname, req.url === '/' ? '/reports/index.html' : req.url)

  // Security: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403)
    res.end('Forbidden')
    return
  }

  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_TYPES[ext] || 'application/octet-stream'

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404)
        res.end('Not Found: ' + req.url)
      }
      else {
        console.error('[Serve] File read error:', err)
        res.writeHead(500)
        res.end('Server Error')
      }
      return
    }

    res.writeHead(200, { 'Content-Type': contentType })
    res.end(content)
  })
})

server.listen(PORT, () => {
  console.log(`\n📸 Visual Testing Report Server`)
  console.log(`   http://localhost:${PORT}`)
  console.log(`\n   Press Ctrl+C to stop\n`)
})
