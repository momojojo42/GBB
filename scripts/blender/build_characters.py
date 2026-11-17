"""
Headless Blender 4.2 Python Script — Gardens by the Bay 3D Treasure Hunt (v2.5)
Generates `public/models/chibi_explorers.glb` containing the 4 ultra-cute Chibi Safari
Pith-Helmet Explorers (`Explorer_YOU`, `Explorer_Kai`, `Explorer_Mei`, `Explorer_Raj`)
and 3 Phase-2 Gadget Props (`Gadget_TurboBoots`, `Gadget_RelicMagnet`, `Gadget_HoloDecoy`),
plus a close-up Blender Studio Turnaround Render (`blender_chibi_explorers_v2.png`).

Design Refinements (User Feedback):
1. Expressive Cute Chibi Eyes & Face:
   - Big glossy dark-espresso oval Chibi eyes (`Eye_L`, `Eye_R`) conformed to the
     smooth rosy-peach head sphere.
   - Dual glowing pure-white starry catchlights (`Catchlight_Big`, `Catchlight_Small`)
     on each eye for lively toy-like sparkle.
   - Soft arched eyebrows (`Brow_L`, `Brow_R`), plump strawberry-pink blush cheeks
     (`Blush_L`, `Blush_R`), tiny button nose (`Nose`), and cheerful smile (`Smile`).
   - Cute rounded Chibi ears (`Ear_L`, `Ear_R`) with rosy inner dimples.
2. Cozy Tilted-Back Safari Pith Helmet (-9 deg tilt):
   - Tilted slightly back so the wide cream brim frames the face without shadowing or
     clipping the big Chibi eyes.
   - Full 360-degree vibrant Team-Colored Hatband Ribbon, top crown button finial,
     and two-part Golden Explorer Headlamp (gold bezel + glowing warm lens).
3. Refined Cute Toy-Like Safari Outfit & Backpack:
   - Plump Team-Colored Neck Scarf (`Torus`) + cute front knotted scarf tails.
   - Rounded cream-khaki safari shirt with 2 golden chest buttons and a tan waist belt
     with a golden buckle.
   - Pillow-rounded Team-Colored Explorer Backpack with a mini canvas bedroll strapped
     on top, rounded outer pocket, and golden emblem badge.
   - Cute swinging Chibi Capsule Arms with plump round hands, and Khaki Capsule Legs
     with two-tone rounded hiking boots (cocoa uppers + cream-tan soles + gold buckle).
"""

import os
import math
import bpy
import bmesh
from mathutils import Vector, Matrix, Euler


# ---------------------------------------------------------------------------
# Color & Material Helpers
# ---------------------------------------------------------------------------

def srgb_to_linear(c: float) -> float:
    if c <= 0.04045:
        return c / 12.92
    return pow((c + 0.055) / 1.055, 2.4)


def hex_to_rgba(hex_str: str, alpha: float = 1.0):
    h = hex_str.lstrip("#")
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def make_material(
    name: str,
    hex_color: str,
    roughness: float = 0.5,
    metallic: float = 0.0,
    emission_hex: str = None,
    emission_strength: float = 0.0,
) -> bpy.types.Material:
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = 0.55
        if emission_hex and emission_strength > 0.0:
            if "Emission Color" in bsdf.inputs:
                bsdf.inputs["Emission Color"].default_value = hex_to_rgba(emission_hex)
            elif "Emission" in bsdf.inputs:
                bsdf.inputs["Emission"].default_value = hex_to_rgba(emission_hex)
            if "Emission Strength" in bsdf.inputs:
                bsdf.inputs["Emission Strength"].default_value = emission_strength
    return mat


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ---------------------------------------------------------------------------
# Pristine, Spike-Free High-Segment BMesh Primitives
# ---------------------------------------------------------------------------

def finalize_part(
    name: str,
    bm: bmesh.types.BMesh,
    material: bpy.types.Material,
    matrix: Matrix = None,
) -> bpy.types.Object:
    if matrix is not None:
        bmesh.ops.transform(bm, matrix=matrix, verts=bm.verts)

    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))

    mesh = bpy.data.meshes.new(f"{name}_Mesh")
    bm.to_mesh(mesh)
    bm.free()

    for poly in mesh.polygons:
        poly.use_smooth = True

    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    obj.data.materials.append(material)
    return obj


