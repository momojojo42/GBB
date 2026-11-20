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
        <stop id="sgSeaStop0" offset="0%" stop-color="#0E7490" stop-opacity="0.95" />
        <stop id="sgSeaStop1" offset="58%" stop-color="#074B63" stop-opacity="0.98" />
        <stop id="sgSeaStop2" offset="100%" stop-color="#032638" stop-opacity="1" />
      </radialGradient>
      <linearGradient id="sgLandGrad" x1="15%" y1="10%" x2="85%" y2="90%">
        <stop id="sgLandStop0" offset="0%" stop-color="#4ADE80" />
        <stop id="sgLandStop1" offset="48%" stop-color="#22C55E" />
        <stop id="sgLandStop2" offset="100%" stop-color="#0D9488" />
      </linearGradient>
      <linearGradient id="sgSentosaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#5EEAD4" />
        <stop offset="100%" stop-color="#10B981" />
      </linearGradient>
      <radialGradient id="sgFocusSpotlight" cx="50%" cy="50%" r="50%">
        <stop id="sgSpotlightStop0" offset="0%" stop-color="#FDE047" stop-opacity="0.58" />
        <stop id="sgSpotlightStop1" offset="55%" stop-color="#34D399" stop-opacity="0.24" />
        <stop offset="100%" stop-color="#34D399" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="sgHorizonGlowGrad" cx="50%" cy="18%" r="58%">
        <stop id="sgHorizonStop0" offset="0%" stop-color="#FDE047" stop-opacity="0.45" />
        <stop id="sgHorizonStop1" offset="55%" stop-color="#E879F9" stop-opacity="0.16" />
        <stop offset="100%" stop-color="#0EA5E9" stop-opacity="0" />
      </radialGradient>
      <filter id="sgSoftShadow" x="-12%" y="-12%" width="124%" height="128%">
        <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#021D29" flood-opacity="0.52" />
      </filter>
    </defs>

    <!-- Strait Ocean Backdrop & Horizon Sky Aura -->
    <rect width="900" height="560" rx="22" fill="url(#sgSeaGlow)" />
    <ellipse id="sgHorizonAura" cx="460" cy="110" rx="410" ry="185" fill="url(#sgHorizonGlowGrad)" opacity="0.55" />

    <g stroke="rgba(186, 230, 253, 0.1)" stroke-width="1">
      <line x1="0" y1="112" x2="900" y2="112" />
      <line x1="0" y1="224" x2="900" y2="224" />
      <line x1="0" y1="336" x2="900" y2="336" />
      <line x1="0" y1="448" x2="900" y2="448" />
      <line x1="180" y1="0" x2="180" y2="560" />
      <line x1="360" y1="0" x2="360" y2="560" />
      <line x1="540" y1="0" x2="540" y2="560" />
      <line x1="720" y1="0" x2="720" y2="560" />
    </g>

    <!-- Water Reflection Shimmer Waves -->
    <g id="sgWaterReflections" class="sg-water-reflections" stroke="rgba(254, 240, 138, 0.28)" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.65">
      <path d="M 280 468 Q 330 462 380 468" />
      <path d="M 548 446 Q 598 438 648 446" />
      <path d="M 520 508 Q 576 500 632 508" />
      <path d="M 180 482 Q 225 475 270 482" />
    </g>

    <!-- Soft Nautical Ripple Rings -->
    <ellipse cx="470" cy="300" rx="370" ry="205" fill="none" stroke="rgba(125, 211, 252, 0.14)" stroke-dasharray="8 8" stroke-width="1.5" />

    <!-- Outer Islands -->
    <path d="${PULAU_UBIN_PATH}" fill="#16A34A" stroke="#DCFCE7" stroke-width="2" opacity="0.88" />
    <path d="${PULAU_TEKONG_PATH}" fill="#15803D" stroke="#DCFCE7" stroke-width="2" opacity="0.82" />
    <path d="${JURONG_ISLAND_PATH}" fill="#0F766E" stroke="#99F6E4" stroke-width="2" opacity="0.82" />

    <!-- Singapore Main Island Extruded Base + Lush Botanical Landmass -->
    <path d="${SG_MAIN_ISLAND_PATH}" transform="translate(0, 8)" fill="#064E3B" opacity="0.72" />
    <path d="${SG_MAIN_ISLAND_PATH}" fill="url(#sgLandGrad)" stroke="#ECFDF5" stroke-width="3.2" stroke-linejoin="round" filter="url(#sgSoftShadow)" />

    <!-- Central Catchment Nature Reserve & MacRitchie Pockets -->
    <ellipse cx="440" cy="236" rx="78" ry="44" fill="#15803D" opacity="0.46" />
    <path d="M 414 232 Q 442 216 468 238 Q 442 252 414 232 Z" fill="#0EA5E9" opacity="0.72" />

    <!-- East Coast Parkway & Marina Bay Reservoir -->
    <path d="M 526 392 Q 554 374 584 388 Q 560 412 526 392 Z" fill="#0EA5E9" stroke="#BAE6FD" stroke-width="1.4" opacity="0.85" />
    <path d="M 164 304 Q 340 278 486 300 T 764 252" fill="none" stroke="rgba(255, 251, 235, 0.34)" stroke-width="3" stroke-dasharray="7 6" />

    <!-- Sentosa Island across Keppel Harbour -->
    <path d="${SENTOSA_ISLAND_PATH}" transform="translate(0, 6)" fill="#065F46" opacity="0.7" />
    <path d="${SENTOSA_ISLAND_PATH}" fill="url(#sgSentosaGrad)" stroke="#FEF9C3" stroke-width="2.8" stroke-linejoin="round" filter="url(#sgSoftShadow)" />
    <line x1="458" y1="422" x2="458" y2="458" stroke="#FDE68A" stroke-width="3" stroke-dasharray="4 3" />

    <!-- Stylized Island Expedition Route -->
    <path d="${ROUTE_ARC_PATH}" fill="none" stroke="#FEF08A" stroke-width="3" stroke-linecap="round" stroke-dasharray="6 8" opacity="0.85" />

    <!-- Enchanted Night & Sunset Park Beacons / Starlight Layer -->
    <g id="sgNightBeacons" class="sg-night-beacons" opacity="0.6">
      <circle cx="542" cy="404" r="14" fill="rgba(34, 211, 238, 0.35)" />
      <circle cx="444" cy="318" r="13" fill="rgba(52, 211, 153, 0.35)" />
      <circle cx="462" cy="472" r="12" fill="rgba(251, 146, 60, 0.32)" />
      <circle cx="356" cy="392" r="12" fill="rgba(245, 158, 11, 0.35)" />
      <circle cx="515" cy="378" r="2.4" fill="#FEF08A" />
      <circle cx="566" cy="368" r="2.2" fill="#22D3EE" />
      <circle cx="486" cy="348" r="2.0" fill="#FDE047" />
      <circle cx="395" cy="356" r="2.2" fill="#FBBF24" />
      <circle cx="622" cy="314" r="2.0" fill="#FEF08A" />
      <circle cx="290" cy="318" r="2.2" fill="#6EE7B7" />
    </g>

    <!-- Geographic District Labels -->
    <g fill="rgba(236, 253, 245, 0.72)" font-family="Poppins, sans-serif" font-size="11" font-weight="700" letter-spacing="1.8">
      <text x="200" y="255">JURONG LAKE</text>
      <text x="415" y="178">CENTRAL CATCHMENT</text>
      <text x="646" y="268">CHANGI COAST</text>
      <text x="580" y="458" fill="rgba(186, 230, 253, 0.72)">SINGAPORE STRAIT</text>
    </g>

    <!-- Animated Spotlight Aura Following the Active Scrolled Destination -->
    <circle id="sgMapActiveHalo" cx="542" cy="404" r="74" fill="url(#sgFocusSpotlight)" />
    <circle id="sgMapActiveRing" cx="542" cy="404" r="30" fill="none" stroke="#FEF08A" stroke-width="2.5" stroke-dasharray="5 5" opacity="0.92" />

    <!-- Compass Rose (Top-Left) -->
    <g transform="translate(56, 56)">
      <circle cx="0" cy="0" r="22" fill="rgba(6, 57, 58, 0.76)" stroke="rgba(254, 240, 138, 0.75)" stroke-width="1.5" />
      <polygon points="0,-14 3.5,-2 0,-4.5 -3.5,-2" fill="#FACC15" />
      <polygon points="0,14 3.5,2 0,4.5 -3.5,2" fill="#E2E8F0" opacity="0.65" />
      <text x="0" y="-25" text-anchor="middle" fill="#FEF08A" font-family="Poppins, sans-serif" font-size="9.5" font-weight="800">N</text>
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
      <span class="sg-pin-dot">${dest.icon}</span>
      <span class="sg-pin-tag">
        <strong>${dest.shortName}</strong>
        <small>${dest.status === 'live' ? 'LIVE 3D' : 'SOON'}</small>
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
  setAtmosphereState(SINGAPORE_DESTINATIONS[0], 'sunset');
  return { setActivePin, setAtmosphereState };
}
