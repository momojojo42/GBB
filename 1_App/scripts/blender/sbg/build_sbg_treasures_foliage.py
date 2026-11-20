"""
Headless Blender 4.2 Script: Singapore Botanic Gardens (UNESCO World Heritage)
Heritage Trees, Botanical Flora & 42 Collectible Keepsake Relics (`sbg_treasures_foliage.glb`)

Exports `public/models/sbg/sbg_treasures_foliage.glb` containing 51 root nodes:
A. 9 Heritage Tree & Botanical Flora Root Nodes:
   1. SBG_Tembusu_Five_Dollar_Hero
   2. SBG_Rain_Tree_Monarch
   3. SBG_Kapok_Silk_Cotton_Giant
   4. SBG_Jelutong_Dipterocarp_Tower
   5. SBG_Talipot_Fan_Palm
   6. SBG_Cannonball_Couroupita_Tree
   7. SBG_Golden_Shower_Orchid_Arch
   8. SBG_Torch_Ginger_Heliconia_Cluster
   9. SBG_Giant_Tiger_Orchid_Clump
B. 42 Collectible Keepsake Relic Root Nodes (`SBG_Relic_01` .. `SBG_Relic_42` + category aliases)
"""

import bpy
import bmesh
import math
import os
import sys
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


def add_beveled_box(bm, loc, hx, hy, hz, rot_euler=(0.0, 0.0, 0.0), bevel_frac=0.18, segs=2):
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


def add_beveled_cyl(bm, loc, r1, r2, depth, segs=18, rot_euler=(0.0, 0.0, 0.0), cap_ends=True, bevel_frac=0.15):
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


def add_icosphere_puff(bm, center, radius, scale_xyz=(1.0, 1.0, 0.85), rot_euler=(0.0, 0.0, 0.0), subdivisions=2):
    bm_tmp = bmesh.new()
    bmesh.ops.create_icosphere(bm_tmp, subdivisions=subdivisions, radius=radius)
    cx, cy, cz = center[0], center[1], center[2]
    for v in bm_tmp.verts:
        wobble = 1.0 + 0.10 * math.sin(v.co.x * 3.8 + cx) * math.cos(v.co.y * 3.8 + cy)
        v.co.x *= wobble
        v.co.y *= wobble
        if v.co.z < 0:
            v.co.z *= 0.78  # Flatter shaded underside for natural tropical tree crowns
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(center, rot_euler, scale_xyz), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def add_canopy_cluster(bm_deep, bm_mid, bm_lush, center, radius, flatten_z=0.56, seed=0.0):
    """
    Creates a lush, multi-lobed organic tropical sub-crown cluster (central dome + 3 satellite puffs)
    across 3 complementary emerald foliage shades so trees look deeply layered and natural.
    """
    cx, cy, cz = center
    add_icosphere_puff(bm_mid, (cx, cy, cz), radius, scale_xyz=(1.22, 1.16, flatten_z), subdivisions=2)
    add_icosphere_puff(bm_deep, (cx - radius * 0.36 * math.cos(seed), cy - radius * 0.36 * math.sin(seed), cz - radius * 0.16),
                       radius * 0.78, scale_xyz=(1.20, 1.15, flatten_z * 0.92), subdivisions=2)
    add_icosphere_puff(bm_lush, (cx + radius * 0.32 * math.sin(seed), cy - radius * 0.32 * math.cos(seed), cz + radius * 0.22),
                       radius * 0.74, scale_xyz=(1.18, 1.12, flatten_z * 0.95), subdivisions=2)


def add_plank_buttress(bm, ang, r_outer, h_top, thickness=0.14, r_inner=0.22):
    """Creates a sinuous, curved triangular rainforest plank root buttress."""
    dx, dy = math.cos(ang), math.sin(ang)
    pts = [
        (dx * r_outer, dy * r_outer, 0.02),
        (dx * (r_outer * 0.72), dy * (r_outer * 0.72), h_top * 0.28),
        (dx * (r_outer * 0.44), dy * (r_outer * 0.44), h_top * 0.62),
        (dx * r_inner, dy * r_inner, h_top),
    ]
    radii = [thickness * 1.45, thickness * 1.25, thickness * 0.95, thickness * 0.55]
    add_polyline_tube(bm, pts, radii, segments=8)
    # Fill inner web between plank ridge and trunk
    web_pts = [
        (dx * (r_outer * 0.52), dy * (r_outer * 0.52), 0.04),
        (dx * (r_outer * 0.32), dy * (r_outer * 0.32), h_top * 0.45),
        (dx * (r_inner * 0.85), dy * (r_inner * 0.85), h_top * 0.82),
    ]
    add_polyline_tube(bm, web_pts, [thickness * 1.6, thickness * 1.2, thickness * 0.6], segments=8)


