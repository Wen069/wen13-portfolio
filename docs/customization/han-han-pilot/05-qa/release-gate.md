# 韩寒版发布验收闸门

> 版本：`han-han-concept-01`
> 验收日期：2026-07-22
> 结论：通过；无发布阻断问题

## 自动化闸门

- `npm run validate`：通过；覆盖 Social 四模型、Landing 固定镜头与 5 分钟昼夜、车辆节点契约、四组 3D 资产、内容与发布路径。
- `npm run build`：通过；Vite 生产构建完成，`dist/` 约 43 MB。
- `git diff --check`：通过。
- `validate:dist`：通过；生产包 799 个文件，清理 38 个未引用的旧 Wen13 文件，0 个旧人物路径泄漏；源资产与旧版回退点保留。
- PWA manifest：名称已替换为“两种速度”，图标改为相对子路径。
- 关键内容：4 个 Projects、12 张项目视觉、6 个 Lab、4 个 Time Machine 画面、6 张 Career 画面、4 个中性 Social 模型。
- 3D 预算：雕像 9,284 tris / 102.2 KiB；车辆 3,852 tris / 245 KiB；字牌 792 tris；赛道标识 180 tris。

## 浏览器与交互闸门

- Chrome 1440×900：首屏、进入世界、车辆前进、重生、菜单、地图均通过。
- 地图：12 个中文地点可见；Projects、Lab、Career、Time Machine、Circuit、Social 均可跳转。
- Landing：抽象雕像正面面向固定镜头；桌面主体完整，390×844 窄屏仍可辨认正面、方向盘与手稿；HANHAN 字牌和车辆皮肤正常。
- Chrome/WebGPU：Console 0 error；所有新 KTX 正常创建，无 404 或资源加载失败。
- 390×844：世界、地图和 About 菜单可用，主要按钮可点击。
- About：显著展示“非官方原创策展概念”和无隶属、合作、授权或背书关系声明。

## 发现并关闭的问题

首轮 QA 发现 4 张 Career KTX 的宽度不是 4 的倍数，Chrome/WebGPU 会产生 `Invalid Texture/BindGroup` 并拖慢场景。修复内容：

- `writing`：318 → 320 px；
- `racing-start`：330 → 332 px；
- `double-title`：346 → 348 px；
- `merge`：330 → 332 px；
- 生成器新增 KTX 宽高必须为 4 的倍数的硬校验。

修复后重新生成全部相关源 SVG、PNG、KTX 与联系表，再完成生产构建和双通道浏览器复测，问题不再出现。

## 非阻断观察

- Circuit 和少量原生环境贴图仍含 `RESET`、`THREE.JS`、`LEADERBOARD` 等英文；不影响本版核心叙事或功能，可在下一版统一清理。
- 移动端地图地点名称不是常驻显示，用户需要点按探索；可后续增加地点列表或 tap label。
- 原生世界允许车辆驶出地图视觉边界，`R` 可重生；属于母版行为，不是本版回归。
- 构建仍提示少量既有 preload/字体路径警告，但浏览器无 404，运行不受影响。
- Firefox 自动化浏览器未安装；本轮以 Chrome 的真实 WebGPU 路径作为主验收环境。

## 证据

截图位于 `qa/han-han-concept-01/`，包括桌面 Landing、地图、六个主要区域、About、驾驶/重生以及 390×844 的世界、地图和菜单。
