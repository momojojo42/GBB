"""
Headless Blender 4.2 Script: Singapore Botanic Gardens (UNESCO World Heritage)
Gates, Bridges, Sculptures & Elevated Walkways (`sbg_sculptures_bridges.glb`)

Exports `public/models/sbg/sbg_sculptures_bridges.glb` containing 10 root landmark nodes:
1. SBG_Tanglin_Silver_Gate
2. SBG_Swan_Lake_Gazebo_Bridge
3. SBG_Flight_Of_Swans_Sculpture
4. SBG_Chopin_Memorial_Statue
5. SBG_Ginger_Cavern_Waterfall
6. SBG_SPH_Walk_Of_Giants
7. SBG_COMO_Cempedak_Play_Pod
8. SBG_Jacob_Ballas_Treehouse_Bridge
9. SBG_Sundial_Garden_Pergola
10. SBG_Nassim_Clock_Tower_Gate
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler


# ---------------------------------------------------------------------------
# SCENE RESET & PBR MATERIAL UTILITIES
# ---------------------------------------------------------------------------

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def srgb_to_linear(c):
    if c <= 0.04045:
        return c / 12.92
    return pow((c + 0.055) / 1.055, 2.4)


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip('#')
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def create_material(name, hex_color, metallic=0.0, roughness=0.45, alpha=1.0,
                    emission_hex=None, emission_strength=0.0, double_sided=True):
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    mat.use_backface_culling = not double_sided

    if alpha < 1.0:
        if hasattr(mat, 'blend_method'):
            mat.blend_method = 'BLEND'
        if hasattr(mat, 'surface_render_method'):
            mat.surface_render_method = 'BLENDED'

    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")

    bsdf.inputs["Base Color"].default_value = hex_to_rgba(hex_color, 1.0)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    if "Alpha" in bsdf.inputs:
        bsdf.inputs["Alpha"].default_value = alpha

    if emission_hex and emission_strength > 0.0:
        em_rgba = hex_to_rgba(emission_hex, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = em_rgba
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = em_rgba
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength

    return mat


def create_root_empty(name):
    root = bpy.data.objects.new(name, None)
    root.empty_display_type = 'PLAIN_AXES'
    root.location = (0.0, 0.0, 0.0)
    bpy.context.collection.objects.link(root)
    return root


def create_mesh_obj(name, bm, mat, parent, smooth=True, subsurf_levels=0):
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    if mat:
        obj.data.materials.append(mat)
    if subsurf_levels > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf_levels
        mod.render_levels = subsurf_levels
        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        bpy.ops.object.modifier_apply(modifier=mod.name)
        obj.select_set(False)
    obj.parent = parent
    obj.matrix_parent_inverse = Matrix.Identity(4)
    return obj


# ---------------------------------------------------------------------------
# BMESH GEOMETRY HELPERS
# ---------------------------------------------------------------------------

def _merge_bm(dst_bm, src_bm):
    vmap = {v: dst_bm.verts.new(v.co) for v in src_bm.verts}
    for f in src_bm.faces:
        try:
            dst_bm.faces.new([vmap[v] for v in f.verts])
        except ValueError:
            pass
    src_bm.free()


def xform_mat(loc=(0.0, 0.0, 0.0), rot_euler=(0.0, 0.0, 0.0), scale=(1.0, 1.0, 1.0)):
    t = Matrix.Translation(loc)
    r = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
    s = Matrix.Diagonal((scale[0], scale[1], scale[2], 1.0))
    return t @ r @ s


def add_beveled_box(bm, loc, hx, hy, hz, rot_euler=(0.0, 0.0, 0.0), bevel_frac=0.14, segs=2):
    bm_tmp = bmesh.new()
    bmesh.ops.create_cube(bm_tmp, size=2.0, matrix=Matrix.Diagonal((hx, hy, hz, 1.0)))
    bev = min(hx, hy, hz) * bevel_frac
    if bev > 1e-4 and segs > 0:
        bmesh.ops.bevel(
            bm_tmp, geom=list(bm_tmp.edges),
            offset=bev, offset_type='OFFSET',
            segments=segs, profile=0.5, affect='EDGES'
        )
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot_euler), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def add_beveled_cyl(bm, loc, r1, r2, depth, segs=18, rot_euler=(0.0, 0.0, 0.0), cap_ends=True, bevel_frac=0.12):
    bm_tmp = bmesh.new()
    bmesh.ops.create_cone(
        bm_tmp, cap_ends=cap_ends, cap_tris=False,
        segments=segs, radius1=r1, radius2=r2, depth=depth
    )
    if cap_ends and bevel_frac > 0.0:
        bm_tmp.normal_update()
        rim_edges = [
            e for e in bm_tmp.edges
            if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.z - e.link_faces[1].normal.z) > 0.35
        ]
        bev = min(max(r1, r2, 0.01), depth * 0.45) * bevel_frac
        if rim_edges and bev > 1e-4:
            bmesh.ops.bevel(
                bm_tmp, geom=rim_edges,
                offset=bev, offset_type='OFFSET',
                segments=2, profile=0.5, affect='EDGES'
            )
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot_euler), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def add_polyline_tube(bm, points, radii, segments=10, cap_ends=True):
    if len(points) < 2:
        return
    rings = []
    n = len(points)
    for idx, pt in enumerate(points):
        p = Vector(pt)
        if idx == 0:
            tangent = (Vector(points[1]) - p).normalized()
        elif idx == n - 1:
            tangent = (p - Vector(points[idx - 1])).normalized()
        else:
            tangent = (Vector(points[idx + 1]) - Vector(points[idx - 1])).normalized()
        if tangent.length < 1e-5:
            tangent = Vector((0, 0, 1))
        up = Vector((0.0, 0.0, 1.0)) if abs(tangent.z) < 0.94 else Vector((1.0, 0.0, 0.0))
        u = tangent.cross(up).normalized()
        v = u.cross(tangent).normalized()
        r = radii[idx] if isinstance(radii, (list, tuple)) else radii
        ring = []
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            offset = u * (math.cos(ang) * r) + v * (math.sin(ang) * r)
            ring.append(bm.verts.new(p + offset))
        rings.append(ring)

    for k in range(n - 1):
        rA, rB = rings[k], rings[k + 1]
        for i in range(segments):
            inext = (i + 1) % segments
            bm.faces.new((rA[i], rA[inext], rB[inext], rB[i]))

    if cap_ends and len(rings) >= 2:
        bm.faces.new(list(reversed(rings[0])))
        bm.faces.new(rings[-1])


def add_icosphere_puff(bm, center, radius, scale_xyz=(1.0, 1.0, 0.9), rot_euler=(0.0, 0.0, 0.0), subdivisions=1):
    bm_tmp = bmesh.new()
    bmesh.ops.create_icosphere(bm_tmp, subdivisions=subdivisions, radius=radius)
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(center, rot_euler, scale_xyz), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def build_materials():
    return {
        "silver_leaf": create_material("SBG_Silver_Leaf_CastIron", "#E2E8F0", metallic=0.90, roughness=0.18,
                                       emission_hex="#94A3B8", emission_strength=0.15),
        "wrought_iron": create_material("SBG_Wrought_Iron_Dark", "#1E293B", metallic=0.72, roughness=0.34),
        "ivory_stone": create_material("SBG_Limestone_Plinth", "#F5EFE6", metallic=0.04, roughness=0.46),
        "stucco_white": create_material("SBG_Victorian_White", "#F8FAFC", metallic=0.06, roughness=0.30),
        "warm_teak": create_material("SBG_Bridge_Teak_Timber", "#92400E", metallic=0.10, roughness=0.48),
        "cedar_light": create_material("SBG_Canopy_Cedar_Timber", "#B45309", metallic=0.08, roughness=0.45),
        "bronze_warm": create_material("SBG_Sculpture_Bronze", "#B45309", metallic=0.86, roughness=0.24,
                                       emission_hex="#D97706", emission_strength=0.15),
        "patina_bronze": create_material("SBG_Chopin_Patina_Bronze", "#065F46", metallic=0.68, roughness=0.32),
        "brass_gold": create_material("SBG_Brushed_Brass_Gold", "#FBBF24", metallic=0.88, roughness=0.20,
                                      emission_hex="#F59E0B", emission_strength=0.25),
        "moss_rock": create_material("SBG_Cavern_Moss_Granite", "#475569", metallic=0.06, roughness=0.74),
        "moss_green": create_material("SBG_Cavern_Lush_Moss", "#15803D", metallic=0.04, roughness=0.55),
        "waterfall_cyan": create_material("SBG_Waterfall_Sheet_Aqua", "#67E8F9", metallic=0.12, roughness=0.10, alpha=0.76,
                                          emission_hex="#06B6D4", emission_strength=1.40),
        "cempedak_lime": create_material("SBG_COMO_Cempedak_Lime", "#84CC16", metallic=0.10, roughness=0.34,
                                         emission_hex="#65A30D", emission_strength=0.22),
        "cempedak_amber": create_material("SBG_COMO_Slide_Amber", "#F59E0B", metallic=0.28, roughness=0.24,
                                          emission_hex="#D97706", emission_strength=0.25),
        "terracotta_roof": create_material("SBG_Terracotta_Roof", "#C2410C", metallic=0.08, roughness=0.45),
        "lantern_glow": create_material("SBG_Lantern_Warm_Glow", "#FEF08A", metallic=0.15, roughness=0.15,
                                        emission_hex="#F59E0B", emission_strength=2.2),
    }


# ---------------------------------------------------------------------------
# 1. SBG_Tanglin_Silver_Gate
# ---------------------------------------------------------------------------

def build_tanglin_silver_gate(mats):
    root = create_root_empty("SBG_Tanglin_Silver_Gate")

    bm_stone = bmesh.new()
    bm_silver = bmesh.new()
    bm_iron = bmesh.new()
    bm_glow = bmesh.new()

    # Twin classical stone gate pillars at X = -2.9 and +2.9 + flanking low garden walls
    for sx in (-1.0, 1.0):
        px = sx * 2.90
        add_beveled_box(bm_stone, (px, 0, 0.25), 0.74, 0.74, 0.25)
        add_beveled_box(bm_stone, (px, 0, 1.95), 0.56, 0.56, 1.50)
        add_beveled_box(bm_stone, (px, 0, 3.62), 0.68, 0.68, 0.20)
        add_beveled_box(bm_iron, (px, 0, 3.88), 0.22, 0.22, 0.08)
        add_icosphere_puff(bm_glow, (px, 0, 4.12), 0.26, subdivisions=2)
        # Flanking curved low stone wing wall & silver filigree fence
        add_beveled_box(bm_stone, (sx * 4.25, 0.35, 0.45), 0.85, 0.28, 0.45, rot_euler=(0, 0, -sx * 0.25))
        for f_i in range(4):
            fx = sx * (3.65 + f_i * 0.36)
            fy = 0.15 + f_i * 0.10
            add_beveled_cyl(bm_silver, (fx, fy, 1.65), 0.03, 0.025, 1.55, segs=8)

    # Curved cast-iron gate leaves swept open with silver-leaf banana & palm frond filigree
    for sx in (-1.0, 1.0):
        hinge_x = sx * 2.32
        # Vertical hinge stile & outer meeting stile
        add_beveled_cyl(bm_silver, (hinge_x, 0.0, 1.75), 0.055, 0.055, 2.95, segs=10)
        add_beveled_cyl(bm_silver, (hinge_x - sx * 0.95, 1.05, 1.85), 0.05, 0.05, 3.05, segs=10)
        for bar_i in range(6):
            frac = bar_i / 5.0
            pts = [
                (hinge_x, 0.0, 0.35 + frac * 2.45),
                (hinge_x - sx * 0.55, 0.45, 0.45 + frac * 2.55),
                (hinge_x - sx * 0.95, 1.05, 0.55 + frac * 2.65),
            ]
            add_polyline_tube(bm_silver, pts, [0.052, 0.042, 0.032], segments=8)
            for lp in pts[1:]:
                add_icosphere_puff(bm_silver, (lp[0], lp[1], lp[2] + 0.12), 0.20,
                                   scale_xyz=(1.55, 0.42, 0.85), rot_euler=(0.2, 0.3 * sx, 0.4), subdivisions=1)

    # Overhead decorative silver-leaf botanical archway crest spanning above player head height (z > 3.4m)
    arch_pts = []
    for s in range(25):
        t = s / 24.0
        x = -2.85 + t * 5.70
        z = 3.45 + math.sin(t * math.pi) * 1.15
        arch_pts.append((x, 0.0, z))
    add_polyline_tube(bm_silver, arch_pts, 0.095, segments=10)

    for s in range(2, 23, 2):
        p = arch_pts[s]
        add_icosphere_puff(bm_silver, (p[0], 0.0, p[2] + 0.18), 0.22, scale_xyz=(1.45, 0.35, 0.95), subdivisions=1)

    create_mesh_obj("SBG_TanglinGate_StonePillars", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_TanglinGate_SilverFiligree", bm_silver, mats["silver_leaf"], root)
    create_mesh_obj("SBG_TanglinGate_IronHardware", bm_iron, mats["wrought_iron"], root)
    create_mesh_obj("SBG_TanglinGate_PillarLanterns", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 2. SBG_Swan_Lake_Gazebo_Bridge
# ---------------------------------------------------------------------------

def build_swan_lake_gazebo_bridge(mats):
    root = create_root_empty("SBG_Swan_Lake_Gazebo_Bridge")

    bm_teak = bmesh.new()
    bm_white = bmesh.new()
    bm_roof = bmesh.new()
    bm_glow = bmesh.new()

    segs = 28
    for i in range(segs):
        t = i / (segs - 1.0)
        x = -6.2 + t * 12.4
        z = 0.12 + math.sin(t * math.pi) * 1.15
        pitch = -math.cos(t * math.pi) * (1.15 * math.pi / 12.4)
        add_beveled_box(bm_teak, (x, 0.0, z), 0.26, 2.15, 0.09, rot_euler=(0, pitch, 0))

        if i % 3 == 0:
            for sy in (-2.05, 2.05):
                add_beveled_cyl(bm_white, (x, sy, z + 0.55), 0.055, 0.045, 0.95, segs=10)
                if i % 6 == 0:
                    add_beveled_cyl(bm_white, (x, sy, z + 1.35), 0.04, 0.035, 0.85, segs=10)
                    add_icosphere_puff(bm_glow, (x, sy, z + 1.85), 0.14, subdivisions=1)

    for sy in (-2.05, 2.05):
        rail_pts = [(-6.2 + (k / 24.0) * 12.4, sy, 0.98 + math.sin((k / 24.0) * math.pi) * 1.15) for k in range(25)]
        add_polyline_tube(bm_white, rail_pts, 0.05, segments=8)

    z_crown = 1.27
    for sx in (-1.65, 1.65):
        for sy in (-2.05, 2.05):
            add_beveled_cyl(bm_white, (sx, sy, z_crown + 1.45), 0.09, 0.08, 2.85, segs=12)

    add_beveled_box(bm_white, (0, 0, z_crown + 2.92), 1.95, 2.25, 0.12)
    add_beveled_cyl(bm_roof, (0, 0, z_crown + 3.55), 2.85, 0.15, 1.15, segs=4, rot_euler=(0, 0, math.pi / 4.0))
    add_icosphere_puff(bm_glow, (0, 0, z_crown + 2.72), 0.22, subdivisions=2)

    create_mesh_obj("SBG_SwanBridge_TeakDeck", bm_teak, mats["warm_teak"], root)
    create_mesh_obj("SBG_SwanBridge_VictorianPavilion", bm_white, mats["stucco_white"], root)
    create_mesh_obj("SBG_SwanBridge_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_SwanBridge_Lanterns", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 3. SBG_Flight_Of_Swans_Sculpture
# ---------------------------------------------------------------------------

def add_sculpted_swan(bm, origin, yaw=0.0, scale=1.0, wing_pitch=0.55):
    rot_z = Euler((0, 0, yaw), 'XYZ').to_matrix()
    base = Vector(origin)

    def tr(pt):
        return base + (rot_z @ (Vector(pt) * scale))

    body_pts = [
        (-0.55, 0.0, -0.10),
        (-0.20, 0.0, 0.0),
        (0.25, 0.0, 0.08),
        (0.52, 0.0, 0.35),
        (0.48, 0.0, 0.68),
        (0.68, 0.0, 0.85),
        (0.84, 0.0, 0.80),
    ]
    body_r = [0.05, 0.24, 0.26, 0.11, 0.075, 0.09, 0.03]
    add_polyline_tube(bm, [tr(p) for p in body_pts], [r * scale for r in body_r], segments=12)

    for side in (-1.0, 1.0):
        wing_pts = [
            (0.05, side * 0.12, 0.12),
            (-0.05, side * 0.65, 0.35 + 0.18 * wing_pitch),
            (-0.25, side * 1.25, 0.68 + 0.28 * wing_pitch),
            (-0.48, side * 1.65, 0.85 + 0.32 * wing_pitch),
        ]
        add_polyline_tube(bm, [tr(p) for p in wing_pts], [0.11 * scale, 0.09 * scale, 0.06 * scale, 0.025 * scale], segments=8)
        for f_idx in range(1, 4):
            wp = wing_pts[f_idx]
            feather_tip = (wp[0] - 0.45, wp[1] * 1.05, wp[2] - 0.12)
            add_polyline_tube(bm, [tr(wp), tr(feather_tip)], [0.055 * scale, 0.018 * scale], segments=6)


def build_flight_of_swans_sculpture(mats):
    root = create_root_empty("SBG_Flight_Of_Swans_Sculpture")

    bm_rock = bmesh.new()
    bm_water = bmesh.new()
    bm_bronze = bmesh.new()

    add_beveled_cyl(bm_rock, (0, 0, 0.28), 1.45, 1.15, 0.56, segs=20)
    add_icosphere_puff(bm_rock, (0, 0, 0.65), 0.85, scale_xyz=(1.1, 0.9, 0.7), subdivisions=1)
    add_beveled_cyl(bm_water, (0, 0, 0.08), 1.85, 1.75, 0.14, segs=24)

    swan_configs = [
        ((0.0, 0.0, 1.15), -1.15, 1.05, 0.55),
        ((-0.75, -0.55, 1.75), -0.65, 0.95, 0.75),
        ((0.68, 0.52, 2.35), -1.55, 0.92, 0.85),
    ]
    for pos, yaw, sc, wp in swan_configs:
        add_polyline_tube(bm_bronze, [(0, 0, 0.65), pos], [0.07, 0.05], segments=8)
        add_sculpted_swan(bm_bronze, pos, yaw=yaw, scale=sc, wing_pitch=wp)

    create_mesh_obj("SBG_FlightOfSwans_GranitePlinth", bm_rock, mats["moss_rock"], root)
    create_mesh_obj("SBG_FlightOfSwans_WaveRing", bm_water, mats["waterfall_cyan"], root)
    create_mesh_obj("SBG_FlightOfSwans_BronzeSwans", bm_bronze, mats["bronze_warm"], root, subsurf_levels=1)
    return root


# ---------------------------------------------------------------------------
# 4. SBG_Chopin_Memorial_Statue
# ---------------------------------------------------------------------------

def build_chopin_memorial_statue(mats):
    root = create_root_empty("SBG_Chopin_Memorial_Statue")

    bm_stone = bmesh.new()
    bm_bronze = bmesh.new()
    bm_gold = bmesh.new()

    # Stepped granite & sandstone memorial pedestal with brass plaque on -Y (front)
    add_beveled_box(bm_stone, (0, 0, 0.16), 1.65, 1.35, 0.16)
    add_beveled_box(bm_stone, (0, 0, 0.48), 1.25, 0.98, 0.22)
    add_beveled_box(bm_gold, (0, -0.99, 0.48), 0.65, 0.03, 0.12)

    # Sculpted Bronze Piano Keyboard Console & Music Stand facing -Y
    add_beveled_box(bm_bronze, (-0.38, -0.18, 1.12), 0.48, 0.34, 0.45)
    add_beveled_box(bm_gold, (-0.38, -0.38, 1.22), 0.42, 0.14, 0.04)

    # Seated Frédéric Chopin figure at piano (-X)
    add_polyline_tube(bm_bronze, [(-0.38, 0.28, 0.72), (-0.38, 0.22, 1.38), (-0.38, 0.12, 1.75)],
                      [0.22, 0.20, 0.16], segments=10)
    add_icosphere_puff(bm_bronze, (-0.38, 0.10, 2.02), 0.17, scale_xyz=(0.95, 1.05, 1.12), subdivisions=2)

    # Standing George Sand figure leaning gracefully beside Chopin (+X)
    add_polyline_tube(bm_bronze, [(0.38, 0.05, 0.70), (0.35, 0.02, 1.55), (0.28, -0.02, 2.15)],
                      [0.34, 0.22, 0.17], segments=12)
    add_icosphere_puff(bm_bronze, (0.25, -0.04, 2.42), 0.17, scale_xyz=(0.95, 1.02, 1.10), subdivisions=2)

    # Expressive bronze musical ribbon swirl arching behind the duo (+Y)
    swirl_pts = [
        (-0.75, 0.25, 0.85),
        (-0.55, 0.35, 1.95),
        (0.05, 0.32, 2.75),
        (0.65, 0.18, 2.35),
    ]
    add_polyline_tube(bm_bronze, swirl_pts, [0.08, 0.12, 0.10, 0.05], segments=10)

    create_mesh_obj("SBG_Chopin_StonePedestal", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_Chopin_BronzeSculpture", bm_bronze, mats["patina_bronze"], root, subsurf_levels=1)
    create_mesh_obj("SBG_Chopin_GoldPlaque", bm_gold, mats["brass_gold"], root)
    return root


# ---------------------------------------------------------------------------
# 5. SBG_Ginger_Cavern_Waterfall
# ---------------------------------------------------------------------------

def build_ginger_cavern_waterfall(mats):
    """
    Ginger Garden Walk-Behind Cavern Waterfall:
    - Oriented toward -Y (front camera!) so the glowing aqua waterfall curtain, plunge pool,
      mossy cavern rock arch, and timber pool bridge are prominently visible from the front.
    """
    root = create_root_empty("SBG_Ginger_Cavern_Waterfall")

    bm_rock = bmesh.new()
    bm_moss = bmesh.new()
    bm_water = bmesh.new()
    bm_teak = bmesh.new()

    # Walk-behind mossy rock grotto arch (forming an open tunnel along X behind the waterfall at +Y)
    grotto_pillars = [
        (-2.65, 0.45, 1.35, (1.25, 1.15, 1.55)),
        (2.65, 0.45, 1.35, (1.25, 1.15, 1.55)),
        (-1.85, 0.65, 2.75, (1.15, 1.05, 1.15)),
        (1.85, 0.65, 2.75, (1.15, 1.05, 1.15)),
        (0.0, 0.55, 3.35, (1.65, 1.15, 0.85)),
    ]
    for rx, ry, rz, sc in grotto_pillars:
        add_icosphere_puff(bm_rock, (rx, ry, rz), 1.15, scale_xyz=sc, subdivisions=2)
        add_icosphere_puff(bm_moss, (rx, ry, rz + 1.15 * sc[2] * 0.72), 1.05,
                           scale_xyz=(sc[0] * 1.02, sc[1] * 0.98, 0.42), subdivisions=2)
    # Lush ferns & moss cushions flanking the plunge pool
    for fx, fy, fz in [(-2.35, -0.85, 0.55), (2.35, -0.85, 0.55), (-1.45, 0.35, 3.65), (1.45, 0.35, 3.65), (0.0, 0.45, 4.15)]:
        add_icosphere_puff(bm_moss, (fx, fy, fz), 0.65, scale_xyz=(1.25, 1.15, 0.52), subdivisions=1)

    # Translucent cascading waterfall curtain falling in front of the grotto arch (-Y = -0.55m) + plunge pool
    for wx in (-0.95, -0.32, 0.32, 0.95):
        wf_pts = [
            (wx, 0.15, 3.25),
            (wx, -0.35, 2.15),
            (wx, -0.65, 0.95),
            (wx, -0.78, 0.15),
        ]
        add_polyline_tube(bm_water, wf_pts, [0.36, 0.45, 0.52, 0.58], segments=10)
    add_beveled_cyl(bm_water, (0, -0.95, 0.10), 2.55, 2.45, 0.18, segs=24)

    # Timber pool bridge in front of the plunge basin at -Y = -2.35m
    for i in range(-4, 5):
        bx = i * 0.52
        bz = 0.24 + math.cos(i * 0.32) * 0.16
        add_beveled_box(bm_teak, (bx, -2.35, bz), 0.22, 0.75, 0.07)

    create_mesh_obj("SBG_GingerCavern_RockArch", bm_rock, mats["moss_rock"], root)
    create_mesh_obj("SBG_GingerCavern_MossTop", bm_moss, mats["moss_green"], root)
    create_mesh_obj("SBG_GingerCavern_WaterfallSheet", bm_water, mats["waterfall_cyan"], root)
    create_mesh_obj("SBG_GingerCavern_TimberBridge", bm_teak, mats["warm_teak"], root)
    return root


# ---------------------------------------------------------------------------
# 6. SBG_SPH_Walk_Of_Giants
# ---------------------------------------------------------------------------

def build_sph_walk_of_giants(mats):
    root = create_root_empty("SBG_SPH_Walk_Of_Giants")

    bm_steel = bmesh.new()
    bm_timber = bmesh.new()
    bm_glow = bmesh.new()

    z_deck = 2.65
    for sx in (-1.0, 1.0):
        dx = sx * 3.85
        add_beveled_cyl(bm_steel, (dx, 0, z_deck * 0.5), 0.32, 0.26, z_deck, segs=16)
        add_beveled_cyl(bm_timber, (dx, 0, z_deck), 1.95, 1.85, 0.24, segs=20)
        for k in range(16):
            ang = 2.0 * math.pi * k / 16.0
            if abs(math.cos(ang) + sx) < 0.35:
                continue
            px = dx + math.cos(ang) * 1.78
            py = math.sin(ang) * 1.78
            add_beveled_box(bm_timber, (px, py, z_deck + 0.58), 0.08, 0.08, 0.48, rot_euler=(0, 0, ang))
        add_icosphere_puff(bm_glow, (dx, 0, z_deck + 1.15), 0.20, subdivisions=1)

    for i in range(17):
        t = i / 16.0
        x = -2.15 + t * 4.30
        y = math.sin(t * math.pi) * 0.45
        add_beveled_box(bm_timber, (x, y, z_deck), 0.18, 0.95, 0.09)
        if i % 2 == 0:
            for sy in (-0.88, 0.88):
                add_beveled_cyl(bm_steel, (x, y + sy, z_deck + 0.52), 0.04, 0.035, 0.92, segs=8)

    for sy in (-0.88, 0.88):
        rail_pts = [(-2.15 + (k / 16.0) * 4.30, math.sin((k / 16.0) * math.pi) * 0.45 + sy, z_deck + 0.96) for k in range(17)]
        add_polyline_tube(bm_steel, rail_pts, 0.045, segments=8)

    create_mesh_obj("SBG_WalkOfGiants_SteelPylons", bm_steel, mats["wrought_iron"], root)
    create_mesh_obj("SBG_WalkOfGiants_TimberDrums", bm_timber, mats["cedar_light"], root)
    create_mesh_obj("SBG_WalkOfGiants_CanopyLights", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 7. SBG_COMO_Cempedak_Play_Pod
# ---------------------------------------------------------------------------

def build_como_cempedak_play_pod(mats):
    root = create_root_empty("SBG_COMO_Cempedak_Play_Pod")

    bm_pod = bmesh.new()
    bm_slide = bmesh.new()
    bm_rope = bmesh.new()

    pod_center = Vector((-0.65, 0.0, 2.75))
    add_icosphere_puff(bm_pod, pod_center, 1.45, scale_xyz=(0.95, 0.92, 1.65), rot_euler=(0.12, 0.18, 0.0), subdivisions=2)

    golden_angle = math.pi * (3.0 - math.sqrt(5.0))
    for i in range(42):
        t = (i + 0.5) / 42.0
        inc = math.acos(1.0 - 1.85 * t)
        az = i * golden_angle
        nx = pod_center.x + 1.38 * math.sin(inc) * math.cos(az)
        ny = pod_center.y + 1.34 * math.sin(inc) * math.sin(az)
        nz = pod_center.z + 2.35 * math.cos(inc)
        add_icosphere_puff(bm_pod, (nx, ny, nz), 0.24, scale_xyz=(1.1, 1.1, 0.85), subdivisions=1)

    add_beveled_cyl(bm_rope, (-0.65, 0.0, 0.65), 0.55, 0.42, 1.30, segs=12)
    add_beveled_cyl(bm_rope, (-0.35, 0.0, 5.25), 0.22, 0.14, 0.65, segs=10)

    slide_pts = []
    for k in range(33):
        u = k / 32.0
        ang = u * math.pi * 1.85
        r_s = 1.65 + 0.35 * u
        sx = -0.55 + math.cos(ang) * r_s
        sy = math.sin(ang) * r_s
        sz = 3.45 * (1.0 - u) + 0.38
        slide_pts.append((sx, sy, sz))
    add_polyline_tube(bm_slide, slide_pts, 0.38, segments=12)

    create_mesh_obj("SBG_CempedakPod_FruitTower", bm_pod, mats["cempedak_lime"], root)
    create_mesh_obj("SBG_CempedakPod_SpiralSlide", bm_slide, mats["cempedak_amber"], root)
    create_mesh_obj("SBG_CempedakPod_ClimbingBase", bm_rope, mats["warm_teak"], root)
    return root


# ---------------------------------------------------------------------------
# 8. SBG_Jacob_Ballas_Treehouse_Bridge
# ---------------------------------------------------------------------------

def build_jacob_ballas_treehouse_bridge(mats):
    root = create_root_empty("SBG_Jacob_Ballas_Treehouse_Bridge")

    bm_timber = bmesh.new()
    bm_roof = bmesh.new()
    bm_slide = bmesh.new()

    for sx in (-1.0, 1.0):
        tx = sx * 2.65
        h_scale = 1.0 if sx < 0 else 0.88
        add_beveled_cyl(bm_timber, (tx, 0, 1.55 * h_scale), 0.62, 0.48, 3.10 * h_scale, segs=12)
        add_beveled_cyl(bm_timber, (tx, 0, 2.95 * h_scale), 1.65, 1.58, 0.22, segs=16)
        add_beveled_cyl(bm_timber, (tx, 0, 3.75 * h_scale), 1.18, 1.18, 1.35, segs=12)
        add_beveled_cyl(bm_roof, (tx, 0, 4.85 * h_scale), 1.95, 0.08, 1.25, segs=12, bevel_frac=0.06)

    for i in range(13):
        t = i / 12.0
        bx = -1.35 + t * 2.70
        bz = 2.75 - math.sin(t * math.pi) * 0.28 - t * 0.25
        add_beveled_box(bm_timber, (bx, 0, bz), 0.12, 0.65, 0.05)

    for sy in (-0.62, 0.62):
        rope_pts = [(-1.45 + (k / 12.0) * 2.90, sy, 3.35 - math.sin((k / 12.0) * math.pi) * 0.32 - (k / 12.0) * 0.25) for k in range(13)]
        add_polyline_tube(bm_timber, rope_pts, 0.04, segments=8)

    slide_pts = [
        (-2.65, -1.15, 2.85),
        (-1.85, -2.15, 1.95),
        (-0.85, -2.65, 0.95),
        (0.15, -2.85, 0.28),
    ]
    add_polyline_tube(bm_slide, slide_pts, 0.34, segments=12)

    create_mesh_obj("SBG_Treehouse_TimberHuts", bm_timber, mats["warm_teak"], root)
    create_mesh_obj("SBG_Treehouse_ConicalRoofs", bm_roof, mats["moss_green"], root)
    create_mesh_obj("SBG_Treehouse_CanopySlide", bm_slide, mats["cempedak_amber"], root)
    return root


# ---------------------------------------------------------------------------
# 9. SBG_Sundial_Garden_Pergola
# ---------------------------------------------------------------------------

def build_sundial_garden_pergola(mats):
    root = create_root_empty("SBG_Sundial_Garden_Pergola")

    bm_stone = bmesh.new()
    bm_water = bmesh.new()
    bm_brass = bmesh.new()
    bm_white = bmesh.new()

    add_beveled_cyl(bm_stone, (0, 0, 0.10), 4.25, 4.15, 0.20, segs=32)
    add_beveled_cyl(bm_stone, (0, 0, 0.68), 0.46, 0.34, 0.98, segs=16)
    add_beveled_cyl(bm_stone, (0, 0, 1.24), 0.56, 0.58, 0.14, segs=16)

    add_beveled_cyl(bm_brass, (0, 0, 1.34), 0.48, 0.46, 0.05, segs=24)
    add_beveled_box(bm_brass, (0, -0.05, 1.56), 0.03, 0.28, 0.24, rot_euler=(-0.38, 0, 0))

    for sx in (-1.75, 1.75):
        for sy in (-1.75, 1.75):
            add_beveled_box(bm_stone, (sx, sy, 0.26), 0.88, 0.88, 0.14)
            add_beveled_box(bm_water, (sx, sy, 0.34), 0.74, 0.74, 0.06)

    # White Roman Pergola Arch framing the rear perimeter (+Y = +3.65m) behind the sundial
    for ang_deg in range(-55, 60, 22):
        ang = math.radians(ang_deg) + math.pi / 2.0
        px = math.cos(ang) * 3.65
        py = math.sin(ang) * 3.65
        add_beveled_cyl(bm_white, (px, py, 1.52), 0.15, 0.13, 2.65, segs=14)

    arch_pts = []
    for s in range(19):
        ang = math.radians(-58 + (s / 18.0) * 116) + math.pi / 2.0
        arch_pts.append((math.cos(ang) * 3.65, math.sin(ang) * 3.65, 2.95))
    add_polyline_tube(bm_white, arch_pts, 0.14, segments=10)

    create_mesh_obj("SBG_Sundial_StonePedestal", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_Sundial_LilyBasins", bm_water, mats["waterfall_cyan"], root)
    create_mesh_obj("SBG_Sundial_BrassGnomon", bm_brass, mats["brass_gold"], root)
    create_mesh_obj("SBG_Sundial_RomanPergola", bm_white, mats["stucco_white"], root)
    return root


# ---------------------------------------------------------------------------
# 10. SBG_Nassim_Clock_Tower_Gate
# ---------------------------------------------------------------------------

def build_nassim_clock_tower_gate(mats):
    root = create_root_empty("SBG_Nassim_Clock_Tower_Gate")

    bm_stone = bmesh.new()
    bm_white = bmesh.new()
    bm_teak = bmesh.new()
    bm_roof = bmesh.new()
    bm_gold = bmesh.new()

    add_beveled_box(bm_stone, (0, 0, 0.35), 1.15, 1.15, 0.35)
    add_beveled_box(bm_white, (0, 0, 2.35), 0.88, 0.88, 1.75)

    for rot_z in (0.0, math.pi / 2.0):
        add_beveled_cyl(bm_gold, (0, 0, 3.45), 0.52, 0.52, 1.82, segs=20, rot_euler=(math.pi / 2.0, 0, rot_z))

    add_beveled_cyl(bm_roof, (0, 0, 4.65), 1.45, 0.08, 1.25, segs=4, rot_euler=(0, 0, math.pi / 4.0))
    add_icosphere_puff(bm_gold, (0, 0, 5.38), 0.16, subdivisions=2)

    for sx in (-1.0, 1.0):
        wx = sx * 2.45
        add_beveled_box(bm_stone, (wx, 0, 0.18), 1.45, 1.25, 0.18)
        for px in (wx - 1.05, wx + 1.05):
            for py in (-0.85, 0.85):
                add_beveled_cyl(bm_teak, (px, py, 1.35), 0.10, 0.09, 2.25, segs=10)
        add_beveled_box(bm_teak, (wx, 0, 2.52), 1.45, 1.15, 0.12)
        add_beveled_cyl(bm_roof, (wx, 0, 3.05), 1.85, 0.35, 0.85, segs=4, rot_euler=(0, 0, math.pi / 4.0))

    create_mesh_obj("SBG_ClockTower_StoneBase", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_ClockTower_WhiteShaft", bm_white, mats["stucco_white"], root)
    create_mesh_obj("SBG_ClockTower_TeakCanopy", bm_teak, mats["warm_teak"], root)
    create_mesh_obj("SBG_ClockTower_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_ClockTower_ClockFaces", bm_gold, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# MAIN BUILD & GLB EXPORT
# ---------------------------------------------------------------------------

def main():
    clear_scene()
    mats = build_materials()

    roots = [
        build_tanglin_silver_gate(mats),
        build_swan_lake_gazebo_bridge(mats),
        build_flight_of_swans_sculpture(mats),
        build_chopin_memorial_statue(mats),
        build_ginger_cavern_waterfall(mats),
        build_sph_walk_of_giants(mats),
        build_como_cempedak_play_pod(mats),
        build_jacob_ballas_treehouse_bridge(mats),
        build_sundial_garden_pergola(mats),
        build_nassim_clock_tower_gate(mats),
    ]

    depsgraph = bpy.context.evaluated_depsgraph_get()
    print("=== SBG SCULPTURES & BRIDGES SUMMARY ===")
    for r in roots:
        r.location = (0.0, 0.0, 0.0)
        v_cnt, t_cnt = 0, 0
        for ch in r.children_recursive:
            if ch.type == 'MESH':
                ev = ch.evaluated_get(depsgraph)
                m = ev.to_mesh()
                m.calc_loop_triangles()
                v_cnt += len(m.vertices)
                t_cnt += len(m.loop_triangles)
                ev.to_mesh_clear()
        print(f"  {r.name:34s} | verts={v_cnt:6d} | tris={t_cnt:6d}")

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    out_dir = os.path.join(repo_root, "public", "models", "sbg")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "sbg_sculptures_bridges.glb")

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
    )
    print(f"SUCCESSFULLY EXPORTED: {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    main()
