// ============================================================================
// Singapore Destinations Catalog — Screen 00 Welcome Map & Emotional Ambience
// Ordered itinerary across Singapore: Gardens by the Bay, Botanic Gardens,
// Sentosa Island, and Haw Par Villa, with Destination-Reactive Atmosphere
// & Interactive Time-of-Day Ambience Presets.
// (src/data/SingaporeDestinationsSpec.js)
// ============================================================================

export const WELCOME_AMBIENCE_PRESETS = [
  {
    id: 'morning',
    icon: '☀️',
    label: 'Sunlit Morning',
    pillLabel: '☀️ Sunlit Morning',
    lookDevPreset: 'morning',
    seaPalette: ['#0EA5E9', '#0284C7', '#075985'],
    landPalette: ['#86EFAC', '#22C55E', '#0D9488'],
    horizonOpacity: '0.28',
    nightBeaconsOpacity: '0.12',
    waterShimmerOpacity: '0.52',
    particleDensity: 0.68
  },
  {
    id: 'sunset',
    icon: '🌅',
    label: 'Golden Sunset',
    pillLabel: '🌅 Golden Sunset',
    lookDevPreset: 'sunset',
    seaPalette: ['#0E7490', '#0F5257', '#1E1B4B'],
    landPalette: ['#A7F3D0', '#10B981', '#0F766E'],
    horizonOpacity: '0.68',
    nightBeaconsOpacity: '0.58',
    waterShimmerOpacity: '0.78',
    particleDensity: 0.92
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Enchanted Night',
    pillLabel: '🌙 Enchanted Night',
    lookDevPreset: 'night',
    seaPalette: ['#083344', '#041E2B', '#020B14'],
    landPalette: ['#10B981', '#047857', '#064E3B'],
    horizonOpacity: '0.85',
    nightBeaconsOpacity: '1.0',
    waterShimmerOpacity: '0.95',
    particleDensity: 1.0
  }
];

