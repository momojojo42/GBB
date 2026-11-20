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
    icon: '',
    label: 'Day',
    pillLabel: 'Day',
    lookDevPreset: 'morning',
    seaPalette: ['#CDE3E2', '#B7D4D3', '#9EC2C2'],
    landPalette: ['#F3F8F4', '#E1ECE4', '#C6DBCE'],
    horizonOpacity: '0.12',
    nightBeaconsOpacity: '0.0',
    waterShimmerOpacity: '0.28',
    particleDensity: 0.25
  },
  {
    id: 'sunset',
    icon: '',
    label: 'Sunset',
    pillLabel: 'Sunset',
    lookDevPreset: 'sunset',
    seaPalette: ['#BFD6D8', '#95BAC0', '#6E99A5'],
    landPalette: ['#FBF6EC', '#E3EBD9', '#C0D4C4'],
    horizonOpacity: '0.42',
    nightBeaconsOpacity: '0.32',
    waterShimmerOpacity: '0.45',
    particleDensity: 0.45
  },
  {
    id: 'night',
    icon: '',
    label: 'Night',
    pillLabel: 'Night',
    lookDevPreset: 'night',
    seaPalette: ['#123842', '#0B2730', '#061921'],
    landPalette: ['#1F594C', '#14443A', '#0E332C'],
    horizonOpacity: '0.58',
    nightBeaconsOpacity: '0.92',
    waterShimmerOpacity: '0.68',
    particleDensity: 0.72
  }
];

