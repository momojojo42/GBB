// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 1:1 NParks World Spec
// North–South 4-Core Spine (-380m to +380m X/Z, -Z = North, +Z = South)
// 8 Major Buildings, 10 Gates/Bridges/Sculptures, 9 Heritage Trees/Flora,
// 3 Iconic Lakes (Swan Lake, Symphony Lake, Eco-Lake + Keppel Wetlands),
// 6 Enterable Portals, 5 Walkable Bridges & Safe `isInsideSbgWater(x, z)`
// (src/data/SbgWorldSpec.js)
// ============================================================================

export const SBG_WORLD_BOUNDS = { minX: -380.0, maxX: 380.0, minZ: -380.0, maxZ: 380.0 };

export const SBG_PARK_BOUNDARY_POLYGON = [
  { x: -45.0, z: -335.0 }, { x: 35.0, z: -332.0 }, { x: 135.0, z: -305.0 },
  { x: 182.0, z: -235.0 }, { x: 168.0, z: -135.0 }, { x: 198.0, z: -25.0 },
  { x: 192.0, z: 55.0 }, { x: 178.0, z: 135.0 }, { x: 185.0, z: 215.0 },
  { x: 145.0, z: 295.0 }, { x: 55.0, z: 328.0 }, { x: -45.0, z: 318.0 },
  { x: -135.0, z: 285.0 }, { x: -215.0, z: 302.0 }, { x: -298.0, z: 285.0 },
  { x: -315.0, z: 205.0 }, { x: -285.0, z: 115.0 }, { x: -192.0, z: 88.0 },
  { x: -188.0, z: 15.0 }, { x: -185.0, z: -52.0 }, { x: -142.0, z: -125.0 },
  { x: -148.0, z: -235.0 }, { x: -105.0, z: -310.0 }
];

