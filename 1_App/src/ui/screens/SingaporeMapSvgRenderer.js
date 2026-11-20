// ============================================================================
// Illustrated Singapore Island Map SVG + Ambience Switcher & Particle Stage
// (src/ui/SingaporeMapSvgRenderer.js)
// Renders the geographic silhouette of Singapore Main Island, Sentosa,
// Pulau Ubin & Pulau Tekong with synchronized pulsing radar spotlight,
// interactive 3-pill Time-of-Day Ambience Switcher, and floating particles.
// ============================================================================

import {
  SINGAPORE_DESTINATIONS,
  WELCOME_AMBIENCE_PRESETS,
  getDestinationById,
  getWelcomeAmbienceById
} from '../../data/SingaporeDestinationsSpec.js';

const SG_MAIN_ISLAND_PATH =
  'M 96 292 L 116 250 L 146 216 L 194 184 L 248 168 L 286 150 L 334 118 L 392 94 L 444 96 ' +
  'L 490 120 L 538 140 L 594 148 L 656 160 L 722 174 L 774 202 L 802 246 L 784 286 ' +
  'L 732 326 L 664 366 L 596 392 L 542 408 L 496 420 L 448 424 L 398 408 L 344 388 ' +
  'L 284 368 L 222 362 L 166 368 L 122 356 L 98 326 Z';

const SENTOSA_ISLAND_PATH =
  'M 414 468 L 442 454 L 478 456 L 510 472 L 496 492 L 456 496 L 420 486 Z';

const PULAU_UBIN_PATH =
  'M 622 114 L 664 104 L 704 114 L 694 134 L 650 138 L 620 128 Z';

const PULAU_TEKONG_PATH =
  'M 728 96 L 776 84 L 814 104 L 798 142 L 750 144 L 724 122 Z';

const JURONG_ISLAND_PATH =
  'M 152 384 L 228 378 L 274 398 L 254 432 L 184 434 L 142 412 Z';

const ROUTE_ARC_PATH =
  'M 356 392 Q 396 340 444 318 Q 498 345 542 404 Q 512 454 462 472';

const PARTICLE_COUNT = 22;

