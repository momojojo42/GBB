#!/usr/bin/env python3
"""
Stage 1C: Independent Cartographic Cross-Checker & Overlay Engineer
Loads:
  - /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/src/data/gbb_spatial_spec.json
  - /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/scripts/cartography/calibration_transforms.json
Generates:
  - /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/maps/verification_overlay_masterplan.png
  - /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/public/maps/verification_overlay_visitormap.png
  - /Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments/src/data/gbb_verification_report.json
Executes:
  - Full mathematical & topological cross-check of 7 vertices (V1-V7), 20 landmarks (L01-L20),
    18 Supertrees (ST01-ST18), 6 bridges, water polygons/moats, and 42 botanical relics (T01-T42).
"""

import base64
import html
import json
import math
import os
import shutil
import subprocess
import tempfile

WORKSPACE = "/Users/momo/Desktop/Antigravity/GBB TreasureHunt Experiments"
PARENT_ARTIFACT_DIR = "/Users/momo/.gemini/antigravity/brain/b137f042-fda4-4398-bc0e-f21b111da1c0"
SUBAGENT_ARTIFACT_DIR = "/Users/momo/.gemini/antigravity/brain/5dc9bd95-ba47-4799-801e-de59b4e6afdd"

SPEC_PATH = os.path.join(WORKSPACE, "src/data/maps/gbb/gbb_spatial_spec.json")
CALIB_PATH = os.path.join(WORKSPACE, "scripts/cartography/gbb/calibration_transforms.json")
REPORT_OUT = os.path.join(WORKSPACE, "src/data/maps/gbb/gbb_verification_report.json")

RAW_REF1_PATH = os.path.join(WORKSPACE, "public/maps/raw_ref_1_masterplan.jpg")
RAW_REF2_PATH = (
    os.path.join(WORKSPACE, "public/maps/raw_ref_2_visitor_map.jpg")
    if os.path.exists(os.path.join(WORKSPACE, "public/maps/raw_ref_2_visitor_map.jpg"))
    else os.path.join(WORKSPACE, "public/maps/raw_ref_2_visitormap.jpg")
)


def apply_affine(mat, x_m, z_m):
    px = mat[0][0] * x_m + mat[0][1] * z_m + mat[0][2]
    py = mat[1][0] * x_m + mat[1][1] * z_m + mat[1][2]
    return (px, py)


def point_in_polygon(x, z, poly):
    """Ray-casting point-in-polygon test in 2D meter coordinates."""
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, zi = poly[i]
        xj, zj = poly[j]
        if ((zi > z) != (zj > z)) and (x < (xj - xi) * (z - zi) / ((zj - zi) + 1e-12) + xi):
            inside = not inside
        j = i
    return inside


def point_to_segment_dist(px, pz, x1, z1, x2, z2):
    dx, dz = x2 - x1, z2 - z1
    len_sq = dx * dx + dz * dz
    if len_sq < 1e-12:
        return math.hypot(px - x1, pz - z1)
    t = max(0.0, min(1.0, ((px - x1) * dx + (pz - z1) * dz) / len_sq))
    proj_x = x1 + t * dx
    proj_z = z1 + t * dz
    return math.hypot(px - proj_x, pz - proj_z)


def point_to_polyline_dist(px, pz, pts):
    return min(
        point_to_segment_dist(px, pz, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])
        for i in range(len(pts) - 1)
    )


def point_on_bridge(px, pz, bridge, extra_tol_m=1.5):
    x1, z1 = bridge["start_m"]
    x2, z2 = bridge["end_m"]
    half_w = bridge["width_m"] * 0.5 + extra_tol_m
    return point_to_segment_dist(px, pz, x1, z1, x2, z2) <= half_w


