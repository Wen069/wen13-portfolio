import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const sourceRoot = path.join(root, 'resources', 'han-han-visual-source')
const toktx = path.join(root, 'tools', 'ktx', 'bin', 'toktx')

const C = Object.freeze({
    ink: '#151617',
    asphalt: '#292B2E',
    graphite: '#484B4E',
    aluminum: '#B9BCB9',
    paper: '#F2EBDD',
    paperDeep: '#DDD4C4',
    signal: '#D94A3A',
    amber: '#D99B3F',
    muted: '#7F796F',
    white: '#FAF7EF',
})

const font = 'Noto Sans SC, Source Han Sans SC, PingFang SC, sans-serif'
const generated = []

const escapeXml = (value) => String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')

const lines = (items, { x, y, size = 20, gap = 30, fill = C.ink, weight = 500, anchor = 'start' }) => `
    <text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">
        ${items.map((item, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : gap}">${escapeXml(item)}</tspan>`).join('')}
    </text>`

const defs = () => `
    <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="${C.aluminum}" stroke-width="1" opacity="0.22"/>
        </pattern>
        <pattern id="micro" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.7" fill="${C.paper}" opacity="0.14"/>
        </pattern>
        <linearGradient id="paperFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${C.white}"/>
            <stop offset="1" stop-color="${C.paperDeep}"/>
        </linearGradient>
        <linearGradient id="roadFade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#3D4043"/>
            <stop offset="1" stop-color="#191A1B"/>
        </linearGradient>
        <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#000000" flood-opacity="0.22"/>
        </filter>
    </defs>`

const projectMeta = {
    writing: { code: '01', title: '少年写作', subtitle: '公开声音如何诞生' },
    racing: { code: '02', title: '职业赛车', subtitle: '用规则证明另一种专业' },
    directing: { code: '03', title: '第一次执导', subtitle: '把文字重新组织成镜头' },
    convergence: { code: '04', title: '赛车电影方法', subtitle: '两条职业线在新媒介汇合' },
}

const projectShell = (meta, type, body, dark = false) => {
    const background = dark ? C.asphalt : C.paper
    const foreground = dark ? C.white : C.ink
    const muted = dark ? C.aluminum : C.muted
    const labels = {
        evidence: ['P-EVIDENCE', '公开事实索引 · 非原始档案'],
        explain: ['P-EXPLAIN', '原创策展解释 · 非本人原话'],
        mood: ['P-MOOD', '艺术演绎 · 非真实现场'],
    }
    const [label, note] = labels[type]
    return `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    ${defs()}
    <rect width="960" height="540" fill="${background}"/>
    <rect width="960" height="540" fill="url(#${dark ? 'micro' : 'grid'})" opacity="${dark ? 0.38 : 0.62}"/>
    <rect x="0" y="0" width="12" height="540" fill="${C.signal}"/>
    <g font-family="${font}">
        <text x="48" y="50" font-size="17" font-weight="700" letter-spacing="2" fill="${C.signal}">TWO SPEEDS · ${meta.code}</text>
        <text x="48" y="93" font-size="34" font-weight="700" fill="${foreground}">${meta.title}</text>
        <text x="48" y="123" font-size="16" font-weight="500" fill="${muted}">${meta.subtitle}</text>
        <text x="912" y="50" text-anchor="end" font-size="14" font-weight="700" letter-spacing="1" fill="${foreground}">${label}</text>
        <line x1="48" y1="144" x2="912" y2="144" stroke="${dark ? C.graphite : C.aluminum}" stroke-width="1"/>
    </g>
    ${body}
    <g transform="translate(48 489)" font-family="${font}">
        <rect width="360" height="30" rx="15" fill="${dark ? C.paper : C.ink}" opacity="${dark ? 0.12 : 0.07}"/>
        <circle cx="17" cy="15" r="4" fill="${type === 'mood' ? C.amber : C.signal}"/>
        <text x="31" y="20" font-size="12" font-weight="700" fill="${foreground}">${note}</text>
        <text x="864" y="20" text-anchor="end" font-size="11" font-weight="500" fill="${muted}">非官方原创策展概念</text>
    </g>
