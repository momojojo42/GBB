// ============================================================================
// Gardens by the Bay — Dynamic Third-Person Follow & Preset Orbit Camera
// (src/camera/CameraController.js)
// ============================================================================

import * as THREE from 'three';
import {
  DEFAULT_LOOKDEV_SETTINGS,
  CAMERA_ANGLE_PRESETS
} from '../core/AdminAuthGuard.js';

export const PRESET_ALIAS_MAP = {
  angle_01_overview: 'overview_peninsula',
  angle_02_supertree: 'chase_supertree',
  angle_03_conservatories: 'chase_conservatories',
  angle_04_dragonfly: 'chase_dragonfly',
  angle_05_meadow_baby: 'chase_meadow_planet',
  angle_06_wetlands: 'chase_wetlands_serene',
  angle_07_night_rhapsody: 'night_rhapsody',
  angle_08_race_action: 'race_4player_action',
  player_follow: 'live_player_chase'
};

export function findCameraPreset(presetId) {
  const mappedId = PRESET_ALIAS_MAP[presetId] || presetId;
  if (Array.isArray(CAMERA_ANGLE_PRESETS)) {
    return CAMERA_ANGLE_PRESETS.find((p) => p.id === mappedId || p.id === presetId);
  }
  return CAMERA_ANGLE_PRESETS[mappedId] || CAMERA_ANGLE_PRESETS[presetId];
}

