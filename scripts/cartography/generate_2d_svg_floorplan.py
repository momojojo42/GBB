#!/usr/bin/env python3
"""
Stage 1B: 2D Vector Floorplan Architect — Gardens by the Bay (Bay South)
Generates:
1. /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/src/data/gbb_spatial_spec.json
2. /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/maps/gbb_floorplan_2d_meters.svg
3. /Users/momo/.gemini/antigravity/brain/b137f042-fda4-4398-bc0e-f21b111da1c0/gbb_floorplan_2d_meters.svg
"""

import html
import json
import math
import os

WORKSPACE = "/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments"
ARTIFACT_DIR = "/Users/momo/.gemini/antigravity/brain/b137f042-fda4-4398-bc0e-f21b111da1c0"
SPEC_OUT = os.path.join(WORKSPACE, "src/data/gbb_spatial_spec.json")
SVG_OUT_PUBLIC = os.path.join(WORKSPACE, "public/maps/gbb_floorplan_2d_meters.svg")
SVG_OUT_ARTIFACT = os.path.join(ARTIFACT_DIR, "gbb_floorplan_2d_meters.svg")

SCALE_XZ = 0.20  # 1 Three.js unit = 5.0 real meters


def m_to_3d(pt):
    return [round(pt[0] * SCALE_XZ, 2), round(pt[1] * SCALE_XZ, 2)]


