// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 1:1 NParks Structures,
// Waterways, Pathways, Plazas & Landmark Specs (North-Up: -Z North, +Z South)
// Scaled 1:1 from SbgWorldSpec.js (1 Three.js unit = 5m, X: -63..+40, Z: -67..+66)
// (src/data/maps/sbg/SBGStructuresAndPathsSpec.js)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Walkable Bridges & Timber Boardwalks Over Water (Aligned 1:1 with Lakes)
// ----------------------------------------------------------------------------
export const SBG_BRIDGES = [
  {
    id: 'dragonfly_main_bridge',
    name: 'Swan Lake Heritage Bridge',
    ax: 8.2,
    az: 42.4,
    bx: -12.2,
    bz: 42.4,
    halfWidth: 2.6,
    archHeight: 1.22,
    buildVisualDeck: true,
    style: 'timber_arch'
  },
  {
    id: 'south_meadow_bridge',
    name: 'Symphony Lake Boardwalk Bridge',
    ax: 14.5,
    az: -2.4,
    bx: -5.2,
    bz: -2.4,
    halfWidth: 2.6,
    archHeight: 0.72,
    buildVisualDeck: true,
    style: 'timber_arch'
  },
  {
    id: 'lotus_pond_boardwalk',
    name: 'Eco-Lake Sanctuary Boardwalk',
    ax: -9.2,
    az: -39.5,
    bx: 11.2,
    bz: -39.5,
    halfWidth: 2.5,
    archHeight: 0.42,
    buildVisualDeck: true,
    style: 'boardwalk'
  },
  {
    id: 'wetlands_mangrove_boardwalk',
    name: 'Keppel Discovery Wetlands Boardwalk',
    ax: -36.8,
    az: 31.0,
    bx: -49.2,
    bz: 31.0,
    halfWidth: 2.5,
    archHeight: 0.35,
    buildVisualDeck: true,
    style: 'boardwalk'
  },
  {
    id: 'mbs_pedestrian_bridge',
    name: 'Jacob Ballas Suspension Bridge',
    ax: 13.6,
    az: -55.6,
    bx: 24.4,
    bz: -55.6,
    halfWidth: 2.5,
    archHeight: 0.95,
    buildVisualDeck: true,
    style: 'timber_arch'
  }
];

