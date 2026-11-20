// ============================================================================
// Gardens by the Bay — End-Game Championship Podium & Keepsakes Banner
// (src/ui/EndGameModalController.js)
// ============================================================================

export const AVATAR_PORTRAIT_MAP = {
  you: './assets/avatars/avatar_you.png',
  kai: './assets/avatars/avatar_kai.png',
  mei: './assets/avatars/avatar_mei.png',
  raj: './assets/avatars/avatar_raj.png'
};

export const COMP_SHORT_LABELS = {
  you: '🧑 You',
  kai: '⚡ Kai',
  mei: '📡 Mei',
  raj: '🧭 Raj'
};

export function getCompRelicCount(comp, treasuresList) {
  if (!comp) return 0;
  if (typeof comp.relicCount === 'number') return comp.relicCount;
  if (Array.isArray(treasuresList)) {
    return treasuresList.filter((t) => t.collectedBy === comp.id).length;
  }
  const raw = Number(comp.score || 0);
  return raw < 50 ? raw : 0;
}

export function getCompPoints(comp, treasuresList) {
  if (!comp) return 0;
  const raw = Number(comp.score || 0);
  if (raw > 0 && raw < 50) return raw * 150;
  if (raw === 0) {
    const rc = getCompRelicCount(comp, treasuresList);
    if (rc > 0) return rc * 150;
  }
  return raw;
}

export function computeFunnyTrophyTitle(comp, treasuresList, rank = 1) {
  const owned = Array.isArray(treasuresList)
    ? treasuresList.filter((t) => t.collectedBy === comp?.id)
    : [];
  const relicCount = typeof comp?.relicCount === 'number' ? comp.relicCount : owned.length;
  if (relicCount === 0 && owned.length === 0) {
    return '👀 Window Shopping Tourist';
  }
  const ownedIds = new Set(owned.map((t) => t.id));
  if (ownedIds.has(36)) return '🦨 MRT Contraband Boss';
  if (ownedIds.has(11)) return '🧻 Supreme Chope King';
  if (ownedIds.has(29)) return '🧣 +100 Uncle Aura';
  if (ownedIds.has(34)) return '💸 ERP Toll Collector';
  if (ownedIds.has(35)) return '🦦 Marina Bay Landlord';
  if (ownedIds.has(14)) return '🦀 Mantou Gravy Mop';
  if (ownedIds.has(12) || ownedIds.has(13)) return '☕ Kopi O Gao Sprinter';
  const fallbacks = [
    '👑 Supertree Grandmaster',
    '⚡ Turbo Chope Contender',
    '🌺 Cloud Forest Explorer',
    '🦦 Chill Marina Tourist'
  ];
  return fallbacks[(rank - 1) % fallbacks.length];
}

