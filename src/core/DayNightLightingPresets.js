// ============================================================================
// Gardens by the Bay — Day-to-Night & Title Showcase Cycle State Presets
// (src/core/DayNightLightingPresets.js)
// ============================================================================

import * as THREE from 'three';

function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}

function lerpHexColor(hexA, hexB, t) {
  const cA = new THREE.Color(hexA);
  const cB = new THREE.Color(hexB);
  cA.lerp(cB, Math.max(0, Math.min(1, t)));
  return `#${cA.getHexString().toUpperCase()}`;
}

/**
 * Computes the 3-minute match Day-to-Night + "Garden Rhapsody" cycle state.
 * @param {number} progress0to1 - 0.0 at match start (03:00 left) to 1.0 at match end (00:00 left)
 * @param {number} [elapsedSeconds=0] - Elapsed time in seconds for rhythmic modulation
 */
export function computeDayNightCycleState(progress0to1, elapsedSeconds = 0) {
  const p = Math.max(0, Math.min(1, Number(progress0to1) || 0));

  // Phase 1: 0.00 to 0.416 (0:00 to 1:15 elapsed / 03:00 to 01:45 left)
  if (p <= 0.416) {
    const t = p / 0.416;
    return {
      progress: p,
      phaseProgress: t,
      phaseId: 'morning',
      phaseLabel: '☀️ Morning',
      preset: 'day',
      isNightShow: false,
      scoreMultiplier: 1.0,
      sunElevationDeg: lerpNumber(38, 62, t),
      sunAzimuthDeg: lerpNumber(-52, -24, t),
      skyColor: lerpHexColor('#7DD3FC', '#60A5FA', t),
      fogColor: lerpHexColor('#BAE6FD', '#93C5FD', t),
      sunColor: '#FFFBEB',
      sunLightIntensity: lerpNumber(2.2, 2.45, t),
      hemiIntensity: 0.95,
      bloomStrength: lerpNumber(0.12, 0.16, t),
      nightBioluminescenceGlow: 0.18,
      envMapIntensity: lerpNumber(0.36, 0.40, t),
      skyZenithHex: lerpHexColor('#0284C7', '#0369A1', t),
      skyMidHex: lerpHexColor('#38BDF8', '#60A5FA', t),
      skyHorizonHex: lerpHexColor('#BAE6FD', '#E0F2FE', t),
      cloudTintHex: lerpHexColor('#FFFFFF', '#FFFBEB', t),
      starOpacity: 0.0,
      auroraIntensity: 0.0,
      moonOpacity: 0.0,
      elapsedSeconds
    };
  }

  // Phase 2: 0.416 to 0.667 (1:15 to 2:00 elapsed / 01:45 to 01:00 left)
  if (p <= 0.667) {
    const t = (p - 0.416) / (0.667 - 0.416);
    const moonOpacity = p > 0.65 ? Math.min(1.0, (p - 0.65) / (0.85 - 0.65)) : 0.0;
    return {
      progress: p,
      phaseProgress: t,
      phaseId: 'afternoon',
      phaseLabel: '🌤️ Afternoon',
      preset: 'day',
      isNightShow: false,
      scoreMultiplier: 1.0,
      sunElevationDeg: lerpNumber(62, 28, t),
      sunAzimuthDeg: lerpNumber(-24, 22, t),
      skyColor: lerpHexColor('#60A5FA', '#FDE68A', t),
      fogColor: lerpHexColor('#93C5FD', '#FDE68A', t),
      sunColor: lerpHexColor('#FFF4DC', '#FDBA74', t),
      sunLightIntensity: lerpNumber(2.45, 2.05, t),
      hemiIntensity: 0.90,
      bloomStrength: lerpNumber(0.16, 0.24, t),
      nightBioluminescenceGlow: 0.35,
      envMapIntensity: lerpNumber(0.40, 0.34, t),
      skyZenithHex: lerpHexColor('#0369A1', '#4338CA', t),
      skyMidHex: lerpHexColor('#60A5FA', '#FB923C', t),
      skyHorizonHex: lerpHexColor('#FEF08A', '#FDBA74', t),
      cloudTintHex: lerpHexColor('#FFFBEB', '#FECDD3', t),
      starOpacity: 0.0,
      auroraIntensity: 0.0,
      moonOpacity,
      elapsedSeconds
    };
  }

  // Phase 3: 0.667 to 0.833 (2:00 to 2:30 elapsed / 01:00 to 00:30 left)
  if (p <= 0.833) {
    const t = (p - 0.667) / (0.833 - 0.667);
    const skyColor = t < 0.5
      ? lerpHexColor('#FDE68A', '#FB7185', t * 2.0)
      : lerpHexColor('#FB7185', '#4C1D95', (t - 0.5) * 2.0);
    const auroraIntensity = p > 0.78 ? Math.min(1.0, (p - 0.78) / (1.0 - 0.78)) : 0.0;
    const moonOpacity = Math.min(1.0, (p - 0.65) / (0.833 - 0.65));
    return {
      progress: p,
      phaseProgress: t,
      phaseId: 'sunset',
      phaseLabel: '🌇 Sunset',
      preset: 'sunset',
      isNightShow: false,
      scoreMultiplier: 1.0,
      sunElevationDeg: lerpNumber(28, 8, t),
      sunAzimuthDeg: lerpNumber(22, 58, t),
      skyColor,
      fogColor: lerpHexColor('#FDBA74', '#311042', t),
      sunColor: lerpHexColor('#FB923C', '#F43F5E', t),
      sunLightIntensity: lerpNumber(2.05, 0.85, t),
      hemiIntensity: lerpNumber(0.72, 0.45, t),
      bloomStrength: lerpNumber(0.24, 0.48, t),
      nightBioluminescenceGlow: lerpNumber(0.35, 1.25, t),
      envMapIntensity: lerpNumber(0.34, 0.25, t),
      skyZenithHex: lerpHexColor('#4338CA', '#1E1B4B', t),
      skyMidHex: lerpHexColor('#FB7185', '#6D28D9', t),
      skyHorizonHex: lerpHexColor('#FDE047', '#F43F5E', t),
      cloudTintHex: lerpHexColor('#FECDD3', '#6366F1', t),
      starOpacity: lerpNumber(0.0, 0.55, t),
      auroraIntensity,
      moonOpacity,
      elapsedSeconds
    };
  }

  // Phase 4: 0.833 to 1.00 (2:30 to 3:00 elapsed / 00:30 to 00:00 left — GARDEN RHAPSODY NIGHT SHOW!)
  const t = (p - 0.833) / (1.0 - 0.833);
  const auroraIntensity = Math.min(1.0, (p - 0.78) / (1.0 - 0.78));
  return {
    progress: p,
    phaseProgress: t,
    phaseId: 'night',
    phaseLabel: '🌙 Night Show 1.5x!',
    preset: 'night',
    isNightShow: true,
    scoreMultiplier: 1.5,
    sunElevationDeg: lerpNumber(8, 5, t),
    sunAzimuthDeg: lerpNumber(58, 72, t),
    skyColor: lerpHexColor('#4C1D95', '#071124', t),
    fogColor: lerpHexColor('#311042', '#0B192E', t),
    sunColor: '#818CF8',
    sunLightIntensity: lerpNumber(0.85, 0.38, t),
    hemiIntensity: lerpNumber(0.45, 0.34, t),
    bloomStrength: lerpNumber(0.52, 0.68, t),
    nightBioluminescenceGlow: lerpNumber(1.35, 2.25, t),
    envMapIntensity: lerpNumber(0.25, 0.20, t),
    skyZenithHex: lerpHexColor('#1E1B4B', '#030712', t),
    skyMidHex: lerpHexColor('#4C1D95', '#0F172A', t),
    skyHorizonHex: lerpHexColor('#7C3AED', '#1E293B', t),
    cloudTintHex: '#6366F1',
    starOpacity: lerpNumber(0.55, 1.0, t),
    auroraIntensity,
    moonOpacity: 1.0,
    elapsedSeconds
  };
}