def get_landmark_footprint_pts_m(lm, num_ellipse_pts=36):
    cx, cz = lm["x_m"], lm["z_m"]
    w, l = lm["w_m"], lm["l_m"]
    ang_rad = math.radians(lm["angle_deg"])
    cos_a, sin_a = math.cos(ang_rad), math.sin(ang_rad)

    is_ellipse = lm["shape"] in (
        "ellipse_grove",
        "meadow_bowl",
        "plaza_clock",
        "supertree_triad",
        "wetlands_sanctuary",
        "ribbed_dome",
        "tapered_dome",
    )
    local_pts = []
    if is_ellipse:
        rx, rz = w * 0.5, l * 0.5
        for i in range(num_ellipse_pts):
            theta = 2.0 * math.pi * i / num_ellipse_pts
            local_pts.append((rx * math.cos(theta), rz * math.sin(theta)))
    else:
        hw, hl = w * 0.5, l * 0.5
        local_pts = [(-hw, -hl), (hw, -hl), (hw, hl), (-hw, hl)]

    world_pts = []
    for lx, lz in local_pts:
        wx = cx + lx * cos_a - lz * sin_a
        wz = cz + lx * sin_a + lz * cos_a
        world_pts.append((wx, wz))
    return world_pts


def get_circle_pts_m(cx, cz, r_m, n=28):
    return [
        (cx + r_m * math.cos(2.0 * math.pi * i / n), cz + r_m * math.sin(2.0 * math.pi * i / n))
        for i in range(n)
    ]


def fmt_px(pts_px):
    return " ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in pts_px)


