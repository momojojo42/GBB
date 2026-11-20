// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 4 Official NParks Cores,
// Zone Metadata, Scenic Pathways, Plaza Nodes & Spatial Zone Resolver
// (src/data/SbgZoneSpec.js)
// ============================================================================

export const SBG_CORES_SPEC = [
  {
    id: 'tanglin_core',
    coreNumber: 1,
    name: 'Core 1 — Tanglin Core (South Heritage Core)',
    shortName: 'Tanglin Core',
    badge: 'CORE 1 • TANGLIN CORE (1859)',
    color: '#10B981',
    bounds: { minX: -140.0, maxX: 180.0, minZ: 135.0, maxZ: 325.0 },
    teleportPos: { x: 25.0, z: 162.0 },
    labelPos: { x: 32.0, z: 282.0 },
    highlights: [
      'Tanglin Gate (Silver Gate) at (45, 305)',
      'Botany Centre & Holttum Hall at (88, 255)',
      'Swan Lake & Flight of Swans + Gazebo Bridge (-55..35, 175..255)',
      'Iconic 1930 Octagonal Bandstand at (25, 145)',
      'Five-Dollar Note Heritage Tembusu Tree at (-35, 168)',
      'Sundial Garden & Heritage / Bonsai Pergola at (112, 160)'
    ]
  },
  {
    id: 'central_core',
    coreNumber: 2,
    name: 'Core 2 — Central Core (National Orchid Garden & Palm Valley)',
    shortName: 'Central Core',
    badge: 'CORE 2 • CENTRAL & ORCHID GARDEN',
    color: '#F59E0B',
    bounds: { minX: -185.0, maxX: 195.0, minZ: -115.0, maxZ: 125.0 },
    teleportPos: { x: -92.0, z: 24.0 },
    labelPos: { x: 20.0, z: -92.0 },
    highlights: [
      'Nassim Gate Visitor Centre & Clock Tower at (128, 35)',
      'Burkill Hall (1868 Anglo-Malayan Manor) at (-125, 18)',
      'Sembcorp Cool House (Montane Orchidetum) at (-158, -28)',
      'Tan Hoon Siang Mist House & Golden Shower Arches at (-88, 52)',
      'Ginger Garden & Walk-Behind Cavern Waterfall at (-72, 98)',
      'Symphony Lake & Shaw Foundation Symphony Stage (-25..72, -75..35)',
      '6-Hectare Primary Rain Forest Trail (85..165, 45..125)'
    ]
  },
  {
    id: 'tyersall_gallop_core',
    coreNumber: 3,
    name: 'Core 3 — Tyersall–Gallop Extension (South-West Wing)',
    shortName: 'Tyersall–Gallop',
    badge: 'CORE 3 • TYERSALL–GALLOP EXTENSION',
    color: '#38BDF8',
    bounds: { minX: -310.0, maxX: -145.0, minZ: 95.0, maxZ: 295.0 },
    teleportPos: { x: -235.0, z: 205.0 },
    labelPos: { x: -232.0, z: 115.0 },
    highlights: [
      'Learning Forest & Keppel Discovery Wetlands at (-215, 155)',
      'SPH Walk of Giants Elevated Canopy Boardwalk at (-235, 205)',
      'Atbara House (1898 Black-and-White Forest Discovery Centre) at (-275, 245)',
      'Inverturret (1906 Botanical Art Gallery Bungalow) at (-242, 278)',
      'COMO Adventure Grove (Giant Cempedak Play Pod) at (-182, 258)'
    ]
  },
  {
    id: 'bukit_timah_core',
    coreNumber: 4,
    name: 'Core 4 — Bukit Timah Core (North Eco-Lake & Children’s Garden)',
    shortName: 'Bukit Timah Core',
    badge: 'CORE 4 • BUKIT TIMAH CORE (NORTH)',
    color: '#A855F7',
    bounds: { minX: -145.0, maxX: 175.0, minZ: -325.0, maxZ: -120.0 },
    teleportPos: { x: 25.0, z: -142.0 },
    labelPos: { x: 15.0, z: -295.0 },
    highlights: [
      'Eco-Lake & Black-Necked Swans Sanctuary (-45..55, -265..-165)',
      'Foliage Valley & Bamboo / Evolution Garden Spine at (82, -155)',
      'Jacob Ballas Children’s Garden & Suspension Bridge at (95, -278)',
      'Bukit Timah Gate (Botanic Gardens MRT North Entrance) at (-12, -312)'
    ]
  }
];

