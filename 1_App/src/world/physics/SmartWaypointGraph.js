// ============================================================================
// Gardens by the Bay — Smart Waypoint Router & Navigation Path Cost Solver
// (src/world/SmartWaypointGraph.js)
// ============================================================================

import {
  WORLD_BRIDGES,
  WORLD_BUILDINGS,
  SOLID_PILLARS,
  WATER_PONDS
} from '../../data/WorldMapSpec.js';
import {
  shortestAngleDiff,
  closestPointOnSegment2D,
  getBridgeStateAt,
  getBuildingDoorWaypoints,
  isPointInsideBuilding
} from './TerrainElevation.js';
import { WORLD_TREES } from '../terrain/TreeGenerator.js';
import {
  LAKE_DRY_ISLANDS,
  LAKE_STEPPING_CORRIDORS,
  SBG_DRY_LAKE_ISLANDS,
  SBG_STEPPING_CORRIDORS,
  LAKE_BRIDGES,
  getWaterCollision,
  isWestOfDragonflyLake,
  getBridgeAprons,
  findFirstWaterBlockerOnSegment,
  getEllipsePerimeterWaypoint
} from './WaterAndWaypointSolver.js';
import { getActiveMapId } from '../../data/MapRegistry.js';

export function estimateNavigationPathDistance(curX, curZ, targetX, targetZ) {
  let startX = curX;
  let startZ = curZ;
  let endX = targetX;
  let endZ = targetZ;
  let extraCost = 0;

  for (const b of WORLD_BUILDINGS) {
    if (b.openAirPavilion) continue;
    const curInside = isPointInsideBuilding(curX, curZ, b);
    const targetInside = isPointInsideBuilding(targetX, targetZ, b);
    if (curInside !== targetInside) {
      const wp = getBuildingDoorWaypoints(b);
      if (curInside && !targetInside) {
        extraCost += Math.hypot(curX - wp.outsideX, curZ - wp.outsideZ);
        startX = wp.outsideX;
        startZ = wp.outsideZ;
      } else if (!curInside && targetInside) {
        extraCost += Math.hypot(targetX - wp.outsideX, targetZ - wp.outsideZ);
        endX = wp.outsideX;
        endZ = wp.outsideZ;
      }
    }
  }

  const startWest = isWestOfDragonflyLake(startX, startZ);
  const endWest = isWestOfDragonflyLake(endX, endZ);
  if (startWest !== endWest) {
    let bestBridgeCost = Infinity;
    for (const br of LAKE_BRIDGES) {
      const ap = getBridgeAprons(br);
      const cost = startWest
        ? Math.hypot(startX - ap.westX, startZ - ap.westZ) +
          ap.len +
          Math.hypot(endX - ap.eastX, endZ - ap.eastZ)
        : Math.hypot(startX - ap.eastX, startZ - ap.eastZ) +
          ap.len +
          Math.hypot(endX - ap.westX, endZ - ap.westZ);
      if (cost < bestBridgeCost) bestBridgeCost = cost;
    }
    return extraCost + bestBridgeCost;
  }

  return extraCost + Math.hypot(endX - startX, endZ - startZ);
}

