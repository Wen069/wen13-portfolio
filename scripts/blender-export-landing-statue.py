import argparse
import math
import os

import bpy
from mathutils import Matrix


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'landing-knight-statue.glb')
OUTPUT_BLEND = os.path.join(PROJECT_ROOT, 'resources', 'landing-knight-statue.blend')
OUTPUT_PREVIEW = os.path.join(PROJECT_ROOT, 'qa', 'landing-knight-statue-asset-preview.png')

SOURCE_FILES = {
    'character': 'KnightCharacter.blend',
    'helmet': 'Helmet3.blend',
    'shoulders': 'ShoulderPads.blend',
    'sword': 'Sword.blend',
}


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        '--source-dir',
        default=os.environ.get(
            'WEN13_KNIGHT_SOURCE_DIR',
            os.path.join(PROJECT_ROOT, 'resources', 'quaternius-knight', 'Blends'),
        ),
    )
    args, _ = parser.parse_known_args()
    return args


def require_sources(source_dir):
    missing = [
        os.path.join(source_dir, filename)
        for filename in SOURCE_FILES.values()
        if not os.path.isfile(os.path.join(source_dir, filename))
    ]
    if missing:
        raise FileNotFoundError('Missing Quaternius source files: ' + ', '.join(missing))


def append_mesh(filepath, preferred_name):
    with bpy.data.libraries.load(filepath, link=False) as (data_from, data_to):
        mesh_names = [name for name in data_from.objects if name == preferred_name]
        if not mesh_names:
            mesh_names = list(data_from.objects)
        data_to.objects = mesh_names[:1]

    obj = data_to.objects[0]
    bpy.context.scene.collection.objects.link(obj)
    return obj


def attach_to_bone(obj, armature, bone_name):
    obj.parent = armature
    obj.parent_type = 'BONE'
    obj.parent_bone = bone_name
    obj.matrix_parent_inverse = Matrix.Identity(4)
    obj.location = (0, 0, 0)
    obj.rotation_euler = (0, 0, 0)
    obj.scale = (1, 1, 1)


def bake_static_mesh(obj, name, material):
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    mesh = bpy.data.meshes.new_from_object(
        evaluated,
        preserve_all_data_layers=True,
        depsgraph=depsgraph,
    )
    mesh.name = f'{name}Mesh'
    mesh.materials.clear()
    mesh.materials.append(material)
    for polygon in mesh.polygons:
        polygon.use_smooth = False

    static = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(static)
    static.matrix_world = evaluated.matrix_world.copy()
    return static


def create_material(name, color, roughness=0.94):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.roughness = roughness
    material.metallic = 0.0
    return material


def create_cylinder(name, radius, depth, z, material, vertices=10):
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=vertices,
        radius=radius,
        depth=depth,
        location=(0, 0, z),
    )
    obj = bpy.context.object
    obj.name = name
    obj.data.name = f'{name}Mesh'
    obj.data.materials.append(material)
    for polygon in obj.data.polygons:
        polygon.use_smooth = False
    return obj


def render_preview(root):
    original_location = root.location.copy()
    original_rotation = root.rotation_euler.copy()
    root.location = (0, 0, 0)
    root.rotation_euler.z = math.radians(18)

    bpy.ops.mesh.primitive_plane_add(size=24, location=(0, 0, -0.02))
    floor = bpy.context.object
    floor.data.materials.append(create_material('PreviewFloor', (0.055, 0.035, 0.075, 1.0)))

    bpy.ops.object.light_add(type='AREA', location=(4.5, -6.5, 10.5))
    key = bpy.context.object
    key.data.energy = 1250
    key.data.shape = 'DISK'
    key.data.size = 7

    bpy.ops.object.light_add(type='AREA', location=(-5, 1.5, 6.5))
    fill = bpy.context.object
    fill.data.energy = 800
    fill.data.color = (0.46, 0.24, 1.0)
    fill.data.size = 5

    bpy.ops.object.camera_add(location=(9.4, -12.5, 8.2))
    camera = bpy.context.object
    bpy.context.scene.camera = camera

    target = bpy.data.objects.new('PreviewTarget', None)
    bpy.context.scene.collection.objects.link(target)
    target.location = (0, 0, 3.4)
    constraint = camera.constraints.new(type='TRACK_TO')
    constraint.target = target
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'

    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
    scene.render.resolution_x = 900
    scene.render.resolution_y = 900
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = OUTPUT_PREVIEW
    scene.render.film_transparent = False
    scene.world.color = (0.015, 0.008, 0.025)
    bpy.ops.render.render(write_still=True)

    root.location = original_location
    root.rotation_euler = original_rotation