// ----------------------------------------------------------------------------
// 2. Enterable Buildings with Solid Walls & Open Entrance Doorway Portals
// ----------------------------------------------------------------------------
export const SBG_BUILDINGS = [
  {
    id: 'flower_dome',
    name: 'Sembcorp Cool House Conservatory',
    cx: -30.0,
    cz: -6.0,
    rotY: -0.30,
    rx: 8.5,
    rz: 6.5,
    innerScale: 0.86,
    outerScale: 1.03,
    doorWorldAngle: Math.atan2(-18.0 - -30.0, -2.0 - -6.0),
    doorHalfAngle: 0.36,
    portalHeight: 3.4,
    portalColor: '#38BDF8'
  },
  {
    id: 'cloud_forest',
    name: 'Burkill Hall (1868 Plantation Manor)',
    cx: -25.0,
    cz: 4.5,
    rotY: 0.20,
    rx: 7.2,
    rz: 6.0,
    innerScale: 0.86,
    outerScale: 1.03,
    doorWorldAngle: Math.atan2(-14.0 - -25.0, 4.5 - 4.5),
    doorHalfAngle: 0.38,
    portalHeight: 3.4,
    portalColor: '#F59E0B'
  },
  {
    id: 'understorey_dome',
    name: 'Botany Centre & Holttum Hall (1921)',
    cx: 17.6,
    cz: 51.0,
    rotY: -0.25,
    rx: 4.4,
    rz: 4.4,
    innerScale: 0.82,
    outerScale: 1.05,
    doorWorldAngle: Math.atan2(5.0 - 17.6, 29.0 - 51.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.6,
    portalColor: '#FBBF24'
  },
  {
    id: 'skylight_pavilion',
    name: 'Tan Hoon Siang Mist House',
    cx: -17.6,
    cz: 10.4,
    rotY: 0.35,
    rx: 5.0,
    rz: 5.0,
    innerScale: 0.83,
    outerScale: 1.05,
    openAirPavilion: true,
    doorWorldAngle: Math.atan2(-8.0 - -17.6, 10.4 - 10.4),
    doorHalfAngle: 0.46,
    portalHeight: 2.6,
    portalColor: '#FACC15'
  },
  {
    id: 'serene_pavilion',
    name: 'Sundial & Japanese Bonsai Pavilion',
    cx: 22.4,
    cz: 32.0,
    rotY: 0.35,
    rx: 4.4,
    rz: 4.1,
    innerScale: 0.82,
    outerScale: 1.05,
    openAirPavilion: true,
    doorWorldAngle: Math.atan2(5.0 - 22.4, 29.0 - 32.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#10B981'
  },
  {
    id: 'sg50_lattice',
    name: 'Atbara House (1898 Black-and-White Gallery)',
    cx: -52.0,
    cz: 48.0,
    rotY: 0.15,
    rx: 4.25,
    rz: 4.25,
    innerScale: 0.82,
    outerScale: 1.05,
    doorWorldAngle: Math.atan2(-38.0 - -52.0, 46.0 - 48.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#10B981'
  }
];

// ----------------------------------------------------------------------------
// 3. Cluny Road / Tyersall Ave Perimeter & Nassim Gate Approach Centerlines
// ----------------------------------------------------------------------------
export const SBG_ROAD_MAIN_POINTS = [
  { x: 11.0, z: 62.0 },
  { x: 24.0, z: 54.0 },
  { x: 32.0, z: 36.0 },
  { x: 33.0, z: 16.0 },
  { x: 34.0, z: -4.0 },
  { x: 30.0, z: -26.0 },
  { x: 26.0, z: -46.0 },
  { x: 8.0, z: -60.0 }
];

export const SBG_ROAD_APPROACH_POINTS = [
  { x: 33.0, z: 10.0 },
  { x: 29.0, z: 8.5 },
  { x: 25.6, z: 7.0 }
];

// ----------------------------------------------------------------------------
// 4. 3 Iconic Primary Lakes + Keppel Discovery Wetlands + Ginger Pool
// ----------------------------------------------------------------------------
export const SBG_LAKE_CHANNEL_POINTS = [
  { x: -2.0, z: 36.5 },
  { x: -2.2, z: 40.0 },
  { x: -2.0, z: 43.0 },
  { x: -1.8, z: 46.5 },
  { x: -2.0, z: 49.5 }
];
export const SBG_LAKE_HALF_WIDTH = 1.65;

export const SBG_LAKE_ISLANDS = [
  {
    id: 'nibong_island',
    name: 'Swan_Nest_Island',
    cx: -2.8,
    cz: 39.2,
    r: 2.2,
    rx: 2.2,
    rz: 1.8,
    rotY: 0.2,
    eastBankX: 5.5,
    eastBankZ: 39.2,
    causewayHalfWidth: 1.5,
    moundHeight: 0.35
  },
  {
    id: 'dragonfly_island',
    name: 'Symphony_Stage_Islet',
    cx: 3.6,
    cz: -4.4,
    r: 4.5,
    rx: 4.6,
    rz: 4.2,
    rotY: 0.0,
    eastBankX: -4.5,
    eastBankZ: -4.4,
    causewayHalfWidth: 2.2,
    moundHeight: 0.38
  },
  {
    id: 'eco_lake_islet',
    name: 'Black_Swan_Islet',
    cx: 1.2,
    cz: -43.6,
    r: 2.1,
    rx: 2.2,
    rz: 1.8,
    rotY: -0.2,
    eastBankX: 9.0,
    eastBankZ: -43.6,
    causewayHalfWidth: 1.4,
    moundHeight: 0.32
  }
];

export const SBG_WATER_PONDS = [
  { id: 'swan_lake', name: 'Swan Lake (1866)', cx: -2.0, cz: 43.0, x: -2.0, z: 43.0, rx: 9.0, rz: 8.0, rot: 0.0 },
  { id: 'symphony_lake', name: 'Symphony Lotus Lake', cx: 4.7, cz: -4.0, x: 4.7, z: -4.0, rx: 8.5, rz: 9.5, rot: 0.0 },
  { id: 'eco_lake', name: 'Eco-Lake Sanctuary', cx: 1.0, cz: -43.0, x: 1.0, z: -43.0, rx: 9.2, rz: 9.2, rot: 0.0 },
  { id: 'keppel_wetlands', name: 'Keppel Discovery Marsh', cx: -43.0, cz: 31.0, x: -43.0, z: 31.0, rx: 5.2, rz: 4.2, rot: 0.0 },
  { id: 'ginger_pool', name: 'Ginger Waterfall Pool', cx: -14.4, cz: 19.6, x: -14.4, z: 19.6, rx: 2.6, rz: 2.1, rot: 0.0 }
];

// ----------------------------------------------------------------------------
// 5. 18 Heritage Rain Tree & Tembusu Planter Specs across the 4 NParks Cores
// ----------------------------------------------------------------------------
export const SBG_HERITAGE_TREE_SPECS = [
  // 3 Hero Heritage Giants ($5-Note Tembusu on Lawn E (+6.5, +35.0), Bandstand Rain Tree Monarch, Learning Forest Kapok)
  { x: 6.5, z: 35.0, h: 16.0, hero: true, species: 'Five-Dollar Tembusu Giant ($5 Note Tree)' },
  { x: 5.0, z: 24.5, h: 15.6, hero: true, species: 'Bandstand Rain Tree Monarch' },
  { x: -45.0, z: 37.5, h: 15.4, hero: true, species: 'Walk of Giants Kapok Monarch' },
  // 5 Tanglin Core Heritage Trees (South +Z)
  { x: -9.5, z: 35.0, h: 12.2, hero: false, species: 'Swan Lake West Lawn Rain Tree' },
  { x: 12.5, z: 28.0, h: 12.6, hero: false, species: 'Saraca Stream Heritage Tree' },
  { x: 14.0, z: 39.0, h: 12.4, hero: false, species: 'Cannonball Heritage Tree' },
  { x: -14.5, z: 48.0, h: 11.8, hero: false, species: 'Swan Lake West Bank Banyan' },
  { x: 4.0, z: 54.0, h: 12.0, hero: false, species: 'Tanglin Gate Yellow Flame' },
  // 4 Central Core & Primary Rainforest Giants (Center Z ≈ 0)
  { x: 25.0, z: 17.0, h: 14.5, hero: false, species: '6-ha Primary Rainforest Jelutong' },
  { x: 21.0, z: 22.0, h: 13.2, hero: false, species: 'Primary Rainforest Shorea' },
  { x: 17.0, z: -3.6, h: 12.0, hero: false, species: 'Palm Valley Talipot & Coco de Mer' },
  { x: -8.0, z: -11.0, h: 11.4, hero: false, species: 'Symphony Lawn Sea Apple' },
  // 3 National Orchid Garden & Ginger Hill Heritage Trees (West -X)
  { x: -19.0, z: -12.0, h: 11.2, hero: false, species: 'Orchid Plaza Rain Tree' },
  { x: -32.0, z: 12.0, h: 10.8, hero: false, species: 'Burkill Hill Tembusu' },
  { x: -24.0, z: 22.0, h: 11.0, hero: false, species: 'Ginger Garden Host Trunk' },
  // 3 Bukit Timah Core & Eco-Lake Heritage Trees (North -Z)
  { x: -13.0, z: -43.0, h: 12.2, hero: false, species: 'Eco-Lake Weeping Fig Sanctuary' },
  { x: 16.4, z: -25.0, h: 11.6, hero: false, species: 'Evolution Garden Cycad Monarch' },
  { x: 6.0, z: -55.0, h: 11.4, hero: false, species: 'Bukit Timah Gate Heritage Angsana' }
];

// ----------------------------------------------------------------------------
// 6. Key Landmark Callouts for Floating 3D-to-2D World Labels (1:1 Coordinates)
// ----------------------------------------------------------------------------
export const SBG_KEY_LANDMARK_CALLOUTS = [
  { id: 'lm_supertree', text: '🏛️ The Bandstand (1930)', x: 5.0, y: 18, z: 29.0, pos: { x: 5.0, y: 18, z: 29.0 } },
  { id: 'lm_flower_dome', text: '❄️ Sembcorp Cool House', x: -30.0, y: 16, z: -6.0, pos: { x: -30.0, y: 16, z: -6.0 } },
  { id: 'lm_cloud_forest', text: '🏡 Burkill Hall (1868)', x: -25.0, y: 16, z: 4.5, pos: { x: -25.0, y: 16, z: 4.5 } },
  { id: 'lm_dragonfly', text: '🦢 Swan Lake & Bridge', x: -2.0, y: 8.5, z: 42.4, pos: { x: -2.0, y: 8.5, z: 42.4 } },
  { id: 'lm_moongate', text: '🚪 Tanglin Silver Gate', x: 9.0, y: 8.0, z: 61.0, pos: { x: 9.0, y: 8.0, z: 61.0 } },
  { id: 'lm_planet', text: '🎼 Shaw Symphony Stage', x: 3.6, y: 9.5, z: -4.4, pos: { x: 3.6, y: 9.5, z: -4.4 } },
  { id: 'lm_serene', text: '🪴 Sundial & Bonsai Garden', x: 22.4, y: 8.5, z: 32.0, pos: { x: 22.4, y: 8.5, z: 32.0 } },
  { id: 'lm_lotus', text: '🦩 Eco-Lake & Children’s Garden', x: 1.0, y: 9.0, z: -43.0, pos: { x: 1.0, y: 9.0, z: -43.0 } }
];

// ----------------------------------------------------------------------------
// 7. 1:1 Plaza Nodes, North-South Pathway Spine & Tactical Map Zones/Sublabels
// ----------------------------------------------------------------------------
export const SBG_PLAZA_NODES = [
  { x: 5.0, z: 29.0, r: 9.5, name: 'The Bandstand 1930 Octagonal Lawn (Core 1 South)' },
  { x: 9.0, z: 58.0, r: 7.2, name: 'Tanglin Silver Gate & Botany Forecourt (Core 1 South)' },
  { x: 22.4, z: 32.0, r: 6.8, name: 'Sundial & Bonsai Courtyard (Core 1 SE)' },
  { x: -6.0, z: -4.0, r: 10.5, name: 'Palm Valley & Symphony Stage Lawn (Core 2 Center)' },
  { x: -18.0, z: 2.0, r: 9.2, name: 'National Orchid Garden Golden Shower Plaza (Core 2 West)' },
  { x: 25.6, z: 7.0, r: 7.5, name: 'Nassim Gate Visitor Centre Plaza (Core 2 East)' },
  { x: -14.4, z: 24.0, r: 6.5, name: 'Ginger Garden & Halia Terrace (Core 2 SW)' },
  { x: -46.0, z: 42.0, r: 8.5, name: 'Learning Forest & Walk of Giants Hub (Core 3 SW)' },
  { x: -46.0, z: 52.0, r: 7.5, name: 'Gallop Extension, Atbara & COMO Plaza (Core 3 SW)' },
  { x: 1.0, z: -31.0, r: 8.8, name: 'Eco-Lake South Overlook & Evolution Spine (Core 4 North)' },
  { x: 19.0, z: -52.0, r: 7.8, name: 'Jacob Ballas Children’s Garden Plaza (Core 4 NE)' },
  { x: -2.4, z: -59.0, r: 7.2, name: 'Bukit Timah Gate & MRT Forecourt (Core 4 Far North)' }
];

export const SBG_PATHWAY_POLYLINES = [
  // 1. Main North-South Heritage Spine: Tanglin Gate (+9,+58) -> Swan Lake Bridge (-2,+42.4) -> Lawn E (+6.5,+35) -> Bandstand (+5,+29) -> Palm Valley (-6,-4) -> Eco-Lake (+1,-31) -> Bukit Timah Gate (-2.4,-59)
  [
    { x: 9.0, z: 58.0 }, { x: 8.2, z: 42.4 }, { x: -2.0, z: 42.4 }, { x: 6.5, z: 35.0 },
    { x: 5.0, z: 29.0 }, { x: 2.0, z: 14.0 }, { x: -6.0, z: -4.0 }, { x: -4.0, z: -20.0 },
    { x: 1.0, z: -31.0 }, { x: -9.2, z: -39.5 }, { x: -12.0, z: -48.0 }, { x: -2.4, z: -59.0 }
  ],
  // 2. East Heritage Spine: Holttum Hall (+17.6,+51) -> Sundial (+22.4,+32) -> Primary Rainforest (+25,+17) -> Nassim Gate (+25.6,+7) -> Evolution Garden (+16.4,-31) -> Jacob Ballas (+19,-52)
  [
    { x: 9.0, z: 58.0 }, { x: 17.6, z: 51.0 }, { x: 22.4, z: 32.0 }, { x: 25.0, z: 17.0 },
    { x: 25.6, z: 7.0 }, { x: 16.5, z: -2.4 }, { x: 16.4, z: -31.0 }, { x: 11.2, z: -39.5 },
    { x: 19.0, z: -52.0 }, { x: -2.4, z: -59.0 }
  ],
  // 3. National Orchid Garden & Ginger Loop (Core 2 West Hill -X)
  [
    { x: -6.0, z: -4.0 }, { x: -18.0, z: -4.0 }, { x: -30.0, z: -6.0 }, { x: -25.0, z: 4.5 },
    { x: -17.6, z: 10.4 }, { x: -14.4, z: 24.0 }, { x: 5.0, z: 29.0 }
  ],
  // 4. Tyersall-Gallop Extension Loop (Core 3 South-West Wing -X, +Z)
  [
    { x: -12.2, z: 42.4 }, { x: -24.0, z: 36.0 }, { x: -36.8, z: 31.0 }, { x: -49.2, z: 31.0 },
    { x: -47.0, z: 41.0 }, { x: -52.0, z: 48.0 }, { x: -46.0, z: 54.0 }, { x: -36.4, z: 51.6 },
    { x: -24.0, z: 48.0 }, { x: -12.2, z: 42.4 }
  ]
];

export const SBG_TACTICAL_ZONES = [
  { name: 'CORE 1: TANGLIN HERITAGE (SOUTH +Z)', x: 6, z: 44, r: 20, color: 'rgba(16, 185, 129, 0.16)' },
  { name: 'CORE 2: NATIONAL ORCHID GARDEN (WEST -X)', x: -24, z: 3, r: 16, color: 'rgba(245, 158, 11, 0.16)' },
  { name: 'CORE 2: SYMPHONY LAKE & RAINFOREST (CENTER)', x: 10, z: 2, r: 18, color: 'rgba(236, 72, 153, 0.15)' },
  { name: 'CORE 3: TYERSALL–GALLOP (SW -X,+Z)', x: -45, z: 43, r: 17, color: 'rgba(56, 189, 248, 0.16)' },
  { name: 'CORE 4: BUKIT TIMAH & ECO-LAKE (NORTH -Z)', x: 6, z: -45, r: 20, color: 'rgba(168, 85, 247, 0.16)' }
];

export const SBG_TACTICAL_SUBLABELS = [
  { text: '🏛️ 1930 Bandstand (+5,+29)', x: 5.0, z: 26.0, color: '#FEF08A' },
  { text: '💵 $5-Note Tembusu (+7,+35)', x: 6.5, z: 36.8, color: '#86EFAC' },
  { text: '🏡 1910 EJH Corner House (-9,+24)', x: -8.5, z: 26.2, color: '#FDE68A' },
  { text: '🦢 Swan Lake (1866) (-2,+43)', x: -2.0, z: 45.5, color: '#7DD3FC' },
  { text: '🚪 Tanglin Silver Gate (+9,+61)', x: 9.0, z: 63.0, color: '#6EE7B7' },
  { text: '🏛️ Holttum Hall (+18,+51)', x: 18.0, z: 53.5, color: '#FDE047' },
  { text: '🪴 Sundial & Bonsai (+22,+32)', x: 23.0, z: 34.5, color: '#A7F3D0' },
  { text: '❄️ Sembcorp Cool House (-30,-6)', x: -30.0, z: -9.5, color: '#38BDF8' },
  { text: '🏡 1868 Burkill Hall (-25,+5)', x: -25.0, z: 7.8, color: '#FBBF24' },
  { text: '🌊 Ginger Waterfall (-14,+20)', x: -14.4, z: 22.5, color: '#2DD4BF' },
  { text: '🎼 Symphony Lake & Stage (+4,-4)', x: 4.5, z: -6.5, color: '#F9A8D4' },
  { text: '🕰️ Nassim Gate Visitor Ctr (+26,+7)', x: 25.6, z: 9.5, color: '#FCA5A5' },
  { text: '🌳 6-ha Primary Rainforest (+25,+17)', x: 25.0, z: 19.5, color: '#4ADE80' },
  { text: '🌉 Walk of Giants & Wetlands (-45,+36)', x: -45.0, z: 36.5, color: '#93C5FD' },
  { text: '🏠 1898 Atbara & Inverturret (-49,+51)', x: -49.0, z: 56.5, color: '#E2E8F0' },
  { text: '🦩 Eco-Lake Black Swans (+1,-43)', x: 1.0, z: -45.5, color: '#67E8F9' },
  { text: '🌿 Evolution Garden (+16,-31)', x: 16.4, z: -28.5, color: '#FDBA74' },
  { text: '🎠 Jacob Ballas Children’s (+19,-52)', x: 19.0, z: -56.5, color: '#F472B6' },
  { text: '🚇 Bukit Timah MRT Gate (-2,-59)', x: -2.4, z: -61.5, color: '#D8B4FE' }
];
