import assert from 'node:assert/strict'
import { stat } from 'node:fs/promises'
import { getBounds, NodeIO } from '@gltf-transform/core'
import { KHRDracoMeshCompression } from '@gltf-transform/extensions'
import draco3d from 'draco3dgltf'


const paths = {
    statue: process.argv[2] ?? 'static/areas/landing-han-han-statue.glb',
    vehicle: process.argv[3] ?? 'static/vehicle/han-han.glb',
    letters: process.argv[4] ?? 'static/areas/han-han-letters.glb',
    circuit: process.argv[5] ?? 'static/areas/han-han-circuit-markers.glb',
    vehicleBaseline: 'static/vehicle/default.glb',
}

const io = new NodeIO()
    .registerExtensions([KHRDracoMeshCompression])
    .registerDependencies({
        'draco3d.decoder': await draco3d.createDecoderModule(),
    })

function roundVector(values, precision = 3)
{
    return values.map((value) => Number(value.toFixed(precision)))
}

function triangleCount(root)
{
    let total = 0
    for(const mesh of root.listMeshes())
    {
        for(const primitive of mesh.listPrimitives())
        {
            const count = primitive.getIndices()?.getCount() ?? primitive.getAttribute('POSITION')?.getCount() ?? 0
            if(primitive.getMode() === 4)
                total += count / 3
        }
    }
    return Math.round(total)
}

async function inspect(path)
{
    const document = await io.read(path)
    const root = document.getRoot()
    const scene = root.listScenes()[0]
    assert(scene, `${path} requires one scene`)
    const bounds = getBounds(scene)
    const dimensions = bounds.max.map((value, index) => value - bounds.min[index])
    return {
        document,
        root,
        scene,
        nodes: root.listNodes(),
        dimensions,
        triangles: triangleCount(root),
        bytes: (await stat(path)).size,
    }
}

function requireStaticTextureless(asset, name, maxMaterials)
{
    assert.equal(asset.root.listAnimations().length, 0, `${name} must not contain animations`)
    assert.equal(asset.root.listTextures().length, 0, `${name} must not contain textures`)
    assert(asset.root.listMaterials().length <= maxMaterials, `${name} exceeds ${maxMaterials} materials`)
}

const statue = await inspect(paths.statue)
requireStaticTextureless(statue, 'statue', 3)
const statueRoot = statue.nodes.find((node) => node.getName() === 'landingKnightStatuePhysicalFixed')
assert(statueRoot, 'statue requires the compatibility root landingKnightStatuePhysicalFixed')
const statueCollider = statueRoot.listChildren().find((node) => node.getName() === 'cuboidLandingKnightStatue')
assert(statueCollider, 'statue requires direct cuboidLandingKnightStatue collider')
assert.equal(statueCollider.getMesh(), null, 'statue collider must remain non-rendered')
assert(statue.root.listMeshes().length <= 8, 'statue must stay within the established 8-mesh budget')
assert(statue.triangles >= 8000 && statue.triangles <= 20000, `statue triangles outside 8k–20k design budget: ${statue.triangles}`)
assert(statue.dimensions[0] <= 7 && statue.dimensions[2] <= 7, 'statue footprint exceeds the landing slot')
assert(statue.dimensions[1] >= 6.5 && statue.dimensions[1] <= 8, `statue height must remain 6.5–8m: ${statue.dimensions[1]}`)
const statuePosition = statueRoot.getTranslation()
assert(Math.abs(statuePosition[0] - 37) < 0.01, 'statue X changed from the reserved landing slot')
assert(Math.abs(statuePosition[2] - 41) < 0.01, 'statue Z changed from the reserved landing slot')
const isometricHorizontal = statuePosition[0] - statuePosition[2]
const isometricDepth = statuePosition[0] + statuePosition[2]
assert(isometricHorizontal >= -4.5, 'statue falls outside the narrow mobile camera left edge')
assert(isometricDepth <= 80, 'statue becomes an oversized foreground obstruction')
const statueRotation = statueRoot.getRotation()
const statueFront = [
    2 * statueRotation[1] * statueRotation[3],
    0,
    1 - 2 * statueRotation[1] * statueRotation[1],
]
const cameraDirection = [Math.SQRT1_2, 0, Math.SQRT1_2]
const cameraFacingDot = statueFront[0] * cameraDirection[0] + statueFront[2] * cameraDirection[2]
assert(cameraFacingDot > 0.65, `statue must face the fixed +X/+Z camera; dot=${cameraFacingDot}`)
assert.match(statueRoot.getExtras().rightsBoundary ?? '', /no likeness scan/i, 'statue must carry the abstract-likeness rights boundary')

