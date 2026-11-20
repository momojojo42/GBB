// ============================================================================
// Gardens by the Bay — Gameplay HUD, Standings, Zone Card & End-Game Banner
// (src/ui/HudController.js)
// ============================================================================

import { SoundFX } from '../../audio/SoundFX.js';
import {
  AVATAR_PORTRAIT_MAP,
  COMP_SHORT_LABELS,
  getCompRelicCount,
  getCompPoints,
  populateEndGameBannerForHud
} from '../screens/EndGameModalController.js';
import { createHudCollectionTrayAndPopCard } from './HudCollectionTrayAndPopCard.js';

function getFallbackDayNightPhase(appState) {
  if (appState?.dayNightPhaseLabel) return appState.dayNightPhaseLabel;
  const elapsed = Number(appState?.elapsedSeconds || 0);
  const total = Number(appState?.raceDurationSeconds || 180) || 180;
  const ratio = Math.min(1, Math.max(0, elapsed / total));
  if (ratio < 0.28) return '☀️ Morning';
  if (ratio < 0.56) return '🌤️ Afternoon';
  if (ratio < 0.78) return '🌇 Sunset';
  return '🌙 Night Show';
}

export function showToast(msg) {
  const banner = document.getElementById('hudToastBanner');
  if (banner && banner.textContent !== msg) {
    banner.textContent = msg;
  }
}

export function showDiscoveryPopCard(relic, earnedPoints = null, bonusTag = '') {
  if (typeof window !== 'undefined' && typeof window.__gbbShowDiscoveryPopCard === 'function') {
    window.__gbbShowDiscoveryPopCard(relic, earnedPoints, bonusTag);
  }
}

