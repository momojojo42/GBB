// ============================================================================
// Gardens by the Bay — 3D Vehicle Variants & Boulevard Traffic Animator
// Extracted from src/world/BoulevardAndVehiclesBuilder.js
// ============================================================================

export function populateSuvOrSedanBody({
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
}) {
  if (variant === 'suv') {
    // Variant 2: Botanical Safari SUV / Utility Rover
    const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.42, 2.28), bodyPaintMat);
    lowerBody.position.set(0, 0.42, 0);
    lowerBody.castShadow = true;
    carRoot.add(lowerBody);

    // Sculpted cabin + tinted glasshouse
    const cabinCore = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.38, 1.38), bodyPaintMat);
    cabinCore.position.set(0, 0.80, -0.22);
    cabinCore.castShadow = true;
    const glassBand = new THREE.Mesh(new THREE.BoxGeometry(1.09, 0.28, 1.28), sharedWindshieldMat);
    glassBand.position.set(0, 0.81, -0.20);
    carRoot.add(cabinCore, glassBand);

    // Sloped front windshield
    const frontWindshield = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.38, 0.08), sharedWindshieldMat);
    frontWindshield.position.set(0, 0.78, 0.48);
    frontWindshield.rotation.x = -0.42;
    carRoot.add(frontWindshield);

    // Rooftop expedition rack + spare tire on rear tailgate
    const rack = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 1.05), sharedChromeMat);
    rack.position.set(0, 1.02, -0.25);
    const spareTire = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16), sharedTireMat);
    spareTire.rotation.x = Math.PI / 2;
    spareTire.position.set(0, 0.62, -1.18);
    carRoot.add(rack, spareTire);

    // Front chrome grille + headlights + rear LED taillights
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.20, 0.06), sharedChromeMat);
    grille.position.set(0, 0.46, 1.15);
    carRoot.add(grille);

    for (const hx of [-0.42, 0.42]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.06), sharedHeadlightMat);
      hl.position.set(hx, 0.48, 1.15);
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.18, 0.06), sharedTaillightMat);
      tl.position.set(hx, 0.50, -1.15);
      carRoot.add(hl, tl);
    }

    addFourWheels(0.59, 0.74, -0.74, 0.26, 0.20);
  } else {
    // Variant 3: Sleek Aerodynamic Electric Coupe / Sedan
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.34, 2.22), bodyPaintMat);
    lowerChassis.position.set(0, 0.34, 0);
    lowerChassis.castShadow = true;
    carRoot.add(lowerChassis);

    // Sloped front hood & rear deck
    const hood = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.14, 0.68), bodyPaintMat);
    hood.position.set(0, 0.49, 0.72);
    hood.rotation.x = 0.14;
    carRoot.add(hood);

    // Streamlined dark-glass cabin + body-colored roof cap
    const glassCabin = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.34, 1.16), sharedWindshieldMat);
    glassCabin.position.set(0, 0.66, -0.08);
    const roofCap = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.06, 0.94), bodyPaintMat);
    roofCap.position.set(0, 0.84, -0.10);
    roofCap.castShadow = true;
    carRoot.add(glassCabin, roofCap);

    // Side mirrors
    for (const mx of [-0.58, 0.58]) {
      const mirror = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.07, 0.14), bodyPaintMat);
      mirror.position.set(mx, 0.58, 0.34);
      carRoot.add(mirror);
    }

    // Front splitter, chrome grille, LED headlights & full-width rear LED lightbar
    const splitter = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.08, 0.12), sharedChromeMat);
    splitter.position.set(0, 0.20, 1.12);
    const rearLightBar = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.09, 0.06), sharedTaillightMat);
    rearLightBar.position.set(0, 0.44, -1.12);
    carRoot.add(splitter, rearLightBar);

    for (const hx of [-0.38, 0.38]) {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.09, 0.06), sharedHeadlightMat);
      hl.position.set(hx, 0.42, 1.12);
      carRoot.add(hl);
    }

    addFourWheels(0.56, 0.70, -0.70, 0.22, 0.17);
  }
}

