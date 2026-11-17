// ============================================================================
// Gardens by the Bay — AI Bot Target Utility Scoring & Obstacle Avoidance
// (src/entities/BotTargetScoring.js)
// Extracted from src/entities/BotAIController.js
// ============================================================================

import { BOT_DIFFICULTY_PRESETS } from '../data/ExplorerAndGadgetPresets.js';
import {
  resolveCharacterMovement,
  estimateNavigationPathDistance
} from '../world/WorldPhysicsEngine.js';

export function chooseBotTarget(bot, treasuresList, explorers, botDifficulty = 'normal', elapsedSeconds = 0) {
  const uncollected = treasuresList.filter((t) => !t.collected);
  if (uncollected.length === 0) return null;

  const cooldowns = bot.unreachableCooldowns || {};
  const available = uncollected.filter((t) => !cooldowns[t.id] || cooldowns[t.id] <= elapsedSeconds);
  const pool = available.length > 0 ? available : uncollected;

  const diffPreset = BOT_DIFFICULTY_PRESETS[botDifficulty] || BOT_DIFFICULTY_PRESETS.normal;
  const you = explorers.find((e) => e.id === 'you');

  let best = null;
  let bestScore = -Infinity;

  for (const t of pool) {
    const pathDist = estimateNavigationPathDistance(
      bot.position.x,
      bot.position.z,
      t.position.x,
      t.position.z
    );
    let utility = -pathDist;

    // Higher utility for 'crown' (+350) and 'heritage' (+200) relics so bots smartly hunt high-value treasures
    if (t.rarity === 'crown' || t.isLandmarkRelic) {
      utility += 350;
    } else if (t.rarity === 'heritage') {
      utility += 200;
    }

    if (bot.id === 'kai') {
      utility -= pathDist * 0.15;
    } else if (bot.id === 'mei') {
      if (t.category === 'orchid' || t.category === 'conservatory') utility += 14;
    } else if (bot.id === 'raj') {
      if (t.isLandmarkRelic || t.category === 'sculpture') utility += 22;
    }

    // Avoid sniping treasures right next to the human player so gameplay feels fair
    if (you) {
      const distToPlayer = Math.hypot(t.position.x - you.position.x, t.position.z - you.position.z);
      if (distToPlayer < 16) {
        utility -= diffPreset.playerBufferPenalty;
      }
    }

    const takenByOtherBot = explorers.some(
      (other) => other.id !== bot.id && other.targetTreasureId === t.id
    );
    if (takenByOtherBot) utility -= 20;

    // Add imperfection/wander noise based on difficulty preset
    utility += (Math.random() - 0.5) * diffPreset.noise;

    if (utility > bestScore) {
      bestScore = utility;
      best = t;
    }
  }
  return best;
}

export function updateBotGadgetsAndHazards(exp, dt, botDifficulty, diffPreset, onDropDurianHazard) {
  // Active Bot Gadgets & Sprints (when botDifficulty === 'normal' || botDifficulty === 'pro')
  if (botDifficulty === 'normal' || botDifficulty === 'pro') {
    exp.botDashTimer = Math.max(0, (exp.botDashTimer || 0) - dt);
    exp.nextGadgetCooldown = Math.max(0, (exp.nextGadgetCooldown || 5) - dt);

    if (exp.nextGadgetCooldown <= 0) {
      exp.nextGadgetCooldown = (botDifficulty === 'pro' ? 8.5 : 13.5) + Math.random() * 4.5;
      if (Math.random() < (diffPreset.gadgetChance ?? 0.4)) {
        if (exp.id === 'kai') {
          exp.botDashTimer = 3.2;
          exp.snatchBubbleText = '⚡ TURBO DASH! 🔥';
          exp.snatchBubbleTimer = 2.0;
        } else if (exp.id === 'mei') {
          exp.botMagnetTimer = 4.0;
          exp.snatchBubbleText = '📡 MAGNET ON! ✨';
          exp.snatchBubbleTimer = 2.0;
        } else if (exp.id === 'raj') {
          exp.botDashTimer = 2.4;
          exp.snatchBubbleText = '🦨 DURIAN TRAP! 😈';
          exp.snatchBubbleTimer = 2.0;
          onDropDurianHazard?.(exp.position.x, exp.position.z, exp.id);
        }
      }
    }

    if (exp.id === 'raj' || exp.id === 'kai') {
      exp.durianDropTimer = (exp.durianDropTimer || (exp.id === 'raj' ? 6 : 11)) - dt;
      if (exp.durianDropTimer <= 0 && diffPreset.durianDropInterval < 100) {
        exp.durianDropTimer = diffPreset.durianDropInterval + Math.random() * 5;
        onDropDurianHazard?.(exp.position.x, exp.position.z, exp.id);
      }
    }
  }

  exp.botMagnetTimer = Math.max(0, (exp.botMagnetTimer || 0) - dt);
}

export function resolveBotTangentialSteering(THREE, exp, prevBotX, prevBotZ, stepDist, nx, nz, res, dynamicObstacles) {
  // Multi-angle tangential steering if blocked by water, building wall, bridge railing, tree, or structure
  const movedDist = Math.hypot(res.x - prevBotX, res.z - prevBotZ);
  let outNx = nx;
  let outNz = nz;
  let bestAltRes = res;

  if (res.blocked && movedDist < stepDist * 0.55) {
    if (!exp.slideSign) {
      exp.slideSign = exp.id === 'mei' ? -1 : 1;
    }
    const s = exp.slideSign;
    const candidateAngles = [
      0.65 * s,
      -0.65 * s,
      1.15 * s,
      -1.15 * s,
      1.60 * s,
      -1.60 * s,
      2.25 * s,
      -2.25 * s
    ];
    const baseYaw = Math.atan2(nx, nz);
    let bestAltMove = movedDist;

    for (const angOffset of candidateAngles) {
      const testYaw = baseYaw + angOffset;
      const tx = Math.sin(testYaw);
      const tz = Math.cos(testYaw);
      const altX = THREE.MathUtils.clamp(prevBotX + tx * stepDist, -72, 70);
      const altZ = THREE.MathUtils.clamp(prevBotZ + tz * stepDist, -50, 50);
      const altRes = resolveCharacterMovement(prevBotX, prevBotZ, altX, altZ, 0.42, dynamicObstacles);
      const altMoved = Math.hypot(altRes.x - prevBotX, altRes.z - prevBotZ);
      if (altMoved > bestAltMove * 1.15) {
        bestAltRes = altRes;
        bestAltMove = altMoved;
        outNx = tx;
        outNz = tz;
        exp.slideSign = angOffset >= 0 ? 1 : -1;
        if (!altRes.blocked && altMoved >= stepDist * 0.7) {
          break;
        }
      }
    }
  }

  return { res: bestAltRes, nx: outNx, nz: outNz };
}