export function createCameraController({
  camera,
  canvas,
  appState,
  getExplorersSys,
  onGroundClickMove,
  onApplyLookDevSettings,
  getLookDevPanel
}) {
  const cameraControl = {
    mode: 'follow', // 'preset' | 'orbit' | 'follow'
    currentPos: new THREE.Vector3(0, 8.2, 16.5),
    currentTarget: new THREE.Vector3(0, 1.4, 2.0),
    desiredPos: new THREE.Vector3(0, 8.2, 16.5),
    desiredTarget: new THREE.Vector3(0, 1.4, 2.0),
    followYaw: 0, // horizontal orbit angle around avatar in radians (0 = camera south looking north)
    followPitch: 0.42, // vertical elevation angle in radians (~24 deg)
    followDistance: DEFAULT_LOOKDEV_SETTINGS.camera?.chaseCamDistance ?? 9.2,
    followLookAheadOffset: new THREE.Vector3(0, 0, 0),
    userOrbitingFollowTimer: 0,
    isDragging: false,
    dragButton: 0,
    lastPointerX: 0,
    lastPointerY: 0,
    spherical: new THREE.Spherical(135, THREE.MathUtils.degToRad(52), 0)
  };

  const raycaster = new THREE.Raycaster();
  const pointerNDC = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const tempOffset = new THREE.Vector3();
  const hitPoint = new THREE.Vector3();

  function syncSphericalFromVectors() {
    tempOffset.copy(cameraControl.desiredPos).sub(cameraControl.desiredTarget);
    cameraControl.spherical.setFromVector3(tempOffset);
  }
  syncSphericalFromVectors();

  function activateFollowCameraFromCurrentView() {
    if (cameraControl.mode === 'follow') return;
    const explorersSys = getExplorersSys();
    const you = explorersSys?.getStandings?.().find((s) => s.id === 'you');
    if (you) {
      const dx = camera.position.x - you.position.x;
      const dz = camera.position.z - you.position.z;
      if (Math.hypot(dx, dz) > 0.5) {
        cameraControl.followYaw = Math.atan2(dx, dz);
      }
    }
    cameraControl.mode = 'follow';
    appState.cameraPresetId = 'player_follow';
    document.querySelectorAll('#quickbarAngleButtons .angle-chip').forEach((btn) => {
      const isFollow =
        btn.dataset.preset === 'player_follow' ||
        btn.dataset.preset === 'live_player_chase';
      btn.classList.toggle('active', isFollow);
    });
  }

  function setCameraPreset(presetId, immediate = false) {
    appState.cameraPresetId = presetId;
    const explorersSys = getExplorersSys();

    document.querySelectorAll('#quickbarAngleButtons .angle-chip').forEach((btn) => {
      const isMatch =
        btn.dataset.preset === presetId ||
        PRESET_ALIAS_MAP[btn.dataset.preset] === presetId;
      btn.classList.toggle('active', isMatch);
    });

    if (presetId === 'player_follow' || presetId === 'live_player_chase') {
      cameraControl.mode = 'follow';
      const camCfg = appState.lookDev.camera || appState.lookDev;
      cameraControl.followDistance = camCfg.chaseCamDistance ?? 9.2;
      if (immediate && explorersSys) {
        const you = explorersSys.getStandings().find((s) => s.id === 'you');
        if (you) {
          const horizDist = cameraControl.followDistance * Math.cos(cameraControl.followPitch);
          const vertHeight = (camCfg.chaseCamHeight ?? 4.2) * (Math.sin(cameraControl.followPitch) / Math.sin(0.42));
          cameraControl.desiredTarget.set(you.position.x, (you.position.y || 0) + 0.82, you.position.z);
          cameraControl.desiredPos.set(
            you.position.x + Math.sin(cameraControl.followYaw) * horizDist,
            (you.position.y || 0) + Math.max(1.8, vertHeight),
            you.position.z + Math.cos(cameraControl.followYaw) * horizDist
          );
          cameraControl.currentPos.copy(cameraControl.desiredPos);
          cameraControl.currentTarget.copy(cameraControl.desiredTarget);
          camera.position.copy(cameraControl.currentPos);
          camera.lookAt(cameraControl.currentTarget);
        }
      }
      return;
    }

    const preset = findCameraPreset(presetId);
    if (!preset) return;

    cameraControl.mode = 'preset';
    if (Array.isArray(preset.playerPos) && explorersSys?.teleportPlayer) {
      explorersSys.teleportPlayer(preset.playerPos[0], preset.playerPos[1]);
    }
    if (preset.pos && preset.target) {
      cameraControl.desiredPos.set(preset.pos[0], preset.pos[1], preset.pos[2]);
      cameraControl.desiredTarget.set(preset.target[0], preset.target[1], preset.target[2]);
      syncSphericalFromVectors();
      if (immediate) {
        cameraControl.currentPos.copy(cameraControl.desiredPos);
        cameraControl.currentTarget.copy(cameraControl.desiredTarget);
        camera.position.copy(cameraControl.currentPos);
        camera.lookAt(cameraControl.currentTarget);
      }
    }

    // If Night Rhapsody camera angle is chosen, switch lighting preset to night automatically
    const isNightPreset = presetId === 'angle_07_night_rhapsody' || preset.id === 'night_rhapsody';
    const currentLightPreset = appState.lookDev.lighting?.preset || appState.lookDev.preset || 'morning';
    const lookDevPanel = getLookDevPanel?.();
    if (isNightPreset && currentLightPreset !== 'night') {
      onApplyLookDevSettings?.({
        lighting: {
          ...appState.lookDev.lighting,
          preset: 'night',
          sunIntensity: 0.48,
          sunElevationDeg: 10,
          sunColor: '#6366F1',
          ambientIntensity: 0.58,
          exposure: 1.18,
          nightBioluminescenceGlow: 1.85,
          bloomStrength: 0.62
        }
      });
      if (lookDevPanel) lookDevPanel.setSettings(appState.lookDev);
    } else if (!isNightPreset && currentLightPreset === 'night') {
      onApplyLookDevSettings?.({
        lighting: { ...DEFAULT_LOOKDEV_SETTINGS.lighting }
      });
      if (lookDevPanel) lookDevPanel.setSettings(appState.lookDev);
    }
  }

  function updateCamera(dt, you, clickMoveTarget) {
    if (cameraControl.userOrbitingFollowTimer > 0) {
      cameraControl.userOrbitingFollowTimer = Math.max(0, cameraControl.userOrbitingFollowTimer - dt);
    }

    if (cameraControl.mode === 'follow' && you) {
      const camCfg = appState.lookDev.camera || appState.lookDev;
      const baseDist = cameraControl.followDistance || camCfg.chaseCamDistance || 9.2;
      const baseHeight = camCfg.chaseCamHeight ?? 4.2;
      const lookAheadMag = camCfg.chaseCamLookAhead ?? 2.4;

      // Smoothly look slightly ahead in the direction the avatar is moving
      const desiredAheadX = you.isMoving ? Math.sin(you.facingYaw || 0) * lookAheadMag * 0.65 : 0;
      const desiredAheadZ = you.isMoving ? Math.cos(you.facingYaw || 0) * lookAheadMag * 0.65 : 0;
      cameraControl.followLookAheadOffset.x = THREE.MathUtils.lerp(
        cameraControl.followLookAheadOffset.x,
        desiredAheadX,
        Math.min(1, dt * 5.5)
      );
      cameraControl.followLookAheadOffset.z = THREE.MathUtils.lerp(
        cameraControl.followLookAheadOffset.z,
        desiredAheadZ,
        Math.min(1, dt * 5.5)
      );

      // Gently align camera behind avatar when moving via click-to-move (unless user is dragging)
      if (clickMoveTarget && you.isMoving && !cameraControl.isDragging && cameraControl.userOrbitingFollowTimer <= 0) {
        const targetCamYaw = (you.facingYaw || 0) + Math.PI;
        let diff = ((targetCamYaw - cameraControl.followYaw + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (diff < -Math.PI) diff += Math.PI * 2;
        cameraControl.followYaw += diff * Math.min(1, dt * 2.2);
      }

      const horizDist = baseDist * Math.cos(cameraControl.followPitch);
      const pitchFactor = Math.sin(cameraControl.followPitch) / Math.max(0.15, Math.sin(0.42));
      const vertHeight = Math.max(1.8, baseHeight * pitchFactor);

      // When End-Game celebration modal is open on the right, shift camera target slightly right
      // so the 4 celebrating explorers sit cleanly in the left ~58% of the viewport
      const rightShiftMag = appState.isGameOver ? 1.85 : 0;
      const rightX = Math.cos(cameraControl.followYaw) * rightShiftMag;
      const rightZ = -Math.sin(cameraControl.followYaw) * rightShiftMag;

      cameraControl.desiredTarget.set(
        you.position.x + cameraControl.followLookAheadOffset.x + rightX,
        (you.position.y || 0) + 0.82,
        you.position.z + cameraControl.followLookAheadOffset.z + rightZ
      );
      cameraControl.desiredPos.set(
        you.position.x + Math.sin(cameraControl.followYaw) * horizDist + rightX * 0.55,
        (you.position.y || 0) + vertHeight,
        you.position.z + Math.cos(cameraControl.followYaw) * horizDist + rightZ * 0.55
      );
    }

    const dampRate = cameraControl.mode === 'follow' ? 8.5 : 6.0;
    cameraControl.currentPos.lerp(cameraControl.desiredPos, Math.min(1, dt * dampRate));
    cameraControl.currentTarget.lerp(cameraControl.desiredTarget, Math.min(1, dt * (dampRate + 2.0)));
    camera.position.copy(cameraControl.currentPos);
    camera.lookAt(cameraControl.currentTarget);
  }

  // Pointer, Touch Pinch & Wheel Input Listeners
  let pointerDownPos = { x: 0, y: 0 };
  let isPinching = false;
  let lastPinchDist = 0;

  canvas.addEventListener('pointerdown', (e) => {
    if (isPinching) return;
    cameraControl.isDragging = true;
    cameraControl.dragButton = e.button;
    cameraControl.lastPointerX = e.clientX;
    cameraControl.lastPointerY = e.clientY;
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointermove', (e) => {
    if (!cameraControl.isDragging || isPinching) return;
    const dx = e.clientX - cameraControl.lastPointerX;
    const dy = e.clientY - cameraControl.lastPointerY;
    cameraControl.lastPointerX = e.clientX;
    cameraControl.lastPointerY = e.clientY;

    if (Math.abs(dx) + Math.abs(dy) > 2) {
      if (cameraControl.mode === 'follow') {
        cameraControl.followYaw -= dx * 0.0065;
        cameraControl.followPitch = THREE.MathUtils.clamp(
          cameraControl.followPitch + dy * 0.0045,
          THREE.MathUtils.degToRad(12),
          THREE.MathUtils.degToRad(68)
        );
        cameraControl.userOrbitingFollowTimer = 2.5;
      } else {
        cameraControl.mode = 'orbit';
        cameraControl.spherical.theta -= dx * 0.0055;
        cameraControl.spherical.phi = THREE.MathUtils.clamp(
          cameraControl.spherical.phi - dy * 0.0045,
          THREE.MathUtils.degToRad(16),
          THREE.MathUtils.degToRad(78)
        );
        tempOffset.setFromSpherical(cameraControl.spherical);
        cameraControl.desiredPos.copy(cameraControl.desiredTarget).add(tempOffset);
      }
    }
  });

  window.addEventListener('pointerup', (e) => {
    if (isPinching) {
      cameraControl.isDragging = false;
      return;
    }
    if (!cameraControl.isDragging) return;
    cameraControl.isDragging = false;

    const tapThreshold = e.pointerType === 'touch' ? 14 : 6;
    const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (distMoved < tapThreshold && e.target === canvas) {
      pointerNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
        hitPoint.x = THREE.MathUtils.clamp(hitPoint.x, -74, 72);
        hitPoint.z = THREE.MathUtils.clamp(hitPoint.z, -52, 52);
        onGroundClickMove?.(hitPoint.clone());
        activateFollowCameraFromCurrentView();
      }
    }
  });

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching = true;
      cameraControl.isDragging = false;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      lastPinchDist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
    }
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinching = true;
      cameraControl.isDragging = false;
      const t0 = e.touches[0];
      const t1 = e.touches[1];
      const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
      if (lastPinchDist > 0) {
        const delta = lastPinchDist - dist;
        if (cameraControl.mode === 'follow') {
          cameraControl.followDistance = THREE.MathUtils.clamp(
            cameraControl.followDistance + delta * 0.04,
            5.5,
            36
          );
          if (appState.lookDev?.camera) {
            appState.lookDev.camera.chaseCamDistance = cameraControl.followDistance;
          }
        } else {
          cameraControl.spherical.radius = THREE.MathUtils.clamp(
            cameraControl.spherical.radius + delta * 0.12,
            18,
            210
          );
          tempOffset.setFromSpherical(cameraControl.spherical);
          cameraControl.desiredPos.copy(cameraControl.desiredTarget).add(tempOffset);
        }
      }
      lastPinchDist = dist;
    }
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      lastPinchDist = 0;
      if (e.touches.length === 0) {
        isPinching = false;
      }
    }
  }, { passive: false });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (cameraControl.mode === 'follow') {
      cameraControl.followDistance = THREE.MathUtils.clamp(
        cameraControl.followDistance + e.deltaY * 0.025,
        5.5,
        36
      );
      if (appState.lookDev.camera) {
        appState.lookDev.camera.chaseCamDistance = cameraControl.followDistance;
      }
    } else {
      cameraControl.spherical.radius = THREE.MathUtils.clamp(
        cameraControl.spherical.radius + e.deltaY * 0.06,
        18,
        210
      );
      tempOffset.setFromSpherical(cameraControl.spherical);
      cameraControl.desiredPos.copy(cameraControl.desiredTarget).add(tempOffset);
    }
  }, { passive: false });

  return {
    cameraControl,
    syncSphericalFromVectors,
    activateFollowCameraFromCurrentView,
    setCameraPreset,
    updateCamera
  };
}