export function createVehiclesAnimator(terrainGroup, roadCurve, createDetailedVehicleMesh) {
  const miniatureCars = [];
  const vehicleSpecs = [
    { variant: 'shuttle', color: 0x10B981, speed: 0.024, dir: 1, t: 0.05 },
    { variant: 'sedan',   color: 0xEF4444, speed: 0.036, dir: -1, t: 0.18 },
    { variant: 'suv',     color: 0xF59E0B, speed: 0.030, dir: 1, t: 0.34 },
    { variant: 'sedan',   color: 0x3B82F6, speed: 0.038, dir: -1, t: 0.48 },
    { variant: 'shuttle', color: 0x2D7FF9, speed: 0.025, dir: 1, t: 0.64 },
    { variant: 'sedan',   color: 0xFACC15, speed: 0.035, dir: -1, t: 0.72 },
    { variant: 'suv',     color: 0xEC4899, speed: 0.031, dir: 1, t: 0.86 },
    { variant: 'sedan',   color: 0x06B6D4, speed: 0.037, dir: -1, t: 0.93 }
  ];

  vehicleSpecs.forEach((spec, idx) => {
    const { carRoot, wheels } = createDetailedVehicleMesh(spec.variant, spec.color);
    terrainGroup.add(carRoot);
    const initialDir = spec.dir ?? (idx % 2 === 0 ? 1 : -1);
    miniatureCars.push({
      mesh: carRoot,
      wheels,
      t: spec.t,
      speed: spec.speed,
      dir: initialDir,
      laneOffset: initialDir * 1.1
    });
  });

  function updateVehicles(dt) {
    miniatureCars.forEach((car, idx) => {
      car.dir = car.dir || (idx % 2 === 0 ? 1 : -1);
      car.t += dt * car.speed * car.dir;
      if (car.t >= 0.98) {
        car.t = 0.98;
        car.dir = -1;
      } else if (car.t <= 0.02) {
        car.t = 0.02;
        car.dir = 1;
      }

      const targetLaneOffset = car.dir * 1.1;
      if (typeof car.laneOffset !== 'number') {
        car.laneOffset = targetLaneOffset;
      } else {
        const laneDiff = targetLaneOffset - car.laneOffset;
        const maxLaneStep = Math.max(0, dt) * 2.2;
        if (Math.abs(laneDiff) <= maxLaneStep) {
          car.laneOffset = targetLaneOffset;
        } else {
          car.laneOffset += Math.sign(laneDiff) * maxLaneStep;
        }
      }

      const pos = roadCurve.getPointAt(car.t);
      const tangent = roadCurve.getTangentAt(car.t);
      // Compute horizontal road normal on XZ plane to offset eastbound & westbound lanes cleanly (±1.1m)
      const normalX = -tangent.z;
      const normalZ = tangent.x;
      const nLen = Math.hypot(normalX, normalZ) || 1;
      const nx = normalX / nLen;
      const nz = normalZ / nLen;

      const laneX = pos.x + nx * car.laneOffset;
      const laneZ = pos.z + nz * car.laneOffset;
      car.mesh.position.set(laneX, pos.y + 0.06, laneZ);

      const lookT = Math.max(0.0, Math.min(1.0, car.t + 0.015 * car.dir));
      const lookPos = roadCurve.getPointAt(lookT);
      let lookX = lookPos.x + nx * car.laneOffset;
      let lookZ = lookPos.z + nz * car.laneOffset;
      if (Math.hypot(lookX - laneX, lookZ - laneZ) < 1e-4) {
        lookX = laneX + tangent.x * car.dir * 2.0;
        lookZ = laneZ + tangent.z * car.dir * 2.0;
      }
      car.mesh.lookAt(lookX, pos.y + 0.06, lookZ);

      // Spin all 4 wheels proportional to vehicle speed
      if (car.wheels) {
        const wheelSpin = dt * car.speed * 165;
        for (const w of car.wheels) {
          w.rotation.x += wheelSpin;
        }
      }
    });
  }

  // Initialize vehicle positions and orientations on frame 0
  updateVehicles(0);

  return {
    miniatureCars,
    updateVehicles
  };
}
