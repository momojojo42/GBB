/**
 * Gardens by the Bay (Bay South) — Botanical Stamp Hunt MVP
 * Core Mechanics: Find Landmark on 3D Isometric Map -> Press Tactile Rubber Stamp Chop into Passport
 */

const LANDMARKS = [
  {
    id: 'supertree-grove',
    slot: '01',
    mapNum: '#6 & #7',
    name: 'Supertree Grove & OCBC Skyway',
    zone: 'Central Grove',
    icon: '🌳',
    x: 45.2,
    y: 36.8,
    radius: 7.5,
    inkColor: '#be123c',
    stampCode: 'STG-06',
    clue: 'Spot the towering central cluster of pink-and-purple vertical garden trees linked by a golden winding aerial walkway!',
    description: 'Twelve of the Gardens’ 18 iconic Supertrees stand here, rising up to 50 meters tall and connected by the 128-meter-long aerial OCBC Skyway.',
  },
  {
    id: 'flower-dome',
    slot: '02',
    mapNum: '#3',
    name: 'Flower Dome',
    zone: 'Waterfront Conservatories',
    icon: '🌺',
    x: 55.2,
    y: 20.6,
    radius: 6.5,
    inkColor: '#047857',
    stampCode: 'FLD-03',
    clue: 'Find the wider, shell-shaped blue glass conservatory dome along the northern waterfront promenade (left of the two twin glass biomes).',
    description: 'The largest glass greenhouse in the world replicates the cool-dry climate of Mediterranean and semi-arid regions across five continents.',
  },
  {
    id: 'cloud-forest',
    slot: '03',
    mapNum: '#4',
    name: 'Cloud Forest',
    zone: 'Waterfront Conservatories',
    icon: '🏔️',
    x: 66.2,
    y: 28.2,
    radius: 6.0,
    inkColor: '#0369a1',
    stampCode: 'CLF-04',
    clue: 'Locate the taller, steeper blue glass dome conservatory right next to the Flower Dome along the waterfront.',
    description: 'Home to one of the world’s tallest indoor waterfalls and a lush 35-meter mountain veiled in mist and rare cloud-forest orchids.',
  },
  {
    id: 'planet-baby',
    slot: '04',
    mapNum: '#19',
    name: 'Planet (Floating Baby Sculpture)',
    zone: 'West Lawn & Koi Pond',
    icon: '👶',
    x: 26.8,
    y: 49.5,
    radius: 5.5,
    inkColor: '#6d28d9',
    stampCode: 'PLN-19',
    clue: 'Look on the green lawn west of Supertree Grove (just past the blue canal) for a giant white sleeping baby sculpture!',
    description: 'Created by British sculptor Marc Quinn, this 9-meter-long, 7-tonne bronze-and-steel sculpture appears to float weightlessly on a single hand.',
  },
  {
    id: 'floral-clock',
    slot: '05',
    mapNum: '#5',
    name: 'Floral Clock',
    zone: 'Conservatory Plaza',
    icon: '🕰️',
    x: 58.0,
    y: 29.8,
    radius: 4.5,
    inkColor: '#b45309',
    stampCode: 'FLC-05',
    clue: 'Find the circular flower-patterned garden bed nestled right in the plaza between the two glass domes and the eastern Supertrees.',
    description: 'A living 7-meter botanical timepiece gifted by Audemars Piguet featuring vibrant seasonal tropical blooms and chimes.',
  },
  {
    id: 'childrens-garden',
    slot: '06',
    mapNum: '#23',
    name: "Far East Org. Children's Garden",
    zone: 'East Waterfront',
    icon: '⛲',
    x: 76.2,
    y: 39.2,
    radius: 5.5,
    inkColor: '#c2410c',
    stampCode: 'FEG-23',
    clue: 'Search the eastern side of the park for a circular blue splash pool topped with tall golden-orange fountain spires!',
    description: 'An interactive waterplay wonderland and rainforest treehouse trail with hydro-vault sensors that choreograph dancing water jets.',
  },
  {
    id: 'understorey-dome',
    slot: '07',
    mapNum: '#12',
    name: 'Understorey (World of Plants)',
    zone: 'Southern Forest Belt',
    icon: '🍄',
    x: 53.0,
    y: 52.8,
    radius: 5.2,
    inkColor: '#15803d',
    stampCode: 'UND-12',
    clue: 'Look south of Supertree Grove (just above the curved main highway) for a round brown wooden dome pavilion with a circular skylight on top!',
    description: 'Explores the intricate forest floor ecosystem where decomposers, ferns, and epiphytes recycle nutrients beneath the tropical canopy.',
  },
  {
    id: 'floral-fantasy',
    slot: '08',
    mapNum: '#26 & #33',
    name: 'Floral Fantasy & SG50 Lattice',
    zone: 'Bayfront Plaza (West)',
    icon: '🦋',
    x: 16.4,
    y: 43.2,
    radius: 5.5,
    inkColor: '#a21caf',
    stampCode: 'FLF-26',
    clue: 'Scan the far left (western) edge near Bayfront Plaza for a white woven lattice archway pavilion surrounded by small ponds!',
    description: 'Welcomes visitors arriving from Bayfront MRT with suspended floral artistry, cascading vivariums, and the geometric SG50 Lattice.',
  },
  {
    id: 'dragonfly-arch',
    slot: '09',
    mapNum: '#16',
    name: 'Dragonfly Lake & Chinese Garden Arch',
    zone: 'Heritage Gardens & Lake',
    icon: '🐉',
    x: 38.7,
    y: 28.8,
    radius: 5.0,
    inkColor: '#dc2626',
    stampCode: 'DFL-16',
    clue: 'Find the bright red-orange curved arch sitting along the eastern bank of the blue Dragonfly Lake canal (northwest of Supertree Grove)!',
    description: 'Overlooks Dragonfly Lake—a natural eco-filter lined with aquatic reeds—marking the gateway into the Heritage Gardens.',
  },
  {
    id: 'the-meadow',
    slot: '10',
    mapNum: '#20',
    name: 'The Meadow',
    zone: 'Southwest Amphitheatre',
    icon: '🎪',
    x: 26.5,
    y: 62.5,
    radius: 7.2,
    inkColor: '#0f766e',
    stampCode: 'MDW-20',
    clue: 'Spot the sweeping figure-eight green lawn bowl in the lower-left (southwest) corner of the Gardens!',
    description: 'Singapore’s largest outdoor garden festival bowl, capable of hosting 30,000 visitors framed by panoramic views of Marina Bay.',
  }
];

