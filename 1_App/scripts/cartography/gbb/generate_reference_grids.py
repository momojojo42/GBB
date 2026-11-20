#!/usr/bin/env python3
"""
Stage 1A: Reference Photo Geodesic Grid Overlays & Least-Squares Affine Calibration
Gardens by the Bay (Bay South) — Spatially Exact 2D-to-3D Reconstruction

Generates:
1. public/maps/ref_grid_1_masterplan_north_up.png
2. public/maps/ref_grid_2_official_visitor_map_north_up.png
3. public/maps/ref_grid_3_route_map_rotated.png
4. scripts/cartography/calibration_transforms.json
"""

import os
import sys
import math
import json
import zlib
import struct
import subprocess
from pathlib import Path

# Auto-reexec with Blender's bundled Python 3.11 if invoked with system Python lacking numpy
try:
    import numpy as np
except ImportError:
    blender_py = "/tmp/blender_mnt/Blender.app/Contents/Resources/4.2/python/bin/python3.11"
    if os.path.exists(blender_py) and sys.executable != blender_py:
        os.execv(blender_py, [blender_py] + sys.argv)
    raise

WORKSPACE_DIR = Path("/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments")
PUBLIC_MAPS_DIR = WORKSPACE_DIR / "public" / "maps"
CARTOGRAPHY_DIR = WORKSPACE_DIR / "scripts" / "cartography"
PARENT_BRAIN_DIR = Path("/Users/momo/.gemini/antigravity/brain/b137f042-fda4-4398-bc0e-f21b111da1c0")
SELF_BRAIN_DIR = Path("/Users/momo/.gemini/antigravity/brain/4c1ca529-97d5-4144-b4e0-9f7f96cfb62e")

# ==============================================================================
# 1. CANONICAL REAL-WORLD METER COORDINATE SYSTEM (X_m, Z_m)
# ==============================================================================
# Origin (0m, 0m) = Geometric center of Supertree Grove (1°16'54.8"N, 103°51'50.2"E)
# +X_m = East, -X_m = West, -Z_m = True North, +Z_m = True South
# Bounds: X_m in [-450m, +650m] (1,100m width), Z_m in [-380m, +570m] (950m height)

PENINSULA_VERTICES = [
    {
        "id": "V1",
        "name": "NW Waterfront Tip",
        "x_m": -130.0,
        "z_m": -330.0,
        "note": "Sharp ~75 deg corner where 775m straight NW edge meets Marina Channel",
        "ref1_pct": [31.8, 15.0],
        "ref2_pct": [32.8, 4.5],
        "ref3_pct": [90.5, 18.2],
        "badge_offset": (-165, -42),
    },
    {
        "id": "V2",
        "name": "SW Corner (Sheares x Blvd)",
        "x_m": -395.0,
        "z_m": 395.0,
        "note": "90 deg corner at Sheares Ave (775m NW edge) & Marina Blvd (250m SW edge)",
        "ref1_pct": [8.8, 83.2],
        "ref2_pct": [1.5, 66.8],
        "ref3_pct": [10.5, 19.8],
        "badge_offset": (16, -38),
    },
    {
        "id": "V3",
        "name": "Southernmost Tip",
        "x_m": -185.0,
        "z_m": 535.0,
        "note": "90 deg corner where Marina Blvd meets Marina Gardens Drive",
        "ref1_pct": [27.0, 96.5],
        "ref2_pct": [20.6, 90.0],
        "ref3_pct": [6.0, 46.2],
        "badge_offset": (20, -28),
    },
    {
        "id": "V4",
        "name": "Concave S-Curve W",
        "x_m": -25.0,
        "z_m": 270.0,
        "note": "Marina Gardens Drive inflection along Meadow SE edge",
        "ref1_pct": [41.0, 71.0],
        "ref2_pct": [44.0, 62.5],
        "ref3_pct": [43.0, 53.0],
        "badge_offset": (22, 16),
    },
    {
        "id": "V5",
        "name": "Main Entrance Apex",
        "x_m": 215.0,
        "z_m": 125.0,
        "note": "Deepest concave southern boundary apex pinching waist to 330m",
        "ref1_pct": [62.0, 56.8],
        "ref2_pct": [63.5, 56.5],
        "ref3_pct": [60.0, 67.5],
        "badge_offset": (18, 28),
    },
    {
        "id": "V6",
        "name": "SE Southern Edge (MRT)",
        "x_m": 560.0,
        "z_m": 320.0,
        "note": "SE arm of concave arch near Satay by the Bay & GBTB MRT",
        "ref1_pct": [91.8, 75.2],
        "ref2_pct": [94.5, 73.0],
        "ref3_pct": [83.2, 95.0],
        "badge_offset": (-215, 22),
    },
    {
        "id": "V7",
        "name": "SE Barrage Tip",
        "x_m": 645.0,
        "z_m": 235.0,
        "note": "Tapered SE point of orchid-leaf peninsula at Marina Barrage",
        "ref1_pct": [98.5, 67.5],
        "ref2_pct": [99.2, 53.5],
        "ref3_pct": [89.5, 98.5],
        "badge_offset": (-215, -34),
    },
]

# Additional NE Waterfront Promenade curve control points for perimeter drawing
NE_WATERFRONT_CURVE_M = [
    (-130.0, -330.0),  # V1
    (-55.0, -280.0),   # North of Silver Garden
    (25.0, -230.0),    # Flower Dome N Apron
    (110.0, -185.0),   # Conservatory Waterfront Link
    (185.0, -145.0),   # Cloud Forest NE Apron
    (320.0, -65.0),    # Children's Garden Waterfront
    (475.0, 60.0),     # Kingfisher / Satay Waterfront
    (645.0, 235.0),    # V7
]

