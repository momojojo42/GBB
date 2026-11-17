// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Static World Map
// Geometry, Bridges, Buildings & Heritage Pillars
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
// 0. UNESCO S-Curve Heritage Park Contour (Origin (0,0) = The Bandstand 1930)
//    Sculpted organic park boundary enclosing Tanglin Core, National Orchid
//    Garden, Swan Lake, Palm Valley Symphony Stage, and Bukit Timah Eco-Lake
//    within the physics-verified bounding box [-78..94, -48..65].
// ----------------------------------------------------------------------------
export const SBG_ISLAND_POLYGON = [
  { x: -28.0, z: -48.0 },
  { x: -12.0, z: -43.0 },
  { x: 4.0, z: -45.5 },
  { x: 18.0, z: -48.0 },
  { x: 32.0, z: -41.0 },
  { x: 47.0, z: -34.0 },
  { x: 56.0, z: -18.0 },
  { x: 70.0, z: -1.0 },
  { x: 94.0, z: 18.0 },
  { x: 90.0, z: 35.0 },
  { x: 72.0, z: 39.5 },
  { x: 52.0, z: 33.0 },
  { x: 28.0, z: 29.0 },
  { x: 9.0, z: 33.0 },
  { x: -11.0, z: 40.0 },
  { x: -27.0, z: 48.0 },
  { x: -46.0, z: 65.0 },
  { x: -78.0, z: 38.0 },
  { x: -68.0, z: 15.0 },
  { x: -64.0, z: -8.0 },
  { x: -54.0, z: -26.0 },
  { x: -40.0, z: -38.0 }
];

// Precomputed Axis-Aligned Bounding Box for fast O(1) polygon containment early-outs
export const SBG_ISLAND_BOUNDS = {
  minX: -78.0,
  maxX: 94.0,
  minZ: -48.0,
  maxZ: 65.0
};