const STORAGE_KEY = 'gbb_stamp_hunt_mvp_v1';

// ==================== STATE ====================
const state = {
  stampedMap: {}, // { [landmarkId]: { timestamp, angle } }
  activeTargetId: LANDMARKS[0].id,
  modalLandmarkId: null,
  showDemoPins: false,
  hintedId: null,
  zoom: 1,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragMoved: false,
  startX: 0,
  startY: 0,
  elapsedSeconds: 0,
  timerInterval: null,
};

// ==================== WEB AUDIO SYNTHESIZER (NO EXTERNAL ASSETS NEEDED) ====================
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playDiscoveryPop() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.14);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playStampChop() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 1. Heavy Rubber Thud (Low punch)
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(150, now);
    thudOsc.frequency.exponentialRampToValueAtTime(38, now + 0.16);
    thudGain.gain.setValueAtTime(0.55, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    thudOsc.connect(thudGain).connect(this.ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.19);

    // 2. Crisp Paper Ink Snap (Short filtered noise burst)
    const bufferSize = this.ctx.sampleRate * 0.09;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.32, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
    noise.connect(filter).connect(noiseGain).connect(this.ctx.destination);
    noise.start(now);

    // 3. Bright Success Chime
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + 0.14 + idx * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.3);
    });
  }

  playRadarPing() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.35);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

