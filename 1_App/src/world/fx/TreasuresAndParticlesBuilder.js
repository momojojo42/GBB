// ============================================================================
// Gardens by the Bay — 42 Collectible Treasure Pedestals, Rarity Auras,
// Scenic Bridge Wind-Dash Turbo Rings, Golden Vanda Sky-Drop & Particle Bursts
// (src/world/TreasuresAndParticlesBuilder.js)
// ============================================================================

import { TREASURES_CATALOG } from '../../data/TreasuresCatalog.js';
import { getTerrainElevationAt, registerRelicPedestals } from '../WorldPhysicsEngine.js';
import { createCelebrationParticlesAndJackpot } from './CelebrationParticlesSystem.js';
import {
  generateRandomizedRelicCoordinates,
  buildWindDashRings,
  animateTreasuresAndWindRings
} from './TreasureUpdateAnimator.js';

export {
  generateRandomizedRelicCoordinates,
  buildWindDashRings,
  animateTreasuresAndWindRings
};

const RARITY_VISUAL_SPECS = {
  crown: {
    haloColor: 0xFACC15,
    beamOpacity: 0.24,
    beamHeight: 1.95,
    beamTopRadius: 0.06,
    beamBottomRadius: 0.24,
    beaconY: 1.24,
    ringCount: 2,
    ringColor: 0xFEF08A
  },
  heritage: {
    haloColor: 0xC084FC,
    beamOpacity: 0.16,
    beamHeight: 1.48,
    beamTopRadius: 0.05,
    beamBottomRadius: 0.21,
    beaconY: 1.04,
    ringCount: 1,
    ringColor: 0xE9D5FF
  },
  classic: {
    haloColor: 0x34D399,
    beamOpacity: 0.10,
    beamHeight: 1.12,
    beamTopRadius: 0.04,
    beamBottomRadius: 0.18,
    beaconY: 0.90,
    ringCount: 0,
    ringColor: 0x6EE7B7
  }
};

