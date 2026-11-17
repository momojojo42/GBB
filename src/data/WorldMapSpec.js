// ============================================================================
// Gardens by the Bay — Static World Map Geometry, Bridges, Buildings & Pillars
// (src/data/WorldMapSpec.js)
// ============================================================================

import {
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
} from './WorldStructuresAndPathsSpec.js';
import {
  SBG_ISLAND_POLYGON,
  SBG_ISLAND_BOUNDS,
  SBG_SOLID_PILLARS,
  SBG_BRIDGES,
  SBG_BUILDINGS,
  SBG_ROAD_MAIN_POINTS,
  SBG_ROAD_APPROACH_POINTS,
  SBG_LAKE_CHANNEL_POINTS,
  SBG_LAKE_ISLANDS,
  SBG_WATER_PONDS,
  SBG_HERITAGE_TREE_SPECS,
  SBG_KEY_LANDMARK_CALLOUTS,
  SBG_TACTICAL_ZONES,
  SBG_TACTICAL_SUBLABELS
} from './maps/sbg/SBGWorldMapSpec.js';
import { getActiveMapId } from './MapRegistry.js';

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
  KEY_LANDMARK_CALLOUTS,
  SBG_TACTICAL_ZONES,
  SBG_TACTICAL_SUBLABELS
};

// ----------------------------------------------------------------------------
// 0. Official Visitor Map Boomerang Peninsula Contour (Origin (0,0) = Supertree Grove)
//    Clockwise vertices tracing the real Gardens by the Bay boomerang / crescent island:
//    - Top-Left apex (-26, -48) near Marina Bay Sands Waterfront Promenade
//    - Top-Right curve around Silver Garden (#25), Flower Dome (#3), and Cloud Forest (#4)
//    - Far-Right (East) tip (+94, +20) & SE corner (+88, +35) near Satay by the Bay / GBTB MRT
//    - Concave Bottom Arch curving UP to (+27, +23) at the Main Entrance along Marina Gardens Drive
//    - Bottom-Left (SW) tip (-46, +65) & Far-Left (West) corner (-78, +38) along Marina Boulevard
//    - West edge past Bayfront Plaza (-63, -8) & Active Garden / West Lawn (-52, -24)
// ----------------------------------------------------------------------------
export const BOOMERANG_ISLAND_POLYGON = [
  { x: -26.0, z: -48.0 },
  { x: -4.0, z: -40.0 },
  { x: 8.0, z: -44.0 },
  { x: 18.0, z: -46.0 },
  { x: 30.0, z: -38.0 },
  { x: 46.0, z: -32.0 },
  { x: 54.0, z: -16.0 },
  { x: 68.0, z: 1.0 },
  { x: 94.0, z: 20.0 },
  { x: 88.0, z: 36.0 },
  { x: 70.0, z: 39.0 },
  { x: 50.0, z: 32.0 },
  { x: 27.0, z: 28.0 },
  { x: 8.0, z: 32.0 },
  { x: -12.0, z: 39.0 },
  { x: -26.0, z: 47.0 },
  { x: -46.0, z: 65.0 },
  { x: -78.0, z: 38.0 },
  { x: -66.0, z: 14.0 },
  { x: -63.0, z: -8.0 },
  { x: -52.0, z: -24.0 }
];

// Precomputed Axis-Aligned Bounding Box for fast O(1) polygon containment early-outs
export const ISLAND_BOUNDS = {
  minX: -78.0,
  maxX: 94.0,
  minZ: -48.0,
  maxZ: 65.0
};