export const SBG_ZONE_METADATA = {
  tanglin_core: {
    id: 'tanglin_core',
    name: 'Core 1: Tanglin Core & Bandstand',
    shortName: 'Tanglin Core',
    color: '#10B981',
    badge: 'CORE 1 • TANGLIN CORE (1859)',
    title: 'Tanglin Silver Gate, Swan Lake & 1930 Bandstand',
    desc: 'Historic 1859 pleasure grounds featuring Swan Lake, the 1930 Octagonal Bandstand, the $5-Note Tembusu tree, and Holttum Hall.'
  },
  central_core: {
    id: 'central_core',
    name: 'Core 2: Central Core & National Orchid Garden',
    shortName: 'Central Core',
    color: '#F59E0B',
    badge: 'CORE 2 • CENTRAL & ORCHID GARDEN',
    title: 'National Orchid Garden, Symphony Lake & Rainforest',
    desc: '1868 Burkill Hall, Sembcorp Cool House, Tan Hoon Siang Mist House, Ginger Waterfall, Symphony Lake, and the 6-ha Primary Rainforest.'
  },
  tyersall_gallop_core: {
    id: 'tyersall_gallop_core',
    name: 'Core 3: Tyersall–Gallop Extension',
    shortName: 'Tyersall–Gallop',
    color: '#38BDF8',
    badge: 'CORE 3 • TYERSALL–GALLOP WING',
    title: 'Learning Forest, Walk of Giants & Colonial Houses',
    desc: 'Keppel Discovery Wetlands, SPH Walk of Giants Canopy Boardwalk, 1898 Atbara House, 1906 Inverturret Gallery, and COMO Adventure Grove.'
  },
  bukit_timah_core: {
    id: 'bukit_timah_core',
    name: 'Core 4: Bukit Timah Core & Eco-Lake',
    shortName: 'Bukit Timah Core',
    color: '#A855F7',
    badge: 'CORE 4 • BUKIT TIMAH CORE',
    title: 'Eco-Lake, Evolution Spine & Jacob Ballas Children’s Garden',
    desc: 'Black-Necked Swans Sanctuary at Eco-Lake, prehistoric Evolution Garden cycads, Jacob Ballas Treehouse Bridge, and Bukit Timah MRT Gate.'
  },
  // Legacy 5-zone aliases for seamless compatibility with UI filters
  supertree: {
    id: 'supertree',
    name: 'Core 1: Tanglin Core & Bandstand',
    shortName: 'Tanglin Core',
    color: '#10B981',
    badge: 'CORE 1 • TANGLIN CORE (1859)',
    title: 'Tanglin Silver Gate, Swan Lake & 1930 Bandstand',
    desc: 'Historic 1859 pleasure grounds featuring Swan Lake, the 1930 Octagonal Bandstand, the $5-Note Tembusu tree, and Holttum Hall.'
  },
  conservatories: {
    id: 'conservatories',
    name: 'Core 2: National Orchid Garden & Ginger Waterfall',
    shortName: 'Central Core (Orchids)',
    color: '#F59E0B',
    badge: 'CORE 2 • NATIONAL ORCHID GARDEN',
    title: 'Burkill Hall, Cool House & Mist House',
    desc: 'Over 1,000 orchid species and 2,000 hybrids surrounding 1868 Burkill Hall, Sembcorp Cool House, and Golden Shower Arches.'
  },
  dragonfly: {
    id: 'dragonfly',
    name: 'Core 3: Tyersall–Gallop & Learning Forest',
    shortName: 'Tyersall–Gallop',
    color: '#38BDF8',
    badge: 'CORE 3 • TYERSALL–GALLOP WING',
    title: 'Keppel Wetlands, Walk of Giants & Atbara House',
    desc: 'Elevated canopy boardwalks, freshwater forest wetlands, 1898 Atbara House, 1906 Inverturret, and COMO Cempedak Play Pod.'
  },
  meadow: {
    id: 'meadow',
    name: 'Core 2: Palm Valley & Symphony Lake',
    shortName: 'Central Core (Symphony)',
    color: '#EC4899',
    badge: 'CORE 2 • PALM VALLEY & SYMPHONY',
    title: 'Symphony Lake, Shaw Stage & Chopin Statue',
    desc: 'Sweeping Palm Valley amphitheatre lawn facing the Shaw Foundation Symphony Stage, Nassim Gate, and Primary Rainforest.'
  },
  wetlands: {
    id: 'wetlands',
    name: 'Core 4: Bukit Timah Core & Eco-Lake',
    shortName: 'Bukit Timah Core',
    color: '#A855F7',
    badge: 'CORE 4 • BUKIT TIMAH CORE',
    title: 'Eco-Lake, Evolution Spine & Jacob Ballas',
    desc: 'Eco-Lake Black-Necked Swans Sanctuary, Evolution Garden prehistoric cycads, and Jacob Ballas Children’s Garden.'
  }
};

