// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — 42 Relics Subcatalogs
// Positioned across the 4 Official NParks Cores with 0 water/building overlaps
// (src/data/SbgRelicSubcatalogs.js)
// ============================================================================

export const SBG_CATEGORY_LABELS = {
  orchids: '🌺 VIP & Heritage Orchids',
  supertree_seeds: '🌳 1859 Colonial & Rubber Lore',
  dome_flora: '🏛️ Tanglin & Burkill Keepsakes',
  dragonfly_heritage: '🦢 Swan Lake & Bandstand Gems',
  sculptures_rocks: '🎼 Symphony & Rainforest Art'
};

export const SBG_CATEGORY_THEMES = {
  orchid: '🌺 VIP & Heritage Orchids',
  supertree: '🌳 1859 Colonial & Rubber Lore',
  conservatory: '🏛️ Tanglin & Burkill Keepsakes',
  heritage: '🦢 Swan Lake & Bandstand Gems',
  sculpture: '🎼 Symphony & Rainforest Art'
};

// Part 1: Relics #01–#21
export const SBG_RELICS_1_TO_21 = [
  {
    id: 1, name: 'Vanda Miss Joaquim 1893 Hybrid Gold Brooch', shortName: '1893 Vanda Miss Joaquim',
    ahaHook: 'Bred right here in 1893 by Agnes Joaquim—Singapore’s national flower!', wowPunchline: '🌸 Discovered in Agnes Joaquim’s garden in 1893 and crowned Singapore’s National Flower in 1981!',
    funnyTag: '🌸 1893 OG Hybrid!', gagButtonLabel: '🌸 BLOOM 24K NATIONAL ORCHID!', comicQuips: ['🌸 1893 OG HYBRID!', '👑 AGNES JOAQUIM PRIDE!', '✨ PURE 24K BLOOM!'],
    toyAction: 'happy_bounce', toyReaction: '🌸 1893 OG SHIOK!', category: 'orchid', glbModel: 'Relic_01', sbgGlbModel: 'SBG_Relic_01', habitatKey: 'supertree_hero',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '🌸', x: 16.0, z: 162.0, isLandmarkRelic: true
  },
  {
    id: 2, name: 'The 1930 Octagonal Bandstand Gazebo Bell', shortName: '1930 Bandstand Gazebo',
    ahaHook: 'Built in 1930 atop Bandstand Hill—Singapore’s most romantic wedding gazebo!', wowPunchline: '🏛️ Originally built for military regimental bands in 1930, now photobombed by 50 wedding couples daily!',
    funnyTag: '🏛️ Wedding Photo Boss!', gagButtonLabel: '🏛️ CHIME 1930 BANDSTAND!', comicQuips: ['🏛️ 1930 GAZEBO ICON!', '💍 SAY CHEESE LAH!', '🎺 REGIMENTAL BRASS!'],
    toyAction: 'water_spit', toyReaction: '🏛️ BANDSTAND MAGIC!', category: 'orchid', glbModel: 'Relic_02', sbgGlbModel: 'SBG_Relic_02', habitatKey: 'supertree_medium',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '🏛️', x: 44.0, z: 145.0, isLandmarkRelic: true
  },
  {
    id: 3, name: 'Sembcorp Cool House High-Mountain Orchid Globe', shortName: 'Cool House Mist Orchid',
    ahaHook: 'Chilled to 16°C to trick tropical mountain orchids into blooming at sea level!', wowPunchline: '❄️ Free air-con paradise! Simulates 2,000m tropical montane cloud forests so rare jewel orchids thrive!',
    funnyTag: '❄️ 16°C Air-Con Bliss!', gagButtonLabel: '❄️ BLAST MONTANE MIST!', comicQuips: ['❄️ 16°C AIR-CON SHIOK!', '💎 RARE JEWEL ORCHID!', '🏔️ CLOUD FOREST VIBE!'],
    toyAction: 'water_spit', toyReaction: '❄️ COOL MIST LAH!', category: 'orchid', glbModel: 'Relic_03', sbgGlbModel: 'SBG_Relic_03', habitatKey: 'flower_dome',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '❄️', x: -132.0, z: -28.0, isLandmarkRelic: false
  },
  {
    id: 4, name: 'Burkill Hall 1868 Anglo-Malayan Plantation Model', shortName: '1868 Burkill Hall',
    ahaHook: 'Last surviving 1868 Anglo-Malayan plantation manor where Gardens directors lived!', wowPunchline: '🏡 Built in 1868 with high ceilings and wide verandas—survived two centuries of tropical monsoons!',
    funnyTag: '🏡 1868 Manor Boss!', gagButtonLabel: '🏡 OPEN BURKILL VERANDA!', comicQuips: ['🏡 1868 HERITAGE MANOR!', '🌴 DIRECTOR’S VIEW!', '✨ ORCHID HILL CROWN!'],
    toyAction: 'happy_bounce', toyReaction: '🏡 1868 GRAND DAME!', category: 'orchid', glbModel: 'Relic_04', sbgGlbModel: 'SBG_Relic_04', habitatKey: 'cloud_forest',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🏡', x: -125.0, z: -6.0, isLandmarkRelic: false
  },
  {
    id: 5, name: 'Golden Shower Arches (Oncidium Goldiana) Doll', shortName: 'Golden Shower Orchid',
    ahaHook: 'Canopy of 1,000 dancing-lady golden orchids arched over the main plaza!', wowPunchline: '🌼 Every yellow petal looks like a tiny dancing lady in a ballgown—the #1 selfie tunnel in SBG!',
    funnyTag: '🌼 Dancing Lady Tunnel!', gagButtonLabel: '🌼 DANCE ONCIDIUM ARCH!', comicQuips: ['🌼 DANCING LADY BLOOM!', '📸 GOLDEN ARCH SELFIE!', '✨ YELLOW PETAL RAIN!'],
    toyAction: 'happy_bounce', toyReaction: '🌼 GOLDEN SHOWER!', category: 'orchid', glbModel: 'Relic_05', sbgGlbModel: 'SBG_Relic_05', habitatKey: 'cloud_forest',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🌼', x: -92.0, z: 24.0, isLandmarkRelic: false
  },
  {
    id: 6, name: 'Swan Lake "Flight of Swans" Bronze Plaque', shortName: 'Flight of Swans Bronze',
    ahaHook: 'Celebrates Singapore’s oldest water body (1866) and its real Amsterdam mute swans!', wowPunchline: '🦢 Dug in 1866! Two real white mute swans from Amsterdam patrol this lake like feathered royalty!',
    funnyTag: '🦢 1866 Royal Swans!', gagButtonLabel: '🦢 FLAP AMSTERDAM SWANS!', comicQuips: ['🦢 1866 SWAN LAKE!', '👑 ROYAL FEATHER VIP!', '💦 TAKE OFF SPLASH!'],
    toyAction: 'erp_deduct', toyReaction: '🦢 SWAN FLIGHT!', category: 'orchid', glbModel: 'Relic_06', sbgGlbModel: 'SBG_Relic_06', habitatKey: 'moon_gate',
    coreId: 'tanglin_core', zoneId: 'dragonfly', zoneName: 'Tanglin Core', icon: '🦢', x: 48.0, z: 212.0, isLandmarkRelic: false
  },
  {
    id: 7, name: 'Five-Dollar Note Heritage Tembusu Tree Capsule', shortName: '$5-Note Tembusu Tree',
    ahaHook: 'Pull out a $5 Singapore banknote—this exact 170-year-old Tembusu tree is printed on it!', wowPunchline: '💵 Check your wallet! The horizontal lower branch on the $5 polymer note is this exact Lawn E giant!',
    funnyTag: '💵 Famous $5 Tree!', gagButtonLabel: '💵 MATCH $5 BANKNOTE TREE!', comicQuips: ['💵 CHECK YOUR $5 NOTE!', '🌳 170-YEAR TEMBUSU!', '✨ FAMOUS BRANCH LAH!'],
    toyAction: 'lantern_glow', toyReaction: '💵 $5 TREE LEGEND!', category: 'orchid', glbModel: 'Relic_07', sbgGlbModel: 'SBG_Relic_07', habitatKey: 'bay_east_pavilion',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '💵', x: 55.0, z: 167.0, isLandmarkRelic: true
  },
  {
    id: 8, name: '1859 Agri-Horticultural Society Brass Music Box', shortName: '1859 Founding Music Box',
    ahaHook: 'Plays moonlight promenades from 1859 when Lawrence Niven laid out the pleasure grounds!', wowPunchline: '🎵 In 1859, admission cost a silver coin and horse carriages queued along Tanglin for evening promenades!',
    funnyTag: '🎵 1859 Moonlight Tune!', gagButtonLabel: '🎵 CRANK 1859 PROMENADE!', comicQuips: ['🎵 1859 TANGLIN WALTZ!', '🐎 HORSE CARRIAGE ERA!', '✨ NIVEN’S VISION!'],
    toyAction: 'music_box', toyReaction: '🎵 1859 MELODY!', category: 'orchid', glbModel: 'Relic_08', sbgGlbModel: 'SBG_Relic_08', habitatKey: 'supertree_hero',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '🎵', x: -5.0, z: 152.0, isLandmarkRelic: false
  },
  {
    id: 9, name: 'Giant Tiger Orchid (Grammatophyllum) Blossom', shortName: 'Giant Tiger Orchid',
    ahaHook: 'World’s largest orchid species—a single clump at SBG weighs over one metric ton!', wowPunchline: '🐯 Tiger-striped monster orchid whose flower spikes shoot 3 meters long and weigh as much as a car!',
    funnyTag: '🐯 1-Ton Monster Orchid!', gagButtonLabel: '🐯 ROAR TIGER ORCHID!', comicQuips: ['🐯 1,000KG ORCHID BOSS!', '🌺 TIGER STRIPE PETALS!', '💥 RECORD BREAKER!'],
    toyAction: 'water_spit', toyReaction: '🐯 TIGER BLOOM!', category: 'orchid', glbModel: 'Relic_09', sbgGlbModel: 'SBG_Relic_09', habitatKey: 'serene_pavilion',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🐯', x: -72.0, z: -195.0, isLandmarkRelic: false
  },
  {
    id: 10, name: '"Mad Ridley" Henry Nicholas Ridley Pith Helmet', shortName: 'Ridley Rubber Helmet',
    ahaHook: 'First Director (1888–1911) who discovered herring-bone rubber tapping here in SBG!', wowPunchline: '🪖 They called him "Mad Ridley" for stuffing rubber seeds in his pockets—until he changed world history!',
    funnyTag: '🪖 Rubber Pioneer Hat!', gagButtonLabel: '🪖 SALUTE MAD RIDLEY!', comicQuips: ['🪖 MAD RIDLEY GENIUS!', '🌳 RUBBER BOOM 1890!', '✨ POCKET FULL OF SEEDS!'],
    toyAction: 'happy_bounce', toyReaction: '🪖 RIDLEY SALUTE!', category: 'orchid', glbModel: 'Relic_10', sbgGlbModel: 'SBG_Relic_10', habitatKey: 'tree_bougainvillea',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🪖', x: -168.0, z: 145.0, isLandmarkRelic: false
  },
  {
    id: 11, name: '1890 Herringbone Latex Tapping Porcelain Cup', shortName: 'Rubber Latex Cup',
    ahaHook: 'Collected white liquid gold from SBG’s first 11 Hevea brasiliensis rubber seedlings!', wowPunchline: '☕ Without scratching bark to death, Ridley’s herringbone cut turned Malaya into the world’s rubber capital!',
    funnyTag: '☕ Liquid Gold Cup!', gagButtonLabel: '☕ TAP RUBBER LATEX CUP!', comicQuips: ['☕ LIQUID WHITE GOLD!', '🔪 HERRINGBONE CUT!', '🌳 11 SEEDLINGS CHANGED ALL!'],
    toyAction: 'chope_slam', toyReaction: '☕ LATEX GOLD!', category: 'supertree', glbModel: 'Relic_11', sbgGlbModel: 'SBG_Relic_11', habitatKey: 'supertree_hero',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '☕', x: 68.0, z: 195.0, isLandmarkRelic: false
  },
  {
    id: 12, name: 'Corner’s Botanical Monkey-Training Brass Pot', shortName: 'Botanical Monkey Pot',
    ahaHook: 'Botanist E.J.H. Corner trained beruk pig-tailed macaques to collect high canopy specimens!', wowPunchline: '🐒 Why climb a 50m rainforest tree when your botany-certified macaque assistant can fetch the flowers?!',
    funnyTag: '🐒 Canopy Monkey Assistant!', gagButtonLabel: '🫖 POUR BOTANIST TEA!', comicQuips: ['🐒 PROFESSOR MACAQUE!', '🌿 50M CANOPY FETCH!', '🫖 HERBARIUM BREAK!'],
    toyAction: 'kopi_pour', toyReaction: '🐒 CANOPY COLLECTOR!', category: 'supertree', glbModel: 'Relic_12', sbgGlbModel: 'SBG_Relic_12', habitatKey: 'supertree_hero',
    coreId: 'central_core', zoneId: 'supertree', zoneName: 'Central Core', icon: '🫖', x: 105.0, z: 68.0, isLandmarkRelic: false
  },
  {
    id: 13, name: 'Tanglin Heritage Kaya & Pandan Veranda Set', shortName: 'Veranda Kaya Set',
    ahaHook: 'Fragrant pandan screwpine and coconut jam served at the historic Tanglin tearoom!', wowPunchline: '🍞 Infused with real Pandanus amaryllifolius grown in the Economic Garden since colonial days!',
    funnyTag: '🍞 Botanical Kaya Set!', gagButtonLabel: '🍞 DUNK TANGLIN TOAST!', comicQuips: ['🍞 PANDAN LEAF FRESH!', '🥚 MORNING JOG REWARD!', '☕ UNCLE TAI CHI BREAK!'],
    toyAction: 'kopi_pour', toyReaction: '🍞 TANGLIN BREAKFAST!', category: 'supertree', glbModel: 'Relic_13', sbgGlbModel: 'SBG_Relic_13', habitatKey: 'supertree_medium',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '🍞', x: 62.0, z: 268.0, isLandmarkRelic: false
  },
  {
    id: 14, name: 'The Halia Torch-Ginger & Chili Crab Cauldron', shortName: 'Torch Ginger Cauldron',
    ahaHook: 'Simmered with pink Etlingera elatior (Torch Ginger) flowers from the Ginger Garden!', wowPunchline: '🌺 Zingiberaceae family flex! Tangy pink torch-ginger buds make every sauce 10x more aromatic!',
    funnyTag: '🌺 Torch Ginger Zing!', gagButtonLabel: '🦀 TOSS GINGER GARDEN WOK!', comicQuips: ['🌺 TORCH GINGER ZING!', '🦀 HALIA VERANDA FEAST!', '🔥 RAINFOREST SPICE!'],
    toyAction: 'chope_slam', toyReaction: '🦀 GINGER SPICE!', category: 'supertree', glbModel: 'Relic_14', sbgGlbModel: 'SBG_Relic_14', habitatKey: 'supertree_medium',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🦀', x: -45.0, z: 96.0, isLandmarkRelic: false
  },
  {
    id: 15, name: 'Plantation Director’s Enamel Tingkat Tiffin', shortName: 'Botanist Field Tingkat',
    ahaHook: 'Carried into the primary rainforest reserve for all-day plant taxonomy expeditions!', wowPunchline: '🍱 Packed with spice-garden turmeric rice and nutmeg curry for 19th-century plant hunters!',
    funnyTag: '🍱 Jungle Field Lunch!', gagButtonLabel: '🍱 UNSTACK BOTANIST TIFFIN!', comicQuips: ['🍱 HERBARIUM LUNCH TIME!', '🌿 SPICE GARDEN CURRY!', '🔍 NEW SPECIES FOUND!'],
    toyAction: 'happy_bounce', toyReaction: '🍱 FIELD TIFFIN!', category: 'supertree', glbModel: 'Relic_15', sbgGlbModel: 'SBG_Relic_15', habitatKey: 'supertree_medium',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🍱', x: -258.0, z: 155.0, isLandmarkRelic: false
  },
  {
    id: 16, name: 'Holttum Hall 1921 Orchid-Breeding Laboratory Box', shortName: 'Holttum Lab Relic',
    ahaHook: 'Built in 1921 where Prof. Eric Holttum pioneered sterile agar-flask orchid hybridization!', wowPunchline: '🧪 Inside this 1921 brick office, Holttum germinated orchid seeds in glass flasks and sparked a global boom!',
    funnyTag: '🧪 Orchid Lab Pioneer!', gagButtonLabel: '🧪 GLOW HOLTTUM FLASK!', comicQuips: ['🧪 1921 LAB BREAKTHROUGH!', '🌺 AGAR FLASK MAGIC!', '🏆 NATIONAL MONUMENT!'],
    toyAction: 'happy_bounce', toyReaction: '🧪 HOLTTUM GENIUS!', category: 'supertree', glbModel: 'Relic_16', sbgGlbModel: 'SBG_Relic_16', habitatKey: 'understorey_dome',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '🧪', x: 112.0, z: 248.0, isLandmarkRelic: true
  },
  {
    id: 17, name: 'Nutmeg & Clove 1822 Raffles Spice Goblet', shortName: '1822 Spice Goblet',
    ahaHook: 'Honors Stamford Raffles’ original 1822 spice garden cultivating nutmeg and cloves!', wowPunchline: '🍹 Before Tanglin (1859), Raffles planted nutmeg and clove trees that kickstarted Singapore botany!',
    funnyTag: '🍹 1822 Nutmeg Elixir!', gagButtonLabel: '🍹 SWIRL SPICE NECTAR!', comicQuips: ['🍹 1822 NUTMEG ZING!', '🌿 CLOVE & CINNAMON!', '🥂 BOTANICAL TOAST!'],
    toyAction: 'water_spit', toyReaction: '🍹 SPICE TOAST!', category: 'supertree', glbModel: 'Relic_17', sbgGlbModel: 'SBG_Relic_17', habitatKey: 'supertree_hero',
    coreId: 'central_core', zoneId: 'supertree', zoneName: 'Central Core', icon: '🍹', x: 96.0, z: 108.0, isLandmarkRelic: false
  },
  {
    id: 18, name: 'Evolution Garden Cycad & Tree-Fern Amber Chest', shortName: 'Prehistoric Cycad Chest',
    ahaHook: 'Living fossils from the dinosaur era—giant tree ferns and ancient cycad cones!', wowPunchline: '🦕 Walk 450 million years from single-celled algae to Jurassic cycads in 15 minutes flat!',
    funnyTag: '🦕 Jurassic Plant Boss!', gagButtonLabel: '🦕 UNLOCK JURASSIC FLORA!', comicQuips: ['🦕 DINOSAUR SALAD!', '🌿 450M YEARS OLD!', '🔥 CYCAD CONE POWER!'],
    toyAction: 'lantern_glow', toyReaction: '🦕 LIVING FOSSIL!', category: 'supertree', glbModel: 'Relic_18', sbgGlbModel: 'SBG_Relic_18', habitatKey: 'tree_giantfern',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🦕', x: 108.0, z: -155.0, isLandmarkRelic: false
  },
  {
    id: 19, name: 'Tan Hoon Siang Mist House Porcelain Orchid Urn', shortName: 'Mist House Orchid Urn',
    ahaHook: 'Named after Tan Chay Yan’s son—keeps delicate slipper orchids in cool tropical mist!', wowPunchline: '🏺 Houses rare Paphiopedilum lady’s-slipper orchids that look like tiny porcelain teacups!',
    funnyTag: '🏺 Slipper Orchid Gem!', gagButtonLabel: '🏺 MIST SLIPPER ORCHIDS!', comicQuips: ['🏺 LADY SLIPPER BLOOM!', '💦 TROPICAL MIST HOUSE!', '✨ RARE HYBRID URN!'],
    toyAction: 'happy_bounce', toyReaction: '🏺 MIST HOUSE GEM!', category: 'conservatory', glbModel: 'Relic_19', sbgGlbModel: 'SBG_Relic_19', habitatKey: 'flower_dome',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🏺', x: -64.0, z: 52.0, isLandmarkRelic: false
  },
  {
    id: 20, name: 'Lady Yuen-Peng McNeice Bromeliad Slippers', shortName: 'McNeice Bromeliad Gem',
    ahaHook: 'Celebrates the 1994 Yuen-Peng McNeice Bromeliad Collection of 800+ Neotropical plants!', wowPunchline: '🍍 Pineapple cousins! Rosette leaves catch rainwater in mid-air without needing soil!',
    funnyTag: '🍍 Air-Plant Royalty!', gagButtonLabel: '🍍 SPARKLE BROMELIAD!', comicQuips: ['🍍 PINEAPPLE COUSIN!', '💧 SKY RAIN TANK!', '🌺 CRIMSON ROSETTE!'],
    toyAction: 'happy_bounce', toyReaction: '🍍 BROMELIAD BLING!', category: 'conservatory', glbModel: 'Relic_20', sbgGlbModel: 'SBG_Relic_20', habitatKey: 'cloud_forest',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🍍', x: -148.0, z: 48.0, isLandmarkRelic: false
  },
  {
    id: 21, name: '750,000-Sheet Singapore Herbarium Specimen Press', shortName: '1875 Herbarium Press',
    ahaHook: 'Founded in 1875—safeguards 750,000 dried rainforest type specimens from across SE Asia!', wowPunchline: '📚 Stacked layer by layer like kueh lapis—every pressed leaf is a 150-year botanical time capsule!',
    funnyTag: '📚 750K Leaf Vault!', gagButtonLabel: '📚 PRESS HERBARIUM SHEET!', comicQuips: ['📚 750,000 SPECIMENS!', '🌿 1875 TIME CAPSULE!', '🔬 TAXONOMY BOSS!'],
    toyAction: 'happy_bounce', toyReaction: '📚 HERBARIUM VAULT!', category: 'conservatory', glbModel: 'Relic_21', sbgGlbModel: 'SBG_Relic_21', habitatKey: 'flower_dome',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '📚', x: -212.0, z: 272.0, isLandmarkRelic: false
  }
];

