// ============================================================================
// Gardens by the Bay — Supertrees, OCBC Skyway & Blender Landmarks Builder
// Extracted from src/world/LandmarksBuilder.js
// ============================================================================

export function buildSupertreesSkywayAndDomes({
  THREE,
  glbRegistry,
  matLib,
  landmarksGroup,
  domePhysicalGlassMat,
  supertreeCanopyMaterials,
  supertreeEmissiveMaterials,
  animatedWaterfalls
}) {
  // --------------------------------------------------------------------------
  // 1. ZONE 1: 18 Supertrees (Cloned from Blender `Supertree_Hero` & `Supertree_Medium`)
  // --------------------------------------------------------------------------
  const supertreeSpecs = [
    // 3 Central Giants in Supertree Grove
    { x: -5.5, z: -3.5, h: 16.0, hero: true },
    { x: 6.5, z: -2.0, h: 15.6, hero: true },
    { x: 0.5, z: 6.5, h: 15.2, hero: true },
    // 9 Surrounding Central Grove Supertrees
    { x: -12.5, z: -9.5, h: 12.2, hero: false },
    { x: -2.0, z: -12.5, h: 12.6, hero: false },
    { x: 11.5, z: -9.0, h: 12.4, hero: false },
    { x: 14.5, z: 1.5, h: 11.4, hero: false },
    { x: 11.0, z: 11.5, h: 12.0, hero: false },
    { x: 0.0, z: 15.0, h: 11.2, hero: false },
    { x: -10.5, z: 11.0, h: 11.6, hero: false },
    { x: -15.0, z: 1.5, h: 10.8, hero: false },
    { x: 4.5, z: -15.5, h: 10.6, hero: false },
    // 3 Silver Garden Supertrees (#25 North, between Supertree Grove and Flower Dome)
    { x: -4.2, z: -29.5, h: 11.0, hero: false },
    { x: 0.5, z: -28.0, h: 10.2, hero: false },
    { x: -1.8, z: -23.0, h: 9.8, hero: false },
    // 3 Golden Garden Supertrees (#1 East, right above Main Entrance Drop Off)
    { x: 28.0, z: -5.8, h: 11.2, hero: false },
    { x: 32.5, z: -4.0, h: 10.2, hero: false },
    { x: 30.2, z: -0.5, h: 10.4, hero: false }
  ];

  supertreeSpecs.forEach((st, idx) => {
    const modelName = st.hero ? 'Supertree_Hero' : 'Supertree_Medium';
    const refHeight = st.hero ? 16.0 : 12.0;
    const scale = st.h / refHeight;

    const stHolder = new THREE.Group();
    stHolder.position.set(st.x, 0, st.z);

    const shadow = matLib.createContactShadowDisc(4.4 * scale, 4.4 * scale, 0.07);
    stHolder.add(shadow);

    let stModel = glbRegistry ? glbRegistry.cloneAsset(modelName, false) : null;
    if (!stModel && glbRegistry) {
      stModel = glbRegistry.cloneAsset('Supertree_Hero', false);
    }

    if (stModel) {
      stModel.scale.setScalar(scale);
      stModel.rotation.y = (idx * 0.85) % (Math.PI * 2);
      const treeEmissiveMap = new Map();
      const treeCanopyMap = new Map();
      stModel.traverse((node) => {
        if (node.isMesh && node.material) {
          const mName = (node.material.name || node.name || '').toLowerCase();
          if (mName.includes('glow') || mName.includes('led') || mName.includes('emiss')) {
            if (!treeEmissiveMap.has(node.material)) {
              const clonedMat = node.material.clone();
              treeEmissiveMap.set(node.material, clonedMat);
              supertreeEmissiveMaterials.push(clonedMat);
            }
            node.material = treeEmissiveMap.get(node.material);
          } else if (mName.includes('steel') || mName.includes('diagrid') || mName.includes('canopy') || mName.includes('rib')) {
            if (!treeCanopyMap.has(node.material)) {
              const clonedMat = node.material.clone();
              treeCanopyMap.set(node.material, clonedMat);
              supertreeCanopyMaterials.push(clonedMat);
            }
            node.material = treeCanopyMap.get(node.material);
          }
        }
      });
      stHolder.add(stModel);
    }

    landmarksGroup.add(stHolder);
  });

  // --------------------------------------------------------------------------
  // OCBC Skyway (Suspended Cabled Aerial Walkway at y = 8.4m)
  // --------------------------------------------------------------------------
  const skywayGroup = new THREE.Group();
  skywayGroup.name = 'OCBC_Skyway_Group';
  const skywayCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-12.5, 8.4, -9.5),
    new THREE.Vector3(-5.5, 8.4, -3.5),
    new THREE.Vector3(0.5, 8.4, 6.5),
    new THREE.Vector3(6.5, 8.4, -2.0),
    new THREE.Vector3(11.5, 8.4, -9.0),
    new THREE.Vector3(-2.0, 8.4, -12.5),
    new THREE.Vector3(-12.5, 8.4, -9.5)
  ], true);

  const deckGeo = new THREE.TubeGeometry(skywayCurve, 110, 0.58, 8, true);
  deckGeo.scale(1, 0.2, 1);
  const deckMat = new THREE.MeshStandardMaterial({
    color: 0xD97706,
    roughness: 0.45,
    metalness: 0.25
  });
  const deckMesh = new THREE.Mesh(deckGeo, deckMat);
  deckMesh.position.y = 8.4 * 0.8;
  deckMesh.castShadow = true;
  skywayGroup.add(deckMesh);

  const leftRailPts = [];
  const rightRailPts = [];
  const railSamples = 64;
  for (let i = 0; i < railSamples; i++) {
    const t = i / railSamples;
    const pt = skywayCurve.getPointAt(t);
    const tan = skywayCurve.getTangentAt(t);
    const len = Math.hypot(tan.x, tan.z) || 1;
    const nx = -tan.z / len;
    const nz = tan.x / len;
    leftRailPts.push(new THREE.Vector3(pt.x + nx * 0.60, 8.95, pt.z + nz * 0.60));
    rightRailPts.push(new THREE.Vector3(pt.x - nx * 0.60, 8.95, pt.z - nz * 0.60));
  }
  const leftRailCurve = new THREE.CatmullRomCurve3(leftRailPts, true);
  const rightRailCurve = new THREE.CatmullRomCurve3(rightRailPts, true);
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xFDE047,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.75,
    roughness: 0.25,
    metalness: 0.6
  });
  supertreeEmissiveMaterials.push(railMat);
  const leftRailMesh = new THREE.Mesh(new THREE.TubeGeometry(leftRailCurve, 110, 0.045, 8, true), railMat);
  const rightRailMesh = new THREE.Mesh(new THREE.TubeGeometry(rightRailCurve, 110, 0.045, 8, true), railMat);
  skywayGroup.add(leftRailMesh, rightRailMesh);

  const postMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.8, roughness: 0.2 });
  const postGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.58, 6);
  for (let i = 0; i < 44; i++) {
    const t = i / 44;
    const pt = skywayCurve.getPointAt(t);
    const tan = skywayCurve.getTangentAt(t);
    const len = Math.hypot(tan.x, tan.z) || 1;
    const nx = -tan.z / len;
    const nz = tan.x / len;
    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(pt.x + nx * 0.60 * side, 8.68, pt.z + nz * 0.60 * side);
      skywayGroup.add(post);
    }
  }
  landmarksGroup.add(skywayGroup);

  // --------------------------------------------------------------------------
  // Helper to place a Blender .glb Landmark with Ground Contact Shadow
  // --------------------------------------------------------------------------
  function placeBlenderLandmark({
    assetName,
    x,
    z,
    y = 0,
    rotY = 0,
    scale = 1.0,
    shadowRx = 5.0,
    shadowRz = 5.0,
    onLoaded
  }) {
    const holder = new THREE.Group();
    holder.name = `Landmark_${assetName}`;
    holder.position.set(x, y, z);
    holder.rotation.y = rotY;

    if (shadowRx > 0) {
      const shadow = matLib.createContactShadowDisc(shadowRx, shadowRz, 0.065);
      holder.add(shadow);
    }

    const cloned = glbRegistry ? glbRegistry.cloneAsset(assetName, false) : null;
    if (cloned) {
      cloned.scale.setScalar(scale);
      if (typeof onLoaded === 'function') {
        onLoaded(cloned);
      }
      holder.add(cloned);
    }
    landmarksGroup.add(holder);
    return holder;
  }

  // Zones 1–5 Blender Landmarks
  placeBlenderLandmark({ assetName: 'Understorey_Timber_Dome', x: 16.5, z: 14.5, scale: 1.0, shadowRx: 4.5, shadowRz: 4.5 });

  placeBlenderLandmark({
    assetName: 'Flower_Dome_Conservatory',
    x: 14,
    z: -36,
    rotY: -0.35,
    scale: 1.05,
    shadowRx: 15.5,
    shadowRz: 11.5,
    onLoaded: (model) => {
      model.traverse((node) => {
        if (node.isMesh) {
          const n = (node.name || '').toLowerCase();
          const m = (node.material?.name || '').toLowerCase();
          if (n.includes('glass') || m.includes('glass')) {
            node.material = domePhysicalGlassMat;
          }
        }
      });
    }
  });

  placeBlenderLandmark({
    assetName: 'Cloud_Forest_Conservatory',
    x: 36,
    z: -26,
    rotY: 0.25,
    scale: 1.05,
    shadowRx: 11.5,
    shadowRz: 9.8,
    onLoaded: (model) => {
      model.traverse((node) => {
        if (node.isMesh) {
          const n = (node.name || '').toLowerCase();
          const m = (node.material?.name || '').toLowerCase();
          if (n.includes('glass') || m.includes('glass')) {
            node.material = domePhysicalGlassMat;
          } else if (n.includes('waterfall') || m.includes('waterfall')) {
            animatedWaterfalls.push(node);
          }
        }
      });
    }
  });

  placeBlenderLandmark({ assetName: 'Floral_Clock', x: 22, z: -16, rotY: 0.2, scale: 0.9, shadowRx: 4.5, shadowRz: 4.5 });
  placeBlenderLandmark({ assetName: 'Dragonfly_Bridge', x: -34.0, z: -9.0, rotY: Math.atan2(5.0, -12.0), scale: 1.0, shadowRx: 6.8, shadowRz: 2.8 });
  placeBlenderLandmark({ assetName: 'Heritage_Moon_Gate', x: -22, z: -16, rotY: 0.6, scale: 1.1, shadowRx: 3.6, shadowRz: 2.4 });
  placeBlenderLandmark({ assetName: 'Bay_East_Skylight_Pavilion', x: -18, z: -26, rotY: 0.4, scale: 0.85, shadowRx: 5.5, shadowRz: 5.5 });
  placeBlenderLandmark({ assetName: 'Planet_Floating_Baby', x: -36, z: 10, rotY: 0.18, scale: 1.18, shadowRx: 5.8, shadowRz: 5.2 });
  placeBlenderLandmark({ assetName: 'SG50_Celebration_Lattice', x: -54, z: -4, rotY: 0, scale: 1.15, shadowRx: 4.6, shadowRz: 4.6 });
  placeBlenderLandmark({ assetName: 'FEO_Children_Splash_Pad', x: 54, z: -8, rotY: 0.3, scale: 1.05, shadowRx: 6.4, shadowRz: 6.4 });
  placeBlenderLandmark({ assetName: 'Serene_Japanese_Pavilion', x: -54, z: 32, rotY: 0.45, scale: 1.15, shadowRx: 5.2, shadowRz: 4.6 });
}
