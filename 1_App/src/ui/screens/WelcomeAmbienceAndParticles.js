// ============================================================================
// Screen 00: Welcome Screen Ambience State, Card Builder & Entry Flash
// (src/ui/WelcomeAmbienceAndParticles.js)
// Coordinates the 3-Pill Time-of-Day Ambience Switcher (Morning / Sunset / Night),
// destination-reactive CSS custom properties, card DOM builder, and entry flash.
// ============================================================================

import {
  SINGAPORE_DESTINATIONS,
  getDestinationById,
  getWelcomeAmbienceById,
  buildDestinationArtBanner
} from '../../data/SingaporeDestinationsSpec.js';
import { SoundFX } from '../../audio/SoundFX.js';

const AMBIENCE_STORAGE_KEY = 'gbb_welcome_ambience_mood_v1';

function loadInitialAmbienceMood() {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage?.getItem(AMBIENCE_STORAGE_KEY);
      if (saved === 'morning' || saved === 'sunset' || saved === 'night') {
        return saved;
      }
    } catch (_) {
      // Ignore storage access errors
    }
  }
  return 'morning';
}

let activeAmbienceMood = loadInitialAmbienceMood();
let userExplicitlyPickedMood = false;

export function getSelectedWelcomeAmbienceMood() {
  return activeAmbienceMood;
}

export function hasUserSelectedWelcomeAmbienceMood() {
  return userExplicitlyPickedMood;
}

export function setSelectedWelcomeAmbienceMood(moodId, isUserAction = true) {
  const preset = getWelcomeAmbienceById(moodId);
  activeAmbienceMood = preset.id;
  if (isUserAction) {
    userExplicitlyPickedMood = true;
  }
  if (typeof window !== 'undefined') {
    window.__gbbWelcomeAmbienceMood = preset.id;
    try {
      window.localStorage?.setItem(AMBIENCE_STORAGE_KEY, preset.id);
    } catch (_) {
      // Ignore storage errors
    }
  }
  return preset;
}

export function syncWelcomeOverlayAtmosphere(overlayEl, mapController, destOrId, moodId = activeAmbienceMood) {
  if (!overlayEl) return;
  const dest = typeof destOrId === 'string' ? getDestinationById(destOrId) : destOrId;
  const mood = getWelcomeAmbienceById(moodId);
  const atmo = dest.atmosphere || {};

  overlayEl.dataset.activeDest = dest.id;
  overlayEl.dataset.welcomeMood = mood.id;

  // Higher-order design token & destination-reactive CSS custom properties
  overlayEl.style.setProperty('--welcome-mood', mood.id);
  overlayEl.style.setProperty('--welcome-dest-accent', dest.accentHex);
  overlayEl.style.setProperty('--welcome-dest-secondary', atmo.accentSecondary || dest.accentHex);
  overlayEl.style.setProperty('--welcome-dest-gold', atmo.goldHighlight || '#FEF08A');
  overlayEl.style.setProperty('--welcome-dest-glow', dest.glowHex);
  overlayEl.style.setProperty('--welcome-shell-glow', atmo.shellGlow || dest.glowHex);
  overlayEl.style.setProperty('--welcome-aura-bg', atmo.overlayRadialBg || '');

  mapController?.setAtmosphereState?.(dest, mood.id);
}

export function triggerCinematicWelcomeEntryFlash(overlayEl, destOrId, moodId, onComplete) {
  const dest = typeof destOrId === 'string' ? getDestinationById(destOrId) : destOrId;
  const mood = getWelcomeAmbienceById(moodId || activeAmbienceMood);

  if (typeof window !== 'undefined') {
    window.__gbbWelcomeAmbienceMood = mood.lookDevPreset;
    window.gbbApp?.applyLookDevSettings?.({
      lighting: { preset: mood.lookDevPreset }
    });
  }

  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (!overlayEl || reducedMotion) {
    onComplete?.(dest.id, mood.lookDevPreset);
    return;
  }

  let flashEl = overlayEl.querySelector('.sg-cinematic-entry-flash');
  if (!flashEl) {
    flashEl = document.createElement('div');
    flashEl.className = 'sg-cinematic-entry-flash';
    flashEl.setAttribute('aria-hidden', 'true');
    overlayEl.appendChild(flashEl);
  }

  flashEl.style.setProperty('--flash-accent', dest.accentHex);
  flashEl.style.setProperty('--flash-gold', dest.atmosphere?.goldHighlight || '#FEF08A');
  flashEl.innerHTML = `
    <div class="sg-entry-flash-badge">
      <span class="sg-entry-flash-icon">${dest.icon}</span>
      <strong>Entering ${dest.name}</strong>
      <small>${mood.pillLabel} • ${dest.atmosphere?.moodTitle || dest.district}</small>
    </div>
  `;

  flashEl.classList.remove('is-active');
  void flashEl.offsetWidth;
  flashEl.classList.add('is-active');
  SoundFX.playCollect?.(true);

  setTimeout(() => {
    onComplete?.(dest.id, mood.lookDevPreset);
    setTimeout(() => {
      flashEl?.classList.remove('is-active');
    }, 220);
  }, 240);
}

export function buildWelcomeDestinationSlides({
  trackEl,
  markersEl,
  slideEls,
  markerBtns,
  onSelectIdx,
  onEnterDest
}) {
  trackEl.innerHTML = '';
  if (markersEl) markersEl.innerHTML = '';
  slideEls.length = 0;
  markerBtns.length = 0;

  SINGAPORE_DESTINATIONS.forEach((dest, idx) => {
    const card = document.createElement('article');
    card.className = `sg-dest-card ${dest.status === 'live' ? 'is-live' : 'is-soon'}`;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-roledescription', 'slide');
    card.setAttribute('aria-label', `${idx + 1} of ${SINGAPORE_DESTINATIONS.length}: ${dest.name}`);
    card.dataset.destId = dest.id;
    card.dataset.destIdx = String(idx);
    card.style.setProperty('--card-accent', dest.accentHex);
    card.tabIndex = 0;

    card.innerHTML = `
      <div class="sg-card-hero" style="background: ${dest.bannerGradient};">
        <div class="sg-card-visual-center">
          ${buildDestinationArtBanner(dest)}
        </div>
      </div>

      <div class="sg-card-body">
        <div class="sg-card-title-row">
          <h3 class="sg-card-title">${dest.name}</h3>
          <div class="sg-card-meta-line">
            <span>${dest.district}</span>
            <span aria-hidden="true">·</span>
            <span>${dest.relicCountLabel}</span>
            <span aria-hidden="true">·</span>
            <span class="sg-card-meta-status ${dest.status === 'live' ? 'is-live' : 'is-soon'}">${dest.statusBadge}</span>
          </div>
        </div>

        <p class="sg-card-tagline">${dest.tagline}</p>

        <div class="sg-card-highlights">
          ${dest.highlights.join(' · ')}
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      if (card.classList.contains('is-centered') && dest.status === 'live') {
        onEnterDest(dest.id);
        return;
      }
      onSelectIdx(idx);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEnterDest(dest.id);
      }
    });

    trackEl.appendChild(card);
    slideEls.push(card);

    if (markersEl) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'sg-marker-dot';
      dot.dataset.destIdx = String(idx);
      dot.title = dest.name;
      dot.setAttribute('aria-label', `Go to ${dest.name}`);
      dot.innerHTML = `<span class="sg-visually-hidden">${dest.shortName}</span>`;
      dot.addEventListener('click', () => onSelectIdx(idx));
      markersEl.appendChild(dot);
      markerBtns.push(dot);
    }
  });
}
