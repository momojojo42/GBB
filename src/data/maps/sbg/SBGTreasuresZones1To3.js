// ============================================================================
// Singapore Botanic Gardens (UNESCO World Heritage) — Relics 1–21 & Zone Specs
// (src/data/maps/sbg/SBGTreasuresZones1To3.js)
// ============================================================================

export const SBG_ZONE_METADATA = {
  "supertree": {
    "id": "supertree",
    "name": "Zone 1: Tanglin Core & Bandstand",
    "shortName": "Tanglin & Bandstand",
    "color": "#10B981",
    "badge": "ZONE 1 • TANGLIN CORE (1859)",
    "title": "The Bandstand & Heritage Tembusu Lawn",
    "desc": "1859 historic heart of the Gardens featuring the iconic 1930 Octagonal Bandstand, the $5-note Tembusu tree, and Saraca streams."
  },
  "conservatories": {
    "id": "conservatories",
    "name": "Zone 2: National Orchid Garden",
    "shortName": "Orchid Garden",
    "color": "#F59E0B",
    "badge": "ZONE 2 • ORCHID HILLTOP",
    "title": "National Orchid Garden & Burkill Hall",
    "desc": "Over 1,000 orchid species and 2,000 hybrids surrounding 1868 Burkill Hall, the Sembcorp Cool House, and Golden Shower Arches."
  },
  "dragonfly": {
    "id": "dragonfly",
    "name": "Zone 3: Swan Lake & Tanglin Gate",
    "shortName": "Swan Lake",
    "color": "#38BDF8",
    "badge": "ZONE 3 • SWAN LAKE & GATES",
    "title": "Swan Lake, Dell & Tanglin Silver Gate",
    "desc": "Singapore’s oldest ornamental lake (1866) with mute swans from Amsterdam, Victorian gazebos, and the cast-iron silver leaf gate."
  },
  "meadow": {
    "id": "meadow",
    "name": "Zone 4: Palm Valley & Symphony Stage",
    "shortName": "Symphony Stage",
    "color": "#EC4899",
    "badge": "ZONE 4 • PALM VALLEY",
    "title": "Palm Valley & Shaw Symphony Stage",
    "desc": "Sweeping amphitheater lawn facing the Symphony Lake stage, bordered by the Victorian Sundial and Japanese Bonsai courtyard."
  },
  "wetlands": {
    "id": "wetlands",
    "name": "Zone 5: Eco-Lake, Ginger & Children’s Garden",
    "shortName": "Eco-Lake & Ginger",
    "color": "#34D399",
    "badge": "ZONE 5 • BUKIT TIMAH & GINGER",
    "title": "Eco-Lake, Ginger Garden & Children’s Treehouse",
    "desc": "Waterfront waterfalls, 250+ ginger relatives around The Halia, Keppel Discovery Wetlands, and Jacob Ballas Children’s Garden."
  }
};

export const SBG_CATEGORY_LABELS = {
  "orchids": "🌺 VIP & Heritage Orchids",
  "supertree_seeds": "🌳 1859 Colonial & Rubber Lore",
  "dome_flora": "🏛️ Tanglin & Burkill Keepsakes",
  "dragonfly_heritage": "🦢 Swan Lake & Bandstand Gems",
  "sculptures_rocks": "🎼 Symphony & Rainforest Art"
};

export const SBG_CATEGORY_THEMES = {
  "orchid": "🌺 VIP & Heritage Orchids",
  "supertree": "🌳 1859 Colonial & Rubber Lore",
  "conservatory": "🏛️ Tanglin & Burkill Keepsakes",
  "heritage": "🦢 Swan Lake & Bandstand Gems",
  "sculpture": "🎼 Symphony & Rainforest Art"
};

