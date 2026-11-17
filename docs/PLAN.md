# Gardens by the Bay: 3D Miniature Treasure Hunt — Master Implementation Plan (`PLAN.md`)

## 1. Project Vision & Core Visual Assets

Build a high-performance (60 FPS), interactive **3D Miniature Treasure Hunt Game** set across the full **Gardens by the Bay (Bay South)** peninsula in Singapore. Players control a **3rd-Person Miniature Explorer Avatar (Option B)** running across garden paths, bridges, and waterfront promenades to discover **42 iconic Singaporean & Gardens by the Bay treasures** across **2 core game modes**: **Relaxed Mode (Count-Up Stopwatch)** and **Timed Race (4-Player Competition: You vs. 3 Differentiated AI Bots)**.

### Core Reference Assets (Locked Foundation)
1. **Core Asset 1 — Detailed Geographic Map Blueprint**:
   - Workspace Path: [GB-Map-15-02-2026.jpg](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/GB-Map-15-02-2026.jpg)
   - Role: Ground-truth coordinate reference for the peninsula coastline, Dragonfly Lake channel, Lotus/Kingfisher wetlands, path network, bridges, and landmark locations.
2. **Core Asset 2 — Approved 3D Full-Map Diorama Style Guide**:
   - Workspace Path: [OpenAI Playground 2026-10-24 at 09.07.26.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/OpenAI%20Playground%202026-10-24%20at%2009.07.26.png)
   - Role: Visual aesthetic benchmark — architectural scale model resting on a cream bevelled base over teal water, featuring clean smooth-beveled geometry, emerald/mint foliage puffs, ribbed glass conservatories, magenta-crowned Supertrees, and warm golden-hour sunlight.
3. **The 11 Core Game Screens (Adversarial-Critic-Approved Visual & UI Blueprints)**:
   - Saved in [`assets/screens/`](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens):
     1. [screen_01_title_peninsula_overview.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_01_title_peninsula_overview.png) — Title Screen & Full Peninsula Overview (`Timed Race 4P vs AI` & `Relaxed Explore 42 Items`)
     2. [screen_02_mode_and_map_select.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_02_mode_and_map_select.png) — Expedition Setup: 2 Game Modes, 4-Player AI Bot Ability Roster & Map Zone Select
     3. [screen_03_zone1_supertree_grove.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_03_zone1_supertree_grove.png) — Zone 1: Central Supertree Grove & OCBC Skyway
     4. [screen_04_zone2_conservatories_waterfront.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_04_zone2_conservatories_waterfront.png) — Zone 2: Flower Dome, Cloud Forest & Waterfront Promenade
     5. [screen_05_zone3_dragonfly_lake_heritage.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_05_zone3_dragonfly_lake_heritage.png) — Zone 3: Dragonfly Lake, Bridge & Heritage Gardens
     6. [screen_06_zone4_meadow_planet_sculpture.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_06_zone4_meadow_planet_sculpture.png) — Zone 4: The Meadow, Floating Baby Sculpture (*Planet*) & Bayfront Plaza
     7. [screen_07_zone5_childrens_garden_wetlands.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_07_zone5_childrens_garden_wetlands.png) — Zone 5: Kingfisher Wetlands, Serene Garden & Children's Garden
     8. [screen_08_night_garden_rhapsody_event.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_08_night_garden_rhapsody_event.png) — Special Event: Nighttime "Garden Rhapsody" Bioluminescent Show
     9. [screen_09_multiplayer_splitscreen_race.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_09_multiplayer_splitscreen_race.png) — 4-Player Timed Race Gameplay (Human Explorer vs. 3 Differentiated AI Bots + Phase 2 Gadget Slot Hook)
     10. [screen_10_treasure_card_and_leaderboard.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_10_treasure_card_and_leaderboard.png) — 42-Treasure Discovery Encyclopedia & 4-Player Timed Race Leaderboard
     11. [screen_11_full_map_treasure_and_player_tracker.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/screens/screen_11_full_map_treasure_and_player_tracker.png) — Interactive Full-Map View (Showing All 42 Treasure Locations & Real-Time Positions of All 4 Players)

---

## 2. Locked Gameplay Modes, Differentiated AI Bots & Phase 2 Attack Architecture

