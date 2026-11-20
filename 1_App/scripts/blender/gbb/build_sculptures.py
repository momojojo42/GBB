# ============================================================================
# Gardens by the Bay — Headless Blender 4.2 Sculptures & Bridges Builder
# (scripts/blender/build_sculptures.py -> public/models/sculptures_bridges.glb)
# Builds 7 Root Landmarks at (0, 0, 0):
#   1. Planet_Floating_Baby (Marc Quinn's Colossal Supine Floating Infant via Metaballs)
#   2. Dragonfly_Bridge
#   3. Heritage_Moon_Gate
#   4. Floral_Clock
#   5. SG50_Celebration_Lattice
#   6. FEO_Children_Splash_Pad
#   7. Serene_Japanese_Pavilion
# ============================================================================

import bpy
import bmesh
import math
import os
from mathutils import Vector, Euler

# Reset scene cleanly
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip('#')
    r = int(h[0:2], 16) / 255.0
    g = int(h[2:4], 16) / 255.0
    b = int(h[4:6], 16) / 255.0
    # sRGB to Linear approximation for Blender Principled BSDF
    return (r ** 2.2, g ** 2.2, b ** 2.2, alpha)


def make_mat(name, hex_color, roughness=0.45, metallic=0.0, emission_hex=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color, alpha)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if alpha < 1.0:
            bsdf.inputs["Alpha"].default_value = alpha
            mat.blend_method = 'BLEND'
        if emission_hex and emission_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emission_hex, 1.0)
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def parent_and_mat(obj, parent, mat, smooth=True):
    if obj.data and hasattr(obj.data, "materials"):
        if len(obj.data.materials) == 0:
            obj.data.materials.append(mat)
        else:
            obj.data.materials[0] = mat
    if smooth and obj.type == 'MESH':
        for poly in obj.data.polygons:
            poly.use_smooth = True
    obj.parent = parent
    return obj


def add_subsurf(obj, levels=2):
    mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
    mod.levels = levels
    mod.render_levels = levels
    return mod


# Shared Materials
mat_white_bronze = make_mat("Planet_White_Bronze", "#F8FAFC", roughness=0.22, metallic=0.08)
mat_bronze_plinth = make_mat("Planet_Anchor_Bronze", "#475569", roughness=0.35, metallic=0.75)
mat_grass_mound = make_mat("Lawn_Emerald_Turf", "#16A34A", roughness=0.82)
mat_granite_curb = make_mat("Granite_Curb", "#CBD5E1", roughness=0.6)
mat_shrub_green = make_mat("Shrub_Green", "#15803D", roughness=0.75)
mat_coral_steel = make_mat("Dragonfly_Coral_Steel", "#F97316", roughness=0.32, metallic=0.65)
mat_cedar_deck = make_mat("Cedar_Timber_Deck", "#B45309", roughness=0.68)
mat_hinoki_wood = make_mat("Hinoki_Warm_Wood", "#D97706", roughness=0.58)
mat_crimson_lacquer = make_mat("Crimson_Lacquer", "#DC2626", roughness=0.28, metallic=0.15)
mat_slate_roof = make_mat("Dark_Slate_Roof", "#1E293B", roughness=0.48, metallic=0.2)
mat_gold_filigree = make_mat("Brushed_Gold", "#FBBF24", roughness=0.24, metallic=0.88)
mat_glow_amber = make_mat("Amber_Lantern_Glow", "#FEF08A", roughness=0.15, emission_hex="#FACC15", emission_strength=2.5)
mat_glow_cyan = make_mat("Aqua_Water_Jet", "#67E8F9", roughness=0.1, emission_hex="#22D3EE", emission_strength=1.4, alpha=0.75)
mat_sandstone = make_mat("Sandstone_Plaza", "#F1F5F9", roughness=0.65)
mat_bamboo = make_mat("Golden_Bamboo", "#65A30D", roughness=0.5)

# ============================================================================
# 1. Planet_Floating_Baby (Marc Quinn's Colossal Supine Floating Baby Sculpture)
# ============================================================================
root_planet = bpy.data.objects.new("Planet_Floating_Baby", None)
scene.collection.objects.link(root_planet)
root_planet.location = (0, 0, 0)

