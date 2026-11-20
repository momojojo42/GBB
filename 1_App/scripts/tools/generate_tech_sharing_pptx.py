#!/usr/bin/env python3
"""
Generates a widescreen 16:9 PowerPoint deck (GBB_3D_AI_Technical_Sharing.pptx)
matching the 10-slide technical sharing outline with embedded core game screens.
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
OUT_PPTX = os.path.join(ROOT, "docs", "GBB_3D_AI_Technical_Sharing.pptx")

# Palette matching presentation.html
BG_DEEP = RGBColor(4, 36, 37)        # #042425
BG_CARD = RGBColor(10, 70, 72)       # #0A4648
BG_CARD_DARK = RGBColor(2, 24, 25)   # #021819
GOLD = RGBColor(245, 184, 46)        # #F5B82E
GOLD_BRIGHT = RGBColor(255, 209, 92) # #FFD15C
EMERALD = RGBColor(16, 185, 129)     # #10B981
CYAN = RGBColor(165, 243, 252)       # #A5F3FC
TEXT_WHITE = RGBColor(248, 250, 252) # #F8FAFC
TEXT_LIGHT = RGBColor(226, 241, 242) # #E2F1F2
TEXT_MUTED = RGBColor(167, 196, 197) # #A7C4C5
TEXT_DARK = RGBColor(16, 42, 43)     # #102A2B
BORDER_SUBTLE = RGBColor(38, 92, 94)


def set_slide_bg(slide, color=BG_DEEP):
    bg = slide.background
    fill = bg.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_header(slide, eyebrow, title, pill_text, slide_num):
    # Eyebrow
    tb_eye = slide.shapes.add_textbox(Inches(0.55), Inches(0.32), Inches(9.5), Inches(0.3))
    tf_eye = tb_eye.text_frame
    tf_eye.word_wrap = True
    tf_eye.margin_left = tf_eye.margin_top = tf_eye.margin_right = tf_eye.margin_bottom = 0
    p_eye = tf_eye.paragraphs[0]
    p_eye.text = eyebrow.upper()
    p_eye.font.size = Pt(11)
    p_eye.font.bold = True
    p_eye.font.color.rgb = GOLD_BRIGHT
    p_eye.font.name = "Arial"

    # Title
    tb_title = slide.shapes.add_textbox(Inches(0.55), Inches(0.58), Inches(10.2), Inches(0.55))
    tf_title = tb_title.text_frame
    tf_title.word_wrap = True
    tf_title.margin_left = tf_title.margin_top = tf_title.margin_right = tf_title.margin_bottom = 0
    p_title = tf_title.paragraphs[0]
    p_title.text = title
    p_title.font.size = Pt(24)
    p_title.font.bold = True
    p_title.font.color.rgb = TEXT_WHITE
    p_title.font.name = "Arial"

    # Right Pill Badge
    pill = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(10.85), Inches(0.42), Inches(1.95), Inches(0.42)
    )
    pill.fill.solid()
    pill.fill.fore_color.rgb = BG_CARD
    pill.line.color.rgb = EMERALD
    pill.line.width = Pt(1.2)
    tf_p = pill.text_frame
    tf_p.vertical_anchor = MSO_ANCHOR.MIDDLE
    p_p = tf_p.paragraphs[0]
    p_p.text = pill_text
    p_p.alignment = PP_ALIGN.CENTER
    p_p.font.size = Pt(11)
    p_p.font.bold = True
    p_p.font.color.rgb = GOLD_BRIGHT
    p_p.font.name = "Arial"

    # Divider line
    line = slide.shapes.add_shape(
        MSO_SHAPE.RECTANGLE, Inches(0.55), Inches(1.18), Inches(12.23), Inches(0.015)
    )
    line.fill.solid()
    line.fill.fore_color.rgb = BORDER_SUBTLE
    line.line.fill.background()

    # Footer
    tb_foot = slide.shapes.add_textbox(Inches(0.55), Inches(7.05), Inches(12.23), Inches(0.3))
    tf_foot = tb_foot.text_frame
    tf_foot.margin_left = tf_foot.margin_top = tf_foot.margin_right = tf_foot.margin_bottom = 0
    p_foot = tf_foot.paragraphs[0]
    p_foot.text = f"Gardens by the Bay 3D Treasure Hunt  •  Live Demo: https://gorgeous-jelly-d58182.netlify.app/  •  Slide {slide_num} / 10"
    p_foot.font.size = Pt(10)
    p_foot.font.color.rgb = TEXT_MUTED
    p_foot.font.name = "Arial"


def add_card(slide, left, top, width, height, title, bullets, border_color=BORDER_SUBTLE, fill_color=BG_CARD, title_color=GOLD_BRIGHT, font_size=13.5):
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    card.adjustments[0] = 0.04
    card.fill.solid()
    card.fill.fore_color.rgb = fill_color
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    tb = slide.shapes.add_textbox(
        Inches(left + 0.18), Inches(top + 0.14), Inches(width - 0.36), Inches(height - 0.28)
    )
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p0 = tf.paragraphs[0]
    p0.text = title
    p0.font.size = Pt(15.5)
    p0.font.bold = True
    p0.font.color.rgb = title_color
    p0.font.name = "Arial"
    p0.space_after = Pt(8)

    for b in bullets:
        p = tf.add_paragraph()
        p.text = f"✦  {b}"
        p.font.size = Pt(font_size)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Arial"
        p.space_after = Pt(6)

    return card


def add_code_card(slide, left, top, width, height, label, code_text, border_color=GOLD):
    card = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    card.adjustments[0] = 0.04
    card.fill.solid()
    card.fill.fore_color.rgb = BG_CARD_DARK
    card.line.color.rgb = border_color
    card.line.width = Pt(1.5)

    tb = slide.shapes.add_textbox(
        Inches(left + 0.18), Inches(top + 0.12), Inches(width - 0.36), Inches(height - 0.24)
    )
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p0 = tf.paragraphs[0]
    p0.text = label
    p0.font.size = Pt(13.5)
    p0.font.bold = True
    p0.font.color.rgb = GOLD_BRIGHT
    p0.font.name = "Arial"
    p0.space_after = Pt(6)

    p1 = tf.add_paragraph()
    p1.text = code_text
    p1.font.size = Pt(11.5)
    p1.font.color.rgb = CYAN
    p1.font.name = "Courier New"
    return card


def add_image_card(slide, left, top, width, height, rel_img_path, caption):
    full_path = os.path.join(ROOT, rel_img_path)
    box = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    box.adjustments[0] = 0.03
    box.fill.solid()
    box.fill.fore_color.rgb = BG_CARD_DARK
    box.line.color.rgb = GOLD
    box.line.width = Pt(1.2)

    cap_h = 0.36
    avail_w = width - 0.12
    avail_h = height - cap_h - 0.12

    if os.path.exists(full_path):
        with Image.open(full_path) as im:
            img_w, img_h = im.size
        img_ratio = img_w / float(img_h)
        box_ratio = avail_w / float(avail_h)

        if img_ratio > box_ratio:
            draw_w = avail_w
            draw_h = avail_w / img_ratio
        else:
            draw_h = avail_h
            draw_w = avail_h * img_ratio

        img_left = left + 0.06 + (avail_w - draw_w) / 2.0
        img_top = top + 0.06 + (avail_h - draw_h) / 2.0
        slide.shapes.add_picture(
            full_path, Inches(img_left), Inches(img_top), Inches(draw_w), Inches(draw_h)
        )

    # Caption bar at bottom
    tb = slide.shapes.add_textbox(
        Inches(left + 0.1), Inches(top + height - cap_h), Inches(width - 0.2), Inches(cap_h)
    )
    tf = tb.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = caption
    p.alignment = PP_ALIGN.CENTER
    p.font.size = Pt(11)
    p.font.bold = True
    p.font.color.rgb = GOLD_BRIGHT
    p.font.name = "Arial"


def add_kpi(slide, left, top, width, height, val, label):
    box = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height)
    )
    box.adjustments[0] = 0.08
    box.fill.solid()
    box.fill.fore_color.rgb = BG_CARD_DARK
    box.line.color.rgb = GOLD
    box.line.width = Pt(1.2)

    tb = slide.shapes.add_textbox(Inches(left + 0.08), Inches(top + 0.08), Inches(width - 0.16), Inches(height - 0.16))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p0 = tf.paragraphs[0]
    p0.text = val
    p0.alignment = PP_ALIGN.CENTER
    p0.font.size = Pt(20)
    p0.font.bold = True
    p0.font.color.rgb = GOLD_BRIGHT
    p0.font.name = "Arial"

    p1 = tf.add_paragraph()
    p1.text = label
    p1.alignment = PP_ALIGN.CENTER
    p1.font.size = Pt(10.5)
    p1.font.color.rgb = TEXT_MUTED
    p1.font.name = "Arial"


def add_notes(slide, text):
    notes_slide = slide.notes_slide
    tf = notes_slide.notes_text_frame
    tf.text = text


def build_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # =========================================================================
    # SLIDE 1: DEMO TO WOW
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s1)
    add_header(s1, "1 • Share the Demo to WOW", "Gardens by the Bay — 3D Treasure Hunt", "🌐 Live WebGL Demo", 1)

    kpis = [
        ("69 .GLB Models", "27 Landmarks + 42 SG Relics"),
        ("5 Park Zones", "Real Boomerang Visitor Map"),
        ("3-Min Sky Show", "Morning → Night Rhapsody"),
        ("4-Player Party", "20 Hz Sync + Spicy AI Bots"),
    ]
    for i, (v, l) in enumerate(kpis):
        add_kpi(s1, 0.55 + i * 3.1, 1.35, 2.93, 0.92, v, l)

    add_card(
        s1, 0.55, 2.45, 3.9, 4.4,
        "🎬 60s Live Demo to WOW",
        [
            "Live URL: gorgeous-jelly-d58182.netlify.app",
            "18 Supertrees & Glass Domes at 60 FPS",
            "Spicy Bots: '🤚 CHOPE!', bump-steal & Durians",
            "360° Toybox: Spin 42 SG keepsakes + audio",
            "Hit [🎉 End Finale] for 3D Fireworks!",
        ],
        border_color=GOLD
    )
    add_image_card(s1, 4.65, 2.45, 4.0, 4.4, "assets/progress/m5_full_screen01_title_v2.png", "🖥️ Core Screen 01: Live 3D Title View")
    add_image_card(s1, 8.80, 2.45, 3.98, 4.4, "assets/progress/m8_emotional_01_sky_rhapsody_before_after.png", "🌅 Core Gameplay: Day → Night Rhapsody")
    add_notes(s1, "Open https://gorgeous-jelly-d58182.netlify.app/ first! Pick up 1 relic and click '🎉 End Finale' to hook the room in 60 seconds.")

    # =========================================================================
    # SLIDE 2: DEV WOW #1 — HEADLESS BLENDER
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s2)
    add_header(s2, "2 • Dev WOW Point #1", "Headless Blender — 69 3D Models, Zero Manual Sculpting", "🤖 Python CLI", 2)

    add_card(
        s2, 0.55, 1.4, 4.0, 3.3,
        "🛠️ How Headless Blender Works",
        [
            "Zero Blender GUI: Never dragged a vertex by hand",
            "AI wrote 9 Python (bpy) scripts in scripts/blender/",
            "Auto-exported 69 web-ready .glb 3D assets",
            "Auto-rendered studio contact sheets for instant QA",
        ],
        border_color=GOLD
    )
    add_code_card(
        s2, 0.55, 4.85, 4.0, 2.0,
        "💻 Automated 3D Asset Factory",
        "blender --background \\\n  --python scripts/blender/build_buildings.py\n\nblender --background \\\n  --python scripts/blender/build_characters.py"
    )
    add_image_card(s2, 4.75, 1.4, 3.95, 5.45, "assets/renders/key_assets_buildings_v1.png", "🏛️ Auto-Rendered Landmarks (build_buildings.py)")
    add_image_card(s2, 8.85, 1.4, 3.93, 5.45, "assets/progress/blender_chibi_explorers_v2.png", "🏃‍♂️ 4 Articulated Chibi Explorers (build_characters.py)")
    add_notes(s2, "When character proportions looked too big next to cars in v1, we didn't re-sculpt—we changed 2 numbers in Python and re-ran headless Blender in 5 seconds.")

    # =========================================================================
    # SLIDE 3: DEV WOW #2 — SUBAGENTS
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s3)
    add_header(s3, "2 • Dev WOW Point #2", "Subagents — Split Builders, Emotional Engineer & QA Critic", "🧠 Multi-Agent", 3)

    add_card(
        s3, 0.55, 1.38, 3.9, 2.25,
        "🏗️ 1. Builder Subagents",
        [
            "Split by domain (Terrain, Shaders, UI, Netcode)",
            "Strict < 350 lines/file modularity cap",
            "Prevents monolithic context hallucinations",
        ]
    )
    add_card(
        s3, 4.70, 1.38, 3.9, 2.25,
        "🎭 2. Emotional Engineer",
        [
            "🌅 WOW: 3-Min Morning-to-Night Sky",
            "💡 Amazed: ≤12-word Aha! cards + 3D Toybox",
            "🔥 Fun & 🍌 Funny: Pickpocket + Durian traps",
        ],
        border_color=GOLD
    )
    add_card(
        s3, 8.85, 1.38, 3.93, 2.25,
        "🕵️‍♂️ 3. QA Critic Subagent",
        [
            "Opens live browser automatically",
            "Verifies 0 console errors & 60 FPS",
            "Diffs live screenshot vs target blueprint",
        ],
        border_color=EMERALD
    )

    add_image_card(s3, 0.55, 3.80, 6.0, 3.05, "assets/progress/m8_emotional_06_four_emotional_pillars_summary.png", "🎭 8-Agent Roundtable: 4 Emotional Pillars Architecture")
    add_image_card(s3, 6.78, 3.80, 6.0, 3.05, "assets/progress/m8_emotional_04_spicy_bots_pickpocket_before_after.png", "🔥 Before vs After: Sleepy Bots → Spicy '🤚 CHOPE!' Rivalry")
    add_notes(s3, "Never let one agent write code and grade its own homework. Spawn a separate QA Critic subagent to inspect live browser screenshots.")

    # =========================================================================
    # SLIDE 4: THE TECHNICAL JOURNEY (V1 -> V5)
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s4)
    add_header(s4, "3 • The Technical Journey", "Version Updates: How v1 Evolved into v5", "📦 v1 → v5", 4)

    versions = [
        ("v1.0 • Prototype", ["Oval island base", "First 69 .glb assets", "4 Chibi racers & UI"], BORDER_SUBTLE),
        ("v2.1 • Fair AI", ["Bots slowed by 50%", "28m tall sky beams", "360° Fireworks Finale"], BORDER_SUBTLE),
        ("v2.2 • Real Map", ["Official Boomerang Map", "Cleared road collisions", "Calibrated landmarks"], BORDER_SUBTLE),
        ("v3.0 • Emotion UX", ["Day → Night Sky Show", "12-word Aha! Toybox", "Spicy Bots & Durians"], GOLD),
        ("v4–v5 • Party & QA", ["Slow-Mo Admin Studio", "Team Markdown Ledger", "20Hz 4P Party Sync"], GOLD),
    ]
    for i, (vtitle, vbullets, vborder) in enumerate(versions):
        add_card(s4, 0.55 + i * 2.48, 1.35, 2.32, 2.15, vtitle, vbullets, border_color=vborder, font_size=11.5)

    add_image_card(s4, 0.55, 3.68, 3.92, 3.18, "assets/progress/same_scale_side_by_side_2d_diff.png", "🗺️ v1 Oval → v2.2 Real Boomerang Map")
    add_image_card(s4, 4.71, 3.68, 3.92, 3.18, "assets/progress/m8_emotional_03_calm_toast_before_after.png", "😌 v2 Noisy Banner → v3.0 Calm Toast")
    add_image_card(s4, 8.86, 3.68, 3.92, 3.18, "assets/progress/mp_v32_02_party_lobby.png", "🌐 v5 Real-Time 4-Player Party Lobby")
    add_notes(s4, "We kept all 5 playable zip builds in Showcase Progress/. Notice how each version solved a real product gap.")

    # =========================================================================
    # SLIDE 5: LEARNING #1 — THE TECHNICAL BLOG
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s5)
    add_header(s5, "4 • Key Learning #1", "Start From the Tech Blog — 'Every Prompt Took 1 Hour to Understand'", "📖 1 Hr / Prompt", 5)

    add_card(
        s5, 0.55, 1.4, 5.8, 3.0,
        "📖 Read Deeply Before Prompting",
        [
            "Blog: aistudio.google.com/learn/building-3d-games-and-worlds-with-gemini-4-argon",
            "Don't copy-paste blindly — spent 1 full hour understanding each prompt",
            "Key rules learned: 3D scene graph, InstancedMesh batching, 0 allocations in requestAnimationFrame, and < 350 lines/file",
        ],
        border_color=GOLD
    )
    add_code_card(
        s5, 0.55, 4.58, 5.8, 2.25,
        "🧩 Anatomy of a 1-Hour Engineered Prompt",
        "/goal Build Stage 1 only: Bay South 3D peninsula + water + paths.\nSTRICT RULES:\n1. Max 350 lines per file under src/world/\n2. Zero allocations inside requestAnimationFrame\n3. Spawn QA Critic subagent to verify 60 FPS & 0 errors"
    )
    add_image_card(s5, 6.55, 1.4, 6.23, 2.62, "assets/progress/m3_landmarks_angle02_supertree_grove_v2.png", "🌴 Core Screen: Supertree Grove & OCBC Skyway (60 FPS WebGL)")
    add_image_card(s5, 6.55, 4.20, 6.23, 2.63, "assets/progress/m3_landmarks_angle03_conservatories_v2.png", "🏛️ Core Screen: Flower Dome & Cloud Forest Glass Gridshells")
    add_notes(s5, "Spending 1 full hour to understand what each stage prompt was doing prevented spaghetti rewrites later.")

    # =========================================================================
    # SLIDE 6: LEARNING #2 — DEV/PM TO AI DIRECTOR
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s6)
    add_header(s6, "4 • Key Learning #2", "Job Shift: Tell AI What to Do, QA It, and Guard the Product 'Why'", "🧭 AI Director", 6)

    add_card(
        s6, 0.55, 1.38, 5.95, 2.15,
        "🔄 From Dev / PM → AI Director & QA",
        [
            "Used to be: Figuring out HOW to write the code",
            "Now is: (1) Tell AI WHAT to do + (2) QA WHETHER & WHERE it is done",
        ]
    )
    add_card(
        s6, 6.80, 1.38, 5.98, 2.15,
        "⚠️ Why Product 'Why' Is Harder Now",
        [
            "When AI builds features in minutes, it's easy to ship fast noise",
            "Understanding Product WHY & Product VALUE (WHAT) is now our #1 job",
        ],
        border_color=GOLD
    )

    add_image_card(s6, 0.55, 3.72, 5.95, 3.12, "assets/progress/m5_full_lookdev_studio_overview_v2.png", "🛠️ Core Screen: Admin LookDev & Slow-Mo QA Studio (admin.html)")
    add_image_card(s6, 6.80, 3.72, 5.98, 3.12, "assets/progress/m8_emotional_02_relic_toybox_before_after.png", "💡 Product Value: Cut 65-Word Essay → 12-Word Aha! + 3D Toybox")
    add_notes(s6, "Because AI makes building so fast, it actually becomes harder to pause and ask: what is the true product why and value for the user?")

    # =========================================================================
    # SLIDE 7: LEARNING #3 — IMAGE MILESTONES
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s7)
    add_header(s7, "4 • Key Learning #3", "Set Milestones via Images — Pinterest + ChatGPT / Imagen 2", "🎨 Image First", 7)

    img_kpis = [
        ("📌 1. Pinterest", "Best for moodboards, diorama lighting & UI feel"),
        ("🎨 2. ChatGPT / Imagen 2", "Still better for generating 2D game screen mockups"),
        ("🔍 3. Visual QA Diff", "Subagents compare live 3D build vs target image"),
    ]
    for i, (v, l) in enumerate(img_kpis):
        add_kpi(s7, 0.55 + i * 4.15, 1.35, 3.92, 0.92, v, l)

    add_image_card(s7, 0.55, 2.45, 3.92, 4.4, "assets/screens/screen_02_mode_and_map_select.png", "🎨 1. Target Mockup (screen_02 Concept)")
    add_image_card(s7, 4.71, 2.45, 3.92, 4.4, "assets/progress/m5_full_screen02_setup_v2.png", "🎮 2. Live 3D Build (Screen 02 Explorer Setup)")
    add_image_card(s7, 8.86, 2.45, 3.92, 4.4, "assets/progress/m5_full_screen11_tactical_map_v2.png", "🗺️ 3. Core Screen 11: Live Tactical Radar [M]")
    add_notes(s7, "Setting milestones with images (Screens 01-11) gave both us and the AI an exact visual target to match.")

    # =========================================================================
    # SLIDE 8: LEARNING #4 — TWO POWERFUL PROMPTS
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s8)
    add_header(s8, "4 • Key Learning #4", "Two Power Prompts That Level Up Quality", "⚡ Steal These", 8)

    add_code_card(
        s8, 0.55, 1.38, 5.95, 2.2,
        "🔥 Prompt 1: Subagent Roundtable to 9/10",
        "\"Spin into different subagents (Game Designer, 3D Artist,\nPerf Engineer, QA Critic) and have a roundtable discussion\nto make sure it is 9/10 or above before stopping.\"",
        border_color=GOLD
    )
    add_code_card(
        s8, 6.80, 1.38, 5.98, 2.2,
        "🎭 Prompt 2: 'This Is the Emotion I Wanna Achieve'",
        "\"This is the Emotion I wanna achieve:\n1. WOW! (Living sky & Night Rhapsody)\n2. AMAZED (12-word Aha! relics)\n3. FUN (Spicy bot rivalry) & 4. FUNNY (Durian slip traps)\"",
        border_color=EMERALD
    )

    add_image_card(s8, 0.55, 3.75, 5.95, 3.1, "assets/progress/m8_emotional_05_arcade_hazards_durian_shuttle.png", "🍌 'Emotion Prompt' Output: Spiky Durian Traps & Tram Knockback")
    add_image_card(s8, 6.80, 3.75, 5.98, 3.1, "assets/progress/m4_characters_angle08_4p_race_action_v2.png", "🔥 '9/10 Roundtable' Output: 4-Player Action Chase & Sky Beams")
    add_notes(s8, "These two prompts—spinning up a subagent roundtable for >=9/10 and prompting the target Emotion—transformed the game.")

    # =========================================================================
    # SLIDE 9: LEARNINGS #5 & #6 — COST & RECORDS
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s9)
    add_header(s9, "4 • Key Learnings #5 & #6", "Review Cost at Every Prompt & Keep Visual Records", "💰 Cost + 📸 Log", 9)

    add_card(
        s9, 0.55, 1.38, 5.95, 2.15,
        "💰 Learning 5: Review Cost at Every Prompt",
        [
            "🧠 Gemini 4: Complex 3D math, Blender scripts, subagent roundtables",
            "⚡ Gemini 2.5: Simple fixes, CSS tweaks & quick copy updates",
        ]
    )
    add_card(
        s9, 6.80, 1.38, 5.98, 2.15,
        "📸 Learning 6: Always Keep Records & Screenshots",
        [
            "Saved before/after screenshots (progress.html) + v1–v5.zip builds",
            "Makes spotting regressions & doing adjustments 5× easier",
        ],
        border_color=GOLD
    )

    add_image_card(s9, 0.55, 3.72, 5.95, 3.12, "assets/progress/chibi_explorer_car_ratio_and_eyes_v2.png", "📸 Visual Record Fixed Car-to-Character Scale & Eyes (v1 → v2)")
    add_image_card(s9, 6.80, 3.72, 5.98, 3.12, "assets/progress/m5_full_screen10_encyclopedia_v2.png", "🏺 Core Screen 10: 42 Singapore Relics Passport & 3D Inspector")
    add_notes(s9, "Right-size your model per prompt (Gemini 4 vs 2.5) and always keep screenshots so adjustments are easy.")

    # =========================================================================
    # SLIDE 10: SUMMARY & Q&A
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_bg(s10)
    add_header(s10, "Wrap-Up & Q&A", "6 Key Takeaways — Ready for Questions!", "🙌 Thank You", 10)

    takeaways = [
        ("1️⃣ 1 Hr / Prompt", ["Start from the Gemini 4 3D blog", "Understand architecture before running"], BORDER_SUBTLE),
        ("2️⃣ Guard the 'Why'", ["Tell AI what + QA where", "Product Why & Value is our real job"], BORDER_SUBTLE),
        ("3️⃣ Image Milestones", ["Pinterest moodboards first", "ChatGPT / Imagen 2 for 2D mockups"], BORDER_SUBTLE),
        ("4️⃣ Power Prompts", ["Subagent roundtable to >= 9/10", "'This is the Emotion I wanna achieve'"], GOLD),
        ("5️⃣ Watch Prompt Cost", ["Gemini 4 for complex 3D/system work", "Gemini 2.5 for simple fixes"], BORDER_SUBTLE),
        ("6️⃣ Keep Screenshots", ["Save visual records (progress.html)", "Makes targeted adjustments effortless"], EMERALD),
    ]
    for i, (ttitle, tbullets, tborder) in enumerate(takeaways):
        col = i % 3
        row = i // 3
        add_card(
            s10,
            0.55 + col * 4.15,
            1.38 + row * 2.05,
            3.92,
            1.88,
            ttitle,
            tbullets,
            border_color=tborder,
            font_size=12.5
        )

    add_card(
        s10, 0.55, 5.55, 12.23, 1.32,
        "🌐 Try the Live Demo & Build Gallery Now",
        [
            "Live Game: https://gorgeous-jelly-d58182.netlify.app/   |   Visual Build Log: /progress.html   |   LookDev Studio: /admin.html",
        ],
        border_color=GOLD
    )
    add_notes(s10, "Invite the team to open the Netlify link or ask questions!")

    prs.save(OUT_PPTX)
    print(f"Saved PowerPoint deck to: {OUT_PPTX}")


if __name__ == "__main__":
    build_deck()
