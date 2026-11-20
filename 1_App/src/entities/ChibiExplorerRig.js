// ============================================================================
// Gardens by the Bay — Chibi Safari Pith-Helmet Explorer 3D Rig Builder
// (src/entities/ChibiExplorerRig.js)
// Pipeline: Headless Blender 4.2 .GLB (`chibi_explorers.glb`) + Procedural Fallback
// Locked Avatar Design: Option B Cute Chibi Safari Pith-Helmet Explorer (~2.2 heads tall)
// ============================================================================

export function buildChibiExplorerRig(THREE, spec, glbRegistry = null, matLib = null) {
  const root = new THREE.Group();
  root.name = `ChibiExplorer_${spec.id}`;

  const bodyPivot = new THREE.Group();
  bodyPivot.rotation.order = 'YXZ';
  root.add(bodyPivot);

  let leftLegPivot = null;
  let rightLegPivot = null;
  let leftArmPivot = null;
  let rightArmPivot = null;
  let headGroup = null;

  // Try cloning high-res Subdivision-Surface Blender model from `chibi_explorers.glb`
  const glbExplorer = glbRegistry ? glbRegistry.cloneAsset(spec.glbName) : null;

  if (glbExplorer) {
    bodyPivot.add(glbExplorer);

    // Locate top-level limb & head joint pivots inside the Blender hierarchy.
    // Guard with `!leftLegPivot` etc. so pre-order traversal locks onto the parent joint pivot
    // (`Leg_L`, `Arm_L`, ...) and never overwrites it with child material sub-meshes (`_Mesh_1..4`).
    glbExplorer.traverse((node) => {
      if (!node.name) return;
      if (!leftLegPivot && node.name.includes('Leg_L')) leftLegPivot = node;
      else if (!rightLegPivot && node.name.includes('Leg_R')) rightLegPivot = node;
      else if (!leftArmPivot && node.name.includes('Arm_L')) leftArmPivot = node;
      else if (!rightArmPivot && node.name.includes('Arm_R')) rightArmPivot = node;
      else if (!headGroup && node.name.includes('Head_Group')) headGroup = node;
    });
  } else {
    // Fallback procedural rig matching the beloved v1.0 Cute Chibi Safari Explorer proportions
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFCD5B5, roughness: 0.55 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xE8D8B5, roughness: 0.65 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: 0xC2A878, roughness: 0.70 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x5C4033, roughness: 0.60 });
    const helmetMat = new THREE.MeshStandardMaterial({ color: 0xF5EEDC, roughness: 0.50 });
    const accentMat = new THREE.MeshStandardMaterial({
      color: spec.colorHex,
      roughness: 0.35,
      emissive: spec.colorHex,
      emissiveIntensity: 0.18
    });

    leftLegPivot = new THREE.Group();
    leftLegPivot.position.set(-0.26, 0.72, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.36, 8, 12), shortsMat);
    leftLegMesh.position.y = -0.22;
    const leftBootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.52), bootMat);
    leftBootMesh.position.set(0, -0.52, 0.08);
    leftLegPivot.add(leftLegMesh, leftBootMesh);
    bodyPivot.add(leftLegPivot);

    rightLegPivot = new THREE.Group();
    rightLegPivot.position.set(0.26, 0.72, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.36, 8, 12), shortsMat);
    rightLegMesh.position.y = -0.22;
    const rightBootMesh = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.28, 0.52), bootMat);
    rightBootMesh.position.set(0, -0.52, 0.08);
    rightLegPivot.add(rightLegMesh, rightBootMesh);
    bodyPivot.add(rightLegPivot);

    const torsoMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.48, 0.86, 16), shirtMat);
    torsoMesh.position.y = 1.15;
    torsoMesh.castShadow = true;
    bodyPivot.add(torsoMesh);

    const scarfMesh = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.11, 10, 20), accentMat);
    scarfMesh.rotation.x = Math.PI / 2;
    scarfMesh.position.y = 1.48;
    bodyPivot.add(scarfMesh);

    const backpackMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.72, 0.42), accentMat);
    backpackMesh.position.set(0, 1.16, -0.38);
    bodyPivot.add(backpackMesh);

    leftArmPivot = new THREE.Group();
    leftArmPivot.position.set(-0.54, 1.42, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.38, 8, 12), skinMat);
    leftArmMesh.position.y = -0.22;
    leftArmPivot.add(leftArmMesh);
    bodyPivot.add(leftArmPivot);

    rightArmPivot = new THREE.Group();
    rightArmPivot.position.set(0.54, 1.42, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.38, 8, 12), skinMat);
    rightArmMesh.position.y = -0.22;
    rightArmPivot.add(rightArmMesh);
    bodyPivot.add(rightArmPivot);

    headGroup = new THREE.Group();
    headGroup.position.y = 2.08;
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 20), skinMat);
    headGroup.add(headMesh);
    const brimMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 1.02, 0.10, 24), helmetMat);
    brimMesh.position.y = 0.22;
    const crownMesh = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), helmetMat);
    crownMesh.position.y = 0.16;
    const bandMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.69, 0.70, 0.12, 24), accentMat);
    bandMesh.position.y = 0.28;
    headGroup.add(brimMesh, crownMesh, bandMesh);
    bodyPivot.add(headGroup);
  }

  // Cache rest transforms on all limb & head pivots for clean procedural gait animation
  for (const piv of [leftLegPivot, rightLegPivot, leftArmPivot, rightArmPivot, headGroup]) {
    if (piv) {
      piv.userData.restPos = piv.position.clone();
      piv.userData.restRot = piv.rotation.clone();
    }
  }

  // Soft Ground Contact AO Shadow Disc
  if (matLib?.contactShadowMat) {
    const aoGeo = new THREE.PlaneGeometry(2.4, 2.4);
    aoGeo.rotateX(-Math.PI / 2);
    const aoMesh = new THREE.Mesh(aoGeo, matLib.contactShadowMat);
    aoMesh.position.y = 0.06;
    root.add(aoMesh);
  }

  // Ground Aura Ring & Golden Proximity Compass Arrow (for Player & Bots)
  const auraRingGeo = new THREE.RingGeometry(0.95, 1.22, 36);
  auraRingGeo.rotateX(-Math.PI / 2);
  const auraRingMat = new THREE.MeshBasicMaterial({
    color: spec.id === 'you' ? 0xFACC15 : spec.colorHex,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.88
  });
  const auraRing = new THREE.Mesh(auraRingGeo, auraRingMat);
  auraRing.position.y = 0.10;
  root.add(auraRing);

  // Directional Compass Pointer Arrow for Player
  const compassPivot = new THREE.Group();
  compassPivot.position.y = 0.12;
  if (spec.id === 'you') {
    const arrowGeo = new THREE.ConeGeometry(0.28, 0.65, 4);
    arrowGeo.rotateX(Math.PI / 2);
    const arrowMesh = new THREE.Mesh(
      arrowGeo,
      new THREE.MeshBasicMaterial({ color: 0xFDE047 })
    );
    arrowMesh.position.z = 1.65;
    compassPivot.add(arrowMesh);
  }
  root.add(compassPivot);

  // 3D Golden Champion Crown & Victory Halo (Shown on #1 Winner during End-Game Celebration)
  const championCrown = new THREE.Group();
  championCrown.position.y = 3.25;
  championCrown.visible = false;
  const crownRingMesh = new THREE.Mesh(
    new THREE.TorusGeometry(0.56, 0.08, 12, 28),
    new THREE.MeshBasicMaterial({ color: 0xFACC15 })
  );
  crownRingMesh.rotation.x = Math.PI / 2;
  const crownGemMesh = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.MeshBasicMaterial({ color: 0xFEF08A })
  );
  crownGemMesh.position.y = 0.28;
  championCrown.add(crownRingMesh, crownGemMesh);
  bodyPivot.add(championCrown);

  // Scale Chibi Explorer so it is visibly smaller than the 3D cars (~0.93m tall vs ~2.0m-2.4m cars) while keeping everything else constant
  root.scale.set(0.32, 0.32, 0.32);

  return {
    root,
    bodyPivot,
    leftLegPivot,
    rightLegPivot,
    leftArmPivot,
    rightArmPivot,
    headGroup,
    compassPivot,
    auraRing,
    championCrown
  };
}

export const createExplorerRigFromGLB = buildChibiExplorerRig;
export const createExplorerRig = buildChibiExplorerRig;

