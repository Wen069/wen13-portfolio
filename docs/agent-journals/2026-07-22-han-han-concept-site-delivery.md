# 韩寒非官方策展概念版 · 完整网站交付执行日志

> 线程 ID：运行时未提供，使用 `2026-07-22-han-han-concept-site-delivery` 作为回退标识。

## 任务契约

- 目标：依据已验收的《两种速度》蓝图，把当前 3D 动态网站制作成可运行、可验证、可独立访问的韩寒主题版本，并持续执行到构建、浏览器 QA、版本管理、发布与项目档案同步全部完成。
- 用户授权：允许自主分配子 Agent、使用本机工具、安装必要依赖、执行构建与发布；要求保留上一版，并为韩寒版建立独立版本链。
- 权利边界：成品必须明确标注“非官方原创策展概念”；只使用公开职业事实、原创编辑视觉、无品牌车辆/赛道和抽象低识别度雕像；不复制电影静帧、海报、书封、真实赛车涂装、赛事/车队/赞助商标、家庭/住宅资料，不暗示本人合作或认可。
- 工程范围：允许 L0 内容、L1 DOM/UI/贴图/材质和 L2 静态 3D/车辆换皮；保留现有地图、输入、物理、计时、排行榜、昼夜、天气、保龄球和 Social 四模型逻辑。只有为既有区域接入新内容所需的最小代码变化可进入。
- 交付：源分支、提交与标签；独立生产构建与公共版本路径；桌面/移动/固定镜头/昼夜/核心交互 QA；设计与资产清单；Obsidian 项目同步和可回退证据。

## 阶段状态

- 当前阶段：内容、原创视觉、3D 与运行时集成完成；自动校验、生产构建和双通道浏览器 QA 通过，进入版本封板、独立路径发布与 Obsidian Exit Gate。
- 下一可观察检查点：公开子路径返回 200，韩寒版关键资产可加载，旧根站内容未被覆盖，然后写入正式标签与项目档案。

## 决策日志

- 保留旧版：运行时基线提交 `382c1f5` 标记为本地注释标签 `wen13-world-custom-01`；韩寒版起点提交 `7089a86` 标记为 `han-han-concept-01-start`。
- 新版在独立分支 `feature/han-han-concept-01` 开发；不在 `main` 上覆盖旧版本。
- OpenCLI 1.8.6 的实际职责是网站/应用 CLI 与浏览器桥接，不具备源码分支、提交、标签和回退能力；源码版本管理使用 Git CLI，OpenCLI 只用于其真实支持的外部操作。
- 公开发布时优先保留当前根路径 Wen13，并把韩寒版放到独立版本目录；如果现有 Pages 管线无法安全共存，再使用独立 Pages 仓库/项目，但不得覆盖旧站。
- 视觉采用“事实证据图、原创解释图、艺术演绎图”三类，不用随机 AI 海报填槽。信息图和 UI 优先使用确定性的代码/矢量生成；只有真正需要氛围图时才使用 built-in ImageGen，并保存到项目内。

## 职责与子 Agent

- `/root/hanhan_content`：人物内容与站内数据适配。状态：完成并验收，提交 `257476b`。
- `/root/hanhan_visuals`：原创二维视觉资产。状态：完成并验收，提交 `2b94462`；后由主 Agent 修复 Career KTX 块尺寸约束。
- `/root/hanhan_3d`：入口雕像、车辆视觉与轻量赛道标识。状态：完成并验收，提交 `4b4f0d9`。
- `/root/hanhan_qa`：独立 Chrome/WebGPU、六区域与 390×844 QA。状态：完成；首轮发现 Career KTX 阻断并触发返工，最终复测无阻断。
- `/root/hanhan_release_review`：最终未提交集成差异的只读审查。状态：完成；提出 PWA 品牌/子路径与旧 Wen13 发布资产两项阻断，均已修复。
- 主 Agent：版本管理、代码图谱复核、任务监督、返工裁决、最终集成、构建、浏览器 QA、发布与 Obsidian 同步。

## 工具与环境

- 源目录：`/Users/a1-6/Documents/Codex/2026-07-19/1-1-2/outputs/bruno-portfolio-clone`
- `opencli`：`/Users/a1-6/.npm-global/bin/opencli`，v1.8.6；不属于版本控制工具。
- Git：当前分支 `feature/han-han-concept-01`，起点 `7089a86`；旧版与新版起点标签已创建。
- `npx`：`/Users/a1-6/.local/bin/npx`，v10.9.3；满足 Playwright CLI 前置条件。
- GitHub CLI：`/opt/homebrew/bin/gh`，v2.73.0；当前账号 `Wen069` 已登录，远端 `github` 可写。
- 计划使用：codebase-memory-mcp、built-in ImageGen、Blender/GLB 工具链、项目现有验证器、Playwright CLI、Git/GitHub CLI、Obsidian 项目系统。

## 权限请求

