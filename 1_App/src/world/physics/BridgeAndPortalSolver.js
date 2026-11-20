// ============================================================================
// Gardens by the Bay — Polygon Containment, Bridge Elevation & Doorway Portals
// (src/world/BridgeAndPortalSolver.js)
// ============================================================================

import {
  BOOMERANG_ISLAND_POLYGON,
  ISLAND_BOUNDS,
  WORLD_BRIDGES
} from '../../data/WorldMapSpec.js';

export function shortestAngleDiff(a, b) {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

export function closestPointOnSegment2D(px, pz, ax, az, bx, bz) {
  const vx = bx - ax;
  const vz = bz - az;
  const lenSq = vx * vx + vz * vz;
  if (lenSq < 1e-6) return { x: ax, z: az, t: 0, dist: Math.hypot(px - ax, pz - az) };
  const t = Math.max(0, Math.min(1, ((px - ax) * vx + (pz - az) * vz) / lenSq));
  const cx = ax + t * vx;
  const cz = az + t * vz;
  return { x: cx, z: cz, t, dist: Math.hypot(px - cx, pz - cz) };
}

export function isPointInsideBoomerang(x, z, poly = BOOMERANG_ISLAND_POLYGON) {
  // Fast O(1) AABB rejection when using the default peninsula polygon
  if (
    poly === BOOMERANG_ISLAND_POLYGON &&
    (x < ISLAND_BOUNDS.minX || x > ISLAND_BOUNDS.maxX || z < ISLAND_BOUNDS.minZ || z > ISLAND_BOUNDS.maxZ)
  ) {
    return false;
  }

  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const zi = poly[i].z;
    const xj = poly[j].x;
    const zj = poly[j].z;
    const intersect =
      zi > z !== zj > z &&
      x < ((xj - xi) * (z - zi)) / (zj - zi + 1e-12) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getClosestBoomerangShorePoint(x, z, poly = BOOMERANG_ISLAND_POLYGON) {
  let best = null;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const seg = closestPointOnSegment2D(x, z, a.x, a.z, b.x, b.z);
    if (!best || seg.dist < best.dist) {
      // For clockwise polygon in (X right, Z down), inward normal is (-dz, dx) / len
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const len = Math.hypot(dx, dz) || 1;
      best = {
        x: seg.x,
        z: seg.z,
        dist: seg.dist,
        inwardX: -dz / len,
        inwardZ: dx / len
      };
    }
  }
  return best;
}

// ----------------------------------------------------------------------------
// Helper: Check if (x, z) is on any Bridge and compute deck elevation
// ----------------------------------------------------------------------------
export function getBridgeStateAt(x, z) {
  for (const br of WORLD_BRIDGES) {
    const westExt = br.id === 'mbs_pedestrian_bridge' ? 3.2 : 0;
    // Quick AABB check before segment projection
    const minX = Math.min(br.ax, br.bx) - br.halfWidth - westExt;
    const maxX = Math.max(br.ax, br.bx) + br.halfWidth;
    if (x < minX || x > maxX) continue;
    const minZ = Math.min(br.az, br.bz) - br.halfWidth;
    const maxZ = Math.max(br.az, br.bz) + br.halfWidth;
    if (z < minZ || z > maxZ) continue;

    if (br.id === 'mbs_pedestrian_bridge' && x < br.bx && x >= br.bx - westExt) {
      const distZ = Math.abs(z - br.bz);
      if (distZ <= br.halfWidth) {
        return {
          onBridge: true,
          bridge: br,
          t: 1.0,
          distFromCenterline: distZ,
          centerX: x,
          centerZ: br.bz,
          elevation: 0.14,
          y: 0.14
        };
      }
    }

    const seg = closestPointOnSegment2D(x, z, br.ax, br.az, br.bx, br.bz);
    if (seg.dist <= br.halfWidth) {
      // Smooth sinusoidal arch elevation + plank top thickness (0.14m) ramped cleanly from ends
      const archSin = Math.sin(seg.t * Math.PI);
      const plankRamp = Math.min(1.0, archSin * 6.0);
      const elevation = 0.14 * plankRamp + archSin * br.archHeight;
      return {
        onBridge: true,
        bridge: br,
        t: seg.t,
        distFromCenterline: seg.dist,
        centerX: seg.x,
        centerZ: seg.z,
        elevation,
        y: elevation
      };
    }
  }
  return { onBridge: false, bridge: null, elevation: 0, y: 0 };
}

// ----------------------------------------------------------------------------
// Helper: Compute Doorway Entry & Exit Waypoints for a Building
// ----------------------------------------------------------------------------
export function getBuildingDoorWaypoints(b) {
  const avgR = (b.rx + b.rz) * 0.5;
  const sinA = Math.sin(b.doorWorldAngle);
  const cosA = Math.cos(b.doorWorldAngle);
  return {
    outsideX: b.cx + sinA * (avgR * 1.18),
    outsideZ: b.cz + cosA * (avgR * 1.18),
    thresholdX: b.cx + sinA * (avgR * 0.95),
    thresholdZ: b.cz + cosA * (avgR * 0.95),
    insideX: b.cx + sinA * (avgR * 0.72),
    insideZ: b.cz + cosA * (avgR * 0.72)
  };
}

export function isPointInsideBuilding(x, z, b) {
  const dx = x - b.cx;
  const dz = z - b.cz;
  const maxR = Math.max(b.rx, b.rz);
  if (Math.abs(dx) > maxR || Math.abs(dz) > maxR) return false;
  const cosR = Math.cos(b.rotY);
  const sinR = Math.sin(b.rotY);
  const lx = dx * cosR - dz * sinR;
  const lz = dx * sinR + dz * cosR;
  const u = Math.hypot(lx / b.rx, lz / b.rz);
  return u < 0.95;
}