def make_sphere(
    name: str,
    radius: float,
    location: tuple,
    material: bpy.types.Material,
    scale_xyz: tuple = (1.0, 1.0, 1.0),
    rotation_euler: tuple = (0.0, 0.0, 0.0),
    u_seg: int = 44,
    v_seg: int = 28,
    hemisphere_dome: bool = False,
) -> bpy.types.Object:
    """Create a smooth UV sphere, ellipsoid, or pith-helmet dome."""
    bm = bmesh.new()
    if not hemisphere_dome:
        bmesh.ops.create_uvsphere(bm, u_segments=u_seg, v_segments=v_seg, radius=radius)
    else:
        max_phi = math.pi * 0.55
        rings = []
        top_vert = bm.verts.new((0.0, 0.0, radius))
        for iv in range(1, v_seg + 1):
            phi = (max_phi * iv) / v_seg
            sp, cp = math.sin(phi), math.cos(phi)
            ring = []
            for iu in range(u_seg):
                theta = (2.0 * math.pi * iu) / u_seg
                x = radius * sp * math.cos(theta)
                y = radius * sp * math.sin(theta)
                z = radius * cp
                ring.append(bm.verts.new((x, y, z)))
            rings.append(ring)
        first_ring = rings[0]
        for iu in range(u_seg):
            niu = (iu + 1) % u_seg
            bm.faces.new((top_vert, first_ring[iu], first_ring[niu]))
        for iv in range(len(rings) - 1):
            r0 = rings[iv]
            r1 = rings[iv + 1]
            for iu in range(u_seg):
                niu = (iu + 1) % u_seg
                bm.faces.new((r0[iu], r1[iu], r1[niu], r0[niu]))
        last_ring = rings[-1]
        bot_z = radius * math.cos(max_phi)
        bot_vert = bm.verts.new((0.0, 0.0, bot_z))
        for iu in range(u_seg):
            niu = (iu + 1) % u_seg
            bm.faces.new((bot_vert, last_ring[niu], last_ring[iu]))

    sx, sy, sz = scale_xyz
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz

    mat_rot = Euler(rotation_euler, "XYZ").to_matrix().to_4x4()
    mat_loc = Matrix.Translation(Vector(location))
    return finalize_part(name, bm, material, matrix=mat_loc @ mat_rot)


def make_smooth_cylinder(
    name: str,
    radius_top: float,
    radius_bottom: float,
    height: float,
    location: tuple,
    material: bpy.types.Material,
    segments: int = 48,
    rotation_euler: tuple = (0.0, 0.0, 0.0),
) -> bpy.types.Object:
    """Create a clean, spike-free high-segment cylinder with subtle chamfered rims."""
    bm = bmesh.new()
    half_h = height * 0.5
    chamfer = min(height * 0.14, min(radius_top, radius_bottom) * 0.07)

    profile = [
        (max(0.001, radius_bottom - chamfer), -half_h),
        (radius_bottom, -half_h + chamfer),
        (radius_top, half_h - chamfer),
        (max(0.001, radius_top - chamfer), half_h),
    ]

    rings = []
    for r, z in profile:
        ring = []
        for i in range(segments):
            theta = (2.0 * math.pi * i) / segments
            ring.append(bm.verts.new((r * math.cos(theta), r * math.sin(theta), z)))
        rings.append(ring)

    for ir in range(len(rings) - 1):
        r0 = rings[ir]
        r1 = rings[ir + 1]
        for i in range(segments):
            ni = (i + 1) % segments
            bm.faces.new((r0[i], r0[ni], r1[ni], r1[i]))

    bot_center = bm.verts.new((0.0, 0.0, -half_h))
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new((bot_center, rings[0][ni], rings[0][i]))

    top_center = bm.verts.new((0.0, 0.0, half_h))
    for i in range(segments):
        ni = (i + 1) % segments
        bm.faces.new((top_center, rings[-1][i], rings[-1][ni]))

    mat_rot = Euler(rotation_euler, "XYZ").to_matrix().to_4x4()
    mat_loc = Matrix.Translation(Vector(location))
    return finalize_part(name, bm, material, matrix=mat_loc @ mat_rot)


def make_capsule(
    name: str,
    radius: float,
    cyl_length: float,
    location: tuple,
    material: bpy.types.Material,
    rotation_euler: tuple = (0.0, 0.0, 0.0),
    u_seg: int = 36,
    v_seg: int = 20,
) -> bpy.types.Object:
    """Create a smooth capsule centered at `location`."""
    bm = bmesh.new()
    bmesh.ops.create_uvsphere(bm, u_segments=u_seg, v_segments=v_seg, radius=radius)
    half_len = cyl_length * 0.5
    for v in bm.verts:
        if v.co.z > 0.0001:
            v.co.z += half_len
        elif v.co.z < -0.0001:
            v.co.z -= half_len
    mat_rot = Euler(rotation_euler, "XYZ").to_matrix().to_4x4()
    mat_loc = Matrix.Translation(Vector(location))
    return finalize_part(name, bm, material, matrix=mat_loc @ mat_rot)


