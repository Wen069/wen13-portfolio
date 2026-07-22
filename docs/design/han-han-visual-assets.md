# 韩寒《两种速度》原创视觉资产交付说明

> 版本：v0.1
> 日期：2026-07-22
> 状态：可进入运行时集成
> 视觉性质：非官方原创策展概念；不是本人官方站点，不构成合作、授权或背书

## 1. 交付结果

本轮完成了一套完全原创、可重复生成的二维视觉资产系统，覆盖现有动态网站的 Projects、Lab、Career、Time Machine 与菜单/About 头像。全套资产由确定性 SVG 信息设计生成，没有使用电影静帧、海报、书封、真实肖像、片名字标、赛事/车队/赞助商标，也没有使用 AI 生成的假现场。

资产总计：

| 区域 | 可编辑源 | 运行时 PNG | 运行时 KTX2 / WebP | 数量 |
|---|---:|---:|---:|---:|
| Projects | 12 SVG | 12 | 12 KTX2 | 12 张 |
| Lab | 12 SVG | 12 | 12 KTX2 | 6 组主图/缩略图 |
| Career | 6 SVG | 6 | 6 KTX2 | 6 张 |
| Time Machine | 4 SVG | 4 | 4 KTX2 | 4 张 |
| 概念头像 | 1 SVG | 1 | 1 WebP | 1 组 |
| 视觉总览 | — | 1 联系表 | — | 1 张 |

静态运行时资产与可编辑源合计约 3.4 MB；其中 Projects KTX2 约 216 KB，Lab KTX2 约 116 KB，Career KTX2 约 196 KB，Time Machine KTX2 约 16 KB。

## 2. 视觉系统

### 2.1 人物命题

视觉围绕“慢速编辑与高速判断”展开：

- 纸张、网格、校对线代表观察、写作和反复编辑；
- 沥青、理想走线、计时节点代表赛车中的规则、判断和复盘；
- 分镜框、镜头路径、剪辑刻度代表从文字到电影的媒介转换；
- 所有职业线最终由一条信号红路径连接，但不借用任何真实作品或赛事视觉。

### 2.2 色票

| 令牌 | 色值 | 用途 |
|---|---|---|
| Ink | `#151617` | 主文字、深色卡片、道路核心 |
| Asphalt | `#292B2E` | 艺术演绎与 Lab 主背景 |
| Graphite | `#484B4E` | 二级结构、摄影机与文字辅助线 |
| Aluminum | `#B9BCB9` | 工业结构、分隔线、夜间次级文字 |
| Paper | `#F2EBDD` | 事实/解释画面主底色 |
| Paper Deep | `#DDD4C4` | 纸张层级、卡片和道路边缘 |
| Signal | `#D94A3A` | 核心路径、选择和警示 |
| Amber | `#D99B3F` | Lab、当前状态和开放终点 |
| Muted | `#7F796F` | 来源、免责声明和次级文字 |
| White | `#FAF7EF` | 深色背景主文字 |

完整视觉联系表：[`resources/han-han-visual-source/hanhan-visual-contact-sheet.png`](../../resources/han-han-visual-source/hanhan-visual-contact-sheet.png)

### 2.3 字体

SVG 声明 `Noto Sans SC, Source Han Sans SC, PingFang SC, sans-serif`。本机 Fontconfig 实际解析为已安装的 `Source Han Sans SC`，它与 Noto Sans CJK 同源，中文粗细、字面和手机缩略图可读性已经过渲染检查。

## 3. Projects：四组三联画

每个项目固定三张，不允许交换语义：

- `P-EVIDENCE`：公开事实索引；明确写着“非原始档案”，不伪装成一手物证；
- `P-EXPLAIN`：策展团队原创解释；不冒充本人原话或真实工作文档；
- `P-MOOD`：明确标注艺术演绎；不冒充真实现场、电影场景或比赛赛道。

### 3.1 少年写作

| 类型 | 文件键 |
|---|---|
| P-EVIDENCE | `hanhan-writing-evidence.ktx` |
| P-EXPLAIN | `hanhan-writing-explain.ktx` |
| P-MOOD | `hanhan-writing-mood.ktx` |

