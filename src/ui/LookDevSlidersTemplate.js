// ============================================================================
// Gardens by the Bay — LookDev Panel Shell & Slider Tab HTML Templates
// (src/ui/LookDevSlidersTemplate.js)
// ============================================================================

export function buildLookDevShellHtml(cameraAnglePresets, activeAnglePreset) {
  return `
    <div class="lookdev-header drag-handle" id="lookDevDragHandle" tabindex="0" role="group" aria-label="LookDev Control Panel Header — Drag or use Arrow keys to move">
      <div class="lookdev-title-wrap">
        <span class="lookdev-dot"></span>
        <div>
          <div class="lookdev-eyebrow">INTERACTIVE LOOKDEV STUDIO</div>
          <h3 class="lookdev-title">3D Models, Anim &amp; Lighting</h3>
        </div>
      </div>
      <div class="lookdev-header-actions">
        <button type="button" class="lookdev-clean-btn" id="btnLookDevCleanView" title="Toggle Clean 3D View — Hide Gameplay HUD Cards [Shortcut: H]">👁️ Clean [H]</button>
        <button type="button" class="lookdev-icon-btn" id="btnCollapseLookDev" title="Minimize / Expand Panel [L]">−</button>
      </div>
    </div>

    <div class="lookdev-body" id="lookDevBody">
      <div class="lookdev-quick-bar">
        <label class="lookdev-field-label" for="lookDevCamPresetSelect">📸 Main Camera Angle Preset</label>
        <select id="lookDevCamPresetSelect" class="lookdev-select">
          ${cameraAnglePresets.map(
            (p) => `<option value="${p.id}" ${p.id === activeAnglePreset ? 'selected' : ''}>${p.label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="lookdev-quick-bar" style="padding-top: 0;">
        <label class="lookdev-field-label" for="lookDevMilestoneSelect">🏗️ Render Milestone Stage</label>
        <select id="lookDevMilestoneSelect" class="lookdev-select">
          <option value="all" selected>Milestone 5: Complete Scene (All Key Assets + UI)</option>
          <option value="m2_terrain">Milestone 2: Peninsula Diorama Terrain, Water &amp; Foliage</option>
          <option value="m3_landmarks">Milestone 3: + 18 Supertrees, Domes, Bridges &amp; Planet Baby</option>
          <option value="m4_characters">Milestone 4: + 4 Chibi Safari Explorers &amp; 42 Relics</option>
        </select>
      </div>

      <div class="lookdev-tabs" role="tablist">
        <button type="button" class="lookdev-tab active" data-tab="inspect" role="tab">🎬 3D/Anim</button>
        <button type="button" class="lookdev-tab" data-tab="lighting" role="tab">☀️ Light</button>
        <button type="button" class="lookdev-tab" data-tab="textures" role="tab">🎨 Mat</button>
        <button type="button" class="lookdev-tab" data-tab="camera" role="tab">🎥 Cam</button>
        <button type="button" class="lookdev-tab" data-tab="json" role="tab">{ } JSON</button>
      </div>

      <div class="lookdev-tab-content" id="lookDevTabContent"></div>

      <div class="lookdev-footer">
        <button type="button" class="lookdev-copy-btn" id="btnCopySettingsJson">
          <span>📋</span>
          <span id="copyBtnLabel">Copy Settings as JSON</span>
        </button>
        <button type="button" class="lookdev-reset-btn" id="btnResetLookDev" title="Restore Default Settings">
          ↺ Reset
        </button>
      </div>
      <div class="lookdev-toast" id="lookDevToast" aria-live="polite"></div>
    </div>
  `;
}

export function renderSliderRow(settings, { group, key, label, min, max, step, unit = '' }) {
  const val = settings[group][key];
  return `
    <div class="lookdev-slider-row">
      <div class="lookdev-slider-head">
        <span>${label}</span>
        <strong class="lookdev-val" id="val-${group}-${key}">${val}${unit}</strong>
      </div>
      <input
        type="range"
        class="lookdev-range"
        data-group="${group}"
        data-key="${key}"
        data-unit="${unit}"
        min="${min}"
        max="${max}"
        step="${step}"
        value="${val}"
      />
    </div>
  `;
}

export function renderColorRow(settings, { group, key, label }) {
  const val = settings[group][key];
  return `
    <div class="lookdev-color-row">
      <span>${label}</span>
      <div class="lookdev-color-input-wrap">
        <input
          type="color"
          class="lookdev-color"
          data-group="${group}"
          data-key="${key}"
          value="${val}"
        />
        <code id="val-${group}-${key}">${val}</code>
      </div>
    </div>
  `;
}

export function renderLookDevTabHtml(activeTab, settings) {
  if (activeTab === 'lighting') {
    return `
      <div class="lookdev-preset-pills">
        <button type="button" class="lookdev-pill ${settings.lighting.preset === 'day' ? 'active' : ''}" data-light-preset="day">
          ☀️ Sunny Golden Hour
        </button>
        <button type="button" class="lookdev-pill ${settings.lighting.preset === 'night' ? 'active' : ''}" data-light-preset="night">
          🌙 Night Rhapsody Show
        </button>
      </div>
      ${renderSliderRow(settings, { group: 'lighting', key: 'sunIntensity', label: 'Sun Directional Intensity', min: 0, max: 4.0, step: 0.05 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'sunAzimuthDeg', label: 'Sun Azimuth Angle', min: -180, max: 180, step: 1, unit: '°' })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'sunElevationDeg', label: 'Sun Elevation Height', min: 5, max: 85, step: 1, unit: '°' })}
      ${renderColorRow(settings, { group: 'lighting', key: 'sunColor', label: 'Sun Warmth Color' })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'ambientIntensity', label: 'Ambient Fill Light', min: 0, max: 2.5, step: 0.05 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'exposure', label: 'Tone Mapping Exposure', min: 0.4, max: 2.2, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'shadowSoftness', label: 'Shadow Softness / Radius', min: 0, max: 1.0, step: 0.05 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'nightBioluminescenceGlow', label: 'Supertree Bioluminescence', min: 0, max: 3.0, step: 0.05 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'bloomStrength', label: 'Post-FX Unreal Bloom', min: 0, max: 1.8, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'lighting', key: 'envMapIntensity', label: 'PBR IBL Reflection Intensity', min: 0, max: 2.0, step: 0.05 })}
    `;
  }
  if (activeTab === 'textures') {
    return `
      ${renderSliderRow(settings, { group: 'textures', key: 'terrainGrassSaturation', label: 'Lawn Turf Saturation', min: 0.3, max: 2.0, step: 0.05 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'foliageRoughness', label: 'Tree Foliage Clay Matte', min: 0.1, max: 1.0, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'pathwayWarmth', label: 'Sandstone Path Roughness', min: 0.1, max: 1.0, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'waterTurquoiseDepth', label: 'Water Turquoise Richness', min: 0.0, max: 1.0, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'waterRippleSpeed', label: 'Water Ripple Wave Speed', min: 0.0, max: 3.0, step: 0.05, unit: 'x' })}
      ${renderSliderRow(settings, { group: 'textures', key: 'waterReflectivity', label: 'Water Specular Sheen', min: 0.0, max: 1.0, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'conservatoryGlassOpacity', label: 'Dome Glass Opacity', min: 0.15, max: 0.95, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'conservatoryGlassMetalness', label: 'Dome Glass Reflectivity', min: 0.0, max: 1.0, step: 0.02 })}
      ${renderSliderRow(settings, { group: 'textures', key: 'supertreeCanopyVibrant', label: 'Supertree Crown Vibrancy', min: 0.5, max: 2.0, step: 0.05 })}
      ${renderColorRow(settings, { group: 'textures', key: 'dioramaBaseBevelTint', label: 'Diorama Base Board Tint' })}
    `;
  }
  if (activeTab === 'camera') {
    return `
      ${renderSliderRow(settings, { group: 'camera', key: 'cameraFov', label: 'Camera Field of View (FOV)', min: 25, max: 75, step: 1, unit: '°' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'chaseCamDistance', label: 'Option B Chase Distance', min: 6, max: 35, step: 0.5, unit: 'm' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'chaseCamHeight', label: 'Option B Chase Height', min: 3, max: 25, step: 0.5, unit: 'm' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'chaseCamPitchDeg', label: 'Chase Tilt Pitch Angle', min: -45, max: 15, step: 1, unit: '°' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'chaseCamLookAhead', label: 'Chase Target Look-Ahead', min: 0, max: 12, step: 0.5, unit: 'm' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'overviewPitchDeg', label: 'Overview Board Tilt Pitch', min: 20, max: 80, step: 1, unit: '°' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'overviewAzimuthDeg', label: 'Overview Board Orbit Angle', min: -180, max: 180, step: 1, unit: '°' })}
      ${renderSliderRow(settings, { group: 'camera', key: 'overviewDistance', label: 'Overview Board Zoom Dist', min: 60, max: 220, step: 2, unit: 'm' })}
    `;
  }
  if (activeTab === 'json') {
    return `
      <div class="lookdev-json-box">
        <p class="lookdev-json-help">
          Tweak sliders or paste your preferred JSON settings below and click <strong>Apply JSON</strong> (or paste them in chat to bake as permanent defaults):
        </p>
        <textarea id="lookDevJsonTextarea" class="lookdev-textarea" rows="10" spellcheck="false">${JSON.stringify(
          settings,
          null,
          2
        )}</textarea>
        <button type="button" class="lookdev-apply-json-btn" id="btnApplyPastedJson">
          ✨ Apply Pasted JSON Settings
        </button>
      </div>
    `;
  }
  return '';
}
