// ============================================================================
// Gardens by the Bay — 3D Terrain, Waterways, Blender Foliage & 42 Treasures
// (src/world/TerrainAndTreasuresBuilder.js) — Coordinator & Re-Exporter
// ============================================================================

import { createMaterialAndTextureLibrary } from '../core/MaterialAndTextureLibrary.js';
import { buildPeninsulaTerrain } from './PeninsulaTerrainBuilder.js';
import { buildBoulevardAndVehicles } from './BoulevardAndVehiclesBuilder.js';
import { buildTropicalFoliage } from './FoliageInstancer.js';
import { buildTreasuresAndParticles } from './TreasuresAndParticlesBuilder.js';

export {
  RELIC_MODEL_RENDERS,
  RELIC_MODEL_LABELS,
  LANDMARK_HABITAT_RENDERS,
  RELIC_RARITY_TIERS,
  TREASURES_CATALOG
} from '../data/TreasuresCatalog.js';

export function buildTerrainAndTreasures(THREE, glbRegistry = null, sharedMatLib = null) {
  const safeGlb = glbRegistry && typeof glbRegistry.cloneAsset === 'function' ? glbRegistry : null;
  const matLib = sharedMatLib || createMaterialAndTextureLibrary(THREE);

  const terrainGroup = new THREE.Group();
  terrainGroup.name = 'TerrainAndFoliageGroup';

  const treasuresGroup = new THREE.Group();
  treasuresGroup.name = 'Treasures42Group';

  // 1. Peninsula Diorama, Waterways, Pathways & Walkable Bridges
  const {
    baseBevelMat,
    applyMaterialSettings,
    updateWaterRipples
  } = buildPeninsulaTerrain(THREE, terrainGroup, matLib);

  // 2. Marina Gardens Drive Boulevard, Main Entrance Drop-Off Loop & Animated Vehicles
  const {
    miniatureCars,
    updateVehicles
  } = buildBoulevardAndVehicles(THREE, terrainGroup, matLib, baseBevelMat);

  // 3. 195 Deterministic Multi-Species Tropical Trees
  buildTropicalFoliage(THREE, terrainGroup, safeGlb, matLib);

  // 4. 42 Collectible Treasure Pedestals & Celebratory Particle Bursts
  const {
    treasuresList,
    collectTreasure,
    resetAllTreasures,
    spawnCelebrationBurst,
    spawnFinaleFirework,
    spawnTitleShowFireworkSalvo,
    getActiveBurstCount,
    checkWindDashRing,
    spawnGoldenVandaJackpot,
    updateTreasuresAndBursts
  } = buildTreasuresAndParticles(THREE, terrainGroup, treasuresGroup, safeGlb, matLib);

  function update(dt, elapsedSeconds) {
    updateWaterRipples(elapsedSeconds);
    updateVehicles(dt);
    updateTreasuresAndBursts(dt, elapsedSeconds);
  }

  return {
    terrainGroup,
    treasuresGroup,
    treasuresList,
    miniatureCars,
    collectTreasure,
    spawnCelebrationBurst,
    spawnFinaleFirework,
    spawnTitleShowFireworkSalvo,
    getActiveBurstCount,
    checkWindDashRing,
    spawnGoldenVandaJackpot,
    resetAllTreasures,
    applyMaterialSettings,
    update
  };
}