LANDMARKS = [
    {
        "id": "L01",
        "name": "Supertree Grove (12 Trees)",
        "x_m": 0.0,
        "z_m": 0.0,
        "w_m": 175.0,
        "l_m": 155.0,
        "angle_deg": 140.0,
        "ref1_pct": [43.0, 44.5],
        "ref2_pct": [45.8, 38.2],
        "ref3_pct": [63.5, 42.5],
        "badge_offset": (-210, -45),
    },
    {
        "id": "L02",
        "name": "Flower Dome (#1)",
        "x_m": 35.0,
        "z_m": -210.0,
        "w_m": 150.0,
        "l_m": 80.0,
        "angle_deg": 125.0,
        "ref1_pct": [46.0, 24.5],
        "ref2_pct": [54.8, 20.2],
        "ref3_pct": [88.0, 39.5],
        "badge_offset": (22, -46),
    },
    {
        "id": "L03",
        "name": "Cloud Forest (#2)",
        "x_m": 160.0,
        "z_m": -135.0,
        "w_m": 115.0,
        "l_m": 70.0,
        "angle_deg": 155.0,
        "ref1_pct": [56.8, 31.2],
        "ref2_pct": [66.2, 26.8],
        "ref3_pct": [87.0, 54.5],
        "badge_offset": (26, -36),
    },
    {
        "id": "L04",
        "name": "Conservatory Plaza & Clock",
        "x_m": 95.0,
        "z_m": -125.0,
        "w_m": 95.0,
        "l_m": 75.0,
        "angle_deg": 140.0,
        "ref1_pct": [51.2, 32.5],
        "ref2_pct": [58.0, 29.0],
        "ref3_pct": [81.5, 47.0],
        "badge_offset": (-235, -18),
    },
    {
        "id": "L05",
        "name": "Silver Garden (3 Trees)",
        "x_m": -75.0,
        "z_m": -245.0,
        "w_m": 70.0,
        "l_m": 65.0,
        "angle_deg": 120.0,
        "ref1_pct": [36.8, 21.2],
        "ref2_pct": [45.2, 17.5],
        "ref3_pct": [83.5, 30.8],
        "badge_offset": (-220, -28),
    },
    {
        "id": "L06",
        "name": "Golden Garden (3 Trees)",
        "x_m": 145.0,
        "z_m": -25.0,
        "w_m": 75.0,
        "l_m": 60.0,
        "angle_deg": 135.0,
        "ref1_pct": [55.5, 43.0],
        "ref2_pct": [62.5, 36.5],
        "ref3_pct": [73.5, 57.5],
        "badge_offset": (-215, 16),
    },
    {
        "id": "L07",
        "name": "Heritage Gardens (4 Zones)",
        "x_m": -55.0,
        "z_m": -70.0,
        "w_m": 190.0,
        "l_m": 65.0,
        "angle_deg": 45.0,
        "ref1_pct": [38.5, 38.0],
        "ref2_pct": [40.5, 31.0],
        "ref3_pct": [65.0, 33.5],
        "badge_offset": (-235, -24),
    },
    {
        "id": "L08",
        "name": "World of Plants & Understorey",
        "x_m": -65.0,
        "z_m": 105.0,
        "w_m": 90.0,
        "l_m": 70.0,
        "angle_deg": 0.0,
        "ref1_pct": [37.0, 54.5],
        "ref2_pct": [42.5, 51.0],
        "ref3_pct": [52.5, 47.0],
        "badge_offset": (22, -14),
    },
    {
        "id": "L09",
        "name": "The Meadow & Stage Canopy",
        "x_m": -175.0,
        "z_m": 235.0,
        "w_m": 210.0,
        "l_m": 165.0,
        "angle_deg": 35.0,
        "ref1_pct": [27.5, 67.5],
        "ref2_pct": [27.0, 59.5],
        "ref3_pct": [33.0, 38.0],
        "badge_offset": (-110, 26),
    },
    {
        "id": "L10",
        "name": "Planet Floating Baby (#19)",
        "x_m": -145.0,
        "z_m": 115.0,
        "w_m": 24.0,
        "l_m": 10.0,
        "angle_deg": 20.0,
        "ref1_pct": [30.0, 56.0],
        "ref2_pct": [27.5, 48.2],
        "ref3_pct": [44.0, 30.0],
        "badge_offset": (-225, 14),
    },
    {
        "id": "L11",
        "name": "Serene Garden (#21 West)",
        "x_m": -235.0,
        "z_m": 75.0,
        "w_m": 95.0,
        "l_m": 65.0,
        "angle_deg": -25.0,
        "ref1_pct": [22.5, 52.0],
        "ref2_pct": [14.2, 60.8],
        "ref3_pct": [24.0, 32.0],
        "badge_offset": (-230, -20),
    },
    {
        "id": "L12",
        "name": "Floral Fantasy & Bayfront",
        "x_m": -200.0,
        "z_m": 25.0,
        "w_m": 115.0,
        "l_m": 45.0,
        "angle_deg": 30.0,
        "ref1_pct": [25.5, 48.0],
        "ref2_pct": [20.2, 37.5],
        "ref3_pct": [49.5, 20.5],
        "badge_offset": (-235, -36),
    },
    {
        "id": "L13",
        "name": "IMBA Theatre (#37)",
        "x_m": -145.0,
        "z_m": -145.0,
        "w_m": 95.0,
        "l_m": 55.0,
        "angle_deg": 30.0,
        "ref1_pct": [30.5, 31.0],
        "ref2_pct": [31.2, 24.8],
        "ref3_pct": [66.5, 19.5],
        "badge_offset": (-215, -24),
    },
    {
        "id": "L14",
        "name": "Active Garden (#27 NW)",
        "x_m": -125.0,
        "z_m": -265.0,
        "w_m": 130.0,
        "l_m": 50.0,
        "angle_deg": 30.0,
        "ref1_pct": [32.2, 19.5],
        "ref2_pct": [34.5, 12.5],
        "ref3_pct": [83.5, 16.5],
        "badge_offset": (-220, -18),
    },
    {
        "id": "L15",
        "name": "Sun Pavilion & Canyon (#22)",
        "x_m": 215.0,
        "z_m": -65.0,
        "w_m": 85.0,
        "l_m": 40.0,
        "angle_deg": 130.0,
        "ref1_pct": [62.0, 38.0],
        "ref2_pct": [69.5, 34.5],
        "ref3_pct": [82.0, 60.5],
        "badge_offset": (24, -28),
    },
    {
        "id": "L16",
        "name": "Children's Garden (#23)",
        "x_m": 295.0,
        "z_m": -35.0,
        "w_m": 130.0,
        "l_m": 75.0,
        "angle_deg": 125.0,
        "ref1_pct": [68.5, 41.0],
        "ref2_pct": [76.5, 38.5],
        "ref3_pct": [86.5, 67.5],
        "badge_offset": (26, -18),
    },
    {
        "id": "L17",
        "name": "Kingfisher Wetlands (#28)",
        "x_m": 355.0,
        "z_m": 55.0,
        "w_m": 160.0,
        "l_m": 90.0,
        "angle_deg": 125.0,
        "ref1_pct": [74.0, 50.0],
        "ref2_pct": [80.8, 46.8],
        "ref3_pct": [81.5, 73.5],
        "badge_offset": (24, -8),
    },
    {
        "id": "L18",
        "name": "Main Entrance & Coach Bay",
        "x_m": 165.0,
        "z_m": 95.0,
        "w_m": 165.0,
        "l_m": 105.0,
        "angle_deg": 45.0,
        "ref1_pct": [57.5, 54.0],
        "ref2_pct": [65.5, 50.5],
        "ref3_pct": [67.5, 65.5],
        "badge_offset": (-230, 22),
    },
    {
        "id": "L19",
        "name": "Satay by the Bay (g)",
        "x_m": 445.0,
        "z_m": 135.0,
        "w_m": 150.0,
        "l_m": 95.0,
        "angle_deg": 125.0,
        "ref1_pct": [82.0, 58.0],
        "ref2_pct": [88.0, 49.5],
        "ref3_pct": [75.5, 83.5],
        "badge_offset": (-215, 24),
    },
    {
        "id": "L20",
        "name": "Marina Barrage Visitor Ctr",
        "x_m": 565.0,
        "z_m": 165.0,
        "w_m": 180.0,
        "l_m": 110.0,
        "angle_deg": 125.0,
        "ref1_pct": [90.0, 58.5],
        "ref2_pct": [98.0, 51.0],
        "ref3_pct": [81.5, 97.5],
        "badge_offset": (-235, -36),
    },
]