const letters = await inspect(paths.letters)
requireStaticTextureless(letters, 'letters', 3)
const letterRoots = letters.scene.listChildren()
assert.equal(letterRoots.length, 6, 'HANHAN entry sign requires exactly six top-level physical letters')
for(let index = 0; index < letterRoots.length; index++)
{
    const letter = letterRoots[index]
    assert.match(letter.getName(), /^refLettersPhysicalDynamic\d{2}$/, `letter ${index} must preserve dynamic naming contract`)
    assert(letter.getMesh(), `letter ${index} must be rendered directly by its top-level physical node`)
    const collider = letter.listChildren().find((node) => /^cuboidHanHan\d{2}$/.test(node.getName()))
    assert(collider, `letter ${index} requires a cuboid collider child`)
    assert.equal(collider.getMesh(), null, `letter ${index} collider must remain non-rendered`)
    const extras = letter.getExtras()
    assert.equal(extras.mass, 1, `letter ${index} must retain mass=1`)
}
assert(letters.dimensions[0] <= 11 && letters.dimensions[2] <= 8, 'HANHAN sign exceeds the current landing-letter slot')

const vehicle = await inspect(paths.vehicle)
const baselineVehicle = await inspect(paths.vehicleBaseline)
assert.equal(vehicle.root.listAnimations().length, 0, 'vehicle source should not contain animations')
const vehicleNodes = vehicle.nodes
const findPrefix = (prefix, within = vehicleNodes) => within.find((node) => node.getName().toLowerCase().startsWith(prefix.toLowerCase()))
const chassis = findPrefix('chassis')
const bodyPainted = findPrefix('bodyPainted')
const wheelContainer = findPrefix('wheelContainer')
assert(chassis && bodyPainted && wheelContainer, 'vehicle requires chassis, bodyPainted and wheelContainer')
const wheelDescendants = []
const visit = (node) => {
    wheelDescendants.push(node)
    node.listChildren().forEach(visit)
}
visit(wheelContainer)
assert(findPrefix('wheelCylinder', wheelDescendants), 'wheelContainer requires wheelCylinder descendant')
assert(findPrefix('wheelSuspension', wheelDescendants), 'skin must preserve wheelSuspension feedback')
assert(findPrefix('wheelPainted', wheelDescendants), 'skin must preserve wheelPainted reward coupling')
for(const [left, right] of [['blinkerLeft', 'blinkerRight']])
    assert.equal(Boolean(findPrefix(left)), Boolean(findPrefix(right)), 'blinkers must remain a pair')
for(const required of ['stopLights', 'backLights', 'energy', 'cell1', 'cell2', 'cell3'])
    assert(findPrefix(required), `vehicle must preserve optional runtime feature ${required}`)
const baselineNames = new Set(baselineVehicle.nodes.map((node) => node.getName()))
const vehicleNames = new Set(vehicle.nodes.map((node) => node.getName()))
for(const baselineName of baselineNames)
    assert(vehicleNames.has(baselineName), `vehicle skin dropped baseline node ${baselineName}`)
for(let index = 0; index < 3; index++)
    assert(Math.abs(vehicle.dimensions[index] - baselineVehicle.dimensions[index]) <= 0.12, `vehicle dimension ${index} drifted beyond skin-only tolerance`)
assert.match(chassis.getExtras().rightsBoundary ?? '', /no team/i, 'vehicle must carry its unbranded rights boundary')

const circuit = await inspect(paths.circuit)
requireStaticTextureless(circuit, 'circuit markers', 3)
const circuitRoot = circuit.nodes.find((node) => node.getName() === 'hanHanCircuitMarkersVisual')
assert(circuitRoot, 'circuit markers require a hanHanCircuitMarkersVisual root')
assert.equal(circuit.nodes.some((node) => /physical|cuboid|trimesh|hull|tube|ball/i.test(node.getName())), false, 'circuit markers must not create colliders')
assert(circuit.dimensions[0] > 90 && circuit.dimensions[2] > 100, 'circuit marker bounds should intentionally span world-space checkpoint positions')
assert(circuit.dimensions[1] <= 0.12, 'road inlays must remain below 12 cm visual height')
assert.match(circuitRoot.getExtras().physicsCoupling ?? '', /^none$/, 'circuit markers must declare no physics coupling')

const summarize = (asset) => ({
    dimensions: roundVector(asset.dimensions),
    triangles: asset.triangles,
    meshes: asset.root.listMeshes().length,
    materials: asset.root.listMaterials().length,
    textures: asset.root.listTextures().length,
    animations: asset.root.listAnimations().length,
    bytes: asset.bytes,
    kib: Number((asset.bytes / 1024).toFixed(1)),
})

console.log(JSON.stringify({
    valid: true,
    paths,
    statue: {
        ...summarize(statue),
        root: statueRoot.getName(),
        position: roundVector(statuePosition),
        cameraFacingDot: Number(cameraFacingDot.toFixed(3)),
        narrowViewportPlacement: {
            isometricHorizontal: Number(isometricHorizontal.toFixed(3)),
            isometricDepth: Number(isometricDepth.toFixed(3)),
        },
    },
    letters: {
        ...summarize(letters),
        topLevelDynamicLetters: letterRoots.map((node) => node.getName()),
    },
    vehicle: {
        ...summarize(vehicle),
        baselineDimensions: roundVector(baselineVehicle.dimensions),
        preservedBaselineNodeCount: baselineNames.size,
        addedVisualNodes: [...vehicleNames].filter((name) => !baselineNames.has(name)).sort(),
    },
    circuit: {
        ...summarize(circuit),
        worldSpaceSpanIntentional: true,
        collisionNodes: 0,
    },
}, null, 2))
