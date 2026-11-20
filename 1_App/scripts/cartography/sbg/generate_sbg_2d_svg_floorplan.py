#!/usr/bin/env python3
"""
Phase 2: Official NParks 1:1 Singapore Botanic Gardens (SBG) Cartography Architect
Generates:
1. /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/src/maps/sbg/sbg_spatial_spec.json
2. /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/maps/sbg_floorplan_2d_meters.svg

Coordinate System:
- World Meters: [-380m to +380m X, -380m to +380m Z], where -Z is North and +Z is South.
- 2D SVG Metric Floorplan: viewBox="0 0 2400 2400" where svg_x = 1200 + x * 3.0, svg_y = 1200 + z * 3.0.
"""

import html
import json
import math
import os

WORKSPACE = "/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments"
SPEC_OUT_DATA = os.path.join(WORKSPACE, "src/data/maps/sbg/sbg_spatial_spec.json")
SPEC_OUT_MAPS = SPEC_OUT_DATA
SVG_OUT_PUBLIC = os.path.join(WORKSPACE, "public/maps/sbg_floorplan_2d_meters.svg")

SCALE_SVG = 3.0
OFFSET_SVG = 1200.0
SCALE_3D = 0.20  # 1 Three.js unit = 5.0 real meters


def sx(x_m):
    return round(OFFSET_SVG + x_m * SCALE_SVG, 2)


def sz(z_m):
    return round(OFFSET_SVG + z_m * SCALE_SVG, 2)


def m_to_3d(pt):
    return [round(pt[0] * SCALE_3D, 2), round(pt[1] * SCALE_3D, 2)]


def make_organic_lake_polygon(cx, cz, rx, rz, num_pts=24, wobble=0.08, seed=1):
    pts = []
    for i in range(num_pts):
        ang = (2.0 * math.pi * i) / num_pts
        mod = 1.0 + wobble * math.sin(ang * 3.0 + seed) + (wobble * 0.5) * math.cos(ang * 5.0 - seed)
        px = round(cx + math.cos(ang) * rx * mod, 1)
        pz = round(cz + math.sin(ang) * rz * mod, 1)
        pts.append([px, pz])
    return pts


def point_in_polygon(x, z, poly):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, zi = poly[i][0], poly[i][1]
        xj, zj = poly[j][0], poly[j][1]
        if ((zi > z) != (zj > z)) and (x < (xj - xi) * (z - zi) / ((zj - zi) or 1e-9) + xi):
            inside = not inside
        j = i
    return inside


