"""
Bespoke 3D Keepsake Models for All 42 Singapore Botanic Gardens (UNESCO World Heritage)
Collectible Relics (`SBG_Relic_01` through `SBG_Relic_42`), matching 1-to-1 with
`SBG_TREASURES_CATALOG` in `src/data/maps/sbg/SBGTreasuresCatalog.js`.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler


def build_sbg_42_relics(mats, create_root_empty, create_mesh_obj, add_beveled_box,
                        add_beveled_cyl, add_polyline_tube, add_icosphere_puff):
    relic_roots = []

    def add_torus(bm, loc, major_r, minor_r, rot_euler=(0.0, 0.0, 0.0), maj_seg=24, min_seg=10):
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

    def add_orchid_petal(bm, origin, rot_euler, length=0.28, width=0.12, thick=0.026):
        bm_p = bmesh.new()
        bmesh.ops.create_uvsphere(bm_p, u_segments=10, v_segments=8, radius=1.0)
        for v in bm_p.verts:
            u = (v.co.z + 1.0) * 0.5
            v.co.x *= width * (0.4 + 0.8 * math.sin(u * math.pi))
            v.co.y = v.co.y * thick + math.sin(u * math.pi) * 0.035 * (v.co.x ** 2) - 0.018 * (u ** 2)
            v.co.z = u * length
        rot_m = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
        bmesh.ops.transform(bm_p, matrix=Matrix.Translation(origin) @ rot_m, verts=bm_p.verts)
        vmap = {v: bm.verts.new(v.co) for v in bm_p.verts}
        for f in bm_p.faces:
            try:
                bm.faces.new([vmap[v] for v in f.verts])
            except ValueError:
                pass
        bm_p.free()

    def make_relic_root(idx, alias_name=None):
        name = f"SBG_Relic_{idx:02d}"
        root = create_root_empty(name)
        relic_roots.append(root)
        target_parent = root
        if alias_name:
            alias_empty = bpy.data.objects.new(alias_name, None)
            alias_empty.empty_display_type = 'PLAIN_AXES'
            alias_empty.location = (0.0, 0.0, 0.0)
            bpy.context.collection.objects.link(alias_empty)
            alias_empty.parent = root
            alias_empty.matrix_parent_inverse = Matrix.Identity(4)
            target_parent = alias_empty
        return root, target_parent

    def add_museum_plinth(bm_gold, bm_stone=None, r=0.23, z=0.92):
        add_beveled_cyl(bm_gold, (0, 0, z), r * 1.05, r * 0.96, 0.045, segs=24)
        add_torus(bm_gold, (0, 0, z + 0.022), r * 0.96, 0.015, maj_seg=24, min_seg=8)
        if bm_stone is not None:
            add_beveled_cyl(bm_stone, (0, 0, z + 0.045), r * 0.88, r * 0.82, 0.045, segs=20)

    # =========================================================================
    # 01: Vanda Miss Joaquim 1893 Hybrid Gold Brooch (Alias: SBG_Relic_Orchid)
    # =========================================================================
    _, p01 = make_relic_root(1, "SBG_Relic_Orchid")
    bm01_gold, bm01_velvet, bm01_mag = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm01_gold, bm01_velvet)
    add_icosphere_puff(bm01_velvet, (0, 0.04, 1.24), 0.22, scale_xyz=(1.0, 0.32, 1.12), rot_euler=(0.2, 0, 0))
    add_torus(bm01_gold, (0, 0.04, 1.24), 0.23, 0.018, rot_euler=(0.2, 0, 0))
    oc = Vector((0, -0.03, 1.26))
    for ang, ln, w, tx in [(0.0, 0.28, 0.12, 0.18), (1.15, 0.26, 0.13, 0.25), (-1.15, 0.26, 0.13, 0.25),
                           (2.35, 0.24, 0.11, -0.12), (-2.35, 0.24, 0.11, -0.12)]:
        add_orchid_petal(bm01_gold, oc, (tx, ang, 0.0), length=ln, width=w)
    add_icosphere_puff(bm01_mag, (0, -0.10, 1.19), 0.09, scale_xyz=(1.1, 0.9, 1.25))
    create_mesh_obj("SBG_Relic_01_Gold", bm01_gold, mats["gold_bright"], p01)
    create_mesh_obj("SBG_Relic_01_Velvet", bm01_velvet, mats["velvet_emerald"], p01)
    create_mesh_obj("SBG_Relic_01_Labellum", bm01_mag, mats["orchid_magenta"], p01)

    # =========================================================================
    # 02: The 1930 Octagonal Bandstand Gazebo Bell (Alias: SBG_Relic_Bandstand)
    # =========================================================================
    _, p02 = make_relic_root(2, "SBG_Relic_Bandstand")
    bm02_gold, bm02_white, bm02_roof = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm02_gold, bm02_white)
    for i in range(8):
        ang = i * math.pi / 4.0 + math.pi / 8.0
        add_beveled_cyl(bm02_white, (math.cos(ang) * 0.15, math.sin(ang) * 0.15, 1.12), 0.02, 0.018, 0.28, segs=8)
    add_beveled_cyl(bm02_roof, (0, 0, 1.34), 0.22, 0.08, 0.16, segs=8)
    add_beveled_cyl(bm02_roof, (0, 0, 1.48), 0.10, 0.02, 0.12, segs=8)
    add_beveled_cyl(bm02_gold, (0, 0, 1.60), 0.02, 0.006, 0.14, segs=8)
    add_icosphere_puff(bm02_gold, (0, 0, 1.15), 0.065)
    create_mesh_obj("SBG_Relic_02_Gold", bm02_gold, mats["gold_bright"], p02)
    create_mesh_obj("SBG_Relic_02_White", bm02_white, mats["ivory_marble"], p02)
    create_mesh_obj("SBG_Relic_02_Roof", bm02_roof, mats["zen_stone"], p02)

    # =========================================================================
    # 03: Sembcorp Cool House High-Mountain Orchid Globe
    # =========================================================================
    _, p03 = make_relic_root(3)
    bm03_gold, bm03_cyan, bm03_mag = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm03_gold)
    add_beveled_cyl(bm03_gold, (0, 0, 1.00), 0.18, 0.16, 0.10, segs=20)
    add_icosphere_puff(bm03_cyan, (0, 0, 1.26), 0.22, scale_xyz=(1.05, 0.95, 1.08), subdivisions=2)
    add_torus(bm03_gold, (0, 0, 1.26), 0.23, 0.014, rot_euler=(0.45, 0.2, 0))
    add_icosphere_puff(bm03_mag, (0, 0, 1.26), 0.09, scale_xyz=(0.9, 0.9, 1.3))
    create_mesh_obj("SBG_Relic_03_Gold", bm03_gold, mats["gold_bright"], p03)
    create_mesh_obj("SBG_Relic_03_Globe", bm03_cyan, mats["cyan_crystal"], p03)
    create_mesh_obj("SBG_Relic_03_Orchid", bm03_mag, mats["orchid_magenta"], p03)

    # =========================================================================
    # 04: Burkill Hall 1868 Anglo-Malayan Plantation Model
    # =========================================================================
    _, p04 = make_relic_root(4)
    bm04_gold, bm04_white, bm04_roof = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm04_gold)
    add_beveled_box(bm04_white, (0, 0, 1.08), 0.19, 0.14, 0.10)
    add_beveled_box(bm04_gold, (0, 0, 1.24), 0.21, 0.15, 0.07)
    add_beveled_cyl(bm04_roof, (0, 0, 1.39), 0.27, 0.08, 0.16, segs=4, rot_euler=(0, 0, math.pi / 4.0))
    add_beveled_box(bm04_white, (0, 0.16, 1.08), 0.08, 0.06, 0.09)
    create_mesh_obj("SBG_Relic_04_Gold", bm04_gold, mats["bronze_warm"], p04)
    create_mesh_obj("SBG_Relic_04_Walls", bm04_white, mats["ivory_marble"], p04)
    create_mesh_obj("SBG_Relic_04_Roof", bm04_roof, mats["terracotta"], p04)

    # =========================================================================
    # 05: Golden Shower Arches (Oncidium Goldiana) Doll
    # =========================================================================
    _, p05 = make_relic_root(5)
    bm05_gold, bm05_green, bm05_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm05_gold)
    arch_pts = [(-0.18 + (k / 12.0) * 0.36, 0.0, 0.96 + math.sin((k / 12.0) * math.pi) * 0.48) for k in range(13)]
    add_polyline_tube(bm05_green, arch_pts, 0.022, segments=8)
    for k in range(2, 11, 2):
        add_icosphere_puff(bm05_gold, arch_pts[k], 0.055, scale_xyz=(1.1, 0.8, 1.3))
    # Dancing-lady orchid figurine in center
    add_beveled_cyl(bm05_gold, (0, 0, 1.12), 0.13, 0.04, 0.22, segs=14)
    add_icosphere_puff(bm05_ivory, (0, 0, 1.30), 0.065)
    create_mesh_obj("SBG_Relic_05_GoldOrchids", bm05_gold, mats["gold_bright"], p05)
    create_mesh_obj("SBG_Relic_05_ArchVine", bm05_green, mats["velvet_emerald"], p05)
    create_mesh_obj("SBG_Relic_05_DollHead", bm05_ivory, mats["ivory_marble"], p05)

    # =========================================================================
    # 06: Swan Lake "Flight of Swans" Bronze Plaque (Alias: SBG_Relic_Swan)
    # =========================================================================
    _, p06 = make_relic_root(6, "SBG_Relic_Swan")
    bm06_bronze, bm06_cyan, bm06_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm06_bronze, bm06_cyan)
    for ox, oy, oz, sc in [(0.0, 0.0, 1.18, 1.0), (-0.11, 0.06, 1.32, 0.82), (0.11, -0.05, 1.42, 0.85)]:
        add_icosphere_puff(bm06_ivory, (ox, oy, oz), 0.08 * sc, scale_xyz=(1.4, 0.75, 0.85))
        add_polyline_tube(bm06_ivory, [(ox + 0.06 * sc, oy, oz + 0.02), (ox + 0.11 * sc, oy, oz + 0.14 * sc)], [0.022, 0.015], segments=6)
        for s in (-1.0, 1.0):
            add_beveled_box(bm06_bronze, (ox, oy + s * 0.09 * sc, oz + 0.05 * sc), 0.07 * sc, 0.09 * sc, 0.015, rot_euler=(s * 0.55, 0, 0))
    create_mesh_obj("SBG_Relic_06_Bronze", bm06_bronze, mats["bronze_warm"], p06)
    create_mesh_obj("SBG_Relic_06_Wave", bm06_cyan, mats["cyan_crystal"], p06)
    create_mesh_obj("SBG_Relic_06_Swans", bm06_ivory, mats["ivory_marble"], p06)

    # =========================================================================
    # 07: Five-Dollar Note Heritage Tembusu Tree Capsule (Alias: SBG_Relic_Tembusu)
    # =========================================================================
    _, p07 = make_relic_root(7, "SBG_Relic_Tembusu")
    bm07_gold, bm07_bark, bm07_lush = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm07_gold)
    # Miniature Tembusu trunk + famous horizontal swooping branch + prop post
    add_polyline_tube(bm07_bark, [(-0.04, 0, 0.96), (-0.03, 0, 1.22), (-0.02, 0, 1.42)], [0.065, 0.048, 0.035], segments=10)
    add_polyline_tube(bm07_bark, [(-0.03, 0, 1.12), (0.08, 0, 1.06), (0.19, 0, 1.10)], [0.035, 0.028, 0.022], segments=8)
    add_beveled_cyl(bm07_gold, (0.14, 0, 1.01), 0.016, 0.014, 0.12, segs=8)
    for cx, cy, cz, r in [(-0.02, 0, 1.48, 0.14), (-0.12, 0.05, 1.38, 0.10), (0.18, 0, 1.18, 0.09)]:
        add_icosphere_puff(bm07_lush, (cx, cy, cz), r, scale_xyz=(1.2, 1.0, 0.72))
    add_torus(bm07_gold, (0, 0, 1.26), 0.25, 0.016, rot_euler=(math.pi / 2.0, 0, 0))
    create_mesh_obj("SBG_Relic_07_GoldNoteRing", bm07_gold, mats["gold_bright"], p07)
    create_mesh_obj("SBG_Relic_07_TembusuBark", bm07_bark, mats["tiger_mahogany"], p07)
    create_mesh_obj("SBG_Relic_07_Canopy", bm07_lush, mats["chartreuse"], p07)

    # =========================================================================
    # 08: 1859 Agri-Horticultural Society Brass Music Box
    # =========================================================================
    _, p08 = make_relic_root(8)
    bm08_gold, bm08_wood = bmesh.new(), bmesh.new()
    add_museum_plinth(bm08_gold)
    add_beveled_box(bm08_wood, (0, 0, 1.08), 0.18, 0.13, 0.10)
    add_beveled_box(bm08_wood, (0, -0.11, 1.26), 0.18, 0.02, 0.11, rot_euler=(-0.55, 0, 0))
    add_beveled_cyl(bm08_gold, (-0.04, 0, 1.20), 0.045, 0.045, 0.16, segs=14, rot_euler=(0, math.pi / 2.0, 0))
    add_torus(bm08_gold, (0.21, 0, 1.08), 0.045, 0.012, rot_euler=(math.pi / 2.0, 0, 0))
    create_mesh_obj("SBG_Relic_08_BrassMechanism", bm08_gold, mats["gold_bright"], p08)
    create_mesh_obj("SBG_Relic_08_MahoganyBox", bm08_wood, mats["tiger_mahogany"], p08)

    # =========================================================================
    # 09: Giant Tiger Orchid (Grammatophyllum) Blossom
    # =========================================================================
    _, p09 = make_relic_root(9)
    bm09_gold, bm09_green, bm09_maroon = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm09_gold)
    for sx in (-0.08, 0.0, 0.08):
        add_icosphere_puff(bm09_green, (sx, 0, 1.08), 0.06, scale_xyz=(0.7, 0.7, 1.8))
    for side in (-1.0, 0.0, 1.0):
        pts = [(0, 0, 1.12), (side * 0.12, 0.04, 1.32), (side * 0.20, 0.08, 1.52)]
        add_polyline_tube(bm09_green, pts, [0.02, 0.016, 0.012], segments=8)
        add_icosphere_puff(bm09_gold, pts[1], 0.055, scale_xyz=(1.2, 0.8, 1.1))
        add_icosphere_puff(bm09_maroon, pts[2], 0.052, scale_xyz=(1.2, 0.8, 1.1))
    create_mesh_obj("SBG_Relic_09_TigerGold", bm09_gold, mats["gold_bright"], p09)
    create_mesh_obj("SBG_Relic_09_Pseudobulbs", bm09_green, mats["velvet_emerald"], p09)
    create_mesh_obj("SBG_Relic_09_MaroonSpots", bm09_maroon, mats["crimson_lacquer"], p09)

    # =========================================================================
    # 10: "Mad Ridley" Henry Nicholas Ridley Pith Helmet
    # =========================================================================
    _, p10 = make_relic_root(10)
    bm10_gold, bm10_ivory, bm10_brown = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm10_gold)
    add_beveled_cyl(bm10_ivory, (0, 0, 1.12), 0.24, 0.21, 0.045, segs=24)
    add_icosphere_puff(bm10_ivory, (0, 0, 1.22), 0.17, scale_xyz=(1.02, 1.14, 0.95), subdivisions=2)
    add_beveled_cyl(bm10_gold, (0, 0, 1.39), 0.04, 0.02, 0.05, segs=12)
    for sx in (-0.11, 0.0, 0.11):
        add_icosphere_puff(bm10_brown, (sx, 0.15, 1.02), 0.042, scale_xyz=(1.1, 0.85, 0.9))
    create_mesh_obj("SBG_Relic_10_Gold", bm10_gold, mats["gold_bright"], p10)
    create_mesh_obj("SBG_Relic_10_PithHelmet", bm10_ivory, mats["ivory_marble"], p10)
    create_mesh_obj("SBG_Relic_10_RubberSeeds", bm10_brown, mats["tiger_mahogany"], p10)

    # =========================================================================
    # 11: 1890 Herringbone Latex Tapping Porcelain Cup (Alias: SBG_Relic_RubberCup)
    # =========================================================================
    _, p11 = make_relic_root(11, "SBG_Relic_RubberCup")
    bm11_gold, bm11_bark, bm11_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm11_gold)
    add_beveled_cyl(bm11_bark, (0, -0.05, 1.24), 0.13, 0.12, 0.52, segs=16)
    for z_cut in (1.22, 1.32, 1.42):
        add_beveled_box(bm11_ivory, (0, 0.07, z_cut), 0.09, 0.015, 0.02, rot_euler=(0, 0.45, 0))
    add_beveled_cyl(bm11_ivory, (0, 0.10, 1.09), 0.085, 0.105, 0.15, segs=18)
    create_mesh_obj("SBG_Relic_11_Gold", bm11_gold, mats["gold_bright"], p11)
    create_mesh_obj("SBG_Relic_11_RubberBark", bm11_bark, mats["tiger_mahogany"], p11)
    create_mesh_obj("SBG_Relic_11_LatexCup", bm11_ivory, mats["ivory_marble"], p11)

    # =========================================================================
    # 12: Corner’s Botanical Monkey-Training Brass Pot
    # =========================================================================
    _, p12 = make_relic_root(12)
    bm12_gold, bm12_green = bmesh.new(), bmesh.new()
    add_museum_plinth(bm12_gold)
    add_beveled_cyl(bm12_gold, (0, 0, 1.18), 0.13, 0.10, 0.34, segs=18)
    add_icosphere_puff(bm12_gold, (0, 0, 1.38), 0.09, scale_xyz=(1.0, 1.0, 0.6))
    add_polyline_tube(bm12_gold, [(0.09, 0, 1.12), (0.21, 0, 1.28), (0.24, 0, 1.38)], [0.028, 0.020, 0.014], segments=8)
    add_torus(bm12_gold, (-0.13, 0, 1.20), 0.065, 0.016, rot_euler=(math.pi / 2.0, 0, 0))
    add_icosphere_puff(bm12_green, (0.08, 0, 1.44), 0.065, scale_xyz=(1.4, 0.6, 0.8))
    create_mesh_obj("SBG_Relic_12_BrassPot", bm12_gold, mats["gold_bright"], p12)
    create_mesh_obj("SBG_Relic_12_CanopyLeaf", bm12_green, mats["velvet_emerald"], p12)

    # =========================================================================
    # 13: Tanglin Heritage Kaya & Pandan Veranda Set
    # =========================================================================
    _, p13 = make_relic_root(13)
    bm13_gold, bm13_green, bm13_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm13_gold)
    add_beveled_cyl(bm13_green, (-0.08, 0, 1.10), 0.075, 0.075, 0.18, segs=16)
    add_beveled_cyl(bm13_gold, (-0.08, 0, 1.21), 0.08, 0.08, 0.04, segs=16)
    add_beveled_box(bm13_gold, (0.09, -0.02, 1.06), 0.09, 0.07, 0.04, rot_euler=(0, 0, 0.25))
    add_icosphere_puff(bm13_ivory, (0.06, 0.08, 1.06), 0.055, scale_xyz=(0.85, 0.85, 1.15))
    create_mesh_obj("SBG_Relic_13_GoldToast", bm13_gold, mats["gold_bright"], p13)
    create_mesh_obj("SBG_Relic_13_PandanKaya", bm13_green, mats["chartreuse"], p13)
    create_mesh_obj("SBG_Relic_13_SoftEgg", bm13_ivory, mats["ivory_marble"], p13)

    # =========================================================================
    # 14: The Halia Torch-Ginger & Chili Crab Cauldron
    # =========================================================================
    _, p14 = make_relic_root(14)
    bm14_gold, bm14_red, bm14_dark = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm14_gold)
    add_beveled_cyl(bm14_dark, (0, 0, 1.10), 0.14, 0.20, 0.18, segs=20)
    add_icosphere_puff(bm14_red, (0, 0, 1.22), 0.12, scale_xyz=(1.2, 1.0, 0.75))
    add_beveled_cyl(bm14_red, (-0.08, 0.04, 1.36), 0.055, 0.015, 0.22, segs=10, rot_euler=(0, -0.25, 0))
    add_icosphere_puff(bm14_gold, (0.10, -0.04, 1.28), 0.065, scale_xyz=(1.1, 0.9, 0.8))
    create_mesh_obj("SBG_Relic_14_GoldMantou", bm14_gold, mats["gold_bright"], p14)
    create_mesh_obj("SBG_Relic_14_TorchGingerCrab", bm14_red, mats["crimson_lacquer"], p14)
    create_mesh_obj("SBG_Relic_14_Cauldron", bm14_dark, mats["zen_stone"], p14)

    # =========================================================================
    # 15: Plantation Director’s Enamel Tingkat Tiffin
    # =========================================================================
    _, p15 = make_relic_root(15)
    bm15_gold, bm15_green, bm15_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm15_gold)
    for idx_t, zt in enumerate((1.05, 1.19, 1.33)):
        target = bm15_green if idx_t % 2 == 0 else bm15_ivory
        add_beveled_cyl(target, (0, 0, zt), 0.14, 0.14, 0.12, segs=20)
        add_torus(bm15_gold, (0, 0, zt + 0.06), 0.142, 0.012)
    for sx in (-0.155, 0.155):
        add_beveled_box(bm15_gold, (sx, 0, 1.22), 0.014, 0.02, 0.24)
    add_beveled_box(bm15_gold, (0, 0, 1.48), 0.15, 0.025, 0.02)
    create_mesh_obj("SBG_Relic_15_BrassFrame", bm15_gold, mats["gold_bright"], p15)
    create_mesh_obj("SBG_Relic_15_EnamelGreen", bm15_green, mats["velvet_emerald"], p15)
    create_mesh_obj("SBG_Relic_15_EnamelCream", bm15_ivory, mats["ivory_marble"], p15)

    # =========================================================================
    # 16: Holttum Hall 1921 Orchid-Breeding Laboratory Box
    # =========================================================================
    _, p16 = make_relic_root(16)
    bm16_gold, bm16_cyan, bm16_green = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm16_gold)
    # Conical Erlenmeyer agar flask with glowing orchid sprout inside
    add_beveled_cyl(bm16_cyan, (0, 0, 1.14), 0.17, 0.065, 0.28, segs=20)
    add_beveled_cyl(bm16_cyan, (0, 0, 1.34), 0.065, 0.072, 0.12, segs=16)
    add_beveled_cyl(bm16_gold, (0, 0, 1.42), 0.058, 0.065, 0.06, segs=14)
    add_icosphere_puff(bm16_green, (0, 0, 1.12), 0.09, scale_xyz=(1.1, 1.1, 0.7))
    create_mesh_obj("SBG_Relic_16_GoldStopper", bm16_gold, mats["gold_bright"], p16)
    create_mesh_obj("SBG_Relic_16_LabFlask", bm16_cyan, mats["cyan_crystal"], p16)
    create_mesh_obj("SBG_Relic_16_OrchidSprout", bm16_green, mats["chartreuse"], p16)

    # =========================================================================
    # 17: Nutmeg & Clove 1822 Raffles Spice Goblet
    # =========================================================================
    _, p17 = make_relic_root(17)
    bm17_gold, bm17_red, bm17_brown = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm17_gold)
    add_beveled_cyl(bm17_gold, (0, 0, 1.08), 0.04, 0.035, 0.22, segs=14)
    add_beveled_cyl(bm17_gold, (0, 0, 1.28), 0.05, 0.16, 0.22, segs=20)
    add_icosphere_puff(bm17_brown, (0, 0, 1.40), 0.095, scale_xyz=(1.0, 0.9, 1.15))
    add_torus(bm17_red, (0, 0, 1.40), 0.098, 0.018, rot_euler=(0.4, 0.3, 0))
    create_mesh_obj("SBG_Relic_17_GoldGoblet", bm17_gold, mats["gold_bright"], p17)
    create_mesh_obj("SBG_Relic_17_ScarletMace", bm17_red, mats["crimson_lacquer"], p17)
    create_mesh_obj("SBG_Relic_17_NutmegSeed", bm17_brown, mats["tiger_mahogany"], p17)

    # =========================================================================
    # 18: Evolution Garden Cycad & Tree-Fern Amber Chest
    # =========================================================================
    _, p18 = make_relic_root(18)
    bm18_gold, bm18_green, bm18_stone = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm18_gold, bm18_stone)
    add_beveled_box(bm18_stone, (0, 0, 1.08), 0.17, 0.12, 0.10)
    # Coiled prehistoric fern fiddlehead & golden cycad cone
    add_beveled_cyl(bm18_gold, (-0.06, 0, 1.28), 0.075, 0.025, 0.24, segs=12)
    add_torus(bm18_green, (0.08, 0, 1.30), 0.085, 0.028, rot_euler=(math.pi / 2.0, 0, 0))
    create_mesh_obj("SBG_Relic_18_AmberCycad", bm18_gold, mats["gold_bright"], p18)
    create_mesh_obj("SBG_Relic_18_FernCrosier", bm18_green, mats["chartreuse"], p18)
    create_mesh_obj("SBG_Relic_18_StoneChest", bm18_stone, mats["zen_stone"], p18)

    # =========================================================================
    # 19: Tan Hoon Siang Mist House Porcelain Orchid Urn (Alias: SBG_Relic_OrchidUrn)
    # =========================================================================
    _, p19 = make_relic_root(19, "SBG_Relic_OrchidUrn")
    bm19_gold, bm19_ivory, bm19_mag = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm19_gold)
    add_icosphere_puff(bm19_ivory, (0, 0, 1.16), 0.15, scale_xyz=(1.0, 1.0, 1.35), subdivisions=2)
    add_beveled_cyl(bm19_gold, (0, 0, 1.34), 0.07, 0.095, 0.08, segs=18)
    # Lady's-slipper orchid pouch & dorsal petal atop urn
    add_icosphere_puff(bm19_mag, (0, 0.04, 1.46), 0.075, scale_xyz=(0.9, 1.1, 1.3))
    add_orchid_petal(bm19_ivory, Vector((0, -0.02, 1.46)), (0.2, 0, 0), length=0.18, width=0.10)
    create_mesh_obj("SBG_Relic_19_Gold", bm19_gold, mats["gold_bright"], p19)
    create_mesh_obj("SBG_Relic_19_PorcelainUrn", bm19_ivory, mats["ivory_marble"], p19)
    create_mesh_obj("SBG_Relic_19_SlipperOrchid", bm19_mag, mats["orchid_magenta"], p19)

    # =========================================================================
    # 20: Lady Yuen-Peng McNeice Bromeliad Slippers
    # =========================================================================
    _, p20 = make_relic_root(20)
    bm20_gold, bm20_red, bm20_green = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm20_gold)
    for sx, yaw in [(-0.09, 0.15), (0.09, -0.15)]:
        add_icosphere_puff(bm20_gold, (sx, 0, 1.04), 0.08, scale_xyz=(0.75, 1.65, 0.45), rot_euler=(0.12, 0, yaw))
        for k in range(6):
            ang = k * math.pi / 3.0
            add_orchid_petal(bm20_red if k % 2 == 0 else bm20_green,
                             Vector((sx, 0.03, 1.08)), (0.45, ang, 0), length=0.16, width=0.06)
    create_mesh_obj("SBG_Relic_20_GoldSlippers", bm20_gold, mats["gold_bright"], p20)
    create_mesh_obj("SBG_Relic_20_BromeliadRed", bm20_red, mats["crimson_lacquer"], p20)
    create_mesh_obj("SBG_Relic_20_BromeliadGreen", bm20_green, mats["chartreuse"], p20)

    # =========================================================================
    # 21: 750,000-Sheet Singapore Herbarium Specimen Press (Alias: SBG_Relic_Herbarium)
    # =========================================================================
    _, p21 = make_relic_root(21, "SBG_Relic_Herbarium")
    bm21_gold, bm21_wood, bm21_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm21_gold)
    add_beveled_box(bm21_wood, (0, 0, 1.02), 0.19, 0.15, 0.025)
    add_beveled_box(bm21_ivory, (0, 0, 1.12), 0.17, 0.13, 0.075)
    add_beveled_box(bm21_wood, (0, 0, 1.22), 0.19, 0.15, 0.025)
    for sx in (-0.17, 0.17):
        for sy in (-0.13, 0.13):
            add_beveled_cyl(bm21_gold, (sx, sy, 1.14), 0.016, 0.016, 0.28, segs=10)
    add_orchid_petal(bm21_gold, Vector((0, 0, 1.25)), (math.pi / 2.0, 0, 0.4), length=0.22, width=0.09)
    create_mesh_obj("SBG_Relic_21_BrassBolts", bm21_gold, mats["gold_bright"], p21)
    create_mesh_obj("SBG_Relic_21_TeakPress", bm21_wood, mats["tiger_mahogany"], p21)
    create_mesh_obj("SBG_Relic_21_HerbariumSheets", bm21_ivory, mats["ivory_marble"], p21)

    # =========================================================================
    # 22: Atbara 1898 Black-and-White House Miniature
    # =========================================================================
    _, p22 = make_relic_root(22)
    bm22_gold, bm22_white, bm22_dark, bm22_roof = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm22_gold)
    add_beveled_box(bm22_white, (0, 0, 1.12), 0.19, 0.15, 0.14)
    for z_b in (1.02, 1.14, 1.25):
        add_beveled_box(bm22_dark, (0, 0, z_b), 0.20, 0.16, 0.015)
    for sx in (-0.18, 0.0, 0.18):
        add_beveled_box(bm22_dark, (sx, 0.155, 1.12), 0.016, 0.016, 0.14)
    add_beveled_cyl(bm22_roof, (0, 0, 1.38), 0.26, 0.07, 0.16, segs=4, rot_euler=(0, 0, math.pi / 4.0))
    create_mesh_obj("SBG_Relic_22_Gold", bm22_gold, mats["gold_bright"], p22)
    create_mesh_obj("SBG_Relic_22_WhiteWalls", bm22_white, mats["ivory_marble"], p22)
    create_mesh_obj("SBG_Relic_22_BlackTimber", bm22_dark, mats["zen_stone"], p22)
    create_mesh_obj("SBG_Relic_22_Roof", bm22_roof, mats["terracotta"], p22)

    # =========================================================================
    # 23: VIP Celebrity & Royal Orchid Naming Lantern
    # =========================================================================
    _, p23 = make_relic_root(23)
    bm23_gold, bm23_purple = bmesh.new(), bmesh.new()
    add_museum_plinth(bm23_gold)
    add_beveled_cyl(bm23_purple, (0, 0, 1.22), 0.15, 0.16, 0.28, segs=6)
    add_beveled_cyl(bm23_gold, (0, 0, 1.42), 0.21, 0.06, 0.14, segs=6)
    for i in range(6):
        ang = i * math.pi / 3.0
        add_beveled_cyl(bm23_gold, (math.cos(ang) * 0.16, math.sin(ang) * 0.16, 1.22), 0.015, 0.015, 0.30, segs=8)
    add_icosphere_puff(bm23_gold, (0, 0, 1.54), 0.055)
    create_mesh_obj("SBG_Relic_23_GoldFrame", bm23_gold, mats["gold_bright"], p23)
    create_mesh_obj("SBG_Relic_23_RoyalCore", bm23_purple, mats["amethyst_purple"], p23)

    # =========================================================================
    # 24: 1929 Victorian Sundial Garden Brass Gnomon (Alias: SBG_Relic_Sundial)
    # =========================================================================
    _, p24 = make_relic_root(24, "SBG_Relic_Sundial")
    bm24_gold, bm24_stone, bm24_cyan = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm24_gold, bm24_stone)
    add_beveled_cyl(bm24_stone, (0, 0, 1.12), 0.09, 0.07, 0.22, segs=14)
    add_beveled_cyl(bm24_gold, (0, 0, 1.25), 0.17, 0.16, 0.035, segs=24)
    add_beveled_box(bm24_gold, (0, -0.02, 1.38), 0.018, 0.12, 0.11, rot_euler=(-0.42, 0, 0))
    for sx in (-0.12, 0.12):
        for sy in (-0.12, 0.12):
            add_beveled_box(bm24_cyan, (sx, sy, 0.98), 0.045, 0.045, 0.018)
    create_mesh_obj("SBG_Relic_24_BrassGnomon", bm24_gold, mats["gold_bright"], p24)
    create_mesh_obj("SBG_Relic_24_Pedestal", bm24_stone, mats["ivory_marble"], p24)
    create_mesh_obj("SBG_Relic_24_LilyPonds", bm24_cyan, mats["cyan_crystal"], p24)

    # =========================================================================
    # 25: Crane Fountain & Waterbird Brass Lamp
    # =========================================================================
    _, p25 = make_relic_root(25)
    bm25_gold, bm25_cyan = bmesh.new(), bmesh.new()
    add_museum_plinth(bm25_gold)
    add_beveled_cyl(bm25_cyan, (0, 0, 1.00), 0.18, 0.16, 0.06, segs=20)
    add_polyline_tube(bm25_gold, [(0, 0, 1.02), (0, 0, 1.24), (0.04, 0, 1.42), (0.12, 0, 1.48)], [0.02, 0.055, 0.022, 0.012], segments=8)
    for s in (-1.0, 1.0):
        add_beveled_box(bm25_gold, (0, s * 0.11, 1.30), 0.08, 0.11, 0.016, rot_euler=(s * 0.45, 0, 0))
    create_mesh_obj("SBG_Relic_25_BrassCrane", bm25_gold, mats["gold_bright"], p25)
    create_mesh_obj("SBG_Relic_25_FountainPool", bm25_cyan, mats["cyan_crystal"], p25)

    # =========================================================================
    # 26: Flying Fox & Javan Myna Botanical Weather Vane
    # =========================================================================
    _, p26 = make_relic_root(26)
    bm26_gold, bm26_dark = bmesh.new(), bmesh.new()
    add_museum_plinth(bm26_gold)
    add_beveled_cyl(bm26_gold, (0, 0, 1.22), 0.022, 0.018, 0.48, segs=12)
    add_beveled_box(bm26_gold, (0, 0, 1.18), 0.18, 0.018, 0.018)
    add_beveled_box(bm26_gold, (0, 0, 1.18), 0.018, 0.18, 0.018)
    add_icosphere_puff(bm26_dark, (0, 0, 1.46), 0.065, scale_xyz=(1.2, 0.8, 0.9))
    for s in (-1.0, 1.0):
        add_beveled_box(bm26_dark, (0, s * 0.14, 1.48), 0.07, 0.12, 0.015, rot_euler=(s * 0.35, 0, 0))
    create_mesh_obj("SBG_Relic_26_CompassVane", bm26_gold, mats["gold_bright"], p26)
    create_mesh_obj("SBG_Relic_26_FlyingFox", bm26_dark, mats["tiger_mahogany"], p26)

    # =========================================================================
    # 27: Swan Lake Victorian Gazebo & Terrapin Bell
    # =========================================================================
    _, p27 = make_relic_root(27)
    bm27_gold, bm27_green = bmesh.new(), bmesh.new()
    add_museum_plinth(bm27_gold)
    add_beveled_cyl(bm27_gold, (0, 0, 1.18), 0.18, 0.07, 0.26, segs=20)
    add_torus(bm27_gold, (0, 0, 1.38), 0.055, 0.016, rot_euler=(math.pi / 2.0, 0, 0))
    for sx in (-0.15, 0.15):
        add_icosphere_puff(bm27_green, (sx, 0.06, 1.00), 0.055, scale_xyz=(1.2, 0.95, 0.55))
    create_mesh_obj("SBG_Relic_27_GazeboBell", bm27_gold, mats["gold_bright"], p27)
    create_mesh_obj("SBG_Relic_27_Terrapins", bm27_green, mats["velvet_emerald"], p27)

    # =========================================================================
    # 28: Tanglin Gate Cast-Iron Silver Leaf Medallion (Alias: SBG_Relic_SilverGate)
    # =========================================================================
    _, p28 = make_relic_root(28, "SBG_Relic_SilverGate")
    bm28_silver, bm28_gold = bmesh.new(), bmesh.new()
    add_museum_plinth(bm28_gold)
    add_torus(bm28_silver, (0, 0, 1.28), 0.20, 0.024, rot_euler=(math.pi / 2.0, 0, 0))
    for ang_d in (-45, 0, 45):
        add_orchid_petal(bm28_silver, Vector((0, 0, 1.12)), (0.15, math.radians(ang_d), 0), length=0.26, width=0.085)
    create_mesh_obj("SBG_Relic_28_SilverFoliage", bm28_silver, mats["silver_plat"], p28)
    create_mesh_obj("SBG_Relic_28_GoldPlinth", bm28_gold, mats["gold_bright"], p28)

    # =========================================================================
    # 29: Dawn Tai Chi Fan & Morning Jogger Towel
    # =========================================================================
    _, p29 = make_relic_root(29)
    bm29_gold, bm29_red, bm29_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm29_gold)
    for i in range(9):
        ang = math.radians(-56 + i * 14)
        add_beveled_box(bm29_red, (math.sin(ang) * 0.14, 0, 1.12 + math.cos(ang) * 0.14),
                        0.032, 0.012, 0.16, rot_euler=(0, ang, 0))
    add_beveled_cyl(bm29_ivory, (0, 0.10, 1.00), 0.042, 0.042, 0.24, segs=14, rot_euler=(0, math.pi / 2.0, 0))
    create_mesh_obj("SBG_Relic_29_Gold", bm29_gold, mats["gold_bright"], p29)
    create_mesh_obj("SBG_Relic_29_TaiChiFan", bm29_red, mats["crimson_lacquer"], p29)
    create_mesh_obj("SBG_Relic_29_Towel", bm29_ivory, mats["ivory_marble"], p29)

    # =========================================================================
    # 30: Tanglin Gate Uncle’s Ice Cream Cart & Bell
    # =========================================================================
    _, p30 = make_relic_root(30)
    bm30_gold, bm30_blue, bm30_red = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm30_gold)
    add_beveled_box(bm30_blue, (0, 0, 1.10), 0.16, 0.11, 0.09)
    for sx in (-0.12, 0.12):
        add_torus(bm30_gold, (sx, 0.12, 1.01), 0.055, 0.014, rot_euler=(math.pi / 2.0, 0, 0))
    add_beveled_cyl(bm30_gold, (0, 0, 1.30), 0.014, 0.014, 0.26, segs=8)
    add_beveled_cyl(bm30_red, (0, 0, 1.44), 0.22, 0.02, 0.10, segs=12)
    create_mesh_obj("SBG_Relic_30_GoldWheels", bm30_gold, mats["gold_bright"], p30)
    create_mesh_obj("SBG_Relic_30_BlueCart", bm30_blue, mats["sapphire_blue"], p30)
    create_mesh_obj("SBG_Relic_30_Umbrella", bm30_red, mats["crimson_lacquer"], p30)

    # =========================================================================
    # 31: 1900s Cluny Road Rickshaw & Brass Horn
    # =========================================================================
    _, p31 = make_relic_root(31)
    bm31_gold, bm31_red, bm31_dark = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm31_gold)
    for sy in (-0.13, 0.13):
        add_torus(bm31_gold, (0, sy, 1.12), 0.13, 0.016, rot_euler=(0, math.pi / 2.0, 0))
    add_beveled_box(bm31_red, (-0.02, 0, 1.16), 0.10, 0.11, 0.08)
    add_beveled_cyl(bm31_dark, (-0.06, 0, 1.30), 0.12, 0.12, 0.22, segs=12, rot_euler=(math.pi / 2.0, 0, 0))
    create_mesh_obj("SBG_Relic_31_BrassWheels", bm31_gold, mats["gold_bright"], p31)
    create_mesh_obj("SBG_Relic_31_Seat", bm31_red, mats["crimson_lacquer"], p31)
    create_mesh_obj("SBG_Relic_31_CanopyHood", bm31_dark, mats["tiger_mahogany"], p31)

    # =========================================================================
    # 32: 1967 "Orchid Series" Currency Coin & Note Bank
    # =========================================================================
    _, p32 = make_relic_root(32)
    bm32_gold, bm32_mag = bmesh.new(), bmesh.new()
    add_museum_plinth(bm32_gold)
    add_beveled_cyl(bm32_gold, (0, 0, 1.24), 0.20, 0.20, 0.06, segs=28, rot_euler=(math.pi / 2.0, 0, 0))
    add_orchid_petal(bm32_mag, Vector((0, 0.04, 1.22)), (0.1, 0, 0), length=0.18, width=0.09)
    create_mesh_obj("SBG_Relic_32_GoldCoinBank", bm32_gold, mats["gold_bright"], p32)
    create_mesh_obj("SBG_Relic_32_OrchidEmblem", bm32_mag, mats["orchid_magenta"], p32)

    # =========================================================================
    # 33: Red Saga Seeds (Adenanthera pavonina) Glass Jar
    # =========================================================================
    _, p33 = make_relic_root(33)
    bm33_gold, bm33_cyan, bm33_red = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm33_gold)
    add_beveled_cyl(bm33_cyan, (0, 0, 1.18), 0.14, 0.14, 0.30, segs=20)
    add_beveled_cyl(bm33_gold, (0, 0, 1.37), 0.09, 0.10, 0.07, segs=16)
    for idx_s in range(10):
        ang = idx_s * 1.9
        add_icosphere_puff(bm33_red, (math.cos(ang) * 0.06, math.sin(ang) * 0.06, 1.06 + idx_s * 0.022), 0.038)
    create_mesh_obj("SBG_Relic_33_CorkGold", bm33_gold, mats["gold_bright"], p33)
    create_mesh_obj("SBG_Relic_33_GlassJar", bm33_cyan, mats["cyan_crystal"], p33)
    create_mesh_obj("SBG_Relic_33_SagaSeeds", bm33_red, mats["crimson_lacquer"], p33)

    # =========================================================================
    # 34: Cast-Iron Binomial Plant Taxonomy Signpost
    # =========================================================================
    _, p34 = make_relic_root(34)
    bm34_gold, bm34_green, bm34_silver = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm34_gold)
    add_beveled_cyl(bm34_silver, (0, 0, 1.14), 0.026, 0.022, 0.32, segs=12)
    add_beveled_box(bm34_green, (0, 0, 1.34), 0.21, 0.03, 0.13, rot_euler=(-0.25, 0, 0))
    add_beveled_box(bm34_silver, (0, 0.02, 1.34), 0.18, 0.02, 0.10, rot_euler=(-0.25, 0, 0))
    create_mesh_obj("SBG_Relic_34_GoldPlinth", bm34_gold, mats["gold_bright"], p34)
    create_mesh_obj("SBG_Relic_34_GreenPlaque", bm34_green, mats["velvet_emerald"], p34)
    create_mesh_obj("SBG_Relic_34_SilverFrame", bm34_silver, mats["silver_plat"], p34)

    # =========================================================================
    # 35: Shaw Foundation Symphony Stage Acoustic Shell (Alias: SBG_Relic_SymphonyStage)
    # =========================================================================
    _, p35 = make_relic_root(35, "SBG_Relic_SymphonyStage")
    bm35_gold, bm35_white = bmesh.new(), bmesh.new()
    add_museum_plinth(bm35_gold)
    for idx_r, rad in enumerate((0.22, 0.17, 0.12)):
        pts = [(math.cos(k / 12.0 * math.pi) * rad, -idx_r * 0.04, 1.00 + math.sin(k / 12.0 * math.pi) * rad * 1.1) for k in range(13)]
        add_polyline_tube(bm35_white, pts, 0.032, segments=10)
    add_beveled_cyl(bm35_gold, (0, 0.08, 1.18), 0.012, 0.006, 0.28, segs=8, rot_euler=(0, 0.55, 0))
    create_mesh_obj("SBG_Relic_35_GoldBaton", bm35_gold, mats["gold_bright"], p35)
    create_mesh_obj("SBG_Relic_35_AcousticShell", bm35_white, mats["ivory_marble"], p35)

    # =========================================================================
    # 36: Double Coconut (Lodoicea maldivica) Palm Crown
    # =========================================================================
    _, p36 = make_relic_root(36)
    bm36_gold, bm36_brown, bm36_green = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm36_gold)
    for sx in (-0.065, 0.065):
        add_icosphere_puff(bm36_brown, (sx, 0, 1.18), 0.12, scale_xyz=(0.82, 0.95, 1.25), subdivisions=2)
    add_torus(bm36_gold, (0, 0, 1.36), 0.09, 0.018)
    for ang_d in (-50, -25, 0, 25, 50):
        add_orchid_petal(bm36_green, Vector((0, -0.08, 1.15)), (0.15, math.radians(ang_d), 0), length=0.32, width=0.07)
    create_mesh_obj("SBG_Relic_36_GoldCrown", bm36_gold, mats["gold_bright"], p36)
    create_mesh_obj("SBG_Relic_36_CocoDeMer", bm36_brown, mats["tiger_mahogany"], p36)
    create_mesh_obj("SBG_Relic_36_PalmHalo", bm36_green, mats["velvet_emerald"], p36)

    # =========================================================================
    # 37: Frederic Chopin 2008 Bronze Monument Music Box (Alias: SBG_Relic_Chopin)
    # =========================================================================
    _, p37 = make_relic_root(37, "SBG_Relic_Chopin")
    bm37_gold, bm37_bronze, bm37_ivory = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm37_gold)
    add_beveled_box(bm37_bronze, (0, 0, 1.14), 0.18, 0.15, 0.05)
    add_beveled_box(bm37_ivory, (0, 0.14, 1.15), 0.15, 0.04, 0.02)
    add_beveled_box(bm37_bronze, (0, -0.02, 1.28), 0.17, 0.14, 0.015, rot_euler=(0.55, 0, 0))
    add_torus(bm37_gold, (0, 0.02, 1.32), 0.08, 0.015, rot_euler=(math.pi / 2.0, 0, 0))
    create_mesh_obj("SBG_Relic_37_GoldLyre", bm37_gold, mats["gold_bright"], p37)
    create_mesh_obj("SBG_Relic_37_BronzePiano", bm37_bronze, mats["bronze_warm"], p37)
    create_mesh_obj("SBG_Relic_37_Keys", bm37_ivory, mats["ivory_marble"], p37)

    # =========================================================================
    # 38: Japanese Bonsai & Penjing Ancient Wrightia Tree (Alias: SBG_Relic_Bonsai)
    # =========================================================================
    _, p38 = make_relic_root(38, "SBG_Relic_Bonsai")
    bm38_gold, bm38_pot, bm38_bark, bm38_leaf = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm38_gold)
    add_beveled_cyl(bm38_pot, (0, 0, 1.02), 0.16, 0.19, 0.09, segs=16)
    add_polyline_tube(bm38_bark, [(0, 0, 1.05), (-0.06, 0, 1.18), (0.05, 0, 1.30), (-0.02, 0, 1.42)], [0.042, 0.032, 0.024, 0.016], segments=8)
    for cx, cy, cz, r in [(-0.08, 0, 1.24, 0.09), (0.08, 0, 1.34, 0.10), (-0.02, 0, 1.45, 0.11)]:
        add_icosphere_puff(bm38_leaf, (cx, cy, cz), r, scale_xyz=(1.35, 1.0, 0.45))
    create_mesh_obj("SBG_Relic_38_Gold", bm38_gold, mats["gold_bright"], p38)
    create_mesh_obj("SBG_Relic_38_BonsaiPot", bm38_pot, mats["terracotta"], p38)
    create_mesh_obj("SBG_Relic_38_GnarledTrunk", bm38_bark, mats["tiger_mahogany"], p38)
    create_mesh_obj("SBG_Relic_38_FoliagePads", bm38_leaf, mats["velvet_emerald"], p38)

    # =========================================================================
    # 39: Jacob Ballas Children’s Garden Treehouse Totem
    # =========================================================================
    _, p39 = make_relic_root(39)
    bm39_gold, bm39_wood, bm39_green = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm39_gold)
    add_beveled_cyl(bm39_wood, (-0.04, 0, 1.12), 0.06, 0.05, 0.24, segs=10)
    add_beveled_cyl(bm39_wood, (-0.04, 0, 1.28), 0.12, 0.12, 0.14, segs=12)
    add_beveled_cyl(bm39_green, (-0.04, 0, 1.42), 0.17, 0.02, 0.14, segs=12)
    slide_pts = [(-0.04 + math.cos(k / 10.0 * math.pi * 1.3) * 0.15, math.sin(k / 10.0 * math.pi * 1.3) * 0.15, 1.26 - (k / 10.0) * 0.24) for k in range(11)]
    add_polyline_tube(bm39_gold, slide_pts, 0.032, segments=8)
    create_mesh_obj("SBG_Relic_39_SpiralSlide", bm39_gold, mats["gold_bright"], p39)
    create_mesh_obj("SBG_Relic_39_Treehouse", bm39_wood, mats["tiger_mahogany"], p39)
    create_mesh_obj("SBG_Relic_39_CanopyRoof", bm39_green, mats["chartreuse"], p39)

    # =========================================================================
    # 40: Eco-Lake Black Swan & Oriental Pied Hornbill Duo
    # =========================================================================
    _, p40 = make_relic_root(40)
    bm40_gold, bm40_dark, bm40_red = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm40_gold)
    # Black Swan (-X) + Oriental Pied Hornbill (+X)
    add_icosphere_puff(bm40_dark, (-0.08, 0, 1.10), 0.085, scale_xyz=(1.3, 0.85, 0.8))
    add_polyline_tube(bm40_dark, [(-0.04, 0, 1.14), (-0.02, 0, 1.32), (0.03, 0, 1.36)], [0.024, 0.018, 0.014], segments=8)
    add_icosphere_puff(bm40_red, (0.05, 0, 1.35), 0.025, scale_xyz=(1.5, 0.7, 0.7))
    add_icosphere_puff(bm40_dark, (0.11, 0, 1.20), 0.065, scale_xyz=(0.85, 0.85, 1.35))
    add_icosphere_puff(bm40_gold, (0.16, 0, 1.30), 0.048, scale_xyz=(1.6, 0.65, 0.85))
    create_mesh_obj("SBG_Relic_40_GoldCasque", bm40_gold, mats["gold_bright"], p40)
    create_mesh_obj("SBG_Relic_40_BlackSwan", bm40_dark, mats["zen_stone"], p40)
    create_mesh_obj("SBG_Relic_40_CrimsonBill", bm40_red, mats["crimson_lacquer"], p40)

    # =========================================================================
    # 41: Ginger Waterfall Cave & Halia Stone Arch
    # =========================================================================
    _, p41 = make_relic_root(41)
    bm41_gold, bm41_stone, bm41_cyan = bmesh.new(), bmesh.new(), bmesh.new()
    add_museum_plinth(bm41_gold)
    add_torus(bm41_stone, (0, -0.02, 1.18), 0.17, 0.052, rot_euler=(math.pi / 2.0, 0, 0))
    add_beveled_cyl(bm41_cyan, (0, 0.02, 1.16), 0.10, 0.12, 0.28, segs=14)
    add_icosphere_puff(bm41_gold, (0, 0.04, 1.18), 0.055, subdivisions=2)
    create_mesh_obj("SBG_Relic_41_GoldPearl", bm41_gold, mats["gold_bright"], p41)
    create_mesh_obj("SBG_Relic_41_StoneGrotto", bm41_stone, mats["zen_stone"], p41)
    create_mesh_obj("SBG_Relic_41_Waterfall", bm41_cyan, mats["cyan_crystal"], p41)

    # =========================================================================
    # 42: UNESCO World Heritage 2015 Golden Inscription Key (Alias: SBG_Relic_UNESCOKey)
    # =========================================================================
    _, p42 = make_relic_root(42, "SBG_Relic_UNESCOKey")
    bm42_gold, bm42_red = bmesh.new(), bmesh.new()
    add_museum_plinth(bm42_gold, bm42_red)
    # Monumental 24K Golden Key standing proudly on crimson-lacquer UNESCO cushion
    add_beveled_cyl(bm42_gold, (0, 0, 1.20), 0.024, 0.022, 0.34, segs=12)
    add_torus(bm42_gold, (0, 0, 1.42), 0.095, 0.022, rot_euler=(math.pi / 2.0, 0, 0))
    add_orchid_petal(bm42_gold, Vector((0, 0, 1.36)), (0.1, 0, 0), length=0.14, width=0.07)
    add_beveled_box(bm42_gold, (0.055, 0, 1.09), 0.045, 0.015, 0.045)
    create_mesh_obj("SBG_Relic_42_UNESCOGoldKey", bm42_gold, mats["gold_bright"], p42)
    create_mesh_obj("SBG_Relic_42_CrimsonPlaque", bm42_red, mats["crimson_lacquer"], p42)

    return relic_roots
