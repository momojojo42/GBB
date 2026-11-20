// ============================================================================
// Gardens by the Bay — Frame Loop Runner, Viewport Resizer & Async World Bootstrap
// (src/core/FrameLoopRunner.js)
// Extracted from src/main3d.js
// ============================================================================

import * as THREE from 'three';
import {
  computeDayNightCycleState,
  computeTitleShowcaseCycleState,
  TITLE_SHOWCASE_LOOP_SECONDS
} from './EnvironmentAndPostFX.js';
import { loadAllBlenderGLBAssets } from './AssetLoader.js';
import { buildTerrainAndTreasures } from '../world/TerrainAndTreasuresBuilder.js';
import { buildAllLandmarks } from '../world/LandmarksBuilder.js';
import { createExplorersSystem } from '../entities/CharacterAndBotBuilder.js';
import { createLoadingSplashController } from '../ui/screens/LoadingSplashController.js';
import { createRemoteTransformInterpolator } from '../multiplayer/RemoteTransformInterpolator.js';
import { createMultiplayerClient } from '../multiplayer/MultiplayerClient.js';
import { createMultiplayerPlazaLobby3D } from '../ui/screens/MultiplayerPlazaLobby3D.js';
import { createMultiplayerLobbyController } from '../ui/screens/MultiplayerLobbyModal.js';
import { createMapWorldSwitcherController } from '../ui/screens/MapWorldSwitcherController.js';