### 2.1 The 2 Core Game Modes
1. **Mode 1 — Relaxed Mode (`42 Collectibles` + Count-Up Stopwatch Timer)**:
   - **No countdown time limit**: Players explore the entire Gardens by the Bay peninsula at their own pace until all **42 treasures** (`0 / 42` → `42 / 42`) are discovered.
   - **Count-Up Stopwatch Timer**: A precision count-up timer (`00:00` upwards) runs in the top-left HUD so players can track their total exploration time and record fastest 100% (`42/42`) completion times on the Relaxed Leaderboard.
2. **Mode 2 — Timed Race (`4 Players Competing` — `03:00` or `05:00` Countdown)**:
   - **Always 4 Players Competing Simultaneously**: The human player (`Player 1`) competes in real time against **3 autonomous AI Bot Explorers** across the garden to see who collects the most out of the **42 treasures** before the `3-minute (03:00)` or `5-minute (05:00)` clock expires (or until all 42 items are claimed).
   - **Live 4-Player Race Standings HUD**: Displays real-time treasure counts and scores for all 4 competitors in the top-right corner.

### 2.2 The 4 Competing Explorers & Differentiated AI Bot Abilities
Each of the 3 AI Bots (`src/entities/AIBotController.js`) runs an independent navigation & decision-making state machine with a distinct backpack color, visual aura, and specialized gameplay ability:

| Slot | Explorer Name | Backpack Color | Specialized Ability & AI Behavior Profile | Visual Aura / Indicator |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **YOU (Explorer 1)** | **Blue (`#2D7FF9`)** | **Balanced All-Rounder**: Responsive player-controlled sprint (`Space`/`Shift`), proximity compass ring, and tactical full-map access (`M`/`Tab`). | Golden directional compass ring at feet |
| **AI 1** | **Bot Kai ("Speedster")** | **Coral-Red (`#FF5A5F`)** | **+20% Promenade Sprint Speed**: Moves 20% faster on straightaways, boardwalks, and bridges; prioritizes long-distance open promenade treasures. | Warm orange-gold wind trail particles behind boots |
| **AI 2** | **Bot Mei ("Radar Tracker")** | **Emerald-Green (`#10B981`)** | **2x Treasure Cluster Radar (`35m` Scan)**: Evaluates local spatial density to sweep clusters of 3–5 nearby flowerbed treasures with maximum efficiency. | Pulsing translucent emerald radar ring around feet |
| **AI 3** | **Bot Raj ("Pathfinder")** | **Amber-Gold (`#F59E0B`)** | **All-Terrain & High-Value Relic Seeker**: Zero speed penalty on stairs, slopes, or wetland bridges; prioritizes 2x-point Landmark Relics and Night Rhapsody items. | Golden waypoint beacon & trail |

### 2.3 Future-Proof "Attack / Gadget Tools" Architecture (Phase 2 Ready — Stubbed in Phase 1)
To ensure seamless future expansion for player-vs-player/bot "Attack Tools" in Phase 2 (without building active combat in Phase 1):
- **Entity Status Effect Pipeline (`ExplorerStatusManager.js`)**: Every explorer (`Human` and `AIBot`) implements a clean status-modifier interface supporting `SPEED_BOOST`, `SLOW_TRAP`, `POLLEN_BLIND`, `VINE_SNARE_STUN`, and `SHIELD_IMMUNITY`, plus an `inventorySlot` property.
- **Extensible Gadget Registry (`src/data/gadgetsSchema.js`)**: Pre-defines the data schema and hook interfaces for Phase 2 Garden Gadgets:
  - *Pollen Smoke Puff* (obscures rival radar for 5s)
  - *Creeper Vine Snare* (briefly roots a nearby rival explorer for 2.5s)
  - *Durian Husk Slip-Trap* (drops a spiky obstacle on bridges/paths that slows rivals by 40%)
  - *Orchid Magnet Surge* (doubles treasure pickup radius for 6s)
- **HUD Gadget Slot Preview**: In Timed Race mode (`Screen 09`), the bottom-right HUD includes a sleek circular **Gadget Slot (`[Q] Gadgets — Phase 2`)** showing the locked/ready slot architecture.

