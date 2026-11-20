// ============================================================================
// Gardens by the Bay — Procedural Chibi Walk, Jump & Victory Dance Animator
// (src/entities/ChibiAnimator.js)
// ============================================================================

export function lerpAngleShortest(current, target, alpha) {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * alpha;
}

export function animateChibiWalk(THREE, exp, dt, isMoving, elapsedSeconds) {
  const rig = exp.rig;
  if (rig.bodyPivot.rotation.order !== 'YXZ') rig.bodyPivot.rotation.order = 'YXZ';
  const damp = Math.min(1, dt * 12);

  // Rotate 3D Golden Champion Crown if visible
  if (rig.championCrown && rig.championCrown.visible) {
    rig.championCrown.rotation.y = elapsedSeconds * 2.8;
    rig.championCrown.position.y = 3.25 + Math.sin(elapsedSeconds * 5) * 0.14;
  }

  // 1. Active Jump or Super Victory Jump Arc (takes priority over walk/idle)
  if (exp.jumpTimer > 0) {
    exp.jumpTimer = Math.max(0, exp.jumpTimer - dt);
    const progress = 1 - exp.jumpTimer / Math.max(0.01, exp.jumpDuration);
    const arc = Math.sin(progress * Math.PI);

    rig.bodyPivot.position.y = arc * exp.jumpHeight;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -0.08 * arc, damp);
    rig.bodyPivot.rotation.z = THREE.MathUtils.lerp(rig.bodyPivot.rotation.z, 0, damp);
    if (exp.jumpSpin) {
      rig.bodyPivot.rotation.y = exp.facingYaw + progress * Math.PI * 2;
    } else {
      rig.bodyPivot.rotation.y = exp.facingYaw;
    }

    // Arms raised high in V-for-Victory cheer
    if (rig.leftArmPivot) {
      rig.leftArmPivot.rotation.x = -2.45 * arc;
      rig.leftArmPivot.rotation.z = -0.22 - 0.45 * arc;
    }
    if (rig.rightArmPivot) {
      rig.rightArmPivot.rotation.x = -2.45 * arc;
      rig.rightArmPivot.rotation.z = 0.22 + 0.45 * arc;
    }
    // Mid-air star-jump leg spread & kick
    if (rig.leftLegPivot) {
      rig.leftLegPivot.rotation.x = -0.42 * arc;
      rig.leftLegPivot.rotation.z = -0.35 * arc;
    }
    if (rig.rightLegPivot) {
      rig.rightLegPivot.rotation.x = 0.28 * arc;
      rig.rightLegPivot.rotation.z = 0.35 * arc;
    }
    if (rig.headGroup) {
      rig.headGroup.rotation.x = -0.16 * arc;
      rig.headGroup.rotation.z = Math.sin(progress * Math.PI * 2) * 0.10;
    }
    return;
  }

  // 2. End-Game Continuous Victory Dance & Star-Jumps (When Time's Up or All 42 Relics Found)
  if (exp.endGameRole && !isMoving) {
    const isChamp = exp.endGameRole === 'champion' || exp.id === 'you';
    const freq = isChamp ? 1.85 : 1.55;
    const totalCycles = elapsedSeconds * freq + exp.endGamePhase;
    const cycleIndex = Math.floor(totalCycles);
    const jumpPhase = totalCycles % 1;
    const arc = Math.sin(jumpPhase * Math.PI);

    // High celebratory jump (Champion leaps 2.9 units high + twirls every 2nd jump!)
    const leapHeight = isChamp ? 2.85 : 1.75;
    rig.bodyPivot.position.y = arc * leapHeight;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, -0.06 * arc, damp);
    rig.bodyPivot.rotation.z = Math.sin(elapsedSeconds * 5 + exp.endGamePhase) * 0.08;

    if (isChamp && cycleIndex % 2 === 1) {
      rig.bodyPivot.rotation.y = exp.facingYaw + jumpPhase * Math.PI * 2;
    } else {
      rig.bodyPivot.rotation.y = exp.facingYaw + Math.sin(elapsedSeconds * 3.5 + exp.endGamePhase) * 0.22;
    }

    const wave = Math.sin(elapsedSeconds * 10 + exp.endGamePhase) * 0.32;
    if (rig.leftArmPivot) {
      rig.leftArmPivot.rotation.x = -2.55;
      rig.leftArmPivot.rotation.z = -0.48 + wave;
    }
    if (rig.rightArmPivot) {
      rig.rightArmPivot.rotation.x = -2.55;
      rig.rightArmPivot.rotation.z = 0.48 + wave;
    }
    if (rig.leftLegPivot) {
      rig.leftLegPivot.rotation.x = -0.35 * arc;
      rig.leftLegPivot.rotation.z = -0.34 * arc;
    }
    if (rig.rightLegPivot) {
      rig.rightLegPivot.rotation.x = 0.25 * arc;
      rig.rightLegPivot.rotation.z = 0.34 * arc;
    }
    if (rig.headGroup) {
      rig.headGroup.rotation.z = Math.sin(elapsedSeconds * 6 + exp.endGamePhase) * 0.12;
      rig.headGroup.rotation.x = -0.14 * arc;
    }
    return;
  }

  if (isMoving) {
    const actualSpeed = Math.hypot(exp.velocityX || 0, exp.velocityZ || 0);
    const speedRatio = Math.max(0.75, Math.min(1.55, actualSpeed / 9.5));
    exp.walkCycle += dt * 12.5 * speedRatio;

    const phase = exp.walkCycle;
    const sinP = Math.sin(phase);
    const cosP = Math.cos(phase);

    // Full-leg hip swing + knee/boot lift so legs visibly stride forward and back
    const legSwing = sinP * 0.92;
    if (rig.leftLegPivot) {
      const restPos = rig.leftLegPivot.userData.restPos;
      rig.leftLegPivot.rotation.x = legSwing;
      rig.leftLegPivot.rotation.y = 0;
      rig.leftLegPivot.rotation.z = -0.04 * cosP;
      if (restPos) {
        rig.leftLegPivot.position.y = restPos.y + Math.max(0, -sinP) * 0.09;
        rig.leftLegPivot.position.z = restPos.z - sinP * 0.08;
      }
    }
    if (rig.rightLegPivot) {
      const restPos = rig.rightLegPivot.userData.restPos;
      rig.rightLegPivot.rotation.x = -legSwing;
      rig.rightLegPivot.rotation.y = 0;
      rig.rightLegPivot.rotation.z = 0.04 * cosP;
      if (restPos) {
        rig.rightLegPivot.position.y = restPos.y + Math.max(0, sinP) * 0.09;
        rig.rightLegPivot.position.z = restPos.z + sinP * 0.08;
      }
    }

    // Full-arm & hand counter-swing + outward pump so hands visibly swing from all camera angles
    const armSwing = sinP * 0.88;
    if (rig.leftArmPivot) {
      const restPos = rig.leftArmPivot.userData.restPos;
      const restRot = rig.leftArmPivot.userData.restRot;
      const baseZ = restRot ? restRot.z : -0.22;
      rig.leftArmPivot.rotation.x = -armSwing;
      rig.leftArmPivot.rotation.y = armSwing * 0.26;
      rig.leftArmPivot.rotation.z = baseZ - 0.12 - Math.abs(cosP) * 0.10;
      if (restPos) {
        rig.leftArmPivot.position.y = restPos.y + Math.abs(sinP) * 0.045;
        rig.leftArmPivot.position.z = restPos.z + sinP * 0.06;
      }
    }
    if (rig.rightArmPivot) {
      const restPos = rig.rightArmPivot.userData.restPos;
      const restRot = rig.rightArmPivot.userData.restRot;
      const baseZ = restRot ? restRot.z : 0.22;
      rig.rightArmPivot.rotation.x = armSwing;
      rig.rightArmPivot.rotation.y = armSwing * 0.26;
      rig.rightArmPivot.rotation.z = baseZ + 0.12 + Math.abs(cosP) * 0.10;
      if (restPos) {
        rig.rightArmPivot.position.y = restPos.y + Math.abs(sinP) * 0.045;
        rig.rightArmPivot.position.z = restPos.z - sinP * 0.06;
      }
    }

    if (rig.headGroup) {
      const headRestRot = rig.headGroup.userData.restRot;
      const headBaseX = headRestRot ? headRestRot.x : 0;
      const headBaseZ = headRestRot ? headRestRot.z : 0;
      rig.headGroup.rotation.z = headBaseZ + sinP * 0.065;
      rig.headGroup.rotation.x = headBaseX - 0.06 + Math.abs(cosP) * 0.04;
    }

    // Dynamic runner forward lean, slight shoulder roll, and double-step vertical bounce
    rig.bodyPivot.position.y = Math.abs(Math.sin(phase)) * 0.13;
    rig.bodyPivot.rotation.x = 0.11 * speedRatio + Math.abs(cosP) * 0.03 * speedRatio;
    rig.bodyPivot.rotation.z = -cosP * 0.02 * speedRatio;
  } else if (exp.inspectTimer > 0) {
    // Celebratory / inspecting relic animation (happy little hop & head look-around)
    if (rig.leftLegPivot) rig.leftLegPivot.rotation.x *= 0.82;
    if (rig.rightLegPivot) rig.rightLegPivot.rotation.x *= 0.82;
    if (rig.leftArmPivot) rig.leftArmPivot.rotation.x = -0.45 + Math.sin(elapsedSeconds * 6) * 0.25;
    if (rig.rightArmPivot) rig.rightArmPivot.rotation.x = -0.45 - Math.sin(elapsedSeconds * 6) * 0.25;
    if (rig.headGroup) {
      const headRestRot = rig.headGroup.userData.restRot;
      const headBaseZ = headRestRot ? headRestRot.z : 0;
      rig.headGroup.rotation.z = headBaseZ + Math.sin(elapsedSeconds * 4.5) * 0.09;
    }
    rig.bodyPivot.position.y = Math.abs(Math.sin(elapsedSeconds * 5.2)) * 0.12;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0, damp);
    rig.bodyPivot.rotation.z = THREE.MathUtils.lerp(rig.bodyPivot.rotation.z, 0, damp);
  } else {
    for (const piv of [rig.leftLegPivot, rig.rightLegPivot, rig.leftArmPivot, rig.rightArmPivot]) {
      if (!piv) continue;
      const restPos = piv.userData.restPos;
      const restRot = piv.userData.restRot;
      piv.rotation.x = THREE.MathUtils.lerp(piv.rotation.x, restRot ? restRot.x : 0, damp);
      piv.rotation.y = THREE.MathUtils.lerp(piv.rotation.y, restRot ? restRot.y : 0, damp);
      piv.rotation.z = THREE.MathUtils.lerp(piv.rotation.z, restRot ? restRot.z : 0, damp);
      if (restPos) {
        piv.position.lerp(restPos, damp);
      }
    }
    if (rig.headGroup) {
      const headRestRot = rig.headGroup.userData.restRot;
      const headBaseX = headRestRot ? headRestRot.x : 0;
      const headBaseZ = headRestRot ? headRestRot.z : 0;
      rig.headGroup.rotation.z = headBaseZ + Math.sin(elapsedSeconds * 2.2) * 0.025;
      rig.headGroup.rotation.x = THREE.MathUtils.lerp(rig.headGroup.rotation.x, headBaseX, damp);
    }
    rig.bodyPivot.position.y = Math.sin(elapsedSeconds * 3) * 0.028;
    rig.bodyPivot.rotation.x = THREE.MathUtils.lerp(rig.bodyPivot.rotation.x, 0, damp);
    rig.bodyPivot.rotation.z = THREE.MathUtils.lerp(rig.bodyPivot.rotation.z, 0, damp);
  }
}
