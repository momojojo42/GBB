/**
 * Interactive LookDev Control Panel (Lighting, Textures/Materials & Camera Angles)
 * Built with Poppins typography and modern-web-guidance pointer-capture drag handle + keyboard support.
 */

import {
  DEFAULT_LOOKDEV_SETTINGS,
  CAMERA_ANGLE_PRESETS
} from '../core/AdminAuthGuard.js';
import {
  initAdminAnimState,
  toggleAdminCleanView,
  renderAdminInspectTab
} from './Admin3DAnimInspectorTab.js';
import {
  buildLookDevShellHtml,
  renderLookDevTabHtml
} from './LookDevSlidersTemplate.js';

export { DEFAULT_LOOKDEV_SETTINGS, CAMERA_ANGLE_PRESETS };

export function cloneLookDevSettings(src = DEFAULT_LOOKDEV_SETTINGS) {
  return JSON.parse(JSON.stringify(src));
}

export function createLookDevControlPanel({
  initialSettings = DEFAULT_LOOKDEV_SETTINGS,
  onChange,
  onSelectCameraPreset,
  onSelectMilestoneStage
}) {
  initAdminAnimState();
  let settings = cloneLookDevSettings(initialSettings);
  let activeTab = 'inspect';
  let isCollapsed = false;

  const panel = document.createElement('aside');
  panel.id = 'lookDevControlPanel';
  panel.className = 'lookdev-panel';
  panel.setAttribute('aria-label', 'Interactive LookDev Control Panel');

  panel.innerHTML = buildLookDevShellHtml(
    CAMERA_ANGLE_PRESETS,
    settings.camera.activeAnglePreset
  );

  document.body.appendChild(panel);

  const handle = panel.querySelector('#lookDevDragHandle');
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  function moveTo(left, top) {
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    const maxLeft = Math.max(0, window.innerWidth - panel.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - panel.offsetHeight);
    panel.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
    panel.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
  }

  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || event.target.closest('button, input, select, textarea, a')) return;
    const rect = panel.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    startX = event.clientX;
    startY = event.clientY;
    isDragging = false;
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener('pointermove', (event) => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    if (!isDragging && Math.hypot(event.clientX - startX, event.clientY - startY) < 4) return;
    isDragging = true;
    handle.classList.add('dragging');
    moveTo(event.clientX - offsetX, event.clientY - offsetY);
  });

  handle.addEventListener('lostpointercapture', () => {
    isDragging = false;
    handle.classList.remove('dragging');
  });

  handle.addEventListener('keydown', (event) => {
    const step = 15;
    const rect = panel.getBoundingClientRect();
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      moveTo(rect.left - step, rect.top);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      moveTo(rect.left + step, rect.top);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveTo(rect.left, rect.top - step);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveTo(rect.left, rect.top + step);
    }
  });

  window.addEventListener('resize', () => {
    if (panel.style.left && panel.style.top) {
      const rect = panel.getBoundingClientRect();
      moveTo(rect.left, rect.top);
    }
  });

  function showToast(msg) {
    const toast = panel.querySelector('#lookDevToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  function emitChange() {
    if (typeof onChange === 'function') {
      onChange(settings);
    }
    const jsonArea = panel.querySelector('#lookDevJsonTextarea');
    if (jsonArea && document.activeElement !== jsonArea) {
      jsonArea.value = JSON.stringify(settings, null, 2);
    }
  }

  function renderActiveTab() {
    const container = panel.querySelector('#lookDevTabContent');
    if (!container) return;

    if (activeTab === 'inspect') {
      renderAdminInspectTab(container, { settings, onChange: emitChange, showToast });
      return;
    }

    container.innerHTML = renderLookDevTabHtml(activeTab, settings);

    if (activeTab === 'json') {
      const applyBtn = container.querySelector('#btnApplyPastedJson');
      applyBtn?.addEventListener('click', () => {
        const area = container.querySelector('#lookDevJsonTextarea');
        try {
          const parsed = JSON.parse(area.value);
          if (parsed.lighting) Object.assign(settings.lighting, parsed.lighting);
          if (parsed.textures) Object.assign(settings.textures, parsed.textures);
          if (parsed.camera) Object.assign(settings.camera, parsed.camera);
          emitChange();
          showToast('✓ Custom JSON settings applied to live 3D scene!');
        } catch {
          showToast('⚠️ Invalid JSON syntax — please check formatting.');
        }
      });
    }

    container.querySelectorAll('.lookdev-range').forEach((input) => {
      input.addEventListener('input', (e) => {
        const g = e.target.dataset.group;
        const k = e.target.dataset.key;
        const u = e.target.dataset.unit || '';
        const num = parseFloat(e.target.value);
        settings[g][k] = num;
        const badge = container.querySelector(`#val-${g}-${k}`);
        if (badge) badge.textContent = `${num}${u}`;
        emitChange();
      });
    });

    container.querySelectorAll('.lookdev-color').forEach((input) => {
      input.addEventListener('input', (e) => {
        const g = e.target.dataset.group;
        const k = e.target.dataset.key;
        settings[g][k] = e.target.value;
        const badge = container.querySelector(`#val-${g}-${k}`);
        if (badge) badge.textContent = e.target.value;
        emitChange();
      });
    });

    container.querySelectorAll('[data-light-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        settings.lighting.preset = btn.dataset.lightPreset;
        renderActiveTab();
        emitChange();
      });
    });
  }

  panel.querySelectorAll('.lookdev-tab').forEach((tabBtn) => {
    tabBtn.addEventListener('click', () => {
      activeTab = tabBtn.dataset.tab;
      panel.querySelectorAll('.lookdev-tab').forEach((b) => b.classList.toggle('active', b === tabBtn));
      renderActiveTab();
    });
  });

  const camSelect = panel.querySelector('#lookDevCamPresetSelect');
  camSelect.addEventListener('change', (e) => {
    const presetId = e.target.value;
    settings.camera.activeAnglePreset = presetId;
    const preset = CAMERA_ANGLE_PRESETS.find((p) => p.id === presetId);
    if (preset && preset.lightingPreset) {
      settings.lighting.preset = preset.lightingPreset;
      if (activeTab === 'lighting') renderActiveTab();
    }
    if (typeof onSelectCameraPreset === 'function') {
      onSelectCameraPreset(presetId, preset);
    }
    emitChange();
  });

  const milestoneSelect = panel.querySelector('#lookDevMilestoneSelect');
  milestoneSelect.addEventListener('change', (e) => {
    if (typeof onSelectMilestoneStage === 'function') {
      onSelectMilestoneStage(e.target.value);
    }
  });

  const cleanViewBtn = panel.querySelector('#btnLookDevCleanView');
  cleanViewBtn?.addEventListener('click', () => {
    toggleAdminCleanView(undefined, showToast);
  });

  const collapseBtn = panel.querySelector('#btnCollapseLookDev');
  function setCollapsed(val) {
    isCollapsed = typeof val === 'boolean' ? val : !isCollapsed;
    panel.classList.toggle('collapsed', isCollapsed);
    collapseBtn.textContent = isCollapsed ? '＋' : '−';
    collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
  }
  collapseBtn.addEventListener('click', () => setCollapsed());

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'h' || e.key === 'H') {
      e.preventDefault();
      toggleAdminCleanView(undefined, showToast);
    } else if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      setCollapsed();
    }
  });

  const copyBtn = panel.querySelector('#btnCopySettingsJson');
  copyBtn.addEventListener('click', async () => {
    const jsonString = JSON.stringify(settings, null, 2);
    try {
      await navigator.clipboard.writeText(jsonString);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = jsonString;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      temp.remove();
    }
    const label = panel.querySelector('#copyBtnLabel');
    if (label) {
      label.textContent = 'Copied JSON to Clipboard! ✓';
      setTimeout(() => {
        label.textContent = 'Copy Settings as JSON';
      }, 2400);
    }
    showToast('✓ Settings JSON copied! Paste it in chat to bake as permanent defaults.');
  });

  const resetBtn = panel.querySelector('#btnResetLookDev');
  resetBtn.addEventListener('click', () => {
    settings = cloneLookDevSettings(DEFAULT_LOOKDEV_SETTINGS);
    camSelect.value = settings.camera.activeAnglePreset;
    renderActiveTab();
    emitChange();
    showToast('↺ Restored default LookDev settings.');
  });

  renderActiveTab();

  return {
    element: panel,
    setCollapsed,
    getSettings: () => settings,
    setSettings: (newSettings) => {
      if (newSettings.lighting) Object.assign(settings.lighting, newSettings.lighting);
      if (newSettings.textures) Object.assign(settings.textures, newSettings.textures);
      if (newSettings.camera) Object.assign(settings.camera, newSettings.camera);
      camSelect.value = settings.camera.activeAnglePreset;
      renderActiveTab();
      emitChange();
    },
    setCameraPreset: (presetId) => {
      settings.camera.activeAnglePreset = presetId;
      camSelect.value = presetId;
      const preset = CAMERA_ANGLE_PRESETS.find((p) => p.id === presetId);
      if (preset && preset.lightingPreset) {
        settings.lighting.preset = preset.lightingPreset;
      }
      renderActiveTab();
      if (typeof onSelectCameraPreset === 'function') {
        onSelectCameraPreset(presetId, preset);
      }
      emitChange();
    }
  };
}
