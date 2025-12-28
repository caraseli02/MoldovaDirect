import type { Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Visual Testing Utilities
 *
 * Provides consistent screenshot capture and organization
 * for visual regression testing.
 */

// Root directory for all visual testing assets
export const VISUAL_TESTING_ROOT = path.join(process.cwd(), '.visual-testing')

// Subdirectories
export const BASELINES_DIR = path.join(VISUAL_TESTING_ROOT, 'baselines')
export const SNAPSHOTS_DIR = path.join(VISUAL_TESTING_ROOT, 'snapshots')
export const REPORTS_DIR = path.join(VISUAL_TESTING_ROOT, 'reports')

// Viewport definitions
export const VIEWPORTS = {
  'mobile': { width: 375, height: 812, name: 'mobile' },
  'tablet': { width: 768, height: 1024, name: 'tablet' },
  'desktop': { width: 1440, height: 900, name: 'desktop' },
  'desktop-lg': { width: 1920, height: 1080, name: 'desktop-lg' },
} as const

export type ViewportName = keyof typeof VIEWPORTS

// Get current run ID (timestamp-based)
let currentRunId: string | null = null
export function getRunId(): string {
  if (!currentRunId) {
    currentRunId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  }
  return currentRunId
}

// Reset run ID (for new test runs)
export function resetRunId(): void {
  currentRunId = null
}

/**
 * Initialize directories for a visual test run
 */
export function initVisualTestDirs(feature: string): {
  snapshotDir: string
  baselineDir: string
} {
  const runId = getRunId()
  const snapshotDir = path.join(SNAPSHOTS_DIR, runId, feature)
  const baselineDir = path.join(BASELINES_DIR, feature)

  // Create directories if they don't exist
  fs.mkdirSync(snapshotDir, { recursive: true })
  fs.mkdirSync(baselineDir, { recursive: true })

  return { snapshotDir, baselineDir }
}

/**
 * Capture a screenshot with consistent naming
 */
export async function captureScreenshot(
  page: Page,
  options: {
    feature: string
    name: string
    viewport?: ViewportName
    fullPage?: boolean
    element?: string // CSS selector for element screenshot
  },
): Promise<string> {
  const { feature, name, viewport = 'desktop', fullPage = true, element } = options

  const { snapshotDir } = initVisualTestDirs(feature)
  const filename = `${name}-${viewport}.png`
  const filepath = path.join(snapshotDir, filename)

  // Set viewport if specified
  const vp = VIEWPORTS[viewport]
  await page.setViewportSize({ width: vp.width, height: vp.height })

  // Wait for any animations to settle
  await page.waitForTimeout(300)

  if (element) {
    // Screenshot specific element
    const locator = page.locator(element).first()
    if (await locator.isVisible()) {
      await locator.screenshot({ path: filepath })
    }
    else {
      // Fallback to full page if element not found
      await page.screenshot({ path: filepath, fullPage })
    }
  }
  else {
    // Full page or viewport screenshot
    await page.screenshot({ path: filepath, fullPage })
  }

  console.log(`  📸 ${filename}`)
  return filepath
}

/**
 * Capture screenshots across multiple viewports
 */
export async function captureResponsiveScreenshots(
  page: Page,
  options: {
    feature: string
    name: string
    viewports?: ViewportName[]
    fullPage?: boolean
  },
): Promise<string[]> {
  const { viewports = ['mobile', 'tablet', 'desktop'] } = options
  const screenshots: string[] = []

  for (const viewport of viewports) {
    const filepath = await captureScreenshot(page, { ...options, viewport })
    screenshots.push(filepath)
  }

  return screenshots
}

/**
 * Generate HTML report for visual review
 */
export function generateVisualReport(feature?: string): string {
  const runId = getRunId()
  const snapshotRunDir = path.join(SNAPSHOTS_DIR, runId)

  // Collect all screenshots
  const screenshots: Array<{ feature: string, name: string, path: string }> = []

  const features = feature
    ? [feature]
    : fs.readdirSync(snapshotRunDir).filter(f =>
        fs.statSync(path.join(snapshotRunDir, f)).isDirectory(),
      )

  for (const feat of features) {
    const featDir = path.join(snapshotRunDir, feat)
    if (fs.existsSync(featDir)) {
      const files = fs.readdirSync(featDir).filter(f => f.endsWith('.png'))
      for (const file of files) {
        screenshots.push({
          feature: feat,
          name: file.replace('.png', ''),
          path: path.relative(REPORTS_DIR, path.join(featDir, file)),
        })
      }
    }
  }

  // Generate HTML
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Review - ${runId}</title>
  <style>
    :root { --bg: #0f172a; --card: #1e293b; --accent: #3b82f6; --text: #f1f5f9; --muted: #64748b; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
    header { text-align: center; margin-bottom: 2rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .meta { color: var(--muted); font-size: 0.875rem; }
    .stats { display: flex; justify-content: center; gap: 2rem; margin: 1.5rem 0; }
    .stat { text-align: center; }
    .stat-value { font-size: 2rem; font-weight: bold; color: var(--accent); }
    .stat-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card); border-radius: 12px; overflow: hidden; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); }
    .card-header { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .card-header h3 { font-size: 0.875rem; font-weight: 600; }
    .card-header .feature { font-size: 0.75rem; color: var(--accent); margin-bottom: 0.25rem; }
    .card img { width: 100%; height: auto; cursor: zoom-in; }
    .modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); z-index: 1000; }
    .modal.active { display: flex; align-items: center; justify-content: center; }
    .modal img { max-width: 95vw; max-height: 95vh; object-fit: contain; }
    .modal-close { position: absolute; top: 1rem; right: 1.5rem; font-size: 2rem; color: white; cursor: pointer; opacity: 0.7; }
    .modal-close:hover { opacity: 1; }
    .filter-bar { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .filter-btn { padding: 0.5rem 1rem; border: 1px solid var(--muted); border-radius: 9999px; background: transparent; color: var(--text); cursor: pointer; font-size: 0.875rem; }
    .filter-btn:hover, .filter-btn.active { background: var(--accent); border-color: var(--accent); }
  </style>
</head>
<body>
  <header>
    <h1>Visual Review</h1>
    <p class="meta">Run: ${runId}</p>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${screenshots.length}</div>
        <div class="stat-label">Screenshots</div>
      </div>
      <div class="stat">
        <div class="stat-value">${features.length}</div>
        <div class="stat-label">Features</div>
      </div>
    </div>
    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">All</button>
      ${features.map(f => `<button class="filter-btn" data-filter="${f}">${f}</button>`).join('')}
    </div>
  </header>
  <div class="grid">
    ${screenshots.sort((a, b) => a.name.localeCompare(b.name)).map(s => `
    <div class="card" data-feature="${s.feature}">
      <div class="card-header">
        <div class="feature">${s.feature}</div>
        <h3>${s.name}</h3>
      </div>
      <img src="${s.path}" alt="${s.name}" onclick="openModal(this.src)" loading="lazy">
    </div>`).join('')}
  </div>
  <div class="modal" onclick="closeModal()">
    <span class="modal-close">&times;</span>
    <img id="modal-img" src="" alt="">
  </div>
  <script>
    function openModal(src) {
      document.getElementById('modal-img').src = src;
      document.querySelector('.modal').classList.add('active');
    }
    function closeModal() { document.querySelector('.modal').classList.remove('active'); }
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.card').forEach(card => {
          card.style.display = filter === 'all' || card.dataset.feature === filter ? '' : 'none';
        });
      });
    });
  </script>
</body>
</html>`

  // Ensure reports directory exists
  fs.mkdirSync(REPORTS_DIR, { recursive: true })

  const reportPath = path.join(REPORTS_DIR, 'index.html')
  fs.writeFileSync(reportPath, html)
  console.log(`\n📊 Report generated: ${reportPath}`)

  return reportPath
}

/**
 * Copy approved snapshots to baselines
 */
export function updateBaselines(feature: string): void {
  const runId = getRunId()
  const snapshotDir = path.join(SNAPSHOTS_DIR, runId, feature)
  const baselineDir = path.join(BASELINES_DIR, feature)

  if (!fs.existsSync(snapshotDir)) {
    console.error(`No snapshots found for feature: ${feature}`)
    return
  }

  fs.mkdirSync(baselineDir, { recursive: true })

  const files = fs.readdirSync(snapshotDir).filter(f => f.endsWith('.png'))
  for (const file of files) {
    fs.copyFileSync(
      path.join(snapshotDir, file),
      path.join(baselineDir, file),
    )
    console.log(`  ✓ Updated baseline: ${feature}/${file}`)
  }

  console.log(`\n✅ Updated ${files.length} baselines for ${feature}`)
}
