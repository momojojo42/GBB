import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

# ---------------------------------------------------------------------------
# Helpers: Scene Reset, Color Conversion, Principled BSDF Materials, Mesh Utils
# ---------------------------------------------------------------------------

def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)


def srgb_to_linear(c):
    if c <= 0.04045:
        return c / 12.92
    return ((c + 0.055) / 1.055) ** 2.4


def hex_to_rgba(hex_str, alpha=1.0):
    h = hex_str.lstrip('#')
    r = srgb_to_linear(int(h[0:2], 16) / 255.0)
    g = srgb_to_linear(int(h[2:4], 16) / 255.0)
    b = srgb_to_linear(int(h[4:6], 16) / 255.0)
    return (r, g, b, alpha)


def make_mat(name, hex_color, roughness=0.45, metallic=0.0,
             emission_hex=None, emission_strength=0.0, alpha=1.0):
    mat = bpy.data.materials.get(name)
    if mat is not None:
        return mat
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new(type="ShaderNodeBsdfPrincipled")
    rgba = hex_to_rgba(hex_color, alpha)
    bsdf.inputs["Base Color"].default_value = rgba
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    if emission_strength > 0.0:
        em_rgba = hex_to_rgba(emission_hex if emission_hex else hex_color, 1.0)
        if "Emission Color" in bsdf.inputs:
            bsdf.inputs["Emission Color"].default_value = em_rgba
        elif "Emission" in bsdf.inputs:
            bsdf.inputs["Emission"].default_value = em_rgba
        if "Emission Strength" in bsdf.inputs:
            bsdf.inputs["Emission Strength"].default_value = emission_strength
    if alpha < 1.0:
        if "Alpha" in bsdf.inputs:
            bsdf.inputs["Alpha"].default_value = alpha
        mat.blend_method = 'BLEND' if hasattr(mat, 'blend_method') else 'OPAQUE'
    return mat


def create_root_empty(name):
    empty = bpy.data.objects.new(name, None)
    empty.empty_display_type = 'PLAIN_AXES'
    empty.empty_display_size = 0.25
    empty.location = (0.0, 0.0, 0.0)
    bpy.context.collection.objects.link(empty)
    return empty


def create_mesh_obj(name, bm, mat, parent=None, subsurf_levels=0, smooth=True):
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    if smooth:
        for poly in mesh.polygons:
            poly.use_smooth = True
    obj = bpy.data.objects.new(name, mesh)
    if mat:
        obj.data.materials.append(mat)
    bpy.context.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    if subsurf_levels > 0:
        mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
        mod.levels = subsurf_levels
        mod.render_levels = subsurf_levels
    return obj


def add_tube_along_points(bm, pts, radii, segments=12, cap_ends=True):
    """Builds a smooth tubular mesh along a 3D polyline with variable radius."""
    rings = []
    n = len(pts)
    for i in range(n):
        p = Vector(pts[i])
        r = radii[i]
        if i == 0:
            tangent = (Vector(pts[1]) - p).normalized()
        elif i == n - 1:
            tangent = (p - Vector(pts[i - 1])).normalized()
        else:
            tangent = (Vector(pts[i + 1]) - Vector(pts[i - 1])).normalized()
        if tangent.length < 1e-6:
            tangent = Vector((0, 0, 1))
        up = Vector((0, 0, 1)) if abs(tangent.z) < 0.92 else Vector((1, 0, 0))
        side = tangent.cross(up).normalized()
        up_ortho = side.cross(tangent).normalized()

        ring_verts = []
        for s in range(segments):
            ang = (2.0 * math.pi * s) / segments
            offset = side * (math.cos(ang) * r) + up_ortho * (math.sin(ang) * r)
            ring_verts.append(bm.verts.new(p + offset))
        rings.append(ring_verts)

    for i in range(n - 1):
        r0 = rings[i]
        r1 = rings[i + 1]
        for s in range(segments):
            sn = (s + 1) % segments
            bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))

    if cap_ends and len(rings) >= 2:
        # Add inner cap ring at start & end so Catmull-Clark Subsurf preserves full tube length
        for end_idx, ring_verts, reverse_winding in [(0, rings[0], True), (n - 1, rings[-1], False)]:
            p_end = Vector(pts[end_idx])
            inner_ring = []
            for v in ring_verts:
                inner_ring.append(bm.verts.new(p_end.lerp(v.co, 0.55)))
            for s in range(segments):
                sn = (s + 1) % segments
                if reverse_winding:
                    bm.faces.new((ring_verts[sn], ring_verts[s], inner_ring[s], inner_ring[sn]))
                else:
                    bm.faces.new((ring_verts[s], ring_verts[sn], inner_ring[sn], inner_ring[s]))
            if reverse_winding:
                bm.faces.new(list(reversed(inner_ring)))
            else:
                bm.faces.new(inner_ring)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)


def build_materials():
    return {
        # Pedestal & Gold
        "sandstone": make_mat("Mat_CreamSandstone", "#F1F5F9", roughness=0.55, metallic=0.05),
        "gold_trim": make_mat("Mat_BrushedGold", "#FBBF24", roughness=0.20, metallic=0.88,
                              emission_hex="#F59E0B", emission_strength=0.18),
        "rune_glow": make_mat("Mat_BotanicalRuneCyan", "#34D399", roughness=0.15, metallic=0.1,
                              emission_hex="#34D399", emission_strength=2.2),

        # Orchid
        "orchid_magenta": make_mat("Mat_OrchidMagenta", "#EC4899", roughness=0.30, metallic=0.05,
                                   emission_hex="#EC4899", emission_strength=0.35),
        "orchid_coral": make_mat("Mat_OrchidCoral", "#F97316", roughness=0.28, metallic=0.05,
                                 emission_hex="#F97316", emission_strength=0.45),
        "orchid_gold": make_mat("Mat_OrchidYellow", "#FACC15", roughness=0.22, metallic=0.2,
                                emission_hex="#FACC15", emission_strength=1.4),

        # Pitcher Plant
        "pitcher_body": make_mat("Mat_PitcherRuby", "#BE123C", roughness=0.28, metallic=0.08,
                                 emission_hex="#BE123C", emission_strength=0.25),
        "pitcher_green": make_mat("Mat_PitcherEmerald", "#10B981", roughness=0.32, metallic=0.05,
                                  emission_hex="#10B981", emission_strength=0.2),
        "pitcher_rim": make_mat("Mat_PitcherPeristome", "#9F1239", roughness=0.22, metallic=0.18,
                                emission_hex="#F43F5E", emission_strength=0.4),

        # Jade Vine
        "jade_blossom": make_mat("Mat_JadeVineTurquoise", "#2DD4BF", roughness=0.20, metallic=0.1,
                                 emission_hex="#2DD4BF", emission_strength=0.8),
        "vine_stem": make_mat("Mat_BotanicalStem", "#15803D", roughness=0.48, metallic=0.0),

        # Peranakan Lantern
        "lantern_gold": make_mat("Mat_LanternGold", "#FBBF24", roughness=0.18, metallic=0.90,
                                 emission_hex="#F59E0B", emission_strength=0.2),
        "nyonya_amber": make_mat("Mat_NyonyaAmberGlass", "#F59E0B", roughness=0.15, metallic=0.1,
                                 emission_hex="#FBBF24", emission_strength=2.0),
        "nyonya_turquoise": make_mat("Mat_NyonyaTurquoiseGlass", "#2DD4BF", roughness=0.15, metallic=0.1,
                                     emission_hex="#2DD4BF", emission_strength=2.0),
        "silk_tassel": make_mat("Mat_CrimsonSilk", "#DC2626", roughness=0.35, metallic=0.1,
                                emission_hex="#EF4444", emission_strength=0.35),

        # Solar Seed
        "solar_core": make_mat("Mat_SolarAmberCore", "#F59E0B", roughness=0.15, metallic=0.25,
                               emission_hex="#F59E0B", emission_strength=2.2),
        "solar_ring": make_mat("Mat_SolarVioletRing", "#C02678", roughness=0.22, metallic=0.80,
                               emission_hex="#C02678", emission_strength=0.55),

        # Merlion Idol
        "celadon_jade": make_mat("Mat_CeladonJade", "#10B981", roughness=0.18, metallic=0.12,
                                 emission_hex="#10B981", emission_strength=0.32),
        "wave_turquoise": make_mat("Mat_WaveTurquoise", "#06B6D4", roughness=0.22, metallic=0.15,
                                   emission_hex="#22D3EE", emission_strength=0.45),

        # Foliage & Trunks
        "bark_dark": make_mat("Mat_BarkDark", "#5C4033", roughness=0.78, metallic=0.0),
        "bark_palm": make_mat("Mat_PalmTrunkGrey", "#94A3B8", roughness=0.62, metallic=0.0),
        "bark_plumeria": make_mat("Mat_PlumeriaBark", "#78716C", roughness=0.68, metallic=0.0),
        "bark_fern": make_mat("Mat_FernFibrousTrunk", "#3E2723", roughness=0.88, metallic=0.0),

        "foliage_deep": make_mat("Mat_FoliageDeep", "#15803D", roughness=0.52, metallic=0.0),
        "foliage_mid": make_mat("Mat_FoliageMid", "#16A34A", roughness=0.48, metallic=0.0),
        "foliage_bright": make_mat("Mat_FoliageBright", "#22C55E", roughness=0.44, metallic=0.0),
        "foliage_lush": make_mat("Mat_FoliageLush", "#4ADE80", roughness=0.42, metallic=0.0),
        "foliage_lime": make_mat("Mat_FoliageLime", "#84CC16", roughness=0.40, metallic=0.0),

        "samanea_pink": make_mat("Mat_SamaneaPink", "#F472B6", roughness=0.40, metallic=0.0,
                                 emission_hex="#F9A8D4", emission_strength=0.18),
        "coconut_brown": make_mat("Mat_CoconutBrown", "#92400E", roughness=0.55, metallic=0.0),
        "frangipani_white": make_mat("Mat_FrangipaniWhite", "#FFFFFF", roughness=0.32, metallic=0.0,
                                     emission_hex="#FFFFFF", emission_strength=0.15),
        "frangipani_yellow": make_mat("Mat_FrangipaniYellow", "#FEF08A", roughness=0.30, metallic=0.0,
                                      emission_hex="#FACC15", emission_strength=0.35),
        "bougainvillea_magenta": make_mat("Mat_BougainvilleaMagenta", "#DB2777", roughness=0.38, metallic=0.0,
                                          emission_hex="#DB2777", emission_strength=0.20),
        "bougainvillea_coral": make_mat("Mat_BougainvilleaCoral", "#F43F5E", roughness=0.38, metallic=0.0,
                                        emission_hex="#F43F5E", emission_strength=0.20),
    }


