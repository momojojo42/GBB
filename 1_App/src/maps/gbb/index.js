// ============================================================================
// Map 01: Gardens by the Bay (Bay South) — Unified Map Package Barrel
// Re-exports all GBB world specs, 42 relics, landmark builders & water masking
// so callers can import cleanly from `src/maps/gbb/` or legacy `src/data/`
// (src/maps/gbb/index.js)
// ============================================================================

export {
  WORLD_BRIDGES,
  WORLD_BUILDINGS,
  ROAD_MAIN_POINTS,
  ROAD_APPROACH_POINTS,
  LAKE_CHANNEL_POINTS,
  LAKE_HALF_WIDTH,
  LAKE_ISLANDS,
  WATER_PONDS,
  SUPERTREE_PLANTER_SPECS,
  KEY_LANDMARK_CALLOUTS
} from '../../data/maps/gbb/WorldStructuresAndPathsSpec.js';

export {
  BOOMERANG_ISLAND_POLYGON,
  ISLAND_BOUNDS,
  SOLID_PILLARS
} from '../../data/WorldMapSpec.js';

export {
  TREASURES_CATALOG,
  RELIC_DEFINITIONS,
  ZONE_METADATA,
  RELIC_CATEGORY_LABELS,
  RELIC_CATEGORY_THEMES,
  RELIC_MODEL_RENDERS,
  RELIC_MODEL_LABELS,
  LANDMARK_HABITAT_RENDERS
} from '../../data/TreasuresCatalog.js';

export { buildSupertreesSkywayAndDomes } from '../../world/landmarks/gbb/SupertreesAndDomesBuilder.js';
export { buildProceduralVisitorAttractions } from '../../world/landmarks/gbb/ProceduralAttractionsBuilder.js';

export {
  GBB_DRY_LAKE_ISLANDS,
  GBB_STEPPING_CORRIDORS,
  isOnGBBDryLakeIslandOrCorridor,
  getGBBWaterMask
} from './GBBWaterMaskSolver.js';
