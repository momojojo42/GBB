// ============================================================================
// Gardens by the Bay — Relic Toy 3D Particle Spawner & Comic Speech Bubble
// (src/ui/RelicToyAudioAndParticles.js)
// ============================================================================

import * as THREE from 'three';

export function spawnToyParticlesIntoGroup(toyParticlesGroup, toyParticles, actionType, comboMult = 1) {
  if (!toyParticlesGroup) return;
  const countBoost = Math.min(2, 1 + Math.floor((comboMult - 1) * 0.25));

  if (actionType === 'durian_stink') {
    for (let i = 0; i < 4 * countBoost; i++) {
      const ringGeo = new THREE.TorusGeometry(0.32 + (i % 4) * 0.12, 0.024, 10, 32);
      ringGeo.rotateX(Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? '#84CC16' : '#EAB308',
        transparent: true,
        opacity: 0.88
      });
      const mesh = new THREE.Mesh(ringGeo, ringMat);
      mesh.position.set(0, -0.05 + (i % 4) * 0.12, 0);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.28,
        vy: 0.88 + (i % 4) * 0.18,
        vz: (Math.random() - 0.5) * 0.28,
        age: 0,
        life: 1.25,
        scaleRate: 1.4,
        spinY: 2.4
      });
    }
    for (let i = 0; i < 14 * countBoost; i++) {
      const sphGeo = new THREE.SphereGeometry(0.055 + (i % 3) * 0.018, 12, 12);
      const sphMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? '#A3E635' : i % 3 === 1 ? '#FACC15' : '#65A30D',
        transparent: true,
        opacity: 0.9
      });
      const mesh = new THREE.Mesh(sphGeo, sphMat);
      const angle = (i / 14) * Math.PI * 2;
      const rad = 0.28 + Math.random() * 0.25;
      mesh.position.set(Math.cos(angle) * rad, 0.05 + Math.random() * 0.2, Math.sin(angle) * rad);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: Math.cos(angle) * 0.48,
        vy: 0.95 + Math.random() * 0.65,
        vz: Math.sin(angle) * 0.48,
        age: 0,
        life: 1.15 + Math.random() * 0.25,
        scaleRate: 0.65,
        wobble: 6 + i
      });
    }
  } else if (actionType === 'chope_slam') {
    // Shockwave ring + flying tissue packets!
    for (let r = 0; r < 3; r++) {
      const waveGeo = new THREE.RingGeometry(0.25 + r * 0.12, 0.34 + r * 0.12, 32);
      waveGeo.rotateX(-Math.PI / 2);
      const waveMat = new THREE.MeshBasicMaterial({
        color: r % 2 === 0 ? '#FACC15' : '#FB7185',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.92
      });
      const waveMesh = new THREE.Mesh(waveGeo, waveMat);
      waveMesh.position.set(0, -0.18 + r * 0.03, 0);
      toyParticlesGroup.add(waveMesh);
      toyParticles.push({
        mesh: waveMesh,
        vx: 0,
        vy: 0.12,
        vz: 0,
        age: 0,
        life: 0.95,
        scaleRate: 2.4
      });
    }
    const packetColors = ['#FFFFFF', '#FEF08A', '#F472B6', '#38BDF8'];
    for (let i = 0; i < 16 * countBoost; i++) {
      const pktGeo = new THREE.BoxGeometry(0.13, 0.025, 0.085);
      const pktMat = new THREE.MeshBasicMaterial({
        color: packetColors[i % packetColors.length],
        transparent: true,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(pktGeo, pktMat);
      const angle = (i / 16) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 0.25, 0.02, Math.sin(angle) * 0.25);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: Math.cos(angle) * (0.65 + Math.random() * 0.45),
        vy: 1.35 + Math.random() * 0.75,
        vz: Math.sin(angle) * (0.65 + Math.random() * 0.45),
        gravity: -2.8,
        age: 0,
        life: 1.25,
        spinX: 7 + (i % 4),
        spinY: 9
      });
    }
  } else if (actionType === 'erp_deduct') {
    // Flying gold coins + amber CashCard scanner beams!
    for (let i = 0; i < 18 * countBoost; i++) {
      const coinGeo = new THREE.CylinderGeometry(0.068, 0.068, 0.02, 16);
      coinGeo.rotateX(Math.PI / 2);
      const coinMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? '#FACC15' : i % 3 === 1 ? '#F59E0B' : '#FEF08A',
        transparent: true,
        opacity: 0.96
      });
      const mesh = new THREE.Mesh(coinGeo, coinMat);
      const angle = (i / 18) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 0.22, 0.1 + (i % 3) * 0.08, Math.sin(angle) * 0.22);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: Math.cos(angle) * 0.55,
        vy: 1.45 + Math.random() * 0.75,
        vz: Math.sin(angle) * 0.55,
        gravity: -2.6,
        age: -i * 0.015,
        life: 1.25,
        spinX: 4.5,
        spinY: 11.0
      });
    }
  } else if (actionType === 'otter_wiggle') {
    const palette = ['#22D3EE', '#34D399', '#FACC15', '#38BDF8', '#FB7185'];
    for (let i = 0; i < 20 * countBoost; i++) {
      const geo = i % 2 === 0
        ? new THREE.TorusGeometry(0.065, 0.018, 8, 20)
        : new THREE.SphereGeometry(0.048, 10, 10);
      const mat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.92
      });
      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 20) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 0.34, -0.05 + (i % 4) * 0.1, Math.sin(angle) * 0.34);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: Math.cos(angle) * 0.62,
        vy: 0.95 + Math.random() * 0.65,
        vz: Math.sin(angle) * 0.62,
        age: 0,
        life: 1.25,
        scaleRate: 0.35,
        wobble: 8 + i,
        spinY: 6.5
      });
    }
  } else if (actionType === 'water_spit') {
    const palette = ['#22D3EE', '#38BDF8', '#A7F3D0', '#F472B6', '#FACC15', '#60A5FA'];
    for (let i = 0; i < 22 * countBoost; i++) {
      const dropGeo = new THREE.SphereGeometry(0.042 + (i % 4) * 0.012, 10, 10);
      const dropMat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.92
      });
      const mesh = new THREE.Mesh(dropGeo, dropMat);
      mesh.position.set((Math.random() - 0.5) * 0.14, 0.26 + (Math.random() - 0.5) * 0.08, -0.32);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: (Math.random() - 0.5) * 0.85,
        vy: 1.15 + Math.random() * 0.85,
        vz: -(1.15 + Math.random() * 0.95),
        gravity: -2.9,
        age: -i * 0.018,
        life: 1.15,
        scaleRate: -0.25
      });
    }
  } else if (actionType === 'kopi_pour') {
    const palette = ['#FEF3C7', '#FDE68A', '#D97706', '#92400E', '#FFFBEB'];
    for (let i = 0; i < 18 * countBoost; i++) {
      const puffGeo = new THREE.SphereGeometry(0.05 + (i % 3) * 0.022, 12, 12);
      const puffMat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.85
      });
      const mesh = new THREE.Mesh(puffGeo, puffMat);
      const isPourStream = i < 10;
      mesh.position.set(
        isPourStream ? 0.22 + (Math.random() - 0.5) * 0.12 : (Math.random() - 0.5) * 0.35,
        isPourStream ? 0.42 : 0.18 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.25
      );
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: isPourStream ? 0.18 + (Math.random() - 0.5) * 0.2 : (Math.random() - 0.5) * 0.35,
        vy: isPourStream ? -0.95 - Math.random() * 0.4 : 0.85 + Math.random() * 0.55,
        vz: (Math.random() - 0.5) * 0.3,
        age: 0,
        life: 1.25,
        scaleRate: isPourStream ? 0.2 : 1.15,
        wobble: 5 + i
      });
    }
  } else {
    const palette = ['#FACC15', '#34D399', '#F472B6', '#38BDF8', '#FBBF24'];
    for (let i = 0; i < 18 * countBoost; i++) {
      const starGeo = new THREE.OctahedronGeometry(0.065 + (i % 3) * 0.018, 0);
      const starMat = new THREE.MeshBasicMaterial({
        color: palette[i % palette.length],
        transparent: true,
        opacity: 0.95
      });
      const mesh = new THREE.Mesh(starGeo, starMat);
      const angle = (i / 18) * Math.PI * 2;
      const rad = 0.42 + (i % 3) * 0.14;
      mesh.position.set(Math.cos(angle) * rad, -0.2 + (i % 4) * 0.12, Math.sin(angle) * rad);
      toyParticlesGroup.add(mesh);
      toyParticles.push({
        mesh,
        vx: -Math.sin(angle) * 0.75,
        vy: 0.95 + Math.random() * 0.65,
        vz: Math.cos(angle) * 0.75,
        age: 0,
        life: 1.35,
        scaleRate: -0.2,
        spinX: 5.5,
        spinY: 7.2
      });
    }
  }
}