# ===========================================================================
# PART A: ORNATE TREASURE PEDESTAL & 6 HERO BOTANICAL / HERITAGE RELICS
# ===========================================================================

def build_relic_pedestal(mats):
    """
    1. Relic_Pedestal (z = 0..0.55m, radius ~0.65m):
    Stepped octagonal cream-sandstone plinth (#F1F5F9) with brushed-gold trim rings
    (#FBBF24) and a glowing cyan-emerald botanical rune ring (#34D399) at z=0.52m.
    """
    root = create_root_empty("Relic_Pedestal")

    # Stepped octagonal sandstone plinth
    bm_stone = bmesh.new()
    steps = [
        # (z_bot, z_top, r_bot, r_top)
        (0.00, 0.12, 0.66, 0.63),
        (0.12, 0.28, 0.56, 0.52),
        (0.28, 0.44, 0.46, 0.48),
        (0.44, 0.55, 0.52, 0.50),
    ]
    for z0, z1, r0, r1 in steps:
        zc = 0.5 * (z0 + z1)
        h = z1 - z0
        bmesh.ops.create_cone(
            bm_stone, cap_ends=True, cap_tris=False, segments=8,
            radius1=r0, radius2=r1, depth=h,
            matrix=Matrix.Translation((0, 0, zc))
        )
    create_mesh_obj("Relic_Pedestal_Plinth", bm_stone, mats["sandstone"], parent=root, subsurf_levels=1)

    # Brushed-gold trim rings & corner vertical pilasters
    bm_gold = bmesh.new()
    gold_rings = [
        (0.03, 0.67, 0.035),
        (0.12, 0.59, 0.028),
        (0.28, 0.50, 0.025),
        (0.45, 0.53, 0.030),
        (0.54, 0.49, 0.022),
    ]
    for zc, rad, thick in gold_rings:
        bmesh.ops.create_cone(
            bm_gold, cap_ends=True, cap_tris=False, segments=16,
            radius1=rad, radius2=rad * 0.98, depth=thick,
            matrix=Matrix.Translation((0, 0, zc))
        )
    # 8 small ornate gold studs around the upper rim
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0 + (math.pi / 8.0)
        px = math.cos(ang) * 0.51
        py = math.sin(ang) * 0.51
        bmesh.ops.create_icosphere(
            bm_gold, subdivisions=1, radius=0.028,
            matrix=Matrix.Translation((px, py, 0.49))
        )
    create_mesh_obj("Relic_Pedestal_GoldTrim", bm_gold, mats["gold_trim"], parent=root, subsurf_levels=1)

    # Glowing cyan-emerald botanical rune ring at z=0.52m
    bm_rune = bmesh.new()
    bmesh.ops.create_cone(
        bm_rune, cap_ends=True, cap_tris=False, segments=24,
        radius1=0.43, radius2=0.41, depth=0.045,
        matrix=Matrix.Translation((0, 0, 0.532))
    )
    # 8 raised petal rune glyphs around z=0.52m
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0
        px = math.cos(ang) * 0.34
        py = math.sin(ang) * 0.34
        rot = Matrix.Rotation(ang, 4, 'Z')
        scale = Matrix.Diagonal((0.06, 0.025, 0.018, 1.0))
        bmesh.ops.create_icosphere(
            bm_rune, subdivisions=1, radius=1.0,
            matrix=Matrix.Translation((px, py, 0.552)) @ rot @ scale
        )
    create_mesh_obj("Relic_Pedestal_RuneRing", bm_rune, mats["rune_glow"], parent=root, subsurf_levels=0)
    return root


def build_relic_orchid(mats):
    """
    2. Relic_Orchid (Vanda Miss Joaquim — centered at z = 0.85..1.65m):
    5 sculpted Subsurf orchid petals in vibrant magenta-rose (#EC4899) with a ruffled
    coral-orange and golden-yellow labellum lip (#F97316 / #FACC15) and glowing golden pollen core.
    """
    root = create_root_empty("Relic_Orchid")
    center = Vector((0.0, 0.0, 1.25))

    # 5 sculpted Subsurf orchid petals (1 dorsal sepal, 2 lateral petals, 2 lateral sepals)
    bm_petals = bmesh.new()
    petal_Angles = [
        (0.0, 0.38, 1.05, 0.22),          # Top dorsal sepal
        (1.18, 0.44, 0.95, 0.32),         # Upper right petal
        (-1.18, 0.44, 0.95, 0.32),        # Upper left petal
        (2.35, 0.40, 0.85, -0.15),        # Lower right sepal
        (-2.35, 0.40, 0.85, -0.15),       # Lower left sepal
    ]
    for ang, length, width_scale, tilt_y in petal_Angles:
        bm_tmp = bmesh.new()
        bmesh.ops.create_uvsphere(bm_tmp, u_segments=12, v_segments=8, radius=1.0)
        for v in bm_tmp.verts:
            # Sculpt cupped, slightly recurved orchid petal shape
            u = (v.co.z + 1.0) * 0.5  # 0 at base, 1 at tip
            cup = math.sin(u * math.pi) * 0.045 * (v.co.x ** 2)
            v.co.x *= 0.14 * width_scale * (0.45 + 0.75 * math.sin(u * math.pi))
            v.co.y = v.co.y * 0.032 + cup - 0.03 * (u ** 2)
            v.co.z = u * length
        rot_z = Matrix.Rotation(ang, 4, 'Y')
        rot_x = Matrix.Rotation(tilt_y, 4, 'X')
        bmesh.ops.transform(bm_tmp, matrix=Matrix.Translation(center) @ rot_z @ rot_x, verts=bm_tmp.verts)
        for f in bm_tmp.faces:
            bm_petals.faces.new([bm_petals.verts.new(v.co) for v in f.verts])
        bm_tmp.free()

    bmesh.ops.remove_doubles(bm_petals, verts=bm_petals.verts, dist=0.0005)
    create_mesh_obj("Relic_Orchid_Petals", bm_petals, mats["orchid_magenta"], parent=root, subsurf_levels=2)

    # Ruffled coral-orange labellum lip protruding forward & downward
    bm_lip = bmesh.new()
    bmesh.ops.create_uvsphere(bm_lip, u_segments=14, v_segments=10, radius=1.0)
    for v in bm_lip.verts:
        u = (v.co.z + 1.0) * 0.5
        ruffle = math.sin(math.atan2(v.co.x, v.co.y + 1.2) * 8.0) * 0.025 * u
        v.co.x = v.co.x * (0.16 + 0.08 * u) + ruffle
        v.co.y = -0.06 - u * 0.22 + v.co.y * 0.05
        v.co.z = -u * 0.28 + abs(v.co.x) * 0.15
    bmesh.ops.transform(bm_lip, matrix=Matrix.Translation(center + Vector((0, -0.02, -0.02))), verts=bm_lip.verts)
    create_mesh_obj("Relic_Orchid_Labellum", bm_lip, mats["orchid_coral"], parent=root, subsurf_levels=2)

    # Glowing golden pollen column & side auricles
    bm_core = bmesh.new()
    bmesh.ops.create_icosphere(
        bm_core, subdivisions=2, radius=0.085,
        matrix=Matrix.Translation(center + Vector((0, -0.07, 0.02))) @ Matrix.Diagonal((0.9, 1.2, 0.85, 1.0))
    )
    for sx in (-0.08, 0.08):
        bmesh.ops.create_icosphere(
            bm_core, subdivisions=2, radius=0.055,
            matrix=Matrix.Translation(center + Vector((sx, -0.09, -0.05)))
        )
    # Short arched golden stem behind flower
    stem_pts = [
        center + Vector((0, 0.04, 0.0)),
        center + Vector((0, 0.14, -0.14)),
        center + Vector((0, 0.16, -0.34)),
    ]
    add_tube_along_points(bm_core, stem_pts, [0.028, 0.024, 0.018], segments=10)
    create_mesh_obj("Relic_Orchid_GoldenCore", bm_core, mats["orchid_gold"], parent=root, subsurf_levels=1)
    return root


