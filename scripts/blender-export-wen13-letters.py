import bpy
import math
import os
from mathutils import Vector


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'wen13-letters.glb')
WORD = 'WEN13'


for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

material = bpy.data.materials.new('palette')
material.diffuse_color = (0.96, 0.42, 0.24, 1.0)

center = Vector((44.04, -41.61, 0.86))
rotation_z = math.radians(25)
baseline = Vector((math.cos(rotation_z), math.sin(rotation_z), 0))
spacing = 2.05

for index, character in enumerate(WORD):
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
    curve.materials.append(material)

    letter = bpy.data.objects.new(f'refLettersPhysicalDynamic{index:02d}', curve)
    bpy.context.scene.collection.objects.link(letter)
    letter.rotation_euler.x = math.radians(90)
    letter.rotation_euler.z = rotation_z
    offset = (index - (len(WORD) - 1) / 2) * spacing
    letter.location = center + baseline * offset
    letter['mass'] = 1.0
    letter['restitution'] = 0.12
    letter['friction'] = 0.7

    bpy.context.view_layer.objects.active = letter
    letter.select_set(True)
    bpy.ops.object.convert(target='MESH')
    letter.select_set(False)
    letter.data.name = f'Wen13LetterMesh{index:02d}'

    collider = bpy.data.objects.new(f'cuboidWen13{index:02d}', None)
    bpy.context.scene.collection.objects.link(collider)
    collider.empty_display_type = 'CUBE'
    collider.scale = (
        max(letter.dimensions.x, 0.3),
        max(letter.dimensions.z, 0.3),
        max(letter.dimensions.y, 0.3),
    )
    collider.parent = letter
    collider.location = (0, 0, 0)

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

print(f'WEN13_LETTERS_OUTPUT={OUTPUT_GLB}')
print(f'WEN13_LETTERS_COUNT={len(WORD)}')
