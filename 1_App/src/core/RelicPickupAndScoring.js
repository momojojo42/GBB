// ============================================================================
// Gardens by the Bay — Relic Pickup, Scoring, Hazards & Mid-Match Events
// (src/core/RelicPickupAndScoring.js)
// Extracted from src/core/GameplayRulesController.js
// ============================================================================

import { SoundFX } from '../audio/SoundFX.js';

export function collectRelicAndScore({
  treasureId,
  collectorId,
  incrementPlayerScore = false,
  fromNetworkLock = false,
  networkEarnedPoints = null,
  networkCollectorName = null,
  appState,
  getTerrainSys,
  getExplorersSys,
  showDiscoveryPopCard,
  spawnFloatingCollectPopup,
  spawnSnatchBubble,
  updateHudStandings,
  renderEncyclopediaModal,
  triggerEndGame,
  showToast
}) {
  const terrainSys = getTerrainSys();
  const explorersSys = getExplorersSys();
  if (!terrainSys || !explorersSys) return;
  const relic = terrainSys.collectTreasure(treasureId, collectorId);
  if (!relic) return;

  let newlyCollectedPlayerId = null;
  if (collectorId === 'you') {
    newlyCollectedPlayerId = relic.id;
    if (!appState.playerCollectedOrder.includes(relic.id)) {
      appState.playerCollectedOrder.push(relic.id);
    }
    appState.selectedRelicId = relic.id;

    appState.comboCount = appState.comboTimer > 0 ? appState.comboCount + 1 : 1;
    appState.bestComboCount = Math.max(appState.bestComboCount || 0, appState.comboCount);
    appState.comboTimer = 11.0;

    const isCrown = relic.rarity === 'crown' || Boolean(relic.isLandmarkRelic);
    const basePoints = relic.points || (isCrown ? 350 : relic.rarity === 'heritage' ? 200 : 100);
    const nightMult = appState.isNightRhapsody ? 1.5 : 1.0;
    const streakBonus = appState.comboCount > 1 ? Math.min(200, (appState.comboCount - 1) * 50) : 0;
    const earnedPoints = Math.round(basePoints * nightMult) + streakBonus;

    explorersSys.incrementScore('you', earnedPoints);
    if (incrementPlayerScore) {
      explorersSys.triggerJump?.('you', isCrown);
    }

    if (appState.isMultiplayerRoom && !fromNetworkLock) {
      appState.multiplayerClient?.claimRelic({
        relicId: relic.id,
        collectorExplorerId: 'you',
        points: earnedPoints,
        collectorName: appState.playerName || 'You'
      });
    }

    // Check if snatched near a bot (even when collected via click/spacebar)
    if (!relic.chopedFromBot && appState.mode === 'race') {
      const standings = explorersSys.getStandings();
      const nearBot = standings.find(
        (s) =>
          s.id !== 'you' &&
          Math.hypot(relic.position.x - s.position.x, relic.position.z - s.position.z) <= 9.5
      );
      if (nearBot) {
        relic.chopedFromBot = nearBot.id;
      }
    }

    if (relic.chopedFromBot) {
      SoundFX.playChopeSnatch?.();
      const standings = explorersSys.getStandings();
      const youExp = standings.find((s) => s.id === 'you');
      const botExp = standings.find((s) => s.id === relic.chopedFromBot);
      if (youExp) spawnSnatchBubble?.(youExp.position, '🤚 CHOPE! 😎', true);
      if (botExp) spawnSnatchBubble?.(botExp.position, '😱 Alamak!', false);
    }

    SoundFX.playPlayerCollect(appState.comboCount, relic.rarity || 'classic');

    const bonusTag = [
      relic.chopedFromBot ? '🤚 CHOPED!' : '',
      appState.isNightRhapsody ? '🌙 1.5x NIGHT' : '',
      appState.comboCount > 1 ? `🔥 ${appState.comboCount}x` : ''
    ]
      .filter(Boolean)
      .join(' • ');

    const funnyTagSuffix = relic.funnyTag ? ` • ${relic.funnyTag}` : '';
    showDiscoveryPopCard?.(relic, earnedPoints, bonusTag);
    spawnFloatingCollectPopup(relic.position, relic, appState.comboCount, earnedPoints);
    showToast(
      `${relic.icon || '🌸'} ${relic.shortName || relic.name} • +${earnedPoints} PTS!${funnyTagSuffix}${
        bonusTag ? ` (${bonusTag})` : ''
      }`
    );
  } else {
    const isCrown = relic.rarity === 'crown' || Boolean(relic.isLandmarkRelic);
    const botPts = Number(
      networkEarnedPoints ||
      relic.points ||
      (isCrown ? 350 : relic.rarity === 'heritage' ? 200 : 100)
    );
    const standings = explorersSys.getStandings();
    const youExp = standings.find((s) => s.id === 'you');
    const rivalExp = standings.find((s) => s.id === collectorId);
    const distToYou =
      youExp && relic?.position
        ? Math.hypot(relic.position.x - youExp.position.x, relic.position.z - youExp.position.z)
        : 999;

    const botBanterPool = {
      kai: ['⚡ Chope first lah!', '🚀 Steady pom pi pi!', '☕ Kopi O Gao speed!', '💨 Too slow lah!'],
      mei: ['📡 Radar locked lah!', '✨ Swee lah! Mine!', '🌺 Choped by Mei!', '🎯 Precision snatch!'],
      raj: ['🧭 Compass says MINE!', '👑 Shiok keepsake!', '🔥 Huat ah! Got it!', '🏃 Catch me if can!']
    }[collectorId] || ['🤚 Chope first lah! 😎', '✨ Shiok keepsake!'];
    const banterLine = botBanterPool[relic.id % botBanterPool.length];

    if (fromNetworkLock) {
      explorersSys.incrementScore(collectorId, botPts);
      if (distToYou <= 12.0) {
        SoundFX.playChopeSnatch?.();
        if (rivalExp) spawnSnatchBubble?.(rivalExp.position, '🤚 CHOPE! 😎', true);
        if (youExp) spawnSnatchBubble?.(youExp.position, '😱 Alamak!', false);
        showToast(`🤚 CHOPED by ${networkCollectorName || rivalExp?.name || 'Rival'}! (${relic.shortName || relic.name})`);
      }
    } else {
      if (appState.isMultiplayerRoom && appState.multiplayerHost) {
        appState.multiplayerClient?.claimRelic({
          relicId: relic.id,
          collectorExplorerId: collectorId,
          points: botPts,
          collectorName: collectorId.toUpperCase()
        });
      }
      if (rivalExp && distToYou <= 11.5) {
        SoundFX.playChopeSnatch?.();
        spawnSnatchBubble?.(rivalExp.position, banterLine, true);
        if (youExp) spawnSnatchBubble?.(youExp.position, '😱 Alamak! My relic!', false);
        showToast(`🤚 ${rivalExp.name || 'Bot'} choped ${relic.shortName || relic.name} right in front of you!`);
      } else if (rivalExp && distToYou <= 32.0) {
        spawnSnatchBubble?.(rivalExp.position, banterLine, true);
      }
    }
    SoundFX.playBotCollect();
  }
  updateHudStandings(newlyCollectedPlayerId);
  if (appState.screen === 'encyclopedia') renderEncyclopediaModal();

  if (!appState.isGameOver && terrainSys.treasuresList.every((t) => t.collected)) {
    triggerEndGame('all_found');
  }
}

