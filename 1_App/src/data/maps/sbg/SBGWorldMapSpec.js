// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 1:1 NParks World Map
// North-Up 4-Core Spine (Scaled 1:1 from SbgWorldSpec.js: X -63..+40, Z -67..+66)
// (src/data/maps/sbg/SBGWorldMapSpec.js)
// ============================================================================

import {
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
} from './SBGStructuresAndPathsSpec.js';

export {
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
};

// ----------------------------------------------------------------------------
// 0. True 1:1 NParks North–South 4-Core UNESCO Boundary Polygon
//    Encloses:
//    - Core 4: Bukit Timah Core (North, z: -67 to -25, x: -29 to +36)
//    - Core 2: Central Core & National Orchid Garden (Center, z: -24 to +25, x: -38 to +39)
//    - Core 1: Tanglin Heritage Core (South, z: +26 to +66, x: -27 to +37)
//    - Core 3: Tyersall–Gallop Extension (South-West Wing, x: -63 to -27, z: +19 to +60)
// ----------------------------------------------------------------------------
export const SBG_ISLAND_POLYGON = [
  { x: -9.0, z: -67.0 },   // North-West tip near Botanic Gardens MRT
  { x: 7.0, z: -66.4 },    // North crest at Bukit Timah Gate
  { x: 27.0, z: -61.0 },   // NE corner enclosing Jacob Ballas Children's Garden
  { x: 36.4, z: -47.0 },   // East edge of Bukit Timah Core
  { x: 33.6, z: -27.0 },   // East edge along Foliage Valley & Evolution Garden
  { x: 39.6, z: -5.0 },    // Cluny Park Road East bulge
  { x: 38.4, z: 11.0 },    // Nassim Gate Visitor Centre East boundary
  { x: 35.6, z: 27.0 },    // 6-ha Primary Rainforest SE edge
  { x: 37.0, z: 43.0 },    // Tanglin Core East boundary (Sundial & Botany Centre)
  { x: 29.0, z: 59.0 },    // SE corner near Holttum Hall & Tanglin Gate
  { x: 11.0, z: 65.6 },    // South apex at Tanglin Silver Gate (Holland/Napier Rd)
  { x: -9.0, z: 63.6 },    // SW Tanglin Core edge below Swan Lake
  { x: -27.0, z: 57.0 },   // Transition from Tanglin Core to Gallop Extension
  { x: -43.0, z: 60.4 },   // South tip of Tyersall-Gallop (Inverturret & COMO Grove)
  { x: -59.6, z: 57.0 },   // SW corner at Atbara House & Gallop Gate
  { x: -63.0, z: 41.0 },   // West edge of SPH Walk of Giants
  { x: -57.0, z: 23.0 },   // NW corner of Learning Forest & Keppel Wetlands
  { x: -38.4, z: 17.6 },   // Tyersall Ave neck into National Orchid Garden
  { x: -37.6, z: 3.0 },    // West ridge of National Orchid Garden (Burkill Hall)
  { x: -37.0, z: -10.4 },  // NW edge of Sembcorp Cool House
  { x: -28.4, z: -25.0 },  // Transition into Bukit Timah Core West
  { x: -29.6, z: -47.0 },  // West bank of Eco-Lake Sanctuary
  { x: -21.0, z: -62.0 }   // NW approach to Bukit Timah Gate
];

// Precomputed Axis-Aligned Bounding Box for fast O(1) polygon containment early-outs
export const SBG_ISLAND_BOUNDS = {
  minX: -63.0,
  maxX: 39.6,
  minZ: -67.0,
  maxZ: 65.6
};