const sfx = new SoundFX();

// ==================== CUSTOM SVG RUBBER STAMP GENERATOR ====================
function createStampChopSVG(landmark, stampMeta = {}, size = 148) {
  const angle = stampMeta.angle ?? -7;
  const dateStr = stampMeta.timestamp || '24 OCT 2026';
  const color = landmark.inkColor;
  const uid = `stamp-${landmark.id}-${Math.random().toString(36).slice(2, 7)}`;

  return `
    <svg viewBox="0 0 160 160" width="${size}" height="${size}" class="stamp-chop-svg" style="transform: rotate(${angle}deg);">
      <defs>
        <path id="topArc-${uid}" d="M 24,80 A 56,56 0 1,1 136,80" />
        <path id="botArc-${uid}" d="M 136,80 A 56,56 0 1,1 24,80" />
      </defs>
      <!-- Outer Double Rubber Ring -->
      <circle cx="80" cy="80" r="72" fill="none" stroke="${color}" stroke-width="4.5" stroke-dasharray="14 2 28 3 45 2" />
      <circle cx="80" cy="80" r="65" fill="${color}" fill-opacity="0.07" stroke="${color}" stroke-width="1.8" />
      <circle cx="80" cy="80" r="44" fill="none" stroke="${color}" stroke-width="2" stroke-dasharray="6 3" />

      <!-- Circular Text -->
      <text fill="${color}" font-family="'Space Mono', monospace" font-size="9.5" font-weight="700" letter-spacing="1.6">
        <textPath href="#topArc-${uid}" startOffset="50%" text-anchor="middle">
          GARDENS BY THE BAY
        </textPath>
      </text>
      <text fill="${color}" font-family="'Space Mono', monospace" font-size="8.8" font-weight="700" letter-spacing="1.4">
        <textPath href="#botArc-${uid}" startOffset="50%" text-anchor="middle">
          ★ ${landmark.stampCode} • VERIFIED ★
        </textPath>
      </text>

      <!-- Center Landmark Icon & Stamp Code -->
      <text x="80" y="76" text-anchor="middle" dominant-baseline="middle" font-size="30">${landmark.icon}</text>
      <rect x="40" y="92" width="80" height="15" rx="4" fill="${color}" />
      <text x="80" y="102.5" text-anchor="middle" fill="#fffdf7" font-family="'Space Mono', monospace" font-size="8.5" font-weight="700">
        ${dateStr}
      </text>
    </svg>
  `;
}

// ==================== PERSISTENCE ====================
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.stampedMap === 'object') {
        state.stampedMap = parsed.stampedMap;
      }
      if (typeof parsed.elapsedSeconds === 'number') {
        state.elapsedSeconds = parsed.elapsedSeconds;
      }
    }
  } catch (e) {
    console.warn('Could not load saved state:', e);
  }
  pickNextUnstampedTarget();
}

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        stampedMap: state.stampedMap,
        elapsedSeconds: state.elapsedSeconds,
      })
    );
  } catch (e) {
    console.warn('Could not save state:', e);
  }
}

function pickNextUnstampedTarget() {
  const current = LANDMARKS.find((l) => l.id === state.activeTargetId);
  if (current && !state.stampedMap[current.id]) return;

  const nextUnstamped = LANDMARKS.find((l) => !state.stampedMap[l.id]);
  if (nextUnstamped) {
    state.activeTargetId = nextUnstamped.id;
  }
}

// ==================== RENDER FUNCTIONS ====================
function renderAll() {
  renderHUD();
  renderMapHotspots();
  renderPassportSlots();
}

