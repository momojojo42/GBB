"""
Headless Blender 4.2 Script: Singapore Botanic Gardens (UNESCO World Heritage)
Major Architectural & Heritage Buildings (`sbg_buildings_landmarks.glb`)

Exports `public/models/sbg/sbg_buildings_landmarks.glb` containing 8 root landmark nodes:
1. SBG_Bandstand_Gazebo_1930
2. SBG_Burkill_Hall_1868
3. SBG_Sembcorp_Cool_House
4. SBG_Tan_Hoon_Siang_Mist_House
5. SBG_Shaw_Symphony_Stage
6. SBG_Botany_Centre_Holttum_Hall
7. SBG_Atbara_House_1898
8. SBG_Inverturret_Gallery_1906

All root objects have local & world origin at (0, 0, 0) with +Z up in Blender
and primary entrance facade oriented toward -Y (which exports as +Y up, +Z forward in glTF).
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
# BMESH GEOMETRY HELPERS (BEVELED DIORAMA PRIMITIVES)
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


def add_beveled_box(bm, loc, hx, hy, hz, rot_euler=(0.0, 0.0, 0.0), bevel_frac=0.12, segs=2):
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


def add_beveled_cyl(bm, loc, r1, r2, depth, segs=16, rot_euler=(0.0, 0.0, 0.0), cap_ends=True, bevel_frac=0.12):
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


def add_hipped_roof(bm, loc, hx_base, hy_base, hx_ridge, hy_ridge, height, rot_euler=(0.0, 0.0, 0.0), bevel_frac=0.06):
    """
    Creates an authentic rectangular hipped roof (with a true ridge line when hx_ridge > 0 or hy_ridge > 0)
    and smooth-beveled eaves & hip ridges.
    """
    bm_tmp = bmesh.new()
    z0 = -height * 0.5
    z1 = height * 0.5
    v00 = bm_tmp.verts.new((-hx_base, -hy_base, z0))
    v10 = bm_tmp.verts.new((hx_base, -hy_base, z0))
    v11 = bm_tmp.verts.new((hx_base, hy_base, z0))
    v01 = bm_tmp.verts.new((-hx_base, hy_base, z0))

    r00 = bm_tmp.verts.new((-hx_ridge, -hy_ridge, z1))
    r10 = bm_tmp.verts.new((hx_ridge, -hy_ridge, z1))
    r11 = bm_tmp.verts.new((hx_ridge, hy_ridge, z1))
    r01 = bm_tmp.verts.new((-hx_ridge, hy_ridge, z1))

    bm_tmp.faces.new((v00, v01, v11, v10))  # bottom
    bm_tmp.faces.new((v00, v10, r10, r00))  # front slope (-Y)
    bm_tmp.faces.new((v10, v11, r11, r10))  # right slope (+X)
    bm_tmp.faces.new((v11, v01, r01, r11))  # back slope (+Y)
    bm_tmp.faces.new((v01, v00, r00, r01))  # left slope (-X)
    bm_tmp.faces.new((r00, r10, r11, r01))  # top ridge cap

    bev = min(hx_base, hy_base, height) * bevel_frac
    if bev > 1e-4:
        bmesh.ops.bevel(
            bm_tmp, geom=list(bm_tmp.edges),
            offset=bev, offset_type='OFFSET',
            segments=2, profile=0.5, affect='EDGES'
        )
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot_euler), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def add_gable_roof(bm, loc, hx, hy, height, ridge_along_y=True, rot_euler=(0.0, 0.0, 0.0)):
    """Creates a triangular prism gable roof with beveled edges."""
    if ridge_along_y:
        add_hipped_roof(bm, loc, hx, hy, 0.03, hy, height, rot_euler=rot_euler, bevel_frac=0.05)
    else:
        add_hipped_roof(bm, loc, hx, hy, hx, 0.03, height, rot_euler=rot_euler, bevel_frac=0.05)


def add_arched_opening_wall(bm, center, span_x, thickness_y, wall_h, arch_w, arch_h, rot_z=0.0):
    """Creates a masonry arch unit centered at `center` (two piers + semicircular arch spandrel lintel)."""
    pier_hx = max(0.08, (span_x - arch_w) * 0.25)
    pier_hz = wall_h * 0.5
    z0 = -wall_h * 0.5
    hy = thickness_y * 0.5
    bm_tmp = bmesh.new()
    # Left & right piers
    for sx in (-1.0, 1.0):
        px = sx * (arch_w * 0.5 + pier_hx)
        add_beveled_box(bm_tmp, (px, 0, z0 + pier_hz), pier_hx, hy, pier_hz, bevel_frac=0.10)
    # Upper spandrel lintel above arch crown
    lintel_hz = max(0.08, (wall_h - arch_h) * 0.5)
    add_beveled_box(bm_tmp, (0, 0, z0 + wall_h - lintel_hz), span_x * 0.5, hy, lintel_hz, bevel_frac=0.10)
    # Curved arch ring stones
    n_arch = 9
    for k in range(n_arch):
        ang = math.pi * (k + 0.5) / n_arch
        ax = math.cos(ang) * (arch_w * 0.5)
        az = z0 + (arch_h - arch_w * 0.42) + math.sin(ang) * (arch_w * 0.42)
        add_beveled_box(bm_tmp, (ax, 0, az), 0.11, hy * 1.12, 0.12, rot_euler=(0, ang - math.pi * 0.5, 0), bevel_frac=0.15)
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(center, (0, 0, rot_z)), verts=bm_tmp.verts)
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


def add_icosphere_puff(bm, center, radius, scale_xyz=(1.0, 1.0, 1.0), subdivisions=1):
    bm_tmp = bmesh.new()
    bmesh.ops.create_icosphere(bm_tmp, subdivisions=subdivisions, radius=radius)
    bmesh.ops.transform(bm_tmp, matrix=xform_mat(center, (0, 0, 0), scale_xyz), verts=bm_tmp.verts)
    _merge_bm(bm, bm_tmp)


def build_shared_materials():
    return {
        "stucco_white": create_material("SBG_Colonial_White_Stucco", "#F8FAFC", metallic=0.04, roughness=0.32),
        "ivory_stone": create_material("SBG_Ivory_Limestone", "#F5EFE6", metallic=0.04, roughness=0.46),
        "bandstand_roof_silver": create_material("SBG_Bandstand_Roof_SilverWhite", "#E2E8F0", metallic=0.22, roughness=0.30),
        "terracotta_roof": create_material("SBG_Terracotta_Tile", "#C2410C", metallic=0.08, roughness=0.44),
        "heritage_brick": create_material("SBG_Heritage_Brick", "#9A3412", metallic=0.06, roughness=0.56),
        "dark_slate_roof": create_material("SBG_Heritage_Zinc_Slate", "#334155", metallic=0.38, roughness=0.35),
        "black_timber": create_material("SBG_Black_Tudorbethan_Timber", "#1E293B", metallic=0.18, roughness=0.40),
        "warm_teak": create_material("SBG_Warm_Malayan_Teak", "#92400E", metallic=0.10, roughness=0.46),
        "louver_green": create_material("SBG_Colonial_Louver_Green", "#065F46", metallic=0.08, roughness=0.40),
        "brass_gold": create_material("SBG_Brushed_Brass_Gold", "#FBBF24", metallic=0.88, roughness=0.22,
                                      emission_hex="#F59E0B", emission_strength=0.25),
        "lantern_glow": create_material("SBG_Heritage_Lantern_Glow", "#FEF08A", metallic=0.15, roughness=0.15,
                                        emission_hex="#F59E0B", emission_strength=2.5),
        "steel_diagrid": create_material("SBG_Conservatory_Steel", "#E2E8F0", metallic=0.72, roughness=0.26),
        "conservatory_glass": create_material("SBG_Conservatory_Glass", "#E0F2FE", metallic=0.10, roughness=0.12, alpha=0.36),
        "tensile_canopy": create_material("SBG_Symphony_Tensile_White", "#FFFFFF", metallic=0.06, roughness=0.22,
                                          emission_hex="#F8FAFC", emission_strength=0.15),
        "moss_granite": create_material("SBG_Highland_Moss_Granite", "#475569", metallic=0.06, roughness=0.72),
        "waterfall_aqua": create_material("SBG_Mist_Waterfall_Aqua", "#67E8F9", metallic=0.12, roughness=0.12, alpha=0.78,
                                          emission_hex="#06B6D4", emission_strength=1.40),
        "foliage_emerald": create_material("SBG_Foliage_Emerald", "#15803D", metallic=0.04, roughness=0.52),
        "foliage_lush": create_material("SBG_Foliage_Lush", "#10B981", metallic=0.04, roughness=0.46),
        "orchid_gold": create_material("SBG_Golden_Shower_Orchid", "#FACC15", metallic=0.15, roughness=0.28,
                                       emission_hex="#EAB308", emission_strength=0.65),
        "orchid_magenta": create_material("SBG_Vanda_Magenta", "#EC4899", metallic=0.10, roughness=0.30,
                                          emission_hex="#DB2777", emission_strength=0.45),
    }


# ---------------------------------------------------------------------------
# 1. SBG_Bandstand_Gazebo_1930
# ---------------------------------------------------------------------------

def build_bandstand_gazebo_1930(mats):
    """
    1930 Singapore Botanic Gardens Octagonal Bandstand:
    - Red-brick octagonal stepped base with 2 opposite entrance stairways (-Y front & +Y back)
    - White limestone plinth & moulded coping
    - 8 slender white Tuscan columns with square pedestals, moulded bases & capitals
    - Decorative white Victorian pierced fretwork brackets & valance frieze along upper eaves
    - Black wrought-iron railings on 6 sides
    - Iconic two-tiered white/light-silver octagonal roof & ventilated cupola lantern with dark louvers
    - Tall brass finial spire at apex + warm glowing vintage pendant lamp inside ceiling
    """
    root = create_root_empty("SBG_Bandstand_Gazebo_1930")

    bm_brick = bmesh.new()
    bm_white = bmesh.new()
    bm_iron = bmesh.new()
    bm_roof = bmesh.new()
    bm_slate = bmesh.new()
    bm_brass = bmesh.new()
    bm_glow = bmesh.new()

    oct_rot = (0.0, 0.0, math.pi / 8.0)

    # 3-step red-brick octagonal base + white limestone gazebo deck
    add_beveled_cyl(bm_brick, (0, 0, 0.09), 3.72, 3.64, 0.18, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_brick, (0, 0, 0.25), 3.38, 3.30, 0.16, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_brick, (0, 0, 0.41), 3.08, 3.00, 0.16, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_white, (0, 0, 0.56), 2.86, 2.82, 0.16, segs=8, rot_euler=oct_rot)

    # Opposite entrance stairways with white low cheek walls on -Y (front) and +Y (back)
    for sy in (-1.0, 1.0):
        for step_i in range(4):
            sz = 0.07 + step_i * 0.13
            dist = 3.62 - step_i * 0.26
            add_beveled_box(bm_brick, (0.0, sy * dist, sz), 0.72, 0.18, 0.07)
        for sx in (-0.80, 0.80):
            add_beveled_box(bm_white, (sx, sy * 3.18, 0.34), 0.10, 0.58, 0.32)

    # 8 White Tuscan Columns + Decorative Victorian Pierced Fretwork Valance & Spandrel Brackets
    col_r = 2.45
    for i in range(8):
        ang = (i * math.pi / 4.0) + (math.pi / 8.0)
        cx = math.cos(ang) * col_r
        cy = math.sin(ang) * col_r

        # Square column pedestal, torus base ring, tapered Tuscan shaft, necking ring, echinus & abacus capital
        add_beveled_box(bm_white, (cx, cy, 0.78), 0.21, 0.21, 0.18, rot_euler=(0, 0, ang))
        add_beveled_cyl(bm_white, (cx, cy, 0.99), 0.17, 0.15, 0.08, segs=16)
        add_beveled_cyl(bm_white, (cx, cy, 2.18), 0.135, 0.112, 2.34, segs=16)
        add_beveled_cyl(bm_white, (cx, cy, 3.38), 0.13, 0.19, 0.12, segs=16)
        add_beveled_box(bm_white, (cx, cy, 3.48), 0.20, 0.20, 0.06, rot_euler=(0, 0, ang))

        next_ang = ((i + 1) * math.pi / 4.0) + (math.pi / 8.0)
        nx = math.cos(next_ang) * col_r
        ny = math.sin(next_ang) * col_r
        mx, my = 0.5 * (cx + nx), 0.5 * (cy + ny)
        dx, dy = nx - cx, ny - cy
        seg_len = math.hypot(dx, dy)
        yaw = math.atan2(dy, dx)

        # Upper eaves architrave beam & Victorian pierced fretwork valance between columns
        add_beveled_box(bm_white, (mx, my, 3.44), seg_len * 0.48, 0.08, 0.10, rot_euler=(0, 0, yaw))
        add_beveled_box(bm_white, (mx, my, 3.24), seg_len * 0.46, 0.04, 0.04, rot_euler=(0, 0, yaw))

        # Pierced Victorian fretwork spindles, diamond rings & curved spandrel corner brackets
        for k in range(7):
            frac = (k - 3) / 7.2
            lx = mx + dx * frac
            ly = my + dy * frac
            add_beveled_box(bm_white, (lx, ly, 3.34), 0.025, 0.035, 0.09, rot_euler=(0, 0, yaw))
            if k % 2 == 1:
                add_beveled_cyl(bm_white, (lx, ly, 3.34), 0.055, 0.055, 0.05, segs=8, rot_euler=(math.pi / 2, 0, yaw))
            else:
                # Pendant drop finial along lower valance edge
                add_beveled_cyl(bm_white, (lx, ly, 3.16), 0.028, 0.008, 0.09, segs=8)

        # Curved Victorian spandrel brackets springing from each column top
        for side_sign, col_pt in ((1.0, (cx, cy)), (-1.0, (nx, ny))):
            b_pts = [
                (col_pt[0] + side_sign * dx * 0.05, col_pt[1] + side_sign * dy * 0.05, 2.86),
                (col_pt[0] + side_sign * dx * 0.12, col_pt[1] + side_sign * dy * 0.12, 3.08),
                (col_pt[0] + side_sign * dx * 0.22, col_pt[1] + side_sign * dy * 0.22, 3.22),
            ]
            add_polyline_tube(bm_white, b_pts, [0.035, 0.04, 0.035], segments=8)

        # Black wrought-iron railings on 6 sides (bays 1 and 5 are the +Y and -Y stair entrances)
        if i not in (1, 5):
            add_beveled_box(bm_iron, (mx, my, 1.12), seg_len * 0.43, 0.04, 0.035, rot_euler=(0, 0, yaw))
            add_beveled_box(bm_iron, (mx, my, 0.72), seg_len * 0.43, 0.04, 0.035, rot_euler=(0, 0, yaw))
            for b in range(9):
                bf = (b - 4) / 9.5
                bx = mx + dx * bf
                by = my + dy * bf
                add_beveled_cyl(bm_iron, (bx, by, 0.92), 0.018, 0.018, 0.38, segs=8)

    # Octagonal moulded white cornice & slate drip trim
    add_beveled_cyl(bm_white, (0, 0, 3.58), 2.92, 3.12, 0.18, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_slate, (0, 0, 3.68), 3.28, 3.36, 0.06, segs=8, rot_euler=oct_rot)

    # Lower octagonal pitched white/silver heritage roof + hip ridge ribs
    add_beveled_cyl(bm_roof, (0, 0, 4.30), 3.38, 1.18, 1.20, segs=8, rot_euler=oct_rot, bevel_frac=0.05)
    for i in range(8):
        ang = (i * math.pi / 4.0) + (math.pi / 8.0)
        add_polyline_tube(
            bm_white,
            [(math.cos(ang) * 3.36, math.sin(ang) * 3.36, 3.72),
             (math.cos(ang) * 1.16, math.sin(ang) * 1.16, 4.90)],
            [0.045, 0.035], segments=8
        )

    # Octagonal ventilated cupola lantern (white corner posts + dark louvered vent panels)
    add_beveled_cyl(bm_slate, (0, 0, 5.18), 1.08, 1.08, 0.58, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_white, (0, 0, 4.92), 1.22, 1.18, 0.10, segs=8, rot_euler=oct_rot)
    add_beveled_cyl(bm_white, (0, 0, 5.48), 1.18, 1.24, 0.10, segs=8, rot_euler=oct_rot)
    for i in range(8):
        ang = (i * math.pi / 4.0) + (math.pi / 8.0)
        add_beveled_cyl(bm_white, (math.cos(ang) * 1.12, math.sin(ang) * 1.12, 5.20), 0.06, 0.055, 0.54, segs=10)

    # Upper octagonal cupola roof + hip ribs
    add_beveled_cyl(bm_roof, (0, 0, 5.92), 1.44, 0.10, 0.82, segs=8, rot_euler=oct_rot, bevel_frac=0.05)
    for i in range(8):
        ang = (i * math.pi / 4.0) + (math.pi / 8.0)
        add_polyline_tube(
            bm_white,
            [(math.cos(ang) * 1.42, math.sin(ang) * 1.42, 5.52),
             (math.cos(ang) * 0.10, math.sin(ang) * 0.10, 6.32)],
            [0.035, 0.025], segments=8
        )

    # Tall brass finial spire at apex
    add_beveled_cyl(bm_brass, (0, 0, 6.72), 0.09, 0.02, 0.90, segs=12)
    add_icosphere_puff(bm_brass, (0, 0, 6.46), 0.14, subdivisions=2)
    add_icosphere_puff(bm_brass, (0, 0, 7.18), 0.065, subdivisions=2)

    # Warm glowing vintage pendant lamp hanging inside the gazebo ceiling
    add_beveled_cyl(bm_brass, (0, 0, 3.35), 0.025, 0.025, 0.65, segs=8)
    add_beveled_cyl(bm_brass, (0, 0, 3.06), 0.36, 0.12, 0.14, segs=16)
    add_icosphere_puff(bm_glow, (0, 0, 2.88), 0.26, scale_xyz=(1.0, 1.0, 1.12), subdivisions=2)

    create_mesh_obj("SBG_Bandstand_BrickPlinth", bm_brick, mats["heritage_brick"], root)
    create_mesh_obj("SBG_Bandstand_ColumnsFrieze", bm_white, mats["stucco_white"], root)
    create_mesh_obj("SBG_Bandstand_IronRailings", bm_iron, mats["black_timber"], root)
    create_mesh_obj("SBG_Bandstand_OctagonalRoof", bm_roof, mats["bandstand_roof_silver"], root)
    create_mesh_obj("SBG_Bandstand_CupolaVents", bm_slate, mats["dark_slate_roof"], root)
    create_mesh_obj("SBG_Bandstand_BrassSpire", bm_brass, mats["brass_gold"], root)
    create_mesh_obj("SBG_Bandstand_LanternCore", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 2. SBG_Burkill_Hall_1868
# ---------------------------------------------------------------------------

def build_burkill_hall_1868(mats):
    """
    1868 Anglo-Malay Plantation Bungalow (National Orchid Garden):
    - Ground floor whitewashed masonry piers & rounded colonial arches
    - Projecting front carriage porch (`porte-cochère`) oriented toward -Y (front camera)
    - Upper floor wide verandah with dark-teak timber columns, slatted balustrades & deep overhanging eaves
    - Green timber louvered colonial shutters (`louver_green`) with white casement trim
    - Multi-tiered terracotta hipped roof with an authentic pitched central jack-roof ventilation tier
    """
    root = create_root_empty("SBG_Burkill_Hall_1868")

    bm_stucco = bmesh.new()
    bm_teak = bmesh.new()
    bm_louver = bmesh.new()
    bm_roof = bmesh.new()
    bm_glow = bmesh.new()

    # Ground floor stepped masonry plinth & inner core
    add_beveled_box(bm_stucco, (0, 0, 0.20), 5.6, 4.1, 0.20)
    add_beveled_box(bm_stucco, (0, 0, 1.48), 4.4, 2.9, 1.12)

    # Ground Floor arched masonry colonnade along front (-Y) & back (+Y)
    for sy in (-1.0, 1.0):
        vy = sy * 3.78
        for ix in range(-3, 4):
            px = ix * 1.68
            add_beveled_box(bm_stucco, (px, vy, 1.42), 0.24, 0.24, 1.05)
            add_beveled_box(bm_stucco, (px, vy, 0.45), 0.28, 0.28, 0.12)
            if ix < 3:
                arch_cx = px + 0.84
                add_arched_opening_wall(bm_stucco, (arch_cx, vy, 1.45), 1.45, 0.42, 2.15, 1.18, 1.82)

    # Side ground floor masonry arches (-X and +X)
    for sx in (-1.0, 1.0):
        vx = sx * 5.05
        for iy in (-1, 0, 1):
            py = iy * 2.15
            add_beveled_box(bm_stucco, (vx, py, 1.42), 0.24, 0.24, 1.05)

    # Projecting Front Porte-Cochère (Carriage Porch) on -Y (front camera side!)
    add_beveled_box(bm_stucco, (0, -5.05, 0.16), 2.05, 1.35, 0.16)
    for sx in (-1.65, 1.65):
        add_beveled_box(bm_stucco, (sx, -6.05, 1.42), 0.26, 0.26, 1.08)
        add_beveled_box(bm_stucco, (sx, -4.85, 1.42), 0.24, 0.24, 1.08)
    add_arched_opening_wall(bm_stucco, (0, -6.05, 1.45), 3.05, 0.42, 2.15, 2.45, 1.85)
    add_beveled_box(bm_stucco, (0, -5.05, 2.62), 2.05, 1.35, 0.16)

    # Upper Storey Dark Teak Verandah Floor, Rafters & White Inner Walls (z = 2.60..4.68m)
    add_beveled_box(bm_teak, (0, 0, 2.62), 5.55, 4.05, 0.14)
    add_beveled_box(bm_stucco, (0, 0, 3.68), 4.35, 2.85, 0.96)

    # Upper verandah dark-teak columns, slatted balustrades & green louvered shutters
    for sy in (-1.0, 1.0):
        vy = sy * 3.78
        add_beveled_box(bm_teak, (0, vy, 3.08), 5.35, 0.08, 0.32)
        add_beveled_box(bm_stucco, (0, vy, 3.08), 5.25, 0.05, 0.22)
        for ix in range(-3, 4):
            px = ix * 1.68
            add_beveled_box(bm_teak, (px, vy, 3.72), 0.12, 0.12, 0.98)
            if ix < 3:
                wx = px + 0.84
                # White window frame + twin green louvered shutters
                add_beveled_box(bm_stucco, (wx, sy * 2.90, 3.72), 0.58, 0.06, 0.66)
                add_beveled_box(bm_louver, (wx - 0.24, sy * 2.94, 3.72), 0.22, 0.06, 0.58)
                add_beveled_box(bm_louver, (wx + 0.24, sy * 2.94, 3.72), 0.22, 0.06, 0.58)
                # Upper eaves louvered ventilation screen between teak posts
                add_beveled_box(bm_louver, (wx, vy, 4.42), 0.72, 0.05, 0.18)

    for sx in (-1.0, 1.0):
        vx = sx * 5.25
        add_beveled_box(bm_teak, (vx, 0, 3.08), 0.08, 3.75, 0.32)
        for iy in (-1, 0, 1):
            py = iy * 1.85
            add_beveled_box(bm_teak, (vx, py, 3.72), 0.12, 0.12, 0.98)
            add_beveled_box(bm_stucco, (sx * 4.38, py, 3.72), 0.06, 0.56, 0.66)
            add_beveled_box(bm_louver, (sx * 4.42, py - 0.22, 3.72), 0.06, 0.22, 0.58)
            add_beveled_box(bm_louver, (sx * 4.42, py + 0.22, 3.72), 0.06, 0.22, 0.58)

    # Upper porch verandah over the front porte-cochère (-Y)
    for sx in (-1.65, 1.65):
        add_beveled_box(bm_teak, (sx, -6.02, 3.65), 0.11, 0.11, 0.92)
    add_beveled_box(bm_teak, (0, -6.02, 3.05), 1.72, 0.08, 0.30)
    add_beveled_box(bm_teak, (-1.65, -5.05, 3.05), 0.08, 1.05, 0.30)
    add_beveled_box(bm_teak, (1.65, -5.05, 3.05), 0.08, 1.05, 0.30)

    # Multi-tiered Terracotta Hipped Roof + Raised Jack-Roof Ventilation Tier
    add_hipped_roof(bm_roof, (0, 0, 5.22), 6.25, 4.65, 2.75, 0.85, 1.32, bevel_frac=0.05)
    # Clerestory louvered jack-roof neck + upper pitched hipped jack-roof
    add_beveled_box(bm_louver, (0, 0, 5.88), 3.05, 1.15, 0.24)
    add_hipped_roof(bm_roof, (0, 0, 6.32), 3.45, 1.48, 2.15, 0.18, 0.68, bevel_frac=0.06)

    # Hipped terracotta roof over the projecting front porte-cochère (-Y)
    add_hipped_roof(bm_roof, (0, -5.05, 4.92), 2.35, 1.65, 0.35, 0.85, 0.92, bevel_frac=0.06)

    # Warm glowing heritage lanterns in carriage porch & upper verandah
    add_icosphere_puff(bm_glow, (0, -5.35, 2.25), 0.24, subdivisions=2)
    for sx in (-2.4, 0.0, 2.4):
        add_icosphere_puff(bm_glow, (sx, -3.45, 4.10), 0.18, subdivisions=1)

    create_mesh_obj("SBG_Burkill_WhiteStucco", bm_stucco, mats["stucco_white"], root)
    create_mesh_obj("SBG_Burkill_TeakVerandah", bm_teak, mats["warm_teak"], root)
    create_mesh_obj("SBG_Burkill_LouverShutters", bm_louver, mats["louver_green"], root)
    create_mesh_obj("SBG_Burkill_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_Burkill_HeritageLanterns", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 3. SBG_Sembcorp_Cool_House
# ---------------------------------------------------------------------------

def cool_house_dome_point(u, v):
    theta = u * (math.pi * 0.5)
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)
    asym_x = 1.05 * sin_t * (1.0 - 0.25 * sin_t)
    rib_wave = 1.0 + 0.03 * math.cos(v * 6.0) * cos_t
    rx = 11.8 * rib_wave
    ry = 8.4 * (1.0 - 0.06 * math.cos(v)) * rib_wave
    hz = 8.8 * (1.0 + 0.05 * math.sin(v * 2.0) * sin_t)
    x = rx * cos_t * math.cos(v) + asym_x
    y = ry * cos_t * math.sin(v)
    z = 0.45 + hz * pow(sin_t, 0.86)
    return Vector((x, y, z))


def build_sembcorp_cool_house(mats):
    """
    Sembcorp Cool House (Tropical Montane Orchidetum):
    - Curved glass-and-steel conservatory dome with white diagrid steel ribs & primary arch trusses
    - Welcoming glass entrance portal oriented toward front-right (-Y / +X)
    - Internal highland montane rockery cliff, glowing aqua waterfall curtain, splash pool & montane orchids
    """
    root = create_root_empty("SBG_Sembcorp_Cool_House")

    portal_angle = -0.95  # Facing front (-Y / +X) toward studio camera

    # 1. Translucent Curved Glass Dome with open entrance portal
    bm_glass = bmesh.new()
    n_u, n_v = 14, 32
    rings = []
    for iu in range(n_u):
        u = 0.03 + 0.97 * (iu / n_u)
        ring = []
        for iv in range(n_v):
            v = 2.0 * math.pi * iv / n_v
            ring.append(bm_glass.verts.new(cool_house_dome_point(u, v) * 0.99))
        rings.append(ring)
    apex = bm_glass.verts.new(cool_house_dome_point(1.0, 0.0) * 0.99)

    for iu in range(n_u - 1):
        rA, rB = rings[iu], rings[iu + 1]
        for iv in range(n_v):
            inext = (iv + 1) % n_v
            bm_glass.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))
    for iv in range(n_v):
        inext = (iv + 1) % n_v
        bm_glass.faces.new((rings[-1][iv], rings[-1][inext], apex))

    door_faces = [
        f for f in bm_glass.faces
        if f.calc_center_median().z < 3.4
        and abs(math.atan2(f.calc_center_median().y, f.calc_center_median().x) - portal_angle) < 0.36
    ]
    bmesh.ops.delete(bm_glass, geom=door_faces, context='FACES')
    create_mesh_obj("SBG_CoolHouse_GlassDome", bm_glass, mats["conservatory_glass"], root)

    # 2. External Diagrid Steel Ribs + Primary Arched Roof Spine Trusses
    bm_shell = bmesh.new()
    gu, gv = 9, 24
    g_rings = []
    for iu in range(gu):
        u = 0.02 + 0.98 * (iu / gu)
        ring = [bm_shell.verts.new(cool_house_dome_point(u, 2.0 * math.pi * iv / gv)) for iv in range(gv)]
        g_rings.append(ring)
    g_apex = bm_shell.verts.new(cool_house_dome_point(1.0, 0.0))
    for iu in range(gu - 1):
        rA, rB = g_rings[iu], g_rings[iu + 1]
        for iv in range(gv):
            inext = (iv + 1) % gv
            bm_shell.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))
    for iv in range(gv):
        inext = (iv + 1) % gv
        bm_shell.faces.new((g_rings[-1][iv], g_rings[-1][inext], g_apex))

    door_grid = [
        f for f in bm_shell.faces
        if f.calc_center_median().z < 3.4
        and abs(math.atan2(f.calc_center_median().y, f.calc_center_median().x) - portal_angle) < 0.36
    ]
    bmesh.ops.delete(bm_shell, geom=door_grid, context='FACES')
    bmesh.ops.poke(bm_shell, faces=[f for f in bm_shell.faces if len(f.verts) == 4])

    mesh_grid = bpy.data.meshes.new("SBG_CoolHouse_DiagridSteel")
    bm_shell.to_mesh(mesh_grid)
    bm_shell.free()
    obj_grid = bpy.data.objects.new("SBG_CoolHouse_DiagridSteel", mesh_grid)
    bpy.context.collection.objects.link(obj_grid)
    wf = obj_grid.modifiers.new(name="CoolHouseWireframe", type='WIREFRAME')
    wf.thickness = 0.16
    wf.use_replace = True
    wf.use_even_offset = True
    bpy.context.view_layer.objects.active = obj_grid
    obj_grid.select_set(True)
    bpy.ops.object.modifier_apply(modifier=wf.name)
    obj_grid.select_set(False)
    obj_grid.data.materials.append(mats["steel_diagrid"])
    obj_grid.parent = root

    # Primary external structural steel arch ribs & entrance canopy frame
    bm_truss = bmesh.new()
    for v_ang in (-0.35, 0.0, 0.35):
        pts = []
        for s in range(21):
            t = s / 20.0
            if t < 0.5:
                u = (0.5 - t) * 2.0
                pt = cool_house_dome_point(1.0 - u * 0.95, math.pi + v_ang)
            else:
                u = (t - 0.5) * 2.0
                pt = cool_house_dome_point(1.0 - u * 0.95, v_ang)
            pts.append(pt * 1.03)
        add_polyline_tube(bm_truss, pts, 0.18, segments=10)

    # Entrance portal arch frame at portal_angle
    p_base = cool_house_dome_point(0.03, portal_angle)
    p_dir = Vector((math.cos(portal_angle), math.sin(portal_angle), 0.0))
    p_tan = Vector((-p_dir.y, p_dir.x, 0.0))
    arch_pts = []
    for s in range(17):
        ang = (s / 16.0) * math.pi
        pt = p_base + p_dir * 0.65 + p_tan * (math.cos(ang) * 2.45) + Vector((0, 0, math.sin(ang) * 3.15))
        arch_pts.append(pt)
    add_polyline_tube(bm_truss, arch_pts, 0.16, segments=10)
    create_mesh_obj("SBG_CoolHouse_PrimaryArches", bm_truss, mats["stucco_white"], root)

    # 3. Perimeter Stone Plinth, Highland Montane Rockery & Mist Waterfall Core
    bm_rock = bmesh.new()
    bm_water = bmesh.new()
    bm_flora = bmesh.new()
    bm_orchid = bmesh.new()

    for iv in range(36):
        ang0 = (2.0 * math.pi * iv / 36) - math.pi
        if abs(ang0 - portal_angle) < 0.34:
            continue
        pt = cool_house_dome_point(0.02, ang0)
        add_beveled_box(bm_rock, (pt.x, pt.y, 0.32), 0.98, 0.46, 0.32, rot_euler=(0, 0, ang0 + math.pi / 2))

    # Internal Montane Stone Waterfall Cliff clearly visible inside the dome
    for rx, ry, rz, rad in [(-2.8, 1.8, 2.4, 1.85), (-1.2, 2.6, 3.2, 1.65), (-3.8, 0.6, 1.7, 1.45), (0.4, 2.8, 2.1, 1.35)]:
        add_icosphere_puff(bm_rock, (rx, ry, rz), rad, scale_xyz=(1.15, 0.95, 1.55), subdivisions=1)

    # Glowing mist waterfall curtain & splash basin facing -Y front
    for wx in (-1.8, -1.0, -0.2):
        wf_pts = [(wx, 2.1, 4.2), (wx, 1.4, 2.8), (wx, 0.7, 1.4), (wx, 0.2, 0.25)]
        add_polyline_tube(bm_water, wf_pts, [0.38, 0.48, 0.56, 0.65], segments=10)
    add_beveled_cyl(bm_water, (-1.0, -0.2, 0.18), 2.65, 2.75, 0.20, segs=24)

    # Montane cloud-forest greenery & golden/magenta orchid displays inside and flanking portal
    for ox, oy, oz in [(-3.2, 1.2, 3.8), (-1.2, 2.2, 4.5), (3.2, -1.8, 1.05), (4.2, 1.5, 1.15), (-3.8, -2.2, 1.05)]:
        add_icosphere_puff(bm_flora, (ox, oy, oz), 0.85, scale_xyz=(1.25, 1.15, 0.78), subdivisions=1)
        add_icosphere_puff(bm_orchid, (ox * 0.95, oy * 0.95, oz + 0.48), 0.42, subdivisions=1)

    create_mesh_obj("SBG_CoolHouse_WaterfallPlinth", bm_rock, mats["moss_granite"], root)
    create_mesh_obj("SBG_CoolHouse_MistCore", bm_water, mats["waterfall_aqua"], root)
    create_mesh_obj("SBG_CoolHouse_MontaneFlora", bm_flora, mats["foliage_lush"], root)
    create_mesh_obj("SBG_CoolHouse_MontaneOrchids", bm_orchid, mats["orchid_magenta"], root)
    return root


# ---------------------------------------------------------------------------
# 4. SBG_Tan_Hoon_Siang_Mist_House
# ---------------------------------------------------------------------------

def build_tan_hoon_siang_mist_house(mats):
    """
    Tan Hoon Siang Mist House:
    - Arched Victorian conservatory pavilion with crisp white steel ribs, brick-and-limestone base wall,
      and pitched glass-and-steel clerestory mist lantern roof ridge
    - Flanking Golden-Shower & Magenta Vanda Orchid Trellises framing the -Y front & +Y rear approaches
    """
    root = create_root_empty("SBG_Tan_Hoon_Siang_Mist_House")

    bm_stone = bmesh.new()
    bm_brick = bmesh.new()
    bm_steel = bmesh.new()
    bm_glass = bmesh.new()
    bm_foliage = bmesh.new()
    bm_orchid_gold = bmesh.new()
    bm_orchid_mag = bmesh.new()
    bm_mist = bmesh.new()

    # Stepped limestone terrace base + low perimeter brick dwarf walls
    add_beveled_box(bm_stone, (0, 0, 0.18), 5.6, 4.4, 0.18)
    for sx in (-1.0, 1.0):
        add_beveled_box(bm_brick, (sx * 4.45, 0, 0.62), 0.18, 3.65, 0.32)
    for sy in (-1.0, 1.0):
        for sx in (-1.0, 1.0):
            add_beveled_box(bm_brick, (sx * 3.15, sy * 3.65, 0.62), 1.35, 0.18, 0.32)

    # Arched Victorian conservatory ribs spanning along Y & X
    for iy in range(-3, 4):
        y = iy * 1.18
        arch_pts = []
        for s in range(17):
            t = s / 16.0
            ang = t * math.pi
            x = math.cos(ang) * 4.45
            z = 0.75 + math.sin(ang) * 3.55
            arch_pts.append((x, y, z))
        add_polyline_tube(bm_steel, arch_pts, 0.095, segments=8)

    # Longitudinal purlins
    for ang_deg in (25, 50, 75, 105, 130, 155):
        ang = math.radians(ang_deg)
        x = math.cos(ang) * 4.45
        z = 0.75 + math.sin(ang) * 3.55
        add_beveled_box(bm_steel, (x, 0, z), 0.06, 3.68, 0.06)

    # Raised Victorian pitched clerestory mist lantern roof ridge along Y
    add_beveled_box(bm_steel, (0, 0, 4.42), 0.95, 3.25, 0.22)
    add_gable_roof(bm_glass, (0, 0, 4.88), 1.18, 3.42, 0.56, ridge_along_y=True)
    for iy in range(-2, 3):
        add_beveled_box(bm_steel, (0, iy * 1.45, 4.88), 1.22, 0.06, 0.32)

    # Translucent half-cylinder barrel-vaulted glass shell along Y (z >= 0.75m, matching arch ribs)
    v_rings = []
    for iy in (-3.54, 3.54):
        ring = []
        for s in range(17):
            ang = (s / 16.0) * math.pi
            ring.append(bm_glass.verts.new((math.cos(ang) * 4.38, iy, 0.75 + math.sin(ang) * 3.48)))
        v_rings.append(ring)
    for s in range(16):
        bm_glass.faces.new((v_rings[0][s], v_rings[0][s + 1], v_rings[1][s + 1], v_rings[1][s]))

    # Front (-Y) and Back (+Y) Victorian arched entrance pediments & Golden/Magenta Orchid Arches
    for sy in (-1.0, 1.0):
        for offset_y in (4.15, 5.05):
            ty = sy * offset_y
            t_pts = []
            for s in range(15):
                ang = (s / 14.0) * math.pi
                t_pts.append((math.cos(ang) * 2.35, ty, 0.30 + math.sin(ang) * 2.65))
            add_polyline_tube(bm_steel, t_pts, 0.075, segments=8)
            for s in range(1, 14):
                ang = (s / 14.0) * math.pi
                ox = math.cos(ang) * 2.35
                oz = 0.30 + math.sin(ang) * 2.65
                add_icosphere_puff(bm_foliage, (ox, ty, oz + 0.10), 0.24, scale_xyz=(1.1, 0.9, 0.7), subdivisions=1)
                if s % 2 == 0:
                    add_icosphere_puff(bm_orchid_gold, (ox, ty, oz - 0.06), 0.30, scale_xyz=(1.05, 0.85, 1.35), subdivisions=1)
                else:
                    add_icosphere_puff(bm_orchid_mag, (ox, ty, oz - 0.04), 0.26, scale_xyz=(1.05, 0.85, 1.25), subdivisions=1)

    # Internal mist fountain & tropical orchid beds
    add_beveled_cyl(bm_stone, (0, 0, 0.48), 1.25, 1.15, 0.32, segs=18)
    add_beveled_cyl(bm_mist, (0, 0, 1.45), 0.55, 0.18, 1.65, segs=14)
    for sx in (-2.4, 2.4):
        add_beveled_box(bm_stone, (sx, 0, 0.45), 0.85, 2.65, 0.24)
        for iy in (-1, 0, 1):
            add_icosphere_puff(bm_foliage, (sx, iy * 1.45, 0.92), 0.68, scale_xyz=(1.1, 1.2, 0.75), subdivisions=1)
            add_icosphere_puff(bm_orchid_mag, (sx, iy * 1.45, 1.42), 0.36, subdivisions=1)

    create_mesh_obj("SBG_MistHouse_StoneBase", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_MistHouse_BrickWalls", bm_brick, mats["heritage_brick"], root)
    create_mesh_obj("SBG_MistHouse_VictorianRibs", bm_steel, mats["stucco_white"], root)
    create_mesh_obj("SBG_MistHouse_GlassVault", bm_glass, mats["conservatory_glass"], root)
    create_mesh_obj("SBG_MistHouse_FoliageBeds", bm_foliage, mats["foliage_lush"], root)
    create_mesh_obj("SBG_MistHouse_OrchidGold", bm_orchid_gold, mats["orchid_gold"], root)
    create_mesh_obj("SBG_MistHouse_OrchidMagenta", bm_orchid_mag, mats["orchid_magenta"], root)
    create_mesh_obj("SBG_MistHouse_MistVents", bm_mist, mats["waterfall_aqua"], root)
    return root


# ---------------------------------------------------------------------------
# 5. SBG_Shaw_Symphony_Stage
# ---------------------------------------------------------------------------

def build_tensile_canopy_surface(bm, u_segs=32, v_segs=24, thickness=0.14):
    """
    Constructs a smooth, continuous, double-curved billowing white tensile sail / clam-shell
    acoustic canopy for the Shaw Foundation Symphony Stage:
    - Anchors low at the rear (+Y = +3.85m, z = 0.75m)
    - Billows up and forward over the circular stage toward the front (-Y = -3.45m, z = 4.95m at crown)
    - Features 4 subtle scalloped vaulted fabric bays with hyperbolic-paraboloid tension curvature.
    """
    def canopy_pt(u, v):
        # u in [-1, 1] across stage width (X), v in [0, 1] from rear anchor (+Y) to front arch (-Y)
        span_x = 1.95 + 3.45 * pow(v, 0.62)
        x = u * span_x
        y = 3.85 - 7.25 * v - 0.55 * (1.0 - u * u) * math.sin(v * math.pi)
        # Base arch curve rising toward the front stage opening
        arch_profile = max(0.0, 1.0 - pow(u * 0.94, 2.0))
        z_front_arch = 0.95 + 4.25 * pow(arch_profile, 0.78)
        z_rear_anchor = 0.72 + 1.05 * arch_profile
        # Billowing sail loft + 4 scalloped acoustic bays
        billow = 1.15 * math.sin(v * math.pi) * pow(arch_profile, 0.65)
        scallop = 0.24 * abs(math.cos(u * math.pi * 2.0)) * math.sin(v * math.pi * 0.85)
        z = (1.0 - v) * z_rear_anchor + v * z_front_arch + billow + scallop
        return Vector((x, y, z))

    top_grid = []
    bot_grid = []
    for iv in range(v_segs + 1):
        v = iv / float(v_segs)
        t_row = []
        b_row = []
        for iu in range(u_segs + 1):
            u = -1.0 + 2.0 * (iu / float(u_segs))
            p = canopy_pt(u, v)
            t_row.append(bm.verts.new(p + Vector((0, 0, thickness * 0.5))))
            b_row.append(bm.verts.new(p - Vector((0, 0, thickness * 0.5))))
        top_grid.append(t_row)
        bot_grid.append(b_row)

    for iv in range(v_segs):
        for iu in range(u_segs):
            # Top surface
            bm.faces.new((top_grid[iv][iu], top_grid[iv][iu + 1], top_grid[iv + 1][iu + 1], top_grid[iv + 1][iu]))
            # Bottom surface
            bm.faces.new((bot_grid[iv][iu], bot_grid[iv + 1][iu], bot_grid[iv + 1][iu + 1], bot_grid[iv][iu + 1]))

    # Stitch perimeter rim
    for iu in range(u_segs):
        bm.faces.new((top_grid[0][iu], bot_grid[0][iu], bot_grid[0][iu + 1], top_grid[0][iu + 1]))
        bm.faces.new((top_grid[-1][iu + 1], bot_grid[-1][iu + 1], bot_grid[-1][iu], top_grid[-1][iu]))
    for iv in range(v_segs):
        bm.faces.new((top_grid[iv + 1][0], bot_grid[iv + 1][0], bot_grid[iv][0], top_grid[iv][0]))
        bm.faces.new((top_grid[iv][-1], bot_grid[iv][-1], bot_grid[iv + 1][-1], top_grid[iv + 1][-1]))

    # Smooth arched tubular seam ribs along v = 0.25, 0.52, 0.78, 1.00
    for v_rib, r_tube in [(0.28, 0.11), (0.55, 0.13), (0.80, 0.14), (1.00, 0.16)]:
        rib_pts = [canopy_pt(-1.0 + 2.0 * (k / 24.0), v_rib) for k in range(25)]
        add_polyline_tube(bm, rib_pts, r_tube, segments=10)


def build_shaw_symphony_stage(mats):
    """
    Shaw Foundation Symphony Stage on Symphony Lake:
    - Circular stone lakefront stage apron & warm teak performance deck facing -Y
    - Smooth, billowing white tensile fabric clam-shell / sail acoustic canopy curving forward over the stage
    - Sleek angled steel masts & tension tie-rods anchored around the canopy
    - Concert grand piano on the timber stage deck + warm golden stage footlights
    """
    root = create_root_empty("SBG_Shaw_Symphony_Stage")

    bm_stone = bmesh.new()
    bm_water = bmesh.new()
    bm_teak = bmesh.new()
    bm_shell = bmesh.new()
    bm_steel = bmesh.new()
    bm_piano = bmesh.new()
    bm_brass = bmesh.new()
    bm_glow = bmesh.new()

    # Symphony Lake water reflection rim & tiered circular stone stage apron + warm teak deck
    add_beveled_cyl(bm_water, (0, 0, 0.06), 6.25, 6.15, 0.12, segs=36)
    add_beveled_cyl(bm_stone, (0, 0, 0.22), 5.65, 5.45, 0.32, segs=36)
    add_beveled_cyl(bm_stone, (0, -0.15, 0.46), 4.88, 4.76, 0.22, segs=36)
    add_beveled_cyl(bm_teak, (0, -0.22, 0.64), 4.35, 4.28, 0.18, segs=32)

    # Front curved stone steps leading onto stage at -Y
    for step_i in range(3):
        add_beveled_box(bm_stone, (0, -5.05 - step_i * 0.28, 0.34 - step_i * 0.10), 1.55, 0.22, 0.08)

    # Smooth billowing white tensile fabric clam-shell canopy
    build_tensile_canopy_surface(bm_shell, u_segs=32, v_segs=22, thickness=0.14)

    # Sleek angled steel masts & tension tie-rods supporting the tensile canopy
    for sx in (-1.0, 1.0):
        # Primary forward-raked lateral steel A-frame masts
        mast_base = (sx * 4.75, -1.25, 0.35)
        mast_rear = (sx * 4.15, 2.25, 0.35)
        mast_apex = (sx * 3.35, -2.05, 5.45)
        add_polyline_tube(bm_steel, [mast_base, mast_apex], [0.16, 0.09], segments=10)
        add_polyline_tube(bm_steel, [mast_rear, mast_apex], [0.14, 0.08], segments=10)
        # Tension tie-rods from mast apex to canopy ridge points
        for target in [
            (sx * 2.15, -3.15, 4.55),
            (sx * 1.15, -1.35, 4.95),
            (sx * 2.65, 0.45, 3.65),
            (sx * 5.25, -2.85, 0.40),
        ]:
            add_polyline_tube(bm_steel, [mast_apex, target], [0.035, 0.035], segments=6)

    # Rear anchor steel struts (+Y)
    for sx in (-1.65, 0.0, 1.65):
        add_polyline_tube(bm_steel, [(sx, 4.35, 0.32), (sx * 0.85, 3.55, 1.55)], [0.12, 0.08], segments=8)

    # Sculpted Concert Grand Piano on the stage deck (visible from -Y front!)
    px, py, pz = -0.35, -0.65, 0.74
    # Piano body & curved tail
    add_beveled_box(bm_piano, (px, py, pz + 0.56), 0.72, 0.52, 0.16, rot_euler=(0, 0, 0.25))
    add_beveled_cyl(bm_piano, (px + 0.15, py + 0.42, pz + 0.56), 0.62, 0.62, 0.30, segs=16)
    # 3 piano legs + pianist bench
    for lx, ly in [(px - 0.52, py - 0.38), (px + 0.52, py - 0.22), (px + 0.15, py + 0.78)]:
        add_beveled_cyl(bm_piano, (lx, ly, pz + 0.26), 0.055, 0.035, 0.52, segs=8)
    add_beveled_box(bm_piano, (px - 0.12, py - 0.82, pz + 0.24), 0.36, 0.16, 0.22, rot_euler=(0, 0, 0.25))
    # Raised angled grand piano lid, golden soundboard harp & prop stick
    add_beveled_box(bm_brass, (px + 0.05, py + 0.12, pz + 0.73), 0.54, 0.46, 0.03, rot_euler=(0, 0, 0.25))
    add_beveled_box(bm_piano, (px - 0.12, py + 0.12, pz + 1.05), 0.66, 0.52, 0.03, rot_euler=(0.15, -0.52, 0.25))
    add_polyline_tube(bm_brass, [(px + 0.42, py - 0.12, pz + 0.72), (px + 0.22, py - 0.08, pz + 1.18)], [0.02, 0.02], segments=6)

    # Warm golden stage footlights along the front curved stage rim (-Y) & acoustic ceiling orbs
    for f in range(-4, 5):
        ang = -math.pi * 0.5 + f * 0.22
        fx = math.cos(ang) * 4.05
        fy = -0.22 + math.sin(ang) * 4.05
        add_icosphere_puff(bm_glow, (fx, fy, 0.80), 0.13, subdivisions=1)
    for ox, oy, oz in [(-1.6, -1.4, 3.85), (0.0, -1.6, 4.25), (1.6, -1.4, 3.85)]:
        add_icosphere_puff(bm_glow, (ox, oy, oz), 0.20, subdivisions=2)

    create_mesh_obj("SBG_SymphonyStage_LakeRim", bm_water, mats["waterfall_aqua"], root)
    create_mesh_obj("SBG_SymphonyStage_StoneApron", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_SymphonyStage_TeakDeck", bm_teak, mats["warm_teak"], root)
    create_mesh_obj("SBG_SymphonyStage_ClamshellCanopy", bm_shell, mats["tensile_canopy"], root)
    create_mesh_obj("SBG_SymphonyStage_SteelMasts", bm_steel, mats["steel_diagrid"], root)
    create_mesh_obj("SBG_SymphonyStage_ConcertPiano", bm_piano, mats["black_timber"], root)
    create_mesh_obj("SBG_SymphonyStage_PianoBrass", bm_brass, mats["brass_gold"], root)
    create_mesh_obj("SBG_SymphonyStage_StageLights", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 6. SBG_Botany_Centre_Holttum_Hall
# ---------------------------------------------------------------------------

def build_botany_centre_holttum_hall(mats):
    """
    Botany Centre & Holttum Hall (1921 Heritage Museum Wing + Green Pavilion Rotunda):
    - Two-storey colonial red-brick-and-white-stucco Holttum Hall heritage building with arched ground arcade,
      red-brick pilasters, Classical cornice bands, green louvered shutters & pitched terracotta hip roof
    - Connected circular glass-and-timber Green Pavilion rotunda at front-right (+X, -Y) facing the camera
    """
    root = create_root_empty("SBG_Botany_Centre_Holttum_Hall")

    bm_stucco = bmesh.new()
    bm_brick = bmesh.new()
    bm_louver = bmesh.new()
    bm_roof = bmesh.new()
    bm_glass = bmesh.new()
    bm_brass = bmesh.new()
    bm_glow = bmesh.new()

    # 1. Two-storey 1921 Holttum Hall Heritage Wing centered at (-1.1, +0.9, 0) facing -Y
    hx, hy = -1.1, 0.9
    add_beveled_box(bm_brick, (hx, hy, 0.22), 4.6, 2.5, 0.22)
    add_beveled_box(bm_stucco, (hx, hy, 2.15), 4.25, 2.15, 1.72)

    # Exposed red-brick colonial pilasters, horizontal stringcourse & arched windows on -Y (front) & +Y (back)
    add_beveled_box(bm_brick, (hx, hy, 2.15), 4.38, 2.26, 0.10)
    add_beveled_box(bm_stucco, (hx, hy, 3.82), 4.42, 2.30, 0.12)
    for ix in range(-2, 3):
        px = hx + ix * 1.95
        for sy in (-1.0, 1.0):
            wy = hy + sy * 2.18
            add_beveled_box(bm_brick, (px, wy, 2.15), 0.22, 0.14, 1.76)
            if ix < 2:
                cx = px + 0.975
                # Ground floor arched colonnade window + upper floor green louvered window with brick arch lintel
                add_arched_opening_wall(bm_brick, (cx, wy, 1.18), 1.55, 0.24, 1.75, 1.15, 1.48)
                add_beveled_box(bm_louver, (cx, hy + sy * 2.12, 1.12), 0.48, 0.08, 0.56)
                add_beveled_box(bm_stucco, (cx, wy, 3.05), 0.56, 0.08, 0.58)
                add_beveled_box(bm_louver, (cx - 0.22, wy + sy * 0.03, 3.05), 0.20, 0.06, 0.52)
                add_beveled_box(bm_louver, (cx + 0.22, wy + sy * 0.03, 3.05), 0.20, 0.06, 0.52)
                add_beveled_box(bm_brick, (cx, wy + sy * 0.04, 3.65), 0.64, 0.10, 0.10)

    # Pitched terracotta hipped roof with ventilation ridge over Holttum Hall
    add_hipped_roof(bm_roof, (hx, hy, 4.55), 4.85, 2.75, 2.35, 0.35, 1.35, bevel_frac=0.06)
    add_hipped_roof(bm_roof, (hx, hy, 5.18), 2.45, 0.85, 1.55, 0.12, 0.48, bevel_frac=0.06)

    # 2. Circular Glass & Timber Green Pavilion Rotunda at (+2.4, -1.6, 0) prominently in front (-Y)!
    rx, ry = 2.4, -1.6
    add_beveled_cyl(bm_brick, (rx, ry, 0.20), 3.25, 3.15, 0.40, segs=28)

    # Geodesic timber diagrid dome over rotunda (doorway opening facing -Y)
    bm_grid = bmesh.new()
    bmesh.ops.create_icosphere(bm_grid, subdivisions=2, radius=2.95)
    del_faces = [
        f for f in bm_grid.faces
        if f.calc_center_median().z < 0.05
        or (f.calc_center_median().z < 1.95 and f.calc_center_median().y < -1.6 and abs(f.calc_center_median().x) < 1.2)
    ]
    bmesh.ops.delete(bm_grid, geom=del_faces, context='FACES')
    for v in bm_grid.verts:
        v.co.x += rx
        v.co.y += ry
        v.co.z = max(0.36, v.co.z * 0.96 + 0.28)

    mesh_grid = bpy.data.meshes.new("SBG_Holttum_RotundaDiagrid")
    bm_grid.to_mesh(mesh_grid)
    bm_grid.free()
    obj_grid = bpy.data.objects.new("SBG_Holttum_RotundaDiagrid", mesh_grid)
    bpy.context.collection.objects.link(obj_grid)
    wf = obj_grid.modifiers.new(name="HolttumWireframe", type='WIREFRAME')
    wf.thickness = 0.12
    wf.use_replace = True
    bpy.context.view_layer.objects.active = obj_grid
    obj_grid.select_set(True)
    bpy.ops.object.modifier_apply(modifier=wf.name)
    obj_grid.select_set(False)
    obj_grid.data.materials.append(mats["warm_teak"])
    obj_grid.parent = root

    # Inner glass rotunda dome, brass finial crown & glowing interior exhibition core
    add_beveled_cyl(bm_glass, (rx, ry, 1.55), 2.78, 2.15, 2.35, segs=24, cap_ends=True)
    add_beveled_cyl(bm_brass, (rx, ry, 3.48), 0.48, 0.05, 0.78, segs=12)
    add_icosphere_puff(bm_brass, (rx, ry, 3.95), 0.16, subdivisions=2)
    add_icosphere_puff(bm_glow, (rx, ry, 1.45), 0.42, subdivisions=2)

    create_mesh_obj("SBG_Holttum_MuseumStucco", bm_stucco, mats["stucco_white"], root)
    create_mesh_obj("SBG_Holttum_BrickPilasters", bm_brick, mats["heritage_brick"], root)
    create_mesh_obj("SBG_Holttum_LouverWindows", bm_louver, mats["louver_green"], root)
    create_mesh_obj("SBG_Holttum_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_Holttum_RotundaGlass", bm_glass, mats["conservatory_glass"], root)
    create_mesh_obj("SBG_Holttum_CrownFinial", bm_brass, mats["brass_gold"], root)
    create_mesh_obj("SBG_Holttum_InteriorGlow", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 7. SBG_Atbara_House_1898
# ---------------------------------------------------------------------------

def build_atbara_house_1898(mats):
    """
    Atbara House (1898 Conserved Black-and-White Tudor-Revival Bungalow, Gallop Extension):
    - Raised white colonial plinth & ground-floor arched masonry colonnade
    - Projecting two-storey front gable porch oriented toward -Y (front camera)
    - Overhanging upper floor with crisp black timber half-timbering: vertical studs,
      horizontal rails, AND diagonal Tudor cross-bracing on white stucco walls
    - Black-and-white striped bamboo blinds (`chik`) & louvered colonial shutters
    - Steeply pitched terracotta hipped roof + front Tudor gable pediment with king-post struts
    """
    root = create_root_empty("SBG_Atbara_House_1898")

    bm_white = bmesh.new()
    bm_black = bmesh.new()
    bm_louver = bmesh.new()
    bm_roof = bmesh.new()
    bm_glow = bmesh.new()

    # Raised colonial plinth & front entrance steps at -Y
    add_beveled_box(bm_white, (0, 0, 0.22), 5.3, 4.1, 0.22)
    add_beveled_box(bm_white, (0, -4.65, 0.18), 1.95, 0.85, 0.18)
    for step_i in range(3):
        add_beveled_box(bm_white, (0, -5.45 - step_i * 0.24, 0.08 + (2 - step_i) * 0.09), 1.25, 0.18, 0.07)

    # Ground-floor white masonry core & arched verandah colonnade
    add_beveled_box(bm_white, (0, 0, 1.38), 4.2, 3.0, 0.96)
    for sy in (-1.0, 1.0):
        vy = sy * 3.55
        for ix in range(-2, 3):
            px = ix * 2.15
            add_beveled_box(bm_white, (px, vy, 1.35), 0.25, 0.25, 0.94)
            add_beveled_box(bm_white, (px, vy, 0.50), 0.30, 0.30, 0.12)
            if ix < 2:
                add_arched_opening_wall(bm_white, (px + 1.075, vy, 1.38), 1.90, 0.38, 1.92, 1.52, 1.62)

    # Projecting front porch arches at -Y
    for sx in (-1.55, 1.55):
        add_beveled_box(bm_white, (sx, -5.15, 1.35), 0.25, 0.25, 0.94)
    add_arched_opening_wall(bm_white, (0, -5.15, 1.38), 2.85, 0.38, 1.92, 2.25, 1.65)

    # Upper floor overhanging Black-and-White Tudor-revival timber-framed body (z = 2.32..4.18m)
    add_beveled_box(bm_white, (0, 0, 3.25), 4.90, 3.70, 0.94)
    # Projecting upper front gable bay at -Y
    add_beveled_box(bm_white, (0, -4.35, 3.25), 1.68, 0.92, 0.94)

    # Horizontal black timber beams & moulded floor jetty brackets
    for z_beam in (2.34, 3.12, 4.14):
        add_beveled_box(bm_black, (0, 0, z_beam), 4.98, 3.78, 0.08)
        add_beveled_box(bm_black, (0, -4.35, z_beam), 1.76, 0.98, 0.08)

    # Front (-Y) and Back (+Y) vertical black timber studs, diagonal Tudor braces & striped shutters
    for sy in (-1.0, 1.0):
        vy = sy * 3.74
        for ix in range(-4, 5):
            px = ix * 1.20
            add_beveled_box(bm_black, (px, vy, 3.25), 0.075, 0.075, 0.92)
            if ix < 4:
                bx = px + 0.60
                # Diagonal Tudor cross-bracing in the lower half-timbered bay (z = 2.36..3.10)
                diag_sign = 1.0 if (ix % 2 == 0) else -1.0
                add_polyline_tube(
                    bm_black,
                    [(bx - 0.52, vy, 2.40 if diag_sign > 0 else 3.06),
                     (bx + 0.52, vy, 3.06 if diag_sign > 0 else 2.40)],
                    0.048, segments=6
                )
                # Upper window bay with dark louver blind & striped chik valence
                add_beveled_box(bm_black, (bx, vy, 3.62), 0.44, 0.07, 0.38)
                add_beveled_box(bm_louver, (bx, vy + sy * 0.02, 3.58), 0.36, 0.06, 0.30)

    # Left (-X) and Right (+X) side half-timbering with diagonal Tudor struts
    for sx in (-1.0, 1.0):
        vx = sx * 4.94
        for iy in (-3, -1, 1, 3):
            py = iy * 1.18
            add_beveled_box(bm_black, (vx, py, 3.25), 0.075, 0.075, 0.92)
        for iy in (-2, 0, 2):
            by = iy * 1.18
            add_beveled_box(bm_black, (vx, by, 3.25), 0.075, 0.075, 0.92)
            add_polyline_tube(bm_black, [(vx, by - 0.50, 2.40), (vx, by + 0.50, 3.06)], 0.048, segments=6)
            add_beveled_box(bm_black, (vx, by, 3.62), 0.07, 0.42, 0.38)
            add_beveled_box(bm_louver, (vx + sx * 0.02, by, 3.58), 0.06, 0.34, 0.30)

    # Projecting front gable bay (-Y = -5.28m) Tudor half-timbering + triangular gable pediment
    fy = -5.28
    for gx in (-1.68, -0.84, 0.0, 0.84, 1.68):
        add_beveled_box(bm_black, (gx, fy, 3.25), 0.08, 0.08, 0.92)
    for bx, sgn in [(-1.26, 1.0), (-0.42, -1.0), (0.42, 1.0), (1.26, -1.0)]:
        add_polyline_tube(bm_black, [(bx - 0.36, fy, 2.40), (bx + 0.36, fy, 3.06)], 0.048, segments=6)
        add_beveled_box(bm_black, (bx, fy, 3.62), 0.32, 0.07, 0.36)
        add_beveled_box(bm_louver, (bx, fy - 0.02, 3.58), 0.25, 0.06, 0.28)

    # White stucco front gable triangle & black timber king-post + diagonal gable struts
    add_gable_roof(bm_white, (0, -4.35, 4.72), 1.68, 0.92, 1.05, ridge_along_y=True)
    add_beveled_box(bm_black, (0, fy - 0.03, 4.70), 0.07, 0.07, 0.52)
    add_polyline_tube(bm_black, [(-1.65, fy - 0.03, 4.18), (0.0, fy - 0.03, 5.22), (1.65, fy - 0.03, 4.18)], 0.065, segments=6)
    add_polyline_tube(bm_black, [(-0.82, fy - 0.03, 4.18), (0.0, fy - 0.03, 4.82), (0.82, fy - 0.03, 4.18)], 0.05, segments=6)

    # Steeply pitched terracotta hipped roof + front gable roof
    add_hipped_roof(bm_roof, (0, 0, 5.05), 5.55, 4.25, 2.15, 0.65, 1.72, bevel_frac=0.05)
    add_gable_roof(bm_roof, (0, -3.85, 4.82), 1.98, 1.62, 1.18, ridge_along_y=True)

    # Welcoming warm veranda lanterns on front porch (-Y)
    for sx in (-1.15, 0.0, 1.15):
        add_icosphere_puff(bm_glow, (sx, -4.65, 2.08), 0.18, subdivisions=1)

    create_mesh_obj("SBG_Atbara_WhiteStucco", bm_white, mats["stucco_white"], root)
    create_mesh_obj("SBG_Atbara_BlackTimberFrame", bm_black, mats["black_timber"], root)
    create_mesh_obj("SBG_Atbara_LouverShutters", bm_louver, mats["louver_green"], root)
    create_mesh_obj("SBG_Atbara_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_Atbara_VerandaLanterns", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# 8. SBG_Inverturret_Gallery_1906
# ---------------------------------------------------------------------------

def build_inverturret_gallery_1906(mats):
    """
    Inverturret (1906 Conserved Colonial Bungalow, Botanical Art Gallery at 7 Gallop Road):
    - White Edwardian / Arts-and-Crafts hillside bungalow oriented toward -Y (front camera)
    - Cylindrical/polygonal corner bay turret on the front-left corner (-X, -Y) with conical terracotta roof
    - Two-storey arched loggia verandah across -Y front with white balustrade railings & moulded arches
    - Green louvered plantation shutters (`louver_green`) & terracotta hipped roof with dormer vents
    """
    root = create_root_empty("SBG_Inverturret_Gallery_1906")

    bm_stucco = bmesh.new()
    bm_stone = bmesh.new()
    bm_roof = bmesh.new()
    bm_louver = bmesh.new()
    bm_glow = bmesh.new()

    # Hillside terraced stone base & front entrance steps at -Y
    add_beveled_box(bm_stone, (0, 0, 0.24), 5.1, 3.9, 0.24)
    for step_i in range(3):
        add_beveled_box(bm_stone, (0.85, -4.12 - step_i * 0.25, 0.08 + (2 - step_i) * 0.08), 1.35, 0.18, 0.07)

    # Main white stucco colonial gallery core (shifted slightly +Y so front loggia & turret sit at -Y)
    add_beveled_box(bm_stucco, (0.35, 0.25, 2.05), 4.25, 2.85, 1.62)

    # Signature cylindrical/octagonal corner turret bay on the front-left corner (-X = -3.45, -Y = -2.25)
    tx, ty = -3.45, -2.25
    add_beveled_cyl(bm_stone, (tx, ty, 0.32), 1.55, 1.48, 0.42, segs=16)
    add_beveled_cyl(bm_stucco, (tx, ty, 2.12), 1.38, 1.34, 3.28, segs=16)
    add_beveled_cyl(bm_stucco, (tx, ty, 2.15), 1.44, 1.44, 0.14, segs=16)
    add_beveled_cyl(bm_stucco, (tx, ty, 3.72), 1.44, 1.48, 0.16, segs=16)
    # Louvered turret bay windows on two levels around the front-facing arc
    for ang_deg in (-145, -105, -65, -25):
        ang = math.radians(ang_deg)
        wx = tx + math.cos(ang) * 1.36
        wy = ty + math.sin(ang) * 1.36
        for wz in (1.35, 2.95):
            add_beveled_box(bm_louver, (wx, wy, wz), 0.26, 0.07, 0.46, rot_euler=(0, 0, ang + math.pi / 2))
    # Conical terracotta turret roof + finial
    add_beveled_cyl(bm_roof, (tx, ty, 4.42), 1.72, 0.08, 1.32, segs=16, bevel_frac=0.06)

    # Two-storey Arched Front Loggia Colonnade along -Y (y = -3.15m)
    fy = -3.15
    add_beveled_box(bm_stucco, (1.15, fy, 2.12), 3.35, 0.28, 0.14)
    add_beveled_box(bm_stucco, (1.15, fy, 2.52), 3.25, 0.10, 0.28)
    for ix in range(-1, 3):
        px = -0.35 + ix * 1.50
        # Ground & upper loggia piers
        add_beveled_box(bm_stucco, (px, fy, 1.18), 0.22, 0.22, 0.92)
        add_beveled_box(bm_stucco, (px, fy, 2.95), 0.20, 0.20, 0.78)
        if ix < 2:
            cx = px + 0.75
            # Ground floor & upper floor semicircular loggia arches + inner green louvered French doors
            add_arched_opening_wall(bm_stucco, (cx, fy, 1.18), 1.32, 0.36, 1.82, 1.05, 1.55)
            add_arched_opening_wall(bm_stucco, (cx, fy, 2.95), 1.32, 0.34, 1.58, 1.05, 1.35)
            add_beveled_box(bm_louver, (cx, -2.55, 1.18), 0.42, 0.07, 0.58)
            add_beveled_box(bm_louver, (cx, -2.55, 2.95), 0.42, 0.07, 0.52)

    # Side & rear green louvered plantation shutters
    for sx in (-3.85, 4.55):
        for iy in (-1, 0, 1):
            add_beveled_box(bm_louver, (sx, 0.25 + iy * 1.45, 2.95), 0.07, 0.38, 0.52)
            add_beveled_box(bm_louver, (sx, 0.25 + iy * 1.45, 1.25), 0.07, 0.38, 0.58)

    # Red Terracotta Hipped Roof over main gallery + front dormer vent
    add_hipped_roof(bm_roof, (0.45, 0.05, 4.42), 4.85, 3.68, 2.15, 0.65, 1.55, bevel_frac=0.06)
    add_gable_roof(bm_roof, (1.15, -2.45, 4.55), 0.75, 0.85, 0.62, ridge_along_y=True)
    add_beveled_box(bm_louver, (1.15, -3.22, 4.42), 0.42, 0.08, 0.24)

    # Warm gallery interior lantern glow visible in front loggia & corner turret
    add_icosphere_puff(bm_glow, (1.15, -2.85, 1.65), 0.24, subdivisions=2)
    add_icosphere_puff(bm_glow, (1.15, -2.85, 3.35), 0.22, subdivisions=2)
    add_icosphere_puff(bm_glow, (tx, ty, 3.15), 0.24, subdivisions=1)

    create_mesh_obj("SBG_Inverturret_WhiteStucco", bm_stucco, mats["stucco_white"], root)
    create_mesh_obj("SBG_Inverturret_StonePlinth", bm_stone, mats["ivory_stone"], root)
    create_mesh_obj("SBG_Inverturret_TerracottaRoof", bm_roof, mats["terracotta_roof"], root)
    create_mesh_obj("SBG_Inverturret_Louvers", bm_louver, mats["louver_green"], root)
    create_mesh_obj("SBG_Inverturret_GalleryGlow", bm_glow, mats["lantern_glow"], root)
    return root


# ---------------------------------------------------------------------------
# MAIN BUILD & GLB EXPORT
# ---------------------------------------------------------------------------

def main():
    clear_scene()
    mats = build_shared_materials()

    roots = [
        build_bandstand_gazebo_1930(mats),
        build_burkill_hall_1868(mats),
        build_sembcorp_cool_house(mats),
        build_tan_hoon_siang_mist_house(mats),
        build_shaw_symphony_stage(mats),
        build_botany_centre_holttum_hall(mats),
        build_atbara_house_1898(mats),
        build_inverturret_gallery_1906(mats),
    ]

    depsgraph = bpy.context.evaluated_depsgraph_get()
    print("=== SBG BUILDINGS & LANDMARKS SUMMARY ===")
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
    out_path = os.path.join(out_dir, "sbg_buildings_landmarks.glb")

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
    )
    print(f"SUCCESSFULLY EXPORTED: {out_path} ({os.path.getsize(out_path)} bytes)")


if __name__ == "__main__":
    main()
