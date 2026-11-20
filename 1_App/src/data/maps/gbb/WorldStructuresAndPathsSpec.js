// ============================================================================
// Gardens by the Bay — Structures, Roads, Waterways & Landmark Specs
// (src/data/WorldStructuresAndPathsSpec.js)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Walkable Bridges & Timber Boardwalks Over Water
// ----------------------------------------------------------------------------
export const WORLD_BRIDGES = [
  {
    id: 'dragonfly_main_bridge',
    name: 'Dragonfly Bridge',
    ax: -28.0,
    az: -6.5,
    bx: -40.0,
    bz: -11.5,
    halfWidth: 2.6,
    archHeight: 1.22,
    buildVisualDeck: true, // Enhances the Blender bridge with smooth approach ramps
    style: 'coral_arch'
  },
  {
    id: 'south_meadow_bridge',
    name: 'Meadow Crossing Timber Bridge',
    ax: -40.5,
    az: 15.0,
    bx: -58.5,
    bz: 22.0,
    halfWidth: 2.4,
    archHeight: 0.65,
    buildVisualDeck: true,
    style: 'timber_arch'
  },
  {
    id: 'lotus_pond_boardwalk',
    name: 'Water Lily Pond Boardwalk',
    ax: 35.5,
    az: 1.2,
    bx: 49.5,
    bz: 7.2,
    halfWidth: 2.4,
    archHeight: 0.28,
    buildVisualDeck: true,
    style: 'boardwalk'
  },
  {
    id: 'wetlands_mangrove_boardwalk',
    name: 'Kingfisher Wetlands Boardwalk',
    ax: 52.0,
    az: 6.5,
    bx: 67.5,
    bz: 12.8,
    halfWidth: 2.4,
    archHeight: 0.28,
    buildVisualDeck: true,
    style: 'boardwalk'
  },
  {
    id: 'mbs_pedestrian_bridge',
    name: 'Marina Bay Overpass Bridge',
    ax: -55.0,
    az: -14.0,
    bx: -74.0,
    bz: -14.0,
    halfWidth: 2.6,
    archHeight: 0.85,
    buildVisualDeck: false,
    style: 'steel_overpass'
  }
];