def build_materials():
    return {
        # Tree barks & foliage
        "bark_tembusu": create_material("SBG_Tembusu_Fluted_Bark", "#4A2E1B", metallic=0.02, roughness=0.78),
        "bark_rain": create_material("SBG_RainTree_Dark_Bark", "#5C4033", metallic=0.02, roughness=0.74),
        "bark_kapok": create_material("SBG_Kapok_Buttress_Bark", "#6B5344", metallic=0.04, roughness=0.72),
        "bark_jelutong": create_material("SBG_Jelutong_Grey_Bark", "#78716C", metallic=0.04, roughness=0.68),
        "bark_palm": create_material("SBG_Talipot_Ringed_Trunk", "#94A3B8", metallic=0.04, roughness=0.62),
        "teak_prop": create_material("SBG_Tembusu_Prop_Teak", "#92400E", metallic=0.10, roughness=0.48),
        "foliage_deep": create_material("SBG_Canopy_Deep_Green", "#15803D", metallic=0.02, roughness=0.52),
        "foliage_mid": create_material("SBG_Canopy_Mid_Green", "#16A34A", metallic=0.02, roughness=0.48),
        "foliage_lush": create_material("SBG_Canopy_Lush_Green", "#22C55E", metallic=0.04, roughness=0.44),
        "foliage_lime": create_material("SBG_Canopy_Lime_Crown", "#84CC16", metallic=0.04, roughness=0.42),
        "samanea_pink": create_material("SBG_RainTree_Samanea_Pink", "#F472B6", metallic=0.05, roughness=0.36,
                                        emission_hex="#F9A8D4", emission_strength=0.28),
        "tembusu_blossom": create_material("SBG_Tembusu_Cream_Blossom", "#FEF08A", metallic=0.10, roughness=0.30,
                                           emission_hex="#F59E0B", emission_strength=0.48),
        "cannonball_fruit": create_material("SBG_Cannonball_Brown_Sphere", "#78350F", metallic=0.12, roughness=0.48),
        "cannonball_bloom": create_material("SBG_Cannonball_Coral_Gold", "#FB7185", metallic=0.10, roughness=0.32,
                                            emission_hex="#F43F5E", emission_strength=0.38),
        "orchid_yellow": create_material("SBG_Oncidium_Golden_Shower", "#FACC15", metallic=0.15, roughness=0.25,
                                         emission_hex="#EAB308", emission_strength=0.75),
        "ginger_crimson": create_material("SBG_Torch_Ginger_Crimson", "#EF4444", metallic=0.08, roughness=0.28,
                                          emission_hex="#DC2626", emission_strength=0.55),
        "heliconia_orange": create_material("SBG_Heliconia_Lobster_Orange", "#F97316", metallic=0.08, roughness=0.28,
                                            emission_hex="#EA580C", emission_strength=0.45),
        "tiger_maroon": create_material("SBG_Tiger_Orchid_Maroon", "#991B1B", metallic=0.10, roughness=0.30),
        "wrought_iron": create_material("SBG_Trellis_Wrought_Iron", "#1E293B", metallic=0.72, roughness=0.35),

        # Relic keepsake materials
        "gold_bright": create_material("SBG_Relic_Gold_24K", "#FACC15", metallic=0.90, roughness=0.18,
                                       emission_hex="#F59E0B", emission_strength=0.35),
        "bronze_warm": create_material("SBG_Relic_Bronze_Warm", "#B45309", metallic=0.84, roughness=0.26,
                                       emission_hex="#D97706", emission_strength=0.15),
        "silver_plat": create_material("SBG_Relic_Silver_Leaf", "#E2E8F0", metallic=0.92, roughness=0.16,
                                       emission_hex="#94A3B8", emission_strength=0.20),
        "ivory_marble": create_material("SBG_Relic_Ivory_Porcelain", "#FFFBEB", metallic=0.05, roughness=0.22,
                                        emission_hex="#FEF3C7", emission_strength=0.20),
        "cyan_crystal": create_material("SBG_Relic_Cyan_Crystal", "#22D3EE", metallic=0.15, roughness=0.12,
                                        emission_hex="#06B6D4", emission_strength=1.45),
        "sapphire_blue": create_material("SBG_Relic_Sapphire_Blue", "#2563EB", metallic=0.35, roughness=0.20,
                                         emission_hex="#3B82F6", emission_strength=0.65),
        "amethyst_purple": create_material("SBG_Relic_Royal_Amethyst", "#9333EA", metallic=0.25, roughness=0.18,
                                           emission_hex="#A855F7", emission_strength=0.95),
        "crimson_lacquer": create_material("SBG_Relic_Crimson_Lacquer", "#DC2626", metallic=0.15, roughness=0.20,
                                           emission_hex="#EF4444", emission_strength=0.38),
        "terracotta": create_material("SBG_Relic_Terracotta", "#C2410C", metallic=0.06, roughness=0.48),
        "zen_stone": create_material("SBG_Relic_Dark_Stone", "#334155", metallic=0.12, roughness=0.52),
        "velvet_emerald": create_material("SBG_Relic_Velvet_Emerald", "#065F46", metallic=0.08, roughness=0.36,
                                          emission_hex="#10B981", emission_strength=0.22),
        "tiger_mahogany": create_material("SBG_Relic_Teak_Mahogany", "#7C2D12", metallic=0.10, roughness=0.32),
        "orchid_magenta": create_material("SBG_Relic_Orchid_Magenta", "#EC4899", metallic=0.12, roughness=0.22,
                                          emission_hex="#DB2777", emission_strength=0.65),
        "chartreuse": create_material("SBG_Relic_Chartreuse_Flora", "#84CC16", metallic=0.08, roughness=0.28,
                                      emission_hex="#A3E635", emission_strength=0.35),
    }


# ---------------------------------------------------------------------------
# PART A: 9 HERITAGE TREES & BOTANICAL FLORA ROOT NODES
# ---------------------------------------------------------------------------

