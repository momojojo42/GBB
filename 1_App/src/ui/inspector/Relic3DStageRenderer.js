// ============================================================================
// Gardens by the Bay — Relic 3D Turntable Stage Renderer & Mesh Loader
// (src/ui/Relic3DStageRenderer.js)
// ============================================================================

import * as THREE from 'three';

export function buildRelicThreeStage(canvas, zoomDist = 3.35) {
  const inspectorRenderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true
  });
  inspectorRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  inspectorRenderer.outputColorSpace = THREE.SRGBColorSpace;
  inspectorRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  inspectorRenderer.toneMappingExposure = 1.18;

  const inspectorScene = new THREE.Scene();

  const inspectorCamera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 50);
  inspectorCamera.position.set(0, 0.85, zoomDist);
  inspectorCamera.lookAt(0, 0.15, 0);

  const hemi = new THREE.HemisphereLight('#FFFFFF', '#0D9488', 1.35);
  hemi.position.set(0, 10, 0);
  inspectorScene.add(hemi);

  const keyLight = new THREE.DirectionalLight('#FFFBEB', 2.25);
  keyLight.position.set(3.5, 5.2, 4.2);
  inspectorScene.add(keyLight);

  const fillLight = new THREE.DirectionalLight('#A7F3D0', 1.15);
  fillLight.position.set(-4.0, 2.5, 2.8);
  inspectorScene.add(fillLight);

  const rimLight = new THREE.DirectionalLight('#FDE047', 1.45);
  rimLight.position.set(0.5, 3.8, -4.5);
  inspectorScene.add(rimLight);

  const turntableGroup = new THREE.Group();
  inspectorScene.add(turntableGroup);

  const baseDiscGeo = new THREE.CylinderGeometry(1.08, 1.18, 0.12, 48);
  const baseDiscMat = new THREE.MeshStandardMaterial({
    color: '#E6FBF6',
    roughness: 0.22,
    metalness: 0.15
  });
  const baseDisc = new THREE.Mesh(baseDiscGeo, baseDiscMat);
  baseDisc.position.y = -0.68;
  turntableGroup.add(baseDisc);

  const goldRimGeo = new THREE.TorusGeometry(1.12, 0.032, 16, 64);
  goldRimGeo.rotateX(Math.PI / 2);
  const goldRimMat = new THREE.MeshStandardMaterial({
    color: '#F59E0B',
    emissive: '#FACC15',
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.75
  });
  const outerRingMesh = new THREE.Mesh(goldRimGeo, goldRimMat);
  outerRingMesh.position.y = -0.62;
  turntableGroup.add(outerRingMesh);

  const aquaRingGeo = new THREE.RingGeometry(0.76, 0.92, 48);
  aquaRingGeo.rotateX(-Math.PI / 2);
  const aquaRingMat = new THREE.MeshBasicMaterial({
    color: '#14B8A6',
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.45
  });
  const innerRingMesh = new THREE.Mesh(aquaRingGeo, aquaRingMat);
  innerRingMesh.position.y = -0.61;
  turntableGroup.add(innerRingMesh);

  const relicMeshHolder = new THREE.Group();
  relicMeshHolder.position.y = 0.04;
  turntableGroup.add(relicMeshHolder);

  const toyParticlesGroup = new THREE.Group();
  turntableGroup.add(toyParticlesGroup);

  return {
    inspectorRenderer,
    inspectorScene,
    inspectorCamera,
    turntableGroup,
    relicMeshHolder,
    outerRingMesh,
    innerRingMesh,
    toyParticlesGroup
  };
}

export function attachNormalizedRelicToHolder(relic, relicMeshHolder, glbRegistry) {
  while (relicMeshHolder.children.length > 0) {
    relicMeshHolder.remove(relicMeshHolder.children[0]);
  }

  let cloned = glbRegistry && relic?.glbModel
    ? glbRegistry.cloneAsset(relic.glbModel, false)
    : null;

  if (!cloned && relic?.relicHolder && relic.relicHolder.children.length > 0) {
    cloned = relic.relicHolder.clone(true);
    cloned.position.set(0, 0, 0);
    cloned.rotation.set(0, 0, 0);
    cloned.scale.setScalar(1);
  }

  const fallbackImg = document.getElementById('relic3DFallbackImg');

  if (cloned) {
    if (fallbackImg) fallbackImg.classList.add('hidden');

    cloned.rotation.set(0, 0, 0);
    cloned.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(cloned);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    const maxDim = Math.max(size.x, size.y, size.z, 0.35);
    const targetScale = 1.24 / maxDim;

    // Seat the bottom of the gold souvenir plinth cleanly onto the turntable surface (y = -0.60)
    const wrapper = new THREE.Group();
    cloned.position.set(
      0,
      -box.min.y * targetScale - 0.62,
      0
    );
    cloned.scale.setScalar(targetScale);

    cloned.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    wrapper.add(cloned);
    relicMeshHolder.add(wrapper);
  } else if (fallbackImg && relic?.image) {
    fallbackImg.src = relic.image;
    fallbackImg.alt = relic.shortName || relic.name;
    fallbackImg.classList.remove('hidden');
  }
}
