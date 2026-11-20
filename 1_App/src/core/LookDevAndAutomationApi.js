// ============================================================================
// Gardens by the Bay — LookDev Coordinator, Screen Switcher & Automation API
// (src/core/LookDevAndAutomationApi.js)
// ============================================================================

import * as THREE from 'three';
import { buildWindowGbbAppBridge } from './AutomationBridgeApi.js';
import { getActiveMapProfile } from '../data/MapRegistry.js';

export function createLookDevAndScreenCoordinator({
  renderer,
  scene,
  camera,
  ambientLight,
  hemiLight,
  sunLight,
  postFX,
  appState,
  cameraControl,
  setCameraPreset,
  syncOverlayBodyClasses,
  getTerrainSys,
  getLandmarksSys,
  getExplorersSys,
  updateWorldLabels,
  renderEncyclopediaModal,
  resizeRelic3DStage,
  openRelic3DInspector,
  drawTacticalFullMap,
  setGameMode,
  triggerEndGame,
  triggerPlayerJump,
  resetFullMatch,
  handleTreasureCollected,
  collectNearestRelicForPlayer,
  stepSimulation
}) {
  let lookDevPanel = null;
  let lookDevPanelPromise = null;

  function getLookDevPanel() {
    return lookDevPanel;
  }

  function applyLookDevSettings(partial) {
    if (partial.lighting || partial.textures || partial.camera) {
      if (partial.lighting) Object.assign(appState.lookDev.lighting, partial.lighting);
      if (partial.textures) Object.assign(appState.lookDev.textures, partial.textures);
      if (partial.camera) Object.assign(appState.lookDev.camera, partial.camera);
    } else {
      Object.assign(appState.lookDev.lighting, partial);
      Object.assign(appState.lookDev.textures, partial);
      Object.assign(appState.lookDev.camera, partial);
    }

    const L = appState.lookDev.lighting || appState.lookDev;
    const T = appState.lookDev.textures || appState.lookDev;
    const C = appState.lookDev.camera || appState.lookDev;

    const azRad = THREE.MathUtils.degToRad(L.sunAzimuthDeg ?? 138);
    const elRad = THREE.MathUtils.degToRad(Math.max(4, L.sunElevationDeg ?? 46));
    const sunDist = 145;
    sunLight.position.set(
      Math.cos(elRad) * Math.sin(azRad) * sunDist,
      Math.sin(elRad) * sunDist,
      Math.cos(elRad) * Math.cos(azRad) * sunDist
    );
    sunLight.intensity = L.sunIntensity ?? 1.55;
    sunLight.color.set(L.sunColor || '#FFF4DC');
    ambientLight.intensity = L.ambientIntensity ?? 0.45;
    renderer.toneMappingExposure = L.exposure ?? 0.95;

    if (postFX) {
      const isNight = L.preset === 'night';
      postFX.setBloom(
        L.bloomStrength ?? (isNight ? 0.55 : 0.12),
        isNight ? 0.55 : 0.35,
        isNight ? 0.72 : 1.35
      );
      postFX.setEnvMapIntensity(scene, L.envMapIntensity ?? 0.35);
    }

    const badge = document.getElementById('hudAtmosphereBadge');
    const mapProf = getActiveMapProfile();
    if (L.preset === 'night') {
      scene.background.set('#081426');
      scene.fog.color.set('#0B192E');
      hemiLight.color.set('#38BDF8');
      hemiLight.groundColor.set('#042F2E');
      if (badge) badge.textContent = mapProf.nightShowLabel || '🌙 Garden Rhapsody Night';
    } else if (L.preset === 'sunset') {
      scene.background.set('#FCA5A5');
      scene.fog.color.set('#FDBA74');
      hemiLight.color.set('#FDE047');
      hemiLight.groundColor.set('#064E3B');
      if (badge) badge.textContent = '🌇 Golden Hour Sunset';
    } else {
      scene.background.set('#7DD3FC');
      scene.fog.color.set('#BAE6FD');
      hemiLight.color.set('#E0F2FE');
      hemiLight.groundColor.set('#065F46');
      if (badge) badge.textContent = '☀️ Morning Tropical Sun';
    }

    const mergedMatSettings = { ...T, ...L };
    getTerrainSys()?.applyMaterialSettings?.(mergedMatSettings);
    getLandmarksSys()?.applyMaterialSettings?.(mergedMatSettings);

    if (C.cameraFov && Math.abs(camera.fov - C.cameraFov) > 0.05) {
      camera.fov = C.cameraFov;
      camera.updateProjectionMatrix();
    }
  }

  function applyCycleLightingToScene(cycleState, cycleProgress) {
    if (!cycleState || appState.manualLookDevOverride || window.__gbbAdminSkyOverride) return;
    appState.dayNightPhaseLabel = cycleState.phaseLabel;
    appState.isNightRhapsody = Boolean(cycleState.isNightShow || cycleProgress >= 150 / 180);

    if (cycleState.skyColor) scene.background.set(cycleState.skyColor);
    if (cycleState.fogColor) scene.fog.color.set(cycleState.fogColor);
    if (cycleState.skyColor) hemiLight.color.set(cycleState.skyColor);
    if (cycleState.hemiIntensity !== undefined) hemiLight.intensity = cycleState.hemiIntensity;
    if (cycleState.sunColor) sunLight.color.set(cycleState.sunColor);
    if (cycleState.sunLightIntensity !== undefined) sunLight.intensity = cycleState.sunLightIntensity;
    ambientLight.intensity = cycleState.isNightShow ? 0.52 : 0.72;
    renderer.toneMappingExposure = cycleState.isNightShow ? 1.16 : 1.08;

    const azRad = THREE.MathUtils.degToRad(cycleState.sunAzimuthDeg ?? -35);
    const elRad = THREE.MathUtils.degToRad(Math.max(5, cycleState.sunElevationDeg ?? 45));
    const sunDist = 145;
    sunLight.position.set(
      Math.cos(elRad) * Math.sin(azRad) * sunDist,
      Math.sin(elRad) * sunDist,
      Math.cos(elRad) * Math.cos(azRad) * sunDist
    );

    postFX.setBloom(
      cycleState.bloomStrength ?? 0.16,
      cycleState.isNightShow ? 0.55 : 0.35,
      cycleState.isNightShow ? 0.85 : 1.25
    );
    const badge = document.getElementById('hudAtmosphereBadge');
    if (badge) badge.textContent = cycleState.phaseLabel;
  }

  function syncTitleShowcaseFrame(dt, cycleState) {
    if (!cycleState || (appState.screen !== 'title' && appState.screen !== 'welcome')) return;
    const isNightHighlight = Boolean(cycleState.isTitleNightHighlight);

    const titleOverlay = document.getElementById('screenTitleOverlay');
    titleOverlay?.classList.toggle('is-night-show-active', isNightHighlight);

    const phaseBadge = document.getElementById('titleShowPhaseBadge');
    if (phaseBadge && cycleState.titleStageLabel) {
      phaseBadge.textContent = cycleState.titleStageLabel;
    }
    const mobileVistaPhase = document.getElementById('mobileVistaPhaseText');
    if (mobileVistaPhase && cycleState.titleStageLabel) {
      const nextVistaText = isNightHighlight
        ? '🎆 Neon & Fireworks (1.5×Pts!)'
        : `${cycleState.titleStageLabel} → 🎆 Show`;
      if (mobileVistaPhase.textContent !== nextVistaText) {
        mobileVistaPhase.textContent = nextVistaText;
      }
    }
    const phaseSub = document.getElementById('titleShowPhaseSub');
    if (phaseSub && cycleState.titleStageSub) {
      phaseSub.textContent = cycleState.titleStageSub;
    }
    const fillEl = document.getElementById('titleShowProgressFill');
    if (fillEl && cycleState.titleLoopProgress0to1 !== undefined) {
      fillEl.style.width = `${(cycleState.titleLoopProgress0to1 * 100).toFixed(1)}%`;
    }
    const eyebrowEl = document.getElementById('titleCardEyebrowPill');
    if (eyebrowEl) {
      const mapProf = getActiveMapProfile();
      eyebrowEl.textContent = isNightHighlight
        ? mapProf.eyebrowNight || '🎆 LIVE: GARDEN RHAPSODY NEON & FIREWORKS (1.5× PTS!)'
        : mapProf.eyebrowDay || '🇸🇬 SINGAPORE • 10S DAY → NIGHT NEON SHOWCASE';
    }

    const loopTime = cycleState.titleLoopTime ?? 0;
    if (loopTime >= 3.15 && loopTime < 8.95) {
      const salvoSlot = Math.floor((appState.titleLoopSeconds || 0) / 0.72);
      if (salvoSlot !== appState.lastTitleFireworkSalvoIndex) {
        appState.lastTitleFireworkSalvoIndex = salvoSlot;
        getTerrainSys()?.spawnTitleShowFireworkSalvo?.(salvoSlot);
      }
    }

    if (!cameraControl.isDragging && cameraControl.mode === 'preset') {
      const t = appState.titleLoopSeconds || 0;
      const nightLift = isNightHighlight ? 1.0 : 0.0;
      const swayX = Math.sin(t * 0.628) * 6.5;
      const swayZ = Math.cos(t * 0.628) * 4.5;
      cameraControl.desiredPos.set(-48 + swayX, 34 - nightLift * 3.5, 74 + swayZ);
      cameraControl.desiredTarget.set(16 + Math.sin(t * 0.628) * 2.5, 5.5 + nightLift * 5.2, -6);
    }
  }

  function setMilestoneStage(stage) {
    appState.milestoneStage = stage;
    const badge = document.getElementById('milestoneBadge');
    const terrainSys = getTerrainSys();
    const landmarksSys = getLandmarksSys();
    const explorersSys = getExplorersSys();
    if (!terrainSys || !landmarksSys || !explorersSys) return;

    const showLandmarks = stage !== 'm2_terrain';
    const showExplorers = stage !== 'm2_terrain' && stage !== 'm3_landmarks';
    terrainSys.terrainGroup.visible = true;
    landmarksSys.landmarksGroup.visible = showLandmarks;
    explorersSys.group.visible = showExplorers;
    terrainSys.treasuresGroup.visible = showExplorers;

    if (badge) {
      const labels = {
        m2_terrain: 'M2 • TERRAIN & WATERWAYS v2.0 (BLENDER GLB)',
        m3_landmarks: 'M3 • BUILDINGS & SCULPTURES v2.0 (BLENDER GLB)',
        m4_characters: 'M4 • CHIBI EXPLORERS & 42 RELICS v2.0 (BLENDER GLB)'
      };
      badge.textContent = labels[stage] || 'M5 • FULL 3D GAME v2.0 (BLENDER GLB + BLOOM)';
    }

    updateWorldLabels();
  }

  function setScreenState(screenName) {
    const setupEl = document.getElementById('screenSetupOverlay');
    if (screenName === 'setup' && !setupEl) {
      screenName = 'title';
    }
    const prevScreen = appState.screen;
    appState.screen = screenName;

    document.querySelectorAll('.screen-nav-pills .nav-pill').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.screen === screenName);
    });
    document.getElementById('btnOpenSingaporeMapTop')?.classList.toggle('active', screenName === 'welcome');
    document.getElementById('btnOpenStartScreenTop')?.classList.toggle('active', screenName === 'title');
    document.getElementById('btnOpenCollectionTop')?.classList.toggle(
      'active',
      screenName === 'encyclopedia' || screenName === 'relic3d'
    );

    document.getElementById('screenWelcomeMapOverlay')?.classList.toggle('hidden', screenName !== 'welcome');
    document.getElementById('screenTitleOverlay')?.classList.toggle('hidden', screenName !== 'title');
    if (setupEl) setupEl.classList.toggle('hidden', screenName !== 'setup');
    document.getElementById('screenEncyclopediaOverlay')?.classList.toggle('hidden', screenName !== 'encyclopedia');
    document.getElementById('screenRelic3DInspectorOverlay')?.classList.toggle('hidden', screenName !== 'relic3d');
    document.getElementById('screenFullMapOverlay')?.classList.toggle('hidden', screenName !== 'fullmap');
    const hudEl = document.getElementById('gameplayHud');
    if (hudEl) hudEl.style.display = screenName === 'gameplay' ? 'block' : 'none';

    syncOverlayBodyClasses();

    if (screenName !== 'gameplay') {
      lookDevPanel?.setCollapsed?.(true);
    } else if (prevScreen && prevScreen !== 'gameplay') {
      lookDevPanel?.setCollapsed?.(false);
    }

    if (screenName === 'welcome' || screenName === 'title') {
      appState.titleLoopSeconds = 0;
      appState.lastTitleFireworkSalvoIndex = -1;
      document.getElementById('screenTitleOverlay')?.classList.remove('mobile-choices-open');
      syncOverlayBodyClasses();
      if (screenName === 'welcome') {
        window.__gbbOpenWelcomeMapScreen?.();
      }
      cameraControl.mode = 'preset';
      cameraControl.desiredPos.set(-48, 34, 74);
      cameraControl.desiredTarget.set(18, 5.5, -6);
    } else if (screenName === 'gameplay' && (prevScreen === 'title' || prevScreen === 'welcome')) {
      setCameraPreset('player_follow', false);
    } else if (screenName === 'encyclopedia') {
      renderEncyclopediaModal();
    } else if (screenName === 'relic3d') {
      requestAnimationFrame(() => {
        resizeRelic3DStage();
        openRelic3DInspector(appState.selectedRelicId);
      });
    } else if (screenName === 'fullmap') {
      drawTacticalFullMap();
    }
  }

  async function ensureLookDevPanel() {
    if (lookDevPanel) return lookDevPanel;
    if (!lookDevPanelPromise) {
      lookDevPanelPromise = import('../ui/admin/LookDevControlPanel.js').then(({ createLookDevControlPanel }) => {
        lookDevPanel = createLookDevControlPanel({
          initialSettings: appState.lookDev,
          onChange: (updatedSettings) => applyLookDevSettings(updatedSettings),
          onSelectCameraPreset: (presetObjOrId) => {
            const id = typeof presetObjOrId === 'string' ? presetObjOrId : presetObjOrId.id;
            setCameraPreset(id, false);
          },
          onSelectMilestoneStage: (stage) => setMilestoneStage(stage)
        });
        document.getElementById('btnAdminOpenRelic3DFromEncyc')?.addEventListener('click', () => {
          window.gbbApp?.inspectRelic3D?.(appState.selectedRelicId || 1);
        });
        return lookDevPanel;
      });
    }
    return lookDevPanelPromise;
  }

  function registerWindowGbbApp() {
    window.gbbApp = buildWindowGbbAppBridge({
      camera,
      postFX,
      appState,
      cameraControl,
      setCameraPreset,
      getTerrainSys,
      getExplorersSys,
      updateWorldLabels,
      setMilestoneStage,
      setScreenState,
      setGameMode,
      triggerEndGame,
      triggerPlayerJump,
      resetFullMatch,
      handleTreasureCollected,
      collectNearestRelicForPlayer,
      stepSimulation,
      applyLookDevSettings,
      getLookDevPanel,
      ensureLookDevPanel
    });
    window.__GBB_AUTOMATION__ = window.gbbApp;
    window.render_game_to_text = () => JSON.stringify(window.gbbApp.getState());
  }

  return {
    getLookDevPanel,
    applyLookDevSettings,
    applyCycleLightingToScene,
    syncTitleShowcaseFrame,
    setMilestoneStage,
    setScreenState,
    ensureLookDevPanel,
    registerWindowGbbApp
  };
}
