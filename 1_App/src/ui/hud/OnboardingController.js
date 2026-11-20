// ============================================================================
// Gardens by the Bay — Simple 3-Step Interactive Onboarding Coach Controller
// (src/ui/OnboardingController.js)
// ============================================================================

import { SoundFX } from '../../audio/SoundFX.js';

const STORAGE_KEY = 'gbb_onboarding_done_v1';

const ONBOARDING_STEPS = [
  {
    stepNum: 1,
    icon: '🕹️',
    title: 'Move Around the Park',
    desktopHtml: 'Use <strong>WASD / Arrows</strong> or <strong>Click the ground</strong> to run!',
    mobileHtml: 'Drag the <strong>🕹️ Move Pad</strong> or <strong>Tap the ground</strong> to run!',
    nextLabel: 'Next →',
    spotlightDesktopId: null,
    spotlightMobileId: 'mobileJoystickZone'
  },
  {
    stepNum: 2,
    icon: '💎',
    title: 'Snatch Glowing Keepsakes',
    desktopHtml: 'Follow gold dots on your <strong>🧭 Radar</strong> &amp; walk into any glowing relic!',
    mobileHtml: 'Follow gold dots on your <strong>🧭 Radar</strong> &amp; walk into any glowing relic!',
    nextLabel: 'Next →',
    spotlightDesktopId: 'miniRadarCard',
    spotlightMobileId: 'miniRadarCard'
  },
  {
    stepNum: 3,
    icon: '🧸',
    title: 'Play 3D Toys & Night Show!',
    desktopHtml: 'Tap items in your <strong>🎒 Keepsakes Vault</strong> to play their 3D toy! <strong>🎆 Night = 1.5× PTS!</strong>',
    mobileHtml: 'Tap items in your <strong>🎒 Vault</strong> to play their 3D toy! <strong>🎆 Night = 1.5× PTS!</strong>',
    nextLabel: 'Got It! 🎉',
    spotlightDesktopId: 'hudCollectionCard',
    spotlightMobileId: 'hudCollectionCard'
  }
];