### 2.4 Interactive Full-Map Screen (`Screen 11` — `M` / `Tab` Key or Minimap Click)
- Pressing `M`, `Tab`, or clicking the bottom-left circular minimap smoothly transitions to the **Full Garden Tactical Map View (`Screen 11`)**:
  - Overhead 3D/2.5D view of the entire Bay South peninsula board.
  - Displays **all 42 Treasure Pins** in real time:
    - **Glowing Gold Star Pins**: Remaining uncollected treasures.
    - **Soft Green Checkmark Dots**: Already collected treasures.
    - **Crown Relic Badges**: High-value 2x-point Landmark Relics.
  - Displays **all 4 Players' Real-Time Positions & Headings**:
    - `🔵 YOU (Player 1)` with a pulsing ring and dotted navigation line to the nearest treasure.
    - `🔴 Bot Kai (Speedster)` moving in real time with his speed trail.
    - `🟢 Bot Mei (Radar)` with her green radar scan radius circle.
    - `🟡 Bot Raj (Pathfinder)` with his target vector.
  - Includes a live legend panel showing remaining treasure counts per zone and a `CLOSE MAP [M / TAB]` button.

---

## 3. 60 FPS Performance Architecture

- **Tech Stack**: Vite + Vanilla TypeScript/JavaScript + Three.js (`three`) + Web Audio API + CSS3 Glassmorphic UI Overlays.
- **Global Typography Standard (`Poppins` Font)**: Load Google Fonts **`Poppins` (`wght@400;500;600;700;800`)** globally in `index.html` and enforce `font-family: 'Poppins', sans-serif;` across **all 11 screens**, HUD cards, timers, buttons, 3D floating nameplates, encyclopedia cards, leaderboard tables, and 2D Canvas labels.
- **Merged Static Geometry (`BufferGeometryUtils.mergeGeometries`)**: Combine all static terrain slabs, pathways, bridges, and landmark structures by material type so the entire peninsula renders in `< 15` static draw calls.
- **GPU Instancing (`THREE.InstancedMesh`)**: Render all ~600+ stylized smooth-beveled trees, palms, bushes, lotus lily pads, and 18 Supertree trunks/canopies in `< 6` instanced draw calls.
- **42 Collectibles Batching**: Manage all 42 floating treasures with shared geometries/materials and lightweight uniform/transform updates for 60 FPS rotation, bobbing, and pickup burst particles.

---

## 4. Milestone-by-Milestone Implementation Roadmap

### Milestone 1: Project Scaffolding, 60 FPS Render Engine & Nano Banana Asset Generation
- [ ] **1.1 Initialize Vite + Three.js Project**:
  - Set up `package.json`, `vite.config.js`, `index.html`, and modular `src/` architecture (`src/core/`, `src/world/`, `src/entities/`, `src/ui/`, `src/audio/`, `src/data/`).
- [ ] **1.2 Render Pipeline & Camera Controller**:
  - Build `RendererManager` and `CameraController` supporting smooth 3rd-Person Option B Chase Camera, Bird's-Eye Title Orbit, and instant transition to the **Screen 11 Full-Map Tactical Overview Camera** (`M` / `Tab`).
- [ ] **1.3 Generate Collectible Badge Icons & UI Textures with Nano Banana (`image-generator`)**:
  - Generate crisp, stylized 3D-rendered icon badges (`assets/textures/treasures/`) for the treasure families and landmark relics used in HUD discovery popups and the Screen 10 Encyclopedia.

### Milestone 2: Full Peninsula 3D Diorama Terrain, Waterways & Pathway Network
- [ ] **2.1 Peninsula Base Board & Water Channels**:
  - Construct the exact Bay South peninsula silhouette matching `GB-Map-15-02-2026.jpg` and `OpenAI Playground 2026-10-24 at 09.07.26.png` on a warm cream bevelled architectural base (`#F4EFE6`) surrounded by deep turquoise Marina Reservoir water (`#2C6B7F`) with subtle animated water ripples.
  - Carve the winding **Dragonfly Lake & Kingfisher Lake** inner channel (`#4FA6B8`) separating the West Bayfront promenade from the main garden island, plus the central Lotus Pond and eastern Water Lily Pond.
