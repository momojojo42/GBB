// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Historic Attractions Builder (1:1 NParks)
// Builds at 1:1 North-South (X, Z) coordinates:
//   - Shaw Foundation Symphony Stage at (+3.6, -4.4) on Symphony Lake Islet + Chopin Memorial
//   - Atbara (1898) House at (-52.0, +48.0), Inverturret (1906) at (-46.0, +54.0),
//     & COMO Cempedak Play Pod at (-36.4, +51.6) [Tyersall-Gallop Extension]
//   - Japanese Bonsai Pavilion at (+22.4, +32.0) [Tanglin East Terrace]
//   - Jacob Ballas Children's Treehouse at (+19.0, -52.0) [Bukit Timah North-East]
//   - Ginger Cavern Waterfall at (-14.4, +19.6) & Halia Veranda at (-20.5, +18.0)
//   - Swan Lake Flight of Swans at (-3.6, +45.6) & Eco-Lake Black Swans at (+1.0, -43.0)
//   - Nassim Gate Clock Tower at (+25.6, +7.0), Bukit Timah Gate at (-2.4, -59.0),
//     Corner House at (-10.0, -54.0), & Primary Rainforest Hollow Log at (+25.0, +17.0)
// (src/world/sbg/SBGAttractionsBuilder.js)
// ============================================================================

import { getTerrainElevationAt } from '../../WorldPhysicsEngine.js';

