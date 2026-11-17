"""
Headless Blender 4.2 Script: Gardens by the Bay (Bay South) Architectural Landmarks & Conservatories
Generates `/public/models/buildings_landmarks.glb` containing 6 root landmark hierarchies:
1. Supertree_Hero (~16.0m height)
2. Supertree_Medium (~12.0m height)
3. Understorey_Timber_Dome (~3.8m radius, ~3.4m height)
4. Flower_Dome_Conservatory (~28m length, ~19m width, ~9.5m height)
5. Cloud_Forest_Conservatory (~19m length, ~15m width, ~16.5m height)
6. Bay_East_Skylight_Pavilion (~6.5m radius, ~4.0m height)

All root objects have local & world origin at (0, 0, 0) with +Z up in Blender (exported as +Y up in glTF).
"""

import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix


# ---------------------------------------------------------------------------
# SCENE RESET & MATERIAL UTILITIES
# ---------------------------------------------------------------------------

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def hex_to_rgba(hex_str, alpha=1.0):
    hex_str = hex_str.lstrip('#')
    r = int(hex_str[0:2], 16) / 255.0
    g = int(hex_str[2:4], 16) / 255.0
    b = int(hex_str[4:6], 16) / 255.0
    # Convert sRGB to linear approx for Blender Principled BSDF
    r_lin = pow(r, 2.2)
    g_lin = pow(g, 2.2)
    b_lin = pow(b, 2.2)
    return (r_lin, g_lin, b_lin, alpha)


def create_material(name, hex_color, metallic=0.0, roughness=0.5, alpha=1.0,
                    emission_hex=None, emission_strength=0.0, double_sided=True):
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

    rgba = hex_to_rgba(hex_color, 1.0)
    bsdf.inputs["Base Color"].default_value = rgba
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


def parent_and_zero(obj, parent):
    """Apply object transforms so vertices are in local space relative to (0,0,0), then parent."""
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    obj.select_set(False)
    obj.parent = parent
    obj.matrix_parent_inverse = Matrix.Identity(4)


def apply_all_modifiers(obj):
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    for mod in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=mod.name)
    obj.select_set(False)


def assign_material(obj, mat):
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)


def set_smooth(obj, smooth=True):
    for poly in obj.data.polygons:
        poly.use_smooth = smooth


# ---------------------------------------------------------------------------
# GEOMETRY HELPERS (BMESH)
# ---------------------------------------------------------------------------

def add_tube_segment_bmesh(bm, p0, p1, r0, r1, segments=8, cap_ends=False):
    """Adds a 3D cylindrical/tapered tube between p0 and p1 into an existing bmesh."""
    v0 = Vector(p0)
    v1 = Vector(p1)
    axis = v1 - v0
    length = axis.length
    if length < 1e-5:
        return
    axis_n = axis.normalized()

    # Find orthogonal basis
    up = Vector((0.0, 0.0, 1.0))
    if abs(axis_n.dot(up)) > 0.98:
        up = Vector((1.0, 0.0, 0.0))
    u = axis_n.cross(up).normalized()
    v = axis_n.cross(u).normalized()

    ring0 = []
    ring1 = []
    for i in range(segments):
        ang = 2.0 * math.pi * i / segments
        ca = math.cos(ang)
        sa = math.sin(ang)
        offset = u * ca + v * sa
        ring0.append(bm.verts.new(v0 + offset * r0))
        ring1.append(bm.verts.new(v1 + offset * r1))

    for i in range(segments):
        i_next = (i + 1) % segments
        bm.faces.new((ring0[i], ring0[i_next], ring1[i_next], ring1[i]))

    if cap_ends:
        bm.faces.new(ring0[::-1])
        bm.faces.new(ring1)


def add_polyline_tube_bmesh(bm, points, radii, segments=8):
    """Sweeps a smooth connected tube along a sequence of 3D points."""
    if len(points) < 2:
        return
    rings = []
    for idx, pt in enumerate(points):
        p = Vector(pt)
        if idx == 0:
            tangent = (Vector(points[1]) - p).normalized()
        elif idx == len(points) - 1:
            tangent = (p - Vector(points[idx - 1])).normalized()
        else:
            tangent = (Vector(points[idx + 1]) - Vector(points[idx - 1])).normalized()

        up = Vector((0.0, 0.0, 1.0))
        if abs(tangent.dot(up)) > 0.98:
            up = Vector((1.0, 0.0, 0.0))
        u = tangent.cross(up).normalized()
        v = tangent.cross(u).normalized()

        r = radii[idx] if isinstance(radii, (list, tuple)) else radii
        ring = []
        for i in range(segments):
            ang = 2.0 * math.pi * i / segments
            offset = u * math.cos(ang) + v * math.sin(ang)
            ring.append(bm.verts.new(p + offset * r))
        rings.append(ring)

    for k in range(len(rings) - 1):
        rA = rings[k]
        rB = rings[k + 1]
        for i in range(segments):
            i_next = (i + 1) % segments
            bm.faces.new((rA[i], rA[i_next], rB[i_next], rB[i]))


def add_icosphere_cluster_bmesh(bm, center, radius, scale_xyz=(1.0, 1.0, 1.0), subdivisions=1):
    """Adds a low-poly organic foliage cluster at `center` inside an existing bmesh."""
    res = bmesh.ops.create_icosphere(bm, subdivisions=subdivisions, radius=radius)
    verts = res['verts']
    cx, cy, cz = center
    sx, sy, sz = scale_xyz
    for v in verts:
        v.co.x = v.co.x * sx + cx
        v.co.y = v.co.y * sy + cy
        v.co.z = v.co.z * sz + cz


# ---------------------------------------------------------------------------
# 1 & 2. SUPERTREE BUILDER (Supertree_Hero & Supertree_Medium)
# ---------------------------------------------------------------------------