export const SINGAPORE_DESTINATIONS = [
  {
    id: 'gbb',
    orderLabel: '01',
    name: 'Gardens by the Bay',
    shortName: 'Gardens by the Bay',
    district: 'Bay South',
    coordsLabel: '1.2816° N, 103.8636° E',
    icon: '🌿',
    status: 'live',
    statusBadge: 'Live',
    relicCountLabel: '42 Keepsakes',
    pinPos: { x: 542, y: 404 },
    pinLabelPos: 'right',
    accentHex: '#0B4F43',
    glowHex: 'rgba(11, 79, 67, 0.22)',
    bannerGradient: 'linear-gradient(155deg, #DDEAE4 0%, #CEE2D9 100%)',
    previewImg: './assets/renders/models/model_01_supertree_hero.png',
    highlights: ['Supertree Grove', 'Flower Dome', 'Cloud Forest'],
    tagline: 'Bay South waterfront peninsula featuring 18 Supertrees, glass conservatories, and the Garden Rhapsody light show.',
    ctaLabel: 'Enter Gardens by the Bay',
    atmosphere: {
      moodTitle: 'Bay South Waterfront',
      moodSub: 'Supertree Grove & Glass Conservatories',
      accentSecondary: '#0F766E',
      goldHighlight: '#0B4F43',
      overlayRadialBg:
        'radial-gradient(circle at 32% 24%, rgba(212, 232, 226, 0.42) 0%, rgba(15, 42, 40, 0.48) 100%)',
      shellGlow: 'rgba(11, 79, 67, 0.14)',
      spotlightStop0: '#0B4F43',
      spotlightStop1: '#10B981',
      particleType: 'motes',
      particleColors: ['#0F766E', '#10B981', '#D97706']
    }
  },
  {
    id: 'sbg',
    orderLabel: '02',
    name: 'Botanic Gardens',
    shortName: 'Botanic Gardens',
    district: 'Tanglin Heritage',
    coordsLabel: '1.3138° N, 103.8159° E',
    icon: '🦢',
    status: 'live',
    statusBadge: 'Live',
    relicCountLabel: '42 Keepsakes',
    pinPos: { x: 444, y: 318 },
    pinLabelPos: 'top',
    accentHex: '#115E59',
    glowHex: 'rgba(17, 94, 89, 0.22)',
    bannerGradient: 'linear-gradient(155deg, #E2EDE6 0%, #D3E4D7 100%)',
    previewImg: './assets/renders/sbg/sbg_building_01_bandstand_gazebo_1930.png',
    highlights: ['1930 Bandstand', 'National Orchid Garden', 'Swan Lake'],
    tagline: 'Singapore’s 1859 UNESCO World Heritage garden featuring the iconic Tembusu Tree, Symphony Stage, and Orchid arches.',
    ctaLabel: 'Enter Botanic Gardens',
    atmosphere: {
      moodTitle: 'UNESCO Heritage Core',
      moodSub: 'Bandstand Gazebo & Orchid Gardens',
      accentSecondary: '#047857',
      goldHighlight: '#115E59',
      overlayRadialBg:
        'radial-gradient(circle at 32% 24%, rgba(220, 238, 226, 0.42) 0%, rgba(14, 42, 34, 0.48) 100%)',
      shellGlow: 'rgba(17, 94, 89, 0.14)',
      spotlightStop0: '#115E59',
      spotlightStop1: '#34D399',
      particleType: 'petals',
      particleColors: ['#059669', '#D97706', '#6EE7B7']
    }
  },
  {
    id: 'sentosa',
    orderLabel: '03',
    name: 'Sentosa Island',
    shortName: 'Sentosa',
    district: 'Southern Coast',
    coordsLabel: '1.2494° N, 103.8303° E',
    icon: '🏝️',
    status: 'soon',
    statusBadge: 'Coming Soon',
    relicCountLabel: '42 Coastal Relics',
    pinPos: { x: 462, y: 472 },
    pinLabelPos: 'bottom',
    accentHex: '#0F6B82',
    glowHex: 'rgba(15, 107, 130, 0.22)',
    bannerGradient: 'linear-gradient(155deg, #DCECF2 0%, #C8E0EA 100%)',
    previewImg: '',
    highlights: ['Siloso & Palawan', 'Cable Car Ridge', 'Fort Siloso'],
    tagline: 'Tropical beach coves, suspension bridges to Southernmost Asia, coastal forts, and sunlit boardwalks.',
    ctaLabel: 'Sentosa — Coming Soon',
    atmosphere: {
      moodTitle: 'Southern Coastline',
      moodSub: 'Palawan Cove & Coastal Boardwalks',
      accentSecondary: '#0284C7',
      goldHighlight: '#0F6B82',
      overlayRadialBg:
        'radial-gradient(circle at 36% 28%, rgba(204, 232, 242, 0.42) 0%, rgba(12, 36, 52, 0.50) 100%)',
      shellGlow: 'rgba(15, 107, 130, 0.14)',
      spotlightStop0: '#0F6B82',
      spotlightStop1: '#38BDF8',
      particleType: 'lagoon',
      particleColors: ['#0284C7', '#0D9488', '#D97706']
    }
  },
  {
    id: 'hawpar',
    orderLabel: '04',
    name: 'Haw Par Villa',
    shortName: 'Haw Par Villa',
    district: 'Pasir Panjang',
    coordsLabel: '1.2825° N, 103.7817° E',
    icon: '🐉',
    status: 'soon',
    statusBadge: 'Coming Soon',
    relicCountLabel: '42 Folklore Relics',
    pinPos: { x: 356, y: 392 },
    pinLabelPos: 'left',
    accentHex: '#9A4A2E',
    glowHex: 'rgba(154, 74, 46, 0.22)',
    bannerGradient: 'linear-gradient(155deg, #F0E6DC 0%, #E5D4C3 100%)',
    previewImg: '',
    highlights: ['Paifang Gate', 'Nine-Dragon Wall', 'Jade Pagoda'],
    tagline: 'Historic 1937 hillside folklore park filled with guardian dioramas, pagodas, Koi ponds, and lantern arches.',
    ctaLabel: 'Haw Par Villa — Coming Soon',
    atmosphere: {
      moodTitle: 'Pasir Panjang Hill',
      moodSub: 'Heritage Pagodas & Folklore Terraces',
      accentSecondary: '#B45309',
      goldHighlight: '#9A4A2E',
      overlayRadialBg:
        'radial-gradient(circle at 32% 28%, rgba(242, 224, 206, 0.42) 0%, rgba(36, 22, 18, 0.50) 100%)',
      shellGlow: 'rgba(154, 74, 46, 0.14)',
      spotlightStop0: '#9A4A2E',
      spotlightStop1: '#D97706',
      particleType: 'lanterns',
      particleColors: ['#B45309', '#9A4A2E', '#D97706']
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