// ----------------------------------------------------------------------------
// 1. 3 Iconic Lakes (Swan Lake, Symphony Lake, Eco-Lake) + Keppel Wetlands
// ----------------------------------------------------------------------------
export const SBG_LAKES = [
  {
    id: 'swan_lake',
    name: 'Swan Lake (1866 Heritage Lake)',
    coreId: 'tanglin_core',
    lakeNumber: 1,
    isPrimaryLake: true,
    cx: -10.0, cz: 215.0, x: -10.0, z: 215.0, rx: 45.0, rz: 40.0,
    bounds: { minX: -55.0, maxX: 35.0, minZ: 175.0, maxZ: 255.0 },
    waterHex: 0x0ea5e9, emissiveHex: 0x0369a1,
    islands: [{ id: 'swan_nest_island', name: 'Swan Nest Island', cx: -14.0, cz: 196.0, rx: 9.5, rz: 7.0 }],
    polygon: [
      { x: -52.0, z: 192.0 }, { x: -36.0, z: 177.0 }, { x: -10.0, z: 175.0 }, { x: 18.0, z: 179.0 },
      { x: 34.0, z: 196.0 }, { x: 35.0, z: 218.0 }, { x: 26.0, z: 242.0 }, { x: 4.0, z: 254.0 },
      { x: -24.0, z: 255.0 }, { x: -46.0, z: 243.0 }, { x: -55.0, z: 222.0 }, { x: -54.0, z: 205.0 }
    ]
  },
  {
    id: 'symphony_lake',
    name: 'Symphony Lake (Palm Valley Lotus Lake)',
    coreId: 'central_core',
    lakeNumber: 2,
    isPrimaryLake: true,
    cx: 23.5, cz: -20.0, x: 23.5, z: -20.0, rx: 48.5, rz: 55.0,
    bounds: { minX: -25.0, maxX: 72.0, minZ: -75.0, maxZ: 35.0 },
    waterHex: 0x06b6d4, emissiveHex: 0x0891b2,
    islands: [{ id: 'symphony_stage_islet', name: 'Shaw Symphony Stage Islet', cx: 18.0, cz: -22.0, rx: 14.0, rz: 11.5 }],
    polygon: [
      { x: -22.0, z: -52.0 }, { x: -4.0, z: -72.0 }, { x: 24.0, z: -75.0 }, { x: 54.0, z: -66.0 },
      { x: 70.0, z: -42.0 }, { x: 72.0, z: -12.0 }, { x: 64.0, z: 18.0 }, { x: 42.0, z: 34.0 },
      { x: 12.0, z: 35.0 }, { x: -14.0, z: 24.0 }, { x: -25.0, z: -4.0 }, { x: -24.0, z: -30.0 }
    ]
  },
  {
    id: 'eco_lake',
    name: 'Eco-Lake (Black-Necked Swans Sanctuary)',
    coreId: 'bukit_timah_core',
    lakeNumber: 3,
    isPrimaryLake: true,
    cx: 5.0, cz: -215.0, x: 5.0, z: -215.0, rx: 50.0, rz: 50.0,
    bounds: { minX: -45.0, maxX: 55.0, minZ: -265.0, maxZ: -165.0 },
    waterHex: 0x14b8a6, emissiveHex: 0x0d9488,
    islands: [{ id: 'black_swan_islet', name: 'Black-Necked Swans Islet', cx: 6.0, cz: -218.0, rx: 11.0, rz: 8.5 }],
    polygon: [
      { x: -42.0, z: -242.0 }, { x: -20.0, z: -262.0 }, { x: 10.0, z: -265.0 }, { x: 38.0, z: -256.0 },
      { x: 54.0, z: -234.0 }, { x: 55.0, z: -206.0 }, { x: 44.0, z: -178.0 }, { x: 18.0, z: -165.0 },
      { x: -14.0, z: -166.0 }, { x: -38.0, z: -180.0 }, { x: -45.0, z: -208.0 }, { x: -44.0, z: -228.0 }
    ]
  },
  {
    id: 'keppel_wetlands',
    name: 'Keppel Discovery Wetlands (Pulai Marsh)',
    coreId: 'tyersall_gallop_core',
    lakeNumber: 4,
    isPrimaryLake: false,
    cx: -215.0, cz: 155.0, x: -215.0, z: 155.0, rx: 26.0, rz: 21.0,
    bounds: { minX: -241.0, maxX: -189.0, minZ: 134.0, maxZ: 176.0 },
    waterHex: 0x10b981, emissiveHex: 0x059669,
    islands: [],
    polygon: [
      { x: -241.0, z: 155.0 }, { x: -234.0, z: 139.0 }, { x: -215.0, z: 134.0 }, { x: -196.0, z: 139.0 },
      { x: -189.0, z: 155.0 }, { x: -196.0, z: 171.0 }, { x: -215.0, z: 176.0 }, { x: -234.0, z: 171.0 }
    ]
  },
  {
    id: 'ginger_pool',
    name: 'Ginger Waterfall & Halia Pool',
    coreId: 'central_core',
    lakeNumber: 5,
    isPrimaryLake: false,
    cx: -72.0, cz: 98.0, x: -72.0, z: 98.0, rx: 12.0, rz: 10.0,
    bounds: { minX: -84.0, maxX: -60.0, minZ: 88.0, maxZ: 108.0 },
    waterHex: 0x2dd4bf, emissiveHex: 0x0f766e,
    islands: [],
    polygon: [
      { x: -84.0, z: 98.0 }, { x: -80.0, z: 90.0 }, { x: -72.0, z: 88.0 }, { x: -64.0, z: 90.0 },
      { x: -60.0, z: 98.0 }, { x: -64.0, z: 106.0 }, { x: -72.0, z: 108.0 }, { x: -80.0, z: 106.0 }
    ]
  }
];

export const SBG_LAKE_POLYGONS = Object.fromEntries(SBG_LAKES.map((lk) => [lk.id, lk.polygon]));

