import * as THREE from 'three/webgpu'

const text = `
██╗    ██╗███████╗███╗   ██╗ ██╗██████╗
██║    ██║██╔════╝████╗  ██║███║╚════██╗
██║ █╗ ██║█████╗  ██╔██╗ ██║╚██║ █████╔╝
██║███╗██║██╔══╝  ██║╚██╗██║ ██║ ╚═══██╗
╚███╔███╔╝███████╗██║ ╚████║ ██║██████╔╝
 ╚══╝╚══╝ ╚══════╝╚═╝  ╚═══╝ ╚═╝╚═════╝

╔═ 欢迎 ═══════════════════════════════╗
║ 欢迎来到 Wen13 的交互世界。
║ 让 AI 进入真实流程，而不是停在演示里。
╚══════════════════════════════════════╝

╔═ 内容声明 ═══════════════════════════╗
║ Wen13、栖序智能、客户案例与业务数据均为虚构设定。
║ 头像基于用户照片进行艺术化生成。
║ 社交与项目链接目前为占位链接。
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
