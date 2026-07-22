import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import projects from '../sources/data/projects.js'
import lab from '../sources/data/lab.js'
import social from '../sources/data/social.js'


const requiredFiles = [
    'static/og.png',
    'static/profile/han-han-concept-avatar.webp',
    'static/areas/landing-han-han-statue.glb',
    'static/areas/han-han-letters.glb',
    'static/areas/han-han-circuit-markers.glb',
    'static/vehicle/han-han.glb',
    ...projects.flatMap((item) => item.images.map((image) => `static/projects/images/${image}`)),
    ...lab.flatMap((item) => [
        `static/lab/images/${item.image}`,
        `static/lab/images/${item.imageMini}`,
    ]),
    ...[
        'racing-start',
        'writing',
        'merge',
        'director',
        'open-loop',
        'double-title',
    ].map((name) => `static/career/hanhan-career-${name}.ktx`),
    ...[
        '1999-writing',
        '2003-racing',
        '2014-directing',
        '2026-open',
    ].map((name) => `static/timeMachine/hanhan-time-${name}.ktx`),
]

await Promise.all(requiredFiles.map((path) => access(path)))

assert.equal(projects.length, 4, 'release requires four curated project stories')
assert(projects.every((project) => project.images.length === 3), 'each project requires evidence, explanation and mood images')
assert(projects.every((project) => project.url.startsWith('#project-')), 'project links must remain internal editorial anchors')
assert.equal(lab.length, 6, 'release requires six editorial Lab prompts')
assert(lab.every((item) => item.url.startsWith('#lab-')), 'Lab links must remain internal editorial anchors')

const expectedSocialTargets = new Map([
    [ 'xiaohongshu', 'https://www.xiaohongshu.com/explore' ],
    [ 'bilibili', 'https://www.bilibili.com/' ],
    [ 'wechat', 'https://mp.weixin.qq.com/' ],
    [ 'mail', 'mailto:contact@example.com' ],
])
assert.equal(social.length, expectedSocialTargets.size, 'release requires exactly four neutral social placeholders')
for(const item of social)
    assert.equal(item.url, expectedSocialTargets.get(item.id), `${item.id} must remain a neutral placeholder target`)

const indexSource = await readFile('sources/index.html', 'utf8')
assert.match(indexSource, /<html lang="zh-CN">/, 'document language must remain Simplified Chinese')
assert.match(indexSource, /韩寒 · 两种速度/, 'release title is missing')
assert.match(indexSource, /非官方原创策展概念/, 'prominent editorial disclosure is missing')
assert.match(indexSource, /与韩寒本人及相关团队无隶属、合作、授权或背书关系/, 'no-affiliation disclosure is missing')
assert.match(indexSource, /https:\/\/wen069\.github\.io\/wen13-portfolio\/versions\/han-han-concept-01\//, 'canonical public release URL is missing')
assert.match(indexSource, /\/versions\/han-han-concept-01\/og\.png/, 'social preview metadata is missing')
assert.doesNotMatch(indexSource, /(?:src|href)="\/(?!\/)/, 'root-relative assets would break the versioned Pages subpath')

const manifest = JSON.parse(await readFile('static/favicons/site.webmanifest', 'utf8'))
assert.equal(manifest.name, '韩寒 · 两种速度｜非官方策展概念', 'PWA manifest still carries the upstream brand')
assert.equal(manifest.short_name, '两种速度')
assert(manifest.icons.every(icon => icon.src.startsWith('./')), 'PWA manifest icons must remain subpath-relative')

const gameSource = await readFile('sources/Game/Game.js', 'utf8')
for(const path of [
    'vehicle/han-han.glb',
    'areas/han-han-letters.glb',
    'areas/landing-han-han-statue.glb',
    'areas/han-han-circuit-markers.glb',
])
    assert(gameSource.includes(path), `Game resource registry is missing ${path}`)

const timeMachineSource = await readFile('sources/Game/World/Areas/TimeMachineArea.js', 'utf8')
for(const year of [1999, 2003, 2014, 2026])
    assert(timeMachineSource.includes(`timeMachine${year}Texture`), `Time Machine is missing ${year}`)

const careerSource = await readFile('sources/Game/World/Areas/CareerArea.js', 'utf8')
assert.match(careerSource, /this\.year\.size = 17/, 'Career must preserve the original drivable lane length')
assert.match(careerSource, /this\.year\.start = 1999/, 'Career start year is missing')
assert.match(careerSource, /this\.year\.end = 2026/, 'Career end year is missing')
assert.match(careerSource, /yearProgress \* \(this\.year\.end - this\.year\.start\)/, 'Career years must be compressed onto the existing lane')

const mapSource = await readFile('sources/Game/Map.js', 'utf8')
for(const label of ['两种速度', '从纸面到赛道', '判断发生的地方', '速度编辑室', '四次进入新专业', '版本，不是答案'])
    assert(mapSource.includes(label), `map is missing the ${label} chapter`)

const runtimeSources = [
    indexSource,
    gameSource,
    mapSource,
    JSON.stringify(projects),
    JSON.stringify(lab),
    JSON.stringify(social),
].join('\n').replaceAll('wen13-portfolio', 'public-repository-path')
assert.doesNotMatch(runtimeSources, /Wen13|QIXU|栖序|AI 转型/i, 'Wen13 persona content leaked into the Han Han release')

console.log(JSON.stringify({
    valid: true,
    projects: projects.length,
    projectVisuals: projects.reduce((total, item) => total + item.images.length, 0),
    labItems: lab.length,
    neutralSocialModels: social.map((item) => item.id),
    verifiedFiles: requiredFiles.length,
    publicPath: 'https://wen069.github.io/wen13-portfolio/versions/han-han-concept-01/',
}, null, 2))
