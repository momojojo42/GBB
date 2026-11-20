// ============================================================================
// Gardens by the Bay (Map 01: GBB) — Dragonfly Lake & Ponds Water Mask Solver
// Masks Dragonfly Lake, Kingfisher Wetlands, Lotus Pond, Water Lily Pond &
// Sun Pavilion Reflective Pool, with Nibong & Dragonfly Island exemptions.
// (src/maps/gbb/GBBWaterMaskSolver.js)
// ============================================================================

import {
  LAKE_CHANNEL_POINTS,
  LAKE_HALF_WIDTH,
  WATER_PONDS
} from '../../data/maps/gbb/WorldStructuresAndPathsSpec.js';
import { closestPointOnSegment2D } from '../../world/physics/BridgeAndPortalSolver.js';

export const GBB_DRY_LAKE_ISLANDS = [
  { name: 'Nibong Island (#34)', cx: -31.5, cz: -18.0, rx: 3.1, rz: 1.9, rotY: 0.25 },
  { name: 'Dragonfly Island (#33)', cx: -39.0, cz: 0.0, rx: 3.3, rz: 2.2, rotY: 0.0 },
  { name: 'Dragonfly South Island (#33)', cx: -44.0, cz: 10.0, rx: 3.5, rz: 2.2, rotY: -0.35 }
];

export const GBB_STEPPING_CORRIDORS = [
  { ax: -26.5, az: -18.0, bx: -31.5, bz: -18.0, halfWidth: 1.45 },
  { ax: -34.0, az: 0.0, bx: -39.0, bz: 0.0, halfWidth: 1.45 },
  { ax: -40.0, az: 10.0, bx: -44.0, bz: 10.0, halfWidth: 1.35 }
];

export function isOnGBBDryLakeIslandOrCorridor(x, z) {
  for (const isl of GBB_DRY_LAKE_ISLANDS) {
    const dx = x - isl.cx;
    const dz = z - isl.cz;
    if (Math.abs(dx) > 4.0 || Math.abs(dz) > 4.0) continue;
    const cosR = Math.cos(isl.rotY);
    const sinR = Math.sin(isl.rotY);
    const lx = dx * cosR - dz * sinR;
    const lz = dx * sinR + dz * cosR;
    if (Math.hypot(lx / isl.rx, lz / isl.rz) <= 1.0) return true;
  }
  for (const corr of GBB_STEPPING_CORRIDORS) {
    const seg = closestPointOnSegment2D(x, z, corr.ax, corr.az, corr.bx, corr.bz);
    if (seg.dist <= corr.halfWidth) return true;
  }
  return false;
}

export function getGBBWaterMask(x, z, radius = 0.45, channelSplinePoints = null) {
  const halfRad = radius * 0.5;
  for (const pond of WATER_PONDS) {
    const dx = x - pond.cx;
    const rx = pond.rx + halfRad;
    if (Math.abs(dx) >= rx) continue;
    const dz = z - pond.cz;
    const rz = pond.rz + halfRad;
    if (Math.abs(dz) >= rz) continue;

    const u = Math.hypot(dx / rx, dz / rz);
    if (u < 1.0) {
      const safeU = Math.max(u, 0.001);
      return {
        inWater: true,
        lakeId: pond.name.toLowerCase().replace(/\s+/g, '_'),
        waterName: pond.name,
        depthFactor: Math.max(0, 1.0 - u),
        pushX: pond.cx + (dx / safeU) * (rx * 1.02),
        pushZ: pond.cz + (dz / safeU) * (rz * 1.02)
      };
    }
  }

  if (!isOnGBBDryLakeIslandOrCorridor(x, z)) {
    const pts = channelSplinePoints || LAKE_CHANNEL_POINTS;
    const minSafeDist = LAKE_HALF_WIDTH + radius * 0.4;
    let closestSeg = null;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const seg = closestPointOnSegment2D(x, z, p0.x, p0.z, p1.x, p1.z);
      if (!closestSeg || seg.dist < closestSeg.dist) {
        closestSeg = seg;
      }
    }

    if (closestSeg && closestSeg.dist < minSafeDist) {
      let dx = x - closestSeg.x;
      let dz = z - closestSeg.z;
      let d = Math.hypot(dx, dz);
      if (d < 0.001) {
        dx = 1;
        dz = 0;
        d = 1;
      }
      return {
        inWater: true,
        lakeId: 'dragonfly_lake',
        waterName: 'Dragonfly Lake',
        depthFactor: Math.max(0, 1.0 - closestSeg.dist / minSafeDist),
        pushX: closestSeg.x + (dx / d) * (minSafeDist + 0.06),
        pushZ: closestSeg.z + (dz / d) * (minSafeDist + 0.06)
      };
    }
  }

  return { inWater: false, lakeId: null, waterName: null, depthFactor: 0 };
}
