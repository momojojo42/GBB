// ============================================================================
// Singapore Botanic Gardens (Map 02: SBG) — 1:1 Multi-Lake Water Masking Solver
// Masks & resolves collisions across 4 signature NParks water bodies + cavern pool:
//   1. Swan Lake (Tanglin Heritage Basin + Swan Nest Island, South +Z)
//   2. Symphony Lake (Central Core Lotus Basin + Shaw Stage Islet, Center Z≈-4)
//   3. Eco-Lake (Bukit Timah Core Basin + Black Swan Sanctuary Islet, North -Z)
//   4. Keppel Discovery Wetlands (Learning Forest Pulai Marsh, South-West -X,+Z)
//   5. Ginger Waterfall Pool (Walk-Behind Cavern Plunge Basin)
// (src/maps/sbg/SBGWaterMaskSolver.js)
// ============================================================================

import { SBG_WATER_PONDS } from '../../data/maps/sbg/SBGStructuresAndPathsSpec.js';
import { closestPointOnSegment2D } from '../../world/physics/BridgeAndPortalSolver.js';

export const SBG_MULTI_LAKES_SPEC = [
  {
    id: 'swan_lake',
    name: 'Swan Lake',
    cx: -2.0,
    cz: 43.0,
    rx: 7.5,
    rz: 5.5,
    rot: 0.10,
    waterHex: 0x14b8a6,
    emissiveHex: 0x064e3b,
    lilyDensity: 18
  },
  {
    id: 'symphony_lake',
    name: 'Symphony Lake',
    cx: 4.7,
    cz: -4.0,
    rx: 6.5,
    rz: 4.8,
    rot: -0.08,
    waterHex: 0x0d9488,
    emissiveHex: 0x065f46,
    lilyDensity: 16
  },
  {
    id: 'eco_lake',
    name: 'Eco-Lake',
    cx: 1.0,
    cz: -43.0,
    rx: 6.0,
    rz: 4.5,
    rot: 0.12,
    waterHex: 0x10b981,
    emissiveHex: 0x047857,
    lilyDensity: 16
  },
  {
    id: 'keppel_wetlands',
    name: 'Keppel Discovery Wetlands',
    cx: -43.0,
    cz: 31.0,
    rx: 6.8,
    rz: 4.8,
    rot: -0.15,
    waterHex: 0x059669,
    emissiveHex: 0x064e3b,
    lilyDensity: 18
  },
  {
    id: 'ginger_pool',
    name: 'Ginger Waterfall Pool',
    cx: -14.4,
    cz: 19.6,
    rx: 2.8,
    rz: 1.8,
    rot: 0.0,
    waterHex: 0x2dd4bf,
    emissiveHex: 0x0f766e,
    lilyDensity: 8
  }
];

export const SBG_DRY_LAKE_ISLANDS = [
  { id: 'swan_nest_island', name: 'Swan Nest Island', cx: -2.8, cz: 39.2, rx: 2.6, rz: 1.7, rotY: 0.2 },
  { id: 'symphony_stage_islet', name: 'Symphony Stage Islet', cx: 3.6, cz: -4.4, rx: 4.8, rz: 4.4, rotY: 0.0 },
  { id: 'black_swan_islet', name: 'Black Swan Islet', cx: 1.2, cz: -43.6, rx: 2.4, rz: 1.6, rotY: -0.25 }
];

export const SBG_STEPPING_CORRIDORS = [
  { ax: -2.8, az: 36.5, bx: -2.8, bz: 40.0, halfWidth: 1.65, name: 'Swan Nest Causeway' },
  { ax: -3.5, az: -4.4, bx: 4.8, bz: -4.4, halfWidth: 2.35, name: 'Symphony Stage Causeway' },
  { ax: 1.2, az: -38.5, bx: 1.2, bz: -44.2, halfWidth: 1.65, name: 'Black Swan Causeway' }
];

export function isOnSBGDryLakeIslandOrCauseway(x, z) {
  for (const isl of SBG_DRY_LAKE_ISLANDS) {
    const dx = x - isl.cx;
    const dz = z - isl.cz;
    if (Math.abs(dx) > 5.5 || Math.abs(dz) > 5.5) continue;
    const cosR = Math.cos(isl.rotY || 0);
    const sinR = Math.sin(isl.rotY || 0);
    const lx = dx * cosR - dz * sinR;
    const lz = dx * sinR + dz * cosR;
    if (Math.hypot(lx / isl.rx, lz / isl.rz) <= 1.0) return true;
  }
  for (const corr of SBG_STEPPING_CORRIDORS) {
    const seg = closestPointOnSegment2D(x, z, corr.ax, corr.az, corr.bx, corr.bz);
    if (seg.dist <= corr.halfWidth) return true;
  }
  return false;
}

export function classifySBGChannelLakeName(z) {
  if (z > 20.0) return 'Swan Lake';
  if (z > -20.0) return 'Symphony Lake';
  return 'Eco-Lake';
}

export function evaluateSBGMultiLakeBasinCollision(x, z, radius = 0.45, ponds = SBG_WATER_PONDS) {
  const halfRad = radius * 0.5;
  const activeLakes = Array.isArray(ponds) && ponds.length > 0 ? ponds : SBG_MULTI_LAKES_SPEC;

  for (let i = 0; i < activeLakes.length; i++) {
    const lake = activeLakes[i];
    const specFallback = SBG_MULTI_LAKES_SPEC[i] || {};
    const cx = lake.cx ?? lake.x ?? 0;
    const cz = lake.cz ?? lake.z ?? 0;
    const rx = (lake.rx || 3.0) + halfRad;
    const rz = (lake.rz || 2.0) + halfRad;
    const rot = lake.rot ?? specFallback.rot ?? 0;

    const dx = x - cx;
    const dz = z - cz;
    const maxBound = Math.max(rx, rz) * 1.15;
    if (Math.abs(dx) >= maxBound || Math.abs(dz) >= maxBound) continue;

    const cosR = Math.cos(rot);
    const sinR = Math.sin(rot);
    const lx = dx * cosR - dz * sinR;
    const lz = dx * sinR + dz * cosR;
    const u = Math.hypot(lx / rx, lz / rz);

    if (u < 1.0) {
      const safeU = Math.max(u, 0.001);
      const targetLx = (lx / safeU) * (rx * 1.02);
      const targetLz = (lz / safeU) * (rz * 1.02);
      return {
        inWater: true,
        lakeId: lake.id || specFallback.id || `sbg_lake_${i}`,
        waterName: lake.name || specFallback.name || 'Botanic Gardens Lake',
        depthFactor: Math.max(0, 1.0 - u),
        pushX: cx + (targetLx * cosR + targetLz * sinR),
        pushZ: cz + (-targetLx * sinR + targetLz * cosR)
      };
    }
  }

  return { inWater: false };
}

export function getSBGMultiLakeWaterMask(x, z, radius = 0.45) {
  if (isOnSBGDryLakeIslandOrCauseway(x, z)) {
    return { inWater: false, lakeId: null, waterName: null, depthFactor: 0 };
  }

  const basinHit = evaluateSBGMultiLakeBasinCollision(x, z, radius);
  if (basinHit.inWater) return basinHit;

  return { inWater: false, lakeId: null, waterName: null, depthFactor: 0 };
}
