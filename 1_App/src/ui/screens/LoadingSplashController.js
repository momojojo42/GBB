// ============================================================================
// Gardens by the Bay — Cute Chibi Expedition Loading Splash Controller
// Extracted from src/main3d.js
// ============================================================================

export const LOADING_EXPLORER_TIPS = [
  '🟡 Crown (+350) • 🟣 Heritage (+200) • 🟢 Classic (+100)',
  '🤚 Snatch a relic near a bot to CHOPE it!',
  '🌙 Final 30s: Garden Rhapsody Night Show (1.5x Points)!',
  '💨 Dash through bridge Wind Rings for 1.45x speed!',
  '👑 01:00 Left: Watch for the +500 PTS Golden Orchid drop!'
];

export function createLoadingSplashController(urlScreenParam = null) {
  const overlayEl = document.getElementById('loadingSplashOverlay');
  const stageTextEl = document.getElementById('loadingStageText');
  const bytesPillEl = document.getElementById('loadingBytesPill');
  const percentBadgeEl = document.getElementById('loadingPercentBadge');
  const barFillEl = document.getElementById('loadingBarFill');
  const barRunnerEl = document.getElementById('loadingBarRunner');
  const tipTextEl = document.getElementById('loadingTipText');
  const startTime = performance.now();

  let tipIdx = 0;
  const tipInterval = tipTextEl
    ? setInterval(() => {
        tipIdx = (tipIdx + 1) % LOADING_EXPLORER_TIPS.length;
        tipTextEl.textContent = LOADING_EXPLORER_TIPS[tipIdx];
      }, 2100)
    : null;

  function setProgress(percent, stageText, loadedBytes, totalBytes) {
    const clamped = Math.max(4, Math.min(100, Math.round(percent)));
    if (stageTextEl && stageText) {
      stageTextEl.textContent = stageText;
    }
    if (percentBadgeEl) {
      percentBadgeEl.textContent = `${clamped}%`;
    }
    if (barFillEl) {
      barFillEl.style.width = `${clamped}%`;
    }
    if (barRunnerEl) {
      const runnerPos = Math.max(5, Math.min(96, clamped));
      barRunnerEl.style.left = `${runnerPos}%`;
    }
    if (bytesPillEl && typeof loadedBytes === 'number' && typeof totalBytes === 'number' && totalBytes > 0) {
      const loadedMB = (loadedBytes / 1048576).toFixed(1);
      const totalMB = (totalBytes / 1048576).toFixed(1);
      bytesPillEl.textContent = `${loadedMB} / ${totalMB} MB`;
    }
  }

  function markBundleLoaded(bundleKey) {
    if (!overlayEl) return;
    const pill = overlayEl.querySelector(`.loading-bundle-pill[data-bundle-key="${bundleKey}"]`);
    if (pill && !pill.classList.contains('is-loaded')) {
      pill.classList.add('is-loaded');
      const checkEl = pill.querySelector('.bundle-check');
      if (checkEl) checkEl.textContent = '✓';
    }
  }

  async function finishAndDismiss() {
    if (tipInterval) clearInterval(tipInterval);
    if (!overlayEl) return;

    setProgress(100, '✨ Gardens Ready!', 27974000, 27974000);
    ['buildings', 'characters', 'sculptures', 'treasures'].forEach(markBundleLoaded);

    // Ensure new users get a brief moment to enjoy the 100% completion state on fast cached loads
    const elapsed = performance.now() - startTime;
    const minDisplayMs = urlScreenParam ? 60 : 680;
    const remainingWait = Math.max(120, minDisplayMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, remainingWait));

    overlayEl.classList.add('is-fading-out');
    setTimeout(() => {
      overlayEl.classList.add('hidden');
    }, 450);
  }

  return {
    setProgress,
    markBundleLoaded,
    finishAndDismiss
  };
}
