import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const displayFont = 'Xingkai SC, STKaiti, PingFang SC, Noto Sans SC, sans-serif'
const sansFont = 'PingFang SC, Noto Sans SC, sans-serif'

const renderSvg = async (relativePath, width, height, body) =>
{
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
            <g fill="#ffffff" stroke="none">${body}</g>
        </svg>
    `

    await sharp(Buffer.from(svg))
        .png()
        .toFile(path.join(root, relativePath))
}

const arrow = `
    <path d="M16 95 C34 76 55 73 79 82 M16 95 L19 72 M16 95 L38 91"
        fill="none" stroke="#ffffff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
`

const introText = (top, bottom, icon = '') => `
    ${arrow}
    <text x="${icon ? 139 : 166}" y="48" text-anchor="middle" font-family="${displayFont}" font-size="39" font-weight="700">${top}</text>
    <text x="166" y="100" text-anchor="middle" font-family="${displayFont}" font-size="39" font-weight="700">${bottom}</text>
    ${icon}
`

await renderSvg('static/intro/mouseKeyboardLabel.png', 256, 128, introText('点击', '开始'))
await renderSvg('static/intro/touchLabel.png', 256, 128, introText('轻触', '开始'))
await renderSvg(
    'static/intro/gamepadXboxLabel.png',
    256,
    128,
    introText(
        '按下',
        '开始',
        '<circle cx="211" cy="34" r="24" fill="none" stroke="#ffffff" stroke-width="4" /><text x="211" y="45" text-anchor="middle" font-family="PingFang SC, sans-serif" font-size="31" font-weight="700">A</text>'
    )
)
await renderSvg(
    'static/intro/gamepadPlaystationLabel.png',
    256,
    128,
    introText(
        '按下',
        '开始',
        '<circle cx="211" cy="34" r="24" fill="none" stroke="#ffffff" stroke-width="4" /><text x="211" y="45" text-anchor="middle" font-family="PingFang SC, sans-serif" font-size="34" font-weight="500">×</text>'
    )
)

const careerText = (width, height, lines) =>
{
    const gap = height >= 90 ? 27 : 30
    const fontSize = height >= 90 ? 22 : 23
    const startY = height / 2 - (lines.length - 1) * gap / 2

    return lines.map((line, index) => `
        <text x="${width / 2}" y="${startY + index * gap}"
            text-anchor="middle" dominant-baseline="middle"
            font-family="${sansFont}" font-size="${fontSize}" font-weight="700">${line}</text>
    `).join('')
}

const careerItems = [
    [ 'careerHetic.png', 316, 60, [ '哈工大（深圳）', '计算机科学与技术' ] ],
    [ 'careerImmersiveGarden.png', 340, 60, [ 'B2B AI 产品工程师', '知识与流程系统' ] ],
    [ 'careerOnlineTeacher.png', 332, 92, [ '独立 AI BUILDER', '企业 AGENT', '工作流实验' ] ],
    [ 'careerFreelancer.png', 240, 60, [ '独立构建者', 'AI 工作流' ] ],
    [ 'careerIRLTeacher.png', 268, 92, [ '栖序智能', '创始人', 'AI 转型' ] ],
    [ 'careerUzik.png', 168, 60, [ 'WEN13 LAB', 'MCP 与 AGENT' ] ],
]

for(const [ fileName, width, height, lines ] of careerItems)
    await renderSvg(`static/career/${fileName}`, width, height, careerText(width, height, lines))

console.log('Generated Wen13 intro and career PNG textures.')