def render_overlay_composite(spec, calib_map, raw_img_path, out_paths, title_str):
    target_w = calib_map["width"]
    target_h = calib_map["height"]
    m2p = calib_map["meter_to_pixel"]

    with open(raw_img_path, "rb") as f:
        b64_img = base64.b64encode(f.read()).decode("ascii")

    def proj_poly(pts_m):
        return [apply_affine(m2p, p[0], p[1]) for p in pts_m]

    svg = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {target_w} {target_h}" width="{target_w}" height="{target_h}">',
        f'  <image x="0" y="0" width="{target_w}" height="{target_h}" preserveAspectRatio="none" href="data:image/jpeg;base64,{b64_img}" xlink:href="data:image/jpeg;base64,{b64_img}"/>',
        f'  <rect x="0" y="0" width="{target_w}" height="{target_h}" fill="#080f1c" opacity="0.18"/>',
    ]

    # 1. Outer Peninsula Landmasses (50% semi-transparent vector overlay)
    main_isl_px = fmt_px(proj_poly(spec["landmasses"]["main_bay_south_island_m"]))
    west_bank_px = fmt_px(proj_poly(spec["landmasses"]["outer_west_bank_m"]))
    df_isl_px = fmt_px(proj_poly(spec["landmasses"]["dragonfly_island_m"]))
    nb_isl_px = fmt_px(proj_poly(spec["landmasses"]["nibong_island_m"]))

    svg.append('  <g id="overlay-landmasses">')
    svg.append(
        f'    <polygon points="{main_isl_px}" fill="#22c55e" fill-opacity="0.22" stroke="#4ade80" stroke-width="3.5" stroke-dasharray="10,5" opacity="0.9"/>'
    )
    svg.append(
        f'    <polygon points="{west_bank_px}" fill="#10b981" fill-opacity="0.20" stroke="#34d399" stroke-width="3.2" stroke-dasharray="8,4" opacity="0.9"/>'
    )
    svg.append("  </g>")

    # 2. Water Bodies (Dragonfly Lake, Kingfisher Lake, Ponds, Moats)
    svg.append('  <g id="overlay-water-bodies">')
    for wb in spec["water_bodies"]:
        if "polygon_m" in wb:
            w_px = fmt_px(proj_poly(wb["polygon_m"]))
            svg.append(
                f'    <polygon points="{w_px}" fill="#0284c7" fill-opacity="0.50" stroke="#38bdf8" stroke-width="2.8"/>'
            )
        elif "centerline_m" in wb:
            c_px = fmt_px(proj_poly(wb["centerline_m"]))
            w_px_width = max(5.0, wb.get("width_m", 12.0) * 1.9)
            svg.append(
                f'    <polyline points="{c_px}" fill="none" stroke="#7dd3fc" stroke-width="{w_px_width + 4.0:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.75"/>'
            )
            svg.append(
                f'    <polyline points="{c_px}" fill="none" stroke="#0284c7" stroke-width="{w_px_width:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.65"/>'
            )
    svg.append(f'    <polygon points="{df_isl_px}" fill="#2e6b3e" fill-opacity="0.65" stroke="#a7f3d0" stroke-width="2.0"/>')
    svg.append(f'    <polygon points="{nb_isl_px}" fill="#2e6b3e" fill-opacity="0.65" stroke="#a7f3d0" stroke-width="2.0"/>')
    svg.append("  </g>")

    # 3. Roads (Marina Gardens Drive, Sheares Ave, Marina Blvd)
    svg.append('  <g id="overlay-roads">')
    for rk, rd in spec["roads"].items():
        r_px = fmt_px(proj_poly(rd["centerline_m"]))
        rw = max(6.0, rd["width_m"] * 1.7)
        svg.append(
            f'    <polyline points="{r_px}" fill="none" stroke="#1e293b" stroke-width="{rw:.1f}" stroke-linecap="round" stroke-linejoin="round" opacity="0.62"/>'
        )
        svg.append(
            f'    <polyline points="{r_px}" fill="none" stroke="#f8fafc" stroke-width="2.2" stroke-dasharray="10,8" opacity="0.85"/>'
        )
    svg.append("  </g>")

    # 4. Pathways & 6 Walkable Bridges
    svg.append('  <g id="overlay-pathways-bridges">')
    for pw in spec["pathways"]:
        p_px = fmt_px(proj_poly(pw["points_m"]))
        svg.append(
            f'    <polyline points="{p_px}" fill="none" stroke="#fde68a" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>'
        )
    for br in spec["bridges"]:
        b1 = apply_affine(m2p, br["start_m"][0], br["start_m"][1])
        b2 = apply_affine(m2p, br["end_m"][0], br["end_m"][1])
        bc = apply_affine(m2p, br["center_m"][0], br["center_m"][1])
        bw = max(8.0, br["width_m"] * 1.9)
        svg.append(
            f'    <line x1="{b1[0]:.1f}" y1="{b1[1]:.1f}" x2="{b2[0]:.1f}" y2="{b2[1]:.1f}" stroke="#78350f" stroke-width="{bw + 4.0:.1f}" stroke-linecap="butt" opacity="0.9"/>'
        )
        svg.append(
            f'    <line x1="{b1[0]:.1f}" y1="{b1[1]:.1f}" x2="{b2[0]:.1f}" y2="{b2[1]:.1f}" stroke="#f59e0b" stroke-width="{bw:.1f}" stroke-linecap="butt" opacity="0.9"/>'
        )
        svg.append(
            f'    <circle cx="{bc[0]:.1f}" cy="{bc[1]:.1f}" r="4.5" fill="#fef3c7" stroke="#78350f" stroke-width="1.5"/>'
        )
    svg.append("  </g>")

    # 5. All 20 Landmarks (L01-L20 Footprints + Centers)
    svg.append('  <g id="overlay-landmarks">')
    for lm in spec["landmarks"]:
        fp_px = fmt_px(proj_poly(get_landmark_footprint_pts_m(lm)))
        col = lm["color"]
        svg.append(
            f'    <polygon points="{fp_px}" fill="{col}" fill-opacity="0.38" stroke="{col}" stroke-width="3.0"/>'
        )
        cx_px, cy_px = apply_affine(m2p, lm["x_m"], lm["z_m"])
        svg.append(
            f'    <circle cx="{cx_px:.1f}" cy="{cy_px:.1f}" r="5.5" fill="{col}" stroke="#0f172a" stroke-width="2.0"/>'
        )
        lbl = f'{lm["id"]} {lm["name"][:18]}'
        bw = len(lbl) * 6.2 + 12.0
        svg.append(
            f'    <rect x="{cx_px + 8:.1f}" y="{cy_px - 11:.1f}" width="{bw:.1f}" height="18" rx="3" fill="#0f172a" stroke="{col}" stroke-width="1.4" opacity="0.88"/>'
            f'    <text x="{cx_px + 14:.1f}" y="{cy_px + 2:.1f}" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="10.5" font-weight="bold">{html.escape(lbl)}</text>'
        )
    svg.append("  </g>")

    # 6. OCBC Skyway & All 18 Supertrees (ST01-ST18)
    svg.append('  <g id="overlay-supertrees">')
    sky_px = fmt_px(proj_poly(spec["ocbc_skyway_m"] + [spec["ocbc_skyway_m"][0]]))
    svg.append(
        f'    <polyline points="{sky_px}" fill="none" stroke="#facc15" stroke-width="4.5" stroke-linejoin="round" opacity="0.9"/>'
    )
    for st in spec["supertrees"]:
        canopy_px = fmt_px(proj_poly(get_circle_pts_m(st["x_m"], st["z_m"], st["canopy_r_m"])))
        trunk_px = fmt_px(proj_poly(get_circle_pts_m(st["x_m"], st["z_m"], st["trunk_r_m"], n=16)))
        c_hex = (
            "#ec4899"
            if st["tier"] == "hero"
            else ("#94a3b8" if st["cluster"] == "Silver Garden" else ("#eab308" if st["cluster"] == "Golden Garden" else "#d946ef"))
        )
        svg.append(
            f'    <polygon points="{canopy_px}" fill="{c_hex}" fill-opacity="0.48" stroke="{c_hex}" stroke-width="2.2"/>'
        )
        svg.append(
            f'    <polygon points="{trunk_px}" fill="#f8fafc" stroke="#0f172a" stroke-width="1.4"/>'
        )
    svg.append("  </g>")

    # 7. All 42 Botanical Treasures (T01-T42)
    svg.append('  <g id="overlay-treasures">')
    for t in spec["treasures"]:
        tx_px, ty_px = apply_affine(m2p, t["x_m"], t["z_m"])
        svg.append(
            f'    <circle cx="{tx_px:.1f}" cy="{ty_px:.1f}" r="8.5" fill="#0f172a" stroke="#facc15" stroke-width="2.0" opacity="0.92"/>'
            f'    <text x="{tx_px:.1f}" y="{ty_px + 3.5:.1f}" fill="#fef08a" font-family="Helvetica, Arial, sans-serif" font-size="9.5" font-weight="bold" text-anchor="middle">{t["id"]}</text>'
        )
    svg.append("  </g>")

    # 8. All 7 Outer Coastline Vertices (V1-V7) & Calibration Control Point Residual Vectors
    svg.append('  <g id="overlay-vertices-and-anchors">')
    for anc in calib_map["anchors"]:
        ax, ay = anc["actual_px"]
        px, py = anc["predicted_px"]
        svg.append(
            f'    <line x1="{ax:.1f}" y1="{ay:.1f}" x2="{px:.1f}" y2="{py:.1f}" stroke="#facc15" stroke-width="3.0"/>'
            f'    <circle cx="{ax:.1f}" cy="{ay:.1f}" r="8.0" fill="none" stroke="#4ade80" stroke-width="2.5"/>'
            f'    <line x1="{ax - 13:.1f}" y1="{ay:.1f}" x2="{ax + 13:.1f}" y2="{ay:.1f}" stroke="#4ade80" stroke-width="2.2"/>'
            f'    <line x1="{ax:.1f}" y1="{ay - 13:.1f}" x2="{ax:.1f}" y2="{ay + 13:.1f}" stroke="#4ade80" stroke-width="2.2"/>'
        )

    for v in spec["outer_vertices"]:
        vx_px, vy_px = apply_affine(m2p, v["x_m"], v["z_m"])
        v_lbl = f'{v["id"]}: ({int(v["x_m"]):+d}m, {int(v["z_m"]):+d}m)'
        bx = max(12.0, min(target_w - 165.0, vx_px - 78.0))
        by = max(12.0, min(target_h - 32.0, vy_px - 30.0))
        svg.append(
            f'    <circle cx="{vx_px:.1f}" cy="{vy_px:.1f}" r="7.5" fill="#10b981" stroke="#ffffff" stroke-width="2.5"/>'
            f'    <rect x="{bx:.1f}" y="{by:.1f}" width="156" height="20" rx="4" fill="#064e3b" stroke="#34d399" stroke-width="1.6" opacity="0.94"/>'
            f'    <text x="{bx + 78:.1f}" y="{by + 14:.1f}" fill="#ecfdf5" font-family="Courier, monospace" font-size="11.0" font-weight="bold" text-anchor="middle">{v_lbl}</text>'
        )
    svg.append("  </g>")

    # 9. Title & Verification Metrics Banner
    sub1 = (
        f"Affine Fit Metrics: RMS Residual = {calib_map['rms_residual_px']:.2f} px | "
        f"Mean Residual = {calib_map['mean_residual_m']:.2f} m | Max Residual = {calib_map['max_residual_m']:.2f} m"
    )
    sub2 = "50% Vector Overlay: Peninsula & West Bank (Green) | Lakes & Moats (Cyan) | 6 Bridges (Amber) | 20 Landmarks | 18 Supertrees | 42 Relics"
    svg.append(
        '  <g id="overlay-header">'
        '    <rect x="20" y="20" width="1120" height="96" rx="8" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" opacity="0.94"/>'
        f'    <text x="40" y="50" fill="#f8fafc" font-family="Helvetica, Arial, sans-serif" font-size="20" font-weight="bold">{html.escape(title_str)}</text>'
        f'    <text x="40" y="76" fill="#facc15" font-family="Courier, monospace" font-size="14" font-weight="bold">{html.escape(sub1)}</text>'
        f'    <text x="40" y="98" fill="#7dd3fc" font-family="Helvetica, Arial, sans-serif" font-size="13" font-weight="bold">{html.escape(sub2)}</text>'
        "  </g>"
    )

    svg.append("</svg>")
    svg_str = "\n".join(svg)

    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False, encoding="utf-8") as tf:
        tf.write(svg_str)
        tmp_svg = tf.name

    primary_out = out_paths[0]
    os.makedirs(os.path.dirname(primary_out), exist_ok=True)
    subprocess.run(["/tmp/svg2png", tmp_svg, primary_out], check=True)
    os.unlink(tmp_svg)
    print(f"Rendered overlay PNG via /tmp/svg2png: {primary_out} ({target_w}x{target_h})")

    for extra_out in out_paths[1:]:
        try:
            os.makedirs(os.path.dirname(extra_out), exist_ok=True)
            shutil.copyfile(primary_out, extra_out)
            print(f"Copied overlay PNG to: {extra_out}")
        except PermissionError:
            print(f"Skipped sandbox-restricted path: {extra_out}")