export function spawnToyReactionPill(text, comboCount = 1) {
  const wrap = document.getElementById('relic3DStageWrap');
  if (!wrap) return;

  const existing = wrap.querySelector('.relic-toy-reaction-pill');
  if (existing) existing.remove();

  const pill = document.createElement('div');
  pill.className = `relic-toy-reaction-pill ${comboCount >= 2 ? 'is-combo-burst' : ''}`;
  const tiltDeg = ((comboCount % 2 === 0 ? 1 : -1) * (2.5 + (comboCount % 4) * 1.1)).toFixed(1);
  pill.style.setProperty('--comic-tilt', `${tiltDeg}deg`);

  const comboBadgeHtml =
    comboCount >= 2
      ? `<span class="comic-shiok-combo-badge">${comboCount >= 5 ? '🎆 MAX SHIOK' : '🔥 SHIOK'} ×${comboCount}!</span>`
      : '';

  pill.innerHTML = `
    <span class="comic-bubble-text">${text}</span>
    ${comboBadgeHtml}
  `;

  wrap.appendChild(pill);
  requestAnimationFrame(() => {
    pill.classList.add('is-active');
  });

  setTimeout(() => {
    pill.classList.remove('is-active');
    pill.classList.add('is-exiting');
  }, 1480);

  setTimeout(() => {
    pill.remove();
  }, 1820);
}
