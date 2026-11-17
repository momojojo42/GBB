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

export function createEnvironmentAndPostFX(renderer, scene, camera) {
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

  // 2. Post-Processing Pipeline: RenderPass -> UnrealBloomPass -> OutputPass
  const composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.12, // strength (crisp daytime emissive-only bloom, boosted at night)
    0.35, // radius
    1.35  // HDR threshold so normal sunlit surfaces never wash out
  );
  composer.addPass(bloomPass);

  const outputPass = new OutputPass();
  composer.addPass(outputPass);

  // 3. Living 3D Sky Dome & Atmosphere Group
  const livingSky = createLivingSkyDome(THREE, scene, computeDayNightCycleState);

  function applySettings(settings = {}) {
    const L = settings.lighting || settings;
    const isNight = L.preset === 'night';

    if (L.bloomStrength !== undefined) {
      bloomPass.strength = L.bloomStrength;
    } else {
      bloomPass.strength = isNight ? 0.68 : 0.24;
    }

    if (L.bloomRadius !== undefined) {
      bloomPass.radius = L.bloomRadius;
    }
    if (L.bloomThreshold !== undefined) {
      bloomPass.threshold = L.bloomThreshold;
    }
    if (L.envMapIntensity !== undefined && 'environmentIntensity' in scene) {
      scene.environmentIntensity = L.envMapIntensity;
    }

    const preset = L.preset || settings.preset;
    if (preset) {
      let p = 0.20;
      if (preset === 'afternoon') p = 0.54;
      else if (preset === 'sunset') p = 0.75;
      else if (preset === 'night') p = 0.92;
      const cycleState = computeDayNightCycleState(p, 0);
      livingSky.updateLivingSkyDome(cycleState, 0);
    }
  }

  function setBloom(strength, radius = 0.55, threshold = 0.78) {
    if (strength !== undefined) bloomPass.strength = strength;
    if (radius !== undefined) bloomPass.radius = radius;
    if (threshold !== undefined) bloomPass.threshold = threshold;
  }

  function setEnvMapIntensity(targetScene, intensity = 0.85) {
    const s = targetScene || scene;
    if (s && 'environmentIntensity' in s) {
      s.environmentIntensity = intensity;
    }
  }

  function setSize(width, height) {
    composer.setSize(width, height);
    bloomPass.resolution.set(width, height);
  }

  function updateDayNightCycle(progress0to1, elapsedSeconds = 0) {
    const cycleState = computeDayNightCycleState(progress0to1, elapsedSeconds);
    bloomPass.strength = cycleState.bloomStrength;
    if ('environmentIntensity' in scene && cycleState.envMapIntensity !== undefined) {
      scene.environmentIntensity = cycleState.envMapIntensity;
    }
    livingSky.updateLivingSkyDome(cycleState, elapsedSeconds);
    return cycleState;
  }

  function updateTitleShowcaseCycle(titleElapsedSeconds = 0, loopDuration = TITLE_SHOWCASE_LOOP_SECONDS) {
    const cycleState = computeTitleShowcaseCycleState(titleElapsedSeconds, loopDuration);
    bloomPass.strength = cycleState.bloomStrength;
    if ('environmentIntensity' in scene && cycleState.envMapIntensity !== undefined) {
      scene.environmentIntensity = cycleState.envMapIntensity;
    }
    livingSky.updateLivingSkyDome(cycleState, titleElapsedSeconds);
    return cycleState;
  }

  function render() {
    composer.render();
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
    render
  };
}