def build_relic_pitcher_plant(mats):
    """
    3. Relic_PitcherPlant (Cloud Forest Nepenthes, centered at z = 0.85..1.65m):
    Sculpted S-curved tubular pitcher cup (Subsurf + flared peristome rim) in
    emerald-green and crimson-spotted ruby (#BE123C), open leaf lid held aloft, and coiled tendril.
    """
    root = create_root_empty("Relic_PitcherPlant")

    # S-curved tubular pitcher cup (hollow rim at top)
    bm_cup = bmesh.new()
    cup_steps = 18
    seg = 16
    rings = []
    for i in range(cup_steps):
        t = i / (cup_steps - 1)  # 0 at bottom pouch, 1 at mouth
        z = 0.92 + t * 0.52
        y_shift = math.sin(t * math.pi * 1.35) * 0.055
        # bulbous lower belly narrowing at waist then flaring slightly
        rad = 0.03 + 0.165 * math.sin(math.pow(t, 0.55) * math.pi * 0.88)
        if t > 0.72:
            rad += (t - 0.72) * 0.18
        ring = []
        for s in range(seg):
            ang = (2.0 * math.pi * s) / seg
            # Slight anterior keel ribs
            rib = 1.0 + 0.05 * math.cos(ang * 2.0)
            px = math.cos(ang) * rad * rib
            py = y_shift + math.sin(ang) * rad * (1.05 if math.sin(ang) < 0 else 0.95)
            ring.append(bm_cup.verts.new((px, py, z)))
        rings.append(ring)

    for i in range(cup_steps - 1):
        for s in range(seg):
            sn = (s + 1) % seg
            bm_cup.faces.new((rings[i][s], rings[i][sn], rings[i + 1][sn], rings[i + 1][s]))
    bm_cup.faces.new(list(reversed(rings[0])))
    bmesh.ops.recalc_face_normals(bm_cup, faces=bm_cup.faces)
    create_mesh_obj("Relic_PitcherPlant_Cup", bm_cup, mats["pitcher_body"], parent=root, subsurf_levels=2)

    # Flared ribbed peristome collar rim around mouth (z ~ 1.44m)
    bm_rim = bmesh.new()
    rim_seg = 24
    tube_seg = 10
    major_r = 0.145
    minor_r = 0.038
    rim_rings = []
    for i in range(rim_seg):
        u = (2.0 * math.pi * i) / rim_seg
        cx = math.cos(u) * major_r
        cy = -0.02 + math.sin(u) * major_r * 1.05
        cz = 1.44 + math.sin(u) * 0.035  # raised at back near lid
        r_scale = 1.0 + 0.12 * math.sin(u * 12.0)  # ribbed ridges
        t_ring = []
        for j in range(tube_seg):
            v = (2.0 * math.pi * j) / tube_seg
            rad_xy = major_r + math.cos(v) * minor_r * r_scale
            px = math.cos(u) * rad_xy
            py = -0.02 + math.sin(u) * rad_xy * 1.05
            pz = cz + math.sin(v) * minor_r * r_scale
            t_ring.append(bm_rim.verts.new((px, py, pz)))
        rim_rings.append(t_ring)
    for i in range(rim_seg):
        inext = (i + 1) % rim_seg
        for j in range(tube_seg):
            jn = (j + 1) % tube_seg
            bm_rim.faces.new((rim_rings[i][j], rim_rings[inext][j], rim_rings[inext][jn], rim_rings[i][jn]))
    bmesh.ops.recalc_face_normals(bm_rim, faces=bm_rim.faces)
    create_mesh_obj("Relic_PitcherPlant_Peristome", bm_rim, mats["pitcher_rim"], parent=root, subsurf_levels=1)

    # Open emerald leaf lid held aloft + coiled tendril at base
    bm_green = bmesh.new()
    # Leaf lid (operculum) arching over mouth
    bmesh.ops.create_uvsphere(bm_green, u_segments=12, v_segments=8, radius=1.0)
    for v in bm_green.verts:
        u = (v.co.y + 1.0) * 0.5
        v.co.x *= 0.14 * (0.4 + 0.8 * math.sin(u * math.pi))
        v.co.z = 1.48 + u * 0.14 + v.co.z * 0.018 - 0.04 * (v.co.x ** 2)
        v.co.y = 0.12 - u * 0.24

    # Coiled tendril curling down from base of pitcher (z = 0.92 down to 0.85 and looping up)
    tendril_pts = []
    tendril_radii = []
    for k in range(28):
        s = k / 27.0
        ang = s * math.pi * 2.6
        px = math.sin(ang) * (0.04 + 0.08 * s)
        py = 0.02 + s * 0.24
        pz = 0.93 - math.sin(s * math.pi) * 0.08 + math.cos(ang) * 0.05 * s
        tendril_pts.append((px, py, pz))
        tendril_radii.append(0.024 * (1.0 - 0.35 * s))
    add_tube_along_points(bm_green, tendril_pts, tendril_radii, segments=10)
    create_mesh_obj("Relic_PitcherPlant_LidTendril", bm_green, mats["pitcher_green"], parent=root, subsurf_levels=1)
    return root


def build_relic_jade_vine(mats):
    """
    4. Relic_JadeVine (Turquoise Jade Vine Cluster, centered at z = 0.85..1.65m):
    Arched botanical stem with 12 hanging claw-shaped luminous turquoise-jade blossoms
    (#2DD4BF, Roughness=0.2, Emission Strength=0.8) and golden stamens.
    """
    root = create_root_empty("Relic_JadeVine")

    # Arched botanical stem
    bm_stem = bmesh.new()
    stem_pts = []
    stem_r = []
    for i in range(18):
        t = i / 17.0
        x = (t - 0.5) * 0.22
        y = math.sin(t * math.pi) * 0.09
        z = 1.62 - t * 0.72
        stem_pts.append((x, y, z))
        stem_r.append(0.024 * (1.0 - 0.45 * t))
    add_tube_along_points(bm_stem, stem_pts, stem_r, segments=10)

    # 12 hanging claw-shaped luminous turquoise-jade blossoms + golden stamens
    bm_blossoms = bmesh.new()
    bm_stamens = bmesh.new()
    for b_idx in range(12):
        t = 0.10 + (b_idx / 11.0) * 0.82
        sx = (t - 0.5) * 0.22
        sy = math.sin(t * math.pi) * 0.09
        sz = 1.62 - t * 0.72

        ang_around = b_idx * 1.65  # spiral phyllotaxis around raceme
        r_offset = 0.11 + 0.04 * math.sin(t * math.pi)
        bx = sx + math.cos(ang_around) * r_offset
        by = sy + math.sin(ang_around) * r_offset
        bz = sz - 0.04

        # Pedicel connecting stem to blossom
        add_tube_along_points(bm_stem, [(sx, sy, sz), (bx, by, bz + 0.04)], [0.008, 0.010], segments=6)

        # Curved sickle/claw-shaped jade keel petal
        claw_pts = []
        claw_r = []
        dir_vec = Vector((math.cos(ang_around), math.sin(ang_around), 0.0)).normalized()
        for k in range(9):
            u = k / 8.0
            # Curve down and then hook upward like Strongylodon macrobotrys claw
            out = u * 0.11 + math.sin(u * math.pi) * 0.05
            drop = -math.sin(u * math.pi * 0.85) * 0.13 + (u ** 3) * 0.09
            p = Vector((bx, by, bz + 0.04)) + dir_vec * out + Vector((0, 0, drop))
            claw_pts.append(p)
            claw_r.append(0.038 * math.sin(max(0.08, min(0.95, u)) * math.pi))
        add_tube_along_points(bm_blossoms, claw_pts, claw_r, segments=8)

        # Golden stamen tip & calyx pearl
        tip_p = claw_pts[-1] + dir_vec * 0.015 + Vector((0, 0, 0.015))
        bmesh.ops.create_icosphere(
            bm_stamens, subdivisions=1, radius=0.018,
            matrix=Matrix.Translation(tip_p)
        )

    create_mesh_obj("Relic_JadeVine_Stem", bm_stem, mats["vine_stem"], parent=root, subsurf_levels=1)
    create_mesh_obj("Relic_JadeVine_Blossoms", bm_blossoms, mats["jade_blossom"], parent=root, subsurf_levels=1)
    create_mesh_obj("Relic_JadeVine_Stamens", bm_stamens, mats["gold_trim"], parent=root, subsurf_levels=0)
    return root


