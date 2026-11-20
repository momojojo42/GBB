// ============================================================================
// Singapore Map Welcome Screen & Scroll-Effect Destination Selector
// (src/ui/WelcomeSingaporeMapController.js)
// Combines the interactive Singapore Island Map + Time-of-Day Ambience Switcher
// with a scroll-snap destination carousel (GBB, SBG, Sentosa, Haw Par Villa).
// ============================================================================

import {
  SINGAPORE_DESTINATIONS,
  getDestinationById
} from '../../data/SingaporeDestinationsSpec.js';
import { mountSingaporeInteractiveMap } from './SingaporeMapSvgRenderer.js';
import {
  getSelectedWelcomeAmbienceMood,
  setSelectedWelcomeAmbienceMood,
  syncWelcomeOverlayAtmosphere,
  triggerCinematicWelcomeEntryFlash,
  buildWelcomeDestinationSlides
} from './WelcomeAmbienceAndParticles.js';
import { getActiveMapId } from '../../data/MapRegistry.js';
import { SoundFX } from '../../audio/SoundFX.js';

export function createWelcomeSingaporeMapController({
  onEnterPlayableMap,
  onReturnToCurrentGame,
  showToast
}) {
  const overlayEl = document.getElementById('screenWelcomeMapOverlay');
  const mapStageEl = document.getElementById('sgWelcomeMapStage');
  const trackEl = document.getElementById('sgScrollTrack');
  const markersEl = document.getElementById('sgScrollMarkers');
  const statusEl = document.getElementById('sgScrollStatus');
  const btnPrev = document.getElementById('btnSgCarouselPrev');
  const btnNext = document.getElementById('btnSgCarouselNext');
  const btnEnterSelected = document.getElementById('btnSgEnterSelectedMap');
  const btnSkipDefaultGbb = document.getElementById('btnSgSkipToDefaultGbb');
  const comingSoonNoteEl = document.getElementById('sgComingSoonPreviewNote');

  if (!overlayEl || !mapStageEl || !trackEl) {
    return { bindWelcomeEvents: () => {}, focusDestination: () => {}, openWelcomeScreen: () => {} };
  }

  let currentIdx = 0;
  let lastSettledIdx = 0;
  let pendingTargetIdx = null;
  let pendingTargetScrollLeft = null;
  let mapController = null;
  let scrollRafId = null;
  let settleTimer = null;

  const slideEls = [];
  const markerBtns = [];
  const fallbackAnims = new Map();

  function setupWaapiFallbackIfNeeded() {
    const supportsNative =
      typeof CSS !== 'undefined' &&
      CSS.supports('(animation-timeline: view()) and (animation-range: entry)');
    const prefersNoReducedMotion =
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
    if (supportsNative || !prefersNoReducedMotion) return;

    slideEls.forEach((el) => {
      const anim = el.animate(
        [
          { transform: 'scale(0.88)', opacity: 0.72 },
          { transform: 'scale(1)', opacity: 1 },
          { transform: 'scale(0.88)', opacity: 0.72 }
        ],
        { duration: 1, fill: 'both' }
      );
      anim.pause();
      fallbackAnims.set(el, anim);
    });
  }

  function tickFallbackScrollAnimations() {
    if (!fallbackAnims.size) return;
    const trackRect = trackEl.getBoundingClientRect();
    if (trackRect.width <= 0) return;
    slideEls.forEach((el) => {
      const anim = fallbackAnims.get(el);
      if (!anim) return;
      const rect = el.getBoundingClientRect();
      const raw = (rect.left + rect.width * 0.5 - trackRect.left) / trackRect.width;
      anim.currentTime = Math.max(0.01, Math.min(0.99, raw));
    });
  }

  function computeNearestSlideIndex() {
    const trackCenter = trackEl.scrollLeft + trackEl.clientWidth * 0.5;
    let bestIdx = 0;
    let bestDist = Infinity;
    slideEls.forEach((el, idx) => {
      const elCenter = el.offsetLeft + el.offsetWidth * 0.5;
      const d = Math.abs(elCenter - trackCenter);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = idx;
      }
    });
    return bestIdx;
  }

  function syncActiveDestinationUI(idx) {
    const count = SINGAPORE_DESTINATIONS.length;
    const safeIdx = ((idx % count) + count) % count;
    currentIdx = safeIdx;
    const dest = SINGAPORE_DESTINATIONS[safeIdx];

    slideEls.forEach((el, i) => el.classList.toggle('is-centered', i === safeIdx));
    markerBtns.forEach((btn, i) => {
      const active = i === safeIdx;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'true');
      else btn.removeAttribute('aria-current');
    });

    mapController?.setActivePin(dest.id);
    syncWelcomeOverlayAtmosphere(overlayEl, mapController, dest, getSelectedWelcomeAmbienceMood());

    if (btnEnterSelected) {
      btnEnterSelected.textContent =
        dest.status === 'live' ? `${dest.ctaLabel} →` : `🚧 ${dest.shortName} Coming Soon`;
      btnEnterSelected.classList.toggle('is-soon-cta', dest.status !== 'live');
    }

    if (comingSoonNoteEl) {
      if (dest.status === 'soon') {
        comingSoonNoteEl.textContent = `🚧 ${dest.name} (${dest.district}) is scheduled in our next expansion! Scroll back left to enter Gardens by the Bay or Botanic Gardens in 3D now.`;
        comingSoonNoteEl.classList.remove('hidden');
      } else {
        comingSoonNoteEl.classList.add('hidden');
      }
    }
  }

  function handleSettledScroll(announce = true) {
    if (
      pendingTargetScrollLeft !== null &&
      Math.abs(trackEl.scrollLeft - pendingTargetScrollLeft) < 2
    ) {
      return;
    }
    pendingTargetIdx = null;
    pendingTargetScrollLeft = null;
    const settledIdx = computeNearestSlideIndex();
    syncActiveDestinationUI(settledIdx);

    if (announce && settledIdx !== lastSettledIdx && statusEl) {
      const dest = SINGAPORE_DESTINATIONS[settledIdx];
      statusEl.textContent = `Slide ${settledIdx + 1} of ${SINGAPORE_DESTINATIONS.length}: ${dest.name}`;
    }
    lastSettledIdx = settledIdx;
  }

  function scrollToSlideIndex(targetIdx, behavior) {
    const count = SINGAPORE_DESTINATIONS.length;
    const wrapped = ((targetIdx % count) + count) % count;
    const slide = slideEls[wrapped];
    if (!slide) return;

    const targetLeft = slide.offsetLeft - (trackEl.clientWidth - slide.offsetWidth) * 0.5;
    pendingTargetIdx = wrapped;
    pendingTargetScrollLeft = trackEl.scrollLeft;
    syncActiveDestinationUI(wrapped);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    trackEl.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: behavior || (reducedMotion ? 'auto' : 'smooth')
    });
  }

  function triggerEnterDestination(destId) {
    const dest = getDestinationById(destId);
    if (dest.status === 'live') {
      triggerCinematicWelcomeEntryFlash(
        overlayEl,
        dest,
        getSelectedWelcomeAmbienceMood(),
        (enteredId, moodPreset) => {
          onEnterPlayableMap?.(enteredId, moodPreset);
        }
      );
      return;
    }

    const idx = SINGAPORE_DESTINATIONS.findIndex((d) => d.id === dest.id);
    if (idx >= 0) scrollToSlideIndex(idx);
    SoundFX.playClick?.();
    showToast?.(`🚧 ${dest.name} is coming soon! Enter Gardens by the Bay or Botanic Gardens right now.`);
  }

  function bindDragAndWheelScroll() {
    overlayEl.addEventListener(
      'wheel',
      (e) => {
        if (overlayEl.classList.contains('hidden')) return;
        const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        if (Math.abs(delta) < 1) return;
        e.preventDefault();
        trackEl.scrollLeft += delta * 1.15;
      },
      { passive: false }
    );

    let isDragging = false;
    let dragStartX = 0;
    let startScrollLeft = 0;

    trackEl.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      isDragging = true;
      dragStartX = e.clientX;
      startScrollLeft = trackEl.scrollLeft;
      trackEl.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      trackEl.scrollLeft = startScrollLeft - (e.clientX - dragStartX);
    });

    window.addEventListener('pointerup', () => {
      if (!isDragging) return;
      isDragging = false;
      trackEl.classList.remove('is-dragging');
    });
  }

  function bindWelcomeEvents() {
    buildWelcomeDestinationSlides({
      trackEl,
      markersEl,
      slideEls,
      markerBtns,
      onSelectIdx: (idx) => scrollToSlideIndex(idx),
      onEnterDest: (destId) => triggerEnterDestination(destId)
    });

    mapController = mountSingaporeInteractiveMap(
      mapStageEl,
      (destId) => {
        const idx = SINGAPORE_DESTINATIONS.findIndex((d) => d.id === destId);
        if (idx >= 0) scrollToSlideIndex(idx);
      },
      (moodId) => {
        const preset = setSelectedWelcomeAmbienceMood(moodId, true);
        const dest = SINGAPORE_DESTINATIONS[currentIdx] || SINGAPORE_DESTINATIONS[0];
        syncWelcomeOverlayAtmosphere(overlayEl, mapController, dest, preset.id);
        SoundFX.playClick?.();
        showToast?.(`${preset.pillLabel} Ambience — ${dest.atmosphere?.moodTitle || dest.name}`);
      }
    );
    setupWaapiFallbackIfNeeded();
    bindDragAndWheelScroll();

    btnPrev?.addEventListener('click', () => {
      const base = pendingTargetIdx !== null ? pendingTargetIdx : currentIdx;
      scrollToSlideIndex(base - 1);
    });

    btnNext?.addEventListener('click', () => {
      const base = pendingTargetIdx !== null ? pendingTargetIdx : currentIdx;
      scrollToSlideIndex(base + 1);
    });

    btnEnterSelected?.addEventListener('click', () => {
      const dest = SINGAPORE_DESTINATIONS[currentIdx];
      if (!dest) return;
      if (dest.status === 'live') {
        triggerEnterDestination(dest.id);
      } else {
        scrollToSlideIndex(0);
        showToast?.('🌿 Switched spotlight to Gardens by the Bay — click again to Enter!');
      }
    });

    btnSkipDefaultGbb?.addEventListener('click', () => {
      const moodPreset = getSelectedWelcomeAmbienceMood();
      if (getActiveMapId() !== 'gbb') {
        onEnterPlayableMap?.('gbb', moodPreset);
      } else {
        onReturnToCurrentGame?.(moodPreset);
      }
    });

    if ('onscrollsnapchange' in HTMLElement.prototype) {
      trackEl.addEventListener('scrollsnapchange', (event) => {
        const snapped = event.snapTargetInline;
        const idx = slideEls.indexOf(snapped);
        if (idx >= 0) syncActiveDestinationUI(idx);
      });
    }

    trackEl.addEventListener('scroll', () => {
      if (scrollRafId) cancelAnimationFrame(scrollRafId);
      scrollRafId = requestAnimationFrame(() => {
        tickFallbackScrollAnimations();
        if (pendingTargetIdx === null) {
          const nearest = computeNearestSlideIndex();
          if (nearest !== currentIdx) syncActiveDestinationUI(nearest);
        }
      });
      if (!('onscrollend' in window)) {
        clearTimeout(settleTimer);
        settleTimer = setTimeout(() => handleSettledScroll(true), 120);
      }
    });

    if ('onscrollend' in window) {
      trackEl.addEventListener('scrollend', () => handleSettledScroll(true));
    }

    const activeIdx = Math.max(
      0,
      SINGAPORE_DESTINATIONS.findIndex((d) => d.id === getActiveMapId())
    );
    scrollToSlideIndex(activeIdx, 'auto');
    lastSettledIdx = activeIdx;
    tickFallbackScrollAnimations();
  }

  function openWelcomeScreen() {
    const idx = Math.max(
      0,
      SINGAPORE_DESTINATIONS.findIndex((d) => d.id === getActiveMapId())
    );
    requestAnimationFrame(() => {
      scrollToSlideIndex(idx, 'auto');
      tickFallbackScrollAnimations();
    });
  }

  return {
    bindWelcomeEvents,
    openWelcomeScreen,
    focusDestination: (destId) => {
      const idx = SINGAPORE_DESTINATIONS.findIndex((d) => d.id === destId);
      if (idx >= 0) scrollToSlideIndex(idx);
    }
  };
}
