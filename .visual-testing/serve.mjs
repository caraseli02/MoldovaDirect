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

const server = http.createServer((req, res) => {
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