def build_relic_peranakan_lantern(mats):
    """
    5. Relic_PeranakanLantern (Heritage Peranakan Filigree Lantern, centered at z = 0.85..1.65m):
    Hexagonal brushed-gold frame (#FBBF24, Metallic=0.9), ornate scalloped pagoda roof cap,
    hanging crimson silk tassel, and glowing warm-amber/turquoise Nyonya stained-glass panels.
    """
    root = create_root_empty("Relic_PeranakanLantern")
    zc = 1.28

    bm_gold = bmesh.new()
    # Top & bottom hexagonal filigree crowns + scalloped pagoda roof cap
    bmesh.ops.create_cone(
        bm_gold, cap_ends=True, cap_tris=False, segments=6,
        radius1=0.30, radius2=0.14, depth=0.14,
        matrix=Matrix.Translation((0, 0, zc + 0.24))
    )
    bmesh.ops.create_cone(
        bm_gold, cap_ends=True, cap_tris=False, segments=6,
        radius1=0.16, radius2=0.03, depth=0.11,
        matrix=Matrix.Translation((0, 0, zc + 0.35))
    )
    # Top finial ring
    bmesh.ops.create_icosphere(
        bm_gold, subdivisions=2, radius=0.04,
        matrix=Matrix.Translation((0, 0, zc + 0.42))
    )
    # Bottom hexagonal base & tapered pendant mount
    bmesh.ops.create_cone(
        bm_gold, cap_ends=True, cap_tris=False, segments=6,
        radius1=0.12, radius2=0.25, depth=0.10,
        matrix=Matrix.Translation((0, 0, zc - 0.21))
    )
    # 6 vertical hexagonal filigree pillars & upturned roof eaves
    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        px = math.cos(ang) * 0.23
        py = math.sin(ang) * 0.23
        add_tube_along_points(
            bm_gold,
            [(px * 0.95, py * 0.95, zc - 0.17), (px * 1.06, py * 1.06, zc), (px, py, zc + 0.18)],
            [0.016, 0.018, 0.016],
            segments=8
        )
        # Upturned pagoda eave scroll
        eave_pts = [
            (px * 1.15, py * 1.15, zc + 0.18),
            (px * 1.32, py * 1.32, zc + 0.19),
            (px * 1.38, py * 1.38, zc + 0.24),
        ]
        add_tube_along_points(bm_gold, eave_pts, [0.016, 0.012, 0.008], segments=6)

    create_mesh_obj("Relic_PeranakanLantern_Frame", bm_gold, mats["lantern_gold"], parent=root, subsurf_levels=1)

    # Glowing warm-amber & turquoise Nyonya stained-glass hexagonal core
    bm_amber = bmesh.new()
    bmesh.ops.create_cone(
        bm_amber, cap_ends=True, cap_tris=False, segments=6,
        radius1=0.21, radius2=0.23, depth=0.22,
        matrix=Matrix.Translation((0, 0, zc + 0.05))
    )
    create_mesh_obj("Relic_PeranakanLantern_AmberGlass", bm_amber, mats["nyonya_amber"], parent=root, subsurf_levels=0)

    bm_turq = bmesh.new()
    bmesh.ops.create_cone(
        bm_turq, cap_ends=True, cap_tris=False, segments=6,
        radius1=0.19, radius2=0.21, depth=0.14,
        matrix=Matrix.Translation((0, 0, zc - 0.10))
    )
    create_mesh_obj("Relic_PeranakanLantern_TurquoiseGlass", bm_turq, mats["nyonya_turquoise"], parent=root, subsurf_levels=0)

    # Hanging crimson silk tassel at bottom (z = 0.85..1.05m)
    bm_tassel = bmesh.new()
    bmesh.ops.create_icosphere(
        bm_tassel, subdivisions=2, radius=0.036,
        matrix=Matrix.Translation((0, 0, zc - 0.28))
    )
    bmesh.ops.create_cone(
        bm_tassel, cap_ends=True, cap_tris=False, segments=12,
        radius1=0.055, radius2=0.022, depth=0.18,
        matrix=Matrix.Translation((0, 0, zc - 0.38))
    )
    create_mesh_obj("Relic_PeranakanLantern_Tassel", bm_tassel, mats["silk_tassel"], parent=root, subsurf_levels=1)
    return root


def build_relic_solar_seed(mats):
    """
    6. Relic_SolarSeed (Supertree Photovoltaic Seed Core, centered at z = 0.85..1.65m):
    Faceted golden-amber crystalline seed core (#F59E0B, Emission Strength=2.2)
    surrounded by 2 tilted intersecting metallic-violet solar rings (#C02678, Metallic=0.8).
    """
    root = create_root_empty("Relic_SolarSeed")
    center = Vector((0.0, 0.0, 1.25))

    # Faceted golden-amber crystalline seed core (low-subdivision bicone/octahedral gem)
    bm_core = bmesh.new()
    bmesh.ops.create_icosphere(
        bm_core, subdivisions=1, radius=1.0,
        matrix=Matrix.Translation(center) @ Matrix.Diagonal((0.19, 0.19, 0.34, 1.0))
    )
    create_mesh_obj("Relic_SolarSeed_Core", bm_core, mats["solar_core"], parent=root, subsurf_levels=0, smooth=False)

    # 2 tilted intersecting metallic-violet solar rings
    bm_rings = bmesh.new()
    for tilt_x, tilt_y, rad in [(0.62, 0.35, 0.34), (-0.62, -0.35, 0.38)]:
        rot = Euler((tilt_x, tilt_y, 0.0), 'XYZ').to_matrix().to_4x4()
        ring_seg = 32
        tube_seg = 8
        r_rings = []
        for i in range(ring_seg):
            u = (2.0 * math.pi * i) / ring_seg
            t_ring = []
            for j in range(tube_seg):
                v = (2.0 * math.pi * j) / tube_seg
                # Rectangular-beveled solar band cross-section
                r_xy = rad + math.cos(v) * 0.022
                pz = math.sin(v) * 0.036
                local_p = Vector((math.cos(u) * r_xy, math.sin(u) * r_xy, pz))
                world_p = center + (rot @ local_p)
                t_ring.append(bm_rings.verts.new(world_p))
            r_rings.append(t_ring)
        for i in range(ring_seg):
            inext = (i + 1) % ring_seg
            for j in range(tube_seg):
                jn = (j + 1) % tube_seg
                bm_rings.faces.new((r_rings[i][j], r_rings[inext][j], r_rings[inext][jn], r_rings[i][jn]))

    bmesh.ops.recalc_face_normals(bm_rings, faces=bm_rings.faces)
    create_mesh_obj("Relic_SolarSeed_Rings", bm_rings, mats["solar_ring"], parent=root, subsurf_levels=1)
    return root