def build_supertree(
    root_name,
    total_height,
    trunk_height,
    r_base_cage,
    r_waist_cage,
    r_top_cage,
    r_canopy_outer,
    num_radial_ribs,
    num_foliage_rings,
    diagrid_mat,
    crown_rib_mat,
    concrete_mat,
    emerald_mat,
    lime_mat,
    bromeliad_mat,
    solar_mat,
    led_gold_mat,
    led_magenta_mat
):
    root = create_root_empty(root_name)

    # 1. Concrete Core Pillar + Ground Planter Ring
    bm_core = bmesh.new()
    # Inner concrete shaft
    r_core = 0.85 if total_height > 14.0 else 0.68
    segs_core = 24
    ring_bot = []
    ring_top = []
    for i in range(segs_core):
        ang = 2.0 * math.pi * i / segs_core
        x = r_core * math.cos(ang)
        y = r_core * math.sin(ang)
        ring_bot.append(bm_core.verts.new((x, y, 0.0)))
        ring_top.append(bm_core.verts.new((x * 0.92, y * 0.92, trunk_height + 0.3)))
    for i in range(segs_core):
        inext = (i + 1) % segs_core
        bm_core.faces.new((ring_bot[i], ring_bot[inext], ring_top[inext], ring_top[i]))
    bm_core.faces.new(ring_top)

    # Circular base planter curb (z = 0..0.42m)
    r_curb_out = r_base_cage + 0.35
    r_curb_in = r_base_cage - 0.25
    c_b_out, c_t_out, c_t_in, c_b_in = [], [], [], []
    for i in range(32):
        ang = 2.0 * math.pi * i / 32
        ca, sa = math.cos(ang), math.sin(ang)
        c_b_out.append(bm_core.verts.new((r_curb_out * ca, r_curb_out * sa, 0.0)))
        c_t_out.append(bm_core.verts.new((r_curb_out * ca, r_curb_out * sa, 0.42)))
        c_t_in.append(bm_core.verts.new((r_curb_in * ca, r_curb_in * sa, 0.42)))
        c_b_in.append(bm_core.verts.new((r_curb_in * ca, r_curb_in * sa, 0.0)))
    for i in range(32):
        inext = (i + 1) % 32
        bm_core.faces.new((c_b_out[i], c_b_out[inext], c_t_out[inext], c_t_out[i]))
        bm_core.faces.new((c_t_out[i], c_t_out[inext], c_t_in[inext], c_t_in[i]))
        bm_core.faces.new((c_t_in[i], c_t_in[inext], c_b_in[inext], c_b_in[i]))

    mesh_core = bpy.data.meshes.new(f"{root_name}_Concrete_Core")
    bm_core.to_mesh(mesh_core)
    bm_core.free()
    obj_core = bpy.data.objects.new(f"{root_name}_Concrete_Core", mesh_core)
    bpy.context.collection.objects.link(obj_core)
    assign_material(obj_core, concrete_mat)
    set_smooth(obj_core, True)
    parent_and_zero(obj_core, root)

    # 2. Waisted Hyperboloid Living-Wall Trunk (Emerald base + Lime/Bromeliad rings)
    bm_trunk = bmesh.new()
    z_start = 0.35
    z_end = trunk_height - 0.25
    n_z = 22
    n_ang = 24
    r_trunk_min = r_waist_cage * 0.84

    trunk_rings = []
    for iz in range(n_z + 1):
        t = iz / n_z
        z = z_start + t * (z_end - z_start)
        # Signature hourglass/hyperboloid waist formula
        r_t = r_trunk_min * math.sqrt(1.0 + pow((t - 0.52) * 2.1, 2))
        ring = []
        for ia in range(n_ang):
            ang = 2.0 * math.pi * ia / n_ang
            # Subtle organic botanical undulation
            ripple = 1.0 + 0.04 * math.sin(ang * 6.0 + t * 12.0)
            ring.append(bm_trunk.verts.new((r_t * ripple * math.cos(ang), r_t * ripple * math.sin(ang), z)))
        trunk_rings.append(ring)

    for iz in range(n_z):
        rA = trunk_rings[iz]
        rB = trunk_rings[iz + 1]
        for ia in range(n_ang):
            inext = (ia + 1) % n_ang
            bm_trunk.faces.new((rA[ia], rA[inext], rB[inext], rB[ia]))
    bm_trunk.faces.new(trunk_rings[-1])

    # Add deep emerald base mound at bottom of trunk
    for ia in range(16):
        ang = 2.0 * math.pi * ia / 16
        r_m = r_base_cage * 0.88
        add_icosphere_cluster_bmesh(
            bm_trunk,
            (r_m * math.cos(ang), r_m * math.sin(ang), 0.55),
            radius=0.55,
            scale_xyz=(1.2, 1.2, 0.85),
            subdivisions=1
        )

    mesh_trunk = bpy.data.meshes.new(f"{root_name}_Living_Trunk")
    bm_trunk.to_mesh(mesh_trunk)
    bm_trunk.free()
    obj_trunk = bpy.data.objects.new(f"{root_name}_Living_Trunk", mesh_trunk)
    bpy.context.collection.objects.link(obj_trunk)
    assign_material(obj_trunk, emerald_mat)
    set_smooth(obj_trunk, True)
    parent_and_zero(obj_trunk, root)

    # 2b. Horizontal Botanical Living-Wall Rings (Lime Moss & Crimson-Purple Bromeliads)
    bm_lime = bmesh.new()
    bm_brom = bmesh.new()
    for ir in range(num_foliage_rings):
        t = (ir + 0.6) / num_foliage_rings
        z = z_start + t * (z_end - z_start)
        r_t = r_trunk_min * math.sqrt(1.0 + pow((t - 0.52) * 2.1, 2)) + 0.08
        clusters_in_ring = 14
        for ic in range(clusters_in_ring):
            ang = (2.0 * math.pi * ic / clusters_in_ring) + (ir * 0.23)
            cx = r_t * math.cos(ang)
            cy = r_t * math.sin(ang)
            cz = z + 0.12 * math.sin(ic * 1.7)
            if (ir + ic) % 3 == 0:
                add_icosphere_cluster_bmesh(
                    bm_brom,
                    (cx, cy, cz),
                    radius=0.32,
                    scale_xyz=(1.15, 1.15, 0.72),
                    subdivisions=1
                )
            else:
                add_icosphere_cluster_bmesh(
                    bm_lime,
                    (cx, cy, cz),
                    radius=0.38,
                    scale_xyz=(1.25, 1.25, 0.78),
                    subdivisions=1
                )

    mesh_lime = bpy.data.meshes.new(f"{root_name}_Foliage_Lime")
    bm_lime.to_mesh(mesh_lime)
    bm_lime.free()
    obj_lime = bpy.data.objects.new(f"{root_name}_Foliage_Lime", mesh_lime)
    bpy.context.collection.objects.link(obj_lime)
    assign_material(obj_lime, lime_mat)
    set_smooth(obj_lime, True)
    parent_and_zero(obj_lime, root)

    mesh_brom = bpy.data.meshes.new(f"{root_name}_Foliage_Bromeliad")
    bm_brom.to_mesh(mesh_brom)
    bm_brom.free()
    obj_brom = bpy.data.objects.new(f"{root_name}_Foliage_Bromeliad", mesh_brom)
    bpy.context.collection.objects.link(obj_brom)
    assign_material(obj_brom, bromeliad_mat)
    set_smooth(obj_brom, True)
    parent_and_zero(obj_brom, root)

    # 3. 3D Tubular Steel Exoskeletal Diagrid (WIREFRAME modifier on hyperboloid diamond lattice)
    bm_cage = bmesh.new()
    cage_z_divs = 11
    cage_ang_divs = 16
    cage_rings = []

    for iz in range(cage_z_divs + 1):
        t = iz / cage_z_divs
        z = t * trunk_height
        # Hyperboloid profile flaring from r_base_cage at z=0 to r_waist_cage at t=0.52 to r_top_cage at t=1.0
        if t <= 0.52:
            u = (0.52 - t) / 0.52
            r_c = r_waist_cage + (r_base_cage - r_waist_cage) * (u * u)
        else:
            u = (t - 0.52) / 0.48
            r_c = r_waist_cage + (r_top_cage - r_waist_cage) * (u * u)

        ring = []
        for ia in range(cage_ang_divs):
            ang = 2.0 * math.pi * ia / cage_ang_divs
            ring.append(bm_cage.verts.new((r_c * math.cos(ang), r_c * math.sin(ang), z)))
        cage_rings.append(ring)

    for iz in range(cage_z_divs):
        rA = cage_rings[iz]
        rB = cage_rings[iz + 1]
        for ia in range(cage_ang_divs):
            inext = (ia + 1) % cage_ang_divs
            bm_cage.faces.new((rA[ia], rA[inext], rB[inext], rB[ia]))

    # Poke faces to create a true diamond diagrid + horizontal rings
    bmesh.ops.poke(bm_cage, faces=bm_cage.faces[:])

    mesh_cage = bpy.data.meshes.new(f"{root_name}_Exoskeleton_Diagrid")
    bm_cage.to_mesh(mesh_cage)
    bm_cage.free()
    obj_cage = bpy.data.objects.new(f"{root_name}_Exoskeleton_Diagrid", mesh_cage)
    bpy.context.collection.objects.link(obj_cage)

    wf_mod = obj_cage.modifiers.new(name="DiagridWireframe", type='WIREFRAME')
    wf_mod.thickness = 0.14 if total_height > 14.0 else 0.12
    wf_mod.use_replace = True
    wf_mod.use_even_offset = True
    wf_mod.use_boundary = True
    apply_all_modifiers(obj_cage)
    assign_material(obj_cage, diagrid_mat)
    parent_and_zero(obj_cage, root)

    # 4. Inverted-Umbrella Radial Crown Canopy (Curved 3D tubular steel ribs + Y-branches + Concentric tension rings)
    bm_crown = bmesh.new()
    z_crown_start = trunk_height - 0.3
    z_crown_end = total_height - 0.2
    r_crown_start = r_waist_cage * 0.96
    r_crown_end = r_canopy_outer

    rib_steps = 8
    for ir in range(num_radial_ribs):
        base_ang = 2.0 * math.pi * ir / num_radial_ribs
        pts = []
        radii = []
        for s in range(rib_steps + 1):
            t = s / rib_steps
            # Graceful outward trumpet flare
            r = r_crown_start + (r_crown_end - r_crown_start) * pow(t, 1.38)
            z = z_crown_start + (z_crown_end - z_crown_start) * (1.0 - pow(1.0 - t, 1.25))
            pts.append((r * math.cos(base_ang), r * math.sin(base_ang), z))
            radii.append(0.10 * (1.0 - 0.35 * t))
        add_polyline_tube_bmesh(bm_crown, pts, radii, segments=6)

        # Add dendriform Y-branch twigs on upper canopy (t = 0.58 -> 1.0)
        t_split = 0.58
        r_sp = r_crown_start + (r_crown_end - r_crown_start) * pow(t_split, 1.38)
        z_sp = z_crown_start + (z_crown_end - z_crown_start) * (1.0 - pow(1.0 - t_split, 1.25))
        p_split = (r_sp * math.cos(base_ang), r_sp * math.sin(base_ang), z_sp)

        for side in (-1.0, 1.0):
            branch_ang = base_ang + side * (math.pi / num_radial_ribs) * 0.55
            p_tip = (
                r_crown_end * math.cos(branch_ang),
                r_crown_end * math.sin(branch_ang),
                z_crown_end
            )
            add_tube_segment_bmesh(bm_crown, p_split, p_tip, 0.065, 0.045, segments=6, cap_ends=True)

    # Concentric horizontal steel tension rings along the crown
    ring_t_values = [0.22, 0.48, 0.74, 1.0] if total_height > 14.0 else [0.30, 0.65, 1.0]
    ring_segs = 48
    for rt in ring_t_values:
        r_ring = r_crown_start + (r_crown_end - r_crown_start) * pow(rt, 1.38)
        z_ring = z_crown_start + (z_crown_end - z_crown_start) * (1.0 - pow(1.0 - rt, 1.25))
        ring_pts = []
        for i in range(ring_segs + 1):
            ang = 2.0 * math.pi * i / ring_segs
            ring_pts.append((r_ring * math.cos(ang), r_ring * math.sin(ang), z_ring))
        add_polyline_tube_bmesh(bm_crown, ring_pts, 0.075, segments=6)

    mesh_crown = bpy.data.meshes.new(f"{root_name}_Crown_Canopy_Ribs")
    bm_crown.to_mesh(mesh_crown)
    bm_crown.free()
    obj_crown = bpy.data.objects.new(f"{root_name}_Crown_Canopy_Ribs", mesh_crown)
    bpy.context.collection.objects.link(obj_crown)
    assign_material(obj_crown, crown_rib_mat)
    set_smooth(obj_crown, True)
    parent_and_zero(obj_crown, root)

    # 5. Photovoltaic Solar Crown Disc + Glowing Garden Rhapsody LED Rings
    bm_solar = bmesh.new()
    z_solar = z_crown_start + (z_crown_end - z_crown_start) * 0.48
    r_solar = r_canopy_outer * 0.53
    res_cyl = bmesh.ops.create_cone(
        bm_solar,
        cap_ends=True,
        cap_tris=False,
        segments=32,
        radius1=r_solar,
        radius2=r_solar * 1.04,
        depth=0.22
    )
    for v in res_cyl['verts']:
        v.co.z += z_solar

    mesh_solar = bpy.data.meshes.new(f"{root_name}_Solar_Crown_Disc")
    bm_solar.to_mesh(mesh_solar)
    bm_solar.free()
    obj_solar = bpy.data.objects.new(f"{root_name}_Solar_Crown_Disc", mesh_solar)
    bpy.context.collection.objects.link(obj_solar)
    assign_material(obj_solar, solar_mat)
    parent_and_zero(obj_solar, root)

    # Golden-amber observation/skyway collar ring at top of trunk + Magenta LED crown halo
    bm_led_gold = bmesh.new()
    ring_pts_gold = []
    r_gold = r_top_cage * 1.05
    z_gold = trunk_height - 0.15
    for i in range(40 + 1):
        ang = 2.0 * math.pi * i / 40
        ring_pts_gold.append((r_gold * math.cos(ang), r_gold * math.sin(ang), z_gold))
    add_polyline_tube_bmesh(bm_led_gold, ring_pts_gold, 0.14, segments=8)

    mesh_led_gold = bpy.data.meshes.new(f"{root_name}_LED_Gold_Collar")
    bm_led_gold.to_mesh(mesh_led_gold)
    bm_led_gold.free()
    obj_led_gold = bpy.data.objects.new(f"{root_name}_LED_Gold_Collar", mesh_led_gold)
    bpy.context.collection.objects.link(obj_led_gold)
    assign_material(obj_led_gold, led_gold_mat)
    parent_and_zero(obj_led_gold, root)

    bm_led_mag = bmesh.new()
    ring_pts_mag = []
    r_mag = r_canopy_outer * 0.78
    z_mag = z_crown_start + (z_crown_end - z_crown_start) * 0.76
    for i in range(48 + 1):
        ang = 2.0 * math.pi * i / 48
        ring_pts_mag.append((r_mag * math.cos(ang), r_mag * math.sin(ang), z_mag))
    add_polyline_tube_bmesh(bm_led_mag, ring_pts_mag, 0.11, segments=8)

    mesh_led_mag = bpy.data.meshes.new(f"{root_name}_LED_Crown_Halo")
    bm_led_mag.to_mesh(mesh_led_mag)
    bm_led_mag.free()
    obj_led_mag = bpy.data.objects.new(f"{root_name}_LED_Crown_Halo", mesh_led_mag)
    bpy.context.collection.objects.link(obj_led_mag)
    assign_material(obj_led_mag, led_magenta_mat)
    parent_and_zero(obj_led_mag, root)

    return root