# Elliptical manicured lawn mound & granite curb
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=5.6, depth=0.36, location=(0, 0, 0.18))
curb = bpy.context.active_object
curb.name = "Planet_Granite_Curb"
curb.scale = (1.15, 0.78, 1.0)
parent_and_mat(curb, root_planet, mat_granite_curb)

bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=5.3, location=(0, 0, 0.15))
mound = bpy.context.active_object
mound.name = "Planet_Grass_Mound"
mound.scale = (1.14, 0.76, 0.09)
parent_and_mat(mound, root_planet, mat_grass_mound)

# Organic Metaball Sculpt of the Colossal Supine Baby (lying horizontally face-up on its back)
mball_data = bpy.data.metaballs.new("Planet_Baby_Mball")
mball_data.resolution = 0.11
mball_data.render_resolution = 0.09
mball_obj = bpy.data.objects.new("Planet_Baby_Sculpt", mball_data)
scene.collection.objects.link(mball_obj)


def add_meta_capsule(x1, y1, z1, x2, y2, z2, r1, r2, steps=8):
    for i in range(steps + 1):
        t = i / float(steps)
        el = mball_data.elements.new(type='BALL')
        el.co = (
            x1 + (x2 - x1) * t,
            y1 + (y2 - y1) * t,
            z1 + (z2 - z1) * t
        )
        el.radius = r1 + (r2 - r1) * t
        el.stiffness = 2.2


# Head (Left side X = -3.35, resting horizontally face-up looking at sky +Z)
head_cranium = mball_data.elements.new(type='ELLIPSOID')
head_cranium.co = (-3.45, 0.0, 2.38)
head_cranium. radius = 1.05
head_cranium.size_x = 1.12
head_cranium.size_y = 0.96
head_cranium.size_z = 0.98

# Chubby baby cheeks & chin (facing +Z skyward)
for cy in (-0.42, 0.42):
    cheek = mball_data.elements.new(type='BALL')
    cheek.co = (-3.15, cy, 2.52)
    cheek.radius = 0.52
chin = mball_data.elements.new(type='BALL')
chin.co = (-2.78, 0.0, 2.55)
chin.radius = 0.42
nose = mball_data.elements.new(type='BALL')
nose.co = (-3.22, 0.0, 3.12)
nose.radius = 0.24

# Neck, Shoulders, Chest, Plump Baby Belly & Pelvis (Supine along X = -2.4 to +1.35)
add_meta_capsule(-2.55, 0.0, 2.18, -1.75, 0.0, 2.12, 0.56, 0.88, steps=5)
chest = mball_data.elements.new(type='ELLIPSOID')
chest.co = (-1.35, 0.0, 2.15)
chest.radius = 0.98
chest.size_x = 1.15
chest.size_y = 1.08
chest.size_z = 0.85

belly = mball_data.elements.new(type='ELLIPSOID')
belly.co = (-0.15, 0.0, 2.22)
belly.radius = 1.12
belly.size_x = 1.22
belly.size_y = 1.06
belly.size_z = 0.94

pelvis = mball_data.elements.new(type='ELLIPSOID')
pelvis.co = (1.18, 0.0, 2.05)
pelvis.radius = 0.96
pelvis.size_x = 1.05
pelvis.size_y = 1.04
pelvis.size_z = 0.84

# Right Arm & Hand: Extended straight down to the ground plinth at (X=-1.15, Y=-1.18, Z=0.42) — THE SOLE SUPPORT POINT!
add_meta_capsule(-1.45, -0.82, 2.05, -1.25, -1.12, 1.22, 0.42, 0.35, steps=7)
add_meta_capsule(-1.25, -1.12, 1.22, -1.15, -1.18, 0.48, 0.35, 0.30, steps=7)
r_hand = mball_data.elements.new(type='ELLIPSOID')
r_hand.co = (-1.15, -1.18, 0.42)
r_hand.radius = 0.38
r_hand.size_x = 1.15
r_hand.size_y = 1.15
r_hand.size_z = 0.55