def build_relic_merlion_idol(mats):
    """
    7. Relic_MerlionIdol (Sculpted Jade & Gold Heritage Merlion, centered at z = 0.85..1.65m):
    Smooth sculpted celadon-jade (#10B981, Roughness=0.18) lion head with mane &
    curled fish-tail body resting on a stylized turquoise wave crest with gold accents.
    """
    root = create_root_empty("Relic_MerlionIdol")

    # Stylized turquoise wave crest base (z = 0.86..1.05m)
    bm_wave = bmesh.new()
    bmesh.ops.create_cone(
        bm_wave, cap_ends=True, cap_tris=False, segments=20,
        radius1=0.25, radius2=0.21, depth=0.12,
        matrix=Matrix.Translation((0, 0, 0.92))
    )
    # Sweeping wave curl crests
    for side in (-1.0, 1.0):
        wave_pts = [
            (side * 0.18, -0.05, 0.92),
            (side * 0.24, 0.04, 0.99),
            (side * 0.16, 0.12, 1.06),
        ]
        add_tube_along_points(bm_wave, wave_pts, [0.055, 0.042, 0.022], segments=10)
    create_mesh_obj("Relic_MerlionIdol_WaveCrest", bm_wave, mats["wave_turquoise"], parent=root, subsurf_levels=1)

    # Smooth sculpted celadon-jade Merlion body, curled fish tail, lion head & mane
    bm_jade = bmesh.new()
    # S-curved fish torso + curled tail fluke
    spine_pts = [
        (0.0, 0.14, 1.12),   # Tail fluke tip curled up at back
        (0.0, 0.17, 1.00),   # Tail bend
        (0.0, 0.05, 0.96),   # Lower base resting on wave
        (0.0, -0.04, 1.08),  # Lower abdomen
        (0.0, -0.05, 1.24),  # Chest
        (0.0, -0.02, 1.40),  # Neck / Head center
        (0.0, -0.03, 1.54),  # Crown of head
    ]
    spine_radii = [0.035, 0.075, 0.125, 0.145, 0.155, 0.145, 0.125]
    add_tube_along_points(bm_jade, spine_pts, spine_radii, segments=14)

    # Lion snout protruding forward (-Y)
    bmesh.ops.create_uvsphere(
        bm_jade, u_segments=12, v_segments=8, radius=1.0,
        matrix=Matrix.Translation((0, -0.14, 1.44)) @ Matrix.Diagonal((0.10, 0.11, 0.08, 1.0))
    )
    # Sculpted mane locks ringing head
    for i in range(10):
        ang = -0.75 * math.pi + (1.5 * math.pi * i) / 9.0  # around sides and back of head
        mx = math.sin(ang) * 0.14
        my = -math.cos(ang) * 0.13
        for row, z_off in enumerate([1.36, 1.45, 1.53]):
            r_lock = 0.055 - row * 0.006
            bmesh.ops.create_icosphere(
                bm_jade, subdivisions=1, radius=r_lock,
                matrix=Matrix.Translation((mx, my, z_off)) @ Matrix.Diagonal((1.0, 1.2, 0.85, 1.0))
            )
    # Bifurcated tail fin flukes at back
    for sx in (-0.07, 0.07):
        bmesh.ops.create_icosphere(
            bm_jade, subdivisions=1, radius=0.06,
            matrix=Matrix.Translation((sx, 0.16, 1.16)) @ Matrix.Diagonal((1.1, 0.5, 1.5, 1.0))
        )
    create_mesh_obj("Relic_MerlionIdol_JadeBody", bm_jade, mats["celadon_jade"], parent=root, subsurf_levels=2)

    # Gold accents (collar ring, crown jewel & wave trim pearls)
    bm_gold = bmesh.new()
    bmesh.ops.create_cone(
        bm_gold, cap_ends=True, cap_tris=False, segments=16,
        radius1=0.26, radius2=0.25, depth=0.03,
        matrix=Matrix.Translation((0, 0, 0.875))
    )
    bmesh.ops.create_icosphere(
        bm_gold, subdivisions=2, radius=0.042,
        matrix=Matrix.Translation((0, -0.16, 1.32))
    )
    create_mesh_obj("Relic_MerlionIdol_GoldAccents", bm_gold, mats["gold_trim"], parent=root, subsurf_levels=1)
    return root


# ===========================================================================
# PART B: 6 MULTI-CROWN TROPICAL TREE & PALM SPECIES (Z = 0 GROUND BASE)
# ===========================================================================

def build_tree_rain_tree(mats):
    """
    1. Tree_RainTree (Broad Spreading Tropical Rain Tree, height ~4.8m, crown spread ~4.4m):
    Organic flared root buttresses & branching dark-bark trunk (#5C4033) splitting into
    4 main limbs, topped with 9 overlapping Subsurf organic foliage puffs in 3 rich tropical
    green tones (#15803D, #16A34A, #4ADE80) + pink-white Samanea flower tufts on upper canopy.
    """
    root = create_root_empty("Tree_RainTree")

    bm_trunk = bmesh.new()
    # Main trunk from z=0 to z=2.1m
    trunk_pts = [
        (0.0, 0.0, 0.0),
        (0.02, -0.02, 0.65),
        (-0.02, 0.03, 1.35),
        (0.0, 0.0, 2.05),
    ]
    add_tube_along_points(bm_trunk, trunk_pts, [0.46, 0.30, 0.25, 0.23], segments=12)

    # 5 organic flared root buttresses
    for i in range(5):
        ang = (2.0 * math.pi * i) / 5.0 + 0.2
        dx, dy = math.cos(ang), math.sin(ang)
        buttress_pts = [
            (dx * 0.72, dy * 0.72, 0.0),
            (dx * 0.45, dy * 0.45, 0.35),
            (dx * 0.22, dy * 0.22, 0.85),
        ]
        add_tube_along_points(bm_trunk, buttress_pts, [0.16, 0.14, 0.09], segments=8)

    # 4 spreading main limbs + secondary forks reaching out to support the umbrella canopy
    limb_targets = [
        (1.25, 0.85, 3.35),
        (-1.20, 0.95, 3.45),
        (-1.10, -1.15, 3.30),
        (1.15, -1.05, 3.40),
    ]
    for lx, ly, lz in limb_targets:
        pts = [
            (0.0, 0.0, 1.85),
            (lx * 0.48, ly * 0.48, 2.55),
            (lx, ly, lz),
        ]
        add_tube_along_points(bm_trunk, pts, [0.18, 0.13, 0.08], segments=8)
        # Secondary fork toward center-high and outer-edge
        add_tube_along_points(
            bm_trunk,
            [(lx * 0.48, ly * 0.48, 2.55), (lx * 0.35, ly * 0.35, 3.85)],
            [0.11, 0.06], segments=6
        )

    create_mesh_obj("Tree_RainTree_Trunk", bm_trunk, mats["bark_dark"], parent=root, subsurf_levels=1)

    # 9 overlapping Subsurf organic foliage puffs in 3 rich tropical green tones
    # Total height ~4.8m, crown spread ~4.4m (radius ~2.2m)
    puffs_deep = [
        (1.25, 0.80, 3.45, 1.05, 0.95, 0.62),
        (-1.20, 0.90, 3.50, 1.02, 0.95, 0.60),
        (-1.05, -1.10, 3.40, 1.05, 0.95, 0.62),
    ]
    puffs_mid = [
        (1.15, -1.00, 3.50, 1.00, 0.95, 0.60),
        (0.65, 0.05, 3.95, 1.10, 1.05, 0.65),
        (-0.65, -0.10, 3.95, 1.08, 1.02, 0.65),
    ]
    puffs_lush = [
        (0.0, 0.70, 4.10, 1.02, 0.95, 0.58),
        (0.0, -0.65, 4.12, 0.98, 0.92, 0.58),
        (0.0, 0.0, 4.25, 1.22, 1.18, 0.56),  # Crown top reaches 4.25 + 0.56 = 4.81m
    ]

    for mat_key, puff_list, obj_suffix in [
        ("foliage_deep", puffs_deep, "CanopyDeep"),
        ("foliage_mid", puffs_mid, "CanopyMid"),
        ("foliage_lush", puffs_lush, "CanopyLush"),
    ]:
        bm_fol = bmesh.new()
        for cx, cy, cz, rx, ry, rz in puff_list:
            bm_sub = bmesh.new()
            bmesh.ops.create_icosphere(bm_sub, subdivisions=2, radius=1.0)
            for v in bm_sub.verts:
                # Organic billowy umbrella dome deformation
                wobble = 1.0 + 0.10 * math.sin(v.co.x * 4.0) * math.cos(v.co.y * 4.0)
                v.co.x *= rx * wobble
                v.co.y *= ry * wobble
                v.co.z *= rz * (1.12 if v.co.z > 0 else 0.72)
                v.co += Vector((cx, cy, cz))
            for f in bm_sub.faces:
                bm_fol.faces.new([bm_fol.verts.new(v.co) for v in f.verts])
            bm_sub.free()
        bmesh.ops.remove_doubles(bm_fol, verts=bm_fol.verts, dist=0.001)
        create_mesh_obj(f"Tree_RainTree_{obj_suffix}", bm_fol, mats[mat_key], parent=root, subsurf_levels=1)

    # Pink-white Samanea flower tufts scattered across the upper canopy
    bm_flowers = bmesh.new()
    tuft_coords = [
        (0.0, 0.0, 4.78), (0.65, 0.45, 4.55), (-0.70, 0.40, 4.52),
        (0.55, -0.60, 4.50), (-0.60, -0.55, 4.54), (1.35, 0.75, 3.98),
        (-1.30, 0.85, 4.02), (-1.15, -1.05, 3.95), (1.20, -0.95, 3.98),
        (0.15, 1.05, 4.45), (-0.20, -1.00, 4.46),
    ]
    for fx, fy, fz in tuft_coords:
        bmesh.ops.create_icosphere(
            bm_flowers, subdivisions=1, radius=1.0,
            matrix=Matrix.Translation((fx, fy, fz)) @ Matrix.Diagonal((0.18, 0.18, 0.10, 1.0))
        )
    create_mesh_obj("Tree_RainTree_FlowerTufts", bm_flowers, mats["samanea_pink"], parent=root, subsurf_levels=1)
    return root