</svg>`
}

const projectSvgs = [
    {
        name: 'hanhan-writing-evidence',
        svg: projectShell(projectMeta.writing, 'evidence', `
            <g transform="translate(48 174)" font-family="${font}">
                <text x="0" y="20" font-size="13" font-weight="700" letter-spacing="2" fill="${C.muted}">PUBLIC RECORD / 1999—2003</text>
                <path d="M20 92H812" fill="none" stroke="${C.ink}" stroke-width="2"/>
                ${[
                    ['1999', '写作竞赛获得关注', 'F1/F2'],
                    ['2000', '首部长篇出版', 'F1/F2'],
                    ['2003', '职业赛车生涯起步', 'F1/F2'],
                ].map(([year, title, source], index) => {
                    const x = 20 + index * 315
                    return `<g transform="translate(${x} 54)">
                        <circle cx="0" cy="38" r="9" fill="${index === 1 ? C.signal : C.paper}" stroke="${C.signal}" stroke-width="3"/>
                        <text x="0" y="103" font-size="42" font-weight="700" fill="${C.ink}">${year}</text>
                        <text x="0" y="137" font-size="17" font-weight="700" fill="${C.ink}">${title}</text>
                        <rect x="0" y="157" width="62" height="24" rx="12" fill="${C.ink}"/>
                        <text x="31" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="${C.paper}">${source}</text>
                    </g>`
                }).join('')}
                <g transform="translate(0 288)">
                    <rect width="864" height="46" rx="6" fill="${C.ink}"/>
                    <text x="18" y="29" font-size="13" font-weight="500" fill="${C.paper}">证据边界：仅陈列公开年份与身份变化；不复制书封、书页、手稿或长段原文。</text>
                    <text x="846" y="29" text-anchor="end" font-size="12" font-weight="700" fill="${C.amber}">SOURCE IDS · FACT-002 / 003</text>
                </g>
            </g>`),
    },
    {
        name: 'hanhan-writing-explain',
        svg: projectShell(projectMeta.writing, 'explain', `
            <g transform="translate(54 188)" font-family="${font}">
                ${[
                    ['观察', '现实材料'],
                    ['句子', '第一次选择'],
                    ['段落', '组织节奏'],
                    ['回应', '进入公共空间'],
                    ['重写', '把锋芒变准确'],
                ].map(([title, detail], index) => {
                    const x = index * 172
                    return `<g transform="translate(${x} 0)">
                        <rect width="142" height="174" rx="7" fill="${index === 4 ? C.ink : C.white}" stroke="${index === 4 ? C.ink : C.aluminum}" stroke-width="1.5" filter="url(#softShadow)"/>
                        <text x="18" y="35" font-size="12" font-weight="700" fill="${index === 4 ? C.amber : C.signal}">0${index + 1}</text>
                        <text x="18" y="81" font-size="25" font-weight="700" fill="${index === 4 ? C.white : C.ink}">${title}</text>
                        <line x1="18" y1="101" x2="124" y2="101" stroke="${index === 4 ? C.graphite : C.paperDeep}"/>
                        <text x="18" y="130" font-size="13" font-weight="500" fill="${index === 4 ? C.aluminum : C.muted}">${detail}</text>
                        ${index < 4 ? `<path d="M145 87H166M158 80L166 87L158 94" fill="none" stroke="${C.signal}" stroke-width="2"/>` : ''}
                    </g>`
                }).join('')}
                <path d="M756 202C610 256 248 256 74 205" fill="none" stroke="${C.signal}" stroke-width="2" stroke-dasharray="8 8"/>
                <path d="M74 205L89 197L87 213Z" fill="${C.signal}"/>
                <text x="420" y="250" text-anchor="middle" font-size="13" font-weight="700" fill="${C.signal}">公开回应返回编辑台 · 循环而非直线</text>
            </g>`),
    },
    {
        name: 'hanhan-writing-mood',
        svg: projectShell(projectMeta.writing, 'mood', `
            <g transform="translate(0 150)">
                <path d="M139 340L408 48L528 48L821 340Z" fill="${C.paper}" filter="url(#softShadow)"/>
                <path d="M408 48L470 112L528 48" fill="${C.paperDeep}"/>
                <path d="M470 112C441 162 422 224 409 340" fill="none" stroke="${C.signal}" stroke-width="7" stroke-linecap="round"/>
                <path d="M470 112C525 172 561 241 579 340" fill="none" stroke="${C.aluminum}" stroke-width="2" stroke-dasharray="12 13"/>
                <g fill="${C.ink}" opacity="0.58">
                    <rect x="230" y="300" width="116" height="4"/><rect x="245" y="318" width="86" height="4"/>
                    <rect x="601" y="300" width="116" height="4"/><rect x="617" y="318" width="86" height="4"/>
                    <rect x="423" y="80" width="36" height="3"/><rect x="482" y="80" width="32" height="3"/>
                </g>
                <g font-family="${font}">
                    <text x="82" y="72" font-size="12" font-weight="700" letter-spacing="2" fill="${C.aluminum}">PAGE / ROAD / HORIZON</text>
                    <text x="82" y="108" font-size="20" font-weight="700" fill="${C.white}">纸页没有变成真实公路。</text>
                    <text x="82" y="136" font-size="15" fill="${C.aluminum}">这是“表达不断向前”的空间隐喻。</text>
                </g>
            </g>`, true),
    },
    {
        name: 'hanhan-racing-evidence',
        svg: projectShell(projectMeta.racing, 'evidence', `
            <g transform="translate(48 170)" font-family="${font}">
                <g transform="translate(0 0)">
                    <text x="0" y="30" font-size="44" font-weight="700" fill="${C.ink}">2003</text>
                    <text x="0" y="62" font-size="17" font-weight="700" fill="${C.signal}">职业赛车生涯起步</text>
                    <text x="0" y="90" font-size="13" fill="${C.muted}">公开身份变化 · FACT-003</text>
                </g>
                <path d="M262 74C342 4 425 4 505 74S668 144 816 74" fill="none" stroke="${C.aluminum}" stroke-width="18" stroke-linecap="round"/>
                <path d="M262 74C342 4 425 4 505 74S668 144 816 74" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="10 10"/>
                <g transform="translate(0 152)">
                    <rect width="864" height="160" rx="8" fill="${C.ink}"/>
                    <text x="28" y="42" font-size="42" font-weight="700" fill="${C.white}">2012</text>
                    <text x="28" y="73" font-size="15" font-weight="700" fill="${C.amber}">同一年 · 两种赛制 · 两项全国年度冠军</text>
                    <g transform="translate(336 24)">
                        <rect width="224" height="112" rx="6" fill="${C.paper}"/>
                        <text x="18" y="31" font-size="12" font-weight="700" fill="${C.signal}">RALLY / 拉力</text>
                        <path d="M19 78C64 42 112 109 200 54" fill="none" stroke="${C.ink}" stroke-width="4"/>
                        <circle cx="19" cy="78" r="5" fill="${C.signal}"/><circle cx="200" cy="54" r="5" fill="${C.amber}"/>
                    </g>
                    <g transform="translate(582 24)">
                        <rect width="254" height="112" rx="6" fill="${C.paper}"/>
                        <text x="18" y="31" font-size="12" font-weight="700" fill="${C.signal}">CIRCUIT / 场地</text>
                        <ellipse cx="127" cy="72" rx="92" ry="23" fill="none" stroke="${C.ink}" stroke-width="4"/>
                        <path d="M127 49V95" stroke="${C.signal}" stroke-width="4"/>
                    </g>
                </g>
            </g>`),
    },
    {
        name: 'hanhan-racing-explain',
        svg: projectShell(projectMeta.racing, 'explain', `
            <g transform="translate(48 171)" font-family="${font}">
                <g>
                    <rect width="418" height="268" rx="8" fill="${C.white}" stroke="${C.aluminum}"/>
                    <text x="24" y="38" font-size="13" font-weight="700" fill="${C.signal}">RALLY / 拉力</text>
                    <text x="24" y="75" font-size="25" font-weight="700" fill="${C.ink}">未知路面中的协作判断</text>
                    <path d="M34 133C100 81 138 179 212 121S330 100 382 158" fill="none" stroke="${C.ink}" stroke-width="5"/>
                    <g font-size="12" font-weight="700" fill="${C.muted}">
                        <text x="24" y="219">路书</text><text x="130" y="219">领航</text><text x="236" y="219">分段计时</text><text x="342" y="219">变化路面</text>
                    </g>
                    <path d="M24 235H394" stroke="${C.paperDeep}"/>
                    <text x="24" y="256" font-size="12" fill="${C.muted}">判断来自信息、信任与即时修正</text>
                </g>
                <g transform="translate(446 0)">
                    <rect width="418" height="268" rx="8" fill="${C.ink}"/>
                    <text x="24" y="38" font-size="13" font-weight="700" fill="${C.amber}">CIRCUIT / 场地</text>
                    <text x="24" y="75" font-size="25" font-weight="700" fill="${C.white}">重复赛道中的极限校准</text>
                    <path d="M82 131C82 93 124 89 206 89S335 102 335 139S290 175 208 175S82 169 82 131Z" fill="none" stroke="${C.paper}" stroke-width="5"/>
                    <path d="M82 131C146 130 224 119 335 139" fill="none" stroke="${C.signal}" stroke-width="4"/>
                    <g font-size="12" font-weight="700" fill="${C.aluminum}">
                        <text x="24" y="219">走线</text><text x="130" y="219">刹车点</text><text x="236" y="219">圈速</text><text x="342" y="219">对抗</text>
                    </g>
                    <path d="M24 235H394" stroke="${C.graphite}"/>
                    <text x="24" y="256" font-size="12" fill="${C.aluminum}">判断来自复盘、精度与连续一致性</text>
                </g>
            </g>`),
    },
    {
        name: 'hanhan-racing-mood',
        svg: projectShell(projectMeta.racing, 'mood', `
            <g transform="translate(0 146)">
                <path d="M-52 358C169 175 245 245 398 158S672 38 1018 222" fill="none" stroke="#111213" stroke-width="166"/>
                <path d="M-52 358C169 175 245 245 398 158S672 38 1018 222" fill="none" stroke="${C.graphite}" stroke-width="2" stroke-dasharray="18 20"/>
                <path d="M-52 343C167 166 248 236 400 150S674 29 1018 213" fill="none" stroke="${C.signal}" stroke-width="7" stroke-linecap="round"/>
                ${[0,1,2,3,4,5,6,7].map(index => `<circle cx="${104 + index * 112}" cy="${304 - Math.sin(index * 0.78) * 118}" r="4" fill="${C.amber}" opacity="${0.35 + index * 0.06}"/>`).join('')}
                <g font-family="${font}">
                    <text x="62" y="70" font-size="13" font-weight="700" letter-spacing="2" fill="${C.aluminum}">AFTER RAIN / IDEAL LINE</text>
                    <text x="62" y="108" font-size="21" font-weight="700" fill="${C.white}">红线不是一条真实赛道。</text>
                    <text x="62" y="136" font-size="15" fill="${C.aluminum}">它代表一次可以被检验、修正、再尝试的判断。</text>
                </g>
            </g>`, true),
    },
    {
        name: 'hanhan-directing-evidence',
        svg: projectShell(projectMeta.directing, 'evidence', `
            <g transform="translate(48 174)" font-family="${font}">
                <rect width="864" height="248" rx="8" fill="${C.white}" stroke="${C.aluminum}" filter="url(#softShadow)"/>
                <g transform="translate(28 28)">
                    <text x="0" y="44" font-size="50" font-weight="700" fill="${C.ink}">2014</text>
                    <text x="0" y="78" font-size="16" font-weight="700" fill="${C.signal}">导演身份进入公开职业线</text>
                    <text x="0" y="110" font-size="13" fill="${C.muted}">公开采访与权威资料 · FACT-005</text>
                    <line x1="0" y1="139" x2="258" y2="139" stroke="${C.paperDeep}"/>
                    <text x="0" y="169" font-size="13" fill="${C.muted}">事实不等于：一人完成全部电影生产</text>
                </g>
                <g transform="translate(352 25)">
                    ${[
                        ['文本', 'TEXT'], ['分镜', 'FRAME'], ['调度', 'BLOCK'], ['剪辑', 'CUT'],
                    ].map(([zh,en], index) => `<g transform="translate(${(index % 2) * 238} ${(index > 1 ? 1 : 0) * 103})">
                        <rect width="212" height="78" rx="5" fill="${index === 3 ? C.ink : C.paper}"/>
                        <text x="18" y="29" font-size="12" font-weight="700" fill="${index === 3 ? C.amber : C.signal}">${en}</text>
                        <text x="18" y="58" font-size="21" font-weight="700" fill="${index === 3 ? C.white : C.ink}">${zh}</text>
                    </g>`).join('')}
                </g>
                <g transform="translate(0 278)">
                    <rect width="864" height="54" rx="5" fill="${C.ink}"/>
                    <text x="18" y="33" font-size="13" font-weight="500" fill="${C.paper}">证据边界：不使用电影剧照、海报、对白、角色肖像、片方 Logo 或未经授权幕后照。</text>
                </g>
            </g>`),
    },
    {
        name: 'hanhan-directing-explain',
        svg: projectShell(projectMeta.directing, 'explain', `
            <g transform="translate(48 174)" font-family="${font}">
                <text x="0" y="22" font-size="13" font-weight="700" fill="${C.muted}">一条原创占位句如何进入生产流程</text>
                ${[
                    ['01', '句子', '“雨停后，路面仍在发亮。”'],
                    ['02', '镜头表', '远景 / 低机位 / 静止'],
                    ['03', '场面调度', '车外 / 留白 / 反光'],
                    ['04', '剪辑节奏', '3 秒停顿 → 动作开始'],
                ].map(([n,title,detail], index) => `<g transform="translate(${index * 218} 53)">
                    <rect width="194" height="204" rx="6" fill="${index === 3 ? C.ink : C.white}" stroke="${index === 3 ? C.ink : C.aluminum}"/>
                    <text x="18" y="32" font-size="12" font-weight="700" fill="${index === 3 ? C.amber : C.signal}">${n}</text>
                    <text x="18" y="71" font-size="23" font-weight="700" fill="${index === 3 ? C.white : C.ink}">${title}</text>
                    <line x1="18" y1="91" x2="176" y2="91" stroke="${index === 3 ? C.graphite : C.paperDeep}"/>
                    ${lines(detail.split(' / '), {x:18,y:121,size:13,gap:24,fill:index === 3 ? C.aluminum : C.muted,weight:500})}
                    ${index < 3 ? `<path d="M196 102H213M206 96L213 102L206 108" stroke="${C.signal}" stroke-width="2" fill="none"/>` : ''}
                </g>`).join('')}
                <text x="0" y="300" font-size="12" fill="${C.muted}">示例文字由策展团队原创，仅用于解释媒介转换，不是本人原句或真实分镜。</text>
            </g>`),
    },
    {
        name: 'hanhan-directing-mood',
        svg: projectShell(projectMeta.directing, 'mood', `
            <g transform="translate(0 146)">
                <path d="M-40 355C245 252 482 276 1020 122" fill="none" stroke="#101112" stroke-width="108"/>
                <path d="M-40 355C245 252 482 276 1020 122" fill="none" stroke="${C.signal}" stroke-width="3"/>
                ${[
                    [170,244,-7],[394,207,-4],[616,154,1],[812,101,5],
                ].map(([x,y,r], index) => `<g transform="translate(${x} ${y}) rotate(${r})" filter="url(#softShadow)">
                    <rect x="-88" y="-52" width="176" height="104" rx="4" fill="${C.paper}"/>
                    <rect x="-72" y="-35" width="104" height="54" fill="${index % 2 ? C.graphite : C.aluminum}"/>
                    <path d="M-62 ${index % 2 ? 4 : -2}H20" stroke="${C.paper}" stroke-width="3" opacity="0.65"/>
                    <text x="-70" y="40" font-family="${font}" font-size="10" font-weight="700" fill="${C.ink}">FRAME 0${index + 1}</text>
                    <rect x="44" y="-35" width="7" height="70" fill="${C.signal}"/>
                </g>`).join('')}
                <g font-family="${font}">
                    <text x="56" y="61" font-size="13" font-weight="700" letter-spacing="2" fill="${C.aluminum}">WORDS BECOME SPATIAL</text>
                    <text x="56" y="99" font-size="21" font-weight="700" fill="${C.white}">分镜悬在一条不存在的公路上。</text>
                    <text x="56" y="127" font-size="15" fill="${C.aluminum}">这是从段落到镜头的抽象过渡，不是影片场景。</text>
                </g>
            </g>`, true),
    },
    {
        name: 'hanhan-convergence-evidence',
        svg: projectShell(projectMeta.convergence, 'evidence', `
            <g transform="translate(48 174)" font-family="${font}">
                <text x="0" y="20" font-size="13" font-weight="700" letter-spacing="2" fill="${C.muted}">CONTINUITY / ROLE INDEX</text>
                ${[
                    ['2019', '赛车经验进入电影叙事', '导演 / 编剧'],
                    ['2024', '继续组织速度与重来', '导演 / 编剧'],
                    ['2026', '公开制作方法与后续创作', '导演 / 编剧'],
                ].map(([year,title,role], index) => `<g transform="translate(${index * 288} 50)">
                    <rect width="264" height="222" rx="6" fill="${index === 2 ? C.ink : C.white}" stroke="${index === 2 ? C.ink : C.aluminum}"/>
                    <text x="18" y="52" font-size="42" font-weight="700" fill="${index === 2 ? C.white : C.ink}">${year}</text>
                    <rect x="18" y="72" width="62" height="5" fill="${index === 2 ? C.amber : C.signal}"/>
                    ${lines(title.split('与'), {x:18,y:112,size:16,gap:27,fill:index === 2 ? C.aluminum : C.ink,weight:700})}
                    <text x="18" y="190" font-size="12" font-weight="700" fill="${index === 2 ? C.amber : C.signal}">${role}</text>
                    <text x="246" y="190" text-anchor="end" font-size="11" fill="${index === 2 ? C.aluminum : C.muted}">F2</text>
                </g>`).join('')}
                <text x="0" y="313" font-size="12" fill="${C.muted}">仅记录公开年份与职务连续性；不借用片名美术、海报构图、影片角色或真实赛车。</text>
            </g>`),
    },
    {
        name: 'hanhan-convergence-explain',
        svg: projectShell(projectMeta.convergence, 'explain', `
            <g transform="translate(48 170)" font-family="${font}">
                <g transform="translate(0 0)">
                    <text x="0" y="22" font-size="13" font-weight="700" fill="${C.muted}">FOUR-LAYER EDITORIAL MODEL</text>
                    ${[
                        ['01', '赛道几何', C.paperDeep, C.ink],
                        ['02', '角色选择', C.aluminum, C.ink],
                        ['03', '摄影机路径', C.graphite, C.white],
                        ['04', '剪辑节奏', C.ink, C.white],
                    ].map(([n,title,bg,fg], index) => `<g transform="translate(0 ${49 + index * 64})">
                        <rect width="462" height="50" rx="4" fill="${bg}"/>
                        <text x="16" y="31" font-size="11" font-weight="700" fill="${index > 1 ? C.amber : C.signal}">${n}</text>
                        <text x="58" y="32" font-size="16" font-weight="700" fill="${fg}">${title}</text>
                        <path d="M260 25H430" stroke="${fg}" opacity="0.25" stroke-dasharray="5 6"/>
                    </g>`).join('')}
                </g>
                <g transform="translate(532 38)">
                    <path d="M36 204C41 85 91 39 169 45S306 104 281 188S157 264 82 213" fill="none" stroke="${C.aluminum}" stroke-width="42"/>
                    <path d="M36 204C41 85 91 39 169 45S306 104 281 188S157 264 82 213" fill="none" stroke="${C.ink}" stroke-width="2" stroke-dasharray="8 8"/>
                    <path d="M53 194C59 99 99 68 166 68S277 115 258 174S169 226 101 198" fill="none" stroke="${C.signal}" stroke-width="4"/>
                    <g fill="${C.ink}">
                        <circle cx="53" cy="194" r="8"/><circle cx="166" cy="68" r="8"/><circle cx="258" cy="174" r="8"/><circle cx="101" cy="198" r="8"/>
                    </g>
                    <text x="160" y="144" text-anchor="middle" font-size="14" font-weight="700" fill="${C.ink}">同一条线</text>
                    <text x="160" y="166" text-anchor="middle" font-size="12" fill="${C.muted}">在四层里改变意义</text>
                </g>
            </g>`),
    },
    {
        name: 'hanhan-convergence-mood',
        svg: projectShell(projectMeta.convergence, 'mood', `
            <g transform="translate(0 147)">
                <path d="M-30 316C195 332 259 166 455 176S719 327 990 160" fill="none" stroke="#101112" stroke-width="108"/>
                <path d="M-30 316C195 332 259 166 455 176S719 327 990 160" fill="none" stroke="${C.signal}" stroke-width="5"/>
                ${Array.from({ length: 19 }, (_, index) => `<rect x="${16 + index * 53}" y="${index % 2 ? 292 : 276}" width="24" height="8" rx="2" fill="${C.paper}" opacity="${0.28 + (index % 4) * 0.12}"/>`).join('')}
                <g transform="translate(674 37)">
                    <circle cx="95" cy="96" r="88" fill="none" stroke="${C.paper}" stroke-width="2" opacity="0.22"/>
                    <circle cx="95" cy="96" r="54" fill="none" stroke="${C.aluminum}" stroke-width="2" opacity="0.38"/>
                    <path d="M95 8V184M7 96H183" stroke="${C.paper}" opacity="0.18"/>
                    <path d="M95 96L157 61" stroke="${C.amber}" stroke-width="4"/>
                </g>
                <g font-family="${font}">
                    <text x="60" y="63" font-size="13" font-weight="700" letter-spacing="2" fill="${C.aluminum}">TRACK → TIMELINE</text>
                    <text x="60" y="101" font-size="21" font-weight="700" fill="${C.white}">道路逐渐显出剪辑刻度。</text>
                    <text x="60" y="129" font-size="15" fill="${C.aluminum}">这是两种职业语言汇合的艺术演绎。</text>
                </g>
            </g>`, true),
    },
]

const labItems = [
    { id: 'text-to-lens', n: '01', title: '句子怎样成为镜头', tag: '策展解释', summary: '文本 · 分镜 · 调度 · 剪辑', glyph: 'pipeline' },
    { id: 'visible-speed', n: '02', title: '速度怎样被看见', tag: '公开材料', summary: '参照物 · 路径 · 机位 · 节奏', glyph: 'speed' },
    { id: 'two-disciplines', n: '03', title: '两种赛制，两种判断', tag: '公开材料', summary: '拉力协作 / 场地校准', glyph: 'split' },
    { id: 'route-narrative', n: '04', title: '路线就是叙事', tag: '策展解释', summary: '选择 · 悬念 · 超越 · 结果', glyph: 'route' },
    { id: 'failure-comedy', n: '05', title: '失败怎样进入喜剧', tag: '艺术演绎', summary: '等待 · 偏差 · 反转 · 重来', glyph: 'beats' },
    { id: 'next-start', n: '06', title: '下一次起跑', tag: '事实到此', summary: '未闭合的圈 · 不预测内容', glyph: 'open' },
]

const labGlyph = (kind, mini = false) => {
    const scale = mini ? 0.37 : 1
    const transform = mini ? 'translate(146 49) scale(.37)' : 'translate(520 176)'
    const shapes = {
        pipeline: `<g>${[0,1,2,3].map(i => `<rect x="${i * 82}" y="${i % 2 ? 60 : 24}" width="58" height="58" rx="7" fill="${i === 3 ? C.signal : C.paper}" stroke="${C.aluminum}"/><path d="M${i * 82 + 59} ${i % 2 ? 89 : 53}H${i * 82 + 80}" stroke="${C.amber}" stroke-width="3"/>`).join('')}</g>`,
        speed: `<g><path d="M6 148C97 30 182 205 330 58" fill="none" stroke="${C.paper}" stroke-width="44"/><path d="M6 148C97 30 182 205 330 58" fill="none" stroke="${C.signal}" stroke-width="5"/>${[0,1,2,3,4].map(i => `<path d="M${36+i*62} ${28+i*11}V${176-i*8}" stroke="${C.aluminum}" opacity="${.2+i*.13}"/>`).join('')}</g>`,
        split: `<g><path d="M22 171C76 65 149 174 190 82" fill="none" stroke="${C.paper}" stroke-width="26"/><ellipse cx="277" cy="105" rx="72" ry="46" fill="none" stroke="${C.paper}" stroke-width="26"/><path d="M22 171C76 65 149 174 190 82M205 105H349" fill="none" stroke="${C.signal}" stroke-width="4"/></g>`,
        route: `<g><path d="M16 169C94 28 177 36 214 108S303 171 344 48" fill="none" stroke="${C.paper}" stroke-width="28"/><path d="M16 169C94 28 177 36 214 108S303 171 344 48" fill="none" stroke="${C.signal}" stroke-width="4"/>${[[16,169],[114,58],[214,108],[344,48]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="9" fill="${i===3?C.amber:C.ink}" stroke="${C.paper}" stroke-width="3"/>`).join('')}</g>`,
        beats: `<g><path d="M8 96H352" stroke="${C.graphite}"/>${[34,90,158,239,321].map((x,i)=>`<line x1="${x}" y1="${i%2?55:32}" x2="${x}" y2="${i%2?145:166}" stroke="${C.paper}" stroke-width="3"/><circle cx="${x}" cy="${i%2?55:32}" r="7" fill="${i===3?C.signal:C.amber}"/>`).join('')}<path d="M8 155C72 38 147 170 211 62S314 126 352 33" fill="none" stroke="${C.signal}" stroke-width="4"/></g>`,
        open: `<g><path d="M72 171C15 76 83 18 179 37S352 129 284 187S111 201 89 130" fill="none" stroke="${C.paper}" stroke-width="28"/><path d="M72 171C15 76 83 18 179 37S352 129 284 187" fill="none" stroke="${C.signal}" stroke-width="5"/><path d="M284 187L304 163M284 187L315 191" stroke="${C.amber}" stroke-width="5"/></g>`,
    }
    return `<g transform="${transform}">${shapes[kind]}</g>`
}