// ----------------------------------------------------------------------------
// 3. Solid Cylindrical Pillars (18 Heritage Trees, Bandstand & Monument Cores)
// ----------------------------------------------------------------------------
export const SBG_SOLID_PILLARS = [
  // 3 Hero Heritage Giants (Tembusu Heritage Giant, Walk of Giants Tower, Bandstand Rain Tree)
  { x: -5.5, z: -3.5, r: 3.20, name: 'Tembusu Heritage Giant ($5 Note Tree)' },
  { x: 6.5, z: -2.0, r: 3.12, name: 'Walk of Giants Tower' },
  { x: 0.5, z: 6.5, r: 3.04, name: 'Bandstand Column & Rain Tree Monarch' },
  // 9 Tanglin Core Heritage Trees
  { x: -12.5, z: -9.5, r: 2.44, name: 'Tembusu Heritage Giant (Tanglin)' },
  { x: -2.0, z: -12.5, r: 2.52, name: 'Saraca Stream Heritage Tree' },
  { x: 11.5, z: -9.0, r: 2.48, name: 'Cannonball Heritage Tree' },
  { x: 14.5, z: 1.5, r: 2.28, name: 'Burmese Banyan Root Trunk' },
  { x: 11.0, z: 11.5, r: 2.40, name: 'Yellow Flame Heritage Giant' },
  { x: 0.0, z: 15.0, r: 2.24, name: 'Bandstand Column South' },
  { x: -10.5, z: 11.0, r: 2.32, name: 'White Gutta Heritage Trunk' },
  { x: -15.0, z: 1.5, r: 2.16, name: 'Malayan Jelutong Giant' },
  { x: 4.5, z: -15.5, r: 2.12, name: 'Sea Apple Heritage Trunk' },
  // 3 Crane Fountain & Orchid Plaza Heritage Trees
  { x: -4.2, z: -29.5, r: 2.20, name: 'Orchid Plaza Rain Tree' },
  { x: 0.5, z: -28.0, r: 2.04, name: 'Burkill Hill Tembusu' },
  { x: -1.8, z: -23.0, r: 1.96, name: 'Tiger Orchid Host Trunk' },
  // 3 Nassim Gate & Clock Tower Heritage Trees
  { x: 28.0, z: -5.8, r: 2.24, name: 'Nassim Gate Rain Tree' },
  { x: 32.5, z: -4.0, r: 2.04, name: 'Frangipani Collection Giant' },
  { x: 30.2, z: -0.5, r: 2.08, name: 'Talipot Palm Giant' },
  // Burkill Hall & Orchid Mist House inner rockery & cascade basin
  { x: 36.8, z: -25.8, r: 2.35, name: 'Orchid Mist House Highland Rock Core' },
  { x: 32.5, z: -25.1, r: 0.95, name: 'Bromeliad Cascade Basin' },
  // Sembcorp Cool House interior 8 Montane Orchid & Nepenthes Terrarium Trunks
  ...[
    { xb: -5.0, yb: -1.5, r: 0.55, name: 'Montane Epiphyte Host Tree' },
    { xb: -2.0, yb: 2.2, r: 0.55, name: 'Montane Epiphyte Host Tree' },
    { xb: 2.5, yb: -2.5, r: 0.55, name: 'Montane Epiphyte Host Tree' },
    { xb: 6.0, yb: 1.2, r: 0.55, name: 'Montane Epiphyte Host Tree' },
    { xb: -7.5, yb: 1.0, r: 0.45, name: 'Highland Cloud Cypress' },
    { xb: -6.2, yb: -2.5, r: 0.45, name: 'Highland Cloud Cypress' },
    { xb: 0.5, yb: 3.8, r: 0.45, name: 'Highland Cloud Cypress' },
    { xb: 7.5, yb: -1.0, r: 0.45, name: 'Highland Cloud Cypress' }
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
  // Tanglin Gate Cast-Iron Silver Leaf Pillars (center archway at (-22,-16) is open)
  { x: -22.0 + Math.cos(0.6) * 2.9, z: -16.0 - Math.sin(0.6) * 2.9, r: 1.15, name: 'Tanglin Silver Gate Pillar' },
  { x: -22.0 - Math.cos(0.6) * 2.9, z: -16.0 + Math.sin(0.6) * 2.9, r: 1.15, name: 'Tanglin Silver Gate Pillar' },
  // Shaw Foundation Symphony Stage Arch Plinth
  { x: -37.09, z: 11.61, r: 1.05, name: 'Symphony Stage Arch Plinth' },
  // Victorian Sundial Pedestal Hub (leaves Relic #24 at (22,-14) accessible)
  { x: 22.0, z: -16.0, r: 1.25, name: 'Sundial Hub' },
  // Jacob Ballas Children's Garden Treehouse Piers & Water Play Bollards
  ...[0, 1, 2].flatMap((k) => {
    const ang = 0.3 + (k * Math.PI * 2) / 3;
    const jetAng = ang + 0.5;
    return [
      { x: 54.0 + Math.cos(ang) * 2.73, z: -8.0 - Math.sin(ang) * 2.73, r: 0.42, name: 'Jacob Ballas Treehouse Pier' },
      { x: 54.0 - Math.cos(ang) * 2.73, z: -8.0 + Math.sin(ang) * 2.73, r: 0.42, name: 'Jacob Ballas Treehouse Pier' },
      { x: 54.0 + Math.cos(jetAng) * 1.68, z: -8.0 + Math.sin(jetAng) * 1.68, r: 0.42, name: 'Children’s Maze Water Bollard' }
    ];
  }),
  // Tan Hoon Siang Mist Pavilion 6 Colonnade Piers
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
      name: 'Tan Hoon Siang Mist Pavilion Column'
    };
  }),
  // Japanese Bonsai & Sundial Pavilion 4 Corner Timber Posts
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
      name: 'Japanese Bonsai Pavilion Post'
    };
  }),
  // Tyersall Gallop Overpass West Gate Balustrade
  { x: -75.8, z: -14.0, r: 1.50, name: 'Tyersall Gallop West Gate' },
  { x: -75.8, z: -15.4, r: 1.15, name: 'Tyersall Gallop West Gate' },
  { x: -75.8, z: -12.6, r: 1.15, name: 'Tyersall Gallop West Gate' },
  // Nassim Gate Visitor Rotunda Columns
  { x: 28.5, z: 5.5, r: 0.35, name: 'Nassim Gate Visitor Rotunda' },
  { x: 28.5 - 2.4, z: 5.5, r: 0.35, name: 'Nassim Gate Rotunda Column' },
  { x: 28.5 + 2.4, z: 5.5, r: 0.35, name: 'Nassim Gate Rotunda Column' },
  { x: 28.5, z: 5.5 - 2.4, r: 0.35, name: 'Nassim Gate Rotunda Column' },
  { x: 28.5, z: 5.5 + 2.4, r: 0.35, name: 'Nassim Gate Rotunda Column' },
  // Sun Rockery Arid Glasshouse
  { x: 39.43, z: -5.23, r: 1.65, name: 'Sun Rockery Arid Pavilion' },
  { x: 40.5, z: -5.5, r: 1.70, name: 'Sun Rockery Arid Pavilion' },
  { x: 41.57, z: -5.77, r: 1.65, name: 'Sun Rockery Arid Pavilion' },
  // Evolution Garden Prehistoric Boulders
  { x: 45.2, z: -14.3, r: 1.25, name: 'Evolution Garden Silurian Monolith 1' },
  { x: 47.4, z: -14.7, r: 1.05, name: 'Evolution Garden Silurian Monolith 2' },
  { x: 49.1, z: -13.0, r: 1.15, name: 'Evolution Garden Silurian Monolith 3' },
  { x: 46.4, z: -12.1, r: 0.90, name: 'Evolution Garden Silurian Monolith 4' },
  // The Halia Ginger Garden Dining Pavilions
  { x: 71.22, z: 13.40, r: 1.55, name: 'The Halia West Veranda' },
  { x: 73.10, z: 12.70, r: 1.55, name: 'The Halia West Veranda' },
  { x: 74.90, z: 17.30, r: 1.55, name: 'The Halia East Veranda' },
  { x: 76.78, z: 16.60, r: 1.55, name: 'The Halia East Veranda' },
  //Swan Lake North Gazebo Columns
  ...[[-1.9, -1.2], [1.9, -1.2], [-1.9, 1.2], [1.9, 1.2]].map(([lx, lz]) => {
    const cosR = Math.cos(0.42);
    const sinR = Math.sin(0.42);
    return {
      x: -37.0 + lx * cosR + lz * sinR,
      z: -28.0 - lx * sinR + lz * cosR,
      r: 0.35,
      name: 'Swan Lake Victorian Gazebo Column'
    };
  }),
  // Inverturret Colonial House (1906)
  { x: -42.14, z: -19.62, r: 1.95, name: 'Inverturret Heritage House (1906)' },
  { x: -41.0, z: -20.0, r: 2.05, name: 'Inverturret Heritage House (1906)' },
  { x: -39.86, z: -20.38, r: 1.95, name: 'Inverturret Heritage House (1906)' },
  // Gallop Extension Forest Discovery Canopy
  { x: -50.0, z: -11.0, r: 3.95, name: 'COMO Adventure Grove Banyan Canopy' },
  // Ridley Hall Rubber Research Pods
  { x: -43.97, z: 37.87, r: 1.35, name: 'Ridley Hall West Wing' },
  { x: -40.03, z: 38.13, r: 1.35, name: 'Ridley Hall East Wing' },
  // Cluny Park Gate Coach Canopy Columns
  ...[-3.7, -1.1, 1.1, 3.7].map((lx) => {
    const cosR = Math.cos(-0.22);
    const sinR = Math.sin(-0.22);
    return {
      x: 37.0 + lx * cosR,
      z: 14.5 - lx * sinR,
      r: 0.35,
      name: 'Cluny Park Gate Trellis Column'
    };
  }),
  // Golden Shower Orchid Arch Columns
  { x: 24.5 - 4.0, z: -22.5, r: 0.35, name: 'Golden Shower Orchid Arch Column' },
  { x: 24.5 + 4.0, z: -22.5, r: 0.35, name: 'Golden Shower Orchid Arch Column' },
  { x: 24.5, z: -22.5 - 4.0, r: 0.35, name: 'Golden Shower Orchid Arch Column' },
  { x: 24.5, z: -22.5 + 4.0, r: 0.35, name: 'Golden Shower Orchid Arch Column' },
  // Bonsai Courtyard Scholar Stones
  { x: -50.0 - 1.6, z: 31.0 - 1.2, r: 0.85, name: 'Bonsai Courtyard Scholar Rock' },
  { x: -50.0 + 0.8, z: 31.0 - 0.6, r: 0.65, name: 'Bonsai Courtyard Scholar Rock' },
  { x: -50.0 + 1.8, z: 31.0 + 1.1, r: 0.72, name: 'Bonsai Courtyard Scholar Rock' },
  { x: -50.0 - 0.5, z: 31.0 + 1.5, r: 0.60, name: 'Bonsai Courtyard Scholar Rock' },
  // Girl on a Swing Bronze & Giant Mengkundor Hollow Log
  { x: 20.5, z: 7.5, r: 1.15, name: 'Girl on a Swing Bronze Statue' },
  { x: -6.0, z: 21.5, r: 1.15, name: 'Giant Mengkundor Buttress Log' }
];

// Automatically append solid Doorway Portal Jamb Columns for Enclosed Enterable Buildings
for (const b of SBG_BUILDINGS) {
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