export const TITLE_SHOWCASE_LOOP_SECONDS = 10.0;

/**
 * Computes the 10-second looping Day-to-Night + Neon & Fireworks Showcase for the Welcome Home Screen.
 * - 0.0s – 1.5s (15%): Crisp Tropical Day
 * - 1.5s – 3.5s (20%): Fast Golden Sunset Transition
 * - 3.5s – 9.0s (55%): Extended Garden Rhapsody Neon Light Show & Fireworks Climax
 * - 9.0s – 10.0s (10%): Seamless Dawn Crossfade back to Day
 */
export function computeTitleShowcaseCycleState(
  titleElapsedSeconds = 0,
  loopDuration = TITLE_SHOWCASE_LOOP_SECONDS
) {
  const safeDuration = Math.max(4.0, Number(loopDuration) || TITLE_SHOWCASE_LOOP_SECONDS);
  const elapsed = Math.max(0, Number(titleElapsedSeconds) || 0);
  const loopTime = ((elapsed % safeDuration) + safeDuration) % safeDuration;
  const loopProgress0to1 = loopTime / safeDuration;

  if (loopTime < 1.5) {
    const t = loopTime / 1.5;
    const effectiveProgress = lerpNumber(0.0, 0.48, t);
    const state = computeDayNightCycleState(effectiveProgress, elapsed);
    return {
      ...state,
      titleLoopTime: loopTime,
      titleLoopDuration: safeDuration,
      titleLoopProgress0to1: loopProgress0to1,
      titleStageId: 'day',
      titleStageLabel: '☀️ Tropical Day',
      titleStageSub: 'Fast Sunset & Neon Show in ' + Math.max(1, Math.ceil(3.5 - loopTime)) + 's',
      isTitleNightHighlight: false
    };
  }

  if (loopTime < 3.5) {
    const t = (loopTime - 1.5) / 2.0;
    const s = t * t * (3 - 2 * t);
    const effectiveProgress = lerpNumber(0.48, 0.84, s);
    const state = computeDayNightCycleState(effectiveProgress, elapsed);
    return {
      ...state,
      nightBioluminescenceGlow: lerpNumber(0.42, 1.55, s),
      bloomStrength: lerpNumber(0.22, 0.56, s),
      titleLoopTime: loopTime,
      titleLoopDuration: safeDuration,
      titleLoopProgress0to1: loopProgress0to1,
      titleStageId: 'sunset',
      titleStageLabel: '🌇 Golden Sunset Sweep',
      titleStageSub: 'Supertree Neon Awakening...',
      isTitleNightHighlight: loopTime >= 3.1
    };
  }

  if (loopTime < 9.0) {
    const t = (loopTime - 3.5) / 5.5;
    const effectiveProgress = lerpNumber(0.85, 1.0, Math.min(1.0, t * 1.35));
    const state = computeDayNightCycleState(effectiveProgress, elapsed);
    const climaxWave = Math.sin(t * Math.PI);
    return {
      ...state,
      phaseId: 'night',
      phaseLabel: '🎆 Neon & Fireworks Show!',
      preset: 'night',
      isNightShow: true,
      bloomStrength: lerpNumber(0.62, 0.78, climaxWave),
      nightBioluminescenceGlow: lerpNumber(2.05, 2.75, climaxWave),
      starOpacity: 1.0,
      auroraIntensity: 1.0,
      moonOpacity: 1.0,
      titleLoopTime: loopTime,
      titleLoopDuration: safeDuration,
      titleLoopProgress0to1: loopProgress0to1,
      titleStageId: 'night_show',
      titleStageLabel: '🎆 Garden Rhapsody Neon & Fireworks!',
      titleStageSub: '🔥 1.5× Night Show Bonus Active',
      isTitleNightHighlight: true
    };
  }

  const t = (loopTime - 9.0) / Math.max(0.1, safeDuration - 9.0);
  const s = t * t * (3 - 2 * t);
  const nightEnd = computeDayNightCycleState(1.0, elapsed);
  const dayStart = computeDayNightCycleState(0.0, elapsed);

  return {
    progress: lerpNumber(1.0, 0.0, s),
    phaseProgress: s,
    phaseId: s < 0.5 ? 'night' : 'morning',
    phaseLabel: '🌅 Dawn Crossfade',
    preset: s < 0.5 ? 'night' : 'day',
    isNightShow: s < 0.35,
    scoreMultiplier: 1.0,
    sunElevationDeg: lerpNumber(nightEnd.sunElevationDeg, dayStart.sunElevationDeg, s),
    sunAzimuthDeg: lerpNumber(nightEnd.sunAzimuthDeg, dayStart.sunAzimuthDeg, s),
    skyColor: lerpHexColor(nightEnd.skyColor, dayStart.skyColor, s),
    fogColor: lerpHexColor(nightEnd.fogColor, dayStart.fogColor, s),
    sunColor: lerpHexColor(nightEnd.sunColor, dayStart.sunColor, s),
    sunLightIntensity: lerpNumber(nightEnd.sunLightIntensity, dayStart.sunLightIntensity, s),
    hemiIntensity: lerpNumber(nightEnd.hemiIntensity, dayStart.hemiIntensity, s),
    bloomStrength: lerpNumber(0.62, dayStart.bloomStrength, s),
    nightBioluminescenceGlow: lerpNumber(2.05, dayStart.nightBioluminescenceGlow, s),
    envMapIntensity: lerpNumber(nightEnd.envMapIntensity, dayStart.envMapIntensity, s),
    skyZenithHex: lerpHexColor(nightEnd.skyZenithHex, dayStart.skyZenithHex, s),
    skyMidHex: lerpHexColor(nightEnd.skyMidHex, dayStart.skyMidHex, s),
    skyHorizonHex: lerpHexColor(nightEnd.skyHorizonHex, dayStart.skyHorizonHex, s),
    cloudTintHex: lerpHexColor(nightEnd.cloudTintHex, dayStart.cloudTintHex, s),
    starOpacity: lerpNumber(1.0, 0.0, s),
    auroraIntensity: lerpNumber(1.0, 0.0, s),
    moonOpacity: lerpNumber(1.0, 0.0, s),
    elapsedSeconds: elapsed,
    titleLoopTime: loopTime,
    titleLoopDuration: safeDuration,
    titleLoopProgress0to1: loopProgress0to1,
    titleStageId: 'dawn',
    titleStageLabel: '🌅 Tropical Sunrise',
    titleStageSub: 'New 10s Showcase Loop...',
    isTitleNightHighlight: s < 0.25
  };
}
