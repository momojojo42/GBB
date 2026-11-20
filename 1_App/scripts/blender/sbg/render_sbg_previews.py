"""
Headless Blender 4.2 Studio Renderer — Singapore Botanic Gardens (`sbg`) 69-Asset Catalog
Imports the 3 SBG `.glb` bundles in `public/models/sbg/`:
  1. `sbg_buildings_landmarks.glb` (8 buildings)
  2. `sbg_sculptures_bridges.glb` (10 sculptures, bridges & walkways)
  3. `sbg_treasures_foliage.glb` (9 heritage trees/flora + 42 collectible keepsake relics)
and renders studio preview PNGs into `public/assets/renders/sbg/`.
"""

import os
import math
import shutil
import bpy
from mathutils import Vector


SBG_BUNDLES = [
    (
        "sbg_buildings_landmarks.glb",
        [
            ("SBG_Bandstand_Gazebo_1930", "sbg_building_01_bandstand_gazebo_1930.png", 18.0, -32.0),
            ("SBG_Burkill_Hall_1868", "sbg_building_02_burkill_hall_1868.png", 20.0, -32.0),
            ("SBG_Sembcorp_Cool_House", "sbg_building_03_sembcorp_cool_house.png", 21.0, 34.0),
            ("SBG_Tan_Hoon_Siang_Mist_House", "sbg_building_04_tan_hoon_siang_mist_house.png", 21.0, -32.0),
            ("SBG_Shaw_Symphony_Stage", "sbg_building_05_shaw_symphony_stage.png", 18.0, -26.0),
            ("SBG_Botany_Centre_Holttum_Hall", "sbg_building_06_botany_centre_holttum_hall.png", 21.0, -30.0),
            ("SBG_Atbara_House_1898", "sbg_building_07_atbara_house_1898.png", 19.0, -32.0),
            ("SBG_Inverturret_Gallery_1906", "sbg_building_08_inverturret_gallery_1906.png", 19.0, -28.0),
        ],
    ),
    (
        "sbg_sculptures_bridges.glb",
        [
            ("SBG_Tanglin_Silver_Gate", "sbg_sculpture_01_tanglin_silver_gate.png", 18.0, -26.0),
            ("SBG_Swan_Lake_Gazebo_Bridge", "sbg_sculpture_02_swan_lake_gazebo_bridge.png", 22.0, -34.0),
            ("SBG_Flight_Of_Swans_Sculpture", "sbg_sculpture_03_flight_of_swans_sculpture.png", 18.0, -32.0),
            ("SBG_Chopin_Memorial_Statue", "sbg_sculpture_04_chopin_memorial_statue.png", 18.0, -26.0),
            ("SBG_Ginger_Cavern_Waterfall", "sbg_sculpture_05_ginger_cavern_waterfall.png", 19.0, -26.0),
            ("SBG_SPH_Walk_Of_Giants", "sbg_sculpture_06_sph_walk_of_giants.png", 24.0, -34.0),
            ("SBG_COMO_Cempedak_Play_Pod", "sbg_sculpture_07_como_cempedak_play_pod.png", 20.0, -35.0),
            ("SBG_Jacob_Ballas_Treehouse_Bridge", "sbg_sculpture_08_jacob_ballas_treehouse_bridge.png", 20.0, -30.0),
            ("SBG_Sundial_Garden_Pergola", "sbg_sculpture_09_sundial_garden_pergola.png", 25.0, -28.0),
            ("SBG_Nassim_Clock_Tower_Gate", "sbg_sculpture_10_nassim_clock_tower_gate.png", 20.0, -32.0),
        ],
    ),
    (
        "sbg_treasures_foliage.glb",
        [
            ("SBG_Tembusu_Five_Dollar_Hero", "sbg_foliage_01_tembusu_five_dollar_hero.png", 16.0, -22.0),
            ("SBG_Rain_Tree_Monarch", "sbg_foliage_02_rain_tree_monarch.png", 16.0, -32.0),
            ("SBG_Kapok_Silk_Cotton_Giant", "sbg_foliage_03_kapok_silk_cotton_giant.png", 15.0, -32.0),
            ("SBG_Jelutong_Dipterocarp_Tower", "sbg_foliage_04_jelutong_dipterocarp_tower.png", 15.0, -32.0),
            ("SBG_Talipot_Fan_Palm", "sbg_foliage_05_talipot_fan_palm.png", 17.0, -30.0),
            ("SBG_Cannonball_Couroupita_Tree", "sbg_foliage_06_cannonball_couroupita_tree.png", 16.0, -30.0),
            ("SBG_Golden_Shower_Orchid_Arch", "sbg_foliage_07_golden_shower_orchid_arch.png", 20.0, -32.0),
            ("SBG_Torch_Ginger_Heliconia_Cluster", "sbg_foliage_08_torch_ginger_heliconia_cluster.png", 21.0, -32.0),
            ("SBG_Giant_Tiger_Orchid_Clump", "sbg_foliage_09_giant_tiger_orchid_clump.png", 20.0, -32.0),
        ]
        + [
            (f"SBG_Relic_{i:02d}", f"sbg_relic_{i:02d}.png", 20.0, -28.0)
            for i in range(1, 43)
        ],
    ),
]


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


