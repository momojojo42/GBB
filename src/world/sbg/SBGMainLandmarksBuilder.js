// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Main Landmarks Builder
// Builds: 1930 Bandstand Gazebo, 18 Giant Heritage Tembusu & Rain Trees
// (including the iconic $5-Note Tembusu Tree low swooping branch & prop post),
// SPH Walk of Giants Canopy Boardwalk, and National Orchid Garden Conservatories
// (src/world/sbg/SBGMainLandmarksBuilder.js)
// ============================================================================

export function buildSBGTreesWalkwayAndConservatories({
  THREE, glbRegistry, matLib, landmarksGroup, domePhysicalGlassMat,
  supertreeCanopyMaterials, supertreeEmissiveMaterials, animatedWaterfalls
}) {
  const colonialWhiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.32, metalness: 0.1 });
  const ivoryPlinthMat = new THREE.MeshStandardMaterial({ color: 0xF5F5F4, roughness: 0.48, metalness: 0.08 });
  const terracottaStepMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.58, metalness: 0.08 });
  const zincRoofMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.35, metalness: 0.42 });
  const wroughtIronMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.35, metalness: 0.72 });
  const silverLeafMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.18, metalness: 0.88 });
  const teakTimberMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.52, metalness: 0.12 });
  const tembusuBarkMat = new THREE.MeshStandardMaterial({ color: 0x5C3A21, roughness: 0.78, metalness: 0.06 });

  const foliageMats = [
    new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.55, metalness: 0.06 }),
    new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.52, metalness: 0.08 }),
    new THREE.MeshStandardMaterial({ color: 0x10B981, roughness: 0.48, metalness: 0.08 })
  ];
  const tembusuBlossomMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A, emissive: 0xF59E0B, emissiveIntensity: 0.45, roughness: 0.35, metalness: 0.15
  });
  const goldenOrchidMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15, emissive: 0xEAB308, emissiveIntensity: 0.55, roughness: 0.3, metalness: 0.2
  });
  const heritageAmberGlowMat = new THREE.MeshStandardMaterial({
    color: 0xFDE68A, emissive: 0xF59E0B, emissiveIntensity: 0.95, roughness: 0.22, metalness: 0.45
  });
  supertreeCanopyMaterials.push(tembusuBlossomMat, goldenOrchidMat);
  supertreeEmissiveMaterials.push(heritageAmberGlowMat);

  // 1. THE BANDSTAND (1930) HERITAGE GAZEBO at (0, 0, -1.5)
  {
    const bandstand = new THREE.Group();
    bandstand.name = 'Landmark_SBG_Bandstand_1930';
    bandstand.position.set(0, 0, -1.5);
    if (matLib?.createContactShadowDisc) bandstand.add(matLib.createContactShadowDisc(4.8, 4.8, 0.065));

    const addCyl = (rt, rb, h, seg, mat, y, cast = false) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
      m.position.y = y;
      m.castShadow = cast;
      m.receiveShadow = true;
      bandstand.add(m);
    };
    addCyl(3.35, 3.5, 0.18, 8, terracottaStepMat, 0.09);
    addCyl(2.95, 3.1, 0.22, 8, ivoryPlinthMat, 0.28);
    addCyl(2.65, 2.75, 0.16, 8, colonialWhiteMat, 0.46);

    const colGeo = new THREE.CylinderGeometry(0.11, 0.14, 2.85, 12);
    const capGeo = new THREE.CylinderGeometry(0.19, 0.12, 0.16, 12);
    const colRadius = 2.32;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + Math.PI / 8;
      const cx = Math.cos(angle) * colRadius;
      const cz = Math.sin(angle) * colRadius;
      const col = new THREE.Mesh(colGeo, colonialWhiteMat);
      col.position.set(cx, 1.92, cz);
      col.castShadow = true;
      const cap = new THREE.Mesh(capGeo, colonialWhiteMat);
      cap.position.set(cx, 3.36, cz);
      bandstand.add(col, cap);

      if (i !== 1 && i !== 5) {
        const nextAngle = ((i + 1) * Math.PI) / 4 + Math.PI / 8;
        const nx = Math.cos(nextAngle) * colRadius;
        const nz = Math.sin(nextAngle) * colRadius;
        const segLen = Math.hypot(nx - cx, nz - cz) - 0.22;
        const rail = new THREE.Mesh(new THREE.BoxGeometry(segLen, 0.68, 0.06), wroughtIronMat);
        rail.position.set((cx + nx) * 0.5, 0.88, (cz + nz) * 0.5);
        rail.rotation.y = -Math.atan2(nz - cz, nx - cx);
        bandstand.add(rail);
      }
    }

    addCyl(2.85, 2.95, 0.22, 8, colonialWhiteMat, 3.52, true);
    const lowerRoof = new THREE.Mesh(new THREE.ConeGeometry(3.15, 1.35, 8), zincRoofMat);
    lowerRoof.position.y = 4.28;
    lowerRoof.castShadow = true;
    addCyl(1.05, 1.15, 0.68, 8, colonialWhiteMat, 5.05);
    const upperCupola = new THREE.Mesh(new THREE.ConeGeometry(1.32, 0.95, 8), zincRoofMat);
    upperCupola.position.y = 5.82;
    upperCupola.castShadow = true;
    addCyl(0.03, 0.09, 0.85, 8, heritageAmberGlowMat, 6.62);
    const chandelier = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 12), heritageAmberGlowMat);
    chandelier.position.y = 3.25;
    bandstand.add(lowerRoof, upperCupola, chandelier);
    landmarksGroup.add(bandstand);
  }

  // 2. 18 GIANT HERITAGE TEMBUSU & RAIN TREES + $5-NOTE SWOOPING LIMB
  const supertreeSpecs = [
    { x: -5.5, z: -3.5, h: 16.0, hero: true, isFiveDollarTembusu: true },
    { x: 6.5, z: -2.0, h: 15.6, hero: true }, { x: 0.5, z: 6.5, h: 15.2, hero: true },
    { x: -12.5, z: -9.5, h: 12.2, hero: false }, { x: -2.0, z: -12.5, h: 12.6, hero: false },
    { x: 11.5, z: -9.0, h: 12.4, hero: false }, { x: 14.5, z: 1.5, h: 11.4, hero: false },
    { x: 11.0, z: 11.5, h: 12.0, hero: false }, { x: 0.0, z: 15.0, h: 11.2, hero: false },
    { x: -10.5, z: 11.0, h: 11.6, hero: false }, { x: -15.0, z: 1.5, h: 10.8, hero: false },
    { x: 4.5, z: -15.5, h: 10.6, hero: false }, { x: -4.2, z: -29.5, h: 11.0, hero: false },
    { x: 0.5, z: -28.0, h: 10.2, hero: false }, { x: -1.8, z: -23.0, h: 9.8, hero: false },
    { x: 28.0, z: -5.8, h: 11.2, hero: false }, { x: 32.5, z: -4.0, h: 10.2, hero: false },
    { x: 30.2, z: -0.5, h: 10.4, hero: false }
  ];
  const puffOffsets = [
    [0, 0.6, 0, 2.8, 1.35], [-1.7, 0.1, 1.1, 2.1, 1.15],
    [1.8, 0.2, -1.0, 2.2, 1.15], [-1.2, -0.3, -1.6, 1.9, 1.05], [1.3, -0.2, 1.6, 2.0, 1.1]
  ];

  supertreeSpecs.forEach((st, idx) => {
    const scale = st.h / (st.hero ? 16.0 : 12.0);
    const treeGroup = new THREE.Group();
    treeGroup.name = `SBG_HeritageTree_${idx}`;
    treeGroup.position.set(st.x, 0, st.z);
    if (matLib?.createContactShadowDisc) treeGroup.add(matLib.createContactShadowDisc(4.5 * scale, 4.5 * scale, 0.07));

    const modelName = st.hero ? 'Supertree_Hero' : 'Supertree_Medium';
    const stModel = glbRegistry ? (glbRegistry.cloneAsset(modelName, false) || glbRegistry.cloneAsset('Supertree_Hero', false)) : null;
    if (stModel) {
      stModel.scale.set(scale * 0.72, scale * 0.92, scale * 0.72);
      stModel.rotation.y = (idx * 0.85) % (Math.PI * 2);
      stModel.traverse((node) => {
        if (node.isMesh && node.material) {
          const mName = (node.material.name || node.name || '').toLowerCase();
          if (mName.includes('glow') || mName.includes('led') || mName.includes('emiss')) node.material = heritageAmberGlowMat;
          else if (mName.includes('steel') || mName.includes('diagrid') || mName.includes('canopy') || mName.includes('rib')) node.material = tembusuBarkMat;
        }
      });
      treeGroup.add(stModel);
    }

    const trunkH = st.h * 0.68;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45 * scale, 0.95 * scale, trunkH, 10), tembusuBarkMat);
    trunk.position.y = trunkH * 0.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const crownY = st.h * 0.82;
    puffOffsets.forEach(([px, py, pz, rad, sy], pIdx) => {
      const puff = new THREE.Mesh(new THREE.DodecahedronGeometry(rad * scale, 1), foliageMats[(idx + pIdx) % 3]);
      puff.scale.set(1.15, sy * 0.62, 1.15);
      puff.position.set(px * scale, crownY + py * scale, pz * scale);
      puff.castShadow = true;
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.36 * scale, 8, 6), tembusuBlossomMat);
      blossom.position.set(px * scale * 1.12, crownY + (py + 0.45) * scale, pz * scale * 1.12);
      treeGroup.add(puff, blossom);
    });

    const lightRing = new THREE.Mesh(new THREE.TorusGeometry(1.35 * scale, 0.055, 8, 24), heritageAmberGlowMat);
    lightRing.rotation.x = Math.PI / 2;
    lightRing.position.y = st.h * 0.56;
    treeGroup.add(lightRing);

    // Famous $5-Note Tembusu Tree's low horizontal swooping limb & wooden prop post toward (-9.5, 4.0)
    if (st.isFiveDollarTembusu) {
      const limbCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 2.4, 0), new THREE.Vector3(-1.4, 1.55, 2.5),
        new THREE.Vector3(-2.8, 1.35, 5.2), new THREE.Vector3(-4.0, 1.95, 7.5)
      ]);
      const limbMesh = new THREE.Mesh(new THREE.TubeGeometry(limbCurve, 24, 0.34, 8, false), tembusuBarkMat);
      limbMesh.castShadow = true;
      const propPost = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 1.45, 8), teakTimberMat);
      propPost.position.set(-2.8, 0.72, 5.2);
      propPost.castShadow = true;
      const propCradle = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.14, 0.28), teakTimberMat);
      propCradle.position.set(-2.8, 1.42, 5.2);
      const limbFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.45, 1), foliageMats[0]);
      limbFoliage.scale.set(1.2, 0.65, 1.2);
      limbFoliage.position.set(-4.0, 2.55, 7.5);
      treeGroup.add(limbMesh, propPost, propCradle, limbFoliage);
    }
    landmarksGroup.add(treeGroup);
  });

  // 3. SPH WALK OF GIANTS ELEVATED CANOPY BOARDWALK at y = 8.4m
  {
    const boardwalkGroup = new THREE.Group();
    boardwalkGroup.name = 'SBG_Walk_Of_Giants_Boardwalk';
    const walkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-12.5, 8.4, -9.5), new THREE.Vector3(-5.5, 8.4, -3.5),
      new THREE.Vector3(0.5, 8.4, 6.5), new THREE.Vector3(6.5, 8.4, -2.0),
      new THREE.Vector3(11.5, 8.4, -9.0), new THREE.Vector3(-2.0, 8.4, -12.5),
      new THREE.Vector3(-12.5, 8.4, -9.5)
    ], true);

    const deckGeo = new THREE.TubeGeometry(walkCurve, 110, 0.62, 8, true);
    deckGeo.scale(1, 0.2, 1);
    const deckMesh = new THREE.Mesh(deckGeo, teakTimberMat);
    deckMesh.position.y = 8.4 * 0.8;
    deckMesh.castShadow = true;
    boardwalkGroup.add(deckMesh);

    const leftRailPts = [];
    const rightRailPts = [];
    for (let i = 0; i < 64; i++) {
      const t = i / 64;
      const pt = walkCurve.getPointAt(t);
      const tan = walkCurve.getTangentAt(t);
      const len = Math.hypot(tan.x, tan.z) || 1;
      const nx = -tan.z / len;
      const nz = tan.x / len;
      leftRailPts.push(new THREE.Vector3(pt.x + nx * 0.62, 8.96, pt.z + nz * 0.62));
      rightRailPts.push(new THREE.Vector3(pt.x - nx * 0.62, 8.96, pt.z - nz * 0.62));
    }
    boardwalkGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(leftRailPts, true), 100, 0.045, 8, true), heritageAmberGlowMat),
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(rightRailPts, true), 100, 0.045, 8, true), heritageAmberGlowMat)
    );

    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.62, 6);
    const lanternGlobeGeo = new THREE.SphereGeometry(0.11, 8, 8);
    for (let i = 0; i < 40; i++) {
      const t = i / 40;
      const pt = walkCurve.getPointAt(t);
      const tan = walkCurve.getTangentAt(t);
      const len = Math.hypot(tan.x, tan.z) || 1;
      const nx = -tan.z / len;
      const nz = tan.x / len;
      for (const side of [-1, 1]) {
        const px = pt.x + nx * 0.62 * side;
        const pz = pt.z + nz * 0.62 * side;
        const post = new THREE.Mesh(postGeo, wroughtIronMat);
        post.position.set(px, 8.68, pz);
        boardwalkGroup.add(post);
        if (i % 4 === 0 && side === 1) {
          const globe = new THREE.Mesh(lanternGlobeGeo, heritageAmberGlowMat);
          globe.position.set(px, 9.12, pz);
          boardwalkGroup.add(globe);
        }
      }
    }
    landmarksGroup.add(boardwalkGroup);
  }

  // 4. NATIONAL ORCHID GARDEN CONSERVATORIES & HERITAGE PAVILIONS
  function placeSBGLandmark({ assetName, name, x, z, y = 0, rotY = 0, scale = 1.0, shadowRx = 5.0, shadowRz = 5.0, onCustomize }) {
    const holder = new THREE.Group();
    holder.name = name || `Landmark_SBG_${assetName}`;
    holder.position.set(x, y, z);
    holder.rotation.y = rotY;
    if (shadowRx > 0 && matLib?.createContactShadowDisc) holder.add(matLib.createContactShadowDisc(shadowRx, shadowRz, 0.065));
    const cloned = glbRegistry ? glbRegistry.cloneAsset(assetName, false) : null;
    if (cloned) {
      cloned.scale.setScalar(scale);
      holder.add(cloned);
    }
    if (onCustomize) onCustomize(holder, cloned);
    landmarksGroup.add(holder);
  }

  // (a) Sembcorp Cool House Conservatory at (14, -36) + Golden Shower Orchid Arches
  placeSBGLandmark({
    assetName: 'Flower_Dome_Conservatory', name: 'Landmark_Sembcorp_Cool_House',
    x: 14, z: -36, rotY: -0.35, scale: 1.05, shadowRx: 15.5, shadowRz: 11.5,
    onCustomize: (holder, model) => {
      model?.traverse((node) => {
        if (node.isMesh && `${node.name || ''} ${node.material?.name || ''}`.toLowerCase().includes('glass')) {
          node.material = domePhysicalGlassMat;
        }
      });
      for (const az of [10.5, 12.2, 13.8]) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(2.35, 0.12, 8, 24, Math.PI), wroughtIronMat);
        arch.position.set(0, 0.2, az);
        const garland = new THREE.Mesh(new THREE.TorusGeometry(2.38, 0.22, 8, 20, Math.PI), goldenOrchidMat);
        garland.position.set(0, 0.24, az);
        holder.add(arch, garland);
      }
    }
  });

  // (b) Burkill Hall & Tan Hoon Siang Mist House at (36, -26)
  placeSBGLandmark({
    assetName: 'Cloud_Forest_Conservatory', name: 'Landmark_Burkill_Hall_Mist_House',
    x: 36, z: -26, rotY: 0.25, scale: 1.05, shadowRx: 11.5, shadowRz: 9.8,
    onCustomize: (holder, model) => {
      model?.traverse((node) => {
        if (node.isMesh) {
          const n = `${node.name || ''} ${node.material?.name || ''}`.toLowerCase();
          if (n.includes('glass')) node.material = domePhysicalGlassMat;
          else if (n.includes('waterfall')) animatedWaterfalls.push(node);
        }
      });
      const verandaRoof = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.26, 3.2), terracottaStepMat);
      verandaRoof.position.set(0, 3.35, 7.8);
      const gablePediment = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.1, 4), colonialWhiteMat);
      gablePediment.rotation.y = Math.PI / 4;
      gablePediment.position.set(0, 4.0, 8.2);
      holder.add(verandaRoof, gablePediment);
    }
  });

  // (c) Holttum Hall Heritage Rotunda at (16.5, 14.5)
  placeSBGLandmark({
    assetName: 'Understorey_Timber_Dome', name: 'Landmark_Holttum_Hall_Rotunda',
    x: 16.5, z: 14.5, scale: 1.0, shadowRx: 4.5, shadowRz: 4.5,
    onCustomize: (holder) => {
      const cupola = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), colonialWhiteMat);
      cupola.position.y = 3.85;
      const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.1, 0.75, 8), heritageAmberGlowMat);
      finial.position.y = 4.85;
      holder.add(cupola, finial);
    }
  });

  // (d) Victorian Sundial & Orchid Clock at (22, -16)
  placeSBGLandmark({
    assetName: 'Floral_Clock', name: 'Landmark_Victorian_Sundial_Clock',
    x: 22, z: -16, rotY: 0.2, scale: 0.9, shadowRx: 4.5, shadowRz: 4.5,
    onCustomize: (holder) => {
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.44, 0.95, 12), ivoryPlinthMat);
      pedestal.position.y = 0.85;
      const gnomonSpire = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.15, 4), heritageAmberGlowMat);
      gnomonSpire.position.set(0, 1.75, -0.1);
      gnomonSpire.rotation.x = -0.32;
      holder.add(pedestal, gnomonSpire);
    }
  });

  // (e) Swan Lake Heritage Bridge at (-34.0, -9.0)
  placeSBGLandmark({
    assetName: 'Dragonfly_Bridge', name: 'Landmark_Swan_Lake_Bridge',
    x: -34.0, z: -9.0, rotY: Math.atan2(5.0, -12.0), scale: 1.0, shadowRx: 6.8, shadowRz: 2.8,
    onCustomize: (holder) => {
      for (const lx of [-3.2, 0, 3.2]) {
        for (const lz of [-1.15, 1.15]) {
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.85, 8), colonialWhiteMat);
          post.position.set(lx, 1.35, lz);
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), heritageAmberGlowMat);
          lamp.position.set(lx, 2.32, lz);
          holder.add(post, lamp);
        }
      }
    }
  });

  // (f) Tanglin Gate Silver-Leaf Cast-Iron Archway at (-22, -16) & (g) Tan Hoon Siang Mist Pavilion at (-18, -26)
  placeSBGLandmark({
    assetName: 'Heritage_Moon_Gate', name: 'Landmark_Tanglin_Gate_Archway', x: -22, z: -16, rotY: 0.6, scale: 1.1, shadowRx: 3.6, shadowRz: 2.4,
    onCustomize: (holder, model) => {
      model?.traverse((n) => { if (n.isMesh) n.material = silverLeafMat; });
      const crest = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.08, 8, 20), silverLeafMat);
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), heritageAmberGlowMat);
      crest.position.y = lantern.position.y = 4.15;
      holder.add(crest, lantern);
    }
  });
  placeSBGLandmark({
    assetName: 'Bay_East_Skylight_Pavilion', name: 'Landmark_Tan_Hoon_Siang_Mist_Pavilion', x: -18, z: -26, rotY: 0.4, scale: 0.85, shadowRx: 5.5, shadowRz: 5.5
  });
}