args = parse_args()
source_dir = os.path.abspath(args.source_dir)
require_sources(source_dir)

bpy.ops.wm.open_mainfile(filepath=os.path.join(source_dir, SOURCE_FILES['character']))

scene = bpy.context.scene
armature = bpy.data.objects.get('HumanArmature')
character = bpy.data.objects.get('Knight')
if not armature or not character:
    raise RuntimeError('KnightCharacter.blend does not contain HumanArmature and Knight')

armature.animation_data_create()
action = bpy.data.actions.get('Idle_swordRight') or bpy.data.actions.get('Idle')
armature.animation_data.action = action
scene.frame_set(32)
bpy.context.view_layer.update()

helmet = append_mesh(os.path.join(source_dir, SOURCE_FILES['helmet']), 'Helmet3')
shoulders = append_mesh(os.path.join(source_dir, SOURCE_FILES['shoulders']), 'ShoulderPads')
sword = append_mesh(os.path.join(source_dir, SOURCE_FILES['sword']), 'Sword')
attach_to_bone(helmet, armature, 'Head')
attach_to_bone(shoulders, armature, 'Neck')
attach_to_bone(sword, armature, 'Palm.R')
bpy.context.view_layer.update()

stone = create_material('statueStone', (0.29, 0.23, 0.36, 1.0))
stone_light = create_material('statueStoneLight', (0.46, 0.36, 0.53, 1.0))
stone_dark = create_material('statueStoneDark', (0.18, 0.13, 0.24, 1.0))

baked = [
    bake_static_mesh(character, 'landingKnightBody', stone),
    bake_static_mesh(helmet, 'landingKnightHelmet', stone_light),
    bake_static_mesh(shoulders, 'landingKnightShoulders', stone_light),
    bake_static_mesh(sword, 'landingKnightSword', stone_dark),
]

for obj in list(bpy.data.objects):
    if obj not in baked:
        bpy.data.objects.remove(obj, do_unlink=True)

root = bpy.data.objects.new('landingKnightStatuePhysicalFixed', None)
bpy.context.scene.collection.objects.link(root)
root.empty_display_type = 'PLAIN_AXES'
root.location = (37, -41, 0)
# The source's opposite side was previously exported at 180°. Runtime camera
# QA on desktop and narrow mobile viewports confirmed that 0° exposes the
# intended front while preserving a readable three-quarter view.
root.rotation_euler.z = 0
root['friction'] = 0.85
root['restitution'] = 0.04

for obj in baked:
    obj.parent = root
    obj.location.z += 0.92

base = create_cylinder('landingKnightBase', 1.72, 0.34, 0.17, stone_dark, vertices=10)
pedestal = create_cylinder('landingKnightPedestal', 1.38, 0.62, 0.48, stone, vertices=10)
cap = create_cylinder('landingKnightCap', 1.53, 0.22, 0.86, stone_light, vertices=10)
for obj in (base, pedestal, cap):
    obj.parent = root

collider = bpy.data.objects.new('cuboidLandingKnightStatue', None)
bpy.context.scene.collection.objects.link(collider)
collider.empty_display_type = 'CUBE'
collider.parent = root
collider.location = (0, 0, 3.6)
collider.scale = (1.65, 1.55, 7.2)
collider['friction'] = 0.85
collider['restitution'] = 0.04

os.makedirs(os.path.dirname(OUTPUT_BLEND), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_GLB), exist_ok=True)
os.makedirs(os.path.dirname(OUTPUT_PREVIEW), exist_ok=True)

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

render_preview(root)

print(f'LANDING_STATUE_SOURCE={source_dir}')
print(f'LANDING_STATUE_BLEND={OUTPUT_BLEND}')
print(f'LANDING_STATUE_GLB={OUTPUT_GLB}')
print(f'LANDING_STATUE_PREVIEW={OUTPUT_PREVIEW}')