export function createOnboardingController({ appState, getTerrainSys, showToast }) {
  let isActive = false;
  let pendingStartAfterCountdown = false;
  let currentStepIdx = 0;
  let spawnOrigin = null;
  let initialRelicCount = 0;
  let stepElapsedSec = 0;

  function isCompletedInStorage() {
    try {
      return window.localStorage?.getItem(STORAGE_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function markCompletedInStorage() {
    try {
      window.localStorage?.setItem(STORAGE_KEY, '1');
    } catch (_) {
      // Ignore storage restrictions
    }
  }

  function clearSpotlightRings() {
    ['mobileJoystickZone', 'miniRadarCard', 'hudCollectionCard'].forEach((id) => {
      document.getElementById(id)?.classList.remove('onboarding-spotlight-ring');
    });
  }

  function syncCardVisibility(visible, focusButton = false) {
    const card = document.getElementById('onboardingCoachCard');
    if (!card) return;

    card.classList.toggle('hidden', !visible);

    if (typeof card.showPopover === 'function' && typeof card.hidePopover === 'function') {
      try {
        if (visible && !card.matches(':popover-open')) {
          card.showPopover();
        } else if (!visible && card.matches(':popover-open')) {
          card.hidePopover();
        }
      } catch (_) {
        // Fallback to .hidden class if popover state transitions throw
      }
    }

    if (visible && focusButton) {
      const nextBtn = document.getElementById('btnOnboardingNext');
      nextBtn?.focus?.({ preventScroll: true });
    }
  }

  function getMyCollectedCount() {
    const terrainSys = getTerrainSys?.();
    if (!terrainSys?.treasuresList) return 0;
    return terrainSys.treasuresList.filter((t) => t.collectedBy === 'you').length;
  }

  function renderCurrentStep(focusButton = false) {
    const step = ONBOARDING_STEPS[currentStepIdx];
    if (!step) return;

    const isTouch = Boolean(appState.isMobileTouch || appState.isMobileLandscape);
    const badgeEl = document.getElementById('onboardingStepBadge');
    const iconEl = document.getElementById('onboardingStepIcon');
    const titleEl = document.getElementById('onboardingStepTitle');
    const descEl = document.getElementById('onboardingStepDesc');
    const nextBtn = document.getElementById('btnOnboardingNext');
    const dotsWrap = document.getElementById('onboardingStepDots');

    if (badgeEl) badgeEl.textContent = `✨ QUICK GUIDE • ${step.stepNum} / ${ONBOARDING_STEPS.length}`;
    if (iconEl) iconEl.textContent = step.icon;
    if (titleEl) titleEl.textContent = step.title;
    if (descEl) descEl.innerHTML = isTouch ? step.mobileHtml : step.desktopHtml;
    if (nextBtn) nextBtn.textContent = step.nextLabel;

    if (dotsWrap) {
      const dots = dotsWrap.querySelectorAll('.ob-dot');
      dots.forEach((d, idx) => {
        d.classList.toggle('active', idx === currentStepIdx);
        d.classList.toggle('done', idx < currentStepIdx);
      });
    }

    clearSpotlightRings();
    const targetId = isTouch ? step.spotlightMobileId : step.spotlightDesktopId;
    if (targetId) {
      document.getElementById(targetId)?.classList.add('onboarding-spotlight-ring');
    }

    syncCardVisibility(true, focusButton);
  }

  function startOnboarding(forceReplay = false, focusButton = false) {
    if (!forceReplay && isCompletedInStorage()) return;

    if (appState.isStartingCountdownActive) {
      pendingStartAfterCountdown = true;
      return;
    }

    pendingStartAfterCountdown = false;
    isActive = true;
    currentStepIdx = 0;
    stepElapsedSec = 0;
    spawnOrigin = null;
    initialRelicCount = getMyCollectedCount();

    renderCurrentStep(focusButton);
  }

  function completeOnboarding(showCompleteToast = true) {
    isActive = false;
    pendingStartAfterCountdown = false;
    clearSpotlightRings();
    syncCardVisibility(false, false);
    markCompletedInStorage();
    if (showCompleteToast) {
      showToast?.('🎉 You’re all set! Snatch all 42 Singapore Keepsakes!');
    }
  }

  function advanceStep(fromAutoTrigger = false) {
    if (!isActive) return;
    if (fromAutoTrigger) {
      SoundFX.playClick?.();
    }
    if (currentStepIdx < ONBOARDING_STEPS.length - 1) {
      currentStepIdx += 1;
      stepElapsedSec = 0;
      initialRelicCount = getMyCollectedCount();
      renderCurrentStep(!fromAutoTrigger);
    } else {
      completeOnboarding(true);
    }
  }

  function onMatchStarted() {
    if (isCompletedInStorage()) return;
    if (appState.isStartingCountdownActive) {
      pendingStartAfterCountdown = true;
      syncCardVisibility(false, false);
    } else {
      startOnboarding(false, false);
    }
  }

  function update(dt, youStanding) {
    // Keep Start Card's Step 1 pill tailored to Touch vs Desktop
    const startMoveText = document.getElementById('startHowToMoveText');
    if (startMoveText) {
      const nextLabel =
        appState.isMobileTouch || appState.isMobileLandscape
          ? '🕹️ Drag Pad / Tap'
          : '🕹️ WASD / Click Ground';
      if (startMoveText.textContent !== nextLabel) {
        startMoveText.textContent = nextLabel;
      }
    }

    if (appState.screen !== 'gameplay' || appState.isGameOver) {
      if (isActive) {
        syncCardVisibility(false, false);
        clearSpotlightRings();
      }
      return;
    }

    if (pendingStartAfterCountdown && !appState.isStartingCountdownActive) {
      startOnboarding(true, false);
      return;
    }

    if (!isActive) return;

    // Ensure card is visible when returning to gameplay screen
    const card = document.getElementById('onboardingCoachCard');
    if (card?.classList.contains('hidden')) {
      renderCurrentStep(false);
    }

    stepElapsedSec += dt;

    if (currentStepIdx === 0 && youStanding?.position) {
      if (!spawnOrigin) {
        spawnOrigin = { x: youStanding.position.x, z: youStanding.position.z };
      } else {
        const dx = youStanding.position.x - spawnOrigin.x;
        const dz = youStanding.position.z - spawnOrigin.z;
        if (Math.hypot(dx, dz) >= 2.2) {
          advanceStep(true);
        }
      }
    } else if (currentStepIdx === 1) {
      const myCountNow = getMyCollectedCount();
      if (myCountNow > initialRelicCount) {
        advanceStep(true);
      }
    } else if (currentStepIdx === 2) {
      if (stepElapsedSec >= 10) {
        completeOnboarding(false);
      }
    }
  }

  function bindEvents({ setScreenState }) {
    document.getElementById('btnOnboardingNext')?.addEventListener('click', () => {
      advanceStep(false);
    });
    document.getElementById('btnOnboardingSkip')?.addEventListener('click', () => {
      completeOnboarding(false);
    });
    document.getElementById('btnOpenOnboardingTop')?.addEventListener('click', () => {
      if (appState.screen !== 'gameplay') {
        setScreenState?.('gameplay');
      }
      window.__gbbCancelCountdown?.();
      startOnboarding(true, true);
    });
  }

  return {
    startOnboarding,
    completeOnboarding,
    onMatchStarted,
    update,
    bindEvents,
    isActive: () => isActive
  };
}
