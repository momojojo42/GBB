// ============================================================================
// Gardens by the Bay — Explorer Movement, Teleportation & Frame Update Logic
// (src/entities/ExplorerMovementUpdater.js)
// Extracted from src/entities/CharacterAndBotBuilder.js
// ============================================================================

import { BOT_DIFFICULTY_PRESETS } from '../data/ExplorerAndGadgetPresets.js';
import {
  resolveCharacterMovement,
  getTerrainElevationAt
} from '../world/WorldPhysicsEngine.js';
import { animateChibiWalk, lerpAngleShortest } from './ChibiAnimator.js';
import { updateSingleBot } from './BotAIController.js';
import { isSafeTeleportSpot } from './ExplorerHazardsAndPickpocket.js';

export function teleportExplorerToSafeSpot(explorers, x, z, rotY = null) {
  const you = explorers.find((e) => e.id === 'you');
  if (!you) return;

  let safeX = x;
  let safeZ = z;
  if (!isSafeTeleportSpot(safeX, safeZ)) {
    let found = false;
    for (let radius = 0.5; radius <= 35.0 && !found; radius += 0.5) {
      const steps = 16;
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * Math.PI * 2;
        const candX = x + Math.cos(angle) * radius;
        const candZ = z + Math.sin(angle) * radius;
        if (isSafeTeleportSpot(candX, candZ)) {
          safeX = candX;
          safeZ = candZ;
          found = true;
          break;
        }
      }
    }
  }

  const res = resolveCharacterMovement(safeX, safeZ, safeX, safeZ, you.radius || 0.42);
  const resolvedY = getTerrainElevationAt(res.x, res.z);
  you.position.set(res.x, resolvedY, res.z);
  you.rig.root.position.set(res.x, resolvedY, res.z);
  if (typeof rotY === 'number') {
    you.facingYaw = rotY;
    you.rig.bodyPivot.rotation.y = rotY;
  }
}

export function buildExplorerStandings(explorers) {
  return [...explorers]
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.relicCount || 0) - (a.relicCount || 0) ||
        (a.id === 'you' ? -1 : 1)
    )
    .map((e) => ({
      id: e.id,
      name: e.customDisplayName || e.name,
      baseName: e.name,
      archetype: e.archetype,
      colorHex: e.colorHex,
      score: e.score,
      relicCount: e.relicCount || 0,
      facingYaw: e.facingYaw,
      isMoving: e.isMoving,
      botStatus: e.botStatus || 'seeking',
      occupiedBy: e.occupiedBy || (e.id === 'you' ? 'human' : 'bot'),
      isRemoteHuman: Boolean(e.isRemoteHuman),
      pingMs: e.pingMs || 0,
      networkSlotIndex: e.networkSlotIndex ?? 0,
      inspectTimer: e.inspectTimer || 0,
      dizzyTimer: e.dizzyTimer || 0,
      windDashTimer: e.windDashTimer || 0,
      snatchBubbleText: e.snatchBubbleText || null,
      activeGadget: e.activeGadget ? e.activeGadget.id : null,
      gadgetTimer: e.gadgetTimer || 0,
      velocityX: e.velocityX,
      velocityZ: e.velocityZ,
      position: { x: e.position.x, y: e.position.y, z: e.position.z },
      targetPosition: e.targetPosition
        ? { x: e.targetPosition.x, z: e.targetPosition.z }
        : null
    }));
}

