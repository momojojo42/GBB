// ============================================================================
// Gardens by the Bay — 3D-to-2D Floating Nameplates, Landmark Callouts & Popups
// (src/ui/hud/WorldLabelsManager.js)
// ============================================================================

import * as THREE from 'three';
import { KEY_LANDMARK_CALLOUTS } from '../../data/WorldMapSpec.js';

const COMPETITOR_BADGES = [
  { id: 'you', label: 'YOU', color: '#2D7FF9' },
  { id: 'kai', label: '⚡ Kai', color: '#FF5A5F' },
  { id: 'mei', label: '📡 Mei', color: '#10B981' },
  { id: 'raj', label: '🧭 Raj', color: '#F59E0B' }
];

function resolveExplorerStatus(comp, snatchText) {
  if (snatchText) return { cls: 'np-status snatch-reaction', text: String(snatchText) };
  if (comp.botStatus === 'champion') return { cls: 'np-status champion', text: '👑 #1 CHAMPION! 🎉' };
  if (comp.botStatus === 'celebrating') return { cls: 'np-status celebrating', text: '🎉 Celebrating!' };
  if (comp.botStatus === 'choped' || comp.botStatus === 'snatched') {
    return { cls: 'np-status snatch-reaction', text: comp.id === 'you' ? '🤚 CHOPE! 😎' : '😱 Alamak!' };
  }
  if (comp.id !== 'you' && comp.botStatus === 'inspecting') return { cls: 'np-status', text: '🔍 Admiring' };
  if (comp.id !== 'you' && comp.botStatus === 'decoyed') return { cls: 'np-status decoyed', text: '🎭 Decoyed!' };
  return null;
}