# ---------------------------------------------------------------------------
# 3. UNDERSTOREY TIMBER DOME (Geodesic Timber Diagrid + Glass Dome + Planter Base)
# ---------------------------------------------------------------------------

def shortest_angle_diff(a, b):
    return math.atan2(math.sin(a - b), math.cos(a - b))


def build_understorey_timber_dome(timber_mat, white_arch_mat, glass_mat, sandstone_mat, foliage_mat):
    root = create_root_empty("Understorey_Timber_Dome")
    r_dome = 3.8
    h_dome = 3.4
    door_local_angle = -2.419  # Math.atan2(-14.5, -16.5)

    # 1. Geodesic Timber Diagrid Dome with sculpted arched bays & open entrance doorway
    bm_grid = bmesh.new()
    bmesh.ops.create_icosphere(bm_grid, subdivisions=3, radius=r_dome)

    # Remove lower hemisphere first
    f_low = [f for f in bm_grid.faces if f.calc_center_median().z < 0.05]
    bmesh.ops.delete(bm_grid, geom=f_low, context='FACES')

    # Scale Z so height is ~3.4m and lift slightly onto the base
    for v in bm_grid.verts:
        if v.co.z < 0.15:
            v.co.z = 0.15
        v.co.z = v.co.z * (h_dome / r_dome)

    # Carve open entrance doorway (z < 2.6m, diff from -2.419 < 0.52 rad) + smaller perimeter scalloped bays
    faces_to_del = []
    for f in bm_grid.faces:
        center = f.calc_center_median()
        three_ang = math.atan2(-center.y, center.x)
        if center.z < 2.6 and abs(shortest_angle_diff(three_ang, door_local_angle)) < 0.52:
            faces_to_del.append(f)
        else:
            ang = math.atan2(center.y, center.x)
            arch_wave = max(0.0, math.cos(ang * 6.0))
            if center.z < 0.76 * arch_wave:
                faces_to_del.append(f)
    bmesh.ops.delete(bm_grid, geom=faces_to_del, context='FACES')

    mesh_grid = bpy.data.meshes.new("Understorey_Timber_Diagrid")
    bm_grid.to_mesh(mesh_grid)
    bm_grid.free()
    obj_grid = bpy.data.objects.new("Understorey_Timber_Diagrid", mesh_grid)
    bpy.context.collection.objects.link(obj_grid)

    wf = obj_grid.modifiers.new(name="TimberWireframe", type='WIREFRAME')
    wf.thickness = 0.12
    wf.use_replace = True
    wf.use_even_offset = True
    wf.use_boundary = True
    apply_all_modifiers(obj_grid)
    assign_material(obj_grid, timber_mat)
    parent_and_zero(obj_grid, root)

    # 2. Sculpted White Scalloped Perimeter Arch Ring (raises to 2.65m over entrance doorway)
    bm_arch = bmesh.new()
    arch_segs = 96
    arch_pts = []
    for i in range(arch_segs + 1):
        ang = 2.0 * math.pi * i / arch_segs
        wave = max(0.0, math.cos(ang * 6.0))
        z_a = 0.18 + 0.92 * pow(wave, 1.4)
        three_ang = math.atan2(-math.sin(ang), math.cos(ang))
        d_door = abs(shortest_angle_diff(three_ang, door_local_angle))
        if d_door < 0.58:
            door_arch_z = 0.18 + 2.50 * math.cos((d_door / 0.58) * (math.pi * 0.5))
            z_a = max(z_a, door_arch_z)
        r_a = math.sqrt(max(0.5, r_dome * r_dome - pow(min(h_dome * 0.96, z_a) * (r_dome / h_dome), 2)))
        arch_pts.append((r_a * math.cos(ang), r_a * math.sin(ang), z_a))
    add_polyline_tube_bmesh(bm_arch, arch_pts, 0.11, segments=8)

    mesh_arch = bpy.data.meshes.new("Understorey_Perimeter_Arches")
    bm_arch.to_mesh(mesh_arch)
    bm_arch.free()
    obj_arch = bpy.data.objects.new("Understorey_Perimeter_Arches", mesh_arch)
    bpy.context.collection.objects.link(obj_arch)
    assign_material(obj_arch, white_arch_mat)
    set_smooth(obj_arch, True)
    parent_and_zero(obj_arch, root)

    # 3. Inner Translucent Glass Dome (with matching open entrance doorway cutout)
    bm_glass = bmesh.new()
    bmesh.ops.create_icosphere(bm_glass, subdivisions=3, radius=r_dome * 0.95)
    f_del = [f for f in bm_glass.faces if f.calc_center_median().z < 0.15]
    bmesh.ops.delete(bm_glass, geom=f_del, context='FACES')
    for v in bm_glass.verts:
        if v.co.z < 0.18:
            v.co.z = 0.18
        v.co.z = v.co.z * (h_dome / r_dome)

    f_door_glass = [
        f for f in bm_glass.faces
        if f.calc_center_median().z < 2.6
        and abs(shortest_angle_diff(math.atan2(-f.calc_center_median().y, f.calc_center_median().x), door_local_angle)) < 0.52
    ]
    bmesh.ops.delete(bm_glass, geom=f_door_glass, context='FACES')

    mesh_glass = bpy.data.meshes.new("Understorey_Inner_Glass")
    bm_glass.to_mesh(mesh_glass)
    bm_glass.free()
    obj_glass = bpy.data.objects.new("Understorey_Inner_Glass", mesh_glass)
    bpy.context.collection.objects.link(obj_glass)
    assign_material(obj_glass, glass_mat)
    set_smooth(obj_glass, True)
    parent_and_zero(obj_glass, root)

    # 4. Circular Sandstone Planter Base + Interior Shrubs
    bm_base = bmesh.new()
    res = bmesh.ops.create_cone(
        bm_base,
        cap_ends=True,
        cap_tris=False,
        segments=40,
        radius1=r_dome + 0.35,
        radius2=r_dome + 0.20,
        depth=0.28
    )
    for v in res['verts']:
        v.co.z += 0.14

    mesh_base = bpy.data.meshes.new("Understorey_Sandstone_Base")
    bm_base.to_mesh(mesh_base)
    bm_base.free()
    obj_base = bpy.data.objects.new("Understorey_Sandstone_Base", mesh_base)
    bpy.context.collection.objects.link(obj_base)
    assign_material(obj_base, sandstone_mat)
    parent_and_zero(obj_base, root)

    return root


