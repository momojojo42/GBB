// ============================================================================
// Gardens by the Bay — Screen 3: Interactive 360° 3D Drag-to-Rotate View
// (src/ui/Relic3DInspectorModal.js)
// ============================================================================
import {
  getOneShortSentence,
  formatRelicPointsBadge,
  createRelicToyEffectsController
} from './RelicToyEffects.js';
import {
  buildRelicThreeStage,
  attachNormalizedRelicToHolder
} from './Relic3DStageRenderer.js';
export function createRelic3DInspectorModal({
  appState,
  getTerrainSys,
  getGlbRegistry,
  onBackToCollection
}) {
  let inspectorRenderer = null;
  let inspectorScene = null;
  let inspectorCamera = null;
  let turntableGroup = null;
  let relicMeshHolder = null;
  let innerRingMesh = null;
  let toyParticlesGroup = null;
  const DEFAULT_FRONT_YAW = Math.PI + 0.38;
  const stageState = {
    yaw: DEFAULT_FRONT_YAW,
    pitch: 0,
    velYaw: 0,
    velPitch: 0,
    zoomDist: 3.35,
    targetZoomDist: 3.35,
    isDragging: false,
    lastPointerX: 0,
    lastPointerY: 0,
    pointerDownX: 0,
    pointerDownY: 0,
    dragDistance: 0,
    autoSpin: true,
    activeRelicId: null,
    toyAnimTimer: 0,
    toyAnimType: 'happy_bounce'
  };
  function getActiveRelic() {
    const terrainSys = getTerrainSys();
    const all = terrainSys?.treasuresList || [];
    const targetId = Number(stageState.activeRelicId || appState.selectedRelicId || 1);
    return all.find((r) => r.id === targetId) || all[0] || null;
  }
  const toyEffects = createRelicToyEffectsController({
    stageState,
    getActiveRelic
  });
  function triggerToyAction() {
    toyEffects.triggerToyAction(toyParticlesGroup);
  }
  function ensureThreeStage() {
    const canvas = document.getElementById('relic3DInspectorCanvas');
    if (!canvas) return false;
    if (!inspectorRenderer) {
      const stage = buildRelicThreeStage(canvas, stageState.zoomDist);
      inspectorRenderer = stage.inspectorRenderer;
      inspectorScene = stage.inspectorScene;
      inspectorCamera = stage.inspectorCamera;
      turntableGroup = stage.turntableGroup;
      relicMeshHolder = stage.relicMeshHolder;
      innerRingMesh = stage.innerRingMesh;
      toyParticlesGroup = stage.toyParticlesGroup;
      bindStageInteraction(canvas);
    }
    resizeStageCanvas();
    return true;
  }
  function resizeStageCanvas() {
    const wrap = document.getElementById('relic3DStageWrap');
    if (!wrap || !inspectorRenderer || !inspectorCamera) return;
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(320, Math.floor(rect.width || 780));
    const h = Math.max(220, Math.floor(rect.height || 340));
    inspectorRenderer.setSize(w, h, false);
    inspectorCamera.aspect = w / h;
    inspectorCamera.updateProjectionMatrix();
  }
  function loadRelicMeshIntoStage(relic) {
    if (!ensureThreeStage() || !relicMeshHolder) return;
    toyEffects.clearToyParticles(toyParticlesGroup);
    stageState.toyAnimTimer = 0;
    relicMeshHolder.scale.set(1, 1, 1);
    relicMeshHolder.rotation.set(0, 0, 0);
    relicMeshHolder.position.set(0, 0.04, 0);
    attachNormalizedRelicToHolder(relic, relicMeshHolder, getGlbRegistry?.());
    stageState.yaw = DEFAULT_FRONT_YAW;
    stageState.pitch = 0;
    stageState.velYaw = 0;
    stageState.velPitch = 0;
    stageState.targetZoomDist = 3.35;
    stageState.zoomDist = 3.35;
  }
  function bindStageInteraction(canvas) {
    const wrap = document.getElementById('relic3DStageWrap') || canvas;
    wrap.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      stageState.isDragging = true;
      stageState.lastPointerX = e.clientX;
      stageState.lastPointerY = e.clientY;
      stageState.pointerDownX = e.clientX;
      stageState.pointerDownY = e.clientY;
      stageState.dragDistance = 0;
      stageState.velYaw = 0;
      stageState.velPitch = 0;
      wrap.setPointerCapture?.(e.pointerId);
      wrap.classList.add('is-dragging');
    });
    wrap.addEventListener('pointermove', (e) => {
      if (!stageState.isDragging) return;
      const dx = e.clientX - stageState.lastPointerX;
      const dy = e.clientY - stageState.lastPointerY;
      stageState.lastPointerX = e.clientX;
      stageState.lastPointerY = e.clientY;
      stageState.dragDistance += Math.hypot(dx, dy);
      const deltaYaw = dx * 0.0115;
      const deltaPitch = dy * 0.0065;
      stageState.yaw += deltaYaw;
      stageState.pitch = Math.max(-0.24, Math.min(0.42, stageState.pitch + deltaPitch));
      stageState.velYaw = deltaYaw;
      stageState.velPitch = deltaPitch;
    });
    const endDrag = (e) => {
      if (!stageState.isDragging) return;
      stageState.isDragging = false;
      wrap.releasePointerCapture?.(e.pointerId);
      wrap.classList.remove('is-dragging');
      const totalDrag = Math.max(
        stageState.dragDistance,
        Math.hypot((e.clientX || 0) - stageState.pointerDownX, (e.clientY || 0) - stageState.pointerDownY)
      );
      if (e.type === 'pointerup' && totalDrag <= 6) {
        triggerToyAction();
      }
    };
    wrap.addEventListener('pointerup', endDrag);
    wrap.addEventListener('pointercancel', endDrag);
    wrap.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        stageState.targetZoomDist = Math.max(
          2.05,
          Math.min(4.5, stageState.targetZoomDist + e.deltaY * 0.0025)
        );
      },
      { passive: false }
    );
    const playToyBtn = toyEffects.ensurePlayToyButton();
    playToyBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerToyAction();
    });
    document.getElementById('btnRelic3DReset')?.addEventListener('click', () => {
      stageState.yaw = DEFAULT_FRONT_YAW;
      stageState.pitch = 0;
      stageState.velYaw = 0;
      stageState.velPitch = 0;
      stageState.targetZoomDist = 3.35;
    });
    const btnAutoSpin = document.getElementById('btnRelic3DAutoSpin');
    btnAutoSpin?.addEventListener('click', () => {
      stageState.autoSpin = !stageState.autoSpin;
      btnAutoSpin.classList.toggle('active', stageState.autoSpin);
      btnAutoSpin.textContent = stageState.autoSpin ? '⟳ Auto-Spin: ON' : '⟳ Auto-Spin: OFF';
    });
    document.getElementById('btnRelic3DZoomIn')?.addEventListener('click', () => {
      stageState.targetZoomDist = Math.max(2.05, stageState.targetZoomDist - 0.38);
    });
    document.getElementById('btnRelic3DZoomOut')?.addEventListener('click', () => {
      stageState.targetZoomDist = Math.min(4.5, stageState.targetZoomDist + 0.38);
    });
    document.getElementById('btnRelic3DPrev')?.addEventListener('click', () => {
      stepRelicSelection(-1);
    });
    document.getElementById('btnRelic3DNext')?.addEventListener('click', () => {
      stepRelicSelection(1);
    });
    document.getElementById('btnBackToCollectionFrom3D')?.addEventListener('click', () => {
      onBackToCollection?.();
    });
  }
  function getStripRelicsList() {
    const terrainSys = getTerrainSys();
    if (!terrainSys) return [];
    const all = terrainSys.treasuresList || [];
    const myCollected = all.filter((t) => t.collectedBy === 'you');
    const orderList = Array.isArray(appState.playerCollectedOrder) ? appState.playerCollectedOrder : [];
    if (myCollected.length > 0) {
      const sortedMine = [...myCollected].sort((a, b) => {
        const idxA = orderList.indexOf(a.id);
        const idxB = orderList.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return a.id - b.id;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxB - idxA;
      });
      const activeId = Number(appState.selectedRelicId);
      if (activeId && !sortedMine.some((r) => r.id === activeId)) {
        const currentRelic = all.find((r) => r.id === activeId);
        if (currentRelic) sortedMine.unshift(currentRelic);
      }
      return sortedMine;
    }
    return all.slice(0, 12);
  }
  function stepRelicSelection(direction) {
    const list = getStripRelicsList();
    if (!list.length) return;
    const currentIdx = list.findIndex((r) => r.id === Number(appState.selectedRelicId));
    const nextIdx = (currentIdx + direction + list.length) % list.length;
    openRelic3DInspector(list[nextIdx].id);
  }
  function openRelic3DInspector(relicId) {
    const terrainSys = getTerrainSys();
    if (!terrainSys) return;
    const all = terrainSys.treasuresList || [];
    const targetId = Number(relicId || appState.selectedRelicId || 1);
    const relic = all.find((r) => r.id === targetId) || all[0];
    if (!relic) return;
    appState.selectedRelicId = relic.id;
    stageState.activeRelicId = relic.id;
    stageState.toyComboCount = 0;
    const idBadge = document.getElementById('relic3DIdBadge');
    if (idBadge) idBadge.textContent = `RELIC #${String(relic.id).padStart(2, '0')}`;
    const zoneBadge = document.getElementById('relic3DZoneBadge');
    if (zoneBadge) {
      zoneBadge.textContent = relic.funnyTag
        ? `${relic.funnyTag} • 📍 ${relic.zoneName}`
        : `📍 ${relic.zoneName}`;
    }
    const badgeText = formatRelicPointsBadge(relic);
    const ptsBadge = document.getElementById('relic3DPointsBadge') || document.getElementById('relic3DPtsBadge');
    if (ptsBadge) ptsBadge.textContent = badgeText;
    const legacyPtsBadge = document.getElementById('relic3DPtsBadge');
    if (legacyPtsBadge) legacyPtsBadge.textContent = badgeText;
    const counterBadge = document.getElementById('relic3DItemCounter');
    if (counterBadge) {
      const stripList = getStripRelicsList();
      const idx = Math.max(0, stripList.findIndex((r) => r.id === relic.id));
      counterBadge.textContent = `${idx + 1} / ${Math.max(1, stripList.length)}`;
    }
    const compactTitle = relic.shortName || relic.name;
    const titleEl = document.getElementById('relic3DInspectorTitle');
    if (titleEl) {
      titleEl.textContent = `${relic.icon || '🌸'} ${compactTitle}`;
    }
    const hookLine = relic.wowPunchline || relic.ahaHook || getOneShortSentence(relic);
    const oneSentenceEl = document.getElementById('relic3DOneSentence');
    if (oneSentenceEl) {
      oneSentenceEl.textContent = hookLine;
    }
    const inspectorSentenceEl = document.getElementById('relic3DInspectorSentence');
    if (inspectorSentenceEl) {
      inspectorSentenceEl.textContent = hookLine;
    }
    loadRelicMeshIntoStage(relic);
    toyEffects.syncPlayToyButtonLabel?.(relic);
    renderBottomStrip(relic.id);
    if (inspectorRenderer && inspectorScene && inspectorCamera && turntableGroup) {
      turntableGroup.rotation.y = stageState.yaw;
      if (relicMeshHolder) {
        relicMeshHolder.rotation.set(0, 0, 0);
      }
      const camPitch = 0.21 + stageState.pitch;
      inspectorCamera.position.set(
        0,
        Math.sin(camPitch) * stageState.zoomDist,
        Math.cos(camPitch) * stageState.zoomDist
      );
      inspectorCamera.lookAt(0, 0.02, 0);
      inspectorRenderer.render(inspectorScene, inspectorCamera);
    }
  }
  function renderBottomStrip(activeRelicId) {
    const stripEl = document.getElementById('relic3DInspectorStrip');
    if (!stripEl) return;
    const list = getStripRelicsList();
    stripEl.innerHTML = list.map((item) => {
      const isActive = item.id === activeRelicId;
      const shortLabel = item.shortName || item.name;
      return `
        <button
          type="button"
          class="pearl-strip-thumb ${isActive ? 'active' : ''}"
          data-strip-relic-id="${item.id}"
          title="#${String(item.id).padStart(2, '0')} ${item.name}"
        >
          <img src="${item.image || ''}" alt="${shortLabel}" class="pst-img" loading="lazy" />
          <span class="pst-label">${shortLabel}</span>
        </button>
      `;
    }).join('');
    stripEl.querySelectorAll('.pearl-strip-thumb').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = Number(btn.dataset.stripRelicId);
        openRelic3DInspector(id);
      });
    });
  }
  function updateAndRenderStage(dt) {
    if (appState.screen !== 'relic3d') return;
    if (!inspectorRenderer || !inspectorScene || !inspectorCamera || !turntableGroup) return;
    if (!stageState.isDragging) {
      if (Math.abs(stageState.velYaw) > 0.0002 || Math.abs(stageState.velPitch) > 0.0002) {
        stageState.yaw += stageState.velYaw;
        stageState.pitch = Math.max(-0.24, Math.min(0.42, stageState.pitch + stageState.velPitch));
        stageState.velYaw *= 0.92;
        stageState.velPitch *= 0.90;
      } else if (stageState.autoSpin) {
        stageState.yaw += dt * 0.55;
      }
    }
    stageState.zoomDist += (stageState.targetZoomDist - stageState.zoomDist) * Math.min(1, dt * 10);
    const camPitch = 0.21 + stageState.pitch;
    inspectorCamera.position.set(
      0,
      Math.sin(camPitch) * stageState.zoomDist,
      Math.cos(camPitch) * stageState.zoomDist
    );
    inspectorCamera.lookAt(0, 0.02, 0);
    const { posX, posY, rotX, rotZ, scaleX, scaleY, scaleZ } =
      toyEffects.computeToyPoseAndStepParticles(dt, toyParticlesGroup);
    turntableGroup.rotation.y = stageState.yaw;
    if (relicMeshHolder) {
      relicMeshHolder.position.set(posX, posY, 0);
      relicMeshHolder.rotation.set(rotX, 0, rotZ);
      relicMeshHolder.scale.set(scaleX, scaleY, scaleZ);
    }
    if (innerRingMesh) {
      innerRingMesh.rotation.y -= dt * 0.35;
    }
    inspectorRenderer.render(inspectorScene, inspectorCamera);
  }
  return {
    openRelic3DInspector,
    resizeStageCanvas,
    updateAndRenderStage,
    triggerToyAction
  };
}