def collect_hierarchy_objects(root_obj):
    objs = [root_obj]
    for ch in root_obj.children_recursive:
        objs.append(ch)
    return objs


def set_hierarchy_visibility(root_obj, visible: bool):
    for obj in collect_hierarchy_objects(root_obj):
        obj.hide_render = not visible
        obj.hide_viewport = not visible


def compute_world_bounds(objs):
    bpy.context.view_layer.update()
    min_v = Vector((1e9, 1e9, 1e9))
    max_v = Vector((-1e9, -1e9, -1e9))
    found = False
    for obj in objs:
        if obj.type == "MESH" and obj.data and len(obj.data.vertices) > 0:
            found = True
            for corner in obj.bound_box:
                wc = obj.matrix_world @ Vector(corner)
                min_v.x = min(min_v.x, wc.x)
                min_v.y = min(min_v.y, wc.y)
                min_v.z = min(min_v.z, wc.z)
                max_v.x = max(max_v.x, wc.x)
                max_v.y = max(max_v.y, wc.y)
                max_v.z = max(max_v.z, wc.z)
    if not found:
        return Vector((-1, -1, 0)), Vector((1, 1, 2))
    return min_v, max_v


def setup_studio_stage():
    bpy.ops.wm.read_factory_settings(use_empty=True)

    world = bpy.data.worlds.new("SBGStudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = hex_to_rgba("#09221C")
        bg.inputs[1].default_value = 1.0

    floor_mat = bpy.data.materials.new("SBGStudioFloorMat")
    floor_mat.use_nodes = True
    bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba("#113027")
        bsdf.inputs["Roughness"].default_value = 0.52

    rim_mat = bpy.data.materials.new("SBGStudioRimMat")
    rim_mat.use_nodes = True
    r_bsdf = rim_mat.node_tree.nodes.get("Principled BSDF")
    if r_bsdf:
        r_bsdf.inputs["Base Color"].default_value = hex_to_rgba("#D4AF37")
        r_bsdf.inputs["Metallic"].default_value = 0.88
        r_bsdf.inputs["Roughness"].default_value = 0.24

    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=1.0, depth=0.08, location=(0, 0, -0.04))
    plinth = bpy.context.active_object
    plinth.name = "Studio_Plinth"
    plinth.data.materials.append(floor_mat)

    bpy.ops.mesh.primitive_torus_add(major_radius=1.0, minor_radius=0.015, major_segments=48, minor_segments=12, location=(0, 0, 0))
    ring = bpy.context.active_object
    ring.name = "Studio_Rim"
    ring.data.materials.append(rim_mat)

    # 3-Point Warm Sunlit Studio Lighting
    for name, energy, col, rot in [
        ("KeySun", 3.4, (1.0, 0.97, 0.90), (50, -20, 28)),
        ("FillSun", 1.6, (0.82, 0.95, 1.0), (65, 22, -38)),
        ("RimSun", 1.8, (1.0, 0.92, 0.78), (40, 0, 155)),
    ]:
        l_data = bpy.data.lights.new(name=name, type="SUN")
        l_data.energy = energy
        l_data.color = col
        l_obj = bpy.data.objects.new(name=name, object_data=l_data)
        bpy.context.collection.objects.link(l_obj)
        l_obj.rotation_euler = tuple(math.radians(a) for a in rot)

    cam_data = bpy.data.cameras.new(name="StudioCam")
    cam_data.lens = 45
    cam_data.clip_start = 0.02
    cam_data.clip_end = 1000.0
    cam_obj = bpy.data.objects.new(name="StudioCam", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT"
        if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
        else "BLENDER_EEVEE"
    )
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 800
    scene.render.resolution_y = 600

    return plinth, ring, cam_obj