function renderHUD() {
  const stampedCount = Object.keys(state.stampedMap).length;
  const total = LANDMARKS.length;
  const pct = Math.round((stampedCount / total) * 100);

  document.getElementById('hudStampCount').textContent = `${stampedCount} / ${total}`;
  document.getElementById('passportProgressText').textContent = `${pct}%`;
  document.getElementById('passportProgressFill').style.width = `${pct}%`;

  const activeLandmark = LANDMARKS.find((l) => l.id === state.activeTargetId) || LANDMARKS[0];
  const idx = LANDMARKS.findIndex((l) => l.id === activeLandmark.id) + 1;

  if (stampedCount === total) {
    document.getElementById('missionStepBadge').textContent = 'COMPLETE 🏆';
    document.getElementById('missionTargetName').textContent = 'All 10 Landmarks Stamped!';
    document.getElementById('missionTargetClue').textContent =
      'Congratulations! Click any landmark on the 3D map or in your Passport to inspect your collection.';
  } else {
    document.getElementById('missionStepBadge').textContent = `TARGET #${idx} OF ${total}`;
    document.getElementById('missionTargetName').textContent = `${activeLandmark.name} (${activeLandmark.mapNum})`;
    document.getElementById('missionTargetClue').textContent = activeLandmark.clue;
  }

  // Toggle Pins button state
  const btnTogglePins = document.getElementById('btnTogglePins');
  btnTogglePins.setAttribute('aria-pressed', String(state.showDemoPins));
  document.getElementById('togglePinsLabel').textContent = state.showDemoPins
    ? 'Demo Pins: ON'
    : 'Demo Pins: OFF';
}

function renderMapHotspots() {
  const container = document.getElementById('mapMarkersLayer');
  container.classList.toggle('show-demo-pins', state.showDemoPins);
  container.innerHTML = '';

  LANDMARKS.forEach((landmark) => {
    const isStamped = Boolean(state.stampedMap[landmark.id]);
    const isTarget = landmark.id === state.activeTargetId && !isStamped;
    const isHinted = landmark.id === state.hintedId;

    const hotspot = document.createElement('div');
    hotspot.className = [
      'landmark-hotspot',
      isStamped ? 'is-stamped' : '',
      isTarget ? 'is-target' : '',
      isHinted ? 'is-hinted' : '',
    ]
      .filter(Boolean)
      .join(' ');

    hotspot.style.left = `${landmark.x}%`;
    hotspot.style.top = `${landmark.y}%`;
    hotspot.style.width = `${landmark.radius * 1.9}%`;
    hotspot.style.height = `${landmark.radius * 2.5}%`;
    hotspot.dataset.landmarkId = landmark.id;
    hotspot.title = state.showDemoPins || isStamped ? `${landmark.name} (${landmark.mapNum})` : 'Click to inspect area';

    if (isHinted) {
      const ring = document.createElement('div');
      ring.className = 'radar-ring';
      hotspot.appendChild(ring);
    }

    const badge = document.createElement('div');
    badge.className = 'hotspot-badge';
    badge.innerHTML = `
      <div class="pin-bubble">${isStamped ? '💮' : landmark.icon}</div>
      <span class="pin-label">${isStamped ? 'STAMPED ✓' : landmark.name}</span>
    `;
    hotspot.appendChild(badge);

    hotspot.addEventListener('click', (e) => {
      e.stopPropagation();
      if (state.dragMoved) return;
      onLandmarkFound(landmark.id);
    });

    container.appendChild(hotspot);
  });
}

