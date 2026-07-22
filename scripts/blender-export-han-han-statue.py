import math
import os

import bpy
from mathutils import Vector


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'resources', 'han-han-3d')
PREVIEW_DIR = os.path.join(OUTPUT_DIR, 'previews')
OUTPUT_BLEND = os.path.join(OUTPUT_DIR, 'han-han-editor-statue.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'landing-han-han-statue.glb')

PAPER = (0.8148, 0.7454, 0.6172, 1.0)  # #E9E0CF, linear-ish viewport value
INK = (0.0086, 0.0080, 0.0074, 1.0)    # #171716
RED = (0.7758, 0.0452, 0.0319, 1.0)    # #E43C32


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def material(name, color, roughness=0.9, metallic=0.0):
    value = bpy.data.materials.new(name)
    value.diffuse_color = color
    value.roughness = roughness
    value.metallic = metallic
    return value


def finish_mesh(obj, name, mat, parent=None):
    obj.name = name
    obj.data.name = f'{name}Mesh'
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    if parent:
        obj.parent = parent
    return obj


def cube(name, location, scale, mat, parent=None, rotation=(0, 0, 0), bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        modifier = obj.modifiers.new(name='edgeCut', type='BEVEL')
        modifier.width = bevel
        modifier.segments = 1
        bpy.context.view_layer.objects.active = obj
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    return finish_mesh(obj, name, mat, parent)


def cylinder(name, start, end, radius, mat, parent=None, vertices=16):
    start = Vector(start)
    end = Vector(end)
    direction = end - start
    midpoint = (start + end) * 0.5
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=direction.length,
        location=midpoint,
    )
    obj = bpy.context.object
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = direction.to_track_quat('Z', 'Y')
    obj.rotation_mode = 'XYZ'
    return finish_mesh(obj, name, mat, parent)


def cone(name, location, radius_a, radius_b, depth, mat, parent=None, vertices=24):
    bpy.ops.mesh.primitive_cone_add(
        vertices=vertices,
        radius1=radius_a,
        radius2=radius_b,
        depth=depth,
        location=location,
    )
    return finish_mesh(bpy.context.object, name, mat, parent)


def uv_sphere(name, location, scale, mat, parent=None, segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        location=location,
    )
    obj = bpy.context.object
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    return finish_mesh(obj, name, mat, parent)


def torus(name, location, major_radius, minor_radius, mat, parent=None, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(
        major_radius=major_radius,
        minor_radius=minor_radius,
        major_segments=32,
        minor_segments=8,
        location=location,
        rotation=rotation,
    )
    return finish_mesh(bpy.context.object, name, mat, parent)


def curve_line(name, points, bevel_depth, mat, parent=None):
    curve_data = bpy.data.curves.new(f'{name}Curve', type='CURVE')
    curve_data.dimensions = '3D'
    curve_data.resolution_u = 1
    curve_data.bevel_depth = bevel_depth
    curve_data.bevel_resolution = 0
    curve_data.resolution_u = 1
    curve_data.materials.append(mat)
    spline = curve_data.splines.new(type='POLY')
    spline.points.add(len(points) - 1)
    for point, coordinate in zip(spline.points, points):
        point.co = (*coordinate, 1.0)
    obj = bpy.data.objects.new(name, curve_data)
    bpy.context.scene.collection.objects.link(obj)
    if parent:
        obj.parent = parent
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    return finish_mesh(obj, name, mat, parent)


def add_camera(location, target, lens=54):
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.data.lens = lens
    target_obj = bpy.data.objects.new('PreviewTarget', None)
    bpy.context.scene.collection.objects.link(target_obj)
    target_obj.location = target
    constraint = camera.constraints.new(type='TRACK_TO')
    constraint.target = target_obj
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'
    return camera, target_obj


def join_material_group(root, mat, output_name):
    items = [
        child for child in root.children
        if child.type == 'MESH' and child.data.materials and child.data.materials[0] == mat
    ]
    if not items:
        return None
    bpy.ops.object.select_all(action='DESELECT')
    for item in items:
        item.select_set(True)
    bpy.context.view_layer.objects.active = items[0]
    bpy.ops.object.join()
    joined = bpy.context.object
    joined.name = output_name
    joined.data.name = f'{output_name}Mesh'
    joined.parent = root
    return joined


def render_previews(root, paper_mat, ink_mat):
    original_location = root.location.copy()
    root.location = (0, 0, 0)

    bpy.ops.mesh.primitive_plane_add(size=22, location=(0, 0, -0.02))
    floor = finish_mesh(bpy.context.object, 'PreviewFloor', ink_mat)

    bpy.ops.object.light_add(type='AREA', location=(5.5, -7.5, 10.5))
    key = bpy.context.object
    key.data.energy = 1150
    key.data.shape = 'DISK'
    key.data.size = 6.5
    bpy.ops.object.light_add(type='AREA', location=(-5.0, 0.5, 7.0))
    fill = bpy.context.object
    fill.data.energy = 700
    fill.data.color = (1.0, 0.32, 0.24)
    fill.data.size = 5.0
    bpy.ops.object.light_add(type='AREA', location=(0, 5.0, 9.0))
    rim = bpy.context.object
    rim.data.energy = 950
    rim.data.color = (0.72, 0.78, 1.0)
    rim.data.size = 4.0

    camera, target = add_camera((9.4, -13.2, 8.1), (0, 0, 3.25), lens=56)
    scene = bpy.context.scene
    scene.camera = camera
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 960
    scene.render.resolution_y = 960
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.film_transparent = False
    scene.world.color = (0.012, 0.015, 0.019)

    views = {
        'statue-default-camera.png': (9.4, -13.2, 8.1),
        'statue-front.png': (0.0, -15.5, 6.2),
        'statue-side.png': (15.5, 0.0, 6.2),
    }
    for filename, location in views.items():
        camera.location = location
        scene.render.filepath = os.path.join(PREVIEW_DIR, filename)
        bpy.ops.render.render(write_still=True)

    root.location = original_location
    for obj in (floor, camera, target, key, fill, rim):
        bpy.data.objects.remove(obj, do_unlink=True)


clear_scene()
os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)

paper = material('hanHanPaperStone', PAPER, roughness=0.96)
ink = material('hanHanGraphite', INK, roughness=0.88)
red = material('hanHanSignalRed', RED, roughness=0.78)

root = bpy.data.objects.new('landingKnightStatuePhysicalFixed', None)
bpy.context.scene.collection.objects.link(root)
root.empty_display_type = 'PLAIN_AXES'
root.location = (37, -41, 0)
root.rotation_euler.z = 0
root['friction'] = 0.85
root['restitution'] = 0.04
root['assetRole'] = 'abstract helmeted editor; unofficial internal concept'
root['rightsBoundary'] = 'no likeness scan, brands, film characters, team or sponsor marks'
root['localFrontAxis'] = '-Y'
root['fixedCameraFacing'] = '+X/+Z world camera; three-quarter front'

# Pedestal: a paper-page base cut by one red editorial/racing line.
cone('hanHanStatueBase', (0, 0, 0.16), 1.70, 1.70, 0.32, ink, root, vertices=16)
cone('hanHanStatuePedestal', (0, 0, 0.50), 1.38, 1.30, 0.58, paper, root, vertices=16)
cone('hanHanStatueCap', (0, 0, 0.86), 1.52, 1.52, 0.20, red, root, vertices=16)
curve_line(
    'hanHanEditorialRacingLine',
    [(-1.15, -0.52, 0.99), (-0.45, -0.58, 1.00), (0.15, -0.38, 1.01), (0.72, -0.58, 1.02), (1.20, -0.42, 1.02)],
    0.045,
    red,
    root,
)

# Lower body and asymmetric forward stance.
cylinder('hanHanLegLeft', (-0.42, 0.02, 1.00), (-0.48, -0.04, 2.78), 0.31, ink, root, vertices=20)
cylinder('hanHanLegRight', (0.48, 0.02, 1.00), (0.34, -0.16, 2.80), 0.31, paper, root, vertices=20)
cube('hanHanShoeLeft', (-0.48, -0.18, 1.08), (0.34, 0.48, 0.22), ink, root, rotation=(0, 0, math.radians(-4)), bevel=0.06)
cube('hanHanShoeRight', (0.43, -0.27, 1.08), (0.34, 0.50, 0.22), ink, root, rotation=(0, 0, math.radians(5)), bevel=0.06)

# Torso reads as a simple editor's coat, not a racing suit.
cone('hanHanEditorCoat', (0, 0.02, 3.65), 0.88, 0.62, 1.86, paper, root, vertices=32)
cube('hanHanCoatFrontPlane', (0, -0.54, 3.67), (0.56, 0.04, 0.78), paper, root, bevel=0.04)
cube('hanHanRedCorrectionSeam', (0.18, -0.60, 3.69), (0.035, 0.025, 0.70), red, root)
cone('hanHanNeck', (0, 0, 4.84), 0.23, 0.23, 0.34, paper, root, vertices=20)

# Abstract head: no face scan, identity marks, eyewear or copied costume.
uv_sphere('hanHanAbstractHead', (0, -0.02, 5.47), (0.61, 0.54, 0.70), paper, root)
uv_sphere('hanHanAbstractHair', (0, 0.05, 5.86), (0.63, 0.55, 0.34), ink, root)
cube('hanHanFaceCut', (0.13, -0.545, 5.47), (0.18, 0.025, 0.045), red, root, rotation=(0, math.radians(-8), 0), bevel=0.015)

# Left arm encloses an unbranded helmet.
cylinder('hanHanUpperArmHelmet', (-0.61, -0.02, 4.46), (-0.92, -0.12, 3.83), 0.22, paper, root, vertices=20)
cylinder('hanHanForearmHelmet', (-0.92, -0.12, 3.83), (-1.02, -0.48, 3.35), 0.20, paper, root, vertices=20)
uv_sphere('hanHanHelmetShell', (-1.13, -0.08, 3.16), (0.61, 0.53, 0.64), ink, root)
torus('hanHanHelmetRim', (-1.13, -0.49, 3.16), 0.45, 0.065, paper, root, rotation=(math.radians(90), 0, 0))
cube('hanHanHelmetSignalCut', (-1.13, -0.585, 3.18), (0.35, 0.035, 0.075), red, root, rotation=(0, 0, math.radians(-8)), bevel=0.025)
uv_sphere('hanHanHandHelmet', (-1.02, -0.48, 3.35), (0.24, 0.20, 0.24), paper, root, segments=20, rings=12)

# Right arm holds a fan of paper/storyboard cards.
cylinder('hanHanUpperArmCards', (0.61, -0.02, 4.45), (0.91, -0.22, 3.88), 0.22, paper, root, vertices=20)
cylinder('hanHanForearmCards', (0.91, -0.22, 3.88), (1.08, -0.48, 3.50), 0.19, paper, root, vertices=20)
uv_sphere('hanHanHandCards', (1.08, -0.48, 3.50), (0.23, 0.19, 0.23), paper, root, segments=20, rings=12)
for index, angle in enumerate((-12, 0, 12)):
    cube(
        f'hanHanStoryboardCard{index + 1:02d}',
        (1.31 + index * 0.03, -0.56 - index * 0.018, 3.66 + index * 0.05),
        (0.38, 0.025, 0.57),
        paper,
        root,
        rotation=(math.radians(-3), math.radians(angle), math.radians(-5 + angle * 0.15)),
        bevel=0.025,
    )
    cube(
        f'hanHanStoryboardCut{index + 1:02d}',
        (1.32 + index * 0.03, -0.595 - index * 0.018, 3.63 + index * 0.05),
        (0.26, 0.012, 0.018),
        red,
        root,
        rotation=(math.radians(-3), math.radians(angle), math.radians(-5 + angle * 0.15)),
    )

# Preserve the existing fixed Rapier object contract. The collider hugs the
# body/base only, deliberately excluding the cards and helmet silhouette.
collider = bpy.data.objects.new('cuboidLandingKnightStatue', None)
bpy.context.scene.collection.objects.link(collider)
collider.empty_display_type = 'CUBE'
collider.parent = root
collider.location = (0, 0, 3.55)
collider.scale = (1.65, 1.55, 7.1)
collider['friction'] = 0.85
collider['restitution'] = 0.04

bpy.context.view_layer.update()
# Three material-batched meshes keep the visual draw-call budget lower than the
# previous knight while retaining the silhouette and all props.
paper_visual = join_material_group(root, paper, 'hanHanStatuePaperVisual')
ink_visual = join_material_group(root, ink, 'hanHanStatueInkVisual')
red_visual = join_material_group(root, red, 'hanHanStatueRedVisual')
visual_group = bpy.data.objects.new('hanHanStatueVisual', None)
bpy.context.scene.collection.objects.link(visual_group)
visual_group.parent = root
visual_group.scale.z = 1.075
for visual in (paper_visual, ink_visual, red_visual):
    if visual:
        visual.parent = visual_group
bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=OUTPUT_BLEND, compress=True)
bpy.ops.export_scene.gltf(
    filepath=OUTPUT_GLB,
    export_format='GLB',
    check_existing=False,
    export_yup=True,
    export_apply=True,
    export_materials='EXPORT',
    export_attributes=True,
    export_extras=True,
    export_cameras=False,
    export_lights=False,
    export_optimize_animation_size=False,
    export_keep_originals=False,
    export_image_format='AUTO',
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
    export_draco_position_quantization=14,
    export_draco_normal_quantization=10,
)
render_previews(root, paper, ink)

print(f'HAN_HAN_STATUE_BLEND={OUTPUT_BLEND}')
print(f'HAN_HAN_STATUE_GLB={OUTPUT_GLB}')
print(f'HAN_HAN_STATUE_PREVIEWS={PREVIEW_DIR}')
