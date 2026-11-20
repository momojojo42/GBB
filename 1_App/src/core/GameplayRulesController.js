// ============================================================================
// Gardens by the Bay — Gameplay Rules, Scoring, Hazards & Finale Controller
// Extracted from src/main3d.js
// ============================================================================

import * as THREE from 'three';
import { BOT_DIFFICULTY_PRESETS } from '../entities/CharacterAndBotBuilder.js';
import { SoundFX } from '../audio/SoundFX.js';
import { syncOverlayBodyClasses } from './AppState.js';
import {
  collectRelicAndScore,
  processArcadeEvent,
  stepMidMatchAndPlayerHazards
} from './RelicPickupAndScoring.js';

export { collectRelicAndScore, processArcadeEvent, stepMidMatchAndPlayerHazards };

export function createGameplayRulesController({
  appState,
  getTerrainSys,
  getExplorersSys,
  cameraControl,
  activateFollowCameraFromCurrentView,
  setCameraPreset,
  setScreenState,
  setClickMoveTarget,
  updateHudStandings,
  updateClockDigits,
  populateEndGameBanner,
  showDiscoveryPopCard,
  spawnFloatingCollectPopup,
  spawnSnatchBubble,
  updateWorldLabels,
  renderEncyclopediaModal,
  showToast
}) {
  let lastPhysicsToastTime = -10;

  function setGameMode(mode) {
    const explorersSys = getExplorersSys();
    const isParty = mode === 'party';
    const isRelaxed = mode === 'relaxed';
    appState.isMultiplayerRoom = isParty;
    appState.mode = isParty ? 'race' : mode;
    document.getElementById('btnModeRelaxed')?.classList.toggle('active', isRelaxed);
    document.getElementById('btnModeRace')?.classList.toggle('active', mode === 'race' || isParty);
    document.getElementById('setupCardRelaxed')?.classList.toggle('selected', isRelaxed);
    document.getElementById('setupCardRace')?.classList.toggle('selected', mode === 'race');
    document.getElementById('startCardRelaxed')?.classList.toggle('active', isRelaxed);
    document.getElementById('startCardRace')?.classList.toggle('active', mode === 'race');
    document.getElementById('startCardParty')?.classList.toggle('active', isParty);

    const startCardEl = document.querySelector('#screenTitleOverlay .start-pearl-card');
    if (startCardEl) {
      startCardEl.dataset.selectedMode = mode;
    }

    document.getElementById('startRaceSetupPane')?.classList.toggle('hidden', isParty || isRelaxed);
    document.getElementById('startPartyRoomPanel')?.classList.toggle('hidden', !isParty);
    document.getElementById('startRelaxedInfoPod')?.classList.toggle('hidden', !isRelaxed);

    const startBtn = document.getElementById('btnStartRaceFromTitle');
    if (startBtn) {
      if (isParty) {
        startBtn.textContent = '🚀 OPEN PARTY LOBBY';
      } else if (isRelaxed) {
        startBtn.textContent = '🌿 START CHILL STROLL';
      } else {
        startBtn.textContent = '🚀 START 3-MIN RACE';
      }
    }
    window.__gbbRenderMultiplayerRoomDom?.();

    const topDiffGroup = document.getElementById('topBotDiffGroup');
    if (topDiffGroup) topDiffGroup.style.opacity = isRelaxed ? '0.45' : '1';
    const startDiffSec = document.getElementById('startDiffSection');
    if (startDiffSec) startDiffSec.classList.toggle('dimmed', isRelaxed);

    if (isRelaxed) {
      explorersSys?.setMode('relaxed');
    } else {
      explorersSys?.setMode('race');
    }
    updateClockDigits();
    updateHudStandings();
  }

  function setBotDifficulty(diffId) {
    if (!BOT_DIFFICULTY_PRESETS[diffId]) return;
    const explorersSys = getExplorersSys();
    appState.botDifficulty = diffId;
    explorersSys?.setBotDifficulty(diffId);

    const pillLabels = {
      chill: { base: '🌱 Chill', active: '🌱 Chill ✓' },
      normal: { base: '⚖️ Normal', active: '⚖️ Normal ✓' },
      pro: { base: '🔥 Pro', active: '🔥 Pro ✓' }
    };

    document.querySelectorAll('[data-bot-diff]').forEach((btn) => {
      const d = btn.dataset.botDiff;
      const isAct = d === diffId;
      btn.classList.toggle('active', isAct);
      if (btn.classList.contains('start-diff-pill') && pillLabels[d]) {
        btn.textContent = isAct ? pillLabels[d].active : pillLabels[d].base;
      }
    });

    const preset = BOT_DIFFICULTY_PRESETS[diffId];
    updateClockDigits();
    showToast(`🤖 Bots: ${preset.label}`);
  }

  function activateFieldGadgetForPlayer(gadgetId, durationSec = 10) {
    const explorersSys = getExplorersSys();
    if (!explorersSys) return;
    appState.gadgetPreviewUnlocked = true;
    appState.activeGadgetId = gadgetId;
    explorersSys.activateGadget('you', gadgetId, durationSec);
    SoundFX.playGadgetActivate();

    document.querySelectorAll('.gadget-pill').forEach((pill) => {
      pill.classList.add('unlocked');
      pill.classList.toggle('active-gadget', pill.dataset.gadget === gadgetId);
    });

    const labels = {
      turbo_boots: '👢 Turbo! 1.55x Speed (10s)',
      relic_magnet: '🧲 Magnet! 11m Pull (10s)',
      holo_decoy: '🎭 Decoy! Luring Bots (8s)'
    };
    showToast(labels[gadgetId] || `⚡ ${gadgetId}!`);
  }

  function handleTreasureCollected(
    treasureId,
    collectorId,
    incrementPlayerScore = false,
    fromNetworkLock = false,
    networkEarnedPoints = null,
    networkCollectorName = null
  ) {
    collectRelicAndScore({
      treasureId,
      collectorId,
      incrementPlayerScore,
      fromNetworkLock,
      networkEarnedPoints,
      networkCollectorName,
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
    });
  }

  function triggerPlayerJump(superJump = false) {
    const explorersSys = getExplorersSys();
    const terrainSys = getTerrainSys();
    if (!explorersSys) return;
    explorersSys.triggerJump?.('you', superJump);
    SoundFX.playJump(superJump);
    const you = explorersSys.getStandings().find((s) => s.id === 'you');
    if (you && terrainSys) {
      if (superJump) {
        terrainSys.spawnFinaleFirework?.(you.position.x, (you.position.y || 0) + 1.2, you.position.z);
        spawnFloatingCollectPopup(you.position, '🤸✨ 360° SUPER JUMP!');
      } else {
        terrainSys.spawnCelebrationBurst?.(you.position.x, (you.position.y || 0) + 0.6, you.position.z, 0x38BDF8);
      }
    }
  }

  function triggerEndGame(reason = 'all_found') {
    window.__gbbCancelCountdown?.();
    const explorersSys = getExplorersSys();
    const terrainSys = getTerrainSys();
    if (!explorersSys || !terrainSys) return;
    appState.isGameOver = true;
    appState.endGameReason = reason;
    appState.fireworkAccumulator = 0;
    setClickMoveTarget(null);

    if (appState.screen !== 'gameplay') {
      setScreenState('gameplay');
    }

    activateFollowCameraFromCurrentView();
    cameraControl.followDistance = 7.4;
    cameraControl.followPitch = 0.28;

    const standings = explorersSys.startEndGameCelebration(cameraControl.followYaw);
    const winner = standings[0];
    const you = standings.find((s) => s.id === 'you') || winner;

    SoundFX.playVictoryFanfare();

    for (let i = 0; i < 3; i++) {
      const ox = (Math.random() - 0.5) * 6;
      const oz = (Math.random() - 0.5) * 6;
      terrainSys.spawnFinaleFirework?.(
        you.position.x + ox,
        (you.position.y || 0) + 1.8 + i * 0.9,
        you.position.z + oz
      );
    }

    populateEndGameBanner(reason, standings);
    syncOverlayBodyClasses();
    updateHudStandings();
    updateWorldLabels();
    showToast('🎆 Finale! Press [J] for Super Jump!');
  }

  function dismissEndGameToFreeRoam() {
    const explorersSys = getExplorersSys();
    document.getElementById('endGameBannerOverlay')?.classList.add('hidden');
    document.getElementById('gameplayHud')?.classList.remove('endgame-modal-open');
    appState.isGameOver = false;
    syncOverlayBodyClasses();
    explorersSys?.stopEndGameCelebration?.();
    document.getElementById('hudClockDigits')?.classList.remove('clock-urgent');
    updateWorldLabels();
    showToast('🌴 Free Roam Active!');
  }

  function resetFullMatch() {
    window.__gbbCancelCountdown?.();
    const terrainSys = getTerrainSys();
    const explorersSys = getExplorersSys();
    document.getElementById('endGameBannerOverlay')?.classList.add('hidden');
    document.getElementById('gameplayHud')?.classList.remove('endgame-modal-open');
    appState.isGameOver = false;
    appState.endGameReason = null;
    syncOverlayBodyClasses();
    appState.elapsedSeconds = 0;
    appState.remainingSeconds = appState.raceDurationSeconds || 180;
    appState.dayNightPhaseLabel = '☀️ Morning';
    appState.isNightRhapsody = false;
    appState.hasTriggeredGoldenVandaDrop = false;
    appState.hasTriggeredRhapsodyDrop = false;
    appState.lastWindDashAt = -99;
    appState.lastCountdownSecond = -1;
    appState.comboCount = 0;
    appState.bestComboCount = 0;
    appState.comboTimer = 0;
    appState.playerCollectedOrder = [];
    setClickMoveTarget(null);
    document.getElementById('hudClockDigits')?.classList.remove('clock-urgent');
    document.getElementById('mobileMoveHintPill')?.classList.remove('is-dismissed');
    terrainSys?.resetAllTreasures();
    explorersSys?.resetMatch();
    setCameraPreset('player_follow', false);
    updateClockDigits();
    updateHudStandings();
    updateWorldLabels();
    if (appState.screen === 'encyclopedia') renderEncyclopediaModal();
    showToast('↺ Match Reset! 42 Relics Ready.');
  }

  function collectNearestRelicForPlayer() {
    const explorersSys = getExplorersSys();
    const terrainSys = getTerrainSys();
    if (!explorersSys || !terrainSys) return;
    const you = explorersSys.getStandings().find((s) => s.id === 'you');
    if (!you) return;

    let nearest = null;
    let nearestDist = Infinity;
    for (const relic of terrainSys.treasuresList) {
      if (relic.collected) continue;
      const d = Math.hypot(relic.position.x - you.position.x, relic.position.z - you.position.z);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = relic;
      }
    }

    if (nearest && nearestDist <= 18) {
      handleTreasureCollected(nearest.id, 'you', true);
    } else if (nearest) {
      setClickMoveTarget(new THREE.Vector3(nearest.position.x, 0, nearest.position.z));
      activateFollowCameraFromCurrentView();
      showToast(`🧭 → ${nearest.icon || '🌸'} ${nearest.shortName || nearest.name} (${Math.round(nearestDist)}m)`);
    }
  }

  function handleArcadeEvent(evt) {
    processArcadeEvent({
      evt,
      appState,
      getTerrainSys,
      spawnFloatingCollectPopup,
      showToast,
      updateHudStandings
    });
  }

  function handlePhysicsBlocked(res, moveX, moveZ, isSprinting) {
    const explorersSys = getExplorersSys();
    if (!explorersSys) return;

    // 🚌 Boulevard Shuttle / Car Bumper Hit (-100 PTS, 3.5s cooldown):
    if (res.reason === 'vehicle' && appState.elapsedSeconds - (appState.lastCarHitAt || -99) >= 3.5) {
      appState.lastCarHitAt = appState.elapsedSeconds;
      const youNow = explorersSys.getStandings().find((s) => s.id === 'you');
      explorersSys.deductScore?.('you', 100);
      explorersSys.applyKnockback?.('you', -(moveX || 0.6), -(moveZ || 0.8), 3.0, 0.75, '🚌💥 OUCH! -100 PTS!');
      SoundFX.playPenaltyHit?.('car');
      if (youNow) spawnFloatingCollectPopup(youNow.position, '🚌💥 SHUTTLE HIT! -100 PTS');
      showToast('🚌💥 Boing! Hit by Garden Shuttle (-100 PTS)!');
      updateHudStandings();
      return;
    }

    // 🌊 Reckless Water Sprint Penalty (-50 PTS, 4.5s cooldown):
    if (res.reason === 'water' && isSprinting && appState.elapsedSeconds - (appState.lastWaterSplashAt || -99) >= 4.5) {
      appState.lastWaterSplashAt = appState.elapsedSeconds;
      const youNow = explorersSys.getStandings().find((s) => s.id === 'you');
      explorersSys.deductScore?.('you', 50);
      explorersSys.applyKnockback?.('you', -(moveX || 0), -(moveZ || -1), 2.0, 0.5, '🌊💦 SPLASH! -50 PTS!');
      SoundFX.playPenaltyHit?.('water');
      if (youNow) spawnFloatingCollectPopup(youNow.position, '🌊💦 WATER SPLASH! -50 PTS');
      showToast('🌊💦 Splash! Sprinted into deep water (-50 PTS) — use a Bridge!');
      updateHudStandings();
      return;
    }

    if (appState.elapsedSeconds - lastPhysicsToastTime > 2.2) {
      lastPhysicsToastTime = appState.elapsedSeconds;
      if (res.reason === 'water') {
        showToast('🌊 Water ahead — use a Bridge!');
      } else if (res.reason === 'building_wall') {
        showToast('🚪 Solid wall — use the glowing Doorway!');
      }
    }
  }

  function updateMidMatchAndPlayerHazards(dt, youStanding, moveX, moveZ) {
    stepMidMatchAndPlayerHazards({
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
    });
  }

  return {
    setGameMode,
    setBotDifficulty,
    activateFieldGadgetForPlayer,
    handleTreasureCollected,
    triggerPlayerJump,
    triggerEndGame,
    dismissEndGameToFreeRoam,
    resetFullMatch,
    collectNearestRelicForPlayer,
    handleArcadeEvent,
    handlePhysicsBlocked,
    updateMidMatchAndPlayerHazards
  };
}
