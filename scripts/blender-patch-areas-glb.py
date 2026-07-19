import bpy
import math
import os
from mathutils import Vector


PROJECT_ROOT = os.path.abspath('.')
SOURCE_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'areas.glb')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'areas-wen13.glb')
WORD = 'WEN13'


def create_letter_mesh(character, index, position, rotation_z, material, collection, parent):
    curve = bpy.data.curves.new(f'Wen13LetterCurve{index}', type='FONT')
    curve.body = character
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.size = 1.72
    curve.extrude = 0.16
    curve.bevel_depth = 0.055
    curve.bevel_resolution = 1
    curve.resolution_u = 3
    curve.fill_mode = 'BOTH'

    text_object = bpy.data.objects.new(f'Wen13LetterSource{index}', curve)
    collection.objects.link(text_object)
    text_object.rotation_euler.x = math.radians(90)
    text_object.rotation_euler.z = rotation_z
    text_object.location = position

    if material:
        text_object.data.materials.append(material)

    bpy.context.view_layer.objects.active = text_object
    text_object.select_set(True)
    bpy.ops.object.convert(target='MESH')
    text_object.select_set(False)

    text_object.name = f'refLettersPhysicalDynamic{index:02d}'
    text_object.data.name = f'Wen13LetterMesh{index:02d}'
    text_object['mass'] = 1.0
    text_object['restitution'] = 0.12
    text_object['friction'] = 0.7

    collider = bpy.data.objects.new(f'cuboidWen13{index:02d}', None)
    collection.objects.link(collider)
    collider.empty_display_type = 'CUBE'
    collider.scale = (
        max(text_object.dimensions.x, 0.3),
        max(text_object.dimensions.z, 0.3),
        max(text_object.dimensions.y, 0.3),
    )
    collider.parent = text_object
    collider.location = (0, 0, 0)

    world_matrix = text_object.matrix_world.copy()
    text_object.parent = parent
    text_object.matrix_world = world_matrix

    return text_object


for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

bpy.ops.import_scene.gltf(filepath=SOURCE_GLB)

landing = bpy.data.objects.get('landing')
material = bpy.data.materials.get('palette')
collection = bpy.context.scene.collection

if landing is None:
    raise RuntimeError('The landing root was not found after importing areas.glb')

original_letters = [
    obj for obj in bpy.data.objects
    if obj.name.startswith('refLettersPhysicalDynamic')
]

if len(original_letters) != 10:
    raise RuntimeError(f'Expected 10 original title letters, found {len(original_letters)}')

for obj in original_letters:
    for child in list(obj.children):
        bpy.data.objects.remove(child, do_unlink=True)
    bpy.data.objects.remove(obj, do_unlink=True)

center = Vector((44.04, -41.61, 0.86))
rotation_z = math.radians(25)
baseline = Vector((math.cos(rotation_z), math.sin(rotation_z), 0))
spacing = 2.05

new_letters = []
for index, character in enumerate(WORD):
    offset = (index - (len(WORD) - 1) / 2) * spacing
    position = center + baseline * offset
    new_letters.append(
        create_letter_mesh(
            character,
            index,
            position,
            rotation_z,
            material,
            collection,
            landing,
        )
    )

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

print(f'WEN13_PATCH_SOURCE={SOURCE_GLB}')
print(f'WEN13_PATCH_OUTPUT={OUTPUT_GLB}')
print(f'WEN13_PATCH_REMOVED={len(original_letters)}')
print(f'WEN13_PATCH_CREATED={len(new_letters)}')
print('WEN13_PATCH_NAMES=' + ','.join(letter.name for letter in new_letters))