export function buildSBGHistoricAttractions({
  THREE, glbRegistry, matLib, landmarksGroup,
  domePhysicalGlassMat, supertreeEmissiveMaterials, animatedWaterfalls
}) {
  const colonialWhiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.1 });
  const blackTimberMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.42, metalness: 0.25 });
  const terracottaRoofMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.48, metalness: 0.12 });
  const warmTeakMat = new THREE.MeshStandardMaterial({ color: 0x92400E, roughness: 0.52, metalness: 0.12 });
  const mossRockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.78, metalness: 0.08 });
  const bonsaiFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.52, metalness: 0.06 });
  const torchGingerMat = new THREE.MeshStandardMaterial({
    color: 0xEF4444, emissive: 0xDC2626, emissiveIntensity: 0.45, roughness: 0.35
  });
  const bronzeSwanMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.25, metalness: 0.82 });
  const whiteSwanMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.28, metalness: 0.12 });
  const blackSwanMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.32, metalness: 0.25 });
  const goldStageGlowMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A, emissive: 0xF59E0B, emissiveIntensity: 0.95, roughness: 0.2, metalness: 0.55
  });
  const waterfallCyanMat = new THREE.MeshStandardMaterial({
    color: 0x67E8F9, emissive: 0x06B6D4, emissiveIntensity: 1.15,
    roughness: 0.12, metalness: 0.2, transparent: true, opacity: 0.78
  });
  supertreeEmissiveMaterials.push(torchGingerMat, goldStageGlowMat);

  const addMesh = (parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx, ry, rz);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };

  function addHeritageDoorway(parentGroup, { x = 0, y = 0, z = 0, rotY = 0, width = 2.0, height = 2.0, frameColor = 0x1E293B, carpetColor = 0x991B1B } = {}) {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x, y, z);
    doorGroup.rotation.y = rotY;
    const frameMat = new THREE.MeshStandardMaterial({ color: frameColor, metalness: 0.45, roughness: 0.35 });
    const carpetMat = new THREE.MeshStandardMaterial({ color: carpetColor, roughness: 0.65 });
    addMesh(doorGroup, new THREE.BoxGeometry(width - 0.16, height - 0.1, 0.12), goldStageGlowMat, 0, height * 0.5, -0.06);
    addMesh(doorGroup, new THREE.BoxGeometry(0.18, height, 0.36), frameMat, -width * 0.5, height * 0.5, 0.08);
    addMesh(doorGroup, new THREE.BoxGeometry(0.18, height, 0.36), frameMat, width * 0.5, height * 0.5, 0.08);
    addMesh(doorGroup, new THREE.BoxGeometry(width + 0.44, 0.24, 0.68), frameMat, 0, height + 0.1, 0.18);
    addMesh(doorGroup, new THREE.BoxGeometry(width + 0.2, 0.06, 1.6), carpetMat, 0, 0.14, 0.56);

    const leafW = width * 0.44;
    const leafH = height - 0.12;
    for (const side of [-1, 1]) {
      const pivot = new THREE.Group();
      pivot.position.set(side * (width * 0.5 - 0.08), 0, 0.14);
      pivot.rotation.y = side * ((65 * Math.PI) / 180);
      addMesh(pivot, new THREE.BoxGeometry(leafW, leafH, 0.06), domePhysicalGlassMat, -side * (leafW * 0.5), leafH * 0.5, 0);
      doorGroup.add(pivot);
    }
    parentGroup.add(doorGroup);
  }

  // 1. SHAW FOUNDATION SYMPHONY STAGE at (+3.6, 0, -4.4) on Symphony Lake Islet + CHOPIN MEMORIAL
  {
    const stageGroup = new THREE.Group();
    stageGroup.name = 'Landmark_Shaw_Foundation_Symphony_Stage';
    stageGroup.position.set(3.6, 0, -4.4);
    stageGroup.rotation.y = 0.0;
    if (matLib?.createContactShadowDisc) stageGroup.add(matLib.createContactShadowDisc(5.6, 4.8, 0.065));

    const glbStage = glbRegistry?.cloneAsset('SBG_Shaw_Symphony_Stage', false, 'sbg');
    if (glbStage) {
      glbStage.scale.setScalar(1.05);
      stageGroup.add(glbStage);
    } else {
      addMesh(stageGroup, new THREE.CylinderGeometry(4.4, 4.8, 0.44, 28), bonsaiFoliageMat, 0, 0.22, 0);
      addMesh(stageGroup, new THREE.CylinderGeometry(3.8, 4.0, 0.34, 24), warmTeakMat, 0, 0.58, 0);
      addMesh(stageGroup, new THREE.BoxGeometry(0.95, 0.28, 0.75), blackTimberMat, 0, 0.88, 1.65);

      for (let i = 0; i < 4; i++) {
        const r = 3.8 - i * 0.52;
        const shell = addMesh(
          stageGroup,
          new THREE.SphereGeometry(r, 24, 16, 0, Math.PI, 0, Math.PI * 0.52),
          colonialWhiteMat, 0, 0.72, -0.5 - i * 0.32, -0.22 + i * 0.07, 0, 0
        );
        shell.scale.set(1.15, 0.90 + i * 0.08, 0.76);
        addMesh(stageGroup, new THREE.TorusGeometry(r * 1.05, 0.08, 8, 24, Math.PI), goldStageGlowMat, 0, 0.76, -0.32 - i * 0.32);
      }
    }
    for (let f = -3; f <= 3; f++) {
      addMesh(stageGroup, new THREE.SphereGeometry(0.13, 10, 8), goldStageGlowMat, f * 0.85, 0.82, 3.05 - Math.abs(f) * 0.16);
    }
    const glbChopin = glbRegistry?.cloneAsset('SBG_Chopin_Memorial_Statue', false, 'sbg');
    if (glbChopin) {
      glbChopin.position.set(-7.6, 0, 6.2);
      glbChopin.scale.setScalar(1.0);
      stageGroup.add(glbChopin);
    }
    landmarksGroup.add(stageGroup);
  }

  // 2. ATBARA (1898) BLACK-AND-WHITE COLONIAL HOUSE at (-52.0, 0, +48.0) & COMO CEMPEDAK POD at (-36.4, 0, +51.6)
  {
    const atbara = new THREE.Group();
    atbara.name = 'Landmark_Atbara_1898_Colonial_House';
    atbara.position.set(-52.0, 0, 48.0);
    atbara.rotation.y = 0.15;
    if (matLib?.createContactShadowDisc) atbara.add(matLib.createContactShadowDisc(5.2, 5.2, 0.065));

    const glbAtbara = glbRegistry?.cloneAsset('SBG_Atbara_House_1898', false, 'sbg');
    if (glbAtbara) {
      glbAtbara.scale.setScalar(1.0);
      atbara.add(glbAtbara);
    } else {
      addMesh(atbara, new THREE.BoxGeometry(6.8, 0.38, 5.4), colonialWhiteMat, 0, 0.19, 0);
      addMesh(atbara, new THREE.BoxGeometry(5.8, 1.8, 4.4), colonialWhiteMat, 0, 1.28, 0);
      addMesh(atbara, new THREE.BoxGeometry(6.2, 1.65, 4.8), colonialWhiteMat, 0, 3.0, 0);
      for (const yBeam of [2.15, 3.82]) {
        addMesh(atbara, new THREE.BoxGeometry(6.35, 0.14, 4.95), blackTimberMat, 0, yBeam, 0);
      }
      const postGeo = new THREE.BoxGeometry(0.14, 3.5, 0.14);
      for (const px of [-2.85, -1.4, 0, 1.4, 2.85]) {
        for (const pz of [-2.35, 2.35]) addMesh(atbara, postGeo, blackTimberMat, px, 2.1, pz);
      }
      addMesh(atbara, new THREE.ConeGeometry(4.85, 1.85, 4), terracottaRoofMat, 0, 4.72, 0, 0, Math.PI / 4, 0);
      addHeritageDoorway(atbara, { x: 0, y: 0.2, z: 2.25, width: 2.0, height: 2.0 });
    }
    landmarksGroup.add(atbara);

    const cempedakGroup = new THREE.Group();
    cempedakGroup.name = 'Landmark_COMO_Cempedak_Play_Pod';
    cempedakGroup.position.set(-36.4, 0, 51.6);
    if (matLib?.createContactShadowDisc) cempedakGroup.add(matLib.createContactShadowDisc(4.2, 4.2, 0.065));
    const glbCempedak = glbRegistry?.cloneAsset('SBG_COMO_Cempedak_Play_Pod', false, 'sbg');
    if (glbCempedak) {
      glbCempedak.scale.setScalar(1.0);
      cempedakGroup.add(glbCempedak);
    }
    landmarksGroup.add(cempedakGroup);
  }

  // 3. JAPANESE BONSAI & SUNDIAL PAVILION at (+22.4, 0, +32.0) + ZEN ROCKERY at (+25.5, +34.5)
  {
    const bonsaiHolder = new THREE.Group();
    bonsaiHolder.name = 'Landmark_Japanese_Bonsai_Pavilion';
    bonsaiHolder.position.set(22.4, 0, 32.0);
    bonsaiHolder.rotation.y = 0.35;
    if (matLib?.createContactShadowDisc) bonsaiHolder.add(matLib.createContactShadowDisc(5.2, 4.6, 0.065));
    const pavModel = glbRegistry
      ? (glbRegistry.cloneAsset('SBG_Japanese_Bonsai_Pavilion', false, 'sbg') || glbRegistry.cloneAsset('Serene_Japanese_Pavilion', false))
      : null;
    if (pavModel) {
      pavModel.scale.setScalar(1.15);
      bonsaiHolder.add(pavModel);
    }
    for (const [bx, bz] of [[-2.6, 2.2], [2.6, 2.2], [-2.8, -1.8]]) {
      addMesh(bonsaiHolder, new THREE.CylinderGeometry(0.32, 0.38, 0.72, 8), mossRockMat, bx, 0.36, bz);
      addMesh(bonsaiHolder, new THREE.CylinderGeometry(0.45, 0.32, 0.22, 10), terracottaRoofMat, bx, 0.82, bz);
      addMesh(bonsaiHolder, new THREE.CylinderGeometry(0.08, 0.12, 0.55, 7), warmTeakMat, bx, 1.15, bz, 0, 0, 0.28);
      const crown = addMesh(bonsaiHolder, new THREE.DodecahedronGeometry(0.48, 1), bonsaiFoliageMat, bx + 0.12, 1.45, bz);
      crown.scale.set(1.3, 0.55, 1.1);
    }
    landmarksGroup.add(bonsaiHolder);

    const zenGroup = new THREE.Group();
    zenGroup.name = 'Landmark_Bonsai_Zen_Rocks';
    zenGroup.position.set(25.5, getTerrainElevationAt(25.5, 34.5), 34.5);
    for (const [zx, zz, zr] of [[-1.6, -1.2, 0.85], [0.8, -0.6, 0.65], [1.8, 1.1, 0.75], [-0.5, 1.5, 0.6]]) {
      const zb = addMesh(zenGroup, new THREE.DodecahedronGeometry(zr, 1), mossRockMat, zx, zr * 0.45, zz);
      zb.scale.set(1.1, 0.75, 0.95);
    }
    landmarksGroup.add(zenGroup);
  }

  // 4. JACOB BALLAS CHILDREN'S GARDEN TREEHOUSE & SPLASH ADVENTURE at (+19.0, 0, -52.0) [Bukit Timah North-East]
  {
    const jbGroup = new THREE.Group();
    jbGroup.name = 'Landmark_Jacob_Ballas_Treehouse_Splash';
    jbGroup.position.set(19.0, 0, -52.0);
    jbGroup.rotation.y = 0.3;
    if (matLib?.createContactShadowDisc) jbGroup.add(matLib.createContactShadowDisc(6.4, 6.4, 0.065));
    const splashModel = glbRegistry ? glbRegistry.cloneAsset('SBG_Jacob_Ballas_Treehouse_Bridge', false, 'sbg') : null;
    if (splashModel) {
      splashModel.scale.setScalar(1.05);
      jbGroup.add(splashModel);
    } else {
      addMesh(jbGroup, new THREE.CylinderGeometry(0.65, 0.88, 3.6, 10), warmTeakMat, -1.8, 1.8, -1.4);
      addMesh(jbGroup, new THREE.CylinderGeometry(1.85, 1.85, 0.24, 12), warmTeakMat, -1.8, 3.2, -1.4);
      addMesh(jbGroup, new THREE.CylinderGeometry(1.35, 1.35, 1.45, 8), warmTeakMat, -1.8, 4.0, -1.4);
      addMesh(jbGroup, new THREE.ConeGeometry(2.15, 1.45, 8), bonsaiFoliageMat, -1.8, 5.25, -1.4);

      const slidePts = [];
      for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const a = t * Math.PI * 1.65;
        slidePts.push(new THREE.Vector3(-1.8 + Math.cos(a) * 1.95, 3.1 * (1 - t) + 0.25, -1.4 + Math.sin(a) * 1.95));
      }
      addMesh(jbGroup, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(slidePts), 32, 0.32, 8, false), goldStageGlowMat);
    }
    landmarksGroup.add(jbGroup);
  }

  // 5. GINGER GARDEN WALK-BEHIND CAVERN WATERFALL at (-14.4, +19.6) & HALIA VERANDA at (-20.5, +18.0)
  {
    const halia = new THREE.Group();
    halia.name = 'Landmark_Halia_Ginger_Veranda';
    halia.position.set(-20.5, 0, 18.0);
    halia.rotation.y = 0.35;
    addMesh(halia, new THREE.CylinderGeometry(3.6, 3.8, 0.2, 20), warmTeakMat, 0, 0.1, 0);
    addMesh(halia, new THREE.BoxGeometry(5.2, 2.3, 3.5), domePhysicalGlassMat, 0, 1.25, 0);
    addMesh(halia, new THREE.ConeGeometry(3.9, 1.35, 4), blackTimberMat, 0, 3.05, 0, 0, Math.PI / 4, 0);
    for (const [gx, gz] of [[-1.6, -0.6], [0.2, 0.7], [1.6, -0.5]]) {
      addMesh(halia, new THREE.CylinderGeometry(0.08, 0.12, 1.35, 8), bonsaiFoliageMat, gx, 0.75, gz);
      addMesh(halia, new THREE.ConeGeometry(0.26, 0.55, 8), torchGingerMat, gx, 1.55, gz);
    }
    addHeritageDoorway(halia, { x: 0, y: 0, z: 1.76, width: 1.8, height: 1.9, frameColor: 0x92400E });
    landmarksGroup.add(halia);

    const cavern = new THREE.Group();
    cavern.name = 'Landmark_Ginger_Cavern_Waterfall';
    cavern.position.set(-14.4, 0, 19.6);
    const glbCavern = glbRegistry?.cloneAsset('SBG_Ginger_Cavern_Waterfall', false, 'sbg');
    if (glbCavern) {
      glbCavern.scale.setScalar(1.0);
      glbCavern.traverse((n) => {
        if (n.isMesh && `${n.name || ''} ${n.material?.name || ''}`.toLowerCase().includes('waterfall')) {
          animatedWaterfalls.push(n);
        }
      });
      cavern.add(glbCavern);
    } else {
      for (const [rx, rz, rad, rh] of [[-1.9, -0.8, 1.4, 2.7], [0.4, -1.3, 1.6, 3.2], [2.1, 0.5, 1.3, 2.4], [-0.7, 1.4, 1.1, 2.0]]) {
        const rock = addMesh(cavern, new THREE.DodecahedronGeometry(rad, 1), mossRockMat, rx, rh * 0.45, rz);
        rock.scale.set(1.05, rh / rad, 0.9);
      }
      addMesh(cavern, new THREE.CylinderGeometry(2.2, 2.3, 0.14, 20), waterfallCyanMat, 0.2, 0.08, 0.35);
    }
    const wfCurtain = addMesh(cavern, new THREE.CylinderGeometry(1.15, 1.35, 2.85, 16, 1, true, 0, Math.PI), waterfallCyanMat, 0.2, 1.42, -0.25);
    animatedWaterfalls.push(wfCurtain);
    landmarksGroup.add(cavern);
  }

  // 6. SWAN LAKE "FLIGHT OF SWANS" (-3.6, +45.6) & ECO-LAKE BLACK SWANS (+1.0, -43.0)
  {
    const makeSwan = (mat, scale = 1.0, wingSpread = 0.6) => {
      const g = new THREE.Group();
      const body = addMesh(g, new THREE.SphereGeometry(0.38 * scale, 12, 10), mat);
      body.scale.set(1.45, 0.72, 0.85);
      addMesh(g, new THREE.CylinderGeometry(0.06 * scale, 0.09 * scale, 0.65 * scale, 8), mat, 0.38 * scale, 0.35 * scale, 0, 0, 0, -0.35);
      for (const s of [-1, 1]) {
        addMesh(g, new THREE.BoxGeometry(0.55 * scale, 0.06 * scale, 0.85 * scale), mat, 0, 0.22 * scale, s * 0.45 * scale, s * wingSpread, 0, 0);
      }
      return g;
    };

    const flightGroup = new THREE.Group();
    flightGroup.name = 'Landmark_Swan_Lake_Flight_Of_Swans';
    flightGroup.position.set(-3.6, 0.15, 45.6);
    const glbSwans = glbRegistry?.cloneAsset('SBG_Flight_Of_Swans_Sculpture', false, 'sbg');
    if (glbSwans) {
      glbSwans.scale.setScalar(1.0);
      flightGroup.add(glbSwans);
    } else {
      addMesh(flightGroup, new THREE.CylinderGeometry(0.65, 0.95, 0.65, 12), mossRockMat, 0, 0.32, 0);
      for (const [sx, sy, sz, sc, ws, m] of [[0, 0.9, 0, 1.0, 0.55, bronzeSwanMat], [-0.7, 1.35, 0.5, 0.9, 0.7, whiteSwanMat], [0.7, 1.65, -0.4, 0.95, 0.65, whiteSwanMat]]) {
        const sw = makeSwan(m, sc, ws);
        sw.position.set(sx, sy, sz);
        flightGroup.add(sw);
      }
    }
    landmarksGroup.add(flightGroup);

    const blackSwans = new THREE.Group();
    blackSwans.name = 'Landmark_Eco_Lake_Black_Swans';
    blackSwans.position.set(1.0, 0.08, -43.0);
    for (const [bx, bz, rot] of [[-0.8, -0.4, 0.4], [0.7, 0.5, -0.8], [0.1, -0.9, 1.2]]) {
      const bs = makeSwan(blackSwanMat, 0.82, 0.12);
      bs.position.set(bx, 0.18, bz);
      bs.rotation.y = rot;
      blackSwans.add(bs);
    }
    landmarksGroup.add(blackSwans);
  }

  // 7. TANGLIN GATE ROTUNDA (+11.5, +58.0), CLUNY COACH BAY (+19.0, -24.0), EJH CORNER HOUSE (-8.5, +24.0),
  //    ECO-GARDEN PAVILION (-10.0, -54.0), NASSIM CLOCK TOWER (+25.6, +7.0), INVERTURRET (-46.0, +54.0), BUKIT TIMAH GATE (-2.4, -59.0)
  {
    const rotunda = new THREE.Group();
    rotunda.name = 'Landmark_Tanglin_Gate_Rotunda';
    rotunda.position.set(11.5, 0, 58.0);
    addMesh(rotunda, new THREE.CylinderGeometry(2.4, 2.6, 0.35, 24), colonialWhiteMat, 0, 0.18, 0);
    addMesh(rotunda, new THREE.CylinderGeometry(0.45, 0.65, 2.6, 16), colonialWhiteMat, 0, 1.45, 0);
    addMesh(rotunda, new THREE.ConeGeometry(3.3, 1.2, 24), terracottaRoofMat, 0, 3.15, 0);
    landmarksGroup.add(rotunda);

    const coach = new THREE.Group();
    coach.name = 'Landmark_Cluny_Coach_Bay';
    coach.position.set(19.0, 0, -24.0);
    coach.rotation.y = -0.22;
    for (const bx of [-2.4, 2.4]) {
      addMesh(coach, new THREE.BoxGeometry(3.4, 0.22, 2.2), colonialWhiteMat, bx, 2.1, 0);
      addMesh(coach, new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), blackTimberMat, bx - 1.3, 1.05, 0);
      addMesh(coach, new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), blackTimberMat, bx + 1.3, 1.05, 0);
    }
    landmarksGroup.add(coach);

    const ejhCornerHouse = new THREE.Group();
    ejhCornerHouse.name = 'Landmark_EJH_Corner_House_1910';
    ejhCornerHouse.position.set(-8.5, 0, 24.0);
    ejhCornerHouse.rotation.y = 0.28;
    addMesh(ejhCornerHouse, new THREE.BoxGeometry(4.6, 2.8, 3.6), colonialWhiteMat, 0, 1.4, 0);
    addMesh(ejhCornerHouse, new THREE.BoxGeometry(4.8, 0.14, 3.8), blackTimberMat, 0, 1.85, 0);
    addMesh(ejhCornerHouse, new THREE.ConeGeometry(3.6, 1.5, 4), terracottaRoofMat, 0, 3.55, 0, 0, Math.PI / 4, 0);
    addHeritageDoorway(ejhCornerHouse, { x: 0, y: 0, z: 1.82, width: 1.7, height: 1.85 });
    landmarksGroup.add(ejhCornerHouse);

    const ecoPavilion = new THREE.Group();
    ecoPavilion.name = 'Landmark_Eco_Garden_Pavilion';
    ecoPavilion.position.set(-10.0, 0, -54.0);
    ecoPavilion.rotation.y = -0.35;
    for (const [px, pz] of [[-2.4, -1.2], [2.4, 1.2]]) {
      addMesh(ecoPavilion, new THREE.BoxGeometry(4.2, 1.8, 3.4), colonialWhiteMat, px, 0.9, pz);
      addMesh(ecoPavilion, new THREE.ConeGeometry(3.4, 1.5, 4), terracottaRoofMat, px, 2.55, pz, 0, Math.PI / 4, 0);
    }
    addHeritageDoorway(ecoPavilion, { x: 2.4, y: 0, z: 2.92, width: 2.2, height: 2.2 });
    landmarksGroup.add(ecoPavilion);

    const clockGroup = new THREE.Group();
    clockGroup.name = 'Landmark_Palm_Valley_Clock_Tower';
    clockGroup.position.set(25.6, 0, 7.0);
    clockGroup.rotation.y = -0.35;
    const glbClock = glbRegistry?.cloneAsset('SBG_Nassim_Clock_Tower_Gate', false, 'sbg');
    if (glbClock) {
      glbClock.scale.setScalar(1.0);
      clockGroup.add(glbClock);
    } else {
      addMesh(clockGroup, new THREE.BoxGeometry(1.4, 4.2, 1.4), colonialWhiteMat, 0, 2.1, 0);
      addMesh(clockGroup, new THREE.CylinderGeometry(0.48, 0.48, 1.48, 16), goldStageGlowMat, 0, 3.45, 0, Math.PI / 2, 0, 0);
      addMesh(clockGroup, new THREE.ConeGeometry(1.15, 1.35, 4), terracottaRoofMat, 0, 4.85, 0, 0, Math.PI / 4, 0);
      for (const [px, pz] of [[-1.8, -0.8], [1.8, 0.8]]) {
        addMesh(clockGroup, new THREE.BoxGeometry(2.8, 1.8, 1.6), colonialWhiteMat, px, 0.9, pz);
        addHeritageDoorway(clockGroup, { x: px, y: 0, z: pz + 0.84, width: 1.5, height: 1.75 });
      }
    }
    landmarksGroup.add(clockGroup);

    const inverturret = new THREE.Group();
    inverturret.name = 'Landmark_Inverturret_House';
    inverturret.position.set(-46.0, 0, 54.0);
    inverturret.rotation.y = 0.25;
    const glbInverturret = glbRegistry?.cloneAsset('SBG_Inverturret_Gallery_1906', false, 'sbg');
    if (glbInverturret) {
      glbInverturret.scale.setScalar(1.0);
      inverturret.add(glbInverturret);
    } else {
      addMesh(inverturret, new THREE.BoxGeometry(5.6, 2.8, 4.2), colonialWhiteMat, 0, 1.4, 0);
      addMesh(inverturret, new THREE.BoxGeometry(5.9, 0.32, 4.5), terracottaRoofMat, 0, 2.9, 0);
      addHeritageDoorway(inverturret, { x: 0, y: 0, z: 2.12, width: 2.2, height: 2.2 });
    }
    landmarksGroup.add(inverturret);

    const bukitTimahPlaza = new THREE.Group();
    bukitTimahPlaza.name = 'Landmark_Bukit_Timah_Orchid_Plaza';
    bukitTimahPlaza.position.set(-2.4, 0, -59.0);
    bukitTimahPlaza.rotation.y = 0.0;
    addMesh(bukitTimahPlaza, new THREE.CylinderGeometry(3.8, 4.2, 2.2, 24), domePhysicalGlassMat, 0, 1.1, 0);
    addMesh(bukitTimahPlaza, new THREE.CylinderGeometry(4.1, 4.3, 0.42, 24), colonialWhiteMat, 0, 2.35, 0);
    addHeritageDoorway(bukitTimahPlaza, { x: 0, y: 0, z: 4.05, width: 2.0, height: 2.0 });
    landmarksGroup.add(bukitTimahPlaza);

    const logGroup = new THREE.Group();
    logGroup.name = 'Landmark_Rainforest_Hollow_Log';
    logGroup.position.set(25.0, 0, 17.0);
    logGroup.rotation.y = 0.6;
    addMesh(logGroup, new THREE.CylinderGeometry(0.95, 1.1, 4.2, 14), warmTeakMat, 0, 0.95, 0, 0, 0, Math.PI / 2);
    landmarksGroup.add(logGroup);
  }
}
