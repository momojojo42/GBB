// ============================================================================
// Gardens by the Bay — Application State, Fullscreen & Mobile Viewport Manager
// Extracted from src/main3d.js for modular clarity
// ============================================================================

import { DEFAULT_LOOKDEV_SETTINGS, isAdminEnvironment } from './AdminAuthGuard.js';

export const urlScreenParam = new URLSearchParams(window.location.search).get('screen');
export const urlRoomParam = new URLSearchParams(window.location.search).get('room');
export const urlDemoShotParam = new URLSearchParams(window.location.search).get('demoShot');
const initialScreenState =
  urlScreenParam ||
  (isAdminEnvironment() ? 'gameplay' : urlRoomParam || urlDemoShotParam ? 'title' : 'welcome');

export const appState = {
  mode: 'race', // 'relaxed' | 'race' | 'party'
  isMultiplayerRoom: Boolean(urlRoomParam),
  multiplayerRoomCode: (urlRoomParam || 'GBB-88A').trim().toUpperCase(),
  multiplayerSlotIndex: 0,
  multiplayerPhase: 'idle', // 'idle' | 'lobby' | 'countdown' | 'racing'
  multiplayerAiBackfill: true,
  multiplayerHost: true,
  multiplayerPingMs: 14,
  multiplayerHumanCount: 1,
  multiplayerTransport: 'websocket',
  multiplayerSlots: [],
  multiplayerClient: null,
  remoteInterpolator: null,
  playerName: 'You (Host)',
  botDifficulty: 'normal', // 'chill' | 'normal' | 'pro'
  radarZoomMode: 'local', // 'local' (45m around player) | 'full' (entire peninsula)
  mapClickMode: 'teleport', // 'teleport' | 'walk'
  screen: initialScreenState, // 'title' | 'setup' | 'gameplay' | 'encyclopedia' | 'fullmap'
  milestoneStage: 'all', // 'm2_terrain' | 'm3_landmarks' | 'm4_characters' | 'all'
  cameraPresetId: 'player_follow',
  lookDev: JSON.parse(JSON.stringify(DEFAULT_LOOKDEV_SETTINGS)),
  elapsedSeconds: 0,
  titleLoopSeconds: 0,
  lastTitleFireworkSalvoIndex: -1,
  raceDurationSeconds: 180,
  remainingSeconds: 180,
  dayNightPhaseLabel: '☀️ Morning',
  isNightRhapsody: false,
  hasTriggeredGoldenVandaDrop: false,
  hasTriggeredRhapsodyDrop: false,
  manualLookDevOverride: false,
  selectedEncyclopediaCategory: 'collected_you',
  selectedRelicId: 1,
  playerCollectedOrder: [],
  isCollectionTrayCollapsed: false,
  gadgetPreviewUnlocked: true,
  activeGadgetId: null,
  comboCount: 0,
  bestComboCount: 0,
  comboTimer: 0,
  isGameOver: false,
  endGameReason: null, // 'times_up' | 'all_found' | 'manual_finale'
  fireworkAccumulator: 0,
  lastCountdownSecond: -1,
  isPortraitBlocked: false,
  isMobileLandscape: false,
  hasAutoCollapsedMobileTray: false
};

export function syncOverlayBodyClasses() {
  const welcomeEl = document.getElementById('screenWelcomeMapOverlay');
  const titleEl = document.getElementById('screenTitleOverlay');
  const endGameEl = document.getElementById('endGameBannerOverlay');
  const encycEl = document.getElementById('screenEncyclopediaOverlay');
  const relic3DEl = document.getElementById('screenRelic3DInspectorOverlay');
  const fullMapEl = document.getElementById('screenFullMapOverlay');

  const isWelcomeVisible = Boolean(welcomeEl && !welcomeEl.classList.contains('hidden')) || appState.screen === 'welcome';
  const isTitleVisible = Boolean(titleEl && !titleEl.classList.contains('hidden')) || appState.screen === 'title';
  const isMobileChoicesOpen = Boolean(titleEl && titleEl.classList.contains('mobile-choices-open'));
  const isEndGameVisible = Boolean(endGameEl && !endGameEl.classList.contains('hidden'));
  const isEncycVisible = Boolean(encycEl && !encycEl.classList.contains('hidden')) || appState.screen === 'encyclopedia';
  const isRelic3DVisible = Boolean(relic3DEl && !relic3DEl.classList.contains('hidden')) || appState.screen === 'relic3d';
  const isFullMapVisible = Boolean(fullMapEl && !fullMapEl.classList.contains('hidden')) || appState.screen === 'fullmap';

  const isBlockingTitleCardOpen =
    isWelcomeVisible || (isTitleVisible && (!appState.isMobileLandscape || isMobileChoicesOpen));

  document.body.classList.toggle('title-or-endgame-open', isBlockingTitleCardOpen || isEndGameVisible);
  document.body.classList.toggle(
    'modal-or-title-open',
    isBlockingTitleCardOpen || isEndGameVisible || isEncycVisible || isRelic3DVisible || isFullMapVisible
  );
  document.body.classList.toggle('mobile-vista-overview-open', isTitleVisible && appState.isMobileLandscape && !isMobileChoicesOpen);
}