- 用户已在当前任务明确授予本任务需要的本机工具、安装、执行、分配和交付权限；不扩展到伪造第三方授权、冒充官方关系或不可逆删除。

## 失败与调整

- OpenCLI 版本管理能力缺口：`opencli --help` 仅提供网站 CLI、Browser Bridge、插件/适配器和外部 CLI 路由，没有 Git 分支/提交/标签/回退命令。已在使用 Git 前向用户即时说明；预计对结果无损失。
- Sites 连接器调用缺口：仓库含 `.openai/hosting.json`，按 Sites 规范尝试读取既有 `project_id` 时，已发现的 `sites.get_site` 接口实际返回“not available to the model”。已向用户即时说明，开始核对共享工具注册；已确认 GitHub CLI 2.73.0 登录 `Wen069` 且仓库远端可写，因此若 Sites 在发布闸门仍不可用，将用 GitHub Pages 的独立版本路径发布，旧根站不覆盖。影响仅为托管后端与 Sites 私有版本能力，不影响构建、公共 URL、Git 回退和后续更新。
- 首轮 Chrome/WebGPU QA 发现 4 张 Career KTX 宽度不是 4 的倍数，产生 `Invalid Texture/BindGroup` 并可令自动化会话高占用。主 Agent 把宽度修正为 320/332/348/332 px，并在生成器加入 KTX 宽高必须为 4 的倍数的硬失败；重新生成、构建与独立 QA 后 Console 0 error。
- 最终只读审查发现 PWA manifest 仍携带 Bruno 名称且图标使用根路径，以及 `dist/` 仍包含未引用的 Wen13 资产。已把 manifest 改为“两种速度”并使用相对图标路径；构建阶段只从韩寒发布包清理 38 个旧人物文件，源仓库和旧版回退点不删除。`validate:dist` 已锁定这两项约束。

## 验证证据

- `git status --short --branch`：切换前 `main` 干净且比 `github/main` ahead 2；切换后新分支工作区干净。
- `git remote -v`：远端为 `https://github.com/Wen069/wen13-portfolio.git`。
- 标签：`wen13-world-custom-01` 指向运行基线 `382c1f5`；`han-han-concept-01-start` 指向文档/设计起点 `7089a86`。
- 主工程保留 Career 原有 17 单位可驾驶道路，把 1999–2026 压缩映射到同一段交互距离；Projects、Lab、动态标题、成就和控制台声明切换到《两种速度》语义，并新增 `sources/style/hanHan.styl` 作为纸张/沥青/信号红 UI 覆盖层。
- GitHub Pages 现状经 API 核对：`build_type=legacy`，发布源为 `pages:/`，当前公开根地址 `https://wen069.github.io/wen13-portfolio/`；远端 `pages` 基线为 `f843d74`。新版本将写入 `versions/han-han-concept-01/`，因此根目录旧站与其公共地址保持不变。
- 第一层版本提交：`990c0eb feat: establish Han Han editorial theme`，只包含主工程主题与运行时语义，不混入内容/视觉/3D 批量产物。
- 视觉层提交：`2b94462 feat: add Han Han editorial visual system`；内容层提交：`257476b feat: curate Han Han editorial content`。
- 3D 层提交：`4b4f0d9 feat: add Han Han 3D identity assets`。固定镜头预览确认雕像正面可读；车辆、HANHAN 物理字牌、三个检查点标识通过独立模型校验。
- built-in ImageGen 只生成一张 1200×630 分享封面 `static/og.png`；准确包含“韩寒 · 两种速度 / 在文字、赛道与镜头之间 / 非官方原创策展概念”，没有可识别人脸、作品图、商标或额外文字。
- `npm run validate`：通过；`npm run build`：通过，生产包约 43 MB；`git diff --check`：通过。
- 主 Agent 应用内浏览器复测：桌面 Landing、地图、Projects、Lab、Career、Time Machine、Circuit、Social 与 390×844 Landing/Social 均可达，Console 无 error/warn。
- 独立 QA：Chrome/WebGPU 0 error；车辆前进与 `R` 重生、12 个中文地图节点、六个主要区域、About 免责声明和 390×844 世界/地图/菜单全部通过。证据保存在 `qa/han-han-concept-01/`。
- 最终生产包：`validate:dist` 通过，共 799 个文件、0 个旧 Wen13 路径；PWA 名称和图标子路径通过自动检查。
- 集成层提交：`eb96990 feat: integrate Han Han concept world`，包含运行时接入、四倍数纹理返工、分享封面、PWA 修复、旧人物发布包隔离及完整校验器。

## 下一步

- 完成最终只读代码审查并处理发现项；
- 提交集成与发布证据，创建 `han-han-concept-01` 标签并推送源分支；
- 把 `dist/` 安装到 `pages:/versions/han-han-concept-01/`，验证公开 URL 和旧根站；
- 完成 Obsidian milestone/Exit Gate 同步。