def make_torus(
    name: str,
    major_r: float,
    minor_r: float,
    location: tuple,
    material: bpy.types.Material,
    rotation_euler: tuple = (0.0, 0.0, 0.0),
    major_seg: int = 44,
    minor_seg: int = 22,
) -> bpy.types.Object:
    bm = bmesh.new()
    rings = []
    for i in range(major_seg):
        u = (2.0 * math.pi * i) / major_seg
        cu, su = math.cos(u), math.sin(u)
        ring = []
        for j in range(minor_seg):
            v = (2.0 * math.pi * j) / minor_seg
            cv, sv = math.cos(v), math.sin(v)
            x = (major_r + minor_r * cv) * cu
            y = (major_r + minor_r * cv) * su
            z = minor_r * sv
            ring.append(bm.verts.new((x, y, z)))
        rings.append(ring)
    for i in range(major_seg):
        ni = (i + 1) % major_seg
        for j in range(minor_seg):
            nj = (j + 1) % minor_seg
            bm.faces.new((rings[i][j], rings[ni][j], rings[ni][nj], rings[i][nj]))
    mat_rot = Euler(rotation_euler, "XYZ").to_matrix().to_4x4()
    mat_loc = Matrix.Translation(Vector(location))
    return finalize_part(name, bm, material, matrix=mat_loc @ mat_rot)


