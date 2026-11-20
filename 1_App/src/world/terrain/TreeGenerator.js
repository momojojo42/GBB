// ============================================================================
// Gardens by the Bay — Deterministic 195 Tropical Trees Layout & Trunk Colliders
// (src/world/TreeGenerator.js)
// Shared 1:1 between visual foliage instancing and physics trunk collision.
// ============================================================================

import * as THREE from 'three';
import {
  WORLD_BUILDINGS,
  WORLD_BRIDGES,
  SOLID_PILLARS,
  ROAD_MAIN_POINTS,
  ROAD_APPROACH_POINTS,
  WATER_PONDS,
  LAKE_CHANNEL_POINTS,
  LAKE_HALF_WIDTH
} from '../../data/WorldMapSpec.js';
import { getActiveMapId } from '../../data/MapRegistry.js';
import { SBG_PLAZA_NODES } from '../../data/maps/sbg/SBGStructuresAndPathsSpec.js';
import { SBG_RAW_TREASURES_1_TO_21 } from '../../data/maps/sbg/SBGTreasuresZones1To3.js';
import { SBG_RAW_TREASURES_22_TO_42 } from '../../data/maps/sbg/SBGTreasuresZones4To5.js';
import {
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  closestPointOnSegment2D,
  getTerrainElevationAt
} from '../physics/TerrainElevation.js';

export const TREE_SPECIES_SCHEMA = [
  { name: 'Tree_RainTree', label: 'Rain Tree', trunkRadius: 0.55 },
  { name: 'Tree_RoyalPalm', label: 'Royal Palm', trunkRadius: 0.42 },
  { name: 'Tree_TravellersPalm', label: 'Traveller’s Palm', trunkRadius: 0.46 },
  { name: 'Tree_Frangipani', label: 'Frangipani Tree', trunkRadius: 0.42 },
  { name: 'Tree_GiantFern', label: 'Giant Tree Fern', trunkRadius: 0.44 },
  { name: 'Tree_Bougainvillea', label: 'Bougainvillea Tree', trunkRadius: 0.45 }
];

// Coordinates of the 4 character spawns, Main Entrance Drop-Off road, & 42 relics so no tree trunk ever spawns on top of them
export const PROTECTED_CLEARANCE_POINTS = [
  // 4 Explorer Spawns
  { x: 4, z: 11, r: 2.4 },
  { x: -8, z: -6, r: 2.4 },
  { x: 14, z: -16, r: 2.4 },
  { x: -12, z: 16, r: 2.4 },
  { x: -24, z: 8, r: 2.4 },
  // Main Entrance Red Drop-Off Roundabout & Approach Road + Coach Bay P
  { x: 28.5, z: 5.5, r: 6.5 },
  { x: 28.0, z: 12.0, r: 4.0 },
  { x: 27.5, z: 18.0, r: 4.0 },
  { x: 37.0, z: 14.5, r: 5.5 },
  // The Canopy (#2) Courtyard between Flower Dome, Cloud Forest & Floral Clock
  { x: 24.5, z: -22.5, r: 5.5 },
  // 42 Relic Coordinates
  { x: 0, z: 3, r: 1.8 }, { x: -9, z: 4, r: 1.8 }, { x: 13.5, z: -33.5, r: 1.8 },
  { x: 32.6, z: -28.4, r: 1.8 }, { x: 24.5, z: -29.0, r: 1.8 }, { x: -24.5, z: -18.5, r: 1.8 },
  { x: -11.5, z: -25.0, r: 1.8 }, { x: -6, z: -8, r: 1.8 }, { x: 40, z: 12, r: 1.8 },
  { x: -40, z: 22, r: 1.8 }, { x: 5, z: -3, r: 1.8 }, { x: -4, z: 7, r: 1.8 },
  { x: 11, z: 2, r: 1.8 }, { x: 30, z: -4, r: 1.8 }, { x: -16, z: -22, r: 1.8 },
  { x: 16.5, z: 14.5, r: 2.2 }, { x: -12, z: -3, r: 1.8 }, { x: 4, z: 14, r: 1.8 },
  { x: 22, z: -24, r: 1.8 }, { x: 34.5, z: -21.5, r: 1.8 }, { x: 13.0, z: -37.0, r: 1.8 },
  { x: 16.2, z: -37.5, r: 1.8 }, { x: 40.5, z: -23.5, r: 1.8 }, { x: 22, z: -14, r: 1.8 },
  { x: 10.5, z: -32.5, r: 1.8 }, { x: 38.2, z: -30.2, r: 1.8 }, { x: -34, z: -9, r: 2.2 },
  { x: -22, z: -16, r: 2.2 }, { x: -18, z: -26, r: 1.8 }, { x: -41, z: -12, r: 1.8 },
  { x: -24, z: -4, r: 1.8 }, { x: -23, z: -23, r: 1.8 }, { x: -14, z: -14, r: 1.8 },
  { x: -54, z: -4, r: 1.8 }, { x: -33, z: 10, r: 1.8 }, { x: -36, z: 24, r: 1.8 },
  { x: 49.5, z: 2.0, r: 1.8 }, { x: -54, z: 32, r: 2.2 }, { x: 54, z: -8, r: 3.4 },
  { x: 52, z: 18, r: 1.8 }, { x: 45, z: 14, r: 1.8 }, { x: -48, z: -18, r: 1.8 }
];

