// ============================================================================
// Gardens by the Bay & Singapore Botanic Gardens — Blender Foliage Instancer
// Instantiates 195 deterministic WORLD_TREES + SBG 9 Heritage Flora Species
// (`SBG_Tembusu_Five_Dollar_Hero`, `SBG_Rain_Tree_Monarch`, `SBG_Kapok_Silk_Cotton_Giant`,
//  `SBG_Jelutong_Dipterocarp_Tower`, `SBG_Talipot_Fan_Palm`, `SBG_Cannonball_Couroupita_Tree`,
//  `SBG_Golden_Shower_Orchid_Arch`, `SBG_Torch_Ginger_Heliconia_Cluster`, `SBG_Giant_Tiger_Orchid_Clump`)
// (src/world/FoliageInstancer.js)
// ============================================================================

import { getActiveMapId } from '../../data/MapRegistry.js';
import { WORLD_TREES } from './TreeGenerator.js';
import { getTerrainElevationAt } from '../physics/TerrainElevation.js';

const SBG_SPECIES_MAP = {
  Tree_RainTree: { asset: 'SBG_Rain_Tree_Monarch', scaleMul: 0.72 },
  Tree_RoyalPalm: { asset: 'SBG_Talipot_Fan_Palm', scaleMul: 0.72 },
  Tree_TravellersPalm: { asset: 'SBG_Cannonball_Couroupita_Tree', scaleMul: 0.75 },
  Tree_Frangipani: { asset: 'SBG_Tembusu_Five_Dollar_Hero', scaleMul: 0.62 },
  Tree_GiantFern: { asset: 'SBG_Kapok_Silk_Cotton_Giant', scaleMul: 0.56 },
  Tree_Bougainvillea: { asset: 'SBG_Jelutong_Dipterocarp_Tower', scaleMul: 0.54 }
};

const SBG_BOTANICAL_FLORA_SPOTS = [
  { asset: 'SBG_Torch_Ginger_Heliconia_Cluster', x: -16.0, z: 18.5, scale: 0.85, rotY: 0.4 },
  { asset: 'SBG_Torch_Ginger_Heliconia_Cluster', x: -18.5, z: 21.5, scale: 0.92, rotY: 1.8 },
  { asset: 'SBG_Torch_Ginger_Heliconia_Cluster', x: -12.5, z: 21.5, scale: 0.88, rotY: -0.7 },
  { asset: 'SBG_Giant_Tiger_Orchid_Clump', x: -15.5, z: 7.5, scale: 0.82, rotY: 0.5 },
  { asset: 'SBG_Giant_Tiger_Orchid_Clump', x: -20.5, z: 3.5, scale: 0.86, rotY: 2.1 },
  { asset: 'SBG_Golden_Shower_Orchid_Arch', x: -26.5, z: 0.5, scale: 0.92, rotY: 0.35 },
  { asset: 'SBG_Golden_Shower_Orchid_Arch', x: -28.0, z: -3.0, scale: 0.92, rotY: -0.45 },
  { asset: 'SBG_Talipot_Fan_Palm', x: -5.5, z: -1.5, scale: 0.82, rotY: 0.9 },
  { asset: 'SBG_Talipot_Fan_Palm', x: 2.5, z: 2.0, scale: 0.86, rotY: 2.4 },
  { asset: 'SBG_Talipot_Fan_Palm', x: -8.0, z: -8.5, scale: 0.84, rotY: -1.1 }
];

export function buildTropicalFoliage(THREE, terrainGroup, glbRegistry, matLib) {
  const foliageGroup = new THREE.Group();
  foliageGroup.name = 'BlenderTropicalFoliageGroup';
  terrainGroup.add(foliageGroup);

  const isSBG = getActiveMapId() === 'sbg';
  const fallbackTrunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.5, 8);
  const fallbackTrunkMat = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.85 });
  const fallbackCanopyGeo = new THREE.DodecahedronGeometry(1.3, 1);
  const fallbackCanopyMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.55 });

  WORLD_TREES.forEach((treeSpec, idx) => {
    let treeNode = null;
    let scaleMul = 1.0;

    if (glbRegistry) {
      if (isSBG && SBG_SPECIES_MAP[treeSpec.speciesName]) {
        const sbgOverride = SBG_SPECIES_MAP[treeSpec.speciesName];
        treeNode = glbRegistry.cloneAsset(sbgOverride.asset, false, 'sbg');
        if (treeNode) scaleMul = sbgOverride.scaleMul;
      }
      if (!treeNode) {
        treeNode = glbRegistry.cloneAsset(treeSpec.speciesName, false);
      }
    }

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
    treeNode.scale.setScalar(treeSpec.scale * scaleMul);
    treeNode.rotation.y = treeSpec.rotY;
    foliageGroup.add(treeNode);

    if (idx % 2 === 0 && matLib?.createContactShadowDisc) {
      const shadowDisc = matLib.createContactShadowDisc(1.4 * treeSpec.scale, 1.4 * treeSpec.scale, 0.06);
      shadowDisc.position.set(treeSpec.x, treeBaseY + 0.06, treeSpec.z);
      foliageGroup.add(shadowDisc);
    }
  });

  if (isSBG && glbRegistry) {
    for (const spot of SBG_BOTANICAL_FLORA_SPOTS) {
      const floraMesh = glbRegistry.cloneAsset(spot.asset, false, 'sbg');
      if (!floraMesh) continue;
      const baseY = getTerrainElevationAt(spot.x, spot.z);
      floraMesh.position.set(spot.x, baseY, spot.z);
      floraMesh.scale.setScalar(spot.scale);
      floraMesh.rotation.y = spot.rotY;
      foliageGroup.add(floraMesh);
    }
  }

  return foliageGroup;
}
