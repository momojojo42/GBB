// ============================================================================
// Gardens by the Bay — Unified World Physics, Water Shoreline & Collision Engine
// (src/world/WorldPhysicsEngine.js)
//
// Barrel coordinator re-exporting modularized world geometry specs, heightmap
// elevation math, deterministic tropical tree generation, and character
// movement / collision / waypoint solvers.
// ============================================================================

export {
  BOOMERANG_ISLAND_POLYGON,
  ISLAND_BOUNDS,
  WORLD_BRIDGES,
  WORLD_BUILDINGS,
  SOLID_PILLARS,
  ROAD_MAIN_POINTS,
  ROAD_APPROACH_POINTS,
  LAKE_CHANNEL_POINTS,
  LAKE_HALF_WIDTH,
  WATER_PONDS,
  SUPERTREE_PLANTER_SPECS,
  KEY_LANDMARK_CALLOUTS
} from '../data/WorldMapSpec.js';

export {
  shortestAngleDiff,
  closestPointOnSegment2D,
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  isPointInsideBuilding,
  getTerrainElevationAt
} from './physics/TerrainElevation.js';

export {
  TREE_SPECIES_SCHEMA,
  generateDeterministicWorldTrees,
  WORLD_TREES
} from './terrain/TreeGenerator.js';

export {
  getWaterCollision,
  registerRelicPedestals,
  resolveCharacterMovement,
  getSmartNavigationWaypoint,
  estimateNavigationPathDistance
} from './physics/WaterAndCollisionSolver.js';