const labMainSvg = (item) => `
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540">
    ${defs()}
    <rect width="960" height="540" fill="${C.ink}"/>
    <rect width="960" height="540" fill="url(#micro)" opacity="0.45"/>
    <rect x="0" y="0" width="12" height="540" fill="${C.amber}"/>
    <g font-family="${font}">
        <text x="50" y="52" font-size="14" font-weight="700" fill="${C.amber}" letter-spacing="2">SPEED EDITING LAB · ${item.n}</text>
        <text x="50" y="112" font-size="34" font-weight="700" fill="${C.white}">${item.title}</text>
        <text x="50" y="147" font-size="16" fill="${C.aluminum}">${item.summary}</text>
        <rect x="50" y="186" width="355" height="182" rx="7" fill="${C.paper}"/>
        <text x="72" y="223" font-size="12" font-weight="700" fill="${C.signal}">QUESTION / 策展问题</text>
        ${lines([
            item.n === '01' ? '同一个意思进入不同媒介，' : item.n === '02' ? '没有速度模糊时，观众仍能' : item.n === '03' ? '两种比赛为什么需要不同的' : item.n === '04' ? '一条路线怎样承担角色选择、' : item.n === '05' ? '失败、等待与重来怎样形成' : '当公开事实停在今天，怎样',
            item.n === '01' ? '哪些信息会被改写？' : item.n === '02' ? '感觉到快吗？' : item.n === '03' ? '信息与判断方式？' : item.n === '04' ? '悬念与结果？' : item.n === '05' ? '节奏，而非励志口号？' : '保留开放，而不是预测？',
        ], {x:72,y:270,size:20,gap:34,fill:C.ink,weight:700})}
        <rect x="50" y="396" width="112" height="28" rx="14" fill="${item.tag === '艺术演绎' ? C.signal : C.amber}"/>
        <text x="106" y="415" text-anchor="middle" font-size="12" font-weight="700" fill="${C.ink}">${item.tag}</text>
        <text x="50" y="469" font-size="12" fill="${C.aluminum}">非本人私人想法 · 不冒充真实实验</text>
        <text x="910" y="508" text-anchor="end" font-size="11" fill="${C.aluminum}">非官方原创策展概念</text>
    </g>
    ${labGlyph(item.glyph)}
</svg>`