# ---------------------------------------------------------------------------
# 4. FLOWER DOME CONSERVATORY (~28m length, ~19m width, ~9.5m height)
# ---------------------------------------------------------------------------

def flower_dome_surface_point(u, v):
    """
    Parametric asymmetric biomorphic seashell dome:
    u in [0, 1] (elevation from base 0 to apex 1)
    v in [0, 2*pi] (azimuth angle)
    Length ~28m along X (-14..+14), Width ~19m along Y (-9.5..+9.5), Height ~9.5m along Z.
    """
    theta = u * (math.pi * 0.5)
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)

    # Asymmetric seashell longitudinal shift & terraced wave
    asym_x = 1.35 * sin_t * (1.0 - 0.3 * sin_t)
    shell_rib_mod = 1.0 + 0.025 * math.cos(v * 8.0) * cos_t

    rx = 14.0 * shell_rib_mod
    ry = 9.5 * (1.0 - 0.08 * math.cos(v)) * shell_rib_mod
    hz = 9.5 * (1.0 + 0.06 * math.sin(v * 2.0) * sin_t)

    x = rx * cos_t * math.cos(v) + asym_x
    y = ry * cos_t * math.sin(v)
    z = hz * pow(sin_t, 0.88)
    return Vector((x, y, z))


def is_in_flower_dome_doorway(pt_x, pt_y, pt_z):
    if pt_z >= 3.4:
        return False
    three_ang = math.atan2(-pt_y, pt_x)
    return abs(shortest_angle_diff(three_ang, 0.54)) < 0.34


def build_flower_dome_conservatory(glass_mat, white_steel_mat, concrete_mat,
                                   med_earth_mat, olive_mat, cypress_mat, blossom_mat):
    root = create_root_empty("Flower_Dome_Conservatory")

    # 1. Child mesh: Flower_Dome_Glass
    bm_glass = bmesh.new()
    n_u = 16
    n_v = 36
    rings = []
    for iu in range(n_u):
        u = 0.04 + (0.96 * iu / n_u)  # Start at z ~ 0.6m above concrete base wall
        ring = []
        for iv in range(n_v):
            v = 2.0 * math.pi * iv / n_v
            pt = flower_dome_surface_point(u, v) * 0.992
            ring.append(bm_glass.verts.new(pt))
        rings.append(ring)

    apex_vert = bm_glass.verts.new(flower_dome_surface_point(1.0, 0.0) * 0.992)

    for iu in range(n_u - 1):
        rA = rings[iu]
        rB = rings[iu + 1]
        for iv in range(n_v):
            inext = (iv + 1) % n_v
            bm_glass.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))

    top_ring = rings[-1]
    for iv in range(n_v):
        inext = (iv + 1) % n_v
        bm_glass.faces.new((top_ring[iv], top_ring[inext], apex_vert))

    f_door_fd_glass = [
        f for f in bm_glass.faces
        if is_in_flower_dome_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_glass, geom=f_door_fd_glass, context='FACES')

    mesh_glass = bpy.data.meshes.new("Flower_Dome_Glass")
    bm_glass.to_mesh(mesh_glass)
    bm_glass.free()
    obj_glass = bpy.data.objects.new("Flower_Dome_Glass", mesh_glass)
    bpy.context.collection.objects.link(obj_glass)
    assign_material(obj_glass, glass_mat)
    set_smooth(obj_glass, True)
    parent_and_zero(obj_glass, root)

    # 2. Child mesh: Flower_Dome_Steel_Grid (WIREFRAME gridshell + prominent arched external spine ribs)
    bm_shell = bmesh.new()
    grid_u = 10
    grid_v = 28
    g_rings = []
    for iu in range(grid_u):
        u = 0.03 + (0.97 * iu / grid_u)
        ring = []
        for iv in range(grid_v):
            v = 2.0 * math.pi * iv / grid_v
            pt = flower_dome_surface_point(u, v)
            ring.append(bm_shell.verts.new(pt))
        g_rings.append(ring)
    g_apex = bm_shell.verts.new(flower_dome_surface_point(1.0, 0.0))

    for iu in range(grid_u - 1):
        rA = g_rings[iu]
        rB = g_rings[iu + 1]
        for iv in range(grid_v):
            inext = (iv + 1) % grid_v
            bm_shell.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))
    for iv in range(grid_v):
        inext = (iv + 1) % grid_v
        bm_shell.faces.new((g_rings[-1][iv], g_rings[-1][inext], g_apex))

    f_door_fd_grid = [
        f for f in bm_shell.faces
        if is_in_flower_dome_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_shell, geom=f_door_fd_grid, context='FACES')

    # Triangulate/poke lower-mid faces for authentic gridshell lattice
    bmesh.ops.poke(bm_shell, faces=[f for f in bm_shell.faces if len(f.verts) == 4])

    mesh_grid = bpy.data.meshes.new("Flower_Dome_Steel_Grid")
    bm_shell.to_mesh(mesh_grid)
    bm_shell.free()
    obj_grid = bpy.data.objects.new("Flower_Dome_Steel_Grid", mesh_grid)
    bpy.context.collection.objects.link(obj_grid)

    wf = obj_grid.modifiers.new(name="FlowerDomeWireframe", type='WIREFRAME')
    wf.thickness = 0.16
    wf.use_replace = True
    wf.use_even_offset = True
    wf.use_boundary = True
    apply_all_modifiers(obj_grid)

    # Append the iconic prominent transverse white structural arch ribs across the dome shell
    bm_ribs = bmesh.new()
    bm_ribs.from_mesh(obj_grid.data)

    num_arch_ribs = 11
    arch_samples = 28
    for ia in range(num_arch_ribs):
        # Span x from -12.0m to +12.0m
        x_plane = -11.8 + 23.6 * (ia / (num_arch_ribs - 1))
        x_norm = x_plane / 14.0
        if abs(x_norm) >= 0.96:
            continue
        max_y = 9.5 * math.sqrt(max(0.01, 1.0 - x_norm * x_norm))
        max_z = 9.5 * pow(max(0.01, 1.0 - x_norm * x_norm), 0.46) + 0.32
        arch_pts = []
        for s in range(arch_samples + 1):
            ang = math.pi * (s / arch_samples)  # 0 to pi across Y
            y = max_y * math.cos(ang) * 1.02
            z = max(0.2, max_z * math.sin(ang) * 1.025)
            # Slight seashell forward sweep on arch
            x_sweep = x_plane + 0.65 * math.sin(ang)
            if is_in_flower_dome_doorway(x_sweep, y, z):
                if len(arch_pts) >= 2:
                    add_polyline_tube_bmesh(bm_ribs, arch_pts, 0.22, segments=8)
                arch_pts = []
            else:
                arch_pts.append((x_sweep, y, z))
        if len(arch_pts) >= 2:
            add_polyline_tube_bmesh(bm_ribs, arch_pts, 0.22, segments=8)

    bm_ribs.to_mesh(obj_grid.data)
    bm_ribs.free()
    assign_material(obj_grid, white_steel_mat)
    parent_and_zero(obj_grid, root)

    # 3. Child mesh: Flower_Dome_Base_And_Flora (Concrete base ring + interior Mediterranean garden)
    bm_base = bmesh.new()
    # Elliptical concrete perimeter base ring (z = 0..1.1m)
    base_segs = 48
    b_out_bot, b_out_top, b_in_top, b_in_bot = [], [], [], []
    for i in range(base_segs):
        v = 2.0 * math.pi * i / base_segs
        pt_out = flower_dome_surface_point(0.0, v) * 1.02
        pt_in = flower_dome_surface_point(0.0, v) * 0.90
        b_out_bot.append(bm_base.verts.new((pt_out.x, pt_out.y, 0.0)))
        b_out_top.append(bm_base.verts.new((pt_out.x, pt_out.y, 1.1)))
        b_in_top.append(bm_base.verts.new((pt_in.x, pt_in.y, 1.1)))
        b_in_bot.append(bm_base.verts.new((pt_in.x, pt_in.y, 0.0)))

    for i in range(base_segs):
        inext = (i + 1) % base_segs
        bm_base.faces.new((b_out_bot[i], b_out_bot[inext], b_out_top[inext], b_out_top[i]))
        bm_base.faces.new((b_out_top[i], b_out_top[inext], b_in_top[inext], b_in_top[i]))
        bm_base.faces.new((b_in_top[i], b_in_top[inext], b_in_bot[inext], b_in_bot[i]))

    f_door_fd_base = [
        f for f in bm_base.faces
        if is_in_flower_dome_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_base, geom=f_door_fd_base, context='FACES')

    # Add interior terraced garden mounds, miniature olive trees, cypress cones, and floral beds
    # Material indices on Flower_Dome_Base_And_Flora:
    # 0 = concrete_mat, 1 = med_earth_mat, 2 = olive_mat, 3 = cypress_mat, 4 = blossom_mat
    def tag_new_faces(bm_target, mat_idx, prev_count):
        bm_target.faces.ensure_lookup_table()
        for f in bm_target.faces[prev_count:]:
            f.material_index = mat_idx

    # Terraced earth mounds
    mound_specs = [
        ((-3.5, 0.0, 0.4), (5.5, 4.2, 0.9)),
        ((4.0, -1.8, 0.35), (4.8, 3.6, 0.75)),
        ((3.2, 2.5, 0.35), (4.2, 3.0, 0.7))
    ]
    for center, scl in mound_specs:
        fc = len(bm_base.faces)
        add_icosphere_cluster_bmesh(bm_base, center, radius=1.0, scale_xyz=scl, subdivisions=2)
        tag_new_faces(bm_base, 1, fc)

    # Olive tree crowns & trunks
    olive_positions = [(-5.0, -1.5, 2.4), (-2.0, 2.2, 2.7), (2.5, -2.5, 2.3), (6.0, 1.2, 2.1)]
    for ox, oy, oz in olive_positions:
        fc = len(bm_base.faces)
        add_tube_segment_bmesh(bm_base, (ox, oy, 0.4), (ox, oy, oz), 0.22, 0.14, segments=6, cap_ends=True)
        tag_new_faces(bm_base, 1, fc)
        fc = len(bm_base.faces)
        add_icosphere_cluster_bmesh(bm_base, (ox, oy, oz + 0.4), radius=1.15, scale_xyz=(1.3, 1.2, 0.85), subdivisions=1)
        tag_new_faces(bm_base, 2, fc)

    # Mediterranean Cypress Cones
    cypress_positions = [(-7.5, 1.0, 0.5), (-6.2, -2.5, 0.5), (0.5, 3.8, 0.5), (7.5, -1.0, 0.5)]
    for cx, cy, cz in cypress_positions:
        fc = len(bm_base.faces)
        res_c = bmesh.ops.create_cone(
            bm_base, cap_ends=True, cap_tris=False, segments=10,
            radius1=0.65, radius2=0.08, depth=3.2
        )
        for v in res_c['verts']:
            v.co.x += cx
            v.co.y += cy
            v.co.z += cz + 1.6
        tag_new_faces(bm_base, 3, fc)

    # Colourful Flower Field Beds inside the dome
    blossom_positions = [
        (-3.2, -0.5, 1.15), (-1.0, -2.2, 0.95), (1.8, 0.4, 1.05),
        (4.5, -1.2, 1.0), (4.0, 2.2, 0.95), (-4.5, 2.0, 1.0)
    ]
    for bx, by, bz in blossom_positions:
        fc = len(bm_base.faces)
        add_icosphere_cluster_bmesh(bm_base, (bx, by, bz), radius=0.95, scale_xyz=(1.4, 1.2, 0.42), subdivisions=1)
        tag_new_faces(bm_base, 4, fc)

    mesh_base = bpy.data.meshes.new("Flower_Dome_Base_And_Flora")
    bm_base.to_mesh(mesh_base)
    bm_base.free()
    obj_base = bpy.data.objects.new("Flower_Dome_Base_And_Flora", mesh_base)
    bpy.context.collection.objects.link(obj_base)
    for m in (concrete_mat, med_earth_mat, olive_mat, cypress_mat, blossom_mat):
        obj_base.data.materials.append(m)
    set_smooth(obj_base, True)
    parent_and_zero(obj_base, root)

    return root


