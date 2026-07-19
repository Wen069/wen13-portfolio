# Design QA — Bruno Simon 2025 本地复刻

## 验收对象

- 参考站：`https://bruno-simon.com/`
- 本地实现：`http://localhost:4173/`
- 桌面视口：1440 × 900
- 移动视口：390 × 844，触控模式
- 实现基线：官方 MIT 源码、3D 模型、纹理、声音、字体与 UI 资产；外链改为占位锚点。

## 并排视觉证据

以下每张图均把相同视口、相同界面状态的参考站和本地实现放在同一张对比图中：

- 桌面入口：`qa/comparisons/desktop-intro-comparison.jpg`
- 桌面世界：`qa/comparisons/desktop-world-comparison.jpg`
- 桌面 Options 菜单：`qa/comparisons/desktop-menu-comparison.jpg`
- 桌面地图：`qa/comparisons/desktop-map-comparison.jpg`
- 移动入口：`qa/comparisons/mobile-intro-comparison.jpg`
- 移动世界：`qa/comparisons/mobile-world-comparison.jpg`
- 移动菜单：`qa/comparisons/mobile-menu-comparison.jpg`
- 移动地图：`qa/comparisons/mobile-map-comparison.jpg`

## 强制检查项

| 检查面 | 结果 | 证据与判断 |
| --- | --- | --- |
| 布局与裁切 | 通过 | 桌面和移动端的相机位置、世界裁切、菜单宽高、地图边界、右上角触发按钮与移动顶栏位置一致。 |
| 字体与排版 | 通过 | Amatic SC 700、Nunito 400/700/900、Pally Medium 均本地加载；标题、正文、按钮、断行与行高与参考一致。 |
| 颜色与光照 | 通过 | 材质、Bloom、雾、阴影和环境色来自同一运行代码与资源。并排图中的色相差异来自原项目 4 分钟昼夜循环，属于目标动态行为。 |
| 图片、3D 与图标 | 通过 | 使用官方模型、KTX 纹理、UI WebP/SVG、地图和音频，没有 CSS/占位图或手绘替代；188 个运行时资源均来自本地。 |
| 菜单状态 | 通过 | Home、Options、Controls、Achievements、Circuit、Whispers、Behind the scene 七个分页逐项打开并核对可见文本。 |
| 世界交互 | 通过 | 入口点击、车辆前进、转向、跳跃、菜单打开/关闭、地图打开/关闭均在真实浏览器中执行。 |
| Options 交互 | 通过 | Quality 完成 High → Low → High 往返；Audio 完成正常 → `is-audio-muted` → 正常往返。 |
| 响应式与触控 | 通过 | 390 × 844 入口、世界、菜单、地图四个核心状态无碰撞、无错位，触控点击可用。 |
| 网络与控制台 | 通过 | 浏览器控制台 0 error、0 warning；188 个资源请求中外部请求 0、`undefined` 失败请求 0。 |
| 可访问性基础 | 通过 | 交互入口使用原生 button；桌面键盘输入、移动触控目标、焦点/选中状态继承源实现。高动态 3D 场景与参考站一致。 |

## 已知但不阻塞的运行差异

1. 本地未连接原作者的私有 WebSocket 服务，Options 中显示 `Server Offline`，Circuit 分数与 Whispers 提交采用上游离线状态；这不改变前端视觉结构、3D 世界、驾驶、菜单或地图。
2. 参考与本地截图不是在同一个昼夜循环时间点拍摄，因此部分对比图分别呈现日间、黄昏或夜间；循环周期、关键帧、材质和光照逻辑来自同一源码。
3. 原站桌面地图关闭按钮在某些状态下可被布局到视口上方；本地保留源布局行为，并确认键盘 `M` 与移动端可见关闭按钮能够退出地图。

## 严重度结论

- P0：0
- P1：0
- P2：0
- 阻塞交付的问题：0

final result: passed