设计重点：1999—2003 的公开年份索引、观察—句子—段落—回应—重写循环、纸页向公路展开的空间隐喻。

### 3.2 职业赛车

| 类型 | 文件键 |
|---|---|
| P-EVIDENCE | `hanhan-racing-evidence.ktx` |
| P-EXPLAIN | `hanhan-racing-explain.ktx` |
| P-MOOD | `hanhan-racing-mood.ktx` |

设计重点：2003 职业起点、2012 同年两项全国年度冠军、拉力/场地两种判断方式、雨后沥青上的抽象理想走线。所有赛道均为原创几何，不对应真实赛事线路。

### 3.3 第一次执导

| 类型 | 文件键 |
|---|---|
| P-EVIDENCE | `hanhan-directing-evidence.ktx` |
| P-EXPLAIN | `hanhan-directing-explain.ktx` |
| P-MOOD | `hanhan-directing-mood.ktx` |

设计重点：2014 年职业身份转换、原创占位句从文本进入镜头表/调度/剪辑的过程、漂浮分镜沿抽象公路展开。没有片名、剧照、对白或角色造型。

### 3.4 赛车电影方法

| 类型 | 文件键 |
|---|---|
| P-EVIDENCE | `hanhan-convergence-evidence.ktx` |
| P-EXPLAIN | `hanhan-convergence-explain.ktx` |
| P-MOOD | `hanhan-convergence-mood.ktx` |

设计重点：2019/2024/2026 的职务连续性、赛道几何—角色选择—摄影机路径—剪辑节奏四层模型、道路显出时间刻度的艺术演绎。

运行时文件位于 `static/projects/images/`，同名 PNG 供设计审查，同名 KTX2 供游戏加载；全部为 960×540。

## 4. Lab：六组主图与手机缩略图

| Lab | 主图键 | 缩略图键 | 声明层级 |
|---|---|---|---|
| 句子怎样成为镜头 | `hanhan-lab-text-to-lens.ktx` | `hanhan-lab-text-to-lens-mini.ktx` | 策展解释 |
| 速度怎样被看见 | `hanhan-lab-visible-speed.ktx` | `hanhan-lab-visible-speed-mini.ktx` | 公开材料 |
| 两种赛制，两种判断 | `hanhan-lab-two-disciplines.ktx` | `hanhan-lab-two-disciplines-mini.ktx` | 公开材料 |
| 路线就是叙事 | `hanhan-lab-route-narrative.ktx` | `hanhan-lab-route-narrative-mini.ktx` | 策展解释 |
| 失败怎样进入喜剧 | `hanhan-lab-failure-comedy.ktx` | `hanhan-lab-failure-comedy-mini.ktx` | 艺术演绎 |
| 下一次起跑 | `hanhan-lab-next-start.ktx` | `hanhan-lab-next-start-mini.ktx` | 事实到此 |

主图为 960×540；缩略图为现有 `LabArea.setScroller()` 契约要求的 240×136。缩略图不是把主图机械缩小，而是重新排版，仅保留大标题、一个短摘要和层级标签，避免手机端细字不可读。

运行时文件位于 `static/lab/images/`。`labData` 集成时应分别把 `image` 与 `imageMini` 指向同组 KTX2 文件。

## 5. Career

Career 继续沿用原生的透明灰度文字蒙版：运行时材质读取 R/G 通道并按现有线条颜色着色，所以这里不把信号红或琥珀直接写进纹理。

| 节点 | 文件键 | 尺寸 |
|---|---|---:|
| 1999 · 写作被看见 | `hanhan-career-writing.ktx` | 318×96 |
| 2003 · 进入职业赛车 | `hanhan-career-racing-start.ktx` | 330×96 |
| 2012 · 两种赛制 | `hanhan-career-double-title.ktx` | 346×96 |
| 2014 · 文字成为镜头 | `hanhan-career-director.ktx` | 320×96 |
| 2019 · 两条线汇合 | `hanhan-career-merge.ktx` | 330×96 |
| 2026 · 下一圈 | `hanhan-career-open-loop.ktx` | 312×96 |

