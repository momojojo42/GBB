// ============================================================================
// Gardens by the Bay — Garden Rhapsody Light Show & Firefly Mote System
// Extracted from src/world/LandmarksBuilder.js (Section 7)
// ============================================================================

import { getActiveMapId } from '../../data/MapRegistry.js';

export function createGardenRhapsodyShow({
  THREE,
  landmarksGroup,
  supertreeCanopyMaterials,
  supertreeEmissiveMaterials,
  conservatoryGlassMaterials,
  animatedWaterfalls
}) {
  const isSBG = getActiveMapId() === 'sbg';
  const rhapsodyPalette = isSBG
    ? [
        new THREE.Color('#FACC15'), // Golden Hour Firefly
        new THREE.Color('#10B981'), // Emerald Mist
        new THREE.Color('#FDE68A'), // Warm Heritage Lantern
        new THREE.Color('#34D399'), // Rainforest Glow
        new THREE.Color('#F59E0B')  // Orchid Amber
      ]
    : [
        new THREE.Color('#EC4899'), // Electric Magenta
        new THREE.Color('#06B6D4'), // Cyber Cyan
        new THREE.Color('#FACC15'), // Solar Gold
        new THREE.Color('#A855F7'), // Neon Violet
        new THREE.Color('#10B981')  // Emerald Mint
      ];
  const scratchColorA = new THREE.Color();
  const scratchColorB = new THREE.Color();
  const scratchColorGlass = new THREE.Color();

  function sampleRhapsodyPalette(t, outColor) {
    const count = rhapsodyPalette.length;
    const wrapped = ((t % 1) + 1) % 1;
    const scaled = wrapped * count;
    const idxA = Math.floor(scaled) % count;
    const idxB = (idxA + 1) % count;
    const frac = scaled - Math.floor(scaled);
    const s = frac * frac * (3 - 2 * frac);
    return outColor.copy(rhapsodyPalette[idxA]).lerp(rhapsodyPalette[idxB], s);
  }

  function ensureBaseMaterialState(mat, fallbackEmissiveHex = 0xF59E0B) {
    if (!mat || !mat.userData) return;
    if (!mat.userData._rhapsodyInitialized) {
      mat.userData._rhapsodyInitialized = true;
      if (mat.color) {
        mat.userData.baseColor = mat.color.clone();
      }
      if (mat.emissive) {
        const lum = mat.emissive.r + mat.emissive.g + mat.emissive.b;
        mat.userData.baseEmissive =
          lum > 0.02 ? mat.emissive.clone() : new THREE.Color(fallbackEmissiveHex);
      }
    }
  }

  for (const cMat of supertreeCanopyMaterials) {
    ensureBaseMaterialState(cMat, 0xD97706);
  }
  for (const eMat of supertreeEmissiveMaterials) {
    ensureBaseMaterialState(eMat, 0xF59E0B);
  }

  function createFireflySpriteTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.35, 'rgba(255, 248, 220, 0.85)');
      grad.addColorStop(0.7, 'rgba(244, 114, 182, 0.28)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  const FIREFLY_COUNT = 60;
  const fireflyPositions = new Float32Array(FIREFLY_COUNT * 3);
  const fireflyColors = new Float32Array(FIREFLY_COUNT * 3);
  const fireflySeeds = [];

  const sbgFireflyHubs = [
    { x: 5.5, z: 32.0, r: 10.5 },  // Bandstand Hill & Lawn E
    { x: -2.0, z: 43.0, r: 9.0 },  // Swan Lake
    { x: 3.6, z: -4.4, r: 10.0 },  // Symphony Lake
    { x: -43.0, z: 31.0, r: 9.5 }  // Keppel Discovery Wetlands
  ];

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const angle = (i * 2.3999632) % (Math.PI * 2);
    let baseX;
    let baseY;
    let baseZ;
    if (isSBG) {
      const hub = sbgFireflyHubs[i % sbgFireflyHubs.length];
      const radius = 1.8 + ((i % 15) / 15) * hub.r;
      baseX = hub.x + Math.cos(angle) * radius;
      baseZ = hub.z + Math.sin(angle) * radius;
      baseY = 1.2 + ((i * 5) % 9) * 0.45;
    } else if (i < 40) {
      const radius = 3.2 + (i / 40) * 15.5;
      baseX = Math.cos(angle) * radius;
      baseZ = Math.sin(angle) * radius;
      baseY = 1.4 + ((i * 7) % 11) * 0.72;
    } else {
      const lakeIdx = i - 40;
      const radius = 2.5 + (lakeIdx / 20) * 11.0;
      baseX = -32.0 + Math.cos(angle) * radius;
      baseZ = -4.0 + Math.sin(angle) * radius;
      baseY = 1.0 + ((lakeIdx * 5) % 7) * 0.45;
    }

    fireflyPositions[i * 3] = baseX;
    fireflyPositions[i * 3 + 1] = baseY;
    fireflyPositions[i * 3 + 2] = baseZ;

    const c = rhapsodyPalette[i % rhapsodyPalette.length];
    fireflyColors[i * 3] = c.r;
    fireflyColors[i * 3 + 1] = c.g;
    fireflyColors[i * 3 + 2] = c.b;

    fireflySeeds.push({
      baseX,
      baseY,
      baseZ,
      phase: i * 0.73,
      speed: 1.35 + (i % 7) * 0.22,
      driftRadius: 0.35 + (i % 5) * 0.12
    });
  }

  const fireflyGeo = new THREE.BufferGeometry();
  fireflyGeo.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
  fireflyGeo.setAttribute('color', new THREE.BufferAttribute(fireflyColors, 3));

  const fireflyMat = new THREE.PointsMaterial({
    size: 0.75,
    map: createFireflySpriteTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const rhapsodyFireflies = new THREE.Points(fireflyGeo, fireflyMat);
  rhapsodyFireflies.name = 'GardenRhapsodyFireflies';
  rhapsodyFireflies.visible = false;
  landmarksGroup.add(rhapsodyFireflies);

  let currentNightGlow = 0.22;
  let currentVibrant = 1.25;
  let currentIsNightShow = false;
  let lastDayGlowKey = '';

  function applyWaveToMaterials(mats, fallbackHex, elapsedSeconds, speedScale, idxStep, phaseOffset, colorBlend, glowScale, nightGlow, vibrant, rhapsodyBlend, waveRateBoost, scratch) {
    for (let idx = 0; idx < mats.length; idx++) {
      const mat = mats[idx];
      ensureBaseMaterialState(mat, fallbackHex);
      const pulse = 1.0 + 0.42 * Math.sin(elapsedSeconds * 4.8 * waveRateBoost + idx * 0.65);
      const waveColor = sampleRhapsodyPalette(elapsedSeconds * speedScale * waveRateBoost + idx * idxStep + phaseOffset, scratch);
      if (mat.emissive && mat.userData.baseEmissive) {
        mat.emissive.copy(mat.userData.baseEmissive).lerp(waveColor, rhapsodyBlend);
      }
      if (mat.color && mat.userData.baseColor) {
        mat.color.copy(mat.userData.baseColor).lerp(waveColor, rhapsodyBlend * colorBlend);
      }
      if ('emissiveIntensity' in mat) {
        mat.emissiveIntensity = nightGlow * glowScale * vibrant * pulse;
      }
    }
  }

  function resetMaterialsToDaytime(mats, fallbackHex, emissiveIntensity) {
    for (const mat of mats) {
      ensureBaseMaterialState(mat, fallbackHex);
      if (mat.color && mat.userData.baseColor) mat.color.copy(mat.userData.baseColor);
      if (mat.emissive && mat.userData.baseEmissive) mat.emissive.copy(mat.userData.baseEmissive);
      if ('emissiveIntensity' in mat) mat.emissiveIntensity = emissiveIntensity;
    }
  }

  function applySupertreeAndFireflyGlow(elapsedSeconds = 0) {
    const nightGlow = currentNightGlow;
    const vibrant = currentVibrant;
    const isRhapsodyActive = nightGlow > 0.5 || currentIsNightShow;

    if (isRhapsodyActive) {
      lastDayGlowKey = '';
      const rhapsodyBlend = Math.max(0, Math.min(1, (nightGlow - 0.5) / 0.75));
      const waveRateBoost = nightGlow > 1.8 ? 1.45 : 1.0;

      applyWaveToMaterials(supertreeCanopyMaterials, 0xD97706, elapsedSeconds, 0.25, 0.09, 0.15, 0.62, 0.52, nightGlow, vibrant, rhapsodyBlend, waveRateBoost, scratchColorA);
      applyWaveToMaterials(supertreeEmissiveMaterials, 0xF59E0B, elapsedSeconds, 0.30, 0.11, 0.0, 0.72, 1.05, nightGlow, vibrant, rhapsodyBlend, waveRateBoost, scratchColorB);

      const glassEmissive = rhapsodyBlend * 0.45 * Math.min(1.6, nightGlow * 0.7);
      for (let idx = 0; idx < conservatoryGlassMaterials.length; idx++) {
        const gMat = conservatoryGlassMaterials[idx];
        if (gMat?.emissive) {
          gMat.emissive.copy(sampleRhapsodyPalette(elapsedSeconds * 0.16 + idx * 0.25 + 0.35, scratchColorGlass));
          gMat.emissiveIntensity = glassEmissive;
        }
      }
    } else {
      // Skip redundant daytime material resets when glow & vibrancy haven't changed
      const dayKey = `${nightGlow.toFixed(3)}_${vibrant.toFixed(2)}`;
      if (lastDayGlowKey !== dayKey) {
        lastDayGlowKey = dayKey;
        resetMaterialsToDaytime(supertreeCanopyMaterials, 0xD97706, nightGlow * 0.42 * vibrant);
        resetMaterialsToDaytime(supertreeEmissiveMaterials, 0xF59E0B, nightGlow * 0.95 * vibrant);
        for (const gMat of conservatoryGlassMaterials) {
          if (gMat?.emissive) {
            gMat.emissive.setHex(0x000000);
            gMat.emissiveIntensity = 0.0;
          }
        }
      }
    }

    const targetFireflyOpacity =
      nightGlow <= 0.42 ? 0.0 : Math.max(0, Math.min(0.96, (nightGlow - 0.42) / 1.05));
    if (targetFireflyOpacity > 0.01) {
      fireflyMat.size = 0.75 + Math.max(0, Math.min(1.5, nightGlow - 0.5)) * 0.28;
      fireflyMat.opacity = targetFireflyOpacity * (0.88 + 0.12 * Math.sin(elapsedSeconds * 3.2));
      rhapsodyFireflies.visible = true;
    } else if (rhapsodyFireflies.visible) {
      fireflyMat.opacity = 0;
      rhapsodyFireflies.visible = false;
    }
  }

  function applyMaterialSettings(settings) {
    if (!settings) return;
    for (const glassMat of conservatoryGlassMaterials) {
      if (settings.conservatoryGlassOpacity !== undefined) {
        glassMat.opacity = settings.conservatoryGlassOpacity;
        glassMat.transmission = Math.max(0.1, 1.0 - settings.conservatoryGlassOpacity * 0.85);
      }
      if (settings.conservatoryGlassMetalness !== undefined) {
        glassMat.metalness = settings.conservatoryGlassMetalness;
      }
    }

    const isNightPreset = settings.preset === 'night' || Boolean(settings.isNightShow);
    currentNightGlow = settings.nightBioluminescenceGlow ?? (isNightPreset ? 1.8 : 0.22);
    currentVibrant = settings.supertreeCanopyVibrant ?? 1.25;
    currentIsNightShow = isNightPreset || currentNightGlow > 0.6;
    lastDayGlowKey = '';

    applySupertreeAndFireflyGlow(settings.elapsedSeconds || 0);
  }

  function update(dt, elapsedSeconds = 0, cycleState = null) {
    if (cycleState) {
      if (cycleState.nightBioluminescenceGlow !== undefined) {
        currentNightGlow = cycleState.nightBioluminescenceGlow;
      }
      if (cycleState.isNightShow !== undefined || cycleState.preset !== undefined) {
        currentIsNightShow = Boolean(
          cycleState.isNightShow || cycleState.preset === 'night' || currentNightGlow > 0.6
        );
      }
    }

    for (const wf of animatedWaterfalls) {
      if (wf.material && 'emissiveIntensity' in wf.material) {
        wf.material.emissiveIntensity = 1.2 + Math.sin(elapsedSeconds * 5.0) * 0.35;
      }
    }

    applySupertreeAndFireflyGlow(elapsedSeconds);

    if (rhapsodyFireflies.visible) {
      const posAttr = fireflyGeo.getAttribute('position');
      const colorAttr = fireflyGeo.getAttribute('color');
      for (let i = 0; i < FIREFLY_COUNT; i++) {
        const seed = fireflySeeds[i];
        const t = elapsedSeconds * seed.speed + seed.phase;
        posAttr.setXYZ(
          i,
          seed.baseX + Math.cos(t * 0.7) * seed.driftRadius,
          seed.baseY + Math.sin(t * 1.3) * 0.42,
          seed.baseZ + Math.sin(t * 0.8) * seed.driftRadius
        );
        const moteColor = sampleRhapsodyPalette(elapsedSeconds * 0.18 + i * 0.07, scratchColorA);
        colorAttr.setXYZ(i, moteColor.r, moteColor.g, moteColor.b);
      }
      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  }

  return {
    rhapsodyFireflies,
    applyMaterialSettings,
    update
  };
}