export const SBG_PATHWAYS_SPEC = [
  {
    id: 'north_south_unesco_grand_spine',
    name: 'Main North–South UNESCO Heritage Spine',
    width: 9.0,
    points: [
      { x: 45, z: 305 }, { x: 42, z: 265 }, { x: 48, z: 212 }, { x: 25, z: 162 },
      { x: 25, z: 145 }, { x: 22, z: 95 }, { x: 18, z: 56 }, { x: -12, z: 54 },
      { x: -38, z: 8 }, { x: -36, z: -55 }, { x: 12, z: -98 }, { x: 25, z: -142 },
      { x: 68, z: -185 }, { x: 78, z: -215 }, { x: 55, z: -272 }, { x: 18, z: -292 }, { x: -12, z: -312 }
    ]
  },
  {
    id: 'tanglin_core_swan_lake_loop',
    name: 'Tanglin Core, Swan Lake & Holttum Hall Loop',
    width: 7.5,
    points: [
      { x: 45, z: 305 }, { x: 68, z: 298 }, { x: 62, z: 268 }, { x: 88, z: 255 },
      { x: 112, z: 248 }, { x: 112, z: 182 }, { x: 112, z: 160 }, { x: 68, z: 152 },
      { x: 25, z: 145 }, { x: -5, z: 152 }, { x: -35, z: 168 }, { x: -52, z: 165 },
      { x: -68, z: 212 }, { x: -45, z: 268 }, { x: 25, z: 295 }, { x: 45, z: 305 }
    ]
  },
  {
    id: 'national_orchid_garden_plateau_loop',
    name: 'National Orchid Garden & Ginger Waterfall Loop',
    width: 7.0,
    points: [
      { x: -38, z: 8 }, { x: -62, z: 12 }, { x: -92, z: 24 }, { x: -88, z: 52 },
      { x: -64, z: 52 }, { x: -45, z: 96 }, { x: -72, z: 98 }, { x: -102, z: 92 },
      { x: -148, z: 48 }, { x: -125, z: 18 }, { x: -125, z: -6 }, { x: -158, z: -28 },
      { x: -132, z: -28 }, { x: -105, z: -12 }, { x: -62, z: 12 }
    ]
  },
  {
    id: 'central_nassim_rainforest_loop',
    name: 'Nassim Gate, Primary Rain Forest & Palm Valley Loop',
    width: 7.5,
    points: [
      { x: 25, z: 145 }, { x: 68, z: 195 }, { x: 96, z: 108 }, { x: 142, z: 85 },
      { x: 105, z: 68 }, { x: 128, z: 35 }, { x: 102, z: 22 }, { x: 92, z: -28 },
      { x: 78, z: -78 }, { x: 12, z: -98 }
    ]
  },
  {
    id: 'tyersall_gallop_learning_forest_trail',
    name: 'Tyersall–Gallop Extension, Walk of Giants & Colonial Houses Trail',
    width: 7.0,
    points: [
      { x: -68, z: 212 }, { x: -135, z: 185 }, { x: -168, z: 145 }, { x: -186, z: 155 },
      { x: -244, z: 155 }, { x: -258, z: 155 }, { x: -262, z: 192 }, { x: -235, z: 205 },
      { x: -275, z: 245 }, { x: -252, z: 235 }, { x: -242, z: 278 }, { x: -212, z: 272 },
      { x: -182, z: 284 }, { x: -182, z: 258 }, { x: -165, z: 232 }, { x: -195, z: 205 }
    ]
  },
  {
    id: 'bukit_timah_ecolake_children_loop',
    name: 'Bukit Timah Core, Eco-Lake & Jacob Ballas Children’s Loop',
    width: 7.0,
    points: [
      { x: 25, z: -142 }, { x: 82, z: -155 }, { x: 108, z: -155 }, { x: 98, z: -225 },
      { x: 95, z: -278 }, { x: 68, z: -282 }, { x: 18, z: -292 }, { x: -12, z: -312 },
      { x: -52, z: -282 }, { x: -68, z: -252 }, { x: -72, z: -195 }, { x: -48, z: -152 }
    ]
  }
];

