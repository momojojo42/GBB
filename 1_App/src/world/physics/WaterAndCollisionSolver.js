// ============================================================================
// Gardens by the Bay — Water Shoreline, Character Collision & Waypoint Solver
// (src/world/WaterAndCollisionSolver.js)
// ============================================================================

import {
  WORLD_BRIDGES,
  WORLD_BUILDINGS,
  SOLID_PILLARS
} from '../../data/WorldMapSpec.js';
import {
  shortestAngleDiff,
  closestPointOnSegment2D,
  getBridgeStateAt,
  getTerrainElevationAt
} from './TerrainElevation.js';
import { WORLD_TREES } from '../terrain/TreeGenerator.js';
import {
  LAKE_DRY_ISLANDS,
  LAKE_STEPPING_CORRIDORS,
  getWaterCollision,
  isPointInWater
} from './WaterAndWaypointSolver.js';
import {
  getSmartNavigationWaypoint,
  estimateNavigationPathDistance
} from './SmartWaypointGraph.js';

export {
  LAKE_DRY_ISLANDS,
  LAKE_STEPPING_CORRIDORS,
  getWaterCollision,
  getSmartNavigationWaypoint,
  estimateNavigationPathDistance,
  isPointInWater
};

// ----------------------------------------------------------------------------
// Stone Relic Pedestals & Dynamic Obstacles Registry
// ----------------------------------------------------------------------------
let registeredRelicPedestals = [];

export function registerRelicPedestals(treasuresList) {
  registeredRelicPedestals = Array.isArray(treasuresList) ? treasuresList : [];
}