// ----------------------------------------------------------------------------
// 3. Solid Cylindrical Pillars (18 Supertree Trunks & Monument Cores)
// ----------------------------------------------------------------------------
export const SOLID_PILLARS = [
  // 3 Hero Supertrees (#6 Supertree Grove, #7 OCBC Skyway, #8 Supertree Observatory) — full outer steel cage radius
  { x: -5.5, z: -3.5, r: 3.20, name: 'Supertree Observatory (#8)' },
  { x: 6.5, z: -2.0, r: 3.12, name: 'OCBC Skyway Hero Supertree (#7)' },
  { x: 0.5, z: 6.5, r: 3.04, name: 'Supertree Grove Hero (#6)' },
  // 9 Central Grove Medium Supertrees — full outer steel cage radius
  { x: -12.5, z: -9.5, r: 2.44, name: 'Supertree Grove (#6)' },
  { x: -2.0, z: -12.5, r: 2.52, name: 'Supertree Grove (#6)' },
  { x: 11.5, z: -9.0, r: 2.48, name: 'Supertree Grove (#6)' },
  { x: 14.5, z: 1.5, r: 2.28, name: 'Supertree Grove (#6)' },
  { x: 11.0, z: 11.5, r: 2.40, name: 'Supertree Grove (#6)' },
  { x: 0.0, z: 15.0, r: 2.24, name: 'Supertree Grove (#6)' },
  { x: -10.5, z: 11.0, r: 2.32, name: 'Supertree Grove (#6)' },
  { x: -15.0, z: 1.5, r: 2.16, name: 'Supertree Grove (#6)' },
  { x: 4.5, z: -15.5, r: 2.12, name: 'Supertree Grove (#6)' },
  // 3 Silver Garden Supertrees (#25 — relocated to real North position just West of Flower Dome!)
  { x: -4.2, z: -29.5, r: 2.20, name: 'Silver Garden Supertree (#25)' },
  { x: 0.5, z: -28.0, r: 2.04, name: 'Silver Garden Supertree (#25)' },
  { x: -1.8, z: -23.0, r: 1.96, name: 'Silver Garden Supertree (#25)' },
  // 3 Golden Garden Supertrees (#1 — right above Main Entrance Drop-Off Loop!)
  { x: 28.0, z: -5.8, r: 2.24, name: 'Golden Garden Supertree (#1)' },
  { x: 32.5, z: -4.0, r: 2.04, name: 'Golden Garden Supertree (#1)' },
  { x: 30.2, z: -0.5, r: 2.08, name: 'Golden Garden Supertree (#1)' },
  // Cloud Forest inner mountain core rock & waterfall plunge pool boulders (leaves room for indoor relics)
  { x: 36.8, z: -25.8, r: 2.35, name: 'Cloud Forest Mountain Core' },
  { x: 32.5, z: -25.1, r: 0.95, name: 'Cloud Forest Waterfall Basin' },
  // Flower Dome interior 4 ancient olive & 4 Mediterranean cypress trunks (mapped with exact Blender Y -> -Z transform, rotY = -0.35, scale = 1.05)
  ...[
    { xb: -5.0, yb: -1.5, r: 0.55, name: 'Ancient Olive Tree' },
    { xb: -2.0, yb: 2.2, r: 0.55, name: 'Ancient Olive Tree' },
    { xb: 2.5, yb: -2.5, r: 0.55, name: 'Ancient Olive Tree' },
    { xb: 6.0, yb: 1.2, r: 0.55, name: 'Ancient Olive Tree' },
    { xb: -7.5, yb: 1.0, r: 0.45, name: 'Mediterranean Cypress' },
    { xb: -6.2, yb: -2.5, r: 0.45, name: 'Mediterranean Cypress' },
    { xb: 0.5, yb: 3.8, r: 0.45, name: 'Mediterranean Cypress' },
    { xb: 7.5, yb: -1.0, r: 0.45, name: 'Mediterranean Cypress' }
  ].map(({ xb, yb, r, name }) => {
    const xl = xb;
    const zl = -yb;
    const cosR = Math.cos(-0.35);
    const sinR = Math.sin(-0.35);
    return {
      x: 14.0 + 1.05 * (xl * cosR + zl * sinR),
      z: -36.0 + 1.05 * (-xl * sinR + zl * cosR),
      r,
      name
    };
  }),
  // Heritage Moon Gate Left & Right flanking masonry/bamboo pillars (center circular arch at (-22,-16) is open!)
  { x: -22.0 + Math.cos(0.6) * 2.9, z: -16.0 - Math.sin(0.6) * 2.9, r: 1.15, name: 'Heritage Moon Gate Pillar' },
  { x: -22.0 - Math.cos(0.6) * 2.9, z: -16.0 + Math.sin(0.6) * 2.9, r: 1.15, name: 'Heritage Moon Gate Pillar' },
  // Marc Quinn's "Planet" Floating Baby Sculpture single ground-contact right-hand support plinth (head & torso float overhead >1.9m)
  { x: -37.09, z: 11.61, r: 1.05, name: 'Planet Sculpture Support Plinth' },
  // Floral Clock central raised botanical gear hub (leaves Relic #24 at (22,-14) accessible)
  { x: 22.0, z: -16.0, r: 1.25, name: 'Floral Clock Hub (#5)' },
  // FEO Children's Garden Splash Pad 6 rainbow hoop arch piers + 3 cyan water-jet cone bollards (leaves center splash pad & Relic #39 at (54,-8) walkable)
  ...[0, 1, 2].flatMap((k) => {
    const ang = 0.3 + (k * Math.PI * 2) / 3;
    const jetAng = ang + 0.5;
    return [
      { x: 54.0 + Math.cos(ang) * 2.73, z: -8.0 - Math.sin(ang) * 2.73, r: 0.42, name: 'Splash Pad Rainbow Arch' },
      { x: 54.0 - Math.cos(ang) * 2.73, z: -8.0 + Math.sin(ang) * 2.73, r: 0.42, name: 'Splash Pad Rainbow Arch' },
      { x: 54.0 + Math.cos(jetAng) * 1.68, z: -8.0 + Math.sin(jetAng) * 1.68, r: 0.42, name: 'Splash Pad Water Jet Cone' }
    ];
  }),
  // Heritage Skylight Pavilion 6 V-column piers (open-air colonnade at (-18, -26), rotY = 0.4, scale = 0.85)
  ...[0, 1, 2, 3, 4, 5].map((ic) => {
    const ang = -1.365 + (2.0 * Math.PI * (ic + 0.5)) / 6.0;
    const xl = 3.9 * Math.cos(ang);
    const zl = -3.9 * Math.sin(ang);
    const cosR = Math.cos(0.4);
    const sinR = Math.sin(0.4);
    return {
      x: -18.0 + 0.85 * (xl * cosR + zl * sinR),
      z: -26.0 + 0.85 * (-xl * sinR + zl * cosR),
      r: 0.35,
      name: 'Heritage Skylight Pavilion Column (#15-#18)'
    };
  }),
  // Serene Japanese Pavilion 4 corner hinoki cypress support posts (open-air timber deck at (-54, 32), rotY = 0.45, scale = 1.15)
  ...[
    [-1.6, -1.3], [1.6, -1.3], [-1.6, 1.3], [1.6, 1.3]
  ].map(([xb, yb]) => {
    const xl = xb;
    const zl = -yb;
    const cosR = Math.cos(0.45);
    const sinR = Math.sin(0.45);
    return {
      x: -54.0 + 1.15 * (xl * cosR + zl * sinR),
      z: 32.0 + 1.15 * (-xl * sinR + zl * cosR),
      r: 0.32,
      name: 'Serene Japanese Pavilion Post (#21)'
    };
  }),
  // MBS Pedestrian Bridge West Gate end-stop balustrade blocker (stops players cleanly at x = -73.85 before water)
  { x: -75.8, z: -14.0, r: 1.50, name: 'MBS Bridge West Gate' },
  { x: -75.8, z: -15.4, r: 1.15, name: 'MBS Bridge West Gate' },
  { x: -75.8, z: -12.6, r: 1.15, name: 'MBS Bridge West Gate' },
  // Official Visitor Map Additional Landmarks (Exact Procedural Geometry Colliders)
  // Main Entrance Drop-Off Rotunda: central feature bollard + 4 outer canopy columns
  { x: 28.5, z: 5.5, r: 0.35, name: 'Main Entrance Red Drop-Off Rotunda' },
  { x: 28.5 - 2.4, z: 5.5, r: 0.35, name: 'Main Entrance Drop-Off Column' },
  { x: 28.5 + 2.4, z: 5.5, r: 0.35, name: 'Main Entrance Drop-Off Column' },
  { x: 28.5, z: 5.5 - 2.4, r: 0.35, name: 'Main Entrance Drop-Off Column' },
  { x: 28.5, z: 5.5 + 2.4, r: 0.35, name: 'Main Entrance Drop-Off Column' },
  // Sun Pavilion Desert Glasshouse (#22): 3 overlapping capsules covering 5.2m x 3.2m footprint at rotY = 0.35
  { x: 39.43, z: -5.23, r: 1.65, name: 'Sun Pavilion Desert Glasshouse (#22)' },
  { x: 40.5, z: -5.5, r: 1.70, name: 'Sun Pavilion Desert Glasshouse (#22)' },
  { x: 41.57, z: -5.77, r: 1.65, name: 'Sun Pavilion Desert Glasshouse (#22)' },
  // The Canyon Sculptural Rocks (#24): 4 individual red-sandstone monolith colliders
  { x: 45.2, z: -14.3, r: 1.25, name: 'The Canyon Sculptural Monolith 1 (#24)' },
  { x: 47.4, z: -14.7, r: 1.05, name: 'The Canyon Sculptural Monolith 2 (#24)' },
  { x: 49.1, z: -13.0, r: 1.15, name: 'The Canyon Sculptural Monolith 3 (#24)' },
  { x: 46.4, z: -12.1, r: 0.90, name: 'The Canyon Sculptural Monolith 4 (#24)' },
  // Satay by the Bay Dining Pavilions (g): West & East Pavilion capsules (leaves central dining breezeway at (74, 15) walkable!)
  { x: 71.22, z: 13.40, r: 1.55, name: 'Satay by the Bay West Pavilion (g)' },
  { x: 73.10, z: 12.70, r: 1.55, name: 'Satay by the Bay West Pavilion (g)' },
  { x: 74.90, z: 17.30, r: 1.55, name: 'Satay by the Bay East Pavilion (g)' },
  { x: 76.78, z: 16.60, r: 1.55, name: 'Satay by the Bay East Pavilion (g)' },
  // Active Garden Waterfront Pavilion (#27): 4 stage roof support columns at (-37, -28), rotY = 0.42 (leaves stage center walkable!)
  ...[[-1.9, -1.2], [1.9, -1.2], [-1.9, 1.2], [1.9, 1.2]].map(([lx, lz]) => {
    const cosR = Math.cos(0.42);
    const sinR = Math.sin(0.42);
    return {
      x: -37.0 + lx * cosR + lz * sinR,
      z: -28.0 - lx * sinR + lz * cosR,
      r: 0.35,
      name: 'Active Garden Waterfront Stage Column (#27)'
    };
  }),
  // IMBA Theatre Exhibition Hall (#37): 3 overlapping capsules covering 5.6m x 3.8m hall at rotY = 0.42
  { x: -42.14, z: -19.62, r: 1.95, name: 'IMBA Theatre Exhibition Hall (#37)' },
  { x: -41.0, z: -20.0, r: 2.05, name: 'IMBA Theatre Exhibition Hall (#37)' },
  { x: -39.86, z: -20.38, r: 1.95, name: 'IMBA Theatre Exhibition Hall (#37)' },
  // Bayfront Plaza / Floral Fantasy Canopy: expanded to r = 3.95m matching full green roof dome
  { x: -50.0, z: -11.0, r: 3.95, name: 'Bayfront Plaza Canopy' },
  // Garden Pod Eco-Hotel (#36): 2 individual shipping-container pod colliders (leaves central wooden deck at (-42, 38) walkable!)
  { x: -43.97, z: 37.87, r: 1.35, name: 'Garden Pod West (#36)' },
  { x: -40.03, z: 38.13, r: 1.35, name: 'Garden Pod East (#36)' },
  // Coach Bay & Car Park P Canopy: 4 steel canopy support columns at (37.0, 14.5), rotY = -0.22
  ...[-3.7, -1.1, 1.1, 3.7].map((lx) => {
    const cosR = Math.cos(-0.22);
    const sinR = Math.sin(-0.22);
    return {
      x: 37.0 + lx * cosR,
      z: 14.5 - lx * sinR,
      r: 0.35,
      name: 'Coach Bay Canopy Column'
    };
  }),
  // The Canopy Event Plaza Ring: 4 structural support columns at (24.5, -22.5)
  { x: 24.5 - 4.0, z: -22.5, r: 0.35, name: 'The Canopy Column (#2)' },
  { x: 24.5 + 4.0, z: -22.5, r: 0.35, name: 'The Canopy Column (#2)' },
  { x: 24.5, z: -22.5 - 4.0, r: 0.35, name: 'The Canopy Column (#2)' },
  { x: 24.5, z: -22.5 + 4.0, r: 0.35, name: 'The Canopy Column (#2)' },
  // Serene Garden Zen Rocks: 4 granite boulder colliders around (-50.0, 31.0) matching PeninsulaTerrainBuilder.js
  { x: -50.0 - 1.6, z: 31.0 - 1.2, r: 0.85, name: 'Serene Garden Zen Boulder' },
  { x: -50.0 + 0.8, z: 31.0 - 0.6, r: 0.65, name: 'Serene Garden Zen Boulder' },
  { x: -50.0 + 1.8, z: 31.0 + 1.1, r: 0.72, name: 'Serene Garden Zen Boulder' },
  { x: -50.0 - 0.5, z: 31.0 + 1.5, r: 0.60, name: 'Serene Garden Zen Boulder' },
  // Web of Life & Discovery Log
  { x: 20.5, z: 7.5, r: 1.15, name: 'Web of Life Topiary Sculpture (#10)' },
  { x: -6.0, z: 21.5, r: 1.15, name: 'Discovery Giant Hollow Log (#9)' }
];