export function processArcadeEvent({
  evt,
  appState,
  getTerrainSys,
  spawnFloatingCollectPopup,
  showToast,
  updateHudStandings
}) {
  const terrainSys = getTerrainSys();
  if (evt.type === 'player_pickpocket') {
    let stolenId = null;
    if (evt.stolenRelic && !appState.playerCollectedOrder.includes(evt.stolenRelic.id)) {
      appState.playerCollectedOrder.push(evt.stolenRelic.id);
      stolenId = evt.stolenRelic.id;
    }
    SoundFX.playPickpocketSteal?.(true);
    terrainSys?.spawnCelebrationBurst?.(evt.position.x, evt.position.y || 0, evt.position.z, 0xFACC15, true);
    spawnFloatingCollectPopup(evt.position, '🎒💥 PICKPOCKET! +150 PTS!');
    showToast(
      `🎒 Pickpocketed ${evt.victimName || 'Bot'}! +150 PTS${
        evt.stolenRelic ? ` & ${evt.stolenRelic.shortName || evt.stolenRelic.name}` : ''
      }!`
    );
    updateHudStandings(stolenId);
  } else if (evt.type === 'bot_pickpocket') {
    SoundFX.playPickpocketSteal?.(false);
    spawnFloatingCollectPopup(evt.position, `😱 ${evt.attackerName || 'Bot'} STOLE ${evt.points} PTS!`);
    showToast(`😱 ${evt.attackerName || 'Bot'} bumped your back! (${evt.points} PTS) — Sprint or Jump [J]!`);
    updateHudStandings();
  } else if (evt.type === 'durian_slip') {
    SoundFX.playPenaltyHit?.('durian');
    spawnFloatingCollectPopup(evt.position, '🦨💥 DURIAN SLIP! -75 PTS');
    showToast('🦨 Aiyoh! Spiky Durian slip (-75 PTS) • Press [J] to Jump over!');
    updateHudStandings();
  } else if (evt.type === 'durian_jump_bonus') {
    SoundFX.playPlayerCollect?.(2, 'heritage');
    terrainSys?.spawnCelebrationBurst?.(evt.position.x, evt.position.y || 0, evt.position.z, 0x34D399, true);
    spawnFloatingCollectPopup(evt.position, '🦘✨ DURIAN HOP! +50 PTS');
    showToast('🦘 Style Hop over Spiky Durian! +50 PTS!');
    updateHudStandings();
  }
}