def build_tree_royal_palm(mats):
    """
    2. Tree_RoyalPalm (Graceful Cuban Royal Palm, height ~5.4m):
    Smooth grey-ringed tapered trunk (#94A3B8) + bright green crownshaft cylinder (#22C55E)
    + 10 gracefully arching 3D feathered palm fronds fanning in 360 degrees + cluster of golden-brown coconuts.
    """
    root = create_root_empty("Tree_RoyalPalm")

    # Smooth grey-ringed tapered trunk (z = 0..3.65m) with characteristic slight Roystonea bulge
    bm_trunk = bmesh.new()
    trunk_pts = []
    trunk_r = []
    for i in range(18):
        t = i / 17.0
        z = t * 3.65
        # Flared base, slight column swell around mid-height, slight taper + subtle ring undulation
        ring_wave = 0.008 * math.sin(t * math.pi * 16.0)
        rad = 0.28 * (1.0 - t) + 0.15 * t + 0.04 * math.sin(t * math.pi) + ring_wave
        if t < 0.12:
            rad += (0.12 - t) * 0.55
        trunk_pts.append((0.02 * math.sin(t * math.pi), 0.0, z))
        trunk_r.append(rad)
    add_tube_along_points(bm_trunk, trunk_pts, trunk_r, segments=14)
    create_mesh_obj("Tree_RoyalPalm_Trunk", bm_trunk, mats["bark_palm"], parent=root, subsurf_levels=1)

    # Bright green smooth crownshaft cylinder (z = 3.60..4.42m)
    bm_shaft = bmesh.new()
    shaft_pts = [(0.0, 0.0, 3.58), (0.0, 0.0, 4.00), (0.0, 0.0, 4.42)]
    add_tube_along_points(bm_shaft, shaft_pts, [0.165, 0.175, 0.145], segments=14)
    create_mesh_obj("Tree_RoyalPalm_Crownshaft", bm_shaft, mats["foliage_bright"], parent=root, subsurf_levels=1)

    # Cluster of golden-brown coconuts at base of crownshaft (z ~ 3.62m)
    bm_coco = bmesh.new()
    for i in range(7):
        ang = (2.0 * math.pi * i) / 7.0
        cx = math.cos(ang) * 0.19
        cy = math.sin(ang) * 0.19
        cz = 3.60 + (i % 2) * 0.07
        bmesh.ops.create_icosphere(
            bm_coco, subdivisions=2, radius=1.0,
            matrix=Matrix.Translation((cx, cy, cz)) @ Matrix.Diagonal((0.085, 0.085, 0.105, 1.0))
        )
    create_mesh_obj("Tree_RoyalPalm_Coconuts", bm_coco, mats["coconut_brown"], parent=root, subsurf_levels=0)

    # 10 gracefully arching 3D feathered palm fronds fanning in 360 degrees (reaching ~5.4m apex)
    bm_fronds = bmesh.new()
    for f_idx in range(10):
        az = (2.0 * math.pi * f_idx) / 10.0 + (f_idx % 2) * 0.12
        upper_tier = (f_idx % 2 == 0)
        launch_pitch = 0.72 if upper_tier else 0.38
        frond_len = 1.95 if upper_tier else 1.80

        dir_xy = Vector((math.cos(az), math.sin(az), 0.0))
        side_xy = Vector((-math.sin(az), math.cos(az), 0.0))

        # Build arched rachis spine & feathered pinnae leaflets
        rachis_pts = []
        rachis_r = []
        steps = 10
        for s in range(steps):
            u = s / (steps - 1)
            r_dist = 0.08 + u * frond_len
            # Parabolic arch reaching ~5.4m on upper fronds then drooping gracefully
            z_arch = 4.38 + math.sin(u * math.pi * 0.78) * (1.02 if upper_tier else 0.68) - (u ** 2.3) * 0.65
            p = dir_xy * r_dist + Vector((0, 0, z_arch))
            rachis_pts.append(p)
            rachis_r.append(0.032 * (1.0 - 0.75 * u))
        add_tube_along_points(bm_fronds, rachis_pts, rachis_r, segments=6)

        # Feathered V-shaped leaflet blade segments along the rachis
        for s in range(1, steps - 1):
            u = s / (steps - 1)
            p0 = rachis_pts[s]
            p1 = rachis_pts[s + 1]
            span = 0.42 * math.sin(u * math.pi)
            droop = 0.18 * (0.4 + u)
            for sign in (-1.0, 1.0):
                v0 = bm_fronds.verts.new(p0)
                v1 = bm_fronds.verts.new(p1)
                v2 = bm_fronds.verts.new((p0 + p1) * 0.5 + side_xy * (sign * span) + Vector((0, 0, -droop)))
                bm_fronds.faces.new((v0, v1, v2) if sign > 0 else (v1, v0, v2))

    bmesh.ops.recalc_face_normals(bm_fronds, faces=bm_fronds.faces)
    create_mesh_obj("Tree_RoyalPalm_Fronds", bm_fronds, mats["foliage_mid"], parent=root, subsurf_levels=1)
    return root


def build_tree_travellers_palm(mats):
    """
    3. Tree_TravellersPalm (Iconic Fan-Shaped Traveller's Palm, height ~4.2m):
    Woody ringed base trunk + 11 flat paddle-shaped emerald banana leaves arranged
    in a dramatic planar peacock-tail fan (#16A34A / #22C55E).
    """
    root = create_root_empty("Tree_TravellersPalm")

    # Woody ringed base trunk (z = 0..1.55m)
    bm_trunk = bmesh.new()
    trunk_pts = [(0.0, 0.0, z) for z in (0.0, 0.45, 0.95, 1.50)]
    add_tube_along_points(bm_trunk, trunk_pts, [0.24, 0.20, 0.18, 0.22], segments=12)
    create_mesh_obj("Tree_TravellersPalm_Trunk", bm_trunk, mats["bark_palm"], parent=root, subsurf_levels=1)

    # 11 flat paddle-shaped emerald banana leaves arranged in a planar peacock-tail fan (in X-Z plane)
    bm_petioles = bmesh.new()
    bm_blades_mid = bmesh.new()
    bm_blades_bright = bmesh.new()

    num_leaves = 11
    for i in range(num_leaves):
        # Angle from -72 deg to +72 deg in X-Z plane
        frac = (i / (num_leaves - 1)) * 2.0 - 1.0  # -1..+1
        ang = frac * math.radians(74.0)
        # Slight alternating Y offset for woven overlapping sheath fan base
        y_off = ((i % 2) - 0.5) * 0.045

        dir_vec = Vector((math.sin(ang), 0.0, math.cos(ang)))
        perp_vec = Vector((math.cos(ang), 0.0, -math.sin(ang)))

        base_p = Vector((frac * 0.10, y_off, 1.42 + (1.0 - abs(frac)) * 0.14))
        petiole_len = 1.15 - 0.15 * abs(frac)
        blade_start = base_p + dir_vec * petiole_len
        blade_len = 1.48 - 0.12 * abs(frac)
        blade_tip = blade_start + dir_vec * blade_len

        # Long sturdy petiole stem + midrib
        add_tube_along_points(
            bm_petioles,
            [base_p, blade_start, blade_tip],
            [0.055, 0.038, 0.014],
            segments=8
        )

        # Flat paddle-shaped banana leaf blade with slight V-fold & thickness
        target_bm = bm_blades_bright if (i % 2 == 0) else bm_blades_mid
        segs = 8
        for s in range(segs):
            u0 = s / segs
            u1 = (s + 1) / segs
            w0 = 0.28 * math.sin(math.pow(u0, 0.75) * math.pi)
            w1 = 0.28 * math.sin(math.pow(u1, 0.75) * math.pi)
            c0 = blade_start.lerp(blade_tip, u0)
            c1 = blade_start.lerp(blade_tip, u1)
            for sign in (-1.0, 1.0):
                p00 = c0
                p10 = c1
                p11 = c1 + perp_vec * (sign * w1) + Vector((0, 0.035, 0))
                p01 = c0 + perp_vec * (sign * w0) + Vector((0, 0.035, 0))
                verts = [target_bm.verts.new(p) for p in (p00, p10, p11, p01)]
                target_bm.faces.new(verts if sign > 0 else list(reversed(verts)))

    bmesh.ops.recalc_face_normals(bm_blades_mid, faces=bm_blades_mid.faces)
    bmesh.ops.recalc_face_normals(bm_blades_bright, faces=bm_blades_bright.faces)
    create_mesh_obj("Tree_TravellersPalm_Petioles", bm_petioles, mats["foliage_deep"], parent=root, subsurf_levels=1)
    create_mesh_obj("Tree_TravellersPalm_BladesMid", bm_blades_mid, mats["foliage_mid"], parent=root, subsurf_levels=1)
    create_mesh_obj("Tree_TravellersPalm_BladesBright", bm_blades_bright, mats["foliage_bright"], parent=root, subsurf_levels=1)
    return root