// Automatically append solid Doorway Portal Jamb Columns for Enclosed Enterable Buildings
for (const b of WORLD_BUILDINGS) {
  if (b.openAirPavilion) continue;
  const isConservatory = b.id === 'flower_dome' || b.id === 'cloud_forest';
  const portalW = isConservatory ? 3.8 : 2.6;
  const avgR = (b.rx + b.rz) * 0.5;
  const doorWorldX = b.cx + Math.sin(b.doorWorldAngle) * (avgR * 0.95);
  const doorWorldZ = b.cz + Math.cos(b.doorWorldAngle) * (avgR * 0.95);
  const cosD = Math.cos(b.doorWorldAngle);
  const sinD = Math.sin(b.doorWorldAngle);
  for (const side of [-1, 1]) {
    const localX = side * (portalW * 0.5 + 0.12);
    SOLID_PILLARS.push({
      x: doorWorldX + localX * cosD,
      z: doorWorldZ - localX * sinD,
      r: 0.34,
      name: `${b.name} Doorway Pillar`
    });
  }
}

// Automatically append Bridge End Abutment Posts (outside the walkable deck width)
for (const br of WORLD_BRIDGES) {
  const dx = br.bx - br.ax;
  const dz = br.bz - br.az;
  const len = Math.hypot(dx, dz) || 1;
  const nx = dz / len;
  const nz = -dx / len;
  for (const [ex, ez] of [[br.ax, br.az], [br.bx, br.bz]]) {
    for (const side of [-1, 1]) {
      SOLID_PILLARS.push({
        x: ex + nx * side * (br.halfWidth + 0.18),
        z: ez + nz * side * (br.halfWidth + 0.18),
        r: 0.28,
        name: `${br.name} Railing Post`
      });
    }
  }
}

