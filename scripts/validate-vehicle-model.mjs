import assert from 'node:assert/strict'
import { getBounds, NodeIO } from '@gltf-transform/core'


const inputPath = process.argv[2] ?? 'static/vehicle/default.glb'
if(inputPath.match(/-compressed\.glb$/))
    throw new Error('Validate the uncompressed source GLB before the project compression step.')

const document = await new NodeIO().read(inputPath)
const root = document.getRoot()
const nodes = root.listNodes()
const scene = root.listScenes()[0]

const findPrefix = (name, within = nodes) => within.find((node) =>
    node.getName().toLowerCase().startsWith(name.toLowerCase())
)

const chassis = findPrefix('chassis')
const paintedBody = findPrefix('bodyPainted')
const wheelContainer = findPrefix('wheelContainer')
assert(chassis, 'vehicle model requires a chassis node')
assert(paintedBody, 'vehicle model requires a bodyPainted node for paint rewards')
assert(wheelContainer, 'vehicle model requires a wheelContainer template')

const wheelDescendants = []
const visit = (node) => {
    wheelDescendants.push(node)
    node.listChildren().forEach(visit)
}
visit(wheelContainer)
assert(findPrefix('wheelCylinder', wheelDescendants), 'wheelContainer requires a wheelCylinder descendant')

const blinkerLeft = findPrefix('blinkerLeft')
const blinkerRight = findPrefix('blinkerRight')
assert.equal(Boolean(blinkerLeft), Boolean(blinkerRight), 'blinkers must be supplied as a left/right pair')

const energy = findPrefix('energy')
const cells = ['cell1', 'cell2', 'cell3'].map((name) => findPrefix(name))
if(energy)
    assert(cells.every(Boolean), 'an energy mesh requires cell1, cell2 and cell3 boost parts')

const antenna = findPrefix('antenna')
if(antenna)
{
    assert(findPrefix('antennaHead'), 'an antenna requires an antennaHead node')
    assert(findPrefix('antennaHeadReference'), 'an antenna requires an antennaHeadReference node')
}

const bounds = getBounds(scene)
const dimensions = bounds.max.map((value, index) => value - bounds.min[index])
assert(dimensions[0] > 1 && dimensions[0] < 5, 'vehicle X length is outside the current physics-safe range')
assert(dimensions[1] > 0.5 && dimensions[1] < 3, 'vehicle Y height is outside the current physics-safe range')
assert(dimensions[2] > 1 && dimensions[2] < 3, 'vehicle Z width is outside the current physics-safe range')

console.log(JSON.stringify({
    valid: true,
    inputPath,
    dimensions: dimensions.map((value) => Number(value.toFixed(3))),
    requiredParts: {
        chassis: chassis.getName(),
        bodyPainted: paintedBody.getName(),
        wheelContainer: wheelContainer.getName(),
        wheelCylinder: findPrefix('wheelCylinder', wheelDescendants).getName(),
    },
    optionalFeatures: {
        blinkers: Boolean(blinkerLeft && blinkerRight),
        brakeLights: Boolean(findPrefix('stopLights')),
        reversingLights: Boolean(findPrefix('backLights')),
        boostCells: Boolean(energy),
        antenna: Boolean(antenna),
    },
    physicsCoupling: 'none; PhysicsVehicle owns the Rapier chassis, wheels and handling values',
}, null, 2))
