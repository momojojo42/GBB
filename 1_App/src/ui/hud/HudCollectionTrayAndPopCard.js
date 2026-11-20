// ============================================================================
// Gardens by the Bay — HUD 3-Slot Collection Tray & Discovery Pop-Card Helper
// (src/ui/HudCollectionTrayAndPopCard.js)
// ============================================================================

import { RELIC_CATEGORY_COLORS } from '../../data/TreasuresCatalog.js';

export function createHudCollectionTrayAndPopCard({
  appState,
  getTerrainSys,
  onInspectRelic,
  onOpenCollectionGallery
}) {
  const dom = {
    get topCollectionCountBadge() {
      return document.getElementById('topCollectionCountBadge');
    }
  };

  function updateHudCollectionTray(newlyCollectedRelicId = null) {
    const terrainSys = getTerrainSys();
    if (!terrainSys) return;

    const myRelicsRaw = terrainSys.treasuresList.filter((t) => t.collectedBy === 'you');
    const orderList = Array.isArray(appState.playerCollectedOrder) ? appState.playerCollectedOrder : [];
    const myRelics = [...myRelicsRaw].sort((a, b) => {
      const idxA = orderList.indexOf(a.id);
      const idxB = orderList.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return a.id - b.id;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxB - idxA; // Newest first
    });

    const count = myRelics.length;
    if (dom.topCollectionCountBadge) {
      dom.topCollectionCountBadge.textContent = `${count}/42`;
      dom.topCollectionCountBadge.classList.toggle('has-items', count > 0);
    }

    const hudPill = document.getElementById('hudCollectionCountPill');
    const isMobLand = document.body.classList.contains('mobile-landscape');
    if (hudPill) {
      hudPill.textContent = isMobLand ? `${count}/42 ↗` : `${count} / 42`;
    }

    const openBtn = document.getElementById('btnOpenCollectionHud');
    if (openBtn) {
      openBtn.textContent = isMobLand ? '↗' : `All (${count})`;
    }

    const gridEl = document.getElementById('hudCollectionTrayGrid');
    if (!gridEl) return;

    // Show ONLY the latest 3 collected items in a fixed 3-slot horizontal shelf
    const latestThree = myRelics.slice(0, 3);
    const slotsHtml = [];

    for (let slotIdx = 0; slotIdx < 3; slotIdx++) {
      const relic = latestThree[slotIdx];
      if (relic) {
        const isNewest = slotIdx === 0;
        const isJustCollected = relic.id === newlyCollectedRelicId;
        const catColor = RELIC_CATEGORY_COLORS[relic.category] || '#FACC15';
        const idTag = `#${String(relic.id).padStart(2, '0')}`;
        const shortTitle = relic.shortName || relic.name;
        const ptsVal = relic.points || (relic.rarity === 'legendary' ? 350 : relic.rarity === 'rare' ? 200 : 100);
        const rarityKey = relic.rarity || (ptsVal >= 300 ? 'legendary' : ptsVal >= 180 ? 'rare' : 'common');
        slotsHtml.push(`
          <button
            type="button"
            class="hud-col-slot filled-slot rarity-${rarityKey} ${isNewest ? 'latest-slot' : ''} ${isJustCollected ? 'just-collected' : ''}"
            data-relic-id="${relic.id}"
            style="--slot-accent:${catColor};"
            title="${idTag} ${shortTitle} (+${ptsVal} PTS) — Click to rotate in 360° 3D"
          >
            <div class="hud-col-slot-top">
              ${isNewest
                ? `<span class="hud-col-slot-new">NEW</span><span class="hud-col-slot-pts rarity-${rarityKey}">+${ptsVal}</span>`
                : `<span class="hud-col-slot-id">${idTag}</span><span class="hud-col-slot-pts rarity-${rarityKey}">+${ptsVal}</span>`
              }
            </div>
            <div class="hud-col-slot-thumb-wrap">
              <img src="${relic.image || ''}" alt="${shortTitle}" class="hud-col-slot-img" loading="lazy" />
            </div>
            <span class="hud-col-slot-name">${shortTitle}</span>
          </button>
        `);
      } else {
        slotsHtml.push(`
          <button
            type="button"
            class="hud-col-slot empty-slot"
            data-empty-slot="${slotIdx + 1}"
            title="Walk over glowing pedestals in the 3D garden to collect Singapore keepsakes!"
          >
            <div class="hud-col-slot-thumb-wrap empty-thumb">
              <span class="hud-col-empty-plus" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
              </span>
            </div>
            <span class="hud-col-slot-name empty-label">${count === 0 && slotIdx === 0 ? 'Explore' : 'Empty'}</span>
          </button>
        `);
      }
    }

    gridEl.innerHTML = slotsHtml.join('');

    gridEl.querySelectorAll('.hud-col-slot.filled-slot').forEach((slotBtn) => {
      slotBtn.addEventListener('click', () => {
        const rid = Number(slotBtn.dataset.relicId);
        if (rid && onInspectRelic) onInspectRelic(rid);
      });
    });

    gridEl.querySelectorAll('.hud-col-slot.empty-slot').forEach((emptyBtn) => {
      emptyBtn.addEventListener('click', () => {
        if (onOpenCollectionGallery) {
          onOpenCollectionGallery();
        }
      });
    });
  }

  let ahaPopTimer = null;
  let ahaHideTimer = null;

  function showDiscoveryPopCardInternal(relic, earnedPoints = null, bonusTag = '') {
    if (!relic) return;
    const hudRoot = document.getElementById('gameplayHud') || document.body;
    let cardEl = document.getElementById('hudAhaPopCard');
    if (!cardEl) {
      cardEl = document.createElement('div');
      cardEl.id = 'hudAhaPopCard';
      cardEl.className = 'hud-aha-pop-card hidden';
      hudRoot.appendChild(cardEl);
    }

    const basePts = Number(
      earnedPoints ||
      relic.points ||
      (relic.rarity === 'legendary' ? 350 : relic.rarity === 'rare' ? 200 : 100)
    );
    const rarity = relic.rarity || (basePts >= 300 ? 'legendary' : basePts >= 180 ? 'rare' : 'common');
    const rarityMeta = {
      legendary: { dot: '🟡', glow: '#FACC15' },
      rare: { dot: '🟣', glow: '#C084FC' },
      common: { dot: '🟢', glow: '#34D399' }
    }[rarity] || { dot: '🟢', glow: '#34D399' };

    const shortTitle = relic.shortName || relic.name || 'Garden Relic';
    const funnyGag = relic.funnyTag || relic.toyReaction || '✨ Shiok Keepsake!';

    cardEl.dataset.relicId = String(relic.id || '');
    cardEl.dataset.rarity = rarity;
    cardEl.style.setProperty('--aha-glow', rarityMeta.glow);
    cardEl.classList.remove('hidden', 'is-dismissing', 'rarity-common', 'rarity-rare', 'rarity-legendary');
    cardEl.classList.add(`rarity-${rarity}`);

    cardEl.classList.remove('is-popping');
    void cardEl.offsetWidth;
    cardEl.classList.add('is-popping');

    cardEl.innerHTML = `
      <div class="aha-pop-thumb-wrap">
        <img src="${relic.image || ''}" alt="${shortTitle}" class="aha-pop-thumb" />
        <span class="aha-pop-icon-badge">${relic.icon || '🌸'}</span>
      </div>
      <div class="aha-pop-body">
        <div class="aha-pop-pills-row">
          <span class="aha-pop-pts-pill">${rarityMeta.dot} +${basePts} PTS</span>
          ${bonusTag ? `<span class="aha-pop-bonus-pill">${bonusTag}</span>` : ''}
        </div>
        <strong class="aha-pop-title">${shortTitle}</strong>
        <p class="aha-pop-hook"><span class="aha-funny-pill">${funnyGag}</span></p>
      </div>
      <span class="aha-pop-inspect-cue" title="Tap to play 3D toy!">🎮 3D ↗</span>
    `;

    cardEl.onclick = (e) => {
      e.stopPropagation();
      if (ahaPopTimer) clearTimeout(ahaPopTimer);
      if (ahaHideTimer) clearTimeout(ahaHideTimer);
      cardEl.classList.add('hidden');
      if (relic.id && onInspectRelic) {
        onInspectRelic(relic.id);
      }
    };

    if (ahaPopTimer) clearTimeout(ahaPopTimer);
    if (ahaHideTimer) clearTimeout(ahaHideTimer);

    ahaPopTimer = setTimeout(() => {
      cardEl.classList.add('is-dismissing');
      ahaHideTimer = setTimeout(() => {
        cardEl.classList.add('hidden');
        cardEl.classList.remove('is-dismissing', 'is-popping');
      }, 260);
    }, 2800);
  }

  return {
    updateHudCollectionTray,
    showDiscoveryPopCardInternal
  };
}