Career KTX2 使用与原站相同的 UASTC + sRGB + RG 编码，以避免小字号灰度边缘被 ETC1S 过度损伤。

## 6. Time Machine

| 版本 | 文件键 | 抽象物件 |
|---|---|---|
| 1999 | `hanhan-time-1999-writing.ktx` | 带校对线的纸页 |
| 2003 | `hanhan-time-2003-racing.ktx` | 无品牌头盔与抽象路线 |
| 2014 | `hanhan-time-2014-directing.ktx` | 原创取景框/分镜卡 |
| 2026 | `hanhan-time-2026-open.ktx` | 未闭合的圈与开放箭头 |

全部为现有电视屏幕契约的 140×124 KTX2。当前原生代码只轮换两张资源；集成时需要把 `screenTextures` 扩为四项并在资源清单中注册以上文件，但不用改变碰撞、声音或屏幕着色器逻辑。

## 7. 概念头像

- PNG：`static/profile/han-han-concept-avatar.png`，1024×1024；
- WebP：`static/profile/han-han-concept-avatar.webp`；
- 可编辑源：`resources/han-han-visual-source/profile/han-han-concept-avatar.svg`。

头像使用抽象侧脸、头盔、纸页和校对线构成一个编辑徽记。画面右下角明确写有“非本人肖像”；不描摹真实五官，也不借用电影角色或赛车服装。

## 8. 可重复生成

唯一生成入口：

```bash
node scripts/generate-han-han-content-assets.mjs
```

脚本执行流程：

1. 以固定视觉令牌生成 SVG；
2. 通过 Sharp 渲染 PNG；
3. 使用项目自带 `tools/ktx/bin/toktx` 编码 KTX2；
4. 生成 2400×3280 视觉联系表；
5. 校验每张 PNG 的尺寸、通道、透明策略和动态范围；
6. 写入 `resources/han-han-visual-source/manifest.json`。

脚本只写入 `hanhan-` 前缀资产和 `han-han-concept-avatar.*`，不会覆盖现有 Wen13 或原生资产。

## 9. QA 证据

### 9.1 自动检查

- `node --check scripts/generate-han-han-content-assets.mjs`：通过；
- 脚本完整重生成：通过，35 个业务资产全部生成；
- manifest：35 条资产、35 条逐图 QA 记录；
- 图片动态范围最小值：201，未发现空白图或接近纯色的错误输出；
- Projects：12 个 KTX2 均为 960×540 BasisLZ；
- Lab：6 个主图均为 960×540 BasisLZ，6 个缩略图均为 240×136 BasisLZ；
- Career：6 个 KTX2 尺寸与清单一致，使用 UASTC/RG；
- Time Machine：4 个 KTX2 均为 140×124 BasisLZ；
- 头像：1024×1024 PNG 与 WebP 均生成。

### 9.2 视觉检查

- 完整联系表逐区检查通过，没有缩略图裁切、底部重叠或色票溢出；
- 四组 Projects 均能在缩略预览中一眼区分事实、解释、演绎；
- 六张 Lab 缩略图按原始 240×136 查看，标题与层级标签可读；
- Tesseract `chi_sim+eng` 在六张 Lab 缩略图中均识别出完整中文主标题；
- 概念头像检查为低识别度抽象编辑徽记，不构成真实肖像；
- 未发现仿电影海报、仿书封、真实赛道复刻、可识别人脸或假现场。

## 10. 集成注意事项

1. Projects 与 Lab 的数据键必须包含 `.ktx` 扩展名，加载器会自行拼接 `projects/images/` 或 `lab/images/`；
2. Lab 主图和 mini 必须一一对应，不能把 960×540 主图直接当 mini 使用；
3. Career 纹理由资源注册名间接引用，集成者需新增资源条目并更新六个节点的 `userData.texture`，但不要改材质的 R/G 蒙版算法；
4. Time Machine 当前只有两张固定资源，扩为四张时保留现有 `collideIndex % screenTextures.length` 逻辑即可；
5. 所有页面和弹层中，应同时显示“非官方原创策展概念”和内容来源/演绎说明，避免产生本人官方站点或授权合作的误解。
