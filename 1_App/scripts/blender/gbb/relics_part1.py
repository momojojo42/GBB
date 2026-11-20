"""
Part 1 of Bespoke 3D Models for Collectible Singapore & Gardens by the Bay Relics
(`Relic_01` through `Relic_22`), sculpted in a cohesive, chunky Chibi Souvenir aesthetic.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_relics_01_to_22(m, create_root_empty, create_mesh_obj, add_tube_along_points, add_petal):
    # Ensure all referenced material keys resolve cleanly with fallbacks
    m = dict(m)
    m.setdefault("jade_teal", m.get("celadon_jade") or m.get("nyonya_turquoise") or m["cyan_crystal"])
    m.setdefault("lantern_red", m.get("silk_tassel") or m["crimson_lacquer"])
    m.setdefault("wood_warm", m.get("coconut_brown") or m["bronze_warm"])
    m.setdefault("stone_light", m.get("sandstone") or m["ivory_marble"])
    m.setdefault("stone_dark", m.get("zen_stone") or m["cacao_brown"])
    m.setdefault("foliage_bright", m.get("chartreuse"))
    m.setdefault("foliage_mid", m.get("velvet_emerald"))
    m.setdefault("orchid_magenta", m.get("neon_magenta"))
    m.setdefault("orchid_gold", m.get("gold_bright"))

    relic_roots = []

    # -------------------------------------------------------------------------
    # Cute Chibi Geometry Helpers
    # -------------------------------------------------------------------------
    def xform_mat(loc, rot_euler=(0.0, 0.0, 0.0), scale=(1.0, 1.0, 1.0)):
        t = Matrix.Translation(loc)
        r = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
        s = Matrix.Diagonal((scale[0], scale[1], scale[2], 1.0))
        return t @ r @ s

    def _merge_bm(dst_bm, src_bm):
        vmap = {v: dst_bm.verts.new(v.co) for v in src_bm.verts}
        for f in src_bm.faces:
            try:
                dst_bm.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        src_bm.free()

    def add_ellipsoid(bm, loc, rx, ry, rz, rot_euler=(0.0, 0.0, 0.0), u_seg=16, v_seg=12):
        bmesh.ops.create_uvsphere(
            bm, u_segments=u_seg, v_segments=v_seg, radius=1.0,
            matrix=xform_mat(loc, rot_euler, (rx, ry, rz))
        )

    def add_box(bm, loc, hx, hy, hz, rot_euler=(0.0, 0.0, 0.0)):
        bm_tmp = bmesh.new()
        bmesh.ops.create_cube(
            bm_tmp, size=2.0,
            matrix=Matrix.Diagonal((hx, hy, hz, 1.0))
        )
        bev_off = min(hx, hy, hz) * 0.22
        if bev_off > 1e-4:
            bmesh.ops.bevel(
                bm_tmp, geom=list(bm_tmp.edges),
                offset=bev_off, offset_type='OFFSET',
                segments=2, profile=0.5, affect='EDGES'
            )
        bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot_euler, (1.0, 1.0, 1.0)), verts=bm_tmp.verts)
        _merge_bm(bm, bm_tmp)

    def add_cyl(bm, loc, r1, r2, depth, rot_euler=(0.0, 0.0, 0.0), segs=24, cap=True):
        bm_tmp = bmesh.new()
        bmesh.ops.create_cone(
            bm_tmp, cap_ends=cap, cap_tris=False, segments=segs,
            radius1=r1, radius2=r2, depth=depth
        )
        if cap:
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
        bmesh.ops.transform(bm_tmp, matrix=xform_mat(loc, rot_euler, (1.0, 1.0, 1.0)), verts=bm_tmp.verts)
        _merge_bm(bm, bm_tmp)

    def add_torus(bm, loc, major_r, minor_r, rot_euler=(0.0, 0.0, 0.0), maj_seg=28, min_seg=12):
        rings = []
        rot_m = Euler(rot_euler, 'XYZ').to_matrix()
        center = Vector(loc)
        for i in range(maj_seg):
            phi = (2.0 * math.pi * i) / maj_seg
            cp, sp = math.cos(phi), math.sin(phi)
            ring = []
            for j in range(min_seg):
                theta = (2.0 * math.pi * j) / min_seg
                ct, st = math.cos(theta), math.sin(theta)
                r = major_r + minor_r * ct
                p_local = Vector((r * cp, r * sp, minor_r * st))
                ring.append(bm.verts.new(center + (rot_m @ p_local)))
            rings.append(ring)
        for i in range(maj_seg):
            r0 = rings[i]
            r1 = rings[(i + 1) % maj_seg]
            for j in range(min_seg):
                jn = (j + 1) % min_seg
                bm.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    def add_lathe(bm, profile_rz, loc=(0.0, 0.0, 0.0), segs=28, cap_bottom=True, cap_top=True):
        """Revolves a list of (radius, z) tuples around the Z axis."""
        center = Vector(loc)
        rings = []
        for r, z in profile_rz:
            rv = []
            for s in range(segs):
                ang = (2.0 * math.pi * s) / segs
                rv.append(bm.verts.new(center + Vector((math.cos(ang) * r, math.sin(ang) * r, z))))
            rings.append(rv)
        for i in range(len(rings) - 1):
            r0, r1 = rings[i], rings[i + 1]
            for s in range(segs):
                sn = (s + 1) % segs
                bm.faces.new((r0[s], r0[sn], r1[sn], r1[s]))
        if cap_bottom and len(rings) >= 1 and profile_rz[0][0] > 1e-4:
            p_bot = center + Vector((0.0, 0.0, profile_rz[0][1]))
            inner_bot = [bm.verts.new(p_bot.lerp(v.co, 0.55)) for v in rings[0]]
            for s in range(segs):
                sn = (s + 1) % segs
                bm.faces.new((rings[0][sn], rings[0][s], inner_bot[s], inner_bot[sn]))
            bm.faces.new(list(reversed(inner_bot)))
        if cap_top and len(rings) >= 1 and profile_rz[-1][0] > 1e-4:
            p_top = center + Vector((0.0, 0.0, profile_rz[-1][1]))
            inner_top = [bm.verts.new(p_top.lerp(v.co, 0.55)) for v in rings[-1]]
            for s in range(segs):
                sn = (s + 1) % segs
                bm.faces.new((rings[-1][s], rings[-1][sn], inner_top[sn], inner_top[s]))
            bm.faces.new(inner_top)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)

    def add_souvenir_plinth(bm_gold, r=0.22, z=0.92, depth=0.04):
        """Signature cohesive Singapore Collectible Toy Souvenir golden base saucer."""
        add_cyl(bm_gold, (0.0, 0.0, z), r * 1.04, r * 0.96, depth, segs=28)
        add_torus(bm_gold, (0.0, 0.0, z + depth * 0.45), r * 0.96, 0.015, maj_seg=28, min_seg=10)

    # =========================================================================
    # 01: RISIS Gold-Plated Vanda Miss Joaquim
    # =========================================================================
    r01 = create_root_empty("Relic_01")
    bm01_gold = bmesh.new()
    add_souvenir_plinth(bm01_gold, r=0.22, z=0.92, depth=0.04)

    # Velvet-emerald display stand / cushioned easel
    bm01_velvet = bmesh.new()
    add_cyl(bm01_velvet, (0.0, 0.0, 0.97), 0.19, 0.17, 0.06, segs=24)
    add_ellipsoid(bm01_velvet, (0.0, 0.05, 1.24), 0.22, 0.07, 0.25, rot_euler=(0.22, 0.0, 0.0))
    create_mesh_obj("Relic_01_VelvetStand", bm01_velvet, m["velvet_emerald"], parent=r01, subsurf_levels=1)

    # Gold rim around the velvet display cushion + brooch stem + 5 Vanda petals
    add_torus(bm01_gold, (0.0, 0.05, 1.24), 0.23, 0.018, rot_euler=(0.22, 0.0, 0.0), maj_seg=28, min_seg=10)
    orchid_c = Vector((0.0, -0.04, 1.28))
    for ang, ln, w, tx in [
        (0.0, 0.30, 0.13, 0.20),
        (1.15, 0.28, 0.14, 0.28),
        (-1.15, 0.28, 0.14, 0.28),
        (2.35, 0.25, 0.12, -0.12),
        (-2.35, 0.25, 0.12, -0.12),
    ]:
        add_petal(bm01_gold, orchid_c, (tx, ang, 0.0), length=ln, width=w, thick=0.030, cup=0.045)
    add_tube_along_points(
        bm01_gold,
        [orchid_c, orchid_c + Vector((0.0, 0.03, -0.16)), Vector((0.0, 0.04, 0.98))],
        [0.024, 0.020, 0.016], segments=10
    )
    create_mesh_obj("Relic_01_GoldOrchid", bm01_gold, m["gold_bright"], parent=r01, subsurf_levels=2)

    # Copper-rose labellum lip
    bm01_lip = bmesh.new()
    add_ellipsoid(bm01_lip, orchid_c + Vector((0.0, -0.09, -0.07)), 0.11, 0.09, 0.10, rot_euler=(0.35, 0.0, 0.0))
    add_torus(bm01_lip, orchid_c + Vector((0.0, -0.12, -0.08)), 0.075, 0.022, rot_euler=(1.1, 0.0, 0.0), maj_seg=20, min_seg=10)
    create_mesh_obj("Relic_01_CopperLip", bm01_lip, m["copper_rose"], parent=r01, subsurf_levels=2)

    # Gleaming pearl core & brooch accents
    bm01_pearl = bmesh.new()
    add_ellipsoid(bm01_pearl, orchid_c + Vector((0.0, -0.08, 0.01)), 0.055, 0.055, 0.055)
    for s in (-1, 1):
        add_ellipsoid(bm01_pearl, orchid_c + Vector((s * 0.06, -0.06, -0.02)), 0.024, 0.024, 0.024)
    create_mesh_obj("Relic_01_PearlCore", bm01_pearl, m["ivory_marble"], parent=r01, subsurf_levels=1)
    relic_roots.append(r01)

    # =========================================================================
    # 02: Miniature Merlion Water-Spout Statuette
    # =========================================================================
    r02 = create_root_empty("Relic_02")
    bm02_gold = bmesh.new()
    add_souvenir_plinth(bm02_gold, r=0.23, z=0.92, depth=0.04)
    create_mesh_obj("Relic_02_Plinth", bm02_gold, m["gold_bright"], parent=r02, subsurf_levels=1)

    # Cyan crystal wave base & arching water spout
    bm02_wave = bmesh.new()
    add_cyl(bm02_wave, (0.0, 0.0, 0.98), 0.21, 0.19, 0.08, segs=24)
    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        add_ellipsoid(
            bm02_wave,
            (math.cos(ang) * 0.16, math.sin(ang) * 0.16, 1.02),
            0.065, 0.045, 0.045, rot_euler=(0.2, 0.0, ang)
        )
    spout_pts = [
        Vector((0.0, -0.13, 1.38)),
        Vector((0.0, -0.22, 1.43)),
        Vector((0.0, -0.27, 1.34)),
        Vector((0.0, -0.26, 1.18)),
        Vector((0.0, -0.21, 1.02)),
    ]
    add_tube_along_points(bm02_wave, spout_pts, [0.022, 0.030, 0.036, 0.044, 0.060], segments=12)
    create_mesh_obj("Relic_02_WaveAndSpout", bm02_wave, m["cyan_crystal"], parent=r02, subsurf_levels=1)

    # Chunky chibi ivory-marble Merlion body, curled fish tail, lion head & beaded mane
    bm02_body = bmesh.new()
    tail_pts = [
        Vector((0.0, 0.10, 1.02)),
        Vector((0.0, 0.02, 1.12)),
        Vector((0.0, -0.02, 1.25)),
        Vector((0.0, -0.01, 1.38)),
    ]
    add_tube_along_points(bm02_body, tail_pts, [0.13, 0.14, 0.12, 0.10], segments=16)
    curl_pts = [
        Vector((0.0, 0.08, 1.03)),
        Vector((0.0, 0.18, 1.08)),
        Vector((0.0, 0.20, 1.20)),
        Vector((0.0, 0.14, 1.28)),
    ]
    add_tube_along_points(bm02_body, curl_pts, [0.09, 0.07, 0.05, 0.025], segments=12)
    # Tail fluke fins
    for side in (-1, 1):
        add_ellipsoid(bm02_body, (side * 0.06, 0.14, 1.31), 0.06, 0.025, 0.08, rot_euler=(0.2, side * 0.5, 0.0))
    # Chibi head & snout
    head_c = Vector((0.0, -0.02, 1.42))
    add_ellipsoid(bm02_body, head_c, 0.13, 0.13, 0.12)
    add_ellipsoid(bm02_body, head_c + Vector((0.0, -0.10, -0.02)), 0.085, 0.075, 0.065)
    # Cute front paws
    for side in (-1, 1):
        add_ellipsoid(bm02_body, (side * 0.09, -0.09, 1.22), 0.042, 0.055, 0.038)
    # Beaded mane rings around head
    for i in range(10):
        ang = -0.35 * math.pi + (1.7 * math.pi * i) / 9.0
        mp = head_c + Vector((math.cos(ang) * 0.125, math.sin(ang) * 0.09 + 0.03, math.sin(ang) * 0.11))
        add_ellipsoid(bm02_body, mp, 0.042, 0.042, 0.042)
    create_mesh_obj("Relic_02_MerlionBody", bm02_body, m["ivory_marble"], parent=r02, subsurf_levels=1)

    # Cute dark eyes
    bm02_eyes = bmesh.new()
    for side in (-1, 1):
        add_ellipsoid(bm02_eyes, head_c + Vector((side * 0.055, -0.105, 0.025)), 0.020, 0.015, 0.020)
    create_mesh_obj("Relic_02_Eyes", bm02_eyes, m["stone_dark"], parent=r02, subsurf_levels=1)
    relic_roots.append(r02)

    # =========================================================================
    # 03: Jewel Changi Rain Vortex Snowglobe
    # =========================================================================
    r03 = create_root_empty("Relic_03")
    bm03_gold = bmesh.new()
    add_souvenir_plinth(bm03_gold, r=0.24, z=0.92, depth=0.05)
    add_cyl(bm03_gold, (0.0, 0.0, 0.98), 0.21, 0.18, 0.07, segs=28)
    # Nameplate plaque on front of plinth
    add_box(bm03_gold, (0.0, -0.20, 0.96), 0.09, 0.02, 0.025, rot_euler=(0.2, 0.0, 0.0))
    create_mesh_obj("Relic_03_GoldPlinth", bm03_gold, m["gold_bright"], parent=r03, subsurf_levels=1)

    # Indoor Forest Valley foliage terraces around the vortex
    bm03_trees = bmesh.new()
    add_torus(bm03_trees, (0.0, 0.0, 1.06), 0.14, 0.045, maj_seg=24, min_seg=10)
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0
        r_bush = 0.13 if i % 2 == 0 else 0.15
        zb = 1.11 if i % 2 == 0 else 1.15
        add_ellipsoid(bm03_trees, (math.cos(ang) * r_bush, math.sin(ang) * r_bush, zb), 0.055, 0.055, 0.050)
    create_mesh_obj("Relic_03_ForestTerrace", bm03_trees, m["foliage_bright"], parent=r03, subsurf_levels=1)

    # Glowing Cyan Crystal central Rain Vortex funnel + splash pool + roof oculus ring
    bm03_vortex = bmesh.new()
    vortex_profile = [
        (0.11, 1.02),
        (0.055, 1.10),
        (0.032, 1.22),
        (0.048, 1.34),
        (0.115, 1.44),
    ]
    add_lathe(bm03_vortex, vortex_profile, segs=24, cap_bottom=True, cap_top=True)
    create_mesh_obj("Relic_03_RainVortex", bm03_vortex, m["cyan_crystal"], parent=r03, subsurf_levels=1)

    # Toroidal Silver-Plat geodesic lattice ribs & oculus collar
    bm03_dome = bmesh.new()
    dome_c = Vector((0.0, 0.0, 1.23))
    add_torus(bm03_dome, (0.0, 0.0, 1.44), 0.115, 0.018, maj_seg=24, min_seg=10)
    for z_ring, r_ring in [(1.14, 0.24), (1.26, 0.26), (1.37, 0.21)]:
        add_torus(bm03_dome, (0.0, 0.0, z_ring), r_ring, 0.011, maj_seg=28, min_seg=8)
    for i in range(12):
        ang = (2.0 * math.pi * i) / 12.0
        rib_pts = []
        for k in range(8):
            t = k / 7.0
            theta = -0.32 * math.pi + t * (0.72 * math.pi)
            rr = 0.255 * math.cos(theta)
            zz = dome_c.z + 0.22 * math.sin(theta)
            rib_pts.append(Vector((math.cos(ang) * rr, math.sin(ang) * rr, zz)))
        add_tube_along_points(bm03_dome, rib_pts, [0.012] * 8, segments=8)
    create_mesh_obj("Relic_03_ToroidDome", bm03_dome, m["silver_plat"], parent=r03, subsurf_levels=1)
    relic_roots.append(r03)

    # =========================================================================
    # 04: Marina Bay Sands SkyPark Ship Trophy
    # =========================================================================
    r04 = create_root_empty("Relic_04")
    bm04_gold = bmesh.new()
    add_souvenir_plinth(bm04_gold, r=0.25, z=0.92, depth=0.04)

    # 3 cute tilted silver_plat hotel towers with A-frame split legs
    bm04_towers = bmesh.new()
    for tx in (-0.15, 0.0, 0.15):
        # Main tower slab
        add_box(bm04_towers, (tx, 0.0, 1.18), 0.042, 0.065, 0.22, rot_euler=(0.06, 0.0, 0.0))
        # Curved shearing secondary leg
        add_box(bm04_towers, (tx, 0.035, 1.12), 0.036, 0.035, 0.16, rot_euler=(-0.18, 0.0, 0.0))
    create_mesh_obj("Relic_04_Towers", bm04_towers, m["silver_plat"], parent=r04, subsurf_levels=1)

    # Golden SkyPark surfboard / ship deck cantilevered across top of the 3 towers
    hull_pts = [
        Vector((-0.26, 0.0, 1.42)),
        Vector((-0.14, 0.0, 1.41)),
        Vector((0.0, 0.0, 1.41)),
        Vector((0.16, 0.0, 1.41)),
        Vector((0.29, 0.0, 1.43)),
    ]
    add_tube_along_points(bm04_gold, hull_pts, [0.035, 0.082, 0.095, 0.082, 0.028], segments=16)
    add_box(bm04_gold, (0.01, 0.0, 1.43), 0.25, 0.075, 0.022)
    create_mesh_obj("Relic_04_GoldSkyPark", bm04_gold, m["gold_bright"], parent=r04, subsurf_levels=1)

    # Cyan crystal infinity pool strip along the front edge
    bm04_pool = bmesh.new()
    add_box(bm04_pool, (0.01, -0.032, 1.452), 0.21, 0.032, 0.012)
    create_mesh_obj("Relic_04_InfinityPool", bm04_pool, m["cyan_crystal"], parent=r04, subsurf_levels=1)

    # Tiny tropical foliage palm puffs on the SkyPark deck
    bm04_palms = bmesh.new()
    for px in (-0.20, -0.10, 0.02, 0.14, 0.23):
        add_ellipsoid(bm04_palms, (px, 0.03, 1.475), 0.032, 0.032, 0.028)
    create_mesh_obj("Relic_04_SkyPalms", bm04_palms, m["foliage_bright"], parent=r04, subsurf_levels=1)
    relic_roots.append(r04)

    # =========================================================================
    # 05: Singapore Airlines Sarong Kebaya Doll
    # =========================================================================
    r05 = create_root_empty("Relic_05")
    bm05_gold = bmesh.new()
    add_souvenir_plinth(bm05_gold, r=0.21, z=0.92, depth=0.04)

    # Sapphire-blue chibi Sarong Kebaya skirt, torso & sleeves
    bm05_kebaya = bmesh.new()
    kebaya_profile = [
        (0.115, 0.95),
        (0.110, 1.05),
        (0.088, 1.15),
        (0.102, 1.24),
        (0.085, 1.31),
    ]
    add_lathe(bm05_kebaya, kebaya_profile, segs=24)
    for side in (-1, 1):
        arm_pts = [
            Vector((side * 0.09, 0.0, 1.29)),
            Vector((side * 0.11, -0.05, 1.22)),
            Vector((side * 0.035, -0.10, 1.19)),
        ]
        add_tube_along_points(bm05_kebaya, arm_pts, [0.034, 0.030, 0.026], segments=10)
    create_mesh_obj("Relic_05_BlueKebaya", bm05_kebaya, m["sapphire_blue"], parent=r05, subsurf_levels=1)

    # Golden batik sarong trim bands, collar lapel & hair flower ornament
    for z_band, r_band in [(0.98, 0.114), (1.06, 0.108), (1.15, 0.091), (1.23, 0.103)]:
        add_torus(bm05_gold, (0.0, 0.0, z_band), r_band, 0.012, maj_seg=24, min_seg=8)
    add_torus(bm05_gold, (0.0, -0.02, 1.30), 0.065, 0.012, rot_euler=(0.35, 0.0, 0.0), maj_seg=20, min_seg=8)
    add_ellipsoid(bm05_gold, (0.05, 0.09, 1.50), 0.028, 0.028, 0.028)
    create_mesh_obj("Relic_05_BatikGold", bm05_gold, m["gold_bright"], parent=r05, subsurf_levels=1)

    # Ivory-marble chibi head, neck & folded greeting hands (anjali mudra)
    bm05_skin = bmesh.new()
    add_cyl(bm05_skin, (0.0, 0.0, 1.34), 0.048, 0.045, 0.11, segs=16)
    add_ellipsoid(bm05_skin, (0.0, 0.0, 1.43), 0.105, 0.100, 0.105)
    for side in (-1, 1):
        add_ellipsoid(bm05_skin, (side * 0.018, -0.11, 1.20), 0.022, 0.036, 0.038, rot_euler=(0.3, 0.0, side * 0.2))
    create_mesh_obj("Relic_05_ChibiSkin", bm05_skin, m["ivory_marble"], parent=r05, subsurf_levels=2)

    # Neat dark hair cap, classic chignon bun & cute eyes
    bm05_hair = bmesh.new()
    add_ellipsoid(bm05_hair, (0.0, 0.02, 1.45), 0.110, 0.102, 0.098)
    add_ellipsoid(bm05_hair, (0.0, 0.105, 1.47), 0.062, 0.058, 0.062)
    for side in (-1, 1):
        add_ellipsoid(bm05_hair, (side * 0.042, -0.098, 1.42), 0.014, 0.010, 0.016)
    create_mesh_obj("Relic_05_HairAndEyes", bm05_hair, m["stone_dark"], parent=r05, subsurf_levels=1)
    relic_roots.append(r05)

    # =========================================================================
    # 06: Changi Airport Retro Flight Flip-Board
    # =========================================================================
    r06 = create_root_empty("Relic_06")
    bm06_gold = bmesh.new()
    add_souvenir_plinth(bm06_gold, r=0.23, z=0.92, depth=0.04)

    # Brass mounting pillars, outer frame & soaring miniature jet plane on top
    for sx in (-0.14, 0.14):
        add_cyl(bm06_gold, (sx, 0.0, 1.00), 0.022, 0.022, 0.14, segs=16)
    # Outer golden bezel around the split-flap board
    add_box(bm06_gold, (0.0, 0.0, 1.38), 0.28, 0.055, 0.020)
    add_box(bm06_gold, (0.0, 0.0, 1.06), 0.28, 0.055, 0.020)
    for sx in (-0.27, 0.27):
        add_box(bm06_gold, (sx, 0.0, 1.22), 0.020, 0.055, 0.17)
    # Support arc for miniature jet plane soaring above the board
    add_tube_along_points(
        bm06_gold,
        [Vector((-0.06, 0.0, 1.39)), Vector((-0.02, 0.0, 1.46)), Vector((0.02, -0.02, 1.51))],
        [0.016, 0.014, 0.012], segments=8
    )
    jet_c = Vector((0.03, -0.02, 1.52))
    add_ellipsoid(bm06_gold, jet_c, 0.13, 0.038, 0.036, rot_euler=(0.0, -0.22, 0.0))
    add_box(bm06_gold, jet_c + Vector((-0.01, 0.0, -0.005)), 0.045, 0.14, 0.009, rot_euler=(0.0, -0.22, 0.0))
    add_box(bm06_gold, jet_c + Vector((-0.10, 0.0, 0.045)), 0.028, 0.008, 0.042, rot_euler=(0.0, -0.22, 0.0))
    create_mesh_obj("Relic_06_GoldFrameAndJet", bm06_gold, m["gold_bright"], parent=r06, subsurf_levels=1)

    # Dark slate split-flap board housing
    bm06_board = bmesh.new()
    add_box(bm06_board, (0.0, 0.0, 1.22), 0.255, 0.042, 0.145)
    create_mesh_obj("Relic_06_BoardHousing", bm06_board, m["stone_dark"], parent=r06, subsurf_levels=1)

    # Rows of flip-tiles (ivory_marble & crimson_lacquer) on BOTH front & back faces
    bm06_ivory = bmesh.new()
    bm06_crimson = bmesh.new()
    for face_y in (-0.044, 0.044):
        for r_idx, zz in enumerate([1.31, 1.25, 1.19, 1.13]):
            for c_idx in range(6):
                xx = -0.19 + c_idx * 0.076
                target_bm = bm06_crimson if (c_idx == 0 or (r_idx + c_idx) % 4 == 0) else bm06_ivory
                add_box(target_bm, (xx, face_y, zz), 0.030, 0.008, 0.021)
    create_mesh_obj("Relic_06_IvoryTiles", bm06_ivory, m["ivory_marble"], parent=r06, subsurf_levels=0)
    create_mesh_obj("Relic_06_CrimsonTiles", bm06_crimson, m["crimson_lacquer"], parent=r06, subsurf_levels=0)
    relic_roots.append(r06)

    # =========================================================================
    # 07: Singapore Flyer Golden Observation Capsule
    # =========================================================================
    r07 = create_root_empty("Relic_07")
    bm07_gold = bmesh.new()
    add_souvenir_plinth(bm07_gold, r=0.23, z=0.92, depth=0.04)

    wheel_c = Vector((0.0, 0.0, 1.29))
    wheel_r = 0.23
    # Twin golden Ferris wheel rims + central axle hub + 6 radial spokes + A-frame struts
    for wy in (-0.038, 0.038):
        add_torus(bm07_gold, (0.0, wy, wheel_c.z), wheel_r, 0.015, rot_euler=(math.pi * 0.5, 0.0, 0.0), maj_seg=32, min_seg=10)
        for s_y in (-1, 1):
            add_tube_along_points(
                bm07_gold,
                [Vector((s_y * 0.13, wy * 1.35, 0.94)), Vector((0.0, wy * 1.1, wheel_c.z))],
                [0.018, 0.015], segments=8
            )
    add_cyl(bm07_gold, wheel_c, 0.045, 0.045, 0.12, rot_euler=(math.pi * 0.5, 0.0, 0.0), segs=20)
    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        px = math.cos(ang) * wheel_r
        pz = wheel_c.z + math.sin(ang) * wheel_r
        add_tube_along_points(bm07_gold, [wheel_c, Vector((px, 0.0, pz))], [0.012, 0.012], segments=8)
        # Golden end-rings around each observation capsule
        for cy in (-0.045, 0.045):
            add_torus(bm07_gold, (px, cy, pz), 0.044, 0.010, rot_euler=(math.pi * 0.5, 0.0, 0.0), maj_seg=18, min_seg=8)
    create_mesh_obj("Relic_07_GoldWheel", bm07_gold, m["gold_bright"], parent=r07, subsurf_levels=1)

    # 6 cute cyan_crystal cylindrical passenger capsules around the rim
    bm07_caps = bmesh.new()
    for i in range(6):
        ang = (2.0 * math.pi * i) / 6.0
        px = math.cos(ang) * wheel_r
        pz = wheel_c.z + math.sin(ang) * wheel_r
        add_cyl(bm07_caps, (px, 0.0, pz), 0.042, 0.042, 0.10, rot_euler=(math.pi * 0.5, 0.0, 0.0), segs=18)
    create_mesh_obj("Relic_07_CyanCapsules", bm07_caps, m["cyan_crystal"], parent=r07, subsurf_levels=1)
    relic_roots.append(r07)

    # =========================================================================
    # 08: Supertree Grove Solar Light Music Box
    # =========================================================================
    r08 = create_root_empty("Relic_08")
    bm08_gold = bmesh.new()
    add_souvenir_plinth(bm08_gold, r=0.23, z=0.92, depth=0.04)

    # Crimson-lacquer cylindrical music box drum
    bm08_crimson = bmesh.new()
    add_cyl(bm08_crimson, (0.0, 0.0, 1.03), 0.19, 0.19, 0.16, segs=28)
    create_mesh_obj("Relic_08_MusicBoxDrum", bm08_crimson, m["crimson_lacquer"], parent=r08, subsurf_levels=1)

    # Golden trim rings on music box + side wind-up key + Supertree solar crown rings & Skyway arch
    add_torus(bm08_gold, (0.0, 0.0, 0.96), 0.195, 0.015, maj_seg=28, min_seg=10)
    add_torus(bm08_gold, (0.0, 0.0, 1.11), 0.195, 0.015, maj_seg=28, min_seg=10)
    # Wind-up key on +X side
    add_cyl(bm08_gold, (0.21, 0.0, 1.03), 0.014, 0.014, 0.07, rot_euler=(0.0, math.pi * 0.5, 0.0), segs=12)
    add_torus(bm08_gold, (0.26, 0.0, 1.055), 0.028, 0.010, rot_euler=(math.pi * 0.5, 0.0, 0.0), maj_seg=16, min_seg=8)
    add_torus(bm08_gold, (0.26, 0.0, 1.005), 0.028, 0.010, rot_euler=(math.pi * 0.5, 0.0, 0.0), maj_seg=16, min_seg=8)
    # Golden Supertree canopy rings & trunk buttress ribs
    add_torus(bm08_gold, (0.0, 0.0, 1.46), 0.22, 0.014, maj_seg=28, min_seg=10)
    add_torus(bm08_gold, (0.0, 0.0, 1.52), 0.15, 0.014, maj_seg=24, min_seg=10)
    for i in range(8):
        ang = (2.0 * math.pi * i) / 8.0
        ca, sa = math.cos(ang), math.sin(ang)
        rib = [
            Vector((ca * 0.085, sa * 0.085, 1.12)),
            Vector((ca * 0.055, sa * 0.055, 1.28)),
            Vector((ca * 0.14, sa * 0.14, 1.40)),
            Vector((ca * 0.22, sa * 0.22, 1.46)),
        ]
        add_tube_along_points(bm08_gold, rib, [0.012, 0.010, 0.011, 0.012], segments=8)
    create_mesh_obj("Relic_08_GoldKeyAndCanopy", bm08_gold, m["gold_bright"], parent=r08, subsurf_levels=1)

    # Glowing Amethyst-Purple miniature Supertree core & flared solar canopy
    bm08_purple = bmesh.new()
    tree_profile = [
        (0.085, 1.11),
        (0.052, 1.26),
        (0.068, 1.36),
        (0.205, 1.45),
        (0.140, 1.52),
        (0.001, 1.55),
    ]
    add_lathe(bm08_purple, tree_profile, segs=24)
    create_mesh_obj("Relic_08_SupertreeCore", bm08_purple, m["amethyst_purple"], parent=r08, subsurf_levels=1)
    relic_roots.append(r08)

    # =========================================================================
    # 09: ArtScience Lotus Blossom Sculpture
    # =========================================================================
    r09 = create_root_empty("Relic_09")
    bm09_gold = bmesh.new()
    add_souvenir_plinth(bm09_gold, r=0.24, z=0.92, depth=0.04)

    # Glowing golden pearl cradled inside the ArtScience lotus fingers
    add_ellipsoid(bm09_gold, (0.0, 0.0, 1.28), 0.095, 0.095, 0.095)
    add_torus(bm09_gold, (0.0, 0.0, 1.22), 0.115, 0.014, maj_seg=24, min_seg=8)
    create_mesh_obj("Relic_09_GoldPearlAndBase", bm09_gold, m["gold_bright"], parent=r09, subsurf_levels=1)

    # Cyan crystal lily pond reflection pool & tripod pedestal stem
    bm09_pond = bmesh.new()
    add_cyl(bm09_pond, (0.0, 0.0, 0.96), 0.22, 0.20, 0.045, segs=28)
    add_cyl(bm09_pond, (0.0, 0.0, 1.04), 0.08, 0.11, 0.12, segs=20)
    create_mesh_obj("Relic_09_LilyPond", bm09_pond, m["cyan_crystal"], parent=r09, subsurf_levels=1)

    # 10 cute asymmetric upturned ivory-marble lotus-finger petals
    bm09_lotus = bmesh.new()
    lotus_base = Vector((0.0, 0.0, 1.08))
    for i in range(10):
        ang = (2.0 * math.pi * i) / 10.0
        # Iconic asymmetric ArtScience silhouette (taller fingers on one side)
        ln = 0.34 + 0.09 * math.cos(ang - 0.5)
        w = 0.11 + 0.02 * math.sin(ang)
        tilt = 0.58 + 0.12 * math.sin(ang * 2.0)
        add_petal(bm09_lotus, lotus_base, (tilt, ang, 0.0), length=ln, width=w, thick=0.034, cup=0.06)
    create_mesh_obj("Relic_09_LotusFingers", bm09_lotus, m["ivory_marble"], parent=r09, subsurf_levels=2)
    relic_roots.append(r09)

    # =========================================================================
    # 10: Raffles Hotel White Doorman Pith Helmet
    # =========================================================================
    r10 = create_root_empty("Relic_10")
    bm10_gold = bmesh.new()
    add_souvenir_plinth(bm10_gold, r=0.22, z=0.92, depth=0.04)
    # Brass display post supporting the helmet
    add_cyl(bm10_gold, (0.0, 0.0, 1.03), 0.045, 0.035, 0.18, segs=20)

    # Domed ivory_marble colonial tropical pith helmet with curved brim & top vent button
    bm10_helmet = bmesh.new()
    # Sloped wide brim
    add_ellipsoid(bm10_helmet, (0.0, 0.0, 1.17), 0.25, 0.28, 0.048, rot_euler=(0.08, 0.0, 0.0))
    # High rounded crown dome
    add_ellipsoid(bm10_helmet, (0.0, 0.0, 1.29), 0.175, 0.195, 0.165)
    # Top ventilation puggaree knob
    add_ellipsoid(bm10_helmet, (0.0, 0.0, 1.46), 0.042, 0.042, 0.028)
    create_mesh_obj("Relic_10_PithHelmet", bm10_helmet, m["ivory_marble"], parent=r10, subsurf_levels=2)

    # Crimson-lacquer pleated puggaree hatband
    bm10_band = bmesh.new()
    add_torus(bm10_band, (0.0, 0.0, 1.215), 0.175, 0.028, rot_euler=(0.05, 0.0, 0.0), maj_seg=28, min_seg=10)
    add_torus(bm10_band, (0.0, 0.0, 1.245), 0.170, 0.022, rot_euler=(0.05, 0.0, 0.0), maj_seg=28, min_seg=10)
    create_mesh_obj("Relic_10_CrimsonBand", bm10_band, m["crimson_lacquer"], parent=r10, subsurf_levels=1)

    # Golden Raffles crest badge on front + chinstrap + brass luggage tag on side
    add_ellipsoid(bm10_gold, (0.0, -0.185, 1.29), 0.055, 0.020, 0.068, rot_euler=(-0.15, 0.0, 0.0))
    add_torus(bm10_gold, (0.0, -0.188, 1.29), 0.052, 0.010, rot_euler=(1.42, 0.0, 0.0), maj_seg=20, min_seg=8)
    # Brass luggage tag resting by the base
    add_box(bm10_gold, (0.15, -0.10, 0.99), 0.065, 0.042, 0.012, rot_euler=(0.35, 0.20, -0.45))
    add_torus(bm10_gold, (0.11, -0.07, 1.01), 0.022, 0.006, maj_seg=16, min_seg=8)
    create_mesh_obj("Relic_10_GoldCrestAndTag", bm10_gold, m["gold_bright"], parent=r10, subsurf_levels=1)
    relic_roots.append(r10)

    # =========================================================================
    # 11: Traditional Kopitiam Floral Porcelain Cup & Saucer
    # =========================================================================
    r11 = create_root_empty("Relic_11")
    bm11_gold = bmesh.new()
    add_souvenir_plinth(bm11_gold, r=0.24, z=0.92, depth=0.04)
    create_mesh_obj("Relic_11_Plinth", bm11_gold, m["gold_bright"], parent=r11, subsurf_levels=1)

    # Thick-walled ivory_marble porcelain saucer & flared kopitiam cup with ear handle
    bm11_porcelain = bmesh.new()
    saucer_profile = [
        (0.11, 0.95),
        (0.24, 1.00),
        (0.25, 1.03),
        (0.19, 1.035),
        (0.09, 0.99),
    ]
    add_lathe(bm11_porcelain, saucer_profile, segs=28)
    cup_profile = [
        (0.095, 1.00),
        (0.105, 1.05),
        (0.135, 1.22),
        (0.155, 1.38),
        (0.130, 1.385),
        (0.112, 1.32),
    ]
    add_lathe(bm11_porcelain, cup_profile, segs=28)
    handle_pts = [
        Vector((0.138, 0.0, 1.33)),
        Vector((0.215, 0.0, 1.31)),
        Vector((0.220, 0.0, 1.19)),
        Vector((0.120, 0.0, 1.11)),
    ]
    add_tube_along_points(bm11_porcelain, handle_pts, [0.024, 0.024, 0.024, 0.022], segments=12)
    create_mesh_obj("Relic_11_PorcelainCup", bm11_porcelain, m["ivory_marble"], parent=r11, subsurf_levels=1)

    # Vintage velvet_emerald green bands around cup rim, cup waist & saucer edge
    bm11_green = bmesh.new()
    add_torus(bm11_green, (0.0, 0.0, 1.355), 0.148, 0.015, maj_seg=28, min_seg=10)
    add_torus(bm11_green, (0.0, 0.0, 1.10), 0.112, 0.012, maj_seg=28, min_seg=8)
    add_torus(bm11_green, (0.0, 0.0, 1.022), 0.235, 0.014, maj_seg=28, min_seg=10)
    # Green leaves flanking the front/back floral motifs
    for side_y in (-1, 1):
        for sx in (-1, 1):
            add_ellipsoid(bm11_green, (sx * 0.065, side_y * 0.125, 1.23), 0.032, 0.014, 0.018, rot_euler=(0.0, sx * 0.4, 0.0))
    create_mesh_obj("Relic_11_EmeraldBands", bm11_green, m["velvet_emerald"], parent=r11, subsurf_levels=1)

    # Crimson-lacquer floral blossom motifs on front & back of the cup
    bm11_flower = bmesh.new()
    for side_y in (-1, 1):
        fc = Vector((0.0, side_y * 0.136, 1.23))
        for p in range(5):
            ang = (2.0 * math.pi * p) / 5.0
            offset = Vector((math.cos(ang) * 0.034, 0.0, math.sin(ang) * 0.034))
            add_ellipsoid(bm11_flower, fc + offset, 0.022, 0.012, 0.022)
    create_mesh_obj("Relic_11_FloralMotif", bm11_flower, m["crimson_lacquer"], parent=r11, subsurf_levels=1)

    # Rich cacao_brown Nanyang Kopi inside the cup
    bm11_kopi = bmesh.new()
    add_cyl(bm11_kopi, (0.0, 0.0, 1.34), 0.128, 0.132, 0.03, segs=24)
    create_mesh_obj("Relic_11_KopiLiquid", bm11_kopi, m["cacao_brown"], parent=r11, subsurf_levels=1)

    # Silver-plat kopitiam spoon sticking out of the cup
    bm11_spoon = bmesh.new()
    spoon_pts = [
        Vector((-0.04, 0.0, 1.33)),
        Vector((-0.09, -0.02, 1.42)),
        Vector((-0.14, -0.04, 1.50)),
    ]
    add_tube_along_points(bm11_spoon, spoon_pts, [0.012, 0.014, 0.022], segments=10)
    add_ellipsoid(bm11_spoon, (-0.15, -0.045, 1.51), 0.028, 0.012, 0.035, rot_euler=(0.2, -0.5, 0.0))
    create_mesh_obj("Relic_11_SilverSpoon", bm11_spoon, m["silver_plat"], parent=r11, subsurf_levels=1)
    relic_roots.append(r11)

    # =========================================================================
    # 12: Nanyang Long-Spout Brass Kopi Sock Pot
    # =========================================================================
    r12 = create_root_empty("Relic_12")
    bm12_gold = bmesh.new()
    add_souvenir_plinth(bm12_gold, r=0.22, z=0.92, depth=0.04)

    # Tall tapered gold_bright Nanyang coffee kettle body + long swan-neck spout
    pot_profile = [
        (0.145, 0.95),
        (0.138, 1.08),
        (0.118, 1.24),
        (0.102, 1.38),
        (0.115, 1.41),
        (0.088, 1.41),
    ]
    add_lathe(bm12_gold, pot_profile, segs=28)
    spout_pts = [
        Vector((0.12, 0.0, 1.04)),
        Vector((0.22, 0.0, 1.14)),
        Vector((0.24, 0.0, 1.30)),
        Vector((0.27, 0.0, 1.44)),
    ]
    add_tube_along_points(bm12_gold, spout_pts, [0.038, 0.028, 0.020, 0.015], segments=12)
    create_mesh_obj("Relic_12_BrassPot", bm12_gold, m["gold_bright"], parent=r12, subsurf_levels=1)

    # Bronze-warm kettle handle, collar bands & wire frame holding the kopi sock
    bm12_bronze = bmesh.new()
    handle_pts = [
        Vector((-0.105, 0.0, 1.37)),
        Vector((-0.21, 0.0, 1.34)),
        Vector((-0.21, 0.0, 1.12)),
        Vector((-0.135, 0.0, 1.04)),
    ]
    add_tube_along_points(bm12_bronze, handle_pts, [0.022, 0.024, 0.024, 0.022], segments=10)
    add_torus(bm12_bronze, (0.0, 0.0, 1.16), 0.130, 0.012, maj_seg=28, min_seg=8)
    # Raised wire loop & handle for the cotton filter sock
    add_torus(bm12_bronze, (0.0, 0.0, 1.49), 0.088, 0.012, maj_seg=24, min_seg=8)
    add_tube_along_points(
        bm12_bronze,
        [Vector((-0.085, 0.0, 1.49)), Vector((-0.18, 0.0, 1.54)), Vector((-0.24, 0.0, 1.56))],
        [0.014, 0.016, 0.020], segments=10
    )
    create_mesh_obj("Relic_12_BronzeAccents", bm12_bronze, m["bronze_warm"], parent=r12, subsurf_levels=1)

    # Raised ivory_marble cotton kopi filter sock (stained with rich kopi at the tip)
    bm12_sock = bmesh.new()
    sock_profile = [
        (0.052, 1.33),
        (0.068, 1.40),
        (0.085, 1.49),
        (0.075, 1.50),
    ]
    add_lathe(bm12_sock, sock_profile, segs=22)
    create_mesh_obj("Relic_12_CottonSock", bm12_sock, m["ivory_marble"], parent=r12, subsurf_levels=1)

    bm12_coffee = bmesh.new()
    add_ellipsoid(bm12_coffee, (0.0, 0.0, 1.48), 0.068, 0.068, 0.020)
    create_mesh_obj("Relic_12_KopiGrounds", bm12_coffee, m["cacao_brown"], parent=r12, subsurf_levels=1)
    relic_roots.append(r12)

    # =========================================================================
    # 13: Kaya Toast, Soft-Boiled Eggs & Green Kaya Jar
    # =========================================================================
    r13 = create_root_empty("Relic_13")
    bm13_gold = bmesh.new()
    add_souvenir_plinth(bm13_gold, r=0.25, z=0.92, depth=0.04)

    # Cute elevated wood_warm Kopitiam breakfast tray with raised rim & handles
    bm13_tray = bmesh.new()
    add_cyl(bm13_tray, (0.0, 0.0, 0.99), 0.14, 0.18, 0.10, segs=24)
    add_box(bm13_tray, (0.0, 0.0, 1.06), 0.27, 0.21, 0.022)
    for sx in (-0.26, 0.26):
        add_box(bm13_tray, (sx, 0.0, 1.095), 0.018, 0.21, 0.025)
    for sy in (-0.20, 0.20):
        add_box(bm13_tray, (0.0, sy, 1.095), 0.27, 0.018, 0.025)
    create_mesh_obj("Relic_13_WoodTray", bm13_tray, m["wood_warm"], parent=r13, subsurf_levels=1)

    # 2 toasted bread slices (bronze_warm) propped up at a cute angle
    bm13_toast = bmesh.new()
    toast_c = Vector((-0.11, -0.02, 1.22))
    add_box(bm13_toast, toast_c + Vector((0.0, 0.035, 0.0)), 0.105, 0.022, 0.115, rot_euler=(-0.22, 0.0, 0.18))
    add_box(bm13_toast, toast_c + Vector((0.0, -0.035, -0.01)), 0.105, 0.022, 0.115, rot_euler=(-0.22, 0.0, 0.18))
    create_mesh_obj("Relic_13_KayaToast", bm13_toast, m["bronze_warm"], parent=r13, subsurf_levels=1)

    # Thick golden butter slab + 2 soft-boiled egg yolks + kaya jar lid
    add_box(bm13_gold, toast_c + Vector((0.0, 0.0, 0.02)), 0.075, 0.020, 0.065, rot_euler=(-0.22, 0.0, 0.18))
    # 2 golden egg yolks in the egg saucer
    for ex, ey in [(0.08, -0.09), (0.15, -0.04)]:
        add_ellipsoid(bm13_gold, (ex, ey, 1.16), 0.036, 0.036, 0.026)
    # Golden lid on the Kaya jam jar
    add_cyl(bm13_gold, (0.11, 0.09, 1.35), 0.068, 0.065, 0.040, segs=20)
    add_ellipsoid(bm13_gold, (0.11, 0.09, 1.385), 0.025, 0.025, 0.022)
    create_mesh_obj("Relic_13_ButterYolksLid", bm13_gold, m["gold_bright"], parent=r13, subsurf_levels=1)

    # Ivory-marble egg saucer + 2 cracked egg whites + jar label
    bm13_ivory = bmesh.new()
    add_cyl(bm13_ivory, (0.11, -0.065, 1.11), 0.11, 0.08, 0.045, segs=24)
    add_ellipsoid(bm13_ivory, (0.11, -0.065, 1.14), 0.088, 0.075, 0.018)
    add_cyl(bm13_ivory, (0.11, 0.09, 1.22), 0.078, 0.078, 0.08, segs=20)
    create_mesh_obj("Relic_13_EggDishAndLabel", bm13_ivory, m["ivory_marble"], parent=r13, subsurf_levels=1)

    # Cute chartreuse green Kaya jam jar + Kaya spread peeking between toast slices
    bm13_kaya = bmesh.new()
    add_cyl(bm13_kaya, (0.11, 0.09, 1.21), 0.074, 0.074, 0.22, segs=22)
    add_box(bm13_kaya, toast_c + Vector((0.0, 0.0, 0.0)), 0.092, 0.016, 0.095, rot_euler=(-0.22, 0.0, 0.18))
    create_mesh_obj("Relic_13_GreenKayaJar", bm13_kaya, m["chartreuse"], parent=r13, subsurf_levels=1)
    relic_roots.append(r13)

    # =========================================================================
    # 14: Chilli Crab in Golden Mantou Wok
    # =========================================================================
    r14 = create_root_empty("Relic_14")
    bm14_gold = bmesh.new()
    add_souvenir_plinth(bm14_gold, r=0.23, z=0.92, depth=0.04)

    # 3 golden fried Mantou buns nestled around the wok rim
    for ang_deg in (140, 180, 220):
        ang = math.radians(ang_deg)
        mx = math.cos(ang) * 0.15
        my = math.sin(ang) * 0.15
        add_ellipsoid(bm14_gold, (mx, my, 1.22), 0.065, 0.052, 0.046, rot_euler=(0.2, 0.0, ang + 1.57))
    create_mesh_obj("Relic_14_MantouAndPlinth", bm14_gold, m["gold_bright"], parent=r14, subsurf_levels=1)

    # Cute two-handled stone_dark round-bottomed wok
    bm14_wok = bmesh.new()
    wok_profile = [
        (0.11, 0.95),
        (0.22, 1.05),
        (0.27, 1.19),
        (0.24, 1.19),
        (0.16, 1.07),
    ]
    add_lathe(bm14_wok, wok_profile, segs=28)
    for sx in (-1, 1):
        add_torus(bm14_wok, (sx * 0.275, 0.0, 1.21), 0.042, 0.014, rot_euler=(0.0, 0.6 * sx, 0.0), maj_seg=18, min_seg=8)
    create_mesh_obj("Relic_14_DarkWok", bm14_wok, m["stone_dark"], parent=r14, subsurf_levels=1)

    # Glossy crimson_lacquer chilli gravy + cute chunky mud crab with big front claws & legs
    bm14_crab = bmesh.new()
    # Wok gravy pool
    add_ellipsoid(bm14_crab, (0.0, 0.0, 1.16), 0.235, 0.235, 0.035)
    # Chunky crab carapace shell
    crab_c = Vector((0.0, 0.04, 1.27))
    add_ellipsoid(bm14_crab, crab_c, 0.155, 0.115, 0.082, rot_euler=(-0.25, 0.0, 0.0))
    # Big front pincer claws raised proudly
    for sx in (-1, 1):
        arm_pts = [
            crab_c + Vector((sx * 0.12, -0.04, 0.0)),
            crab_c + Vector((sx * 0.19, -0.09, 0.06)),
            crab_c + Vector((sx * 0.15, -0.11, 0.13)),
        ]
        add_tube_along_points(bm14_crab, arm_pts, [0.028, 0.032, 0.040], segments=10)
        add_ellipsoid(bm14_crab, crab_c + Vector((sx * 0.14, -0.12, 0.15)), 0.055, 0.042, 0.072, rot_euler=(0.3, -sx * 0.4, 0.0))
        add_ellipsoid(bm14_crab, crab_c + Vector((sx * 0.10, -0.12, 0.16)), 0.028, 0.025, 0.052, rot_euler=(0.3, sx * 0.3, 0.0))
        # 3 side walking legs per side
        for l_idx in range(3):
            ly = -0.02 + l_idx * 0.045
            leg_pts = [
                crab_c + Vector((sx * 0.13, ly, -0.01)),
                crab_c + Vector((sx * 0.21, ly, 0.01)),
                crab_c + Vector((sx * 0.23, ly, -0.07)),
            ]
            add_tube_along_points(bm14_crab, leg_pts, [0.020, 0.018, 0.012], segments=8)
    create_mesh_obj("Relic_14_ChilliCrab", bm14_crab, m["crimson_lacquer"], parent=r14, subsurf_levels=1)

    # Cute chibi eye stalks
    bm14_eyes = bmesh.new()
    for sx in (-1, 1):
        add_ellipsoid(bm14_eyes, crab_c + Vector((sx * 0.055, -0.095, 0.075)), 0.026, 0.026, 0.026)
    create_mesh_obj("Relic_14_CrabEyes", bm14_eyes, m["ivory_marble"], parent=r14, subsurf_levels=1)
    relic_roots.append(r14)

    # =========================================================================
    # 15: Hainanese Chicken Rice Tiffin Carrier (Tingkat)
    # =========================================================================
    r15 = create_root_empty("Relic_15")
    bm15_gold = bmesh.new()
    add_souvenir_plinth(bm15_gold, r=0.22, z=0.92, depth=0.04)

    # Bottom tier: Jade-Teal enamel bowl
    bm15_teal = bmesh.new()
    add_cyl(bm15_teal, (0.0, 0.0, 1.03), 0.175, 0.175, 0.14, segs=28)
    create_mesh_obj("Relic_15_Tier1Teal", bm15_teal, m["jade_teal"], parent=r15, subsurf_levels=1)

    # Middle tier: Lotus-Pink enamel bowl
    bm15_pink = bmesh.new()
    add_cyl(bm15_pink, (0.0, 0.0, 1.18), 0.175, 0.175, 0.14, segs=28)
    create_mesh_obj("Relic_15_Tier2Pink", bm15_pink, m["lotus_pink"], parent=r15, subsurf_levels=1)

    # Top tier + domed lid: Ivory-Marble enamel bowl
    bm15_ivory = bmesh.new()
    add_cyl(bm15_ivory, (0.0, 0.0, 1.33), 0.175, 0.175, 0.14, segs=28)
    add_ellipsoid(bm15_ivory, (0.0, 0.0, 1.41), 0.180, 0.180, 0.055)
    create_mesh_obj("Relic_15_Tier3Ivory", bm15_ivory, m["ivory_marble"], parent=r15, subsurf_levels=1)

    # Crimson floral decals on all 3 tiers (front & back)
    bm15_floral = bmesh.new()
    for zt in (1.03, 1.18, 1.33):
        for sy in (-1, 1):
            add_ellipsoid(bm15_floral, (0.0, sy * 0.176, zt), 0.042, 0.012, 0.042)
    create_mesh_obj("Relic_15_TingkatFlorals", bm15_floral, m["crimson_lacquer"], parent=r15, subsurf_levels=1)

    # Golden tier rim rings, vertical clasp frame & top carrying handle arch
    for zr in (0.96, 1.105, 1.255, 1.40):
        add_torus(bm15_gold, (0.0, 0.0, zr), 0.178, 0.013, maj_seg=28, min_seg=8)
    for sx in (-1, 1):
        add_box(bm15_gold, (sx * 0.19, 0.0, 1.22), 0.015, 0.022, 0.25)
    handle_arch = [
        Vector((-0.19, 0.0, 1.46)),
        Vector((-0.15, 0.0, 1.54)),
        Vector((0.0, 0.0, 1.56)),
        Vector((0.15, 0.0, 1.54)),
        Vector((0.19, 0.0, 1.46)),
    ]
    add_tube_along_points(bm15_gold, handle_arch, [0.016, 0.018, 0.022, 0.018, 0.016], segments=10)
    add_ellipsoid(bm15_gold, (0.0, 0.0, 1.475), 0.032, 0.032, 0.026)
    create_mesh_obj("Relic_15_GoldClaspFrame", bm15_gold, m["gold_bright"], parent=r15, subsurf_levels=1)
    relic_roots.append(r15)

    # =========================================================================
    # 16: Pandan Chiffon Cake & Screwpine Leaf Box
    # =========================================================================
    r16 = create_root_empty("Relic_16")
    bm16_gold = bmesh.new()
    add_souvenir_plinth(bm16_gold, r=0.23, z=0.92, depth=0.04)
    add_torus(bm16_gold, (0.0, 0.0, 1.14), 0.255, 0.013, maj_seg=28, min_seg=8)
    create_mesh_obj("Relic_16_GoldRim", bm16_gold, m["gold_bright"], parent=r16, subsurf_levels=1)

    # Elevated ivory_marble pedestal cake stand + cream center dollop
    bm16_stand = bmesh.new()
    stand_profile = [
        (0.14, 0.95),
        (0.065, 1.03),
        (0.085, 1.11),
        (0.255, 1.13),
        (0.255, 1.155),
        (0.001, 1.155),
    ]
    add_lathe(bm16_stand, stand_profile, segs=28)
    add_ellipsoid(bm16_stand, (0.0, 0.0, 1.38), 0.065, 0.065, 0.035)
    create_mesh_obj("Relic_16_CakeStand", bm16_stand, m["ivory_marble"], parent=r16, subsurf_levels=1)

    # Fluffy ring-shaped chartreuse Pandan Chiffon tube cake with a slice wedge floating out
    bm16_cake = bmesh.new()
    # Main 300-degree C-ring tube cake
    n_arc = 22
    r_in, r_out = 0.062, 0.205
    z_bot, z_top = 1.155, 1.375
    arc_rings = []
    for i in range(n_arc + 1):
        ang = math.radians(32.0 + (296.0 * i) / n_arc)
        ca, sa = math.cos(ang), math.sin(ang)
        pts_sec = [
            Vector((ca * r_in, sa * r_in, z_bot)),
            Vector((ca * r_out, sa * r_out, z_bot)),
            Vector((ca * (r_out * 1.03), sa * (r_out * 1.03), 0.5 * (z_bot + z_top))),
            Vector((ca * (r_out * 0.95), sa * (r_out * 0.95), z_top)),
            Vector((ca * (r_in * 1.05), sa * (r_in * 1.05), z_top)),
            Vector((ca * r_in, sa * r_in, 0.5 * (z_bot + z_top))),
        ]
        arc_rings.append([bm16_cake.verts.new(p) for p in pts_sec])
    for i in range(n_arc):
        r0, r1 = arc_rings[i], arc_rings[i + 1]
        for j in range(6):
            jn = (j + 1) % 6
            bm16_cake.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
    bm16_cake.faces.new(list(reversed(arc_rings[0])))
    bm16_cake.faces.new(arc_rings[-1])

    # Floating cut slice wedge pulled slightly outward in front-right (+X)
    slice_offset = Vector((0.065, -0.025, 0.035))
    slice_rings = []
    for i in range(6):
        ang = math.radians(-22.0 + (44.0 * i) / 5.0)
        ca, sa = math.cos(ang), math.sin(ang)
        pts_sec = [
            slice_offset + Vector((ca * r_in, sa * r_in, z_bot)),
            slice_offset + Vector((ca * r_out, sa * r_out, z_bot)),
            slice_offset + Vector((ca * (r_out * 1.03), sa * (r_out * 1.03), 0.5 * (z_bot + z_top))),
            slice_offset + Vector((ca * (r_out * 0.95), sa * (r_out * 0.95), z_top)),
            slice_offset + Vector((ca * (r_in * 1.05), sa * (r_in * 1.05), z_top)),
            slice_offset + Vector((ca * r_in, sa * r_in, 0.5 * (z_bot + z_top))),
        ]
        slice_rings.append([bm16_cake.verts.new(p) for p in pts_sec])
    for i in range(5):
        r0, r1 = slice_rings[i], slice_rings[i + 1]
        for j in range(6):
            jn = (j + 1) % 6
            bm16_cake.faces.new((r0[j], r1[j], r1[jn], r0[jn]))
    bm16_cake.faces.new(list(reversed(slice_rings[0])))
    bm16_cake.faces.new(slice_rings[-1])
    bmesh.ops.recalc_face_normals(bm16_cake, faces=bm16_cake.faces)
    create_mesh_obj("Relic_16_PandanCake", bm16_cake, m["chartreuse"], parent=r16, subsurf_levels=1)

    # Screwpine (pandan) leaf garnish blades atop the cake
    bm16_leaves = bmesh.new()
    for ang_deg, tilt in [(15.0, 0.55), (135.0, 0.62), (245.0, 0.58)]:
        add_petal(
            bm16_leaves, Vector((0.0, 0.0, 1.38)),
            (tilt, math.radians(ang_deg), 0.0), length=0.20, width=0.055, thick=0.018, cup=0.02
        )
    create_mesh_obj("Relic_16_PandanLeaves", bm16_leaves, m["foliage_bright"], parent=r16, subsurf_levels=1)
    relic_roots.append(r16)

    # =========================================================================
    # 17: Singapore Sling Crystal Hurricane Glass
    # =========================================================================
    r17 = create_root_empty("Relic_17")
    bm17_gold = bmesh.new()
    add_souvenir_plinth(bm17_gold, r=0.21, z=0.92, depth=0.04)

    # Golden glass foot rim, lip rim, cocktail pick & pineapple wedge on the rim
    add_torus(bm17_gold, (0.0, 0.0, 0.96), 0.135, 0.012, maj_seg=24, min_seg=8)
    add_torus(bm17_gold, (0.0, 0.0, 1.44), 0.128, 0.012, maj_seg=24, min_seg=8)
    # Pineapple wedge perched on the right glass rim
    add_box(bm17_gold, (0.125, 0.0, 1.46), 0.068, 0.024, 0.048, rot_euler=(0.0, -0.45, 0.0))
    # Golden cocktail pick skewering the cherry
    add_tube_along_points(bm17_gold, [Vector((-0.02, 0.0, 1.38)), Vector((0.08, 0.0, 1.54))], [0.008, 0.010], segments=8)
    create_mesh_obj("Relic_17_GoldPineappleAndRim", bm17_gold, m["gold_bright"], parent=r17, subsurf_levels=1)

    # Curvy tulip hurricane glass stem & lower ruby-crimson Singapore Sling cocktail body
    bm17_crimson = bmesh.new()
    sling_lower = [
        (0.13, 0.96),
        (0.042, 1.00),
        (0.036, 1.06),
        (0.052, 1.11),
        (0.148, 1.19),
        (0.118, 1.29),
        (0.001, 1.29),
    ]
    add_lathe(bm17_crimson, sling_lower, segs=28)
    # Maraschino cherry on the pick
    add_ellipsoid(bm17_crimson, (0.045, 0.0, 1.48), 0.036, 0.036, 0.036)
    create_mesh_obj("Relic_17_SlingCrimson", bm17_crimson, m["crimson_lacquer"], parent=r17, subsurf_levels=1)

    # Upper lotus_pink frothy pineapple-grenadine head of the Singapore Sling
    bm17_pink = bmesh.new()
    sling_upper = [
        (0.118, 1.29),
        (0.105, 1.36),
        (0.128, 1.44),
        (0.115, 1.45),
        (0.001, 1.45),
    ]
    add_lathe(bm17_pink, sling_upper, segs=28)
    create_mesh_obj("Relic_17_SlingPinkFoam", bm17_pink, m["lotus_pink"], parent=r17, subsurf_levels=1)

    # Cyan-crystal bent cocktail straw & crystal stem ball
    bm17_crystal = bmesh.new()
    add_ellipsoid(bm17_crystal, (0.0, 0.0, 1.04), 0.052, 0.052, 0.038)
    straw_pts = [
        Vector((-0.04, -0.02, 1.38)),
        Vector((-0.09, -0.04, 1.50)),
        Vector((-0.15, -0.06, 1.54)),
    ]
    add_tube_along_points(bm17_crystal, straw_pts, [0.016, 0.016, 0.016], segments=10)
    create_mesh_obj("Relic_17_CrystalStraw", bm17_crystal, m["cyan_crystal"], parent=r17, subsurf_levels=1)
    relic_roots.append(r17)

    # =========================================================================
    # 18: 24K Gold-Foiled Bakkwa Gift Basket
    # =========================================================================
    r18 = create_root_empty("Relic_18")
    bm18_gold = bmesh.new()
    add_souvenir_plinth(bm18_gold, r=0.23, z=0.92, depth=0.04)

    # Festive crimson-lacquer woven gift basket + glossy red glazed Bakkwa slices
    bm18_crimson = bmesh.new()
    basket_profile = [
        (0.135, 0.95),
        (0.165, 1.05),
        (0.205, 1.18),
        (0.180, 1.19),
    ]
    add_lathe(bm18_crimson, basket_profile, segs=24)
    # Crimson-glazed Bakkwa square slices fanned inside basket
    for bx, by, bz, rz in [
        (-0.08, -0.02, 1.27, 0.25),
        (0.08, -0.02, 1.28, -0.25),
        (0.0, 0.04, 1.32, 0.05),
    ]:
        add_box(bm18_crimson, (bx, by, bz), 0.085, 0.018, 0.085, rot_euler=(-0.18, 0.0, rz))
    create_mesh_obj("Relic_18_CrimsonBasketAndSlices", bm18_crimson, m["crimson_lacquer"], parent=r18, subsurf_levels=1)

    # Tiger-mahogany smoky grilled Bakkwa slices layered with the crimson ones
    bm18_bakkwa = bmesh.new()
    for bx, by, bz, rz in [
        (-0.04, 0.01, 1.30, 0.12),
        (0.05, 0.01, 1.29, -0.15),
        (-0.11, 0.03, 1.23, 0.38),
        (0.11, 0.03, 1.23, -0.38),
    ]:
        add_box(bm18_bakkwa, (bx, by, bz), 0.088, 0.018, 0.088, rot_euler=(-0.12, 0.0, rz))
    create_mesh_obj("Relic_18_MahoganyBakkwa", bm18_bakkwa, m["tiger_mahogany"], parent=r18, subsurf_levels=1)

    # Golden woven basket ribs, overarching basket handle, 24K gold foil flecks & yuanbao ingots
    add_torus(bm18_gold, (0.0, 0.0, 1.07), 0.175, 0.014, maj_seg=24, min_seg=8)
    add_torus(bm18_gold, (0.0, 0.0, 1.18), 0.208, 0.018, maj_seg=24, min_seg=10)
    basket_arch = [
        Vector((-0.20, 0.0, 1.18)),
        Vector((-0.22, 0.0, 1.38)),
        Vector((0.0, 0.0, 1.53)),
        Vector((0.22, 0.0, 1.38)),
        Vector((0.20, 0.0, 1.18)),
    ]
    add_tube_along_points(bm18_gold, basket_arch, [0.020, 0.022, 0.025, 0.022, 0.020], segments=12)
    # Lucky Yuanbao gold ingots perched at the front & back of the basket rim
    for sy in (-0.13, 0.13):
        add_ellipsoid(bm18_gold, (0.0, sy, 1.22), 0.065, 0.038, 0.032)
        add_ellipsoid(bm18_gold, (0.0, sy, 1.245), 0.035, 0.025, 0.025)
    create_mesh_obj("Relic_18_GoldHandleAndIngots", bm18_gold, m["gold_bright"], parent=r18, subsurf_levels=1)
    relic_roots.append(r18)

    # =========================================================================
    # 19: Peranakan Nyonya Porcelain Kamcheng Jar
    # =========================================================================
    r19 = create_root_empty("Relic_19")
    bm19_gold = bmesh.new()
    add_souvenir_plinth(bm19_gold, r=0.23, z=0.92, depth=0.04)

    # Ornate Jade-Teal Straits Chinese porcelain jar body & domed lid
    bm19_teal = bmesh.new()
    jar_profile = [
        (0.13, 0.95),
        (0.115, 1.00),
        (0.205, 1.14),
        (0.215, 1.25),
        (0.155, 1.35),
        (0.165, 1.37),
    ]
    add_lathe(bm19_teal, jar_profile, segs=28)
    lid_profile = [
        (0.180, 1.36),
        (0.165, 1.42),
        (0.095, 1.47),
        (0.020, 1.48),
    ]
    add_lathe(bm19_teal, lid_profile, segs=28)
    create_mesh_obj("Relic_19_JadeKamcheng", bm19_teal, m["jade_teal"], parent=r19, subsurf_levels=1)

    # Lotus-pink Peranakan peony medallions & decorative collar band
    bm19_pink = bmesh.new()
    add_torus(bm19_pink, (0.0, 0.0, 1.32), 0.175, 0.018, maj_seg=28, min_seg=10)
    add_torus(bm19_pink, (0.0, 0.0, 1.03), 0.145, 0.016, maj_seg=24, min_seg=8)
    for i in range(4):
        ang = (2.0 * math.pi * i) / 4.0
        px = math.cos(ang) * 0.212
        py = math.sin(ang) * 0.212
        add_ellipsoid(bm19_pink, (px, py, 1.20), 0.068, 0.068, 0.065, rot_euler=(0.0, 0.0, ang))
    create_mesh_obj("Relic_19_PinkMedallions", bm19_pink, m["lotus_pink"], parent=r19, subsurf_levels=1)

    # Golden lion-dog (Foo Dog) finial on the domed lid + twin side ring handles + gold rims
    add_torus(bm19_gold, (0.0, 0.0, 1.365), 0.182, 0.014, maj_seg=28, min_seg=10)
    # Chibi Foo Dog finial sitting atop the lid
    add_ellipsoid(bm19_gold, (0.0, 0.01, 1.50), 0.045, 0.052, 0.048)
    add_ellipsoid(bm19_gold, (0.0, -0.015, 1.555), 0.042, 0.045, 0.040)
    # Twin side ring handles
    for sx in (-1, 1):
        add_ellipsoid(bm19_gold, (sx * 0.205, 0.0, 1.26), 0.028, 0.028, 0.028)
        add_torus(bm19_gold, (sx * 0.228, 0.0, 1.22), 0.042, 0.012, rot_euler=(0.0, math.pi * 0.5, 0.0), maj_seg=18, min_seg=8)
    create_mesh_obj("Relic_19_GoldFinialAndHandles", bm19_gold, m["gold_bright"], parent=r19, subsurf_levels=1)
    relic_roots.append(r19)

    # =========================================================================
    # 20: Hand-Beaded Nyonya Kasut Manek Slippers
    # =========================================================================
    r20 = create_root_empty("Relic_20")
    bm20_gold = bmesh.new()
    add_souvenir_plinth(bm20_gold, r=0.25, z=0.92, depth=0.04)

    # Plush velvet_emerald display cushion tilted toward the viewer
    bm20_cushion = bmesh.new()
    add_ellipsoid(bm20_cushion, (0.0, 0.0, 1.05), 0.24, 0.20, 0.095, rot_euler=(0.22, 0.0, 0.0))
    create_mesh_obj("Relic_20_VelvetCushion", bm20_cushion, m["velvet_emerald"], parent=r20, subsurf_levels=2)

    # Corner tassels & gold braid cord on cushion + beaded floral pattern on slippers
    add_torus(bm20_gold, (0.0, 0.0, 1.05), 0.235, 0.016, rot_euler=(0.22, 0.0, 0.0), maj_seg=28, min_seg=10)
    for sx in (-0.21, 0.21):
        for sy in (-0.15, 0.15):
            add_ellipsoid(bm20_gold, (sx, sy, 1.05 - sy * 0.2), 0.032, 0.032, 0.028)

    bm20_pink = bmesh.new()
    bm20_blue = bmesh.new()
    for sx, yaw in [(-0.105, 0.16), (0.105, -0.16)]:
        sc = Vector((sx, -0.01, 1.21))
        rot_s = (0.38, 0.0, yaw)
        # Sapphire-blue sole & chunky low Peranakan heel block
        add_box(bm20_blue, sc + Vector((0.0, 0.0, -0.02)), 0.062, 0.145, 0.018, rot_euler=rot_s)
        add_box(bm20_blue, sc + Vector((0.0, 0.085, -0.045)), 0.055, 0.048, 0.032, rot_euler=rot_s)
        # Lotus-pink upturned open-heel beaded vamp toe hood
        add_ellipsoid(bm20_pink, sc + Vector((0.0, -0.045, 0.035)), 0.066, 0.095, 0.052, rot_euler=rot_s)
        # Gold-beaded floral rosette cluster on each vamp
        vamp_top = sc + Vector((0.0, -0.055, 0.082))
        add_ellipsoid(bm20_gold, vamp_top, 0.022, 0.022, 0.016)
        for p in range(5):
            ang = (2.0 * math.pi * p) / 5.0
            add_ellipsoid(
                bm20_gold,
                vamp_top + Vector((math.cos(ang) * 0.028, math.sin(ang) * 0.028, -0.004)),
                0.014, 0.014, 0.012
            )
    create_mesh_obj("Relic_20_SapphireSoles", bm20_blue, m["sapphire_blue"], parent=r20, subsurf_levels=1)
    create_mesh_obj("Relic_20_PinkVamps", bm20_pink, m["lotus_pink"], parent=r20, subsurf_levels=2)
    create_mesh_obj("Relic_20_GoldBeadwork", bm20_gold, m["gold_bright"], parent=r20, subsurf_levels=1)
    relic_roots.append(r20)

    # =========================================================================
    # 21: 9-Layer Rainbow Kueh Lapis Sagu Plate
    # =========================================================================
    r21 = create_root_empty("Relic_21")
    bm21_gold = bmesh.new()
    add_souvenir_plinth(bm21_gold, r=0.24, z=0.92, depth=0.04)
    add_cyl(bm21_gold, (0.0, 0.0, 0.99), 0.12, 0.16, 0.09, segs=24)
    add_torus(bm21_gold, (0.0, 0.0, 1.05), 0.25, 0.014, maj_seg=28, min_seg=8)
    create_mesh_obj("Relic_21_GoldPlateStand", bm21_gold, m["gold_bright"], parent=r21, subsurf_levels=1)

    # Cute foliage_bright banana leaf platter atop the plate stand
    bm21_leaf = bmesh.new()
    add_ellipsoid(bm21_leaf, (0.0, 0.0, 1.065), 0.26, 0.22, 0.025)
    create_mesh_obj("Relic_21_BananaLeaf", bm21_leaf, m["foliage_bright"], parent=r21, subsurf_levels=1)

    # 9-Layer Rainbow Kueh Lapis Sagu diamond block (crimson, ivory, chartreuse, pink layers)
    bm21_crimson = bmesh.new()
    bm21_ivory = bmesh.new()
    bm21_green = bmesh.new()
    bm21_pink = bmesh.new()
    layer_bms = [
        bm21_crimson, bm21_ivory, bm21_pink,
        bm21_ivory, bm21_green, bm21_ivory,
        bm21_pink, bm21_ivory, bm21_crimson,
    ]
    kueh_center = Vector((-0.05, 0.02, 1.095))
    for idx, l_bm in enumerate(layer_bms):
        lz = kueh_center.z + idx * 0.032
        add_box(l_bm, (kueh_center.x, kueh_center.y, lz), 0.095, 0.085, 0.0155, rot_euler=(0.0, 0.0, 0.55))

    # 2 cute crimson_lacquer tortoise-shell Ang Ku Kueh beside the Kueh Lapis
    for ak_x, ak_y, ak_rot in [(0.12, -0.07, -0.35), (0.11, 0.09, 0.45)]:
        add_ellipsoid(bm21_crimson, (ak_x, ak_y, 1.13), 0.075, 0.058, 0.045, rot_euler=(0.0, 0.0, ak_rot))
        add_torus(bm21_crimson, (ak_x, ak_y, 1.135), 0.042, 0.012, rot_euler=(0.0, 0.0, ak_rot), maj_seg=16, min_seg=8)

    create_mesh_obj("Relic_21_CrimsonLayersAndAngKu", bm21_crimson, m["crimson_lacquer"], parent=r21, subsurf_levels=1)
    create_mesh_obj("Relic_21_IvoryLayers", bm21_ivory, m["ivory_marble"], parent=r21, subsurf_levels=1)
    create_mesh_obj("Relic_21_GreenLayer", bm21_green, m["chartreuse"], parent=r21, subsurf_levels=1)
    create_mesh_obj("Relic_21_PinkLayers", bm21_pink, m["lotus_pink"], parent=r21, subsurf_levels=1)
    relic_roots.append(r21)

    # =========================================================================
    # 22: Pastel Joo Chiat Peranakan Shophouse Model
    # =========================================================================
    r22 = create_root_empty("Relic_22")
    bm22_gold = bmesh.new()
    add_souvenir_plinth(bm22_gold, r=0.25, z=0.92, depth=0.04)

    # Cute miniature 2-storey lotus_pink heritage shophouse body
    bm22_pink = bmesh.new()
    add_box(bm22_pink, (0.0, 0.0, 1.21), 0.21, 0.13, 0.24)
    # Ornate arched upper gable parapet
    add_ellipsoid(bm22_pink, (0.0, 0.0, 1.46), 0.15, 0.12, 0.07)
    create_mesh_obj("Relic_22_PinkFacade", bm22_pink, m["lotus_pink"], parent=r22, subsurf_levels=1)

    # Jade-teal arched upper shutter windows (on BOTH front & back facades) + dado tiles
    bm22_teal = bmesh.new()
    for sy in (-0.132, 0.132):
        for wx in (-0.10, 0.0, 0.10):
            add_box(bm22_teal, (wx, sy, 1.29), 0.036, 0.015, 0.068)
            add_ellipsoid(bm22_teal, (wx, sy, 1.355), 0.036, 0.016, 0.032)
        for dx in (-0.13, 0.13):
            add_box(bm22_teal, (dx, sy, 1.05), 0.042, 0.015, 0.055)
    create_mesh_obj("Relic_22_JadeShutters", bm22_teal, m["jade_teal"], parent=r22, subsurf_levels=1)

    # Gold relief pilasters, cornice mouldings & heritage plaque (front & back)
    for sy in (-0.135, 0.135):
        for px in (-0.19, -0.052, 0.052, 0.19):
            add_box(bm22_gold, (px, sy, 1.21), 0.015, 0.016, 0.23)
        add_box(bm22_gold, (0.0, sy, 1.175), 0.225, 0.022, 0.016)
        add_box(bm22_gold, (0.0, sy, 1.425), 0.225, 0.022, 0.016)
        add_ellipsoid(bm22_gold, (0.0, sy, 1.465), 0.055, 0.018, 0.032)
    create_mesh_obj("Relic_22_GoldPilasters", bm22_gold, m["gold_bright"], parent=r22, subsurf_levels=1)

    # Terracotta pitched Chinese-tile roof &five-foot-way awning eaves
    bm22_roof = bmesh.new()
    add_box(bm22_roof, (0.0, -0.07, 1.48), 0.235, 0.095, 0.028, rot_euler=(0.38, 0.0, 0.0))
    add_box(bm22_roof, (0.0, 0.07, 1.48), 0.235, 0.095, 0.028, rot_euler=(-0.38, 0.0, 0.0))
    for ridge_x in range(-4, 5):
        add_cyl(bm22_roof, (ridge_x * 0.05, 0.0, 1.515), 0.018, 0.018, 0.03, rot_euler=(0.0, math.pi * 0.5, 0.0), segs=12)
    create_mesh_obj("Relic_22_TerracottaRoof", bm22_roof, m["terracotta"], parent=r22, subsurf_levels=1)

    # Swinging wood_warm Pintu Pagar half-doors on ground floor
    bm22_wood = bmesh.new()
    for sy in (-0.135, 0.135):
        for sx in (-1, 1):
            add_box(bm22_wood, (sx * 0.032, sy, 1.065), 0.030, 0.018, 0.068, rot_euler=(0.0, 0.0, sx * 0.28))
    create_mesh_obj("Relic_22_PintuPagar", bm22_wood, m["wood_warm"], parent=r22, subsurf_levels=1)
    relic_roots.append(r22)

    return relic_roots
