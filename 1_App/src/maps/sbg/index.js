// ============================================================================
// Map 02: Singapore Botanic Gardens (UNESCO) — Unified Map Package Barrel
// Re-exports all SBG world specs, 42 UNESCO relics, heritage landmark builders
// & multi-lake water masking (Swan Lake, Symphony Lake, Eco-Lake & Wetlands)
// (src/maps/sbg/index.js)
// ============================================================================

export {
  SBG_ISLAND_POLYGON,
  SBG_ISLAND_BOUNDS,
  SBG_SOLID_PILLARS,
  SBG_BRIDGES,
  SBG_BUILDINGS,
  SBG_ROAD_MAIN_POINTS,
  SBG_ROAD_APPROACH_POINTS,
  SBG_LAKE_CHANNEL_POINTS,
  SBG_LAKE_HALF_WIDTH,
  SBG_LAKE_ISLANDS,
  SBG_WATER_PONDS,
  SBG_HERITAGE_TREE_SPECS,
  SBG_KEY_LANDMARK_CALLOUTS,
  SBG_PLAZA_NODES,
  SBG_PATHWAY_POLYLINES,
  SBG_TACTICAL_ZONES,
  SBG_TACTICAL_SUBLABELS
} from '../../data/maps/sbg/SBGWorldMapSpec.js';

export {
  SBG_ZONE_METADATA,
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES,
  SBG_RELIC_MODEL_LABELS,
  SBG_TREASURES_CATALOG,
  SBG_RELIC_DEFINITIONS,
  detectSBGZoneFromPosition
} from '../../data/maps/sbg/SBGTreasuresCatalog.js';

export {
  SBG_WORLD_BOUNDS,
  SBG_PARK_BOUNDARY_POLYGON,
  SBG_LAKES,
  SBG_LAKE_POLYGONS,
  SBG_ENTERABLE_PORTALS,
  SBG_GATES_BRIDGES_SCULPTURES,
  SBG_ENTRANCE_GATES,
  SBG_WALKABLE_BRIDGES,
  SBG_HERITAGE_TREES_FLORA,
  SBG_WORLD_SPEC,
  isPointInPolygon2D,
  isOnSbgWalkableBridge,
  isInsideSbgWater
} from '../../data/maps/sbg/SbgWorldSpec.js';

export {
  SBG_CORES_SPEC,
  SBG_PATHWAYS_SPEC,
  SBG_PLAZA_NODES_SPEC,
  detectSbgCoreFromPosition,
  detectSbgZoneFromPosition
} from '../../data/maps/sbg/SbgZoneSpec.js';

export {
  SBG_RAW_RELICS,
  SBG_RELIC_CATALOG,
  verifySbgRelicPlacements
} from '../../data/maps/sbg/SbgRelicCatalog.js';

export { buildSBGTreesWalkwayAndConservatories } from '../../world/landmarks/sbg/SBGMainLandmarksBuilder.js';
export { buildSBGHistoricAttractions } from '../../world/landmarks/sbg/SBGAttractionsBuilder.js';

export {
  SBG_MULTI_LAKES_SPEC,
  SBG_DRY_LAKE_ISLANDS,
  SBG_STEPPING_CORRIDORS,
  isOnSBGDryLakeIslandOrCauseway,
  classifySBGChannelLakeName,
  evaluateSBGMultiLakeBasinCollision,
  getSBGMultiLakeWaterMask
} from './SBGWaterMaskSolver.js';
