// ============================================================================
// Gardens by the Bay — Procedural Visitor Map Attractions & Mockup Doorways
// Extracted from src/world/LandmarksBuilder.js (Section 5b)
// ============================================================================

import { getTerrainElevationAt } from '../../WorldPhysicsEngine.js';

export function buildProceduralVisitorAttractions(
  THREE,
  landmarksGroup,
  domePhysicalGlassMat,
  supertreeEmissiveMaterials
) {
  const coralRedMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.35, metalness: 0.2 });
  const warmTimberMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.55, metalness: 0.12 });
  const creamRoofMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.32, metalness: 0.15 });
  const canyonRockMat = new THREE.MeshStandardMaterial({ color: 0xC2410C, roughness: 0.78, metalness: 0.06 });
  const cactusGreenMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.58, metalness: 0.05 });
  const satayRoofMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.42, metalness: 0.18 });
  const zenStoneMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.72, metalness: 0.08 });

  // (B) #2 The Canopy & #32 Friends of the Gardens at (24.5, 0, -22.5)
  {
    const canopyPlaza = new THREE.Group();
    canopyPlaza.name = 'Landmark_The_Canopy';
    canopyPlaza.position.set(24.5, 0, -22.5);
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 0.35, 24, 1, true), warmTimberMat);
    roof.position.y = 2.4;
    const glassDome = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.14, 24), domePhysicalGlassMat);
    glassDome.position.y = 2.52;
    canopyPlaza.add(roof, glassDome);
    const canopyColGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.4, 12);
    for (const [cx, cz] of [[-4.0, 0], [4.0, 0], [0, -4.0], [0, 4.0]]) {
      const col = new THREE.Mesh(canopyColGeo, warmTimberMat);
      col.position.set(cx, 1.2, cz);
      col.castShadow = true;
      canopyPlaza.add(col);
    }
    landmarksGroup.add(canopyPlaza);
  }

  // Helper to attach an explicit architectural open double-doorway + warm interior threshold glow + runner carpet
  function addMockupDoorway(parentGroup, {
    x = 0,
    y = 0,
    z = 0,
    rotY = 0,
    width = 2.0,
    height = 2.0,
    frameColor = 0x1E293B,
    glowColor = 0xFEF08A,
    carpetColor = 0x991B1B
  } = {}) {
    const doorGroup = new THREE.Group();
    doorGroup.name = `MockupDoorway_${parentGroup.name}`;
    doorGroup.position.set(x, y, z);
    doorGroup.rotation.y = rotY;

    const frameMat = new THREE.MeshStandardMaterial({
      color: frameColor,
      metalness: 0.55,
      roughness: 0.32
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xFACC15,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.65,
      metalness: 0.72,
      roughness: 0.22
    });
    const interiorGlowMat = new THREE.MeshStandardMaterial({
      color: glowColor,
      emissive: glowColor,
      emissiveIntensity: 0.9,
      roughness: 0.25
    });
    supertreeEmissiveMaterials.push(brassMat, interiorGlowMat);

    // Recessed warm-lit interior threshold backing
    const recessBacking = new THREE.Mesh(
      new THREE.BoxGeometry(width - 0.16, height - 0.1, 0.12),
      interiorGlowMat
    );
    recessBacking.position.set(0, height * 0.5, -0.06);
    doorGroup.add(recessBacking);

    // Left & right architectural door jambs
    const jambGeo = new THREE.BoxGeometry(0.18, height, 0.36);
    const leftJamb = new THREE.Mesh(jambGeo, frameMat);
    leftJamb.position.set(-width * 0.5, height * 0.5, 0.08);
    const rightJamb = new THREE.Mesh(jambGeo, frameMat);
    rightJamb.position.set(width * 0.5, height * 0.5, 0.08);
    doorGroup.add(leftJamb, rightJamb);

    // Overhead canopy lintel + illuminated gold arch header
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.44, 0.24, 0.68),
      frameMat
    );
    lintel.position.set(0, height + 0.1, 0.18);
    lintel.castShadow = true;
    const archHeader = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.16, 0.12, 0.16),
      brassMat
    );
    archHeader.position.set(0, height + 0.1, 0.52);
    doorGroup.add(lintel, archHeader);

    // Two open glass double-door panels swung outward at ±65° in bright brass frames
    const leafW = width * 0.44;
    const leafH = height - 0.12;
    const swingAngle = (65 * Math.PI) / 180;

    for (const side of [-1, 1]) {
      const hingePivot = new THREE.Group();
      hingePivot.name = side < 0 ? 'doorLeafL' : 'doorLeafR';
      hingePivot.position.set(side * (width * 0.5 - 0.08), 0, 0.14);
      hingePivot.rotation.y = side * swingAngle;

      const glassPanel = new THREE.Mesh(
        new THREE.BoxGeometry(leafW, leafH, 0.05),
        domePhysicalGlassMat
      );
      glassPanel.position.set(-side * (leafW * 0.5), leafH * 0.5, 0);

      const brassFrame = new THREE.Mesh(
        new THREE.BoxGeometry(leafW + 0.04, leafH + 0.04, 0.07),
        brassMat
      );
      brassFrame.position.set(-side * (leafW * 0.5), leafH * 0.5, 0);

      hingePivot.add(brassFrame, glassPanel);
      doorGroup.add(hingePivot);
    }

    // Entrance runner carpet & sandstone step at y = 0.14
    const runnerCarpet = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 0.06, 1.65),
      new THREE.MeshStandardMaterial({ color: carpetColor, roughness: 0.65 })
    );
    runnerCarpet.position.set(0, 0.14, 0.58);
    const goldCarpetTrim = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.32, 0.05, 1.75),
      brassMat
    );
    goldCarpetTrim.position.set(0, 0.12, 0.58);
    doorGroup.add(goldCarpetTrim, runnerCarpet);

    parentGroup.add(doorGroup);
    return doorGroup;
  }

  // (C) #22 Sun Pavilion (40.5, 0, -5.5) & #24 The Canyon (47.0, 0, -13.5)
  {
    const sunPav = new THREE.Group();
    sunPav.name = 'Landmark_Sun_Pavilion';
    sunPav.position.set(40.5, 0, -5.5);
    sunPav.rotation.y = 0.35;
    const sandBed = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.8, 0.16, 20),
      new THREE.MeshStandardMaterial({ color: 0xEAB308, roughness: 0.85 })
    );
    sandBed.position.y = 0.08;
    const glassRoof = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.2, 3.4), domePhysicalGlassMat);
    glassRoof.position.y = 1.15;
    sunPav.add(sandBed, glassRoof);
    for (const [cx, cz, ch] of [[-1.4, -0.5, 1.6], [0.2, 0.6, 1.9], [1.5, -0.4, 1.4]]) {
      const cactus = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, ch, 8), cactusGreenMat);
      cactus.position.set(cx, ch * 0.5 + 0.1, cz);
      sunPav.add(cactus);
    }
    addMockupDoorway(sunPav, {
      x: 0,
      y: 0,
      z: 1.72,
      rotY: 0,
      width: 1.8,
      height: 1.9,
      frameColor: 0xB45309,
      glowColor: 0xFDE047,
      carpetColor: 0xD97706
    });
    landmarksGroup.add(sunPav);

    const canyonGroup = new THREE.Group();
    canyonGroup.name = 'Landmark_The_Canyon';
    canyonGroup.position.set(47.0, 0, -13.5);
    const rockSpecs = [
      [-1.8, -0.8, 1.3, 2.4],
      [0.4, -1.2, 1.5, 2.9],
      [2.1, 0.5, 1.2, 2.1],
      [-0.6, 1.4, 1.1, 1.9]
    ];
    for (const [rx, rz, rad, rh] of rockSpecs) {
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(rad, 1), canyonRockMat);
      rock.scale.set(1.0, rh / rad, 0.85);
      rock.position.set(rx, rh * 0.45, rz);
      rock.castShadow = true;
      canyonGroup.add(rock);
    }
    landmarksGroup.add(canyonGroup);
  }

  // (D) g Satay by the Bay at (74.0, 0, 15.0)
  {
    const satayGroup = new THREE.Group();
    satayGroup.name = 'Landmark_Satay_By_The_Bay';
    satayGroup.position.set(74.0, 0, 15.0);
    satayGroup.rotation.y = -0.35;
    for (const [px, pz] of [[-2.4, -1.2], [2.4, 1.2]]) {
      const base = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.6, 3.4), warmTimberMat);
      base.position.set(px, 0.8, pz);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.5, 4), satayRoofMat);
      roof.position.set(px, 2.35, pz);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      satayGroup.add(base, roof);
    }
    addMockupDoorway(satayGroup, {
      x: 2.4,
      y: 0,
      z: 2.92,
      rotY: 0,
      width: 2.2,
      height: 2.2,
      frameColor: 0x92400E,
      glowColor: 0xFBBF24,
      carpetColor: 0xB91C1C
    });
    landmarksGroup.add(satayGroup);
  }

  // (E) #26 Floral Fantasy & Bayfront Plaza at (-50.0, 0, -11.0)
  {
    const bayfrontGroup = new THREE.Group();
    bayfrontGroup.name = 'Landmark_Floral_Fantasy_Bayfront_Plaza';
    bayfrontGroup.position.set(-50.0, 0, -11.0);
    bayfrontGroup.rotation.y = 0.42;
    const hall = new THREE.Mesh(new THREE.CylinderGeometry(3.8, 4.2, 2.2, 24), domePhysicalGlassMat);
    hall.position.y = 1.1;
    const floralRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(4.1, 4.3, 0.42, 24),
      new THREE.MeshStandardMaterial({ color: 0xEC4899, roughness: 0.55 })
    );
    floralRoof.position.y = 2.35;
    bayfrontGroup.add(hall, floralRoof);
    addMockupDoorway(bayfrontGroup, {
      x: 0,
      y: 0,
      z: 4.05,
      rotY: 0,
      width: 2.0,
      height: 2.0,
      frameColor: 0xDB2777,
      glowColor: 0xFBCFE8,
      carpetColor: 0xBE185D
    });
    landmarksGroup.add(bayfrontGroup);
  }

  // (F) #27 Active Garden (-37.0, 0, -28.0) & #37 IMBA Theatre (-41.0, 0, -20.0)
  {
    const imbaGroup = new THREE.Group();
    imbaGroup.name = 'Landmark_IMBA_Theatre';
    imbaGroup.position.set(-41.0, 0, -20.0);
    imbaGroup.rotation.y = 0.42;
    const imbaBox = new THREE.Mesh(new THREE.BoxGeometry(5.6, 2.8, 4.2), creamRoofMat);
    imbaBox.position.y = 1.4;
    imbaBox.castShadow = true;
    const imbaTrim = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.28, 4.4), coralRedMat);
    imbaTrim.position.y = 2.85;
    imbaGroup.add(imbaBox, imbaTrim);
    addMockupDoorway(imbaGroup, {
      x: 0,
      y: 0,
      z: 2.12,
      rotY: 0,
      width: 2.2,
      height: 2.2,
      frameColor: 0xDC2626,
      glowColor: 0xFEF08A,
      carpetColor: 0x991B1B
    });
    landmarksGroup.add(imbaGroup);

    const activeGroup = new THREE.Group();
    activeGroup.name = 'Landmark_Active_Garden';
    activeGroup.position.set(-37.0, 0, -28.0);
    activeGroup.rotation.y = 0.42;
    const activeRoof = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.24, 3.2), warmTimberMat);
    activeRoof.position.y = 2.2;
    activeRoof.castShadow = true;
    for (const [cx, cz] of [[-1.9, -1.2], [1.9, -1.2], [-1.9, 1.2], [1.9, 1.2]]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), warmTimberMat);
      col.position.set(cx, 1.1, cz);
      activeGroup.add(col);
    }
    activeGroup.add(activeRoof);
    landmarksGroup.add(activeGroup);
  }

  // (G) World of Plants Sculptures: #9 Discovery Hollow Log (-6.0, 0, 21.5) & #10 Web of Life Topiary (20.5, 0, 7.5)
  {
    const logGroup = new THREE.Group();
    logGroup.name = 'Landmark_Discovery_Hollow_Log';
    logGroup.position.set(-6.0, 0, 21.5);
    logGroup.rotation.y = 0.6;
    const hollowLog = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.1, 4.2, 14), warmTimberMat);
    hollowLog.rotation.z = Math.PI / 2;
    hollowLog.position.y = 0.95;
    hollowLog.castShadow = true;
    logGroup.add(hollowLog);
    landmarksGroup.add(logGroup);

    const webGroup = new THREE.Group();
    webGroup.name = 'Landmark_Web_Of_Life';
    webGroup.position.set(20.5, 0, 7.5);
    const topiaryArch = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.42, 10, 24, Math.PI), cactusGreenMat);
    topiaryArch.position.y = 0.2;
    topiaryArch.castShadow = true;
    webGroup.add(topiaryArch);
    landmarksGroup.add(webGroup);
  }

  // (H) #36 Garden Pod Eco-Hotel (-42.0, 0, 38.0) & #21 Serene Garden Zen Rocks (-50.0, 0, 31.0)
  {
    const podGroup = new THREE.Group();
    podGroup.name = 'Landmark_Garden_Pod';
    podGroup.position.set(-42.0, 0, 38.0);
    podGroup.rotation.y = 0.35;
    for (const [px, pz] of [[-1.8, -0.8], [1.8, 0.8]]) {
      const pod = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.8, 1.6), creamRoofMat);
      pod.position.set(px, 0.9, pz);
      pod.castShadow = true;
      const glassFront = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.66), domePhysicalGlassMat);
      glassFront.position.set(px, 0.9, pz);
      podGroup.add(pod, glassFront);
      addMockupDoorway(podGroup, {
        x: px,
        y: 0,
        z: pz + 0.84,
        rotY: 0,
        width: 1.5,
        height: 1.75,
        frameColor: 0x334155,
        glowColor: 0xFDE68A,
        carpetColor: 0xB45309
      });
    }
    landmarksGroup.add(podGroup);

    const zenGroup = new THREE.Group();
    zenGroup.name = 'Landmark_Serene_Zen_Rocks';
    const zenBaseY = getTerrainElevationAt(-50.0, 31.0);
    zenGroup.position.set(-50.0, zenBaseY, 31.0);
    for (const [zx, zz, zr] of [[-1.6, -1.2, 0.85], [0.8, -0.6, 0.65], [1.8, 1.1, 0.75], [-0.5, 1.5, 0.6]]) {
      const zb = new THREE.Mesh(new THREE.DodecahedronGeometry(zr, 1), zenStoneMat);
      zb.scale.set(1.1, 0.75, 0.95);
      zb.position.set(zx, zr * 0.45, zz);
      zb.castShadow = true;
      zenGroup.add(zb);
    }
    landmarksGroup.add(zenGroup);
  }
}