// Part 2: Relics #22–#42
export const SBG_RELICS_22_TO_42 = [
  {
    id: 22, name: 'Atbara 1898 Black-and-White House Miniature', shortName: '1898 Atbara Bungalow',
    ahaHook: 'Oldest surviving 1898 colonial black-and-white bungalow in the Gallop Extension!', wowPunchline: '🏘️ Designed by Regent Alfred John Bidwell (who also designed Raffles Hotel!)—now the Forest Discovery Centre!',
    funnyTag: '🏘️ 1898 B&W Bungalow!', gagButtonLabel: '🏘️ GLOW ATBARA WINDOWS!', comicQuips: ['🏘️ 1898 BLACK & WHITE!', '🌲 GALLOP EXTENSION GEM!', '📸 BIDWELL ARCHITECTURE!'],
    toyAction: 'lantern_glow', toyReaction: '🏘️ ATBARA CHARM!', category: 'conservatory', glbModel: 'Relic_22', sbgGlbModel: 'SBG_Relic_22', habitatKey: 'flower_dome',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🏘️', x: -252.0, z: 235.0, isLandmarkRelic: true
  },
  {
    id: 23, name: 'VIP Celebrity & Royal Orchid Naming Lantern', shortName: 'VIP Orchid Lantern',
    ahaHook: 'Over 200 world leaders, royals, and stars have custom SBG orchid hybrids named after them!', wowPunchline: '👑 From Nelson Mandela to Princess Diana and Jackie Chan—Singapore’s ultimate soft-power floral diplomacy!',
    funnyTag: '👑 Royal Orchid Diplomacy!', gagButtonLabel: '👑 SHINE VIP ORCHID!', comicQuips: ['👑 ROYAL HYBRID VIP!', '🌺 DIPLOMACY IN BLOOM!', '✨ 200+ CELEBRITY ORCHIDS!'],
    toyAction: 'lantern_glow', toyReaction: '👑 VIP ORCHID GLOW!', category: 'conservatory', glbModel: 'Relic_23', sbgGlbModel: 'SBG_Relic_23', habitatKey: 'cloud_forest',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '👑', x: -105.0, z: -12.0, isLandmarkRelic: false
  },
  {
    id: 24, name: '1929 Victorian Sundial Garden Brass Gnomon', shortName: '1929 Victorian Sundial',
    ahaHook: 'Sculpted in 1929 by Ursula Holttum—tells equatorial solar time across four lily ponds!', wowPunchline: '☀️ Inscribed with "What is more pleasant than the sun’s light"—tracks Singapore’s 1° North sun all year!',
    funnyTag: '☀️ 1929 Sun Clock!', gagButtonLabel: '☀️ CAST EQUATORIAL SHADOW!', comicQuips: ['☀️ 1929 SOLAR TIME!', '🧭 1° NORTH EQUATOR!', '✨ URSULA HOLTTUM ART!'],
    toyAction: 'lantern_glow', toyReaction: '☀️ SUNDIAL GLOW!', category: 'conservatory', glbModel: 'Relic_24', sbgGlbModel: 'SBG_Relic_24', habitatKey: 'floral_clock',
    coreId: 'tanglin_core', zoneId: 'supertree', zoneName: 'Tanglin Core', icon: '☀️', x: 112.0, z: 182.0, isLandmarkRelic: false
  },
  {
    id: 25, name: 'Crane Fountain & Waterbird Brass Lamp', shortName: 'Crane Fountain Lamp',
    ahaHook: 'Graceful bronze cranes welcoming visitors into the National Orchid Garden plaza!', wowPunchline: '🦩 Surrounded by golden bromeliads and mist jets—where orchid hunters gather before climbing the hill!',
    funnyTag: '🦩 Bronze Crane Fountain!', gagButtonLabel: '🦩 SPARKLE CRANE FOUNTAIN!', comicQuips: ['🦩 BRONZE CRANE SPLASH!', '🌺 ORCHID PLAZA WELCOME!', '✨ GOLDEN MIST GLOW!'],
    toyAction: 'lantern_glow', toyReaction: '🦩 CRANE SPARKLE!', category: 'conservatory', glbModel: 'Relic_25', sbgGlbModel: 'SBG_Relic_25', habitatKey: 'flower_dome',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🦩', x: -62.0, z: 12.0, isLandmarkRelic: false
  },
  {
    id: 26, name: 'Flying Fox & Javan Myna Botanical Weather Vane', shortName: 'Canopy Bat & Bird Vane',
    ahaHook: 'Tracks tropical monsoon breezes across the 6-hectare primary rainforest canopy!', wowPunchline: '🦇 Fruit bats pollinate durian flowers by night while hornbills disperse rainforest figs by day!',
    funnyTag: '🦇 Rainforest Pollinator!', gagButtonLabel: '🦇 SOAR CANOPY BREEZE!', comicQuips: ['🦇 NIGHT POLLINATOR!', '🌬️ MONSOON BREEZE!', '🌳 6-HA JUNGLE SHIELD!'],
    toyAction: 'happy_bounce', toyReaction: '🦇 CANOPY SOAR!', category: 'conservatory', glbModel: 'Relic_26', sbgGlbModel: 'SBG_Relic_26', habitatKey: 'cloud_forest',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🦇', x: 142.0, z: 85.0, isLandmarkRelic: false
  },
  {
    id: 27, name: 'Swan Lake Victorian Gazebo & Terrapin Bell', shortName: 'Swan Lake Gazebo Bell',
    ahaHook: 'Overlooks hundreds of basking terrapins and giant pacu fish beneath the Swan Lake bridge!', wowPunchline: '🐢 Lean over the timber railing and 50 sleepy terrapins immediately swim over for a photo op!',
    funnyTag: '🐢 Terrapin Photobomb!', gagButtonLabel: '🔔 RING SWAN GAZEBO BELL!', comicQuips: ['🐢 50 TERRAPINS WAVE!', '🦢 SWAN LAKE BRIDGE!', '🔔 VICTORIAN GAZEBO!'],
    toyAction: 'chope_slam', toyReaction: '🐢 SWAN LAKE SHIOK!', category: 'heritage', glbModel: 'Relic_27', sbgGlbModel: 'SBG_Relic_27', habitatKey: 'dragonfly_bridge',
    coreId: 'tanglin_core', zoneId: 'dragonfly', zoneName: 'Tanglin Core', icon: '🐢', x: -68.0, z: 212.0, isLandmarkRelic: true
  },
  {
    id: 28, name: 'Tanglin Gate Cast-Iron Silver Leaf Medallion', shortName: 'Tanglin Silver Gate',
    ahaHook: 'Historic main entrance recast in gleaming silver banana, palm, and monstera foliage!', wowPunchline: '🚪 Replaced the old wooden gates with intricate silver tropical leaves—every leaf is cast from real SBG plants!',
    funnyTag: '🚪 Silver Leaf Portal!', gagButtonLabel: '🚪 SWING TANGLIN SILVER GATE!', comicQuips: ['🚪 SILVER FOLIAGE GATE!', '🌿 BANANA & PALM IRON!', '✨ HISTORIC MAIN ENTRY!'],
    toyAction: 'happy_bounce', toyReaction: '🚪 SILVER GATE!', category: 'heritage', glbModel: 'Relic_28', sbgGlbModel: 'SBG_Relic_28', habitatKey: 'moon_gate',
    coreId: 'tanglin_core', zoneId: 'dragonfly', zoneName: 'Tanglin Core', icon: '🚪', x: 25.0, z: 295.0, isLandmarkRelic: false
  },
  {
    id: 29, name: 'Dawn Tai Chi Fan & Morning Jogger Towel', shortName: '6AM Tai Chi Fan & Towel',
    ahaHook: 'Gates open at 5:00 AM daily—hundreds of uncles and aunties practice Tai Chi by the lake!', wowPunchline: '🪭 Loud "THWACK!" of red Tai Chi fans at 6:30 AM is the official morning soundtrack of the Gardens!',
    funnyTag: '🪭 5AM Tai Chi Master!', gagButtonLabel: '🪭 SNAP TAI CHI FAN!', comicQuips: ['🪭 THWACK! 6AM TAI CHI!', '🧘‍♂️ ECO-LAKE ZEN MASTER!', '☀️ 5AM GATES OPEN!'],
    toyAction: 'chope_slam', toyReaction: '🪭 TAI CHI POWER!', category: 'heritage', glbModel: 'Relic_29', sbgGlbModel: 'SBG_Relic_29', habitatKey: 'bay_east_pavilion',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🪭', x: 78.0, z: -215.0, isLandmarkRelic: false
  },
  {
    id: 30, name: 'Tanglin Gate Uncle’s Ice Cream Cart & Bell', shortName: 'Tanglin Ice Cream Cart',
    ahaHook: 'Waiting outside Tanglin Gate with raspberry ripple blocks wrapped in rainbow bread!', wowPunchline: '🍦 After walking 5km through tropical humidity, Uncle’s $1.50 ice cream sandwich tastes like Michelin 3-Star!',
    funnyTag: '🍦 Post-Walk Reward!', gagButtonLabel: '🔔 RING TANGLIN ICE CREAM!', comicQuips: ['🍦 TANGLIN GATE REWARD!', '🍞 RAINBOW BREAD BLOCK!', '🔔 DING DING UNCLE!'],
    toyAction: 'music_box', toyReaction: '🍦 ICE CREAM UNCLE!', category: 'heritage', glbModel: 'Relic_30', sbgGlbModel: 'SBG_Relic_30', habitatKey: 'dragonfly_bridge',
    coreId: 'tanglin_core', zoneId: 'dragonfly', zoneName: 'Tanglin Core', icon: '🍦', x: 68.0, z: 298.0, isLandmarkRelic: false
  },
  {
    id: 31, name: '1900s Cluny Road Rickshaw & Brass Horn', shortName: 'Cluny Road Trishaw',
    ahaHook: 'Carried early 20th-century visitors along tree-lined Cluny Road to Nassim Gate!', wowPunchline: '🛺 Shaded by giant Rain Trees planted in the 1880s—Singapore’s original green tree-tunnel boulevard!',
    funnyTag: '🛺 Cluny Tree Tunnel!', gagButtonLabel: '🎺 HONK CLUNY HORN!', comicQuips: ['🛺 CLUNY ROAD BREEZE!', '🌳 RAIN TREE TUNNEL!', '🎺 AHOOOGA HERITAGE!'],
    toyAction: 'music_box', toyReaction: '🛺 CLUNY RIDE!', category: 'heritage', glbModel: 'Relic_31', sbgGlbModel: 'SBG_Relic_31', habitatKey: 'dragonfly_bridge',
    coreId: 'central_core', zoneId: 'meadow', zoneName: 'Central Core', icon: '🛺', x: 102.0, z: 22.0, isLandmarkRelic: false
  },
  {
    id: 32, name: '1967 "Orchid Series" Currency Coin & Note Bank', shortName: '1967 Orchid Series Bank',
    ahaHook: 'Singapore’s very first 1967 currency notes featured SBG orchids on every denomination!', wowPunchline: '🪙 Before the Bird and Ship series, Singapore’s 1967 debut banknotes starred Vanda and Arachnis orchids!',
    funnyTag: '🪙 1967 Orchid Money!', gagButtonLabel: '🪙 CLINK ORCHID SERIES!', comicQuips: ['🪙 1967 ORCHID NOTES!', '🌺 FLORAL CURRENCY!', '💰 VINTAGE NUMISMATIC!'],
    toyAction: 'erp_deduct', toyReaction: '🪙 ORCHID MINT!', category: 'heritage', glbModel: 'Relic_32', sbgGlbModel: 'SBG_Relic_32', habitatKey: 'tree_raintree',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🪙', x: -68.0, z: -252.0, isLandmarkRelic: false
  },
  {
    id: 33, name: 'Red Saga Seeds (Adenanthera pavonina) Glass Jar', shortName: 'Lucky Red Saga Seeds',
    ahaHook: 'Shiny scarlet seeds gathered beneath Saga trees along the garden spine by generations of kids!', wowPunchline: '🔴 Naturally glossy like ruby beads—every Singapore schoolkid kept a secret stash in their pencil box!',
    funnyTag: '🔴 Childhood Ruby Seeds!', gagButtonLabel: '🔴 SHAKE RED SAGA SEEDS!', comicQuips: ['🔴 SCARLET SAGA RUBIES!', '🎒 PENCIL BOX TREASURE!', '🌳 SAGA TREE DROP!'],
    toyAction: 'happy_bounce', toyReaction: '🔴 SAGA LUCK!', category: 'heritage', glbModel: 'Relic_33', sbgGlbModel: 'SBG_Relic_33', habitatKey: 'tree_frangipani',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🔴', x: 25.0, z: -142.0, isLandmarkRelic: false
  },
  {
    id: 34, name: 'Cast-Iron Binomial Plant Taxonomy Signpost', shortName: 'Latin Plant Signpost',
    ahaHook: 'Classic green-and-silver botanical plaques displaying family, genus, species, and native origin!', wowPunchline: '🪧 Try pronouncing "Dipterocarpaceae" three times fast—instant +50 IQ points on your garden stroll!',
    funnyTag: '🪧 Latin Tongue-Twister!', gagButtonLabel: '🪧 STAMP LATIN TAXONOMY!', comicQuips: ['🪧 DIPTEROCARPACEAE!', '🎓 +50 BOTANY IQ!', '🌿 LINNAEAN LEGEND!'],
    toyAction: 'erp_deduct', toyReaction: '🪧 TAXONOMY PRO!', category: 'heritage', glbModel: 'Relic_34', sbgGlbModel: 'SBG_Relic_34', habitatKey: 'sg50_lattice',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🪧', x: -195.0, z: 205.0, isLandmarkRelic: false
  },
  {
    id: 35, name: 'Shaw Foundation Symphony Stage Acoustic Shell', shortName: 'Shaw Symphony Stage',
    ahaHook: 'Floating in the center of Symphony Lake—home to free SSO sunset concerts on Palm Valley lawn!', wowPunchline: '🎼 Pack a picnic mat! The Singapore Symphony Orchestra plays Tchaikovsky under the stars while swans glide by!',
    funnyTag: '🎼 Lawn Picnic Concert!', gagButtonLabel: '🎼 PLAY SYMPHONY OVERTURE!', comicQuips: ['🎼 SSO SUNSET CONCERT!', '🧺 PALM VALLEY PICNIC!', '🎻 BRAVO ENCORE LAH!'],
    toyAction: 'otter_wiggle', toyReaction: '🎼 SYMPHONY BRAVO!', category: 'sculpture', glbModel: 'Relic_35', sbgGlbModel: 'SBG_Relic_35', habitatKey: 'planet_baby',
    coreId: 'central_core', zoneId: 'meadow', zoneName: 'Central Core', icon: '🎼', x: 18.0, z: 56.0, isLandmarkRelic: true
  },
  {
    id: 36, name: 'Double Coconut (Lodoicea maldivica) Palm Crown', shortName: 'Coco de Mer Giant Seed',
    ahaHook: 'Palm Valley’s Coco de Mer produces the heaviest seed in the plant kingdom—up to 25kg!', wowPunchline: '🥥 Takes 7 years to ripen a single 25kg seed—sailors once believed it grew on underwater magic trees!',
    funnyTag: '🥥 25kg Mega Seed!', gagButtonLabel: '🥥 DROP 25KG COCO DE MER!', comicQuips: ['🥥 25KG WORLD RECORD!', '🌴 PALM VALLEY GIANT!', '💥 HEAVYWEIGHT SEED!'],
    toyAction: 'durian_stink', toyReaction: '🥥 MEGA PALM SEED!', category: 'sculpture', glbModel: 'Relic_36', sbgGlbModel: 'SBG_Relic_36', habitatKey: 'tree_travellerspalm',
    coreId: 'central_core', zoneId: 'meadow', zoneName: 'Central Core', icon: '🥥', x: 92.0, z: -28.0, isLandmarkRelic: false
  },
  {
    id: 37, name: 'Frederic Chopin 2008 Bronze Monument Music Box', shortName: 'Chopin Bronze Piano',
    ahaHook: 'Sculpted by Karol Badyna just south of Symphony Lake—plays nocturnes beneath giant palms!', wowPunchline: '🎹 Gifted in 2008 for Chopin’s bicentenary—even monitor lizards stop to listen to the nocturnes!',
    funnyTag: '🎹 Rainforest Nocturne!', gagButtonLabel: '🎹 PLAY CHOPIN NOCTURNE!', comicQuips: ['🎹 CHOPIN BY THE LAKE!', '🎶 NOCTURNE IN E-FLAT!', '🌴 PALM VALLEY MELODY!'],
    toyAction: 'music_box', toyReaction: '🎹 CHOPIN MAGIC!', category: 'sculpture', glbModel: 'Relic_37', sbgGlbModel: 'SBG_Relic_37', habitatKey: 'serene_pavilion',
    coreId: 'central_core', zoneId: 'meadow', zoneName: 'Central Core', icon: '🎹', x: -12.0, z: 54.0, isLandmarkRelic: false
  },
  {
    id: 38, name: 'Japanese Bonsai & Penjing Ancient Wrightia Tree', shortName: 'Japanese Bonsai Masterpiece',
    ahaHook: 'Living miniature trees sculpted over decades in the tranquil Gallop & Bonsai courtyard!', wowPunchline: '🪴 Tiny tree, 80-year-old roots! Trimmed leaf by leaf to look like a wind-swept mountain cliff!',
    funnyTag: '🪴 80-Year Mini Tree!', gagButtonLabel: '🪴 ZEN TRIM BONSAI!', comicQuips: ['🪴 MINI TREE GIANT SOUL!', '🧘‍♂️ PENJING PERFECTION!', '✨ ZEN COURTYARD!'],
    toyAction: 'otter_wiggle', toyReaction: '🪴 ZEN BONSAI!', category: 'sculpture', glbModel: 'Relic_38', sbgGlbModel: 'SBG_Relic_38', habitatKey: 'serene_pavilion',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🪴', x: -165.0, z: 232.0, isLandmarkRelic: false
  },
  {
    id: 39, name: 'Jacob Ballas Children’s Garden Treehouse Totem', shortName: 'Jacob Ballas Treehouse',
    ahaHook: 'Asia’s first children’s garden featuring suspension bridges, canopy slides, and a giant Banyan treehouse!', wowPunchline: '🛖 Built around a real Ficus retusa aerial-root maze where kids learn photosynthesis by playing!',
    funnyTag: '🛖 Banyan Treehouse Slide!', gagButtonLabel: '🛖 ZOOM TREEHOUSE SLIDE!', comicQuips: ['🛖 BANYAN ROOT MAZE!', '🛝 CANOPY SLIDE WHEEE!', '🌿 KIDS BOTANY CLUB!'],
    toyAction: 'happy_bounce', toyReaction: '🛖 TREEHOUSE FUN!', category: 'sculpture', glbModel: 'Relic_39', sbgGlbModel: 'SBG_Relic_39', habitatKey: 'splash_pad',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🛖', x: 68.0, z: -282.0, isLandmarkRelic: false
  },
  {
    id: 40, name: 'Eco-Lake Black Swan & Oriental Pied Hornbill Duo', shortName: 'Black Swan & Hornbill',
    ahaHook: 'Black-necked and Australian Black Swans nest alongside wild hornbills at Bukit Timah Eco-Lake!', wowPunchline: '🦢 Tanglin has white swans; Bukit Timah Eco-Lake has Black Swans and cheeky monitor lizards!',
    funnyTag: '🦢 Black Swan Squad!', gagButtonLabel: '🦢 GLIDE ECO-LAKE DUO!', comicQuips: ['🦢 BLACK SWAN ROYALTY!', '🦜 HORNBILL CANOPY CALL!', '🦎 MONITOR LIZARD PHOTOBOMB!'],
    toyAction: 'otter_wiggle', toyReaction: '🦢 ECO-LAKE WILD!', category: 'sculpture', glbModel: 'Relic_40', sbgGlbModel: 'SBG_Relic_40', habitatKey: 'tree_royalpalm',
    coreId: 'bukit_timah_core', zoneId: 'wetlands', zoneName: 'Bukit Timah Core', icon: '🦢', x: 18.0, z: -292.0, isLandmarkRelic: false
  },
  {
    id: 41, name: 'Ginger Waterfall Cave & Halia Stone Arch', shortName: 'Ginger Waterfall Cave',
    ahaHook: 'Walk behind a roaring tropical waterfall surrounded by 250+ species of ginger and heliconia!', wowPunchline: '🌊 Secret cooling hack: duck into the rocky grotto behind the Ginger Garden waterfall for instant -5°C mist!',
    funnyTag: '🌊 Secret Waterfall Cave!', gagButtonLabel: '🌊 WALK BEHIND WATERFALL!', comicQuips: ['🌊 SECRET GROTTO CAVE!', '🌺 250 GINGER SPECIES!', '💦 -5°C WATERFALL MIST!'],
    toyAction: 'chope_slam', toyReaction: '🌊 WATERFALL CAVE!', category: 'sculpture', glbModel: 'Relic_41', sbgGlbModel: 'SBG_Relic_41', habitatKey: 'serene_pavilion',
    coreId: 'central_core', zoneId: 'conservatories', zoneName: 'Central Core', icon: '🌊', x: -102.0, z: 92.0, isLandmarkRelic: false
  },
  {
    id: 42, name: 'UNESCO World Heritage 2015 Golden Inscription Key', shortName: 'UNESCO 2015 Golden Key',
    ahaHook: 'Inscribed on 4 July 2015 in Bonn—Singapore’s first UNESCO World Heritage Site and only tropical botanic garden on the list!', wowPunchline: '🏆 Only 3 botanic gardens on Earth are UNESCO World Heritage Sites (Padua, Kew, and Singapore Botanic Gardens)!',
    funnyTag: '🏆 UNESCO World #1!', gagButtonLabel: '🏆 UNLOCK UNESCO CROWN!', comicQuips: ['🏆 UNESCO 4 JULY 2015!', '🌍 1 OF 3 ON EARTH!', '🇸🇬 SINGAPORE’S FIRST UNESCO!'],
    toyAction: 'erp_deduct', toyReaction: '🏆 UNESCO CROWN!', category: 'sculpture', glbModel: 'Relic_42', sbgGlbModel: 'SBG_Relic_42', habitatKey: 'sg50_lattice',
    coreId: 'tyersall_gallop_core', zoneId: 'dragonfly', zoneName: 'Tyersall–Gallop', icon: '🏆', x: -182.0, z: 284.0, isLandmarkRelic: true
  }
];
