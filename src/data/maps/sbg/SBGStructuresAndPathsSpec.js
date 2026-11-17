// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Structures, Roads,
// Waterways, Pathways & Landmark Specs
// (src/data/maps/sbg/SBGStructuresAndPathsSpec.js)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. Walkable Bridges & Timber Boardwalks Over Water
// ----------------------------------------------------------------------------
export const SBG_BRIDGES = [
  {
    id: 'dragonfly_main_bridge',
    name: 'Swan Lake Heritage Bridge',
    ax: -28.0,
    az: -6.5,
    bx: -40.0,
    bz: -11.5,
    halfWidth: 2.6,
    archHeight: 1.22,
    buildVisualDeck: true,
    style: 'timber_arch'
  },
  {
    id: 'south_meadow_bridge',
    name: 'Symphony Lake Boardwalk Bridge',
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
    name: 'Ginger Lily Pond Boardwalk',
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
    name: 'Keppel Discovery Wetlands Boardwalk',
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
    name: 'Tyersall Gallop Overpass Bridge',
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
export const SBG_BUILDINGS = [
  {
    id: 'flower_dome',
    name: 'Sembcorp Cool House Conservatory',
    cx: 14.0,
    cz: -36.0,
    rotY: -0.35,
    rx: 14.7,
    rz: 10.0,
    innerScale: 0.87,
    outerScale: 1.03,
    doorWorldAngle: Math.atan2(22.5 - 14.0, -25.5 - -36.0),
    doorHalfAngle: 0.31,
    portalHeight: 3.4,
    portalColor: '#34D399'
  },
  {
    id: 'cloud_forest',
    name: 'Burkill Hall & Orchid Mist House',
    cx: 36.0,
    cz: -26.0,
    rotY: 0.25,
    rx: 10.4,
    rz: 9.0,
    innerScale: 0.86,
    outerScale: 1.03,
    doorWorldAngle: Math.atan2(24.0 - 36.0, -27.5 - -26.0),
    doorHalfAngle: 0.34,
    portalHeight: 3.6,
    portalColor: '#F59E0B'
  },
  {
    id: 'understorey_dome',
    name: 'Holttum Hall Heritage Rotunda',
    cx: 16.5,
    cz: 14.5,
    rotY: 0.0,
    rx: 4.1,
    rz: 4.1,
    innerScale: 0.82,
    outerScale: 1.05,
    doorWorldAngle: Math.atan2(0.0 - 16.5, 0.0 - 14.5),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#FBBF24'
  },
  {
    id: 'skylight_pavilion',
    name: 'Tan Hoon Siang Mist Pavilion',
    cx: -18.0,
    cz: -26.0,
    rotY: 0.4,
    rx: 5.5,
    rz: 5.5,
    innerScale: 0.83,
    outerScale: 1.05,
    openAirPavilion: true,
    doorWorldAngle: Math.atan2(-22.0 - -18.0, -16.0 - -26.0),
    doorHalfAngle: 0.44,
    portalHeight: 2.6,
    portalColor: '#F59E0B'
  },
  {
    id: 'serene_pavilion',
    name: 'Japanese Bonsai & Sundial Pavilion',
    cx: -54.0,
    cz: 32.0,
    rotY: 0.45,
    rx: 4.4,
    rz: 4.1,
    innerScale: 0.82,
    outerScale: 1.05,
    openAirPavilion: true,
    doorWorldAngle: Math.atan2(-44.0 - -54.0, 22.0 - 32.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#10B981'
  },
  {
    id: 'sg50_lattice',
    name: 'Atbara Black-and-White Gallery',
    cx: -54.0,
    cz: -4.0,
    rotY: 0.0,
    rx: 4.25,
    rz: 4.25,
    innerScale: 0.82,
    outerScale: 1.05,
    doorWorldAngle: Math.atan2(-40.0 - -54.0, -8.0 - -4.0),
    doorHalfAngle: 0.46,
    portalHeight: 2.5,
    portalColor: '#10B981'
  }
];

// ----------------------------------------------------------------------------
// 3. Holland Road / Cluny Road Perimeter & Nassim Gate Approach Centerlines
// ----------------------------------------------------------------------------
export const SBG_ROAD_MAIN_POINTS = [
  { x: -44.0, z: 56.0 },
  { x: -24.0, z: 42.0 },
  { x: -8.0, z: 34.0 },
  { x: 10.0, z: 28.5 },
  { x: 27.5, z: 25.0 },
  { x: 48.0, z: 28.5 },
  { x: 68.0, z: 34.5 },
  { x: 83.0, z: 31.5 }
];

export const SBG_ROAD_APPROACH_POINTS = [
  { x: 27.5, z: 25.0 },
  { x: 28.0, z: 17.0 },
  { x: 28.5, z: 9.2 }
];

// ----------------------------------------------------------------------------
// 4. Waterways & Ponds (Swan Lake Channel, Symphony Lake, Eco-Lake & Ginger Pool)
// ----------------------------------------------------------------------------
export const SBG_LAKE_CHANNEL_POINTS = [
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
export const SBG_LAKE_HALF_WIDTH = 3.45;

export const SBG_LAKE_ISLANDS = [
  {
    id: 'nibong_island',
    name: 'Swan_Nest_Island',
    cx: -31.5,
    cz: -18.0,
    r: 3.1,
    eastBankX: -26.5,
    eastBankZ: -18.0,
    causewayHalfWidth: 1.5,
    moundHeight: 0.35
  },
  {
    id: 'dragonfly_island',
    name: 'Dell_Fig_Island',
    cx: -39.0,
    cz: 0.0,
    r: 3.3,
    eastBankX: -34.0,
    eastBankZ: 0.0,
    causewayHalfWidth: 1.5,
    moundHeight: 0.35
  }
];

export const SBG_WATER_PONDS = [
  { name: 'Swan Lake', cx: 42.0, cz: -1.5, x: 42.0, z: -1.5, rx: 4.2, rz: 2.0 },
  { name: 'Symphony Lotus Lake', cx: 42.0, cz: 5.0, x: 42.0, z: 5.0, rx: 5.8, rz: 2.4 },
  { name: 'Eco-Lake', cx: 59.5, cz: 9.8, x: 59.5, z: 9.8, rx: 6.0, rz: 2.6 },
  { name: 'Keppel Discovery Marsh', cx: 62.5, cz: 16.8, x: 62.5, z: 16.8, rx: 5.4, rz: 2.4 },
  { name: 'Ginger Waterfall Pool', cx: -15.0, cz: 10.0, x: -15.0, z: 10.0, rx: 2.6, rz: 1.5 }
];

// ----------------------------------------------------------------------------
// 5. 18 Heritage Rain Tree & Tembusu Planter Specs (Matches SUPERTREE_PLANTER_SPECS 1:1)
// ----------------------------------------------------------------------------
export const SBG_HERITAGE_TREE_SPECS = [
  { x: -5.5, z: -3.5, h: 16.0, hero: true, species: 'Five-Dollar Tembusu Giant' },
  { x: 6.5, z: -2.0, h: 15.6, hero: true, species: 'Walk of Giants Kapok' },
  { x: 0.5, z: 6.5, h: 15.2, hero: true, species: 'Bandstand Rain Tree Monarch' },
  { x: -12.5, z: -9.5, h: 12.2, hero: false, species: 'Tanglin Tembusu' },
  { x: -2.0, z: -12.5, h: 12.6, hero: false, species: 'Saraca Stream Tree' },
  { x: 11.5, z: -9.0, h: 12.4, hero: false, species: 'Cannonball Tree' },
  { x: 14.5, z: 1.5, h: 11.4, hero: false, species: 'Burmese Banyan' },
  { x: 11.0, z: 11.5, h: 12.0, hero: false, species: 'Yellow Flame Tree' },
  { x: 0.0, z: 15.0, h: 11.2, hero: false, species: 'Bandstand Angsana' },
  { x: -10.5, z: 11.0, h: 11.6, hero: false, species: 'White Gutta Tree' },
  { x: -15.0, z: 1.5, h: 10.8, hero: false, species: 'Malayan Jelutong' },
  { x: 4.5, z: -15.5, h: 10.6, hero: false, species: 'Sea Apple Heritage Tree' },
  // 3 Orchid Garden & Crane Fountain Heritage Trees
  { x: -4.2, z: -29.5, h: 11.0, hero: false, species: 'Orchid Plaza Rain Tree' },
  { x: 0.5, z: -28.0, h: 10.2, hero: false, species: 'Burkill Hill Tembusu' },
  { x: -1.8, z: -23.0, h: 9.8, hero: false, species: 'Tiger Orchid Host Tree' },
  // 3 Nassim Gate & Clock Tower Heritage Trees
  { x: 28.0, z: -5.8, h: 11.2, hero: false, species: 'Nassim Gate Rain Tree' },
  { x: 32.5, z: -4.0, h: 10.2, hero: false, species: 'Frangipani Collection Giant' },
  { x: 30.2, z: -0.5, h: 10.4, hero: false, species: 'Talipot Palm Giant' }
];

// ----------------------------------------------------------------------------
// 6. Key Landmark Callouts for Floating 3D-to-2D World Labels
// ----------------------------------------------------------------------------
export const SBG_KEY_LANDMARK_CALLOUTS = [
  { id: 'lm_supertree', text: '🏛️ The Bandstand (1930)', x: 0, y: 22, z: 0, pos: { x: 0, y: 22, z: 0 } },
  { id: 'lm_flower_dome', text: '❄️ Sembcorp Cool House', x: 14, y: 18, z: -36, pos: { x: 14, y: 18, z: -36 } },
  { id: 'lm_cloud_forest', text: '🏡 Burkill Hall & Mist House', x: 36, y: 20, z: -26, pos: { x: 36, y: 20, z: -26 } },
  { id: 'lm_dragonfly', text: '🦢 Swan Lake Bridge', x: -34, y: 6.5, z: -12, pos: { x: -34, y: 6.5, z: -12 } },
  { id: 'lm_moongate', text: '🚪 Tanglin Silver Gate', x: -22, y: 6.2, z: -16, pos: { x: -22, y: 6.2, z: -16 } },
  { id: 'lm_planet', text: '🎼 Shaw Symphony Stage', x: -36, y: 8.2, z: 10, pos: { x: -36, y: 8.2, z: 10 } },
  { id: 'lm_serene', text: '🪴 Bonsai & Sundial Garden', x: -54, y: 7.5, z: 32, pos: { x: -54, y: 7.5, z: 32 } },
  { id: 'lm_lotus', text: '🦩 Eco-Lake & Wetlands', x: 44, y: 7.5, z: 6, pos: { x: 44, y: 7.5, z: 6 } }
];

// ----------------------------------------------------------------------------
// 7. Plaza Nodes, Pathway Polylines & Tactical Map Zones/Sublabels
// ----------------------------------------------------------------------------
export const SBG_PLAZA_NODES = [
  { x: 0, z: 0, r: 15.0, name: 'The Bandstand Octagonal Lawn' },
  { x: 24, z: -26, r: 12.0, name: 'National Orchid Garden Golden Shower Plaza' },
  { x: -20, z: -16, r: 9.6, name: 'Tanglin Gate & Botany Centre Forecourt' },
  { x: -33, z: 24, r: 12.2, name: 'Palm Valley & Shaw Symphony Amphitheater' },
  { x: -54, z: 32, r: 8.5, name: 'Sundial & Japanese Bonsai Courtyard' },
  { x: -50, z: -11, r: 8.2, name: 'Gallop Extension & Atbara Lawn' },
  { x: -39, z: -24, r: 8.0, name: 'Inverturret Forest Discovery Plaza' },
  { x: 16.5, z: 14.5, r: 7.0, name: 'Holttum Hall & Evolution Garden Plaza' },
  { x: 35.5, z: -7.5, r: 4.8, name: 'Sun Rockery & Cycad Terrace' },
  { x: 50.0, z: 9.5, r: 3.1, name: 'Keppel Discovery Wetlands Entry Deck' },
  { x: 74, z: 15, r: 5.6, name: 'Bukit Timah Gate &Halia Ginger Terrace' }
];

export const SBG_PATHWAY_POLYLINES = [
  [
    { x: -22, z: -16 }, { x: -19, z: -28 }, { x: -12, z: -34 }, { x: -4, z: -34.5 },
    { x: 6, z: -37 }, { x: 24, z: -26 }, { x: 44, z: -18 }, { x: 56, z: -4 },
    { x: 76, z: 16 }, { x: 72, z: 24 }
  ],
  [{ x: 0, z: 0 }, { x: -1, z: -24 }, { x: 14, z: -26 }, { x: 24, z: -26 }],
  [{ x: 0, z: 0 }, { x: 15, z: -2 }, { x: 28.5, z: 1.5 }],
  [{ x: 0, z: 0 }, { x: -12, z: -10 }, { x: -22, z: -15 }, { x: -28, z: -6.5 }],
  [{ x: -40, z: -11.5 }, { x: -50, z: -11 }, { x: -42, z: -20 }, { x: -37, z: -28 }],
  [{ x: 0, z: 0 }, { x: -11, z: 14.5 }, { x: -21, z: 17.5 }, { x: -33, z: 24 }, { x: -42, z: 38 }],
  [{ x: -54, z: 32 }, { x: -43, z: 27 }, { x: -33, z: 24 }, { x: -39.5, z: 14.0 }],
  [{ x: -58.5, z: 16.0 }, { x: -56.0, z: 2.0 }, { x: -50.0, z: -11.0 }],
  [{ x: 0, z: 0 }, { x: 14, z: 15 }, { x: 28, z: 12 }, { x: 35, z: 9.5 }],
  [
    { x: 24, z: -26 }, { x: 36, z: -18 }, { x: 35.5, z: -7.5 }, { x: 47, z: -13.5 },
    { x: 50.8, z: 1.5 }, { x: 50.8, z: 9.5 }, { x: 53, z: 19 }, { x: 66, z: 22 }, { x: 74, z: 15 }
  ]
];

export const SBG_TACTICAL_ZONES = [
  { name: 'ZONE 1: TANGLIN CORE & BANDSTAND', x: 0, z: 0, r: 18, color: 'rgba(16, 185, 129, 0.16)' },
  { name: 'ZONE 2: NATIONAL ORCHID GARDEN', x: 25, z: -30, r: 18, color: 'rgba(245, 158, 11, 0.16)' },
  { name: 'ZONE 3: SWAN LAKE & TANGLIN GATE', x: -24, z: -15, r: 16, color: 'rgba(56, 189, 248, 0.16)' },
  { name: 'ZONE 4: PALM VALLEY & SYMPHONY STAGE', x: -35, z: 22, r: 18, color: 'rgba(236, 72, 153, 0.15)' },
  { name: 'ZONE 5: ECO-LAKE, GINGER & CHILDREN', x: 52, z: 4, r: 18, color: 'rgba(52, 211, 153, 0.16)' }
];

export const SBG_TACTICAL_SUBLABELS = [
  { text: 'Crane Fountain & Vanda Lawn', x: -1.5, z: -27, color: '#E2E8F0' },
  { text: 'Frangipani & Clock Tower', x: 30.5, z: -4.5, color: '#FDE047' },
  { text: 'Nassim Gate Visitor Centre', x: 28.5, z: 10.5, color: '#FCA5A5' },
  { text: 'Holttum Hall & Evolution Garden', x: 14, z: 20, color: '#86EFAC' },
  { text: 'Japanese Bonsai & Sundial', x: -54, z: 36, color: '#6EE7B7' },
  { text: 'Atbara Black & White House', x: -52, z: -14, color: '#F9A8D4' },
  { text: 'Inverturret & Learning Forest', x: -40, z: -26, color: '#93C5FD' },
  { text: 'Sun Rockery & Prehistoric Cycads', x: 44, z: -11, color: '#FDBA74' },
  { text: 'Bukit Timah Gate & Eco-Garden', x: 74, z: 18, color: '#FDE047' },
  { text: 'Ridley Hall Rubber Heritage', x: -42, z: 41, color: '#CBD5E1' }
];