export const SBG_PLAZA_NODES_SPEC = [
  { x: 45, z: 305, r: 16.0, name: 'Tanglin Silver Gate Arrival Forecourt', coreId: 'tanglin_core' },
  { x: 88, z: 255, r: 18.0, name: 'Botany Centre & Holttum Hall Plaza', coreId: 'tanglin_core' },
  { x: 25, z: 145, r: 22.0, name: 'The 1930 Octagonal Bandstand Ring', coreId: 'tanglin_core' },
  { x: 112, z: 160, r: 15.0, name: 'Victorian Sundial & Bonsai Courtyard', coreId: 'tanglin_core' },
  { x: 128, z: 35, r: 18.0, name: 'Nassim Gate Visitor Centre & Clock Tower Plaza', coreId: 'central_core' },
  { x: -125, z: 18, r: 18.0, name: 'Burkill Hall 1868 Manor Lawn', coreId: 'central_core' },
  { x: -158, z: -28, r: 18.0, name: 'Sembcorp Cool House Terrace', coreId: 'central_core' },
  { x: -88, z: 52, r: 16.0, name: 'Tan Hoon Siang Mist House & Golden Shower Plaza', coreId: 'central_core' },
  { x: 18, z: 56, r: 22.0, name: 'Palm Valley Amphitheatre & Chopin Lawn', coreId: 'central_core' },
  { x: -235, z: 205, r: 18.0, name: 'SPH Walk of Giants Canopy Deck', coreId: 'tyersall_gallop_core' },
  { x: -275, z: 245, r: 16.0, name: 'Atbara 1898 Forest Discovery Courtyard', coreId: 'tyersall_gallop_core' },
  { x: -242, z: 278, r: 16.0, name: 'Inverturret 1906 Botanical Art Lawn', coreId: 'tyersall_gallop_core' },
  { x: -182, z: 258, r: 16.0, name: 'COMO Adventure Grove Cempedak Plaza', coreId: 'tyersall_gallop_core' },
  { x: 82, z: -155, r: 18.0, name: 'Foliage Valley & Evolution Garden Plaza', coreId: 'bukit_timah_core' },
  { x: 95, z: -278, r: 18.0, name: 'Jacob Ballas Children’s Garden Plaza', coreId: 'bukit_timah_core' },
  { x: -12, z: -312, r: 16.0, name: 'Bukit Timah MRT Gate Arrival Plaza', coreId: 'bukit_timah_core' }
];

export function detectSbgCoreFromPosition(x, z) {
  if (z <= -120) return SBG_ZONE_METADATA.bukit_timah_core;
  if (x <= -145 && z >= 95) return SBG_ZONE_METADATA.tyersall_gallop_core;
  if (z >= 135) return SBG_ZONE_METADATA.tanglin_core;
  return SBG_ZONE_METADATA.central_core;
}

export const detectSbgZoneFromPosition = detectSbgCoreFromPosition;