def build_tembusu_five_dollar_hero(mats):
    """
    1. SBG_Tembusu_Five_Dollar_Hero:
    Famous $5-note Heritage Tembusu tree (Cyrtophyllum fragrans) at Lawn E:
    - Deeply fluted, fissured dark-brown trunk with 8 twisting bark ridges & buttress roots
    - The famous long, low horizontal branch swooping out parallel to the ground (~4.2m reach)
      supported by a realistic two-post timber prop cradle
    - 7 gnarled ascending primary boughs + secondary forks
    - 24+ layered organic emerald foliage sub-crowns across 3 green shades + creamy-yellow Tembusu flower clusters
    """
    root = create_root_empty("SBG_Tembusu_Five_Dollar_Hero")

    bm_bark = bmesh.new()
    bm_prop = bmesh.new()
    bm_deep = bmesh.new()
    bm_mid = bmesh.new()
    bm_lush = bmesh.new()
    bm_bloom = bmesh.new()

    # Deeply fluted primary trunk + 8 twisting bark ridges & root buttresses
    add_polyline_tube(
        bm_bark,
        [(0, 0, 0), (0.06, -0.04, 1.5), (-0.08, 0.06, 3.2), (-0.04, 0.02, 4.8), (0, 0, 5.8)],
        [0.78, 0.58, 0.48, 0.38, 0.30], segments=14
    )
    for i in range(8):
        ang = 2.0 * math.pi * i / 8.0
        ang_top = ang + 0.35
        add_polyline_tube(
            bm_bark,
            [(math.cos(ang) * 1.25, math.sin(ang) * 1.25, 0.02),
             (math.cos(ang + 0.12) * 0.72, math.sin(ang + 0.12) * 0.72, 0.95),
             (math.cos(ang + 0.24) * 0.52, math.sin(ang + 0.24) * 0.52, 2.25),
             (math.cos(ang_top) * 0.42, math.sin(ang_top) * 0.42, 3.65)],
            [0.24, 0.20, 0.15, 0.10], segments=8
        )

    # THE ICONIC $5-NOTE LOW HORIZONTAL SWOOPING BRANCH (reaching ~4.35m out along +X / -Y)
    swoop_pts = [
        (0.22, -0.05, 1.65),
        (1.15, -0.14, 1.28),
        (2.15, -0.18, 1.18),
        (2.95, -0.16, 1.22),
        (3.75, -0.08, 1.58),
        (4.35, 0.05, 2.28),
        (4.78, 0.18, 2.95),
    ]
    add_polyline_tube(bm_bark, swoop_pts, [0.36, 0.31, 0.27, 0.24, 0.20, 0.15, 0.10], segments=12)
    # Secondary fork branchlets off the horizontal limb
    add_polyline_tube(bm_bark, [(3.45, -0.12, 1.42), (4.15, -0.75, 2.15), (4.55, -1.05, 2.65)], [0.16, 0.11, 0.07], segments=8)
    add_polyline_tube(bm_bark, [(3.95, -0.02, 1.78), (4.35, 0.82, 2.45)], [0.14, 0.08], segments=8)

    # Realistic Two-Post Timber Prop Cradle supporting the horizontal branch at x = 2.75m, y = -0.17m
    px, py = 2.75, -0.17
    for sy_off in (-0.26, 0.26):
        add_beveled_cyl(bm_prop, (px, py + sy_off, 0.62), 0.095, 0.085, 1.24, segs=10)
        # Base footing block
        add_beveled_box(bm_prop, (px, py + sy_off, 0.06), 0.14, 0.14, 0.06)
        # Diagonal knee brace to upper saddle beam
        add_polyline_tube(bm_prop, [(px, py + sy_off, 0.72), (px, py + sy_off * 0.35, 1.12)], [0.05, 0.05], segments=6)
    # Upper saddle crossbeam & lower tie rail
    add_beveled_box(bm_prop, (px, py, 1.12), 0.18, 0.38, 0.08)
    add_beveled_box(bm_prop, (px, py, 0.48), 0.08, 0.34, 0.06)

    # 7 Gnarled Ascending Crown Limbs + Secondary Forks
    limb_specs = [
        [(0, 0, 3.8), (-1.2, -1.0, 4.9), (-2.3, -1.6, 5.9), (-2.9, -2.0, 6.4)],
        [(0, 0, 4.0), (1.1, -1.1, 5.0), (2.2, -1.8, 6.0), (2.7, -2.1, 6.5)],
        [(0, 0, 4.1), (-1.3, 1.0, 5.1), (-2.4, 1.8, 6.1), (-2.8, 2.2, 6.6)],
        [(0, 0, 4.2), (1.2, 1.1, 5.2), (2.3, 1.9, 6.2), (2.8, 2.2, 6.7)],
        [(0, 0, 4.4), (-1.6, 0.0, 5.5), (-2.8, -0.2, 6.3)],
        [(0, 0, 4.5), (1.5, 0.2, 5.6), (2.6, 0.3, 6.4)],
        [(0, 0, 4.8), (0.0, -1.4, 5.9), (0.0, -2.3, 6.6)],
    ]
    for pts in limb_specs:
        radii = [0.28 - 0.06 * k for k in range(len(pts))]
        add_polyline_tube(bm_bark, pts, radii, segments=10)
        # Add lush multi-puff canopy cluster at each primary limb tip & mid-fork
        tip = pts[-1]
        mid_pt = pts[-2]
        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (tip[0], tip[1], tip[2] + 0.32), 1.25, flatten_z=0.52, seed=tip[0])
        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (mid_pt[0] * 0.9, mid_pt[1] * 0.9, mid_pt[2] + 0.85), 1.32, flatten_z=0.54, seed=mid_pt[1])

    # Central apex canopy domes
    for cx, cy, cz, r in [(0.0, 0.0, 7.25, 1.65), (-0.85, -0.65, 6.95, 1.35), (0.85, 0.65, 7.05, 1.35), (0.0, 1.25, 6.75, 1.28)]:
        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (cx, cy, cz), r, flatten_z=0.52, seed=cx + cy)

    # Lush foliage clouds on the horizontal swooping $5-note branch
    for cx, cy, cz, r in [(4.75, 0.15, 3.15, 1.18), (4.45, -0.95, 2.82, 0.98), (4.25, 0.78, 2.68, 0.92), (3.65, -0.10, 2.15, 0.88)]:
        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (cx, cy, cz), r, flatten_z=0.50, seed=cx)

    # Creamy-yellow fragrant Tembusu flower clusters dotting the upper & lateral crowns
    bloom_pts = [
        (0.0, -0.4, 7.95), (-1.4, -1.2, 7.35), (1.5, -1.3, 7.45), (-2.5, -1.8, 6.95),
        (2.4, -1.9, 7.05), (-2.4, 1.6, 7.15), (2.3, 1.7, 7.20), (-2.7, -0.2, 6.85),
        (2.5, 0.3, 6.95), (0.0, -2.2, 7.10), (4.85, 0.15, 3.68), (4.48, -0.95, 3.28),
        (3.75, -0.15, 2.58), (-0.9, 1.1, 7.45),
    ]
    for bx, by, bz in bloom_pts:
        add_icosphere_puff(bm_bloom, (bx, by, bz), 0.24, scale_xyz=(1.2, 1.2, 0.72), subdivisions=1)
        add_icosphere_puff(bm_bloom, (bx + 0.18, by - 0.12, bz - 0.08), 0.16, subdivisions=1)

    create_mesh_obj("SBG_Tembusu_FlutedTrunk", bm_bark, mats["bark_tembusu"], root)
    create_mesh_obj("SBG_Tembusu_SupportPost", bm_prop, mats["teak_prop"], root)
    create_mesh_obj("SBG_Tembusu_CanopyDeep", bm_deep, mats["foliage_deep"], root)
    create_mesh_obj("SBG_Tembusu_CanopyMid", bm_mid, mats["foliage_mid"], root)
    create_mesh_obj("SBG_Tembusu_CanopyLush", bm_lush, mats["foliage_lush"], root)
    create_mesh_obj("SBG_Tembusu_Blossoms", bm_bloom, mats["tembusu_blossom"], root)
    return root