// ----------------------------------------------------------------------------
// 3. Solid Cylindrical Pillars (18 Heritage Trees, Bandstand & Monument Cores)
// ----------------------------------------------------------------------------
export const SBG_SOLID_PILLARS = [
  // 18 Heritage Rain Tree & Tembusu Trunks across all 4 NParks Cores
  ...SBG_HERITAGE_TREE_SPECS.map((t) => ({
    x: t.x,
    z: t.z,
    r: t.hero ? 2.15 : 1.75,
    name: t.species
  })),
  // $5-Note Tembusu Giant low horizontal swooping limb wooden prop post on Lawn E (+6.5+3.4, +35.0+3.2)
  { x: 6.5 + 3.4, z: 35.0 + 3.2, r: 0.42, name: 'Five-Dollar Tembusu Prop Post' },
  // EJH Corner House (1910 Black-and-White Heritage Bungalow — NParks #18) 2 wing colliders around (-8.5, +24.0)
  { x: -8.5 - 1.84, z: 24.0 - 1.95, r: 1.55, name: 'EJH Corner House (1910) West Wing' },
  { x: -8.5 + 1.84, z: 24.0 + 1.95, r: 1.55, name: 'EJH Corner House (1910) East Wing' },
  // Eco-Garden & Foliage Sanctuary Pavilion 2 wing colliders in Bukit Timah Core around (-10.0, -54.0)
  { x: -10.0 - 1.84, z: -54.0 - 1.95, r: 1.55, name: 'Eco-Garden Pavilion West Wing' },
  { x: -10.0 + 1.84, z: -54.0 + 1.95, r: 1.55, name: 'Eco-Garden Pavilion East Wing' },
  // Tanglin Silver Gate Left & Right flanking cast-iron pillars at (9.0, 61.0)
  { x: 9.0 - 2.6, z: 61.0, r: 0.95, name: 'Tanglin Silver Gate West Pillar' },
  { x: 9.0 + 2.6, z: 61.0, r: 0.95, name: 'Tanglin Silver Gate East Pillar' },
  // Shaw Foundation Symphony Stage acoustic arch plinth at (3.6, -5.8)
  { x: 3.6, z: -5.8, r: 1.05, name: 'Shaw Symphony Stage Plinth' },
  // Victorian Sundial Pedestal Hub at (22.4, 25.0)
  { x: 22.4, z: 25.0, r: 1.15, name: 'Victorian Sundial Pedestal' },
  // Nassim Gate Visitor Rotunda & Clock Tower at (25.6, 7.0)
  { x: 25.6, z: 7.0, r: 1.15, name: 'Nassim Gate Clock Tower' },
  // Evolution Garden Prehistoric Silurian Boulders at (16.4, -31.0)
  { x: 15.2, z: -31.8, r: 1.05, name: 'Evolution Garden Silurian Monolith 1' },
  { x: 17.6, z: -30.2, r: 1.05, name: 'Evolution Garden Silurian Monolith 2' },
  // Inverturret Colonial House (1906) at (-46.0, 54.0)
  { x: -46.0, z: 54.0, r: 2.1, name: 'Inverturret Heritage Gallery (1906)' },
  // COMO Adventure Grove Giant Cempedak Pod at (-36.4, 51.6)
  { x: -36.4, z: 51.6, r: 1.85, name: 'COMO Adventure Grove Cempedak Pod' },
  // Jacob Ballas Children's Garden Treehouse Tower at (19.0, -52.0)
  { x: 19.0 - 1.8, z: -52.0 - 1.4, r: 1.25, name: 'Jacob Ballas Treehouse Tower' },
  // Bukit Timah MRT Gate Canopy at (-2.4, -59.0)
  { x: -2.4 - 2.6, z: -59.0, r: 0.85, name: 'Bukit Timah MRT Gate West Pillar' },
  { x: -2.4 + 2.6, z: -59.0, r: 0.85, name: 'Bukit Timah MRT Gate East Pillar' }
];

// Automatically append solid Doorway Portal Jamb Columns for Enclosed Enterable Buildings
for (const b of SBG_BUILDINGS) {
  if (b.openAirPavilion) continue;
  const isConservatory = b.id === 'flower_dome' || b.id === 'cloud_forest';
  const portalW = isConservatory ? 3.4 : 2.5;
  const avgR = (b.rx + b.rz) * 0.5;
  const doorWorldX = b.cx + Math.sin(b.doorWorldAngle) * (avgR * 0.95);
  const doorWorldZ = b.cz + Math.cos(b.doorWorldAngle) * (avgR * 0.95);
  const cosD = Math.cos(b.doorWorldAngle);
  const sinD = Math.sin(b.doorWorldAngle);
  for (const side of [-1, 1]) {
    const localX = side * (portalW * 0.5 + 0.12);
    SBG_SOLID_PILLARS.push({
      x: doorWorldX + localX * cosD,
      z: doorWorldZ - localX * sinD,
      r: 0.34,
      name: `${b.name} Doorway Pillar`
    });
  }
}

// Automatically append Bridge End Abutment Posts (outside the walkable deck width)
for (const br of SBG_BRIDGES) {
  const dx = br.bx - br.ax;
  const dz = br.bz - br.az;
  const len = Math.hypot(dx, dz) || 1;
  const nx = dz / len;
  const nz = -dx / len;
  for (const [ex, ez] of [[br.ax, br.az], [br.bx, br.bz]]) {
    for (const side of [-1, 1]) {
      SBG_SOLID_PILLARS.push({
        x: ex + nx * side * (br.halfWidth + 0.18),
        z: ez + nz * side * (br.halfWidth + 0.18),
        r: 0.28,
        name: `${br.name} Railing Post`
      });
    }
  }
}