// ----------------------------------------------------------------------------
// 2. 8 Major Architectural Buildings & 6 Enterable Building Portals
// ----------------------------------------------------------------------------
export const SBG_BUILDINGS = [
  {
    id: 'bandstand_1930', glbNode: 'SBG_Bandstand_Gazebo_1930',
    name: 'Iconic 1930 Octagonal Bandstand', coreId: 'tanglin_core',
    cx: 25.0, cz: 145.0, x: 25.0, z: 145.0, rx: 11.0, rz: 11.0, rotY: 0.0,
    enterable: false, openAirPavilion: true, innerScale: 0.84, outerScale: 1.04
  },
  {
    id: 'botany_centre_holttum_hall', glbNode: 'SBG_Botany_Centre_Holttum_Hall',
    name: 'Botany Centre & Holttum Hall (1921 Heritage Museum)', coreId: 'tanglin_core',
    cx: 88.0, cz: 255.0, x: 88.0, z: 255.0, rx: 16.0, rz: 13.0, rotY: -0.25,
    enterable: true, openAirPavilion: false, innerScale: 0.85, outerScale: 1.04,
    doorWorldAngle: -1.57, doorHalfAngle: 0.44, portalHeight: 3.2, portalColor: '#FBBF24'
  },
  {
    id: 'burkill_hall_1868', glbNode: 'SBG_Burkill_Hall_1868',
    name: 'Burkill Hall (1868 Anglo-Malayan Plantation Manor)', coreId: 'central_core',
    cx: -125.0, cz: 18.0, x: -125.0, z: 18.0, rx: 15.0, rz: 12.0, rotY: 0.20,
    enterable: true, openAirPavilion: false, innerScale: 0.85, outerScale: 1.04,
    doorWorldAngle: 1.57, doorHalfAngle: 0.42, portalHeight: 3.4, portalColor: '#F59E0B'
  },
  {
    id: 'sembcorp_cool_house', glbNode: 'SBG_Sembcorp_Cool_House',
    name: 'Sembcorp Cool House (Glass Montane Orchidetum)', coreId: 'central_core',
    cx: -158.0, cz: -28.0, x: -158.0, z: -28.0, rx: 18.0, rz: 14.0, rotY: -0.30,
    enterable: true, openAirPavilion: false, innerScale: 0.86, outerScale: 1.03,
    doorWorldAngle: 1.57, doorHalfAngle: 0.38, portalHeight: 3.6, portalColor: '#38BDF8'
  },
  {
    id: 'tan_hoon_siang_mist_house', glbNode: 'SBG_Tan_Hoon_Siang_Mist_House',
    name: 'Tan Hoon Siang Mist House & Golden Shower Arches', coreId: 'central_core',
    cx: -88.0, cz: 52.0, x: -88.0, z: 52.0, rx: 13.0, rz: 11.0, rotY: 0.35,
    enterable: true, openAirPavilion: true, innerScale: 0.84, outerScale: 1.04,
    doorWorldAngle: 0.0, doorHalfAngle: 0.45, portalHeight: 3.0, portalColor: '#FACC15'
  },
  {
    id: 'shaw_symphony_stage', glbNode: 'SBG_Shaw_Symphony_Stage',
    name: 'Shaw Foundation Symphony Stage', coreId: 'central_core',
    cx: 18.0, cz: -22.0, x: 18.0, z: -22.0, rx: 13.0, rz: 10.5, rotY: 0.0,
    enterable: false, openAirPavilion: true, innerScale: 0.84, outerScale: 1.04
  },
  {
    id: 'atbara_house_1898', glbNode: 'SBG_Atbara_House_1898',
    name: 'Atbara House (1898 Black-and-White Forest Discovery Centre)', coreId: 'tyersall_gallop_core',
    cx: -275.0, cz: 245.0, x: -275.0, z: 245.0, rx: 14.0, rz: 12.0, rotY: 0.15,
    enterable: true, openAirPavilion: false, innerScale: 0.84, outerScale: 1.04,
    doorWorldAngle: 1.57, doorHalfAngle: 0.44, portalHeight: 3.0, portalColor: '#10B981'
  },
  {
    id: 'inverturret_gallery_1906', glbNode: 'SBG_Inverturret_Gallery_1906',
    name: 'Inverturret (1906 Botanical Art Gallery Bungalow)', coreId: 'tyersall_gallop_core',
    cx: -242.0, cz: 278.0, x: -242.0, z: 278.0, rx: 13.0, rz: 11.0, rotY: -0.18,
    enterable: true, openAirPavilion: false, innerScale: 0.84, outerScale: 1.04,
    doorWorldAngle: 0.0, doorHalfAngle: 0.44, portalHeight: 3.0, portalColor: '#38BDF8'
  }
];

