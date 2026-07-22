import assert from 'node:assert/strict'
import path from 'node:path'
import { access, readFile, readdir } from 'node:fs/promises'


async function listFiles(directory, prefix = '')
{
    const entries = await readdir(directory, { withFileTypes: true })
    const files = []

    for(const entry of entries)
    {
        const relativePath = path.posix.join(prefix, entry.name)
        if(entry.isDirectory())
            files.push(...await listFiles(path.join(directory, entry.name), relativePath))
        else
            files.push(relativePath)
    }

    return files
}

const distFiles = await listFiles('dist')
const retiredPathPattern = /(?:^|\/)(?:wen13-|wen13\.|wen13\/)|career(?:Freelancer|Hetic|ImmersiveGarden|IRLTeacher|OnlineTeacher|Uzik)/i
const leakedRetiredFiles = distFiles.filter(file => retiredPathPattern.test(file))
assert.deepEqual(leakedRetiredFiles, [], `retired Wen13 assets leaked into dist:\n${leakedRetiredFiles.join('\n')}`)

for(const requiredPath of [
    'dist/og.png',
    'dist/profile/han-han-concept-avatar.webp',
    'dist/areas/landing-han-han-statue.glb',
    'dist/areas/han-han-letters.glb',
    'dist/areas/han-han-circuit-markers.glb',
    'dist/vehicle/han-han.glb',
])
    await access(requiredPath)

const manifest = JSON.parse(await readFile('dist/favicons/site.webmanifest', 'utf8'))
assert.equal(manifest.name, '韩寒 · 两种速度｜非官方策展概念')
assert.equal(manifest.short_name, '两种速度')
assert(manifest.icons.every(icon => icon.src.startsWith('./')), 'manifest icon paths must be relative to the versioned subdirectory')

const indexSource = await readFile('dist/index.html', 'utf8')
assert.match(indexSource, /韩寒 · 两种速度｜非官方策展概念/)
assert.match(indexSource, /\/versions\/han-han-concept-01\/og\.png/)

console.log(JSON.stringify({
    valid: true,
    files: distFiles.length,
    retiredWen13Assets: leakedRetiredFiles.length,
    manifest: { name: manifest.name, shortName: manifest.short_name },
}, null, 2))
