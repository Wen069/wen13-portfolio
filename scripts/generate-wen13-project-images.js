import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(root, 'static', 'projects', 'images')
const font = 'PingFang SC, Noto Sans SC, Arial, sans-serif'

const projects = [
    { id: 'qixu-os', code: 'QX·01', title: '栖序 AI OS', subtitle: '业务 · 知识 · AGENT', metric: '从机会识别到规模化交付', accent: '#ff6a3d' },
    { id: 'shulan', code: 'QX·02', title: '枢澜交付 COPILOT', subtitle: '售前 · 交付 · 客户成功', metric: '方案草拟 150 → 35 分钟', accent: '#8274ff' },
    { id: 'bom', code: 'QX·03', title: '报价与 BOM AGENT', subtitle: '约束解析 · 成本推演 · 复核', metric: '复杂报价有据可查', accent: '#27c6a2' },
    { id: 'proposal', code: 'QX·04', title: '方案工程 AGENT', subtitle: '需求 · 检索 · 方案组合', metric: '把专家经验变成工作流', accent: '#f2b544' },
    { id: 'success-hub', code: 'QX·05', title: '客户成功知识中枢', subtitle: '知识 · 权限 · 版本治理', metric: '检索 12 → 4 分钟', accent: '#44a5ff' },
    { id: 'feishu-mcp', code: 'QX·06', title: '飞书 MCP BRIDGE', subtitle: '工具调用 · 审批 · 回写', metric: '让 AGENT 进入真实协作流', accent: '#f36faf' },
    { id: 'opportunity', code: 'QX·07', title: 'AI 机会地图', subtitle: '价值 · 可行性 · 风险', metric: '先找到值得自动化的环节', accent: '#8fbf43' },
    { id: 'human-review', code: 'QX·08', title: '人工复核控制台', subtitle: '置信度 · 引用 · 审计', metric: '高风险决策始终有人在环', accent: '#e45f5f' },
]

const escapeXml = (value) => value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const shell = (project, frame, body) => `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#13152d" />
      <stop offset="0.58" stop-color="#202250" />
      <stop offset="1" stop-color="#111229" />
    </linearGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${project.accent}" stop-opacity="0.48" />
      <stop offset="1" stop-color="${project.accent}" stop-opacity="0" />
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#050615" flood-opacity="0.38" />
    </filter>
  </defs>
  <rect width="960" height="540" rx="28" fill="url(#bg)" />
  <circle cx="790" cy="86" r="250" fill="url(#glow)" opacity="0.6" />
  <path d="M0 452 C200 395 320 512 516 448 C700 388 774 470 960 414 L960 540 L0 540 Z" fill="${project.accent}" opacity="0.1" />
  <g font-family="${font}">
    <text x="52" y="58" font-size="20" font-weight="700" fill="${project.accent}" letter-spacing="2">${project.code}</text>
    <text x="52" y="102" font-size="34" font-weight="700" fill="#fff9ec">${escapeXml(project.title)}</text>
    <text x="52" y="135" font-size="18" font-weight="500" fill="#c9cbed">${escapeXml(project.subtitle)}</text>
    <text x="886" y="58" text-anchor="end" font-size="16" font-weight="700" fill="#c9cbed">0${frame} / 03</text>
  </g>
  ${body}
  <g transform="translate(52 491)">
    <rect width="238" height="30" rx="15" fill="#fff9ec" opacity="0.1" />
    <circle cx="18" cy="15" r="5" fill="${project.accent}" />
    <text x="34" y="21" font-family="${font}" font-size="13" font-weight="700" fill="#fff9ec">WEN13 × 栖序智能 · 模拟项目</text>
  </g>
</svg>`

const architectureFrame = (project) => shell(project, 1, `
  <g transform="translate(70 190)" filter="url(#shadow)" font-family="${font}">
    <path d="M122 95 H286 M398 95 H562 M674 95 H758" stroke="${project.accent}" stroke-width="4" stroke-linecap="round" opacity="0.72" />
    <path d="M250 95 l-12 -8 v16 Z M526 95 l-12 -8 v16 Z M746 95 l-12 -8 v16 Z" fill="${project.accent}" />
    ${[
        ['业务入口', 0, '需求与约束'],
        ['知识层', 276, '引用与权限'],
        ['AGENT 层', 552, '推理与工具'],
        ['人工复核', 758, '审批与回写'],
    ].map(([title, x, detail], index) => `
      <g transform="translate(${x} 30)">
        <rect width="124" height="130" rx="22" fill="#fff9ec" opacity="${index === 2 ? 0.98 : 0.88}" />
        <rect x="14" y="14" width="36" height="36" rx="10" fill="${project.accent}" opacity="0.9" />
        <text x="62" y="42" text-anchor="middle" font-size="15" font-weight="700" fill="#16172e">0${index + 1}</text>
        <text x="62" y="82" text-anchor="middle" font-size="17" font-weight="700" fill="#16172e">${title}</text>
        <text x="62" y="109" text-anchor="middle" font-size="13" fill="#555777">${detail}</text>
      </g>`).join('')}
  </g>`)