# ---------------------------------------------------------------------------
# 5. CLOUD FOREST CONSERVATORY (~19m length, ~15m width, ~16.5m height)
# ---------------------------------------------------------------------------

def cloud_forest_surface_point(u, v):
    """
    Tall soaring asymmetric biomorphic conservatory shell:
    Length ~19m along X (-9.5..+9.5), Width ~15m along Y (-7.5..+7.5), Height ~16.5m along Z.
    """
    theta = u * (math.pi * 0.5)
    sin_t = math.sin(theta)
    cos_t = math.cos(theta)

    # Slight forward lean toward the waterfall viewing facade (-X)
    lean_x = -0.85 * sin_t * (1.0 - 0.25 * sin_t)
    rx = 9.5 * (1.0 + 0.02 * math.cos(v * 6.0) * cos_t)
    ry = 7.5 * (1.0 - 0.05 * math.sin(v))
    hz = 16.5

    x = rx * cos_t * math.cos(v) + lean_x
    y = ry * cos_t * math.sin(v)
    z = hz * pow(sin_t, 0.82)
    return Vector((x, y, z))


def is_in_cloud_forest_doorway(pt_x, pt_y, pt_z):
    if pt_z >= 3.5:
        return False
    three_ang = math.atan2(-pt_y, pt_x)
    return abs(shortest_angle_diff(three_ang, -2.767)) < 0.36