- [ ] **2.2 Pathway Network, Waypoint NavGraph, Bridges & Marina Gardens Drive**:
  - Build the interconnected warm sand/cream pedestrian pathway network (`#EFE6D5`), waterfront boardwalks, **Dragonfly Bridge**, **Waterfront Bridge**, and timber wetland footbridges.
  - Construct the **Waypoint Navigation Graph (`NavGraph.js`)** across all garden paths and bridges so the 3 AI Bots can pathfind smoothly around water channels and landmarks across the entire peninsula.
  - Build the curving dark-grey **Marina Gardens Drive** road loop along the southern/eastern perimeter with animated miniature cars driving smoothly along spline curves.
- [ ] **2.3 Instanced Smooth-Beveled Tropical Foliage & Flower Beds**:
  - Populate the peninsula with `THREE.InstancedMesh` clusters of plump, smoothly rounded emerald, jade, and mint trees, tropical fan palms, manicured hedges, flush floating lotus lily pads, and vibrant floral beds.

### Milestone 3: Iconic 3D Landmarks Across All 7 Map Zones
- [ ] **3.1 Zone 1 — Central Supertree Grove, OCBC Skyway & Canopy (`screen_03`)**:
  - Build the 12 central Supertrees (plus 3 in Silver Garden and 3 in Golden Garden = 18 total) with purple/white lattice trunks, terracotta cores, and flared magenta/purple canopies.
  - Suspend the S-curved yellow **OCBC Skyway** aerial walkway between the central Supertrees with upward tension cables, and build **The Canopy** tensile roof and **World of Plants** wooden lattice dome.
- [ ] **3.2 Zone 2 — Twin Glass Conservatories & Waterfront Promenade (`screen_04`)**:
  - Construct the curvilinear ribbed glass shells of the **Flower Dome** and **Cloud Forest** (with visible interior green mountain and cascading cyan waterfall), plus the circular **Floral Clock** and waterfront promenade railing.
- [ ] **3.3 Zone 3 — Dragonfly Lake, Red Moon Gate & Heritage Gardens (`screen_05`)**:
  - Build the wooden **Dragonfly Bridge**, the **Red Heritage Moon Gate** spanning the garden path, the traditional timber **Malay Kampong Pavilion**, and white Frangipani flowerbeds.