def build_rain_tree_monarch(mats):
    """
    2. SBG_Rain_Tree_Monarch:
    Wide umbrella-crowned Heritage Rain Tree (Samanea saman):
    - Flared buttress roots & stout rugged trunk forking low into 6 wide-spreading boughs + 12 secondary limbs
    - Sculpted bird's-nest fern (Asplenium nidus) epiphyte rosettes perched on the main forks
    - 28+ wide flattened umbrella foliage clouds across 3 green shades + rose-pink powder-puff blossoms
    """
    root = create_root_empty("SBG_Rain_Tree_Monarch")

    bm_bark = bmesh.new()
    bm_deep = bmesh.new()
    bm_mid = bmesh.new()
    bm_lush = bmesh.new()
    bm_pink = bmesh.new()
    bm_epi = bmesh.new()

    # Stout trunk & 7 flared buttress roots
    add_polyline_tube(bm_bark, [(0, 0, 0), (0, 0, 1.25), (0, 0, 2.35)], [0.68, 0.48, 0.42], segments=14)
    for i in range(7):
        ang = 2.0 * math.pi * i / 7.0
        add_plank_buttress(bm_bark, ang, r_outer=1.28, h_top=1.55, thickness=0.14, r_inner=0.36)

    # 6 wide-spreading primary boughs + 12 secondary fork branches + bird's-nest fern epiphytes
    for i in range(6):
        ang = 2.0 * math.pi * i / 6.0 + 0.25
        mx, my = math.cos(ang) * 1.45, math.sin(ang) * 1.45
        lx, ly = math.cos(ang) * 2.85, math.sin(ang) * 2.85
        add_polyline_tube(bm_bark, [(0, 0, 2.15), (mx, my, 3.15), (lx, ly, 4.15)], [0.28, 0.20, 0.12], segments=10)

        # Bird's-nest fern epiphyte rosette perched on the primary limb at (mx, my, 3.25)
        add_icosphere_puff(bm_bark, (mx, my, 3.22), 0.18, scale_xyz=(1.2, 1.2, 0.7), subdivisions=1)
        for f_i in range(7):
            f_ang = 2.0 * math.pi * f_i / 7.0
            fx = mx + math.cos(f_ang) * 0.34
            fy = my + math.sin(f_ang) * 0.34
            add_icosphere_puff(bm_epi, (fx, fy, 3.38), 0.22, scale_xyz=(1.55, 0.45, 0.22), rot_euler=(0, -0.48, f_ang), subdivisions=1)

        # Twin secondary outward forks
        for s_off in (-0.38, 0.38):
            ang2 = ang + s_off
            tx, ty = math.cos(ang2) * 3.55, math.sin(ang2) * 3.55
            add_polyline_tube(bm_bark, [(mx, my, 3.15), (tx, ty, 4.35)], [0.16, 0.08], segments=8)
            add_canopy_cluster(bm_deep, bm_mid, bm_lush, (tx * 0.95, ty * 0.95, 4.55), 1.15, flatten_z=0.45, seed=ang2)
            # Rose-pink Samanea powder-puff blossoms on outer umbrella rim
            add_icosphere_puff(bm_pink, (tx * 0.98, ty * 0.98, 5.02), 0.26, scale_xyz=(1.35, 1.35, 0.48), subdivisions=1)

        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (lx * 0.78, ly * 0.78, 4.95), 1.35, flatten_z=0.46, seed=ang)
        add_icosphere_puff(bm_pink, (lx * 0.80, ly * 0.80, 5.52), 0.30, scale_xyz=(1.4, 1.4, 0.48), subdivisions=1)

    # Central wide flat-topped umbrella dome crown
    add_canopy_cluster(bm_deep, bm_mid, bm_lush, (0, 0, 5.35), 1.85, flatten_z=0.44, seed=1.5)
    for k in range(5):
        ang = 2.0 * math.pi * k / 5.0
        add_icosphere_puff(bm_pink, (math.cos(ang) * 0.95, math.sin(ang) * 0.95, 5.95), 0.32, scale_xyz=(1.4, 1.4, 0.45), subdivisions=1)
    add_icosphere_puff(bm_pink, (0, 0, 6.12), 0.36, scale_xyz=(1.45, 1.45, 0.45), subdivisions=1)

    create_mesh_obj("SBG_RainTree_Trunk", bm_bark, mats["bark_rain"], root)
    create_mesh_obj("SBG_RainTree_CanopyDeep", bm_deep, mats["foliage_deep"], root)
    create_mesh_obj("SBG_RainTree_UmbrellaCrown", bm_mid, mats["foliage_mid"], root)
    create_mesh_obj("SBG_RainTree_CanopyLush", bm_lush, mats["foliage_lush"], root)
    create_mesh_obj("SBG_RainTree_PinkPuffs", bm_pink, mats["samanea_pink"], root)
    create_mesh_obj("SBG_RainTree_Epiphytes", bm_epi, mats["foliage_lime"], root)
    return root


