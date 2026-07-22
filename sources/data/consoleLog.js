import * as THREE from 'three/webgpu'

const text = `
██╗  ██╗ █████╗ ███╗   ██╗    ██╗  ██╗ █████╗ ███╗   ██╗
██║  ██║██╔══██╗████╗  ██║    ██║  ██║██╔══██╗████╗  ██║
███████║███████║██╔██╗ ██║    ███████║███████║██╔██╗ ██║
██╔══██║██╔══██║██║╚██╗██║    ██╔══██║██╔══██║██║╚██╗██║
██║  ██║██║  ██║██║ ╚████║    ██║  ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝

╔═ 欢迎 ═══════════════════════════════╗
║ 欢迎进入《两种速度》交互策展世界。
║ 在文字、赛道与镜头之间，观察一位跨媒介创作者的职业版本。
╚══════════════════════════════════════╝

╔═ 内容声明 ═══════════════════════════╗
║ 本站是依据公开资料制作的非官方原创策展概念，与韩寒本人及相关权利方无隶属、合作或背书关系。
║ 人物雕像与全部内容视觉均为低识别度原创演绎；不使用电影剧照、海报、书封或真实赛车涂装。
║ 项目中的“策展观点”与“艺术演绎”不是本人引语；事实来源见站内说明与项目文档。
╚══════════════════════════════════════╝

╔═ 技术 ═══════════════════════════════╗
║ Three.js ${THREE.REVISION} · TSL · WebGPU/WebGL · Rapier · Howler.js
║ 调试模式：在 URL 后添加 #debug；按 [V] 切换自由镜头。
╚══════════════════════════════════════╝

╔═ 原作 ═══════════════════════════════╗
║ 交互体验基于 Bruno Simon 的 folio-2025（MIT）进行改造：
║ https://github.com/brunosimon/folio-2025
╚══════════════════════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
