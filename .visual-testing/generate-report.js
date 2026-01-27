const path = require('path');
const fs = require('fs');

const VISUAL_TESTING_ROOT = path.join(process.cwd(), '.visual-testing');
const BASELINES_DIR = path.join(VISUAL_TESTING_ROOT, 'baselines');
const REPORTS_DIR = path.join(VISUAL_TESTING_ROOT, 'reports');

// Get current run ID
const runId = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

// Collect all screenshots
const screenshots = [];
const baselinesDir = path.join(BASELINES_DIR, 'product-detail');

if (fs.existsSync(baselinesDir)) {
  const files = fs.readdirSync(baselinesDir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    screenshots.push({
      feature: 'product-detail',
      name: file.replace('.png', ''),
      path: path.relative(REPORTS_DIR, path.join(baselinesDir, file)),
    });
  }
}

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Visual Review - Product Detail Baselines</title>
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(500px, 1fr)); gap: 1.5rem; }
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
    .status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 9999px; font-size: 0.75rem; margin-left: 0.5rem; }
    .status-baseline { background: #10b981; color: white; }
  </style>
</head>
<body>
  <header>
    <h1>Visual Review - Product Detail Baselines</h1>
    <p class="meta">Baseline Establishment Run | ${runId}</p>
    <div class="stats">
      <div class="stat">
        <div class="stat-value">${screenshots.length}</div>
        <div class="stat-label">Baseline Screenshots</div>
      </div>
      <div class="stat">
        <div class="stat-value">3</div>
        <div class="stat-label">Products Tested</div>
      </div>
      <div class="stat">
        <div class="stat-value">3</div>
        <div class="stat-label">Viewports</div>
      </div>
    </div>
    <div class="filter-bar">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="mobile">Mobile (375px)</button>
      <button class="filter-btn" data-filter="tablet">Tablet (768px)</button>
      <button class="filter-btn" data-filter="desktop">Desktop (1440px)</button>
      <button class="filter-btn" data-filter="full-page">Full Page</button>
      <button class="filter-btn" data-filter="responsive">Responsive</button>
    </div>
  </header>
  <div class="grid">
    ${screenshots.sort((a, b) => a.name.localeCompare(b.name)).map(s => `
    <div class="card" data-name="${s.name}">
      <div class="card-header">
        <div class="feature">product-detail <span class="status-badge status-baseline">BASELINE</span></div>
        <h3>${s.name}</h3>
      </div>
      <img src="../baselines/product-detail/${s.name}.png" alt="${s.name}" onclick="openModal(this.src)" loading="lazy">
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
          const name = card.dataset.name;
          card.style.display = filter === 'all' || name.includes(filter) ? '' : 'none';
        });
      });
    });
  </script>
</body>
</html>`;

// Ensure reports directory exists
fs.mkdirSync(REPORTS_DIR, { recursive: true });

const reportPath = path.join(REPORTS_DIR, 'index.html');
fs.writeFileSync(reportPath, html);
console.log(`Report generated: ${reportPath}`);