def build_tree_frangipani(mats):
    """
    4. Tree_Frangipani (Sculptural Plumeria Tree, height ~3.5m):
    Dichotomous crooked grey-brown branches + clusters of glossy dark-green pointed leaves
    + 14 five-petaled white-and-sunny-yellow Frangipani blossoms (#FEF08A / #FFFFFF).
    """
    root = create_root_empty("Tree_Frangipani")

    bm_bark = bmesh.new()
    # Base trunk splitting dichotomously into sculptural crooked limbs
    add_tube_along_points(
        bm_bark,
        [(0.0, 0.0, 0.0), (0.04, -0.03, 0.55), (-0.02, 0.02, 1.15)],
        [0.24, 0.19, 0.16], segments=10
    )

    branch_tips = []
    primary_forks = [
        (0.55, 0.35, 1.95),
        (-0.50, 0.42, 2.05),
        (-0.15, -0.58, 1.90),
    ]
    for fx, fy, fz in primary_forks:
        add_tube_along_points(
            bm_bark,
            [(-0.02, 0.02, 1.10), (fx * 0.55, fy * 0.55, 1.55), (fx, fy, fz)],
            [0.14, 0.11, 0.09], segments=8
        )
        # Dichotomous sub-branches from each primary fork
        base_ang = math.atan2(fy, fx)
        for sub_idx, delta_ang in enumerate([-0.65, 0.0, 0.65]):
            ang = base_ang + delta_ang
            dist = 0.62 if sub_idx != 1 else 0.42
            tx = fx + math.cos(ang) * dist
            ty = fy + math.sin(ang) * dist
            tz = fz + 0.85 + (sub_idx % 2) * 0.22
            add_tube_along_points(
                bm_bark,
                [(fx, fy, fz - 0.05), ((fx + tx) * 0.5, (fy + ty) * 0.5, (fz + tz) * 0.5 - 0.06), (tx, ty, tz)],
                [0.085, 0.065, 0.050], segments=8
            )
            branch_tips.append(Vector((tx, ty, tz)))

    create_mesh_obj("Tree_Frangipani_Trunk", bm_bark, mats["bark_plumeria"], parent=root, subsurf_levels=1)

    # Glossy dark-green pointed Plumeria leaf rosettes at branch tips
    bm_leaves = bmesh.new()
    for tip in branch_tips:
        for l_idx in range(7):
            ang = (2.0 * math.pi * l_idx) / 7.0 + tip.x
            tilt = 0.55 + (l_idx % 2) * 0.25
            rot_z = Matrix.Rotation(ang, 4, 'Z')
            rot_y = Matrix.Rotation(tilt, 4, 'Y')
            scale = Matrix.Diagonal((0.085, 0.022, 0.28, 1.0))
            offset = Matrix.Translation((0, 0, 0.24))
            bmesh.ops.create_uvsphere(
                bm_leaves, u_segments=8, v_segments=6, radius=1.0,
                matrix=Matrix.Translation(tip) @ rot_z @ rot_y @ offset @ scale
            )
    create_mesh_obj("Tree_Frangipani_Leaves", bm_leaves, mats["foliage_deep"], parent=root, subsurf_levels=1)

    # 14 five-petaled white-and-sunny-yellow Frangipani blossoms (#FEF08A / #FFFFFF)
    bm_petals = bmesh.new()
    bm_centers = bmesh.new()
    for b_idx in range(14):
        tip = branch_tips[b_idx % len(branch_tips)]
        extra_ang = (b_idx * 2.1)
        b_pos = tip + Vector((math.cos(extra_ang) * 0.14, math.sin(extra_ang) * 0.14, 0.18 + (b_idx % 3) * 0.09))
        # Sunny yellow center
        bmesh.ops.create_icosphere(
            bm_centers, subdivisions=1, radius=0.048,
            matrix=Matrix.Translation(b_pos + Vector((0, 0, 0.02)))
        )
        # 5 pinwheel white petals
        for p_idx in range(5):
            p_ang = (2.0 * math.pi * p_idx) / 5.0 + b_idx * 0.3
            rot_z = Matrix.Rotation(p_ang, 4, 'Z')
            rot_x = Matrix.Rotation(0.32, 4, 'X')
            scale = Matrix.Diagonal((0.095, 0.052, 0.020, 1.0))
            p_shift = Matrix.Translation((0.085, 0.0, 0.015))
            bmesh.ops.create_icosphere(
                bm_petals, subdivisions=1, radius=1.0,
                matrix=Matrix.Translation(b_pos) @ rot_z @ p_shift @ rot_x @ scale
            )

    create_mesh_obj("Tree_Frangipani_BlossomPetals", bm_petals, mats["frangipani_white"], parent=root, subsurf_levels=1)
    create_mesh_obj("Tree_Frangipani_BlossomCenters", bm_centers, mats["frangipani_yellow"], parent=root, subsurf_levels=1)
    return root


def build_tree_giant_fern(mats):
    """
    5. Tree_GiantFern (Cloud Forest Prehistoric Tree Fern, height ~3.2m):
    Fibrous dark-brown trunk + 8 radiating lacy fern fronds (#22C55E)
    + 3 coiled lime-green fiddlehead crosiers (#84CC16) in the center.
    """
    root = create_root_empty("Tree_GiantFern")

    # Fibrous dark-brown trunk (z = 0..2.15m)
    bm_trunk = bmesh.new()
    trunk_pts = []
    trunk_r = []
    for i in range(14):
        t = i / 13.0
        z = t * 2.15
        rad = 0.24 * (1.0 - 0.35 * t) + 0.015 * math.sin(t * math.pi * 10.0)
        trunk_pts.append((0.03 * math.sin(t * math.pi), -0.02 * math.cos(t * math.pi), z))
        trunk_r.append(rad)
    add_tube_along_points(bm_trunk, trunk_pts, trunk_r, segments=12)
    create_mesh_obj("Tree_GiantFern_Trunk", bm_trunk, mats["bark_fern"], parent=root, subsurf_levels=1)

    # 8 radiating lacy fern fronds arching up to ~3.2m
    bm_fronds = bmesh.new()
    for f_idx in range(8):
        az = (2.0 * math.pi * f_idx) / 8.0
        dir_xy = Vector((math.cos(az), math.sin(az), 0.0))
        side_xy = Vector((-math.sin(az), math.cos(az), 0.0))

        steps = 11
        rachis_pts = []
        rachis_r = []
        for s in range(steps):
            u = s / (steps - 1)
            r_out = 0.10 + u * 1.48
            z_arch = 2.12 + math.sin(u * math.pi * 0.72) * 1.08 - (u ** 2.4) * 0.48
            rachis_pts.append(dir_xy * r_out + Vector((0, 0, z_arch)))
            rachis_r.append(0.028 * (1.0 - 0.75 * u))
        add_tube_along_points(bm_fronds, rachis_pts, rachis_r, segments=6)

        # Bipinnate lacy pinnae triangles along both sides of each frond
        for s in range(1, steps - 1):
            u = s / (steps - 1)
            p0 = rachis_pts[s]
            p1 = rachis_pts[s + 1]
            pinna_len = 0.38 * math.sin(math.pow(u, 0.8) * math.pi)
            for sign in (-1.0, 1.0):
                tip = (p0 + p1) * 0.5 + side_xy * (sign * pinna_len) + Vector((0, 0, -0.05))
                v0 = bm_fronds.verts.new(p0)
                v1 = bm_fronds.verts.new(p1)
                v2 = bm_fronds.verts.new(tip)
                bm_fronds.faces.new((v0, v1, v2) if sign > 0 else (v1, v0, v2))

    bmesh.ops.recalc_face_normals(bm_fronds, faces=bm_fronds.faces)
    create_mesh_obj("Tree_GiantFern_Fronds", bm_fronds, mats["foliage_bright"], parent=root, subsurf_levels=1)

    # 3 coiled lime-green fiddlehead crosiers in the center (z = 2.12..2.88m)
    bm_crosiers = bmesh.new()
    for c_idx in range(3):
        az = (2.0 * math.pi * c_idx) / 3.0 + 0.4
        dir_xy = Vector((math.cos(az), math.sin(az), 0.0))
        c_pts = []
        c_rad = []
        for k in range(22):
            u = k / 21.0
            if u < 0.45:
                # Rising stalk
                t = u / 0.45
                r_out = 0.05 + t * 0.18
                z = 2.10 + t * 0.58
            else:
                # Tight spiral crosier coil at top
                t = (u - 0.45) / 0.55
                spiral_ang = t * math.pi * 2.8
                spiral_r = 0.11 * (1.0 - 0.68 * t)
                r_out = 0.23 + math.sin(spiral_ang) * spiral_r
                z = 2.68 + math.cos(spiral_ang) * spiral_r
            c_pts.append(dir_xy * r_out + Vector((0, 0, z)))
            c_rad.append(0.032 * (1.0 - 0.45 * u))
        add_tube_along_points(bm_crosiers, c_pts, c_rad, segments=8)

    create_mesh_obj("Tree_GiantFern_Fiddleheads", bm_crosiers, mats["foliage_lime"], parent=root, subsurf_levels=1)
    return root


