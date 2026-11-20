// ============================================================================
// Gardens by the Bay — PBR Studio IBL Environment & Post-Processing Pipeline
// (src/core/EnvironmentAndPostFX.js)
// ============================================================================

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { createLivingSkyDome } from './LivingSkyDomeBuilder.js';
import {
  computeDayNightCycleState,
  computeTitleShowcaseCycleState,
  TITLE_SHOWCASE_LOOP_SECONDS
} from './DayNightLightingPresets.js';

export {
  computeDayNightCycleState,
  computeTitleShowcaseCycleState,
  TITLE_SHOWCASE_LOOP_SECONDS
};

const PRESET_PROGRESS_MAP = {
  morning: 0.20,
  afternoon: 0.54,
  sunset: 0.75,
  night: 0.92
};

export function createEnvironmentAndPostFX(renderer, scene, camera, { isSoftwareGl = false } = {}) {
  // 1. Studio HDRI Environment Reflections via PMREMGenerator + RoomEnvironment
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  const envRenderTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = envRenderTarget.texture;
  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = 0.35;
  }
  roomEnv.dispose();
  pmremGenerator.dispose();

  // 2. Post-Processing Pipeline (bypassed on software WebGL for smooth frame rates)
  let composer = null;
  let bloomPass = { strength: 0.12, radius: 0.35, threshold: 1.35, resolution: new THREE.Vector2() };

  if (!isSoftwareGl) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.12, // strength (crisp daytime emissive-only bloom, boosted at night)
      0.35, // radius
      1.35  // HDR threshold so normal sunlit surfaces never wash out
    );
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
  }

  // 3. Living 3D Sky Dome & Atmosphere Group
  const livingSky = createLivingSkyDome(THREE, scene, computeDayNightCycleState);

  function applyCycleState(cycleState, elapsedSeconds = 0) {
    bloomPass.strength = cycleState.bloomStrength;
    if ('environmentIntensity' in scene && cycleState.envMapIntensity !== undefined) {
      scene.environmentIntensity = cycleState.envMapIntensity;
    }
    livingSky.updateLivingSkyDome(cycleState, elapsedSeconds);
    return cycleState;
  }

  function applySettings(settings = {}) {
    const L = settings.lighting || settings;
    const isNight = L.preset === 'night';

    bloomPass.strength = L.bloomStrength ?? (isNight ? 0.68 : 0.24);
    if (L.bloomRadius !== undefined) bloomPass.radius = L.bloomRadius;
    if (L.bloomThreshold !== undefined) bloomPass.threshold = L.bloomThreshold;
    if (L.envMapIntensity !== undefined && 'environmentIntensity' in scene) {
      scene.environmentIntensity = L.envMapIntensity;
    }

    const preset = L.preset || settings.preset;
    if (preset) {
      const p = PRESET_PROGRESS_MAP[preset] ?? 0.20;
      livingSky.updateLivingSkyDome(computeDayNightCycleState(p, 0), 0);
    }
  }

  function setBloom(strength, radius = 0.55, threshold = 0.78) {
    if (strength !== undefined) bloomPass.strength = strength;
    if (radius !== undefined) bloomPass.radius = radius;
    if (threshold !== undefined) bloomPass.threshold = threshold;
  }

  function setEnvMapIntensity(targetScene, intensity = 0.85) {
    const s = targetScene || scene;
    if (s && 'environmentIntensity' in s) s.environmentIntensity = intensity;
  }

  function setSize(width, height) {
    composer?.setSize(width, height);
    bloomPass.resolution.set(width, height);
  }

  const updateDayNightCycle = (progress0to1, elapsedSeconds = 0) =>
    applyCycleState(computeDayNightCycleState(progress0to1, elapsedSeconds), elapsedSeconds);

  const updateTitleShowcaseCycle = (titleElapsedSeconds = 0, loopDuration = TITLE_SHOWCASE_LOOP_SECONDS) =>
    applyCycleState(computeTitleShowcaseCycleState(titleElapsedSeconds, loopDuration), titleElapsedSeconds);

  function render() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function dispose() {
    envRenderTarget.dispose();
    composer?.dispose();
  }

  return {
    composer,
    bloomPass,
    skyDomeGroup: livingSky.skyDomeGroup,
    sunGroup: livingSky.sunGroup,
    moonGroup: livingSky.moonGroup,
    cloudRingGroup: livingSky.cloudRingGroup,
    birdFlocksGroup: livingSky.birdFlocksGroup,
    applySettings,
    setBloom,
    setEnvMapIntensity,
    updateDayNightCycle,
    updateTitleShowcaseCycle,
    computeDayNightCycleState,
    computeTitleShowcaseCycleState,
    setSize,
    resize: setSize,
    render,
    dispose
  };
}