function renderPassportSlots() {
  const grid = document.getElementById('stampSlotsGrid');
  grid.innerHTML = '';

  LANDMARKS.forEach((landmark) => {
    const stampMeta = state.stampedMap[landmark.id];
    const isStamped = Boolean(stampMeta);
    const isTarget = landmark.id === state.activeTargetId && !isStamped;

    const card = document.createElement('div');
    card.className = [
      'stamp-slot-card',
      isStamped ? 'is-stamped' : '',
      isTarget ? 'active-target' : '',
    ]
      .filter(Boolean)
      .join(' ');

    card.innerHTML = `
      <span class="slot-number-tag">#${landmark.slot}</span>
      <span class="slot-status-tag ${isStamped ? 'done' : isTarget ? 'hunting' : ''}">
        ${isStamped ? 'STAMPED' : isTarget ? 'HUNTING' : landmark.mapNum}
      </span>
      <div class="slot-stamp-well">
        ${
          isStamped
            ? createStampChopSVG(landmark, stampMeta, 68)
            : `<span class="slot-mystery-icon">${landmark.icon}</span>`
        }
      </div>
      <div class="slot-landmark-name">${landmark.name}</div>
      <div class="slot-zone-sub">${landmark.zone}</div>
    `;

    card.addEventListener('click', () => {
      if (isStamped) {
        openStampModal(landmark.id);
      } else {
        state.activeTargetId = landmark.id;
        state.hintedId = null;
        renderAll();
        showSearchFeedback(`🎯 Target set: Find "${landmark.name}" on the 3D map!`, 'hot');
      }
    });

    grid.appendChild(card);
  });
}

// ==================== MAP SEARCH FEEDBACK (HOT / WARM / COLD) ====================
function showSearchFeedback(msg, tone = '') {
  const banner = document.getElementById('searchFeedback');
  banner.textContent = msg;
  banner.className = `search-feedback ${tone}`.trim();
}

function spawnClickRipple(xPct, yPct, color = '#34d399') {
  const svg = document.getElementById('mapSvgOverlay');
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('cx', xPct);
  circle.setAttribute('cy', yPct);
  circle.setAttribute('r', '0.8');
  circle.setAttribute('fill', 'none');
  circle.setAttribute('stroke', color);
  circle.setAttribute('stroke-width', '0.45');
  svg.appendChild(circle);

  const animR = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animR.setAttribute('attributeName', 'r');
  animR.setAttribute('from', '0.6');
  animR.setAttribute('to', '5.5');
  animR.setAttribute('dur', '0.65s');
  animR.setAttribute('fill', 'freeze');

  const animOp = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
  animOp.setAttribute('attributeName', 'opacity');
  animOp.setAttribute('from', '1');
  animOp.setAttribute('to', '0');
  animOp.setAttribute('dur', '0.65s');
  animOp.setAttribute('fill', 'freeze');

  circle.appendChild(animR);
  circle.appendChild(animOp);
  animR.beginElement();
  animOp.beginElement();

  setTimeout(() => circle.remove(), 700);
}

function handleMapMissClick(e) {
  if (state.dragMoved) return;
  const stage = document.getElementById('mapStage');
  const rect = stage.getBoundingClientRect();
  const xPct = ((e.clientX - rect.left) / rect.width) * 100;
  const yPct = ((e.clientY - rect.top) / rect.height) * 100;

  if (xPct < 0 || xPct > 100 || yPct < 0 || yPct > 100) return;

  // Check if within any landmark's forgiving radius first
  let closestLandmark = null;
  let minDistance = Infinity;

  for (const lm of LANDMARKS) {
    const dx = xPct - lm.x;
    const dy = yPct - lm.y;
    const dist = Math.hypot(dx, dy);
    if (dist < minDistance) {
      minDistance = dist;
      closestLandmark = lm;
    }
  }

  if (closestLandmark && minDistance <= closestLandmark.radius) {
    onLandmarkFound(closestLandmark.id);
    return;
  }

  // Otherwise give Hot / Warm / Cold directional compass guidance toward the active target
  spawnClickRipple(xPct, yPct, '#fbbf24');
  const target = LANDMARKS.find((l) => l.id === state.activeTargetId) || LANDMARKS[0];
  const dx = target.x - xPct;
  const dy = target.y - yPct;
  const distToTarget = Math.hypot(dx, dy);

  const dirY = dy < -5 ? 'North' : dy > 5 ? 'South' : '';
  const dirX = dx < -5 ? 'West' : dx > 5 ? 'East' : '';
  const compass = [dirY, dirX].filter(Boolean).join('-') || 'right around here';

  if (distToTarget < 14) {
    showSearchFeedback(`🔥 Very Warm! Look slightly ${compass} for ${target.name}!`, 'warm');
  } else if (distToTarget < 28) {
    showSearchFeedback(`🧭 Getting warmer—head ${compass} across the Gardens!`, 'warm');
  } else {
    showSearchFeedback(`❄️ Cold! Try searching toward the ${compass} (or click "Radar Hint").`, '');
  }
}

