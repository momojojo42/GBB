// ============================================================================
// Gardens by the Bay — Marina Gardens Drive Boulevard & Animated 3D Vehicles
// (src/world/BoulevardAndVehiclesBuilder.js)
// ============================================================================

import { getActiveMapId } from '../../data/MapRegistry.js';
import { ROAD_MAIN_POINTS, ROAD_APPROACH_POINTS } from '../../data/WorldMapSpec.js';
import { populateSuvOrSedanBody, createVehiclesAnimator } from './VehiclesAnimator.js';

export { populateSuvOrSedanBody, createVehiclesAnimator };

export function buildBoulevardAndVehicles(THREE, terrainGroup, matLib, baseBevelMat) {
  const isSBG = getActiveMapId() === 'sbg';

  // 5. Boulevard / Heritage Approach Drive, Main Entrance Drop-Off Loop & Coach Bay P
  const roadCurve = new THREE.CatmullRomCurve3(
    ROAD_MAIN_POINTS.map((p) => new THREE.Vector3(p.x, 0.08, p.z))
  );

  // Curb bed beneath asphalt
  const roadCurbGeo = new THREE.TubeGeometry(roadCurve, 72, isSBG ? 2.15 : 2.75, 10, false);
  roadCurbGeo.scale(1, 0.032, 1);
  const roadCurbMesh = new THREE.Mesh(roadCurbGeo, baseBevelMat);
  roadCurbMesh.position.y = 0.055;
  roadCurbMesh.receiveShadow = true;
  terrainGroup.add(roadCurbMesh);

  // Smooth dark asphalt road surface
  const roadGeo = new THREE.TubeGeometry(roadCurve, 72, isSBG ? 1.85 : 2.35, 10, false);
  roadGeo.scale(1, 0.035, 1);
  const roadMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.68, metalness: 0.08 });
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.position.y = 0.072;
  roadMesh.receiveShadow = true;
  terrainGroup.add(roadMesh);

  // Main Entrance Approach Road
  const entranceApproachCurve = new THREE.CatmullRomCurve3(
    ROAD_APPROACH_POINTS.map((p) => new THREE.Vector3(p.x, 0.08, p.z))
  );
  const approachCurbGeo = new THREE.TubeGeometry(entranceApproachCurve, 20, isSBG ? 1.85 : 2.35, 8, false);
  approachCurbGeo.scale(1, 0.032, 1);
  const approachCurbMesh = new THREE.Mesh(approachCurbGeo, baseBevelMat);
  approachCurbMesh.position.y = 0.055;
  terrainGroup.add(approachCurbMesh);

  const approachRoadGeo = new THREE.TubeGeometry(entranceApproachCurve, 20, isSBG ? 1.55 : 1.95, 8, false);
  approachRoadGeo.scale(1, 0.035, 1);
  const approachRoadMesh = new THREE.Mesh(approachRoadGeo, roadMat);
  approachRoadMesh.position.y = 0.072;
  terrainGroup.add(approachRoadMesh);

  // Drop-Off Roundabout Loop: Tanglin Gate Forecourt (11.5, 58.0) for SBG vs Red Loop (28.5, 5.5) for GBB
  const dropOffLoopMat = new THREE.MeshStandardMaterial({
    color: isSBG ? 0xD97706 : 0xEF4444,
    roughness: isSBG ? 0.54 : 0.42,
    metalness: 0.12
  });
  const dropOffRingGeo = new THREE.TorusGeometry(isSBG ? 2.8 : 4.2, isSBG ? 0.95 : 1.35, 12, 40);
  dropOffRingGeo.rotateX(Math.PI / 2);
  dropOffRingGeo.scale(1, 0.06, 1);
  const dropOffRingMesh = new THREE.Mesh(dropOffRingGeo, dropOffLoopMat);
  dropOffRingMesh.position.set(isSBG ? 11.5 : 28.5, 0.085, isSBG ? 58.0 : 5.5);
  dropOffRingMesh.receiveShadow = true;
  terrainGroup.add(dropOffRingMesh);

  // Coach Bay parking apron: Cluny Park Coach Bay (19.0, -24.0) for SBG vs East of Main Entrance (37.0, 14.5) for GBB
  const coachBayApron = new THREE.Mesh(
    new THREE.BoxGeometry(isSBG ? 6.8 : 9.2, 0.08, isSBG ? 3.6 : 5.2),
    roadMat
  );
  coachBayApron.position.set(isSBG ? 19.0 : 37.0, 0.065, isSBG ? -24.0 : 14.5);
  coachBayApron.rotation.y = -0.22;
  coachBayApron.receiveShadow = true;
  terrainGroup.add(coachBayApron);

  // Dashed center lane divider markings along Marina Gardens Drive
  const laneDashMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });
  const dashGeo = new THREE.BoxGeometry(0.12, 0.02, 1.05);
  for (let d = 1; d < 42; d++) {
    const t = d / 42;
    const pt = roadCurve.getPointAt(t);
    const nextPt = roadCurve.getPointAt(Math.min(1, t + 0.01));
    const dash = new THREE.Mesh(dashGeo, laneDashMat);
    dash.position.set(pt.x, 0.145, pt.z);
    dash.lookAt(nextPt.x, 0.145, nextPt.z);
    terrainGroup.add(dash);
  }

  // Detailed Multi-Part 3D Vehicle Builder (Electric Coupe, Garden Audio-Tour Eco-Shuttle, Botanical Rover SUV)
  const sharedTireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.85, metalness: 0.05 });
  const sharedRimMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.2, metalness: 0.88 });
  const sharedWindshieldMat = new THREE.MeshPhysicalMaterial({
    color: 0x0F172A,
    roughness: 0.08,
    metalness: 0.25,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.95
  });
  const sharedChromeMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.15, metalness: 0.92 });
  const sharedHeadlightMat = new THREE.MeshStandardMaterial({
    color: 0xFEF9C3,
    emissive: 0xFDE047,
    emissiveIntensity: 2.2,
    roughness: 0.1
  });
  const sharedTaillightMat = new THREE.MeshStandardMaterial({
    color: 0xEF4444,
    emissive: 0xDC2626,
    emissiveIntensity: 1.8,
    roughness: 0.15
  });
  const sharedCanopyWhiteMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.3, metalness: 0.1 });
  const sharedSeatTanMat = new THREE.MeshStandardMaterial({ color: 0xD97706, roughness: 0.65 });
  const sharedSolarMat = new THREE.MeshStandardMaterial({ color: 0x1E3A8A, roughness: 0.2, metalness: 0.6 });

  function createDetailedVehicleMesh(variant, colorHex) {
    const carRoot = new THREE.Group();
    const wheels = [];

    // Note: Three.js Object3D.lookAt() aligns local +Z with the forward target direction!
    // Therefore local +Z = FRONT of vehicle, -Z = REAR, +X = LEFT/RIGHT width, +Y = UP.
    const bodyPaintMat = new THREE.MeshPhysicalMaterial({
      color: colorHex,
      roughness: 0.22,
      metalness: 0.38,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12
    });

    // Soft ground contact shadow under vehicle
    if (matLib?.createContactShadowDisc) {
      const sh = matLib.createContactShadowDisc(1.15, 1.95, 0.02);
      carRoot.add(sh);
    }

    // Helper to add 4 detailed 3D wheels with rubber tread, alloy rim & center hubcap
    function addFourWheels(wheelX, frontZ, rearZ, wheelRadius, wheelWidth) {
      const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 20);
      tireGeo.rotateZ(Math.PI / 2);
      const rimGeo = new THREE.CylinderGeometry(wheelRadius * 0.64, wheelRadius * 0.64, wheelWidth * 1.05, 14);
      rimGeo.rotateZ(Math.PI / 2);
      const spokeGeo = new THREE.BoxGeometry(wheelWidth * 1.08, wheelRadius * 1.1, wheelRadius * 0.18);

      const positions = [
        [-wheelX, wheelRadius, frontZ],
        [wheelX, wheelRadius, frontZ],
        [-wheelX, wheelRadius, rearZ],
        [wheelX, wheelRadius, rearZ]
      ];
      for (const [wx, wy, wz] of positions) {
        const wPivot = new THREE.Group();
        wPivot.position.set(wx, wy, wz);
        const tire = new THREE.Mesh(tireGeo, sharedTireMat);
        tire.castShadow = true;
        const rim = new THREE.Mesh(rimGeo, sharedRimMat);
        const spoke1 = new THREE.Mesh(spokeGeo, sharedChromeMat);
        const spoke2 = new THREE.Mesh(spokeGeo, sharedChromeMat);
        spoke2.rotation.x = Math.PI / 2;
        wPivot.add(tire, rim, spoke1, spoke2);
        carRoot.add(wPivot);
        wheels.push(wPivot);
      }
    }

    if (variant === 'shuttle') {
      // Variant 1: Gardens by the Bay Open-Air Audio-Tour Eco-Shuttle Tram
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.34, 2.75), bodyPaintMat);
      chassis.position.set(0, 0.34, 0);
      chassis.castShadow = true;
      carRoot.add(chassis);

      // Front sculpted nose cowl + emerald/gold accent stripe
      const nose = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.36, 0.52), bodyPaintMat);
      nose.position.set(0, 0.52, 1.12);
      nose.castShadow = true;
      carRoot.add(nose);

      // Panoramic front windshield
      const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.56, 0.08), sharedWindshieldMat);
      windshield.position.set(0, 0.88, 1.18);
      windshield.rotation.x = -0.22;
      carRoot.add(windshield);

      // 3 rows of tan passenger bench seats inside the open-air shuttle
      for (const sz of [-0.85, -0.15, 0.55]) {
        const seatBase = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.12, 0.42), sharedSeatTanMat);
        seatBase.position.set(0, 0.56, sz);
        const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.28, 0.10), sharedSeatTanMat);
        seatBack.position.set(0, 0.72, sz - 0.16);
        carRoot.add(seatBase, seatBack);
      }

      // 6 slender chrome roof pillars + white solar canopy roof
      const pillarGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.78, 8);
      for (const px of [-0.52, 0.52]) {
        for (const pz of [-1.15, 0.0, 1.05]) {
          const pillar = new THREE.Mesh(pillarGeo, sharedChromeMat);
          pillar.position.set(px, 0.88, pz);
          carRoot.add(pillar);
        }
      }
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.24, 0.10, 2.65), sharedCanopyWhiteMat);
      canopy.position.set(0, 1.28, -0.02);
      canopy.castShadow = true;
      carRoot.add(canopy);

      // Rooftop solar panel strip
      const solarStrip = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.03, 1.85), sharedSolarMat);
      solarStrip.position.set(0, 1.34, -0.05);
      carRoot.add(solarStrip);

      // Front & rear chrome bumpers + dual LED headlights & taillights
      const fBumper = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.12, 0.12), sharedChromeMat);
      fBumper.position.set(0, 0.24, 1.38);
      const rBumper = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.12, 0.12), sharedChromeMat);
      rBumper.position.set(0, 0.24, -1.38);
      carRoot.add(fBumper, rBumper);

      for (const hx of [-0.40, 0.40]) {
        const hl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), sharedHeadlightMat);
        hl.rotation.x = Math.PI / 2;
        hl.position.set(hx, 0.48, 1.39);
        const tl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.10, 0.06), sharedTaillightMat);
        tl.position.set(hx, 0.42, -1.39);
        carRoot.add(hl, tl);
      }

      addFourWheels(0.60, 0.92, -0.92, 0.24, 0.18);
    } else {
      populateSuvOrSedanBody({
        THREE,
        variant,
        carRoot,
        bodyPaintMat,
        sharedWindshieldMat,
        sharedChromeMat,
        sharedTireMat,
        sharedHeadlightMat,
        sharedTaillightMat,
        addFourWheels
      });
    }

    // Scale vehicle slightly so it sits in harmonious architectural proportion with the boulevard & avatars
    carRoot.scale.setScalar(0.88);
    return { carRoot, wheels };
  }

  const { miniatureCars, updateVehicles } = createVehiclesAnimator(
    terrainGroup,
    roadCurve,
    createDetailedVehicleMesh
  );

  return {
    miniatureCars,
    roadCurve,
    updateVehicles
  };
}
