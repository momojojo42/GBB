// ============================================================================
// Multi-Map Headless Blender .glb Asset Loader & Categorized Mesh Registry
// Supports Map 01 (Gardens by the Bay), Shared Chibi Explorers, and Map 02
// (Singapore Botanic Gardens: sbg_buildings_landmarks.glb,
//  sbg_sculptures_bridges.glb, sbg_treasures_foliage.glb)
// (src/core/AssetLoader.js)
// ============================================================================

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getActiveMapId } from '../data/MapRegistry.js';

export const GLB_BUNDLE_SPECS = [
  {
    key: 'buildings',
    category: 'buildings',
    mapId: 'gbb',
    label: '🏛️ Supertrees & Domes',
    file: 'buildings_landmarks.glb',
    expectedBytes: 3650000
  },
  {
    key: 'characters',
    category: 'characters',
    mapId: 'shared',
    label: '🧭 Chibi Squad',
    file: 'chibi_explorers.glb?v=2.6',
    expectedBytes: 2410000
  },
  {
    key: 'sculptures',
    category: 'sculptures',
    mapId: 'gbb',
    label: '🌉 Bridges & Art',
    file: 'sculptures_bridges.glb',
    expectedBytes: 814000
  },
  {
    key: 'treasures',
    category: 'treasures',
    mapId: 'gbb',
    label: '🌸 42 Relics & Flora',
    file: 'treasures_foliage.glb?v=42.1',
    expectedBytes: 21100000
  }
];

export const SBG_GLB_BUNDLE_SPECS = [
  {
    key: 'sbg_buildings',
    category: 'buildings',
    mapId: 'sbg',
    optional: true,
    label: '🏛️ SBG Bandstand & Heritage Houses',
    file: 'sbg/sbg_buildings_landmarks.glb?v=2.1',
    expectedBytes: 3100000
  },
  {
    key: 'sbg_sculptures',
    category: 'sculptures',
    mapId: 'sbg',
    optional: true,
    label: '🦢 SBG Swans, Gates & Bridges',
    file: 'sbg/sbg_sculptures_bridges.glb?v=2.1',
    expectedBytes: 760000
  },
  {
    key: 'sbg_treasures',
    category: 'treasures',
    mapId: 'sbg',
    optional: true,
    label: '🌺 42 SBG UNESCO Relics & Flora',
    file: 'sbg/sbg_treasures_foliage.glb?v=2.1',
    expectedBytes: 2100000
  }
];

export const MAP_GLB_BUNDLE_SPECS = {
  gbb: GLB_BUNDLE_SPECS,
  sbg: SBG_GLB_BUNDLE_SPECS
};

