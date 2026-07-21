# Wen13 车辆视觉模型替换契约

结论：可以替换，而且不必改变当前驾驶路线、键位、碰撞、悬挂和加速逻辑。项目把车辆拆成两层：

- `PhysicsVehicle.js` 管 Rapier 刚体、四轮位置、转向、刹车、加速、Boost 和翻车恢复。
- `VisualVehicle.js` 只读取上述状态，把视觉底盘和四个轮子同步到物理结果。

因此，换车的关键不是重写驾驶系统，而是让新模型满足视觉节点契约。

## 必需节点

| 节点前缀 | 用途 | 约束 |
| --- | --- | --- |
| `chassis` | 整车视觉根节点 | 必须存在；前进方向为本地 `+X`，上方为 `+Y` |
| `bodyPainted` | 可换色车身 | 必须存在；用于红、橙、白、黑、火焰等奖励涂装 |
| `wheelContainer` | 单轮模板 | 必须存在；运行时克隆成四份 |
| `wheelCylinder` | 实际旋转的车轮 | 必须在 `wheelContainer` 的后代中 |

`wheelSuspension` 和 `wheelPainted` 建议保留，前者产生悬挂拉伸，后者跟随车身换色；缺少时驾驶仍可运行，但会减少视觉反馈。

## 可选功能组

- `blinkerLeft` 与 `blinkerRight` 必须成对出现。
- `stopLights`、`backLights` 可分别提供刹车灯与倒车灯。
- 若提供 `energy`，必须同时提供 `cell1`、`cell2`、`cell3`。
- 若提供 `antenna`，还要提供 `antennaHead` 和 `antennaHeadReference`。

## 当前物理尺寸基准

- 主碰撞盒半尺寸：`1.3 × 0.4 × 0.85`。
- 轮位：`X = ±0.90`、`Z = ±0.75`。
- 轮半径：`0.40`。
- 当前视觉模型包围盒约为 `2.99 × 2.48 × 1.91`（X 长、Y 高、Z 宽）。

直接换成明显更长、更宽或轮距差异很大的模型时，视觉仍会行驶，但轮胎和碰撞可能错位。此时应只调整视觉归一化，或有意识地同步物理尺寸；不要把物理改动混进纯“换皮”版本。

## 三种替换方式

1. **纯换皮**：保留现有 GLB 层级，只换 `bodyPainted` 的网格、颜色或贴图。风险最低。
2. **整车换模**：在 Blender 中把开源/自制车缩放到当前坐标、轮距和朝向，再补齐上述命名节点。
3. **适配器方式**：保留当前 `chassis` 与轮子锚点，把任意新车身作为其子物件。这最适合结构不规则的第三方模型。

## 验收命令

```bash
npm run validate:vehicle
node scripts/validate-vehicle-model.mjs /path/to/new-vehicle.glb
```

随后至少验证：前后左右、刹车灯、倒车灯、Boost、四轮转动、悬挂、碰撞、翻车恢复、昼夜材质和手机触控。只有这些全部通过，才把 `Game.js` 的 `vehicle` 资源切到新模型。