def build_cloud_forest_conservatory(
    glass_mat, white_steel_mat, concrete_mat,
    mountain_rock_mat, emerald_mat, lime_mat,
    walkway_mat, waterfall_mat, pool_mat
):
    root = create_root_empty("Cloud_Forest_Conservatory")

    # 1. Child mesh: Cloud_Forest_Glass
    bm_glass = bmesh.new()
    n_u = 18
    n_v = 32
    rings = []
    for iu in range(n_u):
        u = 0.03 + (0.97 * iu / n_u)
        ring = []
        for iv in range(n_v):
            v = 2.0 * math.pi * iv / n_v
            pt = cloud_forest_surface_point(u, v) * 0.992
            ring.append(bm_glass.verts.new(pt))
        rings.append(ring)
    apex_v = bm_glass.verts.new(cloud_forest_surface_point(1.0, 0.0) * 0.992)

    for iu in range(n_u - 1):
        rA = rings[iu]
        rB = rings[iu + 1]
        for iv in range(n_v):
            inext = (iv + 1) % n_v
            bm_glass.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))
    for iv in range(n_v):
        inext = (iv + 1) % n_v
        bm_glass.faces.new((rings[-1][iv], rings[-1][inext], apex_v))

    f_door_cf_glass = [
        f for f in bm_glass.faces
        if is_in_cloud_forest_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_glass, geom=f_door_cf_glass, context='FACES')

    mesh_glass = bpy.data.meshes.new("Cloud_Forest_Glass")
    bm_glass.to_mesh(mesh_glass)
    bm_glass.free()
    obj_glass = bpy.data.objects.new("Cloud_Forest_Glass", mesh_glass)
    bpy.context.collection.objects.link(obj_glass)
    assign_material(obj_glass, glass_mat)
    set_smooth(obj_glass, True)
    parent_and_zero(obj_glass, root)

    # 2. Child mesh: Cloud_Forest_Steel_Grid (WIREFRAME modifier + soaring external white arch ribs)
    bm_shell = bmesh.new()
    grid_u = 12
    grid_v = 24
    g_rings = []
    for iu in range(grid_u):
        u = 0.02 + (0.98 * iu / grid_u)
        ring = []
        for iv in range(grid_v):
            v = 2.0 * math.pi * iv / grid_v
            pt = cloud_forest_surface_point(u, v)
            ring.append(bm_shell.verts.new(pt))
        g_rings.append(ring)
    g_apex = bm_shell.verts.new(cloud_forest_surface_point(1.0, 0.0))

    for iu in range(grid_u - 1):
        rA = g_rings[iu]
        rB = g_rings[iu + 1]
        for iv in range(grid_v):
            inext = (iv + 1) % grid_v
            bm_shell.faces.new((rA[iv], rA[inext], rB[inext], rB[iv]))
    for iv in range(grid_v):
        inext = (iv + 1) % grid_v
        bm_shell.faces.new((g_rings[-1][iv], g_rings[-1][inext], g_apex))

    f_door_cf_grid = [
        f for f in bm_shell.faces
        if is_in_cloud_forest_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_shell, geom=f_door_cf_grid, context='FACES')

    bmesh.ops.poke(bm_shell, faces=[f for f in bm_shell.faces if len(f.verts) == 4])

    mesh_grid = bpy.data.meshes.new("Cloud_Forest_Steel_Grid")
    bm_shell.to_mesh(mesh_grid)
    bm_shell.free()
    obj_grid = bpy.data.objects.new("Cloud_Forest_Steel_Grid", mesh_grid)
    bpy.context.collection.objects.link(obj_grid)

    wf = obj_grid.modifiers.new(name="CloudForestWireframe", type='WIREFRAME')
    wf.thickness = 0.16
    wf.use_replace = True
    wf.use_even_offset = True
    wf.use_boundary = True
    apply_all_modifiers(obj_grid)

    # Append 9 soaring exterior structural arch ribs matching the studio reference sheet
    bm_ribs = bmesh.new()
    bm_ribs.from_mesh(obj_grid.data)
    num_arch_ribs = 9
    arch_samples = 30
    for ia in range(num_arch_ribs):
        x_plane = -8.0 + 16.0 * (ia / (num_arch_ribs - 1))
        x_norm = x_plane / 9.5
        if abs(x_norm) >= 0.96:
            continue
        max_y = 7.5 * math.sqrt(max(0.01, 1.0 - x_norm * x_norm))
        max_z = 16.5 * pow(max(0.01, 1.0 - x_norm * x_norm), 0.44) + 0.35
        arch_pts = []
        for s in range(arch_samples + 1):
            ang = math.pi * (s / arch_samples)
            y = max_y * math.cos(ang) * 1.025
            z = max(0.15, max_z * math.sin(ang) * 1.025)
            x_sweep = x_plane - 0.55 * math.sin(ang)
            if is_in_cloud_forest_doorway(x_sweep, y, z):
                if len(arch_pts) >= 2:
                    add_polyline_tube_bmesh(bm_ribs, arch_pts, 0.22, segments=8)
                arch_pts = []
            else:
                arch_pts.append((x_sweep, y, z))
        if len(arch_pts) >= 2:
            add_polyline_tube_bmesh(bm_ribs, arch_pts, 0.22, segments=8)

    bm_ribs.to_mesh(obj_grid.data)
    bm_ribs.free()
    assign_material(obj_grid, white_steel_mat)
    parent_and_zero(obj_grid, root)

    # 3. Child mesh: Cloud_Forest_Mountain (5-tier emerald Cloud Mountain + epiphyte foliage + spiraling Cloud Walk)
    bm_mtn = bmesh.new()
    # Material slots: 0 = mountain_rock_mat, 1 = emerald_mat, 2 = lime_mat, 3 = walkway_mat, 4 = concrete_mat

    def tag_faces(bm_target, mat_idx, prev_count):
        bm_target.faces.ensure_lookup_table()
        for f in bm_target.faces[prev_count:]:
            f.material_index = mat_idx

    # Concrete perimeter base ring (z = 0..0.95m)
    fc = len(bm_mtn.faces)
    base_segs = 40
    b_out_bot, b_out_top, b_in_top, b_in_bot = [], [], [], []
    for i in range(base_segs):
        v = 2.0 * math.pi * i / base_segs
        pt_out = cloud_forest_surface_point(0.0, v) * 1.01
        pt_in = cloud_forest_surface_point(0.0, v) * 0.90
        b_out_bot.append(bm_mtn.verts.new((pt_out.x, pt_out.y, 0.0)))
        b_out_top.append(bm_mtn.verts.new((pt_out.x, pt_out.y, 0.95)))
        b_in_top.append(bm_mtn.verts.new((pt_in.x, pt_in.y, 0.95)))
        b_in_bot.append(bm_mtn.verts.new((pt_in.x, pt_in.y, 0.0)))
    for i in range(base_segs):
        inext = (i + 1) % base_segs
        bm_mtn.faces.new((b_out_bot[i], b_out_bot[inext], b_out_top[inext], b_out_top[i]))
        bm_mtn.faces.new((b_out_top[i], b_out_top[inext], b_in_top[inext], b_in_top[i]))
        bm_mtn.faces.new((b_in_top[i], b_in_top[inext], b_in_bot[inext], b_in_bot[i]))
    tag_faces(bm_mtn, 4, fc)

    f_door_cf_base = [
        f for f in bm_mtn.faces
        if is_in_cloud_forest_doorway(f.calc_center_median().x, f.calc_center_median().y, f.calc_center_median().z)
    ]
    bmesh.ops.delete(bm_mtn, geom=f_door_cf_base, context='FACES')

    # 5-Tier Cloud Mountain core & lush botanical tiers (z = 0..13.0m, scaled 0.48x horizontally for spacious indoor walkway)
    tier_specs = [
        # (z_bottom, height, r_bot, r_top, center_x, center_y)
        (0.0, 3.0, 5.2 * 0.48, 4.4 * 0.48, 0.8 * 0.48, 0.0),
        (2.8, 2.8, 4.3 * 0.48, 3.5 * 0.48, 0.7 * 0.48, 0.1 * 0.48),
        (5.4, 2.7, 3.4 * 0.48, 2.7 * 0.48, 0.5 * 0.48, 0.0),
        (7.9, 2.6, 2.6 * 0.48, 1.9 * 0.48, 0.3 * 0.48, -0.1 * 0.48),
        (10.3, 2.7, 1.8 * 0.48, 1.15 * 0.48, 0.2 * 0.48, 0.0),
    ]
    for idx_t, (zb, h, rb, rt, cx, cy) in enumerate(tier_specs):
        fc = len(bm_mtn.faces)
        res = bmesh.ops.create_cone(
            bm_mtn, cap_ends=True, cap_tris=False, segments=20,
            radius1=rb, radius2=rt, depth=h
        )
        for v in res['verts']:
            v.co.x += cx
            v.co.y += cy
            v.co.z += zb + h * 0.5
        tag_faces(bm_mtn, 0 if idx_t % 2 == 0 else 1, fc)

        # Wrap each tier in lush emerald & lime fern/epiphyte foliage spheres (scaled 0.48x to stay clear of walkway)
        num_clusters = 14 - idx_t * 2
        for ic in range(num_clusters):
            ang = 2.0 * math.pi * ic / num_clusters + idx_t * 0.4
            # Leave front channel (-X around pi) slightly recessed for the waterfall plunge
            if abs(ang - math.pi) < 0.32 and idx_t < 4:
                continue
            r_mid = (rb + rt) * 0.5
            fx = cx + r_mid * math.cos(ang)
            fy = cy + r_mid * math.sin(ang)
            fz = zb + h * 0.55 + 0.2 * math.sin(ic * 1.9)
            fc = len(bm_mtn.faces)
            add_icosphere_cluster_bmesh(
                bm_mtn,
                (fx, fy, fz),
                radius=(0.85 - idx_t * 0.08) * 0.52,
                scale_xyz=(1.1, 1.1, 0.85),
                subdivisions=1
            )
            tag_faces(bm_mtn, 1 if (ic + idx_t) % 2 == 0 else 2, fc)

    # Crown foliage cap on top of Cloud Mountain (z = 12.8..13.5m)
    for ic in range(8):
        ang = 2.0 * math.pi * ic / 8
        fc = len(bm_mtn.faces)
        add_icosphere_cluster_bmesh(
            bm_mtn,
            (0.2 * 0.48 + 0.9 * 0.48 * math.cos(ang), 0.9 * 0.48 * math.sin(ang), 13.0),
            radius=0.72 * 0.55,
            scale_xyz=(1.1, 1.1, 0.75),
            subdivisions=1
        )
        tag_faces(bm_mtn, 2 if ic % 2 == 0 else 1, fc)

    # Spiraling Cloud Walk Aerial Walkway wrapping around the mountain (z = 3.2m to 11.8m, overhead clear of floor)
    fc = len(bm_mtn.faces)
    walk_pts = []
    walk_steps = 56
    for s in range(walk_steps + 1):
        t = s / walk_steps
        ang = 0.4 + t * (3.2 * math.pi)
        z_w = 3.2 + t * 8.6
        r_w = (3.4 - t * 1.8)
        walk_pts.append((0.38 + r_w * math.cos(ang), r_w * math.sin(ang), z_w))
    add_polyline_tube_bmesh(bm_mtn, walk_pts, 0.22, segments=6)
    tag_faces(bm_mtn, 3, fc)

    mesh_mtn = bpy.data.meshes.new("Cloud_Forest_Mountain")
    bm_mtn.to_mesh(mesh_mtn)
    bm_mtn.free()
    obj_mtn = bpy.data.objects.new("Cloud_Forest_Mountain", mesh_mtn)
    bpy.context.collection.objects.link(obj_mtn)
    for m in (mountain_rock_mat, emerald_mat, lime_mat, walkway_mat, concrete_mat):
        obj_mtn.data.materials.append(m)
    set_smooth(obj_mtn, True)
    parent_and_zero(obj_mtn, root)

    # 4. Child mesh: Cloud_Forest_Waterfall (Glowing cyan-white waterfall + turquoise mist pool at base)
    bm_wf = bmesh.new()
    # Material slots: 0 = waterfall_mat (glowing cyan), 1 = pool_mat (turquoise water)

    # Plunging waterfall column from top tier (z=12.6m) down to base pool (z=0.2m) on the -X facade
    wf_pts = [
        (-0.9, 0.0, 12.6),
        (-1.6, 0.0, 11.8),
        (-2.2, 0.0, 9.2),
        (-2.7, 0.0, 6.0),
        (-3.1, 0.0, 3.0),
        (-3.4, 0.0, 0.25),
    ]
    wf_radii = [0.55, 0.68, 0.78, 0.88, 0.98, 1.15]
    add_polyline_tube_bmesh(bm_wf, wf_pts, wf_radii, segments=12)

    # Mist & foam splash rings at waterfall base
    for r_splash, z_s in ((1.45, 0.32), (2.1, 0.24)):
        add_icosphere_cluster_bmesh(
            bm_wf,
            (-3.4, 0.0, z_s),
            radius=r_splash,
            scale_xyz=(1.0, 1.25, 0.18),
            subdivisions=2
        )

    # Turquoise Mist Pool at the base
    fc_pool = len(bm_wf.faces)
    res_pool = bmesh.ops.create_cone(
        bm_wf, cap_ends=True, cap_tris=False, segments=28,
        radius1=3.2, radius2=3.1, depth=0.22
    )
    for v in res_pool['verts']:
        v.co.x = v.co.x * 0.95 - 3.6
        v.co.y = v.co.y * 1.18
        v.co.z += 0.12
    bm_wf.faces.ensure_lookup_table()
    for f in bm_wf.faces[fc_pool:]:
        f.material_index = 1

    mesh_wf = bpy.data.meshes.new("Cloud_Forest_Waterfall")
    bm_wf.to_mesh(mesh_wf)
    bm_wf.free()
    obj_wf = bpy.data.objects.new("Cloud_Forest_Waterfall", mesh_wf)
    bpy.context.collection.objects.link(obj_wf)
    obj_wf.data.materials.append(waterfall_mat)
    obj_wf.data.materials.append(pool_mat)
    set_smooth(obj_wf, True)
    parent_and_zero(obj_wf, root)

    return root