def build_kapok_silk_cotton_giant(mats):
    """
    3. SBG_Kapok_Silk_Cotton_Giant:
    Tall buttressed emergent Learning Forest tree (Ceiba pentandra):
    - 7 dramatic sinuous plank root buttresses flaring out 1.8m from the trunk base
    - Tall straight columnar trunk rising to 8.6m
    - 3 horizontal pagoda tiers of wide-spreading branches with 24+ layered emergent foliage clouds
    """
    root = create_root_empty("SBG_Kapok_Silk_Cotton_Giant")

    bm_bark = bmesh.new()
    bm_deep = bmesh.new()
    bm_mid = bmesh.new()
    bm_lush = bmesh.new()
    bm_pods = bmesh.new()

    # Tall columnar trunk up to 8.6m
    add_polyline_tube(bm_bark, [(0, 0, 0), (0, 0, 2.8), (0, 0, 5.8), (0, 0, 8.6)], [0.68, 0.48, 0.40, 0.26], segments=16)

    # 7 dramatic curved plank root buttresses flaring out at ground level
    for i in range(7):
        ang = 2.0 * math.pi * i / 7.0
        add_plank_buttress(bm_bark, ang, r_outer=1.82, h_top=2.45, thickness=0.15, r_inner=0.38)

    # 3 distinct tiered pagoda-like horizontal emergent branch layers
    tier_specs = [
        (5.1, 2.45, 1.05, 5, 0.15),
        (6.7, 2.85, 1.18, 5, 0.78),
        (8.2, 2.05, 1.12, 4, 0.42),
    ]
    for z_tier, spread, r_fol, n_limbs, ang_off in tier_specs:
        for k in range(n_limbs):
            ang = (2.0 * math.pi * k / n_limbs) + ang_off
            mx, my = math.cos(ang) * (spread * 0.55), math.sin(ang) * (spread * 0.55)
            tx, ty = math.cos(ang) * spread, math.sin(ang) * spread
            add_polyline_tube(bm_bark, [(0, 0, z_tier), (mx, my, z_tier + 0.18), (tx, ty, z_tier + 0.36)],
                              [0.20, 0.14, 0.08], segments=8)
            add_canopy_cluster(bm_deep, bm_mid, bm_lush, (tx, ty, z_tier + 0.65), r_fol, flatten_z=0.44, seed=ang + z_tier)
            # Hanging kapok silk-cotton pod under lower branches
            if z_tier < 7.0 and k % 2 == 0:
                add_icosphere_puff(bm_pods, (mx, my, z_tier - 0.12), 0.14, scale_xyz=(0.7, 0.7, 1.6), subdivisions=1)

    add_canopy_cluster(bm_deep, bm_mid, bm_lush, (0, 0, 9.15), 1.45, flatten_z=0.45, seed=2.2)

    create_mesh_obj("SBG_Kapok_ButtressedTrunk", bm_bark, mats["bark_kapok"], root)
    create_mesh_obj("SBG_Kapok_CanopyDeep", bm_deep, mats["foliage_deep"], root)
    create_mesh_obj("SBG_Kapok_CanopyMid", bm_mid, mats["foliage_mid"], root)
    create_mesh_obj("SBG_Kapok_EmergentCrown", bm_lush, mats["foliage_lush"], root)
    create_mesh_obj("SBG_Kapok_CottonPods", bm_pods, mats["tembusu_blossom"], root)
    return root


def build_jelutong_dipterocarp_tower(mats):
    """
    4. SBG_Jelutong_Dipterocarp_Tower:
    Straight-boled primary rainforest emergent tree (Dyera costulata):
    - Tall cylindrical grey-brown trunk with basal root flares & bark rings
    - Multi-tiered emergent cauliflower-shaped crown with 8 radiating limbs & 24+ foliage clouds
    """
    root = create_root_empty("SBG_Jelutong_Dipterocarp_Tower")

    bm_bark = bmesh.new()
    bm_deep = bmesh.new()
    bm_mid = bmesh.new()
    bm_lush = bmesh.new()

    # Straight cylindrical grey-brown bole with basal root flares
    add_polyline_tube(bm_bark, [(0, 0, 0), (0, 0, 3.2), (0, 0, 6.4), (0, 0, 8.8)], [0.60, 0.46, 0.40, 0.26], segments=16)
    for i in range(6):
        ang = 2.0 * math.pi * i / 6.0
        add_plank_buttress(bm_bark, ang, r_outer=1.18, h_top=1.35, thickness=0.12, r_inner=0.38)

    # Lower verticil of branches (z = 6.2m) + upper emergent crown (z = 7.6m)
    for z_b, spread, r_c, count, phase in [(6.1, 1.95, 1.02, 4, 0.2), (7.5, 2.35, 1.18, 6, 0.65)]:
        for i in range(count):
            ang = 2.0 * math.pi * i / count + phase
            mx, my = math.cos(ang) * (spread * 0.55), math.sin(ang) * (spread * 0.55)
            tx, ty = math.cos(ang) * spread, math.sin(ang) * spread
            add_polyline_tube(bm_bark, [(0, 0, z_b), (mx, my, z_b + 0.65), (tx, ty, z_b + 1.15)], [0.20, 0.14, 0.08], segments=8)
            add_canopy_cluster(bm_deep, bm_mid, bm_lush, (tx, ty, z_b + 1.45), r_c, flatten_z=0.50, seed=ang)

    add_canopy_cluster(bm_deep, bm_mid, bm_lush, (0, 0, 9.55), 1.55, flatten_z=0.52, seed=0.8)

    create_mesh_obj("SBG_Jelutong_StraightBole", bm_bark, mats["bark_jelutong"], root)
    create_mesh_obj("SBG_Jelutong_CanopyDeep", bm_deep, mats["foliage_deep"], root)
    create_mesh_obj("SBG_Jelutong_CanopyMid", bm_mid, mats["foliage_mid"], root)
    create_mesh_obj("SBG_Jelutong_CanopyLush", bm_lush, mats["foliage_lush"], root)
    return root