# Anchor indices used for Least-Squares Affine Fit (as specified in prompt):
# Supertree Grove (0,0), Flower Dome (+35,-210), Cloud Forest (+160,-135),
# The Meadow (-175,+235), NW Tip (-130,-330), SW Corner (-395,+395),
# Southern Tip (-185,+535), Main Entrance Apex (+215,+125), Marina Barrage (+565,+165)
ANCHOR_SPECS = [
    ("L01 Supertree Grove", 0.0, 0.0, [43.0, 44.5], [45.8, 38.2], [63.5, 42.5]),
    ("L02 Flower Dome", 35.0, -210.0, [46.0, 24.5], [54.8, 20.2], [88.0, 39.5]),
    ("L03 Cloud Forest", 160.0, -135.0, [56.8, 31.2], [66.2, 26.8], [87.0, 54.5]),
    ("L09 The Meadow", -175.0, 235.0, [27.5, 67.5], [27.0, 59.5], [33.0, 38.0]),
    ("V1 NW Waterfront Tip", -130.0, -330.0, [31.8, 15.0], [32.8, 4.5], [90.5, 18.2]),
    ("V2 SW Corner", -395.0, 395.0, [8.8, 83.2], [1.5, 66.8], [10.5, 19.8]),
    ("V3 Southernmost Tip", -185.0, 535.0, [27.0, 96.5], [20.6, 90.0], [6.0, 46.2]),
    ("V5 Main Entrance Apex", 215.0, 125.0, [62.0, 56.8], [63.5, 56.5], [60.0, 67.5]),
    ("L20 Marina Barrage / SE Tip", 565.0, 165.0, [90.0, 58.5], [100.2, 54.0], [81.5, 98.5]),
]


