import bpy
import math
import os


PROJECT_ROOT = os.path.abspath('.')
OUTPUT_BLEND = os.path.join(PROJECT_ROOT, 'resources', 'social-domestic.blend')
OUTPUT_GLB = os.path.join(PROJECT_ROOT, 'static', 'areas', 'social-domestic.glb')


COLORS = {
    'cream': (0.94, 0.88, 0.72, 1.0),
    'ink': (0.12, 0.13, 0.12, 1.0),
    'xiaohongshu': (0.87, 0.16, 0.24, 1.0),
    'bilibili': (0.18, 0.58, 0.74, 1.0),
    'wechat': (0.18, 0.62, 0.38, 1.0),
    'mail': (0.88, 0.53, 0.20, 1.0),
}


SLOTS = {
    'xiaohongshu': (33.8182, 1.3818, -18.1126),
    'bilibili': (30.8707, 1.3188, -24.2122),
    'wechat': (21.0490, 1.5137, -24.2282),
    'mail': (18.1371, 1.5671, -18.1445),
}


for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)


collection = bpy.context.scene.collection


def create_material(name, color):
    material = bpy.data.materials.new(name)
    material.diffuse_color = color
    material.roughness = 0.82
    material.metallic = 0.0
    return material


materials = {
    name: create_material(f'domestic-{name}', color)
    for name, color in COLORS.items()
}


def rounded_rect_points(width, height, radius, corner_steps=3):
    half_width = width * 0.5
    half_height = height * 0.5
    radius = min(radius, half_width, half_height)
    corners = (
        (half_width - radius, -half_height + radius, -90),
        (half_width - radius, half_height - radius, 0),
        (-half_width + radius, half_height - radius, 90),
        (-half_width + radius, -half_height + radius, 180),
    )
    points = []
    for center_x, center_y, start_angle in corners:
        for step in range(corner_steps + 1):
            angle = math.radians(start_angle + step * 90 / corner_steps)
            points.append((
                center_x + math.cos(angle) * radius,
                center_y + math.sin(angle) * radius,
            ))
    return points


def circle_points(radius_x, radius_y=None, segments=16):
    radius_y = radius_y if radius_y is not None else radius_x
    return [
        (
            math.cos(index * math.tau / segments) * radius_x,
            math.sin(index * math.tau / segments) * radius_y,
        )
        for index in range(segments)
    ]


def create_shape(name, points, depth, material, parent, location=(0, 0, 0), rotation=0, bevel=0.012):
    curve = bpy.data.curves.new(f'{name}Curve', type='CURVE')
    curve.dimensions = '2D'
    curve.resolution_u = 1
    curve.render_resolution_u = 1
    curve.fill_mode = 'BOTH'
    curve.extrude = depth * 0.5
    curve.bevel_depth = bevel
    curve.bevel_resolution = 1
    curve.materials.append(material)

    spline = curve.splines.new('POLY')
    spline.points.add(len(points) - 1)
    for point, (x, y) in zip(spline.points, points):
        point.co = (x, y, 0, 1)
    spline.use_cyclic_u = True

    obj = bpy.data.objects.new(name, curve)
    collection.objects.link(obj)
    obj.parent = parent
    obj.location = location
    obj.rotation_euler.z = rotation

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    obj.data.name = f'{name}Mesh'
    return obj


def create_rounded_rect(name, width, height, radius, depth, material, parent, location=(0, 0, 0), rotation=0):
    return create_shape(
        name,
        rounded_rect_points(width, height, radius),
        depth,
        material,
        parent,
        location,
        rotation,
    )


def create_circle(name, radius_x, radius_y, depth, material, parent, location=(0, 0, 0)):
    return create_shape(
        name,
        circle_points(radius_x, radius_y),
        depth,
        material,
        parent,
        location,
        bevel=0.008,
    )


def create_text(name, body, size, depth, material, parent, location=(0, 0, 0)):
    curve = bpy.data.curves.new(f'{name}Curve', type='FONT')
    curve.body = body
    curve.align_x = 'CENTER'
    curve.align_y = 'CENTER'
    curve.size = size
    curve.extrude = depth * 0.5
    curve.bevel_depth = 0.01
    curve.bevel_resolution = 1
    curve.resolution_u = 2
    curve.fill_mode = 'BOTH'
    curve.materials.append(material)

    obj = bpy.data.objects.new(name, curve)
    collection.objects.link(obj)
    obj.parent = parent
    obj.location = location

    bpy.context.view_layer.objects.active = obj
    obj.select_set(True)
    bpy.ops.object.convert(target='MESH')
    obj.select_set(False)
    obj.data.name = f'{name}Mesh'
    return obj


