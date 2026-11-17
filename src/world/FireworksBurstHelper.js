// ============================================================================
// Gardens by the Bay — Celebratory 3D Particle Bursts & Fireworks Helper
// Extracted from src/world/CelebrationParticlesSystem.js
// ============================================================================

export const TITLE_FIREWORK_SALVOS = [
  // Salvo 0: Central Supertree Grove twin neon burst
  [
    { x: -5.5, y: 21.0, z: -3.5, mainColor: 0xEC4899, scale: 1.9 },
    { x: 6.5, y: 22.5, z: -2.0, mainColor: 0x38BDF8, scale: 1.75 }
  ],
  // Salvo 1: OCBC Skyway & Dragonfly Lake arch
  [
    { x: -14.0, y: 20.0, z: 4.0, mainColor: 0xFACC15, scale: 1.85 },
    { x: 0.5, y: 24.0, z: 6.5, mainColor: 0xA855F7, scale: 2.0 }
  ],
  // Salvo 2: Flower Dome & Silver Garden skyline
  [
    { x: 8.0, y: 25.0, z: -26.0, mainColor: 0x34D399, scale: 2.0 },
    { x: -6.0, y: 22.0, z: -18.0, mainColor: 0xEC4899, scale: 1.8 }
  ],
  // Salvo 3: Grand Supertree Trio cascade
  [
    { x: -10.5, y: 21.5, z: 10.0, mainColor: 0x22D3EE, scale: 1.85 },
    { x: 0.0, y: 26.0, z: -1.0, mainColor: 0xFACC15, scale: 2.15 },
    { x: 11.5, y: 22.0, z: -9.0, mainColor: 0xFB923C, scale: 1.8 }
  ],
  // Salvo 4: Cloud Forest & Golden Garden high altitude
  [
    { x: 22.0, y: 26.5, z: -20.0, mainColor: 0x38BDF8, scale: 2.0 },
    { x: -3.0, y: 23.0, z: -11.0, mainColor: 0xEC4899, scale: 1.9 }
  ],
  // Salvo 5: Supertree Crown Finale Salvo
  [
    { x: -8.0, y: 24.5, z: -4.0, mainColor: 0xFACC15, scale: 2.1 },
    { x: 4.5, y: 27.0, z: 3.0, mainColor: 0xEC4899, scale: 2.2 },
    { x: -16.0, y: 21.0, z: -8.0, mainColor: 0x34D399, scale: 1.85 }
  ]
];

