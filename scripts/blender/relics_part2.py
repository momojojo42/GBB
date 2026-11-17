"""
Bespoke 3D Models for Collectible Treasures Relic_23 through Relic_42
in Gardens by the Bay — Consistent & Cute Stylized Chibi Souvenir Aesthetic.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_relics_23_to_42(m, create_root_empty, create_mesh_obj, add_tube_along_points, add_petal):
    # Ensure all material keys exist with safe fallbacks
    m = dict(m)
    m.setdefault("jade_teal", m.get("celadon_jade", m.get("nyonya_turquoise", m["velvet_emerald"])))
    m.setdefault("lantern_red", m.get("silk_tassel", m["crimson_lacquer"]))
    m.setdefault("wood_warm", m.get("coconut_brown", m.get("bark_dark", m["cacao_brown"])))
    m.setdefault("stone_light", m.get("sandstone", m["ivory_marble"]))
    m.setdefault("stone_dark", m.get("zen_stone", m.get("bark_dark", m["cacao_brown"])))

    relic_roots = []

    # -------------------------------------------------------------------------
    # Geometry & Souvenir Base Helpers
    # -------------------------------------------------------------------------
    def xform_mat(loc=(0.0, 0.0, 0.0), rot=(0.0, 0.0, 0.0), scale=(1.0, 1.0, 1.0)):
        return (
            Matrix.Translation(Vector(loc))
            @ Euler(rot, 'XYZ').to_matrix().to_4x4()
            @ Matrix.Diagonal((scale[0], scale[1], scale[2], 1.0))
        )

    def _merge_bm(dst_bm, src_bm):
        vmap = {v: dst_bm.verts.new(v.co) for v in src_bm.verts}
        for f in src_bm.faces:
            try:
                dst_bm.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        src_bm.free()

    def add_box(bm, loc, scale, rot=(0.0, 0.0, 0.0)):
        bm_tmp = bmesh.new()
        bmesh.ops.create_cube(
            bm_tmp, size=1.0,
            matrix=Matrix.Diagonal((scale[0], scale[1], scale[2], 1.0))
        )
        bev_off = min(scale[0], scale[1], scale[2]) * 0.14
        if bev_off > 1e-4:
            bmesh.ops.bevel(
                bm_tmp, geom=list(bm_tmp.edges),
                offset=bev_off, offset_type='OFFSET',
                segments=2, profile=0.5, affect='EDGES'
            )
        bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot, (1.0, 1.0, 1.0)), verts=bm_tmp.verts)
        _merge_bm(bm, bm_tmp)

    def add_cyl(bm, loc, r1, r2, depth, segs=16, rot=(0.0, 0.0, 0.0)):
        bm_tmp = bmesh.new()
        bmesh.ops.create_cone(
            bm_tmp, cap_ends=True, cap_tris=False, segments=segs,
            radius1=r1, radius2=r2, depth=depth
        )
        bm_tmp.normal_update()
        rim_edges = [
            e for e in bm_tmp.edges
            if len(e.link_faces) == 2 and abs(e.link_faces[0].normal.z - e.link_faces[1].normal.z) > 0.4
        ]
        bev_off = min(max(r1, r2, 0.002), depth * 0.5) * 0.18
        if rim_edges and bev_off > 1e-4:
            bmesh.ops.bevel(
                bm_tmp, geom=rim_edges,
                offset=bev_off, offset_type='OFFSET',
                segments=2, profile=0.5, affect='EDGES'
            )
        bmesh.ops.transform(
            bm_tmp,
            matrix=Matrix.Translation(Vector(loc)) @ Euler(rot, 'XYZ').to_matrix().to_4x4(),
            verts=bm_tmp.verts
        )
        _merge_bm(bm, bm_tmp)

    def add_sphere(bm, loc, scale, seg_u=14, seg_v=10, rot=(0.0, 0.0, 0.0)):
        if isinstance(scale, (int, float)):
            scale = (scale, scale, scale)
        bmesh.ops.create_uvsphere(
            bm, u_segments=seg_u, v_segments=seg_v, radius=1.0,
            matrix=xform_mat(loc, rot, scale)
        )

    def add_ico(bm, loc, radius=0.08, subdiv=2, scale=(1.0, 1.0, 1.0), rot=(0.0, 0.0, 0.0)):
        bmesh.ops.create_icosphere(
            bm, subdivisions=subdiv, radius=radius,
            matrix=xform_mat(loc, rot, scale)
        )

    def add_ring(bm, loc, major_r, minor_r, segs=20, tube_segs=10, rot=(0.0, 0.0, 0.0)):
        rot_m = Euler(rot, 'XYZ').to_matrix()
        center = Vector(loc)
        pts = []
        for i in range(segs + 1):
            ang = (2.0 * math.pi * i) / segs
            p_local = Vector((math.cos(ang) * major_r, math.sin(ang) * major_r, 0.0))
            pts.append(center + rot_m @ p_local)
        add_tube_along_points(bm, pts, [minor_r] * (segs + 1), segments=tube_segs, cap_ends=False)

    def add_souvenir_base(parent, prefix, radius=0.22, z=0.92, depth=0.04, inlay_mat=None):
        bm_base = bmesh.new()
        add_cyl(bm_base, (0.0, 0.0, z), radius + 0.02, radius, depth, segs=24)
        add_ring(bm_base, (0.0, 0.0, z + depth * 0.45), radius, 0.016, segs=24, tube_segs=8)
        create_mesh_obj(f"{prefix}_SouvenirBase", bm_base, m["gold_bright"], parent=parent, subsurf_levels=1)
        if inlay_mat is not None:
            bm_inlay = bmesh.new()
            add_cyl(bm_inlay, (0.0, 0.0, z + depth * 0.45), radius - 0.015, radius - 0.02, 0.022, segs=24)
            create_mesh_obj(f"{prefix}_BaseInlay", bm_inlay, inlay_mat, parent=parent, subsurf_levels=1)

    # =========================================================================
    # 23: Kampong Glam Golden Mosque Dome Lantern
    # =========================================================================
    r23 = create_root_empty("Relic_23")
    add_souvenir_base(r23, "Relic_23", radius=0.23, z=0.92, inlay_mat=m["jade_teal"])

    # Ivory marble arched pavilion base + 4 corner minarets
    bm23_pav = bmesh.new()
    add_cyl(bm23_pav, (0.0, 0.0, 1.09), 0.18, 0.17, 0.28, segs=8)
    add_cyl(bm23_pav, (0.0, 0.0, 1.24), 0.20, 0.19, 0.04, segs=8)
    for mx, my in [(-0.16, -0.16), (0.16, -0.16), (-0.16, 0.16), (0.16, 0.16)]:
        add_cyl(bm23_pav, (mx, my, 1.13), 0.034, 0.028, 0.36, segs=10)
    create_mesh_obj("Relic_23_Pavilion", bm23_pav, m["ivory_marble"], parent=r23, subsurf_levels=1)

    # Jade teal stained-glass arched windows on 4 sides
    bm23_win = bmesh.new()
    for i in range(4):
        ang = i * math.pi * 0.5
        wx, wy = math.cos(ang) * 0.168, math.sin(ang) * 0.168
        add_box(bm23_win, (wx, wy, 1.08), (0.03, 0.09, 0.14), rot=(0.0, 0.0, ang))
        add_sphere(bm23_win, (wx, wy, 1.15), (0.02, 0.045, 0.045), rot=(0.0, 0.0, ang))
    create_mesh_obj("Relic_23_Windows", bm23_win, m["jade_teal"], parent=r23, subsurf_levels=1)

    # Glass bottle dark base ring (Sultan Mosque heritage touch)
    bm23_neck = bmesh.new()
    add_cyl(bm23_neck, (0.0, 0.0, 1.27), 0.15, 0.16, 0.045, segs=16)
    create_mesh_obj("Relic_23_BottleNeck", bm23_neck, m["velvet_emerald"], parent=r23, subsurf_levels=1)

    # Gleaming gold ribbed onion dome, minaret domes & crescent-star finial
    bm23_dome = bmesh.new()
    dome_pts = [(0.0, 0.0, 1.28), (0.0, 0.0, 1.35), (0.0, 0.0, 1.43), (0.0, 0.0, 1.50), (0.0, 0.0, 1.56)]
    dome_rads = [0.15, 0.22, 0.18, 0.09, 0.015]
    add_tube_along_points(bm23_dome, dome_pts, dome_rads, segments=20)
    for i in range(12):
        ang = (2.0 * math.pi * i) / 12.0
        rib_pts = [
            Vector((math.cos(ang) * r, math.sin(ang) * r, pt[2]))
            for pt, r in zip(dome_pts, dome_rads)
        ]
        add_tube_along_points(bm23_dome, rib_pts, [0.014, 0.018, 0.016, 0.012, 0.005], segments=6)
    for mx, my in [(-0.16, -0.16), (0.16, -0.16), (-0.16, 0.16), (0.16, 0.16)]:
        add_sphere(bm23_dome, (mx, my, 1.34), (0.042, 0.042, 0.055))
        add_cyl(bm23_dome, (mx, my, 1.41), 0.008, 0.002, 0.05, segs=6)
    # Crescent moon & star finial at top
    c_pts = [
        Vector((math.cos(a) * 0.055, 0.0, 1.61 + math.sin(a) * 0.055))
        for a in [-0.75 * math.pi + (1.5 * math.pi * k) / 10.0 for k in range(11)]
    ]
    add_tube_along_points(bm23_dome, c_pts, [0.012] * 11, segments=8)
    add_ico(bm23_dome, (0.0, 0.0, 1.62), radius=0.022, subdiv=1)
    create_mesh_obj("Relic_23_GoldenDome", bm23_dome, m["gold_bright"], parent=r23, subsurf_levels=1)
    relic_roots.append(r23)

    # =========================================================================
    # 24: Chinatown Red Silk & Gold Calligraphy Lantern
    # =========================================================================
    r24 = create_root_empty("Relic_24")
    add_souvenir_base(r24, "Relic_24", radius=0.22, z=0.92)

    # Plump crimson silk lantern body + dangling silk tassel
    bm24_silk = bmesh.new()
    add_sphere(bm24_silk, (0.0, 0.0, 1.30), (0.25, 0.25, 0.21), seg_u=20, seg_v=14)
    # Bottom tassel skirt & side knots
    add_cyl(bm24_silk, (0.0, 0.0, 1.00), 0.055, 0.028, 0.12, segs=12)
    for sx in (-0.26, 0.26):
        add_ico(bm24_silk, (sx, 0.0, 1.30), radius=0.036, subdiv=1)
        add_cyl(bm24_silk, (sx, 0.0, 1.21), 0.022, 0.008, 0.12, segs=8)
    create_mesh_obj("Relic_24_RedSilk", bm24_silk, m["crimson_lacquer"], parent=r24, subsurf_levels=2)

    # Gold collars, vertical ribs, auspicious medallions & hanging ring
    bm24_gold = bmesh.new()
    add_cyl(bm24_gold, (0.0, 0.0, 1.50), 0.12, 0.13, 0.05, segs=18)
    add_cyl(bm24_gold, (0.0, 0.0, 1.09), 0.13, 0.12, 0.05, segs=18)
    add_ring(bm24_gold, (0.0, 0.0, 1.57), 0.05, 0.014, segs=16, rot=(math.pi * 0.5, 0.0, 0.0))
    # 8 meridian gold ribs
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0
        rib_pts = []
        for k in range(9):
            t = k / 8.0
            theta = (t - 0.5) * math.pi * 0.82
            rad = 0.252 * math.cos(theta)
            z_p = 1.30 + 0.21 * math.sin(theta)
            rib_pts.append(Vector((math.cos(ang) * rad, math.sin(ang) * rad, z_p)))
        add_tube_along_points(bm24_gold, rib_pts, [0.012] * 9, segments=6)
    # Front & back diamond calligraphy medallions
    for sy in (-0.245, 0.245):
        add_box(bm24_gold, (0.0, sy, 1.30), (0.13, 0.025, 0.13), rot=(0.0, math.pi * 0.25, 0.0))
    # Gold tassel strands connecting to base
    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        add_tube_along_points(
            bm24_gold,
            [(math.cos(ang) * 0.04, math.sin(ang) * 0.04, 1.06), (math.cos(ang) * 0.06, math.sin(ang) * 0.06, 0.94)],
            [0.010, 0.008], segments=6
        )
    create_mesh_obj("Relic_24_GoldTrim", bm24_gold, m["gold_bright"], parent=r24, subsurf_levels=1)

    # Calligraphy strokes on front/back medallions
    bm24_ink = bmesh.new()
    for sy in (-0.26, 0.26):
        add_box(bm24_ink, (0.0, sy, 1.33), (0.065, 0.012, 0.016))
        add_box(bm24_ink, (0.0, sy, 1.29), (0.050, 0.012, 0.045))
        add_box(bm24_ink, (0.0, sy, 1.30), (0.016, 0.014, 0.085))
    create_mesh_obj("Relic_24_Calligraphy", bm24_ink, m["cacao_brown"], parent=r24, subsurf_levels=0)
    relic_roots.append(r24)

    # =========================================================================
    # 25: Little India Brass Peacock Oil Lamp & Jasmine
    # =========================================================================
    r25 = create_root_empty("Relic_25")
    add_souvenir_base(r25, "Relic_25", radius=0.22, z=0.92)

    # Tiered Kuthuvilakku brass oil lamp shaft & 5-spouted oil bowl
    bm25_brass = bmesh.new()
    lamp_pts = [(0.0, 0.0, 0.94), (0.0, 0.0, 1.02), (0.0, 0.0, 1.12), (0.0, 0.0, 1.20), (0.0, 0.0, 1.26), (0.0, 0.0, 1.35)]
    lamp_rads = [0.16, 0.09, 0.055, 0.20, 0.07, 0.05]
    add_tube_along_points(bm25_brass, lamp_pts, lamp_rads, segments=18)
    for i in range(5):
        ang = (2.0 * math.pi * i) / 5.0 - math.pi * 0.5
        add_petal(bm25_brass, Vector((math.cos(ang) * 0.14, math.sin(ang) * 0.14, 1.21)), (1.25, ang, 0.0), length=0.11, width=0.07, cup=0.05)
    create_mesh_obj("Relic_25_BrassLamp", bm25_brass, m["gold_bright"], parent=r25, subsurf_levels=1)

    # 5 glowing diya flames in the oil bowl spouts
    bm25_flames = bmesh.new()
    for i in range(5):
        ang = (2.0 * math.pi * i) / 5.0 - math.pi * 0.5
        fx, fy = math.cos(ang) * 0.20, math.sin(ang) * 0.20
        add_tube_along_points(bm25_flames, [(fx, fy, 1.22), (fx, fy, 1.27), (fx, fy, 1.32)], [0.022, 0.028, 0.005], segments=8)
    create_mesh_obj("Relic_25_Flames", bm25_flames, m["orchid_gold"], parent=r25, subsurf_levels=1)

    # Cute Sapphire Blue Peacock crowning the lamp
    bm25_peacock = bmesh.new()
    add_sphere(bm25_peacock, (0.0, -0.02, 1.40), (0.065, 0.085, 0.06))
    add_tube_along_points(bm25_peacock, [(0.0, -0.05, 1.42), (0.0, -0.08, 1.50), (0.0, -0.06, 1.56)], [0.032, 0.024, 0.036], segments=10)
    add_cyl(bm25_peacock, (0.0, -0.11, 1.55), 0.014, 0.002, 0.04, segs=8, rot=(math.pi * 0.5, 0.0, 0.0))
    create_mesh_obj("Relic_25_PeacockBody", bm25_peacock, m["sapphire_blue"], parent=r25, subsurf_levels=2)

    # Velvet emerald peacock fan tail feathers
    bm25_tail = bmesh.new()
    for i in range(7):
        ang = (i - 3) * 0.34
        add_petal(bm25_tail, Vector((0.0, 0.03, 1.39)), (0.15, 0.0, ang), length=0.22, width=0.065, thick=0.018)
    create_mesh_obj("Relic_25_PeacockTail", bm25_tail, m["velvet_emerald"], parent=r25, subsurf_levels=1)

    # Draped Ivory Jasmine & Copper Rose Marigold flower garland
    bm25_jasmine = bmesh.new()
    bm25_marigold = bmesh.new()
    for i in range(16):
        ang = (2.0 * math.pi * i) / 16.0
        r_g = 0.17 + 0.03 * math.sin(ang * 2.0)
        z_g = 1.11 + 0.08 * math.cos(ang * 2.0)
        pos = (math.cos(ang) * r_g, math.sin(ang) * r_g, z_g)
        if i % 3 == 0:
            add_ico(bm25_marigold, pos, radius=0.030, subdiv=1)
        else:
            add_ico(bm25_jasmine, pos, radius=0.024, subdiv=1)
    create_mesh_obj("Relic_25_JasmineGarland", bm25_jasmine, m["ivory_marble"], parent=r25, subsurf_levels=1)
    create_mesh_obj("Relic_25_Marigolds", bm25_marigold, m["copper_rose"], parent=r25, subsurf_levels=1)
    relic_roots.append(r25)

    # =========================================================================
    # 26: Batik Tulis Wau Bulan Heritage Kite
    # =========================================================================
    r26 = create_root_empty("Relic_26")
    add_souvenir_base(r26, "Relic_26", radius=0.21, z=0.92)

    # Bamboo spine & arched kite frame
    bm26_bamboo = bmesh.new()
    add_tube_along_points(bm26_bamboo, [(0.0, 0.02, 0.94), (0.0, 0.02, 1.62)], [0.020, 0.014], segments=8)
    wing_arc = [Vector((-0.26 + 0.52 * (k / 10.0), 0.02, 1.38 + math.sin(k / 10.0 * math.pi) * 0.09)) for k in range(11)]
    add_tube_along_points(bm26_bamboo, wing_arc, [0.012] * 11, segments=8)
    create_mesh_obj("Relic_26_BambooFrame", bm26_bamboo, m["wood_warm"], parent=r26, subsurf_levels=1)

    # Upper Sapphire Blue Batik Wing
    bm26_wing = bmesh.new()
    for sx in (-1, 1):
        add_sphere(bm26_wing, (sx * 0.13, 0.0, 1.40), (0.16, 0.022, 0.12), rot=(0.0, sx * 0.15, 0.0))
    create_mesh_obj("Relic_26_UpperWing", bm26_wing, m["sapphire_blue"], parent=r26, subsurf_levels=2)

    # Lower Crimson Lacquer Crescent-Moon Tail (Wau Bulan)
    bm26_cres = bmesh.new()
    cres_pts = []
    cres_rads = []
    for k in range(15):
        t = (k / 14.0) * 2.0 - 1.0  # -1 .. 1
        px = t * 0.24
        pz = 1.10 + (t ** 2) * 0.14
        r = 0.065 * (1.05 - 0.65 * (t ** 2))
        cres_pts.append(Vector((px, 0.0, pz)))
        cres_rads.append(r)
    add_tube_along_points(bm26_cres, cres_pts, cres_rads, segments=12)
    # Waist connector disc
    add_sphere(bm26_cres, (0.0, 0.0, 1.25), (0.075, 0.025, 0.065))
    # Silk tassels at wingtips & crown
    for tx, tz in [(-0.27, 1.34), (0.27, 1.34), (0.0, 1.62)]:
        add_cyl(bm26_cres, (tx, 0.0, tz), 0.024, 0.008, 0.08, segs=8)
    create_mesh_obj("Relic_26_CrescentAndTassels", bm26_cres, m["crimson_lacquer"], parent=r26, subsurf_levels=2)

    # Gold Batik Tulis floral motifs & filigree trim
    bm26_gold = bmesh.new()
    for sx in (-1, 1):
        bc = Vector((sx * 0.12, -0.022, 1.40))
        add_ico(bm26_gold, bc, radius=0.024, subdiv=1)
        for p_i in range(5):
            pa = (2.0 * math.pi * p_i) / 5.0
            add_petal(bm26_gold, bc, (0.0, pa, 0.0), length=0.065, width=0.028, thick=0.012)
    # Center star on crescent
    add_ico(bm26_gold, (0.0, -0.055, 1.12), radius=0.036, subdiv=1)
    add_ico(bm26_gold, (0.0, 0.0, 1.56), radius=0.032, subdiv=1)
    create_mesh_obj("Relic_26_BatikGold", bm26_gold, m["gold_bright"], parent=r26, subsurf_levels=1)
    relic_roots.append(r26)

    # =========================================================================
    # 27: Toa Payoh Mosaic Dragon Playground Miniature
    # =========================================================================
    r27 = create_root_empty("Relic_27")
    add_souvenir_base(r27, "Relic_27", radius=0.25, z=0.92, inlay_mat=m["stone_light"])

    # Iconic orange terracotta boxy mosaic dragon head & neck pillar
    bm27_head = bmesh.new()
    # Neck support column
    add_box(bm27_head, (-0.11, -0.02, 1.14), (0.10, 0.10, 0.34))
    # Boxy upper snout, cranium & lower jaw
    add_box(bm27_head, (-0.12, -0.07, 1.42), (0.19, 0.22, 0.13))
    add_box(bm27_head, (-0.12, -0.10, 1.29), (0.17, 0.18, 0.06), rot=(0.15, 0.0, 0.0))
    # Cheek & crest plates
    for sx in (-0.21, -0.03):
        add_box(bm27_head, (sx, -0.02, 1.44), (0.03, 0.12, 0.12))
    add_box(bm27_head, (-0.12, 0.02, 1.53), (0.08, 0.12, 0.07))
    create_mesh_obj("Relic_27_DragonHead", bm27_head, m["terracotta"], parent=r27, subsurf_levels=1)

    # Ivory marble teeth, eyes & sandpit trim
    bm27_ivory = bmesh.new()
    for sx in (-0.18, -0.06):
        add_sphere(bm27_ivory, (sx, -0.14, 1.46), (0.036, 0.036, 0.036))
    for tx in (-0.16, -0.12, -0.08):
        add_box(bm27_ivory, (tx, -0.17, 1.35), (0.024, 0.024, 0.035))
    create_mesh_obj("Relic_27_EyesAndTeeth", bm27_ivory, m["ivory_marble"], parent=r27, subsurf_levels=1)

    # Curving spine of alternating Sapphire Blue & Crimson steel play rings + slide
    bm27_blue = bmesh.new()
    bm27_red = bmesh.new()
    spine_pts = [
        (-0.02, 0.05, 1.34), (0.05, 0.09, 1.31), (0.12, 0.09, 1.27),
        (0.17, 0.04, 1.22), (0.18, -0.03, 1.17), (0.14, -0.10, 1.12),
        (0.08, -0.14, 1.07), (0.02, -0.15, 1.03)
    ]
    for idx, pt in enumerate(spine_pts):
        yaw = -idx * 0.42
        target_bm = bm27_blue if idx % 2 == 0 else bm27_red
        add_ring(target_bm, pt, 0.075, 0.015, segs=16, tube_segs=8, rot=(0.0, math.pi * 0.45, yaw))
    # Blue tubular slide from head side down to sandpit
    add_tube_along_points(bm27_blue, [(-0.11, 0.06, 1.28), (-0.02, 0.16, 1.14), (0.08, 0.18, 0.96)], [0.038, 0.038, 0.040], segments=10)
    # Red spine backbone rail
    add_tube_along_points(bm27_red, spine_pts, [0.020] * len(spine_pts), segments=8)
    create_mesh_obj("Relic_27_BlueRingsAndSlide", bm27_blue, m["sapphire_blue"], parent=r27, subsurf_levels=1)
    create_mesh_obj("Relic_27_RedRingsAndSpine", bm27_red, m["crimson_lacquer"], parent=r27, subsurf_levels=1)
    relic_roots.append(r27)

    # =========================================================================
    # 28: Colorful Iced Gem Biscuits Tin (Biskut Bunga)
    # =========================================================================
    r28 = create_root_empty("Relic_28")
    add_souvenir_base(r28, "Relic_28", radius=0.23, z=0.92)

    # Vintage crimson biscuit tin body
    bm28_tin = bmesh.new()
    add_box(bm28_tin, (0.0, 0.0, 1.11), (0.31, 0.27, 0.30))
    create_mesh_obj("Relic_28_CrimsonTin", bm28_tin, m["crimson_lacquer"], parent=r28, subsurf_levels=1)

    # Gold tin rims, window bezel & tilted lid ring
    bm28_gold = bmesh.new()
    add_box(bm28_gold, (0.0, 0.0, 0.97), (0.33, 0.29, 0.035))
    add_box(bm28_gold, (0.0, 0.0, 1.26), (0.33, 0.29, 0.040))
    add_ring(bm28_gold, (0.0, -0.14, 1.11), 0.085, 0.016, segs=18, rot=(math.pi * 0.5, 0.0, 0.0))
    create_mesh_obj("Relic_28_GoldTrim", bm28_gold, m["gold_bright"], parent=r28, subsurf_levels=1)

    # Cyan crystal viewing window on front of tin
    bm28_win = bmesh.new()
    add_cyl(bm28_win, (0.0, -0.138, 1.11), 0.08, 0.08, 0.02, segs=18, rot=(math.pi * 0.5, 0.0, 0.0))
    create_mesh_obj("Relic_28_GlassWindow", bm28_win, m["cyan_crystal"], parent=r28, subsurf_levels=1)

    # 5 Oversized cute round biscuits on top of the tin
    biscuit_specs = [
        ((0.0, 0.0, 1.38), (0.0, 0.0, 0.0), "lotus_pink"),
        ((-0.11, -0.07, 1.32), (0.20, -0.22, 0.0), "chartreuse"),
        ((0.11, -0.07, 1.32), (0.20, 0.22, 0.0), "cyan_crystal"),
        ((-0.10, 0.08, 1.33), (-0.18, -0.20, 0.0), "ivory_marble"),
        ((0.10, 0.08, 1.33), (-0.18, 0.20, 0.0), "orchid_gold"),
    ]
    bm28_cookies = bmesh.new()
    for b_loc, b_rot, _ in biscuit_specs:
        add_cyl(bm28_cookies, b_loc, 0.075, 0.070, 0.042, segs=16, rot=b_rot)
    create_mesh_obj("Relic_28_BiscuitBases", bm28_cookies, m["bronze_warm"], parent=r28, subsurf_levels=1)

    # Swirled meringue icing peaks in 4+ pastel shades
    for b_loc, b_rot, mat_key in biscuit_specs:
        bm_ice = bmesh.new()
        rot_m = Euler(b_rot, 'XYZ').to_matrix()
        base_v = Vector(b_loc)
        pts = [
            base_v + rot_m @ Vector((0.0, 0.0, 0.015)),
            base_v + rot_m @ Vector((0.0, 0.0, 0.055)),
            base_v + rot_m @ Vector((0.01, -0.01, 0.105)),
            base_v + rot_m @ Vector((-0.01, 0.01, 0.145)),
        ]
        add_tube_along_points(bm_ice, pts, [0.062, 0.058, 0.032, 0.006], segments=10)
        create_mesh_obj(f"Relic_28_Icing_{mat_key}", bm_ice, m[mat_key], parent=r28, subsurf_levels=2)
    relic_roots.append(r28)

    # =========================================================================
    # 29: Classic "Good Morning" Red-Lettered Towel & Red Clogs
    # =========================================================================
    r29 = create_root_empty("Relic_29")
    add_souvenir_base(r29, "Relic_29", radius=0.24, z=0.92)

    # Wood warm towel rack & traditional clog soles (terompah)
    bm29_wood = bmesh.new()
    for sx in (-0.18, 0.18):
        add_cyl(bm29_wood, (sx, 0.08, 1.22), 0.022, 0.018, 0.56, segs=10)
    add_cyl(bm29_wood, (0.0, 0.08, 1.48), 0.020, 0.020, 0.42, segs=10, rot=(0.0, math.pi * 0.5, 0.0))
    # Pair of cute chunky wooden clog soles in front
    for cx, cy, yaw in [(-0.09, -0.07, 0.22), (0.09, -0.05, -0.28)]:
        add_box(bm29_wood, (cx, cy, 0.99), (0.11, 0.22, 0.055), rot=(0.0, 0.0, yaw))
        add_sphere(bm29_wood, (cx - math.sin(yaw) * 0.08, cy - math.cos(yaw) * 0.08, 0.99), (0.055, 0.055, 0.028), rot=(0.0, 0.0, yaw))
    create_mesh_obj("Relic_29_WoodRackAndSoles", bm29_wood, m["wood_warm"], parent=r29, subsurf_levels=1)

    # Draped Ivory Marble "Good Morning" cotton towel over rack
    bm29_towel = bmesh.new()
    add_box(bm29_towel, (0.0, 0.06, 1.32), (0.30, 0.065, 0.34))
    add_cyl(bm29_towel, (0.0, 0.06, 1.49), 0.036, 0.036, 0.30, segs=12, rot=(0.0, math.pi * 0.5, 0.0))
    create_mesh_obj("Relic_29_CottonTowel", bm29_towel, m["ivory_marble"], parent=r29, subsurf_levels=1)

    # Crimson lacquer towel stripes, "Good Morning" emblem blocks & glossy clog toe straps
    bm29_red = bmesh.new()
    # Towel border stripes & center lettering motif
    add_box(bm29_red, (0.0, 0.025, 1.18), (0.29, 0.015, 0.022))
    add_box(bm29_red, (0.0, 0.025, 1.22), (0.29, 0.015, 0.014))
    for lx in (-0.09, -0.03, 0.03, 0.09):
        add_box(bm29_red, (lx, 0.024, 1.34), (0.038, 0.016, 0.048))
    add_ring(bm29_red, (0.0, 0.024, 1.34), 0.12, 0.009, segs=18, rot=(math.pi * 0.5, 0.0, 0.0))
    # Glossy crimson clog straps arching over the wooden soles
    for cx, cy, yaw in [(-0.09, -0.07, 0.22), (0.09, -0.05, -0.28)]:
        rot_m = Euler((0.0, 0.0, yaw), 'XYZ').to_matrix()
        strap_pts = [
            Vector((cx, cy, 1.00)) + rot_m @ Vector((-0.055, -0.02, 0.0)),
            Vector((cx, cy, 1.00)) + rot_m @ Vector((0.0, -0.02, 0.065)),
            Vector((cx, cy, 1.00)) + rot_m @ Vector((0.055, -0.02, 0.0)),
        ]
        add_tube_along_points(bm29_red, strap_pts, [0.034, 0.038, 0.034], segments=10)
    create_mesh_obj("Relic_29_RedStrapsAndPrint", bm29_red, m["crimson_lacquer"], parent=r29, subsurf_levels=1)
    relic_roots.append(r29)

    # =========================================================================
    # 30: Uncle’s Rainbow Bread Ice Cream Cart
    # =========================================================================
    r30 = create_root_empty("Relic_30")
    add_souvenir_base(r30, "Relic_30", radius=0.24, z=0.92)

    # Sapphire blue hawker ice-cream freezer cart body
    bm30_cart = bmesh.new()
    add_box(bm30_cart, (0.0, 0.0, 1.15), (0.34, 0.22, 0.24))
    create_mesh_obj("Relic_30_BlueCart", bm30_cart, m["sapphire_blue"], parent=r30, subsurf_levels=1)

    # Silver counter top, freezer lids, umbrella pole & push handle
    bm30_silver = bmesh.new()
    add_box(bm30_silver, (0.0, 0.0, 1.28), (0.36, 0.24, 0.035))
    add_tube_along_points(bm30_silver, [(0.18, -0.08, 1.24), (0.24, -0.08, 1.28), (0.24, 0.08, 1.28), (0.18, 0.08, 1.24)], [0.014] * 4, segments=8)
    add_cyl(bm30_silver, (-0.12, 0.06, 1.44), 0.014, 0.012, 0.34, segs=10)
    create_mesh_obj("Relic_30_SilverHardware", bm30_silver, m["silver_plat"], parent=r30, subsurf_levels=1)

    # Spoked gold wheels & brass bell
    bm30_gold = bmesh.new()
    for sy in (-0.13, 0.13):
        add_ring(bm30_gold, (-0.04, sy, 1.03), 0.085, 0.018, segs=16, rot=(math.pi * 0.5, 0.0, 0.0))
        add_cyl(bm30_gold, (-0.04, sy, 1.03), 0.03, 0.03, 0.03, segs=12, rot=(math.pi * 0.5, 0.0, 0.0))
    add_sphere(bm30_gold, (0.24, -0.06, 1.31), (0.028, 0.028, 0.028))
    create_mesh_obj("Relic_30_WheelsAndBell", bm30_gold, m["gold_bright"], parent=r30, subsurf_levels=1)

    # Oversized Pastel Rainbow Bread Slice wrapping a chunky Ice Cream Block on top!
    bm30_pink = bmesh.new()
    bm30_green = bmesh.new()
    bm30_cream = bmesh.new()
    # U-shaped bread slice curving around ice cream block at (0.03, -0.01, 1.38)
    bread_pts = [(-0.07, -0.01, 1.44), (-0.06, -0.01, 1.33), (0.03, -0.01, 1.31), (0.12, -0.01, 1.33), (0.13, -0.01, 1.44)]
    add_tube_along_points(bm30_pink, bread_pts, [0.048] * 5, segments=10)
    # Chunky ice cream block inside the bread fold
    add_box(bm30_green, (0.03, -0.01, 1.41), (0.13, 0.12, 0.11), rot=(0.0, 0.0, 0.08))
    add_box(bm30_cream, (0.03, -0.01, 1.45), (0.12, 0.11, 0.05), rot=(0.0, 0.0, 0.08))
    # Colorful umbrella canopy at (-0.12, 0.06, 1.60)
    add_cyl(bm30_pink, (-0.12, 0.06, 1.59), 0.19, 0.02, 0.09, segs=10, rot=(0.12, -0.15, 0.0))
    create_mesh_obj("Relic_30_PinkBreadAndUmbrella", bm30_pink, m["lotus_pink"], parent=r30, subsurf_levels=1)
    create_mesh_obj("Relic_30_MintIceCream", bm30_green, m["chartreuse"], parent=r30, subsurf_levels=1)
    create_mesh_obj("Relic_30_VanillaSwirl", bm30_cream, m["ivory_marble"], parent=r30, subsurf_levels=1)
    relic_roots.append(r30)

    # =========================================================================
    # 31: Heritage Trishaw with Brass Horn
    # =========================================================================
    r31 = create_root_empty("Relic_31")
    add_souvenir_base(r31, "Relic_31", radius=0.25, z=0.92)

    # Crimson lacquer convertible passenger hood & cushioned seat back
    bm31_hood = bmesh.new()
    hood_pts = [(-0.06, 0.12, 1.20), (-0.06, 0.14, 1.38), (-0.06, 0.02, 1.50), (-0.06, -0.10, 1.44)]
    add_tube_along_points(bm31_hood, hood_pts, [0.15, 0.16, 0.15, 0.13], segments=12)
    add_box(bm31_hood, (-0.06, 0.02, 1.13), (0.22, 0.18, 0.07))
    # Squeeze-bulb rubber part of brass horn
    add_sphere(bm31_hood, (0.18, -0.12, 1.34), (0.032, 0.032, 0.032))
    create_mesh_obj("Relic_31_CrimsonHood", bm31_hood, m["crimson_lacquer"], parent=r31, subsurf_levels=2)

    # Ivory seat cushion
    bm31_seat = bmesh.new()
    add_box(bm31_seat, (-0.06, -0.01, 1.18), (0.18, 0.15, 0.05))
    add_box(bm31_seat, (-0.06, 0.07, 1.26), (0.18, 0.05, 0.14), rot=(-0.2, 0.0, 0.0))
    create_mesh_obj("Relic_31_SeatCushion", bm31_seat, m["ivory_marble"], parent=r31, subsurf_levels=1)

    # Velvet emerald cycle frame & sidecar fenders
    bm31_frame = bmesh.new()
    add_tube_along_points(bm31_frame, [(0.14, 0.08, 1.06), (0.14, -0.04, 1.24), (0.14, -0.14, 1.06)], [0.018, 0.020, 0.018], segments=8)
    add_tube_along_points(bm31_frame, [(0.14, -0.14, 1.06), (0.14, -0.12, 1.32)], [0.018, 0.018], segments=8)
    add_tube_along_points(bm31_frame, [(-0.18, 0.02, 1.06), (0.14, 0.02, 1.06)], [0.020, 0.020], segments=8)
    create_mesh_obj("Relic_31_CycleFrame", bm31_frame, m["velvet_emerald"], parent=r31, subsurf_levels=1)

    # 3 Gold spoked wheels, handlebars & oversized Brass Horn trumpet
    bm31_gold = bmesh.new()
    wheel_locs = [(-0.19, 0.02, 1.06, 0.11), (0.14, 0.12, 1.06, 0.10), (0.14, -0.15, 1.05, 0.095)]
    for wx, wy, wz, wr in wheel_locs:
        add_ring(bm31_gold, (wx, wy, wz), wr, 0.018, segs=16, rot=(0.0, math.pi * 0.5, 0.0))
        add_cyl(bm31_gold, (wx, wy, wz), 0.028, 0.028, 0.03, segs=10, rot=(0.0, math.pi * 0.5, 0.0))
    # Handlebars
    add_tube_along_points(bm31_gold, [(0.06, -0.10, 1.32), (0.14, -0.13, 1.33), (0.22, -0.10, 1.32)], [0.014, 0.016, 0.014], segments=8)
    # Brass bulb horn trumpet
    add_cyl(bm31_gold, (0.18, -0.18, 1.34), 0.012, 0.038, 0.10, segs=12, rot=(math.pi * 0.5, 0.0, 0.0))
    create_mesh_obj("Relic_31_GoldWheelsAndHorn", bm31_gold, m["gold_bright"], parent=r31, subsurf_levels=1)
    relic_roots.append(r31)

    # =========================================================================
    # 32: First-Gen "Merlion & Ship" Coin Bank Set
    # =========================================================================
    r32 = create_root_empty("Relic_32")
    add_souvenir_base(r32, "Relic_32", radius=0.24, z=0.92)

    # Crimson lacquer velvet presentation stand
    bm32_stand = bmesh.new()
    add_box(bm32_stand, (0.0, 0.02, 1.02), (0.42, 0.20, 0.12))
    add_box(bm32_stand, (0.0, -0.06, 0.99), (0.36, 0.10, 0.06))
    create_mesh_obj("Relic_32_VelvetStand", bm32_stand, m["crimson_lacquer"], parent=r32, subsurf_levels=1)

    # Left Silver 50-Cent Ship Coin
    bm32_silver = bmesh.new()
    c_left = (-0.15, 0.03, 1.24)
    r_left = (math.pi * 0.46, 0.0, 0.28)
    add_cyl(bm32_silver, c_left, 0.135, 0.135, 0.038, segs=24, rot=r_left)
    add_ring(bm32_silver, c_left, 0.125, 0.012, segs=24, rot=r_left)
    # Embossed ship hull & sails on front
    add_box(bm32_silver, (-0.14, 0.005, 1.21), (0.11, 0.02, 0.03), rot=(0.0, 0.0, 0.28))
    add_box(bm32_silver, (-0.14, 0.005, 1.26), (0.08, 0.02, 0.06), rot=(0.0, 0.0, 0.28))
    create_mesh_obj("Relic_32_SilverCoin", bm32_silver, m["silver_plat"], parent=r32, subsurf_levels=1)

    # Right Copper-Rose 20-Cent Botanical Coin
    bm32_copper = bmesh.new()
    c_right = (0.15, 0.03, 1.24)
    r_right = (math.pi * 0.46, 0.0, -0.28)
    add_cyl(bm32_copper, c_right, 0.135, 0.135, 0.038, segs=24, rot=r_right)
    add_ring(bm32_copper, c_right, 0.125, 0.012, segs=24, rot=r_right)
    add_ico(bm32_copper, (0.14, 0.005, 1.24), radius=0.045, subdiv=1)
    create_mesh_obj("Relic_32_CopperCoin", bm32_copper, m["copper_rose"], parent=r32, subsurf_levels=1)

    # Center Oversized Gold $1 Merlion Coin Bank
    bm32_gold = bmesh.new()
    c_mid = (0.0, -0.02, 1.34)
    r_mid = (math.pi * 0.48, 0.0, 0.0)
    add_cyl(bm32_gold, c_mid, 0.185, 0.185, 0.048, segs=28, rot=r_mid)
    add_ring(bm32_gold, c_mid, 0.172, 0.015, segs=8, rot=r_mid)  # Iconic octagonal bezel!
    # Embossed Merlion silhouette in center of gold coin
    add_tube_along_points(
        bm32_gold,
        [(0.02, -0.05, 1.25), (-0.01, -0.05, 1.32), (0.0, -0.05, 1.40)],
        [0.022, 0.042, 0.035], segments=10
    )
    create_mesh_obj("Relic_32_GoldMerlionCoin", bm32_gold, m["gold_bright"], parent=r32, subsurf_levels=1)

    # Dark coin-bank slot at top of center coin
    bm32_slot = bmesh.new()
    add_box(bm32_slot, (0.0, -0.02, 1.525), (0.09, 0.018, 0.012))
    create_mesh_obj("Relic_32_CoinSlot", bm32_slot, m["stone_dark"], parent=r32, subsurf_levels=0)
    relic_roots.append(r32)

    # =========================================================================
    # 33: Five Stones (Batu Seremban) & Congkak Board
    # =========================================================================
    r33 = create_root_empty("Relic_33")
    add_souvenir_base(r33, "Relic_33", radius=0.25, z=0.92)

    # Boat-shaped carved wooden Congkak board
    bm33_board = bmesh.new()
    congkak_pts = [
        (-0.28, 0.0, 1.12), (-0.20, 0.0, 1.05), (0.0, 0.0, 1.04),
        (0.20, 0.0, 1.05), (0.28, 0.0, 1.12)
    ]
    add_tube_along_points(bm33_board, congkak_pts, [0.035, 0.11, 0.125, 0.11, 0.035], segments=14)
    create_mesh_obj("Relic_33_CongkakBoard", bm33_board, m["wood_warm"], parent=r33, subsurf_levels=1)

    # Cyan crystal marbles filling the 2 rows of Congkak pockets & end storehouses
    bm33_marbles = bmesh.new()
    for sx in (-0.21, 0.21):
        add_sphere(bm33_marbles, (sx, 0.0, 1.12), (0.042, 0.042, 0.025))
    for kx in (-0.12, -0.06, 0.0, 0.06, 0.12):
        for sy in (-0.042, 0.042):
            add_sphere(bm33_marbles, (kx, sy, 1.13), (0.024, 0.024, 0.020))
    create_mesh_obj("Relic_33_GlassMarbles", bm33_marbles, m["cyan_crystal"], parent=r33, subsurf_levels=1)

    # Pyramid of 5 colorful cloth Five-Stones (Batu Seremban) pyramid bags on top!
    stones_data = [
        ((-0.09, -0.05, 1.24), (0.1, 0.2, 0.3), "lotus_pink"),
        ((0.09, -0.05, 1.24), (-0.1, -0.2, -0.4), "chartreuse"),
        ((-0.08, 0.06, 1.24), (0.2, -0.1, 0.5), "crimson_lacquer"),
        ((0.08, 0.06, 1.24), (-0.2, 0.1, -0.2), "amethyst_purple"),
        ((0.0, 0.0, 1.40), (0.08, 0.12, 0.4), "gold_bright"),
    ]
    for idx, (s_loc, s_rot, mat_key) in enumerate(stones_data):
        bm_st = bmesh.new()
        add_cyl(bm_st, s_loc, 0.095, 0.008, 0.13, segs=4, rot=s_rot)
        create_mesh_obj(f"Relic_33_StoneBag_{idx}", bm_st, m[mat_key], parent=r33, subsurf_levels=1)
    relic_roots.append(r33)

    # =========================================================================
    # 34: Classic ERP Gantry & Orchard Rd Street Sign
    # =========================================================================
    r34 = create_root_empty("Relic_34")
    add_souvenir_base(r34, "Relic_34", radius=0.25, z=0.92, inlay_mat=m["stone_dark"])

    # Silver twin ERP gantry columns & crossbars
    bm34_silver = bmesh.new()
    for sx in (-0.21, 0.21):
        add_cyl(bm34_silver, (sx, 0.02, 1.22), 0.030, 0.026, 0.56, segs=12)
    add_cyl(bm34_silver, (0.0, 0.02, 1.44), 0.020, 0.020, 0.44, segs=10, rot=(0.0, math.pi * 0.5, 0.0))
    create_mesh_obj("Relic_34_GantryColumns", bm34_silver, m["silver_plat"], parent=r34, subsurf_levels=1)

    # Curved Sapphire Blue overhead ERP arch sign
    bm34_blue = bmesh.new()
    erp_arc = [
        Vector((-0.23 + 0.46 * (k / 10.0), 0.02, 1.46 + math.sin(k / 10.0 * math.pi) * 0.08))
        for k in range(11)
    ]
    add_tube_along_points(bm34_blue, erp_arc, [0.048] * 11, segments=10)
    create_mesh_obj("Relic_34_BlueArch", bm34_blue, m["sapphire_blue"], parent=r34, subsurf_levels=1)

    # Gold IU sensor boxes, ERP badge & street sign frame
    bm34_gold = bmesh.new()
    add_box(bm34_gold, (0.0, -0.025, 1.53), (0.16, 0.03, 0.075))
    for kx in (-0.13, -0.04, 0.04, 0.13):
        add_box(bm34_gold, (kx, -0.03, 1.39), (0.045, 0.075, 0.038), rot=(0.35, 0.0, 0.0))
    # Frame around Orchard Rd sign
    add_box(bm34_gold, (0.0, -0.10, 1.15), (0.30, 0.03, 0.11))
    create_mesh_obj("Relic_34_SensorsAndBadge", bm34_gold, m["gold_bright"], parent=r34, subsurf_levels=1)

    # Classic Velvet Emerald & Ivory Marble "ORCHARD RD" heritage street sign plate
    bm34_sign = bmesh.new()
    add_box(bm34_sign, (0.0, -0.11, 1.15), (0.27, 0.025, 0.085))
    create_mesh_obj("Relic_34_OrchardSignGreen", bm34_sign, m["velvet_emerald"], parent=r34, subsurf_levels=0)

    bm34_text = bmesh.new()
    for tx in (-0.09, -0.045, 0.0, 0.045, 0.09):
        add_box(bm34_text, (tx, -0.122, 1.15), (0.028, 0.012, 0.038))
    # Road lane dashes on base
    for dy in (-0.12, 0.0, 0.12):
        add_box(bm34_text, (0.0, dy, 0.955), (0.025, 0.06, 0.012))
    create_mesh_obj("Relic_34_SignLettersAndLanes", bm34_text, m["ivory_marble"], parent=r34, subsurf_levels=0)
    relic_roots.append(r34)

    # =========================================================================
    # 35: Marina Bay Smooth-Coated Otter Family
    # =========================================================================
    r35 = create_root_empty("Relic_35")
    add_souvenir_base(r35, "Relic_35", radius=0.25, z=0.92, inlay_mat=m["cyan_crystal"])

    # Rippling cyan water splash rings on base
    bm35_water = bmesh.new()
    add_ring(bm35_water, (0.0, 0.0, 0.96), 0.19, 0.020, segs=20)
    for wx, wy in [(-0.18, -0.10), (0.18, -0.10), (0.0, -0.18)]:
        add_ico(bm35_water, (wx, wy, 0.99), radius=0.028, subdiv=1)
    create_mesh_obj("Relic_35_WaterSplash", bm35_water, m["cyan_crystal"], parent=r35, subsurf_levels=1)

    # 3 Upright Chibi Smooth-Coated Otters (Parent in center + 2 pups on sides)
    bm35_fur = bmesh.new()
    bm35_belly = bmesh.new()
    bm35_noses = bmesh.new()
    otters = [
        (0.0, 0.02, 0.96, 1.0, 0.0),         # Parent otter
        (-0.14, -0.02, 0.96, 0.76, 0.25),    # Left pup
        (0.14, -0.02, 0.96, 0.76, -0.25),    # Right pup
    ]
    for ox, oy, oz, sc, yaw in otters:
        # Chubby standing torso & tapered tail
        torso_pts = [
            Vector((ox, oy + 0.12 * sc, oz + 0.03 * sc)),
            Vector((ox, oy + 0.02 * sc, oz + 0.08 * sc)),
            Vector((ox, oy, oz + 0.24 * sc)),
            Vector((ox, oy, oz + 0.43 * sc)),
        ]
        add_tube_along_points(bm35_fur, torso_pts, [0.025 * sc, 0.085 * sc, 0.095 * sc, 0.072 * sc], segments=12)
        # Chibi round head & cute ears
        hz = oz + 0.44 * sc
        add_sphere(bm35_fur, (ox, oy - 0.01 * sc, hz), (0.085 * sc, 0.080 * sc, 0.078 * sc))
        for ex in (-0.068 * sc, 0.068 * sc):
            add_sphere(bm35_fur, (ox + ex, oy, hz + 0.045 * sc), (0.024 * sc, 0.020 * sc, 0.024 * sc))
        # Front paws reaching toward the golden fish
        for px in (-0.055 * sc, 0.055 * sc):
            add_sphere(bm35_fur, (ox + px, oy - 0.075 * sc, oz + 0.28 * sc), (0.028 * sc, 0.042 * sc, 0.026 * sc))
        # Ivory marble cheeks/muzzle & belly patch
        add_sphere(bm35_belly, (ox, oy - 0.052 * sc, oz + 0.23 * sc), (0.062 * sc, 0.050 * sc, 0.12 * sc))
        add_sphere(bm35_belly, (ox, oy - 0.065 * sc, hz - 0.015 * sc), (0.055 * sc, 0.040 * sc, 0.038 * sc))
        # Cute dark nose & eyes
        add_sphere(bm35_noses, (ox, oy - 0.095 * sc, hz), (0.020 * sc, 0.016 * sc, 0.016 * sc))
        for ex in (-0.035 * sc, 0.035 * sc):
            add_sphere(bm35_noses, (ox + ex, oy - 0.078 * sc, hz + 0.022 * sc), (0.014 * sc, 0.014 * sc, 0.014 * sc))

    create_mesh_obj("Relic_35_OtterFur", bm35_fur, m["cacao_brown"], parent=r35, subsurf_levels=2)
    create_mesh_obj("Relic_35_OtterBellies", bm35_belly, m["ivory_marble"], parent=r35, subsurf_levels=1)
    create_mesh_obj("Relic_35_OtterNoses", bm35_noses, m["stone_dark"], parent=r35, subsurf_levels=1)

    # Gleaming Gold Fish held proudly by the otter family
    bm35_fish = bmesh.new()
    fish_pts = [(-0.09, -0.11, 1.24), (0.0, -0.12, 1.25), (0.07, -0.11, 1.24), (0.12, -0.11, 1.26)]
    add_tube_along_points(bm35_fish, fish_pts, [0.015, 0.045, 0.020, 0.042], segments=10)
    create_mesh_obj("Relic_35_GoldenFish", bm35_fish, m["gold_bright"], parent=r35, subsurf_levels=1)
    relic_roots.append(r35)

    # =========================================================================
    # 36: Golden Mao Shan Wang Durian Crown
    # =========================================================================
    r36 = create_root_empty("Relic_36")
    add_souvenir_base(r36, "Relic_36", radius=0.23, z=0.92)

    # Royal golden crown stand & 4 plump creamy Mao Shan Wang golden flesh pods
    bm36_gold = bmesh.new()
    add_cyl(bm36_gold, (0.0, 0.0, 1.01), 0.16, 0.19, 0.12, segs=12)
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0
        add_ico(bm36_gold, (math.cos(ang) * 0.18, math.sin(ang) * 0.18, 1.08), radius=0.025, subdiv=1)
    # 4 Plump creamy golden durian pods nestled inside the split shell
    pod_coords = [
        (-0.065, -0.05, 1.24), (-0.065, -0.05, 1.38),
        (0.065, -0.05, 1.24), (0.065, -0.05, 1.38)
    ]
    for px, py, pz in pod_coords:
        add_sphere(bm36_gold, (px, py, pz), (0.058, 0.068, 0.075), rot=(0.0, 0.0, 0.15 if px < 0 else -0.15))
    # Mini royal crown finial on top of the durian stem
    add_cyl(bm36_gold, (0.0, 0.02, 1.60), 0.045, 0.065, 0.06, segs=8)
    create_mesh_obj("Relic_36_CrownAndPods", bm36_gold, m["gold_bright"], parent=r36, subsurf_levels=2)

    # Spiky green durian husk split open into two dramatic halves
    bm36_husk = bmesh.new()
    for sx in (-1, 1):
        hc = Vector((sx * 0.09, 0.02, 1.32))
        add_sphere(bm36_husk, hc, (0.14, 0.17, 0.22), rot=(0.0, sx * 0.22, 0.0))
        # Pyramid thorns covering outer shell half
        for k in range(14):
            u_ang = (sx * (0.2 + 0.85 * (k % 4) / 3.0)) * math.pi * 0.5
            z_off = -0.15 + (k // 4) * 0.10
            tx = hc.x + sx * math.cos(u_ang) * 0.13
            ty = hc.y + math.sin(u_ang) * 0.15
            tz = hc.z + z_off
            add_cyl(bm36_husk, (tx, ty, tz), 0.036, 0.003, 0.075, segs=4, rot=(0.0, sx * 1.15, u_ang))
    # Durian stem at top
    add_cyl(bm36_husk, (0.0, 0.02, 1.54), 0.028, 0.022, 0.09, segs=8)
    create_mesh_obj("Relic_36_SpikyDurianHusk", bm36_husk, m["durian_husk"], parent=r36, subsurf_levels=0)
    relic_roots.append(r36)

    # =========================================================================
    # 37: Esplanade Twin Durian Domes Music Box
    # =========================================================================
    r37 = create_root_empty("Relic_37")
    add_souvenir_base(r37, "Relic_37", radius=0.26, z=0.92, inlay_mat=m["cyan_crystal"])

    # Ivory waterfront deck & Silver twin glass domes
    bm37_domes = bmesh.new()
    add_box(bm37_domes, (0.0, 0.0, 0.99), (0.44, 0.28, 0.05))
    for dx, rx, ry, rz in [(-0.12, 0.13, 0.16, 0.18), (0.12, 0.13, 0.16, 0.18)]:
        add_sphere(bm37_domes, (dx, 0.0, 1.16), (rx, ry, rz), seg_u=16, seg_v=12)
    create_mesh_obj("Relic_37_SilverGlassDomes", bm37_domes, m["silver_plat"], parent=r37, subsurf_levels=1)

    # Spiky triangulated golden sunshade louvers on both domes + wind-up music box key & notes
    bm37_gold = bmesh.new()
    for dx in (-0.12, 0.12):
        for ring_k, (z_off, r_ring, cnt) in enumerate([(0.04, 0.135, 8), (0.11, 0.105, 7), (0.16, 0.06, 5)]):
            for i in range(cnt):
                ang = (2.0 * math.pi * i) / cnt + ring_k * 0.35
                px = dx + math.cos(ang) * r_ring * 0.9
                py = math.sin(ang) * r_ring * 1.1
                pz = 1.16 + z_off
                add_cyl(bm37_gold, (px, py, pz), 0.028, 0.003, 0.055, segs=3, rot=(0.45 * math.sin(ang), -0.45 * math.cos(ang), ang))
    # Music box wind-up key at front of base & floating musical note above domes
    add_cyl(bm37_gold, (0.0, -0.22, 0.99), 0.014, 0.014, 0.08, segs=8, rot=(math.pi * 0.5, 0.0, 0.0))
    add_ring(bm37_gold, (0.0, -0.26, 0.99), 0.032, 0.010, segs=12)
    # Floating musical eighth-note above center
    add_sphere(bm37_gold, (-0.04, 0.0, 1.44), (0.032, 0.024, 0.026))
    add_sphere(bm37_gold, (0.05, 0.0, 1.46), (0.032, 0.024, 0.026))
    add_tube_along_points(bm37_gold, [(-0.02, 0.0, 1.45), (-0.02, 0.0, 1.58), (0.07, 0.0, 1.60), (0.07, 0.0, 1.47)], [0.012] * 4, segments=6)
    create_mesh_obj("Relic_37_SunshadesAndMusicKey", bm37_gold, m["gold_bright"], parent=r37, subsurf_levels=0)
    relic_roots.append(r37)

    # =========================================================================
    # 38: Singapore River Painted Bumboat (Tongkang)
    # =========================================================================
    r38 = create_root_empty("Relic_38")
    add_souvenir_base(r38, "Relic_38", radius=0.25, z=0.92, inlay_mat=m["cyan_crystal"])

    # Cyan river wave curls under the boat
    bm38_waves = bmesh.new()
    for wy in (-0.11, 0.11):
        wave_pts = [(-0.22, wy, 0.98), (0.0, wy * 1.15, 1.01), (0.22, wy, 0.98)]
        add_tube_along_points(bm38_waves, wave_pts, [0.022, 0.034, 0.022], segments=8)
    create_mesh_obj("Relic_38_RiverWaves", bm38_waves, m["cyan_crystal"], parent=r38, subsurf_levels=1)

    # Wooden bumboat hull with upturned bow and stern
    bm38_hull = bmesh.new()
    hull_pts = [(-0.27, 0.0, 1.20), (-0.18, 0.0, 1.09), (0.0, 0.0, 1.07), (0.18, 0.0, 1.09), (0.26, 0.0, 1.18)]
    add_tube_along_points(bm38_hull, hull_pts, [0.028, 0.105, 0.125, 0.105, 0.032], segments=14)
    # 4 canopy posts
    for px in (-0.11, 0.11):
        for py in (-0.075, 0.075):
            add_cyl(bm38_hull, (px, py, 1.24), 0.012, 0.012, 0.22, segs=8)
    create_mesh_obj("Relic_38_WoodHull", bm38_hull, m["wood_warm"], parent=r38, subsurf_levels=1)

    # Velvet emerald painted bow band
    bm38_green = bmesh.new()
    add_tube_along_points(bm38_green, [(-0.25, 0.0, 1.19), (-0.15, 0.0, 1.12)], [0.042, 0.112], segments=12)
    create_mesh_obj("Relic_38_GreenBow", bm38_green, m["velvet_emerald"], parent=r38, subsurf_levels=1)

    # Ribbed Crimson Lacquer canopy roof
    bm38_roof = bmesh.new()
    roof_pts = [(-0.15, 0.0, 1.38), (0.0, 0.0, 1.41), (0.15, 0.0, 1.38)]
    add_tube_along_points(bm38_roof, roof_pts, [0.105, 0.118, 0.105], segments=12)
    create_mesh_obj("Relic_38_CanopyRoof", bm38_roof, m["crimson_lacquer"], parent=r38, subsurf_levels=1)

    # Iconic painted bow eyes (Ivory sclera + Dark pupil)
    bm38_eye_w = bmesh.new()
    bm38_eye_b = bmesh.new()
    for sy in (-1, 1):
        add_sphere(bm38_eye_w, (-0.19, sy * 0.075, 1.15), (0.034, 0.018, 0.030))
        add_sphere(bm38_eye_b, (-0.20, sy * 0.088, 1.15), (0.018, 0.014, 0.018))
    create_mesh_obj("Relic_38_BowEyesWhite", bm38_eye_w, m["ivory_marble"], parent=r38, subsurf_levels=1)
    create_mesh_obj("Relic_38_BowEyesPupil", bm38_eye_b, m["stone_dark"], parent=r38, subsurf_levels=1)
    relic_roots.append(r38)

    # =========================================================================
    # 39: Sentosa Siloso Cable Car Sky Cabin
    # =========================================================================
    r39 = create_root_empty("Relic_39")
    add_souvenir_base(r39, "Relic_39", radius=0.23, z=0.92, inlay_mat=m["cyan_crystal"])

    # Overhead Gold support arch, hanger arm & pulley wheels
    bm39_gold = bmesh.new()
    arch_pts = [(0.0, 0.17, 0.94), (0.0, 0.21, 1.28), (0.0, 0.14, 1.56), (0.0, 0.0, 1.60)]
    add_tube_along_points(bm39_gold, arch_pts, [0.028, 0.024, 0.022, 0.020], segments=10)
    # Overhead haul cable
    add_tube_along_points(bm39_gold, [(-0.26, 0.0, 1.55), (0.26, 0.0, 1.63)], [0.012, 0.012], segments=8)
    # Pulley carriage & curved suspension hanger arm to cabin roof
    for px in (-0.05, 0.05):
        add_cyl(bm39_gold, (px, 0.0, 1.59), 0.028, 0.028, 0.024, segs=12, rot=(math.pi * 0.5, 0.0, 0.0))
    add_tube_along_points(bm39_gold, [(0.0, 0.0, 1.58), (0.0, -0.05, 1.49), (0.0, 0.0, 1.40)], [0.020, 0.020, 0.028], segments=8)
    # Gold waist trim around cabin
    add_ring(bm39_gold, (0.0, 0.0, 1.18), 0.185, 0.014, segs=20)
    create_mesh_obj("Relic_39_GoldHangerAndCable", bm39_gold, m["gold_bright"], parent=r39, subsurf_levels=1)

    # Rounded Chibi Crimson Lacquer Cable Car Cabin
    bm39_cabin = bmesh.new()
    add_sphere(bm39_cabin, (0.0, 0.0, 1.22), (0.18, 0.16, 0.17), seg_u=20, seg_v=14)
    add_cyl(bm39_cabin, (0.0, 0.0, 1.38), 0.09, 0.07, 0.04, segs=16)
    create_mesh_obj("Relic_39_CrimsonCabin", bm39_cabin, m["crimson_lacquer"], parent=r39, subsurf_levels=2)

    # Wrap-around Cyan Crystal panoramic windows
    bm39_win = bmesh.new()
    add_sphere(bm39_win, (0.0, 0.0, 1.25), (0.186, 0.166, 0.085), seg_u=20, seg_v=10)
    create_mesh_obj("Relic_39_PanoramicWindows", bm39_win, m["cyan_crystal"], parent=r39, subsurf_levels=1)
    relic_roots.append(r39)

    # =========================================================================
    # 40: Oriental Pied Hornbill & Sunda Pangolin Duo
    # =========================================================================
    r40 = create_root_empty("Relic_40")
    add_souvenir_base(r40, "Relic_40", radius=0.24, z=0.92, inlay_mat=m["foliage_bright"])

    # Arching forest branch & foliage leaves
    bm40_branch = bmesh.new()
    b_pts = [(-0.16, 0.04, 0.94), (-0.12, 0.02, 1.14), (0.0, 0.0, 1.26), (0.18, -0.02, 1.30)]
    add_tube_along_points(bm40_branch, b_pts, [0.045, 0.038, 0.032, 0.022], segments=10)
    create_mesh_obj("Relic_40_WoodBranch", bm40_branch, m["wood_warm"], parent=r40, subsurf_levels=1)

    bm40_leaves = bmesh.new()
    for lx, lz, ang in [(-0.16, 1.16, 2.2), (0.18, 1.32, -0.8), (-0.10, 0.98, 1.5)]:
        add_petal(bm40_leaves, Vector((lx, 0.02, lz)), (0.6, ang, 0.0), length=0.14, width=0.065)
    create_mesh_obj("Relic_40_JungleLeaves", bm40_leaves, m["foliage_bright"], parent=r40, subsurf_levels=1)

    # Curled Scaly Sunda Pangolin around the lower base/branch
    bm40_pangolin = bmesh.new()
    pang_pts = [
        (-0.08, -0.10, 1.12), (0.04, -0.12, 1.10), (0.13, -0.04, 1.05),
        (0.10, 0.09, 1.01), (-0.04, 0.11, 0.99), (-0.14, 0.02, 0.98)
    ]
    add_tube_along_points(bm40_pangolin, pang_pts, [0.028, 0.068, 0.072, 0.055, 0.040, 0.018], segments=12)
    for k in range(8):
        ang = -0.6 + k * 0.48
        add_ico(bm40_pangolin, (math.cos(ang) * 0.10, math.sin(ang) * 0.10, 1.08 - k * 0.01), radius=0.036, subdiv=1)
    create_mesh_obj("Relic_40_SundaPangolin", bm40_pangolin, m["bronze_warm"], parent=r40, subsurf_levels=1)

    # Oriental Pied Hornbill perched on upper branch (Stone Dark feathers, Ivory belly, Gold Casque Beak)
    bm40_hb_dark = bmesh.new()
    add_sphere(bm40_hb_dark, (0.02, 0.0, 1.38), (0.085, 0.095, 0.12), rot=(0.2, 0.0, 0.0))
    add_sphere(bm40_hb_dark, (0.02, -0.02, 1.51), (0.068, 0.068, 0.065))
    add_box(bm40_hb_dark, (0.02, 0.09, 1.24), (0.06, 0.03, 0.14), rot=(-0.35, 0.0, 0.0))
    create_mesh_obj("Relic_40_HornbillPlumage", bm40_hb_dark, m["stone_dark"], parent=r40, subsurf_levels=2)

    bm40_hb_white = bmesh.new()
    add_sphere(bm40_hb_white, (0.02, -0.055, 1.36), (0.062, 0.055, 0.085))
    for sx in (-0.045, 0.085):
        add_sphere(bm40_hb_white, (sx, -0.04, 1.52), (0.022, 0.022, 0.022))
    create_mesh_obj("Relic_40_HornbillWhite", bm40_hb_white, m["ivory_marble"], parent=r40, subsurf_levels=1)

    # Big curved Gold Bright Hornbill beak & casque
    bm40_beak = bmesh.new()
    beak_pts = [(0.02, -0.06, 1.51), (0.02, -0.16, 1.50), (0.02, -0.24, 1.45)]
    add_tube_along_points(bm40_beak, beak_pts, [0.042, 0.030, 0.008], segments=10)
    casque_pts = [(0.02, -0.04, 1.56), (0.02, -0.15, 1.55)]
    add_tube_along_points(bm40_beak, casque_pts, [0.032, 0.026], segments=10)
    create_mesh_obj("Relic_40_GoldCasqueBeak", bm40_beak, m["gold_bright"], parent=r40, subsurf_levels=1)
    relic_roots.append(r40)

    # =========================================================================
    # 41: Cavenagh Suspension Bridge Heritage Arch
    # =========================================================================
    r41 = create_root_empty("Relic_41")
    add_souvenir_base(r41, "Relic_41", radius=0.26, z=0.92, inlay_mat=m["cyan_crystal"])

    # Twin Victorian Ivory Marble & Silver bridge towers
    bm41_towers = bmesh.new()
    for tx in (-0.18, 0.18):
        for ty in (-0.075, 0.075):
            add_box(bm41_towers, (tx, ty, 1.24), (0.042, 0.042, 0.54))
        # Tower cross-beams & triangular Victorian pediment
        add_box(bm41_towers, (tx, 0.0, 1.46), (0.05, 0.19, 0.045))
        add_box(bm41_towers, (tx, 0.0, 1.12), (0.045, 0.18, 0.035))
        add_cyl(bm41_towers, (tx, 0.0, 1.52), 0.10, 0.01, 0.07, segs=4, rot=(0.0, 0.0, math.pi * 0.25))
    create_mesh_obj("Relic_41_BridgeTowers", bm41_towers, m["ivory_marble"], parent=r41, subsurf_levels=1)

    # Arched timber deck spanning the river
    bm41_deck = bmesh.new()
    deck_pts = [
        Vector((-0.27 + 0.54 * (k / 10.0), 0.0, 1.10 + math.sin(k / 10.0 * math.pi) * 0.06))
        for k in range(11)
    ]
    add_tube_along_points(bm41_deck, deck_pts, [0.065] * 11, segments=8)
    create_mesh_obj("Relic_41_TimberDeck", bm41_deck, m["wood_warm"], parent=r41, subsurf_levels=1)

    # Gold suspension cables & tower finials
    bm41_cables = bmesh.new()
    for sy in (-0.075, 0.075):
        cable_pts = []
        for k in range(13):
            x_c = -0.26 + 0.52 * (k / 12.0)
            if abs(x_c) <= 0.18:
                u = x_c / 0.18
                z_c = 1.24 + (u ** 2) * 0.26
            else:
                u = (abs(x_c) - 0.18) / 0.08
                z_c = 1.50 - u * 0.34
            cable_pts.append(Vector((x_c, sy, z_c)))
        add_tube_along_points(bm41_cables, cable_pts, [0.012] * 13, segments=8)
        for tx in (-0.18, 0.18):
            add_ico(bm41_cables, (tx, sy, 1.54), radius=0.024, subdiv=1)
    create_mesh_obj("Relic_41_GoldCables", bm41_cables, m["gold_bright"], parent=r41, subsurf_levels=1)

    # Silver vertical suspender rods & side railings
    bm41_rods = bmesh.new()
    for sy in (-0.075, 0.075):
        for kx in (-0.12, -0.06, 0.0, 0.06, 0.12):
            u = kx / 0.18
            z_top = 1.24 + (u ** 2) * 0.26
            add_cyl(bm41_rods, (kx, sy, (1.15 + z_top) * 0.5), 0.006, 0.006, z_top - 1.15, segs=6)
    create_mesh_obj("Relic_41_SuspenderRods", bm41_rods, m["silver_plat"], parent=r41, subsurf_levels=0)
    relic_roots.append(r41)

    # =========================================================================
    # 42: Lion City Golden Passport & Merlion Crest Key
    # =========================================================================
    r42 = create_root_empty("Relic_42")
    add_souvenir_base(r42, "Relic_42", radius=0.24, z=0.92, inlay_mat=m["crimson_lacquer"])

    # Upright Crimson Lacquer Singapore Passport book cover
    bm42_book = bmesh.new()
    p_rot = (0.12, 0.0, -0.15)
    add_box(bm42_book, (-0.03, 0.03, 1.28), (0.28, 0.065, 0.38), rot=p_rot)
    create_mesh_obj("Relic_42_CrimsonPassport", bm42_book, m["crimson_lacquer"], parent=r42, subsurf_levels=1)

    # Ivory marble inner pages block
    bm42_pages = bmesh.new()
    add_box(bm42_pages, (-0.02, 0.03, 1.28), (0.265, 0.050, 0.365), rot=p_rot)
    create_mesh_obj("Relic_42_PassportPages", bm42_pages, m["ivory_marble"], parent=r42, subsurf_levels=1)

    # Embossed Gold Crest on passport cover + Crossed Ceremonial Merlion Skeleton Key
    bm42_gold = bmesh.new()
    # Embossed Coat of Arms shield, stars, supporters & biometric badge on passport front
    add_sphere(bm42_gold, (-0.03, -0.01, 1.31), (0.055, 0.018, 0.065), rot=p_rot)
    for sx in (-0.09, 0.03):
        add_tube_along_points(
            bm42_gold,
            [(sx, -0.01, 1.25), (sx, -0.01, 1.35)],
            [0.016, 0.022], segments=8
        )
    add_box(bm42_gold, (-0.03, -0.01, 1.15), (0.075, 0.015, 0.035), rot=p_rot)

    # Crossed Ceremonial Merlion Key in front (angled diagonally from bottom-left to top-right)
    k_pts = [(-0.14, -0.08, 1.02), (0.02, -0.06, 1.26), (0.14, -0.04, 1.44)]
    add_tube_along_points(bm42_gold, k_pts, [0.024, 0.026, 0.030], segments=12)
    # Ornate Merlion crown bow at top of key
    add_ring(bm42_gold, (0.17, -0.03, 1.50), 0.095, 0.022, segs=18, rot=(math.pi * 0.48, 0.0, -0.58))
    # Key bit teeth at bottom-left
    add_box(bm42_gold, (-0.08, -0.08, 1.03), (0.09, 0.022, 0.035), rot=(0.0, -0.58, 0.0))
    add_box(bm42_gold, (-0.05, -0.08, 1.09), (0.07, 0.022, 0.030), rot=(0.0, -0.58, 0.0))
    create_mesh_obj("Relic_42_GoldCrestAndKey", bm42_gold, m["gold_bright"], parent=r42, subsurf_levels=1)

    # Glowing Cyan Crystal Gem inside the key's crown bow
    bm42_gem = bmesh.new()
    add_ico(bm42_gem, (0.17, -0.03, 1.50), radius=0.052, subdiv=2)
    create_mesh_obj("Relic_42_KeyGem", bm42_gem, m["cyan_crystal"], parent=r42, subsurf_levels=0)
    relic_roots.append(r42)

    return relic_roots
