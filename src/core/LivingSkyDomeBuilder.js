// ============================================================================
// Gardens by the Bay — Living 3D Sky Dome, Celestial Orbs, Clouds & Bird Flocks
// (src/core/LivingSkyDomeBuilder.js)
// ============================================================================

function lerpNumber(a, b, t) {
  return a + (b - a) * t;
}

export function createLivingSkyDome(THREE, scene, computeDayNightCycleState) {
  const skyDomeGroup = new THREE.Group();
  skyDomeGroup.name = 'LivingSkyDomeGroup';
  scene.add(skyDomeGroup);

  // A. 3-Stop Gradient + Starfield + Garden Rhapsody Aurora Shader Sky Sphere
  const skyShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uZenithColor: { value: new THREE.Color('#0284C7') },
      uMidColor: { value: new THREE.Color('#38BDF8') },
      uHorizonColor: { value: new THREE.Color('#BAE6FD') },
      uStarOpacity: { value: 0.0 },
      uAuroraIntensity: { value: 0.0 },
      uTime: { value: 0.0 }
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vDir;
      uniform vec3 uZenithColor;
      uniform vec3 uMidColor;
      uniform vec3 uHorizonColor;
      uniform float uStarOpacity;
      uniform float uAuroraIntensity;
      uniform float uTime;

      void main() {
        float h = clamp(vDir.y, 0.0, 1.0);

        // Smoothly blend uHorizonColor -> uMidColor -> uZenithColor
        float tMid = smoothstep(0.0, 0.32, h);
        vec3 sky = mix(uHorizonColor, uMidColor, tMid);
        float tZenith = smoothstep(0.28, 0.88, h);
        sky = mix(sky, uZenithColor, tZenith);

        // Subtle warm/magical horizon rim glow near h < 0.15
        float rim = smoothstep(0.15, 0.0, h);
        sky += uHorizonColor * rim * 0.30;

        // Procedural twinkling stars
        if (uStarOpacity > 0.01 && h > 0.12) {
          vec3 cell = floor(vDir * 190.0);
          float hash = fract(sin(dot(cell, vec3(127.1, 311.7, 74.7))) * 43758.5453123);
          if (hash > 0.982) {
            float twinkle = 0.5 + 0.5 * sin(uTime * 3.5 + hash * 25.0);
            float starMask = smoothstep(0.12, 0.26, h);
            sky += vec3(twinkle * uStarOpacity * starMask * 1.5);
          }
        }

        // Procedural Garden Rhapsody Aurora borealis ribbons
        if (uAuroraIntensity > 0.01 && h > 0.18 && h < 0.68) {
          float auroraMask = smoothstep(0.18, 0.30, h) * smoothstep(0.68, 0.44, h);
          float wave1 = sin(vDir.x * 6.0 + vDir.z * 4.0 + uTime * 1.25) * 0.07;
          float wave2 = cos(vDir.x * 11.0 - vDir.z * 7.0 + uTime * 1.8) * 0.035;
          float ribbonH = h + wave1 + wave2;

          // Emerald ribbon (#34D399)
          float r1 = smoothstep(0.065, 0.0, abs(ribbonH - 0.34));
          vec3 colEmerald = vec3(0.204, 0.827, 0.600);

          // Magenta ribbon (#EC4899)
          float wave3 = sin(vDir.x * 8.5 + vDir.z * 9.5 - uTime * 1.4) * 0.045;
          float r2 = smoothstep(0.055, 0.0, abs(h + wave3 - 0.46));
          vec3 colMagenta = vec3(0.925, 0.282, 0.600);

          // Cyan ribbon (#38BDF8)
          float wave4 = cos(vDir.x * 5.5 - vDir.z * 6.5 + uTime * 0.95) * 0.055;
          float r3 = smoothstep(0.065, 0.0, abs(h + wave4 - 0.55));
          vec3 colCyan = vec3(0.220, 0.741, 0.973);

          vec3 aurora = (colEmerald * r1 + colMagenta * r2 * 0.85 + colCyan * r3 * 0.95) * auroraMask * uAuroraIntensity;
          sky += aurora * 1.4;
        }

        gl_FragColor = vec4(sky, 1.0);
      }
    `,
    side: THREE.BackSide,
    depthWrite: false
  });
  const skyDomeMesh = new THREE.Mesh(new THREE.SphereGeometry(212, 40, 24), skyShaderMaterial);
  skyDomeGroup.add(skyDomeMesh);

  // B. Glowing 3D Celestial Sun & Crescent Moon Orbs (r = 175 orbital radius)
  const sunGroup = new THREE.Group();
  sunGroup.name = 'CelestialSunGroup';

  const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xFFFBEB, fog: false });
  const sunCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(6.8, 24, 24), sunCoreMat);
  sunGroup.add(sunCoreMesh);

  const sunHaloMat = new THREE.MeshBasicMaterial({
    color: 0xFDE047,
    transparent: true,
    opacity: 0.42,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });
  const sunHaloMesh = new THREE.Mesh(new THREE.RingGeometry(7.2, 16.5, 32), sunHaloMat);
  sunGroup.add(sunHaloMesh);
  skyDomeGroup.add(sunGroup);

  const moonGroup = new THREE.Group();
  moonGroup.name = 'CelestialMoonGroup';

  const moonCoreMat = new THREE.MeshBasicMaterial({
    color: 0xFEF9C3,
    transparent: true,
    opacity: 0.0,
    fog: false
  });
  const moonCoreMesh = new THREE.Mesh(new THREE.SphereGeometry(5.6, 24, 24), moonCoreMat);
  moonGroup.add(moonCoreMesh);

  const moonHaloMat = new THREE.MeshBasicMaterial({
    color: 0xBAE6FD,
    transparent: true,
    opacity: 0.0,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false
  });
  const moonHaloMesh = new THREE.Mesh(new THREE.RingGeometry(6.0, 13.5, 32), moonHaloMat);
  moonGroup.add(moonHaloMesh);
  skyDomeGroup.add(moonGroup);

  // C. 14 Fluffy 3D Ghibli-Style Cumulus Cloud Clusters
  const cloudRingGroup = new THREE.Group();
  cloudRingGroup.name = 'CloudRingGroup';
  skyDomeGroup.add(cloudRingGroup);

  const cloudMaterial = new THREE.MeshLambertMaterial({
    color: 0xFFFFFF,
    emissive: 0x38BDF8,
    emissiveIntensity: 0.18,
    flatShading: true,
    fog: false
  });

  const puffGeom = new THREE.SphereGeometry(1, 12, 10);
  const cloudClusters = [];

  for (let i = 0; i < 14; i++) {
    const cluster = new THREE.Group();
    const angle = (i / 14) * Math.PI * 2 + (Math.sin(i * 3.7) * 0.18);
    const radius = lerpNumber(74, 148, (i * 0.618) % 1);
    const baseY = lerpNumber(26, 44, (i * 0.413) % 1);

    cluster.position.set(
      Math.cos(angle) * radius,
      baseY,
      Math.sin(angle) * radius
    );
    cluster.userData = {
      baseY,
      bobSpeed: 0.5 + ((i % 5) * 0.1),
      bobPhase: i * 0.85
    };

    const puffOffsets = [
      { x: 0, y: 1.0, z: 0 },
      { x: -3.8, y: -0.3, z: 1.2 },
      { x: 3.5, y: -0.2, z: -1.3 },
      { x: -1.9, y: 0.8, z: -1.1 },
      { x: 2.2, y: 0.4, z: 1.5 }
    ];

    for (let p = 0; p < 5; p++) {
      const puff = new THREE.Mesh(puffGeom, cloudMaterial);
      puff.position.set(puffOffsets[p].x, puffOffsets[p].y, puffOffsets[p].z);
      const sx = lerpNumber(4.5, 8.5, ((p + i) * 0.37) % 1);
      const sy = lerpNumber(2.2, 3.8, ((p + i * 2) * 0.49) % 1);
      const sz = lerpNumber(3.5, 6.2, ((p + i * 3) * 0.28) % 1);
      puff.scale.set(sx, sy, sz);
      cluster.add(puff);
    }

    cloudRingGroup.add(cluster);
    cloudClusters.push(cluster);
  }

  // D. 3 Soaring Tropical Hornbill / Sunbird V-Formation Flocks
  const birdFlocksGroup = new THREE.Group();
  birdFlocksGroup.name = 'BirdFlocksGroup';
  skyDomeGroup.add(birdFlocksGroup);

  const wingGeom = new THREE.BoxGeometry(0.65, 0.05, 0.28);
  const bodyGeom = new THREE.ConeGeometry(0.20, 0.85, 5);
  bodyGeom.rotateX(Math.PI * 0.5);

  const birdFlockPivots = [];
  const flockMaterials = [];
  const allFlockBirds = [];

  for (let f = 0; f < 3; f++) {
    const flockPivot = new THREE.Group();
    flockPivot.name = `BirdFlock_${f}`;
    const flockRadius = lerpNumber(38, 60, f / 2);
    const flockY = lerpNumber(22, 29, f / 2);
    const flockSpeed = (f === 1 ? -0.048 : 0.062 + f * 0.015);
    const startAngle = f * 2.1;

    flockPivot.userData = { flockRadius, flockY, flockSpeed, startAngle };
    birdFlocksGroup.add(flockPivot);
    birdFlockPivots.push(flockPivot);

    const flockMat = new THREE.MeshLambertMaterial({
      color: 0x1E293B,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.25,
      fog: false
    });
    flockMaterials.push(flockMat);

    const vOffsets = [
      { x: 0, y: 0, z: 0 },
      { x: -1.8, y: 0.2, z: -1.6 },
      { x: 1.8, y: -0.15, z: -1.6 },
      { x: -3.6, y: 0.35, z: -3.2 },
      { x: 3.6, y: -0.1, z: -3.2 }
    ];

    for (let b = 0; b < 5; b++) {
      const birdRoot = new THREE.Group();
      birdRoot.position.set(vOffsets[b].x, vOffsets[b].y, vOffsets[b].z);

      const body = new THREE.Mesh(bodyGeom, flockMat);
      birdRoot.add(body);

      const leftWingPivot = new THREE.Group();
      leftWingPivot.position.set(-0.16, 0.04, 0);
      const leftWingMesh = new THREE.Mesh(wingGeom, flockMat);
      leftWingMesh.position.set(-0.325, 0, 0);
      leftWingPivot.add(leftWingMesh);
      birdRoot.add(leftWingPivot);

      const rightWingPivot = new THREE.Group();
      rightWingPivot.position.set(0.16, 0.04, 0);
      const rightWingMesh = new THREE.Mesh(wingGeom, flockMat);
      rightWingMesh.position.set(0.325, 0, 0);
      rightWingPivot.add(rightWingMesh);
      birdRoot.add(rightWingPivot);

      flockPivot.add(birdRoot);
      allFlockBirds.push({
        birdRoot,
        leftWingPivot,
        rightWingPivot,
        birdIdx: f * 5 + b,
        flockIndex: f
      });
    }
  }

  function updateLivingSkyDome(cycleState, elapsedSeconds) {
    if (cycleState.skyZenithHex) skyShaderMaterial.uniforms.uZenithColor.value.set(cycleState.skyZenithHex);
    if (cycleState.skyMidHex) skyShaderMaterial.uniforms.uMidColor.value.set(cycleState.skyMidHex);
    if (cycleState.skyHorizonHex) skyShaderMaterial.uniforms.uHorizonColor.value.set(cycleState.skyHorizonHex);
    skyShaderMaterial.uniforms.uStarOpacity.value = cycleState.starOpacity ?? 0.0;
    skyShaderMaterial.uniforms.uAuroraIntensity.value = cycleState.auroraIntensity ?? 0.0;
    skyShaderMaterial.uniforms.uTime.value = elapsedSeconds;

    const elRad = THREE.MathUtils.degToRad(cycleState.sunElevationDeg);
    const azRad = THREE.MathUtils.degToRad(cycleState.sunAzimuthDeg);
    const rOrbital = 175;
    sunGroup.position.set(
      rOrbital * Math.cos(elRad) * Math.sin(azRad),
      rOrbital * Math.sin(elRad),
      rOrbital * Math.cos(elRad) * Math.cos(azRad)
    );
    sunGroup.lookAt(0, 0, 0);

    const sunVisibleFactor = Math.max(0.0, Math.min(1.0, (cycleState.sunLightIntensity - 0.25) / 1.6));
    sunCoreMat.opacity = sunVisibleFactor;
    sunCoreMat.transparent = sunVisibleFactor < 0.99;
    sunHaloMat.opacity = 0.42 * sunVisibleFactor;
    sunGroup.visible = sunVisibleFactor > 0.02;

    const mElRad = THREE.MathUtils.degToRad(42);
    const mAzRad = THREE.MathUtils.degToRad(-125);
    moonGroup.position.set(
      rOrbital * Math.cos(mElRad) * Math.sin(mAzRad),
      rOrbital * Math.sin(mElRad),
      rOrbital * Math.cos(mElRad) * Math.cos(mAzRad)
    );
    moonGroup.lookAt(0, 0, 0);

    const moonOp = cycleState.moonOpacity ?? 0.0;
    moonCoreMat.opacity = moonOp;
    moonHaloMat.opacity = moonOp * 0.45;
    moonGroup.visible = moonOp > 0.01;

    cloudRingGroup.rotation.y = elapsedSeconds * 0.014;
    for (let i = 0; i < cloudClusters.length; i++) {
      const c = cloudClusters[i];
      c.position.y = c.userData.baseY + Math.sin(elapsedSeconds * c.userData.bobSpeed + c.userData.bobPhase) * 1.5;
    }
    if (cycleState.cloudTintHex) {
      cloudMaterial.color.set(cycleState.cloudTintHex);
      cloudMaterial.emissive.set(cycleState.cloudTintHex);
    }
    cloudMaterial.emissiveIntensity = cycleState.isNightShow ? 0.35 : 0.18;

    for (let f = 0; f < birdFlockPivots.length; f++) {
      const fp = birdFlockPivots[f];
      const ang = fp.userData.startAngle + elapsedSeconds * fp.userData.flockSpeed;
      const r = fp.userData.flockRadius;
      fp.position.set(
        Math.cos(ang) * r,
        fp.userData.flockY + Math.sin(elapsedSeconds * 0.4 + f * 1.2) * 1.5,
        Math.sin(ang) * r
      );
      const tangentAng = ang + (fp.userData.flockSpeed > 0 ? Math.PI * 0.5 : -Math.PI * 0.5);
      fp.rotation.y = -tangentAng;

      if (cycleState.isNightShow) {
        const glowColor = (f % 2 === 0) ? '#38BDF8' : '#FBBF24';
        flockMaterials[f].color.set(glowColor);
        flockMaterials[f].emissive.set(glowColor);
        flockMaterials[f].emissiveIntensity = 1.35;
      } else {
        flockMaterials[f].color.set('#1E293B');
        flockMaterials[f].emissive.set('#F59E0B');
        flockMaterials[f].emissiveIntensity = 0.25;
      }
    }

    for (let b = 0; b < allFlockBirds.length; b++) {
      const bird = allFlockBirds[b];
      const flap = Math.sin(elapsedSeconds * 8.5 + bird.birdIdx * 0.9) * 0.52;
      bird.leftWingPivot.rotation.z = flap;
      bird.rightWingPivot.rotation.z = -flap;
    }
  }

  updateLivingSkyDome(computeDayNightCycleState(0, 0), 0);

  return {
    skyDomeGroup,
    sunGroup,
    moonGroup,
    cloudRingGroup,
    birdFlocksGroup,
    updateLivingSkyDome
  };
}
