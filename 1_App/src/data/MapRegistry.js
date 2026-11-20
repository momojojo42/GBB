// ============================================================================
// Multi-Map World Registry & Active Map Profile Coordinator
// Supports Map 01: Gardens by the Bay (gbb) & Map 02: Singapore Botanic Gardens (sbg)
// (src/data/MapRegistry.js)
// ============================================================================

const STORAGE_KEY = 'gbb_active_map_id_v1';

export const MAP_WORLD_PROFILES = {
  gbb: {
    id: 'gbb',
    numberBadge: 'MAP 01',
    icon: '🌿',
    shortTitle: 'Gardens by the Bay',
    fullTitle: 'Gardens by the Bay (Bay South)',
    cardTitleGold: 'GARDENS BY THE BAY',
    cardSubtitleTeal: '✨ Map 01 • 42 Bay South & Supertree Keepsakes',
    eyebrowDay: '🇸🇬 MAP 01 • GARDENS BY THE BAY 3D',
    eyebrowNight: '🎆 LIVE: GARDEN RHAPSODY NEON & FIREWORKS (1.5× PTS!)',
    topBarTitle: 'Gardens by the Bay 3D',
    topBarEyebrow: '🇸🇬 SINGAPORE • MAP 01',
    nightShowLabel: '🌙 Garden Rhapsody Night',
    relaxedTitle: '🌿 Peaceful Bay South Stroll • No Timer, No Bots',
    relaxedDesc:
      'Roam the Supertrees, Flower Dome & Cloud Forest at your own pace to collect all 42 3D toys!',
    svgFloorplanPath: './maps/gbb_floorplan_2d_meters.svg',
    terrainTheme: {
      outerWaterHex: '#208196',
      innerWaterHex: 0x18c4d4,
      innerWaterEmissiveHex: 0x075868,
      baseBevelHex: '#F3ECE1',
      grassHex: '#68C956',
      meadowLawnHex: '#74D660',
      pathwayHex: '#F5EFE4'
    },
    tacticalMapTheme: {
      bgHex: '#062834',
      landFillHex: '#0F4C3A',
      landStrokeHex: '#34D399',
      heading: 'Bay South Park Map & Fast Travel'
    },
    teleportZones: [
      { zone: 'supertree', label: '🌳 Supertree Grove' },
      { zone: 'conservatories', label: '🏛️ Glass Domes' },
      { zone: 'dragonfly', label: '🏮 Dragonfly Bridge' },
      { zone: 'planet', label: '👶 Planet Sculpture' },
      { zone: 'wetlands', label: '⛩️ Serene Wetlands' }
    ]
  },
  sbg: {
    id: 'sbg',
    numberBadge: 'MAP 02',
    icon: '🦢',
    shortTitle: 'Botanic Gardens',
    fullTitle: 'Singapore Botanic Gardens (UNESCO)',
    cardTitleGold: 'BOTANIC GARDENS',
    cardSubtitleTeal: '🦢 Map 02 • 42 UNESCO Heritage & Orchid Keepsakes',
    eyebrowDay: '🏛️ MAP 02 • UNESCO BOTANIC GARDENS (1859)',
    eyebrowNight: '🎼 LIVE: SYMPHONY AT DUSK & HERITAGE LANTERNS (1.5× PTS!)',
    topBarTitle: 'Botanic Gardens 3D',
    topBarEyebrow: '🏛️ UNESCO HERITAGE • MAP 02',
    nightShowLabel: '🎼 Symphony at Dusk Night',
    relaxedTitle: '🦢 Peaceful UNESCO Heritage Stroll • No Timer, No Bots',
    relaxedDesc:
      'Stroll past the 1930 Bandstand, Swan Lake, National Orchid Garden & Symphony Stage at your own pace!',
    svgFloorplanPath: './maps/sbg_floorplan_2d_meters.svg',
    terrainTheme: {
      outerWaterHex: '#1B6B63',
      innerWaterHex: 0x14b8a6,
      innerWaterEmissiveHex: 0x064e3b,
      baseBevelHex: '#F7F2E7',
      grassHex: '#4ADE80',
      meadowLawnHex: '#86EFAC',
      pathwayHex: '#FAF5EB'
    },
    tacticalMapTheme: {
      bgHex: '#07221B',
      landFillHex: '#14432A',
      landStrokeHex: '#6EE7B7',
      heading: 'UNESCO Botanic Gardens Map & Fast Travel'
    },
    teleportZones: [
      { zone: 'supertree', label: '🏛️ The Bandstand' },
      { zone: 'conservatories', label: '🌺 Orchid Garden' },
      { zone: 'dragonfly', label: '🦢 Swan Lake Bridge' },
      { zone: 'planet', label: '🎼 Symphony Stage' },
      { zone: 'wetlands', label: '🦩 Eco-Lake & Ginger' }
    ]
  }
};

function detectInitialMapId() {
  if (typeof window !== 'undefined') {
    const param = new URLSearchParams(window.location.search).get('map')?.toLowerCase();
    if (param === 'sbg' || param === 'gbb') return param;
  }
  return 'gbb';
}

let activeMapId = detectInitialMapId();

export function getActiveMapId() {
  return activeMapId;
}

export function getActiveMapProfile() {
  return MAP_WORLD_PROFILES[activeMapId] || MAP_WORLD_PROFILES.gbb;
}

export function setActiveMapIdState(nextMapId) {
  const normalized = nextMapId === 'sbg' ? 'sbg' : 'gbb';
  activeMapId = normalized;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage?.setItem(STORAGE_KEY, normalized);
    } catch (_) {
      // Ignore storage errors
    }
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('map', normalized);
      window.history?.replaceState({}, '', url.toString());
    } catch (_) {
      // Ignore URL history errors
    }
  }
  return getActiveMapProfile();
}
