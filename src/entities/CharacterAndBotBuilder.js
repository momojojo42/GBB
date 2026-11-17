// ============================================================================
// Gardens by the Bay — Cute Chibi Safari Pith-Helmet Explorers & 3 AI Bots (v2.2)
// (src/entities/CharacterAndBotBuilder.js) — Coordinator & Re-Exporter
// ============================================================================

import {
  GADGETS_SCHEMA,
  BOT_DIFFICULTY_PRESETS,
  COMPETITOR_SPECS
} from '../data/ExplorerAndGadgetPresets.js';
import {
  resolveCharacterMovement,
  getBridgeStateAt,
  getTerrainElevationAt
} from '../world/WorldPhysicsEngine.js';
import { buildChibiExplorerRig } from './ChibiExplorerRig.js';
import {
  isSafeTeleportSpot,
  createHoloDecoyAndDurianManager
} from './ExplorerHazardsAndPickpocket.js';
import {
  teleportExplorerToSafeSpot,
  buildExplorerStandings,
  updateExplorerMovement
} from './ExplorerMovementUpdater.js';

export {
  GADGETS_SCHEMA,
  BOT_DIFFICULTY_PRESETS,
  isSafeTeleportSpot,
  teleportExplorerToSafeSpot,
  buildExplorerStandings,
  updateExplorerMovement
};