let userExitedFullscreenManually = false;

export function hasUserExitedFullscreenManually() {
  return userExitedFullscreenManually;
}

export function setUserExitedFullscreenManually(val) {
  userExitedFullscreenManually = Boolean(val);
}

export function isFullscreenActive() {
  return Boolean(
    document.fullscreenElement ||
      document.webkitFullscreenElement ||
      (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches)
  );
}

export function syncFullscreenButtonState() {
  const isFs = isFullscreenActive();
  document.body.classList.toggle('is-fullscreen', isFs);
  const btn = document.getElementById('btnToggleFullscreen');
  if (btn) {
    btn.classList.toggle('active', isFs);
    btn.textContent = isFs ? '🗗 Exit Full' : '⛶ Full View';
    btn.setAttribute('aria-pressed', String(isFs));
  }
}

export async function requestMobileFullView(lockLandscape = true, onViewportChange = null) {
  const docEl = document.documentElement;
  try {
    if (!isFullscreenActive()) {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen({ navigationUI: 'hide' }).catch(() => docEl.requestFullscreen());
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    }
    if (lockLandscape && screen.orientation?.lock) {
      await screen.orientation.lock('landscape').catch(() => {});
    }
  } catch (_) {
    // Ignore on browsers (like iOS Safari) that restrict Fullscreen API on documentElement
  }
  window.scrollTo(0, 1);
  syncFullscreenButtonState();
  onViewportChange?.();
}

export async function toggleFullView(onViewportChange = null) {
  if (isFullscreenActive()) {
    userExitedFullscreenManually = true;
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    } catch (_) {}
    syncFullscreenButtonState();
    onViewportChange?.();
  } else {
    userExitedFullscreenManually = false;
    await requestMobileFullView(appState.isMobileLandscape || appState.isPortraitBlocked, onViewportChange);
  }
}

export function syncMobileViewportState({ getTerrainSys, updateHudStandings } = {}) {
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isMobileOrTablet = window.innerWidth <= 1024 || window.innerHeight <= 680 || isCoarse;
  const isPortrait = isMobileOrTablet && window.innerHeight > window.innerWidth;
  const isMobileLand = isMobileOrTablet && window.innerWidth >= window.innerHeight;
  appState.isPortraitBlocked = isPortrait;
  appState.isMobileLandscape = isMobileLand;
  document.body.classList.toggle('portrait-blocked', isPortrait);
  document.body.classList.toggle('mobile-landscape', isMobileLand);
  const gateEl = document.getElementById('mobilePortraitGateOverlay');
  if (gateEl) gateEl.setAttribute('aria-hidden', String(!isPortrait));

  if (isMobileLand) {
    // Force collection tray collapsed on mobile/tablet so 3-slot shelf never blocks 3D view
    appState.isCollectionTrayCollapsed = true;
    document.getElementById('hudCollectionCard')?.classList.add('collapsed');
    const btnTray = document.getElementById('btnToggleCollectionTray');
    if (btnTray) {
      btnTray.setAttribute('aria-expanded', 'false');
      btnTray.textContent = '▴';
    }
    // Automatically close topDevMenu if open
    const devMenu = document.getElementById('topDevMenu');
    if (devMenu && devMenu.hasAttribute('open')) devMenu.removeAttribute('open');
  }
  syncFullscreenButtonState();
  syncOverlayBodyClasses();
  if (getTerrainSys?.()) {
    updateHudStandings?.();
  }
}
