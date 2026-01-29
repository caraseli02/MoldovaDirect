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
export const BASELINES_DIR = path.join(VISUAL_TESTING_ROOT, 'baselines') // Reference screenshots (git tracked)
export const SNAPSHOTS_DIR = path.join(VISUAL_TESTING_ROOT, 'snapshots') // Current test run (gitignored)
export const REPORTS_DIR = path.join(VISUAL_TESTING_ROOT, 'reports') // HTML review reports (gitignored)
export const DECISIONS_DIR = path.join(VISUAL_TESTING_ROOT, 'decisions') // Stores approve/reject decisions
export const RUN_ID_FILE = path.join(VISUAL_TESTING_ROOT, '.current-run-id') // Coordinates parallel workers
export const LAST_RUN_FILE = path.join(VISUAL_TESTING_ROOT, 'last-run.json') // Tracks most recent test run

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
    // Persist run id across parallel Playwright workers
    if (fs.existsSync(RUN_ID_FILE)) {
      currentRunId = fs.readFileSync(RUN_ID_FILE, 'utf-8').trim()
    }
    else {
      const generated = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      try {
        fs.writeFileSync(RUN_ID_FILE, generated, { flag: 'wx' })
        currentRunId = generated
      }
      catch (err) {
        // Only treat as shared ID if file exists and is readable
        if (fs.existsSync(RUN_ID_FILE)) {
          try {
            currentRunId = fs.readFileSync(RUN_ID_FILE, 'utf-8').trim()
          }
          catch (readErr) {
            console.error('[Visual Testing] Run ID file exists but unreadable:', readErr)
            throw readErr
          }
        }
        else {
          console.error('[Visual Testing] Failed to create run ID file:', err)
          throw err
        }
      }
    }
  }
  return currentRunId
}