def build_talipot_fan_palm(mats):
    """
    5. SBG_Talipot_Fan_Palm:
    Monumental fan palm (Corypha umbraculifera) for Palm Valley:
    - Stout ringed trunk with 16 horizontal leaf-scar rings
    - 20 radiating petioles in 3 tiers, each topped with a multi-ribbed pleated palmate fan blade
    - Towering branched golden-cream terminal flower panicle plume at apex
    """
    root = create_root_empty("SBG_Talipot_Fan_Palm")

    bm_trunk = bmesh.new()
    bm_fronds = bmesh.new()
    bm_lush = bmesh.new()
    bm_plume = bmesh.new()

    # Stout ringed palm trunk + horizontal leaf-scar rings
    add_polyline_tube(bm_trunk, [(0, 0, 0), (0, 0, 1.6), (0, 0, 3.2), (0, 0, 4.6)], [0.50, 0.42, 0.37, 0.33], segments=16)
    for r_i in range(14):
        rz = 0.25 + r_i * 0.30
        rad = 0.49 - r_i * 0.011
        add_beveled_cyl(bm_trunk, (0, 0, rz), rad, rad, 0.05, segs=16)

    # 20 monumental palmate fan fronds in 3 spherical tiers, each with a 7-ribbed pleated fan blade
    tiers = [
        (8, -0.08, 2.35, 4.35),
        (7, 0.28, 2.15, 4.55),
        (5, 0.62, 1.65, 4.72),
    ]
    for n_f, elev, reach, z0 in tiers:
        for i in range(n_f):
            az = (2.0 * math.pi * i / n_f) + elev
            dx, dy = math.cos(az), math.sin(az)
            mid = (dx * reach * 0.55, dy * reach * 0.55, z0 + math.sin(elev + 0.25) * 0.65)
            tip = (dx * reach, dy * reach, z0 + math.sin(elev) * 1.15)
            add_polyline_tube(bm_fronds, [(0, 0, z0), mid, tip], [0.075, 0.05, 0.03], segments=6)

            # Multi-ribbed pleated palmate fan blade (7 radiating leaflet lobes per fan frond)
            target_bm = bm_fronds if (i % 2 == 0) else bm_lush
            for lobe in range(-3, 4):
                l_ang = az + lobe * 0.22
                l_len = 0.88 - abs(lobe) * 0.07
                lx = tip[0] + math.cos(l_ang) * l_len * 0.52
                ly = tip[1] + math.sin(l_ang) * l_len * 0.52
                lz = tip[2] - 0.08 * abs(lobe)
                add_icosphere_puff(
                    target_bm, (lx, ly, lz), 0.28,
                    scale_xyz=(1.95, 0.34, 0.12),
                    rot_euler=(0.12 * lobe, 0.28 - elev * 0.5, l_ang),
                    subdivisions=1
                )

    # Towering branched golden-cream terminal flower panicle plume at apex (Corypha inflorescence)
    add_polyline_tube(bm_plume, [(0, 0, 4.75), (0, 0, 6.85)], [0.18, 0.04], segments=10)
    for p_i in range(14):
        frac = p_i / 13.0
        pz = 5.05 + frac * 1.65
        p_reach = (1.0 - frac * 0.72) * 1.15
        p_ang = p_i * 2.399
        px = math.cos(p_ang) * p_reach
        py = math.sin(p_ang) * p_reach
        add_polyline_tube(bm_plume, [(0, 0, pz), (px * 0.6, py * 0.6, pz + 0.14), (px, py, pz + 0.05)], [0.06, 0.04, 0.02], segments=6)
        add_icosphere_puff(bm_plume, (px * 0.75, py * 0.75, pz + 0.12), 0.22 * (1.0 - frac * 0.35), scale_xyz=(1.35, 0.85, 0.65), rot_euler=(0, 0, p_ang), subdivisions=1)
        add_icosphere_puff(bm_plume, (px, py, pz + 0.06), 0.18 * (1.0 - frac * 0.35), subdivisions=1)

    create_mesh_obj("SBG_Talipot_RingedTrunk", bm_trunk, mats["bark_palm"], root)
    create_mesh_obj("SBG_Talipot_FanFronds", bm_fronds, mats["foliage_mid"], root)
    create_mesh_obj("SBG_Talipot_LushFronds", bm_lush, mats["foliage_lush"], root)
    create_mesh_obj("SBG_Talipot_FlowerPlume", bm_plume, mats["tembusu_blossom"], root)
    return root


def build_cannonball_couroupita_tree(mats):
    """
    6. SBG_Cannonball_Couroupita_Tree:
    Trunk-flowering cauliflorous heritage tree (Couroupita guianensis):
    - Flared roots & gnarled trunk draped in hanging woody flower/fruit racemes
    - 14 spherical brown cannonball fruits & 18 coral-gold hooded blossoms along trunk
    - 6 ascending crown limbs + 18 layered emerald foliage puffs
    """
    root = create_root_empty("SBG_Cannonball_Couroupita_Tree")

    bm_bark = bmesh.new()
    bm_fruit = bmesh.new()
    bm_bloom = bmesh.new()
    bm_stamen = bmesh.new()
    bm_deep = bmesh.new()
    bm_mid = bmesh.new()
    bm_lush = bmesh.new()

    add_polyline_tube(bm_bark, [(0, 0, 0), (0.04, -0.03, 2.0), (-0.03, 0.04, 4.2)], [0.52, 0.40, 0.30], segments=14)
    for i in range(5):
        ang = 2.0 * math.pi * i / 5.0
        add_plank_buttress(bm_bark, ang, r_outer=0.95, h_top=1.15, thickness=0.11, r_inner=0.32)

    # Cauliflorous hanging woody vines/racemes along trunk bearing cannonball fruits & coral-gold flowers
    for i in range(16):
        ang = i * 1.35
        z_h = 1.05 + (i / 15.0) * 2.55
        dx, dy = math.cos(ang), math.sin(ang)
        v_pts = [
            (dx * 0.36, dy * 0.36, z_h + 0.18),
            (dx * 0.68, dy * 0.68, z_h + 0.02),
            (dx * 0.82, dy * 0.82, z_h - 0.24),
        ]
        add_polyline_tube(bm_bark, v_pts, [0.028, 0.022, 0.015], segments=6)
        if i % 2 == 0:
            add_icosphere_puff(bm_fruit, v_pts[-1], 0.20, scale_xyz=(1.0, 1.0, 1.0), subdivisions=2)
            add_icosphere_puff(bm_bloom, v_pts[1], 0.13, scale_xyz=(1.25, 1.25, 0.85), subdivisions=1)
        else:
            add_icosphere_puff(bm_bloom, v_pts[-1], 0.15, scale_xyz=(1.25, 1.25, 0.85), subdivisions=1)
            add_icosphere_puff(bm_stamen, (v_pts[-1][0] * 1.05, v_pts[-1][1] * 1.05, v_pts[-1][2] + 0.04), 0.09, subdivisions=1)

    # 6 ascending branches + lush multi-layered crown
    for i in range(6):
        ang = 2.0 * math.pi * i / 6.0
        tx, ty = math.cos(ang) * 1.75, math.sin(ang) * 1.75
        add_polyline_tube(bm_bark, [(0, 0, 3.85), (tx * 0.6, ty * 0.6, 4.55), (tx, ty, 5.15)], [0.20, 0.14, 0.08], segments=8)
        add_canopy_cluster(bm_deep, bm_mid, bm_lush, (tx, ty, 5.45), 1.18, flatten_z=0.54, seed=ang)

    add_canopy_cluster(bm_deep, bm_mid, bm_lush, (0, 0, 6.15), 1.55, flatten_z=0.54, seed=1.1)

    create_mesh_obj("SBG_Cannonball_Trunk", bm_bark, mats["bark_rain"], root)
    create_mesh_obj("SBG_Cannonball_Fruits", bm_fruit, mats["cannonball_fruit"], root)
    create_mesh_obj("SBG_Cannonball_CoralBlooms", bm_bloom, mats["cannonball_bloom"], root)
    create_mesh_obj("SBG_Cannonball_GoldStamens", bm_stamen, mats["tembusu_blossom"], root)
    create_mesh_obj("SBG_Cannonball_CanopyDeep", bm_deep, mats["foliage_deep"], root)
    create_mesh_obj("SBG_Cannonball_Canopy", bm_mid, mats["foliage_mid"], root)
    create_mesh_obj("SBG_Cannonball_CanopyLush", bm_lush, mats["foliage_lush"], root)
    return root