def build_spatial_spec():
    # 1. Outer Peninsula Vertices (V1 - V7)
    outer_vertices = [
        {"id": "V1", "name": "NW Waterfront Tip (Active Garden)", "x_m": -130.0, "z_m": -330.0, "ref1_pct": [31.8, 15.0], "ref2_pct": [34.5, 8.5]},
        {"id": "V2", "name": "SW Corner (Sheares x Marina Blvd)", "x_m": -395.0, "z_m": 395.0, "ref1_pct": [8.8, 83.2], "ref2_pct": [1.5, 67.5]},
        {"id": "V3", "name": "Southernmost Tip (Blvd x Gardens Dr)", "x_m": -185.0, "z_m": 535.0, "ref1_pct": [27.0, 96.5], "ref2_pct": [21.5, 87.5]},
        {"id": "V4", "name": "Concave S-Curve W (Meadow SE)", "x_m": -25.0, "z_m": 270.0, "ref1_pct": [41.0, 71.0], "ref2_pct": [40.5, 64.5]},
        {"id": "V5", "name": "Main Entrance Concave Apex", "x_m": 215.0, "z_m": 125.0, "ref1_pct": [62.0, 56.8], "ref2_pct": [67.0, 53.5]},
        {"id": "V6", "name": "SE Southern Edge (GBTB MRT)", "x_m": 560.0, "z_m": 320.0, "ref1_pct": [91.8, 75.2], "ref2_pct": [93.5, 73.0]},
        {"id": "V7", "name": "SE Barrage Tip (Marina Barrage)", "x_m": 645.0, "z_m": 235.0, "ref1_pct": [99.0, 67.5], "ref2_pct": [99.2, 63.5]},
    ]
    for v in outer_vertices:
        v["world_xz"] = m_to_3d([v["x_m"], v["z_m"]])

    # 2. Landmass Polygons (in Real-World Meters)
    # 2A. Main Bay South Island (Orchid-Leaf Crescent East/South of Dragonfly Lake & Meadow Moat)
    main_island_poly = [
        [-95.0, -312.0],   # North waterfront tip east of Dragonfly Lake mouth
        [-20.0, -272.0],   # Waterfront north of Silver Garden / Flower Dome W
        [65.0, -225.0],    # Waterfront NE of Flower Dome
        [185.0, -150.0],   # Waterfront NE of Cloud Forest
        [275.0, -90.0],    # Waterfront NE of Canyon
        [375.0, -25.0],    # Waterfront NE of Children's Garden
        [490.0, 65.0],     # Waterfront NE of Kingfisher Wetlands
        [585.0, 145.0],    # Marina Barrage N approach
        [645.0, 235.0],    # V7 SE Barrage Tip
        [560.0, 320.0],    # V6 SE Southern Edge (GBTB MRT / Satay by the Bay S)
        [435.0, 240.0],    # Southern S-curve SE of Kingfisher
        [325.0, 165.0],    # Southern S-curve E of Main Entrance
        [215.0, 125.0],    # V5 Deepest Concave Apex (Main Entrance / Coach Bay)
        [105.0, 155.0],    # Concave curve SW of Main Entrance
        [-25.0, 270.0],    # V4 Concave S-curve W (Meadow SE edge)
        [-95.0, 350.0],    # South of The Meadow (inside Meadow Moat)
        [-165.0, 395.0],   # SW tip of Main Island (inside Meadow Moat)
        [-245.0, 325.0],   # West rim of Meadow Bowl
        [-215.0, 185.0],   # Inner bank of Dragonfly Lake S (Meadow Bridge E)
        [-180.0, 105.0],   # Inner bank near Planet Baby
        [-130.0, 20.0],    # Inner bank W of Heritage / Grove
        [-85.0, -65.0],    # Inner bank at Dragonfly Bridge E
        [-80.0, -155.0],   # Inner bank W of Silver Garden
        [-75.0, -235.0],   # Inner bank NW of Silver Garden
    ]

    # 2B. Outer NW / SW Perimeter Strip (West of Dragonfly Lake & Meadow Moat: Active Garden, IMBA, Floral Fantasy, Bayfront, Carparks)
    outer_west_bank_poly = [
        [-130.0, -330.0],  # V1 NW Waterfront Tip
        [-112.0, -320.0],  # West lip of Dragonfly Lake North Mouth
        [-115.0, -225.0],  # Outer bank E edge along Active Garden
        [-125.0, -135.0],  # Outer bank E edge along IMBA Theatre
        [-145.0, -55.0],   # Outer bank E edge at Dragonfly Bridge W
        [-175.0, 35.0],    # Outer bank E edge at Floral Fantasy / Bayfront
        [-235.0, 145.0],   # Outer bank E edge at Serene Garden / Meadow Bridge W
        [-295.0, 265.0],   # Outer bank E edge along Meadow Carpark Moat
        [-185.0, 485.0],   # Inner corner of SW Moat
        [-40.0, 260.0],    # Moat taper near V4
        [-25.0, 270.0],    # V4
        [-185.0, 535.0],   # V3 Southernmost Tip (Marina Blvd x Marina Gardens Dr)
        [-395.0, 395.0],   # V2 SW Corner (Sheares Ave x Marina Blvd)
        [-290.0, 110.0],   # Sheares Ave mid-south (Bayfront Carpark W)
        [-210.0, -110.0],  # Sheares Ave mid-north (Bayfront MRT / MBS Bridge)
    ]

    # 2C. Islands inside Dragonfly Lake
    dragonfly_island_poly = [
        [-122.0, -125.0],
        [-105.0, -115.0],
        [-110.0, -78.0],
        [-128.0, -82.0],
        [-135.0, -105.0],
    ]
    nibong_island_poly = [
        [-104.0, -210.0],
        [-90.0, -202.0],
        [-92.0, -172.0],
        [-108.0, -176.0],
    ]

    # 3. Water System (Lakes, Moats & Ponds)
    water_bodies = [
        {
            "id": "dragonfly_lake_main",
            "name": "Dragonfly Lake (#16)",
            "type": "channel_polygon",
            "width_range_m": [35.0, 65.0],
            "length_m": 540.0,
            "centerline_m": [
                [-104.0, -316.0],
                [-96.0, -220.0],
                [-102.0, -145.0],
                [-112.0, -65.0],
                [-152.0, 25.0],
                [-205.0, 110.0],
                [-255.0, 195.0],
            ],
            "polygon_m": [
                [-112.0, -320.0],
                [-95.0, -312.0],
                [-75.0, -235.0],
                [-80.0, -155.0],
                [-85.0, -65.0],
                [-130.0, 20.0],
                [-180.0, 105.0],
                [-215.0, 185.0],
                [-245.0, 225.0],
                [-275.0, 215.0],
                [-235.0, 145.0],
                [-175.0, 35.0],
                [-145.0, -55.0],
                [-125.0, -135.0],
                [-115.0, -225.0],
            ],
        },
        {
            "id": "sw_meadow_moat",
            "name": "The Meadow Perimeter Moat",
            "type": "canal_polyline",
            "width_m": 14.0,
            "length_m": 640.0,
            "centerline_m": [
                [-255.0, 195.0],
                [-305.0, 295.0],
                [-355.0, 380.0],
                [-185.0, 500.0],
                [-90.0, 360.0],
                [-35.0, 265.0],
            ],
        },
        {
            "id": "heritage_north_branch",
            "name": "Heritage Gardens North Water Stream",
            "type": "canal_polyline",
            "width_m": 12.0,
            "length_m": 145.0,
            "centerline_m": [
                [-80.0, -165.0],
                [-40.0, -150.0],
                [10.0, -155.0],
                [35.0, -168.0],
            ],
        },
        {
            "id": "central_koi_pond",
            "name": "Koi Pond & Planet Stream",
            "type": "pond_polygon",
            "center_m": [-110.0, 72.0],
            "rx_m": 42.0,
            "rz_m": 20.0,
            "angle_deg": 32.0,
            "polygon_m": [
                [-155.0, 48.0],
                [-115.0, 45.0],
                [-68.0, 75.0],
                [-75.0, 98.0],
                [-125.0, 92.0],
            ],
        },
        {
            "id": "water_lily_pond",
            "name": "Victoria & Water Lily Pond",
            "type": "pond_polygon",
            "center_m": [235.0, 25.0],
            "rx_m": 48.0,
            "rz_m": 24.0,
            "angle_deg": 125.0,
            "polygon_m": [
                [195.0, 5.0],
                [255.0, -2.0],
                [282.0, 28.0],
                [245.0, 52.0],
                [198.0, 36.0],
            ],
        },
        {
            "id": "kingfisher_lake_lotus_pond",
            "name": "Kingfisher Lake & Lotus Pond (#28)",
            "type": "pond_polygon",
            "center_m": [355.0, 62.0],
            "rx_m": 72.0,
            "rz_m": 32.0,
            "angle_deg": 128.0,
            "polygon_m": [
                [295.0, 32.0],
                [355.0, 22.0],
                [420.0, 58.0],
                [410.0, 95.0],
                [345.0, 98.0],
                [298.0, 65.0],
            ],
        },
        {
            "id": "main_entrance_moat",
            "name": "Arrival Square Reflective Canal",
            "type": "canal_polyline",
            "width_m": 10.0,
            "length_m": 160.0,
            "centerline_m": [
                [120.0, 65.0],
                [175.0, 45.0],
                [235.0, 68.0],
            ],
        },
    ]

    # 4. Walkable Bridges (6 Real Bridges Over Water)
    bridges = [
        {
            "id": "waterfront_north_bridge",
            "name": "Waterfront North Bridge",
            "start_m": [-115.0, -308.0],
            "end_m": [-90.0, -296.0],
            "center_m": [-102.5, -302.0],
            "length_m": 27.7,
            "width_m": 8.0,
            "arch_height_3d": 0.45,
        },
        {
            "id": "silver_garden_bridge",
            "name": "Silver Garden Promenade Bridge",
            "start_m": [-116.0, -215.0],
            "end_m": [-76.0, -205.0],
            "center_m": [-96.0, -210.0],
            "length_m": 41.2,
            "width_m": 8.5,
            "arch_height_3d": 0.55,
        },
        {
            "id": "dragonfly_main_bridge",
            "name": "Dragonfly Bridge (#16)",
            "start_m": [-146.0, -72.0],
            "end_m": [-84.0, -56.0],
            "center_m": [-115.0, -64.0],
            "length_m": 64.0,
            "width_m": 10.0,
            "arch_height_3d": 0.95,
        },
        {
            "id": "meadow_dragonfly_bridge",
            "name": "Meadow West Bridge",
            "start_m": [-234.0, 132.0],
            "end_m": [-182.0, 114.0],
            "center_m": [-208.0, 123.0],
            "length_m": 55.0,
            "width_m": 9.0,
            "arch_height_3d": 0.65,
        },
        {
            "id": "koi_pond_central_bridge",
            "name": "Planet & Koi Pond Footbridge",
            "start_m": [-120.0, 52.0],
            "end_m": [-96.0, 88.0],
            "center_m": [-108.0, 70.0],
            "length_m": 43.3,
            "width_m": 7.5,
            "arch_height_3d": 0.35,
        },
        {
            "id": "kingfisher_wetlands_boardwalk",
            "name": "Kingfisher Wetlands Timber Boardwalk",
            "start_m": [315.0, 38.0],
            "end_m": [392.0, 82.0],
            "center_m": [353.5, 60.0],
            "length_m": 88.7,
            "width_m": 7.5,
            "arch_height_3d": 0.30,
        },
    ]
    for br in bridges:
        br["start_3d"] = m_to_3d(br["start_m"])
        br["end_3d"] = m_to_3d(br["end_m"])
        br["center_3d"] = m_to_3d(br["center_m"])
        br["half_width_3d"] = round(br["width_m"] * SCALE_XZ * 0.5, 2)

    # 5. Roads & Carparks
    roads = {
        "marina_gardens_drive": {
            "name": "Marina Gardens Drive (Concave Southern Boundary & Coach Loop)",
            "width_m": 16.0,
            "centerline_m": [
                [-185.0, 520.0],
                [-105.0, 390.0],
                [-25.0, 270.0],
                [75.0, 175.0],
                [165.0, 125.0],
                [215.0, 125.0],
                [315.0, 165.0],
                [435.0, 240.0],
                [555.0, 310.0],
            ],
            "closed_vehicle_loop_m": [
                [-175.0, 505.0],
                [-95.0, 375.0],
                [-20.0, 265.0],
                [85.0, 165.0],
                [165.0, 115.0],
                [215.0, 118.0],
                [320.0, 160.0],
                [440.0, 235.0],
                [540.0, 295.0],
                [455.0, 215.0],
                [330.0, 145.0],
                [215.0, 98.0],
                [155.0, 95.0],
                [75.0, 150.0],
                [-35.0, 250.0],
                [-110.0, 365.0],
            ],
        },
        "sheares_avenue": {
            "name": "Sheares Avenue (NW Straight Edge, 775m)",
            "width_m": 22.0,
            "centerline_m": [[-130.0, -330.0], [-395.0, 395.0]],
        },
        "marina_boulevard": {
            "name": "Marina Boulevard (SW Straight Edge, 250m)",
            "width_m": 20.0,
            "centerline_m": [[-395.0, 395.0], [-185.0, 535.0]],
        },
    }

    carparks = [
        {"id": "cp_bayfront", "name": "Bayfront Plaza Carpark", "x_m": -285.0, "z_m": 135.0, "w_m": 140.0, "l_m": 55.0, "angle_deg": -70.0},
        {"id": "cp_meadow", "name": "The Meadow Carpark", "x_m": -285.0, "z_m": 365.0, "w_m": 180.0, "l_m": 95.0, "angle_deg": 32.0},
        {"id": "cp_main_entrance", "name": "Main Entrance & Coach Bay Carpark", "x_m": 165.0, "z_m": 95.0, "w_m": 165.0, "l_m": 105.0, "angle_deg": -15.0},
        {"id": "cp_satay", "name": "Satay by the Bay Carpark", "x_m": 445.0, "z_m": 165.0, "w_m": 130.0, "l_m": 55.0, "angle_deg": 125.0},
    ]

    # 6. Arterial & Secondary Pathways
    pathways = [
        {
            "id": "waterfront_promenade",
            "name": "Waterfront Promenade (NE Coastline, 930m)",
            "width_m": 15.0,
            "points_m": [
                [-105.0, -305.0],
                [-25.0, -262.0],
                [60.0, -215.0],
                [175.0, -140.0],
                [265.0, -80.0],
                [365.0, -15.0],
                [475.0, 72.0],
                [575.0, 155.0],
                [625.0, 220.0],
            ],
        },
        {
            "id": "central_spine_north_south",
            "name": "Conservatory to Supertree Grove & Meadow Spine",
            "width_m": 12.0,
            "points_m": [
                [95.0, -125.0],
                [45.0, -65.0],
                [0.0, 0.0],
                [-65.0, 105.0],
                [-145.0, 165.0],
                [-175.0, 235.0],
            ],
        },
        {
            "id": "west_east_cross_axis",
            "name": "Bayfront -> Dragonfly Bridge -> Grove -> Golden Garden -> Main Entrance",
            "width_m": 12.0,
            "points_m": [
                [-200.0, 25.0],
                [-155.0, -55.0],
                [-115.0, -64.0],
                [-55.0, -70.0],
                [0.0, 0.0],
                [90.0, -10.0],
                [145.0, -25.0],
                [165.0, 95.0],
            ],
        },
        {
            "id": "outer_west_bank_trail",
            "name": "Outer West Bank Promenade (Active Garden -> IMBA -> Floral Fantasy -> Serene -> Meadow)",
            "width_m": 10.0,
            "points_m": [
                [-115.0, -308.0],
                [-125.0, -265.0],
                [-145.0, -145.0],
                [-200.0, 25.0],
                [-235.0, 75.0],
                [-234.0, 132.0],
                [-175.0, 235.0],
            ],
        },
        {
            "id": "eastern_valley_loop",
            "name": "Cloud Forest -> Sun Pavilion -> Children's Garden -> Wetlands -> Satay -> Barrage",
            "width_m": 11.0,
            "points_m": [
                [95.0, -125.0],
                [160.0, -90.0],
                [215.0, -65.0],
                [295.0, -35.0],
                [355.0, 55.0],
                [445.0, 135.0],
                [565.0, 165.0],
            ],
        },
        {
            "id": "silver_garden_heritage_loop",
            "name": "Silver Garden to Heritage & Flower Dome Loop",
            "width_m": 9.5,
            "points_m": [
                [-90.0, -296.0],
                [-75.0, -245.0],
                [-65.0, -165.0],
                [-55.0, -70.0],
                [35.0, -155.0],
                [95.0, -125.0],
            ],
        },
    ]

    # 7. All 20 Major Landmarks (L01 - L20)
    landmarks = [
        {"id": "L01", "map_num": "#6/#7", "name": "Supertree Grove (12 Trees & OCBC Skyway)", "zone": "Supertree Grove", "x_m": 0.0, "z_m": 0.0, "w_m": 175.0, "l_m": 155.0, "h_m": 50.0, "angle_deg": 140.0, "shape": "ellipse_grove", "color": "#f43f5e"},
        {"id": "L02", "map_num": "#3", "name": "Flower Dome Conservatory", "zone": "Conservatories", "x_m": 35.0, "z_m": -210.0, "w_m": 150.0, "l_m": 80.0, "h_m": 38.0, "angle_deg": 125.0, "shape": "ribbed_dome", "color": "#38bdf8", "glb": "Flower_Dome_Conservatory", "enterable": True, "door_angle_rad": 0.85},
        {"id": "L03", "map_num": "#4", "name": "Cloud Forest Conservatory", "zone": "Conservatories", "x_m": 160.0, "z_m": -135.0, "w_m": 115.0, "l_m": 70.0, "h_m": 58.0, "angle_deg": 155.0, "shape": "tapered_dome", "color": "#0ea5e9", "glb": "Cloud_Forest_Conservatory", "enterable": True, "door_angle_rad": -2.1},
        {"id": "L04", "map_num": "#2/#5", "name": "Conservatory Arrival Plaza, Canopy & Floral Clock", "zone": "Conservatories", "x_m": 95.0, "z_m": -125.0, "w_m": 95.0, "l_m": 75.0, "h_m": 12.0, "angle_deg": 140.0, "shape": "plaza_clock", "color": "#f59e0b", "glb": "Floral_Clock"},
        {"id": "L05", "map_num": "#25", "name": "Silver Garden (3 Supertrees)", "zone": "Heritage & Dragonfly", "x_m": -75.0, "z_m": -245.0, "w_m": 70.0, "l_m": 65.0, "h_m": 35.0, "angle_deg": 120.0, "shape": "supertree_triad", "color": "#94a3b8"},
        {"id": "L06", "map_num": "#1", "name": "Golden Garden (3 Supertrees)", "zone": "Wetlands & Serene", "x_m": 145.0, "z_m": -25.0, "w_m": 75.0, "l_m": 60.0, "h_m": 35.0, "angle_deg": 135.0, "shape": "supertree_triad", "color": "#eab308"},
        {"id": "L07", "map_num": "#15-#18", "name": "Heritage Gardens (Indian, Chinese, Malay, Colonial)", "zone": "Heritage & Dragonfly", "x_m": -55.0, "z_m": -70.0, "w_m": 190.0, "l_m": 65.0, "h_m": 14.0, "angle_deg": 45.0, "shape": "Rect_pavilion", "color": "#fb923c", "glb": "Heritage_Moon_Gate"},
        {"id": "L08", "map_num": "#9-#14", "name": "World of Plants & The Understorey Dome", "zone": "Supertree Grove", "x_m": -65.0, "z_m": 105.0, "w_m": 90.0, "l_m": 70.0, "h_m": 16.0, "angle_deg": 0.0, "shape": "timber_dome", "color": "#22c55e", "glb": "Understorey_Timber_Dome", "enterable": True, "door_angle_rad": -1.57},
        {"id": "L09", "map_num": "#20", "name": "The Meadow Amphitheatre & Stage Canopy", "zone": "The Meadow", "x_m": -175.0, "z_m": 235.0, "w_m": 210.0, "l_m": 165.0, "h_m": 18.0, "angle_deg": 35.0, "shape": "meadow_bowl", "color": "#84cc16", "glb": "Meadow_Stage_Canopy"},
        {"id": "L10", "map_num": "#19", "name": "Planet (Marc Quinn Floating Baby Sculpture)", "zone": "The Meadow", "x_m": -145.0, "z_m": 115.0, "w_m": 24.0, "l_m": 10.0, "h_m": 9.0, "angle_deg": 20.0, "shape": "sculpture_plinth", "color": "#f8fafc", "glb": "Planet_Floating_Baby"},
        {"id": "L11", "map_num": "#21", "name": "Serene Garden & Japanese Tea Pavilion", "zone": "Waterfront & Fantasy", "x_m": -235.0, "z_m": 75.0, "w_m": 95.0, "l_m": 65.0, "h_m": 12.0, "angle_deg": -25.0, "shape": "japanese_pavilion", "color": "#14b8a6", "glb": "Serene_Japanese_Pavilion", "enterable": True, "door_angle_rad": 0.5},
        {"id": "L12", "map_num": "#26", "name": "Floral Fantasy, Bayfront Plaza & SG50 Lattice", "zone": "Waterfront & Fantasy", "x_m": -200.0, "z_m": 25.0, "w_m": 115.0, "l_m": 45.0, "h_m": 15.0, "angle_deg": 30.0, "shape": "terraced_pavilion", "color": "#c084fc", "glb": "SG50_Celebration_Lattice", "enterable": True, "door_angle_rad": 0.2},
        {"id": "L13", "map_num": "#37", "name": "IMBA Theatre & West Lawn Gallery", "zone": "Waterfront & Fantasy", "x_m": -145.0, "z_m": -145.0, "w_m": 95.0, "l_m": 55.0, "h_m": 16.0, "angle_deg": 30.0, "shape": "modern_hall", "color": "#a855f7", "glb": "IMBA_Theatre_Hall"},
        {"id": "L14", "map_num": "#27", "name": "Active Garden & Waterfront Fitness Plaza", "zone": "Waterfront & Fantasy", "x_m": -125.0, "z_m": -265.0, "w_m": 130.0, "l_m": 50.0, "h_m": 10.0, "angle_deg": 30.0, "shape": "active_plaza", "color": "#ec4899"},
        {"id": "L15", "map_num": "#22/#24", "name": "Sun Pavilion & The Canyon Dragon Rocks", "zone": "Conservatories", "x_m": 215.0, "z_m": -65.0, "w_m": 85.0, "l_m": 40.0, "h_m": 14.0, "angle_deg": 130.0, "shape": "glass_pavilion", "color": "#fbbf24", "glb": "Sun_Pavilion_And_Canyon"},
        {"id": "L16", "map_num": "#23", "name": "Far East Organization Children's Garden", "zone": "Wetlands & Serene", "x_m": 295.0, "z_m": -35.0, "w_m": 130.0, "l_m": 75.0, "h_m": 14.0, "angle_deg": 125.0, "shape": "splash_canopy", "color": "#2dd4bf", "glb": "FEO_Children_Splash_Pad"},
        {"id": "L17", "map_num": "#28", "name": "Kingfisher Wetlands & Mangrove Sanctuary", "zone": "Wetlands & Serene", "x_m": 355.0, "z_m": 55.0, "w_m": 160.0, "l_m": 90.0, "h_m": 12.0, "angle_deg": 125.0, "shape": "wetlands_sanctuary", "color": "#0d9488"},
        {"id": "L18", "map_num": "Main Gate", "name": "Main Entrance Arrival Square & Coach Bay", "zone": "Supertree Grove", "x_m": 165.0, "z_m": 95.0, "w_m": 165.0, "l_m": 105.0, "h_m": 14.0, "angle_deg": 45.0, "shape": "arrival_canopy", "color": "#fcd34d", "glb": "Main_Entrance_Arrival_Canopy"},
        {"id": "L19", "map_num": "g", "name": "Satay by the Bay Dining Pavilions", "zone": "Wetlands & Serene", "x_m": 445.0, "z_m": 135.0, "w_m": 150.0, "l_m": 95.0, "h_m": 14.0, "angle_deg": 125.0, "shape": "dining_pavilions", "color": "#f97316", "glb": "Satay_By_The_Bay_Pavilion"},
        {"id": "L20", "map_num": "Barrage", "name": "Marina Barrage & Green Roof Visitor Centre", "zone": "Wetlands & Serene", "x_m": 565.0, "z_m": 165.0, "w_m": 180.0, "l_m": 110.0, "h_m": 22.0, "angle_deg": 125.0, "shape": "spiral_barrage", "color": "#10b981", "glb": "Marina_Barrage_Visitor_Centre"},
    ]
    for lm in landmarks:
        lm["world_xz"] = m_to_3d([lm["x_m"], lm["z_m"]])
        lm["world_wl"] = [round(lm["w_m"] * SCALE_XZ, 2), round(lm["l_m"] * SCALE_XZ, 2)]
        lm["rot_y_rad"] = round(math.radians(-lm["angle_deg"]), 4)

    # 8. All 18 Supertrees in 3 Clusters + OCBC Skyway Loop
    supertrees = [
        # Cluster 1: Supertree Grove (12 Trees: 3 Hero 50m + 9 Medium 30-38m)
        {"id": "ST01", "cluster": "Supertree Grove", "tier": "hero", "x_m": -25.0, "z_m": -16.0, "canopy_r_m": 16.0, "trunk_r_m": 4.5, "h_m": 50.0},
        {"id": "ST02", "cluster": "Supertree Grove", "tier": "hero", "x_m": 28.0, "z_m": -10.0, "canopy_r_m": 15.5, "trunk_r_m": 4.5, "h_m": 50.0},
        {"id": "ST03", "cluster": "Supertree Grove", "tier": "hero", "x_m": 2.0, "z_m": 28.0, "canopy_r_m": 15.0, "trunk_r_m": 4.2, "h_m": 48.0},
        {"id": "ST04", "cluster": "Supertree Grove", "tier": "medium", "x_m": -52.0, "z_m": 12.0, "canopy_r_m": 11.5, "trunk_r_m": 3.0, "h_m": 36.0},
        {"id": "ST05", "cluster": "Supertree Grove", "tier": "medium", "x_m": -38.0, "z_m": 44.0, "canopy_r_m": 11.5, "trunk_r_m": 3.0, "h_m": 35.0},
        {"id": "ST06", "cluster": "Supertree Grove", "tier": "medium", "x_m": 38.0, "z_m": 40.0, "canopy_r_m": 12.0, "trunk_r_m": 3.0, "h_m": 37.0},
        {"id": "ST07", "cluster": "Supertree Grove", "tier": "medium", "x_m": 56.0, "z_m": 14.0, "canopy_r_m": 11.0, "trunk_r_m": 2.8, "h_m": 34.0},
        {"id": "ST08", "cluster": "Supertree Grove", "tier": "medium", "x_m": 40.0, "z_m": -42.0, "canopy_r_m": 11.5, "trunk_r_m": 3.0, "h_m": 36.0},
        {"id": "ST09", "cluster": "Supertree Grove", "tier": "medium", "x_m": 0.0, "z_m": -50.0, "canopy_r_m": 12.0, "trunk_r_m": 3.0, "h_m": 38.0},
        {"id": "ST10", "cluster": "Supertree Grove", "tier": "medium", "x_m": -46.0, "z_m": -38.0, "canopy_r_m": 11.0, "trunk_r_m": 2.8, "h_m": 33.0},
        {"id": "ST11", "cluster": "Supertree Grove", "tier": "medium", "x_m": -15.0, "z_m": 58.0, "canopy_r_m": 11.0, "trunk_r_m": 2.8, "h_m": 32.0},
        {"id": "ST12", "cluster": "Supertree Grove", "tier": "medium", "x_m": 20.0, "z_m": -58.0, "canopy_r_m": 10.5, "trunk_r_m": 2.8, "h_m": 31.0},
        # Cluster 2: Silver Garden (3 Trees on North Waterfront)
        {"id": "ST13", "cluster": "Silver Garden", "tier": "medium", "x_m": -92.0, "z_m": -238.0, "canopy_r_m": 11.0, "trunk_r_m": 2.8, "h_m": 35.0},
        {"id": "ST14", "cluster": "Silver Garden", "tier": "medium", "x_m": -62.0, "z_m": -262.0, "canopy_r_m": 10.5, "trunk_r_m": 2.6, "h_m": 32.0},
        {"id": "ST15", "cluster": "Silver Garden", "tier": "medium", "x_m": -68.0, "z_m": -228.0, "canopy_r_m": 10.5, "trunk_r_m": 2.6, "h_m": 33.0},
        # Cluster 3: Golden Garden (3 Trees at Central Arrival Plaza)
        {"id": "ST16", "cluster": "Golden Garden", "tier": "medium", "x_m": 130.0, "z_m": -32.0, "canopy_r_m": 11.0, "trunk_r_m": 2.8, "h_m": 35.0},
        {"id": "ST17", "cluster": "Golden Garden", "tier": "medium", "x_m": 162.0, "z_m": -36.0, "canopy_r_m": 10.5, "trunk_r_m": 2.6, "h_m": 32.0},
        {"id": "ST18", "cluster": "Golden Garden", "tier": "medium", "x_m": 146.0, "z_m": -8.0, "canopy_r_m": 10.5, "trunk_r_m": 2.6, "h_m": 33.0},
    ]
    for st in supertrees:
        st["world_xz"] = m_to_3d([st["x_m"], st["z_m"]])
        st["trunk_r_3d"] = round(st["trunk_r_m"] * SCALE_XZ, 2)

    ocbc_skyway_m = [
        [-25.0, -16.0],
        [0.0, -50.0],
        [28.0, -10.0],
        [38.0, 40.0],
        [2.0, 28.0],
        [-38.0, 44.0],
    ]

    # 9. All 42 Botanical Treasures (Verified Collision-Free & In Correct Geographic Zones)
    treasures = [
        # Supertree Grove & World of Plants (10 Relics)
        {"id": 1, "name": "Golden Vanda Miss Joaquim", "zone": "Supertree Grove", "x_m": 0.0, "z_m": 6.0},
        {"id": 2, "name": "OCBC Skyway Star Orchid", "zone": "Supertree Grove", "x_m": -12.0, "z_m": -28.0},
        {"id": 11, "name": "Supertree Solar Crown", "zone": "Supertree Grove", "x_m": 14.0, "z_m": -22.0},
        {"id": 12, "name": "Scarlet Bromeliad Flame", "zone": "Supertree Grove", "x_m": -32.0, "z_m": 18.0},
        {"id": 15, "name": "Rhapsody Wind Chime", "zone": "Supertree Grove", "x_m": 22.0, "z_m": 24.0},
        {"id": 16, "name": "Understorey Wood-Wide Node", "zone": "Supertree Grove", "x_m": -65.0, "z_m": 105.0},
        {"id": 17, "name": "Giant Staghorn Spore", "zone": "Supertree Grove", "x_m": -26.0, "z_m": 76.0},
        {"id": 18, "name": "Buttress Root Heart", "zone": "Supertree Grove", "x_m": -92.0, "z_m": 128.0},
        {"id": 24, "name": "Main Entrance Arrival Crest", "zone": "Supertree Grove", "x_m": 165.0, "z_m": 95.0},
        {"id": 25, "name": "Secret Life of Trees Totem", "zone": "Supertree Grove", "x_m": -42.0, "z_m": 135.0},
        # Conservatories & Sun Pavilion (10 Relics)
        {"id": 3, "name": "Millennium Olive Chalice", "zone": "Conservatories", "x_m": 20.0, "z_m": -218.0},
        {"id": 4, "name": "Cloud Forest Waterfall Drop", "zone": "Conservatories", "x_m": 150.0, "z_m": -142.0},
        {"id": 5, "name": "Audemars Piguet Floral Gear", "zone": "Conservatories", "x_m": 95.0, "z_m": -112.0},
        {"id": 19, "name": "Agave Desert Rosette", "zone": "Conservatories", "x_m": 72.0, "z_m": -155.0},
        {"id": 20, "name": "Nepenthes Highland Chalice", "zone": "Conservatories", "x_m": 175.0, "z_m": -125.0},
        {"id": 21, "name": "Crystal Mountain Stalagmite", "zone": "Conservatories", "x_m": 145.0, "z_m": -115.0},
        {"id": 22, "name": "African Baobab Bottle Relic", "zone": "Conservatories", "x_m": 52.0, "z_m": -198.0},
        {"id": 23, "name": "Lost World Mist Orchid Bell", "zone": "Conservatories", "x_m": 182.0, "z_m": -148.0},
        {"id": 26, "name": "Prehistoric Cycad Amber", "zone": "Conservatories", "x_m": 118.0, "z_m": -92.0},
        {"id": 41, "name": "Sun Pavilion Desert Cactus Crown", "zone": "Conservatories", "x_m": 215.0, "z_m": -65.0},
        # Heritage Gardens, Silver Garden & Dragonfly Bridge (8 Relics)
        {"id": 6, "name": "Dragonfly Bridge Crest", "zone": "Heritage & Dragonfly", "x_m": -115.0, "z_m": -64.0},
        {"id": 7, "name": "Colonial Spice Pavilion Prism", "zone": "Heritage & Dragonfly", "x_m": -32.0, "z_m": -95.0},
        {"id": 13, "name": "Silver Garden Waterfront Lantern", "zone": "Heritage & Dragonfly", "x_m": -75.0, "z_m": -245.0},
        {"id": 27, "name": "Chinese Moon Gate Jade", "zone": "Heritage & Dragonfly", "x_m": -55.0, "z_m": -70.0},
        {"id": 28, "name": "Indian Garden Banyan Bell", "zone": "Heritage & Dragonfly", "x_m": -78.0, "z_m": -45.0},
        {"id": 29, "name": "Malay Kampung Golden Gasing", "zone": "Heritage & Dragonfly", "x_m": -42.0, "z_m": -122.0},
        {"id": 30, "name": "Silver Promenade Brass Compass", "zone": "Heritage & Dragonfly", "x_m": -52.0, "z_m": -195.0},
        {"id": 31, "name": "Koi Pond Footbridge Pearl", "zone": "Heritage & Dragonfly", "x_m": -108.0, "z_m": 70.0},
        # The Meadow & Planet Sculpture (5 Relics)
        {"id": 8, "name": "Marc Quinn Planet Gravity Orb", "zone": "The Meadow", "x_m": -145.0, "z_m": 128.0},
        {"id": 32, "name": "Meadow Dragonfly Bridge Totem", "zone": "The Meadow", "x_m": -208.0, "z_m": 123.0},
        {"id": 33, "name": "Meadow Amphitheatre Sun Disc", "zone": "The Meadow", "x_m": -175.0, "z_m": 235.0},
        {"id": 35, "name": "Meadow Stage Canopy Crest", "zone": "The Meadow", "x_m": -135.0, "z_m": 185.0},
        {"id": 36, "name": "Southern Meadow Orchid Crown", "zone": "The Meadow", "x_m": -145.0, "z_m": 315.0},
        # Waterfront West: Active Garden, IMBA, Floral Fantasy & Serene Garden (4 Relics)
        {"id": 9, "name": "SG50 Lattice Jubilee Rose", "zone": "Waterfront & Fantasy", "x_m": -215.0, "z_m": 10.0},
        {"id": 34, "name": "Floral Fantasy Hanging Key", "zone": "Waterfront & Fantasy", "x_m": -190.0, "z_m": 35.0},
        {"id": 38, "name": "Serene Garden Yukimi Lantern", "zone": "Waterfront & Fantasy", "x_m": -235.0, "z_m": 75.0},
        {"id": 42, "name": "IMBA & Active Garden Waterfront Key", "zone": "Waterfront & Fantasy", "x_m": -135.0, "z_m": -205.0},
        # Golden Garden, Children's Garden, Kingfisher Wetlands, Satay & Barrage (5 Relics)
        {"id": 10, "name": "Children's Garden Splash Crown", "zone": "Wetlands & Serene", "x_m": 295.0, "z_m": -35.0},
        {"id": 14, "name": "Golden Garden Gourd", "zone": "Wetlands & Serene", "x_m": 145.0, "z_m": -22.0},
        {"id": 37, "name": "Kingfisher Boardwalk Lotus Crown", "zone": "Wetlands & Serene", "x_m": 353.5, "z_m": 60.0},
        {"id": 39, "name": "Satay by the Bay Heritage Spice Gem", "zone": "Wetlands & Serene", "x_m": 445.0, "z_m": 135.0},
        {"id": 40, "name": "Marina Barrage Green Spiral Pearl", "zone": "Wetlands & Serene", "x_m": 565.0, "z_m": 165.0},
    ]
    treasures.sort(key=lambda t: t["id"])
    for t in treasures:
        t["world_xz"] = m_to_3d([t["x_m"], t["z_m"]])

    spec = {
        "coordinate_system": {
            "name": "GBB_Bay_South_Canonical_Meters_XZ",
            "origin_name": "Supertree Grove Central Plaza",
            "origin_gps": "1°16'54.8\"N, 103°51'50.2\"E",
            "origin_meters": [0.0, 0.0],
            "bounds_meters": {"x_min": -450.0, "x_max": 650.0, "width_m": 1100.0, "z_min": -380.0, "z_max": 570.0, "height_m": 950.0},
            "stage2_3d_scale": {"SCALE_XZ": SCALE_XZ, "SCALE_Y": 0.35, "meters_per_3d_unit": 5.0},
        },
        "outer_vertices": outer_vertices,
        "landmasses": {
            "main_bay_south_island_m": main_island_poly,
            "outer_west_bank_m": outer_west_bank_poly,
            "dragonfly_island_m": dragonfly_island_poly,
            "nibong_island_m": nibong_island_poly,
        },
        "water_bodies": water_bodies,
        "bridges": bridges,
        "roads": roads,
        "carparks": carparks,
        "pathways": pathways,
        "landmarks": landmarks,
        "supertrees": supertrees,
        "ocbc_skyway_m": ocbc_skyway_m,
        "treasures": treasures,
    }

    os.makedirs(os.path.dirname(SPEC_OUT), exist_ok=True)
    with open(SPEC_OUT, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2)
    print(f"Wrote canonical spatial spec: {SPEC_OUT} ({os.path.getsize(SPEC_OUT)} bytes)")
    return spec


