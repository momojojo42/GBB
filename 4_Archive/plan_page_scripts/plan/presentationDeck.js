/**
 * ============================================================================
 * TECHNICAL SHARING SLIDE DECK CONTROLLER (src/plan/presentationDeck.js)
 * ============================================================================
 * Keyboard & button navigation (Arrow Left/Right, Space, 1-0, N for Speaker
 * Notes, F for Fullscreen, P for Print/PDF), prompt copy buttons, and image
 * zoom lightbox for `presentation.html`.
 */

const slides = Array.from(document.querySelectorAll('.slide-frame'));
const dotBtns = Array.from(document.querySelectorAll('.slide-dot-btn'));
const prevBtn = document.getElementById('prevSlideBtn');
const nextBtn = document.getElementById('nextSlideBtn');
const counterLabel = document.getElementById('slideCounterLabel');
const progressFill = document.getElementById('deckProgressFill');
const toggleNotesBtn = document.getElementById('toggleNotesBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const printDeckBtn = document.getElementById('printDeckBtn');

let currentIndex = 0;

function goToSlide(index) {
  const total = slides.length;
  if (total === 0) return;
  currentIndex = Math.max(0, Math.min(total - 1, index));

  slides.forEach((s, i) => {
    s.classList.toggle('active', i === currentIndex);
  });

  dotBtns.forEach((b, i) => {
    b.classList.toggle('active', i === currentIndex);
  });

  if (counterLabel) {
    counterLabel.textContent = `Slide ${currentIndex + 1} / ${total}`;
  }

  if (progressFill) {
    const pct = ((currentIndex + 1) / total) * 100;
    progressFill.style.width = `${pct}%`;
  }

  window.location.hash = `slide-${currentIndex + 1}`;
}

function nextSlide() {
  if (currentIndex < slides.length - 1) {
    goToSlide(currentIndex + 1);
  }
}

function prevSlide() {
  if (currentIndex > 0) {
    goToSlide(currentIndex - 1);
  }
}

if (prevBtn) prevBtn.addEventListener('click', prevSlide);
if (nextBtn) nextBtn.addEventListener('click', nextSlide);

dotBtns.forEach((btn, idx) => {
  btn.addEventListener('click', () => goToSlide(idx));
});

if (toggleNotesBtn) {
  toggleNotesBtn.addEventListener('click', () => {
    const showing = document.body.classList.toggle('show-notes');
    toggleNotesBtn.textContent = showing ? '🗣️ Hide Notes [N]' : '🗣️ Speaker Notes [N]';
  });
}

if (fullscreenBtn) {
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });
}

if (printDeckBtn) {
  printDeckBtn.addEventListener('click', () => {
    window.print();
  });
}

// Copyable Prompt Recipes
document.querySelectorAll('[data-copy-target]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy-target');
    const el = document.getElementById(targetId);
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.textContent.trim());
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    } catch (_e) {
      // ignore clipboard errors
    }
  });
});

// Lightbox Image Viewer
const lightbox = document.getElementById('pptLightbox');
const lightboxImg = document.getElementById('pptLightboxImg');
const lightboxCap = document.getElementById('pptLightboxCaption');

document.querySelectorAll('.ppt-img-box[data-zoom-src]').forEach((box) => {
  box.addEventListener('click', () => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = box.getAttribute('data-zoom-src');
    if (lightboxCap) {
      lightboxCap.textContent = box.getAttribute('data-zoom-caption') || '';
    }
    lightbox.classList.add('open');
  });
});

if (lightbox) {
  lightbox.addEventListener('click', () => {
    lightbox.classList.remove('open');
  });
}

// Keyboard Navigation
window.addEventListener('keydown', (e) => {
  if (lightbox && lightbox.classList.contains('open')) {
    if (e.key === 'Escape') lightbox.classList.remove('open');
    return;
  }
  if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'n' || e.key === 'N') {
    if (toggleNotesBtn) toggleNotesBtn.click();
  } else if (e.key === 'f' || e.key === 'F') {
    if (fullscreenBtn) fullscreenBtn.click();
  }
});

// Restore slide from URL hash if present
const hashMatch = window.location.hash.match(/slide-(\d+)/);
if (hashMatch) {
  const idx = parseInt(hashMatch[1], 10) - 1;
  goToSlide(idx);
} else {
  goToSlide(0);
}