def build_golden_shower_orchid_arch(mats):
    """
    7. SBG_Golden_Shower_Orchid_Arch:
    Walk-through arched trellis tunnel covered in cascading golden-yellow Oncidium & magenta Vanda blooms.
    """
    root = create_root_empty("SBG_Golden_Shower_Orchid_Arch")

    bm_iron = bmesh.new()
    bm_gold = bmesh.new()
    bm_mag = bmesh.new()
    bm_green = bmesh.new()

    # 4 connected wrought-iron double arches forming a rich walk-through tunnel along Y (-1.8..+1.8m)
    for ay in (-1.8, -0.6, 0.6, 1.8):
        pts = [(math.cos(s / 18.0 * math.pi) * 2.20, ay, math.sin(s / 18.0 * math.pi) * 2.90) for s in range(19)]
        add_polyline_tube(bm_iron, pts, 0.06, segments=8)
        for s in range(1, 18):
            ox, oy, oz = pts[s]
            # Lush trailing leaf vines along the arch
            add_icosphere_puff(bm_green, (ox * 1.03, oy, oz + 0.12), 0.24, scale_xyz=(1.15, 1.15, 0.55), subdivisions=1)
            # Pendulous cascading sprays of Golden Shower Oncidium blossoms hanging inside & around arch
            for drop_k in range(3):
                dz = oz - 0.08 - drop_k * 0.20
                dx = ox * (0.98 - drop_k * 0.03)
                rad = 0.20 - drop_k * 0.035
                if (s + drop_k) % 4 == 0:
                    add_icosphere_puff(bm_mag, (dx, oy + (drop_k - 1) * 0.08, dz), rad, scale_xyz=(1.1, 1.1, 1.25), subdivisions=1)
                else:
                    add_icosphere_puff(bm_gold, (dx, oy + (drop_k - 1) * 0.08, dz), rad, scale_xyz=(1.1, 1.1, 1.30), subdivisions=1)

    # Longitudinal purlins tying the 4 arches together
    for s in (2, 5, 7, 9, 11, 13, 16):
        ang = s / 18.0 * math.pi
        add_beveled_box(bm_iron, (math.cos(ang) * 2.20, 0.0, math.sin(ang) * 2.90), 0.04, 1.92, 0.04)

    create_mesh_obj("SBG_OrchidArch_IronTrellis", bm_iron, mats["wrought_iron"], root)
    create_mesh_obj("SBG_OrchidArch_GoldenOncidiums", bm_gold, mats["orchid_yellow"], root)
    create_mesh_obj("SBG_OrchidArch_MagentaVandas", bm_mag, mats["orchid_magenta"], root)
    create_mesh_obj("SBG_OrchidArch_FoliageVines", bm_green, mats["foliage_lush"], root)
    return root


def build_torch_ginger_heliconia_cluster(mats):
    """
    8. SBG_Torch_Ginger_Heliconia_Cluster:
    Vibrant crimson Torch Ginger cones (Etlingera elatior), hanging lobster-claw heliconias & broad paddle leaves.
    """
    root = create_root_empty("SBG_Torch_Ginger_Heliconia_Cluster")

    bm_leaves = bmesh.new()
    bm_lush = bmesh.new()
    bm_ginger = bmesh.new()
    bm_heliconia = bmesh.new()
    bm_gold = bmesh.new()

    # 16 broad paddle-shaped tropical Zingiberaceae leaves fanning outward in 2 tiers
    for i in range(16):
        ang = 2.0 * math.pi * i / 16.0
        dx, dy = math.cos(ang), math.sin(ang)
        reach = 1.45 if i % 2 == 0 else 1.15
        top_z = 1.85 if i % 2 == 0 else 1.42
        target_leaf = bm_leaves if i % 2 == 0 else bm_lush
        add_polyline_tube(target_leaf, [(0, 0, 0), (dx * reach * 0.48, dy * reach * 0.48, top_z * 0.68), (dx * reach, dy * reach, top_z)],
                          [0.055, 0.040, 0.018], segments=8)
        add_icosphere_puff(target_leaf, (dx * reach * 0.72, dy * reach * 0.72, top_z * 0.85), 0.50,
                           scale_xyz=(1.75, 0.52, 0.11), rot_euler=(0, -0.46, ang), subdivisions=1)

    # 7 tall crimson Torch Ginger floral cones with layered petal bract skirts & golden stamen crowns
    ginger_specs = [
        (0.0, 0.0, 2.25), (-0.42, -0.35, 1.95), (0.45, -0.32, 2.05),
        (-0.48, 0.36, 1.82), (0.42, 0.42, 1.88), (0.0, -0.58, 1.68), (-0.18, 0.55, 1.72),
    ]
    for gx, gy, gh in ginger_specs:
        add_beveled_cyl(bm_leaves, (gx, gy, gh * 0.5), 0.042, 0.032, gh, segs=8)
        # Multi-tiered waxy crimson bract skirt + pinecone head + golden stamen ring
        add_beveled_cyl(bm_ginger, (gx, gy, gh + 0.04), 0.28, 0.12, 0.12, segs=12)
        add_beveled_cyl(bm_ginger, (gx, gy, gh + 0.22), 0.21, 0.04, 0.38, segs=12)
        add_beveled_cyl(bm_gold, (gx, gy, gh + 0.16), 0.18, 0.16, 0.05, segs=12)

    # 4 hanging scarlet-and-gold Heliconia rostrata lobster-claw inflorescences
    for hx, hy, yaw in [(0.68, -0.45, -0.5), (-0.68, -0.42, 0.5), (0.65, 0.48, 0.8), (-0.65, 0.45, -0.8)]:
        add_polyline_tube(bm_leaves, [(hx * 0.3, hy * 0.3, 0.2), (hx, hy, 1.75), (hx * 1.12, hy * 1.12, 0.85)], [0.035, 0.028, 0.018], segments=6)
        for k in range(5):
            side = 1.0 if (k % 2 == 0) else -1.0
            cz = 1.62 - k * 0.16
            add_beveled_box(bm_heliconia, (hx * 1.06, hy * 1.06, cz), 0.19, 0.05, 0.055, rot_euler=(0, side * 0.42, yaw))
            add_beveled_box(bm_gold, (hx * 1.06 + side * 0.08, hy * 1.06, cz - 0.02), 0.06, 0.052, 0.03, rot_euler=(0, side * 0.42, yaw))

    create_mesh_obj("SBG_GingerCluster_TropicalLeaves", bm_leaves, mats["foliage_mid"], root)
    create_mesh_obj("SBG_GingerCluster_LushLeaves", bm_lush, mats["foliage_lush"], root)
    create_mesh_obj("SBG_GingerCluster_TorchCones", bm_ginger, mats["ginger_crimson"], root)
    create_mesh_obj("SBG_GingerCluster_HeliconiaClaws", bm_heliconia, mats["heliconia_orange"], root)
    create_mesh_obj("SBG_GingerCluster_GoldTips", bm_gold, mats["orchid_yellow"], root)
    return root


