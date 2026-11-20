// ============================================================================
// Gardens by the Bay — 42 Botanical & Cultural Relics Catalog + Zone Metadata
// (src/data/TreasuresCatalog.js)
// ============================================================================

import {
  RELIC_RARITY_TIERS,
  RELIC_CATEGORY_LABELS,
  RELIC_MODEL_RENDERS,
  RELIC_CATEGORY_COLORS,
  RELIC_CATEGORY_THEMES,
  RAW_TREASURES_ZONES_1_TO_2
} from './maps/gbb/TreasuresCatalogZones1To2.js';
import {
  RELIC_MODEL_LABELS,
  LANDMARK_HABITAT_RENDERS,
  ZONE_METADATA,
  RAW_TREASURES_ZONE_3
} from './maps/gbb/TreasuresCatalogZone3.js';
import { RAW_TREASURES_ZONES_4_TO_5 } from './maps/gbb/TreasuresCatalogZones4To5.js';
import { RELIC_HUMOR_AND_GAGS_BY_ID } from './RelicHumorAndGagsSpec.js';
import {
  SBG_ZONE_METADATA,
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES,
  SBG_RELIC_MODEL_LABELS,
  SBG_TREASURES_CATALOG
} from './maps/sbg/SBGTreasuresCatalog.js';
import { getActiveMapId } from './MapRegistry.js';

export {
  RELIC_RARITY_TIERS,
  RELIC_CATEGORY_LABELS,
  RELIC_MODEL_RENDERS,
  RELIC_MODEL_LABELS,
  LANDMARK_HABITAT_RENDERS,
  RELIC_CATEGORY_COLORS,
  RELIC_CATEGORY_THEMES,
  ZONE_METADATA,
  RELIC_HUMOR_AND_GAGS_BY_ID
};

export function detectZoneFromPosition(x, z) {
  if (x > 10 && z < -8) return ZONE_METADATA.conservatories;
  if (x < -12 && z < -4) return ZONE_METADATA.dragonfly;
  if (x < -15 && z >= -4) return ZONE_METADATA.meadow;
  if (x > 20 && z >= -8) return ZONE_METADATA.wetlands;
  return ZONE_METADATA.supertree;
}

const CROWN_RELIC_IDS = new Set([1, 2, 7, 16, 22, 27, 35, 42]);
const HERITAGE_RELIC_IDS = new Set([3, 4, 5, 6, 13, 23, 24, 25, 26, 28, 30, 37, 39, 41]);

const RAW_TREASURES_CATALOG = [
  ...RAW_TREASURES_ZONES_1_TO_2,
  ...RAW_TREASURES_ZONE_3,
  ...RAW_TREASURES_ZONES_4_TO_5
];

const GBB_TREASURES_LIST = RAW_TREASURES_CATALOG.map((item) => {
  const isCrown = CROWN_RELIC_IDS.has(item.id);
  const isHeritage = HERITAGE_RELIC_IDS.has(item.id);
  const rarity = isCrown ? 'crown' : isHeritage ? 'heritage' : 'classic';
  const tier = RELIC_RARITY_TIERS[rarity];
  const gagSpec = RELIC_HUMOR_AND_GAGS_BY_ID[item.id] || {};
  return {
    ...item,
    toyAction: gagSpec.toyAction || item.toyAction || 'happy_bounce',
    funnyTag: gagSpec.funnyTag || item.toyReaction || '✨ Shiok Keepsake!',
    gagButtonLabel: gagSpec.gagButtonLabel || '✨ PLAY TOY GAG!',
    wowPunchline: gagSpec.wowPunchline || item.ahaHook,
    comicQuips: gagSpec.comicQuips || [item.toyReaction || '✨ SHIOK LAH!', '💥 WOW!', '🎉 STEADY!'],
    isLandmarkRelic: isCrown,
    rarity,
    rarityLabel: tier.label,
    rarityBadge: tier.badge,
    rarityColor: tier.color,
    points: tier.points,
    fact: gagSpec.wowPunchline || item.ahaHook,
    image: RELIC_MODEL_RENDERS[item.glbModel] || RELIC_MODEL_RENDERS.Relic_01 || RELIC_MODEL_RENDERS.Relic_Orchid,
    landmarkImage: LANDMARK_HABITAT_RENDERS[item.habitatKey] || RELIC_MODEL_RENDERS[item.glbModel],
    pedestalImage: RELIC_MODEL_RENDERS.Relic_Pedestal,
    glbModelLabel: RELIC_MODEL_LABELS[item.glbModel] || '3D Singapore Souvenir Sculpt'
  };
});

const GBB_ZONE_META_SNAPSHOT = JSON.parse(JSON.stringify(ZONE_METADATA));
const GBB_CAT_LABELS_SNAPSHOT = { ...RELIC_CATEGORY_LABELS };
const GBB_CAT_THEMES_SNAPSHOT = JSON.parse(JSON.stringify(RELIC_CATEGORY_THEMES));
const GBB_MODEL_LABELS_SNAPSHOT = { ...RELIC_MODEL_LABELS };

export const TREASURES_CATALOG = GBB_TREASURES_LIST.map((item) => ({ ...item }));
export const RELIC_DEFINITIONS = TREASURES_CATALOG;

export function syncTreasuresCatalogToActiveMap(mapId = getActiveMapId()) {
  if (mapId === 'sbg') {
    TREASURES_CATALOG.splice(0, TREASURES_CATALOG.length, ...SBG_TREASURES_CATALOG.map((item) => ({ ...item })));
    Object.assign(ZONE_METADATA, JSON.parse(JSON.stringify(SBG_ZONE_METADATA)));
    Object.assign(RELIC_CATEGORY_LABELS, SBG_CATEGORY_LABELS);
    Object.assign(RELIC_CATEGORY_THEMES, JSON.parse(JSON.stringify(SBG_CATEGORY_THEMES)));
    Object.assign(RELIC_MODEL_LABELS, SBG_RELIC_MODEL_LABELS);
  } else {
    TREASURES_CATALOG.splice(0, TREASURES_CATALOG.length, ...GBB_TREASURES_LIST.map((item) => ({ ...item })));
    Object.assign(ZONE_METADATA, JSON.parse(JSON.stringify(GBB_ZONE_META_SNAPSHOT)));
    Object.assign(RELIC_CATEGORY_LABELS, GBB_CAT_LABELS_SNAPSHOT);
    Object.assign(RELIC_CATEGORY_THEMES, JSON.parse(JSON.stringify(GBB_CAT_THEMES_SNAPSHOT)));
    Object.assign(RELIC_MODEL_LABELS, GBB_MODEL_LABELS_SNAPSHOT);
  }
}

syncTreasuresCatalogToActiveMap(getActiveMapId());
