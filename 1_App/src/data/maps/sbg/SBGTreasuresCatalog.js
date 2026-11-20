// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 42 Relics Master Catalog (1:1 NParks)
// (src/data/maps/sbg/SBGTreasuresCatalog.js)
// ============================================================================

import {
  RELIC_RARITY_TIERS,
  RELIC_MODEL_RENDERS,
  RELIC_CATEGORY_COLORS
} from '../gbb/TreasuresCatalogZones1To2.js';
import {
  LANDMARK_HABITAT_RENDERS
} from '../gbb/TreasuresCatalogZone3.js';
import {
  SBG_ZONE_METADATA,
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES,
  SBG_RAW_TREASURES_1_TO_21
} from './SBGTreasuresZones1To3.js';
import {
  SBG_RAW_TREASURES_22_TO_42
} from './SBGTreasuresZones4To5.js';

export {
  RELIC_RARITY_TIERS,
  RELIC_MODEL_RENDERS,
  RELIC_CATEGORY_COLORS,
  LANDMARK_HABITAT_RENDERS,
  SBG_ZONE_METADATA,
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES
};

// 1:1 North-South 4-Core Zone Detection (SCALE_3D = 0.20):
//   - North (-Z < -22): Bukit Timah Core & Eco-Lake & Jacob Ballas (wetlands)
//   - South-West (x < -27 && z > 19): Tyersall-Gallop Learning Forest & Atbara (dragonfly)
//   - West (-X < -8 && z <= 22 && z >= -18): National Orchid Garden & Ginger Garden (conservatories)
//   - Far South (z > 38): Swan Lake & Tanglin Silver Gate (dragonfly)
//   - South-Central (z > 22 && z <= 38 && x >= -27): Tanglin Core & 1930 Bandstand & $5 Tembusu (supertree)
//   - Center (z >= -22 && z <= 22 && x >= -8): Central Core / Palm Valley / Symphony Stage / Rainforest (meadow)
export function detectSBGZoneFromPosition(x, z) {
  if (z < -22) return SBG_ZONE_METADATA.wetlands;
  if (x < -27 && z > 19) return SBG_ZONE_METADATA.dragonfly;
  if (x < -8 && z >= -18 && z <= 22) return SBG_ZONE_METADATA.conservatories;
  if (z > 38) return SBG_ZONE_METADATA.dragonfly;
  if (z > 22) return SBG_ZONE_METADATA.supertree;
  return SBG_ZONE_METADATA.meadow;
}

const CROWN_RELIC_IDS = new Set([1, 2, 7, 16, 22, 27, 35, 42]);
const HERITAGE_RELIC_IDS = new Set([3, 4, 5, 6, 13, 23, 24, 25, 26, 28, 30, 37, 39, 41]);

const SBG_RAW_CATALOG = [
  ...SBG_RAW_TREASURES_1_TO_21,
  ...SBG_RAW_TREASURES_22_TO_42
];

export const SBG_RELIC_MODEL_LABELS = Object.fromEntries(
  SBG_RAW_CATALOG.map((item) => [item.glbModel, `3D ${item.shortName} Sculpt`])
);

export const SBG_TREASURES_CATALOG = SBG_RAW_CATALOG.map((item) => {
  const isCrown = CROWN_RELIC_IDS.has(item.id);
  const isHeritage = HERITAGE_RELIC_IDS.has(item.id);
  const rarity = isCrown ? 'crown' : isHeritage ? 'heritage' : 'classic';
  const tier = RELIC_RARITY_TIERS[rarity];
  const paddedId = String(item.id).padStart(2, '0');
  const sbgRelicRender = `./assets/renders/sbg/relic_${paddedId}.png`;
  return {
    ...item,
    toyAction: item.toyAction || 'happy_bounce',
    funnyTag: item.funnyTag || '✨ UNESCO Heritage Gem!',
    gagButtonLabel: item.gagButtonLabel || '✨ PLAY BOTANICAL GAG!',
    wowPunchline: item.wowPunchline || item.ahaHook,
    comicQuips: item.comicQuips || [item.toyReaction || '✨ UNESCO SHIOK!', '🌿 BOTANICAL WOW!', '🎉 STEADY!'],
    isLandmarkRelic: isCrown,
    rarity,
    rarityLabel: tier.label,
    rarityBadge: tier.badge,
    rarityColor: tier.color,
    points: tier.points,
    fact: item.wowPunchline || item.ahaHook,
    image: sbgRelicRender || RELIC_MODEL_RENDERS[item.glbModel] || RELIC_MODEL_RENDERS.Relic_01,
    landmarkImage: LANDMARK_HABITAT_RENDERS[item.habitatKey] || sbgRelicRender,
    pedestalImage: RELIC_MODEL_RENDERS.Relic_Pedestal,
    glbModelLabel: SBG_RELIC_MODEL_LABELS[item.glbModel] || '3D SBG UNESCO Keepsake Sculpt'
  };
});

export const SBG_RELIC_DEFINITIONS = SBG_TREASURES_CATALOG;