const labMiniSvg = (item) => `
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="136" viewBox="0 0 240 136">
    <rect width="240" height="136" fill="${C.ink}"/>
    <rect width="7" height="136" fill="${C.amber}"/>
    <g font-family="${font}">
        <text x="18" y="25" font-size="10" font-weight="700" letter-spacing="1" fill="${C.amber}">LAB · ${item.n}</text>
        <text x="18" y="54" font-size="15" font-weight="700" fill="${C.white}">${item.title}</text>
        <text x="18" y="78" font-size="9" fill="${C.aluminum}">${item.summary}</text>
        <rect x="18" y="101" width="58" height="18" rx="9" fill="${item.tag === '艺术演绎' ? C.signal : C.paper}"/>
        <text x="47" y="113.5" text-anchor="middle" font-size="8" font-weight="700" fill="${C.ink}">${item.tag}</text>
    </g>
</svg>`

const careerItems = [
    { id: 'writing', width: 320, lines: ['1999 · 写作被看见', '公共表达的起点'] },
    { id: 'racing-start', width: 332, lines: ['2003 · 进入职业赛车', '接受另一套规则'] },
    { id: 'double-title', width: 348, lines: ['2012 · 两种赛制', '同一年，两项年度冠军'] },
    { id: 'director', width: 320, lines: ['2014 · 文字成为镜头', '导演身份进入职业线'] },
    { id: 'merge', width: 332, lines: ['2019 · 两条线汇合', '赛车经验进入叙事'] },
    { id: 'open-loop', width: 312, lines: ['2026 · 下一圈', '创作仍未结束'] },
]

