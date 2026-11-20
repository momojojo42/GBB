# Technical Sharing: Building a 3D Game with AI

---

## Slide 1: Live Demo to WOW 🌿
**Play Live:** https://gorgeous-jelly-d58182.netlify.app/

* **69 3D Models** · **5 Park Zones** · **42 SG Relics** · **4-Player Party**
* **60s Demo:** Race Spicy Bots → Trigger 360° Relic Toybox → Hit `🎉 End Finale` Fireworks

![Screen 01 Live Game](../assets/progress/m5_full_screen01_title_v2.png)
![Morning to Night Rhapsody](../assets/progress/m8_emotional_01_sky_rhapsody_before_after.png)

---

## Slide 2: Dev WOW #1 — Headless Blender 🤖
**Zero Manual 3D Modeling**

* **AI wrote Python (`bpy`)** → Ran `blender --background --python ...`
* Auto-built **69 `.glb` models** + auto-rendered studio contact sheets

![Blender Buildings Sheet](../assets/renders/key_assets_buildings_v1.png)
![Blender Chibi Explorers](../assets/progress/blender_chibi_explorers_v2.png)

---

## Slide 3: Dev WOW #2 — Subagents 🧠
**Don't Let 1 Agent Grade Its Own Homework**

* **Builder Agents:** Modular code (`< 350 lines/file`)
* **Emotional Engineer:** Designed for *WOW, Amazed, Fun, Funny*
* **QA Critic Agent:** Live browser check (`0 errors`, `60 FPS`, visual diff)

![Four Emotional Pillars](../assets/progress/m8_emotional_06_four_emotional_pillars_summary.png)
![Spicy Bots Pickpocket](../assets/progress/m8_emotional_04_spicy_bots_pickpocket_before_after.png)

---

## Slide 4: The Technical Journey (v1 → v5) 🚀

* **v1.0:** Oval island + first 3D `.glb` pass
* **v2.1:** Fair AI (50% slower) + 28m sky beams + Fireworks
* **v2.2:** Real Boomerang Map + cleared road collisions
* **v3.0:** Living Sky + 12-word Aha cards + Spicy Bots + Durian traps
* **v4–v5:** Admin Slow-Mo Studio + 4-Player Party Sync (`GBB-XXX`)

![Map Diff v1 vs v2.2](../assets/progress/same_scale_side_by_side_2d_diff.png)
![Calm Toast Before/After](../assets/progress/m8_emotional_03_calm_toast_before_after.png)
![4P Party Lobby v5](../assets/progress/mp_v32_02_party_lobby.png)

---

## Slide 5: Learning 1 — Start from the Tech Blog 📖
**"Every Prompt Took Me 1 Hour to Understand"**

* **Source:** [Building 3D Games & Worlds with Gemini 4 Argon](https://aistudio.google.com/learn/building-3d-games-and-worlds-with-gemini-4-argon)
* Don't copy-paste blindly — spend **1 hour understanding each prompt** (scene graph, instancing, physics)
* Slow down on prompt design so AI moves fast without rewrites

![Supertree Grove 3D Scene](../assets/progress/m3_landmarks_angle02_supertree_grove_v2.png)

---

## Slide 6: Learning 2 — Dev/PM → AI Director 🧭
**Execution is Instant. Product "Why" is Harder.**

* **Old Job:** Figuring out *how* to code it
* **New Job:** Telling AI **what to do** + **QA-ing whether & where it's done**
* **The Trap:** Easy to ship fast noise — harder to protect **Product Why & Value**

![Admin LookDev Studio](../assets/progress/m5_full_lookdev_studio_overview_v2.png)
![3D Relic Toybox](../assets/progress/m8_emotional_02_relic_toybox_before_after.png)

---

## Slide 7: Learning 3 — Set Milestones via Images 🎨
**A Picture Beats 1,000 Words of Spec**

* **Pinterest:** Best for moodboards & diorama feel
* **ChatGPT / Imagen 2:** Still best for 2D UI mockups (`Screens 01–11`)
* Give AI a target image to diff against

![Blueprint Screen 01](../assets/screens/screen_01_title_peninsula_overview.png)
![Live Build Screen 01](../assets/progress/m5_full_screen01_title_v2.png)
![Blueprint Screen 11](../assets/screens/screen_11_full_map_treasure_and_player_tracker.png)
![Live Build Screen 11](../assets/progress/m5_full_screen11_tactical_map_v2.png)

---

## Slide 8: Learning 4 — Two Power Prompts ⚡

* **Prompt 1 (9/10 Roundtable):**
  > *"Spin into diff subagents and have a roundtable discussion to make sure it is 9/10 or above."*
* **Prompt 2 (Target Emotion):**
  > *"This is the Emotion I wanna achieve: WOW, Amazed, Fun, and Funny."*

![Durian & Shuttle Hazards](../assets/progress/m8_emotional_05_arcade_hazards_durian_shuttle.png)

---

## Slide 9: Learnings 5 & 6 — Cost & Records 💰📸

* **Learning 5 (Watch Cost per Prompt):**
  * **Gemini 4:** Complex 3D & multi-agent work
  * **Gemini 2.5:** Simple fixes & UI tweaks
* **Learning 6 (Keep Records & Screenshots):**
  * Save before/after screenshots (`progress.html` + `v1–v5.zip`) for fast adjustments

![42 Relics Encyclopedia](../assets/progress/m5_full_screen10_encyclopedia_v2.png)
![v1 vs v2 Character Scale](../assets/progress/chibi_explorer_car_ratio_and_eyes_v2.png)

---

## Slide 10: Recap — 6 Takeaways 🙌

1. **1 Hr / Prompt:** Understand the tech blog deeply first
2. **Own the "Why":** Tell AI *what* + *QA where*; guard product value
3. **Image Milestones:** Pinterest + ChatGPT/Imagen 2 mockups first
4. **Power Prompts:** *9/10 Subagent Roundtable* + *Target Emotion*
5. **Control Cost:** Gemini 4 for complex; Gemini 2.5 for simple fixes
6. **Keep Screenshots:** Visual records make adjustments effortless