export const SINGAPORE_DESTINATIONS = [
  {
    id: 'gbb',
    orderLabel: '01',
    name: 'Gardens by the Bay',
    shortName: 'Gardens by the Bay',
    district: 'Marina Bay South Waterfront',
    coordsLabel: '1.2816° N, 103.8636° E',
    icon: '🌿',
    status: 'live',
    statusBadge: '✅ LIVE 3D WORLD • 69 GLBs',
    relicCountLabel: '42 Iconic Keepsakes • 1:1 Calibrated',
    pinPos: { x: 542, y: 404 },
    pinLabelPos: 'right',
    accentHex: '#10B981',
    glowHex: 'rgba(34, 211, 238, 0.56)',
    bannerGradient: 'linear-gradient(135deg, #064E3B 0%, #0F766E 48%, #4F46E5 100%)',
    previewImg: './assets/renders/models/model_01_supertree_hero.png',
    highlights: ['🌳 Supertree Grove', '🏛️ Flower Dome', '☁️ Cloud Forest'],
    tagline: 'Flagship Bay South peninsula with glowing 18 Supertrees, Dragonfly Lake, and the Garden Rhapsody night show.',
    ctaLabel: '🚀 Enter Gardens by the Bay',
    atmosphere: {
      moodTitle: '✨ Bioluminescent Supertree Twilight',
      moodSub: 'Cyan, Magenta & Gold Rhapsody Motes',
      accentSecondary: '#E879F9',
      goldHighlight: '#FACC15',
      overlayRadialBg:
        'radial-gradient(circle at 34% 28%, rgba(34, 211, 238, 0.38) 0%, rgba(192, 132, 252, 0.24) 46%, rgba(2, 16, 32, 0.84) 100%)',
      shellGlow: 'rgba(34, 211, 238, 0.46)',
      spotlightStop0: '#FDE047',
      spotlightStop1: '#22D3EE',
      particleType: 'motes',
      particleColors: ['#22D3EE', '#E879F9', '#FDE047', '#34D399']
    }
  },
  {
    id: 'sbg',
    orderLabel: '02',
    name: 'Botanic Gardens',
    shortName: 'Botanic Gardens',
    district: 'Tanglin UNESCO Heritage Core',
    coordsLabel: '1.3138° N, 103.8159° E',
    icon: '🦢',
    status: 'live',
    statusBadge: '✅ LIVE 3D WORLD • 69 GLBs',
    relicCountLabel: '42 UNESCO Relics • 1:1 X/Y Audit',
    pinPos: { x: 444, y: 318 },
    pinLabelPos: 'top',
    accentHex: '#34D399',
    glowHex: 'rgba(52, 211, 153, 0.54)',
    bannerGradient: 'linear-gradient(135deg, #14532D 0%, #059669 52%, #D97706 100%)',
    previewImg: './assets/renders/sbg/sbg_building_01_bandstand_gazebo_1930.png',
    highlights: ['🏛️ 1930 Bandstand', '🌺 National Orchid Garden', '🦢 Swan Lake'],
    tagline: 'Singapore’s 1859 UNESCO World Heritage site featuring the $5-note Tembusu Tree, Symphony Stage & Orchid arches.',
    ctaLabel: '🦢 Enter Botanic Gardens',
    atmosphere: {
      moodTitle: '🦢 Sunlit Emerald Mist & Symphony Golden Hour',
      moodSub: 'Drifting Golden Orchid Petals & Heritage Fireflies',
      accentSecondary: '#FBBF24',
      goldHighlight: '#FEF08A',
      overlayRadialBg:
        'radial-gradient(circle at 34% 28%, rgba(16, 185, 129, 0.42) 0%, rgba(245, 158, 11, 0.28) 48%, rgba(4, 32, 24, 0.82) 100%)',
      shellGlow: 'rgba(52, 211, 153, 0.5)',
      spotlightStop0: '#FEF08A',
      spotlightStop1: '#34D399',
      particleType: 'petals',
      particleColors: ['#FEF08A', '#FBBF24', '#6EE7B7', '#F472B6']
    }
  },
  {
    id: 'sentosa',
    orderLabel: '03',
    name: 'Sentosa Island',
    shortName: 'Sentosa',
    district: 'Southern Resort Island',
    coordsLabel: '1.2494° N, 103.8303° E',
    icon: '🏝️',
    status: 'soon',
    statusBadge: '🚧 COMING SOON',
    relicCountLabel: '42 Coastal Relics (Planned)',
    pinPos: { x: 462, y: 472 },
    pinLabelPos: 'bottom',
    accentHex: '#38BDF8',
    glowHex: 'rgba(56, 189, 248, 0.52)',
    bannerGradient: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 52%, #F97316 100%)',
    previewImg: '',
    highlights: ['🏖️ Siloso & Palawan', '🚡 Mount Faber Cable Car', '🏰 Fort Siloso'],
    tagline: 'Tropical beach coves, swaying suspension bridges to Southernmost Asia, seafront forts, and sunset boardwalks.',
    ctaLabel: '🏝️ Preview Sentosa Island',
    atmosphere: {
      moodTitle: '🏝️ Tropical Sunset Coral & Turquoise Lagoon',
      moodSub: 'Warm Coral Horizon & Lagoon Shimmer',
      accentSecondary: '#FB923C',
      goldHighlight: '#FDE047',
      overlayRadialBg:
        'radial-gradient(circle at 36% 32%, rgba(14, 165, 233, 0.42) 0%, rgba(249, 115, 22, 0.28) 48%, rgba(7, 28, 48, 0.82) 100%)',
      shellGlow: 'rgba(56, 189, 248, 0.48)',
      spotlightStop0: '#FDBA74',
      spotlightStop1: '#38BDF8',
      particleType: 'lagoon',
      particleColors: ['#38BDF8', '#FB923C', '#FDE047', '#5EEAD4']
    }
  },
  {
    id: 'hawpar',
    orderLabel: '04',
    name: 'Haw Par Villa',
    shortName: 'Haw Par Villa',
    district: 'Pasir Panjang Heritage Hill',
    coordsLabel: '1.2825° N, 103.7817° E',
    icon: '🐉',
    status: 'soon',
    statusBadge: '🚧 COMING SOON',
    relicCountLabel: '42 Mythic Relics (Planned)',
    pinPos: { x: 356, y: 392 },
    pinLabelPos: 'left',
    accentHex: '#F59E0B',
    glowHex: 'rgba(245, 158, 11, 0.54)',
    bannerGradient: 'linear-gradient(135deg, #7C2D12 0%, #B45309 50%, #DC2626 100%)',
    previewImg: '',
    highlights: ['⛩️ Crimson Paifang Gate', '🐉 Nine-Dragon Wall', '🏮 Jade Pagoda'],
    tagline: 'Vibrant 1937 hillside folklore park filled with colorful guardian deities, pagodas, Koi ponds, and lantern arches.',
    ctaLabel: '🐉 Preview Haw Par Villa',
    atmosphere: {
      moodTitle: '🐉 Mythical Crimson & Imperial Gold Lantern Aura',
      moodSub: 'Floating Imperial Lantern Embers & Jade Mist',
      accentSecondary: '#EF4444',
      goldHighlight: '#FEF08A',
      overlayRadialBg:
        'radial-gradient(circle at 32% 30%, rgba(220, 38, 38, 0.38) 0%, rgba(245, 158, 11, 0.32) 48%, rgba(24, 10, 12, 0.85) 100%)',
      shellGlow: 'rgba(245, 158, 11, 0.52)',
      spotlightStop0: '#FEF08A',
      spotlightStop1: '#EF4444',
      particleType: 'lanterns',
      particleColors: ['#F59E0B', '#EF4444', '#FEF08A', '#F97316']
    }
  }
];

