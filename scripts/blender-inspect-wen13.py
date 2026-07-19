import bpy
import json
import os

tokens = (
    'bruno', 'simon', 'portfolio', 'landing', 'career', 'project',
    'title', 'text', 'letter', 'name', 'intro', 'home', 'sign', 'label'
)

matches = []
font_objects = []

for obj in bpy.data.objects:
    name_lower = obj.name.lower()
    data_name = getattr(obj.data, 'name', '') if obj.data else ''
    data_name_lower = data_name.lower()

    record = {
        'name': obj.name,
        'type': obj.type,
        'data': data_name,
        'collections': [collection.name for collection in obj.users_collection],
        'parent': obj.parent.name if obj.parent else None,
        'location': [round(value, 4) for value in obj.location],
        'rotation_euler': [round(value, 4) for value in obj.rotation_euler],
        'scale': [round(value, 4) for value in obj.scale],
        'dimensions': [round(value, 4) for value in obj.dimensions],
        'world_location': [round(value, 4) for value in obj.matrix_world.translation],
        'materials': [material.name for material in getattr(obj.data, 'materials', [])] if obj.data else [],
        'hide_render': obj.hide_render,
        'hide_viewport': obj.hide_viewport,
    }

    if obj.type == 'FONT':
        record['body'] = obj.data.body
        font_objects.append(record)

    if any(token in name_lower or token in data_name_lower for token in tokens):
        matches.append(record)

inventory = {
    'blend_file': bpy.data.filepath,
    'object_count': len(bpy.data.objects),
    'font_objects': font_objects,
    'name_matches': matches,
}

output_path = os.path.abspath('tools/blender/folio-inventory.json')
os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as output_file:
    json.dump(inventory, output_file, ensure_ascii=False, indent=2)

print(f'WEN13_BLEND_INVENTORY_WRITTEN={output_path}')
print(f'WEN13_BLEND_OBJECT_COUNT={inventory["object_count"]}')
print(f'WEN13_BLEND_FONT_OBJECTS={len(font_objects)}')
print(f'WEN13_BLEND_NAME_MATCHES={len(matches)}')