def fmt_pts(pts):
    return " ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in pts)


def draw_dim_arrow(x1, z1, x2, z2, label, color="#facc15", offset_nx=0.0, offset_nz=0.0):
    ax1, az1 = x1 + offset_nx, z1 + offset_nz
    ax2, az2 = x2 + offset_nx, z2 + offset_nz
    mx, mz = (ax1 + ax2) * 0.5, (az1 + az2) * 0.5
    dx, dz = ax2 - ax1, az2 - az1
    length = math.hypot(dx, dz)
    if length < 1e-3:
        return ""
    ux, uz = dx / length, dz / length
    px, pz = -uz, ux
    arr = 9.0
    p1 = f"{ax1:.1f},{az1:.1f} {ax1 + ux*arr + px*arr*0.45:.1f},{az1 + uz*arr + pz*arr*0.45:.1f} {ax1 + ux*arr - px*arr*0.45:.1f},{az1 + uz*arr - pz*arr*0.45:.1f}"
    p2 = f"{ax2:.1f},{az2:.1f} {ax2 - ux*arr + px*arr*0.45:.1f},{az2 - uz*arr + pz*arr*0.45:.1f} {ax2 - ux*arr - px*arr*0.45:.1f},{az2 - uz*arr - pz*arr*0.45:.1f}"
    bw = max(84.0, len(label) * 5.8 + 14.0)
    bh = 16.0
    out = [
        f'<line x1="{x1:.1f}" y1="{z1:.1f}" x2="{ax1:.1f}" y2="{az1:.1f}" stroke="{color}" stroke-width="1.0" stroke-dasharray="3,3" opacity="0.75"/>',
        f'<line x1="{x2:.1f}" y1="{z2:.1f}" x2="{ax2:.1f}" y2="{az2:.1f}" stroke="{color}" stroke-width="1.0" stroke-dasharray="3,3" opacity="0.75"/>',
        f'<line x1="{ax1:.1f}" y1="{az1:.1f}" x2="{ax2:.1f}" y2="{az2:.1f}" stroke="{color}" stroke-width="2.0"/>',
        f'<polygon points="{p1}" fill="{color}"/>',
        f'<polygon points="{p2}" fill="{color}"/>',
        f'<rect x="{mx - bw*0.5:.1f}" y="{mz - bh*0.5:.1f}" width="{bw:.1f}" height="{bh:.1f}" rx="3" fill="#0f172a" stroke="{color}" stroke-width="1.2" opacity="0.94"/>',
        f'<text x="{mx:.1f}" y="{mz + 3.8:.1f}" fill="{color}" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="bold" text-anchor="middle">{html.escape(label)}</text>',
    ]
    return "\n".join(out)


