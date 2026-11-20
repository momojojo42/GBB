// ============================================================================
// Gardens by the Bay — Admin 3D Models, Animation Speed & Viewport Inspector
// (src/ui/Admin3DAnimInspectorTab.js)
// ============================================================================

import { TREASURES_CATALOG } from '../../data/TreasuresCatalog.js';

export function initAdminAnimState() {
  if (!window.__gbbAdminAnimState) {
    window.__gbbAdminAnimState = {
      paused: false,
      speed: 1.0,
      skyMode: 'auto',
      cleanView: false,
      selectedRelicId: 1
    };
  }
  return window.__gbbAdminAnimState;
}

export function toggleAdminCleanView(forceState, showToastFn) {
  const state = initAdminAnimState();
  state.cleanView = typeof forceState === 'boolean' ? forceState : !state.cleanView;
  document.body.classList.toggle('admin-clean-3d-view', state.cleanView);

  const headerBtn = document.getElementById('btnLookDevCleanView');
  if (headerBtn) {
    headerBtn.classList.toggle('active', state.cleanView);
    headerBtn.textContent = state.cleanView ? '👁️ Clean: ON' : '👁️ Clean [H]';
  }

  const tabBtn = document.getElementById('btnInspectCleanHud');
  if (tabBtn) {
    tabBtn.classList.toggle('active', state.cleanView);
    tabBtn.textContent = state.cleanView ? '👁️ Show HUD [H]' : '👁️ Hide HUD [H]';
  }

  if (typeof showToastFn === 'function') {
    showToastFn(
      state.cleanView
        ? '👁️ Clean 3D View ON — HUD cards hidden for unobstructed 3D inspection!'
        : '👁️ Gameplay HUD cards restored.'
    );
  }
  return state.cleanView;
}

