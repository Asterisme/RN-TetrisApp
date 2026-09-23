# Phase 4 — 手势交互与完整闭环

> 状态：⬜ 未开始 · 对应里程碑：M4（双端真机完整闭环）

---

## 1. 阶段目标

替换临时按钮为手势操控，补齐产品闭环：暂停/恢复、后台自动暂停、Android 返回键、最高分持久化、设置页、SafeArea 适配。结束时双端真机形成完整可玩的 v1 产品。

## 2. 前置条件

- [ ] M3 已通过（模拟器可完整玩一局）
- [ ] 双端至少各有一台测试设备（真机优先，模拟器可接受）

## 3. 任务拆解

| # | 任务 | 复杂度 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | TouchLayer 手势：左右滑/下滑/快滑/点击识别 | 高 | M3 | ⬜ |
| 2 | 移动手势量化：滑距→格数移动 + 灵敏度档位 | 中 | 1 | ⬜ |
| 3 | 暂停/恢复：暂停按钮 + 暂停遮罩层 | 低 | M3 | ⬜ |
| 4 | useAppState：后台自动暂停 | 中 | 3 | ⬜ |
| 5 | useBackHandler：Android 返回键 → 暂停确认 | 低 | 3 | ⬜ |
| 6 | storage.ts：AsyncStorage 封装 + 最高分读写 | 低 | - | ⬜ |
| 7 | SettingsScreen：幽灵方块开关 + 灵敏度 | 中 | 2,6 | ⬜ |
| 8 | SafeArea 布局适配双端 | 低 | M3 | ⬜ |
| 9 | 双端真机回归测试 | 中 | 全部 | ⬜ |

## 4. 实现步骤

### 步骤 1-2：手势识别（本阶段核心难点）

用 react-native-gesture-handler 的 `Pan` + `Tap` 组合：

- **Tap**（单击）→ 旋转
- **Pan 垂直向下慢滑** → 软降（按位移逐格触发）
- **Pan 垂直向下高速**（速度阈值，如 `velocityY > 1500`）→ 硬降
- **Pan 水平** → 移动，按 `横向累计位移 / CELL` 换算格数（一次滑 3 格就移 3 格，而非只移 1 格）

实现要点：
- 用 `Gesture.Pan().runOnJS(true)` 简化（v1 手势频率低，JS 线程足够），避免一上来就上 worklet 增加调试复杂度。
- **手势状态机**：`began → 移动累计 → ended 判定滑动意图`；单次手势内水平位移超过阈值（如 CELL×0.9）就触发一格移动并重置累计，实现连续拖动多格。
- 灵敏度档位映射到「触发阈值」和「硬降速度阈值」两个参数。

> 坑：不要用裸 `onTouchMove` 拼手势——双端事件节流行为不一致，gesture-handler 是唯一可靠层。

### 步骤 3：暂停/恢复

- 暂停按钮（顶部）→ `phase='paused'` + 半透明遮罩层（不卸载 Board）。
- 恢复加 3-2-1 倒计时（可选，P2）或直接恢复。

### 步骤 4：useAppState

```ts
AppState.addEventListener('change', (s) => {
  if (s !== 'active' && phase === 'playing') pause();
});
```

回前台**保持暂停**，由用户手动恢复——防止口袋里误触。

### 步骤 5：useBackHandler

Android `BackHandler.addEventListener('hardwareBackPress', ...)`：playing 时返回键 → 暂停弹窗；paused 时 → 再按才退出（或回菜单）。iOS 无返回键，靠界面按钮兜底。

### 步骤 6：storage.ts

封装 `getHighScore() / setHighScore(n)`，Game Over 时比较落盘。写入走 `await`，失败静默降级（存不了只影响最高分显示，不阻塞游戏）。

### 步骤 7：SettingsScreen

两个设置项：幽灵方块开关、手势灵敏度（低/中/高）。持久化到 AsyncStorage，GameScreen 读取生效。简单用 React state + 本地组件实现，**v1 不引导航库**——用条件渲染切换 Menu/Game/Settings 三个屏即可（少一个依赖少一分风险）。

### 步骤 8-9：SafeArea + 双端回归

- `SafeAreaProvider/SafeAreaView` 包裹根容器。
- 按平台各跑一遍 M4 清单（手势全套 / 暂停恢复 / 后台切换 / 返回键 / 杀进程最高分）。

## 5. 注意事项（坑位预警）

- **手势冲突**：TouchLayer 只包裹 Board 区域，不要包全屏——否则点暂停按钮也触发旋转。
- **Android 手势区背景色**：透明 View 在部分安卓机上不响应触摸，手势区设 `backgroundColor: 'transparent'` 的同时确保父容器有背景。
- **AppState 时机**：`change` 事件在 iOS 切换瞬时触发，但 Android 有 ~1s 延迟——正常现象，不要为此打补丁。
- **AsyncStorage 容量**：只存最高分 + 2 个设置项，**不要把整个棋盘序列化存盘**（v1 明确游戏现场不持久化）。
- 双端差异问题第一时间记入「问题与解决方案」表，标注平台。

## 6. 已完成任务记录

| # | 任务 | 完成日期 | 验证方式 | 备注 |
|---|---|---|---|---|
| | | | | |

## 7. 问题与解决方案记录

| 日期 | 问题症状 | 根因 | 解决方案 | 状态 |
|---|---|---|---|---|
| | | | | |

## 8. 遗留想法（不进当前版本）

-

## 9. 阶段验收（对应 M4 检查清单）

- [ ] 逐项核对 MILESTONES.md 中 M4 的全部验收标准
- [ ] 已更新 PROJECT.md §6 阶段状态
- [ ] 已更新 MILESTONES.md 完成情况
- [ ] 已 git commit（文档 + 代码）