# Left Arm: Bent peacefully over the baby's upper chest/tummy
add_meta_capsule(-1.45, 0.85, 2.12, -1.05, 1.08, 2.45, 0.42, 0.35, steps=6)
add_meta_capsule(-1.05, 1.08, 2.45, -0.55, 0.42, 2.82, 0.35, 0.31, steps=6)

# Left Leg: Bent playfully upward at the knee in mid-air
add_meta_capsule(1.35, 0.55, 2.08, 2.55, 0.72, 2.95, 0.54, 0.44, steps=8)
add_meta_capsule(2.55, 0.72, 2.95, 3.65, 0.52, 2.35, 0.44, 0.34, steps=8)
l_foot = mball_data.elements.new(type='ELLIPSOID')
l_foot.co = (3.85, 0.52, 2.52)
l_foot.radius = 0.38
l_foot.size_x = 0.75
l_foot.size_y = 0.62
l_foot.size_z = 1.25

# Right Leg: Extended and gently bent floating horizontally in mid-air
add_meta_capsule(1.35, -0.55, 2.02, 2.75, -0.68, 2.55, 0.54, 0.44, steps=8)
add_meta_capsule(2.75, -0.68, 2.55, 3.95, -0.45, 2.05, 0.44, 0.34, steps=8)
r_foot = mball_data.elements.new(type='ELLIPSOID')
r_foot.co = (4.18, -0.45, 2.22)
r_foot.radius = 0.38
r_foot.size_x = 0.75
r_foot.size_y = 0.62
r_foot.size_z = 1.25

# Convert Metaball to smooth mesh
bpy.context.view_layer.objects.active = mball_obj
mball_obj.select_set(True)
bpy.ops.object.convert(target='MESH')
baby_mesh = bpy.context.active_object
baby_mesh.name = "Planet_Baby_Mesh"
parent_and_mat(baby_mesh, root_planet, mat_white_bronze, smooth=True)

# Bronze Anchor Plate directly under the baby's right hand at (-1.15, -1.18, 0.35)
bpy.ops.mesh.primitive_cylinder_add(vertices=32, radius=0.58, depth=0.18, location=(-1.15, -1.18, 0.34))
anchor_plate = bpy.context.active_object
anchor_plate.name = "Planet_RightHand_Anchor_Plinth"
parent_and_mat(anchor_plate, root_planet, mat_bronze_plinth)

# Low manicured shrubs around lawn border
for sx, sy, sr in [(-4.4, -2.2, 0.65), (-3.8, 2.5, 0.55), (3.9, -2.3, 0.6), (4.2, 2.1, 0.58)]:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=sr, location=(sx, sy, 0.45))
    sh = bpy.context.active_object
    sh.scale = (1.2, 1.0, 0.68)
    parent_and_mat(sh, root_planet, mat_shrub_green)


# ============================================================================
# 2. Dragonfly_Bridge (Sinuous Pedestrian Timber & Coral-Orange Arch Bridge)
# ============================================================================
root_bridge = bpy.data.objects.new("Dragonfly_Bridge", None)
scene.collection.objects.link(root_bridge)
root_bridge.location = (0, 0, 0)

