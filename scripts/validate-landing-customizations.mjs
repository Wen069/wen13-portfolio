import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { getBounds, NodeIO } from '@gltf-transform/core'


const assetPath = 'static/areas/landing-knight-statue.glb'
const io = new NodeIO()
const document = await io.read(assetPath)
const root = document.getRoot()
const scene = root.listScenes()[0]
const nodes = root.listNodes()

const statueRoot = nodes.find((node) => node.getName() === 'landingKnightStatuePhysicalFixed')
assert(statueRoot, 'landing statue needs a landingKnightStatuePhysicalFixed root')

const collider = statueRoot.listChildren().find((node) => node.getName() === 'cuboidLandingKnightStatue')
assert(collider, 'landing statue needs a direct cuboidLandingKnightStatue collider child')
assert.equal(collider.getMesh(), null, 'the fixed collider must be a non-rendered node')

const bounds = getBounds(scene)
const dimensions = bounds.max.map((value, index) => value - bounds.min[index])
assert(dimensions[1] >= 6.5 && dimensions[1] <= 8, `statue height must stay large but scene-safe; got ${dimensions[1]}`)
assert(dimensions[0] <= 7 && dimensions[2] <= 7, 'statue footprint exceeds the reserved landing slot')
assert.equal(root.listAnimations().length, 0, 'landing statue should be a static baked pose')
assert(root.listMeshes().length <= 8, 'landing statue mesh count exceeds the intended lightweight budget')

const position = statueRoot.getTranslation()
assert(Math.abs(position[0] - 37) < 0.01, 'landing statue X position changed unexpectedly')
assert(Math.abs(position[2] - 41) < 0.01, 'landing statue Z position changed unexpectedly')
const isometricHorizontal = position[0] - position[2]
const isometricDepth = position[0] + position[2]
assert(isometricHorizontal >= -4.5, 'landing statue would fall outside the left edge of the narrow mobile camera')
assert(isometricDepth <= 80, 'landing statue would become an oversized foreground obstruction')

const rotation = statueRoot.getRotation()
const front = [
    2 * rotation[1] * rotation[3],
    0,
    1 - 2 * rotation[1] * rotation[1],
]
const cameraDirection = [Math.SQRT1_2, 0, Math.SQRT1_2]
const cameraFacingDot = front[0] * cameraDirection[0] + front[2] * cameraDirection[2]
assert(cameraFacingDot > 0.65, `statue front must remain readable from the fixed 45-degree gameplay camera; dot=${cameraFacingDot}`)

const dayCyclesSource = await readFile('sources/Game/Cycles/DayCycles.js', 'utf8')
assert.match(dayCyclesSource, /super\('🕜 Day Cycles',\s*5\s*\*\s*60,/, 'day/night cycle must be five minutes')

const gameSource = await readFile('sources/Game/Game.js', 'utf8')
assert.match(gameSource, /landingKnightStatueModel/, 'Game resource registry must include the landing statue')
assert.match(gameSource, /areas\/landing-knight-statue\.glb/, 'Game resource registry must point to the shipped statue asset')

const landingSource = await readFile('sources/Game/World/Areas/LandingArea.js', 'utf8')
assert.match(landingSource, /this\.setStatue\(\)/, 'LandingArea must initialize the statue')
assert.match(landingSource, /landingKnightStatuePhysicalFixed/, 'LandingArea must select the fixed statue root')

console.log(JSON.stringify({
    valid: true,
    assetPath,
    root: statueRoot.getName(),
    position: position.map((value) => Number(value.toFixed(2))),
    dimensions: dimensions.map((value) => Number(value.toFixed(2))),
    meshCount: root.listMeshes().length,
    materialCount: root.listMaterials().length,
    animationCount: root.listAnimations().length,
    dayCycleSeconds: 300,
    cameraFacingDot: Number(cameraFacingDot.toFixed(3)),
    narrowViewportPlacement: { isometricHorizontal, isometricDepth },
}, null, 2))