// ----------------------------------------------------------------------------
// 2. Enterable Buildings with Solid Walls & Open Entrance Doorway Portals
// ----------------------------------------------------------------------------
export const WORLD_BUILDINGS = [
  {
    id: 'flower_dome',
    name: 'Flower Dome Conservatory',
    cx: 14.0,
    cz: -36.0,
    rotY: -0.35,
    rx: 14.7,
    rz: 10.0,
    innerScale: 0.87,
    outerScale: 1.03,
    // Doorway faces SE toward Conservatory Waterfront Plaza / The Canopy (24, -22)
    doorWorldAngle: Math.atan2(22.5 - 14.0, -25.5 - -36.0), // ~0.68 rad
    doorHalfAngle: 0.31, // ~5.2m wide open entrance portal
    portalHeight: 3.4,
    portalColor: '#38BDF8'
  },
  {
    id: 'cloud_forest',
    name: 'Cloud Forest Conservatory',
    cx: 36.0,
    cz: -26.0,
    rotY: 0.25,
    rx: 10.4,
    rz: 9.0,
    innerScale: 0.86,
    outerScale: 1.03,
    // Doorway faces WSW toward Conservatory Waterfront Plaza / The Canopy (24, -22)
    doorWorldAngle: Math.atan2(24.0 - 36.0, -27.5 - -26.0), // ~-1.69 rad
    doorHalfAngle: 0.34, // ~4.8m wide open entrance portal
    portalHeight: 3.6,
    portalColor: '#10B981'
  },
  {
    id: 'understorey_dome',
    name: 'Understorey Timber Lattice Dome (#12)',
    cx: 16.5,
    cz: 14.5,
    rotY: 0.0,
    rx: 4.1,
    rz: 4.1,
    innerScale: 0.82,
    outerScale: 1.05,
    // Doorway faces NNW toward Supertree Grove clear of Supertree (11.0, 11.5)
    doorWorldAngle: Math.atan2(6.0 - 16.5, -2.0 - 14.5),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#F59E0B'
  },
  {
    id: 'skylight_pavilion',
    name: 'Heritage Skylight Pavilion (#15-#18)',
    cx: -18.0,
    cz: -26.0,
    rotY: 0.4,
    rx: 5.5,
    rz: 5.5,
    innerScale: 0.83,
    outerScale: 1.05,
    openAirPavilion: true,
    // Doorway faces SW toward Heritage Moon Gate (-22, -16)
    doorWorldAngle: Math.atan2(-22.0 - -18.0, -16.0 - -26.0),
    doorHalfAngle: 0.44,
    portalHeight: 2.6,
    portalColor: '#F59E0B'
  },
  {
    id: 'serene_pavilion',
    name: 'Serene Garden Japanese Pavilion (#21)',
    cx: -54.0,
    cz: 32.0,
    rotY: 0.45,
    rx: 4.4,
    rz: 4.1,
    innerScale: 0.82,
    outerScale: 1.05,
    openAirPavilion: true,
    // Relocated to its true SW Visitor Map location (-54, 32) West of The Meadow!
    // Doorway faces WNW clear of Zen Boulders & Pavilion Posts (0.0000 shift)
    doorWorldAngle: (-105 * Math.PI) / 180,
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#10B981'
  },
  {
    id: 'sg50_lattice',
    name: 'Floral Fantasy & Bayfront Lattice (#26)',
    cx: -54.0,
    cz: -4.0,
    rotY: 0.0,
    rx: 4.25,
    rz: 4.25,
    innerScale: 0.82,
    outerScale: 1.05,
    // Doorway faces East toward Dragonfly Bridge pathway (-40, -9)
    doorWorldAngle: Math.atan2(-40.0 - -54.0, -8.0 - -4.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#EF4444'
  }
];

// Southern Concave-Up Boulevard (Marina Gardens Drive) & Main Entrance Approach Road Centerlines
export const ROAD_MAIN_POINTS = [
  { x: -44.0, z: 56.0 },
  { x: -24.0, z: 42.0 },
  { x: -8.0, z: 34.0 },
  { x: 10.0, z: 28.5 },
  { x: 27.5, z: 25.0 },
  { x: 48.0, z: 28.5 },
  { x: 68.0, z: 34.5 },
  { x: 83.0, z: 31.5 }
];

export const ROAD_APPROACH_POINTS = [
  { x: 27.5, z: 25.0 },
  { x: 28.0, z: 17.0 },
  { x: 28.5, z: 9.2 }
];

// ----------------------------------------------------------------------------
// 4. Waterways & Ponds
// ----------------------------------------------------------------------------
export const LAKE_CHANNEL_POINTS = [
  { x: -26.0, z: -42.0 },
  { x: -29.0, z: -30.0 },
  { x: -31.5, z: -18.0 },
  { x: -34.0, z: -9.0 },
  { x: -39.0, z: 0.0 },
  { x: -44.0, z: 10.0 },
  { x: -48.0, z: 17.5 },
  { x: -56.0, z: 24.0 },
  { x: -72.0, z: 36.0 }
];
export const LAKE_HALF_WIDTH = 3.45;

// Dry-land lake islands & eastern stepping-stone causeways inside Dragonfly Lake
export const LAKE_ISLANDS = [
  {
    id: 'nibong_island',
    name: 'Nibong_Island',
    cx: -31.5,
    cz: -18.0,
    r: 3.1,
    rx: 3.1,
    rz: 3.1,
    eastBankX: -26.5,
    eastBankZ: -18.0,
    causewayHalfWidth: 1.5,
    moundHeight: 0.35
  },
  {
    id: 'dragonfly_island',
    name: 'Dragonfly_Island',
    cx: -39.0,
    cz: 0.0,
    r: 3.3,
    rx: 3.3,
    rz: 3.3,
    eastBankX: -34.0,
    eastBankZ: 0.0,
    causewayHalfWidth: 1.5,
    moundHeight: 0.35
  }
];

// Four Named Eastern Ponds + Koi Pond (matches Official Visitor Map GB-Map-15-02-2026.jpg)
export const WATER_PONDS = [
  { name: 'Victoria Lily Pond', cx: 42.0, cz: -1.5, x: 42.0, z: -1.5, rx: 4.2, rz: 2.0 },
  { name: 'Water Lily Pond', cx: 42.0, cz: 5.0, x: 42.0, z: 5.0, rx: 5.8, rz: 2.4 },
  { name: 'Kingfisher Lake', cx: 59.5, cz: 9.8, x: 59.5, z: 9.8, rx: 6.0, rz: 2.6 },
  { name: 'Lotus Pond', cx: 62.5, cz: 16.8, x: 62.5, z: 16.8, rx: 5.4, rz: 2.4 },
  { name: 'Koi Pond', cx: -15.0, cz: 10.0, x: -15.0, z: 10.0, rx: 2.6, rz: 1.5 }
];

// ----------------------------------------------------------------------------
// 5. 18 Supertree Planter Base Specs (Matches LandmarksBuilder.js 1:1)
// ----------------------------------------------------------------------------
export const SUPERTREE_PLANTER_SPECS = [
  { x: -5.5, z: -3.5, h: 16.0, hero: true },
  { x: 6.5, z: -2.0, h: 15.6, hero: true },
  { x: 0.5, z: 6.5, h: 15.2, hero: true },
  { x: -12.5, z: -9.5, h: 12.2, hero: false },
  { x: -2.0, z: -12.5, h: 12.6, hero: false },
  { x: 11.5, z: -9.0, h: 12.4, hero: false },
  { x: 14.5, z: 1.5, h: 11.4, hero: false },
  { x: 11.0, z: 11.5, h: 12.0, hero: false },
  { x: 0.0, z: 15.0, h: 11.2, hero: false },
  { x: -10.5, z: 11.0, h: 11.6, hero: false },
  { x: -15.0, z: 1.5, h: 10.8, hero: false },
  { x: 4.5, z: -15.5, h: 10.6, hero: false },
  // 3 Silver Garden Supertrees (#25 — North, West of Flower Dome)
  { x: -4.2, z: -29.5, h: 11.0, hero: false },
  { x: 0.5, z: -28.0, h: 10.2, hero: false },
  { x: -1.8, z: -23.0, h: 9.8, hero: false },
  // 3 Golden Garden Supertrees (#1 — Right above Main Entrance Drop-Off Loop)
  { x: 28.0, z: -5.8, h: 11.2, hero: false },
  { x: 32.5, z: -4.0, h: 10.2, hero: false },
  { x: 30.2, z: -0.5, h: 10.4, hero: false }
];

// ----------------------------------------------------------------------------
// 6. Key Landmark Callouts for Floating 3D-to-2D World Labels
// ----------------------------------------------------------------------------
export const KEY_LANDMARK_CALLOUTS = [
  { id: 'lm_supertree', text: '🌳 Supertree Grove', x: 0, y: 26, z: 0, pos: { x: 0, y: 26, z: 0 } },
  { id: 'lm_flower_dome', text: '🌸 Flower Dome', x: 14, y: 18, z: -36, pos: { x: 14, y: 18, z: -36 } },
  { id: 'lm_cloud_forest', text: '🌧️ Cloud Forest', x: 36, y: 20, z: -26, pos: { x: 36, y: 20, z: -26 } },
  { id: 'lm_dragonfly', text: '🐉 Dragonfly Bridge', x: -34, y: 6.5, z: -12, pos: { x: -34, y: 6.5, z: -12 } },
  { id: 'lm_moongate', text: '🏮 Moon Gate', x: -22, y: 6.2, z: -16, pos: { x: -22, y: 6.2, z: -16 } },
  { id: 'lm_planet', text: '👶 Planet Sculpture', x: -36, y: 8.2, z: 10, pos: { x: -36, y: 8.2, z: 10 } },
  { id: 'lm_serene', text: '⛩️ Serene Pavilion', x: -54, y: 7.5, z: 32, pos: { x: -54, y: 7.5, z: 32 } },
  { id: 'lm_lotus', text: '🪷 Lotus Pond', x: 44, y: 7.5, z: 6, pos: { x: 44, y: 7.5, z: 6 } }
];