def run_verification_suite(spec, calib):
    report = {
        "anchor_consistency": {
            "vertices_v1_v7": [],
            "landmarks_l01_l20": [],
            "max_spec_vs_calib_discrepancy_m": 0.0,
        },
        "affine_projection_residuals": {
            "ref1_masterplan": {
                "rms_residual_px": calib["maps"]["ref1"]["rms_residual_px"],
                "mean_residual_m": calib["maps"]["ref1"]["mean_residual_m"],
                "max_residual_m": calib["maps"]["ref1"]["max_residual_m"],
                "control_points": calib["maps"]["ref1"]["anchors"],
                "all_20_landmarks": [],
            },
            "ref2_visitormap": {
                "rms_residual_px": calib["maps"]["ref2"]["rms_residual_px"],
                "mean_residual_m": calib["maps"]["ref2"]["mean_residual_m"],
                "max_residual_m": calib["maps"]["ref2"]["max_residual_m"],
                "control_points": calib["maps"]["ref2"]["anchors"],
                "all_20_landmarks": [],
            },
        },
        "treasure_topology_audit": {
            "total_treasures": len(spec["treasures"]),
            "on_main_island_count": 0,
            "on_outer_west_bank_count": 0,
            "on_bridge_count": 0,
            "unbridged_water_violations": [],
            "supertree_trunk_collisions": [],
            "out_of_landmass_violations": [],
            "min_supertree_trunk_clearance_m": 999.0,
            "details": [],
        },
    }

    # 1. Compare V1-V7 between calibration_transforms.json and gbb_spatial_spec.json
    spec_v_map = {v["id"]: v for v in spec["outer_vertices"]}
    for cv in calib["peninsula_vertices"]:
        vid = cv["id"]
        sv = spec_v_map[vid]
        dx = sv["x_m"] - cv["x_m"]
        dz = sv["z_m"] - cv["z_m"]
        dist = math.hypot(dx, dz)
        report["anchor_consistency"]["max_spec_vs_calib_discrepancy_m"] = max(
            report["anchor_consistency"]["max_spec_vs_calib_discrepancy_m"], dist
        )
        report["anchor_consistency"]["vertices_v1_v7"].append(
            {
                "id": vid,
                "name": sv["name"],
                "calib_xz_m": [cv["x_m"], cv["z_m"]],
                "spec_xz_m": [sv["x_m"], sv["z_m"]],
                "discrepancy_m": round(dist, 4),
            }
        )

    # 2. Compare L01-L20 between calibration_transforms.json and gbb_spatial_spec.json
    #    and compute affine projection residuals on Ref 1 and Ref 2 for all 20 landmarks
    spec_lm_map = {lm["id"]: lm for lm in spec["landmarks"]}
    ref1_p2m = calib["maps"]["ref1"]["percent_to_meter"]
    ref2_p2m = calib["maps"]["ref2"]["percent_to_meter"]

    for clm in calib["landmarks"]:
        lid = clm["id"]
        slm = spec_lm_map[lid]
        dx = slm["x_m"] - clm["x_m"]
        dz = slm["z_m"] - clm["z_m"]
        dist = math.hypot(dx, dz)
        report["anchor_consistency"]["max_spec_vs_calib_discrepancy_m"] = max(
            report["anchor_consistency"]["max_spec_vs_calib_discrepancy_m"], dist
        )
        report["anchor_consistency"]["landmarks_l01_l20"].append(
            {
                "id": lid,
                "name": slm["name"],
                "calib_xz_m": [clm["x_m"], clm["z_m"]],
                "spec_xz_m": [slm["x_m"], slm["z_m"]],
                "calib_wl_m": [clm["w_m"], clm["l_m"]],
                "spec_wl_m": [slm["w_m"], slm["l_m"]],
                "discrepancy_m": round(dist, 4),
            }
        )

        # Ref 1 landmark residual in meters
        r1_mx, r1_mz = apply_affine(ref1_p2m, clm["ref1_pct"][0], clm["ref1_pct"][1])
        r1_err_m = math.hypot(r1_mx - slm["x_m"], r1_mz - slm["z_m"])
        report["affine_projection_residuals"]["ref1_masterplan"]["all_20_landmarks"].append(
            {
                "id": lid,
                "name": slm["name"],
                "canonical_xz_m": [slm["x_m"], slm["z_m"]],
                "ref1_projected_xz_m": [round(r1_mx, 2), round(r1_mz, 2)],
                "residual_m": round(r1_err_m, 2),
            }
        )

        # Ref 2 landmark residual in meters
        r2_mx, r2_mz = apply_affine(ref2_p2m, clm["ref2_pct"][0], clm["ref2_pct"][1])
        r2_err_m = math.hypot(r2_mx - slm["x_m"], r2_mz - slm["z_m"])
        report["affine_projection_residuals"]["ref2_visitormap"]["all_20_landmarks"].append(
            {
                "id": lid,
                "name": slm["name"],
                "canonical_xz_m": [slm["x_m"], slm["z_m"]],
                "ref2_projected_xz_m": [round(r2_mx, 2), round(r2_mz, 2)],
                "residual_m": round(r2_err_m, 2),
            }
        )

    # 3. Verify all 42 Treasures (T01-T42)
    main_poly = spec["landmasses"]["main_bay_south_island_m"]
    west_poly = spec["landmasses"]["outer_west_bank_m"]
    bridges = spec["bridges"]
    water_bodies = spec["water_bodies"]
    supertrees = spec["supertrees"]

    for t in spec["treasures"]:
        tid = f'T{t["id"]:02d}'
        tx, tz = t["x_m"], t["z_m"]

        in_main = point_in_polygon(tx, tz, main_poly)
        in_west = point_in_polygon(tx, tz, west_poly)
        bridged_by = [br["id"] for br in bridges if point_on_bridge(tx, tz, br)]
        on_bridge = len(bridged_by) > 0

        if on_bridge:
            report["treasure_topology_audit"]["on_bridge_count"] += 1
        elif in_main:
            report["treasure_topology_audit"]["on_main_island_count"] += 1
        elif in_west:
            report["treasure_topology_audit"]["on_outer_west_bank_count"] += 1
        else:
            report["treasure_topology_audit"]["out_of_landmass_violations"].append(
                {"id": tid, "name": t["name"], "x_m": tx, "z_m": tz}
            )

        # Check water polygons & canal centerlines
        water_hits = []
        for wb in water_bodies:
            if "polygon_m" in wb:
                if point_in_polygon(tx, tz, wb["polygon_m"]):
                    water_hits.append(wb["id"])
            elif "centerline_m" in wb:
                half_w = wb.get("width_m", 12.0) * 0.5
                if point_to_polyline_dist(tx, tz, wb["centerline_m"]) <= half_w:
                    water_hits.append(wb["id"])

        unbridged_water = len(water_hits) > 0 and not on_bridge
        if unbridged_water:
            report["treasure_topology_audit"]["unbridged_water_violations"].append(
                {"id": tid, "name": t["name"], "x_m": tx, "z_m": tz, "water_bodies": water_hits}
            )

        # Check Supertree trunk collision clearance
        min_trunk_clear = 999.0
        nearest_st = None
        for st in supertrees:
            d_center = math.hypot(tx - st["x_m"], tz - st["z_m"])
            clearance = d_center - st["trunk_r_m"]
            if clearance < min_trunk_clear:
                min_trunk_clear = clearance
                nearest_st = st["id"]
            if clearance <= 0.0:
                report["treasure_topology_audit"]["supertree_trunk_collisions"].append(
                    {
                        "id": tid,
                        "name": t["name"],
                        "supertree_id": st["id"],
                        "dist_center_m": round(d_center, 2),
                        "trunk_r_m": st["trunk_r_m"],
                    }
                )

        report["treasure_topology_audit"]["min_supertree_trunk_clearance_m"] = round(
            min(report["treasure_topology_audit"]["min_supertree_trunk_clearance_m"], min_trunk_clear), 2
        )

        placement_type = (
            f"bridge ({bridged_by[0]})"
            if on_bridge
            else ("main_bay_south_island" if in_main else ("outer_west_bank" if in_west else "OUTSIDE"))
        )
        report["treasure_topology_audit"]["details"].append(
            {
                "id": tid,
                "name": t["name"],
                "zone": t["zone"],
                "x_m": tx,
                "z_m": tz,
                "placement": placement_type,
                "water_overlap": water_hits,
                "unbridged_water_violation": unbridged_water,
                "nearest_supertree": nearest_st,
                "supertree_trunk_clearance_m": round(min_trunk_clear, 2),
            }
        )

    os.makedirs(os.path.dirname(REPORT_OUT), exist_ok=True)
    with open(REPORT_OUT, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"Wrote verification report JSON: {REPORT_OUT}")
    return report


