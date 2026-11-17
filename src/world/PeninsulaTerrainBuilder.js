// ============================================================================
// Gardens by the Bay — Peninsula Diorama, Waterways, Pathways & Bridges Builder
// (src/world/PeninsulaTerrainBuilder.js)
// ============================================================================

import {
  BOOMERANG_ISLAND_POLYGON,
  LAKE_CHANNEL_POINTS,
  WATER_PONDS
} from './WorldPhysicsEngine.js';
import { getActiveMapProfile } from '../data/MapRegistry.js';
import {
  PLAZA_NODES,
  PATHWAY_POLYLINES,
  buildPathwaysPlazasAndBridges
} from './PathwaysAndBridgesBuilder.js';

export { PLAZA_NODES, PATHWAY_POLYLINES };

export function buildPeninsulaTerrain(THREE, terrainGroup, matLib) {
  const theme = getActiveMapProfile().terrainTheme;

  // PBR Materials backed by procedural Canvas2D textures
  const outerWaterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.outerWaterHex || '#208196'),
    map: matLib.waterRippleTex,
    roughness: 0.16,
    metalness: 0.28,
    envMapIntensity: 1.1
  });

  const innerWaterMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.innerWaterHex ?? 0x18c4d4),
    emissive: new THREE.Color(theme?.innerWaterEmissiveHex ?? 0x075868),
    emissiveIntensity: 0.32,
    map: matLib.waterRippleTex,
    roughness: 0.05,
    metalness: 0.22,
    transparent: true,
    opacity: 0.86,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
    envMapIntensity: 1.35
  });

  const pondBedMat = new THREE.MeshStandardMaterial({
    color: 0x074854,
    roughness: 0.85,
    metalness: 0.04
  });

  const basePlinthMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1E293B'),
    roughness: 0.65,
    metalness: 0.2
  });

  const baseBevelMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.baseBevelHex || '#F3ECE1'),
    map: matLib.sandstonePaverTex,
    roughness: 0.52,
    metalness: 0.05
  });

  const grassMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.grassHex || '#68C956'),
    map: matLib.grassTurfTex,
    roughness: 0.68,
    metalness: 0.02
  });

  const meadowLawnMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.meadowLawnHex || '#74D660'),
    map: matLib.grassTurfTex,
    roughness: 0.64,
    metalness: 0.02
  });

  const pathwayMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(theme?.pathwayHex || '#F5EFE4'),
    map: matLib.sandstonePaverTex,
    roughness: 0.54,
    metalness: 0.06
  });

  // 1. Outer Marina Reservoir Water Plane (y = -0.85)
  const waterGeo = new THREE.PlaneGeometry(460, 380, 48, 48);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMesh = new THREE.Mesh(waterGeo, outerWaterMat);
  waterMesh.position.y = -0.85;
  waterMesh.receiveShadow = true;
  terrainGroup.add(waterMesh);

  // 2. Sculpted Bay South Boomerang Peninsula Diorama Board (Official Visitor Map Geometry)
  const peninsulaShape = new THREE.Shape();
  const nPoly = BOOMERANG_ISLAND_POLYGON.length;
  const startMidX = (BOOMERANG_ISLAND_POLYGON[nPoly - 1].x + BOOMERANG_ISLAND_POLYGON[0].x) * 0.5;
  const startMidZ = (BOOMERANG_ISLAND_POLYGON[nPoly - 1].z + BOOMERANG_ISLAND_POLYGON[0].z) * 0.5;
  peninsulaShape.moveTo(startMidX, startMidZ);
  for (let i = 0; i < nPoly; i++) {
    const curr = BOOMERANG_ISLAND_POLYGON[i];
    const next = BOOMERANG_ISLAND_POLYGON[(i + 1) % nPoly];
    const midX = (curr.x + next.x) * 0.5;
    const midZ = (curr.z + next.z) * 0.5;
    peninsulaShape.quadraticCurveTo(curr.x, curr.z, midX, midZ);
  }

  const plinthGeo = new THREE.ExtrudeGeometry(peninsulaShape, {
    depth: 2.2,
    bevelEnabled: true,
    bevelThickness: 0.4,
    bevelSize: 0.8,
    bevelSegments: 4
  });
  plinthGeo.rotateX(Math.PI / 2);
  const plinthMesh = new THREE.Mesh(plinthGeo, basePlinthMat);
  plinthMesh.position.y = -1.65;
  plinthMesh.receiveShadow = true;
  terrainGroup.add(plinthMesh);

  const bevelGeo = new THREE.ExtrudeGeometry(peninsulaShape, {
    depth: 1.0,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.65,
    bevelSegments: 4
  });
  bevelGeo.rotateX(Math.PI / 2);
  const bevelMesh = new THREE.Mesh(bevelGeo, baseBevelMat);
  bevelMesh.position.y = -0.42;
  bevelMesh.receiveShadow = true;
  bevelMesh.castShadow = true;
  terrainGroup.add(bevelMesh);

  const turfGeo = new THREE.ExtrudeGeometry(peninsulaShape, {
    depth: 0.14,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.15,
    bevelSegments: 3
  });
  turfGeo.rotateX(Math.PI / 2);
  const turfMesh = new THREE.Mesh(turfGeo, grassMat);
  turfMesh.position.y = -0.06;
  turfMesh.scale.set(0.992, 1, 0.992);
  turfMesh.receiveShadow = true;
  terrainGroup.add(turfMesh);

  // 3. Inner Waterways: '/' Diagonal Dragonfly & Kingfisher Lake Channel, Nibong/Dragonfly Islands & 4 Eastern Ponds
  const lakeCurve = new THREE.CatmullRomCurve3(
    LAKE_CHANNEL_POINTS.map((p) => new THREE.Vector3(p.x, 0, p.z))
  );
  const lakeTubeGeo = new THREE.TubeGeometry(lakeCurve, 64, 4.0, 14, false);
  lakeTubeGeo.scale(1, 0.065, 1);
  const lakeMesh = new THREE.Mesh(lakeTubeGeo, innerWaterMat);
  lakeMesh.position.y = 0.065;
  lakeMesh.scale.y = 0.12;
  lakeMesh.receiveShadow = true;
  terrainGroup.add(lakeMesh);

  // Nibong Island & Dragonfly Island inside the '/' Dragonfly Lake channel
  const lakeIslands = [
    { name: 'Nibong_Island', x: -31.5, z: -18.0, rx: 1.55, rz: 2.85, rotY: 0.42 },
    { name: 'Dragonfly_Island', x: -39.0, z: 0.0, rx: 1.75, rz: 3.35, rotY: 0.42 }
  ];
  for (const isl of lakeIslands) {
    const islRimGeo = new THREE.CylinderGeometry(1, 1.08, 0.16, 24);
    islRimGeo.scale(isl.rx * 1.12, 1, isl.rz * 1.12);
    const islRim = new THREE.Mesh(islRimGeo, baseBevelMat);
    islRim.position.set(isl.x, 0.09, isl.z);
    islRim.rotation.y = isl.rotY;
    terrainGroup.add(islRim);

    const islTopGeo = new THREE.CylinderGeometry(1, 1, 0.14, 24);
    islTopGeo.scale(isl.rx, 1, isl.rz);
    const islTop = new THREE.Mesh(islTopGeo, meadowLawnMat);
    islTop.position.set(isl.x, 0.15, isl.z);
    islTop.rotation.y = isl.rotY;
    terrainGroup.add(islTop);
  }

  // Shared lily pad & lotus flower geometries across all ponds
  const lilyPadMat = new THREE.MeshStandardMaterial({ color: 0x22C55E, roughness: 0.45 });
  const lotusFlowerMat = new THREE.MeshStandardMaterial({ color: 0xF472B6, roughness: 0.3 });
  const sharedPadGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.02, 16, 1, false, 0.25, Math.PI * 1.85);
  const sharedFlowerGeo = new THREE.ConeGeometry(0.20, 0.24, 8);
  const sharedBedGeo = new THREE.CylinderGeometry(1, 1, 0.02, 40);
  const sharedPondGeo = new THREE.CylinderGeometry(1, 1, 0.04, 40);
  const sharedRimGeo = new THREE.TorusGeometry(1, 0.065, 10, 48);

  for (const p of WATER_PONDS) {
    const px = p.x !== undefined ? p.x : p.cx;
    const pz = p.z !== undefined ? p.z : p.cz;
    const pRot = p.rot || 0;

    // 1. Deep Pond Bed Disc at y = 0.055 (top y = 0.065)
    const bedMesh = new THREE.Mesh(sharedBedGeo, pondBedMat);
    bedMesh.position.set(px, 0.055, pz);
    bedMesh.scale.set(p.rx * 0.99, 1, p.rz * 0.99);
    bedMesh.rotation.y = pRot;
    bedMesh.receiveShadow = true;
    terrainGroup.add(bedMesh);

    // 2. Crystal-Clear Turquoise Water Surface at y = 0.076 (top y = 0.096)
    const pond = new THREE.Mesh(sharedPondGeo, innerWaterMat);
    pond.position.set(px, 0.076, pz);
    pond.scale.set(p.rx, 1, p.rz);
    pond.rotation.y = pRot;
    pond.receiveShadow = true;
    terrainGroup.add(pond);

    // 3. Sculpted Sandstone Pond Rim around perimeter at y = 0.095
    const rim = new THREE.Mesh(sharedRimGeo, baseBevelMat);
    rim.position.set(px, 0.095, pz);
    rim.rotation.x = Math.PI / 2;
    rim.rotation.z = -pRot;
    rim.scale.set(p.rx * 1.01, p.rz * 1.01, 1.0);
    rim.castShadow = true;
    rim.receiveShadow = true;
    terrainGroup.add(rim);

    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2 + (i % 3) * 0.4;
      const dist = (0.24 + (i % 4) * 0.16) * Math.min(p.rx, p.rz);
      const lx = px + Math.cos(angle) * dist;
      const lz = pz + Math.sin(angle) * dist;

      const padMesh = new THREE.Mesh(sharedPadGeo, lilyPadMat);
      padMesh.position.set(lx, 0.112, lz);
      padMesh.rotation.y = i * 1.1;
      terrainGroup.add(padMesh);

      if (i % 3 === 0) {
        const flowerMesh = new THREE.Mesh(sharedFlowerGeo, lotusFlowerMat);
        flowerMesh.position.set(lx, 0.125, lz);
        terrainGroup.add(flowerMesh);
      }
    }
  }

  // 4. Pathways, Plazas & Walkable Bridges
  buildPathwaysPlazasAndBridges(THREE, terrainGroup, pathwayMat, meadowLawnMat);

  let waterRippleSpeed = 1.0;

  function applyMaterialSettings(settings) {
    if (!settings) return;
    if (settings.dioramaBaseBevelTint) {
      baseBevelMat.color.set(settings.dioramaBaseBevelTint);
    }
    if (settings.terrainGrassSaturation !== undefined) {
      const sat = settings.terrainGrassSaturation;
      grassMat.color.setHSL(0.31, Math.min(1, 0.48 * sat), 0.52);
      meadowLawnMat.color.setHSL(0.31, Math.min(1, 0.54 * sat), 0.56);
    }
    if (settings.pathwayWarmth !== undefined) {
      const w = settings.pathwayWarmth;
      pathwayMat.color.setHSL(0.11, Math.min(1, 0.38 * w), 0.9);
      pathwayMat.roughness = Math.max(0.15, Math.min(0.95, w));
    }
    if (settings.waterTurquoiseDepth !== undefined) {
      const d = Math.max(0.15, settings.waterTurquoiseDepth);
      outerWaterMat.color.setHSL(0.53, Math.min(1, 0.68 * d), Math.max(0.18, 0.34 / d));
      innerWaterMat.color.setHSL(0.52, Math.min(1, 0.72 * d), Math.max(0.24, 0.44 / d));
    }
    if (settings.waterReflectivity !== undefined) {
      outerWaterMat.metalness = settings.waterReflectivity * 0.55;
      outerWaterMat.roughness = Math.max(0.04, 0.42 - settings.waterReflectivity * 0.35);
      innerWaterMat.metalness = settings.waterReflectivity * 0.45;
      innerWaterMat.roughness = Math.max(0.03, 0.28 - settings.waterReflectivity * 0.24);
    }
    if (settings.waterRippleSpeed !== undefined) {
      waterRippleSpeed = settings.waterRippleSpeed;
    }
  }

  function updateWaterRipples(elapsedSeconds) {
    matLib.waterRippleTex.offset.x = (elapsedSeconds * 0.038 * waterRippleSpeed) % 1;
    matLib.waterRippleTex.offset.y = (elapsedSeconds * 0.024 * waterRippleSpeed) % 1;
  }

  return {
    baseBevelMat,
    applyMaterialSettings,
    updateWaterRipples
  };
}
