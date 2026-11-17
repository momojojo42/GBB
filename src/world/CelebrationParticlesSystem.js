// ============================================================================
// Gardens by the Bay — Golden Vanda Sky-Drop Jackpot & Celebratory Particle Bursts
// (src/world/CelebrationParticlesSystem.js)
// ============================================================================

import {
  RELIC_MODEL_RENDERS,
  LANDMARK_HABITAT_RENDERS,
  RELIC_MODEL_LABELS
} from '../data/TreasuresCatalog.js';
import { getTerrainElevationAt } from './WorldPhysicsEngine.js';
import { createFireworksBurstHelper, TITLE_FIREWORK_SALVOS } from './FireworksBurstHelper.js';

export { createFireworksBurstHelper, TITLE_FIREWORK_SALVOS };

export function createCelebrationParticlesAndJackpot({
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
}) {
  const {
    spawnCelebrationBurst,
    spawnFinaleFirework,
    spawnTitleShowFireworkSalvo,
    getActiveBurstCount,
    updateBursts
  } = createFireworksBurstHelper(THREE, terrainGroup);

  let goldenVandaJackpotEntry = null;

  function spawnGoldenVandaJackpot() {
    const jx = 0;
    const jz = 2;
    const jBaseY = getTerrainElevationAt(jx, jz);

    if (!goldenVandaJackpotEntry) {
      const jGroup = new THREE.Group();
      jGroup.position.set(jx, jBaseY, jz);

      const shadow = matLib.createContactShadowDisc(0.75, 0.75, 0.05);
      jGroup.add(shadow);

      const jHaloGeo = new THREE.RingGeometry(0.46, 0.78, 36);
      jHaloGeo.rotateX(-Math.PI / 2);
      const jHaloMat = new THREE.MeshBasicMaterial({
        color: 0xFACC15,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.94
      });
      const jHaloMesh = new THREE.Mesh(jHaloGeo, jHaloMat);
      jHaloMesh.position.y = 0.09;
      jGroup.add(jHaloMesh);

      const skyPillarGeo = new THREE.CylinderGeometry(0.14, 0.44, 8.5, 16, 1, true);
      const skyPillarMat = new THREE.MeshBasicMaterial({
        color: 0xFACC15,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      });
      const jBeamMesh = new THREE.Mesh(skyPillarGeo, skyPillarMat);
      jBeamMesh.position.y = 4.25;
      jGroup.add(jBeamMesh);

      const jBeacon = new THREE.Mesh(beaconDiamondGeo, beaconMats.crown);
      jBeacon.scale.setScalar(1.45);
      jBeacon.position.y = 1.45;
      jGroup.add(jBeacon);

      const pedestalClone = glbRegistry ? glbRegistry.cloneAsset('Relic_Pedestal', false) : null;
      if (pedestalClone) {
        pedestalClone.scale.setScalar(0.56);
        jGroup.add(pedestalClone);
      } else {
        const fallbackPed = new THREE.Mesh(sharedFallbackPedGeo, sharedFallbackPedMat);
        fallbackPed.position.y = 0.14;
        jGroup.add(fallbackPed);
      }

      const relicHolder = new THREE.Group();
      relicHolder.position.y = 0.62;

      const glbRelic = glbRegistry ? glbRegistry.cloneAsset('Relic_01', false) : null;
      if (glbRelic) {
        const box = new THREE.Box3().setFromObject(glbRelic);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z, 0.5);
        const targetScale = 0.56 / maxDim;
        glbRelic.position.sub(center).multiplyScalar(targetScale);
        glbRelic.scale.setScalar(targetScale);
        relicHolder.add(glbRelic);
      } else {
        const fallbackMat = new THREE.MeshStandardMaterial({
          color: 0xFACC15,
          emissive: 0xFACC15,
          emissiveIntensity: 0.7,
          roughness: 0.15,
          metalness: 0.85
        });
        const coreMesh = new THREE.Mesh(sharedFallbackCoreGeo, fallbackMat);
        coreMesh.scale.setScalar(1.25);
        relicHolder.add(coreMesh);
      }

      const outerCrownRing = new THREE.Mesh(sharedCrownRingGeo, sharedCrownRingMat);
      outerCrownRing.scale.setScalar(1.25);
      outerCrownRing.rotation.x = 0.4;
      relicHolder.add(outerCrownRing);

      const innerCrownRing = new THREE.Mesh(sharedCrownInnerRingGeo, sharedCrownInnerRingMat);
      innerCrownRing.scale.setScalar(1.25);
      innerCrownRing.rotation.y = Math.PI * 0.5;
      innerCrownRing.rotation.x = -0.4;
      relicHolder.add(innerCrownRing);

      jGroup.add(relicHolder);
      treasuresGroup.add(jGroup);

      goldenVandaJackpotEntry = {
        id: 99,
        name: '👑 Golden Vanda Sky-Drop',
        shortName: 'Golden Vanda Jackpot',
        ahaHook: 'Mid-match 24K Sky-Drop Jackpot!',
        fact: 'Mid-match 24K Sky-Drop Jackpot!',
        toyAction: 'lantern_glow',
        toyReaction: '👑 500 PT JACKPOT!',
        category: 'orchid',
        glbModel: 'Relic_01',
        habitatKey: 'supertree_hero',
        zoneName: 'Supertree Grove',
        icon: '👑',
        x: jx,
        z: jz,
        isLandmarkRelic: true,
        isJackpotRelic: true,
        rarity: 'crown',
        rarityLabel: '👑 Sky-Drop',
        rarityBadge: '👑 +500',
        rarityColor: '#FACC15',
        points: 500,
        image: RELIC_MODEL_RENDERS.Relic_01,
        landmarkImage: LANDMARK_HABITAT_RENDERS.supertree_hero,
        pedestalImage: RELIC_MODEL_RENDERS.Relic_Pedestal,
        glbModelLabel: RELIC_MODEL_LABELS.Relic_01,
        accentColor: 0xFACC15,
        baseBeamOpacity: 0.34,
        baseBeaconY: 1.45,
        floatingRings: [outerCrownRing, innerCrownRing],
        position: { x: jx, y: jBaseY, z: jz },
        collected: false,
        collectedBy: null,
        meshGroup: jGroup,
        relicHolder,
        haloMesh: jHaloMesh,
        beamMesh: jBeamMesh,
        beaconDiamond: jBeacon
      };
    }

    goldenVandaJackpotEntry.collected = false;
    goldenVandaJackpotEntry.collectedBy = null;
    goldenVandaJackpotEntry.meshGroup.visible = true;

    if (!treasuresList.includes(goldenVandaJackpotEntry)) {
      treasuresList.push(goldenVandaJackpotEntry);
    }

    spawnCelebrationBurst(jx, jBaseY, jz, 0xFACC15, true);
    spawnFinaleFirework(jx, jBaseY + 1.2, jz);
    return goldenVandaJackpotEntry;
  }

  function resetJackpot() {
    if (goldenVandaJackpotEntry) {
      goldenVandaJackpotEntry.collected = false;
      goldenVandaJackpotEntry.collectedBy = null;
      goldenVandaJackpotEntry.meshGroup.visible = false;
      const jIdx = treasuresList.indexOf(goldenVandaJackpotEntry);
      if (jIdx !== -1) treasuresList.splice(jIdx, 1);
    }
  }

  return {
    spawnCelebrationBurst,
    spawnFinaleFirework,
    spawnTitleShowFireworkSalvo,
    getActiveBurstCount,
    spawnGoldenVandaJackpot,
    resetJackpot,
    updateBursts
  };
}