for (const b of WORLD_BUILDINGS) {
  const wp = getBuildingDoorWaypoints(b);
  PROTECTED_CLEARANCE_POINTS.push(
    { x: wp.outsideX, z: wp.outsideZ, r: 2.8 },
    { x: wp.thresholdX, z: wp.thresholdZ, r: 2.8 },
    { x: wp.insideX, z: wp.insideZ, r: 2.6 }
  );
}
for (const br of WORLD_BRIDGES) {
  PROTECTED_CLEARANCE_POINTS.push(
    { x: br.ax, z: br.az, r: 2.4 },
    { x: br.bx, z: br.bz, r: 2.4 }
  );
}

// All 11 Circular Plaza Courtyards from PeninsulaTerrainBuilder.js
export const PLAZA_CLEARANCE_NODES = [
  { x: 0, z: 0, r: 15.0 },       // #6 Supertree Grove Central Plaza
  { x: 24, z: -26, r: 12.0 },    // #2 The Canopy & Conservatories Plaza
  { x: -20, z: -16, r: 9.6 },    // #20 Heritage Gardens Plaza
  { x: -33, z: 24, r: 12.2 },    // #23 The Meadow Amphitheater Bowl
  { x: -54, z: 32, r: 8.5 },     // #21 Serene Garden SW Plaza
  { x: -50, z: -11, r: 8.2 },    // Bayfront Plaza & #26 Floral Fantasy
  { x: -39, z: -24, r: 8.0 },    // #27 Active Garden & #37 IMBA Theatre Plaza
  { x: 16.5, z: 14.5, r: 7.0 },  // #8-#14 World of Plants Plaza
  { x: 35.5, z: -7.5, r: 4.8 },  // #22 Sun Pavilion West Shore Plaza
  { x: 50.0, z: 9.5, r: 3.1 },   // #16 Kingfisher West Boardwalk Entry Plaza
  { x: 74, z: 15, r: 5.6 },      // Satay by the Bay Coastal Plaza
  // Additional forecourt & landmark nodes
  { x: 24.5, z: -22.5, r: 6.4 }, // The Canopy Courtyard
  { x: 28.5, z: 5.5, r: 4.5 },   // Main Entrance Drop-Off Plaza
  { x: -16.5, z: 14.5, r: 4.2 }, // Understorey Lattice Dome Courtyard
  { x: -36.0, z: 10.0, r: 4.6 }, // Planet Baby Plinth Forecourt
  { x: -18.0, z: -26.0, r: 4.8 },// Floral Fantasy Forecourt
  { x: 54.0, z: -8.0, r: 5.2 }   // Kingfisher Wetlands Lookout Deck
];

