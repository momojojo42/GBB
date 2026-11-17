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
import { createLoadingSplashController } from '../ui/LoadingSplashController.js';
import { createRemoteTransformInterpolator } from '../multiplayer/RemoteTransformInterpolator.js';
import { createMultiplayerClient } from '../multiplayer/MultiplayerClient.js';
import { createMultiplayerPlazaLobby3D } from '../ui/MultiplayerPlazaLobby3D.js';
import { createMultiplayerLobbyController } from '../ui/MultiplayerLobbyModal.js';
import { createMapWorldSwitcherController } from '../ui/MapWorldSwitcherController.js';

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

  function stepSimulation(dt, rawDt = dt) {
    const { terrainSys, landmarksSys, explorersSys } = getSystems();
    const clickMoveTarget = getClickMoveTarget();
    if (!terrainSys || !landmarksSys || !explorersSys) return;
    if (appState.isPortraitBlocked) return;
    if (dt === 0) {
      const youStanding = explorersSys.getStandings().find((s) => s.id === 'you');
      updateCamera(rawDt || 0.016, youStanding, clickMoveTarget);
      updateWorldLabels();
      return;
    }
    const isTitleScreen = appState.screen === 'title';
    const isMpWaiting =
      (appState.isMultiplayerRoom &&
        (appState.multiplayerPhase === 'lobby' || appState.multiplayerPhase === 'countdown')) ||
      Boolean(appState.isStartingCountdownActive);
    if (!isTitleScreen && !isMpWaiting) {
      appState.elapsedSeconds += dt;
    }

    // 1. Compute Camera-Relative Player Input Vector
    const { moveX, moveZ, isSprinting, sprintMult } = inputController.computePlayerMovementVector();

    // 2. Dynamic Day-to-Night Cycle (10s Showcase Loop on Title Screen vs 3-Minute Match Cycle)
    if (appState.comboTimer > 0) {
      appState.comboTimer = Math.max(0, appState.comboTimer - dt);
      if (appState.comboTimer === 0) appState.comboCount = 0;
    }

    const raceDuration = appState.raceDurationSeconds || 180;
    let cycleProgress = 0;
    let cycleState = null;

    if (isTitleScreen) {
      appState.titleLoopSeconds = (appState.titleLoopSeconds || 0) + dt;
      cycleState =
        postFX.updateTitleShowcaseCycle?.(appState.titleLoopSeconds, TITLE_SHOWCASE_LOOP_SECONDS) ||
        computeTitleShowcaseCycleState(appState.titleLoopSeconds, TITLE_SHOWCASE_LOOP_SECONDS);
      cycleProgress = cycleState.progress;
      coordinator.applyCycleLightingToScene(cycleState, cycleProgress);
      coordinator.syncTitleShowcaseFrame?.(dt, cycleState);
    } else {
      const remainingSec =
        appState.mode === 'race'
          ? Math.max(0, raceDuration - appState.elapsedSeconds)
          : raceDuration - (appState.elapsedSeconds % raceDuration);
      appState.remainingSeconds = remainingSec;

      cycleProgress =
        appState.mode === 'race'
          ? Math.min(1, Math.max(0, appState.elapsedSeconds / raceDuration))
          : (appState.elapsedSeconds % raceDuration) / raceDuration;

      cycleState =
        postFX.updateDayNightCycle?.(cycleProgress, appState.elapsedSeconds) ||
        computeDayNightCycleState(cycleProgress, appState.elapsedSeconds);

      coordinator.applyCycleLightingToScene(cycleState, cycleProgress);
    }

    // 3. Step Terrain, Landmarks & Explorers Simulation
    const animElapsed = isTitleScreen ? appState.titleLoopSeconds : appState.elapsedSeconds;
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
        if (!isTitleScreen && !isMpWaiting) {
          handleTreasureCollected(treasureId, collectorId, false);
        }
      },
      onArcadeEvent: (evt) => {
        if (!isTitleScreen && !isMpWaiting) handleArcadeEvent(evt);
      },
      onPhysicsBlocked: (res) => handlePhysicsBlocked(res, moveX, moveZ, isSprinting)
    });

    if (newlyCollected && newlyCollected.length > 0) {
      updateHudStandings();
    }

    const standingsNow = explorersSys.getStandings();
    if (appState.isMultiplayerRoom && !isTitleScreen) {
      appState.multiplayerClient?.emitLocalTransform(dt, standingsNow);
    }

    const youStanding = standingsNow.find((s) => s.id === 'you');
    updateMidMatchAndPlayerHazards(dt, youStanding, moveX, moveZ);
    onboardingSys?.update(dt, youStanding);

    // 4. Update Third-Person Follow / Orbit Camera
    updateCamera(dt, youStanding, getClickMoveTarget());

    // 5. Periodic HUD & Radar Refresh
    hudRefreshAccumulator += dt;
    if (hudRefreshAccumulator >= 0.2) {
      hudRefreshAccumulator = 0;
      updateClockDigits();
      drawMiniRadar();
      if (appState.screen === 'fullmap') drawTacticalFullMap();
    }

    updateWorldLabels();
  }

  function animate() {
    requestAnimationFrame(animate);
    const rawDt = Math.min(clock.getDelta(), 0.1);
    const adminAnim = window.__gbbAdminAnimState;
    const simDt = adminAnim ? (adminAnim.paused ? 0 : rawDt * (adminAnim.speed ?? 1)) : rawDt;
    stepSimulation(simDt, rawDt);
    postFX.render();
    if (appState.screen === 'relic3d') {
      updateAndRenderRelic3DStage(rawDt);
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
    if (appState.screen === 'relic3d') {
      resizeRelic3DStage();
    }
    updateWorldLabels();
  }

  function bindViewportListeners() {
    window.addEventListener('resize', handleViewportResize);
    window.visualViewport?.addEventListener('resize', handleViewportResize);
    document.addEventListener('fullscreenchange', handleViewportResize);
    document.addEventListener('webkitfullscreenchange', handleViewportResize);
    window.addEventListener('orientationchange', () => {
      handleViewportResize();
      setTimeout(handleViewportResize, 120);
      setTimeout(handleViewportResize, 350);
    });
  }

  const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

  async function initWorldV2() {
    const loadingSplash = createLoadingSplashController(urlScreenParam);
    showToast('📦 Loading 3D World...');

    const glbRegistry = await loadAllBlenderGLBAssets({
      onProgress: ({ ratio, loadedBytes, totalBytes, completedKeys, activeLabel }) => {
        const pct = 4 + ratio * 78;
        loadingSplash.setProgress(pct, `📦 Loading ${activeLabel || '3D Assets'}...`, loadedBytes, totalBytes);
        if (Array.isArray(completedKeys)) {
          completedKeys.forEach((k) => loadingSplash.markBundleLoaded(k));
        }
      },
      onBundleComplete: (key) => loadingSplash.markBundleLoaded(key)
    });
    setSystems({ glbRegistryRef: glbRegistry });

    loadingSplash.setProgress(86, '🌿 Sculpting Terrain & 42 Relics...');
    await nextFrame();
    const terrainSys = buildTerrainAndTreasures(THREE, glbRegistry, matLib);
    scene.add(terrainSys.terrainGroup);
    scene.add(terrainSys.treasuresGroup);
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

    const remoteInterpolator = createRemoteTransformInterpolator();
    appState.remoteInterpolator = remoteInterpolator;
    const multiplayerClient = createMultiplayerClient({
      appState,
      interpolator: remoteInterpolator,
      onRoomStateUpdated: (room, mySlotIdx) => {
        explorersSys.syncMultiplayerRoomSlots?.(
          room,
          mySlotIdx,
          multiplayerClient.slotIndexToExplorerId,
          multiplayerClient.isHost()
        );
        updateHudStandings();
        window.__gbbOnMultiplayerRoomUpdated?.(room, mySlotIdx);
      },
      onCountdownStarted: (room, mySlotIdx) => {
        terrainSys.resetAllTreasures();
        explorersSys.resetMatch();
        explorersSys.syncMultiplayerRoomSlots?.(
          room,
          mySlotIdx,
          multiplayerClient.slotIndexToExplorerId,
          multiplayerClient.isHost()
        );
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
      onRelicChopedAlert: ({ ownerName }) => {
        showToast(`🤚 CHOPED by ${ownerName}! Too slow lah!`);
      },
      onRemoteEmote: ({ explorerId, emoteText }) => {
        explorersSys.triggerExplorerEmote?.(explorerId, emoteText);
        updateWorldLabels();
      }
    });
    appState.multiplayerClient = multiplayerClient;
    multiplayerClient.ensureConnected();

    lobby3DSys = createMultiplayerPlazaLobby3D({
      scene,
      appState,
      getTerrainSys: () => terrainSys
    });
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
    if (new URLSearchParams(window.location.search).get('room')) {
      mpLobbyUi.openPartyWaitingLobby(appState.multiplayerRoomCode, false);
    } else if (appState.screen === 'title') {
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

    const demoShotParam = new URLSearchParams(window.location.search).get('demoShot');
    if (demoShotParam === 'screen1') {
      [1, 2, 3].forEach((id) => handleTreasureCollected(id, 'you', true));
      coordinator.setScreenState('gameplay');
      const toast = document.getElementById('hudToastBanner');
      if (toast) toast.textContent = '✨ Latest 3 Relics Collected — Click any slot to Drag & Rotate in 360° 3D!';
    } else if (demoShotParam === 'screen2') {
      [1, 2, 3, 4, 5, 8, 9, 10].forEach((id) => handleTreasureCollected(id, 'you', true));
      coordinator.setScreenState('encyclopedia');
    } else if (demoShotParam === 'screen3') {
      [1, 2, 3, 4, 5, 8, 9, 10].forEach((id) => handleTreasureCollected(id, 'you', true));
      appState.selectedRelicId = 1;
      coordinator.setScreenState('relic3d');
    }

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
