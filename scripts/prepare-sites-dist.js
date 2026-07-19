import fs from 'node:fs/promises'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const distDirectory = path.join(projectDirectory, 'dist')
const execFileAsync = promisify(execFile)

// The runtime playlist already uses the compressed MP3 files. Keep the
// lossless masters in static/ for editing, but exclude them from deployments.
const unusedMusicMasters = [
    'Baguira.wav',
    'Boy.wav',
    'Sudo.wav'
]

for(const fileName of unusedMusicMasters)
{
    await fs.rm(path.join(distDirectory, 'sounds', 'musics', fileName), { force: true })
}

// Re-encode only the deployment copies. The source MP3 files remain untouched,
// while the public version uses a mobile-friendly bitrate.
for(const fileName of ['Baguira.mp3', 'Boy.mp3', 'Sudo.mp3'])
{
    const musicPath = path.join(distDirectory, 'sounds', 'musics', fileName)
    const temporaryPath = path.join(distDirectory, 'sounds', 'musics', `${path.basename(fileName, '.mp3')}.publish.mp3`)

    await execFileAsync('ffmpeg', [
        '-y',
        '-loglevel', 'error',
        '-i', musicPath,
        '-map_metadata', '-1',
        '-codec:a', 'libmp3lame',
        '-b:a', '112k',
        temporaryPath
    ])
    await fs.rename(temporaryPath, musicPath)
}

let redundantAssetCount = 0

async function removeRedundantRuntimeAssets(directory)
{
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const fileNames = new Set(entries.filter(entry => entry.isFile()).map(entry => entry.name))

    for(const entry of entries)
    {
        const entryPath = path.join(directory, entry.name)

        if(entry.isDirectory())
        {
            await removeRedundantRuntimeAssets(entryPath)
            continue
        }

        const extension = path.extname(entry.name)
        const baseName = entry.name.slice(0, - extension.length)
        const hasCompressedTexture = ['.png', '.jpg', '.jpeg'].includes(extension.toLowerCase()) &&
            (fileNames.has(`${baseName}.ktx`) || fileNames.has(`${baseName}.webp`))
        const hasCompressedModel = extension === '.glb' &&
            !baseName.endsWith('-compressed') &&
            fileNames.has(`${baseName}-compressed.glb`)

        if(hasCompressedTexture || hasCompressedModel)
        {
            await fs.rm(entryPath)
            redundantAssetCount++
        }
    }
}

await removeRedundantRuntimeAssets(distDirectory)

// Noto Sans SC ships both WOFF2 and legacy WOFF URLs. All target browsers for
// this GPU experience support WOFF2, so remove the duplicate legacy payload.
const assetsDirectory = path.join(distDirectory, 'assets')
const assetEntries = await fs.readdir(assetsDirectory)
const cssFiles = assetEntries.filter(fileName => fileName.endsWith('.css'))

for(const cssFile of cssFiles)
{
    const cssPath = path.join(assetsDirectory, cssFile)
    const css = await fs.readFile(cssPath, 'utf8')
    const optimizedCss = css.replace(
        /,\s*url\(([^)]*noto-sans-sc[^)]*\.woff)\)\s*format\((['"])woff\2\)/g,
        ''
    )
    await fs.writeFile(cssPath, optimizedCss)
}

let removedLegacyFonts = 0
for(const fileName of assetEntries)
{
    if(fileName.startsWith('noto-sans-sc-') && fileName.endsWith('.woff'))
    {
        await fs.rm(path.join(assetsDirectory, fileName))
        removedLegacyFonts++
    }
}

for(const diagnosticModel of [
    'areas-wen13.glb',
    'areas-wen13-ktx.glb',
    'areas-wen13-compressed.glb'
])
{
    await fs.rm(path.join(distDirectory, 'areas', diagnosticModel), { force: true })
}

// Sites runs a Cloudflare-compatible Worker. The portfolio itself is a static
// Vite app, so the Worker delegates files to the platform asset binding and
// falls back to index.html for client-side routes.
const serverDirectory = path.join(distDirectory, 'server')
await fs.mkdir(serverDirectory, { recursive: true })

const workerSource = `export default {
    async fetch(request, env)
    {
        const response = await env.ASSETS.fetch(request)

        if(response.status !== 404 || !['GET', 'HEAD'].includes(request.method))
            return response

        const url = new URL(request.url)
        const fallbackRequest = new Request(new URL('/index.html', url), request)
        return env.ASSETS.fetch(fallbackRequest)
    }
}
`

await fs.writeFile(path.join(serverDirectory, 'index.js'), workerSource)

console.log(`Sites deployment prepared; removed ${unusedMusicMasters.length} unused WAV masters, ${redundantAssetCount} redundant runtime assets, and ${removedLegacyFonts} legacy font files.`)