// Continuous pathway control point sets from PeninsulaTerrainBuilder.js & approach connectors
const RAW_PATHWAY_CONTROL_POINTS = [
  // 1. Waterfront Promenade along the North & East Marina Reservoir shore
  [[-37, -28], [-18, -36], [8, -42], [28, -36], [52, -20], [72, -4], [84, 14], [74, 24]],
  // 2. Supertree Grove (0,0) -> Silver Garden (0,-26) -> Conservatories & The Canopy (24,-26)
  [[0, 0], [-1, -24], [14, -26], [24, -26]],
  // 3. Supertree Grove (0,0) -> Golden Garden & Main Entrance Drop-Off (28.5, 1.5)
  [[0, 0], [15, -2], [28.5, 1.5]],
  // 4. Supertree Grove (0,0) -> Heritage Gardens -> Dragonfly Bridge -> Bayfront Plaza -> Active Garden
  [[0, 0], [-12, -10], [-22, -15], [-28, -6.5], [-40, -11.5], [-50, -11], [-42, -20], [-37, -28]],
  // 5. Supertree Grove (0,0) -> The Meadow (-33, 24) -> Garden Pod (-42, 38)
  [[0, 0], [-11, 14.5], [-21, 17.5], [-33, 24], [-42, 38]],
  // 6. The Meadow (-33, 24) -> South Bridge -> SW Serene Garden (-54, 32) -> Bayfront Plaza (-50, -11)
  [[-33, 24], [-42, 15], [-54, 20], [-54, 32], [-50, -11]],
  // 7. Supertree Grove (0,0) -> World of Plants (14,15) -> West Shore of Water Lily Pond (35,9.5)
  [[0, 0], [14, 15], [28, 12], [35, 9.5]],
  // 8. Kingfisher West Boardwalk Entry (50.8,9.5) -> South of Lotus Pond -> Satay by the Bay (74,15)
  [[50.8, 9.5], [53, 19], [66, 22], [74, 15]],
  // 9. Conservatory Plaza (24,-26) -> (36,-18) -> Sun Pavilion Shore (35.5,-7.5) -> The Canyon (47,-13.5) -> Kingfisher Shore (50.8,9.5)
  [[24, -26], [36, -18], [35.5, -7.5], [47, -13.5], [50.8, 1.5], [50.8, 9.5]],
  // 10. Main Entrance Approach & Boulevard Connector Spline
  [[27.5, 25.0], [28.0, 17.0], [28.5, 9.2]]
];

// Pre-compute finely subdivided CatmullRomCurve3 segments (100 segments per spline) for exact continuous clearance
const PATHWAY_SPLINE_SEGMENTS = [];
for (const pts of RAW_PATHWAY_CONTROL_POINTS) {
  const vecs = pts.map(([px, pz]) => new THREE.Vector3(px, 0, pz));
  const curve = new THREE.CatmullRomCurve3(vecs);
  const sampled = curve.getSpacedPoints(100);
  for (let i = 0; i < sampled.length - 1; i++) {
    PATHWAY_SPLINE_SEGMENTS.push({
      ax: sampled[i].x,
      az: sampled[i].z,
      bx: sampled[i + 1].x,
      bz: sampled[i + 1].z
    });
  }
}

// Placed Landmark & Multi-Building Footprints across the park
const LANDMARK_FOOTPRINT_CIRCLES = [
  { x: 74.0, z: 15.0, r: 6.2 },   // Satay_By_The_Bay
  { x: -50.0, z: -11.0, r: 5.6 }, // Floral_Fantasy
  { x: -41.0, z: -20.0, r: 4.6 }, // IMBA_Theatre
  { x: 40.5, z: -5.5, r: 4.6 },   // Sun_Pavilion
  { x: -42.0, z: 38.0, r: 4.2 },  // Garden_Pod
  { x: 37.0, z: 14.5, r: 6.0 },   // Coach_Bay_P
  { x: 24.5, z: -22.5, r: 5.2 },  // The_Canopy
  { x: -37.0, z: -28.0, r: 4.0 }, // Active_Garden
  { x: 22.0, z: -16.0, r: 4.5 },  // Floral Clock
  { x: -16.5, z: 14.5, r: 6.0 },  // The Understorey Lattice Dome
  { x: -22.0, z: -16.0, r: 5.0 }, // Indian Heritage Moon Gate
  { x: -34.0, z: -9.0, r: 5.2 },  // Chinese Heritage Pagoda
  { x: -40.0, z: 22.0, r: 5.2 },  // Malay Heritage Kampong Pavilion
  { x: -35.0, z: -20.0, r: 4.8 }, // Colonial Glass Rotunda
  { x: -54.0, z: 32.0, r: 5.6 },  // Serene Garden Japanese Tea House
  { x: -54.0, z: -4.0, r: 5.4 },  // Bayfront Plaza Pavilion
  { x: 54.0, z: -8.0, r: 5.6 },   // Kingfisher Wetlands Sanctuary
  { x: 52.0, z: 18.0, r: 5.6 },   // Kingfisher Court North
  { x: 45.0, z: 14.0, r: 5.6 },   // Kingfisher Court South
  { x: 49.5, z: 2.0, r: 5.4 },    // Sun Pavilion East
  { x: 28.5, z: 5.5, r: 6.8 },    // Main Entrance Drop-Off Canopy
  { x: -36.0, z: 10.0, r: 7.5 }   // Planet Baby Sculpture Mound
];

