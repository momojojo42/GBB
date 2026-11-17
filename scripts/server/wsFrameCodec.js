// ============================================================================
// Gardens by the Bay — RFC 6455 WebSocket Frame Codec & Room Code Helpers
// (scripts/server/wsFrameCodec.js)
// ============================================================================

export const WS_MAGIC_GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
export const WS_PATH = '/ws-multiplayer';

export const SLOT_DEFAULTS = [
  { slotIndex: 0, botId: 'you', botName: 'Explorer P1', aiName: 'You (AI)', colorHex: '#38BDF8', spawnX: -2.4, spawnZ: 2.5 },
  { slotIndex: 1, botId: 'mei', botName: 'Explorer P2', aiName: 'Mei (AI)', colorHex: '#34D399', spawnX: -0.8, spawnZ: 2.5 },
  { slotIndex: 2, botId: 'raj', botName: 'Explorer P3', aiName: 'Raj (AI)', colorHex: '#FBBF24', spawnX: 0.8, spawnZ: 2.5 },
  { slotIndex: 3, botId: 'kai', botName: 'Explorer P4', aiName: 'Kai (AI)', colorHex: '#FB7185', spawnX: 2.4, spawnZ: 2.5 }
];

export function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let suffix = '';
  for (let i = 0; i < 3; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `GBB-${suffix}`;
}

export function normalizeRoomCode(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleaned.startsWith('GBB') && cleaned.length >= 6) {
    return `GBB-${cleaned.slice(3, 6)}`;
  }
  if (cleaned.length === 3) {
    return `GBB-${cleaned}`;
  }
  return `GBB-${cleaned.slice(0, 3).padEnd(3, '8')}`;
}

export function encodeWsTextFrame(obj) {
  const json = typeof obj === 'string' ? obj : JSON.stringify(obj);
  const payload = Buffer.from(json, 'utf8');
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text frame
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }
  return Buffer.concat([header, payload]);
}

export function decodeWsFrames(buffer, onFrame) {
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const firstByte = buffer[offset];
    const secondByte = buffer[offset + 1];
    const opcode = firstByte & 0x0f;
    const isMasked = (secondByte & 0x80) !== 0;
    let payloadLen = secondByte & 0x7f;
    let headerLen = 2;

    if (payloadLen === 126) {
      if (offset + 4 > buffer.length) break;
      payloadLen = buffer.readUInt16BE(offset + 2);
      headerLen = 4;
    } else if (payloadLen === 127) {
      if (offset + 10 > buffer.length) break;
      payloadLen = Number(buffer.readBigUInt64BE(offset + 2));
      headerLen = 10;
    }

    const maskLen = isMasked ? 4 : 0;
    const totalFrameLen = headerLen + maskLen + payloadLen;
    if (offset + totalFrameLen > buffer.length) break;

    const payloadStart = offset + headerLen + maskLen;
    const payload = Buffer.from(buffer.subarray(payloadStart, payloadStart + payloadLen));

    if (isMasked) {
      const maskStart = offset + headerLen;
      for (let i = 0; i < payloadLen; i++) {
        payload[i] ^= buffer[maskStart + (i & 3)];
      }
    }

    onFrame(opcode, payload);
    offset += totalFrameLen;
  }
  return buffer.subarray(offset);
}

export function createEmptyRoom(roomCode, hostClientId, aiBackfill = true, botDifficulty = 'normal') {
  const slots = SLOT_DEFAULTS.map((def) => ({
    slotIndex: def.slotIndex,
    botId: def.botId,
    colorHex: def.colorHex,
    spawnX: def.spawnX,
    spawnZ: def.spawnZ,
    occupiedBy: aiBackfill ? 'bot' : 'empty',
    clientId: null,
    sessionToken: null,
    playerName: aiBackfill ? def.aiName : 'Open Slot',
    ready: true,
    pingMs: aiBackfill ? 0 : 18,
    x: def.spawnX,
    y: 0,
    z: def.spawnZ,
    vx: 0,
    vz: 0,
    yaw: Math.PI,
    isMoving: false,
    score: 0,
    relicCount: 0,
    activeGadget: null,
    emoteText: null,
    emoteAt: 0
  }));

  return {
    roomCode,
    hostClientId,
    aiBackfill: Boolean(aiBackfill),
    botDifficulty: botDifficulty || 'normal',
    phase: 'lobby', // 'lobby' | 'countdown' | 'racing' | 'finished'
    countdownStartAt: 0,
    matchStartAt: 0,
    slots,
    claimedRelics: new Map(),
    countdownTimer: null
  };
}

export function serializeRoomState(room) {
  return {
    roomCode: room.roomCode,
    hostClientId: room.hostClientId,
    aiBackfill: room.aiBackfill,
    botDifficulty: room.botDifficulty,
    phase: room.phase,
    countdownStartAt: room.countdownStartAt,
    matchStartAt: room.matchStartAt,
    serverNow: Date.now(),
    slots: room.slots.map((s) => ({
      slotIndex: s.slotIndex,
      botId: s.botId,
      colorHex: s.colorHex,
      spawnX: s.spawnX,
      spawnZ: s.spawnZ,
      occupiedBy: s.occupiedBy,
      clientId: s.clientId,
      name: s.playerName,
      playerName: s.playerName,
      ready: s.ready,
      pingMs: s.pingMs,
      x: s.x,
      y: s.y,
      z: s.z,
      vx: s.vx,
      vz: s.vz,
      yaw: s.yaw,
      isMoving: s.isMoving,
      score: s.score,
      relicCount: s.relicCount,
      activeGadget: s.activeGadget,
      emoteText: s.emoteText
    })),
    claimedRelics: Array.from(room.claimedRelics.values())
  };
}