def build_sbg_spatial_spec():
    # 1. Elongated North-South 4-Core UNESCO Park Boundary Polygon (in World Meters)
    # Encloses:
    # - Core 4: Bukit Timah Core (North, z: -325 to -120, x: -145 to +175)
    # - Core 2: Central Core (Mid-Spine, z: -115 to +125, x: -185 to +195)
    # - Core 3: Tyersall-Gallop Extension (South-West Wing, x: -310 to -145, z: +95 to +295)
    # - Core 1: Tanglin Core (South, z: +135 to +325, x: -140 to +180)
    park_boundary_polygon = [
        [-45.0, -335.0],   # North-West tip near Botanic Gardens MRT
        [35.0, -332.0],    # North crest at Bukit Timah Gate
        [135.0, -305.0],   # NE corner enclosing Jacob Ballas Children's Garden
        [182.0, -235.0],   # East edge of Bukit Timah Core
        [168.0, -135.0],   # East edge along Foliage Valley & Evolution Garden
        [198.0, -25.0],    # Cluny Park Road East bulge
        [192.0, 55.0],     # Nassim Gate East boundary
        [178.0, 135.0],    # Primary Rainforest SE edge
        [185.0, 215.0],    # Tanglin Core East boundary (Sundial & Botany Centre)
        [145.0, 295.0],    # SE corner near Holttum Hall & Tanglin Gate
        [55.0, 328.0],     # South apex at Tanglin Silver Gate (Holland/Napier Rd)
        [-45.0, 318.0],    # SW Tanglin Core edge
        [-135.0, 285.0],   # Transition from Tanglin Core to Gallop Extension
        [-215.0, 302.0],   # South tip of Tyersall-Gallop (Inverturret & COMO Grove)
        [-298.0, 285.0],   # SW corner at Atbara House & Gallop Gate
        [-315.0, 205.0],   # West edge of SPH Walk of Giants
        [-285.0, 115.0],   # NW corner of Learning Forest & Keppel Wetlands
        [-192.0, 88.0],    # Tyersall Ave neck into National Orchid Garden
        [-188.0, 15.0],    # West ridge of National Orchid Garden (Burkill Hall)
        [-185.0, -52.0],   # NW edge of Sembcorp Cool House
        [-142.0, -125.0],  # Transition into Bukit Timah Core West
        [-148.0, -235.0],  # West bank of Eco-Lake Sanctuary
        [-105.0, -310.0],  # NW approach to Bukit Timah Gate
    ]

    # 2. The 4 Official NParks Cores
    cores = [
        {
            "id": "tanglin_core",
            "number": 1,
            "name": "Core 1 — Tanglin Core (1859 Historic Heritage Core)",
            "shortName": "Tanglin Core",
            "badge": "CORE 1 • TANGLIN HERITAGE (SOUTH)",
            "color": "#10b981",
            "bounds_m": {"x_min": -140.0, "x_max": 180.0, "z_min": 135.0, "z_max": 325.0},
            "label_pos_m": [32.0, 282.0],
            "description": "Historic 1859 pleasure grounds featuring Tanglin Silver Gate, Swan Lake, the 1930 Octagonal Bandstand, the $5-Note Tembusu Tree, and Holttum Hall.",
        },
        {
            "id": "central_core",
            "number": 2,
            "name": "Core 2 — Central Core (National Orchid Garden & Palm Valley)",
            "shortName": "Central Core",
            "badge": "CORE 2 • CENTRAL & ORCHID PLATEAU",
            "color": "#f59e0b",
            "bounds_m": {"x_min": -185.0, "x_max": 195.0, "z_min": -115.0, "z_max": 125.0},
            "label_pos_m": [20.0, -92.0],
            "description": "Mid-spine heart with Nassim Gate Visitor Centre, Symphony Lake & Shaw Stage, National Orchid Garden (Burkill Hall, Cool House, Mist House), Ginger Waterfall, and 6-ha Primary Rainforest.",
        },
        {
            "id": "tyersall_gallop_core",
            "number": 3,
            "name": "Core 3 — Tyersall–Gallop Extension (Learning Forest & Colonial Ridges)",
            "shortName": "Tyersall–Gallop",
            "badge": "CORE 3 • TYERSALL–GALLOP WING (SW)",
            "color": "#38bdf8",
            "bounds_m": {"x_min": -310.0, "x_max": -145.0, "z_min": 95.0, "z_max": 295.0},
            "label_pos_m": [-232.0, 115.0],
            "description": "South-West forest wing with Keppel Discovery Wetlands, SPH Walk of Giants Canopy Boardwalk, 1898 Atbara House, 1906 Inverturret Gallery, and COMO Adventure Grove.",
        },
        {
            "id": "bukit_timah_core",
            "number": 4,
            "name": "Core 4 — Bukit Timah Core (Eco-Lake & Jacob Ballas Children's Garden)",
            "shortName": "Bukit Timah Core",
            "badge": "CORE 4 • BUKIT TIMAH CORE (NORTH)",
            "color": "#a855f7",
            "bounds_m": {"x_min": -145.0, "x_max": 175.0, "z_min": -325.0, "z_max": -120.0},
            "label_pos_m": [15.0, -295.0],
            "description": "Northern academic and family core anchored by Eco-Lake Black-Necked Swans Sanctuary, Foliage & Evolution Garden, Jacob Ballas Children's Garden, and Bukit Timah MRT Gate.",
        },
    ]

    # 3. 3 Iconic Lakes + Keppel Discovery Wetlands + Halia Ginger Waterfall Pool
    swan_lake_poly = [
        [-52.0, 192.0], [-36.0, 177.0], [-10.0, 175.0], [18.0, 179.0],
        [34.0, 196.0], [35.0, 218.0], [26.0, 242.0], [4.0, 254.0],
        [-24.0, 255.0], [-46.0, 243.0], [-55.0, 222.0], [-54.0, 205.0],
    ]
    symphony_lake_poly = [
        [-22.0, -52.0], [-4.0, -72.0], [24.0, -75.0], [54.0, -66.0],
        [70.0, -42.0], [72.0, -12.0], [64.0, 18.0], [42.0, 34.0],
        [12.0, 35.0], [-14.0, 24.0], [-25.0, -4.0], [-24.0, -30.0],
    ]
    eco_lake_poly = [
        [-42.0, -242.0], [-20.0, -262.0], [10.0, -265.0], [38.0, -256.0],
        [54.0, -234.0], [55.0, -206.0], [44.0, -178.0], [18.0, -165.0],
        [-14.0, -166.0], [-38.0, -180.0], [-45.0, -208.0], [-44.0, -228.0],
    ]
    keppel_wetlands_poly = make_organic_lake_polygon(-215.0, 155.0, 26.0, 21.0, 16, 0.06, 4)
    ginger_pool_poly = make_organic_lake_polygon(-72.0, 98.0, 12.0, 10.0, 14, 0.05, 7)

    lakes = [
        {
            "id": "swan_lake",
            "name": "Swan Lake (1866 Heritage Lake)",
            "coreId": "tanglin_core",
            "isPrimaryLake": True,
            "lakeNumber": 1,
            "cx": -10.0,
            "cz": 215.0,
            "rx": 45.0,
            "rz": 40.0,
            "bounds_m": {"x_min": -55.0, "x_max": 35.0, "z_min": 175.0, "z_max": 255.0},
            "waterHex": "#0ea5e9",
            "deepHex": "#0284c7",
            "islands": [
                {"id": "swan_nest_island", "name": "Swan Nest Island", "cx": -14.0, "cz": 196.0, "rx": 9.5, "rz": 7.0}
            ],
            "polygon_m": swan_lake_poly,
        },
        {
            "id": "symphony_lake",
            "name": "Symphony Lake (Palm Valley Lotus Lake)",
            "coreId": "central_core",
            "isPrimaryLake": True,
            "lakeNumber": 2,
            "cx": 23.5,
            "cz": -20.0,
            "rx": 48.5,
            "rz": 55.0,
            "bounds_m": {"x_min": -25.0, "x_max": 72.0, "z_min": -75.0, "z_max": 35.0},
            "waterHex": "#06b6d4",
            "deepHex": "#0891b2",
            "islands": [
                {"id": "symphony_stage_islet", "name": "Shaw Symphony Stage Islet", "cx": 18.0, "cz": -22.0, "rx": 14.0, "rz": 11.5}
            ],
            "polygon_m": symphony_lake_poly,
        },
        {
            "id": "eco_lake",
            "name": "Eco-Lake (Black-Necked Swans Sanctuary)",
            "coreId": "bukit_timah_core",
            "isPrimaryLake": True,
            "lakeNumber": 3,
            "cx": 5.0,
            "cz": -215.0,
            "rx": 50.0,
            "rz": 50.0,
            "bounds_m": {"x_min": -45.0, "x_max": 55.0, "z_min": -265.0, "z_max": -165.0},
            "waterHex": "#14b8a6",
            "deepHex": "#0d9488",
            "islands": [
                {"id": "black_swan_islet", "name": "Black-Necked Swans Nesting Islet", "cx": 6.0, "cz": -218.0, "rx": 11.0, "rz": 8.5}
            ],
            "polygon_m": eco_lake_poly,
        },
        {
            "id": "keppel_wetlands",
            "name": "Keppel Discovery Wetlands (Pulai Marsh)",
            "coreId": "tyersall_gallop_core",
            "isPrimaryLake": False,
            "lakeNumber": 4,
            "cx": -215.0,
            "cz": 155.0,
            "rx": 26.0,
            "rz": 21.0,
            "bounds_m": {"x_min": -241.0, "x_max": -189.0, "z_min": 134.0, "z_max": 176.0},
            "waterHex": "#10b981",
            "deepHex": "#059669",
            "islands": [],
            "polygon_m": keppel_wetlands_poly,
        },
        {
            "id": "ginger_pool",
            "name": "Ginger Waterfall & Halia Pool",
            "coreId": "central_core",
            "isPrimaryLake": False,
            "lakeNumber": 5,
            "cx": -72.0,
            "cz": 98.0,
            "rx": 12.0,
            "rz": 10.0,
            "bounds_m": {"x_min": -84.0, "x_max": -60.0, "z_min": 88.0, "z_max": 108.0},
            "waterHex": "#2dd4bf",
            "deepHex": "#0f766e",
            "islands": [],
            "polygon_m": ginger_pool_poly,
        },
    ]

    # 4. All 8 Major Architectural Buildings (matching `sbg_buildings_landmarks.glb`)
    buildings = [
        {
            "id": "bandstand_1930",
            "glbNode": "SBG_Bandstand_Gazebo_1930",
            "name": "Iconic 1930 Octagonal Bandstand",
            "coreId": "tanglin_core",
            "x": 25.0,
            "z": 145.0,
            "rx": 11.0,
            "rz": 11.0,
            "rotY": 0.0,
            "enterable": False,
            "openAirPavilion": True,
            "color": "#f8fafc",
            "accentColor": "#10b981",
        },
        {
            "id": "botany_centre_holttum_hall",
            "glbNode": "SBG_Botany_Centre_Holttum_Hall",
            "name": "Botany Centre & Holttum Hall (1921 Heritage Museum)",
            "coreId": "tanglin_core",
            "x": 88.0,
            "z": 255.0,
            "rx": 16.0,
            "rz": 13.0,
            "rotY": -0.25,
            "enterable": True,
            "openAirPavilion": False,
            "doorWorldAngle": -1.57,
            "doorHalfAngle": 0.44,
            "portalHeight": 3.2,
            "portalColor": "#fbbf24",
            "color": "#d97706",
            "accentColor": "#fef3c7",
        },
        {
            "id": "burkill_hall_1868",
            "glbNode": "SBG_Burkill_Hall_1868",
            "name": "Burkill Hall (1868 Anglo-Malayan Plantation Manor)",
            "coreId": "central_core",
            "x": -125.0,
            "z": 18.0,
            "rx": 15.0,
            "rz": 12.0,
            "rotY": 0.20,
            "enterable": True,
            "openAirPavilion": False,
            "doorWorldAngle": 1.57,
            "doorHalfAngle": 0.42,
            "portalHeight": 3.4,
            "portalColor": "#f59e0b",
            "color": "#f8fafc",
            "accentColor": "#c2410c",
        },
        {
            "id": "sembcorp_cool_house",
            "glbNode": "SBG_Sembcorp_Cool_House",
            "name": "Sembcorp Cool House (Glass Montane Orchidetum)",
            "coreId": "central_core",
            "x": -158.0,
            "z": -28.0,
            "rx": 18.0,
            "rz": 14.0,
            "rotY": -0.30,
            "enterable": True,
            "openAirPavilion": False,
            "doorWorldAngle": 1.57,
            "doorHalfAngle": 0.38,
            "portalHeight": 3.6,
            "portalColor": "#38bdf8",
            "color": "#38bdf8",
            "accentColor": "#e0f2fe",
        },
        {
            "id": "tan_hoon_siang_mist_house",
            "glbNode": "SBG_Tan_Hoon_Siang_Mist_House",
            "name": "Tan Hoon Siang Mist House & Golden Shower Arches",
            "coreId": "central_core",
            "x": -88.0,
            "z": 52.0,
            "rx": 13.0,
            "rz": 11.0,
            "rotY": 0.35,
            "enterable": True,
            "openAirPavilion": True,
            "doorWorldAngle": 0.0,
            "doorHalfAngle": 0.45,
            "portalHeight": 3.0,
            "portalColor": "#facc15",
            "color": "#fbbf24",
            "accentColor": "#fef08a",
        },
        {
            "id": "shaw_symphony_stage",
            "glbNode": "SBG_Shaw_Symphony_Stage",
            "name": "Shaw Foundation Symphony Stage",
            "coreId": "central_core",
            "x": 18.0,
            "z": -22.0,
            "rx": 13.0,
            "rz": 10.5,
            "rotY": 0.0,
            "enterable": False,
            "openAirPavilion": True,
            "color": "#f8fafc",
            "accentColor": "#ec4899",
        },
        {
            "id": "atbara_house_1898",
            "glbNode": "SBG_Atbara_House_1898",
            "name": "Atbara House (1898 Black-and-White Forest Discovery Centre)",
            "coreId": "tyersall_gallop_core",
            "x": -275.0,
            "z": 245.0,
            "rx": 14.0,
            "rz": 12.0,
            "rotY": 0.15,
            "enterable": True,
            "openAirPavilion": False,
            "doorWorldAngle": 1.57,
            "doorHalfAngle": 0.44,
            "portalHeight": 3.0,
            "portalColor": "#10b981",
            "color": "#f8fafc",
            "accentColor": "#1e293b",
        },
        {
            "id": "inverturret_gallery_1906",
            "glbNode": "SBG_Inverturret_Gallery_1906",
            "name": "Inverturret (1906 Botanical Art Gallery Bungalow)",
            "coreId": "tyersall_gallop_core",
            "x": -242.0,
            "z": 278.0,
            "rx": 13.0,
            "rz": 11.0,
            "rotY": -0.18,
            "enterable": True,
            "openAirPavilion": False,
            "doorWorldAngle": 0.0,
            "doorHalfAngle": 0.44,
            "portalHeight": 3.0,
            "portalColor": "#38bdf8",
            "color": "#f8fafc",
            "accentColor": "#c2410c",
        },
    ]

    # 6 Enterable Building Portals
    enterable_portals = [b for b in buildings if b["enterable"]]

    # 5. All 10 Gates, Bridges & Sculptures
    gates_bridges_sculptures = [
        {
            "id": "tanglin_silver_gate",
            "glbNode": "SBG_Tanglin_Silver_Gate",
            "name": "Tanglin Gate (Silver Foliage Gate)",
            "category": "gate",
            "coreId": "tanglin_core",
            "x": 45.0,
            "z": 305.0,
            "r": 7.5,
        },
        {
            "id": "swan_lake_gazebo_bridge",
            "glbNode": "SBG_Swan_Lake_Gazebo_Bridge",
            "name": "Swan Lake Victorian Gazebo Bridge",
            "category": "bridge",
            "coreId": "tanglin_core",
            "x": -10.0,
            "z": 212.0,
            "r": 8.0,
        },
        {
            "id": "flight_of_swans_sculpture",
            "glbNode": "SBG_Flight_Of_Swans_Sculpture",
            "name": "Flight of Swans Bronze Sculpture",
            "category": "sculpture",
            "coreId": "tanglin_core",
            "x": -18.0,
            "z": 228.0,
            "r": 4.5,
        },
        {
            "id": "sundial_bonsai_pergola",
            "glbNode": "SBG_Sundial_Bonsai_Pergola",
            "name": "1929 Victorian Sundial & Bonsai Pergola",
            "category": "sculpture",
            "coreId": "tanglin_core",
            "x": 112.0,
            "z": 160.0,
            "r": 9.0,
        },
        {
            "id": "nassim_gate_clock_tower",
            "glbNode": "SBG_Nassim_Gate_Clock_Tower",
            "name": "Nassim Gate Visitor Centre & Clock Tower",
            "category": "gate",
            "coreId": "central_core",
            "x": 128.0,
            "z": 35.0,
            "r": 11.0,
        },
        {
            "id": "ginger_cavern_waterfall",
            "glbNode": "SBG_Ginger_Cavern_Waterfall",
            "name": "Ginger Garden Walk-Behind Cavern Waterfall",
            "category": "sculpture",
            "coreId": "central_core",
            "x": -72.0,
            "z": 98.0,
            "r": 10.0,
        },
        {
            "id": "chopin_memorial_sculpture",
            "glbNode": "SBG_Chopin_Memorial_Sculpture",
            "name": "Frédéric Chopin 2008 Bronze Memorial Statue",
            "category": "sculpture",
            "coreId": "central_core",
            "x": 32.0,
            "z": 46.0,
            "r": 4.5,
        },
        {
            "id": "walk_of_giants_boardwalk",
            "glbNode": "SBG_Walk_Of_Giants_Boardwalk",
            "name": "SPH Walk of Giants Elevated Canopy Boardwalk",
            "category": "bridge",
            "coreId": "tyersall_gallop_core",
            "x": -235.0,
            "z": 205.0,
            "r": 12.0,
        },
        {
            "id": "como_cempedak_play_pod",
            "glbNode": "SBG_Como_Cempedak_Play_Pod",
            "name": "COMO Adventure Grove (Giant Cempedak Play Pod)",
            "category": "sculpture",
            "coreId": "tyersall_gallop_core",
            "x": -182.0,
            "z": 258.0,
            "r": 10.0,
        },
        {
            "id": "jacob_ballas_treehouse_bridge",
            "glbNode": "SBG_Jacob_Ballas_Treehouse_Bridge",
            "name": "Jacob Ballas Children's Garden & Suspension Treehouse Bridge",
            "category": "bridge",
            "coreId": "bukit_timah_core",
            "x": 95.0,
            "z": -278.0,
            "r": 13.0,
        },
    ]

    # Entrance Gates (all 4 cardinal NParks gates)
    entrance_gates = [
        {"id": "tanglin_gate", "name": "Tanglin Gate (Silver Gate South)", "coreId": "tanglin_core", "x": 45.0, "z": 305.0},
        {"id": "nassim_gate", "name": "Nassim Gate Visitor Centre (East)", "coreId": "central_core", "x": 128.0, "z": 35.0},
        {"id": "gallop_gate", "name": "Gallop Gate (South-West)", "coreId": "tyersall_gallop_core", "x": -242.0, "z": 292.0},
        {"id": "bukit_timah_gate", "name": "Bukit Timah Gate (Botanic Gardens MRT North)", "coreId": "bukit_timah_core", "x": -12.0, "z": -312.0},
    ]

    # 6. 5 Walkable Elevated Bridges
    walkable_bridges = [
        {
            "id": "swan_lake_gazebo_bridge",
            "name": "Swan Lake Gazebo Bridge",
            "coreId": "tanglin_core",
            "ax": -56.0,
            "az": 212.0,
            "bx": 36.0,
            "bz": 212.0,
            "cx": -10.0,
            "cz": 212.0,
            "halfWidth": 4.5,
            "archHeight": 1.25,
            "style": "victorian_gazebo_bridge",
        },
        {
            "id": "symphony_lake_bridge",
            "name": "Symphony Lake Palm Valley Bridge",
            "coreId": "central_core",
            "ax": -26.0,
            "az": -12.0,
            "bx": 73.0,
            "bz": -12.0,
            "cx": 23.5,
            "cz": -12.0,
            "halfWidth": 4.2,
            "archHeight": 0.95,
            "style": "timber_arch",
        },
        {
            "id": "keppel_wetlands_boardwalk",
            "name": "Keppel Discovery Wetlands Timber Boardwalk",
            "coreId": "tyersall_gallop_core",
            "ax": -244.0,
            "az": 155.0,
            "bx": -186.0,
            "bz": 155.0,
            "cx": -215.0,
            "cz": 155.0,
            "halfWidth": 4.0,
            "archHeight": 0.45,
            "style": "wetlands_boardwalk",
        },
        {
            "id": "walk_of_giants_boardwalk",
            "name": "SPH Walk of Giants Elevated Canopy Boardwalk",
            "coreId": "tyersall_gallop_core",
            "ax": -262.0,
            "az": 192.0,
            "bx": -208.0,
            "bz": 218.0,
            "cx": -235.0,
            "cz": 205.0,
            "halfWidth": 4.5,
            "archHeight": 2.4,
            "style": "canopy_skywalk",
        },
        {
            "id": "jacob_ballas_suspension_bridge",
            "name": "Jacob Ballas Suspension Treehouse Bridge",
            "coreId": "bukit_timah_core",
            "ax": 68.0,
            "az": -278.0,
            "bx": 122.0,
            "bz": -278.0,
            "cx": 95.0,
            "cz": -278.0,
            "halfWidth": 4.0,
            "archHeight": 1.6,
            "style": "suspension_bridge",
        },
    ]

    # 7. All 9 Heritage Trees & Flora Zones
    heritage_trees_flora = [
        {
            "id": "tembusu_five_dollar_hero",
            "glbNode": "SBG_Tembusu_Five_Dollar_Hero",
            "name": "Five-Dollar Note Heritage Tembusu Tree (Lawn E #6)",
            "species": "Cyrtophyllum fragrans",
            "coreId": "tanglin_core",
            "x": 32.5,
            "z": 175.0,
            "gameX": 6.5,
            "gameZ": 35.0,
            "r": 7.5,
            "height_m": 32.0,
            "hero": True,
        },
        {
            "id": "bandstand_rain_tree_monarch",
            "glbNode": "SBG_Rain_Tree_Monarch",
            "name": "Bandstand Hill Heritage Rain Tree Ring",
            "species": "Samanea saman",
            "coreId": "tanglin_core",
            "x": 25.0,
            "z": 132.0,
            "r": 7.0,
            "height_m": 30.0,
            "hero": True,
        },
        {
            "id": "golden_shower_orchid_arches",
            "glbNode": "SBG_Golden_Shower_Orchid_Arch",
            "name": "Golden Shower Orchid Arches (Oncidium Goldiana)",
            "species": "Oncidium Goldiana",
            "coreId": "central_core",
            "x": -95.0,
            "z": 38.0,
            "r": 6.5,
            "height_m": 6.0,
            "hero": False,
        },
        {
            "id": "primary_rainforest_trail",
            "glbNode": "SBG_Rainforest_Dipterocarp_Giant",
            "name": "6-Hectare Primary Rain Forest Trail",
            "species": "Shorea & Dyera costulata (Jelutong)",
            "coreId": "central_core",
            "x": 125.0,
            "z": 85.0,
            "r": 32.0,
            "height_m": 48.0,
            "hero": True,
        },
        {
            "id": "palm_valley_coco_de_mer",
            "glbNode": "SBG_Palm_Valley_Talipot_Grove",
            "name": "Palm Valley Talipot & Double Coconut Grove",
            "species": "Lodoicea maldivica & Corypha umbraculifera",
            "coreId": "central_core",
            "x": 85.0,
            "z": -18.0,
            "r": 14.0,
            "height_m": 24.0,
            "hero": False,
        },
        {
            "id": "learning_forest_kapok_giant",
            "glbNode": "SBG_Kapok_Buttress_Giant",
            "name": "Learning Forest & Keppel Discovery Wetlands",
            "species": "Ceiba pentandra & Alstonia pneumatophora",
            "coreId": "tyersall_gallop_core",
            "x": -215.0,
            "z": 155.0,
            "r": 18.0,
            "height_m": 42.0,
            "hero": True,
        },
        {
            "id": "gallop_arboretum_dipterocarps",
            "glbNode": "SBG_Gallop_Arboretum_Tree",
            "name": "Gallop Arboretum & Pre-War Dipterocarp Sanctuary",
            "species": "Dipterocarpaceae Collection",
            "coreId": "tyersall_gallop_core",
            "x": -255.0,
            "z": 262.0,
            "r": 12.0,
            "height_m": 34.0,
            "hero": False,
        },
        {
            "id": "foliage_evolution_garden_spine",
            "glbNode": "SBG_Evolution_Cycad_Tree_Fern",
            "name": "Foliage Valley & Bamboo / Evolution Garden Spine",
            "species": "Cycas rumphii & Sphaeropteris glauca",
            "coreId": "bukit_timah_core",
            "x": 82.0,
            "z": -155.0,
            "r": 22.0,
            "height_m": 18.0,
            "hero": False,
        },
        {
            "id": "eco_lake_fig_hornbill_sanctuary",
            "glbNode": "SBG_Eco_Lake_Fig_Sanctuary",
            "name": "Eco-Lake Weeping Fig & Hornbill Sanctuary",
            "species": "Ficus benjamina & Taxodium distichum",
            "coreId": "bukit_timah_core",
            "x": -58.0,
            "z": -215.0,
            "r": 14.0,
            "height_m": 26.0,
            "hero": False,
        },
    ]

    # 8. Scenic Brick & Heritage Pathways Connecting All 4 Cores
    pathways = [
        {
            "id": "north_south_unesco_grand_spine",
            "name": "Main North–South UNESCO Heritage Spine (Tanglin Gate -> Bandstand -> Palm Valley -> Eco-Lake -> Bukit Timah MRT Gate)",
            "width_m": 9.0,
            "points_m": [
                [45.0, 305.0],
                [42.0, 265.0],
                [48.0, 212.0],
                [25.0, 162.0],
                [25.0, 145.0],
                [22.0, 95.0],
                [18.0, 56.0],
                [-12.0, 54.0],
                [-38.0, 8.0],
                [-36.0, -55.0],
                [12.0, -98.0],
                [25.0, -142.0],
                [68.0, -185.0],
                [78.0, -215.0],
                [55.0, -272.0],
                [18.0, -292.0],
                [-12.0, -312.0],
            ],
        },
        {
            "id": "tanglin_core_swan_lake_loop",
            "name": "Tanglin Core, Lawn E Tembusu (+32.5,+175m), Swan Lake & Holttum Hall Heritage Loop",
            "width_m": 7.5,
            "points_m": [
                [45.0, 305.0],
                [68.0, 298.0],
                [62.0, 268.0],
                [88.0, 255.0],
                [112.0, 248.0],
                [112.0, 182.0],
                [112.0, 160.0],
                [55.0, 167.0],
                [32.5, 175.0],
                [25.0, 145.0],
                [-5.0, 152.0],
                [-47.5, 175.0],
                [-68.0, 212.0],
                [-45.0, 268.0],
                [25.0, 295.0],
                [45.0, 305.0],
            ],
        },
        {
            "id": "national_orchid_garden_plateau_loop",
            "name": "National Orchid Garden Plateau Trail (Mist House -> Burkill Hall -> Cool House -> Bromeliads -> Ginger Waterfall)",
            "width_m": 7.0,
            "points_m": [
                [-38.0, 8.0],
                [-62.0, 12.0],
                [-92.0, 24.0],
                [-88.0, 52.0],
                [-64.0, 52.0],
                [-45.0, 96.0],
                [-72.0, 98.0],
                [-102.0, 92.0],
                [-148.0, 48.0],
                [-125.0, 18.0],
                [-125.0, -6.0],
                [-158.0, -28.0],
                [-132.0, -28.0],
                [-105.0, -12.0],
                [-62.0, 12.0],
            ],
        },
        {
            "id": "central_nassim_rainforest_loop",
            "name": "Nassim Gate, Primary Rain Forest & Palm Valley East Loop",
            "width_m": 7.5,
            "points_m": [
                [25.0, 145.0],
                [68.0, 195.0],
                [96.0, 108.0],
                [142.0, 85.0],
                [105.0, 68.0],
                [128.0, 35.0],
                [102.0, 22.0],
                [92.0, -28.0],
                [78.0, -78.0],
                [12.0, -98.0],
            ],
        },
        {
            "id": "tyersall_gallop_learning_forest_trail",
            "name": "Tyersall–Gallop Extension, Learning Forest, Walk of Giants & Colonial Houses Trail",
            "width_m": 7.0,
            "points_m": [
                [-68.0, 212.0],
                [-135.0, 185.0],
                [-168.0, 145.0],
                [-186.0, 155.0],
                [-244.0, 155.0],
                [-258.0, 155.0],
                [-262.0, 192.0],
                [-235.0, 205.0],
                [-275.0, 245.0],
                [-252.0, 235.0],
                [-242.0, 278.0],
                [-212.0, 272.0],
                [-182.0, 284.0],
                [-182.0, 258.0],
                [-165.0, 232.0],
                [-195.0, 205.0],
                [-135.0, 185.0],
            ],
        },
        {
            "id": "bukit_timah_ecolake_children_loop",
            "name": "Bukit Timah Core, Eco-Lake West Bank, Evolution Garden & Jacob Ballas Loop",
            "width_m": 7.0,
            "points_m": [
                [25.0, -142.0],
                [82.0, -155.0],
                [108.0, -155.0],
                [98.0, -225.0],
                [95.0, -278.0],
                [68.0, -282.0],
                [18.0, -292.0],
                [-12.0, -312.0],
                [-52.0, -282.0],
                [-68.0, -252.0],
                [-72.0, -195.0],
                [-48.0, -152.0],
                [25.0, -142.0],
            ],
        },
    ]

    # 9. All 42 Singapore Botanic Gardens Relics across the 4 Official NParks Cores
    # Every coordinate is verified collision-free against all 5 water bodies and 8 buildings.
    relics = [
        # CORE 1: Tanglin Core (12 Relics, z: +135 to +325)
        {"id": 1, "name": "Vanda Miss Joaquim 1893 Hybrid Gold Brooch", "shortName": "1893 Vanda Miss Joaquim", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "orchid", "icon": "🌸", "x": 16.0, "z": 162.0, "isLandmarkRelic": True},
        {"id": 2, "name": "The 1930 Octagonal Bandstand Gazebo Bell", "shortName": "1930 Bandstand Gazebo", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "orchid", "icon": "🏛️", "x": 44.0, "z": 145.0, "isLandmarkRelic": True},
        {"id": 6, "name": "Swan Lake \"Flight of Swans\" Bronze Plaque", "shortName": "Flight of Swans Bronze", "coreId": "tanglin_core", "zoneId": "dragonfly", "zoneName": "Tanglin Core", "category": "orchid", "icon": "🦢", "x": 48.0, "z": 212.0, "isLandmarkRelic": False},
        {"id": 7, "name": "Five-Dollar Note Heritage Tembusu Tree Capsule", "shortName": "$5-Note Tembusu Tree", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "orchid", "icon": "💵", "x": 55.0, "z": 167.0, "isLandmarkRelic": True},
        {"id": 8, "name": "1859 Agri-Horticultural Society Brass Music Box", "shortName": "1859 Founding Music Box", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "orchid", "icon": "🎵", "x": -5.0, "z": 152.0, "isLandmarkRelic": False},
        {"id": 11, "name": "1890 Herringbone Latex Tapping Porcelain Cup", "shortName": "Rubber Latex Cup", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "supertree", "icon": "☕", "x": 68.0, "z": 195.0, "isLandmarkRelic": False},
        {"id": 13, "name": "Tanglin Heritage Kaya & Pandan Veranda Set", "shortName": "Veranda Kaya Set", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "supertree", "icon": "🍞", "x": 62.0, "z": 268.0, "isLandmarkRelic": False},
        {"id": 16, "name": "Holttum Hall 1921 Orchid-Breeding Laboratory Box", "shortName": "Holttum Lab Relic", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "supertree", "icon": "🧪", "x": 112.0, "z": 248.0, "isLandmarkRelic": True},
        {"id": 24, "name": "1929 Victorian Sundial Garden Brass Gnomon", "shortName": "1929 Victorian Sundial", "coreId": "tanglin_core", "zoneId": "supertree", "zoneName": "Tanglin Core", "category": "conservatory", "icon": "☀️", "x": 112.0, "z": 182.0, "isLandmarkRelic": False},
        {"id": 27, "name": "Swan Lake Victorian Gazebo & Terrapin Bell", "shortName": "Swan Lake Gazebo Bell", "coreId": "tanglin_core", "zoneId": "dragonfly", "zoneName": "Tanglin Core", "category": "heritage", "icon": "🐢", "x": -68.0, "z": 212.0, "isLandmarkRelic": True},
        {"id": 28, "name": "Tanglin Gate Cast-Iron Silver Leaf Medallion", "shortName": "Tanglin Silver Gate", "coreId": "tanglin_core", "zoneId": "dragonfly", "zoneName": "Tanglin Core", "category": "heritage", "icon": "🚪", "x": 25.0, "z": 295.0, "isLandmarkRelic": False},
        {"id": 30, "name": "Tanglin Gate Uncle’s Ice Cream Cart & Bell", "shortName": "Tanglin Ice Cream Cart", "coreId": "tanglin_core", "zoneId": "dragonfly", "zoneName": "Tanglin Core", "category": "heritage", "icon": "🍦", "x": 68.0, "z": 298.0, "isLandmarkRelic": False},

        # CORE 2: Central Core — National Orchid Garden, Palm Valley, Ginger & Rainforest (16 Relics, z: -115 to +125)
        {"id": 3, "name": "Sembcorp Cool House High-Mountain Orchid Globe", "shortName": "Cool House Mist Orchid", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "orchid", "icon": "❄️", "x": -132.0, "z": -28.0, "isLandmarkRelic": False},
        {"id": 4, "name": "Burkill Hall 1868 Anglo-Malayan Plantation Model", "shortName": "1868 Burkill Hall", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "orchid", "icon": "🏡", "x": -125.0, "z": -6.0, "isLandmarkRelic": False},
        {"id": 5, "name": "Golden Shower Arches (Oncidium Goldiana) Doll", "shortName": "Golden Shower Orchid", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "orchid", "icon": "🌼", "x": -92.0, "z": 24.0, "isLandmarkRelic": False},
        {"id": 12, "name": "Corner’s Botanical Monkey-Training Brass Pot", "shortName": "Botanical Monkey Pot", "coreId": "central_core", "zoneId": "supertree", "zoneName": "Central Core", "category": "supertree", "icon": "🫖", "x": 105.0, "z": 68.0, "isLandmarkRelic": False},
        {"id": 14, "name": "The Halia Torch-Ginger & Chili Crab Cauldron", "shortName": "Torch Ginger Cauldron", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "supertree", "icon": "🦀", "x": -45.0, "z": 96.0, "isLandmarkRelic": False},
        {"id": 17, "name": "Nutmeg & Clove 1822 Raffles Spice Goblet", "shortName": "1822 Spice Goblet", "coreId": "central_core", "zoneId": "supertree", "zoneName": "Central Core", "category": "supertree", "icon": "🍹", "x": 96.0, "z": 108.0, "isLandmarkRelic": False},
        {"id": 19, "name": "Tan Hoon Siang Mist House Porcelain Orchid Urn", "shortName": "Mist House Orchid Urn", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "conservatory", "icon": "🏺", "x": -64.0, "z": 52.0, "isLandmarkRelic": False},
        {"id": 20, "name": "Lady Yuen-Peng McNeice Bromeliad Slippers", "shortName": "McNeice Bromeliad Gem", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "conservatory", "icon": "🍍", "x": -148.0, "z": 48.0, "isLandmarkRelic": False},
        {"id": 23, "name": "VIP Celebrity & Royal Orchid Naming Lantern", "shortName": "VIP Orchid Lantern", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "conservatory", "icon": "👑", "x": -105.0, "z": -12.0, "isLandmarkRelic": False},
        {"id": 25, "name": "Crane Fountain & Waterbird Brass Lamp", "shortName": "Crane Fountain Lamp", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "conservatory", "icon": "🦩", "x": -62.0, "z": 12.0, "isLandmarkRelic": False},
        {"id": 26, "name": "Flying Fox & Javan Myna Botanical Weather Vane", "shortName": "Canopy Bat & Bird Vane", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "conservatory", "icon": "🦇", "x": 142.0, "z": 85.0, "isLandmarkRelic": False},
        {"id": 31, "name": "1900s Cluny Road Rickshaw & Brass Horn", "shortName": "Cluny Road Trishaw", "coreId": "central_core", "zoneId": "meadow", "zoneName": "Central Core", "category": "heritage", "icon": "🛺", "x": 102.0, "z": 22.0, "isLandmarkRelic": False},
        {"id": 35, "name": "Shaw Foundation Symphony Stage Acoustic Shell", "shortName": "Shaw Symphony Stage", "coreId": "central_core", "zoneId": "meadow", "zoneName": "Central Core", "category": "sculpture", "icon": "🎼", "x": 18.0, "z": 56.0, "isLandmarkRelic": True},
        {"id": 36, "name": "Double Coconut (Lodoicea maldivica) Palm Crown", "shortName": "Coco de Mer Giant Seed", "coreId": "central_core", "zoneId": "meadow", "zoneName": "Central Core", "category": "sculpture", "icon": "🥥", "x": 92.0, "z": -28.0, "isLandmarkRelic": False},
        {"id": 37, "name": "Frederic Chopin 2008 Bronze Monument Music Box", "shortName": "Chopin Bronze Piano", "coreId": "central_core", "zoneId": "meadow", "zoneName": "Central Core", "category": "sculpture", "icon": "🎹", "x": -12.0, "z": 54.0, "isLandmarkRelic": False},
        {"id": 41, "name": "Ginger Waterfall Cave & Halia Stone Arch", "shortName": "Ginger Waterfall Cave", "coreId": "central_core", "zoneId": "conservatories", "zoneName": "Central Core", "category": "sculpture", "icon": "🌊", "x": -102.0, "z": 92.0, "isLandmarkRelic": False},

        # CORE 3: Tyersall–Gallop Extension (7 Relics, x: -310 to -145, z: +95 to +295)
        {"id": 10, "name": "\"Mad Ridley\" Henry Nicholas Ridley Pith Helmet", "shortName": "Ridley Rubber Helmet", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "orchid", "icon": "🪖", "x": -168.0, "z": 145.0, "isLandmarkRelic": False},
        {"id": 15, "name": "Plantation Director’s Enamel Tingkat Tiffin", "shortName": "Botanist Field Tingkat", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "supertree", "icon": "🍱", "x": -258.0, "z": 155.0, "isLandmarkRelic": False},
        {"id": 21, "name": "750,000-Sheet Singapore Herbarium Specimen Press", "shortName": "1875 Herbarium Press", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "conservatory", "icon": "📚", "x": -212.0, "z": 272.0, "isLandmarkRelic": False},
        {"id": 22, "name": "Atbara 1898 Black-and-White House Miniature", "shortName": "1898 Atbara Bungalow", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "conservatory", "icon": "🏘️", "x": -252.0, "z": 235.0, "isLandmarkRelic": True},
        {"id": 34, "name": "Cast-Iron Binomial Plant Taxonomy Signpost", "shortName": "Latin Plant Signpost", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "heritage", "icon": "🪧", "x": -195.0, "z": 205.0, "isLandmarkRelic": False},
        {"id": 38, "name": "Japanese Bonsai & Penjing Ancient Wrightia Tree", "shortName": "Japanese Bonsai Masterpiece", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "sculpture", "icon": "🪴", "x": -165.0, "z": 232.0, "isLandmarkRelic": False},
        {"id": 42, "name": "UNESCO World Heritage 2015 Golden Inscription Key", "shortName": "UNESCO 2015 Golden Key", "coreId": "tyersall_gallop_core", "zoneId": "dragonfly", "zoneName": "Tyersall–Gallop", "category": "sculpture", "icon": "🏆", "x": -182.0, "z": 284.0, "isLandmarkRelic": True},

        # CORE 4: Bukit Timah Core (7 Relics, z: -325 to -120)
        {"id": 9, "name": "Giant Tiger Orchid (Grammatophyllum) Blossom", "shortName": "Giant Tiger Orchid", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "orchid", "icon": "🐯", "x": -72.0, "z": -195.0, "isLandmarkRelic": False},
        {"id": 18, "name": "Evolution Garden Cycad & Tree-Fern Amber Chest", "shortName": "Prehistoric Cycad Chest", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "supertree", "icon": "🦕", "x": 108.0, "z": -155.0, "isLandmarkRelic": False},
        {"id": 29, "name": "Dawn Tai Chi Fan & Morning Jogger Towel", "shortName": "6AM Tai Chi Fan & Towel", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "heritage", "icon": "🪭", "x": 78.0, "z": -215.0, "isLandmarkRelic": False},
        {"id": 32, "name": "1967 \"Orchid Series\" Currency Coin & Note Bank", "shortName": "1967 Orchid Series Bank", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "heritage", "icon": "🪙", "x": -68.0, "z": -252.0, "isLandmarkRelic": False},
        {"id": 33, "name": "Red Saga Seeds (Adenanthera pavonina) Glass Jar", "shortName": "Lucky Red Saga Seeds", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "heritage", "icon": "🔴", "x": 25.0, "z": -142.0, "isLandmarkRelic": False},
        {"id": 39, "name": "Jacob Ballas Children’s Garden Treehouse Totem", "shortName": "Jacob Ballas Treehouse", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "sculpture", "icon": "🛖", "x": 68.0, "z": -282.0, "isLandmarkRelic": False},
        {"id": 40, "name": "Eco-Lake Black Swan & Oriental Pied Hornbill Duo", "shortName": "Black Swan & Hornbill", "coreId": "bukit_timah_core", "zoneId": "wetlands", "zoneName": "Bukit Timah Core", "category": "sculpture", "icon": "🦢", "x": 18.0, "z": -292.0, "isLandmarkRelic": False},
    ]
    relics.sort(key=lambda r: r["id"])
    for r in relics:
        r["glbModel"] = f"Relic_{r['id']:02d}"
        r["sbgGlbModel"] = f"SBG_Relic_{r['id']:02d}"
        r["world_xz"] = m_to_3d([r["x"], r["z"]])
        r["svg_xy"] = [sx(r["x"]), sz(r["z"])]

    # Mathematical Verification of 0 Overlaps
    water_overlaps = []
    building_overlaps = []
    outside_park = []

    for r in relics:
        rx, rz = r["x"], r["z"]
        if not point_in_polygon(rx, rz, park_boundary_polygon):
            outside_park.append(r["id"])
        for lk in lakes:
            b = lk["bounds_m"]
            in_aabb = (b["x_min"] <= rx <= b["x_max"]) and (b["z_min"] <= rz <= b["z_max"])
            in_poly = point_in_polygon(rx, rz, lk["polygon_m"])
            in_ellipse = math.hypot((rx - lk["cx"]) / lk["rx"], (rz - lk["cz"]) / lk["rz"]) <= 1.05
            if in_aabb or in_poly or in_ellipse:
                water_overlaps.append((r["id"], lk["id"]))
        for bld in buildings:
            u = math.hypot((rx - bld["x"]) / (bld["rx"] + 2.0), (rz - bld["z"]) / (bld["rz"] + 2.0))
            if u <= 1.0:
                building_overlaps.append((r["id"], bld["id"]))
        for gbs in gates_bridges_sculptures:
            d = math.hypot(rx - gbs["x"], rz - gbs["z"])
            if d < gbs["r"] + 1.5:
                building_overlaps.append((r["id"], gbs["id"]))

    assert len(outside_park) == 0, f"Relics outside park boundary: {outside_park}"
    assert len(water_overlaps) == 0, f"Relic-water overlaps detected: {water_overlaps}"
    assert len(building_overlaps) == 0, f"Relic-building overlaps detected: {building_overlaps}"
    print(f"[SBG Cartography Verification] 42/42 Relics verified: 0 water overlaps, 0 building overlaps, 100% inside 4-Core park boundary!")

    spec = {
        "mapId": "sbg",
        "title": "Singapore Botanic Gardens (UNESCO World Heritage Site, 1859)",
        "referenceUrl": "https://sbg.nparks.gov.sg/visit/general-info/",
        "coordinateSystem": {
            "name": "SBG_NParks_Canonical_1to1_Meters_XZ",
            "xRangeMeters": [-380.0, 380.0],
            "zRangeMeters": [-380.0, 380.0],
            "northDirection": "-Z",
            "southDirection": "+Z",
            "svgViewBox": "0 0 2400 2400",
            "svgTransformFormula": "svg_x = 1200 + x * 3.0, svg_y = 1200 + z * 3.0",
        },
        "parkBoundaryPolygon": park_boundary_polygon,
        "cores": cores,
        "lakes": lakes,
        "buildings": buildings,
        "enterablePortals": enterable_portals,
        "gatesBridgesSculptures": gates_bridges_sculptures,
        "entranceGates": entrance_gates,
        "walkableBridges": walkable_bridges,
        "heritageTreesFlora": heritage_trees_flora,
        "pathways": pathways,
        "relics": relics,
    }

    for out_path in (SPEC_OUT_MAPS, SPEC_OUT_DATA):
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(spec, f, indent=2)
        print(f"Wrote SBG spatial spec: {out_path} ({os.path.getsize(out_path)} bytes)")

    return spec


