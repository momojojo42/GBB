// ============================================================================
// Gardens by the Bay — 3D Treasure Hunt & LookDev Studio (v2.0)
// Master 3D Coordinator (src/main3d.js)
// Pipeline: Vite + Three.js + Headless Blender 4.2 .GLB + PBR IBL + UnrealBloom
// Global Typography: 'Poppins', sans-serif
// ============================================================================

import * as THREE from 'three';
import {
  DEFAULT_LOOKDEV_SETTINGS,
  isAdminEnvironment,
  initAdminAccessGuard
} from './core/AdminAuthGuard.js';
import {
  urlScreenParam,
  appState,
  syncOverlayBodyClasses,
  requestMobileFullView,
  toggleFullView,
  syncMobileViewportState
} from './core/AppState.js';
import { createMaterialAndTextureLibrary } from './core/MaterialAndTextureLibrary.js';
import { createEnvironmentAndPostFX } from './core/EnvironmentAndPostFX.js';
import { createCameraController } from './camera/CameraController.js';
import { createWorldLabelsManager } from './ui/hud/WorldLabelsManager.js';
import { createHudController, showToast } from './ui/hud/HudController.js';
import { createMiniRadarRenderer } from './ui/hud/MiniRadarRenderer.js';
import { createTacticalMapRenderer } from './ui/screens/TacticalMapRenderer.js';
import { createEncyclopediaModal } from './ui/screens/EncyclopediaModal.js';
import { createRelic3DInspectorModal } from './ui/inspector/Relic3DInspectorModal.js';
import { createOnboardingController } from './ui/hud/OnboardingController.js';
import { createGameplayRulesController } from './core/GameplayRulesController.js';
import { createInputAndTouchController } from './core/InputAndTouchController.js';
import { createLookDevAndScreenCoordinator } from './core/LookDevAndAutomationApi.js';
import { createFrameLoopRunner } from './core/FrameLoopRunner.js';

// Expose readiness flag for automated screenshot capture
window.gbbReady = false;

