// ============================================================================
// Gardens by the Bay — Keyboard, Mobile Touch & DOM Event Wiring Controller
// Extracted from src/main3d.js
// ============================================================================
import * as THREE from 'three';
import { isAdminEnvironment } from './AdminAuthGuard.js';
import { getSmartNavigationWaypoint } from '../world/WorldPhysicsEngine.js';
import { getActiveMapId } from '../data/MapRegistry.js';
import { SoundFX } from '../audio/SoundFX.js';
import {
  isFullscreenActive,
  hasUserExitedFullscreenManually,
  setUserExitedFullscreenManually,
  syncOverlayBodyClasses
} from './AppState.js';
import {
  stepNudgeInCameraDirection,
  bindMobileTouchControls
} from './TouchJoystickAndButtons.js';
export { stepNudgeInCameraDirection, bindMobileTouchControls };
export function createInputAndTouchController({
  camera,
  appState,
  cameraControl,
  getTerrainSys,
  getExplorersSys,
  getClickMoveTarget,
  setClickMoveTarget,
  activateFollowCameraFromCurrentView,
  setCameraPreset,
  setScreenState,
  openPauseMenu,
  closePauseMenu,
  exitActiveMatch,
  setGameMode,
  setBotDifficulty,
  activateFieldGadgetForPlayer,
  triggerPlayerJump,
  triggerEndGame,
  dismissEndGameToFreeRoam,
  resetFullMatch,
  collectNearestRelicForPlayer,
  drawMiniRadar,
  renderEncyclopediaModal,
  requestMobileFullView,
  toggleFullView,
  showToast
}) {
  const keysPressed = { w: false, a: false, s: false, d: false, shift: false };
  const touchMoveState = { forward: 0, right: 0, active: false };
  const camForwardXZ = new THREE.Vector3();
  const camRightXZ = new THREE.Vector3();
  const worldUpVec = new THREE.Vector3(0, 1, 0);
  function setupMobileTouchControls() {
    bindMobileTouchControls({
      camera,
      appState,
      cameraControl,
      touchMoveState,
      getExplorersSys,
      setClickMoveTarget,
      activateFollowCameraFromCurrentView,
      triggerPlayerJump,
      collectNearestRelicForPlayer,
      setScreenState
    });
  }
  function bindKeyboardAndDomEvents() {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      // Focus trap when Game Paused modal is open
      if (appState.isPaused && e.key === 'Tab') {
        const pauseCard = document.getElementById('pauseExitCard');
        const focusables = pauseCard
          ? Array.from(pauseCard.querySelectorAll('button:not(.hidden):not([disabled])'))
          : [];
        if (focusables.length > 0) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        return;
      }

      if (e.key === 'Escape') {
        if (appState.isPaused) {
          e.preventDefault();
          closePauseMenu?.();
          return;
        }
        if (
          appState.screen === 'encyclopedia' ||
          appState.screen === 'relic3d' ||
          appState.screen === 'fullmap'
        ) {
          e.preventDefault();
          setScreenState('back');
          return;
        }
        if (appState.screen === 'title') {
          e.preventDefault();
          setScreenState('welcome');
          return;
        }
        if (appState.screen === 'welcome') {
          return;
        }
        if (appState.screen === 'gameplay') {
          e.preventDefault();
          const endGameEl = document.getElementById('endGameBannerOverlay');
          if (endGameEl && !endGameEl.classList.contains('hidden')) {
            exitActiveMatch?.('title');
          } else {
            openPauseMenu?.();
          }
          return;
        }
      }

      // Block gameplay movement and hotkeys while paused or on landing/title overlays
      if (appState.isPaused || appState.screen === 'welcome') return;

      const k = e.key.toLowerCase();
      if (appState.screen === 'gameplay') {
        if (k === 'w' || e.key === 'ArrowUp') keysPressed.w = true;
        if (k === 's' || e.key === 'ArrowDown') keysPressed.s = true;
        if (k === 'a' || e.key === 'ArrowLeft') keysPressed.a = true;
        if (k === 'd' || e.key === 'ArrowRight') keysPressed.d = true;
        if (e.key === 'Shift') keysPressed.shift = true;
      }
      if (k === 'm' && (appState.screen === 'gameplay' || appState.screen === 'fullmap')) {
        setScreenState(appState.screen === 'fullmap' ? 'back' : 'fullmap');
      } else if (
        k === 'c' &&
        (appState.screen === 'gameplay' || appState.screen === 'title' || appState.screen === 'encyclopedia')
      ) {
        setScreenState(appState.screen === 'encyclopedia' ? 'back' : 'encyclopedia');
      } else if (k === 'j' && appState.screen === 'gameplay') {
        triggerPlayerJump(appState.isGameOver);
      } else if (k === 'f' && appState.screen === 'gameplay' && isAdminEnvironment()) {
        triggerEndGame('manual_finale');
      } else if (e.code === 'Space' && appState.screen === 'gameplay') {
        e.preventDefault();
        collectNearestRelicForPlayer();
      } else if (
        appState.screen === 'gameplay' &&
        appState.isMultiplayerRoom &&
        (k === '1' || k === '2' || k === '3' || k === '4')
      ) {
        const emotes = { '1': '👋 Hello!', '2': '🤚 Chope!', '3': '🎉 Shiok!', '4': '🔥 Let\'s Go!' };
        window.__gbbTriggerMultiplayerEmote?.(emotes[k]);
      }
    });
    window.addEventListener('keyup', (e) => {
      const k = e.key.toLowerCase();
      if (k === 'w' || e.key === 'ArrowUp') keysPressed.w = false;
      if (k === 's' || e.key === 'ArrowDown') keysPressed.s = false;
      if (k === 'a' || e.key === 'ArrowLeft') keysPressed.a = false;
      if (k === 'd' || e.key === 'ArrowRight') keysPressed.d = false;
      if (e.key === 'Shift') keysPressed.shift = false;
    });
    document.querySelectorAll('.screen-nav-pills .nav-pill').forEach((btn) => {
      btn.addEventListener('click', () => setScreenState(btn.dataset.screen));
    });
    document.querySelectorAll('[data-close-screen]').forEach((btn) => {
      btn.addEventListener('click', () => setScreenState(btn.dataset.closeScreen));
    });
    document.getElementById('btnModeRelaxed')?.addEventListener('click', () => setGameMode('relaxed'));
    document.getElementById('btnModeRace')?.addEventListener('click', () => setGameMode('race'));
    document.querySelectorAll('[data-select-mode]').forEach((card) => {
      card.addEventListener('click', () => setGameMode(card.dataset.selectMode));
    });
    document.querySelectorAll('[data-bot-diff]').forEach((btn) => {
      btn.addEventListener('click', () => setBotDifficulty(btn.dataset.botDiff));
    });
    document.getElementById('btnToggleSound')?.addEventListener('click', (e) => {
      SoundFX.muted = !SoundFX.muted;
      const btn = e.currentTarget;
      btn.classList.toggle('muted', SoundFX.muted);
      btn.setAttribute('aria-pressed', String(!SoundFX.muted));
      const labelEl = btn.querySelector('.btn-label');
      const iconOn = btn.querySelector('.icon-sound-on');
      const iconOff = btn.querySelector('.icon-sound-off');
      if (labelEl) {
        labelEl.textContent = SoundFX.muted ? 'Muted' : 'Sound';
        iconOn?.classList.toggle('hidden', SoundFX.muted);
        iconOff?.classList.toggle('hidden', !SoundFX.muted);
      } else {
        btn.textContent = SoundFX.muted ? '🔇 Muted' : '🔊 SFX';
      }
      if (!SoundFX.muted) SoundFX.playGadgetActivate();
    });
    document.getElementById('btnToggleRadarZoom')?.addEventListener('click', (e) => {
      appState.radarZoomMode = appState.radarZoomMode === 'local' ? 'full' : 'local';
      e.currentTarget.textContent = appState.radarZoomMode === 'local' ? '🔍 Local 45m' : '🌐 Full Map';
      drawMiniRadar();
    });
    document.getElementById('btnToggleMapClickMode')?.addEventListener('click', (e) => {
      appState.mapClickMode = appState.mapClickMode === 'teleport' ? 'walk' : 'teleport';
      e.currentTarget.textContent =
        appState.mapClickMode === 'teleport'
          ? '⚡ Click Mode: Instant Teleport'
          : '🚶 Click Mode: Auto-Walk There';
    });
    document.getElementById('btnStartRaceFromTitle')?.addEventListener('click', () => {
      if (appState.isMobileLandscape && !isFullscreenActive() && !hasUserExitedFullscreenManually()) {
        requestMobileFullView(true);
      }
      if (appState.isMultiplayerRoom && typeof window.__gbbOpenPartyWaitingLobby === 'function') {
        window.__gbbOpenPartyWaitingLobby(appState.multiplayerRoomCode, true);
        return;
      }
      const selectedMode = appState.mode || 'race';
      resetFullMatch();
      setGameMode(selectedMode);
      setScreenState('gameplay');
      if (selectedMode === 'race' && typeof window.__gbbStartSoloRaceCountdown === 'function') {
        window.__gbbStartSoloRaceCountdown();
      }
      window.__gbbOnboarding?.onMatchStarted?.();
    });
    document.getElementById('btnStartRelaxedFromTitle')?.addEventListener('click', () => {
      if (appState.isMobileLandscape && !isFullscreenActive() && !hasUserExitedFullscreenManually()) {
        requestMobileFullView(true);
      }
      window.__gbbCancelCountdown?.();
      resetFullMatch();
      setGameMode('relaxed');
      setScreenState('gameplay');
      window.__gbbOnboarding?.onMatchStarted?.();
    });
    document.getElementById('btnOpenPassportFromTitle')?.addEventListener('click', () => setScreenState('encyclopedia'));
    document.getElementById('btnOpenVaultVistaMobile')?.addEventListener('click', () => setScreenState('encyclopedia'));
    document.getElementById('btnOpenChoicesMobile')?.addEventListener('click', () => {
      document.getElementById('screenTitleOverlay')?.classList.add('mobile-choices-open');
      syncOverlayBodyClasses();
    });
    document.getElementById('btnMinimizeChoicesMobile')?.addEventListener('click', () => {
      document.getElementById('screenTitleOverlay')?.classList.remove('mobile-choices-open');
      syncOverlayBodyClasses();
    });
    document.getElementById('btnOpenSetupFromTitle')?.addEventListener('click', () => setScreenState('setup'));
    document.getElementById('btnLaunchFromSetup')?.addEventListener('click', () => setScreenState('gameplay'));
    document.getElementById('btnBackToWelcomeFromTitle')?.addEventListener('click', () => {
      setScreenState('welcome');
    });
    const topBrandCluster = document.getElementById('topBrandCluster');
    const handleBrandClusterNav = () => {
      // Per UX review: Brand Title returns to Landing only on Start Setup (passive during gameplay to prevent accidental exit)
      if (appState.screen === 'title') {
        setScreenState('welcome');
      }
    };
    topBrandCluster?.addEventListener('click', handleBrandClusterNav);
    topBrandCluster?.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && appState.screen === 'title') {
        e.preventDefault();
        handleBrandClusterNav();
      }
    });
    document.getElementById('btnExitGameTop')?.addEventListener('click', () => {
      openPauseMenu?.();
    });
    document.getElementById('btnPauseResume')?.addEventListener('click', () => {
      closePauseMenu?.();
    });
    document.getElementById('btnPauseRestart')?.addEventListener('click', () => {
      closePauseMenu?.();
      resetFullMatch();
      if (
        appState.mode === 'race' &&
        !appState.isMultiplayerRoom &&
        typeof window.__gbbStartSoloRaceCountdown === 'function'
      ) {
        window.__gbbStartSoloRaceCountdown();
      }
    });
    document.getElementById('btnPauseToSetup')?.addEventListener('click', () => {
      exitActiveMatch?.('title');
    });
    document.getElementById('btnPauseToWelcome')?.addEventListener('click', () => {
      exitActiveMatch?.('welcome');
    });
    document.getElementById('pauseExitModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'pauseExitModalOverlay') {
        closePauseMenu?.();
      }
    });
    document.getElementById('btnOpenStartScreenTop')?.addEventListener('click', () => {
      setScreenState(appState.screen === 'title' ? 'gameplay' : 'title');
    });
    document.getElementById('btnTriggerFinaleTop')?.addEventListener('click', () => {
      document.getElementById('topDevMenu')?.removeAttribute('open');
      triggerEndGame('manual_finale');
    });
    document.addEventListener('click', (e) => {
      const devMenu = document.getElementById('topDevMenu');
      if (devMenu?.hasAttribute('open') && !devMenu.contains(e.target)) {
        devMenu.removeAttribute('open');
      }
    });
    document.getElementById('btnCollectNearest')?.addEventListener('click', () => collectNearestRelicForPlayer());
    document.getElementById('btnPlayerJumpHud')?.addEventListener('click', () => triggerPlayerJump(appState.isGameOver));
    document.getElementById('btnTriggerEndGameHud')?.addEventListener('click', () => triggerEndGame('manual_finale'));
    document.getElementById('btnEndGameSuperJump')?.addEventListener('click', () => triggerPlayerJump(true));
    document.getElementById('endGameBannerOverlay')?.addEventListener('click', (e) => {
      if (e.target.closest('#btnEndGameSuperJump')) {
        triggerPlayerJump(true);
      }
    });
    document.getElementById('btnEndGamePlayAgain')?.addEventListener('click', () => {
      resetFullMatch();
      if (
        appState.mode === 'race' &&
        !appState.isMultiplayerRoom &&
        typeof window.__gbbStartSoloRaceCountdown === 'function'
      ) {
        window.__gbbStartSoloRaceCountdown();
      }
    });
    document.getElementById('btnEndGameOpenEncyc')?.addEventListener('click', () => {
      document.getElementById('endGameBannerOverlay')?.classList.add('hidden');
      document.getElementById('gameplayHud')?.classList.remove('endgame-modal-open');
      setScreenState('encyclopedia');
    });
    document.getElementById('btnEndGameFreeRoam')?.addEventListener('click', () => dismissEndGameToFreeRoam());
    document.getElementById('btnEndGameFreeRoamClose')?.addEventListener('click', () => dismissEndGameToFreeRoam());
    document.getElementById('btnEndGameExitToSetup')?.addEventListener('click', () => exitActiveMatch?.('title'));
    document.getElementById('btnEndGameExitToWelcome')?.addEventListener('click', () => exitActiveMatch?.('welcome'));
    document.getElementById('btnOpenFullMapHud')?.addEventListener('click', () => setScreenState('fullmap'));
    function toggleCollectionScreen() {
      setScreenState(appState.screen === 'encyclopedia' ? 'back' : 'encyclopedia');
    }
    document.getElementById('btnOpenCollectionTop')?.addEventListener('click', () => toggleCollectionScreen());
    document.getElementById('btnOpenCollectionHud')?.addEventListener('click', () => setScreenState('encyclopedia'));
    document.getElementById('btnToggleFullscreen')?.addEventListener('click', () => toggleFullView());
    const btnToggleCollectionTray = document.getElementById('btnToggleCollectionTray');
    btnToggleCollectionTray?.addEventListener('click', (e) => {
      const isCollapsed = !appState.isCollectionTrayCollapsed;
      appState.isCollectionTrayCollapsed = isCollapsed;
      const card = document.getElementById('hudCollectionCard');
      if (card) card.classList.toggle('collapsed', isCollapsed);
      btnToggleCollectionTray.setAttribute('aria-expanded', String(!isCollapsed));
      e.currentTarget.textContent = isCollapsed ? '▴' : '▾';
    });
    document.querySelectorAll('#quickbarAngleButtons .angle-chip').forEach((btn) => {
      btn.addEventListener('click', () => setCameraPreset(btn.dataset.preset, false));
    });
    document.getElementById('btnToggleGadgetPreview')?.addEventListener('click', () => {
      activateFieldGadgetForPlayer('turbo_boots', 12);
      showToast('⚡ Gadgets Ready! [1] Turbo • [2] Magnet • [3] Decoy');
    });
    document.querySelectorAll('.gadget-pill').forEach((pill) => {
      pill.addEventListener('click', () => activateFieldGadgetForPlayer(pill.dataset.gadget, 10));
    });
    document.querySelectorAll('#encycFilterBar .filter-chip, #encycFilterBar [data-encyc-filter]').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#encycFilterBar .filter-chip, #encycFilterBar [data-encyc-filter]').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        appState.selectedEncyclopediaCategory = chip.dataset.encycFilter || chip.dataset.cat || 'all';
        renderEncyclopediaModal();
      });
    });
    const btnTeleportRelic = document.getElementById('btnTeleportToRelic');
    if (btnTeleportRelic && !isAdminEnvironment()) {
      btnTeleportRelic.style.display = 'none';
    }
    btnTeleportRelic?.addEventListener('click', () => {
      const terrainSys = getTerrainSys();
      const explorersSys = getExplorersSys();
      if (!isAdminEnvironment() || !terrainSys || !explorersSys) return;
      const relic = terrainSys.treasuresList.find((r) => r.id === appState.selectedRelicId);
      if (relic) {
        explorersSys.teleportPlayer(relic.position.x + 2, relic.position.z + 2);
        setCameraPreset('player_follow');
        setScreenState('gameplay');
        showToast(`📍 Teleported to #${String(relic.id).padStart(2, '0')} ${relic.name}!`);
      }
    });
    document.getElementById('btnResetMatch')?.addEventListener('click', () => resetFullMatch());
    document.getElementById('btnAdminResetMatch')?.addEventListener('click', () => resetFullMatch());
    document.getElementById('btnLockLandscapeFullscreen')?.addEventListener('click', async () => {
      setUserExitedFullscreenManually(false);
      await requestMobileFullView(true);
      const sub = document.getElementById('portraitGateSub');
      if (sub && appState.isPortraitBlocked) {
        sub.textContent = 'Rotate horizontally to resume Full View.';
      }
    });
    // Automatically enter Full View on the first user gesture during mobile landscape
    const handleFirstLandscapeFullViewGesture = (e) => {
      if (!appState.isMobileLandscape || isFullscreenActive() || hasUserExitedFullscreenManually()) return;
      if (e.target && e.target.closest && e.target.closest('#btnToggleFullscreen')) return;
      requestMobileFullView(true);
    };
    window.addEventListener('pointerup', handleFirstLandscapeFullViewGesture, { passive: true });
    window.addEventListener('click', handleFirstLandscapeFullViewGesture, { passive: true });
    document.querySelectorAll('#tacticalTeleportButtons button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const zone = btn.dataset.tpZone;
        const isSBG = getActiveMapId() === 'sbg';
        const coords = isSBG
          ? {
              supertree: [5.0, 32.0],
              conservatories: [-18.0, 2.0],
              dragonfly: [6.0, 42.4],
              planet: [-4.0, -4.4],
              wetlands: [1.0, -35.0]
            }[zone] || [5.0, 32.0]
          : {
              supertree: [0, 4],
              conservatories: [22, -26],
              dragonfly: [-30, -12],
              planet: [-34, 12],
              wetlands: [44, 10]
            }[zone] || [0, 0];
        getExplorersSys()?.teleportPlayer(coords[0], coords[1]);
        setCameraPreset('player_follow');
        setScreenState('gameplay');
      });
    });
  }
  function computePlayerMovementVector() {
    const explorersSys = getExplorersSys();
    const clickMoveTarget = getClickMoveTarget();
    let inputForward = (keysPressed.w ? 1 : 0) - (keysPressed.s ? 1 : 0) + touchMoveState.forward;
    let inputRight = (keysPressed.d ? 1 : 0) - (keysPressed.a ? 1 : 0) + touchMoveState.right;
    inputForward = Math.max(-1, Math.min(1, inputForward));
    inputRight = Math.max(-1, Math.min(1, inputRight));
    let moveX = 0;
    let moveZ = 0;
    if (inputForward !== 0 || inputRight !== 0) {
      document.getElementById('mobileMoveHintPill')?.classList.add('is-dismissed');
      setClickMoveTarget(null);
      activateFollowCameraFromCurrentView();
      camera.getWorldDirection(camForwardXZ);
      camForwardXZ.y = 0;
      if (camForwardXZ.lengthSq() < 0.0001) {
        camForwardXZ.set(-Math.sin(cameraControl.followYaw), 0, -Math.cos(cameraControl.followYaw));
      } else {
        camForwardXZ.normalize();
      }
      camRightXZ.crossVectors(camForwardXZ, worldUpVec).normalize();
      moveX = camForwardXZ.x * inputForward + camRightXZ.x * inputRight;
      moveZ = camForwardXZ.z * inputForward + camRightXZ.z * inputRight;
      const len = Math.hypot(moveX, moveZ);
      if (len > 0.0001) {
        moveX /= len;
        moveZ /= len;
      }
    } else if (clickMoveTarget && explorersSys) {
      const you = explorersSys.getStandings().find((s) => s.id === 'you');
      if (you) {
        const totalDist = Math.hypot(
          clickMoveTarget.x - you.position.x,
          clickMoveTarget.z - you.position.z
        );
        if (totalDist > 0.65) {
          document.getElementById('mobileMoveHintPill')?.classList.add('is-dismissed');
          activateFollowCameraFromCurrentView();
          const wp = getSmartNavigationWaypoint(
            you.position.x,
            you.position.z,
            clickMoveTarget.x,
            clickMoveTarget.z
          );
          const dx = wp.x - you.position.x;
          const dz = wp.z - you.position.z;
          const wpDist = Math.max(0.01, Math.hypot(dx, dz));
          moveX = dx / wpDist;
          moveZ = dz / wpDist;
        } else {
          setClickMoveTarget(null);
        }
      }
    }
    return {
      moveX,
      moveZ,
      isSprinting: Boolean(keysPressed.shift),
      sprintMult: keysPressed.shift ? 1.32 : 1.0
    };
  }
  return {
    keysPressed,
    touchMoveState,
    setupMobileTouchControls,
    bindKeyboardAndDomEvents,
    computePlayerMovementVector
  };
}
