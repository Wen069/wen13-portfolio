import math
import os

import bpy
from mathutils import Vector


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'resources', 'han-han-3d')
PREVIEW_DIR = os.path.join(OUTPUT_DIR, 'previews')
OUTPUT_BLEND = os.path.join(OUTPUT_DIR, 'han-han-letters.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'han-han-letters.glb')
WORD = 'HANHAN'

PAPER = (0.8148, 0.7454, 0.6172, 1.0)
INK = (0.0086, 0.0080, 0.0074, 1.0)
RED = (0.7758, 0.0452, 0.0319, 1.0)


def material(name, color):
    value = bpy.data.materials.new(name)
    value.diffuse_color = color
    value.roughness = 0.86
    return value


def block(name, location, scale, mat, rotation=(0, 0, 0), bevel=0.035):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new(name='edgeCut', type='BEVEL')
    modifier.width = bevel
    modifier.segments = 1
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.modifier_apply(modifier=modifier.name)
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    return obj


def bar_between(name, start, end, width, depth, mat):
    start = Vector(start)
    end = Vector(end)
    direction = end - start
    midpoint = (start + end) * 0.5
    obj = block(name, midpoint, (width, depth, direction.length * 0.5), mat)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = direction.to_track_quat('Z', 'Y')
    obj.rotation_mode = 'XYZ'
    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=False)
    obj.select_set(False)
    return obj


def create_letter(character, index, mat):
    parts = []
    if character == 'H':
        parts.extend([
            block(f'H{index}Left', (-0.42, 0, 0.75), (0.13, 0.16, 0.75), mat),
            block(f'H{index}Right', (0.42, 0, 0.75), (0.13, 0.16, 0.75), mat),
            block(f'H{index}Cross', (0, -0.01, 0.76), (0.42, 0.17, 0.13), mat),
        ])
    elif character == 'A':
        parts.extend([
            bar_between(f'A{index}Left', (-0.48, 0, 0.02), (0, 0, 1.50), 0.13, 0.16, mat),
            bar_between(f'A{index}Right', (0.48, 0, 0.02), (0, 0, 1.50), 0.13, 0.16, mat),
            block(f'A{index}Cross', (0, -0.01, 0.62), (0.30, 0.17, 0.11), mat),
        ])
    elif character == 'N':
        parts.extend([
            block(f'N{index}Left', (-0.42, 0, 0.75), (0.13, 0.16, 0.75), mat),
            block(f'N{index}Right', (0.42, 0, 0.75), (0.13, 0.16, 0.75), mat),
            bar_between(f'N{index}Diagonal', (-0.34, 0, 1.46), (0.34, 0, 0.04), 0.12, 0.17, mat),
        ])
    else:
        raise ValueError(f'Unsupported block letter: {character}')

    bpy.ops.object.select_all(action='DESELECT')
    for part in parts:
        part.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    letter = bpy.context.object
    bpy.context.scene.cursor.location = (0, 0, 0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    letter.name = f'refLettersPhysicalDynamic{index:02d}'
    letter.data.name = f'HanHanLetterMesh{index:02d}'
    return letter


def add_camera(location, target):
    bpy.ops.object.camera_add(location=location)
    camera = bpy.context.object
    camera.data.lens = 55
    target_obj = bpy.data.objects.new('PreviewTarget', None)
    bpy.context.scene.collection.objects.link(target_obj)
    target_obj.location = target
    constraint = camera.constraints.new(type='TRACK_TO')
    constraint.target = target_obj
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'
    return camera, target_obj


for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)

paper = material('hanHanLettersPaper', PAPER)
ink = material('hanHanLettersInk', INK)
red = material('hanHanLettersSignalRed', RED)
# Keep every glyph readable at night. Graphite remains in the shared palette but
# is reserved for the base/world, not a letter that could disappear into it.
letter_materials = (paper, paper, red, paper, paper, paper)

center = Vector((44.15, -41.70, 0.10))
rotation_z = math.radians(25)
baseline = Vector((math.cos(rotation_z), math.sin(rotation_z), 0))
spacing = 1.58
letters = []

for index, character in enumerate(WORD):
    letter = create_letter(character, index, letter_materials[index])
    offset = (index - (len(WORD) - 1) / 2) * spacing
    letter.location = center + baseline * offset
    letter.rotation_euler.z = rotation_z
    letter['mass'] = 1.0
    letter['restitution'] = 0.10
    letter['friction'] = 0.74
    letter['assetRole'] = 'unofficial internal concept entrance letters'

    collider = bpy.data.objects.new(f'cuboidHanHan{index:02d}', None)
    bpy.context.scene.collection.objects.link(collider)
    collider.empty_display_type = 'CUBE'
    collider.scale = (1.10, 0.35, 1.60)
    collider.parent = letter
    collider.location = (0, 0, 0.75)
    letters.append(letter)

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

# Preview after export so runtime-ready top-level transforms stay untouched.
original_locations = [letter.location.copy() for letter in letters]
for letter in letters:
    letter.location -= center

bpy.ops.mesh.primitive_plane_add(size=18, location=(0, 0, -0.02))
floor = bpy.context.object
floor.data.materials.append(ink)
bpy.ops.object.light_add(type='AREA', location=(5.5, -7.5, 8.5))
key = bpy.context.object
key.data.energy = 1200
key.data.size = 6
bpy.ops.object.light_add(type='AREA', location=(-5, 1.5, 6.5))
fill = bpy.context.object
fill.data.energy = 650
fill.data.color = (1.0, 0.32, 0.24)
fill.data.size = 5
camera, target = add_camera((7.8, -13.5, 5.4), (0, 0, 0.80))
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1200
scene.render.resolution_y = 640
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = os.path.join(PREVIEW_DIR, 'letters-preview.png')
scene.world.color = (0.012, 0.015, 0.019)
bpy.ops.render.render(write_still=True)

for letter, location in zip(letters, original_locations):
    letter.location = location

print(f'HAN_HAN_LETTERS_BLEND={OUTPUT_BLEND}')
print(f'HAN_HAN_LETTERS_GLB={OUTPUT_GLB}')
print(f'HAN_HAN_LETTERS_COUNT={len(WORD)}')
print(f'HAN_HAN_LETTERS_PREVIEW={os.path.join(PREVIEW_DIR, "letters-preview.png")}')