export function getDestinationById(destId) {
  return SINGAPORE_DESTINATIONS.find((d) => d.id === destId) || SINGAPORE_DESTINATIONS[0];
}

export function getWelcomeAmbienceById(moodId) {
  return WELCOME_AMBIENCE_PRESETS.find((m) => m.id === moodId) || WELCOME_AMBIENCE_PRESETS[1];
}

export function buildDestinationArtBanner(dest) {
  if (dest.previewImg) {
    return `<img src="${dest.previewImg}" alt="${dest.name} 3D Miniature Preview" class="sg-card-art-img" loading="eager" />`;
  }
  return dest.id === 'sentosa'
    ? `<svg viewBox="0 0 240 120" class="sg-card-art-svg" aria-hidden="true">
         <circle cx="182" cy="34" r="18" fill="#FEF08A" opacity="0.9" />
         <path d="M0 90 Q60 72 120 88 T240 84 L240 120 L0 120 Z" fill="#0284C7" opacity="0.7" />
         <path d="M24 94 Q96 66 176 96 L186 112 L16 112 Z" fill="#FDE68A" />
         <path d="M128 84 Q142 52 154 38 M154 38 Q138 30 124 38 M154 38 Q168 28 178 40 M154 38 Q158 54 148 56" stroke="#15803D" stroke-width="3.5" fill="none" stroke-linecap="round"/>
       </svg>`
    : `<svg viewBox="0 0 240 120" class="sg-card-art-svg" aria-hidden="true">
         <circle cx="120" cy="48" r="28" fill="#FEF08A" opacity="0.22" />
         <path d="M74 96 L166 96 L154 78 L86 78 Z" fill="#DC2626" stroke="#FEF08A" stroke-width="2" />
         <path d="M88 78 L152 78 L142 58 L98 58 Z" fill="#B91C1C" stroke="#FEF08A" stroke-width="2" />
         <path d="M100 58 L140 58 L120 30 Z" fill="#F59E0B" stroke="#FEF08A" stroke-width="2" />
         <line x1="120" y1="20" x2="120" y2="30" stroke="#FEF08A" stroke-width="3" />
       </svg>`;
}
