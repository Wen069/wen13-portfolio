import os

import bpy


PROJECT_ROOT = os.path.abspath('.')
SOURCE_GLB = os.path.join(PROJECT_ROOT, 'static', 'vehicle', 'default.glb')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'resources', 'han-han-3d')
PREVIEW_DIR = os.path.join(OUTPUT_DIR, 'previews')
OUTPUT_BLEND = os.path.join(OUTPUT_DIR, 'han-han-vehicle.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'vehicle', 'han-han.glb')

PAPER = (0.8148, 0.7454, 0.6172, 1.0)
INK = (0.0086, 0.0080, 0.0074, 1.0)
RED = (0.7758, 0.0452, 0.0319, 1.0)


def material(name, color, roughness=0.82, metallic=0.0):
    value = bpy.data.materials.get(name) or bpy.data.materials.new(name)
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


def cube(name, location, scale, mat, parent=None, bevel=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
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


def duplicate_hierarchy(source, parent=None):
    clone = source.copy()
    if source.data:
        clone.data = source.data.copy()
    bpy.context.scene.collection.objects.link(clone)
    clone.parent = parent
    for child in source.children:
        duplicate_hierarchy(child, clone)
    return clone


def render_preview(chassis, wheel_template, paper, ink):
    # The source file contains one wheel template because VisualVehicle clones it
    # at runtime. Preview-only clones make the delivered skin easy to inspect.
    wheel_template.hide_render = True
    preview_wheels = []
    for index, (x, y) in enumerate(((0.90, -0.75), (0.90, 0.75), (-0.90, -0.75), (-0.90, 0.75))):
        wheel = duplicate_hierarchy(wheel_template, chassis)
        wheel.location = (x, y, -0.50)
        wheel.rotation_euler = (0, 0, 0)
        wheel.hide_render = False
        for child in wheel.children_recursive:
            if child.name.lower().startswith('wheelsuspension'):
                child.hide_render = True
        preview_wheels.append(wheel)

    bpy.ops.mesh.primitive_plane_add(size=18, location=(0, 0, 0))
    floor = finish_mesh(bpy.context.object, 'PreviewFloor', ink)
    bpy.ops.object.light_add(type='AREA', location=(5.5, -6.5, 8.5))
    key = bpy.context.object
    key.data.energy = 1200
    key.data.size = 6
    bpy.ops.object.light_add(type='AREA', location=(-4, 3, 5))
    fill = bpy.context.object
    fill.data.energy = 750
    fill.data.color = (1.0, 0.32, 0.24)
    fill.data.size = 5
    camera, target = add_camera((6.6, -8.2, 4.8), (0, 0, 1.05), lens=58)

    scene = bpy.context.scene
    scene.camera = camera
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 1080
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = os.path.join(PREVIEW_DIR, 'vehicle-preview.png')
    scene.render.film_transparent = False
    scene.world.color = (0.012, 0.015, 0.019)
    bpy.ops.render.render(write_still=True)

    wheel_template.hide_render = False
    for wheel in preview_wheels:
        for child in list(wheel.children_recursive):
            bpy.data.objects.remove(child, do_unlink=True)
    for obj in (*preview_wheels, floor, key, fill, camera, target):
        bpy.data.objects.remove(obj, do_unlink=True)


if not os.path.isfile(SOURCE_GLB):
    raise FileNotFoundError(f'Missing baseline vehicle: {SOURCE_GLB}')

for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
bpy.ops.import_scene.gltf(filepath=SOURCE_GLB)

paper = material('hanHanPaper', PAPER, roughness=0.86)
ink = material('hanHanInk', INK, roughness=0.80)
red = material('hanHanSignalRed', RED, roughness=0.72)

functional_light_prefixes = (
    'backlights', 'blinkerleft', 'blinkerright', 'stoplights',
    'headlights', 'energy', 'cellsenergy',
)
for obj in bpy.context.scene.objects:
    if obj.type != 'MESH':
        continue
    lower = obj.name.lower()
    if lower.startswith(functional_light_prefixes):
        # Keep the original emissive material names consumed by the runtime.
        continue
    if lower.startswith('bodypainted'):
        obj.data.materials.clear()
        obj.data.materials.append(paper)
    elif lower.startswith(('wheelpainted', 'wheelguard')):
        obj.data.materials.clear()
        obj.data.materials.append(red)
    else:
        obj.data.materials.clear()
        obj.data.materials.append(ink)

chassis = next((obj for obj in bpy.context.scene.objects if obj.name.lower().startswith('chassis')), None)
wheel_template = next((obj for obj in bpy.context.scene.objects if obj.name.lower().startswith('wheelcontainer')), None)
if not chassis or not wheel_template:
    raise RuntimeError('Baseline vehicle is missing chassis or wheelContainer')

# Permanent, unbranded correction/ideal-line accents. They are ordinary visual
# children and do not change wheel anchors, collision, suspension or controls.
cube('hanHanSignalLineTop', (0.10, 0.0, 0.75), (0.78, 0.055, 0.025), red, chassis, bevel=0.018)
cube('hanHanSignalLineLeft', (0.05, -0.75, 0.18), (0.74, 0.022, 0.065), red, chassis, bevel=0.018)
cube('hanHanSignalLineRight', (0.05, 0.75, 0.18), (0.74, 0.022, 0.065), red, chassis, bevel=0.018)
chassis['assetRole'] = 'unbranded paper/ink/signal-red visual skin'
chassis['physicsCoupling'] = 'none; preserves VisualVehicle node contract'
chassis['rightsBoundary'] = 'no team, event, sponsor, film or manufacturer livery'

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
)
render_preview(chassis, wheel_template, paper, ink)

print(f'HAN_HAN_VEHICLE_SOURCE={SOURCE_GLB}')
print(f'HAN_HAN_VEHICLE_BLEND={OUTPUT_BLEND}')
print(f'HAN_HAN_VEHICLE_GLB={OUTPUT_GLB}')
print(f'HAN_HAN_VEHICLE_PREVIEW={os.path.join(PREVIEW_DIR, "vehicle-preview.png")}')