export const SBG_RAW_TREASURES_1_TO_21 = [
  {
    id: 1, name: "Vanda Miss Joaquim 1893 Hybrid Gold Brooch", shortName: "1893 Vanda Miss Joaquim",
    ahaHook: "Bred right here in 1893 by Agnes Joaquim—Singapore’s national flower!", wowPunchline: "🌸 Discovered in Agnes Joaquim’s garden in 1893 and crowned Singapore’s National Flower in 1981!",
    funnyTag: "🌸 1893 OG Hybrid!", gagButtonLabel: "🌸 BLOOM 24K NATIONAL ORCHID!",
    comicQuips: ["🌸 1893 OG HYBRID!","👑 AGNES JOAQUIM PRIDE!","✨ PURE 24K BLOOM!"], toyAction: "happy_bounce", toyReaction: "🌸 1893 OG SHIOK!",
    category: "orchid", glbModel: "Relic_01", habitatKey: "supertree_hero",
    zoneName: "Tanglin & Bandstand", icon: "🌸", x: 0, z: 3, isLandmarkRelic: true
  },
  {
    id: 2, name: "The 1930 Octagonal Bandstand Gazebo Bell", shortName: "1930 Bandstand Gazebo",
    ahaHook: "Built in 1930 atop Bandstand Hill—Singapore’s most romantic wedding gazebo!", wowPunchline: "🏛️ Originally built for military regimental bands in 1930, now photobombed by 50 wedding couples daily!",
    funnyTag: "🏛️ Wedding Photo Boss!", gagButtonLabel: "🏛️ CHIME 1930 BANDSTAND!",
    comicQuips: ["🏛️ 1930 GAZEBO ICON!","💍 SAY CHEESE LAH!","🎺 REGIMENTAL BRASS!"], toyAction: "water_spit", toyReaction: "🏛️ BANDSTAND MAGIC!",
    category: "orchid", glbModel: "Relic_02", habitatKey: "supertree_medium",
    zoneName: "Tanglin & Bandstand", icon: "🏛️", x: -9, z: 4, isLandmarkRelic: true
  },
  {
    id: 3, name: "Sembcorp Cool House High-Mountain Orchid Globe", shortName: "Cool House Mist Orchid",
    ahaHook: "Chilled to 16°C to trick tropical mountain orchids into blooming at sea level!", wowPunchline: "❄️ Free air-con paradise! Simulates 2,000m tropical montane cloud forests so rare jewel orchids thrive!",
    funnyTag: "❄️ 16°C Air-Con Bliss!", gagButtonLabel: "❄️ BLAST MONTANE MIST!",
    comicQuips: ["❄️ 16°C AIR-CON SHIOK!","💎 RARE JEWEL ORCHID!","🏔️ CLOUD FOREST VIBE!"], toyAction: "water_spit", toyReaction: "❄️ COOL MIST LAH!",
    category: "orchid", glbModel: "Relic_03", habitatKey: "flower_dome",
    zoneName: "Orchid Garden", icon: "❄️", x: 13.5, z: -33.5, isLandmarkRelic: false
  },
  {
    id: 4, name: "Burkill Hall 1868 Anglo-Malayan Plantation Model", shortName: "1868 Burkill Hall",
    ahaHook: "Last surviving 1868 Anglo-Malayan plantation manor where Gardens directors lived!", wowPunchline: "🏡 Built in 1868 with high ceilings and wide verandas—survived two centuries of tropical monsoons!",
    funnyTag: "🏡 1868 Manor Boss!", gagButtonLabel: "🏡 OPEN BURKILL VERANDA!",
    comicQuips: ["🏡 1868 HERITAGE MANOR!","🌴 DIRECTOR’S VIEW!","✨ ORCHID HILL CROWN!"], toyAction: "happy_bounce", toyReaction: "🏡 1868 GRAND DAME!",
    category: "orchid", glbModel: "Relic_04", habitatKey: "cloud_forest",
    zoneName: "Orchid Garden", icon: "🏡", x: 32.6, z: -28.4, isLandmarkRelic: false
  },
  {
    id: 5, name: "Golden Shower Arches (Oncidium Goldiana) Doll", shortName: "Golden Shower Orchid",
    ahaHook: "Canopy of 1,000 dancing-lady golden orchids arched over the main plaza!", wowPunchline: "🌼 Every yellow petal looks like a tiny dancing lady in a ballgown—the #1 selfie tunnel in SBG!",
    funnyTag: "🌼 Dancing Lady Tunnel!", gagButtonLabel: "🌼 DANCE ONCIDIUM ARCH!",
    comicQuips: ["🌼 DANCING LADY BLOOM!","📸 GOLDEN ARCH SELFIE!","✨ YELLOW PETAL RAIN!"], toyAction: "happy_bounce", toyReaction: "🌼 GOLDEN SHOWER!",
    category: "orchid", glbModel: "Relic_05", habitatKey: "cloud_forest",
    zoneName: "Orchid Garden", icon: "🌼", x: 24.5, z: -29, isLandmarkRelic: false
  },
  {
    id: 6, name: "Swan Lake \"Flight of Swans\" Bronze Plaque", shortName: "Flight of Swans Bronze",
    ahaHook: "Celebrates Singapore’s oldest water body (1866) and its real Amsterdam mute swans!", wowPunchline: "🦢 Dug in 1866! Two real white mute swans from Amsterdam patrol this lake like feathered royalty!",
    funnyTag: "🦢 1866 Royal Swans!", gagButtonLabel: "🦢 FLAP AMSTERDAM SWANS!",
    comicQuips: ["🦢 1866 SWAN LAKE!","👑 ROYAL FEATHER VIP!","💦 TAKE OFF SPLASH!"], toyAction: "erp_deduct", toyReaction: "🦢 SWAN FLIGHT!",
    category: "orchid", glbModel: "Relic_06", habitatKey: "moon_gate",
    zoneName: "Swan Lake", icon: "🦢", x: -24.5, z: -18.5, isLandmarkRelic: false
  },
  {
    id: 7, name: "Five-Dollar Note Heritage Tembusu Tree Capsule", shortName: "$5-Note Tembusu Tree",
    ahaHook: "Pull out a $5 Singapore banknote—this exact 170-year-old Tembusu tree is printed on it!", wowPunchline: "💵 Check your wallet! The horizontal lower branch on the $5 polymer note is this exact Lawn E giant!",
    funnyTag: "💵 Famous $5 Tree!", gagButtonLabel: "💵 MATCH $5 BANKNOTE TREE!",
    comicQuips: ["💵 CHECK YOUR $5 NOTE!","🌳 170-YEAR TEMBUSU!","✨ FAMOUS BRANCH LAH!"], toyAction: "lantern_glow", toyReaction: "💵 $5 TREE LEGEND!",
    category: "orchid", glbModel: "Relic_07", habitatKey: "bay_east_pavilion",
    zoneName: "Swan Lake", icon: "💵", x: -11.5, z: -25, isLandmarkRelic: true
  },
  {
    id: 8, name: "1859 Agri-Horticultural Society Brass Music Box", shortName: "1859 Founding Music Box",
    ahaHook: "Plays moonlight promenades from 1859 when Lawrence Niven laid out the pleasure grounds!", wowPunchline: "🎵 In 1859, admission cost a silver coin and horse carriages queued along Tanglin for evening promenades!",
    funnyTag: "🎵 1859 Moonlight Tune!", gagButtonLabel: "🎵 CRANK 1859 PROMENADE!",
    comicQuips: ["🎵 1859 TANGLIN WALTZ!","🐎 HORSE CARRIAGE ERA!","✨ NIVEN’S VISION!"], toyAction: "music_box", toyReaction: "🎵 1859 MELODY!",
    category: "orchid", glbModel: "Relic_08", habitatKey: "supertree_hero",
    zoneName: "Tanglin & Bandstand", icon: "🎵", x: -6, z: -8, isLandmarkRelic: false
  },
  {
    id: 9, name: "Giant Tiger Orchid (Grammatophyllum) Blossom", shortName: "Giant Tiger Orchid",
    ahaHook: "World’s largest orchid species—a single clump at SBG weighs over one metric ton!", wowPunchline: "🐯 Tiger-striped monster orchid whose flower spikes shoot 3 meters long and weigh as much as a car!",
    funnyTag: "🐯 1-Ton Monster Orchid!", gagButtonLabel: "🐯 ROAR TIGER ORCHID!",
    comicQuips: ["🐯 1,000KG ORCHID BOSS!","🌺 TIGER STRIPE PETALS!","💥 RECORD BREAKER!"], toyAction: "water_spit", toyReaction: "🐯 TIGER BLOOM!",
    category: "orchid", glbModel: "Relic_09", habitatKey: "serene_pavilion",
    zoneName: "Eco-Lake & Ginger", icon: "🐯", x: 40, z: 12, isLandmarkRelic: false
  },
  {
    id: 10, name: "\"Mad Ridley\" Henry Nicholas Ridley Pith Helmet", shortName: "Ridley Rubber Helmet",
    ahaHook: "First Director (1888–1911) who discovered herring-bone rubber tapping here in SBG!", wowPunchline: "🪖 They called him \"Mad Ridley\" for stuffing rubber seeds in his pockets—until he changed world history!",
    funnyTag: "🪖 Rubber Pioneer Hat!", gagButtonLabel: "🪖 SALUTE MAD RIDLEY!",
    comicQuips: ["🪖 MAD RIDLEY GENIUS!","🌳 RUBBER BOOM 1890!","✨ POCKET FULL OF SEEDS!"], toyAction: "happy_bounce", toyReaction: "🪖 RIDLEY SALUTE!",
    category: "orchid", glbModel: "Relic_10", habitatKey: "tree_bougainvillea",
    zoneName: "Symphony Stage", icon: "🪖", x: -40, z: 22, isLandmarkRelic: false
  },
  {
    id: 11, name: "1890 Herringbone Latex Tapping Porcelain Cup", shortName: "Rubber Latex Cup",
    ahaHook: "Collected white liquid gold from SBG’s first 11 Hevea brasiliensis rubber seedlings!", wowPunchline: "☕ Without scratching bark to death, Ridley’s herringbone cut turned Malaya into the world’s rubber capital!",
    funnyTag: "☕ Liquid Gold Cup!", gagButtonLabel: "☕ TAP RUBBER LATEX CUP!",
    comicQuips: ["☕ LIQUID WHITE GOLD!","🔪 HERRINGBONE CUT!","🌳 11 SEEDLINGS CHANGED ALL!"], toyAction: "chope_slam", toyReaction: "☕ LATEX GOLD!",
    category: "supertree", glbModel: "Relic_11", habitatKey: "supertree_hero",
    zoneName: "Tanglin & Bandstand", icon: "☕", x: 2.5, z: -3.5, isLandmarkRelic: false
  },
  {
    id: 12, name: "Corner’s Botanical Monkey-Training Brass Pot", shortName: "Botanical Monkey Pot",
    ahaHook: "Botanist E.J.H. Corner trained beruk pig-tailed macaques to collect high canopy specimens!", wowPunchline: "🐒 Why climb a 50m rainforest tree when your botany-certified macaque assistant can fetch the flowers?!",
    funnyTag: "🐒 Canopy Monkey Assistant!", gagButtonLabel: "🫖 POUR BOTANIST TEA!",
    comicQuips: ["🐒 PROFESSOR MACAQUE!","🌿 50M CANOPY FETCH!","🫖 HERBARIUM BREAK!"], toyAction: "kopi_pour", toyReaction: "🐒 CANOPY COLLECTOR!",
    category: "supertree", glbModel: "Relic_12", habitatKey: "supertree_hero",
    zoneName: "Tanglin & Bandstand", icon: "🫖", x: -4, z: 7, isLandmarkRelic: false
  },
  {
    id: 13, name: "Tanglin Heritage Kaya & Pandan Veranda Set", shortName: "Veranda Kaya Set",
    ahaHook: "Fragrant pandan screwpine and coconut jam served at the historic Tanglin tearoom!", wowPunchline: "🍞 Infused with real Pandanus amaryllifolius grown in the Economic Garden since colonial days!",
    funnyTag: "🍞 Botanical Kaya Set!", gagButtonLabel: "🍞 DUNK TANGLIN TOAST!",
    comicQuips: ["🍞 PANDAN LEAF FRESH!","🥚 MORNING JOG REWARD!","☕ UNCLE TAI CHI BREAK!"], toyAction: "kopi_pour", toyReaction: "🍞 TANGLIN BREAKFAST!",
    category: "supertree", glbModel: "Relic_13", habitatKey: "supertree_medium",
    zoneName: "Tanglin & Bandstand", icon: "🍞", x: 11, z: 2, isLandmarkRelic: false
  },
  {
    id: 14, name: "The Halia Torch-Ginger & Chili Crab Cauldron", shortName: "Torch Ginger Cauldron",
    ahaHook: "Simmered with pink Etlingera elatior (Torch Ginger) flowers from the Ginger Garden!", wowPunchline: "🌺 Zingiberaceae family flex! Tangy pink torch-ginger buds make every sauce 10x more aromatic!",
    funnyTag: "🌺 Torch Ginger Zing!", gagButtonLabel: "🦀 TOSS GINGER GARDEN WOK!",
    comicQuips: ["🌺 TORCH GINGER ZING!","🦀 HALIA VERANDA FEAST!","🔥 RAINFOREST SPICE!"], toyAction: "chope_slam", toyReaction: "🦀 GINGER SPICE!",
    category: "supertree", glbModel: "Relic_14", habitatKey: "supertree_medium",
    zoneName: "Eco-Lake & Ginger", icon: "🦀", x: 30, z: -4, isLandmarkRelic: false
  },
  {
    id: 15, name: "Plantation Director’s Enamel Tingkat Tiffin", shortName: "Botanist Field Tingkat",
    ahaHook: "Carried into the primary rainforest reserve for all-day plant taxonomy expeditions!", wowPunchline: "🍱 Packed with spice-garden turmeric rice and nutmeg curry for 19th-century plant hunters!",
    funnyTag: "🍱 Jungle Field Lunch!", gagButtonLabel: "🍱 UNSTACK BOTANIST TIFFIN!",
    comicQuips: ["🍱 HERBARIUM LUNCH TIME!","🌿 SPICE GARDEN CURRY!","🔍 NEW SPECIES FOUND!"], toyAction: "happy_bounce", toyReaction: "🍱 FIELD TIFFIN!",
    category: "supertree", glbModel: "Relic_15", habitatKey: "supertree_medium",
    zoneName: "Swan Lake", icon: "🍱", x: -16, z: -22, isLandmarkRelic: false
  },
  {
    id: 16, name: "Holttum Hall 1921 Orchid-Breeding Laboratory Box", shortName: "Holttum Lab Relic",
    ahaHook: "Built in 1921 where Prof. Eric Holttum pioneered sterile agar-flask orchid hybridization!", wowPunchline: "🧪 Inside this 1921 brick office, Holttum germinated orchid seeds in glass flasks and sparked a global boom!",
    funnyTag: "🧪 Orchid Lab Pioneer!", gagButtonLabel: "🧪 GLOW HOLTTUM FLASK!",
    comicQuips: ["🧪 1921 LAB BREAKTHROUGH!","🌺 AGAR FLASK MAGIC!","🏆 NATIONAL MONUMENT!"], toyAction: "happy_bounce", toyReaction: "🧪 HOLTTUM GENIUS!",
    category: "supertree", glbModel: "Relic_16", habitatKey: "understorey_dome",
    zoneName: "Tanglin & Bandstand", icon: "🧪", x: 16.5, z: 14.5, isLandmarkRelic: true
  },
  {
    id: 17, name: "Nutmeg & Clove 1822 Raffles Spice Goblet", shortName: "1822 Spice Goblet",
    ahaHook: "Honors Stamford Raffles’ original 1822 spice garden cultivating nutmeg and cloves!", wowPunchline: "🍹 Before Tanglin (1859), Raffles planted nutmeg and clove trees that kickstarted Singapore botany!",
    funnyTag: "🍹 1822 Nutmeg Elixir!", gagButtonLabel: "🍹 SWIRL SPICE NECTAR!",
    comicQuips: ["🍹 1822 NUTMEG ZING!","🌿 CLOVE & CINNAMON!","🥂 BOTANICAL TOAST!"], toyAction: "water_spit", toyReaction: "🍹 SPICE TOAST!",
    category: "supertree", glbModel: "Relic_17", habitatKey: "supertree_hero",
    zoneName: "Tanglin & Bandstand", icon: "🍹", x: -12, z: -3, isLandmarkRelic: false
  },
  {
    id: 18, name: "Evolution Garden Cycad & Tree-Fern Amber Chest", shortName: "Prehistoric Cycad Chest",
    ahaHook: "Living fossils from the dinosaur era—giant tree ferns and ancient cycad cones!", wowPunchline: "🦕 Walk 450 million years from single-celled algae to Jurassic cycads in 15 minutes flat!",
    funnyTag: "🦕 Jurassic Plant Boss!", gagButtonLabel: "🦕 UNLOCK JURASSIC FLORA!",
    comicQuips: ["🦕 DINOSAUR SALAD!","🌿 450M YEARS OLD!","🔥 CYCAD CONE POWER!"], toyAction: "lantern_glow", toyReaction: "🦕 LIVING FOSSIL!",
    category: "supertree", glbModel: "Relic_18", habitatKey: "tree_giantfern",
    zoneName: "Tanglin & Bandstand", icon: "🦕", x: 4, z: 14, isLandmarkRelic: false
  },
  {
    id: 19, name: "Tan Hoon Siang Mist House Porcelain Orchid Urn", shortName: "Mist House Orchid Urn",
    ahaHook: "Named after Tan Chay Yan’s son—keeps delicate slipper orchids in cool tropical mist!", wowPunchline: "🏺 Houses rare Paphiopedilum lady’s-slipper orchids that look like tiny porcelain teacups!",
    funnyTag: "🏺 Slipper Orchid Gem!", gagButtonLabel: "🏺 MIST SLIPPER ORCHIDS!",
    comicQuips: ["🏺 LADY SLIPPER BLOOM!","💦 TROPICAL MIST HOUSE!","✨ RARE HYBRID URN!"], toyAction: "happy_bounce", toyReaction: "🏺 MIST HOUSE GEM!",
    category: "conservatory", glbModel: "Relic_19", habitatKey: "flower_dome",
    zoneName: "Orchid Garden", icon: "🏺", x: 22, z: -24, isLandmarkRelic: false
  },
  {
    id: 20, name: "Lady Yuen-Peng McNeice Bromeliad Slippers", shortName: "McNeice Bromeliad Gem",
    ahaHook: "Celebrates the 1994 Yuen-Peng McNeice Bromeliad Collection of 800+ Neotropical plants!", wowPunchline: "🍍 Pineapple cousins! Rosette leaves catch rainwater in mid-air without needing soil!",
    funnyTag: "🍍 Air-Plant Royalty!", gagButtonLabel: "🍍 SPARKLE BROMELIAD!",
    comicQuips: ["🍍 PINEAPPLE COUSIN!","💧 SKY RAIN TANK!","🌺 CRIMSON ROSETTE!"], toyAction: "happy_bounce", toyReaction: "🍍 BROMELIAD BLING!",
    category: "conservatory", glbModel: "Relic_20", habitatKey: "cloud_forest",
    zoneName: "Orchid Garden", icon: "🍍", x: 34.5, z: -21.5, isLandmarkRelic: false
  },
  {
    id: 21, name: "750,000-Sheet Singapore Herbarium Specimen Press", shortName: "1875 Herbarium Press",
    ahaHook: "Founded in 1875—safeguards 750,000 dried rainforest type specimens from across SE Asia!", wowPunchline: "📚 Stacked layer by layer like kueh lapis—every pressed leaf is a 150-year botanical time capsule!",
    funnyTag: "📚 750K Leaf Vault!", gagButtonLabel: "📚 PRESS HERBARIUM SHEET!",
    comicQuips: ["📚 750,000 SPECIMENS!","🌿 1875 TIME CAPSULE!","🔬 TAXONOMY BOSS!"], toyAction: "happy_bounce", toyReaction: "📚 HERBARIUM VAULT!",
    category: "conservatory", glbModel: "Relic_21", habitatKey: "flower_dome",
    zoneName: "Orchid Garden", icon: "📚", x: 13, z: -37, isLandmarkRelic: false
  }
];
