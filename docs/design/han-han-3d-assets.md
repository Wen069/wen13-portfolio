# 韩寒《两种速度》3D 资产交付说明

> 状态：可集成候选；非官方、未授权、仅限内部概念样板
> 资产层级：L2 静态视觉与换皮，不改变场景、玩法、车辆物理或镜头
> 生成与终检日期：2026-07-22

## 1. 交付内容

| 资产 | 运行时文件 | 可重复生成脚本 | Blender 源文件 | 预览 |
|---|---|---|---|---|
| “带着头盔的编辑者”雕像 | `static/areas/landing-han-han-statue.glb` | `scripts/blender-export-han-han-statue.py` | `resources/han-han-3d/han-han-editor-statue.blend` | `resources/han-han-3d/previews/statue-default-camera.png`、`statue-front.png`、`statue-side.png` |
| 纸白/墨黑/信号红车辆 | `static/vehicle/han-han.glb` | `scripts/blender-export-han-han-vehicle.py` | `resources/han-han-3d/han-han-vehicle.blend` | `resources/han-han-3d/previews/vehicle-preview.png` |
| HANHAN 入口字牌 | `static/areas/han-han-letters.glb` | `scripts/blender-export-han-han-letters.py` | `resources/han-han-3d/han-han-letters.blend` | `resources/han-han-3d/previews/letters-preview.png` |
| 轻量赛道走线标识 | `static/areas/han-han-circuit-markers.glb` | `scripts/blender-export-han-han-circuit-markers.py` | `resources/han-han-3d/han-han-circuit-markers.blend` | `resources/han-han-3d/previews/circuit-markers-preview.png` |
| 自动合同校验 | — | `scripts/validate-han-han-3d.mjs` | — | JSON 终检输出 |

四套资产均不含外部图片纹理、Logo、影片字标、赛车队/赛事/赞助商标识或可识别五官。

## 2. 权利与创作边界

### 雕像

- 所有几何由项目脚本从 Blender 基础几何程序化生成，没有下载或改造韩寒肖像模型；
- 人物只表达“成年人、编辑者、车手”三个抽象信息；头部无眼睛、鼻形、眼镜、签名发型等肖像识别点；
- 左臂夹一只无品牌抽象头盔，右臂持三张无文字纸页/分镜卡；
- 服装是无标志的纸石色编辑外套，不复制赛车服、电影角色或具体公开照片姿势；
- 根节点 extras 明确写入 `unofficial internal concept` 与 `no likeness scan` 权利边界。

### 车辆

- 以项目既有 `static/vehicle/default.glb` 为母版，只替换通用材质并增加三条原创信号红校对/理想走线；
- 未改变底盘、车轮锚点、悬挂、灯光、Boost、能量单元或任何物理值；
- 没有车号、厂牌、车队、赛事、赞助商或电影涂装。

### 字牌与赛道标识

- HANHAN 字牌使用脚本自建 H/A/N 块状几何，不使用影片字体、签名或 Logo；
- 赛道标识只由“收紧的三道红条—纸白 apex 方块—纸白出口线”组成，不复制真实赛事视觉；
- 名人名称与整套概念仍只可用于内部受控样板；未经授权不得作为官方站点或暗示本人合作、认可。

## 3. 资产合同与终检数据

终检命令：

```bash
node scripts/validate-han-han-3d.mjs
node scripts/validate-vehicle-model.mjs static/vehicle/han-han.glb
```

| 指标 | 雕像 | HANHAN 字牌 | 车辆 | 赛道标识 |
|---|---:|---:|---:|---:|
| 包围盒 X/Y/Z（m） | 3.440 / 6.665 / 3.400 | 8.077 / 0.770 / 3.864 | 2.992 / 2.519 / 1.912 | 102.848 / 0.055 / 119.190 |
| 三角面 | 9,284 | 792 | 3,852 | 180 |
| 网格 | 3 | 6 | 21 | 15 |
| 材质 | 3 | 2 | 6 | 2 |
| 纹理 / 动画 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| 文件大小 | 102.2 KiB | 63.6 KiB | 245.0 KiB | 24.2 KiB |

雕像使用 Draco 压缩。项目 `ResourcesLoader` 已为所有 GLTFLoader 注册 DRACOLoader，因此运行时直接兼容。单独用 glTF Transform 读取该文件时，需要像 `validate-han-han-3d.mjs` 一样注册 `KHRDracoMeshCompression` 与 `draco3d.decoder`。

### 3.1 雕像兼容与镜头

- 根节点：`landingKnightStatuePhysicalFixed`，与现有 Landing 识别合同一致；
- 直接碰撞子节点：`cuboidLandingKnightStatue`，无可见网格；
- 视觉合并为纸白、石墨、信号红三个批次，低于旧雕像 8 meshes 上限；
- 世界位置：`(37, 0, 41)`，未占用新的出生区或道路空间；
- 正面轴在 glTF 世界中为 `+Z`；默认镜头从 `+X/+Z` 象限观看，点积 `0.707`；
- 窄屏已有投影阈值：`isometricHorizontal = -4`、`isometricDepth = 78`，均在现有校验安全线内；
- 固定镜头预览能看到脸部正面三分之四、头盔开口和纸页，不依赖用户旋转视角；
- 碰撞盒只包住底座与身体主干，不包纸页和头盔外轮廓，避免突出件卡车。

### 3.2 HANHAN 字牌兼容

