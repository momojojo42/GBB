// ============================================================================
// Gardens by the Bay — Headless Blender .glb Asset Loader & Registry
// (src/core/AssetLoader.js)
// ============================================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const GLB_BUNDLE_SPECS = [
  {
    key: 'buildings',
    label: '🏛️ Supertrees & Domes',
    file: 'buildings_landmarks.glb',
    expectedBytes: 3650000
  },
  {
    key: 'characters',
    label: '🧭 Chibi Squad',
    file: 'chibi_explorers.glb?v=2.6',
    expectedBytes: 2410000
  },
  {
    key: 'sculptures',
    label: '🌉 Bridges & Art',
    file: 'sculptures_bridges.glb',
    expectedBytes: 814000
  },
  {
    key: 'treasures',
    label: '🌸 42 Relics & Flora',
    file: 'treasures_foliage.glb?v=42.1',
    expectedBytes: 21100000
  }
];

export async function loadAllBlenderGLBAssets(callbacks = {}) {
  const { onProgress, onBundleComplete } =
    typeof callbacks === 'function' ? { onProgress: callbacks } : callbacks;

  const loader = new GLTFLoader();
  const namedObjects = new Map();
  const loadedBundles = {};

  // Track byte progress per bundle key
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

  async function loadSingleGLB(spec) {
    const candidateUrls = [
      `./models/${spec.file}`,
      `./public/models/${spec.file}`
    ];

    for (const url of candidateUrls) {
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

  emitProgress(GLB_BUNDLE_SPECS[0].label);

  await Promise.all(
    GLB_BUNDLE_SPECS.map(async (spec) => {
      const { key, file, label } = spec;
      try {
        const gltf = await loadSingleGLB(spec);
        loadedBundles[key] = gltf.scene;

        gltf.scene.traverse((obj) => {
          if (obj.isMesh) {
            obj.castShadow = true;
            obj.receiveShadow = true;
            if (obj.material) {
              obj.material.envMapIntensity = 0.35;
            }
          }
        });

        // Register top-level children and any explicitly named objects
        for (const child of gltf.scene.children) {
          if (child.name) {
            namedObjects.set(child.name, child);
          }
        }
        gltf.scene.traverse((obj) => {
          if (obj.name && !namedObjects.has(obj.name)) {
            namedObjects.set(obj.name, obj);
          }
        });

        const st = progressState.get(key);
        if (st) {
          st.loaded = st.total;
          st.done = true;
        }
        emitProgress(label);
        if (typeof onBundleComplete === 'function') {
          onBundleComplete(key, spec);
        }
      } catch (err) {
        console.warn(`[AssetLoader] Warning loading ${file}:`, err.message);
        const st = progressState.get(key);
        if (st) {
          st.loaded = st.total;
          st.done = true;
        }
        emitProgress(label);
      }
    })
  );

  /**
   * Deep-clone a named root object from any of the loaded Blender .glb files,
   * cloning materials optionally when per-instance tinting is needed.
   */
   function cloneAsset(name, cloneMaterials = false) {
    const template = namedObjects.get(name);
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

  return {
    loadedBundles,
    namedObjects,
    hasAsset: (name) => namedObjects.has(name),
    cloneAsset
  };
}
