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
  // 0. If End-Game Celebration is active, bots stay in podium formation jumping & cheering!
  if (isEndGameCelebration) {
    exp.isMoving = false;
    exp.velocityX = 0;
    exp.velocityZ = 0;
    animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
    return;
  }

  updateBotGadgetsAndHazards(exp, dt, botDifficulty, diffPreset, onDropDurianHazard);

  // 0.5. If bot was just "CHOPED!" (treasure snatched right in front of them), do a 0.9s comedic dizzy-spin & flustered hop!
  if (exp.dizzyTimer > 0) {
    exp.dizzyTimer = Math.max(0, exp.dizzyTimer - dt);
    exp.isMoving = false;
    exp.velocityX = 0;
    exp.velocityZ = 0;
    exp.botStatus = 'choped';
    exp.rig.bodyPivot.rotation.y += dt * 14;
    exp.facingYaw = exp.rig.bodyPivot.rotation.y;
    const hopOffset = Math.abs(Math.sin(elapsedSeconds * 18)) * 0.42;
    exp.rig.root.position.y = exp.position.y + hopOffset;
    if (exp.dizzyTimer <= 0) {
      exp.rig.root.position.y = exp.position.y;
      exp.targetTreasureId = null;
      exp.botStatus = 'seeking';
    }
    return;
  }

  // 1. Check if bot is currently pausing to inspect/admire its last collected treasure
  if (exp.inspectTimer > 0) {
    exp.inspectTimer = Math.max(0, exp.inspectTimer - dt);
    exp.isMoving = false;
    exp.velocityX = 0;
    exp.velocityZ = 0;
    exp.botStatus = 'inspecting';
    animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
    return;
  }

  // 2. Check if Player deployed a Holo Decoy nearby that lures this bot
  const distToDecoy = holoDecoyState.active
    ? Math.hypot(holoDecoyState.x - exp.position.x, holoDecoyState.z - exp.position.z)
    : Infinity;

  if (holoDecoyState.active && distToDecoy < 48) {
    exp.botStatus = 'decoyed';
    exp.targetPosition = { x: holoDecoyState.x, z: holoDecoyState.z };
    if (distToDecoy > 2.2) {
      const wp = getSmartNavigationWaypoint(
        exp.position.x,
        exp.position.z,
        holoDecoyState.x,
        holoDecoyState.z
      );
      const dx = wp.x - exp.position.x;
      const dz = wp.z - exp.position.z;
      const wpDist = Math.max(0.01, Math.hypot(dx, dz));
      const nx = dx / wpDist;
      const nz = dz / wpDist;
      const dashMult = exp.botDashTimer > 0 ? 1.38 : 1.0;
      const botStepSpeed = exp.baseSpeed * diffPreset.speedMult * dashMult;
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
      exp.position.set(res.x, res.y, res.z);
      exp.rig.root.position.copy(exp.position);
      const targetYaw = Math.atan2(nx, nz);
      exp.facingYaw = lerpAngleShortest(exp.facingYaw, targetYaw, Math.min(1, dt * 10));
      exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      animateChibiWalk(THREE, exp, dt, true, elapsedSeconds);
    } else {
      exp.isMoving = false;
      exp.facingYaw += dt * 4.5;
      exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
    }
    return;
  }

  // 3. Normal Seeking State with Rebalanced Speed & Inspection Pause on Pickup
  exp.botStatus = 'seeking';
  if (!exp.unreachableCooldowns) {
    exp.unreachableCooldowns = {};
  }
  const activeCooldown = exp.targetTreasureId && (exp.unreachableCooldowns[exp.targetTreasureId] || 0) > elapsedSeconds;
  let target = !activeCooldown
    ? treasuresList.find((t) => t.id === exp.targetTreasureId && !t.collected)
    : null;
  if (!target) {
    target = chooseBotTarget(exp, treasuresList, explorers, botDifficulty, elapsedSeconds);
    exp.targetTreasureId = target ? target.id : null;
    exp.stuckCount = 0;
  }

  if (target) {
    exp.targetPosition = target.position;
    const distToRelic = Math.hypot(
      target.position.x - exp.position.x,
      target.position.z - exp.position.z
    );

    // Mei's Relic Magnet Pull
    if (exp.botMagnetTimer > 0 && distToRelic <= 4.2 && distToRelic > 0.4) {
      const pullSpeed = Math.min(distToRelic - 0.2, dt * 6.5);
      const dirX = (exp.position.x - target.position.x) / distToRelic;
      const dirZ = (exp.position.z - target.position.z) / distToRelic;
      target.position.x += dirX * pullSpeed;
      target.position.z += dirZ * pullSpeed;
      if (target.meshGroup) {
        target.meshGroup.position.x = target.position.x;
        target.meshGroup.position.z = target.position.z;
      }
    }

    if (distToRelic <= 2.0) {
      const scoreBefore = exp.score;
      if (onCollectTreasure) onCollectTreasure(target.id, exp.id);
      const pts = target.points || (target.isLandmarkRelic ? 350 : 100);
      if (exp.score === scoreBefore) {
        exp.score += pts;
        exp.relicCount = (exp.relicCount || 0) + 1;
        exp._lastAutoScore = pts;
      }
      exp.targetTreasureId = null;
      exp.stuckCount = 0;
      exp.isMoving = false;
      // Pause bot after collecting a treasure so bots don't chain-collect too fast!
      exp.inspectTimer =
        diffPreset.minPause + Math.random() * (diffPreset.maxPause - diffPreset.minPause);
      exp.botStatus = 'inspecting';
      newlyCollected.push({ treasure: target, collectorId: exp.id });

      // Reverse-"CHOPE!" Taunt on Pickup
      const you = explorers?.find((e) => e.id === 'you');
      if (you) {
        const dYou = Math.hypot(you.position.x - exp.position.x, you.position.z - exp.position.z);
        if (dYou <= 8.8) {
          exp.spinJumpTimer = 0.65;
          exp.snatchBubbleText = '🤚 CHOPED YOU! 😜';
          exp.snatchBubbleTimer = 2.4;
        }
      }
    } else {
      // Kai's Pro-Mode Back-Bump Hunting
      const you = explorers?.find((e) => e.id === 'you');
      let navTargetX = target.position.x;
      let navTargetZ = target.position.z;

      if (
        botDifficulty === 'pro' &&
        exp.id === 'kai' &&
        exp.botDashTimer > 0 &&
        you &&
        (you.score || 0) >= 200
      ) {
        const distToYou = Math.hypot(you.position.x - exp.position.x, you.position.z - exp.position.z);
        if (distToYou <= 8.5) {
          navTargetX = you.position.x;
          navTargetZ = you.position.z;
        }
      }

      // Smart navigation routes bots through building doorways, around exterior walls, and across bridges
      const wp = getSmartNavigationWaypoint(
        exp.position.x,
        exp.position.z,
        navTargetX,
        navTargetZ
      );
      const dx = wp.x - exp.position.x;
      const dz = wp.z - exp.position.z;
      const wpDist = Math.max(0.01, Math.hypot(dx, dz));
      let nx = dx / wpDist;
      let nz = dz / wpDist;

      const dashMult = exp.botDashTimer > 0 ? 1.38 : 1.0;
      const botStepSpeed = exp.baseSpeed * diffPreset.speedMult * dashMult;
      const stepDist = botStepSpeed * dt;
      exp.isMoving = true;
      exp.velocityX = nx * botStepSpeed;
      exp.velocityZ = nz * botStepSpeed;
      const desiredX = THREE.MathUtils.clamp(exp.position.x + exp.velocityX * dt, -72, 70);
      const desiredZ = THREE.MathUtils.clamp(exp.position.z + exp.velocityZ * dt, -50, 50);

      const prevBotX = exp.position.x;
      const prevBotZ = exp.position.z;
      const initialRes = resolveCharacterMovement(
        prevBotX,
        prevBotZ,
        desiredX,
        desiredZ,
        0.42,
        dynamicObstacles
      );

      const steered = resolveBotTangentialSteering(
        THREE,
        exp,
        prevBotX,
        prevBotZ,
        stepDist,
        nx,
        nz,
        initialRes,
        dynamicObstacles
      );
      const res = steered.res;
      nx = steered.nx;
      nz = steered.nz;

      // Rolling progress check every 0.85s to guarantee bots never stay stuck on any obstacle
      if (typeof exp.progressAnchorX !== 'number') {
        exp.progressAnchorX = prevBotX;
        exp.progressAnchorZ = prevBotZ;
        exp.progressCheckTimer = 0;
      }
      exp.progressCheckTimer = (exp.progressCheckTimer || 0) + dt;
      if (exp.progressCheckTimer >= 0.85) {
        const netProgress = Math.hypot(
          res.x - exp.progressAnchorX,
          res.z - exp.progressAnchorZ
        );
        exp.progressAnchorX = res.x;
        exp.progressAnchorZ = res.z;
        exp.progressCheckTimer = 0;

        if (netProgress < 0.55) {
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

      exp.position.set(res.x, res.y, res.z);
      exp.rig.root.position.copy(exp.position);

      const targetYaw = Math.atan2(nx, nz);
      exp.facingYaw = lerpAngleShortest(exp.facingYaw, targetYaw, Math.min(1, dt * 10));
      exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      animateChibiWalk(THREE, exp, dt, true, elapsedSeconds);
    }
  } else {
    exp.targetPosition = null;
    exp.isMoving = false;
    animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
  }
}
