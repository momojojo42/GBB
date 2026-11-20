// ============================================================================
// Gardens by the Bay — Screen 2: "My Collection" Gallery Modal (v4 Light Pearl)
// (src/ui/EncyclopediaModal.js)
// Zero competitor rankings or leaderboards — focused 100% on the player's
// collected relics and the 42 Gardens by the Bay keepsakes.
// ============================================================================

const ZONE_FILTER_CATEGORIES = new Set([
  'supertree',
  'cloud_forest',
  'flower_dome',
  'floral_fantasy',
  'Active Garden',
  'Bay East Garden',
  'Dragonfly Lake',
  'Heritage Gardens',
  'Kingfisher Wetlands',
  'Serene Garden',
  'Sun Pavilion',
  'World of Plants'
]);

export function createEncyclopediaModal({
  appState,
  getTerrainSys,
  onCloseModal,
  onInspectRelic3D
}) {
  function getCategoryFilterPredicate(cat) {
    if (cat === 'gbb_zones') {
      return (t) => Boolean(t.isLandmarkRelic || ZONE_FILTER_CATEGORIES.has(t.category));
    }
    if (cat === 'sg_icons') {
      return (t) => !t.isLandmarkRelic;
    }
    if (cat === 'all') {
      return () => true;
    }
    return (t) => t.collectedBy === 'you';
  }

  function formatRarityPointsPill(t) {
    const pts = Number(t?.points) || (t?.isLandmarkRelic ? 350 : 100);
    const rarity = String(t?.rarity || '').toLowerCase();
    if (rarity === 'crown' || pts >= 300) {
      return `🟡 +${pts}`;
    }
    if (rarity === 'heritage' || pts >= 180) {
      return `🟣 +${pts}`;
    }
    return `🟢 +${pts}`;
  }

  function renderEncyclopediaModal() {
    const terrainSys = getTerrainSys();
    if (!terrainSys) return;
    const gridEl = document.getElementById('treasuresGrid42');
    if (!gridEl) return;

    const allTreasures = terrainSys.treasuresList || [];
    const myCollectedList = allTreasures.filter((t) => t.collectedBy === 'you');
    const myCount = myCollectedList.length;
    const gbbCount = allTreasures.filter(getCategoryFilterPredicate('gbb_zones')).length;
    const sgCount = allTreasures.filter(getCategoryFilterPredicate('sg_icons')).length;

    // Update top header progress pill & crisp filter chip labels
    const myChip = document.getElementById('filterChipMyCollection');
    if (myChip) {
      myChip.textContent = `🎒 Found (${myCount}/42)`;
    }
    const progressPill = document.getElementById('encycMyProgressPill');
    if (progressPill) {
      progressPill.textContent = `🎒 ${myCount} / 42 Found`;
    }

    const cat = appState.selectedEncyclopediaCategory || 'collected_you';
    document.querySelectorAll('#encycFilterBar .pearl-filter-chip, #encycFilterBar .pearl-filter-pill, #encycFilterBar .filter-chip').forEach((chip) => {
      const chipCat = chip.dataset.encycFilter || chip.dataset.cat;
      chip.classList.toggle('active', chipCat === cat);
      if (chipCat === 'collected_you') {
        chip.textContent = `🎒 Found (${myCount}/42)`;
      } else if (chipCat === 'gbb_zones') {
        chip.textContent = `🌳 Park (${gbbCount})`;
      } else if (chipCat === 'sg_icons') {
        chip.textContent = `🇸🇬 Icons (${sgCount})`;
      } else if (chipCat === 'all') {
        chip.textContent = '✨ All (42)';
      }
    });

    const orderList = Array.isArray(appState.playerCollectedOrder) ? appState.playerCollectedOrder : [];
    let filtered = [];
    if (cat === 'collected_you') {
      filtered = [...myCollectedList].sort((a, b) => {
        const idxA = orderList.indexOf(a.id);
        const idxB = orderList.indexOf(b.id);
        if (idxA === -1 && idxB === -1) return a.id - b.id;
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxB - idxA; // Newest collected first
      });
    } else {
      const pred = getCategoryFilterPredicate(cat);
      filtered = allTreasures.filter(pred);
    }

    // Empty state if player hasn't collected any items yet and is on "My Collected"
    if (cat === 'collected_you' && filtered.length === 0) {
      gridEl.innerHTML = `
        <div class="pearl-collection-empty">
          <div class="pce-icon" aria-hidden="true">🎒</div>
          <h3 class="pce-title">No Relics Found Yet (0 / 42)</h3>
          <p class="pce-desc">
            Walk over glowing golden pedestals in the 3D park (or press <kbd>Space</kbd>) to collect Singapore keepsakes — or preview all 42 3D toys right now!
          </p>
          <div class="pce-actions">
            <button type="button" class="btn-pce-primary" id="btnEmptySwitchAll">
              ✨ Preview All 42 3D Toys
            </button>
            <button type="button" class="btn-pce-secondary" id="btnEmptyReturnPark">
              🏃 Return to 3D Park
            </button>
          </div>
        </div>
      `;

      document.getElementById('btnEmptySwitchAll')?.addEventListener('click', () => {
        appState.selectedEncyclopediaCategory = 'all';
        renderEncyclopediaModal();
      });
      document.getElementById('btnEmptyReturnPark')?.addEventListener('click', () => {
        onCloseModal?.();
      });
      return;
    }

    gridEl.innerHTML = filtered.map((t, index) => {
      const isCollectedYou = t.collectedBy === 'you';
      const isLatestCollected = cat === 'collected_you' && index === 0 && isCollectedYou;
      const ptsBadgeLabel = formatRarityPointsPill(t);
      const cardStateClass = isCollectedYou ? 'is-collected-you' : 'is-preview-card';
      const displayTitle = t.shortName || t.name;
      const funnyGagBadge = t.funnyTag || t.toyReaction || '✨ Shiok Toy!';
      const statusRightPill = isLatestCollected
        ? '<span class="prc-status-pill is-new">✨ NEW!</span>'
        : isCollectedYou
          ? '<span class="prc-status-pill is-owned">✓ FOUND</span>'
          : '<span class="prc-status-pill is-mystery">🎁 PEEK 3D</span>';

      return `
        <article class="pearl-relic-card ${cardStateClass} rarity-${t.rarity || 'classic'}" data-relic-id="${t.id}" role="button" tabindex="0" aria-label="Play 3D Toy: ${displayTitle} — ${funnyGagBadge}">
          <div class="prc-top-badges">
            <span class="prc-id-pill">#${String(t.id).padStart(2, '0')}</span>
            ${statusRightPill}
            <span class="prc-status-pill is-pts">${ptsBadgeLabel}</span>
          </div>
          <div class="prc-thumb-stage">
            <div class="prc-pedestal-glow" aria-hidden="true"></div>
            <img src="${t.image || ''}" alt="${displayTitle}" class="prc-thumb-img" loading="lazy" />
          </div>
          <div class="prc-meta">
            <h3 class="prc-title">${displayTitle}</h3>
          </div>
          <div class="prc-gag-pill">
            <span>${funnyGagBadge}</span>
          </div>
        </article>
      `;
    }).join('');

    gridEl.querySelectorAll('.pearl-relic-card').forEach((card) => {
      const handleActivate = () => {
        const id = Number(card.dataset.relicId);
        appState.selectedRelicId = id;
        onInspectRelic3D?.(id);
      };
      card.addEventListener('click', handleActivate);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      });
    });
  }

  return {
    renderEncyclopediaModal
  };
}
