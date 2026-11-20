// ============================================================================
// Gardens by the Bay — Zero-GC 60 FPS Remote Transform & Yaw Interpolator
// (src/multiplayer/RemoteTransformInterpolator.js)
// Smoothly interpolates 20 Hz (50ms) network snapshots onto 60 FPS Three.js
// Chibi Explorer rigs using velocity dead-reckoning & shortest-arc yaw lerp.
// ============================================================================

import { lerpAngleShortest, animateChibiWalk } from '../entities/ChibiAnimator.js';
import { getTerrainElevationAt } from '../world/WorldPhysicsEngine.js';

function createPreallocatedSlotBuffer(slotIndex, defaultX, defaultZ) {
  return {
    slotIndex,
    hasSnapshot: false,
    lastReceivedAt: 0,
    prevX: defaultX,
    prevY: 0,
    prevZ: defaultZ,
    prevYaw: Math.PI,
    targetX: defaultX,
    targetY: 0,
    targetZ: defaultZ,
    targetVx: 0,
    targetVz: 0,
    targetYaw: Math.PI,
    isMoving: false,
    score: 0,
    relicCount: 0,
    activeGadget: null,
    occupiedBy: 'bot',
    playerName: '',
    pingMs: 16
  };
}

const DEFAULT_SPAWNS = [
  { x: -3.6, z: 10.5 },
  { x: -1.2, z: 10.5 },
  { x: 1.2, z: 10.5 },
  { x: 3.6, z: 10.5 }
];

export function createRemoteTransformInterpolator() {
  // Pre-allocated slot buffers (zero per-frame heap allocations)
  const slotBuffers = [
    createPreallocatedSlotBuffer(0, DEFAULT_SPAWNS[0].x, DEFAULT_SPAWNS[0].z),
    createPreallocatedSlotBuffer(1, DEFAULT_SPAWNS[1].x, DEFAULT_SPAWNS[1].z),
    createPreallocatedSlotBuffer(2, DEFAULT_SPAWNS[2].x, DEFAULT_SPAWNS[2].z),
    createPreallocatedSlotBuffer(3, DEFAULT_SPAWNS[3].x, DEFAULT_SPAWNS[3].z)
  ];

  function resetAllBuffers() {
    for (let i = 0; i < 4; i++) {
      const buf = slotBuffers[i];
      buf.hasSnapshot = false;
      buf.lastReceivedAt = 0;
      buf.prevX = DEFAULT_SPAWNS[i].x;
      buf.prevY = 0;
      buf.prevZ = DEFAULT_SPAWNS[i].z;
      buf.prevYaw = Math.PI;
      buf.targetX = DEFAULT_SPAWNS[i].x;
      buf.targetY = 0;
      buf.targetZ = DEFAULT_SPAWNS[i].z;
      buf.targetVx = 0;
      buf.targetVz = 0;
      buf.targetYaw = Math.PI;
      buf.isMoving = false;
      buf.score = 0;
      buf.relicCount = 0;
    }
  }

  function pushSlotSnapshot(slotSnap, nowMs = performance.now()) {
    if (!slotSnap || typeof slotSnap.slotIndex !== 'number') return;
    const buf = slotBuffers[slotSnap.slotIndex];
    if (!buf) return;

    if (!buf.hasSnapshot) {
      buf.prevX = Number(slotSnap.x ?? buf.targetX);
      buf.prevY = Number(slotSnap.y ?? buf.targetY);
      buf.prevZ = Number(slotSnap.z ?? buf.targetZ);
      buf.prevYaw = Number(slotSnap.yaw ?? buf.targetYaw);
      buf.hasSnapshot = true;
    } else {
      buf.prevX = buf.targetX;
      buf.prevY = buf.targetY;
      buf.prevZ = buf.targetZ;
      buf.prevYaw = buf.targetYaw;
    }

    buf.targetX = Number(slotSnap.x ?? buf.targetX);
    buf.targetY = Number(slotSnap.y ?? buf.targetY);
    buf.targetZ = Number(slotSnap.z ?? buf.targetZ);
    buf.targetVx = Number(slotSnap.vx || 0);
    buf.targetVz = Number(slotSnap.vz || 0);
    buf.targetYaw = Number(slotSnap.yaw ?? buf.targetYaw);
    buf.isMoving = Boolean(slotSnap.isMoving);
    if (typeof slotSnap.score === 'number') buf.score = slotSnap.score;
    if (typeof slotSnap.relicCount === 'number') buf.relicCount = slotSnap.relicCount;
    if (slotSnap.occupiedBy) buf.occupiedBy = slotSnap.occupiedBy;
    if (slotSnap.playerName) buf.playerName = slotSnap.playerName;
    if (typeof slotSnap.pingMs === 'number') buf.pingMs = slotSnap.pingMs;
    buf.lastReceivedAt = nowMs;
  }

  function pushWorldSnapshot(slotsArray) {
    if (!Array.isArray(slotsArray)) return;
    const nowMs = performance.now();
    for (let i = 0; i < slotsArray.length; i++) {
      pushSlotSnapshot(slotsArray[i], nowMs);
    }
  }

  /**
   * Steps remote explorer interpolation at 60 FPS with zero object allocations.
   */
  function updateRemoteExplorerRig(THREE, exp, slotIndex, dt, elapsedSeconds) {
    const buf = slotBuffers[slotIndex];
    if (!buf || !exp) return;

    if (!buf.hasSnapshot) {
      animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
      return;
    }

    const ageSec = Math.min(0.12, Math.max(0, (performance.now() - buf.lastReceivedAt) * 0.001));
    const deadReckonFactor = buf.isMoving ? ageSec * 0.45 : 0;
    const goalX = buf.targetX + buf.targetVx * deadReckonFactor;
    const goalZ = buf.targetZ + buf.targetVz * deadReckonFactor;

    const blend = Math.min(1, dt * 16.5);
    const nextX = exp.position.x + (goalX - exp.position.x) * blend;
    const nextZ = exp.position.z + (goalZ - exp.position.z) * blend;
    const terrainY = getTerrainElevationAt(nextX, nextZ);
    const nextY = buf.targetY > terrainY + 0.15 ? buf.targetY : terrainY;

    exp.position.set(nextX, nextY, nextZ);
    exp.rig.root.position.set(nextX, nextY, nextZ);

    exp.facingYaw = lerpAngleShortest(exp.facingYaw, buf.targetYaw, Math.min(1, dt * 15));
    exp.rig.bodyPivot.rotation.y = exp.facingYaw;

    exp.velocityX = buf.targetVx;
    exp.velocityZ = buf.targetVz;
    exp.isMoving = buf.isMoving || Math.hypot(goalX - exp.position.x, goalZ - exp.position.z) > 0.08;

    animateChibiWalk(THREE, exp, dt, exp.isMoving, elapsedSeconds);
  }

  function getSlotBuffer(slotIndex) {
    return slotBuffers[slotIndex] || null;
  }

  return {
    resetAllBuffers,
    pushSlotSnapshot,
    pushWorldSnapshot,
    updateRemoteExplorerRig,
    getSlotBuffer
  };
}
