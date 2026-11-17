// ============================================================================
// Gardens by the Bay — Water Shoreline & Smart Waypoint Router
// (src/world/WaterAndWaypointSolver.js)
// Extracted from WaterAndCollisionSolver.js to keep physics modules concise (<450 lines).
// ============================================================================

import {
  WORLD_BRIDGES,
  LAKE_CHANNEL_POINTS,
  LAKE_HALF_WIDTH,
  WATER_PONDS
} from '../data/WorldMapSpec.js';
import {
  shortestAngleDiff,
  closestPointOnSegment2D,
  isPointInsideBoomerang,
  getClosestBoomerangShorePoint,
  getBridgeStateAt
} from './TerrainElevation.js';

export const LAKE_DRY_ISLANDS = [
  { name: 'Nibong Island (#34)', cx: -31.5, cz: -18.0, rx: 3.1, rz: 1.9, rotY: 0.25 },
  { name: 'Dragonfly Island (#33)', cx: -39.0, cz: 0.0, rx: 3.3, rz: 2.2, rotY: 0.0 },
  { name: 'Dragonfly South Island (#33)', cx: -44.0, cz: 10.0, rx: 3.5, rz: 2.2, rotY: -0.35 }
];

export const LAKE_STEPPING_CORRIDORS = [
  { ax: -26.5, az: -18.0, bx: -31.5, bz: -18.0, halfWidth: 1.45 },
  { ax: -34.0, az: 0.0, bx: -39.0, bz: 0.0, halfWidth: 1.45 },
  { ax: -40.0, az: 10.0, bx: -44.0, bz: 10.0, halfWidth: 1.35 }
];

function buildCatmullRomPoints(pts, subdivsPerSeg = 8) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < subdivsPerSeg; s++) {
      const t = s / subdivsPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const x =
        0.5 *
        (2 * p1.x +
          (-p0.x + p2.x) * t +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);
      const z =
        0.5 *
        (2 * p1.z +
          (-p0.z + p2.z) * t +
          (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
          (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3);
      out.push({ x, z });
    }
  }
  out.push(pts[n - 1]);
  return out;
}

const LAKE_SPLINE_POINTS = buildCatmullRomPoints(LAKE_CHANNEL_POINTS, 8);

function isOnLakeDryIslandOrCorridor(x, z) {
  for (const isl of LAKE_DRY_ISLANDS) {
    const dx = x - isl.cx;
    const dz = z - isl.cz;
    if (Math.abs(dx) > 4.0 || Math.abs(dz) > 4.0) continue;
    const cosR = Math.cos(isl.rotY);
    const sinR = Math.sin(isl.rotY);
    const lx = dx * cosR - dz * sinR;
    const lz = dx * sinR + dz * cosR;
    if (Math.hypot(lx / isl.rx, lz / isl.rz) <= 1.0) return true;
  }
  for (const corr of LAKE_STEPPING_CORRIDORS) {
    const seg = closestPointOnSegment2D(x, z, corr.ax, corr.az, corr.bx, corr.bz);
    if (seg.dist <= corr.halfWidth) return true;
  }
  return false;
}

function isOnBridgeOrThresholdApron(x, z) {
  for (const br of WORLD_BRIDGES) {
    const vx = br.bx - br.ax;
    const vz = br.bz - br.az;
    const lenSq = vx * vx + vz * vz;
    if (lenSq < 1e-6) continue;
    const rawT = ((x - br.ax) * vx + (z - br.az) * vz) / lenSq;
    if (rawT >= -0.22 && rawT <= 1.22) {
      const projX = br.ax + rawT * vx;
      const projZ = br.az + rawT * vz;
      const perpDist = Math.hypot(x - projX, z - projZ);
      if (perpDist <= br.halfWidth + 0.25) return true;
    }
  }
  return false;
}

export function getWaterCollision(x, z, radius = 0.45) {
  if (isOnBridgeOrThresholdApron(x, z)) {
    return { inWater: false };
  }

  // 1. Check Outer Marina Reservoir shoreline boundary (Boomerang Peninsula Contour)
  const insideBoomerang = isPointInsideBoomerang(x, z);
  const shore = getClosestBoomerangShorePoint(x, z);
  const shoreMargin = Math.max(1.1, radius + 0.65);
  if (!insideBoomerang || (shore && shore.dist < shoreMargin)) {
    const safeShore = shore || { x: 0, z: 0, inwardX: 0, inwardZ: -1 };
    return {
      inWater: true,
      waterName: 'Marina Reservoir Waterfront',
      pushX: safeShore.x + safeShore.inwardX * (shoreMargin + 0.15),
      pushZ: safeShore.z + safeShore.inwardZ * (shoreMargin + 0.15),
      normalX: safeShore.inwardX,
      normalZ: safeShore.inwardZ
    };
  }

  // 2. Check Four Eastern Ponds + Koi Pond (with fast Manhattan AABB rejection)
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
        waterName: pond.name,
        pushX: pond.cx + (dx / safeU) * (rx * 1.02),
        pushZ: pond.cz + (dz / safeU) * (rz * 1.02)
      };
    }
  }

  // 3. Check Dragonfly Lake '/' Diagonal Channel spline segments (with dry island & stepping stone exemptions)
  if (!isOnLakeDryIslandOrCorridor(x, z)) {
    const minSafeDist = LAKE_HALF_WIDTH + radius * 0.4;
    let closestSeg = null;
    for (let i = 0; i < LAKE_SPLINE_POINTS.length - 1; i++) {
      const p0 = LAKE_SPLINE_POINTS[i];
      const p1 = LAKE_SPLINE_POINTS[i + 1];
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
        waterName: 'Dragonfly Lake',
        pushX: closestSeg.x + (dx / d) * (minSafeDist + 0.06),
        pushZ: closestSeg.z + (dz / d) * (minSafeDist + 0.06)
      };
    }
  }

  return { inWater: false };
}

