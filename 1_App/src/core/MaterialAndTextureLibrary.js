// ============================================================================
// Gardens by the Bay — Procedural PBR Canvas2D Texture & Material Library
// (src/core/MaterialAndTextureLibrary.js)
// ============================================================================

export function createMaterialAndTextureLibrary(THREE) {
  // 1. Lush Botanical Grass Turf Texture (512x512)
  function createGrassTurfTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 512, 512);
    grad.addColorStop(0, '#46A73B');
    grad.addColorStop(0.5, '#54B846');
    grad.addColorStop(1, '#3D9934');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    // Subtle mowing stripes (architectural landscape model effect)
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.035)' : 'rgba(0, 40, 10, 0.035)';
      ctx.fillRect(0, i * 32, 512, 32);
    }

    // Thousands of fine botanical turf blades
    let seed = 4201;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const bladePalette = ['#6EE755', '#3B8F2E', '#84CC16', '#22C55E', '#15803D'];
    for (let i = 0; i < 6500; i++) {
      const x = rand() * 512;
      const y = rand() * 512;
      ctx.fillStyle = bladePalette[i % bladePalette.length];
      ctx.globalAlpha = 0.22 + rand() * 0.25;
      ctx.fillRect(x, y, 2, 4 + rand() * 4);
    }
    ctx.globalAlpha = 1.0;

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(18, 14);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // 2. Architectural Warm Sandstone Paver Texture (512x512)
  function createSandstonePaverTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#F3ECE0';
    ctx.fillRect(0, 0, 512, 512);

    const tileW = 64;
    const tileH = 32;
    let seed = 9001;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let row = 0; row < 512 / tileH; row++) {
      const offsetX = (row % 2) * (tileW / 2);
      for (let col = -1; col < 512 / tileW + 1; col++) {
        const x = col * tileW + offsetX;
        const y = row * tileH;
        const shade = Math.floor(234 + (rand() - 0.5) * 16);
        ctx.fillStyle = `rgb(${shade}, ${shade - 8}, ${shade - 21})`;
        ctx.fillRect(x + 1.5, y + 1.5, tileW - 3, tileH - 3);
      }
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(14, 14);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // 3. Marina Reservoir Caustics & Ripple Texture (512x512)
  function createWaterRippleTexture() {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(256, 256, 30, 256, 256, 360);
    grad.addColorStop(0, '#1D7A8C');
    grad.addColorStop(1, '#135363');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = 'rgba(186, 230, 253, 0.24)';
    ctx.lineWidth = 2.2;
    for (let y = 16; y < 512; y += 28) {
      ctx.beginPath();
      for (let x = 0; x <= 512; x += 16) {
        const wy = y + Math.sin((x / 512) * Math.PI * 4) * 6 + Math.cos((y / 512) * Math.PI * 2) * 3;
        if (x === 0) ctx.moveTo(x, wy);
        else ctx.lineTo(x, wy);
      }
      ctx.stroke();
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(24, 18);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  // 4. Soft Ground Contact Ambient Occlusion Shadow Disc Texture (256x256)
  function createContactShadowTexture() {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0, 'rgba(6, 32, 22, 0.62)');
    grad.addColorStop(0.55, 'rgba(6, 32, 22, 0.28)');
    grad.addColorStop(1, 'rgba(6, 32, 22, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  const grassTurfTex = createGrassTurfTexture();
  const sandstonePaverTex = createSandstonePaverTexture();
  const waterRippleTex = createWaterRippleTexture();
  const contactShadowTex = createContactShadowTexture();

  const contactShadowMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    depthWrite: false,
    opacity: 0.78
  });

  function createContactShadowDisc(radiusX = 3.5, radiusZ = 3.5, yOffset = 0.08) {
    const geo = new THREE.PlaneGeometry(radiusX * 2, radiusZ * 2);
    geo.rotateX(-Math.PI / 2);
    const mesh = new THREE.Mesh(geo, contactShadowMat);
    mesh.position.y = yOffset;
    mesh.renderOrder = 1;
    return mesh;
  }

  return {
    grassTurfTex,
    sandstonePaverTex,
    waterRippleTex,
    contactShadowTex,
    contactShadowMat,
    createContactShadowDisc
  };
}