def main():
    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        spec = json.load(f)
    with open(CALIB_PATH, "r", encoding="utf-8") as f:
        calib = json.load(f)

    render_overlay_composite(
        spec=spec,
        calib_map=calib["maps"]["ref1"],
        raw_img_path=RAW_REF1_PATH,
        out_paths=[
            os.path.join(WORKSPACE, "public/maps/verification_overlay_masterplan.png"),
            os.path.join(SUBAGENT_ARTIFACT_DIR, "verification_overlay_masterplan.png"),
            os.path.join(PARENT_ARTIFACT_DIR, "verification_overlay_masterplan.png"),
        ],
        title_str="STAGE 1C VERIFICATION OVERLAY 1 — ARCHITECTURAL MASTERPLAN (GRANT ASSOCIATES)",
    )

    render_overlay_composite(
        spec=spec,
        calib_map=calib["maps"]["ref2"],
        raw_img_path=RAW_REF2_PATH,
        out_paths=[
            os.path.join(WORKSPACE, "public/maps/verification_overlay_visitormap.png"),
            os.path.join(SUBAGENT_ARTIFACT_DIR, "verification_overlay_visitormap.png"),
            os.path.join(PARENT_ARTIFACT_DIR, "verification_overlay_visitormap.png"),
        ],
        title_str="STAGE 1C VERIFICATION OVERLAY 2 — OFFICIAL VISITOR MAP (GB-Map-15-02-2026)",
    )

    report = run_verification_suite(spec, calib)
    r1_lms = report["affine_projection_residuals"]["ref1_masterplan"]["all_20_landmarks"]
    r2_lms = report["affine_projection_residuals"]["ref2_visitormap"]["all_20_landmarks"]
    r1_mean_lm = sum(x["residual_m"] for x in r1_lms) / len(r1_lms)
    r2_mean_lm = sum(x["residual_m"] for x in r2_lms) / len(r2_lms)

    print("\n=== STAGE 1C INDEPENDENT VERIFICATION SUMMARY ===")
    print(f"Max Spec vs Calibration Anchor Discrepancy: {report['anchor_consistency']['max_spec_vs_calib_discrepancy_m']:.4f} m")
    print(f"Ref 1 (Masterplan) Control Point Mean Residual: {calib['maps']['ref1']['mean_residual_m']:.2f} m (Max: {calib['maps']['ref1']['max_residual_m']:.2f} m)")
    print(f"Ref 1 (Masterplan) All 20 Landmarks Mean Residual: {r1_mean_lm:.2f} m")
    print(f"Ref 2 (Visitor Map) Control Point Mean Residual: {calib['maps']['ref2']['mean_residual_m']:.2f} m (Max: {calib['maps']['ref2']['max_residual_m']:.2f} m)")
    print(f"Ref 2 (Visitor Map) All 20 Landmarks Mean Residual: {r2_mean_lm:.2f} m")
    audit = report["treasure_topology_audit"]
    print(
        f"Treasures Audited: {audit['total_treasures']} total -> "
        f"{audit['on_main_island_count']} Main Island, "
        f"{audit['on_outer_west_bank_count']} Outer West Bank, "
        f"{audit['on_bridge_count']} Bridges"
    )
    print(f"Out-of-Landmass Violations: {len(audit['out_of_landmass_violations'])}")
    print(f"Unbridged Water Violations: {len(audit['unbridged_water_violations'])}")
    print(f"Supertree Trunk Collisions: {len(audit['supertree_trunk_collisions'])} (Min Clearance: {audit['min_supertree_trunk_clearance_m']:.2f} m)")


if __name__ == "__main__":
    main()