// Snapshot Map 01 (GBB) baseline specs for instant live multi-map switching
const GBB_SNAPSHOT = {
  polygon: BOOMERANG_ISLAND_POLYGON.map((p) => ({ ...p })),
  bounds: { ...ISLAND_BOUNDS },
  pillars: SOLID_PILLARS.map((p) => ({ ...p })),
  bridges: WORLD_BRIDGES.map((b) => ({ ...b })),
  buildings: WORLD_BUILDINGS.map((b) => ({ ...b })),
  roadMain: ROAD_MAIN_POINTS.map((p) => ({ ...p })),
  roadApproach: ROAD_APPROACH_POINTS.map((p) => ({ ...p })),
  lakeChannel: LAKE_CHANNEL_POINTS.map((p) => ({ ...p })),
  lakeIslands: LAKE_ISLANDS.map((i) => ({ ...i })),
  waterPonds: WATER_PONDS.map((p) => ({ ...p })),
  planterSpecs: SUPERTREE_PLANTER_SPECS.map((s) => ({ ...s })),
  callouts: KEY_LANDMARK_CALLOUTS.map((c) => ({ ...c, pos: { ...c.pos } }))
};

function replaceArrayInPlace(target, source) {
  target.splice(0, target.length, ...source.map((item) => (item.pos ? { ...item, pos: { ...item.pos } } : { ...item })));
}

