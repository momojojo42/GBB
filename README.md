# 🌿 Singapore 3D Treasure Hunt — Gardens by the Bay & Botanic Gardens

An interactive multi-park 3D botanical & cultural treasure hunt across Singapore's iconic landmarks (**Gardens by the Bay** & **Singapore Botanic Gardens UNESCO Heritage Site**), built with **Three.js**, **Headless Blender 4.2 `.glb` assets**, **WebSocket Multiplayer**, and **Vite**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development server with WebSocket multiplayer relay (http://127.0.0.1:8080)
npm run dev

# Build production bundle into dist/
npm run build

# Run production Node.js server (static + WebSocket multiplayer)
npm start
```

---

## 🖥️ Application Entry Points

| Page | File | Description |
| :--- | :--- | :--- |
| **Game Page** | [`index.html`](./index.html) | Playable 3D game with Interactive Singapore Welcome Map, Solo Chill Stroll, 3-Min AI Bot Race, and 4P WebSocket Party Mode across 42 relics per park |
| **Admin & LookDev Studio** | [`admin.html`](./admin.html) | Protected Admin Workbench with live lighting, post-FX, camera, material LookDev Studio, and 3D Animation Inspector |
| **Build Progress (Plan Pt. 1)** | [`progress.html`](./progress.html) | Visual step-by-step gallery & executive engineering log showcasing Blender 3D models, geodesic calibration, and UI passes |
| **Post-MVP Roadmap (Plan Pt. 2)** | [`roadmap.html`](./roadmap.html) | Product & engineering specification for multi-park expansion and gameplay milestones |
| **Technical Sharing Deck** | [`presentation.html`](./presentation.html) | Interactive slide deck covering the 3D pipeline, geodesic cartography, and AI agent architecture |

---

## 📂 Refactored Project Architecture (Organized by Functionality)

```text
├── index.html                        # Entry 1: Playable 3D Game Page
├── admin.html                        # Entry 2: Protected Admin & LookDev Studio
├── progress.html                     # Entry 3: MVP Build Progress Gallery & Executive Log
├── roadmap.html                      # Entry 4: Post-MVP Product & Engineering Roadmap
├── presentation.html                 # Entry 5: Interactive Technical Sharing Presentation
├── server.js                         # Production Node.js HTTP + WebSocket Multiplayer Server
├── vite.config.js                    # Multi-page Vite bundler config + dev multiplayer plugin
├── package.json                      # NPM scripts & dependencies (Three.js, Vite)
├── Dockerfile                        # Production container image definition
├── deploy-cloudrun.sh                # One-command Google Cloud Run deployment script
│
├── src/                              # Modular Application Source Code
│   ├── main3d.js                     # Master 3D game coordinator & subsystem wiring
│   │
│   ├── core/                         # Engine Core, State, Environment, Input & Admin API
│   │   ├── AppState.js               # Reactive game state, fullscreen & mobile viewport manager
│   │   ├── FrameLoopRunner.js        # Main requestAnimationFrame loop & async world bootstrap
│   │   ├── GameplayRulesController.js # Game modes, bot difficulty, gadgets, hazards & finale
│   │   ├── RelicPickupAndScoring.js  # Relic collection, combo multipliers & mid-match drops
│   │   ├── AssetLoader.js            # GLTF/GLB asset bundle loader with progress callbacks
│   │   ├── MaterialAndTextureLibrary.js # Procedural PBR canvas textures & shared materials
│   │   ├── EnvironmentAndPostFX.js   # IBL lighting, fog, UnrealBloom & day/night coordinator
│   │   ├── DayNightLightingPresets.js # Day/night lighting keyframes & title showcase cycle
│   │   ├── LivingSkyDomeBuilder.js   # Procedural sky dome shader, sun/moon & twinkling stars
│   │   ├── InputAndTouchController.js # Keyboard, click-to-move & camera-relative movement
│   │   ├── TouchJoystickAndButtons.js # Mobile virtual thumbstick & action buttons
│   │   ├── AdminAuthGuard.js         # Session token gate & default LookDev studio settings
│   │   ├── LookDevAndAutomationApi.js # Screen switcher & live LookDev scene overrides
│   │   └── AutomationBridgeApi.js    # Window gbbApp automation & QA testing bridge
│   │
│   ├── camera/                       # 3D Camera Control
│   │   └── CameraController.js       # 3rd-person follow cam, orbit drag, presets & raycasting
│   │
│   ├── audio/                        # Web Audio API Synthesized Sound Engine
│   │   ├── SoundFX.js                # Master Web Audio synthesizer
│   │   └── RelicAndHazardSFX.js      # Relic toy gag sounds, hazard splashes & fanfares
│   │
│   ├── data/                         # Catalogs, Presets & Multi-Map Specifications
│   │   ├── MapRegistry.js            # Multi-destination registry ('gbb', 'sbg') & active map state
│   │   ├── SingaporeDestinationsSpec.js # Singapore island destination selector metadata
│   │   ├── ExplorerAndGadgetPresets.js # Explorer rosters, AI difficulty & field gadget specs
│   │   ├── RelicHumorAndGagsSpec.js  # 3D toy gag animations & Singlish comic quips
│   │   ├── WorldMapSpec.js           # Active map geometry, polygons, bridges & buildings bridge
│   │   ├── TreasuresCatalog.js       # Active map 42-relic catalog & zone detector bridge
│   │   └── maps/
│   │       ├── gbb/                  # Map 01: Gardens by the Bay (Bay South) Specs & Relics
│   │       │   ├── WorldStructuresAndPathsSpec.js
│   │       │   ├── TreasuresCatalogZones1To2.js
│   │       │   ├── TreasuresCatalogZone3.js
│   │       │   ├── TreasuresCatalogZones4To5.js
│   │       │   ├── gbb_spatial_spec.json
│   │       │   └── gbb_verification_report.json
│   │       └── sbg/                  # Map 02: Singapore Botanic Gardens (UNESCO) Specs & Relics
│   │           ├── SBGWorldMapSpec.js
│   │           ├── SBGStructuresAndPathsSpec.js
│   │           ├── SBGTreasuresCatalog.js
│   │           ├── SBGTreasuresZones1To3.js
│   │           ├── SBGTreasuresZones4To5.js
│   │           ├── SbgWorldSpec.js
│   │           ├── SbgZoneSpec.js
│   │           ├── SbgRelicCatalog.js
│   │           ├── SbgRelicSubcatalogs.js
│   │           └── sbg_spatial_spec.json
│   │
│   ├── maps/                         # Unified Multi-Map Packages & Water Mask Solvers
│   │   ├── index.js                  # Multi-map package barrel (MAP_PACKAGES)
│   │   ├── gbb/                      # Gardens by the Bay package & Dragonfly Lake mask solver
│   │   │   ├── index.js
│   │   │   └── GBBWaterMaskSolver.js
│   │   └── sbg/                      # Singapore Botanic Gardens package & 4-lake mask solver
│   │       ├── index.js
│   │       └── SBGWaterMaskSolver.js
│   │
│   ├── world/                        # 3D World Builders, Physics, Landmarks & Particle FX
│   │   ├── WorldPhysicsEngine.js     # Master physics barrel (elevation, collisions, navigation)
│   │   ├── TerrainAndTreasuresBuilder.js # Master coordinator for terrain, foliage & 42 relics
│   │   ├── LandmarksBuilder.js       # Master coordinator for park landmarks & light shows
│   │   ├── physics/                  # Heightmap, Bridges, Water Collision & Smart Waypoints
│   │   │   ├── TerrainElevation.js
│   │   │   ├── BridgeAndPortalSolver.js
│   │   │   ├── WaterAndCollisionSolver.js
│   │   │   ├── WaterAndWaypointSolver.js
│   │   │   └── SmartWaypointGraph.js
│   │   ├── terrain/                  # Landmass, Pathways, Vehicles & Foliage Instancing
│   │   │   ├── PeninsulaTerrainBuilder.js
│   │   │   ├── PathwaysAndBridgesBuilder.js
│   │   │   ├── BoulevardAndVehiclesBuilder.js
│   │   │   ├── VehiclesAnimator.js
│   │   │   ├── TreeGenerator.js
│   │   │   └── FoliageInstancer.js
│   │   ├── landmarks/                # Park Architecture & Procedural Attractions
│   │   │   ├── gbb/
│   │   │   │   ├── SupertreesAndDomesBuilder.js
│   │   │   │   └── ProceduralAttractionsBuilder.js
│   │   │   └── sbg/
│   │   │       ├── SBGMainLandmarksBuilder.js
│   │   │       └── SBGAttractionsBuilder.js
│   │   └── fx/                       # Relic Pedestals, Particle Bursts, Fireworks & Light Shows
│   │       ├── TreasuresAndParticlesBuilder.js
│   │       ├── TreasureUpdateAnimator.js
│   │       ├── CelebrationParticlesSystem.js
│   │       ├── FireworksBurstHelper.js
│   │       └── GardenRhapsodyShow.js
│   │
│   ├── entities/                     # Explorers, Chibi Character Rig & Bot AI
│   │   ├── CharacterAndBotBuilder.js # 4-Explorer manager, gadgets & endgame celebration
│   │   ├── ChibiExplorerRig.js       # Blender .glb limb binding, compass arrow & crown rig
│   │   ├── ChibiAnimator.js          # Stride cycle, jump arcs, 360° flips & idle breathing
│   │   ├── ExplorerMovementUpdater.js # Per-frame player & bot physics integration
│   │   ├── ExplorerHazardsAndPickpocket.js # Knockbacks, water rescues & proximity snatching
│   │   ├── BotAIController.js        # AI bot target selection, pathfinding & sidestepping
│   │   └── BotTargetScoring.js       # Utility scoring for bot relic selection
│   │
│   ├── multiplayer/                  # Real-Time WebSocket Multiplayer Client
│   │   ├── MultiplayerClient.js      # Room sync, relic choping locks & transform broadcast
│   │   ├── MultiplayerProtocolHelpers.js # Room codes & packet normalizers
│   │   └── RemoteTransformInterpolator.js # Smooth remote explorer position/yaw interpolation
│   │
│   ├── ui/                           # User Interface, HUD, Screens, 3D Inspector & Admin
│   │   ├── hud/                      # In-Game HUD, Radar, World Labels & Onboarding
│   │   │   ├── HudController.js
│   │   │   ├── HudCollectionTrayAndPopCard.js
│   │   │   ├── MiniRadarRenderer.js
│   │   │   ├── WorldLabelsManager.js
│   │   │   └── OnboardingController.js
│   │   ├── screens/                  # Full-Screen Overlays, Welcome Map, Tactical Map & Lobby
│   │   │   ├── WelcomeSingaporeMapController.js
│   │   │   ├── SingaporeMapSvgRenderer.js
│   │   │   ├── WelcomeAmbienceAndParticles.js
│   │   │   ├── MapWorldSwitcherController.js
│   │   │   ├── LoadingSplashController.js
│   │   │   ├── EncyclopediaModal.js
│   │   │   ├── TacticalMapRenderer.js
│   │   │   ├── EndGameModalController.js
│   │   │   ├── MultiplayerLobbyModal.js
│   │   │   └── MultiplayerPlazaLobby3D.js
│   │   ├── inspector/                # Interactive 360° 3D Relic & Toy Gag Stage
│   │   │   ├── Relic3DInspectorModal.js
│   │   │   ├── Relic3DStageRenderer.js
│   │   │   ├── RelicToyEffects.js
│   │   │   └── RelicToyAudioAndParticles.js
│   │   └── admin/                    # LookDev Studio & 3D Animation Workbench
│   │       ├── LookDevControlPanel.js
│   │       ├── LookDevSlidersTemplate.js
│   │       └── Admin3DAnimInspectorTab.js
│   │
│   ├── styles/                       # Modular CSS Architecture
│   │   ├── main.css                  # Entry stylesheet for index.html & admin.html
│   │   ├── progress-gallery.css      # Entry stylesheet for progress.html
│   │   ├── roadmap.css               # Entry stylesheet for roadmap.html
│   │   ├── presentation.css          # Entry stylesheet for presentation.html
│   │   ├── base/                     # Design tokens, typography & 3D world labels
│   │   ├── hud/                      # Gameplay HUD, scoreboard, dock, touch & podium styles
│   │   ├── screens/                  # Welcome map, title card, lobby, collection & inspector modals
│   │   ├── admin/                    # Top navigation bar, auth gate & LookDev sliders
│   │   └── pages/                    # Card styles for progress gallery & roadmap pages
│   │
│   └── plan/                         # Documentation & Presentation Page Controllers
│       ├── progressGallery.js
│       ├── progressExecutiveLog.js
│       └── presentationDeck.js
│
├── public/                           # Static 3D Models & Calibrated Map Assets
│   ├── maps/                         # 2D SVG metric floorplans & geodesic calibration overlays
│   ├── models/                       # Blender-exported .glb 3D asset packs (GBB & SBG)
│   └── assets/renders/               # Public studio renders for SBG relics & buildings
│
├── assets/                           # UI Assets, Avatars & Blender Render Galleries
│   ├── avatars/                      # Explorer portrait icons
│   ├── progress/                     # Milestone comparison captures
│   ├── renders/                      # Individual 3D model & 42-relic studio renders
│   └── screens/                      # High-res live screen captures
│
├── scripts/                          # Offline Asset Generation, Cartography & Server Plugins
│   ├── blender/                      # Headless Blender Python scripts for .glb generation
│   │   ├── gbb/                      # Gardens by the Bay buildings, characters, sculptures & 42 relics
│   │   └── sbg/                      # Singapore Botanic Gardens UNESCO buildings, sculptures & 42 relics
│   ├── cartography/                  # Geodesic map calibration & 2D SVG floorplan generators
│   │   ├── gbb/                      # Bay South geodesic calibration & floorplan generator
│   │   └── sbg/                      # NParks 1:1 Botanic Gardens floorplan & XY audit generator
│   ├── server/                       # Vite WebSocket multiplayer plugin & RFC 6455 frame codec
│   └── tools/                        # Utility scripts for gallery & PPTX deck generation
│
└── docs/                             # Architecture Docs, Presentations & Archived Resources
    ├── GAME_DEVELOPMENT_PLAN.md      # Multi-stage engineering & QA plan
    ├── PLAN.md                       # Master architectural & gameplay specification
    ├── TECH_SHARING_OUTLINE.md       # Technical sharing presentation outline
    ├── GBB_3D_AI_Technical_Sharing.pptx # Widescreen 16:9 technical sharing slide deck
    ├── references/                   # Official park reference map
    └── archive/                      # Archived legacy resources & intermediate calibration assets
        ├── v1_prototype/             # Archived v1 2D canvas prototype & stage prompts backup
        ├── mockups_and_trophies/     # Legacy screen mockups & early trophy icons
        └── cartography_calibration/  # Raw reference map scans & intermediate calibration grids
```
