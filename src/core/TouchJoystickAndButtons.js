// ============================================================================
// Gardens by the Bay — Virtual Joystick & Mobile Touch Button Wiring
// (src/core/TouchJoystickAndButtons.js)
// Extracted from src/core/InputAndTouchController.js
// ============================================================================

import * as THREE from 'three';

export function stepNudgeInCameraDirection({
  camera,
  cameraControl,
  getExplorersSys,
  activateFollowCameraFromCurrentView,
  setClickMoveTarget,
  forwardSign,
  rightSign,
  distMeters = 6.5
}) {
  const explorersSys = getExplorersSys();
  if (!explorersSys) return;
  const you = explorersSys.getStandings().find((s) => s.id === 'you');
  if (!you) return;
  activateFollowCameraFromCurrentView();
  const fwd = new THREE.Vector3();
  const rgt = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  fwd.y = 0;
  if (fwd.lengthSq() < 0.0001) {
    fwd.set(-Math.sin(cameraControl.followYaw), 0, -Math.cos(cameraControl.followYaw));
  } else {
    fwd.normalize();
  }
  rgt.crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize();
  const dx = (fwd.x * forwardSign + rgt.x * rightSign) * distMeters;
  const dz = (fwd.z * forwardSign + rgt.z * rightSign) * distMeters;
  const tx = THREE.MathUtils.clamp(you.position.x + dx, -74, 72);
  const tz = THREE.MathUtils.clamp(you.position.z + dz, -52, 52);
  setClickMoveTarget(new THREE.Vector3(tx, 0, tz));
}

export function bindMobileTouchControls({
  camera,
  appState,
  cameraControl,
  touchMoveState,
  getExplorersSys,
  setClickMoveTarget,
  activateFollowCameraFromCurrentView,
  triggerPlayerJump,
  collectNearestRelicForPlayer,
  setScreenState
}) {
  const knobEl = document.getElementById('mobileJoystickKnob');
  const ringEl = document.getElementById('mobileJoystickRing');

  function setKnobVisualOffset(dx, dy) {
    if (knobEl) {
      knobEl.style.transform = `translate(${Math.round(dx)}px, ${Math.round(dy)}px)`;
    }
  }

  function clearTouchMove() {
    touchMoveState.forward = 0;
    touchMoveState.right = 0;
    touchMoveState.active = false;
    setKnobVisualOffset(0, 0);
    document.querySelectorAll('.joy-dir-btn.is-pressed, #btnMobileMoveForward.is-pressed').forEach((el) => {
      el.classList.remove('is-pressed');
    });
  }

  function nudge(moveF, moveR) {
    stepNudgeInCameraDirection({
      camera,
      cameraControl,
      getExplorersSys,
      activateFollowCameraFromCurrentView,
      setClickMoveTarget,
      forwardSign: moveF,
      rightSign: moveR,
      distMeters: 6.5
    });
  }

  function bindDirectionalHoldButton(btn, moveF, moveR) {
    if (!btn) return;
    let pressStartTime = 0;

    const startHold = (e) => {
      e.preventDefault();
      e.stopPropagation();
      pressStartTime = performance.now();
      touchMoveState.forward = moveF;
      touchMoveState.right = moveR;
      touchMoveState.active = true;
      setClickMoveTarget(null);
      activateFollowCameraFromCurrentView();
      btn.classList.add('is-pressed');
      setKnobVisualOffset(moveR * 18, -moveF * 18);
    };

    const endHold = (e) => {
      if (!btn.classList.contains('is-pressed')) return;
      e.preventDefault();
      e.stopPropagation();
      const heldMs = performance.now() - pressStartTime;
      clearTouchMove();
      // If user tapped briefly (< 240ms), set a smooth forward/directional walk waypoint so single taps also move!
      if (heldMs < 240) {
        nudge(moveF, moveR);
      }
    };

    btn.addEventListener('pointerdown', startHold);
    btn.addEventListener('pointerup', endHold);
    btn.addEventListener('pointercancel', clearTouchMove);
    btn.addEventListener('pointerleave', clearTouchMove);
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!touchMoveState.active) {
        nudge(moveF, moveR);
      }
    });
  }

  bindDirectionalHoldButton(document.getElementById('btnJoyUp'), 1, 0);
  bindDirectionalHoldButton(document.getElementById('btnJoyDown'), -1, 0);
  bindDirectionalHoldButton(document.getElementById('btnJoyLeft'), 0, -1);
  bindDirectionalHoldButton(document.getElementById('btnJoyRight'), 0, 1);
  bindDirectionalHoldButton(document.getElementById('btnMobileMoveForward'), 1, 0);

  if (ringEl) {
    let ringDragging = false;
    const maxRadius = 34;

    const updateFromRingPointer = (clientX, clientY) => {
      const rect = ringEl.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      let dx = clientX - cx;
      let dy = clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > maxRadius) {
        dx = (dx / dist) * maxRadius;
        dy = (dy / dist) * maxRadius;
      }
      setKnobVisualOffset(dx, dy);
      if (dist > 6) {
        touchMoveState.right = dx / maxRadius;
        touchMoveState.forward = -dy / maxRadius;
        touchMoveState.active = true;
        setClickMoveTarget(null);
        activateFollowCameraFromCurrentView();
      } else {
        touchMoveState.forward = 0;
        touchMoveState.right = 0;
      }
    };

    ringEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.joy-dir-btn')) return;
      e.preventDefault();
      e.stopPropagation();
      ringDragging = true;
      ringEl.setPointerCapture?.(e.pointerId);
      updateFromRingPointer(e.clientX, e.clientY);
    });

    ringEl.addEventListener('pointermove', (e) => {
      if (!ringDragging) return;
      e.preventDefault();
      e.stopPropagation();
      updateFromRingPointer(e.clientX, e.clientY);
    });

    const stopRingDrag = (e) => {
      if (!ringDragging) return;
      ringDragging = false;
      ringEl.releasePointerCapture?.(e.pointerId);
      clearTouchMove();
    };
    ringEl.addEventListener('pointerup', stopRingDrag);
    ringEl.addEventListener('pointercancel', stopRingDrag);
  }

  const jumpCollectBtn = document.getElementById('btnMobileJumpCollect');
  jumpCollectBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    triggerPlayerJump(appState.isGameOver);
    collectNearestRelicForPlayer();
  });

  const colHeader = document.querySelector('#hudCollectionCard .collection-hud-header');
  colHeader?.addEventListener('click', (e) => {
    if (!appState.isMobileLandscape) return;
    if (e.target.closest('button')) return;
    setScreenState('encyclopedia');
  });
}
