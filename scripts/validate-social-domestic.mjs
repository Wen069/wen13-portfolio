import { getBounds, NodeIO } from '@gltf-transform/core'
import socialData from '../sources/data/social.js'

const modelPath = 'static/areas/social-domestic.glb'
const expected = [
    { id: 'xiaohongshu', root: 'xiaohongshuPhysicalDynamic' },
    { id: 'bilibili', root: 'bilibiliPhysicalDynamic' },
    { id: 'wechat', root: 'wechatPhysicalDynamic' },
    { id: 'mail', root: 'mailDomesticPhysicalDynamic' },
]
const expectedPlaceholderTargets = new Map([
    [ 'xiaohongshu', 'https://www.xiaohongshu.com/explore' ],
    [ 'bilibili', 'https://www.bilibili.com/' ],
    [ 'wechat', 'https://mp.weixin.qq.com/' ],
    [ 'mail', 'mailto:contact@example.com' ],
])

const fail = (message) =>
{
    throw new Error(`Social domestic asset contract failed: ${message}`)
}

if(socialData.length !== expected.length)
    fail(`expected ${expected.length} social links, found ${socialData.length}`)

for(let index = 0; index < expected.length; index++)
{
    if(socialData[index].id !== expected[index].id)
        fail(`link ${index} must be ${expected[index].id}, found ${socialData[index].id}`)
    if(!socialData[index].url || socialData[index].url.startsWith('#'))
        fail(`${socialData[index].id} must have a jump-ready placeholder URL`)

    const expectedPlaceholderTarget = expectedPlaceholderTargets.get(socialData[index].id)
    if(socialData[index].url !== expectedPlaceholderTarget)
        fail(`${socialData[index].id} must remain a neutral template target in this editorial build`)
}

const io = new NodeIO()
const document = await io.read(modelPath)
const root = document.getRoot()
const scene = root.listScenes()[0]
const rootNodes = scene.listChildren()

if(rootNodes.length !== expected.length)
    fail(`expected ${expected.length} model roots, found ${rootNodes.length}`)

const report = []
for(const item of expected)
{
    const node = rootNodes.find((candidate) => candidate.getName() === item.root)
    if(!node)
        fail(`missing root ${item.root}`)

    const colliders = node.listChildren().filter((child) => /^cuboid/i.test(child.getName()))
    if(colliders.length !== 1)
        fail(`${item.root} must contain one cuboid collider, found ${colliders.length}`)

    const visualNodes = []
    node.traverse((child) =>
    {
        if(child.getMesh())
            visualNodes.push(child)
    })

    if(visualNodes.length < 2)
        fail(`${item.root} must contain layered visual geometry`)

    for(const visualNode of visualNodes)
    {
        for(const primitive of visualNode.getMesh().listPrimitives())
        {
            const materialName = primitive.getMaterial()?.getName() ?? ''
            if(!materialName.startsWith('domestic-'))
                fail(`${visualNode.getName()} uses unexpected material ${materialName}`)
        }
    }

    const bounds = getBounds(node)
    const size = bounds.max.map((value, index) => Number((value - bounds.min[index]).toFixed(3)))
    if(size[0] < 1.2 || size[1] < 1.0 || size[2] > 0.5)
        fail(`${item.root} has out-of-style dimensions ${size.join(' × ')}`)

    report.push({
        id: item.id,
        root: item.root,
        visualNodes: visualNodes.length,
        collider: colliders[0].getName(),
        size,
        url: socialData.find((link) => link.id === item.id).url,
    })
}

console.log(JSON.stringify({
    modelPath,
    roots: rootNodes.length,
    links: socialData.length,
    report,
}, null, 2))