export function getEllipsePerimeterWaypoint(curX, curZ, goalX, goalZ, cx, cz, rx, rz, rotY = 0, padScale = 1.22) {
  const cosN = Math.cos(rotY);
  const sinN = Math.sin(rotY);

  const acx = curX - cx;
  const acz = curZ - cz;
  const alx = (acx * cosN - acz * sinN) / rx;
  const alz = (acx * sinN + acz * cosN) / rz;

  const bcx = goalX - cx;
  const bcz = goalZ - cz;
  const blx = (bcx * cosN - bcz * sinN) / rx;
  const blz = (bcx * sinN + bcz * cosN) / rz;

  const seg = closestPointOnSegment2D(0, 0, alx, alz, blx, blz);
  const blockU = padScale - 0.08;
  if (seg.t <= 0.02 || seg.t >= 0.98 || seg.dist >= blockU) {
    return null;
  }

  const angA = Math.atan2(alz, alx);
  const angB = Math.atan2(blz, blx);
  const diff = shortestAngleDiff(angB, angA);
  const dir = diff >= 0 ? 1 : -1;
  const stepAng = dir * Math.max(0.45, Math.min(Math.abs(diff), 0.85));
  const targetAng = angA + stepAng;

  const safeU = padScale + 0.08;
  const wlx = Math.cos(targetAng) * rx * safeU;
  const wlz = Math.sin(targetAng) * rz * safeU;

  return {
    x: cx + (wlx * cosN + wlz * sinN),
    z: cz + (-wlx * sinN + wlz * cosN)
  };
}

export const LAKE_BRIDGES = WORLD_BRIDGES.filter(
  (br) => br.id === 'dragonfly_main_bridge' || br.id === 'south_meadow_bridge'
);

function getLakeCenterXAtZ(z) {
  const pts = LAKE_CHANNEL_POINTS;
  if (z <= pts[0].z) return pts[0].x;
  if (z >= pts[pts.length - 1].z) return pts[pts.length - 1].x;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    if (z >= p0.z && z <= p1.z) {
      const t = (z - p0.z) / Math.max(0.001, p1.z - p0.z);
      return p0.x + (p1.x - p0.x) * t;
    }
  }
  return -36.0;
}

export function isWestOfDragonflyLake(x, z) {
  if (z < -43.5 || z > 35.5) return false;
  return x < getLakeCenterXAtZ(z);
}

export function getBridgeAprons(br) {
  const dx = br.bx - br.ax;
  const dz = br.bz - br.az;
  const len = Math.hypot(dx, dz) || 1;
  const ux = dx / len;
  const uz = dz / len;
  const apronOffset = (br.halfWidth || 2.5) + 0.65;
  return {
    eastX: br.ax - ux * apronOffset,
    eastZ: br.az - uz * apronOffset,
    westX: br.bx + ux * apronOffset,
    westZ: br.bz + uz * apronOffset,
    len
  };
}

export function findFirstWaterBlockerOnSegment(ax, az, bx, bz) {
  const totalDist = Math.hypot(bx - ax, bz - az);
  if (totalDist < 0.5) return null;
  const steps = Math.max(3, Math.ceil(totalDist / 1.35));
  for (let i = 1; i < steps; i++) {
    const frac = i / steps;
    const mx = ax + (bx - ax) * frac;
    const mz = az + (bz - az) * frac;
    if (getBridgeStateAt(mx, mz).onBridge) continue;
    const wCol = getWaterCollision(mx, mz, 0.32);
    if (wCol.inWater) {
      return {
        x: mx,
        z: mz,
        frac,
        waterName: wCol.waterName,
        pushX: wCol.pushX,
        pushZ: wCol.pushZ
      };
    }
  }
  return null;
}

export function isPointInWater(x, z, radius = 0.45) {
  if (getBridgeStateAt(x, z).onBridge) return false;
  return Boolean(getWaterCollision(x, z, radius).inWater);
}