def render_svg_floorplan(spec):
    svg = []
    svg.append('<?xml version="1.0" encoding="UTF-8"?>')
    svg.append(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-450 -380 1100 950" width="2200" height="1900">'
    )

    # 1. Layer: Marina Reservoir & Channel Water
    svg.append('  <g id="layer-water-reservoir">')
    svg.append('    <rect x="-450" y="-380" width="1100" height="950" fill="#0c2d3c"/>')
    # Subtle depth contour along NE Marina Channel
    svg.append(
        '    <polygon points="-450,-380 650,-380 650,260 -130,-330 -450,-330" fill="#0f394c" opacity="0.65"/>'
    )
    svg.append(
        '    <text x="350" y="-235" fill="#38bdf8" opacity="0.45" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" letter-spacing="4" transform="rotate(32 350 -235)">MARINA CHANNEL / RESERVOIR</text>'
    )
    svg.append("  </g>")

    # 2. Layer: Peninsula Landmass (Main Island + Outer NW/SW Bank + Lake Islands)
    svg.append('  <g id="layer-peninsula-landmass">')
    main_pts = fmt_pts(spec["landmasses"]["main_bay_south_island_m"])
    west_pts = fmt_pts(spec["landmasses"]["outer_west_bank_m"])
    df_isl = fmt_pts(spec["landmasses"]["dragonfly_island_m"])
    nb_isl = fmt_pts(spec["landmasses"]["nibong_island_m"])

    # Coastal stone seawall rim + turf interior
    svg.append(
        f'    <polygon points="{main_pts}" fill="#1e4628" stroke="#cbd5e1" stroke-width="4.0" stroke-linejoin="round"/>'
    )
    svg.append(
        f'    <polygon points="{main_pts}" fill="#275c34" stroke="#86efac" stroke-width="1.2" opacity="0.92"/>'
    )
    svg.append(
        f'    <polygon points="{west_pts}" fill="#214d2c" stroke="#cbd5e1" stroke-width="3.2" stroke-linejoin="round"/>'
    )
    svg.append(
        f'    <polygon points="{df_isl}" fill="#347443" stroke="#bae6fd" stroke-width="1.5"/>'
    )
    svg.append(
        f'    <polygon points="{nb_isl}" fill="#347443" stroke="#bae6fd" stroke-width="1.5"/>'
    )
    svg.append("  </g>")

    # 3. Layer: Lakes, Moats & Ponds
    svg.append('  <g id="layer-lakes-and-moats">')
    for wb in spec["water_bodies"]:
        if "polygon_m" in wb:
            pts = fmt_pts(wb["polygon_m"])
            svg.append(
                f'    <polygon id="{wb["id"]}" points="{pts}" fill="#0284c7" stroke="#7dd3fc" stroke-width="2.0" opacity="0.92"/>'
            )
        elif "centerline_m" in wb:
            pts = fmt_pts(wb["centerline_m"])
            w = wb.get("width_m", 12.0)
            svg.append(
                f'    <polyline id="{wb["id"]}" points="{pts}" fill="none" stroke="#7dd3fc" stroke-width="{w + 2.5:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>'
            )
            svg.append(
                f'    <polyline points="{pts}" fill="none" stroke="#0284c7" stroke-width="{w:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
            )
    # Re-draw Dragonfly & Nibong islands on top of Dragonfly Lake polygon
    svg.append(
        f'    <polygon points="{df_isl}" fill="#2e6b3e" stroke="#a7f3d0" stroke-width="1.5"/>'
    )
    svg.append(
        '    <text x="-118" y="-98" fill="#d1fae5" font-family="Helvetica, Arial, sans-serif" font-size="6.5" text-anchor="middle">Dragonfly Isl.</text>'
    )
    svg.append(
        f'    <polygon points="{nb_isl}" fill="#2e6b3e" stroke="#a7f3d0" stroke-width="1.5"/>'
    )
    svg.append(
        '    <text x="-98" y="-190" fill="#d1fae5" font-family="Helvetica, Arial, sans-serif" font-size="6.5" text-anchor="middle">Nibong Isl.</text>'
    )
    svg.append("  </g>")

    # 4. Layer: Roads & Carparks
    svg.append('  <g id="layer-roads-and-carparks">')
    for cp in spec["carparks"]:
        cx, cz, w, l, ang = cp["x_m"], cp["z_m"], cp["w_m"], cp["l_m"], cp["angle_deg"]
        svg.append(
            f'    <g transform="translate({cx:.1f},{cz:.1f}) rotate({ang:.1f})">'
            f'<rect x="{-w*0.5:.1f}" y="{-l*0.5:.1f}" width="{w:.1f}" height="{l:.1f}" rx="6" fill="#334155" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.85"/>'
            f'<text x="0" y="3" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="7.5" text-anchor="middle">{html.escape(cp["name"])} ({int(w)}x{int(l)}m)</text>'
            f"</g>"
        )

    for rk, rd in spec["roads"].items():
        pts = fmt_pts(rd["centerline_m"])
        w = rd["width_m"]
        svg.append(
            f'    <polyline id="{rk}" points="{pts}" fill="none" stroke="#1e293b" stroke-width="{w:.1f}" stroke-linecap="round" stroke-linejoin="round"/>'
        )
        svg.append(
            f'    <polyline points="{pts}" fill="none" stroke="#f8fafc" stroke-width="1.2" stroke-dasharray="8,8" opacity="0.65"/>'
        )
    svg.append(
        '    <text x="125" y="160" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="bold" transform="rotate(-18 125 160)">MARINA GARDENS DRIVE (CONCAVE S-CURVE)</text>'
    )
    svg.append(
        '    <text x="-272" y="30" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="bold" transform="rotate(-70 -272 30)">SHEARES AVENUE (775m STRAIGHT NW EDGE)</text>'
    )
    svg.append(
        '    <text x="-305" y="480" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="bold" transform="rotate(34 -305 480)">MARINA BOULEVARD (250m SW EDGE)</text>'
    )
    svg.append("  </g>")

    # 5. Layer: Pathways & 6 Walkable Bridges
    svg.append('  <g id="layer-pathways-and-bridges">')
    for pw in spec["pathways"]:
        pts = fmt_pts(pw["points_m"])
        w = pw["width_m"]
        svg.append(
            f'    <polyline id="{pw["id"]}" points="{pts}" fill="none" stroke="#e2d5b5" stroke-width="{w:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"/>'
        )

    for br in spec["bridges"]:
        x1, z1 = br["start_m"]
        x2, z2 = br["end_m"]
        cx, cz = br["center_m"]
        w = br["width_m"]
        svg.append(
            f'    <line id="{br["id"]}" x1="{x1:.1f}" y1="{z1:.1f}" x2="{x2:.1f}" y2="{z2:.1f}" stroke="#78350f" stroke-width="{w + 3.0:.1f}" stroke-linecap="butt"/>'
        )
        svg.append(
            f'    <line x1="{x1:.1f}" y1="{z1:.1f}" x2="{x2:.1f}" y2="{z2:.1f}" stroke="#f59e0b" stroke-width="{w:.1f}" stroke-linecap="butt"/>'
        )
        svg.append(
            f'    <circle cx="{cx:.1f}" cy="{cz:.1f}" r="3.2" fill="#fef3c7" stroke="#78350f" stroke-width="1.2"/>'
        )
        svg.append(
            f'    <text x="{cx:.1f}" y="{cz - 7.0:.1f}" fill="#fde68a" font-family="Helvetica, Arial, sans-serif" font-size="7.2" font-weight="bold" text-anchor="middle">{html.escape(br["name"])} ({int(br["length_m"])}x{int(w)}m)</text>'
        )
    svg.append("  </g>")

    # 6. Layer: 20 Major Landmarks & 18 Supertrees (+ OCBC Skyway)
    svg.append('  <g id="layer-landmarks-and-supertrees">')
    for lm in spec["landmarks"]:
        cx, cz = lm["x_m"], lm["z_m"]
        w, l = lm["w_m"], lm["l_m"]
        ang = lm["angle_deg"]
        col = lm["color"]
        svg.append(f'    <g id="{lm["id"]}" transform="translate({cx:.1f},{cz:.1f}) rotate({ang:.1f})">')
        if lm["shape"] in ("ellipse_grove", "meadow_bowl", "plaza_clock", "supertree_triad", "wetlands_sanctuary"):
            svg.append(
                f'      <ellipse cx="0" cy="0" rx="{w*0.5:.1f}" ry="{l*0.5:.1f}" fill="{col}" fill-opacity="0.22" stroke="{col}" stroke-width="2.2" stroke-dasharray="6,3"/>'
            )
            if lm["id"] == "L09":  # Meadow concentric bowl tiers + stage canopy
                svg.append(
                    f'      <ellipse cx="0" cy="0" rx="{w*0.36:.1f}" ry="{l*0.36:.1f}" fill="#4d7c0f" fill-opacity="0.35" stroke="#a3e635" stroke-width="1.5"/>'
                )
                svg.append(
                    '      <path d="M -35,-65 Q 0,-85 35,-65 L 25,-45 Q 0,-60 -25,-45 Z" fill="#f8fafc" stroke="#84cc16" stroke-width="2.0"/>'
                )
        elif lm["shape"] in ("ribbed_dome", "tapered_dome"):
            svg.append(
                f'      <ellipse cx="0" cy="0" rx="{w*0.5:.1f}" ry="{l*0.5:.1f}" fill="{col}" fill-opacity="0.45" stroke="#f8fafc" stroke-width="2.6"/>'
            )
            # Structural arch ribs
            for rx_frac in (-0.35, -0.18, 0.0, 0.18, 0.35):
                rx_pos = w * rx_frac
                ry_len = l * 0.48 * math.sqrt(max(0.05, 1.0 - (rx_frac * 1.8) ** 2))
                svg.append(
                    f'      <line x1="{rx_pos:.1f}" y1="{-ry_len:.1f}" x2="{rx_pos:.1f}" y2="{ry_len:.1f}" stroke="#e0f2fe" stroke-width="1.4" opacity="0.8"/>'
                )
        else:
            svg.append(
                f'      <rect x="{-w*0.5:.1f}" y="{-l*0.5:.1f}" width="{w:.1f}" height="{l:.1f}" rx="8" fill="{col}" fill-opacity="0.32" stroke="{col}" stroke-width="2.2"/>'
            )
        svg.append("    </g>")

    # OCBC Skyway Loop
    sky_pts = fmt_pts(spec["ocbc_skyway_m"] + [spec["ocbc_skyway_m"][0]])
    svg.append(
        f'    <polyline id="OCBC_Skyway" points="{sky_pts}" fill="none" stroke="#facc15" stroke-width="4.5" stroke-linejoin="round" opacity="0.9"/>'
    )
    svg.append(
        f'    <polyline points="{sky_pts}" fill="none" stroke="#fef08a" stroke-width="1.8" stroke-dasharray="4,3"/>'
    )

    # All 18 Supertrees
    for st in spec["supertrees"]:
        sx, sz = st["x_m"], st["z_m"]
        cr = st["canopy_r_m"]
        tr = st["trunk_r_m"]
        c_fill = "#ec4899" if st["tier"] == "hero" else ("#94a3b8" if st["cluster"] == "Silver Garden" else ("#eab308" if st["cluster"] == "Golden Garden" else "#d946ef"))
        svg.append(
            f'    <circle id="{st["id"]}" cx="{sx:.1f}" cy="{sz:.1f}" r="{cr:.1f}" fill="{c_fill}" fill-opacity="0.45" stroke="{c_fill}" stroke-width="2.0"/>'
        )
        svg.append(
            f'    <circle cx="{sx:.1f}" cy="{sz:.1f}" r="{tr:.1f}" fill="#f8fafc" stroke="#1e293b" stroke-width="1.2"/>'
        )
    svg.append("  </g>")

    # 7. Layer: All 42 Botanical Treasures
    svg.append('  <g id="layer-42-treasures">')
    zone_colors = {
        "Supertree Grove": "#ff6bcb",
        "Conservatories": "#38bdf8",
        "Heritage & Dragonfly": "#f59e0b",
        "The Meadow": "#a3e635",
        "Waterfront & Fantasy": "#c084fc",
        "Wetlands & Serene": "#2dd4bf",
    }
    for t in spec["treasures"]:
        tx, tz = t["x_m"], t["z_m"]
        tcol = zone_colors.get(t["zone"], "#facc15")
        svg.append(
            f'    <g id="T{t["id"]:02d}" transform="translate({tx:.1f},{tz:.1f})">'
            f'<circle cx="0" cy="0" r="6.2" fill="#0f172a" stroke="{tcol}" stroke-width="2.0"/>'
            f'<text x="0" y="2.8" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="7.2" font-weight="bold" text-anchor="middle">{t["id"]}</text>'
            f"</g>"
        )
    svg.append("  </g>")

    # 8. Layer: X/Y Meter Grid (100m Major / 50m Minor), Landmark Callout Badges, Outer Vertices & Dimension Arrows
    svg.append('  <g id="layer-grid-and-dimensions">')
    # 50m minor grid
    for xm in range(-400, 650, 50):
        if xm % 100 != 0:
            svg.append(
                f'    <line x1="{xm}" y1="-380" x2="{xm}" y2="570" stroke="#38bdf8" stroke-width="0.6" stroke-dasharray="4,6" opacity="0.32"/>'
            )
    for zm in range(-350, 570, 50):
        if zm % 100 != 0:
            svg.append(
                f'    <line x1="-450" y1="{zm}" x2="650" y2="{zm}" stroke="#38bdf8" stroke-width="0.6" stroke-dasharray="4,6" opacity="0.32"/>'
            )

    # 100m major grid + border labels
    for xm in range(-400, 650, 100):
        is_zero = xm == 0
        col = "#facc15" if is_zero else "#00f0ff"
        sw = "2.2" if is_zero else "1.1"
        op = "0.85" if is_zero else "0.52"
        svg.append(
            f'    <line x1="{xm}" y1="-380" x2="{xm}" y2="570" stroke="{col}" stroke-width="{sw}" opacity="{op}"/>'
        )
        lbl = f"X={xm:+d}m" if xm != 0 else "X=0m (AXIS)"
        svg.append(
            f'    <rect x="{xm - 32}" y="-374" width="64" height="16" rx="3" fill="#0f172a" stroke="{col}" stroke-width="1"/>'
            f'    <text x="{xm}" y="-363" fill="{col}" font-family="Courier, monospace" font-size="8.5" font-weight="bold" text-anchor="middle">{lbl}</text>'
            f'    <rect x="{xm - 32}" y="550" width="64" height="16" rx="3" fill="#0f172a" stroke="{col}" stroke-width="1"/>'
            f'    <text x="{xm}" y="561" fill="{col}" font-family="Courier, monospace" font-size="8.5" font-weight="bold" text-anchor="middle">{lbl}</text>'
        )

    for zm in range(-300, 600, 100):
        is_zero = zm == 0
        col = "#facc15" if is_zero else "#00f0ff"
        sw = "2.2" if is_zero else "1.1"
        op = "0.85" if is_zero else "0.52"
        svg.append(
            f'    <line x1="-450" y1="{zm}" x2="650" y2="{zm}" stroke="{col}" stroke-width="{sw}" opacity="{op}"/>'
        )
        lbl = f"Z={zm:+d}m" if zm != 0 else "Z=0m (AXIS)"
        svg.append(
            f'    <rect x="-445" y="{zm - 8}" width="68" height="16" rx="3" fill="#0f172a" stroke="{col}" stroke-width="1"/>'
            f'    <text x="-411" y="{zm + 3}" fill="{col}" font-family="Courier, monospace" font-size="8.5" font-weight="bold" text-anchor="middle">{lbl}</text>'
            f'    <rect x="577" y="{zm - 8}" width="68" height="16" rx="3" fill="#0f172a" stroke="{col}" stroke-width="1"/>'
            f'    <text x="611" y="{zm + 3}" fill="{col}" font-family="Courier, monospace" font-size="8.5" font-weight="bold" text-anchor="middle">{lbl}</text>'
        )

    # Outer Coastline Vertex Pins (V1 - V7)
    vertex_badge_offsets = {
        "V1": (0, -24),
        "V2": (24, -28),
        "V3": (0, -34),
        "V4": (0, -24),
        "V5": (0, -24),
        "V6": (-28, 16),
        "V7": (-62, 16),
    }
    for v in spec["outer_vertices"]:
        vx, vz = v["x_m"], v["z_m"]
        vox, voz = vertex_badge_offsets.get(v["id"], (0, -24))
        bx, bz = vx + vox, vz + voz
        lbl = f'{v["id"]}: ({int(vx):+d}m, {int(vz):+d}m)'
        svg.append(
            f'    <line x1="{vx:.1f}" y1="{vz:.1f}" x2="{bx:.1f}" y2="{bz + 7.5:.1f}" stroke="#34d399" stroke-width="1.2"/>'
            f'    <circle cx="{vx:.1f}" cy="{vz:.1f}" r="5.5" fill="#10b981" stroke="#ffffff" stroke-width="2.0"/>'
            f'    <rect x="{bx - 58:.1f}" y="{bz:.1f}" width="116" height="15" rx="3" fill="#064e3b" stroke="#34d399" stroke-width="1.2"/>'
            f'    <text x="{bx:.1f}" y="{bz + 10.5:.1f}" fill="#ecfdf5" font-family="Courier, monospace" font-size="8.2" font-weight="bold" text-anchor="middle">{lbl}</text>'
        )

    # Landmark Callout Badges (L01 - L20) with non-overlapping offsets
    badge_offsets = {
        "L01": (0, -48),
        "L02": (0, -52),
        "L03": (62, -52),
        "L04": (-45, -42),
        "L05": (-75, -35),
        "L06": (32, -36),
        "L07": (-20, -42),
        "L08": (45, 22),
        "L09": (0, 52),
        "L10": (-55, 22),
        "L11": (-65, -22),
        "L12": (-65, -32),
        "L13": (-55, -32),
        "L14": (-85, 18),
        "L15": (60, -42),
        "L16": (72, -26),
        "L17": (58, -22),
        "L18": (0, 42),
        "L19": (-10, 46),
        "L20": (-45, -42),
    }
    for lm in spec["landmarks"]:
        cx, cz = lm["x_m"], lm["z_m"]
        ox, oz = badge_offsets.get(lm["id"], (0, -35))
        bx, bz = cx + ox, cz + oz
        line1 = f'{lm["id"]} {lm["name"][:26]}'
        line2 = f'({int(cx):+d}m, {int(cz):+d}m) [{int(lm["w_m"])}x{int(lm["l_m"])}m]'
        bw = max(len(line1), len(line2)) * 5.2 + 14.0
        svg.append(
            f'    <line x1="{cx:.1f}" y1="{cz:.1f}" x2="{bx:.1f}" y2="{bz:.1f}" stroke="{lm["color"]}" stroke-width="1.5"/>'
            f'    <circle cx="{cx:.1f}" cy="{cz:.1f}" r="3.8" fill="{lm["color"]}" stroke="#0f172a" stroke-width="1.2"/>'
            f'    <rect x="{bx - bw*0.5:.1f}" y="{bz - 13:.1f}" width="{bw:.1f}" height="24" rx="4" fill="#0f172a" stroke="{lm["color"]}" stroke-width="1.4" opacity="0.93"/>'
            f'    <text x="{bx:.1f}" y="{bz - 3:.1f}" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="8.0" font-weight="bold" text-anchor="middle">{html.escape(line1)}</text>'
            f'    <text x="{bx:.1f}" y="{bz + 7.5:.1f}" fill="#fde047" font-family="Courier, monospace" font-size="7.8" font-weight="bold" text-anchor="middle">{line2}</text>'
        )

    # Architectural Meter Dimension Arrows
    svg.append(draw_dim_arrow(-130, -330, -395, 395, "775m NW Straight Edge (Sheares Ave)", "#38bdf8", -38, -14))
    svg.append(draw_dim_arrow(-395, 395, -185, 535, "250m SW Edge (Marina Blvd)", "#38bdf8", -18, 26))
    svg.append(draw_dim_arrow(-130, -330, 645, 235, "960m NE Waterfront Promenade", "#2dd4bf", 68, -88))
    svg.append(draw_dim_arrow(-395, 525, 645, 525, "1,040m Total Peninsula E-W Span (-395m to +645m)", "#facc15", 0, 0))

    # Title Block in Top-Right Open Water of Marina Channel
    svg.append(
        '    <rect x="105" y="-348" width="465" height="68" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2.0" opacity="0.95"/>'
        '    <text x="120" y="-326" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold">GARDENS BY THE BAY (BAY SOUTH) — 2D MASTER FLOORPLAN</text>'
        '    <text x="120" y="-308" fill="#38bdf8" font-family="Courier, monospace" font-size="10" font-weight="bold">Scale: 1 SVG Unit = 1.0 Meter | Origin (0m,0m) = Supertree Grove</text>'
        '    <text x="120" y="-292" fill="#fde047" font-family="Courier, monospace" font-size="9.5">Stage 2 3D Transform: worldX = X_m * 0.20, worldZ = Z_m * 0.20 (1:5 Uniform)</text>'
    )

    # Graphical Scale Bar (0m - 100m - 200m) & Legend at Bottom-Right
    svg.append(
        '    <g transform="translate(215, 375)">'
        '      <rect x="0" y="0" width="355" height="120" rx="6" fill="#0f172a" stroke="#facc15" stroke-width="1.8" opacity="0.95"/>'
        '      <text x="16" y="22" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="bold">METER SCALE BAR &amp; COMPASS (TRUE NORTH UP 0°)</text>'
        '      <rect x="16" y="34" width="100" height="10" fill="#38bdf8" stroke="#f8fafc" stroke-width="1"/>'
        '      <rect x="116" y="34" width="100" height="10" fill="#0f172a" stroke="#f8fafc" stroke-width="1"/>'
        '      <text x="16" y="56" fill="#fde047" font-family="Courier, monospace" font-size="9" font-weight="bold">0m</text>'
        '      <text x="104" y="56" fill="#fde047" font-family="Courier, monospace" font-size="9" font-weight="bold">100m</text>'
        '      <text x="202" y="56" fill="#fde047" font-family="Courier, monospace" font-size="9" font-weight="bold">200m</text>'
        '      <text x="16" y="78" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="9.5">• 20 Landmarks (L01-L20) with W x L Meter Footprints</text>'
        '      <text x="16" y="94" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="9.5">• 18 Supertrees (3 Clusters) + 6 Bridges + 42 Relics</text>'
        '      <text x="16" y="110" fill="#34d399" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="bold">• Concave Marina Gardens Drive &amp; Full Dragonfly/Moat System</text>'
        '      <g transform="translate(305, 58)">'
        '        <circle cx="0" cy="0" r="24" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>'
        '        <polygon points="0,-20 -6,6 0,2 6,6" fill="#facc15"/>'
        '        <text x="0" y="-26" fill="#facc15" font-family="Helvetica, Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">N (0°)</text>'
        '      </g>'
        '    </g>'
    )

    svg.append("  </g>")
    svg.append("</svg>")

    svg_content = "\n".join(svg)
    for out_path in (SVG_OUT_PUBLIC, SVG_OUT_ARTIFACT):
        try:
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, "w", encoding="utf-8") as f:
                f.write(svg_content)
            print(f"Wrote 2D SVG floorplan: {out_path} ({os.path.getsize(out_path)} bytes)")
        except PermissionError:
            print(f"Skipped sandbox-restricted path: {out_path}")


if __name__ == "__main__":
    spec_data = build_spatial_spec()
    render_svg_floorplan(spec_data)