const metricsFrame = (project) => shell(project, 2, `
  <g transform="translate(52 178)" font-family="${font}" filter="url(#shadow)">
    <rect width="856" height="252" rx="26" fill="#fff9ec" opacity="0.96" />
    <text x="34" y="45" font-size="15" font-weight="700" fill="#777998" letter-spacing="1">OPERATING SIGNALS</text>
    <text x="34" y="91" font-size="29" font-weight="700" fill="#17182f">${escapeXml(project.metric)}</text>
    <g transform="translate(36 130)">
      <rect width="520" height="18" rx="9" fill="#dedff0" />
      <rect width="392" height="18" rx="9" fill="${project.accent}" />
      <rect y="44" width="520" height="18" rx="9" fill="#dedff0" />
      <rect y="44" width="454" height="18" rx="9" fill="${project.accent}" opacity="0.76" />
      <rect y="88" width="520" height="18" rx="9" fill="#dedff0" />
      <rect y="88" width="336" height="18" rx="9" fill="${project.accent}" opacity="0.55" />
    </g>
    <g transform="translate(618 126)">
      <circle cx="82" cy="58" r="74" fill="none" stroke="#dedff0" stroke-width="16" />
      <path d="M82 -16 A74 74 0 1 1 17 93" fill="none" stroke="${project.accent}" stroke-width="16" stroke-linecap="round" />
      <text x="82" y="59" text-anchor="middle" font-size="34" font-weight="700" fill="#17182f">87%</text>
      <text x="82" y="83" text-anchor="middle" font-size="12" fill="#777998">可追溯覆盖</text>
    </g>
  </g>`)

const reviewFrame = (project) => shell(project, 3, `
  <g transform="translate(64 174)" font-family="${font}" filter="url(#shadow)">
    <rect width="530" height="270" rx="26" fill="#fff9ec" opacity="0.96" />
    <text x="30" y="42" font-size="15" font-weight="700" fill="#777998">AGENT OUTPUT · #W13-204</text>
    <rect x="30" y="66" width="466" height="60" rx="14" fill="#e9e9f4" />
    <rect x="48" y="84" width="284" height="8" rx="4" fill="#7e809d" opacity="0.55" />
    <rect x="48" y="102" width="392" height="8" rx="4" fill="#7e809d" opacity="0.32" />
    <g transform="translate(30 148)">
      <rect width="220" height="84" rx="16" fill="${project.accent}" opacity="0.14" />
      <text x="18" y="31" font-size="13" font-weight="700" fill="#555777">引用证据</text>
      <text x="18" y="58" font-size="23" font-weight="700" fill="#17182f">04 SOURCES</text>
    </g>
    <g transform="translate(276 148)">
      <rect width="220" height="84" rx="16" fill="#17182f" />
      <text x="18" y="31" font-size="13" font-weight="700" fill="#c9cbed">风险等级</text>
      <text x="18" y="58" font-size="23" font-weight="700" fill="#fff9ec">需要复核</text>
    </g>
  </g>
  <g transform="translate(626 208)" font-family="${font}">
    <circle cx="118" cy="82" r="82" fill="${project.accent}" opacity="0.17" />
    <circle cx="118" cy="82" r="54" fill="#fff9ec" opacity="0.96" />
    <path d="M92 83 l18 18 l37 -42" fill="none" stroke="${project.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
    <text x="118" y="190" text-anchor="middle" font-size="18" font-weight="700" fill="#fff9ec">HUMAN IN THE LOOP</text>
    <text x="118" y="217" text-anchor="middle" font-size="14" fill="#c9cbed">可解释 · 可撤回 · 可审计</text>
  </g>`)

for(const project of projects)
{
    const frames = [architectureFrame(project), metricsFrame(project), reviewFrame(project)]
    for(let index = 0; index < frames.length; index++)
    {
        const fileName = `wen13-${project.id}-${index + 1}.png`
        await sharp(Buffer.from(frames[index]))
            .png()
            .toFile(path.join(outputDirectory, fileName))
    }
}

console.log(`Generated ${projects.length * 3} Wen13 project images.`)