- [ ] **3.4 Zone 4 — The Meadow, Floating Baby Sculpture (*Planet*) & Bayfront Plaza (`screen_06`)**:
  - Sculpt the contoured green amphitheater bowl of **The Meadow**, place the smooth matte-white **Floating Baby Sculpture (*Planet* by Marc Quinn)** in its authentic **supine (face-up, lying on its back) mid-air floating pose** balanced solely on its lower right hand/wrist touching the manicured green grass mound (head on the left facing skyward, left hand resting on chest, bent knees & feet floating in mid-air on the right, bordered by variegated low shrubs and an angled dark-blue info plaque stand per [reference_floating_baby_planet.png](file:///Users/momo/Desktop/Antigravity/GBB%20TreasureHunt%20Experiments/assets/reference_floating_baby_planet.png)), and build the white organic lattice **SG50 Lattice / Bayfront Pavilion**.
- [ ] **3.5 Zone 5 — Kingfisher Wetlands, Serene Garden & Children's Garden (`screen_07`)**:
  - Build the **Children's Garden** turquoise splash pad with curved yellow/orange water-play tubes, the authentic **Serene Garden Japanese Timber Pavilion** with Zen rockery and mini-waterfall, and the 3 **Golden Garden Supertrees**.

### Milestone 4: Player Explorer Avatar, 3 Differentiated AI Bots & Phase 2 Gadget Hooks
- [ ] **4.1 Miniature Explorer Avatar 3D Rig (`ExplorerAvatar.js`)**:
  - Create the stylized miniature explorer character matching Locked Option B: tan safari pith helmet, beige explorer tunic, khaki shorts, boots, and color-coded backpack (**Player 1: Blue `#2D7FF9`**, **Bot Kai: Coral-Red `#FF5A5F`**, **Bot Mei: Emerald-Green `#10B981`**, **Bot Raj: Amber-Gold `#F59E0B`**).
  - Include procedural animations for Idle, Run, Sprint, and Treasure Pickup Celebration, plus distinct particle/ring effects for each AI Bot's specialty (Kai's speed wind lines, Mei's emerald radar pulse ring, Raj's golden pathfinder beacon).
- [ ] **4.2 Differentiated AI Bot Controller (`AIBotController.js`)**:
  - Implement autonomous pathfinding over `NavGraph.js` with differentiated target scoring:
    - **Bot Kai (Speedster)**: `1.2x` straightaway speed multiplier; scores long promenade runs highest.
    - **Bot Mei (Radar Tracker)**: `2.0x` cluster scan radius (`35m`); scores multi-treasure clusters highest.
    - **Bot Raj (Pathfinder)**: `1.0x` unpenalized terrain/bridge traversal; scores 2x-point Landmark Relics and Night bonus items highest.
- [ ] **4.3 Future Phase 2 Attack / Gadget Hook (`GadgetSystem.js`)**:
  - Implement the extensible status effect pipeline (`applyGadgetEffect(targetExplorer, effectType)`) and data definitions (`gadgetsSchema.js`) so Phase 2 attack tools can plug directly into player/bot controllers, alongside the HUD `Gadget Slot (Phase 2)` UI indicator.

### Milestone 5: Lighting System & "Garden Rhapsody" Night Show (`screen_08`)
- [ ] **5.1 Sunny Golden-Hour Daylight Preset**:
  - Warm golden directional sunlight casting crisp diagonal shadows across the cream pathways, turquoise water highlights, and vibrant foliage matching Core Asset 2.
- [ ] **5.2 "Garden Rhapsody" Night Show Preset & Live Transition**:
  - Smoothly interpolate sky/fog to deep twilight indigo (`#0D1528`), illuminate all 18 Supertree trunks and crowns with pulsing magenta (`#FF2A85`), cyan (`#00F0FF`), and gold (`#FFD700`) emissive shaders, light up the OCBC Skyway, turn the Flower Dome & Cloud Forest into glowing crystal lanterns, switch on explorer headlamps, and activate the **2x Night Bonus Multiplier**.

### Milestone 6: 42 Garden Treasures, Proximity Compass & Interactive Full-Map Tracker (`screen_11`)
- [ ] **6.1 42 Stylized 3D Collectible Treasures (`TreasureManager.js`)**:
  - Distribute **42 collectibles** across all zones of the Bay South peninsula (6–8 items per zone, combining botanical orchids, cultural Peranakan/Heritage relics, and 7 major 2x-point Landmark Relics):
    - **Zone 1 (Supertree Grove — 8 items)**: *Golden Vanda Miss Joaquim Orchid*, *OCBC Skyway Star Crest*, *Solar Supertree Core*, *Bromeliad Sky Blossom*, *Canopy Tensile Badge*, *World of Plants Amber Seed*, *Grove Fountain Pearl*, *Supertree Rhapsody Chime*.
    - **Zone 2 (Conservatories & Waterfront — 8 items)**: *Peranakan Porcelain Kamcheng Vase*, *Cloud Waterfall Crystal Droplet*, *Floral Clock Golden Gear*, *Mediterranean Olive Wreath*, *Baobab Giant Seed*, *Lost World Cloud Orchid*, *Waterfront Promenade Compass*, *Marina Reservoir Starfish*.
    - **Zone 3 (Dragonfly Lake & Heritage — 7 items)**: *Golden Merlion Statuette*, *Malay Kampong Keris Medallion*, *Chinese Moon Gate Jade Seal*, *Indian Garden Lotus Lamp*, *Colonial Spice Nutmeg*, *White Frangipani Crown*, *Dragonfly Bridge Timber Crest*.
    - **Zone 4 (The Meadow & Bayfront — 7 items)**: *Golden Dragonfly Relic*, *Planet Floating Baby Miniature*, *SG50 Lattice Diamond*, *Bayfront Floral Fantasy Bouquet*, *Poison Dart Frog Gem*, *Meadow Amphitheater Lyre*, *Water Lily Pavilion Dewdrop*.
    - **Zone 5 (Wetlands, Serene & Children's Garden — 7 items)**: *Golden Durian King Crown*, *Serene Zen Bonsai Lantern*, *Kingfisher Lotus Pearl*, *Splash Pad Water Spire*, *Adventure Trail Canopy Acorn*, *Weeping Bamboo Scroll*, *Kingfisher Emerald Feather*.
    - **Zone 6/7 (Silver Garden, Golden Garden & Satay Waterfront — 5 items)**: *Satay by the Bay Golden Skewer*, *Silver Supertree Crest*, *Golden Garden Sunburst*, *Canyon Sculpted Boulder Relic*, *Bay South Master Key*.
- [ ] **6.2 Proximity Compass Ring & Bottom-Left Radar Mini-Map**:
  - Render a golden directional arrow ring around the player's feet pointing toward the nearest uncollected treasure, plus a real-time **Bottom-Left Circular Minimap** showing nearby treasures, all 4 player arrows, and a `[M] Full Map` button.
- [ ] **6.3 Interactive Full-Map Overview Screen (`Screen 11` — `FullMapOverlay.js`)**:
  - Toggleable at any time via `M`, `Tab`, or clicking the minimap.
  - Shows the full Bay South peninsula from above with **all 42 treasure locations** (Available Gold Stars, Collected Green Checkmarks, 2x Landmark Crowns) and **live moving pins for YOU (Blue) + Bot Kai (Coral) + Bot Mei (Green) + Bot Raj (Gold)**, alongside the live 4-Player Tracker Legend.

### Milestone 7: Complete 11-Screen UI Flow, Web Audio Soundtrack & Verification
- [ ] **7.1 Crisp Native HTML/CSS Glassmorphic Screens Matching Screens 01–11**:
  - **Screen 01 (Title Screen)**: Full peninsula 3D overview + waving Explorer + buttons for `▶ TIMED RACE (4P VS AI BOTS)`, `RELAXED EXPLORE (42 ITEMS)`, and `LEADERBOARD & 42 RELICS`.
  - **Screen 02 (Expedition Setup)**: Mode selector (`Timed Race 4P` vs `Relaxed Mode Solo`), Timer selector (`03:00` / `05:00` / `Count-Up Stopwatch`), Lighting toggle (`Sunny Golden Hour` / `Night Rhapsody`), **4 Competing Explorers Roster** (showing Bot Kai, Bot Mei, and Bot Raj's differentiated abilities), interactive 3D Map Zone spawn pins, and `START EXPEDITION (42 TREASURES)`.
  - **Screens 03–09 (Gameplay HUD)**:
    - In **Relaxed Mode**: Top-left Count-Up Stopwatch (`⏱ 04:12`) + `Treasures: X / 42`.
    - In **Timed Race Mode (`Screen 09`)**: Top-left Countdown Timer (`⏱ 02:14`) + `Treasures: X / 42`, Top-right **Live 4-Player Standings** (`YOU`, `Bot Kai`, `Bot Mei`, `Bot Raj`), Bottom-left Minimap with `[M] Full Map` button, Bottom-right **Gadget Slot (Phase 2 Ready)** preview, and slide-in **Treasure Discovered!** trivia cards.
  - **Screen 10 (42-Treasure Encyclopedia & 4-Player Leaderboard)**: Left panel browsing all `42 / 42` discovered 3D badges (`Page 1 / 7`) with Gardens by the Bay trivia; Right panel showing the **4-Player Timed Race Final Standings** (or Relaxed Mode Best Times), persistent `localStorage` High Scores, `PLAY AGAIN`, and `MAIN MENU`.
  - **Screen 11 (Live Full-Map View)**: Real-time full-peninsula map showing where all 42 treasures are and where all 4 players are.
- [ ] **7.2 Synthesized Web Audio Tropical Ambience & SFX (`AudioManager.js`)**:
  - Procedural tropical marimba/chime background ambience for Day Mode, atmospheric synth arpeggios for the "Garden Rhapsody" Night Show, footsteps, AI bot pickup alerts, and celebratory fanfare on treasure pickup.
- [ ] **7.3 End-to-End Automated & Visual Verification**:
  - Verify both game modes (`Relaxed Mode` and `4-Player Timed Race vs 3 AI Bots`), all 42 collectibles, AI bot movement/collection, the `M` Full-Map Tracker (`Screen 11`), Day/Night transition, and 60 FPS frame timing in a live browser with zero console or WebGL errors.
