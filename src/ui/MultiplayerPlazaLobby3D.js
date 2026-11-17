// ============================================================================
// Gardens by the Bay — 3D Supertree Grove Party Waiting Lobby & Starting Rings
// (src/ui/MultiplayerPlazaLobby3D.js)
// Builds the 4 color-coded glowing platform rings & beacons at Supertree Grove
// Plaza for Step 2 (3D Party Waiting Lobby) and Step 3 (3-2-1 Boost Countdown).
// ============================================================================

import * as THREE from 'three';

export const LOBBY_PLATFORM_SLOTS = [
  { slotIndex: 0, id: 'you', x: -2.4, z: 2.5, colorHex: '#38BDF8', ringColor: 0x38bdf8 },
  { slotIndex: 1, id: 'mei', x: -0.8, z: 2.5, colorHex: '#34D399', ringColor: 0x34d399 },
  { slotIndex: 2, id: 'raj', x: 0.8, z: 2.5, colorHex: '#FBBF24', ringColor: 0xfbbf24 },
  { slotIndex: 3, id: 'kai', x: 2.4, z: 2.5, colorHex: '#FB7185', ringColor: 0xfb7185 }
];

export function createMultiplayerPlazaLobby3D({ scene, appState, getTerrainSys }) {
  const group = new THREE.Group();
  group.name = 'MultiplayerPlazaLobby3DGroup';
  group.visible = false;
  scene.add(group);

  const ringPlatforms = [];

  const outerRingGeo = new THREE.RingGeometry(0.56, 0.72, 36);
  outerRingGeo.rotateX(-Math.PI / 2);

  const innerDiscGeo = new THREE.CircleGeometry(0.54, 32);
  innerDiscGeo.rotateX(-Math.PI / 2);

  const haloCylinderGeo = new THREE.CylinderGeometry(0.64, 0.68, 1.35, 24, 1, true);

  for (const spec of LOBBY_PLATFORM_SLOTS) {
    const slotGroup = new THREE.Group();
    slotGroup.position.set(spec.x, 0.05, spec.z);

    const outerMat = new THREE.MeshBasicMaterial({
      color: spec.ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92
    });
    const outerMesh = new THREE.Mesh(outerRingGeo, outerMat);
    outerMesh.position.y = 0.03;
    slotGroup.add(outerMesh);

    const innerMat = new THREE.MeshBasicMaterial({
      color: spec.ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.24
    });
    const innerMesh = new THREE.Mesh(innerDiscGeo, innerMat);
    innerMesh.position.y = 0.02;
    slotGroup.add(innerMesh);

    const haloMat = new THREE.MeshBasicMaterial({
      color: spec.ringColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      depthWrite: false
    });
    const haloMesh = new THREE.Mesh(haloCylinderGeo, haloMat);
    haloMesh.position.y = 0.68;
    slotGroup.add(haloMesh);

    group.add(slotGroup);
    ringPlatforms.push({
      spec,
      slotGroup,
      outerMesh,
      outerMat,
      innerMesh,
      innerMat,
      haloMesh,
      haloMat
    });
  }

  // Starting line holographic gate bar across all 4 slots
  const startLineGeo = new THREE.PlaneGeometry(6.8, 0.16);
  startLineGeo.rotateX(-Math.PI / 2);
  const startLineMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide
  });
  const startLineMesh = new THREE.Mesh(startLineGeo, startLineMat);
  startLineMesh.position.set(0, 0.04, 1.65);
  group.add(startLineMesh);

  let goFlashRemainSec = 0;

  function triggerCountdownBoostPulse() {
    goFlashRemainSec = 2.4;
  }

  function update(dt, elapsed) {
    const isGameplay = appState.screen === 'gameplay';
    const isMpActive = Boolean(appState.isMultiplayerRoom && isGameplay);
    const phase = appState.multiplayerPhase || 'idle';
    const showRings =
      isGameplay &&
      ((isMpActive && (phase === 'lobby' || phase === 'countdown')) ||
        Boolean(appState.isStartingCountdownActive) ||
        goFlashRemainSec > 0);

    if (group.visible !== showRings) {
      group.visible = showRings;
    }
    if (!showRings) return;

    if (goFlashRemainSec > 0) {
      goFlashRemainSec = Math.max(0, goFlashRemainSec - dt);
    }

    const terrainSys = getTerrainSys?.();
    const sampleH = terrainSys?.sampleGroundHeight;
    const isCountdown =
      phase === 'countdown' || Boolean(appState.isStartingCountdownActive) || goFlashRemainSec > 0;
    const pulseSpeed = isCountdown ? 9.5 : 3.2;
    const wave = 0.5 + 0.5 * Math.sin(elapsed * pulseSpeed);

    for (let i = 0; i < ringPlatforms.length; i++) {
      const rp = ringPlatforms[i];
      const groundY = sampleH ? sampleH(rp.spec.x, rp.spec.z) : 0.04;
      rp.slotGroup.position.y = groundY + 0.02;

      const scale = isCountdown ? 1.0 + wave * 0.14 : 1.0 + wave * 0.05;
      rp.outerMesh.scale.set(scale, 1, scale);
      rp.outerMat.color.setHex(isCountdown ? 0xfacc15 : rp.spec.ringColor);
      rp.outerMat.opacity = isCountdown ? 0.96 : 0.85;
      rp.innerMat.opacity = isCountdown ? 0.38 + wave * 0.2 : 0.2 + wave * 0.1;
      rp.haloMat.color.setHex(isCountdown ? 0x34d399 : rp.spec.ringColor);
      rp.haloMat.opacity = isCountdown ? 0.26 + wave * 0.18 : 0.12 + wave * 0.08;
      rp.haloMesh.scale.set(1, isCountdown ? 1.25 : 0.9, 1);
    }

    const centerGroundY = sampleH ? sampleH(0, 1.65) : 0.04;
    startLineMesh.position.y = centerGroundY + 0.03;
    startLineMat.opacity = isCountdown ? 0.95 : 0.55 + wave * 0.25;
  }

  return {
    group,
    triggerCountdownBoostPulse,
    update
  };
}
