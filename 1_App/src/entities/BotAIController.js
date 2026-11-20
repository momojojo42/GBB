// ============================================================================
// Gardens by the Bay — Autonomous AI Bot Target Utility & Navigation Controller
// (src/entities/BotAIController.js)
// ============================================================================

import {
  resolveCharacterMovement,
  getSmartNavigationWaypoint
} from '../world/WorldPhysicsEngine.js';
import { animateChibiWalk, lerpAngleShortest } from './ChibiAnimator.js';
import {
  chooseBotTarget,
  updateBotGadgetsAndHazards,
  resolveBotTangentialSteering
} from './BotTargetScoring.js';

export { chooseBotTarget, updateBotGadgetsAndHazards, resolveBotTangentialSteering };

function applyBotPose(THREE, exp, res, nx, nz, dt, elapsedSeconds) {
  exp.position.set(res.x, res.y, res.z);
  exp.rig.root.position.copy(exp.position);
  exp.facingYaw = lerpAngleShortest(exp.facingYaw, Math.atan2(nx, nz), 1 - Math.exp(-10 * dt));
  exp.rig.bodyPivot.rotation.y = exp.facingYaw;
  animateChibiWalk(THREE, exp, dt, true, elapsedSeconds);
}

function haltBot(THREE, exp, dt, elapsedSeconds) {
  exp.isMoving = false;
  exp.velocityX = 0;
  exp.velocityZ = 0;
  animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
}