export const SBG_ENTERABLE_PORTALS = SBG_BUILDINGS.filter((b) => b.enterable);

// ----------------------------------------------------------------------------
// 3. 10 Gates / Bridges / Sculptures + 4 Entrance Gates + 5 Walkable Bridges
// ----------------------------------------------------------------------------
export const SBG_GATES_BRIDGES_SCULPTURES = [
  { id: 'tanglin_silver_gate', glbNode: 'SBG_Tanglin_Silver_Gate', name: 'Tanglin Gate (Silver Gate)', coreId: 'tanglin_core', x: 45.0, z: 305.0, r: 7.5 },
  { id: 'swan_lake_gazebo_bridge', glbNode: 'SBG_Swan_Lake_Gazebo_Bridge', name: 'Swan Lake Gazebo Bridge', coreId: 'tanglin_core', x: -10.0, z: 212.0, r: 8.0 },
  { id: 'flight_of_swans_sculpture', glbNode: 'SBG_Flight_Of_Swans_Sculpture', name: 'Flight of Swans Sculpture', coreId: 'tanglin_core', x: -18.0, z: 228.0, r: 4.5 },
  { id: 'sundial_bonsai_pergola', glbNode: 'SBG_Sundial_Bonsai_Pergola', name: 'Sundial Garden & Bonsai Pergola', coreId: 'tanglin_core', x: 112.0, z: 160.0, r: 9.0 },
  { id: 'nassim_gate_clock_tower', glbNode: 'SBG_Nassim_Gate_Clock_Tower', name: 'Nassim Gate Visitor Centre & Clock Tower', coreId: 'central_core', x: 128.0, z: 35.0, r: 11.0 },
  { id: 'ginger_cavern_waterfall', glbNode: 'SBG_Ginger_Cavern_Waterfall', name: 'Ginger Garden Walk-Behind Cavern Waterfall', coreId: 'central_core', x: -72.0, z: 98.0, r: 10.0 },
  { id: 'chopin_memorial_sculpture', glbNode: 'SBG_Chopin_Memorial_Sculpture', name: 'Chopin Memorial Statue', coreId: 'central_core', x: 32.0, z: 46.0, r: 4.5 },
  { id: 'walk_of_giants_boardwalk', glbNode: 'SBG_Walk_Of_Giants_Boardwalk', name: 'SPH Walk of Giants Elevated Canopy Boardwalk', coreId: 'tyersall_gallop_core', x: -235.0, z: 205.0, r: 12.0 },
  { id: 'como_cempedak_play_pod', glbNode: 'SBG_Como_Cempedak_Play_Pod', name: 'COMO Adventure Grove (Giant Cempedak Play Pod)', coreId: 'tyersall_gallop_core', x: -182.0, z: 258.0, r: 10.0 },
  { id: 'jacob_ballas_treehouse_bridge', glbNode: 'SBG_Jacob_Ballas_Treehouse_Bridge', name: 'Jacob Ballas Children’s Garden & Suspension Treehouse Bridge', coreId: 'bukit_timah_core', x: 95.0, z: -278.0, r: 13.0 }
];

export const SBG_ENTRANCE_GATES = [
  { id: 'tanglin_gate', name: 'Tanglin Gate (Silver Gate)', coreId: 'tanglin_core', x: 45.0, z: 305.0 },
  { id: 'nassim_gate', name: 'Nassim Gate Visitor Centre', coreId: 'central_core', x: 128.0, z: 35.0 },
  { id: 'gallop_gate', name: 'Gallop Gate', coreId: 'tyersall_gallop_core', x: -242.0, z: 292.0 },
  { id: 'bukit_timah_gate', name: 'Bukit Timah Gate (Botanic Gardens MRT)', coreId: 'bukit_timah_core', x: -12.0, z: -312.0 }
];