def make_rounded_box(
    name: str,
    size_xyz: tuple,
    location: tuple,
    material: bpy.types.Material,
    bevel_offset: float = 0.045,
    rotation_euler: tuple = (0.0, 0.0, 0.0),
) -> bpy.types.Object:
    """Create a clean, spike-free beveled box."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    sx, sy, sz = size_xyz
    for v in bm.verts:
        v.co.x *= sx
        v.co.y *= sy
        v.co.z *= sz
    safe_offset = min(bevel_offset, min(sx, sy, sz) * 0.18)
    bmesh.ops.bevel(
        bm,
        geom=list(bm.edges),
        offset=safe_offset,
        offset_type="OFFSET",
        segments=3,
        profile=0.5,
    )
    mat_rot = Euler(rotation_euler, "XYZ").to_matrix().to_4x4()
    mat_loc = Matrix.Translation(Vector(location))
    return finalize_part(name, bm, material, matrix=mat_loc @ mat_rot)


def join_parts_into_group_empty(
    group_name: str,
    pivot: tuple,
    parent_empty: bpy.types.Object,
    part_objects: list,
    mesh_prefix: str,
) -> bpy.types.Object:
    group_empty = bpy.data.objects.new(group_name, None)
    group_empty.empty_display_type = "PLAIN_AXES"
    group_empty.empty_display_size = 0.15
    group_empty.location = Vector(pivot)
    bpy.context.collection.objects.link(group_empty)
    group_empty.parent = parent_empty

    bpy.ops.object.select_all(action="DESELECT")
    for obj in part_objects:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = part_objects[0]
    if len(part_objects) > 1:
        bpy.ops.object.join()

    joined = bpy.context.view_layer.objects.active
    joined.name = f"{mesh_prefix}_{group_name}_Mesh"
    joined.data.name = f"{mesh_prefix}_{group_name}_Geom"

    world_mat = joined.matrix_world.copy()
    pivot_vec = Vector(pivot)
    shift_mat = Matrix.Translation(-pivot_vec) @ world_mat
    joined.data.transform(shift_mat)
    joined.data.update()

    joined.location = (0.0, 0.0, 0.0)
    joined.rotation_euler = (0.0, 0.0, 0.0)
    joined.scale = (1.0, 1.0, 0.0 + 1.0)
    joined.parent = group_empty

    return group_empty


# ---------------------------------------------------------------------------
# Refined v1.0-Style Cute Chibi Safari Explorer Builder (with Expressive Eyes!)
# ---------------------------------------------------------------------------
# Coordinate mapping:
# Blender +Z = Three.js +Y (up)
# Blender -Y = Three.js +Z (forward — face, eyes, headlamp, scarf knot)
# Blender +Y = Three.js -Z (back — backpack)

def build_explorer(
    root_name: str,
    team_hex: str,
    shared_mats: dict,
) -> bpy.types.Object:
    root_empty = bpy.data.objects.new(root_name, None)
    root_empty.empty_display_type = "PLAIN_AXES"
    root_empty.empty_display_size = 0.25
    root_empty.location = (0.0, 0.0, 0.0)
    bpy.context.collection.objects.link(root_empty)

    team_mat = make_material(
        f"{root_name}_Team",
        team_hex,
        roughness=0.32,
        metallic=0.0,
        emission_hex=team_hex,
        emission_strength=0.18,
    )

    # 1. Leg_L and Leg_R (pivot at X = ±0.26, Y = 0, Z = 0.72)
    for side, group_name in ((-1, "Leg_L"), (1, "Leg_R")):
        lx = side * 0.26
        pivot = (lx, 0.0, 0.72)
        leg_mesh = make_capsule(
            f"{root_name}_{group_name}_Capsule",
            radius=0.16,
            cyl_length=0.34,
            location=(lx, 0.0, 0.72 - 0.21),
            material=shared_mats["shorts"],
        )
        # Cute rounded hiking boot upper + cream-tan thick sole + golden lace buckle
        boot_upper = make_rounded_box(
            f"{root_name}_{group_name}_BootUpper",
            size_xyz=(0.35, 0.48, 0.24),
            location=(lx, -0.07, 0.72 - 0.49),
            material=shared_mats["boot"],
            bevel_offset=0.05,
        )
        boot_sole = make_rounded_box(
            f"{root_name}_{group_name}_BootSole",
            size_xyz=(0.38, 0.52, 0.09),
            location=(lx, -0.07, 0.72 - 0.62),
            material=shared_mats["sole"],
            bevel_offset=0.02,
        )
        boot_buckle = make_rounded_box(
            f"{root_name}_{group_name}_BootBuckle",
            size_xyz=(0.14, 0.06, 0.08),
            location=(lx, -0.31, 0.72 - 0.45),
            material=shared_mats["gold"],
            bevel_offset=0.01,
        )
        join_parts_into_group_empty(
            group_name,
            pivot,
            root_empty,
            [leg_mesh, boot_upper, boot_sole, boot_buckle],
            root_name,
        )

    # 2. Body_Group (pivot at (0, 0, 0): Safari Torso + Buttons + Belt + Plump Team Scarf + Backpack)
    body_parts = []

    torso_mesh = make_smooth_cylinder(
        f"{root_name}_Torso",
        radius_top=0.41,
        radius_bottom=0.47,
        height=0.84,
        location=(0.0, 0.0, 1.15),
        material=shared_mats["shirt"],
    )
    body_parts.append(torso_mesh)

    # Cute safari waist belt + golden buckle
    belt_mesh = make_smooth_cylinder(
        f"{root_name}_Belt",
        radius_top=0.465,
        radius_bottom=0.475,
        height=0.11,
        location=(0.0, 0.0, 0.84),
        material=shared_mats["boot"],
    )
    belt_buckle = make_rounded_box(
        f"{root_name}_BeltBuckle",
        size_xyz=(0.18, 0.06, 0.14),
        location=(0.0, -0.46, 0.84),
        material=shared_mats["gold"],
        bevel_offset=0.015,
    )
    body_parts.extend([belt_mesh, belt_buckle])

    # 2 cute golden safari shirt buttons on front chest
    for bz in (1.08, 1.25):
        btn = make_sphere(
            f"{root_name}_ShirtBtn_{bz:.2f}",
            radius=0.042,
            location=(0.0, -0.435, bz),
            material=shared_mats["gold"],
            scale_xyz=(1.0, 0.55, 1.0),
            u_seg=20,
            v_seg=14,
        )
        body_parts.append(btn)

    # Plump Team-Colored Neck Scarf Torus + Cute Front Scarf Knot & Tails
    scarf_mesh = make_torus(
        f"{root_name}_Scarf",
        major_r=0.39,
        minor_r=0.115,
        location=(0.0, 0.0, 1.49),
        material=team_mat,
    )
    scarf_knot = make_sphere(
        f"{root_name}_ScarfKnot",
        radius=0.115,
        location=(0.14, -0.39, 1.44),
        material=team_mat,
        scale_xyz=(1.0, 0.85, 0.95),
        u_seg=24,
        v_seg=16,
    )
    scarf_tail_1 = make_capsule(
        f"{root_name}_ScarfTail1",
        radius=0.068,
        cyl_length=0.16,
        location=(0.10, -0.43, 1.31),
        material=team_mat,
        rotation_euler=(0.18, 0.0, -0.15),
        u_seg=24,
        v_seg=14,
    )
    scarf_tail_2 = make_capsule(
        f"{root_name}_ScarfTail2",
        radius=0.062,
        cyl_length=0.13,
        location=(0.21, -0.41, 1.33),
        material=team_mat,
        rotation_euler=(0.16, 0.0, 0.25),
        u_seg=24,
        v_seg=14,
    )
    body_parts.extend([scarf_mesh, scarf_knot, scarf_tail_1, scarf_tail_2])

    # Clean, pillow-rounded Team-Colored Explorer Backpack (+Y = +0.38 -> -Z in Three.js)
    backpack_mesh = make_rounded_box(
        f"{root_name}_Backpack",
        size_xyz=(0.66, 0.40, 0.70),
        location=(0.0, 0.37, 1.15),
        material=team_mat,
        bevel_offset=0.065,
    )
    backpack_pocket = make_rounded_box(
        f"{root_name}_BackpackPocket",
        size_xyz=(0.46, 0.14, 0.34),
        location=(0.0, 0.56, 1.03),
        material=team_mat,
        bevel_offset=0.035,
    )
    # Cute mini cream canvas bedroll cylinder perched on top of the backpack
    bedroll = make_smooth_cylinder(
        f"{root_name}_Bedroll",
        radius_top=0.125,
        radius_bottom=0.125,
        height=0.58,
        location=(0.0, 0.35, 1.56),
        material=shared_mats["helmet"],
        segments=32,
        rotation_euler=(0.0, math.pi * 0.5, 0.0),
    )
    # Golden explorer star/coin emblem on backpack pocket
    bp_badge = make_smooth_cylinder(
        f"{root_name}_BackpackBadge",
        radius_top=0.075,
        radius_bottom=0.075,
        height=0.04,
        location=(0.0, 0.63, 1.05),
        material=shared_mats["gold"],
        segments=24,
        rotation_euler=(math.pi * 0.5, 0.0, 0.0),
    )
    body_parts.extend([backpack_mesh, backpack_pocket, bedroll, bp_badge])

    join_parts_into_group_empty(
        "Body_Group",
        (0.0, 0.0, 0.0),
        root_empty,
        body_parts,
        root_name,
    )

    # 3. Arm_L and Arm_R (pivot at X = ±0.53, Y = 0, Z = 1.42) + Plump Round Chibi Hands
    for side, group_name in ((-1, "Arm_L"), (1, "Arm_R")):
        ax = side * 0.53
        pivot = (ax, 0.0, 1.42)
        sleeve_mesh = make_smooth_cylinder(
            f"{root_name}_{group_name}_Sleeve",
            radius_top=0.14,
            radius_bottom=0.15,
            height=0.18,
            location=(ax, 0.0, 1.42 - 0.08),
            material=shared_mats["shirt"],
            segments=28,
        )
        arm_mesh = make_capsule(
            f"{root_name}_{group_name}_Capsule",
            radius=0.125,
            cyl_length=0.32,
            location=(ax, 0.0, 1.42 - 0.22),
            material=shared_mats["skin"],
        )
        hand_mesh = make_sphere(
            f"{root_name}_{group_name}_Hand",
            radius=0.135,
            location=(ax, -0.02, 1.42 - 0.42),
            material=shared_mats["skin"],
            scale_xyz=(0.95, 1.0, 0.95),
            u_seg=24,
            v_seg=18,
        )
        join_parts_into_group_empty(
            group_name, pivot, root_empty, [sleeve_mesh, arm_mesh, hand_mesh], root_name
        )

    # 4. Head_Group (pivot at (0, 0, 2.08): Smooth Rosy Chibi Head + Expressive Eyes + Tilted Pith Helmet)
    head_z = 2.08
    head_parts = []

    # Big, smooth, slightly chubby-cheeked Chibi Head Sphere
    head_sphere = make_sphere(
        f"{root_name}_HeadSphere",
        radius=0.62,
        location=(0.0, 0.0, head_z),
        material=shared_mats["skin"],
        scale_xyz=(1.04, 1.00, 0.98),
        u_seg=48,
        v_seg=32,
        hemisphere_dome=False,
    )
    head_parts.append(head_sphere)

    # Cute Rounded Chibi Ears + Rosy Inner Ear Dimples
    for side in (-1, 1):
        ear_outer = make_sphere(
            f"{root_name}_EarOuter_{side}",
            radius=0.13,
            location=(side * 0.62, -0.02, head_z - 0.04),
            material=shared_mats["skin"],
            scale_xyz=(0.65, 0.85, 1.05),
            u_seg=24,
            v_seg=18,
        )
        ear_inner = make_sphere(
            f"{root_name}_EarInner_{side}",
            radius=0.075,
            location=(side * 0.64, -0.06, head_z - 0.04),
            material=shared_mats["blush"],
            scale_xyz=(0.55, 0.65, 0.85),
            u_seg=20,
            v_seg=14,
        )
        head_parts.extend([ear_outer, ear_inner])

    # Cute Pure-Black Circular Chibi Dot Eyes + Rosy Blush Cheeks (No Eyebrows, No White Catchlights)
    for side in (-1, 1):
        # Clean glossy black circle eye conformed to front curvature (-Y = -0.568)
        eye_main = make_sphere(
            f"{root_name}_Eye_{side}",
            radius=1.0,
            location=(side * 0.215, -0.568, head_z - 0.015),
            material=shared_mats["eye_black"],
            scale_xyz=(0.092, 0.048, 0.092),
            rotation_euler=(0.05, 0.0, -side * 0.32),
            u_seg=32,
            v_seg=22,
        )
        # Plump Rosy-Pink Blush Cheek Pad below and outside eye
        blush = make_sphere(
            f"{root_name}_Blush_{side}",
            radius=1.0,
            location=(side * 0.355, -0.495, head_z - 0.115),
            material=shared_mats["blush"],
            scale_xyz=(0.112, 0.045, 0.072),
            rotation_euler=(0.10, 0.0, -side * 0.52),
            u_seg=24,
            v_seg=16,
        )
        head_parts.extend([eye_main, blush])

    # Tiny Rosy Button Nose & Happy Curved Chibi Smile Arc (◡)
    nose = make_sphere(
        f"{root_name}_Nose",
        radius=1.0,
        location=(0.0, -0.622, head_z - 0.048),
        material=shared_mats["nose"],
        scale_xyz=(0.048, 0.040, 0.038),
        u_seg=20,
        v_seg=14,
    )
    head_parts.append(nose)

    # 7-bead smooth curved smile arc (◡)
    for idx in range(-3, 4):
        t = idx / 3.0
        sx = t * 0.062
        sz = head_z - 0.152 + (t * t) * 0.028
        sy = -0.606 + (t * t) * 0.008
        r_bead = 0.019 if abs(idx) < 3 else 0.016
        smile_bead = make_sphere(
            f"{root_name}_SmileBead_{idx}",
            radius=r_bead,
            location=(sx, sy, sz),
            material=shared_mats["brow"],
            u_seg=16,
            v_seg=12,
        )
        head_parts.append(smile_bead)

    # Oversized Cozy Safari Pith Helmet — tilted slightly back (-9 deg around X)
    # so the front brim sits higher (revealing the cute eyes & eyebrows!)
    helmet_tilt = -0.15  # lifts -Y (front) up and dips +Y (back) down
    tilt_mat = Euler((helmet_tilt, 0.0, 0.0), "XYZ").to_matrix().to_4x4()
    pivot_head = Vector((0.0, 0.0, head_z))

    def place_tilted(local_offset: tuple) -> tuple:
        v = tilt_mat @ Vector(local_offset) + pivot_head
        return (v.x, v.y, v.z)

    helmet_brim = make_smooth_cylinder(
        f"{root_name}_Helmet_Brim",
        radius_top=0.96,
        radius_bottom=1.02,
        height=0.095,
        location=place_tilted((0.0, 0.0, 0.24)),
        material=shared_mats["helmet"],
        segments=48,
        rotation_euler=(helmet_tilt, 0.0, 0.0),
    )
    helmet_crown = make_sphere(
        f"{root_name}_Helmet_Crown",
        radius=0.68,
        location=place_tilted((0.0, 0.0, 0.19)),
        material=shared_mats["helmet"],
        rotation_euler=(helmet_tilt, 0.0, 0.0),
        u_seg=48,
        v_seg=24,
        hemisphere_dome=True,
    )
    helmet_top_button = make_sphere(
        f"{root_name}_Helmet_TopButton",
        radius=0.095,
        location=place_tilted((0.0, 0.0, 0.87)),
        material=shared_mats["helmet"],
        scale_xyz=(1.1, 1.1, 0.65),
        rotation_euler=(helmet_tilt, 0.0, 0.0),
        u_seg=24,
        v_seg=16,
    )
    helmet_band = make_smooth_cylinder(
        f"{root_name}_Helmet_Band",
        radius_top=0.682,
        radius_bottom=0.706,
        height=0.135,
        location=place_tilted((0.0, 0.0, 0.345)),
        material=team_mat,
        segments=48,
        rotation_euler=(helmet_tilt, 0.0, 0.0),
    )
    headlamp_bezel = make_smooth_cylinder(
        f"{root_name}_Headlamp_Bezel",
        radius_top=0.132,
        radius_bottom=0.142,
        height=0.09,
        location=place_tilted((0.0, -0.665, 0.42)),
        material=shared_mats["gold"],
        segments=32,
        rotation_euler=(math.pi * 0.5 + helmet_tilt, 0.0, 0.0),
    )
    headlamp_lens = make_smooth_cylinder(
        f"{root_name}_Headlamp_Lens",
        radius_top=0.100,
        radius_bottom=0.100,
        height=0.105,
        location=place_tilted((0.0, -0.680, 0.42)),
        material=shared_mats["headlamp"],
        segments=32,
        rotation_euler=(math.pi * 0.5 + helmet_tilt, 0.0, 0.0),
    )
    head_parts.extend(
        [
            helmet_brim,
            helmet_crown,
            helmet_top_button,
            helmet_band,
            headlamp_bezel,
            headlamp_lens,
        ]
    )

    join_parts_into_group_empty("Head_Group", (0.0, 0.0, head_z), root_empty, head_parts, root_name)

    return root_empty


# ---------------------------------------------------------------------------
# Phase-2 Gadget Props (Preserved in `chibi_explorers.glb`)
# ---------------------------------------------------------------------------

def build_gadget_turbo_boots(mats: dict) -> bpy.types.Object:
    parts = []
    for side in (-1, 1):
        bx = side * 0.15
        boot = make_rounded_box(
            f"TurboBoot_Body_{side}",
            size_xyz=(0.14, 0.24, 0.15),
            location=(bx, 0.0, 0.085),
            material=mats["gadget_cyan"],
            bevel_offset=0.025,
        )
        wing = make_rounded_box(
            f"TurboBoot_Wing_{side}",
            size_xyz=(0.03, 0.18, 0.10),
            location=(bx + side * 0.08, 0.04, 0.14),
            material=mats["gold"],
            bevel_offset=0.008,
        )
        parts.extend([boot, wing])
    return join_parts_into_group_empty("Gadget_TurboBoots", (0.0, 0.0, 0.0), None, parts, "Prop")


def build_gadget_relic_magnet(mats: dict) -> bpy.types.Object:
    arch = make_torus(
        "RelicMagnet_Arch",
        major_r=0.18,
        minor_r=0.055,
        location=(0.0, 0.0, 0.22),
        material=mats["gadget_red"],
    )
    tip_l = make_rounded_box(
        "RelicMagnet_TipL",
        size_xyz=(0.11, 0.11, 0.09),
        location=(-0.18, 0.0, 0.08),
        material=mats["silver"],
        bevel_offset=0.015,
    )
    tip_r = make_rounded_box(
        "RelicMagnet_TipR",
        size_xyz=(0.11, 0.11, 0.09),
        location=(0.18, 0.0, 0.08),
        material=mats["silver"],
        bevel_offset=0.015,
    )
    return join_parts_into_group_empty(
        "Gadget_RelicMagnet", (0.0, 0.0, 0.0), None, [arch, tip_l, tip_r], "Prop"
    )


def build_gadget_holo_decoy(mats: dict) -> bpy.types.Object:
    disc = make_smooth_cylinder(
        "HoloDecoy_Base",
        radius_top=0.20,
        radius_bottom=0.23,
        height=0.06,
        location=(0.0, 0.0, 0.03),
        material=mats["silver"],
        segments=32,
    )
    orb = make_sphere(
        "HoloDecoy_Emitter",
        radius=0.14,
        location=(0.0, 0.0, 0.22),
        material=mats["gadget_cyan"],
        u_seg=32,
        v_seg=20,
    )
    ring = make_torus(
        "HoloDecoy_Ring",
        major_r=0.21,
        minor_r=0.025,
        location=(0.0, 0.0, 0.22),
        material=mats["gold"],
    )
    return join_parts_into_group_empty(
        "Gadget_HoloDecoy", (0.0, 0.0, 0.0), None, [disc, orb, ring], "Prop"
    )


# ---------------------------------------------------------------------------
# Close-Up Studio Portrait Render of All 4 Chibi Explorers
# ---------------------------------------------------------------------------

def render_studio_portrait(roots: list, out_png_path: str):
    # Space out the 4 Chibi Explorers for a full-body studio line-up portrait
    offsets = [-3.15, -1.05, 1.05, 3.15]
    rotations_z = [0.38, 0.10, -0.12, -0.48]
    for root, x_off, rot_z in zip(roots, offsets, rotations_z):
        root.location = (x_off, 0.0, 0.0)
        root.rotation_euler = (0.0, 0.0, rot_z)

    # Studio backdrop floor
    floor_mat = make_material("StudioFloor", "#F4EFE6", roughness=0.8)
    floor = make_rounded_box(
        "StudioFloorBox",
        size_xyz=(14.0, 8.0, 0.2),
        location=(0.0, 0.5, -0.1),
        material=floor_mat,
        bevel_offset=0.02,
    )

    # World sky lighting
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = hex_to_rgba("#E0F2FE")
        bg.inputs[1].default_value = 0.85

    # Key & Fill Sun Lights
    key_data = bpy.data.lights.new(name="KeySun", type="SUN")
    key_data.energy = 2.6
    key_data.color = (1.0, 0.97, 0.91)
    key_obj = bpy.data.objects.new(name="KeySun", object_data=key_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.rotation_euler = (math.radians(52), math.radians(-18), math.radians(22))

    fill_data = bpy.data.lights.new(name="FillSun", type="SUN")
    fill_data.energy = 1.1
    fill_data.color = (0.88, 0.95, 1.0)
    fill_obj = bpy.data.objects.new(name="FillSun", object_data=fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.rotation_euler = (math.radians(65), math.radians(25), math.radians(-30))

    # Camera looking at all 4 Chibi Explorers from the front (-Y looking toward +Y)
    cam_data = bpy.data.cameras.new(name="PortraitCam")
    cam_data.lens = 38
    cam_obj = bpy.data.objects.new(name="PortraitCam", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0.0, -8.6, 1.62)
    cam_obj.rotation_euler = (math.radians(88.5), 0.0, 0.0)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys() else "BLENDER_EEVEE"
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.render.filepath = out_png_path
    bpy.ops.render.render(write_still=True)

    # Clean up studio objects & reset root transforms if needed
    bpy.data.objects.remove(floor, do_unlink=True)
    bpy.data.objects.remove(key_obj, do_unlink=True)
    bpy.data.objects.remove(fill_obj, do_unlink=True)
    bpy.data.objects.remove(cam_obj, do_unlink=True)


# ---------------------------------------------------------------------------
# Main Export Entrypoint
# ---------------------------------------------------------------------------

def main():
    clear_scene()

    shared_mats = {
        "skin": make_material("Chibi_Skin_RosyPeach", "#FCD5B5", roughness=0.52),
        "blush": make_material(
            "Chibi_Cheek_Blush",
            "#FF85A1",
            roughness=0.45,
            emission_hex="#FF85A1",
            emission_strength=0.18,
        ),
        "nose": make_material("Chibi_Button_Nose", "#F4A285", roughness=0.48),
        "eye_black": make_material("Chibi_Eye_Espresso", "#18121E", roughness=0.06),
        "eye_white": make_material(
            "Chibi_Eye_Catchlight",
            "#FFFFFF",
            roughness=0.05,
            emission_hex="#FFFFFF",
            emission_strength=0.85,
        ),
        "brow": make_material("Chibi_Eyebrow_Cocoa", "#5C3A2E", roughness=0.55),
        "shirt": make_material("Chibi_Safari_Shirt", "#E8D8B5", roughness=0.62),
        "shorts": make_material("Chibi_Safari_Shorts", "#C2A878", roughness=0.68),
        "boot": make_material("Chibi_Hiking_Boot", "#5C4033", roughness=0.58),
        "sole": make_material("Chibi_Boot_Sole", "#E5D3B3", roughness=0.65),
        "helmet": make_material("Chibi_Pith_Helmet", "#F5EEDC", roughness=0.48),
        "headlamp": make_material(
            "Chibi_Headlamp_Gold",
            "#FEF08A",
            roughness=0.18,
            metallic=0.10,
            emission_hex="#FACC15",
            emission_strength=0.75,
        ),
        "gold": make_material("Prop_Gold", "#F5B82E", roughness=0.25, metallic=0.82),
        "silver": make_material("Prop_Silver", "#D6DEE8", roughness=0.25, metallic=0.82),
        "gadget_cyan": make_material(
            "Prop_NeonCyan",
            "#38BDF8",
            roughness=0.20,
            metallic=0.15,
            emission_hex="#38BDF8",
            emission_strength=0.45,
        ),
        "gadget_red": make_material("Prop_MagnetRed", "#EF4444", roughness=0.32, metallic=0.25),
    }

    explorers_spec = [
        ("Explorer_YOU", "#2D7FF9"),
        ("Explorer_Kai", "#FF5A5F"),
        ("Explorer_Mei", "#10B981"),
        ("Explorer_Raj", "#F59E0B"),
    ]

    explorer_roots = []
    for root_name, team_hex in explorers_spec:
        r = build_explorer(root_name, team_hex, shared_mats)
        explorer_roots.append(r)

    g1 = build_gadget_turbo_boots(shared_mats)
    g2 = build_gadget_relic_magnet(shared_mats)
    g3 = build_gadget_holo_decoy(shared_mats)

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
    out_dir = os.path.join(repo_root, "public", "models")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "chibi_explorers.glb")

    # Export GLB first while all roots are at (0, 0, 0) with zero rotation
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format="GLB",
        export_yup=True,
        export_apply=True,
        export_materials="EXPORT",
    )
    print(f"[build_characters.py] Successfully exported v2.5 Cute Chibi Explorers (with Eyes!) to: {out_path}")

    # Hide gadgets and render close-up studio portrait of the 4 Chibi Explorers
    for g in (g1, g2, g3):
        g.hide_render = True
        for child in g.children_recursive:
            child.hide_render = True

    artifact_png = "/Users/momo/.gemini/antigravity/brain/5e9f09ea-b109-4c36-838e-d67b6e93f15c/blender_chibi_explorers_v2.png"
    render_studio_portrait(explorer_roots, artifact_png)
    print(f"[build_characters.py] Rendered close-up studio turnaround to: {artifact_png}")


if __name__ == "__main__":
    main()