const careerSvg = (item) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${item.width}" height="96" viewBox="0 0 ${item.width} 96">
    <rect width="${item.width}" height="96" fill="#000000" fill-opacity="0"/>
    <g font-family="${font}" text-anchor="middle">
        <text x="${item.width / 2}" y="35" font-size="21" font-weight="700" fill="#FFFFFF">${item.lines[0]}</text>
        <text x="${item.width / 2}" y="67" font-size="17" font-weight="700" fill="#D7D7D7">${item.lines[1]}</text>
        <rect x="${item.width / 2 - 34}" y="81" width="68" height="4" rx="2" fill="#FFFFFF"/>
    </g>
</svg>`

const timeItems = [
    { id: '1999-writing', year: '1999', label: '纸面', kind: 'paper' },
    { id: '2003-racing', year: '2003', label: '赛道', kind: 'helmet' },
    { id: '2014-directing', year: '2014', label: '镜头', kind: 'frame' },
    { id: '2026-open', year: '2026', label: '开放', kind: 'loop' },
]

const timeGlyph = (kind) => ({
    paper: `<path d="M42 30H98V86H42Z" fill="${C.paper}"/><path d="M52 43H88M52 53H85M52 63H77" stroke="${C.ink}" stroke-width="3"/><path d="M66 29L90 51" stroke="${C.signal}" stroke-width="4"/>`,
    helmet: `<path d="M35 68C35 39 51 25 72 25S107 42 107 70V84H78L67 67H35Z" fill="${C.paper}"/><path d="M62 45H106" stroke="${C.signal}" stroke-width="5"/><path d="M37 88C64 69 82 100 108 80" fill="none" stroke="${C.amber}" stroke-width="4"/>`,
    frame: `<rect x="30" y="27" width="80" height="58" rx="4" fill="${C.paper}"/><rect x="40" y="37" width="41" height="30" fill="${C.graphite}"/><path d="M89 37V67M40 75H100" stroke="${C.signal}" stroke-width="4"/><path d="M28 91H112" stroke="${C.amber}" stroke-width="3" stroke-dasharray="6 5"/>`,
    loop: `<path d="M35 78C28 45 49 25 76 29S116 57 101 82S53 100 42 74" fill="none" stroke="${C.paper}" stroke-width="13"/><path d="M35 78C28 45 49 25 76 29S116 57 101 82" fill="none" stroke="${C.signal}" stroke-width="4"/><path d="M101 82L113 70M101 82L116 88" stroke="${C.amber}" stroke-width="4"/>`,
})[kind]

const timeSvg = (item) => `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="124" viewBox="0 0 140 124">
    <rect width="140" height="124" fill="${C.asphalt}"/>
    <rect x="0" width="6" height="124" fill="${C.signal}"/>
    ${timeGlyph(item.kind)}
    <g font-family="${font}">
        <text x="12" y="113" font-size="12" font-weight="700" fill="${C.paper}">${item.year}</text>
        <text x="128" y="113" text-anchor="end" font-size="10" font-weight="700" fill="${C.amber}">${item.label}</text>
    </g>
