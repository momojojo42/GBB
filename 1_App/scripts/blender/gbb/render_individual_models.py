"""
Headless Blender 4.2 Studio Renderer — Individual 3D Model Catalog (1-by-1)
Imports all 4 `.glb` bundles in `public/models/` and renders each of the 33 3D models
individually into `assets/renders/models/model_XX_<name>.png` so every single 3D model
can be inspected and reviewed 1-by-1 on `progress.html`.
"""

import os
import math
import bpy
from mathutils import Vector, Matrix


MODEL_CATALOG = [
    # -------------------------------------------------------------------------
    # Bundle 1: buildings_landmarks.glb (6 Architectural Models)
    # -------------------------------------------------------------------------
    {
        "num": 1,
        "id": "model_01_supertree_hero",
        "bundle": "buildings_landmarks.glb",
        "node": "Supertree_Hero",
        "title": "Supertree_Hero (50m Mother Supertree)",
        "category": "Buildings & Landmarks",
        "mode": "single_tall",
        "cam_elev": 18.0,
        "cam_azim": -36.0,
    },
    {
        "num": 2,
        "id": "model_02_supertree_medium",
        "bundle": "buildings_landmarks.glb",
        "node": "Supertree_Medium",
        "title": "Supertree_Medium (Grove & Cluster Supertree)",
        "category": "Buildings & Landmarks",
        "mode": "single_tall",
        "cam_elev": 18.0,
        "cam_azim": -36.0,
    },
    {
        "num": 3,
        "id": "model_03_understorey_timber_dome",
        "bundle": "buildings_landmarks.glb",
        "node": "Understorey_Timber_Dome",
        "title": "Understorey_Timber_Dome (Lattice-Shell Dining Dome)",
        "category": "Buildings & Landmarks",
        "mode": "single_arch",
        "cam_elev": 24.0,
        "cam_azim": -38.0,
    },
    {
        "num": 4,
        "id": "model_04_flower_dome_conservatory",
        "bundle": "buildings_landmarks.glb",
        "node": "Flower_Dome_Conservatory",
        "title": "Flower_Dome_Conservatory (Broad Gridshell Glass Biome)",
        "category": "Buildings & Landmarks",
        "mode": "single_arch",
        "cam_elev": 22.0,
        "cam_azim": -42.0,
    },
    {
        "num": 5,
        "id": "model_05_cloud_forest_conservatory",
        "bundle": "buildings_landmarks.glb",
        "node": "Cloud_Forest_Conservatory",
        "title": "Cloud_Forest_Conservatory (Tall Gridshell + 35m Waterfall)",
        "category": "Buildings & Landmarks",
        "mode": "single_arch",
        "cam_elev": 21.0,
        "cam_azim": -40.0,
    },
    {
        "num": 6,
        "id": "model_06_bay_east_skylight_pavilion",
        "bundle": "buildings_landmarks.glb",
        "node": "Bay_East_Skylight_Pavilion",
        "title": "Bay_East_Skylight_Pavilion (3-Petal Leaf Roof Pavilion)",
        "category": "Buildings & Landmarks",
        "mode": "single_arch",
        "cam_elev": 25.0,
        "cam_azim": -35.0,
    },

    # -------------------------------------------------------------------------
    # Bundle 2: chibi_explorers.glb (4 Chibi Explorers + 3 Phase-2 Gadgets)
    # -------------------------------------------------------------------------
    {
        "num": 7,
        "id": "model_07_explorer_you",
        "bundle": "chibi_explorers.glb",
        "node": "Explorer_YOU",
        "title": "Explorer_YOU (Player Chibi Safari Explorer • Sky-Blue #2D7FF9)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 12.0,
        "cam_azim": 0.0,
    },
    {
        "num": 8,
        "id": "model_08_explorer_kai",
        "bundle": "chibi_explorers.glb",
        "node": "Explorer_Kai",
        "title": "Explorer_Kai (AI Bot Kai • Coral-Red #FF5A5F Sprinter)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 12.0,
        "cam_azim": 0.0,
    },
    {
        "num": 9,
        "id": "model_09_explorer_mei",
        "bundle": "chibi_explorers.glb",
        "node": "Explorer_Mei",
        "title": "Explorer_Mei (AI Bot Mei • Emerald #10B981 Collector)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 12.0,
        "cam_azim": 0.0,
    },
    {
        "num": 10,
        "id": "model_10_explorer_raj",
        "bundle": "chibi_explorers.glb",
        "node": "Explorer_Raj",
        "title": "Explorer_Raj (AI Bot Raj • Amber-Gold #F59E0B Trickster)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 12.0,
        "cam_azim": 0.0,
    },
    {
        "num": 11,
        "id": "model_11_gadget_turboboots",
        "bundle": "chibi_explorers.glb",
        "node": "Gadget_TurboBoots",
        "title": "Gadget_TurboBoots (Phase-2 Speed Boost Gadget Prop)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 20.0,
        "cam_azim": 0.0,
    },
    {
        "num": 12,
        "id": "model_12_gadget_relicmagnet",
        "bundle": "chibi_explorers.glb",
        "node": "Gadget_RelicMagnet",
        "title": "Gadget_RelicMagnet (Phase-2 Relic Attractor Magnet Prop)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 20.0,
        "cam_azim": 0.0,
    },
    {
        "num": 13,
        "id": "model_13_gadget_holodecoy",
        "bundle": "chibi_explorers.glb",
        "node": "Gadget_HoloDecoy",
        "title": "Gadget_HoloDecoy (Phase-2 Holographic Decoy Emitter Prop)",
        "category": "Chibi Explorers & Gadgets",
        "mode": "dual_turnaround",
        "cam_elev": 22.0,
        "cam_azim": 0.0,
    },

    # -------------------------------------------------------------------------
    # Bundle 3: sculptures_bridges.glb (7 Sculptures, Bridges & Park Landmarks)
    # -------------------------------------------------------------------------
    {
        "num": 14,
        "id": "model_14_planet_floating_baby",
        "bundle": "sculptures_bridges.glb",
        "node": "Planet_Floating_Baby",
        "title": "Planet_Floating_Baby (Marc Quinn's Supine Floating Baby)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 18.0,
        "cam_azim": -32.0,
    },
    {
        "num": 15,
        "id": "model_15_dragonfly_bridge",
        "bundle": "sculptures_bridges.glb",
        "node": "Dragonfly_Bridge",
        "title": "Dragonfly_Bridge (Curved Red-Orange Steel Pedestrian Bridge)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 22.0,
        "cam_azim": -38.0,
    },
    {
        "num": 16,
        "id": "model_16_heritage_moon_gate",
        "bundle": "sculptures_bridges.glb",
        "node": "Heritage_Moon_Gate",
        "title": "Heritage_Moon_Gate (Crimson Chinese Heritage Circular Gate)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 18.0,
        "cam_azim": -30.0,
    },
    {
        "num": 17,
        "id": "model_17_floral_clock",
        "bundle": "sculptures_bridges.glb",
        "node": "Floral_Clock",
        "title": "Floral_Clock (Topiary Botanical Clock Face & Hands)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 34.0,
        "cam_azim": -25.0,
    },
    {
        "num": 18,
        "id": "model_18_sg50_celebration_lattice",
        "bundle": "sculptures_bridges.glb",
        "node": "SG50_Celebration_Lattice",
        "title": "SG50_Celebration_Lattice (Crimson & Gold Geometric Lattice Arch)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 20.0,
        "cam_azim": -32.0,
    },
    {
        "num": 19,
        "id": "model_19_feo_children_splash_pad",
        "bundle": "sculptures_bridges.glb",
        "node": "FEO_Children_Splash_Pad",
        "title": "FEO_Children_Splash_Pad (Water Play Dish Canopies & Jets)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 24.0,
        "cam_azim": -35.0,
    },
    {
        "num": 20,
        "id": "model_20_serene_japanese_pavilion",
        "bundle": "sculptures_bridges.glb",
        "node": "Serene_Japanese_Pavilion",
        "title": "Serene_Japanese_Pavilion (Irimoya Roof Teak & Stone Pavilion)",
        "category": "Sculptures & Bridges",
        "mode": "single_arch",
        "cam_elev": 20.0,
        "cam_azim": -36.0,
    },

    # -------------------------------------------------------------------------
    # Bundle 4A: treasures_foliage.glb — 7 Botanical Relic & Pedestal Models
    # -------------------------------------------------------------------------
    {
        "num": 21,
        "id": "model_21_relic_pedestal",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_Pedestal",
        "title": "Relic_Pedestal (Fluted Limestone & Brass Relic Plinth)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 20.0,
        "cam_azim": 0.0,
    },
    {
        "num": 22,
        "id": "model_22_relic_orchid",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_Orchid",
        "title": "Relic_Orchid (Vanda Miss Joaquim National Orchid)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },
    {
        "num": 23,
        "id": "model_23_relic_pitcherplant",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_PitcherPlant",
        "title": "Relic_PitcherPlant (Cloud Forest Nepenthes Pitcher Plant)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },
    {
        "num": 24,
        "id": "model_24_relic_jadevine",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_JadeVine",
        "title": "Relic_JadeVine (Turquoise Hanging Jade Vine Truss)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },
    {
        "num": 25,
        "id": "model_25_relic_peranakanlantern",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_PeranakanLantern",
        "title": "Relic_PeranakanLantern (Nyonya Gold & Crimson Lantern)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },
    {
        "num": 26,
        "id": "model_26_relic_solarseed",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_SolarSeed",
        "title": "Relic_SolarSeed (Supertree Glowing Solar Seed Core)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },
    {
        "num": 27,
        "id": "model_27_relic_merlionidol",
        "bundle": "treasures_foliage.glb",
        "node": "Relic_MerlionIdol",
        "title": "Relic_MerlionIdol (Bayfront Golden Merlion Botanica Idol)",
        "category": "Botanical Relics (42 Treasures)",
        "mode": "dual_turnaround",
        "cam_elev": 18.0,
        "cam_azim": 0.0,
    },

    # -------------------------------------------------------------------------
    # Bundle 4B: treasures_foliage.glb — 6 Sculpted Tropical Tree Species
    # -------------------------------------------------------------------------
    {
        "num": 28,
        "id": "model_28_tree_raintree",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_RainTree",
        "title": "Tree_RainTree (Multi-Tiered Umbrella Canopy Rain Tree)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_tall",
        "cam_elev": 18.0,
        "cam_azim": -35.0,
    },
    {
        "num": 29,
        "id": "model_29_tree_royalpalm",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_RoyalPalm",
        "title": "Tree_RoyalPalm (Ringed Trunk & Feather-Frond Royal Palm)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_tall",
        "cam_elev": 16.0,
        "cam_azim": -32.0,
    },
    {
        "num": 30,
        "id": "model_30_tree_travellerspalm",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_TravellersPalm",
        "title": "Tree_TravellersPalm (Symmetric Fan-Crown Traveller's Palm)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_tall",
        "cam_elev": 16.0,
        "cam_azim": -28.0,
    },
    {
        "num": 31,
        "id": "model_31_tree_frangipani",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_Frangipani",
        "title": "Tree_Frangipani (Forked Plumeria Tree with Cream-Gold Blooms)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_tall",
        "cam_elev": 20.0,
        "cam_azim": -35.0,
    },
    {
        "num": 32,
        "id": "model_32_tree_giantfern",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_GiantFern",
        "title": "Tree_GiantFern (Prehistoric Cloud Forest Tree Fern Rosette)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_tall",
        "cam_elev": 22.0,
        "cam_azim": -35.0,
    },
    {
        "num": 33,
        "id": "model_33_tree_bougainvillea",
        "bundle": "treasures_foliage.glb",
        "node": "Tree_Bougainvillea",
        "title": "Tree_Bougainvillea (Vibrant Magenta Bougainvillea Mound)",
        "category": "Tropical Foliage & Trees",
        "mode": "single_arch",
        "cam_elev": 22.0,
        "cam_azim": -35.0,
    },
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


def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def collect_hierarchy_objects(root_obj):
    objs = [root_obj]
    for ch in root_obj.children_recursive:
        objs.append(ch)
    return objs


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


def duplicate_hierarchy(root_obj):
    new_root = root_obj.copy()
    if root_obj.data:
        new_root.data = root_obj.data.copy()
    bpy.context.collection.objects.link(new_root)

    def copy_children(src_parent, dst_parent):
        for ch in src_parent.children:
            new_ch = ch.copy()
            if ch.data:
                new_ch.data = ch.data.copy()
            bpy.context.collection.objects.link(new_ch)
            new_ch.parent = dst_parent
            new_ch.matrix_parent_inverse = ch.matrix_parent_inverse.copy()
            copy_children(ch, new_ch)

    copy_children(root_obj, new_root)
    return new_root


def setup_studio_environment(center: Vector, radius: float, min_z: float):
    # Warm exhibition studio world sky
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = hex_to_rgba("#0B211D")
        bg.inputs[1].default_value = 0.95

    # Studio turntable disc + floor plane
    floor_mat = bpy.data.materials.new("StudioFloorMat")
    floor_mat.use_nodes = True
    bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba("#102A24")
        bsdf.inputs["Roughness"].default_value = 0.55

    rim_mat = bpy.data.materials.new("StudioRimMat")
    rim_mat.use_nodes = True
    r_bsdf = rim_mat.node_tree.nodes.get("Principled BSDF")
    if r_bsdf:
        r_bsdf.inputs["Base Color"].default_value = hex_to_rgba("#D4AF37")
        r_bsdf.inputs["Metallic"].default_value = 0.85
        r_bsdf.inputs["Roughness"].default_value = 0.25

    bpy.ops.mesh.primitive_cylinder_add(
        vertices=64,
        radius=radius * 1.45,
        depth=radius * 0.06,
        location=(center.x, center.y, min_z - radius * 0.031),
    )
    plinth = bpy.context.active_object
    plinth.data.materials.append(floor_mat)

    bpy.ops.mesh.primitive_torus_add(
        major_radius=radius * 1.45,
        minor_radius=radius * 0.015,
        major_segments=64,
        minor_segments=16,
        location=(center.x, center.y, min_z - radius * 0.005),
    )
    ring = bpy.context.active_object
    ring.data.materials.append(rim_mat)

    # 3-Point Studio Lighting (Key Sun + Cool Fill Sun + Warm Rim Sun)
    key_data = bpy.data.lights.new(name="KeySun", type="SUN")
    key_data.energy = 3.2
    key_data.color = (1.0, 0.97, 0.90)
    key_obj = bpy.data.objects.new(name="KeySun", object_data=key_data)
    bpy.context.collection.objects.link(key_obj)
    key_obj.rotation_euler = (math.radians(50), math.radians(-20), math.radians(28))

    fill_data = bpy.data.lights.new(name="FillSun", type="SUN")
    fill_data.energy = 1.45
    fill_data.color = (0.82, 0.95, 1.0)
    fill_obj = bpy.data.objects.new(name="FillSun", object_data=fill_data)
    bpy.context.collection.objects.link(fill_obj)
    fill_obj.rotation_euler = (math.radians(65), math.radians(22), math.radians(-38))

    rim_data = bpy.data.lights.new(name="RimSun", type="SUN")
    rim_data.energy = 1.6
    rim_data.color = (1.0, 0.92, 0.78)
    rim_obj = bpy.data.objects.new(name="RimSun", object_data=rim_data)
    bpy.context.collection.objects.link(rim_obj)
    rim_obj.rotation_euler = (math.radians(40), math.radians(0), math.radians(155))


def point_camera_at(cam_obj, target: Vector):
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat("-Z", "Y")
    cam_obj.rotation_euler = rot_quat.to_euler()


def render_single_model(spec: dict, repo_root: str, out_dir: str):
    clear_scene()
    glb_path = os.path.join(repo_root, "public", "models", spec["bundle"])
    bpy.ops.import_scene.gltf(filepath=glb_path)

    target_name = spec["node"]
    target_root = bpy.data.objects.get(target_name)
    if target_root is None:
        # Fallback prefix match if Blender appended suffix
        for obj in bpy.data.objects:
            if obj.parent is None and obj.name.startswith(target_name):
                target_root = obj
                break

    if target_root is None:
        raise RuntimeError(f"Could not find node {target_name} in {spec['bundle']}")

    keep_objs = set(collect_hierarchy_objects(target_root))
    for obj in list(bpy.data.objects):
        if obj not in keep_objs:
            bpy.data.objects.remove(obj, do_unlink=True)

    # Reset target_root to origin
    target_root.location = (0.0, 0.0, 0.0)
    target_root.rotation_mode = "XYZ"
    target_root.rotation_euler = (0.0, 0.0, 0.0)
    bpy.context.view_layer.update()

    # Check if dual turnaround mode (Front-3/4 + Back-3/4 side-by-side)
    all_objs = list(keep_objs)
    min_v, max_v = compute_world_bounds(all_objs)
    size = max_v - min_v
    span = max(size.x, size.y, size.z, 0.2)

    if spec["mode"] == "dual_turnaround":
        sep = max(size.x, size.y, 0.35) * 0.92
        # Left copy: Front-3/4 view
        target_root.location = (-sep, 0.0, -min_v.z)
        target_root.rotation_euler = (0.0, 0.0, math.radians(20.0))

        # Right copy: Back-3/4 view so backpack/rear details are also clearly visible
        back_root = duplicate_hierarchy(target_root)
        back_root.location = (sep, 0.0, -min_v.z)
        back_root.rotation_euler = (0.0, 0.0, math.radians(-150.0))

        all_objs = collect_hierarchy_objects(target_root) + collect_hierarchy_objects(back_root)
        min_v, max_v = compute_world_bounds(all_objs)
        size = max_v - min_v
        span = max(size.x, size.y, size.z, 0.2)
    else:
        # Center at X=0, Y=0, Z=0 base
        cx = 0.5 * (min_v.x + max_v.x)
        cy = 0.5 * (min_v.y + max_v.y)
        target_root.location = (-cx, -cy, -min_v.z)
        min_v, max_v = compute_world_bounds(all_objs)
        size = max_v - min_v
        span = max(size.x, size.y, size.z, 0.2)

    center = 0.5 * (min_v + max_v)
    horiz_radius = max(size.x, size.y, size.z * 0.55, 0.25) * 0.62
    setup_studio_environment(Vector((center.x, center.y, 0.0)), horiz_radius, min_v.z)

    # Camera framing based on aspect ratio 16:9 and bounding box
    cam_data = bpy.data.cameras.new(name="StudioCam")
    cam_data.lens = 45
    cam_data.clip_start = 0.02
    cam_data.clip_end = 1000.0
    cam_obj = bpy.data.objects.new(name="StudioCam", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)

    elev_rad = math.radians(spec.get("cam_elev", 18.0))
    azim_rad = math.radians(spec.get("cam_azim", -32.0))

    # Fit vertical and horizontal FOV cleanly
    v_fov = 2.0 * math.atan(18.0 / (2.0 * cam_data.lens))
    h_fov = 2.0 * math.atan(32.0 / (2.0 * cam_data.lens))

    effective_w = math.hypot(size.x, size.y)
    dist_v = (size.z * 0.60) / math.tan(v_fov * 0.5)
    dist_h = (effective_w * 0.56) / math.tan(h_fov * 0.5)
    dist = max(dist_v, dist_h, 0.8) * 1.18

    cam_x = center.x + dist * math.cos(elev_rad) * math.sin(azim_rad)
    cam_y = center.y - dist * math.cos(elev_rad) * math.cos(azim_rad)
    cam_z = center.z + dist * math.sin(elev_rad)
    cam_obj.location = (cam_x, cam_y, cam_z)
    point_camera_at(cam_obj, center)
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT"
        if "BLENDER_EEVEE_NEXT"
        in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
        else "BLENDER_EEVEE"
    )
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    out_file = os.path.join(out_dir, f"{spec['id']}.png")
    scene.render.filepath = out_file
    bpy.ops.render.render(write_still=True)
    print(f"[{spec['num']:02d}/33] Rendered {spec['node']} -> {out_file}")


def main():
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    out_dir = os.path.join(repo_root, "assets", "renders", "models")
    os.makedirs(out_dir, exist_ok=True)

    for spec in MODEL_CATALOG:
        render_single_model(spec, repo_root, out_dir)

    print("All 33 individual 3D model renders completed!")


if __name__ == "__main__":
    main()