// Reset run ID (for new test runs)
export function resetRunId(): void {
  currentRunId = null
  if (fs.existsSync(RUN_ID_FILE)) {
    fs.rmSync(RUN_ID_FILE, { force: true })
  }
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
  const screenshots: Array<{
    feature: string
    name: string
    snapshotPath: string
    baselinePath: string | null
    baselineExists: boolean
  }> = []

  const features = fs.existsSync(snapshotRunDir)
    ? fs.readdirSync(snapshotRunDir).filter(f =>
        fs.statSync(path.join(snapshotRunDir, f)).isDirectory(),
      )
    : []

  for (const feat of features) {
    const featDir = path.join(snapshotRunDir, feat)
    if (fs.existsSync(featDir)) {
      const files = fs.readdirSync(featDir).filter(f => f.endsWith('.png'))
      for (const file of files) {
        const baselineFile = path.join(BASELINES_DIR, feat, file)
        const baselineExists = fs.existsSync(baselineFile)
        screenshots.push({
          feature: feat,
          name: file.replace('.png', ''),
          snapshotPath: path.relative(REPORTS_DIR, path.join(featDir, file)),
          baselinePath: baselineExists
            ? path.relative(REPORTS_DIR, baselineFile)
            : null,
          baselineExists,
        })
      }
    }
  }

  // Ensure reports directory exists
  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  fs.mkdirSync(DECISIONS_DIR, { recursive: true })

  const reportData = {
    runId,
    generatedAt: new Date().toISOString(),
    features,
    screenshots,
  }

  fs.writeFileSync(path.join(REPORTS_DIR, 'report-data.json'), JSON.stringify(reportData, null, 2))
  fs.writeFileSync(LAST_RUN_FILE, JSON.stringify({ runId, generatedAt: reportData.generatedAt }, null, 2))

  // Generate HTML report (Chromatic-like review UI)
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Review - ${runId}</title>
  <style>
    :root {
      --bg: #0b1020;
      --card: #111827;
      --accent: #22c55e;
      --danger: #ef4444;
      --warn: #f59e0b;
      --text: #e5e7eb;
      --muted: #9ca3af;
      --border: rgba(255,255,255,0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; }
    header { text-align: center; margin-bottom: 2rem; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .meta { color: var(--muted); font-size: 0.875rem; }
    .stats { display: flex; justify-content: center; gap: 1.5rem; margin: 1.5rem 0; flex-wrap: wrap; }
    .stat { text-align: center; padding: 0.5rem 1rem; border: 1px solid var(--border); border-radius: 999px; }
    .stat-value { font-size: 1.25rem; font-weight: bold; color: var(--text); }
    .stat-label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; }
    .toolbar { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .filter-btn, .view-btn {
      padding: 0.5rem 1rem;
      border: 1px solid var(--border);
      border-radius: 9999px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
      font-size: 0.875rem;
    }
    .filter-btn:hover, .filter-btn.active, .view-btn.active { background: var(--accent); border-color: var(--accent); color: #0b1020; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(520px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card); border-radius: 16px; overflow: hidden; border: 1px solid var(--border); }
    .card-header { padding: 1rem; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
    .card-header h3 { font-size: 0.875rem; font-weight: 600; }
    .card-header .feature { font-size: 0.75rem; color: var(--muted); margin-bottom: 0.25rem; }
    .card-body { padding: 1rem; display: grid; gap: 1rem; }
    .image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .image-panel { border: 1px solid var(--border); border-radius: 10px; overflow: hidden; background: #0f172a; }
    .image-panel header { padding: 0.5rem 0.75rem; font-size: 0.75rem; color: var(--muted); border-bottom: 1px solid var(--border); text-align: left; }
    .image-panel img, .image-panel canvas { width: 100%; height: auto; display: block; }
    .actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.4rem 0.75rem; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text); cursor: pointer; font-size: 0.8rem; }
    .btn.approve { background: var(--accent); color: #0b1020; border-color: var(--accent); }
    .btn.reject { background: var(--danger); color: #fff; border-color: var(--danger); }
    .badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; padding: 0.25rem 0.5rem; border-radius: 999px; border: 1px solid var(--border); }
    .badge.new { color: var(--warn); border-color: var(--warn); }
    .badge.approved { color: var(--accent); border-color: var(--accent); }
    .badge.rejected { color: var(--danger); border-color: var(--danger); }
    .badge.pending { color: var(--muted); border-color: var(--border); }
    .meta-row { display: flex; align-items: center; gap: 0.75rem; }
    .diff-row { display: none; }
    .diff-row.active { display: block; }
    .note { font-size: 0.75rem; color: var(--muted); }
  </style>
</head>
<body>
  <header>
    <h1>Visual Review</h1>
    <p class="meta">Run: ${runId}</p>
    <div class="stats">
      <div class="stat"><div class="stat-value" id="stat-total">0</div><div class="stat-label">Total</div></div>
      <div class="stat"><div class="stat-value" id="stat-approved">0</div><div class="stat-label">Approved</div></div>
      <div class="stat"><div class="stat-value" id="stat-rejected">0</div><div class="stat-label">Rejected</div></div>
      <div class="stat"><div class="stat-value" id="stat-pending">0</div><div class="stat-label">Pending</div></div>
      <div class="stat"><div class="stat-value" id="stat-new">0</div><div class="stat-label">New</div></div>
    </div>
    <div class="toolbar" id="feature-filters"></div>
    <div class="toolbar">
      <button class="view-btn active" data-view="split">Split View</button>
      <button class="view-btn" data-view="diff">Diff Only</button>
    </div>
    <p class="note">Approve copies the snapshot into baselines automatically. Reject marks it for follow-up.</p>
  </header>
  <div class="grid" id="cards"></div>
  <script>
    const state = {
      data: null,
      decisions: {},
      view: 'split',
      filter: 'all'
    };

    async function loadData() {
      const data = await fetch('/reports/report-data.json').then(r => r.json());
      state.data = data;
      try {
        const resp = await fetch('/api/decisions?runId=' + encodeURIComponent(data.runId));
        const payload = await resp.json();
        state.decisions = payload.decisions || {};
      } catch (err) {
        console.error('Failed to load decisions:', err);
        state.decisions = {};
      }
      render();
    }

    function decisionFor(item) {
      const key = item.feature + '/' + item.name;
      return state.decisions[key] || null;
    }

    function renderStats(items) {
      let approved = 0, rejected = 0, pending = 0, created = 0;
      items.forEach(item => {
        const decision = decisionFor(item);
        if (decision?.status === 'approved') approved++;
        else if (decision?.status === 'rejected') rejected++;
        else if (!item.baselineExists) created++;
        else pending++;
      });
      document.getElementById('stat-total').textContent = items.length;
      document.getElementById('stat-approved').textContent = approved;
      document.getElementById('stat-rejected').textContent = rejected;
      document.getElementById('stat-pending').textContent = pending;
      document.getElementById('stat-new').textContent = created;
    }

    function createBadge(item) {
      const decision = decisionFor(item);
      if (decision?.status === 'approved') return '<span class="badge approved">Approved</span>';
      if (decision?.status === 'rejected') return '<span class="badge rejected">Rejected</span>';
      if (!item.baselineExists) return '<span class="badge new">New</span>';
      return '<span class="badge pending">Pending</span>';
    }

    function renderFilters(features) {
      const container = document.getElementById('feature-filters');
      container.innerHTML = '';
      const allBtn = document.createElement('button');
      allBtn.className = 'filter-btn' + (state.filter === 'all' ? ' active' : '');
      allBtn.textContent = 'All';
      allBtn.dataset.filter = 'all';
      container.appendChild(allBtn);
      features.forEach(f => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (state.filter === f ? ' active' : '');
        btn.textContent = f;
        btn.dataset.filter = f;
        container.appendChild(btn);
      });
    }

    function renderCards(items) {
      const container = document.getElementById('cards');
      container.innerHTML = items.map(item => {
        const baseline = item.baselinePath ? '<img class="baseline" src="' + item.baselinePath + '" alt="baseline">' : '<div class="note" style="padding:1rem;">No baseline yet</div>';
        const diffCanvas = '<canvas class="diff"></canvas>';
        return \`
          <div class="card" data-feature="\${item.feature}" data-name="\${item.name}">
            <div class="card-header">
              <div>
                <div class="feature">\${item.feature}</div>
                <h3>\${item.name}</h3>
              </div>
              <div class="meta-row">
                \${createBadge(item)}
                <div class="actions">
                  <button class="btn approve" data-action="approve">Approve</button>
                  <button class="btn reject" data-action="reject">Reject</button>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="image-grid split-view">
                <div class="image-panel">
                  <header>Baseline</header>
                  \${baseline}
                </div>
                <div class="image-panel">
                  <header>Snapshot</header>
                  <img class="snapshot" src="\${item.snapshotPath}" alt="snapshot">
                </div>
              </div>
              <div class="image-panel diff-row">
                <header>Diff (difference blend)</header>
                \${diffCanvas}
              </div>
            </div>
          </div>\`;
      }).join('');

      applyViewMode();
      renderDiffs();
    }

    function applyViewMode() {
      document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.view);
      });
      document.querySelectorAll('.card').forEach(card => {
        const split = card.querySelector('.split-view');
        const diff = card.querySelector('.diff-row');
        if (state.view === 'diff') {
          split.style.display = 'none';
          diff.classList.add('active');
        } else {
          split.style.display = 'grid';
          diff.classList.remove('active');
        }
      });
    }

    function renderDiffs() {
      document.querySelectorAll('.card').forEach(card => {
        const baseline = card.querySelector('img.baseline');
        const snapshot = card.querySelector('img.snapshot');
        const canvas = card.querySelector('canvas.diff');
        if (!baseline || !snapshot || !canvas) return;

        const render = () => {
          const w = Math.max(baseline.naturalWidth, snapshot.naturalWidth);
          const h = Math.max(baseline.naturalHeight, snapshot.naturalHeight);
          if (!w || !h) return;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, w, h);
          ctx.drawImage(baseline, 0, 0);
          ctx.globalCompositeOperation = 'difference';
          ctx.drawImage(snapshot, 0, 0);
          ctx.globalCompositeOperation = 'source-over';
        };

        if (baseline.complete && snapshot.complete) render();
        else {
          baseline.onload = render;
          snapshot.onload = render;
        }
      });
    }

    function render() {
      const items = state.data.screenshots.slice().sort((a, b) => a.name.localeCompare(b.name));
      const filtered = state.filter === 'all' ? items : items.filter(i => i.feature === state.filter);
      renderFilters(state.data.features);
      renderStats(items);
      renderCards(filtered);
    }

    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('.filter-btn');
      if (btn) {
        state.filter = btn.dataset.filter;
        render();
        return;
      }

      const viewBtn = e.target.closest('.view-btn');
      if (viewBtn) {
        state.view = viewBtn.dataset.view;
        applyViewMode();
        return;
      }

      const actionBtn = e.target.closest('[data-action]');
      if (actionBtn) {
        const card = actionBtn.closest('.card');
        const feature = card.dataset.feature;
        const name = card.dataset.name;
        const action = actionBtn.dataset.action;
        const endpoint = action === 'approve' ? '/api/approve' : '/api/reject';
        const resp = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ runId: state.data.runId, feature, name })
        });
        const payload = await resp.json();
        state.decisions = payload.decisions || state.decisions;
        render();
      }
    });

    loadData();
  </script>
</body>
</html>`

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
  let successCount = 0
  let failureCount = 0

  for (const file of files) {
    try {
      fs.copyFileSync(
        path.join(snapshotDir, file),
        path.join(baselineDir, file),
      )
      console.log(`  ✓ Updated baseline: ${feature}/${file}`)
      successCount++
    }
    catch (err) {
      console.error(`  ✗ Failed to copy ${file}:`, err)
      failureCount++
    }
  }

  console.log(`\n✅ Updated ${successCount} baselines for ${feature}`)
  if (failureCount > 0) {
    console.warn(`⚠️ Failed to update ${failureCount} baselines`)
  }
}