# ---------------------------------------------------------------------------
# 6. BAY EAST SKYLIGHT PAVILION (~6.5m radius, ~4.0m height)
# ---------------------------------------------------------------------------

def build_bay_east_skylight_pavilion(white_roof_mat, glass_mat, steel_frame_mat, sandstone_mat):
    root = create_root_empty("Bay_East_Skylight_Pavilion")

    # 1. Warm Sandstone Stepped Plaza Base (r ~ 6.5m, z = 0..0.42m)
    bm_base = bmesh.new()
    res1 = bmesh.ops.create_cone(
        bm_base, cap_ends=True, cap_tris=False, segments=48,
        radius1=6.5, radius2=6.35, depth=0.22
    )
    for v in res1['verts']:
        v.co.z += 0.11

    res2 = bmesh.ops.create_cone(
        bm_base, cap_ends=True, cap_tris=False, segments=48,
        radius1=5.9, radius2=5.75, depth=0.20
    )
    for v in res2['verts']:
        v.co.z += 0.32

    mesh_base = bpy.data.meshes.new("Bay_East_Sandstone_Base")
    bm_base.to_mesh(mesh_base)
    bm_base.free()
    obj_base = bpy.data.objects.new("Bay_East_Sandstone_Base", mesh_base)
    bpy.context.collection.objects.link(obj_base)
    assign_material(obj_base, sandstone_mat)
    set_smooth(obj_base, True)
    parent_and_zero(obj_base, root)

    # 2. Sculpted White Lotus-Petal Tensile Roof Canopy + Supporting Columns
    bm_roof = bmesh.new()
    n_rad = 14
    n_ang = 60
    r_inner = 0.8
    r_outer = 6.2
    rings_top = []
    rings_bot = []

    for ir in range(n_rad + 1):
        t = ir / n_rad
        r = r_inner + t * (r_outer - r_inner)
        ring_t = []
        ring_b = []
        for ia in range(n_ang):
            ang = 2.0 * math.pi * ia / n_ang
            # 6 lotus-petal undulating ridges
            petal_wave = math.cos(ang * 6.0)
            r_mod = r * (1.0 + 0.08 * t * petal_wave)
            z_arch = 2.35 + 1.15 * math.sin(t * math.pi * 0.85) + 0.42 * t * petal_wave
            thickness = 0.18 * (1.0 - 0.45 * t)
            ring_t.append(bm_roof.verts.new((r_mod * math.cos(ang), r_mod * math.sin(ang), z_arch + thickness * 0.5)))
            ring_b.append(bm_roof.verts.new((r_mod * math.cos(ang), r_mod * math.sin(ang), z_arch - thickness * 0.5)))
        rings_top.append(ring_t)
        rings_bot.append(ring_b)

    for ir in range(n_rad):
        for ia in range(n_ang):
            inext = (ia + 1) % n_ang
            # Top surface
            bm_roof.faces.new((rings_top[ir][ia], rings_top[ir][inext], rings_top[ir + 1][inext], rings_top[ir + 1][ia]))
            # Bottom surface
            bm_roof.faces.new((rings_bot[ir + 1][ia], rings_bot[ir + 1][inext], rings_bot[ir][inext], rings_bot[ir][ia]))

    # Stitch inner and outer rims
    for ia in range(n_ang):
        inext = (ia + 1) % n_ang
        bm_roof.faces.new((rings_top[-1][ia], rings_top[-1][inext], rings_bot[-1][inext], rings_bot[-1][ia]))
        bm_roof.faces.new((rings_bot[0][ia], rings_bot[0][inext], rings_top[0][inext], rings_top[0][ia]))

    # 6 Tapered V-Columns supporting the tensile canopy valleys (offset so entrance bay is centered at atan2(-y,x) = 1.365 rad)
    for ic in range(6):
        ang = -1.365 + (2.0 * math.pi * (ic + 0.5) / 6.0)
        r_col_base = 3.9
        r_col_top = 4.3
        p_base = (r_col_base * math.cos(ang), r_col_base * math.sin(ang), 0.40)
        for branch in (-0.10, 0.10):
            p_top = (r_col_top * math.cos(ang + branch), r_col_top * math.sin(ang + branch), 2.75)
            add_tube_segment_bmesh(bm_roof, p_base, p_top, 0.14, 0.10, segments=8, cap_ends=True)

    mesh_roof = bpy.data.meshes.new("Bay_East_Lotus_Roof")
    bm_roof.to_mesh(mesh_roof)
    bm_roof.free()
    obj_roof = bpy.data.objects.new("Bay_East_Lotus_Roof", mesh_roof)
    bpy.context.collection.objects.link(obj_roof)
    assign_material(obj_roof, white_roof_mat)
    set_smooth(obj_roof, True)
    parent_and_zero(obj_roof, root)

    # 3. Three Geometric Glass Skylight Domes + Wireframe Steel Frames on top of the Pavilion
    bm_sky_glass = bmesh.new()
    bm_sky_frame = bmesh.new()

    for isk in range(3):
        ang = 2.0 * math.pi * isk / 3.0
        cx = 2.55 * math.cos(ang)
        cy = 2.55 * math.sin(ang)
        cz = 3.15
        r_sk = 1.45

        for target_bm in (bm_sky_glass, bm_sky_frame):
            res_ico = bmesh.ops.create_icosphere(target_bm, subdivisions=2, radius=r_sk)
            verts = res_ico['verts']
            for v in verts:
                if v.co.z < 0.0:
                    v.co.z = 0.0
                v.co.z *= 0.62
                v.co.x += cx
                v.co.y += cy
                v.co.z += cz

    # Remove flat bottom faces on frame mesh before wireframe
    f_del = [f for f in bm_sky_frame.faces if f.calc_center_median().z <= 3.16]
    bmesh.ops.delete(bm_sky_frame, geom=f_del, context='FACES')

    mesh_sky_glass = bpy.data.meshes.new("Bay_East_Skylight_Glass")
    bm_sky_glass.to_mesh(mesh_sky_glass)
    bm_sky_glass.free()
    obj_sky_glass = bpy.data.objects.new("Bay_East_Skylight_Glass", mesh_sky_glass)
    bpy.context.collection.objects.link(obj_sky_glass)
    assign_material(obj_sky_glass, glass_mat)
    set_smooth(obj_sky_glass, True)
    parent_and_zero(obj_sky_glass, root)

    mesh_sky_frame = bpy.data.meshes.new("Bay_East_Skylight_Frames")
    bm_sky_frame.to_mesh(mesh_sky_frame)
    bm_sky_frame.free()
    obj_sky_frame = bpy.data.objects.new("Bay_East_Skylight_Frames", mesh_sky_frame)
    bpy.context.collection.objects.link(obj_sky_frame)

    wf_sky = obj_sky_frame.modifiers.new(name="SkylightWireframe", type='WIREFRAME')
    wf_sky.thickness = 0.08
    wf_sky.use_replace = True
    wf_sky.use_even_offset = True
    apply_all_modifiers(obj_sky_frame)
    assign_material(obj_sky_frame, steel_frame_mat)
    parent_and_zero(obj_sky_frame, root)

    return root