// ==================== LANDMARK FOUND & STAMP CHOP MODAL ====================
function onLandmarkFound(landmarkId) {
  sfx.playDiscoveryPop();
  state.hintedId = null;
  state.activeTargetId = landmarkId;
  renderAll();

  const landmark = LANDMARKS.find((l) => l.id === landmarkId);
  showSearchFeedback(`✨ Found ${landmark.name}! Press your Stamp Chop in the station!`, 'hot');
  openStampModal(landmarkId);
}

function openStampModal(landmarkId) {
  state.modalLandmarkId = landmarkId;
  const landmark = LANDMARKS.find((l) => l.id === landmarkId);
  if (!landmark) return;

  const isAlreadyStamped = Boolean(state.stampedMap[landmark.id]);

  document.getElementById('modalZoneBadge').textContent = `ATTRACTION ${landmark.mapNum} • ${landmark.zone.toUpperCase()}`;
  document.getElementById('modalLandmarkTitle').textContent = `${landmark.icon} ${landmark.name}`;
  document.getElementById('modalLandmarkDesc').textContent = landmark.description;
  document.getElementById('paperSlotNumber').textContent = `PASSPORT SLOT #${landmark.slot} • ${landmark.stampCode}`;

  // Position zoomed-in crop preview on the 3D map image
  const cropImg = document.getElementById('modalCropImg');
  const zoomFactor = 3.6;
  const offsetX = Math.max(0, Math.min(100 - 100 / zoomFactor, landmark.x - 50 / zoomFactor));
  const offsetY = Math.max(0, Math.min(100 - 100 / zoomFactor, landmark.y - 50 / zoomFactor));
  cropImg.style.transform = `translate(-${offsetX}%, -${offsetY}%)`;

  const inkContainer = document.getElementById('inkStampContainer');
  const promptEl = document.getElementById('stampPlaceholderPrompt');
  const btnPress = document.getElementById('btnPressStamp');
  const btnPressText = document.getElementById('btnPressStampText');

  if (isAlreadyStamped) {
    const meta = state.stampedMap[landmark.id];
    inkContainer.innerHTML = createStampChopSVG(landmark, meta, 152);
    inkContainer.style.setProperty('--stamp-angle', `${meta.angle}deg`);
    inkContainer.classList.add('stamped-visible');
    promptEl.style.opacity = '0';
    btnPress.classList.add('already-stamped');
    btnPressText.textContent = 'STAMPED! (CLICK TO RE-STAMP)';
  } else {
    inkContainer.innerHTML = '';
    inkContainer.classList.remove('stamped-visible');
    promptEl.style.opacity = '1';
    btnPress.classList.remove('already-stamped');
    btnPressText.textContent = 'PRESS STAMP CHOP!';
  }

  const modal = document.getElementById('stampModal');
  if (!modal.open) modal.showModal();
}