// ----------------------------------------------------------------------------
// Master Movement & Collision Resolver (for Player and AI Bots)
// ----------------------------------------------------------------------------
export function resolveCharacterMovement(
  prevX,
  prevZ,
  nextX,
  nextZ,
  radius = 0.42,
  dynamicObstacles = null
) {
  // Clamp maximum single-frame step distance to prevent high-dt tunneling through walls or trunks
  const rawDx = nextX - prevX;
  const rawDz = nextZ - prevZ;
  const rawStep = Math.hypot(rawDx, rawDz);
  const maxStep = 1.15;
  let x = rawStep > maxStep ? prevX + (rawDx / rawStep) * maxStep : nextX;
  let z = rawStep > maxStep ? prevZ + (rawDz / rawStep) * maxStep : nextZ;

  let blockedReason = null;
  let blockedObjectName = null;

  const prevBridge = getBridgeStateAt(prevX, prevZ);

  const pushOutFromCircle = (cx, cz, r) => {
    let dx = x - cx;
    let dz = z - cz;
    const minDist = r + radius;
    if (Math.abs(dx) >= minDist || Math.abs(dz) >= minDist) return false;
    let dist = Math.hypot(dx, dz);
    if (dist < minDist) {
      if (dist < 0.001) {
        dx = prevX - cx;
        dz = prevZ - cz;
        dist = Math.hypot(dx, dz);
        if (dist < 0.001) {
          dx = 1;
          dz = 0;
          dist = 1;
        }
      }
      x = cx + (dx / dist) * minDist;
      z = cz + (dz / dist) * minDist;
      return true;
    }
    return false;
  };

  // Run 3 relaxation passes so corner/wedge contacts (e.g. tree next to building wall) resolve cleanly
  for (let pass = 0; pass < 3; pass++) {
    // 1. Check Solid Cylindrical Pillars (Supertrees, Sculptures, Doorway Jambs, Moon Gate, etc.)
    for (const pil of SOLID_PILLARS) {
      if (pushOutFromCircle(pil.x, pil.z, pil.r)) {
        blockedReason = blockedReason || 'structure';
        blockedObjectName = blockedObjectName || pil.name || 'Park Structure';
      }
    }

    // 2. Check All 195 Tropical Tree Trunks
    for (const tree of WORLD_TREES) {
      if (pushOutFromCircle(tree.x, tree.z, tree.r)) {
        blockedReason = blockedReason || 'tree';
        blockedObjectName = blockedObjectName || tree.name;
      }
    }

    // 3. Check Stone Relic Pedestals (r = 0.24m compact stone column, well inside 2.1m pickup radius)
    for (const relic of registeredRelicPedestals) {
      if (relic.collected) continue;
      const rx = relic.position ? relic.position.x : relic.x;
      const rz = relic.position ? relic.position.z : relic.z;
      pushOutFromCircle(rx, rz, 0.24);
    }

    // 4. Check Dynamic Boulevard Vehicles (if provided)
    if (Array.isArray(dynamicObstacles)) {
      for (const veh of dynamicObstacles) {
        const vx = veh.mesh ? veh.mesh.position.x : veh.x;
        const vz = veh.mesh ? veh.mesh.position.z : veh.z;
        if (typeof vx !== 'number' || typeof vz !== 'number') continue;
        if (pushOutFromCircle(vx, vz, veh.r || 0.95)) {
          blockedReason = blockedReason || 'vehicle';
          blockedObjectName = blockedObjectName || 'Garden Shuttle / Vehicle';
        }
      }
    }

    // 5. Check Enterable Buildings (Hollow Elliptical Walls with Open Doorway Portal)
    for (const b of WORLD_BUILDINGS) {
      if (b.openAirPavilion) continue;

      const dx = x - b.cx;
      const dz = z - b.cz;
      const maxAxis = Math.max(b.rx, b.rz) * (b.outerScale + 0.15);
      if (Math.abs(dx) > maxAxis || Math.abs(dz) > maxAxis) continue;

      const prevDx = prevX - b.cx;
      const prevDz = prevZ - b.cz;

      // Transform into building local coordinates (matching Three.js group.rotation.y = b.rotY)
      const cosN = Math.cos(b.rotY);
      const sinN = Math.sin(b.rotY);
      const lx = dx * cosN - dz * sinN;
      const lz = dx * sinN + dz * cosN;
      const u = Math.hypot(lx / b.rx, lz / b.rz);

      if (u > b.outerScale + 0.12) continue;

      const prevLx = prevDx * cosN - prevDz * sinN;
      const prevLz = prevDx * sinN + prevDz * cosN;
      const prevU = Math.hypot(prevLx / b.rx, prevLz / b.rz);

      // Check if the character is within the open Entrance Doorway angular sector
      const worldAngle = Math.atan2(dx, dz);
      const angDiff = Math.abs(shortestAngleDiff(worldAngle, b.doorWorldAngle));
      const inDoorway = angDiff <= b.doorHalfAngle;

      const midWallU = (b.innerScale + b.outerScale) * 0.5;
      const crossedWall =
        (prevU < midWallU && u >= b.innerScale) ||
        (prevU >= midWallU && u <= b.outerScale);

      if (!inDoorway && ((u >= b.innerScale && u <= b.outerScale) || crossedWall)) {
        const wasInside = prevU < midWallU;
        const targetU = wasInside ? (b.innerScale - 0.018) : (b.outerScale + 0.018);
        const safeU = Math.max(u, 0.001);
        const newLx = (lx / safeU) * targetU;
        const newLz = (lz / safeU) * targetU;

        x = b.cx + (newLx * cosN + newLz * sinN);
        z = b.cz + (-newLx * sinN + newLz * cosN);

        blockedReason = 'building_wall';
        blockedObjectName = b.name;
      }
    }

    // 6. Enforce Solid Bridge Side Railings (both on deck over land/water and from outside along the sides)
    for (const br of WORLD_BRIDGES) {
      const seg = closestPointOnSegment2D(x, z, br.ax, br.az, br.bx, br.bz);
      const prevSeg = closestPointOnSegment2D(prevX, prevZ, br.ax, br.az, br.bx, br.bz);

      if (seg.t > 0.06 && seg.t < 0.94) {
        const innerMaxLat = br.halfWidth - 0.14;
        const outerMinLat = br.halfWidth + radius * 0.65;

        if (prevBridge.onBridge && prevBridge.bridge.id === br.id) {
          if (seg.dist > innerMaxLat) {
            const dx = x - seg.x;
            const dz = z - seg.z;
            const d = Math.hypot(dx, dz) || 1;
            x = seg.x + (dx / d) * innerMaxLat;
            z = seg.z + (dz / d) * innerMaxLat;
            blockedReason = blockedReason || 'bridge_railing';
            blockedObjectName = blockedObjectName || br.name;
          }
        } else if (prevSeg.dist >= br.halfWidth && seg.dist < outerMinLat) {
          const dx = x - seg.x;
          const dz = z - seg.z;
          const d = Math.hypot(dx, dz) || 1;
          x = seg.x + (dx / d) * outerMinLat;
          z = seg.z + (dz / d) * outerMinLat;
          blockedReason = blockedReason || 'bridge_railing';
          blockedObjectName = blockedObjectName || br.name;
        }
      }
    }
  }

  // 7. Check Bridge vs. Water Physics & Elevated Terrain Surface Height
  const curBridge = getBridgeStateAt(x, z);

  if (curBridge.onBridge) {
    return {
      x,
      y: Math.max(curBridge.elevation, getTerrainElevationAt(x, z)),
      z,
      onBridge: true,
      bridgeName: curBridge.bridge.name,
      blocked: Boolean(blockedReason),
      reason: blockedReason,
      objectName: blockedObjectName,
      blockedReason,
      blockedObjectName
    };
  }

  const waterCheck = getWaterCollision(x, z, radius);
  if (waterCheck.inWater) {
    if (prevBridge.onBridge) {
      const br = prevBridge.bridge;
      const seg = closestPointOnSegment2D(x, z, br.ax, br.az, br.bx, br.bz);
      const dx = x - seg.x;
      const dz = z - seg.z;
      const d = Math.hypot(dx, dz) || 1;
      const maxLat = br.halfWidth - 0.14;
      x = seg.x + (dx / d) * Math.min(d, maxLat);
      z = seg.z + (dz / d) * Math.min(d, maxLat);
      const clampedBridge = getBridgeStateAt(x, z);
      return {
        x,
        y: Math.max(clampedBridge.elevation, getTerrainElevationAt(x, z)),
        z,
        onBridge: true,
        bridgeName: br.name,
        blocked: true,
        reason: 'bridge_railing',
        objectName: br.name,
        blockedReason: 'bridge_railing',
        blockedObjectName: br.name
      };
    }

    // Character tried to walk directly into water from land — push them smoothly along the shoreline!
    x = waterCheck.pushX;
    z = waterCheck.pushZ;
    blockedReason = 'water';
    blockedObjectName = waterCheck.waterName;
  }

  return {
    x,
    y: getTerrainElevationAt(x, z),
    z,
    onBridge: false,
    bridgeName: null,
    blocked: Boolean(blockedReason),
    reason: blockedReason,
    objectName: blockedObjectName,
    blockedReason,
    blockedObjectName
  };
}

export function resolveObstacleCollisions(x, z, radius = 0.45, prevX = x, prevZ = z) {
  return resolveCharacterMovement(prevX, prevZ, x, z, radius);
}