# ---------------------------------------------------------------------------
# MAIN BUILD & GLB EXPORT
# ---------------------------------------------------------------------------

def main():
    clear_scene()

    # Create shared studio materials
    mat_concrete = create_material("Mat_Concrete_Warm", "#CBD5E1", metallic=0.05, roughness=0.75)
    mat_sandstone = create_material("Mat_Sandstone_Plaza", "#E2E8F0", metallic=0.05, roughness=0.68)
    mat_emerald = create_material("Mat_Foliage_Emerald", "#15803D", metallic=0.0, roughness=0.65)
    mat_lime = create_material("Mat_Foliage_Lime", "#4ADE80", metallic=0.0, roughness=0.58)
    mat_bromeliad = create_material("Mat_Foliage_Bromeliad", "#9D174D", metallic=0.05, roughness=0.50)

    # Supertree steel & solar/LED materials
    mat_supertree_hero_steel = create_material(
        "Mat_Supertree_Hero_Steel", "#C02678", metallic=0.65, roughness=0.28,
        emission_hex="#C02678", emission_strength=0.18
    )
    mat_supertree_med_steel = create_material(
        "Mat_Supertree_Med_Steel", "#9D174D", metallic=0.65, roughness=0.28,
        emission_hex="#9D174D", emission_strength=0.15
    )
    mat_solar_panel = create_material("Mat_Solar_Crown_Sapphire", "#1E1B4B", metallic=0.85, roughness=0.15)
    mat_led_gold = create_material(
        "Mat_LED_Gold_Rhapsody", "#F59E0B", metallic=0.3, roughness=0.2,
        emission_hex="#FBBF24", emission_strength=2.5
    )
    mat_led_magenta = create_material(
        "Mat_LED_Magenta_Rhapsody", "#EC4899", metallic=0.3, roughness=0.2,
        emission_hex="#F472B6", emission_strength=2.5
    )

    # Timber Dome materials
    mat_timber_cedar = create_material("Mat_Honey_Cedar_Timber", "#D97706", metallic=0.08, roughness=0.45)
    mat_understorey_glass = create_material("Mat_Understorey_Glass", "#38BDF8", metallic=0.1, roughness=0.08, alpha=0.35)

    # Conservatories & Pavilion materials
    mat_white_steel = create_material("Mat_White_Powder_Steel", "#F8FAFC", metallic=0.6, roughness=0.25)
    mat_flower_dome_glass = create_material("Mat_Flower_Dome_Glass", "#E0F2FE", metallic=0.1, roughness=0.05, alpha=0.38)
    mat_cloud_forest_glass = create_material("Mat_Cloud_Forest_Glass", "#BAE6FD", metallic=0.1, roughness=0.05, alpha=0.38)

    mat_med_earth = create_material("Mat_Mediterranean_Terrace", "#A16207", metallic=0.0, roughness=0.82)
    mat_olive_foliage = create_material("Mat_Olive_Crown", "#4D7C0F", metallic=0.0, roughness=0.62)
    mat_cypress_foliage = create_material("Mat_Cypress_Cone", "#14532D", metallic=0.0, roughness=0.60)
    mat_blossom_beds = create_material("Mat_Flower_Blossoms", "#F43F5E", metallic=0.0, roughness=0.48)

    mat_mountain_rock = create_material("Mat_Cloud_Mountain_Stone", "#065F46", metallic=0.05, roughness=0.72)
    mat_cloud_walkway = create_material("Mat_Cloud_Walkway_Steel", "#E11D48", metallic=0.55, roughness=0.32)
    mat_waterfall_glow = create_material(
        "Mat_Cloud_Waterfall_Cyan", "#67E8F9", metallic=0.05, roughness=0.12,
        emission_hex="#67E8F9", emission_strength=2.4
    )
    mat_mist_pool = create_material(
        "Mat_Turquoise_Mist_Pool", "#06B6D4", metallic=0.1, roughness=0.08,
        emission_hex="#22D3EE", emission_strength=0.6
    )

    mat_lotus_roof = create_material("Mat_Lotus_Tensile_White", "#FFFFFF", metallic=0.15, roughness=0.30)

    # 1. Build Supertree_Hero (~16.0m height)
    build_supertree(
        root_name="Supertree_Hero",
        total_height=16.0,
        trunk_height=11.5,
        r_base_cage=3.2,
        r_waist_cage=1.55,
        r_top_cage=3.0,
        r_canopy_outer=6.8,
        num_radial_ribs=24,
        num_foliage_rings=7,
        diagrid_mat=mat_supertree_hero_steel,
        crown_rib_mat=mat_supertree_hero_steel,
        concrete_mat=mat_concrete,
        emerald_mat=mat_emerald,
        lime_mat=mat_lime,
        bromeliad_mat=mat_bromeliad,
        solar_mat=mat_solar_panel,
        led_gold_mat=mat_led_gold,
        led_magenta_mat=mat_led_magenta
    )

    # 2. Build Supertree_Medium (~12.0m height)
    build_supertree(
        root_name="Supertree_Medium",
        total_height=12.0,
        trunk_height=8.6,
        r_base_cage=2.4,
        r_waist_cage=1.20,
        r_top_cage=2.25,
        r_canopy_outer=4.8,
        num_radial_ribs=20,
        num_foliage_rings=5,
        diagrid_mat=mat_supertree_med_steel,
        crown_rib_mat=mat_supertree_med_steel,
        concrete_mat=mat_concrete,
        emerald_mat=mat_emerald,
        lime_mat=mat_lime,
        bromeliad_mat=mat_bromeliad,
        solar_mat=mat_solar_panel,
        led_gold_mat=mat_led_gold,
        led_magenta_mat=mat_led_magenta
    )

    # 3. Build Understorey_Timber_Dome (~3.8m radius, ~3.4m height)
    build_understorey_timber_dome(
        timber_mat=mat_timber_cedar,
        white_arch_mat=mat_white_steel,
        glass_mat=mat_understorey_glass,
        sandstone_mat=mat_sandstone,
        foliage_mat=mat_emerald
    )

    # 4. Build Flower_Dome_Conservatory (~28m length, ~19m width, ~9.5m height)
    build_flower_dome_conservatory(
        glass_mat=mat_flower_dome_glass,
        white_steel_mat=mat_white_steel,
        concrete_mat=mat_concrete,
        med_earth_mat=mat_med_earth,
        olive_mat=mat_olive_foliage,
        cypress_mat=mat_cypress_foliage,
        blossom_mat=mat_blossom_beds
    )

    # 5. Build Cloud_Forest_Conservatory (~19m length, ~15m width, ~16.5m height)
    build_cloud_forest_conservatory(
        glass_mat=mat_cloud_forest_glass,
        white_steel_mat=mat_white_steel,
        concrete_mat=mat_concrete,
        mountain_rock_mat=mat_mountain_rock,
        emerald_mat=mat_emerald,
        lime_mat=mat_lime,
        walkway_mat=mat_cloud_walkway,
        waterfall_mat=mat_waterfall_glow,
        pool_mat=mat_mist_pool
    )

    # 6. Build Bay_East_Skylight_Pavilion (~6.5m radius, ~4.0m height)
    build_bay_east_skylight_pavilion(
        white_roof_mat=mat_lotus_roof,
        glass_mat=mat_understorey_glass,
        steel_frame_mat=mat_white_steel,
        sandstone_mat=mat_sandstone
    )

    # Verify all root objects are at (0, 0, 0) and print geometry summary
    root_names = [
        "Supertree_Hero",
        "Supertree_Medium",
        "Understorey_Timber_Dome",
        "Flower_Dome_Conservatory",
        "Cloud_Forest_Conservatory",
        "Bay_East_Skylight_Pavilion",
    ]
    print("\n================ BUILDINGS & LANDMARKS SUMMARY ================")
    total_verts = 0
    total_tris = 0
    for rname in root_names:
        robj = bpy.data.objects.get(rname)
        assert robj is not None, f"Missing required root object: {rname}"
        robj.location = (0.0, 0.0, 0.0)
        r_verts = 0
        r_tris = 0
        for child in robj.children_recursive:
            if child.type == 'MESH':
                m = child.data
                r_verts += len(m.vertices)
                r_tris += sum(max(0, len(p.vertices) - 2) for p in m.polygons)
        total_verts += r_verts
        total_tris += r_tris
        print(f"  - {rname:30s} | children={len(robj.children):2d} | verts={r_verts:6d} | tris={r_tris:6d}")
    print(f"  TOTAL: verts={total_verts}, tris={total_tris}")
    print("===============================================================\n")

    # Export GLB
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../public/models"))
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "buildings_landmarks.glb")

    bpy.ops.export_scene.gltf(
        filepath=out_path,
        export_format='GLB',
        export_apply=True,
        export_yup=True
    )
    file_size = os.path.getsize(out_path)
    print(f"Exported {out_path} ({file_size / 1024.0:.1f} KB)")


if __name__ == "__main__":
    main()