def point_camera_at(cam_obj, target: Vector):
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat("-Z", "Y")
    cam_obj.rotation_euler = rot_quat.to_euler()


def render_bundle(bundle_file: str, item_specs: list, repo_root: str, out_dir: str, start_idx: int, total_count: int):
    plinth, ring, cam_obj = setup_studio_stage()
    glb_path = os.path.join(repo_root, "public", "models", "sbg", bundle_file)
    bpy.ops.import_scene.gltf(filepath=glb_path)

    stage_names = {"Studio_Plinth", "Studio_Rim", "KeySun", "FillSun", "RimSun", "StudioCam"}
    roots_map = {}
    for obj in bpy.data.objects:
        if obj.parent is None and obj.name not in stage_names:
            roots_map[obj.name] = obj
            set_hierarchy_visibility(obj, False)

    for idx_offset, (node_name, out_png, elev_deg, azim_deg) in enumerate(item_specs):
        target_root = roots_map.get(node_name)
        if target_root is None:
            for k, v in roots_map.items():
                if k.startswith(node_name):
                    target_root = v
                    break
        if target_root is None:
            raise RuntimeError(f"Missing root node '{node_name}' in {bundle_file}")

        set_hierarchy_visibility(target_root, True)
        target_root.location = (0.0, 0.0, 0.0)
        all_objs = collect_hierarchy_objects(target_root)
        min_v, max_v = compute_world_bounds(all_objs)

        cx = 0.5 * (min_v.x + max_v.x)
        cy = 0.5 * (min_v.y + max_v.y)
        target_root.location = (-cx, -cy, -min_v.z)
        min_v, max_v = compute_world_bounds(all_objs)
        size = max_v - min_v
        center = 0.5 * (min_v + max_v)

        horiz_r = max(size.x, size.y, size.z * 0.55, 0.25) * 0.85
        plinth.scale = (horiz_r, horiz_r, max(horiz_r * 0.5, 0.2))
        plinth.location = (0.0, 0.0, -0.04 * plinth.scale.z)
        ring.scale = (horiz_r, horiz_r, horiz_r)
        ring.location = (0.0, 0.0, 0.0)

        elev_rad = math.radians(elev_deg)
        azim_rad = math.radians(azim_deg)
        v_fov = 2.0 * math.atan(24.0 / (2.0 * cam_obj.data.lens))
        h_fov = 2.0 * math.atan(32.0 / (2.0 * cam_obj.data.lens))
        eff_w = math.hypot(size.x, size.y)
        dist = max(
            (size.z * 0.62) / math.tan(v_fov * 0.5),
            (eff_w * 0.58) / math.tan(h_fov * 0.5),
            0.75
        ) * 1.18

        cam_obj.location = (
            center.x + dist * math.cos(elev_rad) * math.sin(azim_rad),
            center.y - dist * math.cos(elev_rad) * math.cos(azim_rad),
            center.z + dist * math.sin(elev_rad),
        )
        point_camera_at(cam_obj, center)

        out_file = os.path.join(out_dir, out_png)
        bpy.context.scene.render.filepath = out_file
        try:
            bpy.ops.render.render(write_still=True)
        except Exception:
            bpy.context.scene.render.engine = "CYCLES"
            bpy.context.scene.cycles.device = "CPU"
            bpy.context.scene.cycles.samples = 12
            bpy.ops.render.render(write_still=True)

        set_hierarchy_visibility(target_root, False)
        cur_num = start_idx + idx_offset + 1
        print(f"[{cur_num:02d}/{total_count}] Rendered {node_name} -> {out_file}")

    return start_idx + len(item_specs)


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    out_dir = os.path.join(repo_root, "public", "assets", "renders", "sbg")
    os.makedirs(out_dir, exist_ok=True)

    total_count = sum(len(specs) for _, specs in SBG_BUNDLES)
    cur_idx = 0
    for bundle_file, specs in SBG_BUNDLES:
        cur_idx = render_bundle(bundle_file, specs, repo_root, out_dir, cur_idx, total_count)

    print(f"SUCCESS: Rendered all {total_count} SBG 3D studio previews into {out_dir}")


if __name__ == "__main__":
    main()
