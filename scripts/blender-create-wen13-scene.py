import bpy
import math
import os
from mathutils import Vector


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_BLEND = os.path.join(PROJECT_ROOT, 'resources', 'folio-2025-wen13.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'areas-wen13.glb')
WORD = 'WEN13'


def remove_original_letters():
    removed = []
    for obj in list(bpy.data.objects):
        if obj.name.startswith('refLettersPhysicalDynamic'):
            removed.append(obj.name)
            bpy.data.objects.remove(obj, do_unlink=True)
    return removed


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

    world_matrix = text_object.matrix_world.copy()
    text_object.parent = parent
    text_object.matrix_world = world_matrix

    return text_object


def create_wen13_letters():
    landing = bpy.data.objects.get('landing')
    collection = bpy.data.collections.get('title.001')
    material = bpy.data.materials.get('palette')

    if landing is None or collection is None:
        raise RuntimeError('Landing title collection was not found in the source scene')

    center = Vector((44.04, -41.61, 0.86))
    rotation_z = math.radians(25)
    baseline = Vector((math.cos(rotation_z), math.sin(rotation_z), 0))
    spacing = 2.05

    letters = []
    for index, character in enumerate(WORD):
        offset = (index - (len(WORD) - 1) / 2) * spacing
        position = center + baseline * offset
        letters.append(
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

    source_title = bpy.data.objects.get('Text.003')
    if source_title and source_title.type == 'FONT':
        source_title.data.body = WORD

    return letters


removed_letters = remove_original_letters()
new_letters = create_wen13_letters()

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

print(f'WEN13_BLEND_OUTPUT={OUTPUT_BLEND}')
print(f'WEN13_GLB_OUTPUT={OUTPUT_GLB}')
print(f'WEN13_REMOVED_LETTERS={len(removed_letters)}')
print(f'WEN13_CREATED_LETTERS={len(new_letters)}')
print('WEN13_CREATED_NAMES=' + ','.join(letter.name for letter in new_letters))
