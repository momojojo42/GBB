/**
 * Admin Auth Guard & Shared LookDev Constants (src/core/AdminAuthGuard.js)
 * Separates default LookDev settings/presets from LookDevControlPanel.js so Vite
 * can lazy-load and code-split the LookDev Studio exclusively on Admin View (admin.html).
 * Also provides the testable Admin Auth Gate overlay for Milestone #4 (Authentication).
 */

export const DEFAULT_LOOKDEV_SETTINGS = {
  version: '2.0.0',
  pipeline: 'Vite + Three.js + Headless Blender 4.2 (.glb)',
  lighting: {
    preset: 'day', // 'day' | 'night'
    sunIntensity: 1.55,
    sunAzimuthDeg: 42,
    sunElevationDeg: 42,
    sunColor: '#FFF4DC',
    ambientIntensity: 0.45,
    exposure: 0.95,
    shadowSoftness: 0.75,
    nightBioluminescenceGlow: 1.75,
    bloomStrength: 0.12,
    envMapIntensity: 0.35,
  },
  textures: {
    terrainGrassSaturation: 1.15,
    foliageRoughness: 0.52,
    pathwayWarmth: 0.68,
    waterTurquoiseDepth: 0.65,
    waterRippleSpeed: 1.0,
    waterReflectivity: 0.72,
    conservatoryGlassOpacity: 0.44,
    conservatoryGlassMetalness: 0.35,
    supertreeCanopyVibrant: 1.25,
    dioramaBaseBevelTint: '#F4EFE6',
  },
  camera: {
    activeAnglePreset: 'live_player_chase',
    cameraFov: 44,
    chaseCamDistance: 9.2,
    chaseCamHeight: 4.2,
    chaseCamPitchDeg: -16,
    chaseCamLookAhead: 2.4,
    overviewPitchDeg: 42,
    overviewAzimuthDeg: -18,
    overviewDistance: 132,
  },
};

export const CAMERA_ANGLE_PRESETS = [
  {
    id: 'overview_peninsula',
    label: '1. Peninsula Overview (Screen 01/02)',
    mode: 'fixed',
    pos: [-24, 88, 108],
    target: [-4, 2, 0],
    fov: 42,
    lightingPreset: 'day',
  },
  {
    id: 'chase_supertree',
    label: '2. Zone 1: Supertree Grove Chase (Screen 03)',
    mode: 'fixed',
    pos: [9.5, 6.8, 20.5],
    target: [1.5, 3.2, 2.0],
    playerPos: [4, 11],
    playerRotY: Math.PI,
    fov: 44,
    lightingPreset: 'day',
  },
  {
    id: 'chase_conservatories',
    label: '3. Zone 2: Glass Conservatories (Screen 04)',
    mode: 'fixed',
    pos: [22, 8.5, -6],
    target: [25, 4.5, -30],
    playerPos: [22, -16],
    playerRotY: Math.PI * 0.95,
    fov: 44,
    lightingPreset: 'day',
  },
  {
    id: 'chase_dragonfly',
    label: '4. Zone 3: Dragonfly Lake & Heritage (Screen 05)',
    mode: 'fixed',
    pos: [-42, 7.8, -2],
    target: [-22, 3.2, -18],
    playerPos: [-34, -9],
    playerRotY: Math.PI * 0.72,
    fov: 44,
    lightingPreset: 'day',
  },
  {
    id: 'chase_meadow_planet',
    label: '5. Zone 4: Meadow & Planet Baby (Screen 06)',
    mode: 'fixed',
    pos: [-44, 6.2, 22],
    target: [-35, 2.6, 8],
    playerPos: [-40, 16],
    playerRotY: Math.PI * 0.85,
    fov: 42,
    lightingPreset: 'day',
  },
  {
    id: 'chase_wetlands_serene',
    label: '6. Zone 5: Wetlands & Serene Garden (Screen 07)',
    mode: 'fixed',
    pos: [48, 7.6, 22],
    target: [45, 3.2, -4],
    playerPos: [46, 12],
    playerRotY: Math.PI,
    fov: 44,
    lightingPreset: 'day',
  },
  {
    id: 'night_rhapsody',
    label: '7. Night "Garden Rhapsody" Show (Screen 08)',
    mode: 'fixed',
    pos: [10, 7.2, 20],
    target: [6, 5.5, -14],
    playerPos: [8, 10],
    playerRotY: Math.PI * 1.05,
    fov: 45,
    lightingPreset: 'night',
  },
  {
    id: 'race_4player_action',
    label: '8. 4-Player Timed Race vs AI Bots (Screen 09)',
    mode: 'fixed',
    pos: [12.5, 8.2, 21.5],
    target: [1.5, 2.6, 4.5],
    playerPos: [4, 11.5],
    playerRotY: Math.PI,
    fov: 45,
    lightingPreset: 'day',
  },
  {
    id: 'tactical_full_map',
    label: '9. Tactical Full-Map Tracker (Screen 11)',
    mode: 'fixed',
    pos: [0, 128, 42],
    target: [-2, 0, -2],
    fov: 40,
    lightingPreset: 'day',
  },
  {
    id: 'live_player_chase',
    label: '🎮 Live Player Follow Chase Cam',
    mode: 'follow',
    fov: 44,
  },
];

/**
 * Checks whether the current page is running in Admin / Debug mode.
 */
export function isAdminEnvironment() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  if (document.body?.dataset?.pageMode === 'admin') return true;
  const params = new URLSearchParams(window.location.search);
  return params.get('admin') === '1' || params.get('lookdev') === '1';
}

/**
 * Initializes the testable Admin Access Guard on admin.html.
 * Supports ?locked=1 or clicking #btnToggleAdminLockPreview to preview the future Milestone #4 Auth Gate.
 */
export function initAdminAccessGuard() {
  if (!isAdminEnvironment()) return;

  let overlay = document.getElementById('adminAuthGateOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'adminAuthGateOverlay';
    overlay.className = 'admin-auth-gate-overlay hidden';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Admin View Authentication Gate');
    overlay.innerHTML = `
      <div class="admin-auth-gate-card">
        <div class="admin-auth-lock-icon" aria-hidden="true">🔒</div>
        <span class="admin-auth-eyebrow">SECURITY GATE • POST-MVP MILESTONE #4 PREVIEW</span>
        <h2 class="admin-auth-title">Admin View Locked</h2>
        <p class="admin-auth-desc">
          This route (<code>/admin.html</code>) houses the <strong>Screen State Switcher (01–11)</strong>,
          <strong>Tactical Teleport Map</strong>, and <strong>Interactive LookDev Studio</strong> for internal debugging.
          In production, access requires an authenticated <code>role: "admin"</code> session claim (see <strong>Plan View → Roadmap #4</strong>).
        </p>
        <div class="admin-auth-actions">
          <button type="button" class="btn-admin-unlock" id="btnUnlockAdminDebug">
            🔓 Unlock for Local Debug Session
          </button>
          <a href="index.html" class="btn-admin-return-game">
            🎮 Return to Public Game Page
          </a>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  const setLockedState = (locked) => {
    overlay.classList.toggle('hidden', !locked);
  };

  const params = new URLSearchParams(window.location.search);
  if (params.get('locked') === '1') {
    setLockedState(true);
  }

  document.getElementById('btnToggleAdminLockPreview')?.addEventListener('click', () => {
    setLockedState(overlay.classList.contains('hidden'));
  });

  document.getElementById('btnUnlockAdminDebug')?.addEventListener('click', () => {
    setLockedState(false);
  });
}