def build_tree_bougainvillea(mats):
    """
    6. Tree_Bougainvillea (Vibrant Flowering Tropical Shrub Dome, height ~1.8m, width ~2.4m):
    Multi-lobed organic shrub mound covered in rich magenta-cerise (#DB2777) and
    coral-pink (#F43F5E) papery bract clusters with green leaf accents.
    """
    root = create_root_empty("Tree_Bougainvillea")

    # Woody base stems at z=0
    bm_stems = bmesh.new()
    for i in range(4):
        ang = (2.0 * math.pi * i) / 4.0
        add_tube_along_points(
            bm_stems,
            [(0.0, 0.0, 0.0), (math.cos(ang) * 0.35, math.sin(ang) * 0.35, 0.55)],
            [0.14, 0.08], segments=8
        )
    create_mesh_obj("Tree_Bougainvillea_Stems", bm_stems, mats["bark_dark"], parent=root, subsurf_levels=0)

    # Multi-lobed organic green foliage shrub mound (height ~1.8m, width ~2.4m -> radius ~1.2m)
    bm_foliage = bmesh.new()
    lobes = [
        (0.0, 0.0, 0.92, 0.88, 0.85, 0.78),
        (0.52, 0.35, 0.68, 0.65, 0.62, 0.58),
        (-0.55, 0.32, 0.66, 0.64, 0.60, 0.56),
        (-0.42, -0.52, 0.64, 0.62, 0.62, 0.55),
        (0.48, -0.45, 0.65, 0.64, 0.60, 0.56),
        (0.0, 0.0, 1.32, 0.62, 0.58, 0.46),
    ]
    for cx, cy, cz, rx, ry, rz in lobes:
        bm_sub = bmesh.new()
        bmesh.ops.create_icosphere(bm_sub, subdivisions=2, radius=1.0)
        for v in bm_sub.verts:
            wobble = 1.0 + 0.12 * math.sin(v.co.x * 5.0) * math.cos(v.co.y * 5.0)
            v.co.x = cx + v.co.x * rx * wobble
            v.co.y = cy + v.co.y * ry * wobble
            v.co.z = max(0.02, cz + v.co.z * rz)
        for f in bm_sub.faces:
            bm_foliage.faces.new([bm_foliage.verts.new(v.co) for v in f.verts])
        bm_sub.free()
    bmesh.ops.remove_doubles(bm_foliage, verts=bm_foliage.verts, dist=0.001)
    create_mesh_obj("Tree_Bougainvillea_FoliageMound", bm_foliage, mats["foliage_deep"], parent=root, subsurf_levels=1)

    # Rich magenta-cerise (#DB2777) & coral-pink (#F43F5E) papery bract clusters covering the dome
    bm_magenta = bmesh.new()
    bm_coral = bmesh.new()

    num_clusters = 36
    golden_angle = math.pi * (3.0 - math.sqrt(5.0))
    for i in range(num_clusters):
        t = (i + 0.5) / num_clusters
        inc = math.acos(1.0 - 0.82 * t)  # upper hemisphere down to lower skirt
        az = i * golden_angle
        rx = 1.02 * math.sin(inc) * math.cos(az)
        ry = 0.98 * math.sin(inc) * math.sin(az)
        rz = 0.25 + 1.48 * math.cos(inc)

        target_bm = bm_magenta if (i % 2 == 0) else bm_coral
        rot_z = Matrix.Rotation(az, 4, 'Z')
        rot_y = Matrix.Rotation(inc * 0.6, 4, 'Y')
        scale = Matrix.Diagonal((0.26, 0.22, 0.14, 1.0))
        bmesh.ops.create_icosphere(
            target_bm, subdivisions=1, radius=1.0,
            matrix=Matrix.Translation((rx, ry, rz)) @ rot_z @ rot_y @ scale
        )

    create_mesh_obj("Tree_Bougainvillea_BractsMagenta", bm_magenta, mats["bougainvillea_magenta"], parent=root, subsurf_levels=1)
    create_mesh_obj("Tree_Bougainvillea_BractsCoral", bm_coral, mats["bougainvillea_coral"], parent=root, subsurf_levels=1)
    return root


# ===========================================================================
# MAIN BUILD & GLB EXPORT
# ===========================================================================

def main():
    import os
    import sys
    script_dir = os.path.dirname(os.path.abspath(__file__))
    if script_dir not in sys.path:
        sys.path.insert(0, script_dir)
    from build_42_relics import build_42_distinct_relics

    clear_scene()
    mats = build_materials()

    roots = [
        # Part A: Ornate Treasure Pedestal & 6 Hero Botanical/Heritage Relics
        build_relic_pedestal(mats),
        build_relic_orchid(mats),
        build_relic_pitcher_plant(mats),
        build_relic_jade_vine(mats),
        build_relic_peranakan_lantern(mats),
        build_relic_solar_seed(mats),
        build_relic_merlion_idol(mats),
        # Part B: 6 Multi-Crown Tropical Tree & Palm Species
        build_tree_rain_tree(mats),
        build_tree_royal_palm(mats),
        build_tree_travellers_palm(mats),
        build_tree_frangipani(mats),
        build_tree_giant_fern(mats),
        build_tree_bougainvillea(mats),
    ]
    # Part C: All 42 Distinct Bespoke Relic Models (Relic_01 .. Relic_42)
    roots.extend(
        build_42_distinct_relics(mats, make_mat, create_root_empty, create_mesh_obj, add_tube_along_points)
    )

    # Verify all 13 root objects are at (0, 0, 0) and report vertex/triangle stats
    depsgraph = bpy.context.evaluated_depsgraph_get()
    print("=== TREASURES & FOLIAGE ASSET SUMMARY ===")
    total_verts = 0
    total_tris = 0
    for r in roots:
        r.location = (0.0, 0.0, 0.0)
        v_count = 0
        t_count = 0
        min_z = 999.0
        max_z = -999.0
        for child in r.children_recursive:
            if child.type == 'MESH':
                eval_obj = child.evaluated_get(depsgraph)
                mesh = eval_obj.to_mesh()
                mesh.calc_loop_triangles()
                v_count += len(mesh.vertices)
                t_count += len(mesh.loop_triangles)
                for v in mesh.vertices:
                    wz = (child.matrix_world @ v.co).z
                    if wz < min_z:
                        min_z = wz
                    if wz > max_z:
                        max_z = wz
                eval_obj.to_mesh_clear()
        total_verts += v_count
        total_tris += t_count
        print(f"  {r.name:26s} | verts={v_count:6d} | tris={t_count:6d} | z=[{min_z:.2f}..{max_z:.2f}m]")
    print(f"TOTAL: {len(roots)} roots | verts={total_verts} | tris={total_tris}")

    out_path = "/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/models/treasures_foliage.glb"
    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True,
    )
    print(f"Exported successfully to: {out_path}")


if __name__ == "__main__":
    main()