export function renderAdminInspectTab(container, { settings, onChange, showToast }) {
  const state = initAdminAnimState();
  const relicOptions = TREASURES_CATALOG.map((t) => {
    const num = String(t.id).padStart(2, '0');
    const label = t.shortName || t.name;
    const sel = t.id === state.selectedRelicId ? 'selected' : '';
    return `<option value="${t.id}" ${sel}>#${num} ${t.icon} ${label} (${t.zoneName})</option>`;
  }).join('');

  container.innerHTML = `
    <div class="inspect-section-card">
      <div class="inspect-section-title">🎛️ VIEWPORT &amp; SIMULATION</div>
      <div class="inspect-btn-grid">
        <button type="button" class="inspect-action-btn ${state.paused ? 'active' : ''}" id="btnInspectFreezeWorld">
          ${state.paused ? '▶️ Resume World' : '⏸️ Freeze World'}
        </button>
        <button type="button" class="inspect-action-btn ${state.cleanView ? 'active' : ''}" id="btnInspectCleanHud">
          ${state.cleanView ? '👁️ Show HUD [H]' : '👁️ Hide HUD [H]'}
        </button>
      </div>
    </div>

    <div class="inspect-section-card">
      <div class="inspect-section-title">🎬 ANIMATION SPEED &amp; TRIGGERS</div>
      <div class="inspect-seg-row" role="group" aria-label="Animation Speed Multiplier">
        <button type="button" class="inspect-seg-btn ${state.speed === 0.25 ? 'active' : ''}" data-anim-speed="0.25">🐢 0.25x</button>
        <button type="button" class="inspect-seg-btn ${state.speed === 0.5 ? 'active' : ''}" data-anim-speed="0.5">🚶 0.5x</button>
        <button type="button" class="inspect-seg-btn ${state.speed === 1 ? 'active' : ''}" data-anim-speed="1">▶️ 1.0x</button>
        <button type="button" class="inspect-seg-btn ${state.speed === 2 ? 'active' : ''}" data-anim-speed="2">⚡ 2.0x</button>
      </div>
      <div class="inspect-seg-row inspect-3col">
        <button type="button" class="inspect-action-btn" id="btnInspectTriggerJump" title="Trigger Chibi 360° Spin-Jump">🤸 360° Jump</button>
        <button type="button" class="inspect-action-btn" id="btnInspectTriggerCar" title="Frame Player Next to Animated Shuttle Car">🚗 Shuttle Car</button>
        <button type="button" class="inspect-action-btn" id="btnInspectTriggerFinale" title="Trigger Victory Jump &amp; Fireworks">🎉 Finale FX</button>
      </div>
    </div>

    <div class="inspect-section-card">
      <div class="inspect-section-title">🌅 SKY &amp; ATMOSPHERE LOCK</div>
      <div class="inspect-seg-row" role="group" aria-label="Sky Lighting Override">
        <button type="button" class="inspect-seg-btn ${state.skyMode === 'auto' ? 'active' : ''}" data-sky-lock="auto">🔄 Auto 3m</button>
        <button type="button" class="inspect-seg-btn ${state.skyMode === 'day' ? 'active' : ''}" data-sky-lock="day">☀️ Day</button>
        <button type="button" class="inspect-seg-btn ${state.skyMode === 'sunset' ? 'active' : ''}" data-sky-lock="sunset">🌇 Sunset</button>
        <button type="button" class="inspect-seg-btn ${state.skyMode === 'night' ? 'active' : ''}" data-sky-lock="night">🌙 Night</button>
      </div>
    </div>

    <div class="inspect-section-card">
      <div class="inspect-section-title">💎 3D RELIC TURNTABLE &amp; TELEPORT (42 ITEMS)</div>
      <select id="adminInspectRelicSelect" class="lookdev-select">${relicOptions}</select>
      <div class="inspect-btn-grid">
        <button type="button" class="inspect-action-btn primary" id="btnInspectOpenTurntable">🔍 360° Turntable</button>
        <button type="button" class="inspect-action-btn" id="btnInspectTeleportRelic">📍 Teleport Here</button>
      </div>
    </div>
  `;

  container.querySelector('#btnInspectFreezeWorld')?.addEventListener('click', () => {
    state.paused = !state.paused;
    renderAdminInspectTab(container, { settings, onChange, showToast });
    showToast?.(state.paused ? '⏸️ World & AI Bots frozen — orbit camera freely!' : '▶️ World simulation resumed.');
  });

  container.querySelector('#btnInspectCleanHud')?.addEventListener('click', () => {
    toggleAdminCleanView(undefined, showToast);
  });

  container.querySelectorAll('[data-anim-speed]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.speed = parseFloat(btn.dataset.animSpeed) || 1.0;
      state.paused = false;
      renderAdminInspectTab(container, { settings, onChange, showToast });
      showToast?.(`🎬 Animation speed set to ${state.speed}x`);
    });
  });

  container.querySelector('#btnInspectTriggerJump')?.addEventListener('click', () => {
    window.gbbApp?.setScreenState?.('gameplay');
    window.gbbApp?.triggerPlayerJump?.();
    showToast?.('🤸 Triggered Chibi 360° Spin-Jump!');
  });

  container.querySelector('#btnInspectTriggerCar')?.addEventListener('click', () => {
    window.gbbApp?.setScreenState?.('gameplay');
    window.gbbApp?.framePlayerNextToCar?.();
    showToast?.('🚗 Framed Explorer next to Garden Shuttle Car!');
  });

  container.querySelector('#btnInspectTriggerFinale')?.addEventListener('click', () => {
    window.gbbApp?.setScreenState?.('gameplay');
    window.gbbApp?.triggerEndGame?.('victory');
    showToast?.('🎉 Triggered End-Game Celebration & Fireworks!');
  });

  container.querySelectorAll('[data-sky-lock]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.skyLock;
      state.skyMode = mode;
      if (mode === 'auto') {
        window.__gbbAdminSkyOverride = false;
        showToast?.('🔄 Dynamic 3-minute sun-to-night cycle resumed.');
      } else {
        window.__gbbAdminSkyOverride = mode;
        settings.lighting.preset = mode;
        onChange?.(settings);
        showToast?.(`🌅 Sky locked to ${mode.toUpperCase()} preset.`);
      }
      renderAdminInspectTab(container, { settings, onChange, showToast });
    });
  });

  const relicSelect = container.querySelector('#adminInspectRelicSelect');
  relicSelect?.addEventListener('change', (e) => {
    state.selectedRelicId = parseInt(e.target.value, 10) || 1;
  });

  container.querySelector('#btnInspectOpenTurntable')?.addEventListener('click', () => {
    window.gbbApp?.inspectRelic3D?.(state.selectedRelicId);
  });

  container.querySelector('#btnInspectTeleportRelic')?.addEventListener('click', () => {
    const t = TREASURES_CATALOG.find((item) => item.id === state.selectedRelicId);
    if (t) {
      window.gbbApp?.setScreenState?.('gameplay');
      window.gbbApp?.teleportPlayer?.(t.x, t.z + 2.2, 0);
      window.gbbApp?.setCameraPreset?.('player_follow');
      showToast?.(`📍 Teleported to #${String(t.id).padStart(2, '0')} ${t.shortName || t.name} (${t.x}, ${t.z})`);
    }
  });
}