function executeStampChop() {
  const landmarkId = state.modalLandmarkId;
  const landmark = LANDMARKS.find((l) => l.id === landmarkId);
  if (!landmark) return;

  const stamper = document.getElementById('rubberStamper');
  const paper = document.getElementById('passportPaperSheet');
  const inkContainer = document.getElementById('inkStampContainer');
  const promptEl = document.getElementById('stampPlaceholderPrompt');
  const btnPress = document.getElementById('btnPressStamp');
  const btnPressText = document.getElementById('btnPressStampText');

  // Re-trigger rubber stamper slam animation
  stamper.classList.remove('slamming');
  paper.classList.remove('paper-shake');
  inkContainer.classList.remove('stamped-visible');
  void stamper.offsetWidth;
  stamper.classList.add('slamming');

  // At impact point (~200ms), play thud sound, shake paper, and imprint the ink stamp chop
  setTimeout(() => {
    sfx.playStampChop();
    paper.classList.add('paper-shake');

    const randomAngle = Math.round((Math.random() * 14 - 7) * 10) / 10;
    const now = new Date();
    const timestamp = now
      .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      .toUpperCase();

    const stampMeta = { timestamp, angle: randomAngle };
    state.stampedMap[landmark.id] = stampMeta;

    inkContainer.innerHTML = createStampChopSVG(landmark, stampMeta, 152);
    inkContainer.style.setProperty('--stamp-angle', `${randomAngle}deg`);
    promptEl.style.opacity = '0';
    inkContainer.classList.add('stamped-visible');

    btnPress.classList.add('already-stamped');
    btnPressText.textContent = 'STAMP CHOP COLLECTED ✓';

    pickNextUnstampedTarget();
    saveState();
    renderAll();

    // Check if all 10 stamps are now collected
    if (Object.keys(state.stampedMap).length === LANDMARKS.length) {
      setTimeout(() => {
        document.getElementById('stampModal').close();
        openVictoryModal();
      }, 950);
    }
  }, 200);
}

function openVictoryModal() {
  const total = LANDMARKS.length;
  document.getElementById('victoryStamps').textContent = `${total} / ${total}`;
  document.getElementById('victoryTime').textContent = formatTime(state.elapsedSeconds);

  const showcase = document.getElementById('victoryStampShowcase');
  showcase.innerHTML = LANDMARKS.map((lm) =>
    createStampChopSVG(lm, state.stampedMap[lm.id] || {}, 86)
  ).join('');

  const modal = document.getElementById('victoryModal');
  if (!modal.open) modal.showModal();
}

// ==================== PAN & ZOOM ENGINE ====================
function applyMapTransform() {
  const wrapper = document.getElementById('mapCanvasWrapper');
  wrapper.style.transform = `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})`;
}

function setZoom(newZoom) {
  state.zoom = Math.max(1, Math.min(3.0, newZoom));
  if (state.zoom === 1) {
    state.panX = 0;
    state.panY = 0;
  }
  applyMapTransform();
}

function setupMapInteractions() {
  const viewport = document.getElementById('mapViewport');

  viewport.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.map-zoom-controls')) return;
    state.isDragging = true;
    state.dragMoved = false;
    state.startX = e.clientX - state.panX;
    state.startY = e.clientY - state.panY;
    viewport.classList.add('dragging');
  });

  window.addEventListener('pointermove', (e) => {
    if (!state.isDragging) return;
    const nextX = e.clientX - state.startX;
    const nextY = e.clientY - state.startY;
    if (Math.hypot(nextX - state.panX, nextY - state.panY) > 5) {
      state.dragMoved = true;
    }
    if (state.zoom > 1) {
      const limit = 380 * (state.zoom - 1);
      state.panX = Math.max(-limit, Math.min(limit, nextX));
      state.panY = Math.max(-limit, Math.min(limit, nextY));
      applyMapTransform();
    }
  });

  window.addEventListener('pointerup', () => {
    state.isDragging = false;
    viewport.classList.remove('dragging');
  });

  viewport.addEventListener(
    'wheel',
    (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.22 : -0.22;
      setZoom(state.zoom + delta);
    },
    { passive: false }
  );

  document.getElementById('mapStage').addEventListener('click', handleMapMissClick);
}

// ==================== TIMER & CONTROLS ====================
function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function startTimer() {
  document.getElementById('hudTimer').textContent = formatTime(state.elapsedSeconds);
  state.timerInterval = setInterval(() => {
    if (Object.keys(state.stampedMap).length < LANDMARKS.length) {
      state.elapsedSeconds += 1;
      document.getElementById('hudTimer').textContent = formatTime(state.elapsedSeconds);
    }
  }, 1000);
}

