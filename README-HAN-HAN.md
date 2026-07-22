# 韩寒 ·《两种速度》动态网站

这是基于 Bruno Simon `folio-2025`（MIT）进行二次创作的中文 3D 人物策展概念。它用同一张可驾驶地图组织写作、职业赛车与电影创作三条公开职业线。

> 本站是依据公开资料制作的**非官方原创策展概念**，与韩寒本人及相关作品、赛事、车队、片方或其他权利方无隶属、合作或背书关系。人物雕像为无可识别五官的抽象低模；项目图、Lab 图、车辆、赛道标识和时间画面均为原创设计，不使用电影剧照、海报、书封、真实赛车涂装或商标。

## 体验结构

- Landing「两种速度」：抽象人物雕像、HAN HAN 动态字母与人物命题；
- Career「从纸面到赛道」：1999–2026 的压缩职业时间轴；
- Circuit「判断发生的地方」：保留原驾驶、计时、检查点和排行榜，只替换为无品牌工作车与原创赛道标记；
- Projects「四次进入新专业」：4 个故事，每个由事实图、解释图、艺术演绎图组成；
- Lab「速度编辑室」：6 个由公开材料引出的策展问题；
- Time Machine「版本，不是答案」：1999、2003、2014、2026 四个职业版本；
- Social：只保留小红书、B站、公众号与邮箱四个通用模型，不代表候选人的真实账号。

## 本地运行

```bash
npm install --legacy-peer-deps
npm run dev
```

生产验证与构建：

```bash
npm run validate
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## 主要维护入口

- 人物与设计蓝图：`docs/customization/han-han-pilot/README.md`
- 首页与免责声明：`sources/index.html`
- 项目数据：`sources/data/projects.js`
- Lab 数据：`sources/data/lab.js`
- 地图章节名：`sources/Game/Map.js`
- 资源注册：`sources/Game/Game.js`
- UI 主题覆盖：`sources/style/hanHan.styl`
- 原创视觉生成：`scripts/generate-han-han-content-assets.mjs`
- 3D 生成与验证：`scripts/blender-export-han-han-*.py`、`scripts/validate-han-han-3d.mjs`
- 执行与 QA 证据：`docs/agent-journals/2026-07-22-han-han-concept-site-delivery.md`

## 版本与回退

- 旧 Wen13 运行版：Git 标签 `wen13-world-custom-01`；
- 韩寒版设计起点：Git 标签 `han-han-concept-01-start`；
- 韩寒版开发分支：`feature/han-han-concept-01`；
- 正式版本使用标签 `han-han-concept-01`，公共版本位于独立子路径，不覆盖 GitHub Pages 根目录的 Wen13 站点。

原项目署名和 MIT License 保留在站内、`license.md` 与 `readme.md`。
