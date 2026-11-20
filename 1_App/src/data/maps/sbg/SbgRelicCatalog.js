// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Master 42-Relic Catalog
// Assembles all 42 relics across the 4 Official NParks Cores with 0 water or
// building collisions, rarity tiers, 3D model renders, and habitat metadata.
// (src/data/SbgRelicCatalog.js)
// ============================================================================

import {
  RELIC_RARITY_TIERS,
  RELIC_MODEL_RENDERS,
  RELIC_CATEGORY_COLORS
} from '../gbb/TreasuresCatalogZones1To2.js';
import { LANDMARK_HABITAT_RENDERS } from '../gbb/TreasuresCatalogZone3.js';
import {
  SBG_CORES_SPEC,
  SBG_ZONE_METADATA,
  detectSbgCoreFromPosition,
  detectSbgZoneFromPosition
} from './SbgZoneSpec.js';
import {
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES,
  SBG_RELICS_1_TO_21,
  SBG_RELICS_22_TO_42
} from './SbgRelicSubcatalogs.js';
import {
  SBG_BUILDINGS,
  SBG_GATES_BRIDGES_SCULPTURES,
  isInsideSbgWater
} from './SbgWorldSpec.js';

export {
  RELIC_RARITY_TIERS,
  RELIC_MODEL_RENDERS,
  RELIC_CATEGORY_COLORS,
  LANDMARK_HABITAT_RENDERS,
  SBG_CORES_SPEC,
  SBG_ZONE_METADATA,
  SBG_CATEGORY_LABELS,
  SBG_CATEGORY_THEMES,
  detectSbgCoreFromPosition,
  detectSbgZoneFromPosition
};

const CROWN_RELIC_IDS = new Set([1, 2, 7, 16, 22, 27, 35, 42]);
const HERITAGE_RELIC_IDS = new Set([3, 4, 5, 6, 13, 23, 24, 25, 26, 28, 30, 37, 39, 41]);

export const SBG_RAW_RELICS = [
  ...SBG_RELICS_1_TO_21,
  ...SBG_RELICS_22_TO_42
].sort((a, b) => a.id - b.id);

export const SBG_RELIC_MODEL_LABELS = Object.fromEntries(
  SBG_RAW_RELICS.flatMap((item) => [
    [item.glbModel, `3D ${item.shortName} Sculpt`],
    [item.sbgGlbModel, `3D ${item.shortName} Sculpt`]
  ])
);

export const SBG_RELIC_CATALOG = SBG_RAW_RELICS.map((item) => {
  const isCrown = CROWN_RELIC_IDS.has(item.id);
  const isHeritage = HERITAGE_RELIC_IDS.has(item.id);
  const rarity = isCrown ? 'crown' : isHeritage ? 'heritage' : 'classic';
  const tier = RELIC_RARITY_TIERS[rarity];
  return {
    ...item,
    isLandmarkRelic: isCrown,
    rarity,
    rarityLabel: tier.label,
    rarityBadge: tier.badge,
    rarityColor: tier.color,
    points: tier.points,
    fact: item.wowPunchline || item.ahaHook,
    image: `./assets/renders/sbg/relic_${String(item.id).padStart(2, '0')}.png`,
    fallbackImage: RELIC_MODEL_RENDERS[item.glbModel] || RELIC_MODEL_RENDERS.Relic_01,
    landmarkImage: LANDMARK_HABITAT_RENDERS[item.habitatKey] || RELIC_MODEL_RENDERS[item.glbModel],
    pedestalImage: RELIC_MODEL_RENDERS.Relic_Pedestal,
    glbModelLabel: SBG_RELIC_MODEL_LABELS[item.glbModel] || '3D SBG UNESCO Keepsake Sculpt'
  };
});

export const SBG_TREASURES_CATALOG = SBG_RELIC_CATALOG;
export const SBG_RELIC_DEFINITIONS = SBG_RELIC_CATALOG;

export function verifySbgRelicPlacements() {
  const waterCollisions = [];
  const buildingCollisions = [];
  for (const relic of SBG_RELIC_CATALOG) {
    if (isInsideSbgWater(relic.x, relic.z, 1.5)) {
      waterCollisions.push(relic.id);
    }
    for (const b of SBG_BUILDINGS) {
      const u = Math.hypot((relic.x - b.x) / (b.rx + 1.5), (relic.z - b.z) / (b.rz + 1.5));
      if (u <= 1.0) {
        buildingCollisions.push({ relicId: relic.id, buildingId: b.id });
      }
    }
    for (const g of SBG_GATES_BRIDGES_SCULPTURES) {
      if (Math.hypot(relic.x - g.x, relic.z - g.z) < g.r + 1.0) {
        buildingCollisions.push({ relicId: relic.id, structureId: g.id });
      }
    }
  }
  return {
    totalRelics: SBG_RELIC_CATALOG.length,
    waterCollisions,
    buildingCollisions,
    valid: SBG_RELIC_CATALOG.length === 42 && waterCollisions.length === 0 && buildingCollisions.length === 0
  };
}
