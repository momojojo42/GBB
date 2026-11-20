// ============================================================================
// Gardens by the Bay — Explorer Hazards, Safe Teleport & Pickpocket Solver
// (src/entities/ExplorerHazardsAndPickpocket.js)
// Extracted from CharacterAndBotBuilder.js to keep entity files concise (<450 lines).
// ============================================================================

import {
  SOLID_PILLARS,
  WORLD_BUILDINGS
} from '../data/WorldMapSpec.js';
import {
  getWaterCollision,
  shortestAngleDiff,
  WORLD_TREES,
  resolveCharacterMovement,
  getTerrainElevationAt
} from '../world/WorldPhysicsEngine.js';

export function isSafeTeleportSpot(tx, tz, generatedTrees = WORLD_TREES) {
  // 1. Must not be in water (with 0.55m safety margin)
  if (getWaterCollision(tx, tz, 0.55).inWater) {
    return false;
  }

  // 2. Must not be inside any SOLID_PILLARS
  for (const p of SOLID_PILLARS) {
    if (Math.hypot(tx - p.x, tz - p.z) < p.r + 0.55) {
      return false;
    }
  }

  // 3. Must not be inside any solid WORLD_BUILDINGS wall ring
  for (const b of WORLD_BUILDINGS) {
    const dx = tx - b.cx;
    const dz = tz - b.cz;
    const maxAxis = Math.max(b.rx, b.rz) * (b.outerScale + 0.2);
    if (Math.abs(dx) > maxAxis || Math.abs(dz) > maxAxis) continue;

    const worldAngle = Math.atan2(dx, dz);
    const inDoorway = Math.abs(shortestAngleDiff(worldAngle, b.doorWorldAngle)) <= b.doorHalfAngle * 0.85;
    if (inDoorway) continue;

    const cosP = Math.cos(b.rotY || 0);
    const sinP = Math.sin(b.rotY || 0);
    const lx1 = dx * cosP - dz * sinP;
    const lz1 = dx * sinP + dz * cosP;
    const u1 = Math.hypot(lx1 / b.rx, lz1 / b.rz);
    if (u1 >= b.innerScale - 0.06 && u1 <= b.outerScale + 0.06) {
      return false;
    }

    const lx2 = dx * cosP + dz * sinP;
    const lz2 = -dx * sinP + dz * cosP;
    const u2 = Math.hypot(lx2 / b.rx, lz2 / b.rz);
    if (u2 >= b.innerScale - 0.06 && u2 <= b.outerScale + 0.06) {
      return false;
    }
  }

  // 4. Must not be inside any generatedTrees trunk
  const treesToCheck = Array.isArray(generatedTrees) ? generatedTrees : WORLD_TREES;
  for (const t of treesToCheck) {
    if (Math.hypot(tx - t.x, tz - t.z) < (t.r || 0.45) + 0.50) {
      return false;
    }
  }

  // 5. Verify movement solver confirms the coordinate is unblocked
  const moveCheck = resolveCharacterMovement(tx, tz, tx, tz, 0.45);
  if (moveCheck.blocked || Math.hypot(moveCheck.x - tx, moveCheck.z - tz) > 0.02) {
    return false;
  }

  return true;
}