export function buildTreasuresAndParticles(THREE, terrainGroup, treasuresGroup, glbRegistry, matLib) {
  const treasuresList = [];
  const goldHaloGeo = new THREE.RingGeometry(0.38, 0.56, 32);
  goldHaloGeo.rotateX(-Math.PI / 2);
  const crownHaloOuterGeo = new THREE.RingGeometry(0.58, 0.68, 32);
  crownHaloOuterGeo.rotateX(-Math.PI / 2);

  const beamGeometries = {
    crown: new THREE.CylinderGeometry(
      RARITY_VISUAL_SPECS.crown.beamTopRadius,
      RARITY_VISUAL_SPECS.crown.beamBottomRadius,
      RARITY_VISUAL_SPECS.crown.beamHeight,
      14,
      1,
      true
    ),
    heritage: new THREE.CylinderGeometry(
      RARITY_VISUAL_SPECS.heritage.beamTopRadius,
      RARITY_VISUAL_SPECS.heritage.beamBottomRadius,
      RARITY_VISUAL_SPECS.heritage.beamHeight,
      12,
      1,
      true
    ),
    classic: new THREE.CylinderGeometry(
      RARITY_VISUAL_SPECS.classic.beamTopRadius,
      RARITY_VISUAL_SPECS.classic.beamBottomRadius,
      RARITY_VISUAL_SPECS.classic.beamHeight,
      12,
      1,
      true
    )
  };

  const beaconDiamondGeo = new THREE.OctahedronGeometry(0.10, 0);
  const sharedCrownRingGeo = new THREE.TorusGeometry(0.31, 0.022, 10, 28);
  const sharedCrownInnerRingGeo = new THREE.TorusGeometry(0.24, 0.018, 10, 24);
  const sharedCrownRingMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
  const sharedCrownInnerRingMat = new THREE.MeshBasicMaterial({ color: 0xFACC15 });
  const sharedHeritageRingMat = new THREE.MeshBasicMaterial({ color: 0xE9D5FF });

  const beaconMats = {
    crown: new THREE.MeshBasicMaterial({ color: 0xFEF08A, transparent: true, opacity: 0.90 }),
    heritage: new THREE.MeshBasicMaterial({ color: 0xE9D5FF, transparent: true, opacity: 0.84 }),
    classic: new THREE.MeshBasicMaterial({ color: 0x6EE7B7, transparent: true, opacity: 0.78 })
  };

  const haloMats = {
    crown: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.crown.haloColor, side: THREE.DoubleSide, transparent: true, opacity: 0.88 }),
    heritage: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.heritage.haloColor, side: THREE.DoubleSide, transparent: true, opacity: 0.80 }),
    classic: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.classic.haloColor, side: THREE.DoubleSide, transparent: true, opacity: 0.72 })
  };
  const sharedCrownOuterHaloMat = new THREE.MeshBasicMaterial({
    color: 0xFEF08A,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.48
  });
  const beamMats = {
    crown: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.crown.haloColor, transparent: true, opacity: RARITY_VISUAL_SPECS.crown.beamOpacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    heritage: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.heritage.haloColor, transparent: true, opacity: RARITY_VISUAL_SPECS.heritage.beamOpacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    classic: new THREE.MeshBasicMaterial({ color: RARITY_VISUAL_SPECS.classic.haloColor, transparent: true, opacity: RARITY_VISUAL_SPECS.classic.beamOpacity, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
  };
  const fallbackCoreMats = {
    crown: new THREE.MeshStandardMaterial({ color: RARITY_VISUAL_SPECS.crown.haloColor, emissive: RARITY_VISUAL_SPECS.crown.haloColor, emissiveIntensity: 0.45, roughness: 0.2, metalness: 0.65 }),
    heritage: new THREE.MeshStandardMaterial({ color: RARITY_VISUAL_SPECS.heritage.haloColor, emissive: RARITY_VISUAL_SPECS.heritage.haloColor, emissiveIntensity: 0.45, roughness: 0.2, metalness: 0.65 }),
    classic: new THREE.MeshStandardMaterial({ color: RARITY_VISUAL_SPECS.classic.haloColor, emissive: RARITY_VISUAL_SPECS.classic.haloColor, emissiveIntensity: 0.45, roughness: 0.2, metalness: 0.65 })
  };

  const sharedFallbackPedGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.25, 8);
  const sharedFallbackPedMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.4 });
  const sharedFallbackCoreGeo = new THREE.OctahedronGeometry(0.22, 1);

  const scratchBox = new THREE.Box3();
  const scratchCenter = new THREE.Vector3();
  const scratchSize = new THREE.Vector3();

  for (const item of TREASURES_CATALOG) {
    const tGroup = new THREE.Group();
    const relicBaseY = getTerrainElevationAt(item.x, item.z);
    tGroup.position.set(item.x, relicBaseY, item.z);

    const rarityKey = item.rarity && RARITY_VISUAL_SPECS[item.rarity] ? item.rarity : 'classic';
    const rSpec = RARITY_VISUAL_SPECS[rarityKey];
    const accentColor = rSpec.haloColor;

    // Compact Ground Contact Shadow + Shared Rarity Halo Ring
    tGroup.add(matLib.createContactShadowDisc(0.52, 0.52, 0.05));

    const haloMesh = new THREE.Mesh(goldHaloGeo, haloMats[rarityKey]);
    haloMesh.position.y = 0.08;
    tGroup.add(haloMesh);

    if (rarityKey === 'crown') {
      const outerHalo = new THREE.Mesh(crownHaloOuterGeo, sharedCrownOuterHaloMat);
      outerHalo.position.y = 0.085;
      tGroup.add(outerHalo);
    }

    // Shared rarity-differentiated sky beam & beacon
    const beamMesh = new THREE.Mesh(beamGeometries[rarityKey], beamMats[rarityKey]);
    beamMesh.position.y = rSpec.beamHeight * 0.5 + 0.05;
    tGroup.add(beamMesh);

    const beaconDiamond = new THREE.Mesh(beaconDiamondGeo, beaconMats[rarityKey]);
    beaconDiamond.position.y = rSpec.beaconY;
    tGroup.add(beaconDiamond);

    // Clone Blender Ornate Pedestal (`Relic_Pedestal`) scaled compactly below knee-height
    const pedestalClone = glbRegistry ? glbRegistry.cloneAsset('Relic_Pedestal', false) : null;
    if (pedestalClone) {
      pedestalClone.scale.setScalar(0.48);
      tGroup.add(pedestalClone);
    } else {
      const fallbackPed = new THREE.Mesh(sharedFallbackPedGeo, sharedFallbackPedMat);
      fallbackPed.position.y = 0.125;
      tGroup.add(fallbackPed);
    }

    // Floating & Rotating Blender Relic Mesh (compact ~0.44m size)
    const relicHolder = new THREE.Group();
    relicHolder.position.y = 0.54;

    const glbRelic = glbRegistry
      ? (glbRegistry.getRelicModel ? glbRegistry.getRelicModel(item) : glbRegistry.cloneAsset(item.sbgGlbModel || item.glbModel, false))
      : null;

    if (glbRelic) {
      glbRelic.updateMatrixWorld(true);
      scratchBox.setFromObject(glbRelic);
      scratchBox.getCenter(scratchCenter);
      scratchBox.getSize(scratchSize);
      const maxDim = Math.max(scratchSize.x, scratchSize.y, scratchSize.z, 0.5);
      const targetScale = 0.44 / maxDim;
      glbRelic.position.sub(scratchCenter).multiplyScalar(targetScale);
      glbRelic.scale.setScalar(targetScale);
      relicHolder.add(glbRelic);
    } else {
      relicHolder.add(new THREE.Mesh(sharedFallbackCoreGeo, fallbackCoreMats[rarityKey]));
    }

    // Floating Rarity Torus Rings
    const floatingRings = [];
    if (rarityKey === 'crown') {
      const outerCrownRing = new THREE.Mesh(sharedCrownRingGeo, sharedCrownRingMat);
      outerCrownRing.rotation.x = 0.35;
      relicHolder.add(outerCrownRing);
      const innerCrownRing = new THREE.Mesh(sharedCrownInnerRingGeo, sharedCrownInnerRingMat);
      innerCrownRing.rotation.y = Math.PI * 0.5;
      innerCrownRing.rotation.x = -0.45;
      relicHolder.add(innerCrownRing);
      floatingRings.push(outerCrownRing, innerCrownRing);
    } else if (rarityKey === 'heritage') {
      const heritageRing = new THREE.Mesh(sharedCrownRingGeo, sharedHeritageRingMat);
      heritageRing.rotation.x = 0.28;
      relicHolder.add(heritageRing);
      floatingRings.push(heritageRing);
    }

    tGroup.add(relicHolder);
    treasuresGroup.add(tGroup);

    treasuresList.push({
      ...item,
      shortName: item.shortName,
      ahaHook: item.ahaHook,
      rarity: rarityKey,
      points: item.points,
      toyAction: item.toyAction,
      toyReaction: item.toyReaction,
      accentColor,
      baseBeamOpacity: rSpec.beamOpacity,
      baseBeaconY: rSpec.beaconY,
      floatingRings,
      position: { x: item.x, y: relicBaseY, z: item.z },
      collected: false,
      collectedBy: null,
      meshGroup: tGroup,
      relicHolder,
      haloMesh,
      beamMesh,
      beaconDiamond
    });
  }

  function randomizeRelicLocations() {
    const baseRelics = treasuresList.filter((t) => !t.isJackpotRelic);
    const randomCoords = generateRandomizedRelicCoordinates(baseRelics.length);
    for (let i = 0; i < baseRelics.length; i++) {
      const t = baseRelics[i];
      const spot = randomCoords[i];
      if (!spot) continue;
      const newY = getTerrainElevationAt(spot.x, spot.z);
      t.x = spot.x;
      t.z = spot.z;
      t.position.x = spot.x;
      t.position.y = newY;
      t.position.z = spot.z;
      if (spot.zoneLabel) {
        t.zoneName = spot.zoneLabel;
      }
      if (t.meshGroup) {
        t.meshGroup.position.set(spot.x, newY, spot.z);
      }
    }
    registerRelicPedestals(treasuresList);
  }

  randomizeRelicLocations();

  const particlesAndJackpot = createCelebrationParticlesAndJackpot({
    THREE,
    terrainGroup,
    treasuresGroup,
    glbRegistry,
    matLib,
    treasuresList,
    beaconDiamondGeo,
    beaconMats,
    sharedFallbackPedGeo,
    sharedFallbackPedMat,
    sharedFallbackCoreGeo,
    sharedCrownRingGeo,
    sharedCrownRingMat,
    sharedCrownInnerRingGeo,
    sharedCrownInnerRingMat
  });

  // --------------------------------------------------------------------------
  // 4 Scenic Bridge "Wind-Dash" Turbo Rings
  // --------------------------------------------------------------------------
  const windDashRings = buildWindDashRings(THREE, terrainGroup);

  function checkWindDashRing(x, z, elapsedSeconds = performance.now() * 0.001) {
    for (const ring of windDashRings) {
      const dist = Math.hypot(x - ring.x, z - ring.z);
      if (dist <= 2.1 && elapsedSeconds - ring.lastTriggeredAt >= 4.5) {
        ring.lastTriggeredAt = elapsedSeconds;
        particlesAndJackpot.spawnCelebrationBurst(ring.x, ring.baseY, ring.z, 0x22D3EE, true);
        return { triggered: true, ring };
      }
    }
    return null;
  }

  function collectTreasure(id, collectorId = 'you') {
    const target = treasuresList.find((t) => Number(t.id) === Number(id));
    if (!target || target.collected) return null;
    target.collected = true;
    target.collectedBy = collectorId;
    target.meshGroup.visible = false;
    particlesAndJackpot.spawnCelebrationBurst(
      target.position.x,
      target.position.y || 0,
      target.position.z,
      target.accentColor || 0xFACC15,
      collectorId === 'you'
    );
    if (target.isJackpotRelic || target.rarity === 'crown') {
      particlesAndJackpot.spawnFinaleFirework(target.position.x, target.position.y || 0, target.position.z);
    }
    return target;
  }

  function resetAllTreasures() {
    particlesAndJackpot.resetJackpot();
    randomizeRelicLocations();
    for (const t of treasuresList) {
      t.collected = false;
      t.collectedBy = null;
      t.meshGroup.visible = true;
    }
    for (const ring of windDashRings) {
      ring.lastTriggeredAt = -999;
    }
  }

  function updateTreasuresAndBursts(dt, elapsedSeconds) {
    animateTreasuresAndWindRings(
      treasuresList,
      windDashRings,
      particlesAndJackpot,
      dt,
      elapsedSeconds
    );
  }

  return {
    treasuresList,
    windDashRings,
    checkWindDashRing,
    spawnGoldenVandaJackpot: particlesAndJackpot.spawnGoldenVandaJackpot,
    collectTreasure,
    resetAllTreasures,
    spawnCelebrationBurst: particlesAndJackpot.spawnCelebrationBurst,
    spawnFinaleFirework: particlesAndJackpot.spawnFinaleFirework,
    spawnTitleShowFireworkSalvo: particlesAndJackpot.spawnTitleShowFireworkSalvo,
    getActiveBurstCount: particlesAndJackpot.getActiveBurstCount,
    updateTreasuresAndBursts
  };
}
