import { SoundFX } from '../../audio/SoundFX.js';
import { normalizeRoomCode, generateClientRoomCode } from '../../multiplayer/MultiplayerProtocolHelpers.js';
import { AVATAR_PORTRAIT_MAP } from './EndGameModalController.js';
const SLOT_VISUAL_META = [
  { slotIndex: 0, avatarKey: 'you', ringColor: '#38BDF8', defaultBotLabel: '🧭 Host Slot' },
  { slotIndex: 1, avatarKey: 'mei', ringColor: '#34D399', defaultBotLabel: '📡 Mei (AI)' },
  { slotIndex: 2, avatarKey: 'raj', ringColor: '#FBBF24', defaultBotLabel: '🧭 Raj (AI)' },
  { slotIndex: 3, avatarKey: 'kai', ringColor: '#FB7185', defaultBotLabel: '⚡ Kai (AI)' }
];
export function createMultiplayerLobbyController({
  appState, cameraControl, setCameraPreset, setScreenState, setGameMode,
  resetFullMatch, getExplorersSys, getLobby3DSys, updateHudStandings,
  updateClockDigits, updateWorldLabels, showToast
}) {
  let countdownIntervalId = null;
  let countdownHideTimerId = null;
  function clearCountdownTimers() {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
    if (countdownHideTimerId) {
      clearTimeout(countdownHideTimerId);
      countdownHideTimerId = null;
    }
  }
  function cancelActiveCountdown() {
    clearCountdownTimers();
    appState.isStartingCountdownActive = false;
    document.getElementById('multiplayerCountdownBanner')?.classList.add('hidden');
  }
  function buildShareableRoomUrl(code) {
    const clean = normalizeRoomCode(code || appState.multiplayerRoomCode);
    const url = new URL(window.location.href);
    url.searchParams.set('room', clean);
    url.searchParams.delete('screen');
    return url.toString();
  }
  async function copyRoomInviteLink(code) {
    const clean = normalizeRoomCode(code || appState.multiplayerRoomCode);
    const inviteUrl = buildShareableRoomUrl(clean);
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(inviteUrl);
    } catch (_) {
    }
    showToast?.(`📋 Copied Room ${clean} Invite Link!`);
    return inviteUrl;
  }
  function frameCameraFor3DPartyLobby() {
    if (!cameraControl) return;
    cameraControl.mode = 'preset';
    cameraControl.desiredPos.set(-1.6, 4.15, 9.6);
    cameraControl.desiredTarget.set(1.15, 1.05, 2.35);
  }
  function frameCameraForStartingLineCountdown() {
    if (!cameraControl) return;
    cameraControl.mode = 'preset';
    cameraControl.desiredPos.set(0, 3.85, 8.9);
    cameraControl.desiredTarget.set(0, 1.05, 2.25);
  }
  function renderStep1AndStep2RoomDom(roomState = null, mySlotIdx = appState.multiplayerSlotIndex) {
    const code = normalizeRoomCode(roomState?.roomCode || appState.multiplayerRoomCode);
    const aiBackfill = roomState ? Boolean(roomState.aiBackfill) : Boolean(appState.multiplayerAiBackfill);
    const slots = Array.isArray(roomState?.slots) && roomState.slots.length === 4
      ? roomState.slots
      : SLOT_VISUAL_META.map((m, idx) => ({
          slotIndex: idx,
          occupiedBy: idx === 0 ? 'human' : (aiBackfill ? 'bot' : 'empty'),
          name: idx === 0 ? (appState.playerName || 'You (Host)') : m.defaultBotLabel,
          pingMs: idx === 0 ? (appState.multiplayerPingMs || 14) : 0
        }));
    const titleCodeEl = document.getElementById('mpTitleRoomCodeText');
    if (titleCodeEl) titleCodeEl.textContent = code;
    const joinInputEl = document.getElementById('mpJoinRoomInput');
    if (joinInputEl && document.activeElement !== joinInputEl && !joinInputEl.value) { joinInputEl.placeholder = code; }
    const startBtn = document.getElementById('btnStartRaceFromTitle');
    if (startBtn) { startBtn.textContent = appState.isMultiplayerRoom ? '🚀 OPEN PARTY LOBBY' : '🚀 PLAY NOW'; }
    const squadPills = document.querySelectorAll('#startSquadRow .start-squad-name');
    if (squadPills.length === 4) {
      const soloDefaults = ['You', '⚡ Kai', '📡 Mei', '🧭 Raj'];
      slots.forEach((slot, idx) => {
        const pill = squadPills[idx];
        if (!pill) return;
        if (!appState.isMultiplayerRoom) {
          pill.textContent = soloDefaults[idx] || 'Explorer';
        } else if (slot.occupiedBy === 'human') {
          pill.textContent = idx === mySlotIdx ? '🧑 You' : `🧑 ${slot.name}`;
        } else { pill.textContent = slot.occupiedBy === 'bot' ? SLOT_VISUAL_META[idx].defaultBotLabel.replace(/\s*\(AI\)\s*/i, '') : '⏳ Open'; }
      });
    }
    const lobbyCard = document.getElementById('multiplayerPartyLobbyCard');
    const isLobbyVisible =
      appState.screen === 'gameplay' &&
      appState.isMultiplayerRoom &&
      appState.multiplayerPhase === 'lobby';
    lobbyCard?.classList.toggle('hidden', !isLobbyVisible);
    const lobbyCodeEl = document.getElementById('mpLobbyRoomCode');
    if (lobbyCodeEl) lobbyCodeEl.textContent = code;
    const transportEl = document.getElementById('mpLobbyTransportBadge');
    if (transportEl) {
      const humanCount = slots.filter((s) => s.occupiedBy === 'human').length;
      transportEl.textContent = `🟢 ${humanCount}/4 Humans • ${appState.multiplayerPingMs || 14}ms`;
    }
    const backfillBtn = document.getElementById('btnMpToggleAiBackfill');
    if (backfillBtn) {
      backfillBtn.setAttribute('aria-pressed', String(aiBackfill));
      backfillBtn.classList.toggle('active', aiBackfill);
      const stateSpan = backfillBtn.querySelector('.mp-toggle-state');
      if (stateSpan) stateSpan.textContent = aiBackfill ? 'ON' : 'OFF';
    }
    const lobbyListEl = document.getElementById('mpLobbySlotsList');
    if (lobbyListEl) {
      lobbyListEl.innerHTML = slots
        .map((slot, idx) => {
          const meta = SLOT_VISUAL_META[idx] || SLOT_VISUAL_META[0];
          const portraitSrc = AVATAR_PORTRAIT_MAP[meta.avatarKey] || AVATAR_PORTRAIT_MAP.you;
          const isMe = idx === mySlotIdx;
          const isHuman = slot.occupiedBy === 'human';
          const isBot = slot.occupiedBy === 'bot';
          const badgeText = isHuman
            ? `🟢 READY • ${slot.pingMs || 16}ms`
            : isBot
              ? '🤖 AI BOT BACKFILL'
              : '⏳ WAITING FOR PLAYER';
          const badgeClass = isHuman ? 'is-human-ready' : isBot ? 'is-ai-bot' : 'is-empty-slot';
          const rawName = (slot.name || 'You').replace(/\s*\(Host\)\s*/i, '').trim();
          const titleText = isMe
            ? `${rawName} (${idx === 0 ? 'Host' : 'You'})`
            : isHuman
              ? `${slot.name} (Human P${idx + 1})`
              : isBot
                ? meta.defaultBotLabel
                : `Slot #${idx + 1} Open`;
          return `
            <div class="mp-lobby-slot-row ${isMe ? 'is-my-slot' : ''}" data-slot-index="${idx}">
              <div class="mp-lobby-slot-avatar" style="--slot-clr: ${meta.ringColor}">
                <img src="${portraitSrc}" alt="${titleText}" />
                <span class="mp-lobby-slot-num">P${idx + 1}</span>
              </div>
              <div class="mp-lobby-slot-info">
                <strong class="mp-lobby-slot-name">${titleText}</strong>
                <span class="mp-lobby-slot-sub">Supertree Starting Ring #${idx + 1}</span>
              </div>
              <span class="mp-lobby-slot-pill ${badgeClass}">${badgeText}</span>
            </div>
          `;
        })
        .join('');
    }
  }
  function openPartyWaitingLobby(roomCodeToOpen, isCreate = true) {
    clearCountdownTimers();
    const cleanCode = normalizeRoomCode(roomCodeToOpen || appState.multiplayerRoomCode);
    appState.multiplayerRoomCode = cleanCode;
    appState.isMultiplayerRoom = true;
    appState.multiplayerPhase = 'lobby';
    setGameMode('party');
    resetFullMatch();
    appState.isMultiplayerRoom = true;
    appState.multiplayerPhase = 'lobby';
    setScreenState('gameplay');
    getExplorersSys?.()?.alignExplorersOnStartingLine?.();
    frameCameraFor3DPartyLobby();
    appState.multiplayerClient?.createOrJoinRoom(
      cleanCode,
      isCreate ? 'You (Host)' : 'Explorer Guest',
      isCreate
    );
    document.getElementById('multiplayerCountdownBanner')?.classList.add('hidden');
    renderStep1AndStep2RoomDom();
    updateHudStandings?.();
    updateWorldLabels?.();
    showToast?.(`🌐 Party Lobby ${cleanCode} Open — Waiting on Supertree Grove Rings!`);
  }
  function startStep3CountdownSequence() {
    clearCountdownTimers();
    appState.isMultiplayerRoom = true;
    appState.multiplayerPhase = 'countdown';
    appState.isStartingCountdownActive = true;
    document.getElementById('multiplayerPartyLobbyCard')?.classList.add('hidden');
    const bannerEl = document.getElementById('multiplayerCountdownBanner');
    const digitEl = document.getElementById('mpCountdownDigit');
    const subEl = document.getElementById('mpCountdownSub');
    const roomTagEl = document.getElementById('mpCountdownRoomTag');
    if (roomTagEl) roomTagEl.textContent = `🌐 ROOM ${appState.multiplayerRoomCode} • SYNCHRONIZED START`;
    bannerEl?.classList.remove('hidden');
    const explorersSys = getExplorersSys?.();
    explorersSys?.alignExplorersOnStartingLine?.();
    explorersSys?.triggerJump?.('you', false);
    getLobby3DSys?.()?.triggerCountdownBoostPulse?.();
    frameCameraForStartingLineCountdown();
    const steps = [
      { digit: '3', sub: 'Locked on Supertree Grove Boost Rings...', urgent: false, hopId: 'kai' },
      { digit: '2', sub: '42 Singapore Relics Activated Across 5 Zones...', urgent: false, hopId: 'mei' },
      { digit: '1', sub: 'Get Ready to Sprint & Chope...', urgent: true, hopId: 'raj' }
    ];
    let idx = 0;
    const applyStep = (stepObj) => {
      if (digitEl) {
        digitEl.textContent = stepObj.digit;
        digitEl.setAttribute('data-digit', stepObj.digit);
      }
      if (subEl) subEl.textContent = stepObj.sub;
      SoundFX.playCountdownTick?.(stepObj.urgent);
      getLobby3DSys?.()?.triggerCountdownBoostPulse?.();
      if (stepObj.hopId) explorersSys?.triggerJump?.(stepObj.hopId, false);
    };
    applyStep(steps[0]);
    countdownIntervalId = setInterval(() => {
      idx += 1;
      if (idx < steps.length) applyStep(steps[idx]);
      else {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
    }, 1000);
  }
  function startSoloRaceCountdownSequence() {
    clearCountdownTimers();
    appState.isMultiplayerRoom = false;
    appState.multiplayerPhase = 'idle';
    appState.isStartingCountdownActive = true;
    appState.elapsedSeconds = 0;
    document.getElementById('multiplayerPartyLobbyCard')?.classList.add('hidden');
    const bannerEl = document.getElementById('multiplayerCountdownBanner');
    const digitEl = document.getElementById('mpCountdownDigit');
    const subEl = document.getElementById('mpCountdownSub');
    const roomTagEl = document.getElementById('mpCountdownRoomTag');
    if (roomTagEl) { roomTagEl.textContent = '🏆 3-MIN RACE VS. 3 BOTS • SUPERTREE STARTING LINE'; }
    bannerEl?.classList.remove('hidden');
    const explorersSys = getExplorersSys?.();
    explorersSys?.alignExplorersOnStartingLine?.();
    explorersSys?.triggerJump?.('you', false);
    getLobby3DSys?.()?.triggerCountdownBoostPulse?.();
    frameCameraForStartingLineCountdown();
    updateClockDigits?.();
    updateHudStandings?.();
    updateWorldLabels?.();
    const steps = [
      {
        digit: '3',
        sub: 'Engines Ready on Supertree Grove Boost Rings!',
        urgent: false,
        hopIds: ['you', 'kai']
      },
      {
        digit: '2',
        sub: '⚡ Kai, 📡 Mei & 🧭 Raj Targeting 42 Keepsakes!',
        urgent: false,
        hopIds: ['mei', 'raj']
      },
      {
        digit: '1',
        sub: 'Get Ready to Sprint & Chope!',
        urgent: true,
        hopIds: ['you', 'kai', 'mei', 'raj']
      }
    ];
    let idx = 0;
    const applyStep = (stepObj) => {
      if (digitEl) {
        digitEl.textContent = stepObj.digit;
        digitEl.setAttribute('data-digit', stepObj.digit);
      }
      if (subEl) subEl.textContent = stepObj.sub;
      SoundFX.playCountdownTick?.(stepObj.urgent);
      getLobby3DSys?.()?.triggerCountdownBoostPulse?.();
      if (Array.isArray(stepObj.hopIds)) { stepObj.hopIds.forEach((id) => explorersSys?.triggerJump?.(id, false)); }
    };
    applyStep(steps[0]);
    countdownIntervalId = setInterval(() => {
      idx += 1;
      if (idx < steps.length) {
        applyStep(steps[idx]);
      } else {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        handleRaceReleased({ isSolo: true });
      }
    }, 900);
  }
  function handleRaceReleased(opts = {}) {
    const isSolo = Boolean(opts?.isSolo) || !appState.isMultiplayerRoom;
    clearCountdownTimers();
    appState.isStartingCountdownActive = false;
    if (!isSolo) { appState.multiplayerPhase = 'racing'; }
    appState.elapsedSeconds = 0;
    const bannerEl = document.getElementById('multiplayerCountdownBanner');
    const digitEl = document.getElementById('mpCountdownDigit');
    const subEl = document.getElementById('mpCountdownSub');
    if (bannerEl && digitEl) {
      bannerEl.classList.remove('hidden');
      digitEl.textContent = 'GO!';
      digitEl.setAttribute('data-digit', 'GO');
      if (subEl) {
        subEl.textContent = isSolo
          ? '🚀 SPRINT & CHOPE 42 KEEPSAKES!'
          : '🌱 SPRINT & SNATCH 42 RELICS!';
      }
    }
    SoundFX.playGadgetActivate?.();
    const explorersSys = getExplorersSys?.();
    explorersSys?.activateGadget?.('you', 'turbo_boots', 1.6);
    getLobby3DSys?.()?.triggerCountdownBoostPulse?.();
    setCameraPreset?.('player_follow', false);
    updateClockDigits?.();
    updateHudStandings?.();
    updateWorldLabels?.();
    showToast?.(
      isSolo
        ? '🚀 GO! Sprint & Chope 42 Keepsakes before Kai, Mei & Raj!'
        : `🚀 GO! Race Live in Room ${appState.multiplayerRoomCode}!`
    );
    countdownHideTimerId = setTimeout(() => {
      document.getElementById('multiplayerCountdownBanner')?.classList.add('hidden');
    }, 950);
  }
  function triggerLocalAndNetworkEmote(emoteText) {
    const explorersSys = getExplorersSys?.();
    explorersSys?.triggerExplorerEmote?.('you', emoteText);
    explorersSys?.triggerJump?.('you', false);
    SoundFX.playJump?.(false);
    appState.multiplayerClient?.sendEmote?.(emoteText);
    updateWorldLabels?.();
  }
  function bindMultiplayerDomEvents() {
    window.__gbbOpenPartyWaitingLobby = openPartyWaitingLobby;
    window.__gbbStartSoloRaceCountdown = startSoloRaceCountdownSequence;
    window.__gbbCancelCountdown = cancelActiveCountdown;
    window.__gbbRenderMultiplayerRoomDom = () => renderStep1AndStep2RoomDom();
    window.__gbbTriggerMultiplayerEmote = triggerLocalAndNetworkEmote;
    window.__gbbOnMultiplayerRoomUpdated = (room, mySlotIdx) => {
      renderStep1AndStep2RoomDom(room, mySlotIdx);
      if (appState.screen === 'gameplay' && room?.phase === 'lobby') { getExplorersSys?.()?.alignExplorersOnStartingLine?.(); }
    };
    window.__gbbOnMultiplayerCountdownStarted = (room) => startStep3CountdownSequence(room);
    window.__gbbOnMultiplayerRaceStarted = () => handleRaceReleased();
    document.getElementById('btnMpRegenCode')?.addEventListener('click', () => {
      const nextCode = generateClientRoomCode();
      appState.multiplayerRoomCode = nextCode;
      setGameMode('party');
      appState.multiplayerClient?.createOrJoinRoom(nextCode, 'You (Host)', true);
      renderStep1AndStep2RoomDom();
      showToast?.(`🎲 New Party Room Code: ${nextCode}`);
    });
    document.getElementById('btnMpCopyInvite')?.addEventListener('click', () => copyRoomInviteLink(appState.multiplayerRoomCode));
    document.getElementById('btnMpLobbyCopyInvite')?.addEventListener('click', () => copyRoomInviteLink(appState.multiplayerRoomCode));
    document.getElementById('btnMpJoinRoom')?.addEventListener('click', () => {
      const inputEl = document.getElementById('mpJoinRoomInput');
      openPartyWaitingLobby(normalizeRoomCode(inputEl?.value || appState.multiplayerRoomCode), false);
    });
    document.getElementById('btnMpToggleAiBackfill')?.addEventListener('click', () => {
      appState.multiplayerAiBackfill = !appState.multiplayerAiBackfill;
      appState.multiplayerClient?.setAiBackfill?.(appState.multiplayerAiBackfill);
      renderStep1AndStep2RoomDom();
      showToast?.(appState.multiplayerAiBackfill ? '🤖 AI Bot Backfill: ON' : '🧑 Humans Only Mode: AI Backfill OFF');
    });
    document.getElementById('btnMpStartCountdown')?.addEventListener('click', () => {
      appState.multiplayerClient?.startSynchronizedCountdown?.();
    });
    document.getElementById('btnMpLobbyLeave')?.addEventListener('click', () => {
      clearCountdownTimers();
      appState.multiplayerClient?.leaveRoom?.();
      appState.isMultiplayerRoom = false;
      appState.multiplayerPhase = 'idle';
      document.getElementById('multiplayerPartyLobbyCard')?.classList.add('hidden');
      document.getElementById('multiplayerCountdownBanner')?.classList.add('hidden');
      setGameMode('race');
      setScreenState('title');
    });
    document.querySelectorAll('[data-mp-emote]').forEach((btn) => {
      btn.addEventListener('click', () => triggerLocalAndNetworkEmote(btn.dataset.mpEmote || '👋 Hi!'));
    });
    if (appState.isMultiplayerRoom) setGameMode('party');
    renderStep1AndStep2RoomDom();
  }
  return {
    openPartyWaitingLobby,
    startStep3CountdownSequence,
    startSoloRaceCountdownSequence,
    cancelActiveCountdown,
    handleRaceReleased,
    triggerLocalAndNetworkEmote,
    renderStep1AndStep2RoomDom,
    copyRoomInviteLink,
    bindMultiplayerDomEvents
  };
}