export function createWorldLabelsManager({
  camera,
  appState,
  getExplorersSys
}) {
  const worldLabelsLayer = document.getElementById('worldLabelsLayer');
  const explorerLabelEls = new Map();
  const landmarkLabelEls = [];
  const activeSnatchBubbles = [];
  const tempProjVec = new THREE.Vector3();

  let winW = window.innerWidth;
  let winH = window.innerHeight;
  window.addEventListener('resize', () => {
    winW = window.innerWidth;
    winH = window.innerHeight;
  });

  function projectToScreen(x, y, z) {
    tempProjVec.set(x, y, z).project(camera);
    if (tempProjVec.z > 1 || tempProjVec.z < -1) return null;
    return {
      x: (tempProjVec.x * 0.5 + 0.5) * winW,
      y: (-tempProjVec.y * 0.5 + 0.5) * winH
    };
  }

  function applyTransformIfMoved(entry, x, y, includeCenterOffset) {
    if (Math.abs(x - entry.lastX) < 0.35 && Math.abs(y - entry.lastY) < 0.35) return;
    entry.lastX = x;
    entry.lastY = y;
    entry.el.style.transform = includeCenterOffset
      ? `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`
      : `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function initWorldLabelElements() {
    if (!worldLabelsLayer) return;
    worldLabelsLayer.innerHTML = '';
    explorerLabelEls.clear();
    landmarkLabelEls.length = 0;

    for (const comp of COMPETITOR_BADGES) {
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
        lastSnatchKey: '',
        lastX: NaN,
        lastY: NaN
      });
    }

    for (const lm of KEY_LANDMARK_CALLOUTS) {
      const el = document.createElement('div');
      el.className = 'world-landmark-label';
      el.textContent = lm.text;
      worldLabelsLayer.appendChild(el);
      const p = lm.pos || lm;
      landmarkLabelEls.push({
        ...lm,
        posVec: new THREE.Vector3(p.x, p.y, p.z),
        el,
        lastX: NaN,
        lastY: NaN
      });
    }
  }

  initWorldLabelElements();

  function spawnSnatchBubble(worldPos, text = '', isPlayer = true) {
    if (!worldLabelsLayer || !worldPos) return;
    const py = (worldPos.y || 0) + 2.15;
    const screen = projectToScreen(worldPos.x, py, worldPos.z);
    if (!screen) return;

    const bubble = document.createElement('div');
    bubble.className = `world-snatch-bubble ${isPlayer ? 'is-player-chope' : 'is-bot-alamak'}`;
    bubble.style.left = `${screen.x.toFixed(1)}px`;
    bubble.style.top = `${screen.y.toFixed(1)}px`;
    bubble.textContent = text || (isPlayer ? '🤚 CHOPE! 😎' : '😱 Alamak!');
    worldLabelsLayer.appendChild(bubble);

    const record = { el: bubble, posVec: new THREE.Vector3(worldPos.x, py, worldPos.z) };
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
    const screen = projectToScreen(worldPos.x, (worldPos.y || 0) + 1.8, worldPos.z);
    if (!screen) return;

    const streakTag = streakCount > 1 ? ` 🔥${streakCount}x SHIOK!` : '';
    let labelText = '';
    let rarityClass = '';
    if (typeof relic === 'object' && relic !== null) {
      const pts = earnedPoints || relic.points || 100;
      labelText = `+${pts} PTS ${relic.icon || '🌸'} ${relic.shortName || relic.name || 'Relic'}${streakTag}`;
      if (relic.rarity) rarityClass = `rarity-${relic.rarity}`;
    } else if (typeof relic === 'string') {
      labelText = earnedPoints !== null ? `+${earnedPoints} PTS ✨ ${relic}${streakTag}` : relic;
    } else {
      labelText = `+${earnedPoints || 100} PTS 🌸 Relic${streakTag}`;
    }

    worldLabelsLayer.querySelectorAll('.world-collect-popup').forEach((oldEl) => oldEl.remove());

    const isPenalty = /-|OUCH|SLIP|SPLASH|STOLE/.test(labelText);
    const isSteal = /PICKPOCKET|HOP/.test(labelText);

    const popup = document.createElement('div');
    popup.className = [
      'world-collect-popup',
      rarityClass,
      streakCount > 1 ? 'has-streak' : '',
      isPenalty ? 'is-penalty' : '',
      isSteal ? 'is-steal' : ''
    ].filter(Boolean).join(' ');
    popup.style.left = `${screen.x.toFixed(1)}px`;
    popup.style.top = `${screen.y.toFixed(1)}px`;
    popup.textContent = labelText;
    worldLabelsLayer.appendChild(popup);
    setTimeout(() => popup.remove(), 1450);
  }

  function updateWorldLabels(standingsArg = null) {
    const standings = standingsArg || getExplorersSys()?.getStandings();
    if (!standings) return;

    const showChars = appState.milestoneStage === 'm4_characters' || appState.milestoneStage === 'all';
    const showLandmarks = appState.milestoneStage !== 'm2_terrain';

    for (const comp of standings) {
      const entry = explorerLabelEls.get(comp.id);
      if (!entry) continue;
      const { el, scoreSpan, statusSpan } = entry;

      if (!showChars || (appState.mode === 'relaxed' && comp.id !== 'you')) {
        if (el.style.display !== 'none') el.style.display = 'none';
        continue;
      }

      const screen = projectToScreen(comp.position.x, (comp.position.y || 0) + 1.35, comp.position.z);
      if (!screen) {
        if (el.style.display !== 'none') el.style.display = 'none';
        continue;
      }

      if (el.style.display !== 'inline-flex') el.style.display = 'inline-flex';
      applyTransformIfMoved(entry, screen.x, screen.y, true);

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
      const scoreText = displayPts === 0 ? `${comp.relicCount ?? rawScore}/42` : `${displayPts} pts`;
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
          const badge = resolveExplorerStatus(comp, snatchText);
          if (badge) {
            statusSpan.style.display = 'inline-block';
            statusSpan.className = badge.cls;
            statusSpan.textContent = badge.text;
          } else {
            statusSpan.style.display = 'none';
          }
        }
      }
    }

    for (const sb of activeSnatchBubbles) {
      const screen = projectToScreen(sb.posVec.x, sb.posVec.y, sb.posVec.z);
      if (!screen) continue;
      sb.el.style.left = `${screen.x.toFixed(1)}px`;
      sb.el.style.top = `${screen.y.toFixed(1)}px`;
    }

    for (const lm of landmarkLabelEls) {
      if (!showLandmarks) {
        if (lm.el.style.display !== 'none') lm.el.style.display = 'none';
        continue;
      }
      const screen = projectToScreen(lm.posVec.x, lm.posVec.y, lm.posVec.z);
      if (!screen) {
        if (lm.el.style.display !== 'none') lm.el.style.display = 'none';
        continue;
      }
      if (lm.el.style.display !== 'block') lm.el.style.display = 'block';
      applyTransformIfMoved(lm, screen.x, screen.y, false);
    }
  }

  return {
    initWorldLabelElements,
    spawnFloatingCollectPopup,
    spawnSnatchBubble,
    updateWorldLabels
  };
}
