import { getBounds, NodeIO } from '@gltf-transform/core'

const inputPath = process.argv[2] ?? 'static/areas/areas.glb'
const rootName = process.argv[3] ?? 'social'
const mode = process.argv[4] ?? 'full'

const io = new NodeIO()
const document = await io.read(inputPath)
const root = document.getRoot()
const scene = root.listScenes()[0]
const target = root.listNodes().find((node) => node.getName() === rootName)

if(!target)
    throw new Error(`Root node "${rootName}" was not found in ${inputPath}`)

const round = (values) => values.map((value) => Number(value.toFixed(4)))
const finiteBounds = (node) =>
{
    if(!node.getMesh())
        return null

    const bounds = getBounds(node)
    if(!bounds.min.every(Number.isFinite) || !bounds.max.every(Number.isFinite))
        return null

    return {
        min: round(bounds.min),
        max: round(bounds.max),
        size: round(bounds.max.map((value, index) => value - bounds.min[index])),
    }
}

const nodes = []
const visit = (node, depth, parent = null) =>
{
    const mesh = node.getMesh()
    const primitives = mesh?.listPrimitives() ?? []

    nodes.push({
        depth,
        name: node.getName(),
        parent: parent?.getName() ?? null,
        mesh: mesh?.getName() ?? null,
        materials: [...new Set(primitives.map((primitive) => primitive.getMaterial()?.getName()).filter(Boolean))],
        localTranslation: round(node.getTranslation()),
        localRotation: round(node.getRotation()),
        localScale: round(node.getScale()),
        worldTranslation: round(node.getWorldTranslation()),
        worldRotation: round(node.getWorldRotation()),
        worldScale: round(node.getWorldScale()),
        bounds: finiteBounds(node),
        extras: node.getExtras(),
        children: node.listChildren().length,
    })

    for(const child of node.listChildren())
        visit(child, depth + 1, node)
}

visit(target, 0)

console.log(JSON.stringify({
    inputPath,
    scene: scene.getName(),
    rootName,
    nodeCount: nodes.length,
    nodes: mode === 'summary' ? nodes.filter((node) => node.depth <= 1) : nodes,
}, null, 2))
