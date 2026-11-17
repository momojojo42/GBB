// ============================================================================
// Gardens by the Bay — Explorer Roster, Gadgets & AI Bot Difficulty Presets
// (src/data/ExplorerAndGadgetPresets.js)
// ============================================================================

export const GADGETS_SCHEMA = {
  turbo_boots: {
    id: 'turbo_boots',
    name: 'Turbo Boots',
    speedMultiplier: 1.55,
    pickupRadiusBonus: 0,
    description: 'Boosts Chibi Explorer sprint speed by 55% along garden pathways.'
  },
  relic_magnet: {
    id: 'relic_magnet',
    name: 'Relic Magnet',
    speedMultiplier: 1.15,
    pickupRadiusBonus: 6.5,
    description: 'Expands treasure relic magnetic collection radius.'
  },
  holo_decoy: {
    id: 'holo_decoy',
    name: 'Holo Decoy',
    speedMultiplier: 1.25,
    pickupRadiusBonus: 1.5,
    description: 'Deploys a holographic botanical decoy that lures AI Bots away for 8s.'
  }
};

export const BOT_DIFFICULTY_PRESETS = {
  chill: {
    id: 'chill',
    label: '🌱 Chill',
    speedMult: 0.68,
    minPause: 2.0,
    maxPause: 3.0,
    noise: 28,
    playerBufferPenalty: 36,
    gadgetChance: 0.0,
    canBumpSteal: false,
    durianDropInterval: 999
  },
  normal: {
    id: 'normal',
    label: '⚖️ Normal',
    speedMult: 0.94,
    minPause: 0.85,
    maxPause: 1.45,
    noise: 12,
    playerBufferPenalty: 4,
    gadgetChance: 0.42,
    canBumpSteal: true,
    durianDropInterval: 19
  },
  pro: {
    id: 'pro',
    label: '🔥 Pro',
    speedMult: 1.14,
    minPause: 0.25,
    maxPause: 0.60,
    noise: 4,
    playerBufferPenalty: -18,
    gadgetChance: 0.82,
    canBumpSteal: true,
    durianDropInterval: 11
  }
};

export const COMPETITOR_SPECS = [
  {
    id: 'you',
    glbName: 'Explorer_YOU',
    name: 'YOU',
    archetype: 'Player Explorer',
    colorHex: '#2D7FF9',
    spawnX: 4,
    spawnZ: 11,
    initialRotY: 0.32, // Cute 3/4 front-right angle toward camera showing glossy eyes, blush cheeks, smile, headlamp & backpack
    baseSpeed: 10.2
  },
  {
    id: 'kai',
    glbName: 'Explorer_Kai',
    name: 'Bot Kai',
    archetype: 'Speedster',
    colorHex: '#FF5A5F',
    spawnX: -8,
    spawnZ: -6,
    initialRotY: 0.45,
    baseSpeed: 8.2
  },
  {
    id: 'mei',
    glbName: 'Explorer_Mei',
    name: 'Bot Mei',
    archetype: 'Radar Tracker',
    colorHex: '#10B981',
    spawnX: 14,
    spawnZ: -16,
    initialRotY: -0.45,
    baseSpeed: 7.6
  },
  {
    id: 'raj',
    glbName: 'Explorer_Raj',
    name: 'Bot Raj',
    archetype: 'Pathfinder',
    colorHex: '#F59E0B',
    spawnX: -24,
    spawnZ: 8,
    initialRotY: 0.65,
    baseSpeed: 7.8
  }
];
