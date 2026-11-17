/**
 * ============================================================================
 * EXECUTIVE PROGRESS LOG & TEAM SHARE LEDGER (src/plan/progressExecutiveLog.js)
 * ============================================================================
 * Mounts a scannable 10-Step Milestone Progress Table, 4 KPI Metric Pills, and
 * a 1-click "Copy Team Update (Markdown)" share utility into `progress.html`.
 */

const KPI_METRICS = [
  { title: '🏛️ 69 Blender .GLB Assets', sub: '27 Landmarks/Props + 42 SG Relics' },
  { title: '🎮 42 Interactive 3D Toys', sub: '360° Turntable + Procedural Toybox Animations' },
  { title: '🌅 3-Min Living Sky Cycle', sub: 'Morning Sun → Golden Sunset → Night Rhapsody' },
  { title: '🛠️ Admin 3D & Anim Studio', sub: 'Slow-Mo 0.25x–2x, Clean View & Lighting Lock' }
];

const MILESTONE_LEDGER = [
  {
    step: 'Step 1', key: 'blueprints', focus: 'Concept Blueprints & Art Direction',
    deliverables: '11 screen & zone concept boards, isometric diorama palette, HUD & 42-relic encyclopedia specs',
    status: '✅ Complete'
  },
  {
    step: 'Step 2', key: 'm1', focus: '3D Asset Modeling in Blender',
    deliverables: '69 bespoke .GLB models: 27 landmarks/explorers/trees + 42 Singapore keepsake relics & 5 contact sheets',
    status: '✅ Complete'
  },
  {
    step: 'Step 3', key: 'm2', focus: 'Terrain, Water & Walkways',
    deliverables: 'Bay South peninsula elevation, Marina Reservoir shader, Dragonfly Lake & walkable boulevard network',
    status: '✅ Complete'
  },
  {
    step: 'Step 4', key: 'm3', focus: 'Iconic Park Landmarks',
    deliverables: '18 Supertrees + OCBC Skyway, Flower Dome, Cloud Forest waterfall, Planet Baby & Heritage arches',
    status: '✅ Complete'
  },
  {
    step: 'Step 5', key: 'm4', focus: '4 Chibi Explorers & 42 Relics',
    deliverables: 'YOU + Bots Kai, Mei, Raj with articulated limbs, glowing plinths & zone-authentic relic coordinates',
    status: '✅ Complete'
  },
  {
    step: 'Step 6', key: 'm5', focus: 'Game UI, HUD & LookDev Studio',
    deliverables: 'Title & mode setup modals, live 4P race HUD, 42-relic encyclopedia & real-time LookDev lighting panel',
    status: '✅ Complete'
  },
  {
    step: 'Step 7', key: 'm6', focus: 'Gameplay Loop, Radar & Finale',
    deliverables: 'Tactical radar map [M], AI bot pathfinding, 3-minute countdown, fireworks & victory podium',
    status: '✅ Complete'
  },
  {
    step: 'Step 8', key: 'm7', focus: 'Official Boomerang Map Calibration',
    deliverables: 'Geodesic visitor map alignment, Marina Gardens Drive road clearance & zero-road tree exclusion',
    status: '✅ Complete'
  },
  {
    step: 'Step 9', key: 'm8', focus: 'Emotional & Arcade UX (v3.0)',
    deliverables: 'Living 3D Sky Dome, 3-tier rarity beams, 12-word AHA copy, Spicy Bots pickpocketing & Durian traps',
    status: '✅ Complete'
  },
  {
    step: 'Step 10', key: 'm9', focus: 'Admin 3D Studio & Team Progress Log',
    deliverables: '🎬 3D & Anim Inspector tab, Slow-Mo 0.25x–2x scrubber, 360° turntable Clean View [H] & 1-click Markdown log',
    status: '✅ Complete'
  }
];