export function createHoloDecoyAndDurianManager(THREE, group) {
  // 3D Holographic Decoy Beacon Mesh (Deployed when Player uses Holo Decoy gadget)
  const decoyGroup = new THREE.Group();
  decoyGroup.visible = false;
  const decoyCore = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.65, 1),
    new THREE.MeshBasicMaterial({ color: 0x38BDF8, wireframe: true })
  );
  decoyCore.position.y = 1.25;
  const decoyInner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.42, 0),
    new THREE.MeshBasicMaterial({ color: 0xFACC15, transparent: true, opacity: 0.85 })
  );
  decoyInner.position.y = 1.25;
  const decoyRingGeo = new THREE.RingGeometry(0.9, 1.35, 32);
  decoyRingGeo.rotateX(-Math.PI / 2);
  const decoyRing = new THREE.Mesh(
    decoyRingGeo,
    new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    })
  );
  decoyRing.position.y = 0.14;
  decoyGroup.add(decoyCore, decoyInner, decoyRing);
  group.add(decoyGroup);

  const holoDecoyState = {
    active: false,
    timer: 0,
    x: 0,
    z: 0
  };

  const durianHazardsGroup = new THREE.Group();
  group.add(durianHazardsGroup);
  const activeDurianHazards = [];

  function removeDurianHazard(hazard) {
    const idx = activeDurianHazards.indexOf(hazard);
    if (idx !== -1) {
      activeDurianHazards.splice(idx, 1);
    }
    if (hazard.meshGroup) {
      durianHazardsGroup.remove(hazard.meshGroup);
      hazard.bodyMesh?.geometry?.dispose();
      hazard.bodyMesh?.material?.dispose();
      hazard.ringMesh?.geometry?.dispose();
      hazard.ringMesh?.material?.dispose();
    }
  }

  function spawnDurianHazard(x, z, ownerId = 'raj') {
    while (activeDurianHazards.length >= 5) {
      removeDurianHazard(activeDurianHazards[0]);
    }
    const meshGroup = new THREE.Group();
    const terrainY = getTerrainElevationAt(x, z);
    meshGroup.position.set(x, terrainY, z);

    const bodyGeo = new THREE.IcosahedronGeometry(0.36, 0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x84CC16,
      emissive: 0x65A30D,
      emissiveIntensity: 0.45,
      roughness: 0.35,
      flatShading: true
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = 0.38;
    meshGroup.add(bodyMesh);

    const ringGeo = new THREE.RingGeometry(0.42, 0.72, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFACC15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0.05;
    meshGroup.add(ringMesh);

    durianHazardsGroup.add(meshGroup);

    const hazard = {
      meshGroup,
      bodyMesh,
      ringMesh,
      x,
      z,
      ownerId,
      age: 0,
      maxAge: 20
    };
    activeDurianHazards.push(hazard);
    return hazard;
  }

  function deployHoloDecoy(exp, durationSec) {
    holoDecoyState.active = true;
    holoDecoyState.timer = Math.min(durationSec, 8.5);
    holoDecoyState.x = exp.position.x;
    holoDecoyState.z = exp.position.z;
    decoyGroup.position.set(exp.position.x, exp.position.y || 0, exp.position.z);
    decoyGroup.visible = true;
  }

  function resetHazardsAndDecoy() {
    holoDecoyState.active = false;
    holoDecoyState.timer = 0;
    decoyGroup.visible = false;
    while (activeDurianHazards.length > 0) {
      removeDurianHazard(activeDurianHazards[0]);
    }
    spawnDurianHazard(2, 4, 'raj');
    spawnDurianHazard(-10, -2, 'raj');
  }

  function updateHazardsAndDecoy({
    dt,
    elapsedSeconds,
    explorers,
    moveX,
    moveZ,
    deductScore,
    applyKnockback,
    onArcadeEvent
  }) {
    // Update active Durian hazards
    for (let i = activeDurianHazards.length - 1; i >= 0; i--) {
      const h = activeDurianHazards[i];
      h.age += dt;
      if (h.age >= h.maxAge) {
        removeDurianHazard(h);
        continue;
      }
      h.bodyMesh.rotation.y += dt * 2.2;
      const pulse = 1 + Math.sin(elapsedSeconds * 5 + h.z) * 0.15;
      h.ringMesh.scale.set(pulse, 1, pulse);

      const you = explorers.find((e) => e.id === 'you');
      if (you) {
        const dYou = Math.hypot(you.position.x - h.x, you.position.z - h.z);
        if (dYou <= 1.22) {
          if (you.jumpTimer > 0 || you.spinJumpTimer > 0 || (you.rig?.bodyPivot?.position.y > 0.22)) {
            removeDurianHazard(h);
            you.score += 50;
            you.snatchBubbleText = '🦘 DURIAN HOP! +50 PTS!';
            you.snatchBubbleTimer = 2.0;
            onArcadeEvent?.({ type: 'durian_jump_bonus', points: 50, position: you.position });
          } else if (elapsedSeconds - (you.lastHazardHitAt || -99) >= 2.8) {
            you.lastHazardHitAt = elapsedSeconds;
            removeDurianHazard(h);
            deductScore('you', 75);
            applyKnockback('you', -moveX || 0.5, -moveZ || 0.5, 2.2, 0.8, '🦨 AIYOH! -75 PTS!');
            onArcadeEvent?.({ type: 'durian_slip', points: -75, position: you.position });
          }
        }
      }
    }

    // Update Holo Decoy beacon if active
    if (holoDecoyState.active) {
      holoDecoyState.timer = Math.max(0, holoDecoyState.timer - dt);
      decoyCore.rotation.y = elapsedSeconds * 3.2;
      decoyInner.rotation.y = -elapsedSeconds * 2.4;
      const dPulse = 1 + Math.sin(elapsedSeconds * 6) * 0.18;
      decoyRing.scale.set(dPulse, dPulse, 1);
      if (holoDecoyState.timer <= 0) {
        holoDecoyState.active = false;
        decoyGroup.visible = false;
      }
    }
  }

  function resolveBackBumpPickpocket({
    elapsedSeconds,
    explorers,
    treasuresList,
    diffPreset,
    deductScore,
    applyKnockback,
    triggerJump,
    onArcadeEvent
  }) {
    const you = explorers.find((e) => e.id === 'you');
    if (!you) return;

    for (const bot of explorers) {
      if (bot.id === 'you') continue;
      const dist = Math.hypot(bot.position.x - you.position.x, bot.position.z - you.position.z);
      if (dist <= 1.38 && elapsedSeconds - (you.lastBumpStealAt || -99) >= 4.2) {
        const dx = bot.position.x - you.position.x;
        const dz = bot.position.z - you.position.z;
        const d = Math.hypot(dx, dz) || 1;
        const nx = dx / d;
        const nz = dz / d;
        const botFwdX = Math.sin(bot.facingYaw);
        const botFwdZ = Math.cos(bot.facingYaw);
        const youFwdX = Math.sin(you.facingYaw);
        const youFwdZ = Math.cos(you.facingYaw);

        // Case 1 (Player bumps Bot from behind OR while Player is sprinting/Wind-Dashing)
        if (
          you.isMoving &&
          (nx * botFwdX + nz * botFwdZ > 0.12 ||
            you.windDashTimer > 0 ||
            you.activeGadget?.id === 'turbo_boots')
        ) {
          you.lastBumpStealAt = elapsedSeconds;
          deductScore(bot.id, 150);
          you.score += 150;
          const stolenRelic = treasuresList.find((t) => t.collectedBy === bot.id);
          if (stolenRelic) {
            stolenRelic.collectedBy = 'you';
            bot.relicCount = Math.max(0, (bot.relicCount || 1) - 1);
            you.relicCount = (you.relicCount || 0) + 1;
          }
          applyKnockback(bot.id, nx, nz, 3.0, 1.0, '😱 ROBBED! -150 PTS!');
          you.snatchBubbleText = '🎒 PICKPOCKET! +150 PTS! 😎';
          you.snatchBubbleTimer = 2.4;
          triggerJump('you', true);
          onArcadeEvent?.({
            type: 'player_pickpocket',
            points: 150,
            victimName: bot.name,
            stolenRelic,
            position: you.position
          });
          break;
        }
        // Case 2 (Bot in Normal/Pro mode bumps Player from behind while Player is not jumping)
        else if (
          diffPreset.canBumpSteal &&
          bot.isMoving &&
          (-nx * youFwdX + -nz * youFwdZ > 0.22) &&
          you.spinJumpTimer <= 0 &&
          you.score > 0
        ) {
          you.lastBumpStealAt = elapsedSeconds;
          const lost = deductScore('you', 100);
          bot.score += lost;
          applyKnockback('you', -nx, -nz, 2.5, 0.75, `😱 BUMPED! -${lost} PTS!`);
          bot.snatchBubbleText = `🎒 HEHE! +${lost} PTS! 😜`;
          bot.snatchBubbleTimer = 2.4;
          onArcadeEvent?.({
            type: 'bot_pickpocket',
            points: -lost,
            attackerName: bot.name,
            position: you.position
          });
          break;
        }
      }
    }
  }

  return {
    holoDecoyState,
    spawnDurianHazard,
    deployHoloDecoy,
    resetHazardsAndDecoy,
    updateHazardsAndDecoy,
    resolveBackBumpPickpocket
  };
}
