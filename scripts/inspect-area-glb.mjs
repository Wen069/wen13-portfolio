import { NodeIO } from '@gltf-transform/core'

const inputPath = process.argv[2]

if(!inputPath)
    throw new Error('Usage: node scripts/inspect-area-glb.mjs <path-to-glb>')

const io = new NodeIO()
const document = await io.read(inputPath)
const root = document.getRoot()
const scene = root.listScenes()[0]
const nodes = root.listNodes()

const parentByNode = new Map()
for(const node of nodes)
{
    for(const child of node.listChildren())
        parentByNode.set(child, node)
}

const criticalNodes = nodes
    .filter((node) => /^(landing|career|projects|lab|circuit|refLettersPhysicalDynamic)/.test(node.getName()))
    .map((node) => ({
        name: node.getName(),
        parent: parentByNode.get(node)?.getName() ?? null,
        children: node.listChildren().length,
        childNodes: node.getName().startsWith('refLettersPhysicalDynamic')
            ? node.listChildren().map((child) => ({
                name: child.getName(),
                mesh: child.getMesh()?.getName() ?? null,
                translation: child.getTranslation().map((value) => Number(value.toFixed(4))),
                scale: child.getScale().map((value) => Number(value.toFixed(4))),
            }))
            : undefined,
        mesh: node.getMesh()?.getName() ?? null,
        translation: node.getTranslation().map((value) => Number(value.toFixed(4))),
    }))

console.log(JSON.stringify({
    inputPath,
    nodeCount: nodes.length,
    meshCount: root.listMeshes().length,
    materialCount: root.listMaterials().length,
    sceneChildren: scene.listChildren().map((node) => node.getName()),
    criticalNodes,
}, null, 2))