export function getSmartNavigationWaypoint(curX, curZ, targetX, targetZ) {
  let goalX = targetX;
  let goalZ = targetZ;

  // 1. Handle Building Entry, Exit, and Exterior Wall Perimeter Routing
  for (const b of WORLD_BUILDINGS) {
    if (b.openAirPavilion) continue;
    const curInside = isPointInsideBuilding(curX, curZ, b);
    const targetInside = isPointInsideBuilding(targetX, targetZ, b);
    const wp = getBuildingDoorWaypoints(b);

    if (curInside && !targetInside) {
      const distThreshold = Math.hypot(curX - wp.thresholdX, curZ - wp.thresholdZ);
      const distInside = Math.hypot(curX - wp.insideX, curZ - wp.insideZ);
      const worldAngle = Math.atan2(curX - b.cx, curZ - b.cz);
      const alignedWithDoor =
        Math.abs(shortestAngleDiff(worldAngle, b.doorWorldAngle)) <= b.doorHalfAngle * 0.92;

      if (!alignedWithDoor && distInside > 1.35 && distThreshold > 1.4) {
        goalX = wp.insideX;
        goalZ = wp.insideZ;
      } else {
        goalX = wp.outsideX;
        goalZ = wp.outsideZ;
      }
      break;
    } else if (!curInside && targetInside) {
      const distOut = Math.hypot(curX - wp.outsideX, curZ - wp.outsideZ);
      const distThreshold = Math.hypot(curX - wp.thresholdX, curZ - wp.thresholdZ);
      const worldAngle = Math.atan2(curX - b.cx, curZ - b.cz);
      const alignedWithDoor =
        Math.abs(shortestAngleDiff(worldAngle, b.doorWorldAngle)) <= b.doorHalfAngle * 0.88;

      if (alignedWithDoor && (distOut <= 2.2 || distThreshold <= 1.7)) {
        goalX = distThreshold > 0.9 ? wp.insideX : targetX;
        goalZ = distThreshold > 0.9 ? wp.insideZ : targetZ;
      } else {
        const perimWp = getEllipsePerimeterWaypoint(
          curX,
          curZ,
          wp.outsideX,
          wp.outsideZ,
          b.cx,
          b.cz,
          b.rx,
          b.rz,
          b.rotY,
          b.outerScale + 0.22
        );
        goalX = perimWp ? perimWp.x : wp.outsideX;
        goalZ = perimWp ? perimWp.z : wp.outsideZ;
      }
      break;
    }
  }

  // Also check if both current and goal are outside an enclosed building, but the straight line cuts through its wall
  for (const b of WORLD_BUILDINGS) {
    if (b.openAirPavilion) continue;
    if (!isPointInsideBuilding(curX, curZ, b) && !isPointInsideBuilding(goalX, goalZ, b)) {
      const perimWp = getEllipsePerimeterWaypoint(
        curX,
        curZ,
        goalX,
        goalZ,
        b.cx,
        b.cz,
        b.rx,
        b.rz,
        b.rotY,
        b.outerScale + 0.22
      );
      if (perimWp && !getWaterCollision(perimWp.x, perimWp.z, 0.45).inWater) {
        goalX = perimWp.x;
        goalZ = perimWp.z;
        break;
      }
    }
  }

  // 2. Active Bridge Traversal & Bank-Aware River / Pond Routing
  const curBridge = getBridgeStateAt(curX, curZ);
  if (curBridge.onBridge && curBridge.bridge) {
    const br = curBridge.bridge;
    const ap = getBridgeAprons(br);
    const goalBridge = getBridgeStateAt(goalX, goalZ);
    const sameBridge = goalBridge.onBridge && goalBridge.bridge?.id === br.id;

    if (!sameBridge) {
      const isLakeBridge = br.id === 'dragonfly_main_bridge' || br.id === 'south_meadow_bridge';
      if (isLakeBridge) {
        const goalWest = isWestOfDragonflyLake(goalX, goalZ);
        if (goalWest) {
          if (curBridge.t < 0.95 || Math.hypot(curX - ap.westX, curZ - ap.westZ) > 1.5) {
            goalX = ap.westX;
            goalZ = ap.westZ;
          }
        } else {
          if (curBridge.t > 0.05 || Math.hypot(curX - ap.eastX, curZ - ap.eastZ) > 1.5) {
            goalX = ap.eastX;
            goalZ = ap.eastZ;
          }
        }
      } else {
        const distGoalToEast = Math.hypot(goalX - ap.eastX, goalZ - ap.eastZ);
        const distGoalToWest = Math.hypot(goalX - ap.westX, goalZ - ap.westZ);
        if (distGoalToWest < distGoalToEast) {
          if (curBridge.t < 0.95) {
            goalX = ap.westX;
            goalZ = ap.westZ;
          }
        } else if (curBridge.t > 0.05) {
          goalX = ap.eastX;
          goalZ = ap.eastZ;
        }
      }
    }
  } else {
    // Check if current or target is on a Lake Dry Island with a stepping-stone corridor
    let handledIslandCorridor = false;
    const isSBG = getActiveMapId() === 'sbg';
    const activeDryIslands = isSBG ? SBG_DRY_LAKE_ISLANDS : LAKE_DRY_ISLANDS;
    const activeCorridors = isSBG ? SBG_STEPPING_CORRIDORS : LAKE_STEPPING_CORRIDORS;
    for (let idx = 0; idx < activeDryIslands.length; idx++) {
      const isl = activeDryIslands[idx];
      const corr = activeCorridors[idx];
      if (!corr) continue;
      const curOnIsl = Math.hypot(curX - isl.cx, curZ - isl.cz) <= Math.max(isl.rx, isl.rz) + 0.5;
      const goalOnIsl = Math.hypot(goalX - isl.cx, goalZ - isl.cz) <= Math.max(isl.rx, isl.rz) + 0.5;
      if (!curOnIsl && goalOnIsl) {
        if (Math.hypot(curX - corr.ax, curZ - corr.az) > 1.4) {
          goalX = corr.ax;
          goalZ = corr.az;
        } else {
          goalX = corr.bx;
          goalZ = corr.bz;
        }
        handledIslandCorridor = true;
        break;
      } else if (curOnIsl && !goalOnIsl) {
        if (Math.hypot(curX - corr.ax, curZ - corr.az) > 1.4) {
          goalX = corr.ax;
          goalZ = corr.az;
          handledIslandCorridor = true;
        }
        break;
      }
    }

    // Check if current and goal are on opposite banks of Dragonfly Lake
    if (!handledIslandCorridor) {
      const curWest = isWestOfDragonflyLake(curX, curZ);
      const goalWest = isWestOfDragonflyLake(goalX, goalZ);

      if (curWest !== goalWest) {
        let bestWp = null;
        let bestCost = Infinity;
        for (const br of LAKE_BRIDGES) {
          const ap = getBridgeAprons(br);
          const entryX = curWest ? ap.westX : ap.eastX;
          const entryZ = curWest ? ap.westZ : ap.eastZ;
          const exitX = curWest ? ap.eastX : ap.westX;
          const exitZ = curWest ? ap.eastZ : ap.westZ;

          const distToEntry = Math.hypot(curX - entryX, curZ - entryZ);
          const totalCost = distToEntry + ap.len + Math.hypot(goalX - exitX, goalZ - exitZ);
          if (totalCost < bestCost) {
            bestCost = totalCost;
            bestWp = distToEntry <= 2.3 ? { x: exitX, z: exitZ } : { x: entryX, z: entryZ };
          }
        }
        if (bestWp) {
          goalX = bestWp.x;
          goalZ = bestWp.z;
        }
      }
    }

    // Check if the segment on the same bank clips a Pond or a bend of Dragonfly Lake / shoreline
    const waterBlocker = findFirstWaterBlockerOnSegment(curX, curZ, goalX, goalZ);
    if (waterBlocker) {
      const hitPond = WATER_PONDS.find((p) => p.name === waterBlocker.waterName);
      if (hitPond) {
        const pondWp = getEllipsePerimeterWaypoint(
          curX,
          curZ,
          goalX,
          goalZ,
          hitPond.cx,
          hitPond.cz,
          hitPond.rx,
          hitPond.rz,
          0,
          1.24
        );
        if (pondWp && !getWaterCollision(pondWp.x, pondWp.z, 0.45).inWater) {
          goalX = pondWp.x;
          goalZ = pondWp.z;
        }
      } else if (typeof waterBlocker.pushX === 'number' && typeof waterBlocker.pushZ === 'number') {
        // Same-bank curve of Dragonfly Lake or shoreline: steer inland away from water edge
        const bankSign = isWestOfDragonflyLake(curX, curZ) ? -1 : 1;
        const inlandX = waterBlocker.pushX + bankSign * 2.2;
        const inlandZ = waterBlocker.pushZ;
        if (!getWaterCollision(inlandX, inlandZ, 0.45).inWater) {
          goalX = inlandX;
          goalZ = inlandZ;
        }
      }
    }

    // Ensure any redirected goal doesn't cut straight through an enclosed building wall
    for (const b of WORLD_BUILDINGS) {
      if (b.openAirPavilion) continue;
      if (!isPointInsideBuilding(curX, curZ, b) && !isPointInsideBuilding(goalX, goalZ, b)) {
        const perimWp = getEllipsePerimeterWaypoint(
          curX,
          curZ,
          goalX,
          goalZ,
          b.cx,
          b.cz,
          b.rx,
          b.rz,
          b.rotY,
          b.outerScale + 0.22
        );
        if (perimWp && !getWaterCollision(perimWp.x, perimWp.z, 0.45).inWater) {
          goalX = perimWp.x;
          goalZ = perimWp.z;
          break;
        }
      }
    }
  }

  // 3. Local Tree & Pillar Lookahead Deflection so Bots/Click-to-Move steer smoothly around trunks
  const dirX = goalX - curX;
  const dirZ = goalZ - curZ;
  const totalDist = Math.hypot(dirX, dirZ);
  if (totalDist > 0.8) {
    const lookDist = Math.min(totalDist, 4.8);
    const endX = curX + (dirX / totalDist) * lookDist;
    const endZ = curZ + (dirZ / totalDist) * lookDist;

    const segMinX = Math.min(curX, endX) - 3.5;
    const segMaxX = Math.max(curX, endX) + 3.5;
    const segMinZ = Math.min(curZ, endZ) - 3.5;
    const segMaxZ = Math.max(curZ, endZ) + 3.5;

    let nearestBlocker = null;
    let nearestT = Infinity;

    const checkObstacles = (list) => {
      for (const obs of list) {
        if (obs.x < segMinX || obs.x > segMaxX || obs.z < segMinZ || obs.z > segMaxZ) continue;
        const seg = closestPointOnSegment2D(obs.x, obs.z, curX, curZ, endX, endZ);
        const clearance = obs.r + 0.68;
        if (seg.t > 0.02 && seg.t < 0.98 && seg.dist < clearance && seg.t < nearestT) {
          nearestT = seg.t;
          nearestBlocker = { obs, seg, clearance };
        }
      }
    };

    checkObstacles(SOLID_PILLARS);
    checkObstacles(WORLD_TREES);

    if (nearestBlocker) {
      const { obs, seg, clearance } = nearestBlocker;
      let perpX = seg.x - obs.x;
      let perpZ = seg.z - obs.z;
      let pLen = Math.hypot(perpX, perpZ);
      if (pLen < 0.01) {
        perpX = -dirZ / totalDist;
        perpZ = dirX / totalDist;
        pLen = 1;
      }
      const candX = obs.x + (perpX / pLen) * (clearance + 0.5);
      const candZ = obs.z + (perpZ / pLen) * (clearance + 0.5);
      if (!getWaterCollision(candX, candZ, 0.4).inWater) {
        return { x: candX, z: candZ };
      }
    }
  }

  return { x: goalX, z: goalZ };
}