export function isClearOfPathsAndBuildings(x, z) {
  const isSBG = getActiveMapId() === 'sbg';
  if (!isSBG) {
    // 1. Check all continuous GBB pathway spline segments (min clearance 2.45m > 2.2m)
    for (let i = 0; i < PATHWAY_SPLINE_SEGMENTS.length; i++) {
      const seg = PATHWAY_SPLINE_SEGMENTS[i];
      const cp = closestPointOnSegment2D(x, z, seg.ax, seg.az, seg.bx, seg.bz);
      if (cp.dist < 2.45) return false;
    }
  }

  // 2. Check all circular plaza courtyards
  const activePlazas = isSBG ? SBG_PLAZA_NODES : PLAZA_CLEARANCE_NODES;
  for (let i = 0; i < activePlazas.length; i++) {
    const plaza = activePlazas[i];
    if (Math.hypot(x - plaza.x, z - plaza.z) < plaza.r + 1.05) return false;
  }

  // 3. Check all WORLD_BRIDGES segments (halfWidth + 2.2m) and bridge approaches (3.6m)
  if (getBridgeStateAt(x, z).onBridge) return false;
  for (let i = 0; i < WORLD_BRIDGES.length; i++) {
    const br = WORLD_BRIDGES[i];
    if (Math.hypot(x - br.ax, z - br.az) < 3.6) return false;
    if (Math.hypot(x - br.bx, z - br.bz) < 3.6) return false;
    const cp = closestPointOnSegment2D(x, z, br.ax, br.az, br.bx, br.bz);
    if (cp.dist < (br.halfWidth || 1.6) + 2.2) return false;
  }

  // 4. Check all WORLD_BUILDINGS rotated elliptical footprints & doorway approaches
  for (let i = 0; i < WORLD_BUILDINGS.length; i++) {
    const b = WORLD_BUILDINGS[i];
    const dx = x - b.cx;
    const dz = z - b.cz;
    const cosN = Math.cos(-(b.rotY || 0));
    const sinN = Math.sin(-(b.rotY || 0));
    const lx = dx * cosN - dz * sinN;
    const lz = dx * sinN + dz * cosN;
    const rx = (b.rx || (b.w ? b.w * 0.5 : 4.0)) * (b.outerScale || 1.0) + 1.6;
    const rz = (b.rz || (b.d ? b.d * 0.5 : 4.0)) * (b.outerScale || 1.0) + 1.6;
    if (Math.hypot(lx / rx, lz / rz) < 1.0) return false;

    const wp = getBuildingDoorWaypoints(b);
    if (Math.hypot(x - wp.outsideX, z - wp.outsideZ) < 3.4) return false;
    if (Math.hypot(x - wp.thresholdX, z - wp.thresholdZ) < 3.4) return false;
    if (Math.hypot(x - wp.insideX, z - wp.insideZ) < 3.0) return false;
  }

  // 5. Check all SOLID_PILLARS (Supertrees & Conservatory Columns) with p.r + 1.6m clearance
  for (let i = 0; i < SOLID_PILLARS.length; i++) {
    const pil = SOLID_PILLARS[i];
    if (Math.hypot(x - pil.x, z - pil.z) < pil.r + 1.6) return false;
  }

  // 6. Check all placed landmark & multi-building circular footprints
  for (let i = 0; i < LANDMARK_FOOTPRINT_CIRCLES.length; i++) {
    const lm = LANDMARK_FOOTPRINT_CIRCLES[i];
    if (Math.hypot(x - lm.x, z - lm.z) < lm.r) return false;
  }

  return true;
}

function isInWaterAtTreePlacement(x, z, radius = 1.5) {
  for (const pond of WATER_PONDS) {
    const dx = x - pond.cx;
    const dz = z - pond.cz;
    const rx = pond.rx + radius * 0.5;
    const rz = pond.rz + radius * 0.5;
    if (Math.hypot(dx / rx, dz / rz) < 1.0) return true;
  }
  const minSafeDist = LAKE_HALF_WIDTH + radius * 0.4;
  for (let i = 0; i < LAKE_CHANNEL_POINTS.length - 1; i++) {
    const p0 = LAKE_CHANNEL_POINTS[i];
    const p1 = LAKE_CHANNEL_POINTS[i + 1];
    const seg = closestPointOnSegment2D(x, z, p0.x, p0.z, p1.x, p1.z);
    if (seg.dist < minSafeDist) return true;
  }
  return false;
}