export function buildTeamProgressMarkdown() {
  return [
    '# 🌿 Gardens by the Bay 3D Treasure Hunt — Team Progress Update (Steps 1–10)',
    '',
    '## 📌 Project Summary',
    'Complete 10-step visual engineering build of the playable **Gardens by the Bay 3D Treasure Hunt** WebGL experience, uniting authentic Bay South peninsula architecture, 4-player arcade rivalry, a 360° interactive Singapore Keepsake Toybox, and a dedicated Admin 3D & Animation LookDev Studio.',
    '',
    '## 📊 Key Metrics',
    '- **69 Blender 3D Models**: 27 Landmarks/Props + 42 SG Relics (`.GLB` bundles)',
    '- **42 Interactive 3D Toys**: 360° Turntable + Procedural Toybox Animations & Bespoke Audio',
    '- **5 Bay South Zones**: Supertree Grove, Conservatories, Dragonfly Lake, The Meadow & Kingfisher Wetlands',
    '- **4 Emotional Pillars**: Fun, WOW!, Amazed & Funny across a 3-Minute Morning-to-Night Sky Cycle',
    '',
    '## 🗓️ 10-Step Milestone Ledger',
    '| Step | Milestone & Focus | Key Deliverables Shipped | Status |',
    '| :--- | :--- | :--- | :--- |',
    ...MILESTONE_LEDGER.map((r) => `| **${r.step}** | ${r.focus} | ${r.deliverables} | ${r.status} |`)
  ].join('\n');
}

export function initExecutiveProgressLog({ onJumpToSection } = {}) {
  const mount = document.getElementById('executiveProgressLogMount');
  if (!mount) return;

  mount.innerHTML = `
    <section class="exec-log-card" aria-label="Team Progress Log and Milestone Ledger">
      <div class="exec-log-header">
        <div class="exec-log-title-wrap">
          <span class="exec-log-eyebrow">📊 TEAM PROGRESS LOG &amp; MILESTONE LEDGER</span>
          <h2 class="exec-log-title">Key Build Progress &amp; Shareable Team Update (Steps 1–10)</h2>
        </div>
        <div class="exec-log-actions">
          <button type="button" id="btnCopyTeamProgressMd" class="exec-copy-btn">📋 Copy Team Update (Markdown)</button>
          <button type="button" id="btnToggleExecLogTable" class="exec-toggle-btn" aria-expanded="true">▼ Hide / Show Table</button>
        </div>
      </div>
      <div class="exec-kpi-strip">
        ${KPI_METRICS.map((k) => `<div class="exec-kpi-pill"><span class="exec-kpi-title">${k.title}</span><span class="exec-kpi-sub">${k.sub}</span></div>`).join('')}
      </div>
      <div class="exec-log-table-wrap" id="execLogTableWrap">
        <table class="exec-log-table">
          <thead>
            <tr><th>Step</th><th>Milestone &amp; Focus</th><th>Key Deliverables Shipped</th><th>Status</th><th>Inspect</th></tr>
          </thead>
          <tbody>
            ${MILESTONE_LEDGER.map((row) => `
              <tr>
                <td class="exec-col-step">${row.step}</td>
                <td class="exec-col-focus">${row.focus}</td>
                <td class="exec-col-deliv">${row.deliverables}</td>
                <td class="exec-col-status"><span class="exec-status-pill">${row.status}</span></td>
                <td class="exec-col-jump"><button type="button" class="exec-jump-btn" data-exec-jump="${row.key}">Jump →</button></td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;

  const copyBtn = document.getElementById('btnCopyTeamProgressMd');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(buildTeamProgressMarkdown()); } catch (_e) { /* ignore */ }
      const orig = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied Markdown for Slack / Docs!';
      copyBtn.classList.add('copied');
      setTimeout(() => {
        copyBtn.textContent = orig;
        copyBtn.classList.remove('copied');
      }, 2500);
    });
  }

  const toggleBtn = document.getElementById('btnToggleExecLogTable');
  const tableWrap = document.getElementById('execLogTableWrap');
  if (toggleBtn && tableWrap) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = tableWrap.classList.toggle('collapsed');
      toggleBtn.setAttribute('aria-expanded', String(!isHidden));
      toggleBtn.textContent = isHidden ? '▶ Show Table (10 Steps)' : '▼ Hide / Show Table';
    });
  }

  mount.querySelectorAll('[data-exec-jump]').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (typeof onJumpToSection === 'function') onJumpToSection(btn.dataset.execJump);
    });
  });
}
