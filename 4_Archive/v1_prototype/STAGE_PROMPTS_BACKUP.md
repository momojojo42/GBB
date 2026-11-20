# Gardens by the Bay 3D Treasure Hunt — Stage-by-Stage Prompts Backup

Use this file to copy and paste each stage prompt one by one after your assets finish generating. Every prompt enforces:
1. **`/goal` Mode**: The agent will not stop early until all criteria are met.
2. **`< 400 Lines` Per File Cap**: Modular files under `src/` verified via `wc -l`.
3. **60 FPS Performance Rules**: `THREE.InstancedMesh`, shared materials, and zero per-frame object allocations.
4. **Mandatory Subagent QA & Self-Critic Gate**: Spawns a dedicated QA subagent to test the live browser, compare screenshots against `assets/screens/`, check 0 console/WebGL errors, and fix any issues before stopping for your review.

---

## 1. Quick Overview Table

| Stage | Focus Area | Target File Cap | Mandatory QA Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1** | 3D Peninsula Base, Water Channels, Bridges & Pathways | `< 350 lines` per file | Live browser compare vs. `GB-Map-15-02-2026.jpg` & `screen_01` + 60 FPS + `wc -l` |
| **Stage 2** | 3D Landmarks Across Zones 1–5 & Instanced Foliage | `< 350 lines` per file | Zone close-up screenshots vs. `screens 03–07` & `reference_floating_baby_planet.png` + `wc -l` |
| **Stage 3** | 3rd-Person Explorer Avatar, Walk/Sprint & Path Collision | `< 350 lines` per file | Live walk/sprint test across paths & bridges + camera smoothness + `wc -l` |
| **Stage 4** | 42 Treasures, Pickup UI, Minimap, `[M]` Full Map & Relaxed Mode | `< 350 lines` per file | Live treasure pickup test + `[M]` Full-Map compare vs. `screen_11` + `wc -l` |
| **Stage 5** | Waypoint `NavGraph`, 3 AI Bots & 4-Player Timed Race | `< 350 lines` per file | Live 4P Timed Race vs. 3 AI bots + Standings HUD compare vs. `screen_09` + `wc -l` |
| **Stage 6** | Title/Setup Menus, Night Show (`Screen 08`), Encyclopedia & Audio | `< 350 lines` per file | End-to-end UI flow (`Screens 01, 02, 08, 10`) + Night glow + 0 errors + `wc -l` |
| **Stage 7** | Final Audit & Production `gbb-treasure-hunt-netlify.zip` | `< 400 lines` per file | Full regression check + verify `.zip` `< 15 MB` runs cleanly for Netlify Drop |

---

## 2. Copy-Paste Prompts (Click Copy on Each Block)

### Stage 1: 3D Peninsula, Water & Pathways + QA
```text
/goal Build Stage 1 only: Set up the Three.js 60 FPS scene and build the Bay South 3D peninsula base, turquoise water, Dragonfly Lake channel, bridges, and cream pathway network matching GB-Map-15-02-2026.jpg and screen_01_title_peninsula_overview.png. STRICT RULES: (1) Split files under src/core/ and src/world/terrain/ so NO file exceeds 350 lines. (2) Zero object allocations inside requestAnimationFrame. (3) MANDATORY QA GATE: Before finishing, spawn a QA & Visual Critic subagent to launch the app in a live browser, verify 0 console/WebGL errors, check 60 FPS, compare the live 3D island silhouette/pathways against GB-Map-15-02-2026.jpg and screen_01, and run wc -l to confirm all files are < 400 lines. Fix every issue the QA subagent finds before stopping for my review.
```

---

### Stage 2: 3D Landmarks & Foliage + QA
```text
/goal Build Stage 2 only: Add all iconic 3D landmarks and foliage across Zones 1–5 matching screens 03–07 (18 Supertrees + OCBC Skyway, Flower Dome, Cloud Forest, Floral Clock, Red Moon Gate, Floating Baby Planet sculpture per reference_floating_baby_planet.png, SG50 Lattice, Children's Garden, and instanced trees). STRICT RULES: (1) Split into zone modules under src/world/landmarks/ so NO file exceeds 350 lines. (2) Use THREE.InstancedMesh for foliage and shared materials. (3) MANDATORY QA GATE: Spawn a QA & Visual Critic subagent to capture live close-up screenshots of each zone, critique them against screens 03–07 and reference_floating_baby_planet.png, verify 60 FPS and 0 console errors, and run wc -l (< 400 lines per file). Fix all critic findings before stopping for my review.
```