function initEventListeners() {
  // Radar Hint Button
  document.getElementById('btnRadarHint').addEventListener('click', () => {
    sfx.playRadarPing();
    state.hintedId = state.activeTargetId;
    renderMapHotspots();
    const target = LANDMARKS.find((l) => l.id === state.activeTargetId);
    if (target) {
      showSearchFeedback(
        `📡 Radar Active! Look for the pulsing gold ring around "${target.name}" (${target.zone})!`,
        'warm'
      );
    }
  });

  // Skip to Next Unstamped Target
  document.getElementById('btnSkipTarget').addEventListener('click', () => {
    const unstamped = LANDMARKS.filter((l) => !state.stampedMap[l.id]);
    if (unstamped.length <= 1) return;
    const curIdx = unstamped.findIndex((l) => l.id === state.activeTargetId);
    const next = unstamped[(curIdx + 1) % unstamped.length];
    state.activeTargetId = next.id;
    state.hintedId = null;
    renderAll();
    showSearchFeedback(`🎯 Switched target: Hunt for "${next.name}"!`, '');
  });

  // Toggle Demo Pins
  document.getElementById('btnTogglePins').addEventListener('click', () => {
    state.showDemoPins = !state.showDemoPins;
    renderAll();
    showSearchFeedback(
      state.showDemoPins
        ? '👁️ Demo Pins ON: All 10 landmark pins are now visible for quick testing!'
        : '🔍 Demo Pins OFF: True Treasure Hunt mode—find landmarks visually on the 3D map!',
      state.showDemoPins ? 'hot' : ''
    );
  });

  // Official Reference Map Modal
  const refMapModal = document.getElementById('refMapModal');
  document.getElementById('btnRefMap').addEventListener('click', () => refMapModal.showModal());
  document.getElementById('btnCloseRefMap').addEventListener('click', () => refMapModal.close());

  // Passport Sidebar Scroll/Highlight
  document.getElementById('btnOpenPassport').addEventListener('click', () => {
    const sidebar = document.getElementById('passportSidebar');
    sidebar.scrollIntoView({ behavior: 'smooth' });
    sidebar.animate(
      [
        { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
        { boxShadow: '0 0 0 6px rgba(16, 185, 129, 0.55)' },
        { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' },
      ],
      { duration: 650 }
    );
  });

  // Stamp Station Modal actions
  const stampModal = document.getElementById('stampModal');
  document.getElementById('btnCloseStampModal').addEventListener('click', () => stampModal.close());
  document.getElementById('btnPressStamp').addEventListener('click', executeStampChop);
  document.getElementById('passportPaperSheet').addEventListener('click', executeStampChop);

  // Victory Modal actions
  const victoryModal = document.getElementById('victoryModal');
  document.getElementById('btnCloseVictory').addEventListener('click', () => victoryModal.close());
  document.getElementById('btnPlayAgain').addEventListener('click', () => {
    victoryModal.close();
    resetAllProgress();
  });

  // Reset Progress
  document.getElementById('btnResetProgress').addEventListener('click', resetAllProgress);

  // Zoom buttons
  document.getElementById('btnZoomIn').addEventListener('click', () => setZoom(state.zoom + 0.35));
  document.getElementById('btnZoomOut').addEventListener('click', () => setZoom(state.zoom - 0.35));
  document.getElementById('btnZoomReset').addEventListener('click', () => setZoom(1));

  // Close modals on backdrop click
  [stampModal, refMapModal, victoryModal].forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
  });
}

function resetAllProgress() {
  state.stampedMap = {};
  state.elapsedSeconds = 0;
  state.activeTargetId = LANDMARKS[0].id;
  state.hintedId = null;
  saveState();
  renderAll();
  showSearchFeedback('🔄 Passport reset! Find your first landmark on the 3D map.', '');
}

// ==================== BOOTSTRAP ====================
window.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupMapInteractions();
  initEventListeners();
  renderAll();
  startTimer();
});