export const SBG_WALKABLE_BRIDGES = [
  { id: 'swan_lake_gazebo_bridge', name: 'Swan Lake Gazebo Bridge', coreId: 'tanglin_core', ax: -56.0, az: 212.0, bx: 36.0, bz: 212.0, cx: -10.0, cz: 212.0, halfWidth: 4.5, archHeight: 1.25 },
  { id: 'symphony_lake_bridge', name: 'Symphony Lake Palm Valley Bridge', coreId: 'central_core', ax: -26.0, az: -12.0, bx: 73.0, bz: -12.0, cx: 23.5, cz: -12.0, halfWidth: 4.2, archHeight: 0.95 },
  { id: 'keppel_wetlands_boardwalk', name: 'Keppel Discovery Wetlands Boardwalk', coreId: 'tyersall_gallop_core', ax: -244.0, az: 155.0, bx: -186.0, bz: 155.0, cx: -215.0, cz: 155.0, halfWidth: 4.0, archHeight: 0.45 },
  { id: 'walk_of_giants_boardwalk', name: 'SPH Walk of Giants Elevated Canopy Boardwalk', coreId: 'tyersall_gallop_core', ax: -262.0, az: 192.0, bx: -208.0, bz: 218.0, cx: -235.0, cz: 205.0, halfWidth: 4.5, archHeight: 2.4 },
  { id: 'jacob_ballas_suspension_bridge', name: 'Jacob Ballas Suspension Treehouse Bridge', coreId: 'bukit_timah_core', ax: 68.0, az: -278.0, bx: 122.0, bz: -278.0, cx: 95.0, cz: -278.0, halfWidth: 4.0, archHeight: 1.6 }
];

// ----------------------------------------------------------------------------
// 4. 9 Heritage Trees & Flora Zones
// ----------------------------------------------------------------------------
export const SBG_HERITAGE_TREES_FLORA = [
  { id: 'tembusu_five_dollar_hero', glbNode: 'SBG_Tembusu_Five_Dollar_Hero', name: 'Five-Dollar Note Heritage Tembusu Tree (Lawn E)', coreId: 'tanglin_core', x: 32.5, z: 175.0, gameX: 6.5, gameZ: 35.0, propX: 9.9, propZ: 38.2, r: 7.5, h: 32.0, hero: true },
  { id: 'bandstand_rain_tree_monarch', glbNode: 'SBG_Rain_Tree_Monarch', name: 'Bandstand Hill Heritage Rain Tree Ring', coreId: 'tanglin_core', x: 25.0, z: 122.5, gameX: 5.0, gameZ: 24.5, r: 7.0, h: 30.0, hero: true },
  { id: 'swan_lake_west_rain_tree', glbNode: 'SBG_Rain_Tree_Monarch', name: 'Swan Lake West Lawn Rain Tree', coreId: 'tanglin_core', x: -47.5, z: 175.0, gameX: -9.5, gameZ: 35.0, r: 6.5, h: 24.0, hero: false },
  { id: 'golden_shower_orchid_arches', glbNode: 'SBG_Golden_Shower_Orchid_Arch', name: 'Golden Shower Orchid Arches', coreId: 'central_core', x: -95.0, z: 38.0, gameX: -19.0, gameZ: 7.6, r: 6.5, h: 6.0, hero: false },
  { id: 'primary_rainforest_trail', glbNode: 'SBG_Rainforest_Dipterocarp_Giant', name: '6-Hectare Primary Rain Forest Trail', coreId: 'central_core', x: 125.0, z: 85.0, gameX: 25.0, gameZ: 17.0, r: 32.0, h: 48.0, hero: true },
  { id: 'palm_valley_coco_de_mer', glbNode: 'SBG_Palm_Valley_Talipot_Grove', name: 'Palm Valley Talipot & Coco de Mer Grove', coreId: 'central_core', x: 85.0, z: -18.0, gameX: 17.0, gameZ: -3.6, r: 14.0, h: 24.0, hero: false },
  { id: 'learning_forest_kapok_giant', glbNode: 'SBG_Kapok_Buttress_Giant', name: 'Learning Forest & Keppel Discovery Wetlands', coreId: 'tyersall_gallop_core', x: -225.0, z: 187.5, gameX: -45.0, gameZ: 37.5, r: 18.0, h: 42.0, hero: true },
  { id: 'foliage_evolution_garden_spine', glbNode: 'SBG_Evolution_Cycad_Tree_Fern', name: 'Foliage Valley & Bamboo / Evolution Garden Spine', coreId: 'bukit_timah_core', x: 82.0, z: -155.0, gameX: 16.4, gameZ: -31.0, r: 22.0, h: 18.0, hero: false },
  { id: 'eco_lake_fig_hornbill_sanctuary', glbNode: 'SBG_Eco_Lake_Fig_Sanctuary', name: 'Eco-Lake Weeping Fig & Hornbill Sanctuary', coreId: 'bukit_timah_core', x: -65.0, z: -215.0, gameX: -13.0, gameZ: -43.0, r: 14.0, h: 26.0, hero: false }
];

