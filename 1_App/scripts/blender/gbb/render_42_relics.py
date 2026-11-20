"""
Fast Single-Session Headless Blender 4.2 Studio Renderer for All 42 Distinct 3D Relics
(`Relic_01` .. `Relic_42`), each displayed in dual Front-3/4 & Back-3/4 view atop `Relic_Pedestal`.
Outputs `assets/renders/relics42/relic_01.png` .. `relic_42.png`.
"""

import os
import math
import bpy
from mathutils import Vector


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


def set_hierarchy_visibility(root_obj, visible: bool):
    for obj in collect_hierarchy_objects(root_obj):
        obj.hide_render = not visible
        obj.hide_viewport = not visible


def point_camera_at(cam_obj, target: Vector):
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat("-Z", "Y")
    cam_obj.rotation_euler = rot_quat.to_euler()


def main():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    glb_path = os.path.join(repo_root, "public", "models", "treasures_foliage.glb")
    out_dir = os.path.join(repo_root, "assets", "renders", "relics42")
    os.makedirs(out_dir, exist_ok=True)

    bpy.ops.import_scene.gltf(filepath=glb_path)

    # Hide all imported top-level objects initially
    top_roots = [obj for obj in bpy.data.objects if obj.parent is None]
    for r in top_roots:
        set_hierarchy_visibility(r, False)

    # Set up left & right pedestals at (-0.85, 0, 0) and (+0.85, 0, 0)
    ped_src = bpy.data.objects.get("Relic_Pedestal")
    sep = 0.82
    if ped_src:
        ped_left = duplicate_hierarchy(ped_src)
        ped_left.location = (-sep, 0.0, 0.0)
        set_hierarchy_visibility(ped_left, True)

        ped_right = duplicate_hierarchy(ped_src)
        ped_right.location = (sep, 0.0, 0.0)
        set_hierarchy_visibility(ped_right, True)

    # Studio World, Floor Disc & 3-Point Lighting
    world = bpy.data.worlds.new("StudioWorld")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs[0].default_value = hex_to_rgba("#0B211D")
        bg.inputs[1].default_value = 1.05

    floor_mat = bpy.data.materials.new("StudioFloorMat")
    floor_mat.use_nodes = True
    bsdf = floor_mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = hex_to_rgba("#102A24")
        bsdf.inputs["Roughness"].default_value = 0.50

    rim_mat = bpy.data.materials.new("StudioRimMat")
    rim_mat.use_nodes = True
    r_bsdf = rim_mat.node_tree.nodes.get("Principled BSDF")
    if r_bsdf:
        r_bsdf.inputs["Base Color"].default_value = hex_to_rgba("#D4AF37")
        r_bsdf.inputs["Metallic"].default_value = 0.85
        r_bsdf.inputs["Roughness"].default_value = 0.22

    bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=2.1, depth=0.08, location=(0.0, 0.0, -0.04))
    bpy.context.active_object.data.materials.append(floor_mat)

    bpy.ops.mesh.primitive_torus_add(major_radius=2.1, minor_radius=0.022, major_segments=64, minor_segments=16, location=(0.0, 0.0, 0.0))
    bpy.context.active_object.data.materials.append(rim_mat)

    for l_name, energy, col, rot_deg in [
        ("KeySun", 3.4, (1.0, 0.97, 0.90), (50, -20, 28)),
        ("FillSun", 1.6, (0.82, 0.95, 1.0), (65, 22, -38)),
        ("RimSun", 1.8, (1.0, 0.92, 0.78), (40, 0, 155)),
    ]:
        ldata = bpy.data.lights.new(name=l_name, type="SUN")
        ldata.energy = energy
        ldata.color = col
        lobj = bpy.data.objects.new(name=l_name, object_data=ldata)
        bpy.context.collection.objects.link(lobj)
        lobj.rotation_euler = tuple(math.radians(a) for a in rot_deg)

    # Studio Camera framed on both pedestals + floating relics (z = 0..1.75m)
    cam_data = bpy.data.cameras.new(name="StudioCam")
    cam_data.lens = 48
    cam_obj = bpy.data.objects.new(name="StudioCam", object_data=cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0.0, -3.55, 1.55)
    point_camera_at(cam_obj, Vector((0.0, 0.0, 0.96)))
    bpy.context.scene.camera = cam_obj

    scene = bpy.context.scene
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT"
        if "BLENDER_EEVEE_NEXT" in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items.keys()
        else "BLENDER_EEVEE"
    )
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 16
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720

    # Render each of Relic_01 .. Relic_42 in dual Front-3/4 and Back-3/4 turnaround view
    for idx in range(1, 43):
        node_name = f"Relic_{idx:02d}"
        relic_root = bpy.data.objects.get(node_name)
        if relic_root is None:
            for obj in top_roots:
                if obj.name.startswith(node_name):
                    relic_root = obj
                    break
        if relic_root is None:
            print(f"WARNING: {node_name} not found!")
            continue

        # Position primary copy on left pedestal (Front-3/4 view) and duplicate on right pedestal (Back-3/4 view)
        relic_root.location = (-sep, 0.0, -0.12)
        relic_root.rotation_mode = "XYZ"
        relic_root.rotation_euler = (0.0, 0.0, math.radians(22.0))
        set_hierarchy_visibility(relic_root, True)

        back_copy = duplicate_hierarchy(relic_root)
        back_copy.location = (sep, 0.0, -0.12)
        back_copy.rotation_mode = "XYZ"
        back_copy.rotation_euler = (0.0, 0.0, math.radians(-148.0))
        set_hierarchy_visibility(back_copy, True)

        out_file = os.path.join(out_dir, f"relic_{idx:02d}.png")
        scene.render.filepath = out_file
        bpy.ops.render.render(write_still=True)
        print(f"[{idx:02d}/42] Rendered {node_name} -> {out_file}")

        # Hide & clean up back_copy before next iteration
        set_hierarchy_visibility(relic_root, False)
        for ch in list(collect_hierarchy_objects(back_copy)):
            bpy.data.objects.remove(ch, do_unlink=True)

    print("All 42 distinct 3D relic studio renders completed!")


if __name__ == "__main__":
    main()