# ==============================================================================
# 2. CLEAN 5x7 BITMAP FONT & HIGH-CONTRAST VECTOR RASTERIZER IN NUMPY
# ==============================================================================
FONT_5X7 = {
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
    "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11100", "10010", "10001", "10001", "10001", "10010", "11100"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
    "J": ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "a": ["00000", "00000", "01110", "00001", "01111", "10001", "01111"],
    "b": ["10000", "10000", "11110", "10001", "10001", "10001", "11110"],
    "c": ["00000", "00000", "01110", "10000", "10000", "10001", "01110"],
    "d": ["00001", "00001", "01111", "10001", "10001", "10001", "01111"],
    "e": ["00000", "00000", "01110", "10001", "11111", "10000", "01110"],
    "f": ["00110", "01001", "01000", "11100", "01000", "01000", "01000"],
    "g": ["00000", "01111", "10001", "10001", "01111", "00001", "01110"],
    "h": ["10000", "10000", "11110", "10001", "10001", "10001", "10001"],
    "i": ["00100", "00000", "01100", "00100", "00100", "00100", "01110"],
    "j": ["00010", "00000", "00110", "00010", "00010", "10010", "01100"],
    "k": ["10000", "10000", "10010", "10100", "11000", "10100", "10010"],
    "l": ["01100", "00100", "00100", "00100", "00100", "00100", "01110"],
    "m": ["00000", "00000", "11010", "10101", "10101", "10001", "10001"],
    "n": ["00000", "00000", "11110", "10001", "10001", "10001", "10001"],
    "o": ["00000", "00000", "01110", "10001", "10001", "10001", "01110"],
    "p": ["00000", "00000", "11110", "10001", "11110", "10000", "10000"],
    "q": ["00000", "00000", "01111", "10001", "01111", "00001", "00001"],
    "r": ["00000", "00000", "10110", "11001", "10000", "10000", "10000"],
    "s": ["00000", "00000", "01111", "10000", "01110", "00001", "11110"],
    "t": ["01000", "01000", "11100", "01000", "01000", "01001", "00110"],
    "u": ["00000", "00000", "10001", "10001", "10001", "10001", "01111"],
    "v": ["00000", "00000", "10001", "10001", "10001", "01010", "00100"],
    "w": ["00000", "00000", "10001", "10001", "10101", "10101", "01010"],
    "x": ["00000", "00000", "10001", "01010", "00100", "01010", "10001"],
    "y": ["00000", "10001", "10001", "10001", "01111", "00001", "01110"],
    "z": ["00000", "00000", "11111", "00010", "00100", "01000", "11111"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
    ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
    "[": ["01110", "01000", "01000", "01000", "01000", "01000", "01110"],
    "]": ["01110", "00010", "00010", "00010", "00010", "00010", "01110"],
    ",": ["00000", "00000", "00000", "00000", "00110", "00100", "01000"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    "/": ["00001", "00010", "00100", "00100", "01000", "10000", "00000"],
    "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    "'": ["00100", "00100", "00000", "00000", "00000", "00000", "00000"],
    "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
    "°": ["00110", "01001", "01001", "00110", "00000", "00000", "00000"],
}

GLYPH_MASKS = {}
for ch, rows in FONT_5X7.items():
    GLYPH_MASKS[ch] = np.array([[1 if c == "1" else 0 for c in r] for r in rows], dtype=np.uint8)


def load_image_via_sips(src_path: Path, target_w: int = None, target_h: int = None) -> np.ndarray:
    """Decode JPEG/PNG via macOS sips into an RGB uint8 NumPy array (H, W, 3)."""
    tmp_bmp = Path(f"/tmp/gbb_calib_{os.getpid()}_{src_path.stem}.bmp")
    cmd = ["sips", "-s", "format", "bmp"]
    if target_w and target_h:
        cmd += ["-z", str(target_h), str(target_w)]
    cmd += [str(src_path), "--out", str(tmp_bmp)]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    data = tmp_bmp.read_bytes()
    tmp_bmp.unlink(missing_ok=True)

    w = struct.unpack_from("<i", data, 18)[0]
    h_raw = struct.unpack_from("<i", data, 22)[0]
    h = abs(h_raw)
    offset = struct.unpack_from("<I", data, 10)[0]
    bpp = struct.unpack_from("<H", data, 28)[0]
    channels = bpp // 8
    row_bytes = ((w * channels + 3) // 4) * 4
    arr = np.frombuffer(data, dtype=np.uint8, offset=offset)[: h * row_bytes].reshape((h, row_bytes))
    arr = arr[:, : w * channels].reshape((h, w, channels))
    rgb = arr[:, :, :3][:, :, ::-1].copy()
    if h_raw > 0:
        rgb = rgb[::-1, :, :].copy()
    return rgb


def save_png(path: Path, rgb: np.ndarray):
    """Write an RGB uint8 NumPy array (H, W, 3) directly to a compressed PNG file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    h, w, _ = rgb.shape
    raw_rows = np.hstack([np.zeros((h, 1), dtype=np.uint8), rgb.reshape(h, w * 3)])
    compressed = zlib.compress(raw_rows.tobytes(), level=6)

    def make_chunk(chunk_type: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(chunk_type + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + chunk_type + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    png_bytes = (
        b"\x89PNG\r\n\x1a\n"
        + make_chunk(b"IHDR", ihdr)
        + make_chunk(b"IDAT", compressed)
        + make_chunk(b"IEND", b"")
    )
    path.write_bytes(png_bytes)


def blend_rect(img: np.ndarray, x0: int, y0: int, x1: int, y1: int, color, alpha: float):
    h, w, _ = img.shape
    xa, xb = max(0, int(x0)), min(w, int(x1))
    ya, yb = max(0, int(y0)), min(h, int(y1))
    if xa >= xb or ya >= yb:
        return
    region = img[ya:yb, xa:xb].astype(np.float32)
    c = np.array(color, dtype=np.float32)
    img[ya:yb, xa:xb] = np.clip(region * (1.0 - alpha) + c * alpha, 0, 255).astype(np.uint8)


def draw_rect_border(img: np.ndarray, x0: int, y0: int, x1: int, y1: int, color, thickness: int = 1, alpha: float = 1.0):
    blend_rect(img, x0, y0, x1, y0 + thickness, color, alpha)
    blend_rect(img, x0, y1 - thickness, x1, y1, color, alpha)
    blend_rect(img, x0, y0, x0 + thickness, y1, color, alpha)
    blend_rect(img, x1 - thickness, y0, x1, y1, color, alpha)


def draw_line(
    img: np.ndarray,
    x0: float,
    y0: float,
    x1: float,
    y1: float,
    color,
    thickness: float = 1.5,
    alpha: float = 1.0,
    dash_len: float = 0.0,
    gap_len: float = 0.0,
):
    """Vectorized anti-aliased line segment renderer with optional dashing."""
    h, w, _ = img.shape
    # Cohen-Sutherland style bounding box check
    pad = int(thickness + 4)
    if max(x0, x1) < -pad or min(x0, x1) >= w + pad or max(y0, y1) < -pad or min(y0, y1) >= h + pad:
        return

    dx = x1 - x0
    dy = y1 - y0
    length = math.hypot(dx, dy)
    if length < 0.5:
        return

    # Clip line segment to image bounds [-pad, w+pad] x [-pad, h+pad]
    t0, t1 = 0.0, 1.0
    for p, q in [
        (-dx, x0 + pad),
        (dx, w + pad - x0),
        (-dy, y0 + pad),
        (dy, h + pad - y0),
    ]:
        if abs(p) < 1e-9:
            if q < 0:
                return
        else:
            r = q / p
            if p < 0:
                if r > t1:
                    return
                if r > t0:
                    t0 = r
            else:
                if r < t0:
                    return
                if r < t1:
                    t1 = r

    cx0 = x0 + t0 * dx
    cy0 = y0 + t0 * dy
    cx1 = x0 + t1 * dx
    cy1 = y0 + t1 * dy
    s_offset = t0 * length

    xmin = max(0, int(min(cx0, cx1) - thickness - 2))
    xmax = min(w, int(max(cx0, cx1) + thickness + 3))
    ymin = max(0, int(min(cy0, cy1) - thickness - 2))
    ymax = min(h, int(max(cy0, cy1) + thickness + 3))
    if xmin >= xmax or ymin >= ymax:
        return

    yy, xx = np.mgrid[ymin:ymax, xmin:xmax]
    px = xx.astype(np.float32) - x0
    py = yy.astype(np.float32) - y0
    seg_len_sq = float(dx * dx + dy * dy)
    t = np.clip((px * dx + py * dy) / seg_len_sq, 0.0, 1.0)
    dist = np.hypot(px - t * dx, py - t * dy)

    half_t = thickness * 0.5
    mask = np.clip(half_t + 0.7 - dist, 0.0, 1.0) * alpha
    if dash_len > 0.0:
        s = t * length
        period = dash_len + (gap_len if gap_len > 0 else dash_len)
        in_dash = (np.mod(s, period) < dash_len).astype(np.float32)
        mask *= in_dash

    idx = mask > 0.01
    if not np.any(idx):
        return
    sub = img[ymin:ymax, xmin:xmax]
    m3 = mask[idx][:, None]
    c = np.array(color, dtype=np.float32)
    sub[idx] = np.clip(sub[idx].astype(np.float32) * (1.0 - m3) + c * m3, 0, 255).astype(np.uint8)


def draw_circle(
    img: np.ndarray,
    cx: float,
    cy: float,
    radius: float,
    fill_color=None,
    fill_alpha: float = 1.0,
    stroke_color=None,
    stroke_width: float = 2.0,
    stroke_alpha: float = 1.0,
):
    h, w, _ = img.shape
    rmax = radius + (stroke_width if stroke_color else 0) + 2
    xmin = max(0, int(cx - rmax))
    xmax = min(w, int(cx + rmax + 1))
    ymin = max(0, int(cy - rmax))
    ymax = min(h, int(cy + rmax + 1))
    if xmin >= xmax or ymin >= ymax:
        return

    yy, xx = np.mgrid[ymin:ymax, xmin:xmax]
    dist = np.hypot(xx - cx, yy - cy)
    sub = img[ymin:ymax, xmin:xmax]

    if fill_color is not None:
        fmask = np.clip(radius + 0.5 - dist, 0.0, 1.0) * fill_alpha
        idx = fmask > 0.01
        if np.any(idx):
            m3 = fmask[idx][:, None]
            c = np.array(fill_color, dtype=np.float32)
            sub[idx] = np.clip(sub[idx].astype(np.float32) * (1.0 - m3) + c * m3, 0, 255).astype(np.uint8)

    if stroke_color is not None and stroke_width > 0:
        smask = np.clip(stroke_width * 0.5 + 0.6 - np.abs(dist - radius), 0.0, 1.0) * stroke_alpha
        idx = smask > 0.01
        if np.any(idx):
            m3 = smask[idx][:, None]
            c = np.array(stroke_color, dtype=np.float32)
            sub[idx] = np.clip(sub[idx].astype(np.float32) * (1.0 - m3) + c * m3, 0, 255).astype(np.uint8)


def draw_text(
    img: np.ndarray,
    text: str,
    x: int,
    y: int,
    color=(255, 255, 255),
    scale: int = 2,
    shadow_color=None,
):
    """Render crisp bitmap text at (x, y) top-left."""
    h, w, _ = img.shape
    if shadow_color is not None:
        draw_text(img, text, x + scale, y + scale, color=shadow_color, scale=scale, shadow_color=None)

    cursor_x = int(x)
    cy = int(y)
    c_arr = np.array(color, dtype=np.uint8)
    char_adv = 6 * scale

    for ch in text:
        glyph = GLYPH_MASKS.get(ch, GLYPH_MASKS.get(ch.upper(), GLYPH_MASKS[" "]))
        if scale > 1:
            g_scaled = np.repeat(np.repeat(glyph, scale, axis=0), scale, axis=1)
        else:
            g_scaled = glyph
        gh, gw = g_scaled.shape
        x0, x1 = cursor_x, cursor_x + gw
        y0, y1 = cy, cy + gh
        if x1 > 0 and x0 < w and y1 > 0 and y0 < h:
            cx0 = max(0, x0)
            cx1 = min(w, x1)
            cy0 = max(0, y0)
            cy1 = min(h, y1)
            sub_g = g_scaled[cy0 - y0 : cy1 - y0, cx0 - x0 : cx1 - x0]
            mask = sub_g == 1
            img[cy0:cy1, cx0:cx1][mask] = c_arr
        cursor_x += char_adv


def measure_text(text: str, scale: int = 2):
    if not text:
        return 0, 7 * scale
    return (len(text) * 6 - 1) * scale, 7 * scale


def draw_badge(
    img: np.ndarray,
    text: str,
    x: int,
    y: int,
    text_color=(255, 255, 255),
    bg_color=(12, 20, 32),
    border_color=(0, 240, 255),
    scale: int = 2,
    pad_x: int = 6,
    pad_y: int = 4,
    bg_alpha: float = 0.88,
    center: bool = False,
):
    tw, th = measure_text(text, scale=scale)
    bw = tw + 2 * pad_x
    bh = th + 2 * pad_y
    bx = int(x - bw // 2) if center else int(x)
    by = int(y - bh // 2) if center else int(y)
    # Clamp inside image bounds with 4px margin
    h, w, _ = img.shape
    bx = max(4, min(w - bw - 4, bx))
    by = max(4, min(h - bh - 4, by))

    blend_rect(img, bx + 2, by + 2, bx + bw + 2, by + bh + 2, (0, 0, 0), 0.55)
    blend_rect(img, bx, by, bx + bw, by + bh, bg_color, bg_alpha)
    draw_rect_border(img, bx, by, bx + bw, by + bh, border_color, thickness=max(1, scale - 1), alpha=0.95)
    draw_text(img, text, bx + pad_x, by + pad_y, color=text_color, scale=scale)
    return bx, by, bw, bh


def draw_multiline_badge(
    img: np.ndarray,
    lines: list,
    x: int,
    y: int,
    text_colors: list,
    bg_color=(10, 18, 28),
    border_color=(255, 215, 60),
    scale: int = 2,
    pad_x: int = 7,
    pad_y: int = 5,
    line_gap: int = 4,
    bg_alpha: float = 0.88,
):
    widths = [measure_text(line, scale=scale)[0] for line in lines]
    line_h = 7 * scale
    bw = max(widths) + 2 * pad_x
    bh = len(lines) * line_h + (len(lines) - 1) * line_gap + 2 * pad_y

    h, w, _ = img.shape
    bx = max(6, min(w - bw - 6, int(x)))
    by = max(56, min(h - bh - 6, int(y)))

    blend_rect(img, bx + 3, by + 3, bx + bw + 3, by + bh + 3, (0, 0, 0), 0.55)
    blend_rect(img, bx, by, bx + bw, by + bh, bg_color, bg_alpha)
    draw_rect_border(img, bx, by, bx + bw, by + bh, border_color, thickness=2, alpha=0.95)

    cy = by + pad_y
    for line, tc in zip(lines, text_colors):
        draw_text(img, line, bx + pad_x, cy, color=tc, scale=scale)
        cy += line_h + line_gap
    return bx, by, bw, bh


# ==============================================================================
# 3. LEAST-SQUARES AFFINE FIT & COORDINATE TRANSFORMS
# ==============================================================================
def fit_affine_transform(anchors_m: np.ndarray, anchors_px: np.ndarray):
    """
    Fit 2D affine transform mapping (X_m, Z_m, 1) -> (px, py, 1) via least squares.
    Returns (M_3x3, M_inv_3x3, residuals_px, residuals_m).
    """
    n = len(anchors_m)
    A = np.hstack([anchors_m, np.ones((n, 1), dtype=np.float64)])
    M_T, _, _, _ = np.linalg.lstsq(A, anchors_px.astype(np.float64), rcond=None)
    M_2x3 = M_T.T
    M_3x3 = np.vstack([M_2x3, [0.0, 0.0, 1.0]])
    M_inv_3x3 = np.linalg.inv(M_3x3)

    pred_px = A @ M_T
    res_px = np.linalg.norm(pred_px - anchors_px, axis=1)

    A_px = np.hstack([anchors_px, np.ones((n, 1), dtype=np.float64)])
    pred_m = (A_px @ M_inv_3x3.T)[:, :2]
    res_m = np.linalg.norm(pred_m - anchors_m, axis=1)

    return M_3x3, M_inv_3x3, pred_px, res_px, res_m


def apply_affine(M_3x3: np.ndarray, x_m: float, z_m: float):
    px = M_3x3[0, 0] * x_m + M_3x3[0, 1] * z_m + M_3x3[0, 2]
    py = M_3x3[1, 0] * x_m + M_3x3[1, 1] * z_m + M_3x3[1, 2]
    return float(px), float(py)


# ==============================================================================
# 4. GRID, FOOTPRINT & CALLOUT RENDERING FOR EACH REFERENCE PHOTO
# ==============================================================================
def render_reference_grid(
    img: np.ndarray,
    M_3x3: np.ndarray,
    map_key: str,
    title: str,
    subtitle: str,
    is_rotated_ref3: bool = False,
):
    h, w, _ = img.shape
    x_min_m, x_max_m = -450.0, 650.0
    z_min_m, z_max_m = -380.0, 570.0

    # ------------------------------------------------------------------
    # A. For Ref 3 (Rotated -58 deg CCW): Also render local orthogonal (U_m, V_m)
    # meter grid along image borders & subtle interior orthogonal reference lines
    # ------------------------------------------------------------------
    if is_rotated_ref3:
        ox, oy = apply_affine(M_3x3, 0.0, 0.0)
        # Scale in px/m along horizontal U and vertical V axes
        scale_u = math.hypot(M_3x3[0, 0], M_3x3[0, 1])
        scale_v = math.hypot(M_3x3[1, 0], M_3x3[1, 1])
        px_per_m_uv = 0.5 * (scale_u + scale_v)

        for u_m in range(-600, 401, 100):
            ux = ox + u_m * px_per_m_uv
            if 20 <= ux <= w - 20:
                draw_line(img, ux, 52, ux, h - 42, (160, 185, 215), thickness=1.2, alpha=0.22, dash_len=6, gap_len=10)
                draw_line(img, ux, 48, ux, 68, (255, 165, 255), thickness=2.5, alpha=0.9)
                draw_line(img, ux, h - 44, ux, h - 24, (255, 165, 255), thickness=2.5, alpha=0.9)
                lbl = f"U={u_m:+d}m" if u_m != 0 else "U=0m"
                draw_badge(
                    img,
                    lbl,
                    int(ux),
                    h - 18,
                    text_color=(255, 210, 255),
                    bg_color=(32, 12, 42),
                    border_color=(225, 110, 255),
                    scale=2,
                    pad_x=5,
                    pad_y=3,
                    center=True,
                )

        for v_m in range(-400, 501, 100):
            vy = oy + v_m * px_per_m_uv
            if 65 <= vy <= h - 45:
                draw_line(img, 20, vy, w - 20, vy, (160, 185, 215), thickness=1.2, alpha=0.22, dash_len=6, gap_len=10)
                draw_line(img, w - 28, vy, w - 6, vy, (255, 165, 255), thickness=2.5, alpha=0.9)
                lbl = f"V={v_m:+d}m" if v_m != 0 else "V=0m"
                draw_badge(
                    img,
                    lbl,
                    w - 62,
                    int(vy),
                    text_color=(255, 210, 255),
                    bg_color=(32, 12, 42),
                    border_color=(225, 110, 255),
                    scale=2,
                    pad_x=5,
                    pad_y=3,
                    center=True,
                )

    # ------------------------------------------------------------------
    # B. Minor 50m Dashed Geodesic Grid Lines
    # ------------------------------------------------------------------
    for x_m in range(-450, 651, 50):
        if x_m % 100 == 0:
            continue
        p0 = apply_affine(M_3x3, x_m, z_min_m)
        p1 = apply_affine(M_3x3, x_m, z_max_m)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (0, 0, 0), thickness=2.6, alpha=0.35, dash_len=12, gap_len=10)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (90, 235, 255), thickness=1.4, alpha=0.58, dash_len=12, gap_len=10)

    for z_m in range(-350, 551, 50):
        if z_m % 100 == 0:
            continue
        p0 = apply_affine(M_3x3, x_min_m, z_m)
        p1 = apply_affine(M_3x3, x_max_m, z_m)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (0, 0, 0), thickness=2.6, alpha=0.35, dash_len=12, gap_len=10)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (255, 220, 100), thickness=1.4, alpha=0.58, dash_len=12, gap_len=10)

    # ------------------------------------------------------------------
    # C. Major 100m Solid Geodesic Grid Lines + Coordinate Badges
    # ------------------------------------------------------------------
    for x_m in range(-400, 601, 100):
        p0 = apply_affine(M_3x3, x_m, z_min_m)
        p1 = apply_affine(M_3x3, x_m, z_max_m)
        is_zero = x_m == 0
        line_col = (255, 50, 130) if is_zero else (0, 240, 255)
        thick = 4.2 if is_zero else 2.2
        alpha = 0.95 if is_zero else 0.78
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (0, 0, 0), thickness=thick + 2.2, alpha=0.55)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], line_col, thickness=thick, alpha=alpha)

        # Top/North and Bottom/South coordinate badges along X grid lines
        lbl = f"X={x_m:+d}m" if x_m != 0 else "X=0m (AXIS)"
        pt_top = apply_affine(M_3x3, x_m, -355.0 if not is_rotated_ref3 else -320.0)
        pt_bot = apply_affine(M_3x3, x_m, 535.0 if not is_rotated_ref3 else 480.0)
        b_col = (255, 70, 145) if is_zero else (0, 235, 255)
        t_col = (255, 230, 240) if is_zero else (180, 250, 255)
        draw_badge(img, lbl, int(pt_top[0]), int(pt_top[1]), text_color=t_col, border_color=b_col, scale=2, center=True)
        if not is_rotated_ref3:
            draw_badge(img, lbl, int(pt_bot[0]), int(pt_bot[1]), text_color=t_col, border_color=b_col, scale=2, center=True)

    for z_m in range(-300, 501, 100):
        p0 = apply_affine(M_3x3, x_min_m, z_m)
        p1 = apply_affine(M_3x3, x_max_m, z_m)
        is_zero = z_m == 0
        line_col = (255, 50, 130) if is_zero else (255, 210, 55)
        thick = 4.2 if is_zero else 2.2
        alpha = 0.95 if is_zero else 0.78
        draw_line(img, p0[0], p0[1], p1[0], p1[1], (0, 0, 0), thickness=thick + 2.2, alpha=0.55)
        draw_line(img, p0[0], p0[1], p1[0], p1[1], line_col, thickness=thick, alpha=alpha)

        lbl = f"Z={z_m:+d}m" if z_m != 0 else "Z=0m (AXIS)"
        pt_left = apply_affine(M_3x3, -415.0 if not is_rotated_ref3 else -360.0, z_m)
        pt_right = apply_affine(M_3x3, 605.0 if not is_rotated_ref3 else 520.0, z_m)
        b_col = (255, 70, 145) if is_zero else (255, 210, 55)
        t_col = (255, 230, 240) if is_zero else (255, 240, 175)
        draw_badge(img, lbl, int(pt_left[0]), int(pt_left[1]), text_color=t_col, border_color=b_col, scale=2, center=True)
        if not is_rotated_ref3:
            draw_badge(img, lbl, int(pt_right[0]), int(pt_right[1]), text_color=t_col, border_color=b_col, scale=2, center=True)

    # ------------------------------------------------------------------
    # D. Outer Peninsula Coastline Perimeter Loop (V1 -> V2 -> ... -> V7 -> NE -> V1)
    # ------------------------------------------------------------------
    perim_pts_m = [
        (-130.0, -330.0),  # V1
        (-395.0, 395.0),   # V2 (775m straight NW edge)
        (-185.0, 535.0),   # V3 (250m straight SW edge)
        (-25.0, 270.0),    # V4 (Concave S-curve W)
        (95.0, 165.0),     # S-curve mid W
        (215.0, 125.0),    # V5 (Deepest concave apex)
        (375.0, 175.0),    # S-curve mid E
        (560.0, 320.0),    # V6 (SE Southern Edge)
        (645.0, 235.0),    # V7 (SE Barrage Tip)
    ] + list(reversed(NE_WATERFRONT_CURVE_M[:-1]))

    for i in range(len(perim_pts_m)):
        m0 = perim_pts_m[i]
        m1 = perim_pts_m[(i + 1) % len(perim_pts_m)]
        px0, py0 = apply_affine(M_3x3, m0[0], m0[1])
        px1, py1 = apply_affine(M_3x3, m1[0], m1[1])
        draw_line(img, px0, py0, px1, py1, (0, 0, 0), thickness=5.0, alpha=0.65)
        draw_line(img, px0, py0, px1, py1, (65, 255, 110), thickness=2.8, alpha=0.92, dash_len=18, gap_len=8)

    # ------------------------------------------------------------------
    # E. Origin (0m, 0m) Concentric Target Rings at Supertree Grove
    # ------------------------------------------------------------------
    ox, oy = apply_affine(M_3x3, 0.0, 0.0)
    px_per_m = 0.5 * (math.hypot(M_3x3[0, 0], M_3x3[1, 0]) + math.hypot(M_3x3[0, 1], M_3x3[1, 1]))
    for r_m in (40.0, 85.0):
        draw_circle(
            img,
            ox,
            oy,
            radius=r_m * px_per_m,
            fill_color=None,
            stroke_color=(255, 50, 130),
            stroke_width=2.4,
            stroke_alpha=0.88,
        )
    draw_circle(
        img,
        ox,
        oy,
        radius=9.0,
        fill_color=(255, 40, 120),
        fill_alpha=1.0,
        stroke_color=(255, 255, 255),
        stroke_width=2.5,
    )

    # ------------------------------------------------------------------
    # F. 20 Landmark Footprints (W x L) + 7 Vertices with Collision-Free Callouts
    # ------------------------------------------------------------------
    callout_items = []

    for lm in LANDMARKS:
        cx_m, cz_m = lm["x_m"], lm["z_m"]
        w_m, l_m = lm["w_m"], lm["l_m"]
        ang_rad = math.radians(lm["angle_deg"])
        cos_a, sin_a = math.cos(ang_rad), math.sin(ang_rad)

        # Draw oriented bounding box in meters projected via affine matrix
        hw, hl = w_m * 0.5, l_m * 0.5
        corners_local = [(-hw, -hl), (hw, -hl), (hw, hl), (-hw, hl)]
        corners_px = []
        for lx, lz in corners_local:
            rx = cx_m + lx * cos_a - lz * sin_a
            rz = cz_m + lx * sin_a + lz * cos_a
            corners_px.append(apply_affine(M_3x3, rx, rz))

        for k in range(4):
            p0 = corners_px[k]
            p1 = corners_px[(k + 1) % 4]
            draw_line(img, p0[0], p0[1], p1[0], p1[1], (0, 0, 0), thickness=3.6, alpha=0.65)
            draw_line(img, p0[0], p0[1], p1[0], p1[1], (255, 195, 40), thickness=2.0, alpha=0.90)

        px, py = apply_affine(M_3x3, cx_m, cz_m)

        # Also check visual feature coordinate on map if artistic skew > 15px
        vis_pct = lm[f"{map_key}_pct"]
        vpx, vpy = vis_pct[0] * w / 100.0, vis_pct[1] * h / 100.0
        if math.hypot(vpx - px, vpy - py) > 15.0:
            draw_line(img, px, py, vpx, vpy, (255, 120, 220), thickness=1.8, alpha=0.75, dash_len=6, gap_len=5)
            draw_circle(img, vpx, vpy, radius=4.5, fill_color=(255, 120, 220), stroke_color=(0, 0, 0), stroke_width=1.5)

        dx_b, dy_b = lm["badge_offset"]
        if is_rotated_ref3:
            dx_b = int(dx_b * 0.85)
            dy_b = int(dy_b * 0.85)

        line1 = f"{lm['id']} {lm['name']}"
        line2 = f"({int(cx_m):+d}m, {int(cz_m):+d}m) [{int(w_m)}x{int(l_m)}m]"
        callout_items.append({
            "kind": "landmark",
            "px": px,
            "py": py,
            "lines": [line1, line2],
            "dx": dx_b,
            "dy": dy_b,
            "text_colors": [(255, 240, 150), (165, 245, 255)],
            "bg_color": (12, 18, 30),
            "border_color": (255, 195, 45),
            "pin_fill": (255, 185, 20),
            "pin_stroke": (10, 15, 25),
            "pin_radius": 7.5,
            "leader_color": (255, 205, 60),
        })

    for vt in PENINSULA_VERTICES:
        vx_m, vz_m = vt["x_m"], vt["z_m"]
        px, py = apply_affine(M_3x3, vx_m, vz_m)
        dx_b, dy_b = vt["badge_offset"]
        line1 = f"{vt['id']}: {vt['name']}"
        line2 = f"({int(vx_m):+d}m, {int(vz_m):+d}m)"
        callout_items.append({
            "kind": "vertex",
            "px": px,
            "py": py,
            "lines": [line1, line2],
            "dx": dx_b,
            "dy": dy_b,
            "text_colors": [(120, 255, 155), (235, 255, 240)],
            "bg_color": (8, 28, 18),
            "border_color": (55, 255, 120),
            "pin_fill": (45, 255, 115),
            "pin_stroke": (0, 25, 10),
            "pin_radius": 9.0,
            "leader_color": (65, 255, 125),
        })

    # Compute exact box dimensions for each badge and iteratively resolve overlaps
    scale_b = 2
    pad_x_b, pad_y_b, gap_b = 6, 4, 3
    line_h_b = 7 * scale_b
    for item in callout_items:
        widths = [measure_text(line, scale=scale_b)[0] for line in item["lines"]]
        bw = max(widths) + 2 * pad_x_b
        bh = len(item["lines"]) * line_h_b + (len(item["lines"]) - 1) * gap_b + 2 * pad_y_b
        item["bw"] = bw
        item["bh"] = bh
        item["bx"] = float(max(12, min(w - bw - 12, item["px"] + item["dx"])))
        item["by"] = float(max(62, min(h - bh - 36, item["py"] + item["dy"])))

    # Iterative relaxation to eliminate any badge-to-badge or badge-to-pin overlap
    margin = 6.0
    for _ in range(120):
        moved = False
        # Avoid covering pins directly
        for item in callout_items:
            ax0, ay0, ax1, ay1 = item["bx"], item["by"], item["bx"] + item["bw"], item["by"] + item["bh"]
            for other in callout_items:
                px_o, py_o = other["px"], other["py"]
                if (ax0 - 8 <= px_o <= ax1 + 8) and (ay0 - 8 <= py_o <= ay1 + 8):
                    cx_a = 0.5 * (ax0 + ax1)
                    cy_a = 0.5 * (ay0 + ay1)
                    vy = -1.0 if cy_a <= py_o else 1.0
                    item["by"] += vy * 4.0
                    moved = True

        for i in range(len(callout_items)):
            for j in range(i + 1, len(callout_items)):
                a = callout_items[i]
                b = callout_items[j]
                ox_ov = min(a["bx"] + a["bw"] + margin, b["bx"] + b["bw"] + margin) - max(a["bx"], b["bx"])
                oy_ov = min(a["by"] + a["bh"] + margin, b["by"] + b["bh"] + margin) - max(a["by"], b["by"])
                if ox_ov > 0 and oy_ov > 0:
                    moved = True
                    ca_x = a["bx"] + 0.5 * a["bw"]
                    ca_y = a["by"] + 0.5 * a["bh"]
                    cb_x = b["bx"] + 0.5 * b["bw"]
                    cb_y = b["by"] + 0.5 * b["bh"]
                    if oy_ov <= ox_ov * 1.35:
                        step = 0.55 * oy_ov
                        if ca_y <= cb_y:
                            a["by"] -= step
                            b["by"] += step
                        else:
                            a["by"] += step
                            b["by"] -= step
                    else:
                        step = 0.55 * ox_ov
                        if ca_x <= cb_x:
                            a["bx"] -= step
                            b["bx"] += step
                        else:
                            a["bx"] += step
                            b["bx"] -= step

        for item in callout_items:
            item["bx"] = float(max(12, min(w - item["bw"] - 12, item["bx"])))
            item["by"] = float(max(62, min(h - item["bh"] - 36, item["by"])))
        if not moved:
            break

    # First draw leader lines, then pins, then badges on top so zero lines cross over text
    for item in callout_items:
        px, py = item["px"], item["py"]
        bx, by, bw, bh = int(item["bx"]), int(item["by"]), item["bw"], item["bh"]
        conn_x = max(bx, min(bx + bw, int(px)))
        conn_y = max(by, min(by + bh, int(py)))
        draw_line(img, px, py, conn_x, conn_y, (0, 0, 0), thickness=3.4, alpha=0.68)
        draw_line(img, px, py, conn_x, conn_y, item["leader_color"], thickness=1.9, alpha=0.95)

    for item in callout_items:
        draw_circle(
            img,
            item["px"],
            item["py"],
            radius=item["pin_radius"],
            fill_color=item["pin_fill"],
            fill_alpha=1.0,
            stroke_color=item["pin_stroke"],
            stroke_width=2.6,
        )

    for item in callout_items:
        draw_multiline_badge(
            img,
            item["lines"],
            int(item["bx"]),
            int(item["by"]),
            text_colors=item["text_colors"],
            bg_color=item["bg_color"],
            border_color=item["border_color"],
            scale=scale_b,
            pad_x=pad_x_b,
            pad_y=pad_y_b,
            line_gap=gap_b,
            bg_alpha=0.90,
        )

    # ------------------------------------------------------------------
    # H. Top Title & Geodesic Calibration Legend Banner
    # ------------------------------------------------------------------
    blend_rect(img, 0, 0, w, 48, (8, 14, 24), 0.92)
    draw_rect_border(img, 0, 0, w, 48, (0, 240, 255), thickness=2, alpha=0.95)
    draw_text(img, title, 16, 8, color=(255, 235, 120), scale=2)
    draw_text(img, subtitle, 16, 27, color=(180, 245, 255), scale=2)


# ==============================================================================
# 5. MAIN EXECUTION PIPELINE
# ==============================================================================
def main():
    PUBLIC_MAPS_DIR.mkdir(parents=True, exist_ok=True)
    CARTOGRAPHY_DIR.mkdir(parents=True, exist_ok=True)

    map_configs = [
        {
            "key": "ref1",
            "name": "Reference 1: Grant Associates Architectural Masterplan (North Up)",
            "src_candidates": [
                PUBLIC_MAPS_DIR / "raw_ref_1_masterplan.jpg",
                PARENT_BRAIN_DIR / ".user_uploaded" / "media_1792821959440_b5e0eead.jpg",
            ],
            "native_w": 750,
            "native_h": 658,
            "out_w": 2250,
            "out_h": 1974,
            "upscale": 3.0,
            "rotation_deg": 0.0,
            "is_rotated_ref3": False,
            "out_filename": "ref_grid_1_masterplan_north_up.png",
            "title": "STAGE 1A CALIBRATION GRID - REF 1: GRANT ASSOCIATES ARCHITECTURAL MASTERPLAN (TRUE NORTH UP 0°)",
            "subtitle": "Origin (0m,0m) = Supertree Grove | Major Grid: 100m (Cyan X / Gold Z) | Minor: 50m | Green: V1-V7 Perimeter | Gold: L01-L20 Footprints",
        },
        {
            "key": "ref2",
            "name": "Reference 2: Official Illustrated Visitor Map (GB-Map-15-02-2026.jpg, North Up)",
            "src_candidates": [
                WORKSPACE_DIR / "docs" / "references" / "GB-Map-15-02-2026.jpg",
                WORKSPACE_DIR / "GB-Map-15-02-2026.jpg",
                PUBLIC_MAPS_DIR / "raw_ref_2_visitor_map.jpg",
            ],
            "native_w": 2599,
            "native_h": 1772,
            "out_w": 2599,
            "out_h": 1772,
            "upscale": 1.0,
            "rotation_deg": 0.0,
            "is_rotated_ref3": False,
            "out_filename": "ref_grid_2_official_visitor_map_north_up.png",
            "title": "STAGE 1A CALIBRATION GRID - REF 2: OFFICIAL VISITOR MAP GB-Map-15-02-2026 (TRUE NORTH UP 0°)",
            "subtitle": "Origin (0m,0m) = Supertree Grove | Least-Squares Geodesic Affine Fit | Major Grid: 100m | Minor: 50m | V1-V7 & L01-L20 Annotated",
        },
        {
            "key": "ref3",
            "name": "Reference 3: Official Pedestrian & Cyclist Route Map (Rotated -58° CCW)",
            "src_candidates": [
                PUBLIC_MAPS_DIR / "raw_ref_3_route_map.jpg",
                PARENT_BRAIN_DIR / ".user_uploaded" / "media_1792821959445_e6588f2c.jpg",
            ],
            "native_w": 1024,
            "native_h": 1024,
            "out_w": 2048,
            "out_h": 2048,
            "upscale": 2.0,
            "rotation_deg": -58.0,
            "is_rotated_ref3": True,
            "out_filename": "ref_grid_3_route_map_rotated.png",
            "title": "STAGE 1A CALIBRATION GRID - REF 3: OFFICIAL ROUTE MAP (ROTATED -58° CCW GEODESIC + ORTHOGONAL U/V FRAME)",
            "subtitle": "Cyan/Gold: True-North (X_m, Z_m) Geodesic Grid (-58° CCW) | Purple Border Ticks: Local Orthogonal (U_m, V_m) Meter Grid",
        },
    ]

    anchors_m = np.array([[a[1], a[2]] for a in ANCHOR_SPECS], dtype=np.float64)
    pct_index = {"ref1": 3, "ref2": 4, "ref3": 5}

    calibration_export = {
        "coordinate_system": {
            "name": "GBB_Bay_South_Canonical_Meters_XZ",
            "origin_name": "Supertree Grove Central Plaza",
            "origin_gps": "1°16'54.8\"N, 103°51'50.2\"E",
            "origin_meters": [0.0, 0.0],
            "axes": {
                "+X_m": "East (towards Cloud Forest +160m, Kingfisher Wetlands +355m, Marina Barrage +565m)",
                "-X_m": "West (towards Dragonfly Bridge -110m, The Meadow -175m, Floral Fantasy -200m, SW Corner -395m)",
                "-Z_m": "True North (towards Flower Dome -210m, Silver Garden -245m, NW Waterfront Tip -330m)",
                "+Z_m": "True South (towards Main Entrance +125m, The Meadow +235m, Southernmost Tip +535m)",
            },
            "bounds_meters": {
                "x_min": -450.0,
                "x_max": 650.0,
                "width_m": 1100.0,
                "z_min": -380.0,
                "z_max": 570.0,
                "height_m": 950.0,
            },
            "stage2_3d_scale": {
                "SCALE_XZ": 0.20,
                "meters_per_3d_unit": 5.0,
                "formula": "worldX = X_m * 0.20, worldZ = Z_m * 0.20",
            },
        },
        "maps": {},
        "peninsula_vertices": PENINSULA_VERTICES,
        "ne_waterfront_curve_m": NE_WATERFRONT_CURVE_M,
        "landmarks": LANDMARKS,
    }

    for cfg in map_configs:
        key = cfg["key"]
        src_path = next((p for p in cfg["src_candidates"] if p.exists()), None)
        if src_path is None:
            raise FileNotFoundError(f"Could not find source image for {key}")

        print(f"[Stage 1A] Loading {cfg['name']} from {src_path} -> ({cfg['out_w']}x{cfg['out_h']})...")
        img = load_image_via_sips(src_path, target_w=cfg["out_w"], target_h=cfg["out_h"])

        p_idx = pct_index[key]
        anchors_pct = np.array([a[p_idx] for a in ANCHOR_SPECS], dtype=np.float64)
        anchors_out_px = anchors_pct * np.array([cfg["out_w"] / 100.0, cfg["out_h"] / 100.0])
        anchors_native_px = anchors_pct * np.array([cfg["native_w"] / 100.0, cfg["native_h"] / 100.0])

        M_3x3, M_inv_3x3, pred_px, res_px, res_m = fit_affine_transform(anchors_m, anchors_out_px)
        M_nat_3x3, M_nat_inv_3x3, _, _, _ = fit_affine_transform(anchors_m, anchors_native_px)
        M_pct_3x3, M_pct_inv_3x3, _, _, _ = fit_affine_transform(anchors_m, anchors_pct)

        render_reference_grid(
            img=img,
            M_3x3=M_3x3,
            map_key=key,
            title=cfg["title"],
            subtitle=cfg["subtitle"],
            is_rotated_ref3=cfg["is_rotated_ref3"],
        )

        out_public = PUBLIC_MAPS_DIR / cfg["out_filename"]
        save_png(out_public, img)
        print(f"  -> Saved {out_public} (mean residual: {res_m.mean():.2f}m)")

        # Save to self brain directory and attempt parent brain directory
        for brain_dir in (SELF_BRAIN_DIR, PARENT_BRAIN_DIR):
            try:
                if brain_dir.exists():
                    save_png(brain_dir / cfg["out_filename"], img)
                    print(f"  -> Copied to {brain_dir / cfg['out_filename']}")
            except PermissionError:
                print(f"  -> Skipped direct write to {brain_dir / cfg['out_filename']} (sandbox isolated; parent can copy from public/maps)")

        anchor_report = []
        for idx, a in enumerate(ANCHOR_SPECS):
            anchor_report.append(
                {
                    "name": a[0],
                    "x_m": a[1],
                    "z_m": a[2],
                    "actual_pct": a[p_idx],
                    "actual_px": [round(float(anchors_out_px[idx, 0]), 2), round(float(anchors_out_px[idx, 1]), 2)],
                    "predicted_px": [round(float(pred_px[idx, 0]), 2), round(float(pred_px[idx, 1]), 2)],
                    "residual_px": round(float(res_px[idx]), 2),
                    "residual_m": round(float(res_m[idx]), 2),
                }
            )

        calibration_export["maps"][key] = {
            "name": cfg["name"],
            "output_image_path": str(out_public),
            "width": cfg["out_w"],
            "height": cfg["out_h"],
            "native_width": cfg["native_w"],
            "native_height": cfg["native_h"],
            "upscale_factor": cfg["upscale"],
            "nominal_rotation_deg": cfg["rotation_deg"],
            "meter_to_pixel": M_3x3.round(8).tolist(),
            "pixel_to_meter": M_inv_3x3.round(8).tolist(),
            "meter_to_native_pixel": M_nat_3x3.round(8).tolist(),
            "native_pixel_to_meter": M_nat_inv_3x3.round(8).tolist(),
            "meter_to_percent": M_pct_3x3.round(8).tolist(),
            "percent_to_meter": M_pct_inv_3x3.round(8).tolist(),
            "rms_residual_px": round(float(np.sqrt(np.mean(res_px**2))), 2),
            "mean_residual_m": round(float(res_m.mean()), 2),
            "max_residual_m": round(float(res_m.max()), 2),
            "anchors": anchor_report,
        }

    calib_json_path = CARTOGRAPHY_DIR / "calibration_transforms.json"
    calib_json_path.write_text(json.dumps(calibration_export, indent=2))
    print(f"[Stage 1A] Exported affine calibration matrices to {calib_json_path}")


if __name__ == "__main__":
    main()
