# 韩寒非官方策展概念版 · 完整网站交付执行日志

> 线程 ID：运行时未提供，使用 `2026-07-22-han-han-concept-site-delivery` 作为回退标识。

## 任务契约

- 目标：依据已验收的《两种速度》蓝图，把当前 3D 动态网站制作成可运行、可验证、可独立访问的韩寒主题版本，并持续执行到构建、浏览器 QA、版本管理、发布与项目档案同步全部完成。
- 用户授权：允许自主分配子 Agent、使用本机工具、安装必要依赖、执行构建与发布；要求保留上一版，并为韩寒版建立独立版本链。
- 权利边界：成品必须明确标注“非官方原创策展概念”；只使用公开职业事实、原创编辑视觉、无品牌车辆/赛道和抽象低识别度雕像；不复制电影静帧、海报、书封、真实赛车涂装、赛事/车队/赞助商标、家庭/住宅资料，不暗示本人合作或认可。
- 工程范围：允许 L0 内容、L1 DOM/UI/贴图/材质和 L2 静态 3D/车辆换皮；保留现有地图、输入、物理、计时、排行榜、昼夜、天气、保龄球和 Social 四模型逻辑。只有为既有区域接入新内容所需的最小代码变化可进入。
- 交付：源分支、提交与标签；独立生产构建与公共版本路径；桌面/移动/固定镜头/昼夜/核心交互 QA；设计与资产清单；Obsidian 项目同步和可回退证据。

## 阶段状态

- 当前阶段：内容、原创视觉和 3D 资产并行生产；主工程已开始不冲突的运行时主题适配。
- 下一可观察检查点：三个子任务各自产出可集成候选，主 Agent 完成首轮审查并明确接受或退回，然后接入资源注册与区域逻辑。

## 决策日志

- 保留旧版：运行时基线提交 `382c1f5` 标记为本地注释标签 `wen13-world-custom-01`；韩寒版起点提交 `7089a86` 标记为 `han-han-concept-01-start`。
- 新版在独立分支 `feature/han-han-concept-01` 开发；不在 `main` 上覆盖旧版本。
- OpenCLI 1.8.6 的实际职责是网站/应用 CLI 与浏览器桥接，不具备源码分支、提交、标签和回退能力；源码版本管理使用 Git CLI，OpenCLI 只用于其真实支持的外部操作。
- 公开发布时优先保留当前根路径 Wen13，并把韩寒版放到独立版本目录；如果现有 Pages 管线无法安全共存，再使用独立 Pages 仓库/项目，但不得覆盖旧站。
- 视觉采用“事实证据图、原创解释图、艺术演绎图”三类，不用随机 AI 海报填槽。信息图和 UI 优先使用确定性的代码/矢量生成；只有真正需要氛围图时才使用 built-in ImageGen，并保存到项目内。

## 职责与子 Agent

- `/root/hanhan_content`：人物内容与站内数据适配；独占 `sources/data/projects.js`、`sources/data/lab.js`、`sources/Game/Map.js`、`sources/index.html` 与内容清单，不修改视觉/模型/运行核心。状态：执行中。
- `/root/hanhan_visuals`：原创二维视觉资产；独占 `hanhan-*` KTX/源图、视觉生成脚本和视觉清单，不修改数据、HTML/CSS 或运行逻辑。状态：执行中。
- `/root/hanhan_3d`：入口雕像、车辆视觉与轻量赛道标识；独占新 Blender/验证脚本、`landing-han-han-statue.glb`、`han-han.glb`、可选标识模型和 3D 报告，不修改运行时代码。状态：执行中。
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

## 验证证据

- `git status --short --branch`：切换前 `main` 干净且比 `github/main` ahead 2；切换后新分支工作区干净。
- `git remote -v`：远端为 `https://github.com/Wen069/wen13-portfolio.git`。
- 标签：`wen13-world-custom-01` 指向运行基线 `382c1f5`；`han-han-concept-01-start` 指向文档/设计起点 `7089a86`。
- 主工程已将 Career 年份窗口从 2008–2025 扩展为 1999–2026；Projects、Lab、动态标题、成就和控制台声明切换到《两种速度》语义，并新增 `sources/style/hanHan.styl` 作为纸张/沥青/信号红 UI 覆盖层。上述修改未触碰子 Agent 的文件边界。

## 下一步

- 使用代码图谱冻结可修改文件与数据契约；
- 并行分配内容、二维视觉和 3D 资产；
- 在子任务返回后逐项做事实、视觉、固定镜头、性能与范围审查。
