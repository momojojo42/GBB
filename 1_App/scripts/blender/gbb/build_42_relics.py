"""
Bespoke 3D Models for All 42 Collectible Singapore Tourism & Souvenir Relics
(`Relic_01` through `Relic_42`), corresponding 1-to-1 with `TREASURES_CATALOG`
in `src/world/TerrainAndTreasuresBuilder.js`.
"""

import bpy
import bmesh
import math
from mathutils import Vector, Matrix, Euler

from relics_part1 import build_relics_01_to_22
from relics_part2 import build_relics_23_to_42


def build_42_distinct_relics(mats, make_mat, create_root_empty, create_mesh_obj, add_tube_along_points):
    # Extra bespoke materials for the 42 distinct Singapore Tourism & Souvenir relics
    m = dict(mats)
    m["gold_bright"] = make_mat("Mat_RelicGoldBright", "#FACC15", roughness=0.18, metallic=0.90,
                                emission_hex="#F59E0B", emission_strength=0.35)
    m["bronze_warm"] = make_mat("Mat_RelicBronzeWarm", "#B45309", roughness=0.28, metallic=0.82,
                                emission_hex="#D97706", emission_strength=0.15)
    m["silver_plat"] = make_mat("Mat_RelicSilverPlat", "#E2E8F0", roughness=0.16, metallic=0.92,
                                emission_hex="#94A3B8", emission_strength=0.20)
    m["copper_rose"] = make_mat("Mat_RelicCopperRose", "#EA580C", roughness=0.24, metallic=0.85,
                                emission_hex="#FB923C", emission_strength=0.22)
    m["ivory_marble"] = make_mat("Mat_RelicIvoryMarble", "#FFFBEB", roughness=0.22, metallic=0.05,
                                 emission_hex="#FEF3C7", emission_strength=0.25)
    m["cyan_crystal"] = make_mat("Mat_RelicCyanCrystal", "#22D3EE", roughness=0.12, metallic=0.15,
                                 emission_hex="#06B6D4", emission_strength=1.65)
    m["sapphire_blue"] = make_mat("Mat_RelicSapphireBlue", "#2563EB", roughness=0.18, metallic=0.35,
                                  emission_hex="#3B82F6", emission_strength=0.85)
    m["amethyst_purple"] = make_mat("Mat_RelicAmethyst", "#9333EA", roughness=0.16, metallic=0.25,
                                    emission_hex="#A855F7", emission_strength=1.10)
    m["crimson_lacquer"] = make_mat("Mat_RelicCrimsonLacquer", "#DC2626", roughness=0.20, metallic=0.15,
                                    emission_hex="#EF4444", emission_strength=0.40)
    m["terracotta"] = make_mat("Mat_RelicTerracotta", "#C2410C", roughness=0.52, metallic=0.05)
    m["zen_stone"] = make_mat("Mat_RelicZenStone", "#64748B", roughness=0.58, metallic=0.08)
    m["lotus_pink"] = make_mat("Mat_RelicLotusPink", "#F472B6", roughness=0.24, metallic=0.05,
                               emission_hex="#F9A8D4", emission_strength=0.45)
    m["velvet_emerald"] = make_mat("Mat_RelicVelvetEmerald", "#065F46", roughness=0.38, metallic=0.08,
                                   emission_hex="#10B981", emission_strength=0.25)
    m["tiger_mahogany"] = make_mat("Mat_RelicTigerMahogany", "#7C2D12", roughness=0.30, metallic=0.10,
                                   emission_hex="#EA580C", emission_strength=0.25)
    m["neon_magenta"] = make_mat("Mat_RelicNeonMagenta", "#E879F9", roughness=0.15, metallic=0.15,
                                 emission_hex="#D946EF", emission_strength=1.80)
    m["chartreuse"] = make_mat("Mat_RelicChartreuse", "#84CC16", roughness=0.26, metallic=0.08,
                               emission_hex="#A3E635", emission_strength=0.40)
    m["durian_husk"] = make_mat("Mat_RelicDurianHusk", "#65A30D", roughness=0.42, metallic=0.12,
                                emission_hex="#84CC16", emission_strength=0.20)
    m["cacao_brown"] = make_mat("Mat_RelicCacaoBrown", "#78350F", roughness=0.40, metallic=0.10)

    # Ensure convenience aliases used by part1/part2 exist
    m.setdefault("jade_teal", m.get("jade_glow", m["velvet_emerald"]))
    m.setdefault("lantern_red", m["crimson_lacquer"])
    m.setdefault("wood_warm", m.get("bark_warm", m["tiger_mahogany"]))
    m.setdefault("stone_light", m.get("plinth_cream", m["ivory_marble"]))
    m.setdefault("stone_dark", m.get("bark_dark", m["zen_stone"]))

    def add_petal(bm, origin, rot_euler, length=0.34, width=0.14, thick=0.028, cup=0.04):
        bm_p = bmesh.new()
        bmesh.ops.create_uvsphere(bm_p, u_segments=12, v_segments=8, radius=1.0)
        for v in bm_p.verts:
            u = (v.co.z + 1.0) * 0.5
            v.co.x *= width * (0.4 + 0.8 * math.sin(u * math.pi))
            v.co.y = v.co.y * thick + math.sin(u * math.pi) * cup * (v.co.x ** 2) - 0.02 * (u ** 2)
            v.co.z = u * length
        rot_m = Euler(rot_euler, 'XYZ').to_matrix().to_4x4()
        bmesh.ops.transform(bm_p, matrix=Matrix.Translation(origin) @ rot_m, verts=bm_p.verts)
        vert_map = {v: bm.verts.new(v.co) for v in bm_p.verts}
        for f in bm_p.faces:
            try:
                bm.faces.new([vert_map[v] for v in f.verts])
            except ValueError:
                pass
        bm_p.free()

    relic_roots = []
    relic_roots.extend(
        build_relics_01_to_22(m, create_root_empty, create_mesh_obj, add_tube_along_points, add_petal)
    )
    relic_roots.extend(
        build_relics_23_to_42(m, create_root_empty, create_mesh_obj, add_tube_along_points, add_petal)
    )
    return relic_roots