// ----------------------------------------------------------------------------
// 5. Safe Multi-Lake Water Polygon & Bridge Containment Solvers
// ----------------------------------------------------------------------------
export function isPointInPolygon2D(x, z, polygon) {
  if (!Array.isArray(polygon) || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x ?? polygon[i][0];
    const zi = polygon[i].z ?? polygon[i][1];
    const xj = polygon[j].x ?? polygon[j][0];
    const zj = polygon[j].z ?? polygon[j][1];
    if (((zi > z) !== (zj > z)) && (x < ((xj - xi) * (z - zi)) / ((zj - zi) || 1e-9) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export function isOnSbgWalkableBridge(x, z, margin = 0.25) {
  for (const br of SBG_WALKABLE_BRIDGES) {
    const vx = br.bx - br.ax;
    const vz = br.bz - br.az;
    const lenSq = vx * vx + vz * vz;
    if (lenSq < 1e-6) continue;
    const t = ((x - br.ax) * vx + (z - br.az) * vz) / lenSq;
    if (t >= -0.08 && t <= 1.08 && Math.hypot(x - (br.ax + t * vx), z - (br.az + t * vz)) <= br.halfWidth + margin) {
      return true;
    }
  }
  return false;
}

export function isInsideSbgWater(x, z, radius = 0.0) {
  if (isOnSbgWalkableBridge(x, z, radius)) return false;
  for (const lk of SBG_LAKES) {
    const b = lk.bounds;
    if (x < b.minX - radius || x > b.maxX + radius || z < b.minZ - radius || z > b.maxZ + radius) continue;
    if (Array.isArray(lk.islands) && lk.islands.some((isl) => Math.hypot((x - isl.cx) / isl.rx, (z - isl.cz) / isl.rz) <= 1.0)) {
      continue;
    }
    if (isPointInPolygon2D(x, z, lk.polygon)) return true;
    if (radius > 0 && Math.hypot((x - lk.cx) / (lk.rx + radius), (z - lk.cz) / (lk.rz + radius)) <= 0.96) return true;
  }
  return false;
}

export const SBG_WORLD_SPEC = {
  id: 'sbg',
  title: 'Singapore Botanic Gardens (UNESCO World Heritage Site)',
  bounds: SBG_WORLD_BOUNDS,
  parkBoundaryPolygon: SBG_PARK_BOUNDARY_POLYGON,
  lakePolygon: SBG_LAKES[0].polygon,
  lakes: SBG_LAKES,
  lakePolygons: SBG_LAKE_POLYGONS,
  buildings: SBG_BUILDINGS,
  enterablePortals: SBG_ENTERABLE_PORTALS,
  gatesBridgesSculptures: SBG_GATES_BRIDGES_SCULPTURES,
  entranceGates: SBG_ENTRANCE_GATES,
  bridges: SBG_WALKABLE_BRIDGES,
  walkableBridges: SBG_WALKABLE_BRIDGES,
  heritageTrees: SBG_HERITAGE_TREES_FLORA,
  isInsideSbgWater
};