export function createExplorersSystem(THREE, glbRegistry = null, matLib = null) {
  const group = new THREE.Group();
  group.name = 'ExplorersAndBotsGroup';

  const hazardsManager = createHoloDecoyAndDurianManager(THREE, group);
  const { holoDecoyState, spawnDurianHazard } = hazardsManager;

  let botDifficulty = 'normal'; // 'chill' | 'normal' | 'pro'

  const explorers = COMPETITOR_SPECS.map((spec, idx) => {
    const rig = buildChibiExplorerRig(THREE, spec, glbRegistry, matLib);
    const spawnY = getTerrainElevationAt(spec.spawnX, spec.spawnZ);
    rig.root.position.set(spec.spawnX, spawnY, spec.spawnZ);
    rig.bodyPivot.rotation.y = spec.initialRotY ?? Math.PI;
    group.add(rig.root);

    return {
      ...spec,
      score: 0,
      relicCount: 0,
      position: new THREE.Vector3(spec.spawnX, spawnY, spec.spawnZ),
      facingYaw: spec.initialRotY ?? Math.PI,
      isMoving: false,
      velocityX: 0,
      velocityZ: 0,
      targetPosition: null,
      targetTreasureId: null,
      rig,
      walkCycle: 0,
      activeGadget: null,
      gadgetTimer: 0,
      jumpTimer: 0,
      jumpDuration: 0.72,
      jumpHeight: 2.5,
      jumpSpin: false,
      spinJumpTimer: 0,
      windDashTimer: 0,
      dizzyTimer: 0,
      snatchBubbleText: null,
      snatchBubbleTimer: 0,
      endGameRole: null, // null | 'champion' | 'celebrating'
      endGamePhase: idx * 0.9,
      // Give AI bots an initial look-around pause so the player gets a head start
      inspectTimer: spec.id === 'you' ? 0 : 1.6 + idx * 0.85,
      botStatus: spec.id === 'you' ? 'player' : 'inspecting'
    };
  });

  let currentMode = 'race'; // 'relaxed' | 'race'
  let isEndGameCelebration = false;

  function setMode(mode) {
    currentMode = mode;
    for (const exp of explorers) {
      if (exp.id !== 'you') {
        exp.rig.root.visible = mode === 'race';
      }
    }
  }

  function triggerJump(explorerId = 'you', isSuper = false) {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return;
    exp.jumpDuration = isSuper ? 1.05 : 0.72;
    exp.jumpTimer = exp.jumpDuration;
    exp.jumpHeight = isSuper ? 3.8 : 2.5;
    exp.jumpSpin = isSuper;
    if (isSuper) {
      exp.spinJumpTimer = 0.65;
    }
  }

  function triggerWindDash(explorerId = 'you', duration = 3.5) {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return;
    exp.windDashTimer = duration;
  }

  function startEndGameCelebration(cameraYaw = 0) {
    isEndGameCelebration = true;
    const sorted = [...explorers].sort(
      (a, b) =>
        b.score - a.score ||
        (b.relicCount || 0) - (a.relicCount || 0) ||
        (a.id === 'you' ? -1 : 1)
    );
    const you = explorers.find((e) => e.id === 'you');
    const basePos = you ? you.position.clone() : new THREE.Vector3(0, 0, 8);

    // Arrange competitors in a 3D Podium Semicircle around the player facing the camera
    const podiumOffsets = [
      { dx: 0, dz: 0 },
      { dx: -2.2, dz: -0.9 },
      { dx: 2.2, dz: -0.9 },
      { dx: 0, dz: -1.85 }
    ];

    sorted.forEach((exp, rankIdx) => {
      const isWinner = rankIdx === 0;
      exp.endGameRole = isWinner ? 'champion' : 'celebrating';
      exp.botStatus = isWinner ? 'champion' : 'celebrating';
      exp.isMoving = false;
      exp.velocityX = 0;
      exp.velocityZ = 0;
      exp.targetTreasureId = null;
      exp.targetPosition = null;
      if (exp.rig.championCrown) {
        exp.rig.championCrown.visible = isWinner;
      }

      if (exp.id !== 'you' && currentMode === 'race') {
        const off = podiumOffsets[rankIdx] || { dx: rankIdx * 1.8, dz: -1.2 };
        const px = THREE.MathUtils.clamp(basePos.x + off.dx, -70, 68);
        const pz = THREE.MathUtils.clamp(basePos.z + off.dz, -48, 48);
        const bridge = getBridgeStateAt(px, pz);
        const py = bridge && bridge.onBridge ? bridge.elevation : (bridge?.y || 0);
        exp.position.set(px, py, pz);
        exp.rig.root.position.set(px, py, pz);
      }

      // Turn all explorers toward the camera for the victory jump showcase
      exp.facingYaw = cameraYaw;
      exp.rig.bodyPivot.rotation.y = cameraYaw;
      triggerJump(exp.id, isWinner || exp.id === 'you');
    });
    return getStandings();
  }

  function stopEndGameCelebration() {
    isEndGameCelebration = false;
    explorers.forEach((exp) => {
      exp.endGameRole = null;
      exp.jumpTimer = 0;
      if (exp.rig.championCrown) {
        exp.rig.championCrown.visible = false;
      }
      exp.botStatus = exp.id === 'you' ? 'player' : 'seeking';
    });
  }

  function setBotDifficulty(diffId) {
    if (BOT_DIFFICULTY_PRESETS[diffId]) {
      botDifficulty = diffId;
      for (const exp of explorers) {
        if (exp.id !== 'you') {
          exp.targetTreasureId = null;
        }
      }
    }
  }

  function getBotDifficulty() {
    return botDifficulty;
  }

  function teleportPlayer(x, z, rotY = null) {
    teleportExplorerToSafeSpot(explorers, x, z, rotY);
  }

  function incrementScore(explorerId, deltaPoints = 100) {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return;
    const pts = deltaPoints <= 5 ? deltaPoints * 100 : deltaPoints;
    const relicInc = deltaPoints <= 5 ? deltaPoints : 1;
    if (exp._lastAutoScore > 0) {
      exp.score = exp.score - exp._lastAutoScore + pts;
      exp._lastAutoScore = 0;
    } else {
      exp.score += pts;
      exp.relicCount = (exp.relicCount || 0) + relicInc;
    }
  }

  function deductScore(explorerId, pointsToDeduct) {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return 0;
    const actual = Math.min(exp.score, Math.max(0, Math.round(pointsToDeduct)));
    exp.score = Math.max(0, exp.score - actual);
    return actual;
  }

  function applyKnockback(explorerId, dirX, dirZ, distance = 2.6, dizzySec = 0.75, bubbleText = '') {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return;
    const len = Math.hypot(dirX, dirZ);
    const nx = len > 0.001 ? dirX / len : 0;
    const nz = len > 0.001 ? dirZ / len : 1;
    const desiredX = THREE.MathUtils.clamp(exp.position.x + nx * distance, -76, 90);
    const desiredZ = THREE.MathUtils.clamp(exp.position.z + nz * distance, -46, 62);
    const res = resolveCharacterMovement(exp.position.x, exp.position.z, desiredX, desiredZ, 0.42);
    exp.position.set(res.x, res.y, res.z);
    exp.rig.root.position.copy(exp.position);
    exp.dizzyTimer = Math.max(exp.dizzyTimer || 0, dizzySec);
    exp.spinJumpTimer = 0.55;
    if (bubbleText) {
      exp.snatchBubbleText = bubbleText;
      exp.snatchBubbleTimer = 2.2;
    }
  }

  spawnDurianHazard(2, 4, 'raj');
  spawnDurianHazard(-10, -2, 'raj');

  function activateGadget(explorerId, gadgetId, durationSec = 10) {
    const exp = explorers.find((e) => e.id === explorerId);
    const schema = GADGETS_SCHEMA[gadgetId];
    if (!exp || !schema) return;
    exp.activeGadget = schema;
    exp.gadgetTimer = durationSec;

    if (gadgetId === 'holo_decoy') {
      hazardsManager.deployHoloDecoy(exp, durationSec);
    }
  }

  function resetMatch() {
    isEndGameCelebration = false;
    hazardsManager.resetHazardsAndDecoy();

    explorers.forEach((exp, idx) => {
      exp.score = 0;
      exp.relicCount = 0;
      exp._lastAutoScore = 0;
      const spawnY = getTerrainElevationAt(exp.spawnX, exp.spawnZ);
      exp.position.set(exp.spawnX, spawnY, exp.spawnZ);
      exp.rig.root.position.set(exp.spawnX, spawnY, exp.spawnZ);
      exp.facingYaw = exp.initialRotY ?? Math.PI;
      exp.rig.bodyPivot.rotation.y = exp.facingYaw;
      exp.rig.bodyPivot.scale.set(1, 1, 1);
      exp.isMoving = false;
      exp.velocityX = 0;
      exp.velocityZ = 0;
      exp.targetTreasureId = null;
      exp.targetPosition = null;
      exp.unreachableCooldowns = {};
      exp.stuckCount = 0;
      exp.progressCheckTimer = 0;
      exp.progressAnchorX = exp.spawnX;
      exp.progressAnchorZ = exp.spawnZ;
      exp.activeGadget = null;
      exp.gadgetTimer = 0;
      exp.jumpTimer = 0;
      exp.spinJumpTimer = 0;
      exp.windDashTimer = 0;
      exp.dizzyTimer = 0;
      exp.lastHazardHitAt = -99;
      exp.lastBumpStealAt = -99;
      exp.snatchBubbleText = null;
      exp.snatchBubbleTimer = 0;
      exp.endGameRole = null;
      if (exp.rig.championCrown) exp.rig.championCrown.visible = false;
      exp.inspectTimer = exp.id === 'you' ? 0 : 1.6 + idx * 0.85;
      exp.botStatus = exp.id === 'you' ? 'player' : 'inspecting';
    });
  }

  function triggerExplorerEmote(explorerId = 'you', emoteText = '👋 Ready lah!') {
    const exp = explorers.find((e) => e.id === explorerId);
    if (!exp) return;
    exp.snatchBubbleText = emoteText;
    exp.snatchBubbleTimer = 3.2;
    triggerJump(explorerId, false);
  }

  function syncMultiplayerRoomSlots(roomState, mySlotIndex = 0, slotIndexToExplorerId = null, isHost = true) {
    if (!roomState || !Array.isArray(roomState.slots)) return;
    for (const slot of roomState.slots) {
      const expId = slotIndexToExplorerId ? slotIndexToExplorerId(slot.slotIndex) : slot.botId;
      const exp = explorers.find((e) => e.id === expId);
      if (!exp) continue;
      exp.networkSlotIndex = slot.slotIndex;
      exp.occupiedBy = slot.occupiedBy || 'bot';
      exp.isRemoteHuman = exp.id !== 'you' && slot.occupiedBy === 'human';
      exp.isRemoteBot = exp.id !== 'you' && slot.occupiedBy === 'bot' && !isHost;
      exp.customDisplayName = slot.playerName || exp.name;
      exp.pingMs = slot.pingMs || 0;
      if (typeof slot.spawnX === 'number' && typeof slot.spawnZ === 'number') {
        exp.spawnX = slot.spawnX;
        exp.spawnZ = slot.spawnZ;
      }
      if (exp.id !== 'you') {
        exp.rig.root.visible = currentMode === 'race' && slot.occupiedBy !== 'empty';
      }
    }
  }

  function alignExplorersOnStartingLine() {
    const startSlots = {
      you: { x: -2.4, z: 2.5 },
      mei: { x: -0.8, z: 2.5 },
      raj: { x: 0.8, z: 2.5 },
      kai: { x: 2.4, z: 2.5 }
    };
    explorers.forEach((exp) => {
      const slot = startSlots[exp.id] || { x: exp.spawnX, z: exp.spawnZ };
      const sy = getTerrainElevationAt(slot.x, slot.z);
      exp.position.set(slot.x, sy, slot.z);
      exp.rig.root.position.set(slot.x, sy, slot.z);
      exp.facingYaw = 0;
      exp.rig.bodyPivot.rotation.y = 0;
      exp.isMoving = false;
      exp.velocityX = 0;
      exp.velocityZ = 0;
    });
  }

  function getStandings() {
    return buildExplorerStandings(explorers);
  }

  function update(dt, elapsedSeconds, opts = {}) {
    return updateExplorerMovement({
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
      ...opts
    });
  }

  return {
    group,
    getStandings,
    incrementScore,
    deductScore,
    applyKnockback,
    spawnDurianHazard,
    teleportPlayer,
    setMode,
    setBotDifficulty,
    getBotDifficulty,
    activateGadget,
    triggerJump,
    triggerWindDash,
    triggerExplorerEmote,
    syncMultiplayerRoomSlots,
    alignExplorersOnStartingLine,
    startEndGameCelebration,
    stopEndGameCelebration,
    resetMatch,
    update
  };
}
