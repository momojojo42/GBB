// ============================================================================
// Gardens by the Bay — 3D-to-2D Floating Nameplates, Landmark Callouts & Popups
// (src/ui/WorldLabelsManager.js)
// ============================================================================

import * as THREE from 'three';
import {
  TREASURES_CATALOG,
  RELIC_CATEGORY_COLORS
} from '../data/TreasuresCatalog.js';
import { KEY_LANDMARK_CALLOUTS } from '../data/WorldMapSpec.js';

export function createWorldLabelsManager({
  camera,
  appState,
  getTerrainSys,
  getExplorersSys,
  onCollectTreasure,
  onClickMoveTo,
  showToast
}) {
  const worldLabelsLayer = document.getElementById('worldLabelsLayer');
  const explorerLabelEls = new Map();
  const landmarkLabelEls = [];
  const relicPinEls = new Map();
  const tempProjVec = new THREE.Vector3();

  function initWorldLabelElements() {
    if (!worldLabelsLayer) return;
    worldLabelsLayer.innerHTML = '';
    explorerLabelEls.clear();
    landmarkLabelEls.length = 0;
    relicPinEls.clear();

    const competitors = [
      { id: 'you', label: 'YOU', color: '#2D7FF9' },
      { id: 'kai', label: '⚡ Kai', color: '#FF5A5F' },
      { id: 'mei', label: '📡 Mei', color: '#10B981' },
      { id: 'raj', label: '🧭 Raj', color: '#F59E0B' }
    ];

    for (const comp of competitors) {
      const el = document.createElement('div');
      el.className = 'world-nameplate';
      el.style.setProperty('--badge-color', comp.color);
      el.innerHTML = `
        <span class="np-dot"></span>
        <span class="np-name">${comp.label}</span>
        <span class="np-score" id="npScore_${comp.id}">0/42</span>
        <span class="np-status" id="npStatus_${comp.id}" style="display:none;"></span>
      `;
      worldLabelsLayer.appendChild(el);
      explorerLabelEls.set(comp.id, {
        el,
        nameSpan: el.querySelector('.np-name'),
        scoreSpan: el.querySelector('.np-score'),
        statusSpan: el.querySelector('.np-status'),
        defaultLabel: comp.label,
        lastNameText: comp.label,
        lastScoreText: '',
        lastStatusKey: '',
        lastSnatchKey: ''
      });
    }

    for (const lm of KEY_LANDMARK_CALLOUTS) {
      const el = document.createElement('div');
      el.className = 'world-landmark-label';
      el.textContent = lm.text;
      worldLabelsLayer.appendChild(el);
      const lx = lm.pos ? lm.pos.x : lm.x;
      const ly = lm.pos ? lm.pos.y : lm.y;
      const lz = lm.pos ? lm.pos.z : lm.z;
      landmarkLabelEls.push({
        ...lm,
        posVec: new THREE.Vector3(lx, ly, lz),
        el
      });
    }

    // Create floating 3D-to-2D relic pins
    for (const t of TREASURES_CATALOG) {
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'world-relic-pin';
      const catColor = RELIC_CATEGORY_COLORS[t.category] || '#FACC15';
      pin.style.setProperty('--relic-color', catColor);
      pin.style.display = 'none';
      pin.title = 'Click to walk toward or collect this relic';
      pin.innerHTML = `
        <span class="rp-icon">${t.icon || '✨'}</span>
        <span class="rp-dist">0m</span>
      `;
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const terrainSys = getTerrainSys();
        const explorersSys = getExplorersSys();
        if (!terrainSys || !explorersSys) return;
        const liveRelic = terrainSys.treasuresList.find((r) => r.id === t.id);
        if (!liveRelic || liveRelic.collected) return;
        const you = explorersSys.getStandings().find((s) => s.id === 'you');
        if (!you) return;
        const dist = Math.hypot(
          liveRelic.position.x - you.position.x,
          liveRelic.position.z - you.position.z
        );
        if (dist <= 18) {
          onCollectTreasure?.(liveRelic.id, 'you', true);
        } else {
          onClickMoveTo?.(new THREE.Vector3(liveRelic.position.x, 0, liveRelic.position.z));
          showToast?.(`🧭 Walking toward hidden relic signal (${Math.round(dist)}m)...`);
        }
      });
      worldLabelsLayer.appendChild(pin);
      relicPinEls.set(t.id, pin);
    }
  }

  initWorldLabelElements();

  const activeSnatchBubbles = [];

  function spawnSnatchBubble(worldPos, text = '', isPlayer = true) {
    if (!worldLabelsLayer || !worldPos) return;
    const bubbleText = text || (isPlayer ? '🤚 CHOPE! 😎' : '😱 Alamak!');
    tempProjVec.set(worldPos.x, (worldPos.y || 0) + 2.15, worldPos.z).project(camera);
    if (tempProjVec.z > 1 || tempProjVec.z < -1) return;
    const x = (tempProjVec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-tempProjVec.y * 0.5 + 0.5) * window.innerHeight;

    const bubble = document.createElement('div');
    bubble.className = `world-snatch-bubble ${isPlayer ? 'is-player-chope' : 'is-bot-alamak'}`;
    bubble.style.left = `${x.toFixed(1)}px`;
    bubble.style.top = `${y.toFixed(1)}px`;
    bubble.textContent = bubbleText;
    worldLabelsLayer.appendChild(bubble);

    const record = {
      el: bubble,
      posVec: new THREE.Vector3(worldPos.x, (worldPos.y || 0) + 2.15, worldPos.z),
      createdAt: performance.now()
    };
    activeSnatchBubbles.push(record);

    setTimeout(() => {
      bubble.remove();
      const idx = activeSnatchBubbles.indexOf(record);
      if (idx !== -1) activeSnatchBubbles.splice(idx, 1);
    }, 1850);
  }

  if (typeof window !== 'undefined') {
    window.__gbbSpawnSnatchBubble = spawnSnatchBubble;
  }

  function spawnFloatingCollectPopup(worldPos, relic, streakCount = 1, earnedPoints = null) {
    if (!worldLabelsLayer || !worldPos) return;
    tempProjVec.set(worldPos.x, (worldPos.y || 0) + 1.8, worldPos.z).project(camera);
    if (tempProjVec.z > 1 || tempProjVec.z < -1) return;
    const x = (tempProjVec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-tempProjVec.y * 0.5 + 0.5) * window.innerHeight;

    let labelText = '';
    let rarityClass = '';
    if (typeof relic === 'object' && relic !== null) {
      const pts = earnedPoints || relic?.points || 100;
      const icon = relic?.icon || '🌸';
      const shortName = relic?.shortName || relic?.name || 'Relic';
      const streakTag = streakCount > 1 ? ` 🔥${streakCount}x SHIOK!` : '';
      labelText = `+${pts} PTS ${icon} ${shortName}${streakTag}`;
      if (relic.rarity) rarityClass = `rarity-${relic.rarity}`;
    } else if (typeof relic === 'string') {
      if (earnedPoints !== null) {
        const streakTag = streakCount > 1 ? ` 🔥${streakCount}x SHIOK!` : '';
        labelText = `+${earnedPoints} PTS ✨ ${relic}${streakTag}`;
      } else {
        labelText = relic;
      }
    } else {
      const pts = earnedPoints || 100;
      const streakTag = streakCount > 1 ? ` 🔥${streakCount}x SHIOK!` : '';
      labelText = `+${pts} PTS 🌸 Relic${streakTag}`;
    }

    worldLabelsLayer.querySelectorAll('.world-collect-popup').forEach((oldEl) => oldEl.remove());

    const isPenalty = labelText.includes('-') || labelText.includes('OUCH') || labelText.includes('SLIP') || labelText.includes('SPLASH') || labelText.includes('STOLE');
    const isSteal = labelText.includes('PICKPOCKET') || labelText.includes('HOP');
    const penaltyClass = isPenalty ? 'is-penalty' : '';
    const stealClass = isSteal ? 'is-steal' : '';

    const popup = document.createElement('div');
    popup.className = `world-collect-popup ${rarityClass} ${streakCount > 1 ? 'has-streak' : ''} ${penaltyClass} ${stealClass}`.trim();
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;
    popup.textContent = labelText;
    worldLabelsLayer.appendChild(popup);
    setTimeout(() => {
      popup.remove();
    }, 1450);
  }

  function updateWorldLabels() {
    const explorersSys = getExplorersSys();
    if (!explorersSys) return;
    const showChars = appState.milestoneStage === 'm4_characters' || appState.milestoneStage === 'all';
    const showLandmarks = appState.milestoneStage !== 'm2_terrain';
    const standings = explorersSys.getStandings();
    const winW = window.innerWidth;
    const winH = window.innerHeight;

    for (const comp of standings) {
      const entry = explorerLabelEls.get(comp.id);
      if (!entry) continue;
      const { el, scoreSpan, statusSpan } = entry;

      if (!showChars || (appState.mode === 'relaxed' && comp.id !== 'you')) {
        if (el.style.display !== 'none') el.style.display = 'none';
        continue;
      }

      tempProjVec.set(comp.position.x, (comp.position.y || 0) + 1.35, comp.position.z);
      tempProjVec.project(camera);

      if (tempProjVec.z > 1 || tempProjVec.z < -1) {
        if (el.style.display !== 'none') el.style.display = 'none';
        continue;
      }

      const x = (tempProjVec.x * 0.5 + 0.5) * winW;
      const y = (-tempProjVec.y * 0.5 + 0.5) * winH;
      if (el.style.display !== 'inline-flex') el.style.display = 'inline-flex';
      el.style.left = `${x.toFixed(1)}px`;
      el.style.top = `${y.toFixed(1)}px`;

      if (entry.nameSpan) {
        const desiredName = appState.isMultiplayerRoom
          ? (comp.id === 'you' ? '🧑 YOU' : (comp.name || entry.defaultLabel))
          : entry.defaultLabel;
        if (entry.lastNameText !== desiredName) {
          entry.lastNameText = desiredName;
          entry.nameSpan.textContent = desiredName;
        }
      }

      const rawScore = Number(comp.score || 0);
      const displayPts = rawScore > 0 && rawScore < 50 ? rawScore * 150 : rawScore;
      const scoreText = displayPts === 0
        ? `${comp.relicCount ?? rawScore}/42`
        : `${displayPts} pts`;
      if (scoreSpan && entry.lastScoreText !== scoreText) {
        entry.lastScoreText = scoreText;
        scoreSpan.textContent = scoreText;
      }

      const snatchText = typeof comp.snatchReaction === 'object' && comp.snatchReaction !== null
        ? comp.snatchReaction.text
        : comp.snatchReaction;

      if (snatchText && entry.lastSnatchKey !== String(snatchText)) {
        entry.lastSnatchKey = String(snatchText);
        spawnSnatchBubble(comp.position, String(snatchText), comp.id === 'you');
      } else if (!snatchText) {
        entry.lastSnatchKey = '';
      }

      if (statusSpan) {
        const statusKey = `${comp.id}_${comp.botStatus}_${snatchText || ''}`;
        if (entry.lastStatusKey !== statusKey) {
          entry.lastStatusKey = statusKey;
          if (snatchText) {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status snatch-reaction';
            statusSpan.textContent = String(snatchText);
          } else if (comp.botStatus === 'champion') {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status champion';
            statusSpan.textContent = '👑 #1 CHAMPION! 🎉';
          } else if (comp.botStatus === 'celebrating') {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status celebrating';
            statusSpan.textContent = '🎉 Celebrating!';
          } else if (comp.botStatus === 'choped' || comp.botStatus === 'snatched') {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status snatch-reaction';
            statusSpan.textContent = comp.id === 'you' ? '🤚 CHOPE! 😎' : '😱 Alamak!';
          } else if (comp.id !== 'you' && comp.botStatus === 'inspecting') {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status';
            statusSpan.textContent = '🔍 Admiring';
          } else if (comp.id !== 'you' && comp.botStatus === 'decoyed') {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = 'np-status decoyed';
            statusSpan.textContent = '🎭 Decoyed!';
          } else {
            statusSpan.style.display = 'none';
          }
        }
      }
    }

    for (const sb of activeSnatchBubbles) {
      tempProjVec.copy(sb.posVec).project(camera);
      if (tempProjVec.z > 1 || tempProjVec.z < -1) continue;
      const sx = (tempProjVec.x * 0.5 + 0.5) * winW;
      const sy = (-tempProjVec.y * 0.5 + 0.5) * winH;
      sb.el.style.left = `${sx.toFixed(1)}px`;
      sb.el.style.top = `${sy.toFixed(1)}px`;
    }

    for (const lm of landmarkLabelEls) {
      if (!showLandmarks) {
        if (lm.el.style.display !== 'none') lm.el.style.display = 'none';
        continue;
      }
      tempProjVec.copy(lm.posVec).project(camera);
      if (tempProjVec.z > 1 || tempProjVec.z < -1) {
        if (lm.el.style.display !== 'none') lm.el.style.display = 'none';
        continue;
      }
      const x = (tempProjVec.x * 0.5 + 0.5) * winW;
      const y = (-tempProjVec.y * 0.5 + 0.5) * winH;
      if (lm.el.style.display !== 'block') lm.el.style.display = 'block';
      lm.el.style.left = `${x.toFixed(1)}px`;
      lm.el.style.top = `${y.toFixed(1)}px`;
    }

    // Keep floating 3D-to-2D Relic Pins hidden during normal gameplay so relic naming never clutters the 3D view
    for (const pin of relicPinEls.values()) {
      if (pin.style.display !== 'none') pin.style.display = 'none';
    }
  }

  return {
    initWorldLabelElements,
    spawnFloatingCollectPopup,
    spawnSnatchBubble,
    updateWorldLabels
  };
}