- 六个场景顶层节点依次为 `refLettersPhysicalDynamic00` 到 `05`；
- 每个顶层节点自身有可见网格，并有一个 `cuboidHanHanXX` 非渲染碰撞子节点；
- 每个字母保留 `mass = 1`、摩擦和回弹 extras；
- `LandingArea.setLetters()` 可以继续逐字调用 `addFromModel()`，无需改变动态、碰撞、声音或睡眠逻辑；
- 与旧 WEN13 字牌使用同一落位中心和 25° 方位，整体宽度 8.077 m，没有扩大现有字牌槽位。

### 3.3 车辆兼容

自动对比确认保留母版全部 24 个命名节点，包括：

- 必需：`chassis`、`bodyPainted`、`wheelContainer`、`wheelCylinder`；
- 反馈：`wheelSuspension`、`wheelPainted`；
- 成对转向灯、刹车灯、倒车灯；
- `energy` 与 `cell1`、`cell2`、`cell3` Boost 部件。

车辆长度和宽度与母版完全相同，高度只因顶部红色视觉线增加 0.043 m；仍在纯换皮容差内。新增节点只有：

- `hanHanSignalLineTop`
- `hanHanSignalLineLeft`
- `hanHanSignalLineRight`

三者都是 `chassis` 的普通视觉子物件，不参与物理、车轮或控制。

### 3.4 赛道标识坐标说明

102.848 × 119.190 m 的包围盒是**有意的世界坐标跨度**，不是单个巨型模型。15 个小网格分成三组，分别落在现有 checkpoint 001、004、007 附近：

| 标识组 | 对应现有 checkpoint 世界 X/Z | 作用 |
|---|---:|---|
| Brake | `37.06 / -47.82` | 三段收紧红条提示制动节奏 |
| Apex | `-61.81 / -27.47` | 白色方块提示弯心 |
| Rhythm | `-56.05 / 70.52` | 重复同一视觉语法形成路线节奏 |

- 所有网格离地高度不超过 0.055 m；
- 文件中不存在 `physical`、`cuboid`、`trimesh`、`hull`、`tube` 或 `ball` 节点；
- 不增加 Rapier 刚体/碰撞体，不改变赛道路面、检查点、计时、领奖台、排行榜或玩法；
- 如果站内实景发现某处与路缘重叠，只需调整该组视觉子节点坐标，不需要碰 CircuitArea 逻辑。

## 4. 可重复生成

```bash
BLENDER=tools/blender/Blender.app/Contents/MacOS/Blender

"$BLENDER" --background --python scripts/blender-export-han-han-statue.py
"$BLENDER" --background --python scripts/blender-export-han-han-vehicle.py
"$BLENDER" --background --python scripts/blender-export-han-han-letters.py
"$BLENDER" --background --python scripts/blender-export-han-han-circuit-markers.py

node scripts/validate-han-han-3d.mjs
node scripts/validate-vehicle-model.mjs static/vehicle/han-han.glb
```

四个生成脚本从空场景或既有车辆母版开始，保存 Blender 源、导出 GLB 并生成预览。重新运行不会依赖个人目录中的外部模型或图片。

## 5. 最小集成说明

当前主工程资源注册已使用以下键值，资产本身不要求修改运行时合同：

- `vehicle` → `vehicle/han-han.glb`
- `hanHanLettersModel` → `areas/han-han-letters.glb`
- `landingKnightStatueModel` → `areas/landing-han-han-statue.glb`
- `hanHanCircuitMarkersModel` → `areas/han-han-circuit-markers.glb`

注意：若把旧 `validate-landing-customizations.mjs` 的目标切到 Draco 压缩雕像，需同步注册 Draco 解码器；也可以让原校验保留旧 Wen13 回退资产，并把韩寒版本交给本次新增的 `validate-han-han-3d.mjs`。

## 6. 视觉验收结论

- 雕像：固定相机预览中正面三分之四成立；头盔、纸页、红色校对线均可识别；无肖像五官或品牌；
- 车辆：纸白主体、墨黑底盘和信号红轮毂/走线在暗背景下层次清楚；预览轮胎使用运行时近似位置，悬挂仍保留在 GLB 中；
- 字牌：块状 H/A/N 在固定斜俯视方向可直接读作 HANHAN，信号红只落在第一个 N；
- 赛道：标识本身是低矮、无碰撞的轻量几何，最终遮挡与路缘关系仍应由主线程在浏览器实景中复核。

## 7. 回退

这组资产没有覆盖以下旧文件：

- `static/areas/landing-knight-statue.glb`
- `static/areas/wen13-letters.glb`
- `static/vehicle/default.glb`

因此回退只需将资源注册键切回上述旧路径，并停止添加 `hanHanCircuitMarkersModel.scene`；不需要恢复车辆物理、地图或 Area 代码。

## 8. 运行时资产校验和

| 文件 | SHA-256 |
|---|---|
| `static/areas/landing-han-han-statue.glb` | `32ff0389d73b66a16ea7b3a47fe8c8d61023d7bde02b1cec0d27feee2f8b4f77` |
| `static/areas/han-han-letters.glb` | `5a09cb8ea5caa60eba816c0bd0841b5b389511828b1a266711fbc48e32460645` |
| `static/areas/han-han-circuit-markers.glb` | `eb71a858e3a51aee98167cb1324101db67ee9a5cf938a4752dc3b316f8571732` |
| `static/vehicle/han-han.glb` | `35caa9e623ffdcd122b41958e288a4c52081b0b5ee74446bb84f9cc0b4a54366` |