---

### Stage 3: Explorer Avatar & Controls + QA
```text
/goal Build Stage 3 only: Add the 3rd-person Miniature Explorer Avatar (safari helmet, blue backpack) with walk/sprint animations, pathway/bridge collision, and 3rd-person chase camera (WASD/Arrows + Space/Shift sprint). STRICT RULES: (1) Split into src/entities/ExplorerMesh.js, src/entities/PlayerController.js, and src/world/PathCollider.js so NO file exceeds 350 lines. (2) Pre-allocate all math vectors outside the frame loop. (3) MANDATORY QA GATE: Spawn a QA subagent to test walking and sprinting across all zones and bridges in the live browser, verify camera smoothness, check 0 console errors, and run wc -l (< 400 lines per file). Fix any collision or camera issues found before stopping for my review.
```

---

### Stage 4: 42 Treasures, Pickup UI & Full Map (`M`) + QA
```text
/goal Build Stage 4 only: Add the 42 collectibles across all zones, golden Proximity Compass Ring at feet, discovery/stamp popup cards, bottom-left Minimap, [M] Full-Map Tracker (screen_11), and playable Relaxed Mode (Stopwatch). STRICT RULES: (1) Split into src/data/treasuresData.js, src/entities/TreasureManager.js, src/ui/MinimapHUD.js, and src/ui/FullMapOverlay.js so NO file exceeds 350 lines. (2) Batch treasure updates with shared materials. (3) MANDATORY QA GATE: Spawn a QA subagent to test collecting treasures in the live browser, verify counter updates (X/42), test pressing [M] against screen_11, verify 60 FPS & 0 errors, and check wc -l (< 400 lines per file). Fix all QA issues before stopping for my review.
```

---

### Stage 5: 3 AI Bots & 4-Player Timed Race + QA
```text
/goal Build Stage 5 only: Add the waypoint NavGraph and the 3 autonomous AI Bot explorers (Bot Kai Speedster, Bot Mei Radar, Bot Raj Pathfinder) with their visual auras, plus the 4-Player Timed Race mode (03:00 / 05:00) and Live Standings HUD (screen_09). STRICT RULES: (1) Split into src/world/NavGraph.js, src/entities/AIBotController.js, src/entities/BotAuraEffects.js, and src/ui/RaceStandingsHUD.js so NO file exceeds 350 lines. (2) Throttle AI pathfinding so 60 FPS never drops. (3) MANDATORY QA GATE: Spawn a QA subagent to observe a live 4-player Timed Race in the browser, verify all 3 bots actively move and collect items without getting stuck, compare HUD against screen_09, and run wc -l (< 400 lines per file). Fix all QA findings before stopping for my review.
```

---

### Stage 6: Menus, Night Show, Encyclopedia & Audio + QA
```text
/goal Build Stage 6 only: Add Screen 01 (Title), Screen 02 (Expedition Setup), Screen 08 (Garden Rhapsody Night Show), Screen 10 (Encyclopedia & Leaderboard), and Web Audio SFX. STRICT RULES: (1) Split UI screens under src/ui/screens/ and CSS into modular stylesheets so NO JS or CSS file exceeds 350 lines. (2) MANDATORY QA GATE: Spawn a QA & Adversarial Critic subagent to test the full end-to-end game flow (Screen 01 -> Screen 02 -> Day & Night Gameplay -> Screen 11 Map -> Screen 10 Leaderboard), compare against screens 01, 02, 08, 10, verify 0 console errors & 60 FPS, and audit wc -l across all files (< 400 lines). Fix every issue before stopping for my review.
```

---

### Stage 7: Final QA Sign-Off & Netlify `.zip` Package
```text
/goal Build Stage 7: Run a final full-project QA & performance audit with a QA subagent: (1) Confirm wc -l < 400 lines on every JS/CSS file. (2) Confirm 60 FPS and 0 console/network errors across Relaxed Mode and 4P Timed Race. (3) Package only the clean runtime production files (excluding raw reference mockups) into gbb-treasure-hunt-netlify.zip (< 15 MB) and verify the extracted zip runs cleanly.
```

---

### Bonus: Standalone Refactoring & Performance Audit Prompt (Use Anytime)
```text
/goal Run a strict refactoring & performance pass right now without changing gameplay: check wc -l across all JS and CSS files, split any file over 350 lines into smaller focused sub-modules, eliminate any per-frame object allocations, and spawn a QA subagent to verify 0 console errors and 60 FPS in the browser.
```