# Sinuous Bridge Deck & Twin Rails (spanning X = -6.5 to +6.5, matching 13.0m Dragonfly Lake span)
bridge_segs = 32
for i in range(bridge_segs):
    t = i / float(bridge_segs - 1)
    x = -6.5 + t * 13.0
    y = math.sin(t * math.pi * 2.0) * 0.42
    z = 0.08 + math.sin(t * math.pi) * 1.22
    yaw = math.atan2(math.cos(t * math.pi * 2.0) * 0.42 * (math.pi * 2.0 / 13.0), 1.0)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(x, y, z))
    plank = bpy.context.active_object
    plank.scale = (0.48, 2.8, 0.14)
    plank.rotation_euler = (0, 0, yaw)
    parent_and_mat(plank, root_bridge, mat_cedar_deck)

    # Coral-orange side arch ribs & glowing amber bollards every 4th segment
    if i % 4 == 0 and 2 <= i <= bridge_segs - 3:
        for side in (-1.34, 1.34):
            bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.08, depth=1.15, location=(x, y + side, z + 0.58))
            post = bpy.context.active_object
            parent_and_mat(post, root_bridge, mat_coral_steel)

            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.13, location=(x, y + side, z + 1.22))
            bollard = bpy.context.active_object
            parent_and_mat(bollard, root_bridge, mat_glow_amber)

        # Overhead Coral-Orange Dragonfly Rib Arch
        bpy.ops.mesh.primitive_torus_add(
            major_radius=1.52,
            minor_radius=0.08,
            major_segments=24,
            minor_segments=10,
            location=(x, y, z + 1.15),
            rotation=(0, math.pi / 2.0, yaw)
        )
        arch = bpy.context.active_object
        arch.scale = (1.35, 1.0, 1.0)
        parent_and_mat(arch, root_bridge, mat_coral_steel)


# ============================================================================
# 3. Heritage_Moon_Gate (Circular Crimson-Lacquered Chinese Moon Gate & Bamboo)
# ============================================================================
root_moongate = bpy.data.objects.new("Heritage_Moon_Gate", None)
scene.collection.objects.link(root_moongate)
root_moongate.location = (0, 0, 0)

bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=4.2, depth=0.28, location=(0, 0, 0.14))
mg_base = bpy.context.active_object
parent_and_mat(mg_base, root_moongate, mat_sandstone)

# Circular Moon Gate Torus Arch
bpy.ops.mesh.primitive_torus_add(
    major_radius=2.35,
    minor_radius=0.34,
    major_segments=48,
    minor_segments=18,
    location=(0, 0, 2.48),
    rotation=(math.pi / 2.0, 0, 0)
)
mg_ring = bpy.context.active_object
parent_and_mat(mg_ring, root_moongate, mat_crimson_lacquer)

# Inner gold trim ring
bpy.ops.mesh.primitive_torus_add(
    major_radius=2.02,
    minor_radius=0.07,
    major_segments=48,
    minor_segments=12,
    location=(0, 0, 2.48),
    rotation=(math.pi / 2.0, 0, 0)
)
mg_gold = bpy.context.active_object
parent_and_mat(mg_gold, root_moongate, mat_gold_filigree)

# Flanking stone lanterns & bamboo clusters
for side in (-1, 1):
    lx = side * 3.1
    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.28, depth=1.4, location=(lx, 0.6, 0.85))
    l_post = bpy.context.active_object
    parent_and_mat(l_post, root_moongate, mat_granite_curb)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.25, location=(lx, 0.6, 1.65))
    l_glow = bpy.context.active_object
    parent_and_mat(l_glow, root_moongate, mat_glow_amber)

    bpy.ops.mesh.primitive_cone_add(vertices=6, radius1=0.58, radius2=0.05, depth=0.45, location=(lx, 0.6, 2.02))
    l_roof = bpy.context.active_object
    parent_and_mat(l_roof, root_moongate, mat_slate_roof)

    for b in range(4):
        bx = side * (2.65 + b * 0.24)
        by = -0.5 + (b % 2) * 0.35
        bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.07, depth=3.6 + b * 0.3, location=(bx, by, 1.9))
        stalk = bpy.context.active_object
        parent_and_mat(stalk, root_moongate, mat_bamboo)


# ============================================================================
# 4. Floral_Clock (Audemars Piguet Botanical Floral Clock Bed & Gold Hands)
# ============================================================================
root_clock = bpy.data.objects.new("Floral_Clock", None)
scene.collection.objects.link(root_clock)
root_clock.location = (0, 0, 0)

bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=4.8, depth=0.38, location=(0, 0, 0.19))
clk_rim = bpy.context.active_object
parent_and_mat(clk_rim, root_clock, mat_sandstone)