</svg>`

const avatarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${defs()}
    <rect width="1024" height="1024" fill="${C.paper}"/>
    <rect width="1024" height="1024" fill="url(#grid)" opacity="0.72"/>
    <circle cx="512" cy="474" r="330" fill="${C.ink}"/>
    <path d="M294 466C303 299 399 207 526 207C664 207 746 311 751 451C756 607 658 721 506 727C361 733 286 618 294 466Z" fill="${C.paperDeep}"/>
    <path d="M301 466C306 317 393 229 512 213V727C371 726 293 616 301 466Z" fill="${C.graphite}"/>
    <path d="M498 248C611 235 696 318 706 426L520 426C498 376 487 314 498 248Z" fill="${C.ink}"/>
    <path d="M320 453C375 431 433 426 520 426" fill="none" stroke="${C.signal}" stroke-width="34" stroke-linecap="round"/>
    <path d="M706 426C671 469 624 492 560 496" fill="none" stroke="${C.amber}" stroke-width="13" stroke-linecap="round"/>
    <path d="M506 727L656 845H351L506 727Z" fill="${C.aluminum}"/>
    <g transform="translate(676 592) rotate(-10)">
        <rect width="178" height="242" rx="8" fill="${C.white}" filter="url(#softShadow)"/>
        <path d="M24 48H146M24 77H130M24 106H151M24 135H112" stroke="${C.graphite}" stroke-width="10" stroke-linecap="round"/>
        <path d="M25 184C70 148 104 217 150 164" fill="none" stroke="${C.signal}" stroke-width="11"/>
    </g>
    <g font-family="${font}">
        <text x="64" y="88" font-size="23" font-weight="700" fill="${C.signal}" letter-spacing="3">TWO SPEEDS / CONCEPT MARK</text>
        <text x="64" y="958" font-size="20" font-weight="700" fill="${C.ink}">抽象侧脸 · 头盔 · 纸页</text>
        <text x="960" y="958" text-anchor="end" font-size="17" font-weight="700" fill="${C.muted}">非本人肖像</text>
    </g>
</svg>`