export function updateExplorerMovement({
  THREE,
  dt,
  elapsedSeconds,
  explorers,
  botDifficulty,
  currentMode,
  isEndGameCelebration,
  hazardsManager,
  holoDecoyState,
  spawnDurianHazard,
  deductScore,
  applyKnockback,
  triggerJump,
  moveX = 0,
  moveZ = 0,
  sprintBoost = 1.0,
  treasuresList = [],
  dynamicObstacles = null,
  remoteInterpolator = null,
  isMovementLocked = false,
  onCollectTreasure,
  onPhysicsBlocked,
  onArcadeEvent
}) {
  const newlyCollected = [];
  const diffPreset = BOT_DIFFICULTY_PRESETS[botDifficulty] || BOT_DIFFICULTY_PRESETS.normal;
  const effMoveX = isMovementLocked ? 0 : moveX;
  const effMoveZ = isMovementLocked ? 0 : moveZ;

  hazardsManager.updateHazardsAndDecoy({
    dt,
    elapsedSeconds,
    explorers,
    moveX: effMoveX,
    moveZ: effMoveZ,
    deductScore,
    applyKnockback,
    onArcadeEvent
  });

  for (const exp of explorers) {
    exp._lastAutoScore = 0;

    if (exp.gadgetTimer > 0) {
      exp.gadgetTimer = Math.max(0, exp.gadgetTimer - dt);
      if (exp.gadgetTimer === 0) exp.activeGadget = null;
    }
    if (exp.windDashTimer > 0) {
      exp.windDashTimer = Math.max(0, exp.windDashTimer - dt);
    }
    if (exp.snatchBubbleTimer > 0) {
      exp.snatchBubbleTimer = Math.max(0, exp.snatchBubbleTimer - dt);
      if (exp.snatchBubbleTimer === 0) exp.snatchBubbleText = null;
    }

    const windDashMult = exp.windDashTimer > 0 ? 1.45 : 1.0;
    const speedMult =
      (exp.activeGadget ? exp.activeGadget.speedMultiplier : 1.0) *
      (exp.id === 'you' ? sprintBoost : 1.0) *
      windDashMult;
    const pickupBonus = exp.activeGadget ? exp.activeGadget.pickupRadiusBonus : 0;
    const pickupRadius = 2.25 + pickupBonus;

    if (exp.id === 'you') {
      const isMoving = Math.hypot(effMoveX, effMoveZ) > 0.01;
      exp.isMoving = isMoving;
      if (isMoving) {
        const len = Math.hypot(effMoveX, effMoveZ);
        const nx = effMoveX / len;
        const nz = effMoveZ / len;
        const stepSpeed = exp.baseSpeed * speedMult;
        exp.velocityX = nx * stepSpeed;
        exp.velocityZ = nz * stepSpeed;
        const desiredX = THREE.MathUtils.clamp(exp.position.x + exp.velocityX * dt, -76, 90);
        const desiredZ = THREE.MathUtils.clamp(exp.position.z + exp.velocityZ * dt, -46, 62);

        const res = resolveCharacterMovement(
          exp.position.x,
          exp.position.z,
          desiredX,
          desiredZ,
          0.42,
          dynamicObstacles
        );
        exp.position.set(res.x, res.y, res.z);
        exp.rig.root.position.copy(exp.position);

        if (res.blocked && typeof onPhysicsBlocked === 'function') {
          onPhysicsBlocked(res);
        }

        const targetYaw = Math.atan2(nx, nz);
        exp.facingYaw = lerpAngleShortest(exp.facingYaw, targetYaw, Math.min(1, dt * 14));
        exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      } else {
        exp.velocityX = 0;
        exp.velocityZ = 0;
        exp.position.y = getTerrainElevationAt(exp.position.x, exp.position.z);
        exp.rig.root.position.y = exp.position.y;
      }

      if (exp.dizzyTimer > 0) {
        exp.dizzyTimer = Math.max(0, exp.dizzyTimer - dt);
        exp.rig.bodyPivot.rotation.y += dt * 13;
      }

      animateChibiWalk(THREE, exp, dt, isMoving, elapsedSeconds);

      // Rotate Player's Golden Compass Arrow toward nearest uncollected treasure
      let nearest = null;
      let minDist = Infinity;
      for (const t of treasuresList) {
        if (t.collected) continue;
        const d = Math.hypot(t.position.x - exp.position.x, t.position.z - exp.position.z);
        if (d < minDist) {
          minDist = d;
          nearest = t;
        }
      }
      if (nearest) {
        const angle = Math.atan2(
          nearest.position.x - exp.position.x,
          nearest.position.z - exp.position.z
        );
        exp.rig.compassPivot.rotation.y = angle;
        exp.rig.compassPivot.visible = true;

        // If Relic Magnet is active, gently pull nearby uncollected relic toward the player
        if (exp.activeGadget?.id === 'relic_magnet' && minDist <= pickupRadius * 1.45 && minDist > 1.2) {
          const pullStep = Math.min(minDist - 1.0, dt * 8.5);
          const dirX = (exp.position.x - nearest.position.x) / minDist;
          const dirZ = (exp.position.z - nearest.position.z) / minDist;
          nearest.position.x += dirX * pullStep;
          nearest.position.z += dirZ * pullStep;
          nearest.position.y = getTerrainElevationAt(nearest.position.x, nearest.position.z);
          if (nearest.meshGroup) {
            nearest.meshGroup.position.set(nearest.position.x, nearest.position.y, nearest.position.z);
          }
        }

        if (minDist <= pickupRadius) {
          // 😂 "🤚 CHOPE!" Bot Snatch Comedy: check if any AI bot was within 9.5m of nearest
          const botReactions = ['😱 Alamak!', '😭 My relic lah!', '😤 Walao eh!'];
          for (let bIdx = 0; bIdx < explorers.length; bIdx++) {
            const bot = explorers[bIdx];
            if (bot.id === 'you') continue;
            const botDist = Math.hypot(
              nearest.position.x - bot.position.x,
              nearest.position.z - bot.position.z
            );
            if (botDist <= 9.5) {
              nearest.chopedFromBot = bot.id;
              bot.dizzyTimer = 0.9;
              bot.botStatus = 'choped';
              bot.snatchBubbleText = botReactions[bIdx % botReactions.length];
              bot.snatchBubbleTimer = 2.4;
              exp.snatchBubbleText = '🤚 CHOPE! 😎';
              exp.snatchBubbleTimer = 2.4;
            }
          }

          const scoreBefore = exp.score;
          if (onCollectTreasure) onCollectTreasure(nearest.id, 'you');
          const isCrown = nearest.rarity === 'crown' || Boolean(nearest.isLandmarkRelic);
          const relicPts =
            nearest.points || (isCrown ? 350 : nearest.rarity === 'heritage' ? 200 : 100);
          if (exp.score === scoreBefore) {
            exp.score += relicPts;
            exp.relicCount = (exp.relicCount || 0) + 1;
            exp._lastAutoScore = relicPts;
          }
          triggerJump('you', isCrown);
          newlyCollected.push({ treasure: nearest, collectorId: 'you' });
        }
      } else {
        exp.rig.compassPivot.visible = false;
      }
    } else if (currentMode === 'race') {
      if (exp.occupiedBy === 'empty') {
        exp.isMoving = false;
        continue;
      }
      if (isMovementLocked) {
        exp.isMoving = false;
        exp.velocityX = 0;
        exp.velocityZ = 0;
        animateChibiWalk(THREE, exp, dt, false, elapsedSeconds);
      } else if ((exp.isRemoteHuman || exp.isRemoteBot) && remoteInterpolator) {
        remoteInterpolator.updateRemoteExplorerRig(
          THREE,
          exp,
          exp.networkSlotIndex ?? 1,
          dt,
          elapsedSeconds
        );
      } else {
        updateSingleBot(THREE, exp, dt, elapsedSeconds, {
          isEndGameCelebration,
          holoDecoyState,
          diffPreset,
          botDifficulty,
          treasuresList,
          explorers,
          dynamicObstacles,
          onCollectTreasure,
          newlyCollected,
          onDropDurianHazard: (x, z, botId) => spawnDurianHazard(x, z, botId)
        });
      }
    }

    // Celebratory 360° mid-air spin-jump + squash-and-stretch scale bounce
    if (exp.spinJumpTimer > 0) {
      exp.spinJumpTimer = Math.max(0, exp.spinJumpTimer - dt);
      const progress = 1 - exp.spinJumpTimer / 0.65;
      exp.rig.bodyPivot.rotation.y = exp.facingYaw + progress * Math.PI * 2;
      const stretch = 1 + Math.sin(progress * Math.PI * 2) * 0.18;
      const squash = 1 / Math.sqrt(Math.max(0.5, stretch));
      exp.rig.bodyPivot.scale.set(squash, stretch, squash);
      if (exp.spinJumpTimer === 0) {
        exp.rig.bodyPivot.scale.set(1, 1, 1);
        exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      }
    }
  }

  // Back-Bump Pickpocket Mechanic
  if (currentMode === 'race' && !isEndGameCelebration) {
    hazardsManager.resolveBackBumpPickpocket({
      elapsedSeconds,
      explorers,
      treasuresList,
      diffPreset,
      deductScore,
      applyKnockback,
      triggerJump,
      onArcadeEvent
    });
  }

  return newlyCollected;
}
