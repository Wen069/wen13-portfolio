import math
import os

import bpy


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_DIR = os.path.join(PROJECT_ROOT, 'resources', 'han-han-3d')
PREVIEW_DIR = os.path.join(OUTPUT_DIR, 'previews')
OUTPUT_BLEND = os.path.join(OUTPUT_DIR, 'han-han-circuit-markers.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'han-han-circuit-markers.glb')

PAPER = (0.8148, 0.7454, 0.6172, 1.0)
INK = (0.0086, 0.0080, 0.0074, 1.0)
RED = (0.7758, 0.0452, 0.0319, 1.0)


def material(name, color):
    value = bpy.data.materials.new(name)
    value.diffuse_color = color
    value.roughness = 0.84
    return value


def cube(name, location, scale, mat, parent, rotation_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=(0, 0, rotation_z))
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f'{name}Mesh'
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    obj.parent = parent
    return obj


for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
paper = material('hanHanCircuitPaper', PAPER)
ink = material('hanHanCircuitInk', INK)
red = material('hanHanCircuitSignalRed', RED)

root = bpy.data.objects.new('hanHanCircuitMarkersVisual', None)
bpy.context.scene.collection.objects.link(root)
root['assetRole'] = 'non-colliding original brake/apex/rhythm visual cues'
root['physicsCoupling'] = 'none'
root['rightsBoundary'] = 'no event, team, sponsor, film or manufacturer marks'

# Blender uses Z-up. Positions are the reversible conversion of selected
# checkpoint world positions from the existing Y-up glTF: (x, z) -> (x, -z).
groups = [
    ('Brake', (37.06, 47.82), math.radians(90)),
    ('Apex', (-61.81, 27.47), math.radians(-45)),
    ('Rhythm', (-56.05, -70.52), math.radians(90)),
]
markers = []
for group_index, (label, (x, y), angle) in enumerate(groups, start=1):
    # Three red bars tighten toward a paper apex diamond; one graphite exit line
    # completes the sequence. At 4 cm high these are visual-only road inlays.
    for bar_index, length in enumerate((1.50, 1.15, 0.80), start=1):
        marker = cube(
            f'hanHan{label}Bar{bar_index:02d}',
            (x - 2.1 + bar_index * 0.72, y, 0.045),
            (length * 0.5, 0.12, 0.045),
            red,
            root,
            rotation_z=angle,
        )
        markers.append(marker)
    apex = cube(
        f'hanHan{label}Apex',
        (x + 1.15, y, 0.050),
        (0.34, 0.34, 0.05),
        paper,
        root,
        rotation_z=angle + math.radians(45),
    )
    exit_line = cube(
        f'hanHan{label}Exit',
        (x + 2.25, y, 0.040),
        (0.85, 0.08, 0.04),
        paper,
        root,
        rotation_z=angle,
    )
    markers.extend((apex, exit_line))

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

# Compact preview of the three visual cue families after the world-space GLB is
# frozen. The preview transforms are not written back to the exported asset.
for index, marker in enumerate(markers):
    group_index = index // 5
    within_group = index % 5
    marker.location.x = -5.5 + group_index * 5.5 + within_group * 0.62
    marker.location.y = 0
    marker.location.z = 0.05
    marker.rotation_euler.z = 0

bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -0.02))
floor = bpy.context.object
floor.data.materials.append(ink)
bpy.ops.object.light_add(type='AREA', location=(0, -3, 10))
light = bpy.context.object
light.data.energy = 1200
light.data.size = 8
bpy.ops.object.camera_add(location=(0, -12.5, 10.5))
camera = bpy.context.object
target = bpy.data.objects.new('PreviewTarget', None)
bpy.context.scene.collection.objects.link(target)
target.location = (0, 0, 0)
constraint = camera.constraints.new(type='TRACK_TO')
constraint.target = target
constraint.track_axis = 'TRACK_NEGATIVE_Z'
constraint.up_axis = 'UP_Y'
scene = bpy.context.scene
scene.camera = camera
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.render.resolution_x = 1200
scene.render.resolution_y = 500
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = os.path.join(PREVIEW_DIR, 'circuit-markers-preview.png')
scene.world.color = (0.012, 0.015, 0.019)
bpy.ops.render.render(write_still=True)

print(f'HAN_HAN_CIRCUIT_BLEND={OUTPUT_BLEND}')
print(f'HAN_HAN_CIRCUIT_GLB={OUTPUT_GLB}')
print(f'HAN_HAN_CIRCUIT_PREVIEW={os.path.join(PREVIEW_DIR, "circuit-markers-preview.png")}')