export async function loadAllBlenderGLBAssets(callbacks = {}) {
  const { onProgress, onBundleComplete } =
    typeof callbacks === 'function' ? { onProgress: callbacks } : callbacks;

  const loader = new GLTFLoader();
  const namedObjects = new Map();
  const buildings = new Map();
  const sculptures = new Map();
  const foliage = new Map();
  const characters = new Map();
  const gbbRelics = new Map();
  const sbgRelics = new Map();
  const relicsByMap = { gbb: gbbRelics, sbg: sbgRelics };
  const loadedBundles = {};
  const inFlightBundles = new Map();

  // Track byte progress per core bundle key for the loading splash UI
  const progressState = new Map();
  for (const spec of GLB_BUNDLE_SPECS) {
    progressState.set(spec.key, {
      loaded: 0,
      total: spec.expectedBytes,
      done: false
    });
  }

  function emitProgress(activeLabel) {
    if (typeof onProgress !== 'function') return;
    let loadedBytes = 0;
    let totalBytes = 0;
    const completedKeys = [];

    for (const spec of GLB_BUNDLE_SPECS) {
      const st = progressState.get(spec.key);
      totalBytes += st.total;
      loadedBytes += st.done ? st.total : Math.min(st.loaded, st.total * 0.98);
      if (st.done) completedKeys.push(spec.key);
    }

    const ratio = totalBytes > 0 ? Math.min(1, Math.max(0, loadedBytes / totalBytes)) : 0;
    onProgress({
      ratio,
      percent: Math.round(ratio * 100),
      loadedBytes,
      totalBytes,
      completedKeys,
      activeLabel
    });
  }

  function loadWithProgress(url, onFileProgress) {
    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        (evt) => {
          if (onFileProgress && evt) {
            onFileProgress(evt.loaded || 0, evt.lengthComputable ? evt.total : 0);
          }
        },
        (err) => reject(err)
      );
    });
  }

  async function isBinaryGLBAvailable(url) {
    if (typeof fetch !== 'function') return true;
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (!res.ok) return false;
      const ctype = (res.headers.get('content-type') || '').toLowerCase();
      if (ctype.includes('text/html')) return false;
      return true;
    } catch (_) {
      return false;
    }
  }

  async function loadSingleGLB(spec) {
    const candidateUrls = [
      `./models/${spec.file}`,
      `./public/models/${spec.file}`
    ];

    for (const url of candidateUrls) {
      if (spec.optional) {
        const exists = await isBinaryGLBAvailable(url);
        if (!exists) continue;
      }
      try {
        const gltf = await loadWithProgress(url, (loaded, total) => {
          const st = progressState.get(spec.key);
          if (st) {
            st.loaded = loaded;
            if (total > 0) st.total = total;
            emitProgress(spec.label);
          }
        });
        return gltf;
      } catch (_) {
        // Try next candidate URL
      }
    }
    throw new Error(`Could not load GLB bundle: ${spec.file}`);
  }

  function registerObjectInCategories(name, obj, spec) {
    if (!name || !obj) return;
    const isSBGBundle = spec.mapId === 'sbg' || name.startsWith('SBG_');
    const lower = name.toLowerCase();

    if (isSBGBundle && !namedObjects.has(name)) {
      namedObjects.set(name, obj);
    } else if (!isSBGBundle) {
      namedObjects.set(name, obj);
    }

    if (name.startsWith('SBG_Relic_') || (isSBGBundle && name.startsWith('Relic_'))) {
      sbgRelics.set(name, obj);
      const plainRelicKey = name.replace(/^SBG_/, '');
      sbgRelics.set(plainRelicKey, obj);
      namedObjects.set(`SBG_${plainRelicKey}`, obj);
      return;
    }

    if (name.startsWith('Relic_') && name !== 'Relic_Pedestal') {
      gbbRelics.set(name, obj);
      return;
    }

    if (
      name.startsWith('Tree_') ||
      name.startsWith('SBG_Tree_') ||
      lower.includes('tembusu') ||
      lower.includes('rain_tree') ||
      lower.includes('kapok') ||
      lower.includes('jelutong') ||
      lower.includes('cannonball') ||
      lower.includes('ginger') ||
      lower.includes('foliage') ||
      lower.includes('palm') ||
      lower.includes('fern') ||
      lower.includes('orchid')
    ) {
      foliage.set(name, obj);
      return;
    }

    if (spec.category === 'buildings' || lower.includes('bandstand') || lower.includes('dome') || lower.includes('house')) {
      buildings.set(name, obj);
    } else if (spec.category === 'sculptures' || lower.includes('bridge') || lower.includes('swan') || lower.includes('gate')) {
      sculptures.set(name, obj);
    } else if (spec.category === 'characters') {
      characters.set(name, obj);
    }
  }

  function indexGLTFScene(scene, spec) {
    if (!scene) return;
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        if (obj.material) {
          obj.material.envMapIntensity = 0.35;
        }
      }
    });

    for (const child of scene.children) {
      if (child.name) {
        registerObjectInCategories(child.name, child, spec);
      }
    }
    scene.traverse((obj) => {
      if (obj.name && !namedObjects.has(obj.name)) {
        registerObjectInCategories(obj.name, obj, spec);
      }
    });
  }

  async function loadAndIndexBundleSpec(spec) {
    if (loadedBundles[spec.key]) return loadedBundles[spec.key];
    if (inFlightBundles.has(spec.key)) return inFlightBundles.get(spec.key);

    const task = (async () => {
      const { key, file, label } = spec;
      try {
        const gltf = await loadSingleGLB(spec);
        loadedBundles[key] = gltf.scene;
        indexGLTFScene(gltf.scene, spec);

        const st = progressState.get(key);
        if (st) {
          st.loaded = st.total;
          st.done = true;
          emitProgress(label);
        }
        if (typeof onBundleComplete === 'function') {
          onBundleComplete(key, spec);
        }
        return gltf.scene;
      } catch (err) {
        if (!spec.optional) {
          console.warn(`[AssetLoader] Warning loading ${file}:`, err.message);
        }
        const st = progressState.get(key);
        if (st) {
          st.loaded = st.total;
          st.done = true;
          emitProgress(label);
        }
        return null;
      } finally {
        inFlightBundles.delete(spec.key);
      }
    })();

    inFlightBundles.set(spec.key, task);
    return task;
  }

  async function ensureMapModelsLoaded(mapId = getActiveMapId()) {
    const specs = mapId === 'sbg' ? SBG_GLB_BUNDLE_SPECS : GLB_BUNDLE_SPECS;
    await Promise.allSettled(specs.map((spec) => loadAndIndexBundleSpec(spec)));
    return loadedBundles;
  }

  emitProgress(GLB_BUNDLE_SPECS[0].label);

  // Load core bundles + eagerly attempt SBG bundles via Promise.allSettled
  await Promise.allSettled([
    ...GLB_BUNDLE_SPECS.map((spec) => loadAndIndexBundleSpec(spec)),
    ...SBG_GLB_BUNDLE_SPECS.map((spec) => loadAndIndexBundleSpec(spec))
  ]);

  function resolveTemplateForMap(name, mapId = getActiveMapId()) {
    if (!name) return null;
    if (mapId === 'sbg') {
      if (sbgRelics.has(name)) return sbgRelics.get(name);
      if (sbgRelics.has(`SBG_${name}`)) return sbgRelics.get(`SBG_${name}`);
      if (namedObjects.has(`SBG_${name}`)) return namedObjects.get(`SBG_${name}`);
    } else if (gbbRelics.has(name)) {
      return gbbRelics.get(name);
    }
    return namedObjects.get(name) || null;
  }

  /**
   * Deep-clone a named root object from any of the loaded Blender .glb files,
   * automatically resolving map-specific `SBG_*` overrides when on Botanic Gardens.
   */
  function cloneAsset(name, cloneMaterials = false, mapId = getActiveMapId()) {
    const template = resolveTemplateForMap(name, mapId);
    if (!template) return null;

    const cloned = template.clone(true);
    cloned.position.set(0, 0, 0);

    if (cloneMaterials) {
      cloned.traverse((node) => {
        if (node.isMesh && node.material) {
          if (Array.isArray(node.material)) {
            node.material = node.material.map((m) => m.clone());
          } else {
            node.material = node.material.clone();
          }
        }
      });
    }
    return cloned;
  }

  function getRelicModel(relicData, mapId = getActiveMapId()) {
    const idNum = typeof relicData === 'number' ? relicData : relicData?.id;
    const padId = idNum ? String(idNum).padStart(2, '0') : '01';
    if (mapId === 'sbg') {
      const sbgKey = relicData?.sbgGlbModel || `SBG_Relic_${padId}`;
      return cloneAsset(sbgKey, true, 'sbg') || cloneAsset(relicData?.glbModel || `Relic_${padId}`, true, 'sbg');
    }
    return cloneAsset(relicData?.glbModel || `Relic_${padId}`, false, mapId);
  }

  return {
    loadedBundles, namedObjects, buildings, sculptures, foliage, characters,
    gbbRelics, sbgRelics, relicsByMap, ensureMapModelsLoaded,
    hasAsset: (name, mapId = getActiveMapId()) => Boolean(resolveTemplateForMap(name, mapId)),
    cloneAsset, getRelicModel
  };
}