export function createFireworksBurstHelper(THREE, terrainGroup) {
  // Celebratory 3D Particle Burst Pool
  const particleBurstsGroup = new THREE.Group();
  particleBurstsGroup.name = 'CelebrationParticleBurstsGroup';
  terrainGroup.add(particleBurstsGroup);
  const activeBursts = [];
  const burstParticleGeo = new THREE.OctahedronGeometry(0.16, 0);
  const burstRingGeo = new THREE.RingGeometry(0.5, 0.85, 32);
  burstRingGeo.rotateX(-Math.PI / 2);

  function spawnCelebrationBurst(x, y, z, accentColor = 0xFACC15, isPlayer = true) {
    const burstGroup = new THREE.Group();
    burstGroup.position.set(x, y + 0.8, z);

    const ringMat = new THREE.MeshBasicMaterial({
      color: isPlayer ? 0xFACC15 : accentColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(burstRingGeo, ringMat);
    ringMesh.position.y = -0.55;
    burstGroup.add(ringMesh);

    const particles = [];
    const palette = isPlayer
      ? [0xFACC15, 0x34D399, 0xFEF08A, accentColor]
      : [accentColor, 0xFDE047, 0xFFFFFF];

    const count = isPlayer ? 24 : 14;
    for (let i = 0; i < count; i++) {
      const pColor = palette[i % palette.length];
      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const pMesh = new THREE.Mesh(burstParticleGeo, pMat);
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
      const horizSpeed = 2.4 + Math.random() * 4.2;
      const vertSpeed = 3.8 + Math.random() * 5.2;
      particles.push({
        mesh: pMesh,
        mat: pMat,
        vx: Math.cos(angle) * horizSpeed,
        vy: vertSpeed,
        vz: Math.sin(angle) * horizSpeed,
        rotSpeed: (Math.random() - 0.5) * 9
      });
      burstGroup.add(pMesh);
    }

    particleBurstsGroup.add(burstGroup);
    activeBursts.push({
      group: burstGroup,
      ringMesh,
      ringMat,
      particles,
      age: 0,
      duration: 1.15
    });
  }

  function spawnFinaleFirework(x, y, z, options = {}) {
    const burstScale = options.scale ?? 1.0;
    const jitter = options.jitter ?? 5.5;
    const burstGroup = new THREE.Group();
    const burstHeight = (y || 0) + (options.exactY ? 0 : 2.8 + Math.random() * 2.6);
    burstGroup.position.set(
      x + (Math.random() - 0.5) * jitter,
      burstHeight,
      z + (Math.random() - 0.5) * jitter
    );

    const palette = [0xFACC15, 0x34D399, 0xEC4899, 0x38BDF8, 0xFB923C, 0xA855F7, 0x22D3EE];
    const mainColor = options.mainColor || palette[Math.floor(Math.random() * palette.length)];

    const ringMat = new THREE.MeshBasicMaterial({
      color: mainColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ringMesh = new THREE.Mesh(burstRingGeo, ringMat);
    ringMesh.rotation.x = (Math.random() - 0.5) * 0.9;
    ringMesh.rotation.y = (Math.random() - 0.5) * 0.9;
    burstGroup.add(ringMesh);

    const particles = [];
    const count = options.particleCount || 42;
    for (let i = 0; i < count; i++) {
      const pColor = i % 3 === 0 ? mainColor : palette[i % palette.length];
      const pMat = new THREE.MeshBasicMaterial({
        color: pColor,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const pMesh = new THREE.Mesh(burstParticleGeo, pMat);
      pMesh.scale.setScalar(1.45 * burstScale);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = (4.2 + Math.random() * 6.5) * burstScale;
      particles.push({
        mesh: pMesh,
        mat: pMat,
        vx: Math.sin(phi) * Math.cos(theta) * speed,
        vy: Math.cos(phi) * speed + 2.8 * burstScale,
        vz: Math.sin(phi) * Math.sin(theta) * speed,
        rotSpeed: (Math.random() - 0.5) * 12,
        baseScale: 1.45 * burstScale
      });
      burstGroup.add(pMesh);
    }

    particleBurstsGroup.add(burstGroup);
    activeBursts.push({
      group: burstGroup,
      ringMesh,
      ringMat,
      particles,
      age: 0,
      duration: options.duration || 1.65,
      ringMaxScale: 5.8 * burstScale
    });
  }

  function spawnTitleShowFireworkSalvo(salvoIndex = 0) {
    const salvo = TITLE_FIREWORK_SALVOS[Math.abs(salvoIndex) % TITLE_FIREWORK_SALVOS.length];
    for (const spec of salvo) {
      spawnFinaleFirework(spec.x, spec.y, spec.z, {
        exactY: true,
        jitter: 2.2,
        scale: spec.scale || 1.85,
        mainColor: spec.mainColor,
        particleCount: 46,
        duration: 1.75
      });
    }
  }

  function updateBursts(dt) {
    for (let i = activeBursts.length - 1; i >= 0; i--) {
      const b = activeBursts[i];
      b.age += dt;
      const prog = Math.min(1, b.age / b.duration);
      const ringScale = 1 + prog * (b.ringMaxScale || 5.2);
      b.ringMesh.scale.set(ringScale, ringScale, 1);
      b.ringMat.opacity = (1 - prog) * 0.88;

      for (const p of b.particles) {
        p.mesh.position.x += p.vx * dt;
        p.mesh.position.y += p.vy * dt;
        p.mesh.position.z += p.vz * dt;
        p.vy -= 9.2 * dt;
        p.mesh.rotation.x += p.rotSpeed * dt;
        p.mesh.rotation.y += p.rotSpeed * dt;
        const baseScale = p.baseScale || 1.25;
        const s = Math.max(0.01, (1 - prog) * baseScale);
        p.mesh.scale.setScalar(s);
        p.mat.opacity = 1 - prog;
      }

      if (b.age >= b.duration) {
        particleBurstsGroup.remove(b.group);
        b.ringMat.dispose();
        for (const p of b.particles) p.mat.dispose();
        activeBursts.splice(i, 1);
      }
    }
  }

  return {
    spawnCelebrationBurst,
    spawnFinaleFirework,
    spawnTitleShowFireworkSalvo,
    getActiveBurstCount: () => activeBursts.length,
    updateBursts
  };
}