export function populateEndGameBannerForHud({
  reason,
  standings,
  appState,
  getTerrainSys,
  onInspectRelic
}) {
  const terrainSys = getTerrainSys();
  if (!terrainSys || !standings?.length) return;

  const rankedStandings = standings.map((comp) => {
    const relicCount = getCompRelicCount(comp, terrainSys.treasuresList);
    const pts = getCompPoints(comp, terrainSys.treasuresList);
    return {
      ...comp,
      score: pts,
      relicCount
    };
  }).sort((a, b) => (b.score - a.score) || (b.relicCount - a.relicCount));

  const winner = rankedStandings[0];
  const you = rankedStandings.find((s) => s.id === 'you') || winner;
  const youRank = rankedStandings.findIndex((s) => s.id === 'you') + 1;

  // Gather actual relics collected by the player in pickup order
  const myRelicsRaw = terrainSys.treasuresList.filter((t) => t.collectedBy === 'you');
  const orderList = Array.isArray(appState.playerCollectedOrder) ? appState.playerCollectedOrder : [];
  const myRelics = [...myRelicsRaw].sort((a, b) => {
    const idxA = orderList.indexOf(a.id);
    const idxB = orderList.indexOf(b.id);
    if (idxA === -1 && idxB === -1) return a.id - b.id;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  const bannerEl = document.getElementById('endGameBannerOverlay');
  const badgeEl = document.getElementById('endGameReasonBadge');
  const titleLine1El = document.getElementById('endGameTitleLine1');
  const titleLine2El = document.getElementById('endGameTitleLine2');
  const statTimeEl = document.getElementById('egStatTime');
  const statRelicsEl = document.getElementById('egStatRelics');
  const statStreakEl = document.getElementById('egStatStreak');
  const podiumEl = document.getElementById('endGamePodiumList');
  const relicsLabelEl = document.getElementById('endGameRelicsLabel');
  const viewAllBtn = document.getElementById('btnEndGameViewAllRelics');
  const trophiesEl = document.getElementById('endGameRelicTrophies');

  if (badgeEl) {
    if (reason === 'all_found') {
      badgeEl.textContent = '🎉 ALL 42 FOUND!';
    } else if (appState.mode === 'relaxed') {
      badgeEl.textContent = '🌿 SOLO EXPEDITION SUMMARY';
    } else {
      badgeEl.textContent = '🏁 MATCH COMPLETE';
    }
  }

  if (titleLine1El && titleLine2El) {
    if (appState.mode === 'relaxed') {
      titleLine1El.textContent = you.relicCount > 0 ? '🌺 GARDEN STROLL COMPLETE!' : '👀 SCENIC GARDEN STROLL';
      titleLine2El.textContent = `${you.score.toLocaleString()} PTS • ${you.relicCount} / 42 KEEPSAKES`;
    } else if (winner.id === 'you') {
      titleLine1El.textContent = '🥇 1ST PLACE CHAMPION!';
      titleLine2El.textContent = `${you.score.toLocaleString()} PTS • ${you.relicCount} 💎`;
    } else {
      const rankMedals = ['🥇 #1', '🥈 #2', '🥉 #3', '🎖️ #4'];
      const rTag = rankMedals[youRank - 1] || `#${youRank}`;
      const winnerShort = COMP_SHORT_LABELS[winner.id] || winner.name;
      titleLine1El.textContent = `${rTag} PODIUM FINISH!`;
      titleLine2El.textContent = `${winnerShort.toUpperCase()} WINS (${winner.score.toLocaleString()} PTS)`;
    }
  }

  if (statTimeEl) {
    const elapsed = Math.max(1, Math.floor(appState.elapsedSeconds || 0));
    const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const secs = String(elapsed % 60).padStart(2, '0');
    statTimeEl.textContent = `${mins}:${secs}`;
  }

  if (statRelicsEl) {
    statRelicsEl.textContent = `${myRelics.length} / 42 Found`;
  }

  if (statStreakEl) {
    const bestStreak = Math.max(
      myRelics.length > 0 ? 1 : 0,
      appState.bestComboCount || appState.comboCount || 0
    );
    statStreakEl.textContent = `${bestStreak}x SHIOK`;
  }

  // Build True Stepped 3D-Style Championship Podium (or Compact Solo Badge Card)
  if (podiumEl) {
    const jumpPillHtml = `
      <button type="button" class="btn-eg-stage-emote" id="btnEndGameSuperJump" title="Trigger 3D Victory Flip & Fireworks!">
        🤸 Victory Flip!
      </button>
    `;

    if (appState.mode === 'relaxed') {
      const portraitSrc = AVATAR_PORTRAIT_MAP.you;
      const soloFunnyTitle = computeFunnyTrophyTitle(you, terrainSys.treasuresList, 1);
      podiumEl.innerHTML = `
        ${jumpPillHtml}
        <div class="podium-solo-card">
          <div class="podium-avatar-ring is-solo-ring" style="--ring-color:${you.colorHex}">
            <img src="${portraitSrc}" alt="🧑 You" class="podium-avatar-img" />
            <span class="podium-you-pill">YOU</span>
          </div>
          <div class="podium-solo-meta">
            <div class="podium-solo-top-line">
              <strong class="podium-col-name">🧑 You</strong>
              <span class="podium-col-score">${you.score.toLocaleString()} PTS • ${you.relicCount} 💎</span>
            </div>
            <span class="podium-funny-title-pill is-solo-title">${soloFunnyTitle}</span>
          </div>
        </div>
      `;
    } else {
      const first = rankedStandings[0];
      const second = rankedStandings[1];
      const third = rankedStandings[2];
      const fourth = rankedStandings[3];

      const stageCols = [
        { comp: second, rank: 2, medal: '🥈 2ND', num: '2', stepClass: 'step-2' },
        { comp: first, rank: 1, medal: '🥇 1ST', num: '1', stepClass: 'step-1' },
        { comp: third, rank: 3, medal: '🥉 3RD', num: '3', stepClass: 'step-3' }
      ].filter((item) => Boolean(item.comp));

      const colsHtml = stageCols.map(({ comp, rank, medal, num, stepClass }) => {
        const isYou = comp.id === 'you';
        const displayName = COMP_SHORT_LABELS[comp.id] || comp.name;
        const portraitSrc = AVATAR_PORTRAIT_MAP[comp.id] || AVATAR_PORTRAIT_MAP.you;
        const funnyTitle = computeFunnyTrophyTitle(comp, terrainSys.treasuresList, rank);
        return `
          <div class="podium-col rank-${rank} ${isYou ? 'is-you' : ''}" style="--comp-accent:${comp.colorHex}">
            <div class="podium-col-figure">
              ${rank === 1 ? '<span class="podium-crown-float" aria-hidden="true">👑</span>' : ''}
              <div class="podium-avatar-ring" style="--ring-color:${comp.colorHex}">
                <img src="${portraitSrc}" alt="${displayName}" class="podium-avatar-img" />
                ${isYou ? '<span class="podium-you-pill">YOU</span>' : ''}
              </div>
              <strong class="podium-col-name">${displayName}</strong>
              <span class="podium-col-score">${comp.score.toLocaleString()} PTS • ${comp.relicCount} 💎</span>
              <span class="podium-funny-title-pill">${funnyTitle}</span>
            </div>
            <div class="podium-pedestal-step ${stepClass}">
              <div class="podium-step-lip"></div>
              <span class="podium-step-medal">${medal}</span>
              <span class="podium-step-num">${num}</span>
            </div>
          </div>
        `;
      }).join('');

      let fourthHtml = '';
      if (fourth) {
        const isYou4 = fourth.id === 'you';
        const name4 = COMP_SHORT_LABELS[fourth.id] || fourth.name;
        const portrait4 = AVATAR_PORTRAIT_MAP[fourth.id] || AVATAR_PORTRAIT_MAP.you;
        const funnyTitle4 = computeFunnyTrophyTitle(fourth, terrainSys.treasuresList, 4);
        fourthHtml = `
          <div class="podium-fourth-bar ${isYou4 ? 'is-you' : ''}" style="--comp-accent:${fourth.colorHex}">
            <div class="podium-fourth-left">
              <span class="podium-fourth-rank">🎖️ 4TH</span>
              <div class="podium-fourth-avatar" style="--ring-color:${fourth.colorHex}">
                <img src="${portrait4}" alt="${name4}" />
              </div>
              <strong class="podium-fourth-name">${name4}</strong>
              ${isYou4 ? '<span class="podium-you-inline">YOU</span>' : ''}
              <span class="podium-funny-title-pill is-fourth-title">${funnyTitle4}</span>
            </div>
            <span class="podium-fourth-score">${fourth.score.toLocaleString()} PTS • ${fourth.relicCount} 💎</span>
          </div>
        `;
      }

      podiumEl.innerHTML = `
        ${jumpPillHtml}
        <div class="podium-columns-row">
          ${colsHtml}
        </div>
        ${fourthHtml}
      `;
    }
  }

  // Populate Compact Strip with Actual Relics Collected by Player
  if (relicsLabelEl) {
    relicsLabelEl.textContent = `🎒 KEEPSAKES (${myRelics.length} / 42)`;
  }

  if (viewAllBtn && !viewAllBtn.dataset.bound) {
    viewAllBtn.dataset.bound = 'true';
    viewAllBtn.addEventListener('click', () => {
      bannerEl?.classList.add('hidden');
      document.getElementById('gameplayHud')?.classList.remove('endgame-modal-open');
      const targetId = appState.playerCollectedOrder?.[0] || appState.selectedRelicId || 1;
      onInspectRelic?.(targetId);
    });
  }

  if (trophiesEl) {
    if (myRelics.length === 0) {
      trophiesEl.innerHTML = `
        <div class="eg-collected-empty">
          <span>🧭 No keepsakes picked up yet — tap <strong>🚶 Keep Exploring</strong> or <strong>🔄 Play Again</strong>!</span>
        </div>
      `;
    } else {
      trophiesEl.innerHTML = myRelics.map((relic) => {
        const shortTitle = relic.shortName || relic.name;
        const ptsVal = relic.points || (relic.rarity === 'legendary' ? 350 : relic.rarity === 'rare' ? 200 : 100);
        return `
          <button
            type="button"
            class="eg-collected-chip"
            data-relic-id="${relic.id}"
            title="Click to inspect #${String(relic.id).padStart(2, '0')} ${shortTitle} (+${ptsVal} PTS)"
          >
            <div class="eg-chip-thumb-wrap">
              <img src="${relic.image || ''}" alt="${shortTitle}" class="eg-chip-thumb" />
            </div>
            <div class="eg-chip-meta">
              <span class="eg-chip-id">${relic.icon || '🌸'} +${ptsVal} PTS</span>
              <strong class="eg-chip-name">${shortTitle}</strong>
            </div>
          </button>
        `;
      }).join('');

      trophiesEl.querySelectorAll('.eg-collected-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
          const rid = Number(btn.dataset.relicId);
          if (rid && onInspectRelic) {
            bannerEl?.classList.add('hidden');
            document.getElementById('gameplayHud')?.classList.remove('endgame-modal-open');
            onInspectRelic(rid);
          }
        });
      });
    }
  }

  document.getElementById('gameplayHud')?.classList.add('endgame-modal-open');
  bannerEl?.classList.remove('hidden');
}