export function stepMidMatchAndPlayerHazards({
  dt,
  youStanding,
  moveX,
  moveZ,
  appState,
  cameraControl,
  getTerrainSys,
  getExplorersSys,
  spawnFloatingCollectPopup,
  showToast,
  updateHudStandings
}) {
  if (appState.screen === 'title') return;
  const terrainSys = getTerrainSys();
  const explorersSys = getExplorersSys();
  if (!terrainSys || !explorersSys) return;

  // Trigger 01:00 Golden Vanda Sky-Drop (+500 PTS) at 60s remaining (120s elapsed)
  if (
    !appState.hasTriggeredGoldenVandaDrop &&
    appState.elapsedSeconds >= 120 &&
    !appState.isGameOver
  ) {
    appState.hasTriggeredGoldenVandaDrop = true;
    const jackpotRelic = terrainSys.spawnGoldenVandaJackpot?.();
    if (jackpotRelic) {
      SoundFX.playPlayerCollect?.(4, 'crown');
      showToast('👑 GOLDEN VANDA DROP (+500 PTS) • Supertree Grove!');
    }
  }

  // Trigger 00:30 Garden Rhapsody Night Show (1.5x Points) at 30s remaining (150s elapsed)
  if (
    !appState.hasTriggeredRhapsodyDrop &&
    appState.elapsedSeconds >= 150 &&
    !appState.isGameOver
  ) {
    appState.hasTriggeredRhapsodyDrop = true;
    SoundFX.playRhapsodyDrop?.();
    showToast('🎆 GARDEN RHAPSODY NIGHT SHOW • 🔥 1.5x POINTS!');
  }

  if (!youStanding) return;

  // Check Miniature Shuttle Car Proximity Hit
  if (terrainSys.miniatureCars && appState.elapsedSeconds - (appState.lastCarHitAt || -99) >= 3.5) {
    const hitCar = terrainSys.miniatureCars.find((car) => {
      const cX = car.position ? car.position.x : car.x;
      const cZ = car.position ? car.position.z : car.z;
      if (cX === undefined || cZ === undefined) return false;
      const dx = cX - youStanding.position.x;
      const dz = cZ - youStanding.position.z;
      return dx * dx + dz * dz <= 1.42 * 1.42;
    });
    if (hitCar) {
      appState.lastCarHitAt = appState.elapsedSeconds;
      explorersSys.deductScore?.('you', 100);
      explorersSys.applyKnockback?.('you', -(moveX || 0.6), -(moveZ || 0.8), 3.0, 0.75, '🚌💥 OUCH! -100 PTS!');
      SoundFX.playPenaltyHit?.('car');
      spawnFloatingCollectPopup(youStanding.position, '🚌💥 SHUTTLE HIT! -100 PTS');
      showToast('🚌💥 Boing! Hit by Garden Shuttle (-100 PTS)!');
      updateHudStandings();
    }
  }

  // Check Scenic Bridge "Wind-Dash" Turbo Rings for Player
  const hitRing = terrainSys.checkWindDashRing?.(
    youStanding.position.x,
    youStanding.position.z,
    appState.elapsedSeconds
  );
  if (
    hitRing &&
    hitRing.triggered &&
    appState.elapsedSeconds - (appState.lastWindDashAt || -99) >= 3.5
  ) {
    appState.lastWindDashAt = appState.elapsedSeconds;
    explorersSys.triggerWindDash?.('you', 3.5);
    SoundFX.playWindDash?.();
    spawnFloatingCollectPopup(youStanding.position, '💨 WIND DASH! 1.45x SPEED');
    showToast('💨 Bridge Wind-Dash! 1.45x Speed (3.5s)');
  }

  document.querySelectorAll('.gadget-pill').forEach((pill) => {
    pill.classList.toggle('active-gadget', pill.dataset.gadget === youStanding.activeGadget);
  });

  // End-Game Finale Fireworks
  if (appState.isGameOver) {
    appState.fireworkAccumulator += dt;
    if (appState.fireworkAccumulator >= 0.65) {
      appState.fireworkAccumulator = 0;
      const rx = youStanding.position.x + (Math.random() - 0.5) * 14;
      const rz = youStanding.position.z + (Math.random() - 0.5) * 14;
      const ry = (youStanding.position.y || 0) + 1.8 + Math.random() * 4.5;
      terrainSys.spawnFinaleFirework?.(rx, ry, rz);
    }
    if (!cameraControl.isDragging && cameraControl.userOrbitingFollowTimer <= 0) {
      cameraControl.followYaw += dt * 0.42;
    }
  }
}
