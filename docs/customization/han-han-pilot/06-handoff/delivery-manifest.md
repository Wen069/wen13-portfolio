# 韩寒版交付清单

## 可运行成品

- 版本名：`han-han-concept-01`
- 开发分支：`feature/han-han-concept-01`
- 旧 Wen13 运行版回退点：`wen13-world-custom-01`
- 韩寒版设计起点：`han-han-concept-01-start`
- 正式版本标签：`han-han-concept-01`
- 公开路径：`https://wen069.github.io/wen13-portfolio/versions/han-han-concept-01/`
- 旧版根路径继续保留：`https://wen069.github.io/wen13-portfolio/`

## 内容与视觉

- 4 个职业故事；每个严格使用事实图、解释图、艺术演绎图三张原创画面。
- 6 个“速度编辑室”条目，避免把策展推演冒充本人未公开观点。
- 1999–2026 Career 压缩映射到母版原有 17 单位道路。
- 4 个 Time Machine 版本：1999、2003、2014、2026。
- 入口标题、地图、About、说明与主要交互文案中文化。
- 社交区域只保留小红书、B站、公众号、邮箱四个中性占位模型，不关联任何个人账号。
- 1200×630 社交分享封面 `static/og.png`。

## 3D 与运行时

- “带着方向盘与手稿的编辑者”抽象低模雕像；无可识别人脸、无品牌标识。
- 无品牌黑/纸白/信号红车辆皮肤，保留母版全部关键节点与操控、物理和灯光逻辑。
- 六个可碰撞的 `HANHAN` 动态字母。
- 三组无碰撞赛道标识，复用既有检查点空间。
- 5 分钟昼夜周期；保留天气、保龄球、赛道计时、排行榜、地图、菜单和重生。

## 维护入口

- 页面与声明：`sources/index.html`
- 数据：`sources/data/projects.js`、`sources/data/lab.js`、`sources/data/social.js`
- 地图章节：`sources/Game/Map.js`
- 资源注册：`sources/Game/Game.js`
- 区域接入：`sources/Game/World/Areas/`
- 主题：`sources/style/hanHan.styl`
- 二维资产生成：`scripts/generate-han-han-content-assets.mjs`
- 3D 资产生成：`scripts/blender-export-han-han-*.py`
- 验证：`scripts/validate-han-han-*.mjs`、`scripts/validate-landing-customizations.mjs`、`scripts/validate-social-domestic.mjs`

## 回退

新版不覆盖 `main` 和 GitHub Pages 根目录。若新版需要下线，只移除 `pages` 分支中的 `versions/han-han-concept-01/`；旧版根站仍可访问。源码可从 `han-han-concept-01` 回到 `han-han-concept-01-start`，或从 `wen13-world-custom-01` 恢复 Wen13 运行版。