function isOnRoadAtTreePlacement(x, z, clearance = 4.6) {
  // Check Marina Gardens Drive polyline segments
  for (let i = 0; i < ROAD_MAIN_POINTS.length - 1; i++) {
    const p0 = ROAD_MAIN_POINTS[i];
    const p1 = ROAD_MAIN_POINTS[i + 1];
    const seg = closestPointOnSegment2D(x, z, p0.x, p0.z, p1.x, p1.z);
    if (seg.dist < clearance) return true;
  }
  // Check Main Entrance Approach Road segments
  for (let i = 0; i < ROAD_APPROACH_POINTS.length - 1; i++) {
    const p0 = ROAD_APPROACH_POINTS[i];
    const p1 = ROAD_APPROACH_POINTS[i + 1];
    const seg = closestPointOnSegment2D(x, z, p0.x, p0.z, p1.x, p1.z);
    if (seg.dist < clearance - 0.3) return true;
  }
  // Check Red Drop-Off Roundabout & Coach Bay P apron
  if (Math.hypot(x - 28.5, z - 5.5) < 7.2) return true;
  if (Math.hypot(x - 37.0, z - 14.5) < 6.4) return true;
  return false;
}

export function generateDeterministicWorldTrees(targetTreeCount = 195) {
  const trees = [];
  const isSBG = getActiveMapId() === 'sbg';
  const sbgRelicPts = isSBG
    ? [...SBG_RAW_TREASURES_1_TO_21, ...SBG_RAW_TREASURES_22_TO_42].map((r) => ({ x: r.x, z: r.z, r: 2.0 }))
    : [];
  let seed = 1337;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  while (trees.length < targetTreeCount) {
    const tx = isSBG ? -62 + rand() * 100 : -74 + rand() * 162;
    const tz = isSBG ? -64 + rand() * 128 : -44 + rand() * 104;
    if (!isPointInsideBoomerang(tx, tz)) continue;
    const shore = getClosestBoomerangShorePoint(tx, tz);
    if (!shore || shore.dist < 3.6) continue;

    // Keep clear of Supertree Grove core, Conservatories footprint, Planet Baby mound, Water, Roads, Pathways, Plazas, Bridges & Buildings
    if (!isSBG && Math.hypot(tx, tz) < 13.5) continue;
    if (!isClearOfPathsAndBuildings(tx, tz)) continue;
    if (isInWaterAtTreePlacement(tx, tz, 1.5)) continue;
    if (isOnRoadAtTreePlacement(tx, tz, 4.6)) continue;

    // Ensure tree does not block any doorway portal, bridge entrance, spawn, or relic pedestal
    let blockedByProtected = false;
    for (const pt of PROTECTED_CLEARANCE_POINTS) {
      if (Math.hypot(tx - pt.x, tz - pt.z) < pt.r) {
        blockedByProtected = true;
        break;
      }
    }
    if (!blockedByProtected && isSBG) {
      for (const pt of sbgRelicPts) {
        if (Math.hypot(tx - pt.x, tz - pt.z) < pt.r) {
          blockedByProtected = true;
          break;
        }
      }
    }
    if (blockedByProtected) continue;

    for (const other of trees) {
      if (Math.hypot(tx - other.x, tz - other.z) < 2.15) {
        blockedByProtected = true;
        break;
      }
    }
    if (blockedByProtected) continue;

    const idx = trees.length;
    const scale = 0.62 + rand() * 0.65;
    const rotY = rand() * Math.PI * 2;
    const schema = TREE_SPECIES_SCHEMA[idx % TREE_SPECIES_SCHEMA.length];
    const ty = getTerrainElevationAt(tx, tz);
    trees.push({
      id: idx,
      x: tx,
      y: ty,
      z: tz,
      scale,
      rotY,
      speciesName: schema.name,
      name: schema.label,
      r: schema.trunkRadius * scale
    });
  }
  return trees;
}

export const generateTrees = generateDeterministicWorldTrees;
export const WORLD_TREES = generateDeterministicWorldTrees();

export function rebuildWorldTreesForActiveMap() {
  const updated = generateDeterministicWorldTrees();
  WORLD_TREES.length = 0;
  WORLD_TREES.push(...updated);
  return WORLD_TREES;
}