def create_root(name, slot, collider_size):
    root = bpy.data.objects.new(f'{name}PhysicalDynamic', None)
    collection.objects.link(root)
    root.empty_display_type = 'PLAIN_AXES'
    root.location = (slot[0], -slot[2], slot[1])
    root.rotation_euler.x = math.radians(90)
    root['mass'] = 0.7
    root['friction'] = 0.72
    root['restitution'] = 0.14

    collider = bpy.data.objects.new(f'cuboidDomestic{name.title()}', None)
    collection.objects.link(collider)
    collider.empty_display_type = 'CUBE'
    collider.parent = root
    collider.scale = collider_size
    collider['friction'] = 0.72
    collider['restitution'] = 0.14
    return root


def create_xiaohongshu():
    root = create_root('xiaohongshu', SLOTS['xiaohongshu'], (1.72, 1.52, 0.32))
    create_rounded_rect('xiaohongshuBadge', 1.58, 1.38, 0.20, 0.24, materials['xiaohongshu'], root)
    create_text('xiaohongshuWordmark', 'RED', 0.42, 0.13, materials['cream'], root, (0, 0.06, 0.16))
    create_rounded_rect('xiaohongshuUnderline', 0.84, 0.09, 0.035, 0.11, materials['cream'], root, (0, -0.37, 0.16))


def create_bilibili():
    root = create_root('bilibili', SLOTS['bilibili'], (1.84, 1.50, 0.34))
    create_rounded_rect('bilibiliBody', 1.68, 1.22, 0.22, 0.24, materials['bilibili'], root, (0, -0.08, 0))
    create_rounded_rect('bilibiliScreen', 1.20, 0.72, 0.15, 0.12, materials['cream'], root, (0, -0.05, 0.16))
    create_rounded_rect('bilibiliEyeLeft', 0.12, 0.25, 0.05, 0.10, materials['ink'], root, (-0.27, -0.04, 0.24))
    create_rounded_rect('bilibiliEyeRight', 0.12, 0.25, 0.05, 0.10, materials['ink'], root, (0.27, -0.04, 0.24))
    create_rounded_rect('bilibiliAntennaLeft', 0.09, 0.52, 0.035, 0.16, materials['bilibili'], root, (-0.22, 0.65, 0), math.radians(-35))
    create_rounded_rect('bilibiliAntennaRight', 0.09, 0.52, 0.035, 0.16, materials['bilibili'], root, (0.22, 0.65, 0), math.radians(35))


def create_wechat():
    root = create_root('wechat', SLOTS['wechat'], (1.80, 1.72, 0.36))
    create_rounded_rect('wechatBadge', 1.64, 1.56, 0.28, 0.24, materials['wechat'], root)
    create_circle('wechatBubbleLarge', 0.55, 0.43, 0.12, materials['cream'], root, (-0.19, 0.15, 0.16))
    create_shape('wechatTailLarge', [(-0.42, -0.04), (-0.18, -0.11), (-0.34, -0.29)], 0.12, materials['cream'], root, (0, 0, 0.16))
    create_circle('wechatBubbleSmall', 0.41, 0.34, 0.14, materials['cream'], root, (0.33, -0.28, 0.22))
    create_shape('wechatTailSmall', [(0.42, -0.41), (0.63, -0.49), (0.50, -0.62)], 0.14, materials['cream'], root, (0, 0, 0.22))
    create_circle('wechatEyeLargeLeft', 0.055, 0.055, 0.09, materials['wechat'], root, (-0.37, 0.20, 0.25))
    create_circle('wechatEyeLargeRight', 0.055, 0.055, 0.09, materials['wechat'], root, (-0.05, 0.20, 0.25))
    create_circle('wechatEyeSmallLeft', 0.045, 0.045, 0.09, materials['wechat'], root, (0.20, -0.24, 0.31))
    create_circle('wechatEyeSmallRight', 0.045, 0.045, 0.09, materials['wechat'], root, (0.45, -0.24, 0.31))


def create_mail():
    root = create_root('mailDomestic', SLOTS['mail'], (1.80, 1.52, 0.34))
    create_rounded_rect('mailBadge', 1.66, 1.38, 0.22, 0.24, materials['mail'], root)
    create_rounded_rect('mailEnvelope', 1.22, 0.82, 0.11, 0.13, materials['cream'], root, (0, -0.02, 0.16))
    create_shape('mailFlap', [(-0.58, 0.30), (0, -0.12), (0.58, 0.30), (0.58, 0.42), (-0.58, 0.42)], 0.10, materials['mail'], root, (0, -0.07, 0.25))
    create_shape('mailLowerFold', [(-0.52, -0.33), (0, 0.05), (0.52, -0.33)], 0.08, materials['mail'], root, (0, -0.02, 0.25))


create_xiaohongshu()
create_bilibili()
create_wechat()
create_mail()


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

print(f'SOCIAL_DOMESTIC_BLEND={OUTPUT_BLEND}')
print(f'SOCIAL_DOMESTIC_GLB={OUTPUT_GLB}')
print('SOCIAL_DOMESTIC_ROOTS=xiaohongshuPhysicalDynamic,bilibiliPhysicalDynamic,wechatPhysicalDynamic,mailDomesticPhysicalDynamic')