export function createFrameLoopRunner({
  renderer,
  scene,
  camera,
  postFX,
  matLib,
  appState,
  urlScreenParam,
  cameraControl,
  setCameraPreset,
  updateCamera,
  inputController,
  coordinator,
  onboardingSys,
  getSystems,
  setSystems,
  getClickMoveTarget,
  handleTreasureCollected,
  handleArcadeEvent,
  handlePhysicsBlocked,
  updateMidMatchAndPlayerHazards,
  updateHudStandings,
  updateClockDigits,
  drawMiniRadar,
  drawTacticalFullMap,
  updateWorldLabels,
  resizeRelic3DStage,
  openRelic3DInspector,
  updateAndRenderRelic3DStage,
  syncViewport,
  showToast
}) {
  const clock = new THREE.Clock();
  let hudRefreshAccumulator = 0;
  let lobby3DSys = null;
  let isTabHidden = typeof document !== 'undefined' && document.hidden;

  function stepSimulation(dt, rawDt = dt) {
    const { terrainSys, landmarksSys, explorersSys } = getSystems();
    const clickMoveTarget = getClickMoveTarget();
    if (!terrainSys || !landmarksSys || !explorersSys || appState.isPortraitBlocked) return;

    if (dt === 0) {
      const standingsNow = explorersSys.getStandings();
      updateCamera(rawDt || 0.016, standingsNow.find((s) => s.id === 'you'), clickMoveTarget);
      if (appState.screen === 'gameplay') updateWorldLabels(standingsNow);
      return;
    }

    const isTitleScreen = appState.screen === 'title' || appState.screen === 'welcome';
    const isMpWaiting =
      (appState.isMultiplayerRoom &&
        (appState.multiplayerPhase === 'lobby' || appState.multiplayerPhase === 'countdown')) ||
      Boolean(appState.isStartingCountdownActive);

    if (!isTitleScreen && !isMpWaiting) {
      appState.elapsedSeconds += dt;
    }

    // 1. Camera-Relative Player Input & Combo Decay
    const { moveX, moveZ, isSprinting, sprintMult } = inputController.computePlayerMovementVector();
    if (appState.comboTimer > 0) {
      appState.comboTimer = Math.max(0, appState.comboTimer - dt);
      if (appState.comboTimer === 0) appState.comboCount = 0;
    }

    // 2. Dynamic Day-to-Night Cycle (Title Showcase Loop vs Match Cycle)
    const raceDuration = appState.raceDurationSeconds || 180;
    let cycleState;
    if (isTitleScreen) {
      appState.titleLoopSeconds = (appState.titleLoopSeconds || 0) + dt;
      cycleState =
        postFX.updateTitleShowcaseCycle?.(appState.titleLoopSeconds, TITLE_SHOWCASE_LOOP_SECONDS) ||
        computeTitleShowcaseCycleState(appState.titleLoopSeconds, TITLE_SHOWCASE_LOOP_SECONDS);
      coordinator.applyCycleLightingToScene(cycleState, cycleState.progress);
      coordinator.syncTitleShowcaseFrame?.(dt, cycleState);
    } else {
      const isRace = appState.mode === 'race';
      appState.remainingSeconds = isRace
        ? Math.max(0, raceDuration - appState.elapsedSeconds)
        : raceDuration - (appState.elapsedSeconds % raceDuration);
      const cycleProgress = isRace
        ? Math.min(1, Math.max(0, appState.elapsedSeconds / raceDuration))
        : (appState.elapsedSeconds % raceDuration) / raceDuration;
      cycleState =
        postFX.updateDayNightCycle?.(cycleProgress, appState.elapsedSeconds) ||
        computeDayNightCycleState(cycleProgress, appState.elapsedSeconds);
      coordinator.applyCycleLightingToScene(cycleState, cycleProgress);
    }

    // 3. Step Terrain, Landmarks & Explorers Simulation
    const animElapsed = isTitleScreen ? appState.titleLoopSeconds : appState.elapsedSeconds;
    const canScore = !isTitleScreen && !isMpWaiting;
    terrainSys.update(dt, animElapsed);
    landmarksSys.update(dt, animElapsed, cycleState);
    lobby3DSys?.update(dt, animElapsed);

    const newlyCollected = explorersSys.update(dt, animElapsed, {
      moveX: moveX * sprintMult,
      moveZ: moveZ * sprintMult,
      treasuresList: terrainSys.treasuresList,
      dynamicObstacles: terrainSys.miniatureCars,
      remoteInterpolator: appState.remoteInterpolator,
      isMovementLocked: isMpWaiting,
      onCollectTreasure: (treasureId, collectorId) => {
        if (canScore) handleTreasureCollected(treasureId, collectorId, false);
      },
      onArcadeEvent: (evt) => {
        if (canScore) handleArcadeEvent(evt);
      },
      onPhysicsBlocked: (res) => handlePhysicsBlocked(res, moveX, moveZ, isSprinting)
    });

    if (newlyCollected?.length) updateHudStandings();

    // Compute standings once per frame and reuse across multiplayer, hazards, camera & world labels
    const standingsNow = explorersSys.getStandings();
    if (appState.isMultiplayerRoom && !isTitleScreen) {
      appState.multiplayerClient?.emitLocalTransform(dt, standingsNow);
    }

    const youStanding = standingsNow.find((s) => s.id === 'you');
    updateMidMatchAndPlayerHazards(dt, youStanding, moveX, moveZ);
    onboardingSys?.update(dt, youStanding);

    // 4. Camera, Periodic HUD Refresh & Projected World Labels
    updateCamera(dt, youStanding, getClickMoveTarget());

    hudRefreshAccumulator += dt;
    if (hudRefreshAccumulator >= 0.2) {
      hudRefreshAccumulator = 0;
      updateClockDigits();
      drawMiniRadar();
      if (appState.screen === 'fullmap') drawTacticalFullMap();
    }

    if (appState.screen === 'gameplay') {
      updateWorldLabels(standingsNow);
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (isTabHidden) return;

    const rawDt = Math.min(clock.getDelta(), 0.1);
    const adminAnim = window.__gbbAdminAnimState;
    const isSoloPaused = Boolean(
      appState.isPaused && appState.screen === 'gameplay' && !appState.isMultiplayerRoom
    );
    const simDt = isSoloPaused
      ? 0
      : adminAnim
        ? adminAnim.paused
          ? 0
          : rawDt * (adminAnim.speed ?? 1)
        : rawDt;
    stepSimulation(simDt, rawDt);

    if (appState.screen === 'relic3d') {
      updateAndRenderRelic3DStage(rawDt);
    } else {
      postFX.render();
    }
  }

  function handleViewportResize() {
    syncViewport();
    const w = Math.max(1, window.innerWidth);
    const h = Math.max(1, window.innerHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    postFX.resize(w, h);
    if (appState.screen === 'relic3d') resizeRelic3DStage();
    if (appState.screen === 'gameplay') updateWorldLabels();
  }

  function bindViewportListeners() {
    window.addEventListener('resize', handleViewportResize);
    window.visualViewport?.addEventListener('resize', handleViewportResize);
    document.addEventListener('fullscreenchange', handleViewportResize);
    document.addEventListener('webkitfullscreenchange', handleViewportResize);
    document.addEventListener('visibilitychange', () => {
      isTabHidden = document.hidden;
      if (!isTabHidden) clock.getDelta(); // flush background delta spike on resume
    });
    window.addEventListener('orientationchange', () => {
      handleViewportResize();
      setTimeout(handleViewportResize, 120);
      setTimeout(handleViewportResize, 350);
    });
  }

  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  function setupMultiplayerClient(terrainSys, explorersSys) {
    const remoteInterpolator = createRemoteTransformInterpolator();
    appState.remoteInterpolator = remoteInterpolator;
    const client = createMultiplayerClient({
      appState,
      interpolator: remoteInterpolator,
      onRoomStateUpdated: (room, mySlotIdx) => {
        explorersSys.syncMultiplayerRoomSlots?.(room, mySlotIdx, client.slotIndexToExplorerId, client.isHost());
        updateHudStandings();
        window.__gbbOnMultiplayerRoomUpdated?.(room, mySlotIdx);
      },
      onCountdownStarted: (room, mySlotIdx) => {
        terrainSys.resetAllTreasures();
        explorersSys.resetMatch();
        explorersSys.syncMultiplayerRoomSlots?.(room, mySlotIdx, client.slotIndexToExplorerId, client.isHost());
        explorersSys.alignExplorersOnStartingLine?.();
        appState.elapsedSeconds = 0;
        appState.remainingSeconds = appState.raceDurationSeconds || 180;
        updateClockDigits();
        updateHudStandings();
        window.__gbbOnMultiplayerCountdownStarted?.(room, mySlotIdx);
      },
      onRaceStarted: (room, mySlotIdx) => {
        appState.elapsedSeconds = 0;
        updateClockDigits();
        updateHudStandings();
        window.__gbbOnMultiplayerRaceStarted?.(room, mySlotIdx);
      },
      onRemoteRelicLocked: ({ relicId, explorerId, collectorName, points }) => {
        if (explorerId !== 'you') {
          handleTreasureCollected(relicId, explorerId, false, true, points, collectorName);
        }
      },
      onRelicChopedAlert: ({ ownerName }) => showToast(`🤚 CHOPED by ${ownerName}! Too slow lah!`),
      onRemoteEmote: ({ explorerId, emoteText }) => {
        explorersSys.triggerExplorerEmote?.(explorerId, emoteText);
        updateWorldLabels();
      }
    });
    appState.multiplayerClient = client;
    client.ensureConnected();
  }

  function applyDemoShotPreset(demoShotParam) {
    const demoPresets = {
      screen1: { ids: [1, 2, 3], screen: 'gameplay', toast: '✨ Latest 3 Relics Collected — Click any slot to Drag & Rotate in 360° 3D!' },
      screen2: { ids: [1, 2, 3, 4, 5, 8, 9, 10], screen: 'encyclopedia' },
      screen3: { ids: [1, 2, 3, 4, 5, 8, 9, 10], screen: 'relic3d', relicId: 1 }
    };
    const preset = demoPresets[demoShotParam];
    if (!preset) return;
    preset.ids.forEach((id) => handleTreasureCollected(id, 'you', true));
    if (preset.relicId) appState.selectedRelicId = preset.relicId;
    coordinator.setScreenState(preset.screen);
    if (preset.toast) {
      const toastEl = document.getElementById('hudToastBanner');
      if (toastEl) toastEl.textContent = preset.toast;
    }
  }

  async function initWorldV2() {
    const loadingSplash = createLoadingSplashController(urlScreenParam);
    showToast('📦 Loading 3D World...');

    const glbRegistry = await loadAllBlenderGLBAssets({
      onProgress: ({ ratio, loadedBytes, totalBytes, completedKeys, activeLabel }) => {
        loadingSplash.setProgress(4 + ratio * 78, `📦 Loading ${activeLabel || '3D Assets'}...`, loadedBytes, totalBytes);
        completedKeys?.forEach((k) => loadingSplash.markBundleLoaded(k));
      },
      onBundleComplete: (key) => loadingSplash.markBundleLoaded(key)
    });
    setSystems({ glbRegistryRef: glbRegistry });

    loadingSplash.setProgress(86, '🌿 Sculpting Terrain & 42 Relics...');
    await nextFrame();
    const terrainSys = buildTerrainAndTreasures(THREE, glbRegistry, matLib);
    scene.add(terrainSys.terrainGroup, terrainSys.treasuresGroup);
    setSystems({ terrainSys });

    loadingSplash.setProgress(92, '🌳 Raising Supertrees & Domes...');
    await nextFrame();
    const landmarksSys = buildAllLandmarks(THREE, glbRegistry, matLib);
    scene.add(landmarksSys.landmarksGroup);
    setSystems({ landmarksSys });

    loadingSplash.setProgress(97, '🧭 Waking Explorers...');
    await nextFrame();
    const explorersSys = createExplorersSystem(THREE, glbRegistry, matLib);
    scene.add(explorersSys.group);
    setSystems({ explorersSys });

    setupMultiplayerClient(terrainSys, explorersSys);

    lobby3DSys = createMultiplayerPlazaLobby3D({ scene, appState, getTerrainSys: () => terrainSys });
    const mpLobbyUi = createMultiplayerLobbyController({
      appState,
      cameraControl,
      setCameraPreset,
      setScreenState: (s) => coordinator.setScreenState(s),
      setGameMode: (m) => window.gbbApp?.setGameMode?.(m),
      resetFullMatch: () => window.gbbApp?.resetFullMatch?.(),
      getExplorersSys: () => explorersSys,
      getLobby3DSys: () => lobby3DSys,
      updateHudStandings,
      updateClockDigits,
      updateWorldLabels,
      showToast
    });
    mpLobbyUi.bindMultiplayerDomEvents();

    const mapSwitcher = createMapWorldSwitcherController({
      THREE,
      scene,
      matLib,
      appState,
      getGlbRegistry: () => glbRegistry,
      getSystems,
      setSystems,
      coordinator,
      resetFullMatch: () => window.gbbApp?.resetFullMatch?.(),
      updateHudStandings,
      updateWorldLabels,
      renderEncyclopediaModal: () => {
        if (appState.screen === 'encyclopedia') coordinator.setScreenState('encyclopedia');
      },
      drawMiniRadar,
      drawTacticalFullMap,
      showToast
    });
    mapSwitcher.bindMapSwitcherEvents();
    window.__gbbSwitchWorldMap = mapSwitcher.switchWorldMap;

    coordinator.applyLookDevSettings(appState.lookDev);
    setCameraPreset('player_follow', true);
    coordinator.setMilestoneStage(appState.milestoneStage);
    coordinator.setScreenState(appState.screen);

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('room')) {
      mpLobbyUi.openPartyWaitingLobby(appState.multiplayerRoomCode, false);
    } else if (appState.screen === 'title' || appState.screen === 'welcome') {
      cameraControl.currentPos.copy(cameraControl.desiredPos);
      cameraControl.currentTarget.copy(cameraControl.desiredTarget);
      camera.position.copy(cameraControl.currentPos);
      camera.lookAt(cameraControl.currentTarget);
    }
    updateHudStandings();
    showToast(
      appState.isMobileLandscape
        ? '👆 Tap to move • Drag to look • Pinch to zoom'
        : '✨ Ready! WASD or Click to Explore.'
    );

    stepSimulation(0.05);
    postFX.render();

    const demoShotParam = urlParams.get('demoShot');
    applyDemoShotPreset(demoShotParam);

    await loadingSplash.finishAndDismiss();
    if (demoShotParam === 'screen3') {
      await nextFrame();
      resizeRelic3DStage();
      openRelic3DInspector(1);
      updateAndRenderRelic3DStage(0.05);
    }
    window.gbbReady = true;
  }

  return {
    stepSimulation,
    animate,
    handleViewportResize,
    bindViewportListeners,
    initWorldV2
  };
}