// ----------------------------------------------------------------------------
// Initialize Three.js Renderer, Scene, Camera, IBL & PostFX
// ----------------------------------------------------------------------------
const canvas = document.getElementById('gameCanvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: true
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = DEFAULT_LOOKDEV_SETTINGS.lighting?.exposure ?? 1.08;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#7DD3FC');
scene.fog = new THREE.FogExp2('#BAE6FD', 0.0011);

const camera = new THREE.PerspectiveCamera(
  DEFAULT_LOOKDEV_SETTINGS.camera?.cameraFov ?? 44,
  window.innerWidth / window.innerHeight,
  0.5,
  600
);

// Initialize PBR IBL Environment & Post-Processing (UnrealBloomPass + OutputPass)
const postFX = createEnvironmentAndPostFX(renderer, scene, camera);
const matLib = createMaterialAndTextureLibrary(THREE);

// Sky & Lighting Setup
const ambientLight = new THREE.AmbientLight(
  '#E0F2FE',
  DEFAULT_LOOKDEV_SETTINGS.lighting?.ambientIntensity ?? 0.45
);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight('#BAE6FD', '#065F46', 0.38);
hemiLight.position.set(0, 120, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(
  DEFAULT_LOOKDEV_SETTINGS.lighting?.sunColor || '#FFF4DC',
  DEFAULT_LOOKDEV_SETTINGS.lighting?.sunIntensity ?? 1.55
);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 10;
sunLight.shadow.camera.far = 320;
const shadowBounds = 115;
sunLight.shadow.camera.left = -shadowBounds;
sunLight.shadow.camera.right = shadowBounds;
sunLight.shadow.camera.top = shadowBounds;
sunLight.shadow.camera.bottom = -shadowBounds;
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);

// Placeholders populated once Blender GLB bundles finish loading
let glbRegistryRef = null;
let terrainSys = null;
let landmarksSys = null;
let explorersSys = null;
let clickMoveTarget = null;
let coordinator = null;
let frameLoopRunner = null;

// ----------------------------------------------------------------------------
// Instantiate Camera, HUD, World Labels, Modals, Gameplay & Input Controllers
// ----------------------------------------------------------------------------
const cameraSys = createCameraController({
  camera,
  canvas,
  appState,
  getExplorersSys: () => explorersSys,
  onGroundClickMove: (targetVec) => {
    clickMoveTarget = targetVec;
  },
  onApplyLookDevSettings: (partial) => coordinator?.applyLookDevSettings(partial),
  getLookDevPanel: () => coordinator?.getLookDevPanel()
});
const {
  cameraControl,
  activateFollowCameraFromCurrentView,
  setCameraPreset,
  updateCamera
} = cameraSys;

const hudSys = createHudController({
  appState,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  onTriggerEndGame: (reason) => gameplayRules.triggerEndGame(reason),
  onInspectRelic: (relicId) => {
    appState.selectedRelicId = relicId;
    coordinator.setScreenState('relic3d');
  },
  onOpenCollectionGallery: () => {
    coordinator.setScreenState('encyclopedia');
  }
});
const {
  updateHudStandings,
  updateClockDigits,
  populateEndGameBanner,
  showDiscoveryPopCard
} = hudSys;

const worldLabelsSys = createWorldLabelsManager({
  camera,
  appState,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  onCollectTreasure: (id, collectorId, incScore) =>
    gameplayRules.handleTreasureCollected(id, collectorId, incScore),
  onClickMoveTo: (targetVec) => {
    clickMoveTarget = targetVec;
    activateFollowCameraFromCurrentView();
  },
  showToast
});
const {
  spawnFloatingCollectPopup,
  spawnSnatchBubble,
  updateWorldLabels
} = worldLabelsSys;

const miniRadarSys = createMiniRadarRenderer({
  appState,
  cameraControl,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  onSetWaypoint: (targetVec) => {
    clickMoveTarget = targetVec;
    activateFollowCameraFromCurrentView();
  },
  showToast
});
const { drawMiniRadar } = miniRadarSys;

const tacticalMapSys = createTacticalMapRenderer({
  appState,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  onSetClickMoveTarget: (targetVec) => {
    clickMoveTarget = targetVec;
  },
  onSetCameraPreset: (presetId) => setCameraPreset(presetId),
  onSetScreenState: (screenName) => coordinator.setScreenState(screenName),
  showToast
});
const { drawTacticalFullMap } = tacticalMapSys;

const relic3DSys = createRelic3DInspectorModal({
  appState,
  getTerrainSys: () => terrainSys,
  getGlbRegistry: () => glbRegistryRef,
  onBackToCollection: () => coordinator.setScreenState('encyclopedia')
});
const {
  openRelic3DInspector,
  resizeStageCanvas: resizeRelic3DStage,
  updateAndRenderStage: updateAndRenderRelic3DStage
} = relic3DSys;

const encycSys = createEncyclopediaModal({
  appState,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  onCloseModal: () => coordinator.setScreenState('gameplay'),
  onInspectRelic3D: (relicId) => {
    appState.selectedRelicId = relicId;
    coordinator.setScreenState('relic3d');
  }
});
const { renderEncyclopediaModal } = encycSys;

const onboardingSys = createOnboardingController({
  appState,
  getTerrainSys: () => terrainSys,
  showToast
});
window.__gbbOnboarding = onboardingSys;

const gameplayRules = createGameplayRulesController({
  appState,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  cameraControl,
  activateFollowCameraFromCurrentView,
  setCameraPreset,
  setScreenState: (screenName) => coordinator.setScreenState(screenName),
  setClickMoveTarget: (vec) => {
    clickMoveTarget = vec;
  },
  updateHudStandings,
  updateClockDigits,
  populateEndGameBanner,
  showDiscoveryPopCard,
  spawnFloatingCollectPopup,
  spawnSnatchBubble,
  updateWorldLabels,
  renderEncyclopediaModal,
  showToast
});
const {
  setGameMode,
  setBotDifficulty,
  activateFieldGadgetForPlayer,
  handleTreasureCollected,
  triggerPlayerJump,
  triggerEndGame,
  dismissEndGameToFreeRoam,
  resetFullMatch,
  collectNearestRelicForPlayer,
  handleArcadeEvent,
  handlePhysicsBlocked,
  updateMidMatchAndPlayerHazards
} = gameplayRules;

coordinator = createLookDevAndScreenCoordinator({
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
  getTerrainSys: () => terrainSys,
  getLandmarksSys: () => landmarksSys,
  getExplorersSys: () => explorersSys,
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
  stepSimulation: (dt) => frameLoopRunner?.stepSimulation(dt)
});

const syncViewport = () =>
  syncMobileViewportState({ getTerrainSys: () => terrainSys, updateHudStandings });

const inputController = createInputAndTouchController({
  camera,
  appState,
  cameraControl,
  getTerrainSys: () => terrainSys,
  getExplorersSys: () => explorersSys,
  getClickMoveTarget: () => clickMoveTarget,
  setClickMoveTarget: (vec) => {
    clickMoveTarget = vec;
  },
  activateFollowCameraFromCurrentView,
  setCameraPreset,
  setScreenState: (screenName) => coordinator.setScreenState(screenName),
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
  requestMobileFullView: (lock) => requestMobileFullView(lock, syncViewport),
  toggleFullView: () => toggleFullView(syncViewport),
  showToast
});

initAdminAccessGuard();
if (isAdminEnvironment()) {
  coordinator.ensureLookDevPanel();
}
inputController.bindKeyboardAndDomEvents();
onboardingSys.bindEvents({
  setScreenState: (screenName) => coordinator.setScreenState(screenName)
});
coordinator.registerWindowGbbApp();

frameLoopRunner = createFrameLoopRunner({
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
  getSystems: () => ({ terrainSys, landmarksSys, explorersSys }),
  setSystems: (partial) => {
    if (partial.glbRegistryRef !== undefined) glbRegistryRef = partial.glbRegistryRef;
    if (partial.terrainSys !== undefined) terrainSys = partial.terrainSys;
    if (partial.landmarksSys !== undefined) landmarksSys = partial.landmarksSys;
    if (partial.explorersSys !== undefined) explorersSys = partial.explorersSys;
  },
  getClickMoveTarget: () => clickMoveTarget,
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
});

frameLoopRunner.bindViewportListeners();
frameLoopRunner.initWorldV2();
inputController.setupMobileTouchControls();
syncOverlayBodyClasses();
syncViewport();
frameLoopRunner.animate();