ring_specs = [
    (4.35, 0.42, "#15803D"),
    (3.45, 0.48, "#DC2626"),
    (2.45, 0.54, "#F59E0B"),
    (1.45, 0.60, "#7C3AED")
]
for rad, z_h, col in ring_specs:
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=rad, depth=0.22, location=(0, 0, z_h))
    bed = bpy.context.active_object
    parent_and_mat(bed, root_clock, make_mat(f"ClockBed_{col}", col, roughness=0.72))

# 12 Golden Hour Markers
for h in range(12):
    ang = (h / 12.0) * math.pi * 2.0
    hx = math.cos(ang) * 3.85
    hy = math.sin(ang) * 3.85
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=0.24, location=(hx, hy, 0.65))
    marker = bpy.context.active_object
    parent_and_mat(marker, root_clock, mat_gold_filigree)

# Central Gear Hub + Hour & Minute Hands
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.45, depth=0.35, location=(0, 0, 0.78))
hub = bpy.context.active_object
parent_and_mat(hub, root_clock, mat_gold_filigree)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0.95, 0.55, 0.88))
hour_hand = bpy.context.active_object
hour_hand.scale = (2.2, 0.22, 0.08)
hour_hand.rotation_euler = (0, 0, 0.52)
parent_and_mat(hour_hand, root_clock, mat_gold_filigree)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.85, 1.35, 0.94))
min_hand = bpy.context.active_object
min_hand.scale = (3.3, 0.16, 0.08)
min_hand.rotation_euler = (0, 0, 2.15)
parent_and_mat(min_hand, root_clock, mat_gold_filigree)


# ============================================================================
# 5. SG50_Celebration_Lattice (Crimson Geodesic Wireframe Dome Pavilion)
# ============================================================================
root_sg50 = bpy.data.objects.new("SG50_Celebration_Lattice", None)
scene.collection.objects.link(root_sg50)
root_sg50.location = (0, 0, 0)

bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=4.1, depth=0.26, location=(0, 0, 0.13))
sg_plaza = bpy.context.active_object
parent_and_mat(sg_plaza, root_sg50, mat_sandstone)

bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=3.6, location=(0, 0, 0.2))
sg_dome = bpy.context.active_object
# Remove bottom half faces below z=-0.05 and carve open doorway at localThreeAngle = -0.278 rad
bm_sg = bmesh.new()
bm_sg.from_mesh(sg_dome.data)
faces_to_remove = []
for f in bm_sg.faces:
    center = f.calc_center_median()
    if center.z < -0.05:
        faces_to_remove.append(f)
    elif center.z < 2.4:
        three_ang = math.atan2(-center.y, center.x)
        diff = math.atan2(math.sin(three_ang - (-0.278)), math.cos(three_ang - (-0.278)))
        if abs(diff) < 0.48:
            faces_to_remove.append(f)
bmesh.ops.delete(bm_sg, geom=faces_to_remove, context='FACES')
bm_sg.to_mesh(sg_dome.data)
bm_sg.free()

wf = sg_dome.modifiers.new(name="Wireframe", type='WIREFRAME')
wf.thickness = 0.16
wf.use_replace = True
parent_and_mat(sg_dome, root_sg50, mat_crimson_lacquer)

# Central Golden SG50 Emblem Core (raised to rooftop crown finial at z=3.65 so center floor is 100% open)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.48, location=(0, 0, 3.65))
sg_core = bpy.context.active_object
sg_core.name = "SG50_Gold_Core"
parent_and_mat(sg_core, root_sg50, mat_gold_filigree)


# ============================================================================
# 6. FEO_Children_Splash_Pad (Far East Organization Children's Garden Water Play)
# ============================================================================
root_splash = bpy.data.objects.new("FEO_Children_Splash_Pad", None)
scene.collection.objects.link(root_splash)
root_splash.location = (0, 0, 0)

pad_rings = [
    (6.0, 0.12, "#06B6D4"),
    (4.6, 0.16, "#38BDF8"),
    (3.1, 0.20, "#FACC15"),
    (1.7, 0.24, "#F43F5E")
]
for rad, zh, col in pad_rings:
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=rad, depth=0.12, location=(0, 0, zh))
    pr = bpy.context.active_object
    parent_and_mat(pr, root_splash, make_mat(f"SplashPad_{col}", col, roughness=0.35))