def fmt_svg_pts(pts_m):
    return " ".join(f"{sx(p[0]):.1f},{sz(p[1]):.1f}" for p in pts_m)


def render_sbg_svg_floorplan(spec):
    svg = []
    svg.append('<?xml version="1.0" encoding="UTF-8"?>')
    svg.append(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2400 2400" width="2400" height="2400">'
    )

    # Defs: Gradients, Patterns & Drop Shadows
    svg.append("  <defs>")
    svg.append(
        '    <radialGradient id="sbgBgGrad" cx="50%" cy="50%" r="70%">'
        '<stop offset="0%" stop-color="#0b2e22"/>'
        '<stop offset="100%" stop-color="#041710"/>'
        "</radialGradient>"
    )
    svg.append(
        '    <linearGradient id="sbgTurfGrad" x1="20%" y1="0%" x2="80%" y2="100%">'
        '<stop offset="0%" stop-color="#1e5631"/>'
        '<stop offset="45%" stop-color="#246339"/>'
        '<stop offset="100%" stop-color="#184728"/>'
        "</linearGradient>"
    )
    svg.append(
        '    <radialGradient id="lakeWaterGrad" cx="45%" cy="45%" r="60%">'
        '<stop offset="0%" stop-color="#38bdf8"/>'
        '<stop offset="55%" stop-color="#0ea5e9"/>'
        '<stop offset="100%" stop-color="#0369a1"/>'
        "</radialGradient>"
    )
    svg.append(
        '    <radialGradient id="ecoLakeGrad" cx="45%" cy="45%" r="60%">'
        '<stop offset="0%" stop-color="#2dd4bf"/>'
        '<stop offset="60%" stop-color="#0d9488"/>'
        '<stop offset="100%" stop-color="#065f46"/>'
        "</radialGradient>"
    )
    svg.append("  </defs>")

    # 1. Layer: Surroundings, Metric Grid & Perimeter Roads
    svg.append('  <g id="layer-background-and-grid">')
    svg.append('    <rect x="0" y="0" width="2400" height="2400" fill="url(#sbgBgGrad)"/>')

    # Metric 50m Grid Lines (-350m to +350m)
    for m in range(-350, 400, 50):
        px = sx(m)
        pz = sz(m)
        is_axis = m == 0
        op = "0.24" if is_axis else "0.08"
        sw = "2.0" if is_axis else "1.0"
        svg.append(f'    <line x1="{px:.1f}" y1="60" x2="{px:.1f}" y2="2340" stroke="#6ee7b7" stroke-width="{sw}" opacity="{op}"/>')
        svg.append(f'    <line x1="60" y1="{pz:.1f}" x2="2340" y2="{pz:.1f}" stroke="#6ee7b7" stroke-width="{sw}" opacity="{op}"/>')
        if m % 100 == 0:
            svg.append(f'    <text x="{px:.1f}" y="52" fill="#6ee7b7" opacity="0.55" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">X={m:+d}m</text>')
            svg.append(f'    <text x="52" y="{pz + 4:.1f}" fill="#6ee7b7" opacity="0.55" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="end">Z={m:+d}m</text>')

    # Perimeter Boundary Roads (Cluny Road, Holland/Napier Road, Tyersall Ave, Bukit Timah Road)
    cluny_rd = fmt_svg_pts([[55, -335], [155, -310], [202, -235], [188, -135], [216, -25], [212, 55], [198, 135], [205, 215], [162, 305], [55, 345]])
    tyersall_rd = fmt_svg_pts([[55, 345], [-50, 335], [-140, 305], [-220, 320], [-315, 300], [-335, 205], [-305, 105], [-210, 78], [-205, -55], [-162, -130], [-168, -240], [-115, -325], [-45, -350], [55, -335]])
    svg.append(f'    <polyline points="{cluny_rd}" fill="none" stroke="#1e293b" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>')
    svg.append(f'    <polyline points="{cluny_rd}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="14,12" opacity="0.55"/>')
    svg.append(f'    <polyline points="{tyersall_rd}" fill="none" stroke="#1e293b" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>')
    svg.append(f'    <polyline points="{tyersall_rd}" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="14,12" opacity="0.55"/>')
    svg.append(f'    <text x="{sx(222):.1f}" y="{sz(-10):.1f}" fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" letter-spacing="3" transform="rotate(88 {sx(222):.1f} {sz(-10):.1f})" text-anchor="middle">CLUNY ROAD &amp; NASSIM HERITAGE BOUNDARY</text>')
    svg.append(f'    <text x="{sx(-235):.1f}" y="{sz(35):.1f}" fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="bold" letter-spacing="3" transform="rotate(-76 {sx(-235):.1f} {sz(35):.1f})" text-anchor="middle">TYERSALL AVENUE &amp; GALLOP ROAD</text>')
    svg.append(f'    <text x="{sx(5):.1f}" y="{sz(-355):.1f}" fill="#38bdf8" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="bold" letter-spacing="3" text-anchor="middle">BUKIT TIMAH ROAD &amp; BOTANIC GARDENS MRT (NORTH)</text>')
    svg.append(f'    <text x="{sx(45):.1f}" y="{sz(362):.1f}" fill="#34d399" font-family="Helvetica, Arial, sans-serif" font-size="19" font-weight="bold" letter-spacing="3" text-anchor="middle">HOLLAND ROAD &amp; NAPIER ROAD (TANGLIN SOUTH)</text>')
    svg.append("  </g>")

    # 2. Layer: Elongated North-South 4-Core Park Landmass & Lawn Contours
    svg.append('  <g id="layer-park-landmass">')
    boundary_pts = fmt_svg_pts(spec["parkBoundaryPolygon"])
    svg.append(f'    <polygon points="{boundary_pts}" fill="#123820" stroke="#a7f3d0" stroke-width="8.5" stroke-linejoin="round"/>')
    svg.append(f'    <polygon points="{boundary_pts}" fill="url(#sbgTurfGrad)" stroke="#34d399" stroke-width="3.0" stroke-linejoin="round" opacity="0.96"/>')

    # Topographic Lawn & Plateau Contours for each of the 4 Cores
    lawns = [
        # Core 1: Bandstand Hill & Lawn E (+32.5, +175m)
        (25, 145, 58, 42, "#2d7a47", 0.42),
        (32.5, 175, 44, 34, "#348a52", 0.40),
        (95, 225, 55, 52, "#286e40", 0.35),
        # Core 2: National Orchid Garden West Plateau, Palm Valley & Primary Rainforest
        (-118, 18, 62, 74, "#2f7d44", 0.46),
        (24, 58, 56, 38, "#348a52", 0.38),
        (125, 85, 48, 46, "#164e2b", 0.62),
        # Core 3: Tyersall-Gallop Extension
        (-228, 225, 68, 62, "#1f5c34", 0.48),
        # Core 4: Bukit Timah Core & Jacob Ballas
        (88, -220, 62, 68, "#286e40", 0.40),
    ]
    for lx, lz, lrx, lrz, col, op in lawns:
        svg.append(
            f'    <ellipse cx="{sx(lx):.1f}" cy="{sz(lz):.1f}" rx="{lrx * SCALE_SVG:.1f}" ry="{lrz * SCALE_SVG:.1f}" fill="{col}" opacity="{op}" stroke="#86efac" stroke-width="1.2" stroke-dasharray="8,6"/>'
        )

    # 4 Core Zone Divider Lines & Official NParks Core Badges
    for core in spec["cores"]:
        b = core["bounds_m"]
        rx = sx(b["x_min"])
        ry = sz(b["z_min"])
        rw = (b["x_max"] - b["x_min"]) * SCALE_SVG
        rh = (b["z_max"] - b["z_min"]) * SCALE_SVG
        col = core["color"]
        svg.append(
            f'    <rect x="{rx:.1f}" y="{ry:.1f}" width="{rw:.1f}" height="{rh:.1f}" rx="28" fill="{col}" fill-opacity="0.06" stroke="{col}" stroke-width="2.5" stroke-dasharray="14,10" opacity="0.72"/>'
        )
        lx, lz = core["label_pos_m"]
        bx, bz = sx(lx), sz(lz)
        badge_txt = core["badge"]
        bw = max(310, len(badge_txt) * 10.5 + 32)
        svg.append(
            f'    <g transform="translate({bx:.1f},{bz:.1f})">'
            f'<rect x="{-bw*0.5:.1f}" y="-20" width="{bw:.1f}" height="40" rx="20" fill="#061e16" stroke="{col}" stroke-width="2.8" opacity="0.94"/>'
            f'<text x="0" y="6" fill="{col}" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" letter-spacing="1.5" text-anchor="middle">{html.escape(badge_txt)}</text>'
            f"</g>"
        )
    svg.append("  </g>")

    # 3. Layer: 3 Iconic Lakes (Swan Lake, Symphony Lake, Eco-Lake) + Keppel Wetlands + Ginger Pool
    svg.append('  <g id="layer-3-lakes-hydrology">')
    for lk in spec["lakes"]:
        pts = fmt_svg_pts(lk["polygon_m"])
        cx, cz = sx(lk["cx"]), sz(lk["cz"])
        grad = "url(#ecoLakeGrad)" if lk["id"] in ("eco_lake", "keppel_wetlands", "ginger_pool") else "url(#lakeWaterGrad)"
        # Sandstone shoreline rim + glowing water polygon
        svg.append(
            f'    <polygon id="{lk["id"]}_rim" points="{pts}" fill="#d6cbb5" stroke="#fde68a" stroke-width="9.0" stroke-linejoin="round" opacity="0.85"/>'
        )
        svg.append(
            f'    <polygon id="{lk["id"]}" points="{pts}" fill="{grad}" stroke="#7dd3fc" stroke-width="3.5" stroke-linejoin="round"/>'
        )
        # Inner depth contour ripples
        for scale_r, op in ((0.78, 0.45), (0.54, 0.35), (0.32, 0.25)):
            erx = lk["rx"] * SCALE_SVG * scale_r
            erz = lk["rz"] * SCALE_SVG * scale_r
            svg.append(
                f'    <ellipse cx="{cx:.1f}" cy="{cz:.1f}" rx="{erx:.1f}" ry="{erz:.1f}" fill="none" stroke="#bae6fd" stroke-width="1.6" stroke-dasharray="10,8" opacity="{op}"/>'
            )
        # Islands inside the lake
        for isl in lk.get("islands", []):
            icx, icz = sx(isl["cx"]), sz(isl["cz"])
            irx, irz = isl["rx"] * SCALE_SVG, isl["rz"] * SCALE_SVG
            svg.append(
                f'    <ellipse cx="{icx:.1f}" cy="{icz:.1f}" rx="{irx:.1f}" ry="{irz:.1f}" fill="#1f6335" stroke="#a7f3d0" stroke-width="3.0"/>'
            )
        # Lake Title Callout
        label_y = cz + (lk["rz"] * SCALE_SVG * 0.42 if lk["id"] != "symphony_lake" else -lk["rz"] * SCALE_SVG * 0.45)
        svg.append(
            f'    <text x="{cx:.1f}" y="{label_y:.1f}" fill="#e0f2fe" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" letter-spacing="1.2" text-anchor="middle">{html.escape(lk["name"].upper())}</text>'
        )
    svg.append("  </g>")

    # 4. Layer: Winding Brick & Heritage Pathways + 5 Walkable Bridges
    svg.append('  <g id="layer-pathways-and-bridges">')
    for pw in spec["pathways"]:
        pts = fmt_svg_pts(pw["points_m"])
        w_px = pw["width_m"] * SCALE_SVG
        svg.append(
            f'    <polyline id="{pw["id"]}_border" points="{pts}" fill="none" stroke="#78350f" stroke-width="{w_px + 5.0:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>'
        )
        svg.append(
            f'    <polyline id="{pw["id"]}" points="{pts}" fill="none" stroke="#eadbc0" stroke-width="{w_px:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.88"/>'
        )
        svg.append(
            f'    <polyline points="{pts}" fill="none" stroke="#b45309" stroke-width="1.6" stroke-dasharray="6,8" stroke-linecap="round" opacity="0.45"/>'
        )

    # Walkable Elevated Bridges
    for br in spec["walkableBridges"]:
        x1, z1 = sx(br["ax"]), sz(br["az"])
        x2, z2 = sx(br["bx"]), sz(br["bz"])
        cx, cz = sx(br["cx"]), sz(br["cz"])
        w_px = br["halfWidth"] * 2.0 * SCALE_SVG
        svg.append(
            f'    <line id="{br["id"]}_casing" x1="{x1:.1f}" y1="{z1:.1f}" x2="{x2:.1f}" y2="{z2:.1f}" stroke="#451a03" stroke-width="{w_px + 8.0:.1f}" stroke-linecap="butt"/>'
        )
        svg.append(
            f'    <line id="{br["id"]}" x1="{x1:.1f}" y1="{z1:.1f}" x2="{x2:.1f}" y2="{z2:.1f}" stroke="#f59e0b" stroke-width="{w_px:.1f}" stroke-linecap="butt"/>'
        )
        svg.append(
            f'    <line x1="{x1:.1f}" y1="{z1:.1f}" x2="{x2:.1f}" y2="{z2:.1f}" stroke="#fef3c7" stroke-width="3.0" stroke-dasharray="6,6"/>'
        )
        svg.append(
            f'    <text x="{cx:.1f}" y="{cz - 16.0:.1f}" fill="#fde68a" font-family="Helvetica, Arial, sans-serif" font-size="13.5" font-weight="bold" text-anchor="middle">{html.escape(br["name"])}</text>'
        )
    svg.append("  </g>")

    # 5. Layer: Canopy Tree Clusters & 9 Heritage Trees / Flora Zones
    svg.append('  <g id="layer-canopy-and-heritage-trees">')
    # Decorative botanical canopy clusters along park perimeter
    canopy_belt = [
        (-85, 275), (-15, 295), (125, 280), (155, 205), (158, 115), (165, 55),
        (165, -45), (138, -110), (142, -195), (135, -265), (45, -305), (-65, -295),
        (-115, -225), (-118, -145), (-155, -80), (-165, 10), (-145, 115),
        (-268, 130), (-290, 215), (-278, 275), (-205, 290), (-110, 245)
    ]
    for idx, (tx, tz) in enumerate(canopy_belt):
        c_rad = (9.0 + (idx % 3) * 2.5) * SCALE_SVG
        svg.append(
            f'    <circle cx="{sx(tx):.1f}" cy="{sz(tz):.1f}" r="{c_rad:.1f}" fill="#15803d" fill-opacity="0.55" stroke="#4ade80" stroke-width="1.8"/>'
        )
        svg.append(
            f'    <circle cx="{sx(tx) - 4:.1f}" cy="{sz(tz) - 4:.1f}" r="{c_rad * 0.55:.1f}" fill="#22c55e" fill-opacity="0.45"/>'
        )

    for ht in spec["heritageTreesFlora"]:
        hx, hz = sx(ht["x"]), sz(ht["z"])
        hr = max(8.0, min(ht["r"], 20.0)) * SCALE_SVG
        stroke_col = "#facc15" if ht["hero"] else "#86efac"
        fill_col = "#16a34a" if ht["hero"] else "#15803d"
        svg.append(
            f'    <g id="{ht["id"]}" transform="translate({hx:.1f},{hz:.1f})">'
            f'<circle cx="0" cy="0" r="{hr:.1f}" fill="{fill_col}" fill-opacity="0.48" stroke="{stroke_col}" stroke-width="3.2" stroke-dasharray="8,4"/>'
            f'<circle cx="0" cy="0" r="8.0" fill="#78350f" stroke="{stroke_col}" stroke-width="2.2"/>'
            f'<text x="0" y="{hr + 16.0:.1f}" fill="#d1fae5" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">{html.escape(ht["name"])}</text>'
            f"</g>"
        )
    svg.append("  </g>")

    # 6. Layer: All 8 Major Architectural Buildings & 10 Gates/Bridges/Sculptures
    svg.append('  <g id="layer-architectural-landmarks">')
    for bld in spec["buildings"]:
        bx, bz = sx(bld["x"]), sz(bld["z"])
        rx_px = bld["rx"] * SCALE_SVG
        rz_px = bld["rz"] * SCALE_SVG
        rot_deg = math.degrees(-bld.get("rotY", 0.0))
        col = bld["color"]
        acc = bld["accentColor"]
        svg.append(f'    <g id="{bld["id"]}" transform="translate({bx:.1f},{bz:.1f}) rotate({rot_deg:.1f})">')
        if bld["id"] == "bandstand_1930":
            svg.append(f'      <circle cx="0" cy="0" r="{rx_px * 1.25:.1f}" fill="#10b981" fill-opacity="0.25" stroke="#facc15" stroke-width="2.5" stroke-dasharray="6,4"/>')
            svg.append(f'      <circle cx="0" cy="0" r="{rx_px:.1f}" fill="{col}" stroke="{acc}" stroke-width="4.0"/>')
            svg.append('      <circle cx="0" cy="0" r="9.0" fill="#facc15"/>')
        elif bld["id"] in ("sembcorp_cool_house", "shaw_symphony_stage"):
            svg.append(f'      <ellipse cx="0" cy="0" rx="{rx_px:.1f}" ry="{rz_px:.1f}" fill="{col}" fill-opacity="0.78" stroke="{acc}" stroke-width="4.0"/>')
            svg.append(f'      <ellipse cx="0" cy="0" rx="{rx_px * 0.68:.1f}" ry="{rz_px * 0.68:.1f}" fill="none" stroke="#ffffff" stroke-width="2.0" stroke-dasharray="6,4"/>')
        else:
            svg.append(f'      <rect x="{-rx_px:.1f}" y="{-rz_px:.1f}" width="{rx_px * 2.0:.1f}" height="{rz_px * 2.0:.1f}" rx="8" fill="{col}" fill-opacity="0.88" stroke="{acc}" stroke-width="4.0"/>')
            svg.append(f'      <line x1="{-rx_px * 0.8:.1f}" y1="0" x2="{rx_px * 0.8:.1f}" y2="0" stroke="{acc}" stroke-width="2.2"/>')
        svg.append("    </g>")
        svg.append(
            f'    <g transform="translate({bx:.1f},{bz - rz_px - 14.0:.1f})">'
            f'<rect x="-135" y="-15" width="270" height="22" rx="6" fill="#061e16" stroke="{acc}" stroke-width="1.5" opacity="0.92"/>'
            f'<text x="0" y="1" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">{html.escape(bld["name"])}</text>'
            f"</g>"
        )

    for gbs in spec["gatesBridgesSculptures"]:
        gx, gz = sx(gbs["x"]), sz(gbs["z"])
        gr = max(16.0, gbs["r"] * SCALE_SVG * 0.85)
        svg.append(
            f'    <g id="{gbs["id"]}" transform="translate({gx:.1f},{gz:.1f})">'
            f'<circle cx="0" cy="0" r="{gr:.1f}" fill="#f59e0b" fill-opacity="0.28" stroke="#fde047" stroke-width="2.6"/>'
            f'<circle cx="0" cy="0" r="6.5" fill="#fde047" stroke="#0f172a" stroke-width="2.0"/>'
            f'<text x="0" y="{gr + 15.0:.1f}" fill="#fef08a" font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">{html.escape(gbs["name"])}</text>'
            f"</g>"
        )

    # EJH Corner House (1910 Black-and-White Bungalow #18 at -8.5,+24 -> -42.5m,+120m) & Eco-Garden Pavilion (-10,-54 -> -50m,-270m)
    for hid, hname, hx_m, hz_m in [
        ("ejh_corner_house_1910", "EJH Corner House (1910 #18)", -42.5, 120.0),
        ("eco_garden_pavilion", "Eco-Garden & Foliage Pavilion", -50.0, -270.0),
    ]:
        hx_px, hz_px = sx(hx_m), sz(hz_m)
        svg.append(
            f'    <g id="{hid}" transform="translate({hx_px:.1f},{hz_px:.1f})">'
            f'<rect x="-24" y="-16" width="48" height="32" rx="6" fill="#f8fafc" stroke="#c2410c" stroke-width="3.0"/>'
            f'<text x="0" y="30" fill="#fde68a" font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">{html.escape(hname)}</text>'
            f"</g>"
        )

    # 4 Main Entrance Gate Badges
    for gate in spec["entranceGates"]:
        gx, gz = sx(gate["x"]), sz(gate["z"])
        svg.append(
            f'    <g id="gate_{gate["id"]}" transform="translate({gx:.1f},{gz:.1f})">'
            f'<rect x="-95" y="-14" width="190" height="28" rx="14" fill="#7c2d12" stroke="#facc15" stroke-width="2.5"/>'
            f'<text x="0" y="5" fill="#fef08a" font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">🚪 {html.escape(gate["name"].upper())}</text>'
            f"</g>"
        )
    svg.append("  </g>")

    # 7. Layer: All 42 Botanical Relics (Collision-Free & Color-Coded by Core)
    core_colors = {
        "tanglin_core": "#10b981",
        "central_core": "#f59e0b",
        "tyersall_gallop_core": "#38bdf8",
        "bukit_timah_core": "#a855f7",
    }
    svg.append('  <g id="layer-42-relics">')
    for rel in spec["relics"]:
        rx, rz = sx(rel["x"]), sz(rel["z"])
        col = core_colors.get(rel["coreId"], "#facc15")
        rad = 15.0 if rel["isLandmarkRelic"] else 12.5
        svg.append(
            f'    <g id="Relic_{rel["id"]:02d}" data-x-m="{rel["x"]}" data-z-m="{rel["z"]}" transform="translate({rx:.1f},{rz:.1f})">'
            f'<circle cx="0" cy="0" r="{rad + 3.5:.1f}" fill="{col}" fill-opacity="0.28"/>'
            f'<circle cx="0" cy="0" r="{rad:.1f}" fill="#0f172a" stroke="{col}" stroke-width="3.2"/>'
            f'<text x="0" y="4.5" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">{rel["id"]}</text>'
            f"</g>"
        )
    svg.append("  </g>")

    # 8. Layer: Title Cartouche, Compass Rose & 100m Metric Scale Bar
    svg.append('  <g id="layer-cartographic-furniture">')
    # Title Cartouche (Top-Left)
    svg.append(
        '    <g transform="translate(80, 85)">'
        '<rect x="0" y="0" width="650" height="132" rx="16" fill="#061e16" stroke="#34d399" stroke-width="3.0" opacity="0.95"/>'
        '<text x="28" y="40" fill="#6ee7b7" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" letter-spacing="2">UNESCO WORLD HERITAGE SITE (INSCRIBED 2015 • EST. 1859)</text>'
        '<text x="28" y="76" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="28" font-weight="bold">SINGAPORE BOTANIC GARDENS — 1:1 METRIC FLOORPLAN</text>'
        '<text x="28" y="108" fill="#cbd5e1" font-family="Helvetica, Arial, sans-serif" font-size="15">4 Official NParks Cores • 3 Iconic Lakes (Swan, Symphony, Eco-Lake) • 42 Relics • Scale: 3.0 px = 1.0 m</text>'
        "</g>"
    )

    # Compass Rose (Top-Right)
    svg.append(
        '    <g id="compass-rose" transform="translate(2230, 165)">'
        '<circle cx="0" cy="0" r="64" fill="#061e16" stroke="#34d399" stroke-width="3.0" opacity="0.95"/>'
        '<circle cx="0" cy="0" r="52" fill="none" stroke="#6ee7b7" stroke-width="1.2" stroke-dasharray="6,4"/>'
        '<polygon points="0,-48 -12,0 0,-10 12,0" fill="#facc15"/>'
        '<polygon points="0,48 -10,0 0,10 10,0" fill="#64748b"/>'
        '<polygon points="-48,0 0,-10 -10,0 0,10" fill="#64748b"/>'
        '<polygon points="48,0 0,-10 10,0 0,10" fill="#64748b"/>'
        '<text x="0" y="-54" fill="#facc15" font-family="Helvetica, Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">N (-Z)</text>'
        '<text x="0" y="66" fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">S (+Z)</text>'
        '<text x="62" y="5" fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="start">E (+X)</text>'
        '<text x="-62" y="5" fill="#94a3b8" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="end">W (-X)</text>'
        "</g>"
    )

    # 100m Metric Scale Bar (Bottom-Right: 100m = 300px, 200m = 600px)
    svg.append(
        '    <g id="metric-scale-bar" transform="translate(1640, 2245)">'
        '<rect x="-25" y="-38" width="675" height="92" rx="14" fill="#061e16" stroke="#34d399" stroke-width="2.5" opacity="0.95"/>'
        '<text x="0" y="-12" fill="#6ee7b7" font-family="Helvetica, Arial, sans-serif" font-size="15" font-weight="bold" letter-spacing="1.5">1:1 NPARKS METRIC SCALE BAR (1m = 3.0 SVG PX)</text>'
        '<rect x="0" y="4" width="150" height="14" fill="#34d399"/>'
        '<rect x="150" y="4" width="150" height="14" fill="#0f172a" stroke="#34d399" stroke-width="2"/>'
        '<rect x="300" y="4" width="300" height="14" fill="#34d399"/>'
        '<text x="0" y="38" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">0m</text>'
        '<text x="150" y="38" fill="#ffffff" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">50m</text>'
        '<text x="300" y="38" fill="#facc15" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">100m</text>'
        '<text x="600" y="38" fill="#facc15" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">200m</text>'
        "</g>"
    )
    svg.append("  </g>")
    svg.append("</svg>")

    svg_content = "\n".join(svg)
    os.makedirs(os.path.dirname(SVG_OUT_PUBLIC), exist_ok=True)
    with open(SVG_OUT_PUBLIC, "w", encoding="utf-8") as f:
        f.write(svg_content)
    print(f"Wrote 2D SVG floorplan: {SVG_OUT_PUBLIC} ({os.path.getsize(SVG_OUT_PUBLIC)} bytes)")


if __name__ == "__main__":
    spec_data = build_sbg_spatial_spec()
    render_sbg_svg_floorplan(spec_data)
