/**
 * ============================================================================
 * PROGRESS GALLERY INTERACTIVE CONTROLLER (src/plan/progressGallery.js)
 * ============================================================================
 * Powers the collapsible milestone accordions, Step 1–10 filter buttons,
 * Step 2 Blender category sub-filters, Executive Progress Log, and full-res
 * lightbox modal on `progress.html`.
 */
import { initExecutiveProgressLog } from './progressExecutiveLog.js';

const filterBtns = document.querySelectorAll('.filter-btn[data-filter]');
const stepPills = document.querySelectorAll('.step-pill[data-step-jump]');
const m1SubBtns = document.querySelectorAll('.m1-sub-btn');
const sections = document.querySelectorAll('.milestone-section');
const allCards = document.querySelectorAll('.shot-card');
const m1Cards = document.querySelectorAll('#m1CardsGrid .shot-card');
const expandAllBtn = document.getElementById('expandAllBtn');
const collapseAllBtn = document.getElementById('collapseAllBtn');

function updateAccordionBadge(sec) {
  const pill = sec.querySelector('.accordion-toggle-pill');
  if (!pill) return;
  const count = sec.querySelectorAll('.shot-card').length;
  const isCollapsed = sec.classList.contains('collapsed');
  pill.textContent = isCollapsed
    ? `▶ Expand (${count})`
    : `▼ Collapse (${count})`;
}

sections.forEach((sec) => {
  if (sec.dataset.defaultOpen !== 'true') {
    sec.classList.add('collapsed');
  }
  const header = sec.querySelector('.milestone-header');
  const h2 = header ? header.querySelector('h2') : null;
  if (h2 && !h2.querySelector('.accordion-toggle-pill')) {
    const pill = document.createElement('span');
    pill.className = 'accordion-toggle-pill';
    h2.appendChild(pill);
  }
  updateAccordionBadge(sec);

  if (header) {
    header.addEventListener('click', () => {
      sec.classList.toggle('collapsed');
      updateAccordionBadge(sec);
    });
  }
});

if (expandAllBtn) {
  expandAllBtn.addEventListener('click', () => {
    sections.forEach((sec) => {
      sec.style.display = 'block';
      sec.classList.remove('collapsed');
      updateAccordionBadge(sec);
    });
  });
}

if (collapseAllBtn) {
  collapseAllBtn.addEventListener('click', () => {
    sections.forEach((sec) => {
      sec.classList.add('collapsed');
      updateAccordionBadge(sec);
    });
  });
}

function matchesM1SubCat(card, subCat) {
  if (!subCat || subCat === 'all') return true;
  return card.dataset.m1cat === subCat || card.dataset.reliccat === subCat;
}

function activateStepFilter(filter) {
  filterBtns.forEach((b) => {
    b.classList.toggle('active', b.dataset.filter === filter);
  });

  if (filter === 'v2only') {
    sections.forEach((sec) => {
      if (sec.dataset.section === 'blueprints') {
        sec.style.display = 'none';
      } else {
        sec.style.display = 'block';
        sec.classList.remove('collapsed');
        updateAccordionBadge(sec);
      }
    });
    allCards.forEach((card) => {
      card.style.display = (card.dataset.ver === 'v2') ? 'flex' : 'none';
    });
  } else if (filter === 'all') {
    allCards.forEach((card) => { card.style.display = 'flex'; });
    sections.forEach((sec) => {
      sec.style.display = 'block';
      updateAccordionBadge(sec);
    });
  } else {
    allCards.forEach((card) => { card.style.display = 'flex'; });
    sections.forEach((sec) => {
      sec.style.display = 'block';
      if (sec.dataset.section === filter) {
        sec.classList.remove('collapsed');
        updateAccordionBadge(sec);
        sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        sec.classList.add('collapsed');
        updateAccordionBadge(sec);
      }
    });
  }

  const activeSub = document.querySelector('.m1-sub-btn.active');
  if (activeSub && activeSub.dataset.m1cat !== 'all') {
    const subCat = activeSub.dataset.m1cat;
    m1Cards.forEach((c) => {
      c.style.display = matchesM1SubCat(c, subCat) ? 'flex' : 'none';
    });
  }
}

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => activateStepFilter(btn.dataset.filter));
});

stepPills.forEach((pill) => {
  pill.addEventListener('click', () => activateStepFilter(pill.dataset.stepJump));
});

initExecutiveProgressLog({
  onJumpToSection: (key) => activateStepFilter(key)
});

m1SubBtns.forEach((subBtn) => {
  subBtn.addEventListener('click', () => {
    m1SubBtns.forEach((b) => b.classList.remove('active'));
    subBtn.classList.add('active');
    const subCat = subBtn.dataset.m1cat;
    m1Cards.forEach((card) => {
      card.style.display = matchesM1SubCat(card, subCat) ? 'flex' : 'none';
    });
  });
});

// Lightbox viewer
const modal = document.getElementById('lightboxModal');
const modalImg = document.getElementById('lightboxImage');
const modalCap = document.getElementById('lightboxCaption');
const closeBtn = document.getElementById('lightboxCloseBtn');

document.querySelectorAll('[data-lightbox]').forEach((wrap) => {
  wrap.addEventListener('click', () => {
    modalImg.src = wrap.dataset.lightbox;
    modalCap.textContent = wrap.dataset.caption || '';
    modal.classList.add('open');
  });
});

if (closeBtn && modal) {
  closeBtn.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') modal.classList.remove('open');
  });
}