export function syncWorldMapSpecToActiveMap(mapId = getActiveMapId()) {
  if (mapId === 'sbg') {
    replaceArrayInPlace(BOOMERANG_ISLAND_POLYGON, SBG_ISLAND_POLYGON);
    Object.assign(ISLAND_BOUNDS, SBG_ISLAND_BOUNDS);
    replaceArrayInPlace(SOLID_PILLARS, SBG_SOLID_PILLARS);
    replaceArrayInPlace(WORLD_BRIDGES, SBG_BRIDGES);
    replaceArrayInPlace(WORLD_BUILDINGS, SBG_BUILDINGS);
    replaceArrayInPlace(ROAD_MAIN_POINTS, SBG_ROAD_MAIN_POINTS);
    replaceArrayInPlace(ROAD_APPROACH_POINTS, SBG_ROAD_APPROACH_POINTS);
    replaceArrayInPlace(LAKE_CHANNEL_POINTS, SBG_LAKE_CHANNEL_POINTS);
    replaceArrayInPlace(LAKE_ISLANDS, SBG_LAKE_ISLANDS);
    replaceArrayInPlace(WATER_PONDS, SBG_WATER_PONDS);
    replaceArrayInPlace(SUPERTREE_PLANTER_SPECS, SBG_HERITAGE_TREE_SPECS);
    replaceArrayInPlace(KEY_LANDMARK_CALLOUTS, SBG_KEY_LANDMARK_CALLOUTS);
  } else {
    replaceArrayInPlace(BOOMERANG_ISLAND_POLYGON, GBB_SNAPSHOT.polygon);
    Object.assign(ISLAND_BOUNDS, GBB_SNAPSHOT.bounds);
    replaceArrayInPlace(SOLID_PILLARS, GBB_SNAPSHOT.pillars);
    replaceArrayInPlace(WORLD_BRIDGES, GBB_SNAPSHOT.bridges);
    replaceArrayInPlace(WORLD_BUILDINGS, GBB_SNAPSHOT.buildings);
    replaceArrayInPlace(ROAD_MAIN_POINTS, GBB_SNAPSHOT.roadMain);
    replaceArrayInPlace(ROAD_APPROACH_POINTS, GBB_SNAPSHOT.roadApproach);
    replaceArrayInPlace(LAKE_CHANNEL_POINTS, GBB_SNAPSHOT.lakeChannel);
    replaceArrayInPlace(LAKE_ISLANDS, GBB_SNAPSHOT.lakeIslands);
    replaceArrayInPlace(WATER_PONDS, GBB_SNAPSHOT.waterPonds);
    replaceArrayInPlace(SUPERTREE_PLANTER_SPECS, GBB_SNAPSHOT.planterSpecs);
    replaceArrayInPlace(KEY_LANDMARK_CALLOUTS, GBB_SNAPSHOT.callouts);
  }
}

syncWorldMapSpecToActiveMap(getActiveMapId());
