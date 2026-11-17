// ============================================================================
// Multi-Map World Switcher Controller (Map 01: GBB <-> Map 02: SBG)
// Dynamically swaps 3D Terrain, 42 Relics, Landmarks, Tactical Map & UI Labels
// (src/ui/MapWorldSwitcherController.js)
// ============================================================================

import {
  getActiveMapId,
  getActiveMapProfile,
  setActiveMapIdState
} from '../data/MapRegistry.js';
import { syncWorldMapSpecToActiveMap } from '../data/WorldMapSpec.js';
import { syncTreasuresCatalogToActiveMap } from '../data/TreasuresCatalog.js';
import { rebuildWorldTreesForActiveMap } from '../world/TreeGenerator.js';
import { buildTerrainAndTreasures } from '../world/TerrainAndTreasuresBuilder.js';
import { buildAllLandmarks } from '../world/LandmarksBuilder.js';
import { SoundFX } from '../audio/SoundFX.js';

export function createMapWorldSwitcherController({
  THREE,
  scene,
  matLib,
  appState,
  getGlbRegistry,
  getSystems,
  setSystems,
  coordinator,
  resetFullMatch,
  updateHudStandings,
  updateWorldLabels,
  renderEncyclopediaModal,
  drawMiniRadar,
  drawTacticalFullMap,
  showToast
}) {
  function syncDomToMapProfile(profile = getActiveMapProfile()) {
    appState.activeMapId = profile.id;
    document.body.dataset.activeMap = profile.id;

    // 1. Update Top Global Bar Brand Cluster
    const brandEmblem = document.querySelector('#topNavBar .brand-emblem');
    const brandEyebrow = document.querySelector('#topNavBar .brand-eyebrow');
    const brandHeading = document.querySelector('#topNavBar .brand-heading');
    if (brandEmblem) brandEmblem.textContent = profile.icon;
    if (brandEyebrow) brandEyebrow.textContent = profile.topBarEyebrow;
    if (brandHeading) brandHeading.textContent = profile.topBarTitle;

    // 2. Update Top Quick Map Switcher Button
    const topMapBtn = document.getElementById('btnSwitchMapTop');
    if (topMapBtn) {
      topMapBtn.textContent =
        profile.id === 'sbg' ? '🦢 Map 2: Botanic ▾' : '🌿 Map 1: Gardens ▾';
      topMapBtn.title = 'Click to Switch Between Map 1 (Gardens by the Bay) & Map 2 (Botanic Gardens)';
    }

    // 3. Update Start Screen Heading, Subtitle & Eyebrow
    const goldHeading = document.querySelector('#screenTitleOverlay .start-heading-gold');
    const tealSub = document.querySelector('#screenTitleOverlay .start-heading-teal');
    const eyebrowPill = document.getElementById('titleCardEyebrowPill');
    const mobileVistaTitle = document.querySelector('#mobileTitleVistaDock .mobile-vista-title');
    if (goldHeading) goldHeading.textContent = profile.cardTitleGold;
    if (tealSub) tealSub.textContent = profile.cardSubtitleTeal;
    if (eyebrowPill) eyebrowPill.textContent = profile.eyebrowDay;
    if (mobileVistaTitle) {
      mobileVistaTitle.textContent = `${profile.icon} ${profile.cardTitleGold} 3D`;
    }

    // 4. Update Chill Stroll Info Pod Copy
    const relaxedStrong = document.querySelector('#startRelaxedInfoPod .start-relaxed-copy strong');
    const relaxedSpan = document.querySelector('#startRelaxedInfoPod .start-relaxed-copy span');
    if (relaxedStrong) relaxedStrong.textContent = profile.relaxedTitle;
    if (relaxedSpan) relaxedSpan.textContent = profile.relaxedDesc;

    // 5. Update Start Card Map Selector Buttons
    document.querySelectorAll('[data-select-map]').forEach((btn) => {
      const isSelected = btn.getAttribute('data-select-map') === profile.id;
      btn.classList.toggle('active', isSelected);
      btn.setAttribute('aria-pressed', String(isSelected));
    });

    // 6. Update Tactical Full-Map Heading & Fast-Travel Zone Buttons
    const fullmapHeading = document.querySelector('#screenFullMapOverlay .modal-heading');
    if (fullmapHeading && profile.tacticalMapTheme?.heading) {
      fullmapHeading.textContent = profile.tacticalMapTheme.heading;
    }
    const tpContainer = document.getElementById('tacticalTeleportButtons');
    if (tpContainer && Array.isArray(profile.teleportZones)) {
      const buttons = tpContainer.querySelectorAll('button[data-tp-zone]');
      buttons.forEach((btn) => {
        const zoneKey = btn.getAttribute('data-tp-zone');
        const match = profile.teleportZones.find((z) => z.zone === zoneKey);
        if (match) btn.textContent = match.label;
      });
    }
  }

  function switchWorldMap(nextMapId, forceRebuild = false) {
    const normalized = nextMapId === 'sbg' ? 'sbg' : 'gbb';
    if (normalized === getActiveMapId() && !forceRebuild) {
      syncDomToMapProfile(getActiveMapProfile());
      return getActiveMapProfile();
    }

    SoundFX.playClick?.();
    const profile = setActiveMapIdState(normalized);
    syncWorldMapSpecToActiveMap(normalized);
    syncTreasuresCatalogToActiveMap(normalized);
    rebuildWorldTreesForActiveMap();
    syncDomToMapProfile(profile);

    const glbRegistry = getGlbRegistry?.();
    const { terrainSys: oldTerrain, landmarksSys: oldLandmarks } = getSystems?.() || {};

    if (oldTerrain && glbRegistry) {
      // Remove previous 3D map groups from scene
      if (oldTerrain.terrainGroup) scene.remove(oldTerrain.terrainGroup);
      if (oldTerrain.treasuresGroup) scene.remove(oldTerrain.treasuresGroup);
      if (oldLandmarks?.landmarksGroup) scene.remove(oldLandmarks.landmarksGroup);

      // Build new map's Terrain, 42 Relics, and 3D Landmarks
      const newTerrainSys = buildTerrainAndTreasures(THREE, glbRegistry, matLib);
      scene.add(newTerrainSys.terrainGroup);
      scene.add(newTerrainSys.treasuresGroup);

      const newLandmarksSys = buildAllLandmarks(THREE, glbRegistry, matLib);
      scene.add(newLandmarksSys.landmarksGroup);

      setSystems({
        terrainSys: newTerrainSys,
        landmarksSys: newLandmarksSys
      });

      coordinator?.applyLookDevSettings?.(appState.lookDev);
      coordinator?.setMilestoneStage?.(appState.milestoneStage);
      resetFullMatch?.();
      updateHudStandings?.();
      drawMiniRadar?.();
      drawTacticalFullMap?.();
      renderEncyclopediaModal?.();
      updateWorldLabels?.();

      showToast?.(
        `${profile.icon} Switched to ${profile.numberBadge}: ${profile.fullTitle}!`
      );
    }

    return profile;
  }

  function bindMapSwitcherEvents() {
    syncDomToMapProfile(getActiveMapProfile());

    document.querySelectorAll('[data-select-map]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetMap = btn.getAttribute('data-select-map');
        if (targetMap) switchWorldMap(targetMap);
      });
    });

    const topMapBtn = document.getElementById('btnSwitchMapTop');
    topMapBtn?.addEventListener('click', () => {
      const nextMap = getActiveMapId() === 'sbg' ? 'gbb' : 'sbg';
      switchWorldMap(nextMap);
    });
  }

  return {
    syncDomToMapProfile,
    switchWorldMap,
    bindMapSwitcherEvents
  };
}