const ensureDirectory = async (filePath) => mkdir(path.dirname(filePath), { recursive: true })

const encodeKtx = async (pngPath, ktxPath, preset = 'etc1s') => {
    await rm(ktxPath, { force: true })
    const common = ['--nowarn', '--2d', '--t2']
    const args = preset === 'career'
        ? [...common, '--encode', 'uastc', '--assign_oetf', 'srgb', '--target_type', 'RG', ktxPath, pngPath]
        : [...common, '--encode', 'etc1s', '--qlevel', '255', '--assign_oetf', 'srgb', '--target_type', 'RGB', ktxPath, pngPath]
    const result = spawnSync(toktx, args, { encoding: 'utf8' })
    if(result.status !== 0)
        throw new Error(`toktx failed for ${path.basename(pngPath)}\n${result.stderr || result.stdout}`)
}

const writeAsset = async ({ category, name, width, height, svg, output, ktx = false, preset = 'etc1s', webp = false }) => {
    if(ktx && (width % 4 !== 0 || height % 4 !== 0))
        throw new Error(`${name} KTX dimensions must be multiples of four; got ${width}×${height}`)

    const sourcePath = path.join(sourceRoot, category, `${name}.svg`)
    const outputPath = path.join(root, output)
    await ensureDirectory(sourcePath)
    await ensureDirectory(outputPath)
    await writeFile(sourcePath, `${svg.trim()}\n`, 'utf8')
    await sharp(Buffer.from(svg)).png().toFile(outputPath)

    const item = { category, name, width, height, source: path.relative(root, sourcePath), png: path.relative(root, outputPath) }
    if(ktx) {
        const ktxPath = outputPath.replace(/\.png$/, '.ktx')
        await encodeKtx(outputPath, ktxPath, preset)
        item.ktx = path.relative(root, ktxPath)
    }
    if(webp) {
        const webpPath = outputPath.replace(/\.png$/, '.webp')
        await sharp(outputPath).webp({ quality: 88 }).toFile(webpPath)
        item.webp = path.relative(root, webpPath)
    }
    generated.push(item)
}

for(const project of projectSvgs) {
    await writeAsset({
        category: 'projects',
        name: project.name,
        width: 960,
        height: 540,
        svg: project.svg,
        output: `static/projects/images/${project.name}.png`,
        ktx: true,
    })
}