def build_giant_tiger_orchid_clump(mats):
    """
    9. SBG_Giant_Tiger_Orchid_Clump:
    Massive Tiger Orchid (Grammatophyllum speciosum) cluster:
    - 16 fleshy segmented yellow-green cane pseudobulbs + 24 arching strap leaves
    - 8 towering 2.7m arching flower spikes lined with spotted gold-and-maroon Tiger Orchid blooms
    """
    root = create_root_empty("SBG_Giant_Tiger_Orchid_Clump")

    bm_cane = bmesh.new()
    bm_leaves = bmesh.new()
    bm_gold = bmesh.new()
    bm_maroon = bmesh.new()

    # Dense clump of 16 fleshy ribbed pseudobulb canes & 24 strap leaves
    for i in range(16):
        ang = 2.0 * math.pi * i / 16.0
        dx, dy = math.cos(ang), math.sin(ang)
        r_out = 1.08 if i % 2 == 0 else 0.78
        h_top = 1.65 if i % 2 == 0 else 1.32
        add_polyline_tube(
            bm_cane,
            [(dx * 0.22, dy * 0.22, 0.0), (dx * r_out * 0.62, dy * r_out * 0.62, h_top * 0.58), (dx * r_out, dy * r_out, h_top)],
            [0.11, 0.095, 0.045], segments=8
        )
        # Strap leaves arching off each pseudobulb cane
        for side in (-0.28, 0.28):
            l_ang = ang + side
            lx, ly = math.cos(l_ang) * (r_out + 0.45), math.sin(l_ang) * (r_out + 0.45)
            add_icosphere_puff(bm_leaves, (lx * 0.78, ly * 0.78, h_top * 0.75), 0.34,
                               scale_xyz=(1.85, 0.28, 0.08), rot_euler=(0, 0.38, l_ang), subdivisions=1)

    # 8 tall arching flower spikes covered in golden-yellow & maroon-spotted Tiger Orchid blooms
    for i in range(8):
        ang = (2.0 * math.pi * i / 8.0) + 0.20
        dx, dy = math.cos(ang), math.sin(ang)
        spike_pts = [
            (dx * 0.28, dy * 0.28, 0.45),
            (dx * 0.75, dy * 0.75, 1.55),
            (dx * 1.25, dy * 1.25, 2.25),
            (dx * 1.68, dy * 1.68, 2.52),
            (dx * 2.05, dy * 2.05, 2.28),
        ]
        add_polyline_tube(bm_leaves, spike_pts, [0.042, 0.035, 0.028, 0.022, 0.015], segments=8)
        for s_i in range(6):
            frac = 0.28 + (s_i / 5.0) * 0.70
            bx = dx * (0.35 + frac * 1.68)
            by = dy * (0.35 + frac * 1.68)
            bz = 0.65 + math.sin(frac * math.pi * 0.82) * 1.88
            add_icosphere_puff(bm_gold, (bx, by, bz), 0.19, scale_xyz=(1.25, 1.25, 0.85), subdivisions=1)
            add_icosphere_puff(bm_maroon, (bx * 1.03, by * 1.03, bz + 0.05), 0.13, scale_xyz=(1.15, 1.15, 0.90), subdivisions=1)

    create_mesh_obj("SBG_TigerOrchid_PseudobulbCanes", bm_cane, mats["foliage_lime"], root)
    create_mesh_obj("SBG_TigerOrchid_StrapLeaves", bm_leaves, mats["foliage_mid"], root)
    create_mesh_obj("SBG_TigerOrchid_GoldenBlooms", bm_gold, mats["orchid_yellow"], root)
    create_mesh_obj("SBG_TigerOrchid_MaroonSpots", bm_maroon, mats["tiger_maroon"], root)
    return root


# ---------------------------------------------------------------------------
# MAIN BUILD & GLB EXPORT (9 FOLIAGE + 42 RELICS = 51 ROOTS)
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    from sbg_relics_42 import build_sbg_42_relics

    clear_scene()
    mats = build_materials()

    roots = [
        build_tembusu_five_dollar_hero(mats),
        build_rain_tree_monarch(mats),
        build_kapok_silk_cotton_giant(mats),
        build_jelutong_dipterocarp_tower(mats),
        build_talipot_fan_palm(mats),
        build_cannonball_couroupita_tree(mats),
        build_golden_shower_orchid_arch(mats),
        build_torch_ginger_heliconia_cluster(mats),
        build_giant_tiger_orchid_clump(mats),
    ]

    relic_roots = build_sbg_42_relics(
        mats, create_root_empty, create_mesh_obj,
        add_beveled_box, add_beveled_cyl, add_polyline_tube, add_icosphere_puff
    )
    roots.extend(relic_roots)

    depsgraph = bpy.context.evaluated_depsgraph_get()
    print(f"=== SBG TREASURES & FOLIAGE SUMMARY ({len(roots)} ROOTS) ===")
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
        print(f"  {r.name:36s} | verts={v_cnt:6d} | tris={t_cnt:6d}")

    repo_root = os.path.abspath(os.path.join(script_dir, "..", "..", ".."))
    out_dir = os.path.join(repo_root, "public", "models", "sbg")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "sbg_treasures_foliage.glb")

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
    )
    print(f"SUCCESSFULLY EXPORTED: {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    main()
