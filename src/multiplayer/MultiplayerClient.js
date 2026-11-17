// ============================================================================
// Gardens by the Bay — Dual-Transport Same-Room Multiplayer Client (v3.2)
// (src/multiplayer/MultiplayerClient.js)
// ============================================================================

import {
  getOrCreateSessionToken,
  generateRandomRoomCode,
  normalizeRoomCodeInput,
  createPreallocatedTransformPacket,
  populateOutgoingTransformPacket,
  createLocalFallbackRoom,
  mapSlotIndexToExplorerId,
  mapExplorerIdToSlotIndex
} from './MultiplayerProtocolHelpers.js';

export { generateRandomRoomCode, normalizeRoomCodeInput };

export function createMultiplayerClient({
  appState,
  interpolator,
  onRoomStateUpdated,
  onCountdownStarted,
  onRaceStarted,
  onRemoteRelicLocked,
  onRelicChopedAlert,
  onRemoteEmote,
  onRemotePickpocket
}) {
  const sessionToken = getOrCreateSessionToken();
  let ws = null;
  let wsConnected = false;
  let bc = null;
  let myClientId = sessionToken;
  let mySlotIndex = 0;
  let activeRoomCode = appState.multiplayerRoomCode || generateRandomRoomCode();
  let emitAccumulator = 0;
  let pingTimer = null;
  let lastPingSentAt = 0;
  let localRttMs = 16;

  const outgoingTransformMsg = createPreallocatedTransformPacket();
  let roomState = createLocalFallbackRoom(activeRoomCode, myClientId, appState.playerName || 'You (Host)', true, 'normal');

  const slotIndexToExplorerId = (slotIndex) => mapSlotIndexToExplorerId(slotIndex, mySlotIndex);
  const explorerIdToSlotIndex = (explorerId) => mapExplorerIdToSlotIndex(explorerId, mySlotIndex);
  const isHost = () => !roomState.hostClientId || roomState.hostClientId === myClientId || mySlotIndex === 0;

  function syncAppStateWithRoom() {
    appState.multiplayerRoomCode = activeRoomCode;
    appState.multiplayerSlotIndex = mySlotIndex;
    appState.multiplayerPhase = roomState.phase;
    appState.multiplayerAiBackfill = roomState.aiBackfill;
    appState.multiplayerHost = isHost();
    appState.multiplayerSlots = roomState.slots;
    appState.multiplayerHumanCount = roomState.slots.filter((s) => s.occupiedBy === 'human').length;
  }

  function sendPacket(msg) {
    if (ws && wsConnected && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(JSON.stringify(msg));
        return true;
      } catch (_) {}
    }
    if (bc) {
      try {
        bc.postMessage({ ...msg, _senderClientId: myClientId, _senderSlotIndex: mySlotIndex });
      } catch (_) {}
    }
    return false;
  }

  function handleIncomingPacket(msg) {
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'PONG_CHECK') {
      if (typeof msg.clientSentAt === 'number') {
        localRttMs = Math.max(2, Math.round(performance.now() - msg.clientSentAt));
        appState.multiplayerPingMs = localRttMs;
      }
      return;
    }

    if (msg.type === 'JOINED_ROOM') {
      myClientId = msg.clientId || myClientId;
      mySlotIndex = typeof msg.slotIndex === 'number' ? msg.slotIndex : 0;
      if (msg.room) {
        roomState = msg.room;
        activeRoomCode = roomState.roomCode;
      }
      syncAppStateWithRoom();
      interpolator?.pushWorldSnapshot(roomState.slots);
      onRoomStateUpdated?.(roomState, mySlotIndex);
      return;
    }

    if (msg.type === 'ROOM_STATE') {
      if (msg.room && msg.room.roomCode === activeRoomCode) {
        roomState = msg.room;
        const mySlot = roomState.slots.find((s) => s.clientId === myClientId);
        if (mySlot) mySlotIndex = mySlot.slotIndex;
        syncAppStateWithRoom();
        interpolator?.pushWorldSnapshot(roomState.slots);
        onRoomStateUpdated?.(roomState, mySlotIndex);
      }
      return;
    }

    if (msg.type === 'WORLD_SNAPSHOT') {
      if (msg.roomCode && msg.roomCode !== activeRoomCode) return;
      if (Array.isArray(msg.slots)) {
        for (let i = 0; i < msg.slots.length; i++) {
          const snap = msg.slots[i];
          if (roomState.slots[snap.slotIndex]) {
            Object.assign(roomState.slots[snap.slotIndex], snap);
          }
        }
        interpolator?.pushWorldSnapshot(msg.slots);
      }
      return;
    }

    if (msg.type === 'COUNTDOWN_STARTED') {
      if (msg.room) roomState = msg.room;
      roomState.phase = 'countdown';
      syncAppStateWithRoom();
      interpolator?.resetAllBuffers();
      interpolator?.pushWorldSnapshot(roomState.slots);
      onCountdownStarted?.(roomState, mySlotIndex);
      return;
    }

    if (msg.type === 'RACE_STARTED') {
      if (msg.room) roomState = msg.room;
      roomState.phase = 'racing';
      syncAppStateWithRoom();
      onRaceStarted?.(roomState, mySlotIndex);
      return;
    }

    if (msg.type === 'RELIC_LOCKED') {
      onRemoteRelicLocked?.({
        relicId: Number(msg.relicId),
        slotIndex: Number(msg.slotIndex),
        explorerId: slotIndexToExplorerId(Number(msg.slotIndex)),
        collectorName: msg.collectorName,
        points: Number(msg.points || 100)
      });
      return;
    }

    if (msg.type === 'RELIC_CHOPED') {
      onRelicChopedAlert?.({
        relicId: Number(msg.relicId),
        ownerSlotIndex: Number(msg.ownerSlotIndex),
        ownerName: msg.ownerName || 'Rival Explorer'
      });
      return;
    }

    if (msg.type === 'PLAYER_EMOTE') {
      const slotIdx = Number(msg.slotIndex);
      if (roomState.slots[slotIdx]) {
        roomState.slots[slotIdx].emoteText = msg.emoteText;
      }
      onRemoteEmote?.({
        slotIndex: slotIdx,
        explorerId: slotIndexToExplorerId(slotIdx),
        playerName: msg.playerName,
        emoteText: msg.emoteText
      });
      return;
    }

    if (msg.type === 'PICKPOCKET_EVENT') {
      onRemotePickpocket?.({
        attackerSlotIndex: Number(msg.attackerSlotIndex),
        victimSlotIndex: Number(msg.victimSlotIndex),
        attackerExplorerId: slotIndexToExplorerId(Number(msg.attackerSlotIndex)),
        victimExplorerId: slotIndexToExplorerId(Number(msg.victimSlotIndex)),
        points: Number(msg.points || 150),
        stolenRelicId: msg.stolenRelicId
      });
    }
  }

  function ensureConnected() {
    if (!bc && typeof BroadcastChannel !== 'undefined') {
      try {
        bc = new BroadcastChannel('gbb-multiplayer-v32');
        bc.onmessage = (ev) => {
          const data = ev.data;
          if (!data || data._senderClientId === myClientId) return;
          if (data.type === 'PLAYER_TRANSFORM' && data.roomCode === activeRoomCode) {
            interpolator?.pushSlotSnapshot(data);
          } else {
            handleIncomingPacket(data);
          }
        };
      } catch (_) {}
    }

    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/ws-multiplayer`);
      ws.onopen = () => {
        wsConnected = true;
        appState.multiplayerTransport = 'websocket';
        if (appState.isMultiplayerRoom) {
          sendPacket({
            type: 'JOIN_ROOM',
            roomCode: activeRoomCode,
            playerName: appState.playerName || `Explorer P${mySlotIndex + 1}`,
            sessionToken
          });
        }
        if (pingTimer) clearInterval(pingTimer);
        pingTimer = setInterval(() => {
          lastPingSentAt = performance.now();
          sendPacket({ type: 'PING_CHECK', clientSentAt: lastPingSentAt, rttMs: localRttMs });
        }, 2500);
      };
      ws.onmessage = (ev) => {
        try {
          handleIncomingPacket(JSON.parse(ev.data));
        } catch (_) {}
      };
      ws.onclose = () => {
        wsConnected = false;
        appState.multiplayerTransport = 'broadcast-channel';
      };
      ws.onerror = () => {
        wsConnected = false;
      };
    } catch (_) {
      wsConnected = false;
    }
  }

  function createOrJoinRoom(arg1 = {}, arg2 = null, arg3 = false) {
    const opts =
      typeof arg1 === 'string'
        ? { roomCode: arg1, playerName: arg2, isCreate: Boolean(arg3) }
        : arg1 || {};
    const {
      roomCode,
      playerName,
      aiBackfill = appState.multiplayerAiBackfill ?? true,
      botDifficulty = appState.botDifficulty || 'normal',
      isCreate = false
    } = opts;
    const cleanCode = normalizeRoomCodeInput(roomCode) || activeRoomCode || generateRandomRoomCode();
    activeRoomCode = cleanCode;
    appState.isMultiplayerRoom = true;
    if (playerName) appState.playerName = playerName;

    roomState = createLocalFallbackRoom(cleanCode, myClientId, appState.playerName || 'You (Host)', aiBackfill, botDifficulty);
    syncAppStateWithRoom();
    ensureConnected();

    sendPacket({
      type: isCreate ? 'CREATE_ROOM' : 'JOIN_ROOM',
      roomCode: cleanCode,
      preferredCode: cleanCode,
      playerName: appState.playerName || 'You (Host)',
      aiBackfill,
      botDifficulty,
      sessionToken
    });

    onRoomStateUpdated?.(roomState, mySlotIndex);
    return roomState;
  }

  function setLobbyConfig({ aiBackfill, botDifficulty, ready, playerName } = {}) {
    if (typeof aiBackfill === 'boolean') {
      roomState.aiBackfill = aiBackfill;
      for (const s of roomState.slots) {
        if (s.occupiedBy !== 'human') {
          s.occupiedBy = aiBackfill ? 'bot' : 'empty';
        }
      }
    }
    if (botDifficulty) roomState.botDifficulty = botDifficulty;
    if (playerName) appState.playerName = playerName;
    syncAppStateWithRoom();
    sendPacket({
      type: 'SET_LOBBY_CONFIG',
      roomCode: activeRoomCode,
      aiBackfill,
      botDifficulty,
      ready,
      playerName
    });
    onRoomStateUpdated?.(roomState, mySlotIndex);
  }

  function setAiBackfill(aiBackfill) {
    setLobbyConfig({ aiBackfill: Boolean(aiBackfill) });
  }

  function leaveRoom() {
    sendPacket({ type: 'LEAVE_ROOM', roomCode: activeRoomCode });
    appState.isMultiplayerRoom = false;
    appState.multiplayerPhase = 'idle';
  }

  function sendEmote(emoteText = '👋 Ready lah!') {
    if (roomState.slots[mySlotIndex]) roomState.slots[mySlotIndex].emoteText = emoteText;
    sendPacket({ type: 'SEND_EMOTE', roomCode: activeRoomCode, slotIndex: mySlotIndex, emoteText });
    onRemoteEmote?.({ slotIndex: mySlotIndex, explorerId: 'you', playerName: appState.playerName || 'You', emoteText });
  }

  function startCountdown() {
    roomState.phase = 'countdown';
    roomState.countdownStartAt = Date.now();
    roomState.matchStartAt = roomState.countdownStartAt + 3000;
    syncAppStateWithRoom();
    if (!sendPacket({ type: 'START_COUNTDOWN', roomCode: activeRoomCode })) {
      onCountdownStarted?.(roomState, mySlotIndex);
      setTimeout(() => {
        roomState.phase = 'racing';
        roomState.matchStartAt = Date.now();
        syncAppStateWithRoom();
        onRaceStarted?.(roomState, mySlotIndex);
      }, 3000);
    }
  }

  function emitLocalTransform(dt, standings) {
    if (!appState.isMultiplayerRoom) return;
    emitAccumulator += dt;
    if (emitAccumulator < 0.05) return; // 20 Hz (50ms)
    emitAccumulator = 0;

    if (populateOutgoingTransformPacket(outgoingTransformMsg, activeRoomCode, mySlotIndex, standings, isHost())) {
      sendPacket(outgoingTransformMsg);
    }
  }

  function claimRelic({ relicId, collectorExplorerId = 'you', points = 100, collectorName = '' }) {
    if (!appState.isMultiplayerRoom) return;
    sendPacket({
      type: 'CLAIM_RELIC',
      roomCode: activeRoomCode,
      relicId,
      slotIndex: explorerIdToSlotIndex(collectorExplorerId),
      points,
      collectorName
    });
  }

  return {
    ensureConnected,
    createOrJoinRoom,
    setLobbyConfig,
    setAiBackfill,
    leaveRoom,
    sendEmote,
    startCountdown,
    startSynchronizedCountdown: startCountdown,
    emitLocalTransform,
    claimRelic,
    slotIndexToExplorerId,
    explorerIdToSlotIndex,
    getRoomState: () => roomState,
    getRoomCode: () => activeRoomCode,
    getMySlotIndex: () => mySlotIndex,
    isHost
  };
}