for(const item of labItems) {
    const name = `hanhan-lab-${item.id}`
    await writeAsset({ category: 'lab', name, width: 960, height: 540, svg: labMainSvg(item), output: `static/lab/images/${name}.png`, ktx: true })
    await writeAsset({ category: 'lab', name: `${name}-mini`, width: 240, height: 136, svg: labMiniSvg(item), output: `static/lab/images/${name}-mini.png`, ktx: true })
}

for(const item of careerItems) {
    const name = `hanhan-career-${item.id}`
    await writeAsset({ category: 'career', name, width: item.width, height: 96, svg: careerSvg(item), output: `static/career/${name}.png`, ktx: true, preset: 'career' })
}

for(const item of timeItems) {
    const name = `hanhan-time-${item.id}`
    await writeAsset({ category: 'time-machine', name, width: 140, height: 124, svg: timeSvg(item), output: `static/timeMachine/${name}.png`, ktx: true })
}

await writeAsset({
    category: 'profile',
    name: 'han-han-concept-avatar',
    width: 1024,
    height: 1024,
    svg: avatarSvg,
    output: 'static/profile/han-han-concept-avatar.png',
    webp: true,
})

const contactWidth = 2400
const contactHeight = 3280
const contactComposites = []
const contactText = (text, x, y, size = 28, color = C.white, weight = 700) => ({
    input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${contactWidth}" height="80"><text x="0" y="${size + 8}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeXml(text)}</text></svg>`),
    left: x,
    top: y,
})

contactComposites.push(contactText('韩寒 ·《两种速度》原创视觉资产联系表', 80, 44, 42))
contactComposites.push(contactText('非官方原创策展概念｜无本人肖像、电影静帧、书封、片名字标、赛事与赞助商标', 80, 103, 22, C.aluminum, 500))

const palette = Object.entries(C)
for(let index = 0; index < palette.length; index++) {
    const [key, value] = palette[index]
    const x = 40 + index * 234
    contactComposites.push({ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="92"><rect width="220" height="54" rx="5" fill="${value}"/><text x="0" y="84" font-family="${font}" font-size="15" font-weight="700" fill="${C.white}">${key.toUpperCase()} · ${value}</text></svg>`), left: x, top: 158 })
}

contactComposites.push(contactText('PROJECTS · 4 × 3', 80, 282, 27, C.amber))
for(let index = 0; index < projectSvgs.length; index++) {
    const project = projectSvgs[index]
    const col = index % 3
    const row = Math.floor(index / 3)
    const thumb = await sharp(path.join(root, `static/projects/images/${project.name}.png`)).resize(700, 394).toBuffer()
    contactComposites.push({ input: thumb, left: 80 + col * 760, top: 332 + row * 438 })
}

const labTop = 2130
contactComposites.push(contactText('LAB · 6 GROUPS', 80, labTop, 27, C.amber))
for(let index = 0; index < labItems.length; index++) {
    const item = labItems[index]
    const thumb = await sharp(path.join(root, `static/lab/images/hanhan-lab-${item.id}.png`)).resize(500, 281).toBuffer()
    contactComposites.push({ input: thumb, left: 80 + (index % 4) * 570, top: labTop + 54 + Math.floor(index / 4) * 326 })
}

contactComposites.push(contactText('CAREER / TIME MACHINE / CONCEPT AVATAR', 1220, 2870, 24, C.amber))
const avatarThumb = await sharp(path.join(root, 'static/profile/han-han-concept-avatar.png')).resize(260, 260).toBuffer()
contactComposites.push({ input: avatarThumb, left: 80, top: 2900 })
for(let index = 0; index < careerItems.length; index++) {
    const item = careerItems[index]
    const image = await sharp(path.join(root, `static/career/hanhan-career-${item.id}.png`)).resize({ width: Math.min(300, item.width), height: 88, fit: 'contain' }).toBuffer()
    contactComposites.push({ input: image, left: 390 + (index % 3) * 310, top: 2920 + Math.floor(index / 3) * 118 })
}
for(let index = 0; index < timeItems.length; index++) {
    const item = timeItems[index]
    const image = await sharp(path.join(root, `static/timeMachine/hanhan-time-${item.id}.png`)).resize(168, 149).toBuffer()
    contactComposites.push({ input: image, left: 1240 + index * 275, top: 2940 })
}

const contactPath = path.join(sourceRoot, 'hanhan-visual-contact-sheet.png')
await mkdir(sourceRoot, { recursive: true })
await sharp({ create: { width: contactWidth, height: contactHeight, channels: 3, background: C.asphalt } })
    .composite(contactComposites)
    .png()
    .toFile(contactPath)

const qa = []
for(const item of generated) {
    const metadata = await sharp(path.join(root, item.png)).metadata()
    const stats = await sharp(path.join(root, item.png)).stats()
    if(metadata.width !== item.width || metadata.height !== item.height)
        throw new Error(`Dimension mismatch for ${item.png}: ${metadata.width}×${metadata.height}`)
    if(stats.isOpaque === false && item.category !== 'career')
        throw new Error(`Unexpected alpha transparency in ${item.png}`)
    const dynamicRange = Math.max(...stats.channels.map(channel => channel.max - channel.min))
    if(dynamicRange < 24)
        throw new Error(`Likely blank image: ${item.png}`)
    qa.push({ file: item.png, width: metadata.width, height: metadata.height, channels: metadata.channels, dynamicRange })
}

const manifest = {
    generatedAt: '2026-07-22',
    generator: 'scripts/generate-han-han-content-assets.mjs',
    fontStack: font,
    renderedFontAvailable: 'Source Han Sans SC (Noto Sans CJK-compatible), with Noto Sans SC and PingFang SC fallbacks',
    palette: C,
    rightsBoundary: '非官方原创策展概念；没有真实肖像、电影静帧、书封、片名字标、赛事/车队/赞助商标。',
    assets: generated,
    qa,
    contactSheet: path.relative(root, contactPath),
}
await writeFile(path.join(sourceRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`Generated ${generated.length} Han Han visual assets.`)
console.log(`Contact sheet: ${path.relative(root, contactPath)}`)
