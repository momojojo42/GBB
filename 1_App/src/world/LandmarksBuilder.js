// ============================================================================
// Gardens by the Bay — 3D Buildings, Bridges & Sculptures Builder (v2.0)
// Powered by Headless Blender 4.2 .glb Assets + Three.js PBR Materials
// (src/world/LandmarksBuilder.js)
// ============================================================================

import { createMaterialAndTextureLibrary } from '../core/MaterialAndTextureLibrary.js';
import { getActiveMapId } from '../data/MapRegistry.js';
import { WORLD_BUILDINGS, getBuildingDoorWaypoints, getTerrainElevationAt } from './WorldPhysicsEngine.js';
import { buildSupertreesSkywayAndDomes } from './landmarks/gbb/SupertreesAndDomesBuilder.js';
import { buildProceduralVisitorAttractions } from './landmarks/gbb/ProceduralAttractionsBuilder.js';
import { buildSBGTreesWalkwayAndConservatories } from './landmarks/sbg/SBGMainLandmarksBuilder.js';
import { buildSBGHistoricAttractions } from './landmarks/sbg/SBGAttractionsBuilder.js';
import { createGardenRhapsodyShow } from './fx/GardenRhapsodyShow.js';

export { buildSupertreesSkywayAndDomes };

export function buildAllLandmarks(THREE, glbRegistry = null, sharedMatLib = null) {
  const safeGlb = glbRegistry && typeof glbRegistry.cloneAsset === 'function' ? glbRegistry : null;
  const matLib = sharedMatLib || createMaterialAndTextureLibrary(THREE);
  const isSBG = getActiveMapId() === 'sbg';

  const landmarksGroup = new THREE.Group();
  landmarksGroup.name = 'AllLandmarksGroup';

  const supertreeCanopyMaterials = [];
  const supertreeEmissiveMaterials = [];
  const conservatoryGlassMaterials = [];
  const animatedWaterfalls = [];

  // Shared refractive glass material for Conservatories
  const domePhysicalGlassMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#CBEAFE'),
    transparent: true,
    opacity: 0.44,
    roughness: 0.08,
    metalness: 0.15,
    transmission: 0.48,
    ior: 1.45,
    reflectivity: 0.9,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.35
  });
  conservatoryGlassMaterials.push(domePhysicalGlassMat);

  if (isSBG) {
    // ------------------------------------------------------------------------
    // Map 02: Singapore Botanic Gardens (UNESCO World Heritage) 3D Landmarks
    // ------------------------------------------------------------------------
    buildSBGTreesWalkwayAndConservatories({
      THREE,
      glbRegistry: safeGlb,
      matLib,
      landmarksGroup,
      domePhysicalGlassMat,
      supertreeCanopyMaterials,
      supertreeEmissiveMaterials,
      animatedWaterfalls
    });
    buildSBGHistoricAttractions({
      THREE,
      glbRegistry: safeGlb,
      matLib,
      landmarksGroup,
      domePhysicalGlassMat,
      supertreeEmissiveMaterials,
      animatedWaterfalls
    });
  } else {
    // ------------------------------------------------------------------------
    // Map 01: Gardens by the Bay (Bay South) 18 Supertrees, Skyway & Landmarks
    // ------------------------------------------------------------------------
    buildSupertreesSkywayAndDomes({
      THREE,
      glbRegistry: safeGlb,
      matLib,
      landmarksGroup,
      domePhysicalGlassMat,
      supertreeCanopyMaterials,
      supertreeEmissiveMaterials,
      animatedWaterfalls
    });

    // (A) Main Entrance Red 'Drop Off' Rotunda Canopy at (28.5, 0, 5.5) & Coach Bay P at (37.0, 0, 14.5)
    {
      const coralRedMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.35, metalness: 0.2 });
      const warmTimberMat = new THREE.MeshStandardMaterial({ color: 0xB45309, roughness: 0.55, metalness: 0.12 });
      const creamRoofMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.32, metalness: 0.15 });

      const dropOffGroup = new THREE.Group();
      dropOffGroup.name = 'Landmark_Main_Entrance_Drop_Off';
      dropOffGroup.position.set(28.5, 0, 5.5);
      const centerPlinth = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 0.35, 24), creamRoofMat);
      centerPlinth.position.y = 0.18;
      const centerColumn = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.65, 2.6, 16), coralRedMat);
      centerColumn.position.y = 1.45;
      const canopyRing = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 2.6, 0.28, 28), coralRedMat);
      canopyRing.position.y = 2.75;
      canopyRing.castShadow = true;
      dropOffGroup.add(centerPlinth, centerColumn, canopyRing);
      landmarksGroup.add(dropOffGroup);

      const coachGroup = new THREE.Group();
      coachGroup.name = 'Landmark_Coach_Bay_P';
      coachGroup.position.set(37.0, 0, 14.5);
      coachGroup.rotation.y = -0.22;
      for (const bx of [-2.4, 2.4]) {
        const shelter = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.18, 2.2), creamRoofMat);
        shelter.position.set(bx, 2.1, 0);
        shelter.castShadow = true;
        const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), warmTimberMat);
        postL.position.set(bx - 1.3, 1.05, 0);
        const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.1, 8), warmTimberMat);
        postR.position.set(bx + 1.3, 1.05, 0);
        coachGroup.add(shelter, postL, postR);
      }
      landmarksGroup.add(coachGroup);
    }

    // 5b. Official Visitor Map Additional Procedural Attractions & Mockup Doorways
    buildProceduralVisitorAttractions(
      THREE,
      landmarksGroup,
      domePhysicalGlassMat,
      supertreeEmissiveMaterials
    );
  }

  // --------------------------------------------------------------------------
  // 6. Architectural Entrance Doorway Portals for Enterable Buildings
  // --------------------------------------------------------------------------
  const portalSteelMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.78, roughness: 0.25 });
  const portalTimberMat = new THREE.MeshStandardMaterial({ color: 0xB45309, metalness: 0.15, roughness: 0.45 });
  const portalGoldMat = new THREE.MeshStandardMaterial({
    color: 0xFACC15,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.65,
    metalness: 0.65,
    roughness: 0.25
  });
  const portalBeaconMat = new THREE.MeshStandardMaterial({
    color: 0x34D399,
    emissive: 0x10B981,
    emissiveIntensity: 1.15,
    roughness: 0.2,
    metalness: 0.3
  });
  const portalWarmThresholdMat = new THREE.MeshStandardMaterial({
    color: 0xFEF08A,
    emissive: 0xF59E0B,
    emissiveIntensity: 0.75,
    roughness: 0.3,
    transparent: true,
    opacity: 0.45
  });
  const runnerCarpetMat = new THREE.MeshStandardMaterial({ color: 0x991B1B, roughness: 0.6 });
  supertreeEmissiveMaterials.push(portalGoldMat, portalBeaconMat, portalWarmThresholdMat);

  for (const b of WORLD_BUILDINGS) {
    if (b.openAirPavilion || b.id === 'skylight_pavilion' || b.id === 'serene_pavilion') continue;
    const isConservatory = b.id === 'flower_dome' || b.id === 'cloud_forest';
    const frameMat = isConservatory ? portalSteelMat : portalTimberMat;

    const wp = getBuildingDoorWaypoints(b);
    const doorWorldX = wp.thresholdX;
    const doorWorldZ = wp.thresholdZ;
    const doorRotY = b.doorWorldAngle;

    const portalGroup = new THREE.Group();
    portalGroup.name = `DoorwayPortal_${b.id}`;
    const portalBaseY = getTerrainElevationAt(doorWorldX, doorWorldZ);
    portalGroup.position.set(doorWorldX, portalBaseY, doorWorldZ);
    portalGroup.rotation.y = doorRotY;

    const portalW = isConservatory ? 3.8 : 2.6;
    const portalH = Math.max(isConservatory ? 3.4 : 3.1, b.portalHeight || 0);
    const portalDepth = isConservatory ? 2.4 : 1.45;

    const matGeo = new THREE.BoxGeometry(portalW + 0.6, 0.08, portalDepth + 2.6);
    const matMesh = new THREE.Mesh(
      matGeo,
      new THREE.MeshStandardMaterial({ color: isConservatory ? 0x0F766E : 0xD97706, roughness: 0.65 })
    );
    matMesh.position.set(0, 0.06, 0.25);
    matMesh.receiveShadow = true;
    portalGroup.add(matMesh);

    const runnerMesh = new THREE.Mesh(new THREE.BoxGeometry(portalW * 0.72, 0.06, portalDepth + 3.2), runnerCarpetMat);
    runnerMesh.position.set(0, 0.14, 0.35);
    runnerMesh.receiveShadow = true;
    const runnerGoldBorder = new THREE.Mesh(
      new THREE.BoxGeometry(portalW * 0.82, 0.05, portalDepth + 3.3),
      portalGoldMat
    );
    runnerGoldBorder.position.set(0, 0.12, 0.35);
    portalGroup.add(runnerGoldBorder, runnerMesh);

    const stripGeo = new THREE.BoxGeometry(portalW + 0.4, 0.09, 0.14);
    const frontStrip = new THREE.Mesh(stripGeo, portalGoldMat);
    frontStrip.position.set(0, 0.15, portalDepth * 0.5 + 0.9);
    const innerStrip = new THREE.Mesh(stripGeo, portalGoldMat);
    innerStrip.position.set(0, 0.15, -portalDepth * 0.5 - 0.3);
    portalGroup.add(frontStrip, innerStrip);

    const backingFrame = new THREE.Mesh(
      new THREE.BoxGeometry(portalW + 0.15, portalH - 0.1, 0.12),
      portalWarmThresholdMat
    );
    backingFrame.position.set(0, portalH * 0.5, -portalDepth * 0.35);
    portalGroup.add(backingFrame);

    const pillarGeo = new THREE.BoxGeometry(0.32, portalH, portalDepth);
    const leftPillar = new THREE.Mesh(pillarGeo, frameMat);
    leftPillar.position.set(-portalW * 0.5, portalH * 0.5, 0);
    leftPillar.castShadow = true;
    const rightPillar = new THREE.Mesh(pillarGeo, frameMat);
    rightPillar.position.set(portalW * 0.5, portalH * 0.5, 0);
    rightPillar.castShadow = true;
    portalGroup.add(leftPillar, rightPillar);

    const lintel = new THREE.Mesh(new THREE.BoxGeometry(portalW + 0.65, 0.36, portalDepth + 0.5), frameMat);
    lintel.position.set(0, portalH + 0.14, 0.1);
    lintel.castShadow = true;
    const goldArchLintel = new THREE.Mesh(
      new THREE.BoxGeometry(portalW + 0.45, 0.22, portalDepth + 0.62),
      portalGoldMat
    );
    goldArchLintel.position.set(0, portalH + 0.38, 0.14);
    const headerGlow = new THREE.Mesh(new THREE.BoxGeometry(portalW - 0.3, 0.14, 0.12), portalBeaconMat);
    headerGlow.position.set(0, portalH + 0.14, portalDepth * 0.5 + 0.28);
    portalGroup.add(lintel, goldArchLintel, headerGlow);

    const leafW = portalW * 0.42;
    const leafH = portalH - 0.18;
    const swingAngle = (65 * Math.PI) / 180;

    for (const side of [-1, 1]) {
      const doorLeaf = new THREE.Group();
      doorLeaf.name = side < 0 ? 'doorLeafL' : 'doorLeafR';
      doorLeaf.position.set(side * (portalW * 0.5 - 0.16), 0, portalDepth * 0.45);
      doorLeaf.rotation.y = side * swingAngle;
      const brassFrame = new THREE.Mesh(new THREE.BoxGeometry(leafW + 0.08, leafH + 0.08, 0.1), portalGoldMat);
      brassFrame.position.set(-side * (leafW * 0.5), leafH * 0.5 + 0.12, 0);
      const glassLeaf = new THREE.Mesh(new THREE.BoxGeometry(leafW, leafH, 0.12), domePhysicalGlassMat);
      glassLeaf.position.set(-side * (leafW * 0.5), leafH * 0.5 + 0.12, 0);
      doorLeaf.add(brassFrame, glassLeaf);
      portalGroup.add(doorLeaf);
    }

    const bollardPostGeo = new THREE.CylinderGeometry(0.11, 0.13, 0.65, 10);
    const bollardOrbGeo = new THREE.SphereGeometry(0.15, 12, 10);
    for (const side of [-1, 1]) {
      const bx = side * (portalW * 0.5 + 0.45);
      const bz = portalDepth * 0.5 + 0.85;
      const post = new THREE.Mesh(bollardPostGeo, frameMat);
      post.position.set(bx, 0.32, bz);
      const orb = new THREE.Mesh(bollardOrbGeo, portalBeaconMat);
      orb.position.set(bx, 0.72, bz);
      portalGroup.add(post, orb);
    }

    landmarksGroup.add(portalGroup);
  }

  // --------------------------------------------------------------------------
  // 7. Garden Rhapsody Firefly / Light-Mote Show & Material Settings
  // --------------------------------------------------------------------------
  const rhapsodyShow = createGardenRhapsodyShow({
    THREE,
    landmarksGroup,
    supertreeCanopyMaterials,
    supertreeEmissiveMaterials,
    conservatoryGlassMaterials,
    animatedWaterfalls
  });

  return {
    landmarksGroup,
    rhapsodyFireflies: rhapsodyShow.rhapsodyFireflies,
    applyMaterialSettings: rhapsodyShow.applyMaterialSettings,
    update: rhapsodyShow.update
  };
}
