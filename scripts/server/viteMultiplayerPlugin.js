// ============================================================================
// Gardens by the Bay — Authoritative Same-Room Multiplayer WebSocket Server
// (scripts/server/viteMultiplayerPlugin.js)
// ============================================================================

import crypto from 'node:crypto';
import {
  WS_MAGIC_GUID,
  WS_PATH,
  SLOT_DEFAULTS,
  generateRoomCode,
  normalizeRoomCode,
  encodeWsTextFrame,
  decodeWsFrames,
  createEmptyRoom,
  serializeRoomState
} from './wsFrameCodec.js';

export function viteMultiplayerPlugin() {
  const rooms = new Map();
  const clients = new Map();

  function sendToClient(client, msg) {
    if (!client || client.socket.destroyed || !client.socket.writable) return;
    try {
      client.socket.write(encodeWsTextFrame(msg));
    } catch (_) {}
  }

  function broadcastToRoom(room, msg, excludeClientId = null) {
    const frame = encodeWsTextFrame(msg);
    for (const slot of room.slots) {
      if (slot.occupiedBy === 'human' && slot.clientId && slot.clientId !== excludeClientId) {
        const c = clients.get(slot.clientId);
        if (c && !c.socket.destroyed && c.socket.writable) {
          try {
            c.socket.write(frame);
          } catch (_) {}
        }
      }
    }
  }

  function assignClientToRoom(client, room, playerName, sessionToken) {
    let targetSlot = room.slots.find(
      (s) => (sessionToken && s.sessionToken === sessionToken) || s.clientId === client.id
    );
    if (!targetSlot) {
      targetSlot = room.slots.find((s) => s.occupiedBy !== 'human');
    }
    if (!targetSlot) {
      sendToClient(client, { type: 'ROOM_ERROR', message: `Room ${room.roomCode} is full (4/4 explorers).` });
      return null;
    }

    const def = SLOT_DEFAULTS[targetSlot.slotIndex];
    targetSlot.occupiedBy = 'human';
    targetSlot.clientId = client.id;
    targetSlot.sessionToken = sessionToken || client.id;
    targetSlot.playerName = playerName || `${def.botName} (P${targetSlot.slotIndex + 1})`;
    targetSlot.ready = true;
    targetSlot.pingMs = client.pingMs || 16;

    client.roomCode = room.roomCode;
    client.slotIndex = targetSlot.slotIndex;
    client.sessionToken = targetSlot.sessionToken;

    if (!room.hostClientId || !room.slots.some((s) => s.occupiedBy === 'human' && s.clientId === room.hostClientId)) {
      room.hostClientId = client.id;
    }
    return targetSlot;
  }

  function removeClientFromRoom(client) {
    if (!client.roomCode) return;
    const room = rooms.get(client.roomCode);
    client.roomCode = null;
    if (!room) return;

    for (const slot of room.slots) {
      if (slot.clientId === client.id) {
        const def = SLOT_DEFAULTS[slot.slotIndex];
        slot.occupiedBy = room.aiBackfill ? 'bot' : 'empty';
        slot.clientId = null;
        slot.playerName = room.aiBackfill ? def.aiName : 'Open Slot';
        slot.ready = true;
        slot.pingMs = 0;
      }
    }

    const remainingHumans = room.slots.filter((s) => s.occupiedBy === 'human' && s.clientId);
    if (remainingHumans.length === 0) {
      if (room.countdownTimer) clearTimeout(room.countdownTimer);
      rooms.delete(room.roomCode);
      return;
    }

    if (!remainingHumans.some((s) => s.clientId === room.hostClientId)) {
      room.hostClientId = remainingHumans[0].clientId;
    }
    broadcastToRoom(room, { type: 'ROOM_STATE', room: serializeRoomState(room) });
  }

  function handleClientMessage(client, msg) {
    if (!msg || typeof msg.type !== 'string') return;

    if (msg.type === 'PING_CHECK') {
      if (typeof msg.rttMs === 'number' && msg.rttMs >= 0) {
        client.pingMs = Math.min(999, Math.max(1, Math.round(msg.rttMs)));
        const room = client.roomCode ? rooms.get(client.roomCode) : null;
        const slot = room?.slots[client.slotIndex];
        if (slot && slot.clientId === client.id) slot.pingMs = client.pingMs;
      }
      sendToClient(client, { type: 'PONG_CHECK', clientSentAt: msg.clientSentAt, serverNow: Date.now() });
      return;
    }

    if (msg.type === 'CREATE_ROOM' || msg.type === 'JOIN_ROOM') {
      if (client.roomCode) removeClientFromRoom(client);
      let code = normalizeRoomCode(msg.roomCode || msg.preferredCode);
      if (!code || (msg.type === 'CREATE_ROOM' && rooms.has(code) && !msg.preferredCode)) {
        code = generateRoomCode();
      }
      let room = rooms.get(code);
      if (!room) {
        room = createEmptyRoom(code, client.id, msg.aiBackfill ?? true, msg.botDifficulty || 'normal');
        rooms.set(code, room);
      }
      const slot = assignClientToRoom(client, room, msg.playerName, msg.sessionToken);
      if (!slot) return;

      sendToClient(client, {
        type: 'JOINED_ROOM',
        slotIndex: slot.slotIndex,
        clientId: client.id,
        sessionToken: slot.sessionToken,
        room: serializeRoomState(room)
      });
      broadcastToRoom(room, { type: 'ROOM_STATE', room: serializeRoomState(room) });
      return;
    }

    if (msg.type === 'LEAVE_ROOM') {
      removeClientFromRoom(client);
      return;
    }

    const room = client.roomCode ? rooms.get(client.roomCode) : null;
    if (!room) return;

    if (msg.type === 'SET_LOBBY_CONFIG') {
      if (typeof msg.aiBackfill === 'boolean') {
        room.aiBackfill = msg.aiBackfill;
        for (const s of room.slots) {
          if (s.occupiedBy !== 'human') {
            const def = SLOT_DEFAULTS[s.slotIndex];
            s.occupiedBy = room.aiBackfill ? 'bot' : 'empty';
            s.playerName = room.aiBackfill ? def.aiName : 'Open Slot';
          }
        }
      }
      if (msg.botDifficulty) room.botDifficulty = msg.botDifficulty;
      const mySlot = room.slots[client.slotIndex];
      if (mySlot && mySlot.clientId === client.id) {
        if (typeof msg.ready === 'boolean') mySlot.ready = msg.ready;
        if (typeof msg.playerName === 'string' && msg.playerName.trim()) {
          mySlot.playerName = msg.playerName.trim().slice(0, 18);
        }
      }
      broadcastToRoom(room, { type: 'ROOM_STATE', room: serializeRoomState(room) });
      return;
    }

    if (msg.type === 'SEND_EMOTE') {
      const mySlot = room.slots[client.slotIndex];
      if (mySlot) {
        mySlot.emoteText = String(msg.emoteText || '👋 Hello!');
        mySlot.emoteAt = Date.now();
        broadcastToRoom(room, {
          type: 'PLAYER_EMOTE',
          slotIndex: mySlot.slotIndex,
          playerName: mySlot.playerName,
          emoteText: mySlot.emoteText,
          serverNow: Date.now()
        });
      }
      return;
    }

    if (msg.type === 'START_COUNTDOWN') {
      if (room.countdownTimer) clearTimeout(room.countdownTimer);
      room.phase = 'countdown';
      room.countdownStartAt = Date.now();
      room.matchStartAt = room.countdownStartAt + 3000;
      room.claimedRelics.clear();

      for (const s of room.slots) {
        const def = SLOT_DEFAULTS[s.slotIndex];
        s.x = def.spawnX;
        s.y = 0;
        s.z = def.spawnZ;
        s.vx = 0;
        s.vz = 0;
        s.yaw = Math.PI;
        s.isMoving = false;
        s.score = 0;
        s.relicCount = 0;
        s.activeGadget = null;
      }

      broadcastToRoom(room, {
        type: 'COUNTDOWN_STARTED',
        countdownStartAt: room.countdownStartAt,
        matchStartAt: room.matchStartAt,
        serverNow: Date.now(),
        room: serializeRoomState(room)
      });

      room.countdownTimer = setTimeout(() => {
        room.phase = 'racing';
        room.matchStartAt = Date.now();
        broadcastToRoom(room, {
          type: 'RACE_STARTED',
          matchStartAt: room.matchStartAt,
          serverNow: Date.now(),
          room: serializeRoomState(room)
        });
      }, 3000);
      return;
    }

    if (msg.type === 'PLAYER_TRANSFORM') {
      const s = room.slots[client.slotIndex];
      if (s && s.clientId === client.id) {
        if (typeof msg.x === 'number') s.x = msg.x;
        if (typeof msg.y === 'number') s.y = msg.y;
        if (typeof msg.z === 'number') s.z = msg.z;
        if (typeof msg.vx === 'number') s.vx = msg.vx;
        if (typeof msg.vz === 'number') s.vz = msg.vz;
        if (typeof msg.yaw === 'number') s.yaw = msg.yaw;
        s.isMoving = Boolean(msg.isMoving);
        if (typeof msg.score === 'number') s.score = msg.score;
        if (typeof msg.relicCount === 'number') s.relicCount = msg.relicCount;
        if (msg.activeGadget !== undefined) s.activeGadget = msg.activeGadget;
      }
      if (client.id === room.hostClientId && Array.isArray(msg.botSnapshots)) {
        for (const bSnap of msg.botSnapshots) {
          const bSlot = room.slots[bSnap.slotIndex];
          if (bSlot && bSlot.occupiedBy === 'bot') {
            bSlot.x = Number(bSnap.x || 0);
            bSlot.y = Number(bSnap.y || 0);
            bSlot.z = Number(bSnap.z || 0);
            bSlot.vx = Number(bSnap.vx || 0);
            bSlot.vz = Number(bSnap.vz || 0);
            bSlot.yaw = Number(bSnap.yaw || 0);
            bSlot.isMoving = Boolean(bSnap.isMoving);
            if (typeof bSnap.score === 'number') bSlot.score = bSnap.score;
            if (typeof bSnap.relicCount === 'number') bSlot.relicCount = bSnap.relicCount;
          }
        }
      }
      return;
    }

    if (msg.type === 'CLAIM_RELIC') {
      const relicId = Number(msg.relicId);
      if (!relicId) return;
      const existing = room.claimedRelics.get(relicId);
      if (existing) {
        sendToClient(client, {
          type: 'RELIC_CHOPED',
          relicId,
          ownerSlotIndex: existing.slotIndex,
          ownerName: existing.collectorName
        });
        return;
      }
      const claimSlotIndex = typeof msg.slotIndex === 'number' ? msg.slotIndex : client.slotIndex;
      const slot = room.slots[claimSlotIndex] || room.slots[client.slotIndex];
      const pts = Number(msg.points || 100);
      const claimRecord = {
        relicId,
        slotIndex: slot.slotIndex,
        collectorName: msg.collectorName || slot.playerName,
        points: pts,
        claimedAt: Date.now()
      };
      room.claimedRelics.set(relicId, claimRecord);
      slot.score = (slot.score || 0) + pts;
      slot.relicCount = (slot.relicCount || 0) + 1;

      broadcastToRoom(room, {
        type: 'RELIC_LOCKED',
        ...claimRecord,
        slotScore: slot.score,
        slotRelicCount: slot.relicCount,
        totalClaimed: room.claimedRelics.size
      });
    }
  }

  function attachWebSocketServer(httpServer) {
    if (!httpServer || httpServer.__gbbWsAttached) return;
    httpServer.__gbbWsAttached = true;

    httpServer.on('upgrade', (req, socket) => {
      if ((req.url || '').split('?')[0] !== WS_PATH) return;
      const key = req.headers['sec-websocket-key'];
      if (!key) return socket.destroy();

      const accept = crypto.createHash('sha1').update(key + WS_MAGIC_GUID).digest('base64');
      socket.write(
        [
          'HTTP/1.1 101 Switching Protocols',
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Accept: ${accept}`,
          '\r\n'
        ].join('\r\n')
      );

      const clientId = `c_${crypto.randomBytes(5).toString('hex')}`;
      const client = { id: clientId, socket, roomCode: null, slotIndex: 0, pingMs: 14 };
      clients.set(clientId, client);

      let rxBuffer = Buffer.alloc(0);
      socket.on('data', (chunk) => {
        rxBuffer = Buffer.concat([rxBuffer, chunk]);
        rxBuffer = decodeWsFrames(rxBuffer, (opcode, payload) => {
          if (opcode === 0x08) socket.end();
          else if (opcode === 0x01) {
            try {
              handleClientMessage(client, JSON.parse(payload.toString('utf8')));
            } catch (_) {}
          }
        });
      });

      const cleanup = () => {
        if (clients.has(clientId)) {
          removeClientFromRoom(client);
          clients.delete(clientId);
        }
      };
      socket.on('close', cleanup);
      socket.on('error', cleanup);
    });

    setInterval(() => {
      const now = Date.now();
      for (const room of rooms.values()) {
        broadcastToRoom(room, {
          type: 'WORLD_SNAPSHOT',
          roomCode: room.roomCode,
          phase: room.phase,
          serverNow: now,
          slots: room.slots
        });
      }
    }, 50);
  }

  return {
    name: 'vite-gbb-multiplayer-ws',
    configureServer(server) {
      attachWebSocketServer(server.httpServer);
    },
    configurePreviewServer(previewServer) {
      attachWebSocketServer(previewServer.httpServer);
    }
  };
}