export function mountSingaporeInteractiveMap(
  containerEl,
  onSelectDestination,
  onSelectAmbienceMood
) {
  if (!containerEl) return null;

  containerEl.innerHTML = '';

  const stage = document.createElement('div');
  stage.className = 'sg-map-canvas-box';

  const svgNs = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNs, 'svg');
  svg.setAttribute('viewBox', '0 0 900 560');
  svg.setAttribute('class', 'sg-island-svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute(
    'aria-label',
    'Interactive Map of Singapore highlighting Gardens by the Bay, Botanic Gardens, Sentosa, and Haw Par Villa'
  );

  svg.innerHTML = `
    <defs>
      <radialGradient id="sgSeaGlow" cx="52%" cy="54%" r="64%">
        <stop id="sgSeaStop0" offset="0%" stop-color="#CDE3E2" stop-opacity="1" />
        <stop id="sgSeaStop1" offset="58%" stop-color="#B7D4D3" stop-opacity="1" />
        <stop id="sgSeaStop2" offset="100%" stop-color="#9EC2C2" stop-opacity="1" />
      </radialGradient>
      <linearGradient id="sgLandGrad" x1="15%" y1="10%" x2="85%" y2="90%">
        <stop id="sgLandStop0" offset="0%" stop-color="#F3F8F4" />
        <stop id="sgLandStop1" offset="52%" stop-color="#E1ECE4" />
        <stop id="sgLandStop2" offset="100%" stop-color="#C6DBCE" />
      </linearGradient>
      <linearGradient id="sgSentosaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E7F1EA" />
        <stop offset="100%" stop-color="#C6DBCE" />
      </linearGradient>
      <radialGradient id="sgFocusSpotlight" cx="50%" cy="50%" r="50%">
        <stop id="sgSpotlightStop0" offset="0%" stop-color="#0B4F43" stop-opacity="0.22" />
        <stop id="sgSpotlightStop1" offset="55%" stop-color="#10B981" stop-opacity="0.10" />
        <stop offset="100%" stop-color="#10B981" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="sgHorizonGlowGrad" cx="50%" cy="18%" r="58%">
        <stop id="sgHorizonStop0" offset="0%" stop-color="#FDE68A" stop-opacity="0.32" />
        <stop id="sgHorizonStop1" offset="55%" stop-color="#99F6E4" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0" />
      </radialGradient>
      <filter id="sgSoftShadow" x="-12%" y="-12%" width="124%" height="128%">
        <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#0D3B34" flood-opacity="0.16" />
      </filter>
    </defs>

    <!-- Strait Ocean Backdrop & Subtle Cartographic Grid -->
    <rect width="900" height="560" rx="18" fill="url(#sgSeaGlow)" />
    <ellipse id="sgHorizonAura" cx="460" cy="110" rx="410" ry="185" fill="url(#sgHorizonGlowGrad)" opacity="0.14" />

    <g stroke="rgba(13, 59, 52, 0.06)" stroke-width="1">
      <line x1="0" y1="112" x2="900" y2="112" />
      <line x1="0" y1="224" x2="900" y2="224" />
      <line x1="0" y1="336" x2="900" y2="336" />
      <line x1="0" y1="448" x2="900" y2="448" />
      <line x1="180" y1="0" x2="180" y2="560" />
      <line x1="360" y1="0" x2="360" y2="560" />
      <line x1="540" y1="0" x2="540" y2="560" />
      <line x1="720" y1="0" x2="720" y2="560" />
    </g>

    <!-- Subtle Water Shimmer Lines -->
    <g id="sgWaterReflections" class="sg-water-reflections" stroke="rgba(255, 255, 255, 0.35)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.32">
      <path d="M 280 468 Q 330 462 380 468" />
      <path d="M 548 446 Q 598 438 648 446" />
      <path d="M 520 508 Q 576 500 632 508" />
      <path d="M 180 482 Q 225 475 270 482" />
    </g>

    <!-- Outer Islands -->
    <path d="${PULAU_UBIN_PATH}" fill="#DCEAE0" stroke="#9EB9AC" stroke-width="1.4" opacity="0.92" />
    <path d="${PULAU_TEKONG_PATH}" fill="#D6E6DC" stroke="#9EB9AC" stroke-width="1.4" opacity="0.88" />
    <path d="${JURONG_ISLAND_PATH}" fill="#D3E4DC" stroke="#9EB9AC" stroke-width="1.4" opacity="0.86" />

    <!-- Singapore Main Island Botanical Silhouette -->
    <path d="${SG_MAIN_ISLAND_PATH}" fill="url(#sgLandGrad)" stroke="#88ADA0" stroke-width="2" stroke-linejoin="round" filter="url(#sgSoftShadow)" />

    <!-- Central Catchment Nature Reserve & MacRitchie -->
    <ellipse cx="440" cy="236" rx="78" ry="44" fill="#BDD6C4" opacity="0.65" />
    <path d="M 414 232 Q 442 216 468 238 Q 442 252 414 232 Z" fill="#9BC3C8" opacity="0.85" />

    <!-- Marina Bay Reservoir & Island Arteries -->
    <path d="M 526 392 Q 554 374 584 388 Q 560 412 526 392 Z" fill="#9AC4C9" stroke="#78A7AE" stroke-width="1.2" opacity="0.9" />
    <path d="M 164 304 Q 340 278 486 300 T 764 252" fill="none" stroke="rgba(13, 59, 52, 0.14)" stroke-width="1.8" stroke-dasharray="5 5" />

    <!-- Sentosa Island across Keppel Harbour -->
    <path d="${SENTOSA_ISLAND_PATH}" fill="url(#sgSentosaGrad)" stroke="#88ADA0" stroke-width="1.8" stroke-linejoin="round" filter="url(#sgSoftShadow)" />
    <line x1="458" y1="422" x2="458" y2="458" stroke="rgba(13, 59, 52, 0.25)" stroke-width="1.8" stroke-dasharray="3 3" />

    <!-- Subtle Botanical Trail Arc -->
    <path d="${ROUTE_ARC_PATH}" fill="none" stroke="rgba(11, 79, 67, 0.32)" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 6" />

    <!-- Night Park Beacons (Visible on Sunset & Night modes) -->
    <g id="sgNightBeacons" class="sg-night-beacons" opacity="0.0">
      <circle cx="542" cy="404" r="14" fill="rgba(52, 211, 153, 0.32)" />
      <circle cx="444" cy="318" r="13" fill="rgba(52, 211, 153, 0.28)" />
      <circle cx="462" cy="472" r="12" fill="rgba(251, 191, 36, 0.26)" />
      <circle cx="356" cy="392" r="12" fill="rgba(245, 158, 11, 0.26)" />
      <circle cx="515" cy="378" r="2.2" fill="#FEF08A" />
      <circle cx="566" cy="368" r="2.0" fill="#6EE7B7" />
      <circle cx="486" cy="348" r="2.0" fill="#FDE047" />
      <circle cx="395" cy="356" r="2.0" fill="#FBBF24" />
    </g>

    <!-- Quiet Geographic Labels -->
    <g class="sg-map-geo-labels" fill="rgba(13, 59, 52, 0.42)" font-family="'Plus Jakarta Sans', sans-serif" font-size="10.5" font-weight="600" letter-spacing="1.4">
      <text x="196" y="254">JURONG LAKE</text>
      <text x="406" y="176">CENTRAL CATCHMENT</text>
      <text x="640" y="266">CHANGI COAST</text>
      <text x="580" y="458">SINGAPORE STRAIT</text>
    </g>

    <!-- Active Destination Focus Halo -->
    <circle id="sgMapActiveHalo" cx="542" cy="404" r="54" fill="url(#sgFocusSpotlight)" />
    <circle id="sgMapActiveRing" cx="542" cy="404" r="22" fill="none" stroke="#0B4F43" stroke-width="2" opacity="0.65" />

    <!-- Minimal Cartographic Compass (Top-Left) -->
    <g transform="translate(48, 48)">
      <circle cx="0" cy="0" r="18" fill="rgba(250, 253, 251, 0.84)" stroke="rgba(13, 59, 52, 0.2)" stroke-width="1.2" />
      <polygon points="0,-11 3,-1.5 0,-3.5 -3,-1.5" fill="#0B4F43" />
      <polygon points="0,11 3,1.5 0,3.5 -3,1.5" fill="#8AA69E" />
      <text x="0" y="-22" text-anchor="middle" fill="#0D3B34" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" font-weight="700">N</text>
    </g>
  `;

  // Floating Ambient Particles Layer (Fireflies / Orchid Petals / Bioluminescent Motes)
  const particlesLayer = document.createElement('div');
  particlesLayer.className = 'sg-map-particles-layer';
  particlesLayer.id = 'sgMapParticlesLayer';
  particlesLayer.setAttribute('aria-hidden', 'true');

  const particleNodes = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const mote = document.createElement('span');
    mote.className = 'sg-ambient-particle';
    const leftPct = 8 + ((i * 37) % 84);
    const topPct = 12 + ((i * 53) % 76);
    const sizePx = 5 + (i % 4) * 2.5;
    const delaySec = ((i * 0.43) % 5.2).toFixed(2);
    const durSec = (3.8 + (i % 5) * 0.85).toFixed(2);
    mote.style.left = `${leftPct}%`;
    mote.style.top = `${topPct}%`;
    mote.style.setProperty('--p-size', `${sizePx}px`);
    mote.style.setProperty('--p-delay', `-${delaySec}s`);
    mote.style.setProperty('--p-dur', `${durSec}s`);
    particlesLayer.appendChild(mote);
    particleNodes.push(mote);
  }

  // Interactive 3-Pill Time-of-Day Ambience Switcher (Top-Right of Map Stage)
  const switcherBar = document.createElement('div');
  switcherBar.className = 'sg-ambience-switcher';
  switcherBar.id = 'sgAmbienceSwitcher';
  switcherBar.setAttribute('role', 'group');
  switcherBar.setAttribute('aria-label', 'Singapore Island Map Time of Day Ambience');

  const moodButtons = new Map();
  WELCOME_AMBIENCE_PRESETS.forEach((preset) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sg-ambience-pill';
    btn.dataset.ambienceMood = preset.id;
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = preset.pillLabel;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onSelectAmbienceMood?.(preset.id);
    });
    switcherBar.appendChild(btn);
    moodButtons.set(preset.id, btn);
  });

  // Live Destination Atmosphere Mood Badge (Bottom-Left of Map Stage)
  const moodBanner = document.createElement('div');
  moodBanner.className = 'sg-map-atmosphere-pill';
  moodBanner.id = 'sgMapAtmospherePill';
  moodBanner.setAttribute('aria-live', 'polite');
  moodBanner.innerHTML = `
    <span class="sg-atmo-title" id="sgAtmoTitleText">✨ Bioluminescent Supertree Twilight</span>
    <span class="sg-atmo-sub" id="sgAtmoSubText">Cyan, Magenta &amp; Gold Rhapsody Motes</span>
  `;

  // Destination Pins Layer
  const pinsLayer = document.createElement('div');
  pinsLayer.className = 'sg-map-pins-layer';

  const pinButtons = new Map();
  SINGAPORE_DESTINATIONS.forEach((dest) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `sg-map-pin pin-pos-${dest.pinLabelPos} ${dest.status === 'live' ? 'is-live' : 'is-soon'}`;
    btn.dataset.destId = dest.id;
    btn.style.left = `${((dest.pinPos.x / 900) * 100).toFixed(2)}%`;
    btn.style.top = `${((dest.pinPos.y / 560) * 100).toFixed(2)}%`;
    btn.style.setProperty('--pin-accent', dest.accentHex);
    btn.setAttribute('aria-label', `${dest.name} (${dest.status === 'live' ? 'Live 3D World' : 'Coming Soon'})`);

    btn.innerHTML = `
      <span class="sg-pin-pulse" aria-hidden="true"></span>
      <span class="sg-pin-dot" aria-hidden="true">
        <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor"><path d="M10 2a5.5 5.5 0 0 0-5.5 5.5c0 4.1 5.5 10.5 5.5 10.5s5.5-6.4 5.5-10.5A5.5 5.5 0 0 0 10 2Zm0 7.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"/></svg>
      </span>
      <span class="sg-pin-tag">
        <strong>${dest.shortName}</strong>
      </span>
    `;
    btn.addEventListener('click', () => onSelectDestination?.(dest.id));
    pinsLayer.appendChild(btn);
    pinButtons.set(dest.id, btn);
  });

  stage.append(svg, particlesLayer, pinsLayer, switcherBar, moodBanner);
  containerEl.appendChild(stage);

  const haloEl = svg.getElementById('sgMapActiveHalo');
  const ringEl = svg.getElementById('sgMapActiveRing');
  const seaStops = [svg.getElementById('sgSeaStop0'), svg.getElementById('sgSeaStop1'), svg.getElementById('sgSeaStop2')];
  const landStops = [svg.getElementById('sgLandStop0'), svg.getElementById('sgLandStop1'), svg.getElementById('sgLandStop2')];
  const spotStop0 = svg.getElementById('sgSpotlightStop0');
  const spotStop1 = svg.getElementById('sgSpotlightStop1');
  const horizonStop0 = svg.getElementById('sgHorizonStop0');
  const horizonStop1 = svg.getElementById('sgHorizonStop1');
  const horizonAura = svg.getElementById('sgHorizonAura');
  const nightBeacons = svg.getElementById('sgNightBeacons');
  const waterRefs = svg.getElementById('sgWaterReflections');
  const atmoTitleEl = moodBanner.querySelector('#sgAtmoTitleText');
  const atmoSubEl = moodBanner.querySelector('#sgAtmoSubText');

  function setActivePin(destId) {
    const dest = getDestinationById(destId);
    haloEl?.setAttribute('cx', String(dest.pinPos.x));
    haloEl?.setAttribute('cy', String(dest.pinPos.y));
    ringEl?.setAttribute('cx', String(dest.pinPos.x));
    ringEl?.setAttribute('cy', String(dest.pinPos.y));
    ringEl?.setAttribute('stroke', dest.atmosphere?.goldHighlight || '#FEF08A');

    pinButtons.forEach((btn, id) => {
      const isCurrent = id === dest.id;
      btn.classList.toggle('is-active', isCurrent);
      if (isCurrent) btn.setAttribute('aria-current', 'location');
      else btn.removeAttribute('aria-current');
    });
  }

  function setAtmosphereState(destOrId, moodId = 'sunset') {
    const dest = typeof destOrId === 'string' ? getDestinationById(destOrId) : destOrId;
    const mood = getWelcomeAmbienceById(moodId);
    const atmo = dest.atmosphere || {};

    stage.dataset.activeDest = dest.id;
    stage.dataset.welcomeMood = mood.id;

    moodButtons.forEach((btn, id) => {
      const isActive = id === mood.id;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    mood.seaPalette.forEach((hex, i) => seaStops[i]?.setAttribute('stop-color', hex));
    mood.landPalette.forEach((hex, i) => landStops[i]?.setAttribute('stop-color', hex));
    if (spotStop0) spotStop0.setAttribute('stop-color', atmo.spotlightStop0 || '#FDE047');
    if (spotStop1) spotStop1.setAttribute('stop-color', atmo.spotlightStop1 || dest.accentHex);
    if (horizonStop0) horizonStop0.setAttribute('stop-color', atmo.goldHighlight || '#FDE047');
    if (horizonStop1) horizonStop1.setAttribute('stop-color', atmo.accentSecondary || dest.accentHex);
    if (horizonAura) horizonAura.setAttribute('opacity', mood.horizonOpacity);
    if (nightBeacons) nightBeacons.setAttribute('opacity', mood.nightBeaconsOpacity);
    if (waterRefs) waterRefs.setAttribute('opacity', mood.waterShimmerOpacity);

    if (atmoTitleEl) atmoTitleEl.textContent = atmo.moodTitle || dest.name;
    if (atmoSubEl) atmoSubEl.textContent = `${mood.pillLabel} • ${atmo.moodSub || dest.district}`;

    const palette = atmo.particleColors || [dest.accentHex, '#FEF08A'];
    const pType = atmo.particleType || 'motes';
    const activeCount = Math.round(PARTICLE_COUNT * (mood.particleDensity || 0.85));
    particleNodes.forEach((node, idx) => {
      const clr = palette[idx % palette.length];
      node.dataset.particleType = pType;
      node.style.setProperty('--p-color', clr);
      node.style.opacity = idx < activeCount ? '1' : '0.18';
    });
  }

  setActivePin(SINGAPORE_DESTINATIONS[0].id);
  setAtmosphereState(SINGAPORE_DESTINATIONS[0], 'morning');
  return { setActivePin, setAtmosphereState };
}
