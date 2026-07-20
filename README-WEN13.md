# Wen13 · 栖序智能个人动态网站

这是基于 Bruno Simon 的 Folio 2025 开源项目制作的中文内容复刻版。原项目署名与 MIT License 均保留在网站和 `license.md` 中。

> Wen13、栖序智能 / QIXU AI、履历、客户、项目与成果数据均为当前原型阶段的虚构示例；头像由用户提供的照片艺术化生成。正式发布前应替换为经确认的真实资料。

## 本地运行

```bash
npm install --legacy-peer-deps
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

## 主要内容入口

- 完整角色设定：`content/wen13-profile.md`
- 首页与菜单文案：`sources/index.html`
- 项目：`sources/data/projects.js`
- 实验：`sources/data/lab.js`
- 国内社交链接：`sources/data/social.js`
- 成就：`sources/data/achievements.js`
- 头像：`static/profile/wen13-avatar.png`

小红书与 B站已使用 Wen13 的公开个人主页；微信公众号仍使用平台首页作为可跳转占位地址，邮箱仍使用 `mailto:wen13@example.com`。三个网页链接会在安全新标签打开，邮箱会交给系统邮件应用处理。分享链接中的 token、时间戳和追踪参数不进入源码，只保留稳定的公开主页地址。

## 定制资产

- 中文入场与履历贴图：`scripts/generate-wen13-textures.js`
- 项目看板视觉：`scripts/generate-wen13-project-images.js`
- 3D 动态字母：`scripts/blender-export-wen13-letters.py`
- 独立动态字母模型：`static/areas/wen13-letters.glb`
- 国内社交雕塑生成脚本：`scripts/blender-export-social-domestic.py`
- 国内社交雕塑增量模型：`static/areas/social-domestic.glb`
- 模型契约校验：`npm run validate:social`

主世界仍加载上游原始场景模型；WEN13 动态字母和四个国内社交雕塑均以独立增量模型接入，降低对瀑布、碰撞体和成就区域的回归风险。旧海外品牌雕塑保留在原始 GLB 中作为回退数据，但由 `SocialArea` 在运行时移出游戏；雕像、粉丝区和隐藏频道玩法继续保留。

可编辑的 `resources/social-domestic.blend` 由生成脚本产出，并遵循项目现有规则留在本地 `resources/`。公开仓库以生成脚本和已验证 GLB 为可重复交付源。

## 发布前检查

- 将所有虚构履历和模拟结果替换为已核实内容，或继续保留显著的“虚构/模拟”声明。
- 替换社交、邮箱和项目链接。
- 确认头像照片及艺术化版本的公开使用授权。
- 执行 `npm run validate:social` 与 `npm run build`，并在桌面端和移动端各完成一次浏览器验收。
