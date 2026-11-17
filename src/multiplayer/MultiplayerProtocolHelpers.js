// ============================================================================
// Gardens by the Bay — Multiplayer Room Codes, Slot Mappers & Pre-Allocated Buffers
// (src/multiplayer/MultiplayerProtocolHelpers.js)
// ============================================================================

export const OTHER_EXPLORER_IDS = ['mei', 'raj', 'kai'];

export const DEFAULT_SLOTS = [
  { slotIndex: 0, botId: 'you', aiName: 'You (Host)', colorHex: '#38BDF8', spawnX: -2.4, spawnZ: 2.5 },
  { slotIndex: 1, botId: 'mei', aiName: 'Mei (AI)', colorHex: '#34D399', spawnX: -0.8, spawnZ: 2.5 },
  { slotIndex: 2, botId: 'raj', aiName: 'Raj (AI)', colorHex: '#FBBF24', spawnX: 0.8, spawnZ: 2.5 },
  { slotIndex: 3, botId: 'kai', aiName: 'Kai (AI)', colorHex: '#FB7185', spawnX: 2.4, spawnZ: 2.5 }
];

export function getOrCreateSessionToken() {
  try {
    let tok = sessionStorage.getItem('gbb_mp_session_token');
    if (!tok) {
      tok = `sess_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
      sessionStorage.setItem('gbb_mp_session_token', tok);
    }
    return tok;
  } catch (_) {
    return `sess_${Math.random().toString(36).slice(2, 10)}`;
  }
}

export function generateRandomRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let s = '';
  for (let i = 0; i < 3; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `GBB-${s}`;
}

export const generateClientRoomCode = generateRandomRoomCode;

export function normalizeRoomCodeInput(raw) {
  if (!raw || typeof raw !== 'string') return 'GBB-88A';
  const cleaned = raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return 'GBB-88A';
  if (cleaned.startsWith('GBB') && cleaned.length >= 6) return `GBB-${cleaned.slice(3, 6)}`;
  if (cleaned.length >= 3) return `GBB-${cleaned.slice(0, 3)}`;
  return `GBB-${cleaned.padEnd(3, '8')}`;
}

export const normalizeRoomCode = normalizeRoomCodeInput;

export function createPreallocatedTransformPacket() {
  return {
    type: 'PLAYER_TRANSFORM',
    roomCode: '',
    slotIndex: 0,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vz: 0,
    yaw: Math.PI,
    isMoving: false,
    score: 0,
    relicCount: 0,
    activeGadget: null,
    botSnapshots: [
      { slotIndex: 0, x: 0, y: 0, z: 0, vx: 0, vz: 0, yaw: 0, isMoving: false, score: 0, relicCount: 0 },
      { slotIndex: 1, x: 0, y: 0, z: 0, vx: 0, vz: 0, yaw: 0, isMoving: false, score: 0, relicCount: 0 },
      { slotIndex: 2, x: 0, y: 0, z: 0, vx: 0, vz: 0, yaw: 0, isMoving: false, score: 0, relicCount: 0 },
      { slotIndex: 3, x: 0, y: 0, z: 0, vx: 0, vz: 0, yaw: 0, isMoving: false, score: 0, relicCount: 0 }
    ]
  };
}

export function createLocalFallbackRoom(code, myClientId, playerName = 'You (Host)', aiBackfill = true, botDifficulty = 'normal') {
  return {
    roomCode: code,
    hostClientId: myClientId,
    aiBackfill,
    botDifficulty,
    phase: 'lobby',
    countdownStartAt: 0,
    matchStartAt: 0,
    slots: DEFAULT_SLOTS.map((d, idx) => ({
      slotIndex: idx,
      botId: d.botId,
      colorHex: d.colorHex,
      spawnX: d.spawnX,
      spawnZ: d.spawnZ,
      occupiedBy: idx === 0 ? 'human' : aiBackfill ? 'bot' : 'empty',
      clientId: idx === 0 ? myClientId : null,
      name: idx === 0 ? playerName : aiBackfill ? d.aiName : 'Open Slot',
      playerName: idx === 0 ? playerName : aiBackfill ? d.aiName : 'Open Slot',
      ready: true,
      pingMs: idx === 0 ? 14 : 0,
      x: d.spawnX,
      y: 0,
      z: d.spawnZ,
      vx: 0,
      vz: 0,
      yaw: Math.PI,
      isMoving: false,
      score: 0,
      relicCount: 0,
      activeGadget: null,
      emoteText: null
    })),
    claimedRelics: []
  };
}

export function mapSlotIndexToExplorerId(slotIndex, mySlotIndex) {
  if (slotIndex === mySlotIndex) return 'you';
  let otherIdx = 0;
  for (let s = 0; s < 4; s++) {
    if (s === mySlotIndex) continue;
    if (s === slotIndex) return OTHER_EXPLORER_IDS[otherIdx];
    otherIdx++;
  }
  return 'mei';
}

export function mapExplorerIdToSlotIndex(explorerId, mySlotIndex) {
  if (explorerId === 'you') return mySlotIndex;
  const targetOtherIdx = OTHER_EXPLORER_IDS.indexOf(explorerId);
  if (targetOtherIdx === -1) return 1;
  let otherIdx = 0;
  for (let s = 0; s < 4; s++) {
    if (s === mySlotIndex) continue;
    if (otherIdx === targetOtherIdx) return s;
    otherIdx++;
  }
  return 1;
}

export function populateOutgoingTransformPacket(packet, roomCode, mySlotIndex, standings, isHostFlag) {
  const you = standings.find((s) => s.id === 'you');
  if (!you) return false;

  packet.roomCode = roomCode;
  packet.slotIndex = mySlotIndex;
  packet.x = you.position.x;
  packet.y = you.position.y;
  packet.z = you.position.z;
  packet.vx = you.velocityX || 0;
  packet.vz = you.velocityZ || 0;
  packet.yaw = you.facingYaw || 0;
  packet.isMoving = Boolean(you.isMoving);
  packet.score = you.score || 0;
  packet.relicCount = you.relicCount || 0;
  packet.activeGadget = you.activeGadget || null;

  if (isHostFlag) {
    for (let s = 0; s < 4; s++) {
      const expId = mapSlotIndexToExplorerId(s, mySlotIndex);
      const comp = standings.find((c) => c.id === expId);
      const snap = packet.botSnapshots[s];
      snap.slotIndex = s;
      if (comp) {
        snap.x = comp.position.x;
        snap.y = comp.position.y;
        snap.z = comp.position.z;
        snap.vx = comp.velocityX || 0;
        snap.vz = comp.velocityZ || 0;
        snap.yaw = comp.facingYaw || 0;
        snap.isMoving = Boolean(comp.isMoving);
        snap.score = comp.score || 0;
        snap.relicCount = comp.relicCount || 0;
      }
    }
  }
  return true;
}
