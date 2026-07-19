# 复刻说明

本项目以 Bruno Simon 2025 个人作品集的公开 MIT 源码和源资产为实现基线，并按源站桌面端与移动端状态逐项验收。

## 当前状态

- 保留完整 3D 世界、物理车辆、相机、昼夜循环、天气、声音、菜单、地图、成就、赛道、Whispers 与 Behind the scene 界面。
- 个人介绍与履历暂时保留源站同等信息密度的示例内容，后续可替换为用户真实资料。
- 社交链接已集中替换为 `#social-*` 占位锚点，配置位于 `sources/data/social.js`。
- Amatic SC、Nunito 与 Pally 字体均已本地化；已移除 Google Fonts 与 Google Analytics 热链。
- 本地不连接原作者 WebSocket 服务，因此菜单会显示 `Server Offline`；这是上游源码明确支持的离线运行模式，不影响 3D 浏览、驾驶、菜单和地图。

## 许可证

上游源码与 Blender/运行资产遵循仓库中的 MIT License。二次修改和发布时应保留 `license.md` 与原作者归属。

## 验收

生产构建与视觉、交互、响应式验收结果见 `design-qa.md`，截图与并排对比位于 `qa/`。