export function createHudController({
  appState,
  getTerrainSys,
  getExplorersSys,
  onTriggerEndGame,
  onInspectRelic,
  onOpenCollectionGallery
}) {
  const {
    updateHudCollectionTray,
    showDiscoveryPopCardInternal
  } = createHudCollectionTrayAndPopCard({
    appState,
    getTerrainSys,
    onInspectRelic,
    onOpenCollectionGallery
  });

  if (typeof window !== 'undefined') {
    window.__gbbShowDiscoveryPopCard = showDiscoveryPopCardInternal;
  }

  function updateHudStandings(newlyCollectedRelicId = null) {
    const explorersSys = getExplorersSys();
    const terrainSys = getTerrainSys();
    if (!explorersSys || !terrainSys) return;
    const rawStandings = explorersSys.getStandings();
    const listEl = document.getElementById('hudStandingsList');
    if (!listEl) return;

    const enrichedStandings = rawStandings.map((comp) => {
      const relicCount = getCompRelicCount(comp, terrainSys.treasuresList);
      const pts = getCompPoints(comp, terrainSys.treasuresList);
      return {
        ...comp,
        score: pts,
        relicCount
      };
    }).sort((a, b) => (b.score - a.score) || (b.relicCount - a.relicCount));

    const visibleCompetitors = appState.mode === 'relaxed'
      ? enrichedStandings.filter((s) => s.id === 'you')
      : enrichedStandings;

    const standingsCardEl = document.getElementById('standingsCard');
    standingsCardEl?.classList.toggle('is-relaxed-mode', appState.mode === 'relaxed');

    const topPts = Math.max(1200, ...enrichedStandings.map((c) => c.score));

    const eyebrowEl = document.getElementById('hudStandingsEyebrow');
    if (eyebrowEl) {
      const nextEyebrow = appState.isMultiplayerRoom
        ? `🌐 ${appState.multiplayerRoomCode || 'GBB-88A'}`
        : '🏆 SCOREBOARD';
      if (eyebrowEl.textContent !== nextEyebrow) eyebrowEl.textContent = nextEyebrow;
    }

    listEl.innerHTML = visibleCompetitors.map((comp, idx) => {
      const pct = comp.score > 0
        ? Math.min(100, Math.max(8, Math.round((comp.score / topPts) * 100)))
        : 0;
      const portraitSrc = AVATAR_PORTRAIT_MAP[comp.id] || AVATAR_PORTRAIT_MAP.you;
      const shortLabel = appState.isMultiplayerRoom
        ? (comp.id === 'you' ? '🧑 You' : (comp.name || COMP_SHORT_LABELS[comp.id]))
        : (COMP_SHORT_LABELS[comp.id] || comp.name);
      return `
        <div class="standing-row ${comp.id === 'you' ? 'is-you-row' : ''}">
          <span class="standing-rank">#${idx + 1}</span>
          <div class="standing-avatar" style="background:${comp.colorHex}">
            <img src="${portraitSrc}" alt="${shortLabel}" class="standing-avatar-img" />
          </div>
          <div class="standing-info">
            <div class="standing-name-line">
              <span class="standing-comp-name">${shortLabel}</span>
              <span class="standing-comp-score-cluster">
                <strong class="standing-comp-pts">${comp.score.toLocaleString()} <small class="pts-unit">PTS</small></strong>
                <span class="standing-comp-relic-pill">${comp.relicCount} 💎</span>
              </span>
            </div>
            <div class="standing-bar-bg">
              <div class="standing-bar-fill" style="width:${pct}%; background:${comp.colorHex}"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const you = enrichedStandings.find((s) => s.id === 'you');
    const scoreEl = document.getElementById('hudPlayerScore');
    if (you && scoreEl) {
      scoreEl.innerHTML = `${you.score.toLocaleString()} <small class="score-unit">PTS • ${you.relicCount}/42</small>`;
    }

    const remaining = terrainSys.treasuresList.filter((t) => !t.collected).length;
    const remEl = document.getElementById('hudRemainingRelics');
    if (remEl) {
      remEl.innerHTML = `${remaining} <small class="rem-denom">/ 42</small>`;
    }

    updateHudCollectionTray(newlyCollectedRelicId);
  }

  function updateZoneAndNearestRelicHud() {
    // Removed legacy zone/nearest-relic DOM polling (handled by Mini-Radar & World Labels)
  }

  function updateClockDigits() {
    const digitsEl = document.getElementById('hudClockDigits');
    if (!digitsEl) return;

    let displaySec = Math.floor(appState.elapsedSeconds);
    if (appState.mode === 'race') {
      displaySec = Math.max(0, appState.raceDurationSeconds - Math.floor(appState.elapsedSeconds));

      if (!appState.isGameOver && displaySec <= 10 && displaySec > 0) {
        digitsEl.classList.add('clock-urgent');
        if (appState.lastCountdownSecond !== displaySec) {
          appState.lastCountdownSecond = displaySec;
          SoundFX.playCountdownTick(displaySec <= 3);
        }
      } else {
        digitsEl.classList.remove('clock-urgent');
      }

      if (!appState.isGameOver && displaySec <= 0) {
        onTriggerEndGame?.('times_up');
      }
    } else {
      digitsEl.classList.remove('clock-urgent');
    }
    const mins = String(Math.floor(displaySec / 60)).padStart(2, '0');
    const secs = String(displaySec % 60).padStart(2, '0');
    const nextText = `${mins}:${secs}`;
    if (digitsEl.textContent !== nextText) {
      digitsEl.textContent = nextText;
    }

    const modeTagEl =
      document.getElementById('hudClockModeTag') || document.getElementById('clockModeTag');
    if (modeTagEl) {
      const phaseLabel = getFallbackDayNightPhase(appState);
      let nextModeTag = '';
      if (appState.mode === 'race') {
        const isNightShow = phaseLabel.includes('Night') || Boolean(appState.isNightShow);
        const roomSuffix = appState.isMultiplayerRoom
          ? ` • 🌐 ${appState.multiplayerRoomCode}`
          : '';
        nextModeTag = isNightShow
          ? `${phaseLabel} • 🔥 1.5x PTS!${roomSuffix}`
          : `${phaseLabel} • 🏆 Race${roomSuffix}`;
        modeTagEl.classList.toggle('is-night-fever', isNightShow);
      } else {
        const terrainSys = getTerrainSys();
        const myCount = terrainSys?.treasuresList
          ? terrainSys.treasuresList.filter((t) => t.collectedBy === 'you').length
          : 0;
        nextModeTag = `${phaseLabel} • 🌿 Chill (${myCount}/42)`;
        modeTagEl.classList.remove('is-night-fever');
      }
      if (modeTagEl.textContent !== nextModeTag) {
        modeTagEl.textContent = nextModeTag;
      }
    }
  }

  function populateEndGameBanner(reason, standings) {
    populateEndGameBannerForHud({
      reason,
      standings,
      appState,
      getTerrainSys,
      onInspectRelic
    });
  }

  return {
    showToast,
    showDiscoveryPopCard: showDiscoveryPopCardInternal,
    updateHudStandings,
    updateHudCollectionTray,
    updateZoneAndNearestRelicHud,
    updateClockDigits,
    populateEndGameBanner
  };
}