export function updateSingleBot(
  THREE,
  exp,
  dt,
  elapsedSeconds,
  {
    isEndGameCelebration,
    holoDecoyState,
    diffPreset,
    botDifficulty,
    treasuresList,
    explorers,
    dynamicObstacles,
    onCollectTreasure,
    newlyCollected,
    onDropDurianHazard
  }
) {
  if (isEndGameCelebration) {
    haltBot(THREE, exp, dt, elapsedSeconds);
    return;
  }

  updateBotGadgetsAndHazards(exp, dt, botDifficulty, diffPreset, onDropDurianHazard);

  // Dizzy-spin reaction after being "CHOPED!"
  if (exp.dizzyTimer > 0) {
    exp.dizzyTimer = Math.max(0, exp.dizzyTimer - dt);
    exp.isMoving = false;
    exp.velocityX = 0;
    exp.velocityZ = 0;
    exp.botStatus = 'choped';
    exp.rig.bodyPivot.rotation.y += dt * 14;
    exp.facingYaw = exp.rig.bodyPivot.rotation.y;
    exp.rig.root.position.y = exp.position.y + Math.abs(Math.sin(elapsedSeconds * 18)) * 0.42;
    if (exp.dizzyTimer <= 0) {
      exp.rig.root.position.y = exp.position.y;
      exp.targetTreasureId = null;
      exp.botStatus = 'seeking';
    }
    return;
  }

  // Inspection pause after picking up a relic
  if (exp.inspectTimer > 0) {
    exp.inspectTimer = Math.max(0, exp.inspectTimer - dt);
    exp.botStatus = 'inspecting';
    haltBot(THREE, exp, dt, elapsedSeconds);
    return;
  }

  const botStepSpeed = exp.baseSpeed * diffPreset.speedMult * (exp.botDashTimer > 0 ? 1.38 : 1.0);

  // Holo Decoy lure check
  if (holoDecoyState.active) {
    const ddx = holoDecoyState.x - exp.position.x;
    const ddz = holoDecoyState.z - exp.position.z;
    const distSq = ddx * ddx + ddz * ddz;
    if (distSq < 48 * 48) {
      exp.botStatus = 'decoyed';
      exp.targetPosition = { x: holoDecoyState.x, z: holoDecoyState.z };
      if (distSq > 2.2 * 2.2) {
        const wp = getSmartNavigationWaypoint(exp.position.x, exp.position.z, holoDecoyState.x, holoDecoyState.z);
        const dx = wp.x - exp.position.x;
        const dz = wp.z - exp.position.z;
        const wpDist = Math.max(0.01, Math.hypot(dx, dz));
        const nx = dx / wpDist;
        const nz = dz / wpDist;
        exp.isMoving = true;
        exp.velocityX = nx * botStepSpeed;
        exp.velocityZ = nz * botStepSpeed;
        const res = resolveCharacterMovement(
          exp.position.x,
          exp.position.z,
          THREE.MathUtils.clamp(exp.position.x + exp.velocityX * dt, -76, 90),
          THREE.MathUtils.clamp(exp.position.z + exp.velocityZ * dt, -46, 62),
          0.42,
          dynamicObstacles
        );
        applyBotPose(THREE, exp, res, nx, nz, dt, elapsedSeconds);
      } else {
        exp.facingYaw += dt * 4.5;
        exp.rig.bodyPivot.rotation.y = exp.facingYaw;
        haltBot(THREE, exp, dt, elapsedSeconds);
      }
      return;
    }
  }

  // Normal seeking state
  exp.botStatus = 'seeking';
  if (!exp.unreachableCooldowns) exp.unreachableCooldowns = {};

  const activeCooldown = exp.targetTreasureId && (exp.unreachableCooldowns[exp.targetTreasureId] || 0) > elapsedSeconds;
  let target = !activeCooldown
    ? treasuresList.find((t) => t.id === exp.targetTreasureId && !t.collected)
    : null;
  if (!target) {
    target = chooseBotTarget(exp, treasuresList, explorers, botDifficulty, elapsedSeconds);
    exp.targetTreasureId = target ? target.id : null;
    exp.stuckCount = 0;
  }

  if (!target) {
    exp.targetPosition = null;
    haltBot(THREE, exp, dt, elapsedSeconds);
    return;
  }

  exp.targetPosition = target.position;
  const distToRelic = Math.hypot(target.position.x - exp.position.x, target.position.z - exp.position.z);

  // Mei's Relic Magnet Pull
  if (exp.botMagnetTimer > 0 && distToRelic <= 4.2 && distToRelic > 0.4) {
    const pullSpeed = Math.min(distToRelic - 0.2, dt * 6.5);
    target.position.x += ((exp.position.x - target.position.x) / distToRelic) * pullSpeed;
    target.position.z += ((exp.position.z - target.position.z) / distToRelic) * pullSpeed;
    if (target.meshGroup) {
      target.meshGroup.position.x = target.position.x;
      target.meshGroup.position.z = target.position.z;
    }
  }

  const you = explorers?.find((e) => e.id === 'you');

  if (distToRelic <= 2.0) {
    const scoreBefore = exp.score;
    onCollectTreasure?.(target.id, exp.id);
    const pts = target.points || (target.isLandmarkRelic ? 350 : 100);
    if (exp.score === scoreBefore) {
      exp.score += pts;
      exp.relicCount = (exp.relicCount || 0) + 1;
      exp._lastAutoScore = pts;
    }
    exp.targetTreasureId = null;
    exp.stuckCount = 0;
    exp.isMoving = false;
    exp.inspectTimer = diffPreset.minPause + Math.random() * (diffPreset.maxPause - diffPreset.minPause);
    exp.botStatus = 'inspecting';
    newlyCollected.push({ treasure: target, collectorId: exp.id });

    // Reverse-"CHOPE!" taunt when snatching near the player
    if (you) {
      const ydx = you.position.x - exp.position.x;
      const ydz = you.position.z - exp.position.z;
      if (ydx * ydx + ydz * ydz <= 8.8 * 8.8) {
        exp.spinJumpTimer = 0.65;
        exp.snatchBubbleText = '🤚 CHOPED YOU! 😜';
        exp.snatchBubbleTimer = 2.4;
      }
    }
    return;
  }

  // Kai's Pro-Mode Back-Bump Hunting
  let navTargetX = target.position.x;
  let navTargetZ = target.position.z;
  if (botDifficulty === 'pro' && exp.id === 'kai' && exp.botDashTimer > 0 && you && (you.score || 0) >= 200) {
    const ydx = you.position.x - exp.position.x;
    const ydz = you.position.z - exp.position.z;
    if (ydx * ydx + ydz * ydz <= 8.5 * 8.5) {
      navTargetX = you.position.x;
      navTargetZ = you.position.z;
    }
  }

  const wp = getSmartNavigationWaypoint(exp.position.x, exp.position.z, navTargetX, navTargetZ);
  const dx = wp.x - exp.position.x;
  const dz = wp.z - exp.position.z;
  const wpDist = Math.max(0.01, Math.hypot(dx, dz));
  let nx = dx / wpDist;
  let nz = dz / wpDist;

  const stepDist = botStepSpeed * dt;
  exp.isMoving = true;
  exp.velocityX = nx * botStepSpeed;
  exp.velocityZ = nz * botStepSpeed;

  const prevBotX = exp.position.x;
  const prevBotZ = exp.position.z;
  const initialRes = resolveCharacterMovement(
    prevBotX,
    prevBotZ,
    THREE.MathUtils.clamp(prevBotX + exp.velocityX * dt, -72, 70),
    THREE.MathUtils.clamp(prevBotZ + exp.velocityZ * dt, -50, 50),
    0.42,
    dynamicObstacles
  );

  const steered = resolveBotTangentialSteering(THREE, exp, prevBotX, prevBotZ, stepDist, nx, nz, initialRes, dynamicObstacles);
  const res = steered.res;
  nx = steered.nx;
  nz = steered.nz;

  // Rolling progress check every 0.85s so bots never stall on obstacles
  if (typeof exp.progressAnchorX !== 'number') {
    exp.progressAnchorX = prevBotX;
    exp.progressAnchorZ = prevBotZ;
    exp.progressCheckTimer = 0;
  }
  exp.progressCheckTimer = (exp.progressCheckTimer || 0) + dt;
  if (exp.progressCheckTimer >= 0.85) {
    const netProgressSq = (res.x - exp.progressAnchorX) ** 2 + (res.z - exp.progressAnchorZ) ** 2;
    exp.progressAnchorX = res.x;
    exp.progressAnchorZ = res.z;
    exp.progressCheckTimer = 0;

    if (netProgressSq < 0.55 * 0.55) {
      exp.slideSign = -(exp.slideSign || 1);
      exp.stuckCount = (exp.stuckCount || 0) + 1;
      if (exp.stuckCount >= 2 && exp.targetTreasureId) {
        exp.unreachableCooldowns[exp.targetTreasureId] = elapsedSeconds + 7.5;
        const nextT = chooseBotTarget(exp, treasuresList, explorers, botDifficulty, elapsedSeconds);
        exp.targetTreasureId = nextT ? nextT.id : null;
        exp.stuckCount = 0;
      }
    } else {
      exp.stuckCount = 0;
    }
  }

  applyBotPose(THREE, exp, res, nx, nz, dt, elapsedSeconds);
}
