# 🌿 Gardens by the Bay — 3D Treasure Hunt

An interactive 3D botanical & cultural treasure hunt across Singapore's **Gardens by the Bay**, built with **Three.js**, **Blender `.glb` assets**, and **Vite**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start local development server (http://127.0.0.1:8080)
npm run dev

# Build production bundle into dist/
npm run build
```

---

## 🖥️ Application Entry Points

| Page | File | Description |
| :--- | :--- | :--- |
| **Game Page** | [`index.html`](./index.html) | Main playable 3D game (Timed Race vs. 3 AI Bots or Solo Mode across 5 zones & 42 relics) |
| **Admin & LookDev View** | [`admin.html`](./admin.html) | Protected Admin Debug View with live lighting, post-FX, camera, and material LookDev Studio |
| **Build Progress (Plan Pt. 1)** | [`progress.html`](./progress.html) | Visual step-by-step gallery (Steps 1–7) showcasing Blender 3D models, renders, and UI passes |
| **Post-MVP Roadmap (Plan Pt. 2)** | [`roadmap.html`](./roadmap.html) | Product & engineering specification for upcoming Post-MVP Milestones #1–#5 |

---

## 📂 Project Directory Structure

```text
├── index.html                        # Entry 1: Playable 3D Game Page
├── admin.html                        # Entry 2: Protected Admin & LookDev Studio
├── progress.html                     # Entry 3: Plan View — MVP Build Progress Gallery
├── roadmap.html                      # Entry 4: Plan View — Post-MVP Roadmap
├── package.json                      # NPM scripts & dependencies (Three.js, Vite)
├── vite.config.js                    # Multi-page Vite bundler configuration
│
├── src/                              # Modular Application Source Code
│   ├── main3d.js                     # Master 3D game coordinator & animation loop
│   ├── audio/
│   │   └── SoundFX.js                # Web Audio API synthesized sound effects
│   ├── camera/
│   │   └── CameraController.js       # 3rd-person follow cam, preset orbit & click-to-move
│   ├── core/
│   │   ├── AdminAuthGuard.js         # Session token gate for Admin View
│   │   ├── AssetLoader.js            # GLTF/GLB & texture asset loader with fallbacks
│   │   ├── EnvironmentAndPostFX.js   # Sky dome, IBL lighting, fog & UnrealBloom composer
│   │   └── MaterialAndTextureLibrary.js # Procedural PBR canvas textures & shared materials
│   ├── data/
│   │   ├── ExplorerAndGadgetPresets.js # Field gadgets, AI difficulty & competitor specs
│   │   ├── TreasuresCatalog.js       # 42 botanical/cultural relics & 5-zone metadata
│   │   ├── WorldMapSpec.js           # Peninsula polygon, bridges, buildings, ponds & pillars
│   │   ├── gbb_spatial_spec.json     # Calibrated metric coordinates for park landmarks
│   │   └── gbb_verification_report.json # Geodesic affine calibration verification report
│   ├── entities/
│   │   ├── BotAIController.js        # AI bot target selection, pathfinding & sidestepping
│   │   ├── CharacterAndBotBuilder.js # 4-explorer manager, pickups, gadgets & finale cutscene
│   │   ├── ChibiAnimator.js          # Stride cycle, jump arcs, 360° flips & idle breathing
│   │   └── ChibiExplorerRig.js       # Blender GLB limb binding, compass arrow & crown rig
│   ├── plan/
│   │   └── progressGallery.js        # Accordion, step filters & lightbox controller for progress.html
│   ├── styles/
│   │   ├── main.css                  # Barrel stylesheet for index.html & admin.html
│   │   ├── variables-base.css        # Design tokens, typography & viewport base rules
│   │   ├── world-labels.css          # 3D-to-2D projected explorer & landmark pins
│   │   ├── navigation-admin.css      # Top bar, 3-view pill switcher & admin auth modal
│   │   ├── hud.css                   # Gameplay HUD cards, radar, clock & gadget bar
│   │   ├── modals-screens.css        # Screens 01 (Title), 02 (Setup), 10 (Catalog), 11 (Map)
│   │   ├── lookdev.css               # Real-time LookDev Studio control panel styles
│   │   ├── progress-gallery.css      # Stylesheet for progress.html
│   │   └── roadmap.css               # Stylesheet for roadmap.html
│   ├── ui/
│   │   ├── EncyclopediaModal.js      # Screen 10: 42-Relic passport grid & inspector
│   │   ├── HudController.js          # Live standings, zone badge, clock & toast banners
│   │   ├── LookDevControlPanel.js    # Interactive LookDev lighting & post-FX studio
│   │   ├── MiniRadarRenderer.js      # Bottom-left circular mini-radar canvas renderer
│   │   ├── TacticalMapRenderer.js    # Screen 11: Full-park tactical radar & teleport map
│   │   └── WorldLabelsManager.js     # 3D-to-2D floating nameplates & +1 popups
│   └── world/
│       ├── BoulevardAndVehiclesBuilder.js # Marina Gardens Drive, drop-off loop & 8 vehicles
│       ├── FoliageInstancer.js       # 195 deterministic tropical trees & contact shadows
│       ├── LandmarksBuilder.js       # Supertrees, OCBC Skyway, Domes, Bridges & Sculptures
│       ├── PeninsulaTerrainBuilder.js # Boomerang plinth, Dragonfly Lake, ponds & pathways
│       ├── TerrainAndTreasuresBuilder.js # Coordinator for terrain, foliage & 42 relics
│       ├── TerrainElevation.js       # Continuous heightmap, bridge decks & doorway portals
│       ├── TreasuresAndParticlesBuilder.js # 42 relic pedestals, sky beams & firework particles
│       ├── TreeGenerator.js          # Deterministic 195-tree park placement generator
│       ├── WaterAndCollisionSolver.js # Water hazards, obstacle sliding & smart waypoints
│       └── WorldPhysicsEngine.js     # Barrel module exporting all physics & map solvers
│
├── public/                           # Static 3D Models & Calibrated Map Assets
│   ├── maps/                         # 2D SVG floorplan & geodesic calibration overlays
│   └── models/                       # Blender-exported .glb 3D asset packs
│
├── assets/                           # UI Screenshots & Blender Render Galleries
│   ├── progress/                     # Milestone v1.0 / v2.0 comparison captures
│   ├── renders/                      # Individual 3D model & 42-relic studio renders
│   └── screens/                      # High-res reference & live screen captures
│
├── scripts/                          # Offline Asset Generation & Calibration Pipelines
│   ├── blender/                      # Python scripts for procedural Blender .glb generation
│   ├── cartography/                  # Geodesic map calibration & SVG floorplan generators
│   └── tools/                        # Utility scripts for gallery & catalog updates
│
└── docs/                             # Architecture Docs, Prompts & Reference Maps
    ├── GAME_DEVELOPMENT_PLAN.md      # Multi-stage engineering & QA plan
    ├── PLAN.md                       # Master architectural & gameplay specification
    ├── STAGE_PROMPTS_BACKUP.md       # Stage prompts backup
    ├── references/                   # Official park reference maps & concept art
    └── archive/                      # Archived v1 2D canvas prototype (app_v1_2d_prototype.js)
```
