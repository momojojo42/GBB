// ============================================================================
// Gardens by the Bay — Blender-Sculpted Tropical Tree & Palm Species Instancer
// (src/world/FoliageInstancer.js)
// Synced 1:1 with deterministic WORLD_TREES from WorldPhysicsEngine.
// ============================================================================

import { WORLD_TREES } from './TreeGenerator.js';
import { getTerrainElevationAt } from './TerrainElevation.js';

export function buildTropicalFoliage(THREE, terrainGroup, glbRegistry, matLib) {
  const foliageGroup = new THREE.Group();
  foliageGroup.name = 'BlenderTropicalFoliageGroup';
  terrainGroup.add(foliageGroup);

  const fallbackTrunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.5, 8);
  const fallbackTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.85 });
  const fallbackCanopyGeo = new THREE.DodecahedronGeometry(1.3, 1);
  const fallbackCanopyMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.55 });

  WORLD_TREES.forEach((treeSpec, idx) => {
    let treeNode = glbRegistry ? glbRegistry.cloneAsset(treeSpec.speciesName, false) : null;

    if (!treeNode) {
      treeNode = new THREE.Group();
      const tr = new THREE.Mesh(fallbackTrunkGeo, fallbackTrunkMat);
      tr.position.y = 0.75;
      const cn = new THREE.Mesh(fallbackCanopyGeo, fallbackCanopyMat);
      cn.position.y = 1.85;
      treeNode.add(tr, cn);
    }

    const treeBaseY = getTerrainElevationAt(treeSpec.x, treeSpec.z);
    treeNode.position.set(treeSpec.x, treeBaseY, treeSpec.z);
    treeNode.scale.setScalar(treeSpec.scale);
    treeNode.rotation.y = treeSpec.rotY;
    foliageGroup.add(treeNode);

    if (idx % 2 === 0) {
      const shadowDisc = matLib.createContactShadowDisc(1.4 * treeSpec.scale, 1.4 * treeSpec.scale, 0.06);
      shadowDisc.position.set(treeSpec.x, treeBaseY + 0.06, treeSpec.z);
      foliageGroup.add(shadowDisc);
    }
  });

  return foliageGroup;
}