# 3 Playful Rainbow Spray Hoops + Translucent Water Jets
hoop_colors = ["#F43F5E", "#F59E0B", "#10B981"]
for idx, hcol in enumerate(hoop_colors):
    ang = (idx / 3.0) * math.pi * 2.0
    hx = math.cos(ang) * 2.6
    hy = math.sin(ang) * 2.6
    bpy.ops.mesh.primitive_torus_add(
        major_radius=1.65,
        minor_radius=0.11,
        major_segments=32,
        minor_segments=12,
        location=(hx, hy, 1.35),
        rotation=(math.pi / 2.0, 0, ang)
    )
    hoop = bpy.context.active_object
    parent_and_mat(hoop, root_splash, make_mat(f"Hoop_{idx}", hcol, roughness=0.3, metallic=0.3))

    # Central vertical water jet cone
    bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.42, radius2=0.06, depth=2.6, location=(hx * 0.5, hy * 0.5, 1.45))
    jet = bpy.context.active_object
    parent_and_mat(jet, root_splash, mat_glow_cyan)


# ============================================================================
# 7. Serene_Japanese_Pavilion (Zen Tea Pavilion, Curved Slate Roof & Red Bridge)
# ============================================================================
root_serene = bpy.data.objects.new("Serene_Japanese_Pavilion", None)
scene.collection.objects.link(root_serene)
root_serene.location = (0, 0, 0)

# Zen Raked White Gravel Island Base
bpy.ops.mesh.primitive_cylinder_add(vertices=36, radius=4.2, depth=0.28, location=(0, 0, 0.14))
zen_base = bpy.context.active_object
zen_base.scale = (1.18, 0.95, 1.0)
parent_and_mat(zen_base, root_serene, mat_sandstone)

# Hinoki Timber Deck & 4 Corner Posts
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.42))
deck = bpy.context.active_object
deck.scale = (3.8, 3.2, 0.26)
parent_and_mat(deck, root_serene, mat_hinoki_wood)

for px in (-1.6, 1.6):
    for py in (-1.3, 1.3):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.13, depth=2.5, location=(px, py, 1.75))
        post = bpy.context.active_object
        parent_and_mat(post, root_serene, mat_hinoki_wood)

# Traditional Two-Tiered Curved Dark-Slate Hipped Roof + Golden Finial
bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=3.45, radius2=0.85, depth=1.15, location=(0, 0, 3.35), rotation=(0, 0, math.pi / 4.0))
roof_lower = bpy.context.active_object
roof_lower.scale = (1.15, 0.98, 1.0)
parent_and_mat(roof_lower, root_serene, mat_slate_roof)

bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=2.15, radius2=0.12, depth=0.95, location=(0, 0, 4.15), rotation=(0, 0, math.pi / 4.0))
roof_upper = bpy.context.active_object
roof_upper.scale = (1.12, 0.96, 1.0)
parent_and_mat(roof_upper, root_serene, mat_slate_roof)

bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.22, location=(0, 0, 4.72))
finial = bpy.context.active_object
parent_and_mat(finial, root_serene, mat_gold_filigree)

# Glowing Warm Paper Shoji Lantern Core Suspended Under Upper Roof Eaves (leaves floor z=0.3..2.2m wide open)
bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 2.55))
shoji = bpy.context.active_object
shoji.name = "Pavilion_Shoji_Core"
shoji.scale = (0.55, 0.55, 0.35)
parent_and_mat(shoji, root_serene, mat_glow_amber)

# Export all 7 Root Sculptures & Bridges to GLB
out_dir = "/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/models"
os.makedirs(out_dir, exist_ok=True)
out_path = os.path.join(out_dir, "sculptures_bridges.glb")

bpy.ops.export_scene.gltf(
    filepath=out_path,
    export_format='GLB',
    export_apply=True,
    export_yup=True
)
print("SUCCESSFULLY EXPORTED:", out_path, "Size:", os.path.getsize(out_path))
