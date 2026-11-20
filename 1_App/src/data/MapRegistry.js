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
    cardTitleGold: 'Gardens by the Bay',
    cardSubtitleTeal: '3D Treasure Hunt · 42 Keepsakes',
    eyebrowDay: 'Singapore · Bay South',
    eyebrowNight: 'Garden Rhapsody Night Show · 1.5× Points',
    topBarTitle: 'Gardens by the Bay',
    topBarEyebrow: 'Singapore · Bay South',
    nightShowLabel: 'Garden Rhapsody Night',
    relaxedTitle: 'Peaceful Bay South Stroll · No Timer, No Bots',
    relaxedDesc:
      'Roam the Supertrees, Flower Dome, and Cloud Forest at your own pace to collect all 42 keepsakes.',
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
    cardTitleGold: 'Botanic Gardens',
    cardSubtitleTeal: 'UNESCO Heritage Hunt · 42 Keepsakes',
    eyebrowDay: 'Singapore · Tanglin Heritage Core',
    eyebrowNight: 'Symphony at Dusk · 1.5× Points',
    topBarTitle: 'Botanic Gardens',
    topBarEyebrow: 'Singapore · UNESCO Heritage',
    nightShowLabel: 'Symphony at Dusk',
    relaxedTitle: 'Peaceful Heritage Stroll · No Timer, No Bots',
    relaxedDesc:
      'Stroll past the 1930 Bandstand, Swan Lake, National Orchid Garden, and Symphony Stage at your own pace.',
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
