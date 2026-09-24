# Phase 3 — 状态桥与渲染壳

> 状态：🔄 代码侧完成（2026-09-24），待用户在模拟器/Expo Go 中视觉验收 · 对应里程碑：M3（模拟器可玩）

---

## 1. 阶段目标

打通「引擎 → Zustand → React 组件」数据链路，用**临时按钮**操控（手势留到 Phase 4），在模拟器中完整玩一局。渲染层本阶段只求正确、不求美观。

## 2. 前置条件

- [ ] M2 已通过（引擎全量单测绿）
- [ ] 已通读 PROJECT.md §4.3 状态管理方案

## 3. 任务拆解

| # | 任务 | 复杂度 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | gameStore.ts：快照 state + 命令队列 | 中 | M2 | ⬜ |
| 2 | useGameEngine hook：rAF 循环 + 引擎接线 | 高 | 1 | ⬜ |
| 3 | Board 组件：View 矩阵渲染棋盘 + 当前方块 | 中 | 1 | ⬜ |
| 4 | GhostView：幽灵方块落点计算与渲染 | 低 | 3 | ⬜ |
| 5 | NextPanel：预览队列渲染 | 低 | 1 | ⬜ |
| 6 | HUD：分数/等级/行数/最高分 | 低 | 1 | ⬜ |
| 7 | GameScreen 组装 + 临时按钮组 | 中 | 2-6 | ⬜ |
| 8 | Game Over 弹层 + 重新开始 | 低 | 7 | ⬜ |
| 9 | 模拟器完整一局冒烟 | 低 | 8 | ⬜ |

## 4. 实现步骤

### 步骤 1：gameStore.ts

```ts
interface GameStore extends Snapshot {
  phase: Phase;
  highScore: number;
  dispatch: (cmd: Command) => void;   // 入命令队列
}
```

要点：store 只存**快照数据 + 命令入队方法**，不存引擎实例（引擎实例放在 hook 的 ref 中，避免被 React 状态系统序列化）。

### 步骤 2：useGameEngine hook（本阶段核心）

```ts
function useGameEngine() {
  const engineRef = useRef<GameEngine>();
  useEffect(() => {
    let raf: number, last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(t - last, 100);  // 钳制：后台恢复时防跳帧
      last = t;
      const events = engineRef.current.update(dt);
      // 事件处理：over → 停循环 & 落最高分；cleared → 渲染层动画标记
      // 快照推送：board/引用变化才 set
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
}
```

要点：
- **dt 钳制 100ms 是铁律**（App 后台恢复时 rAF 会补一个巨大的 dt）。
- 快照推送用引用比较：`if (snap.board !== prevBoard) set(...)`，防止每帧全量 setState。
- 暂停实现：不 cancel rAF，而是 phase 检查——`if (phase !== 'playing') return`（rAF 继续跑但引擎不推进），恢复零延迟且无状态丢失。

### 步骤 3：Board 组件（View 矩阵）

- 外层容器绝对定位，`width = COLS * CELL, height = ROWS * CELL`；CELL 由屏幕宽度动态计算。
- **两个渲染层**：底层 200 个格子（已锁定 + 空格，用 `board` 快照），上层当前方块 4×4 格（跟随 current 快照）。
- 200 个 View 不用 memo 也能扛（Fabric），但格子组件包 `React.memo` + 传值 `filled: boolean, color: string` 是低成本保险。

### 步骤 4：GhostView

复用引擎 `collides`：从当前方块位置循环下移到触底，得到 ghostY，用半透明色渲染（引擎可提供 `getGhostPosition()` 方法，渲染层不做游戏计算）。

### 步骤 5-6：NextPanel / HUD

- NextPanel：读 `nextQueue` 快照，4×4 缩略渲染 3 个。
- HUD：**精确订阅**——`useGameStore(s => s.score)` 各字段独立订阅，数字变化不触发 Board 重渲染。

### 步骤 7-8：GameScreen 组装

布局：左中右三列（左 HUD 信息 / 中 Board / 右 NextPanel），底部临时按钮组（◀ ▶ ⟳ ▼ ⤓）。Game Over 用 Modal 弹层显示分数 + 「再来一局」。

### 步骤 9：冒烟

模拟器完整玩一局，验证 M3 全部标准。

## 5. 注意事项（坑位预警）

- **不要把引擎实例放 store**：Zustand 每次 set 都会浅拷贝，引擎实例被反复克隆会丢失内部状态。
- **rAF 循环只起一个**：hook 重复挂载（StrictMode 双执行 / 热重载）会起双循环，双倍速度——用 cleanup 兜底 + 引用守卫。
- **快照推送频率**：仅 board/score/phase 等变化才推；方块平滑移动这种逐像素效果 v1 不做（逐格跳变即可），避免过度设计。
- **CELL 尺寸计算**：用 `useWindowDimensions` 而非固定值，双端屏幕宽度差异大。
- 临时按钮的 `onPressIn` + 长按连发（DAS 雏形）可留到 Phase 4 手势统一处理，本阶段单击即可。

## 6. 已完成任务记录

| # | 任务 | 完成日期 | 验证方式 | 备注 |
|---|---|---|---|---|
| 1 | gameStore.ts + 引擎单例 | 2026-09-24 | typecheck | store 只存快照 + ghostY + highScore；引擎单例在 src/store/engine.ts（store 外） |
| 2 | useGameEngine hook | 2026-09-24 | typecheck + bundle 编译 | rAF 循环 + dt 钳制 100ms + 脏检查跳过无变化帧（引用比较） |
| 3 | Board 组件（View 矩阵） | 2026-09-24 | bundle 编译 | 可见区棋盘 + 当前方块 + 幽灵三层叠加；cell 尺寸随屏幕自适应 |
| 4 | GhostView（并入 Board） | 2026-09-24 | bundle 编译 | 幽灵以 30% 透明度渲染，与实体块重叠格自动去重 |
| 5 | NextPanel | 2026-09-24 | bundle 编译 | 用 SHAPES 渲染缩略 3 个预览 |
| 6 | HUD | 2026-09-24 | bundle 编译 | 字段级精确订阅（s => s.score 等）；BEST 暂取 max(highScore, score) |
| 7 | GameScreen 组装 + 临时按钮 | 2026-09-24 | bundle 编译 | ready/playing/paused/over 四态条件渲染；不引入导航库 |
| 8 | Game Over 弹层 + 再来一局 | 2026-09-24 | bundle 编译 | RN Modal + restart（reset+start） |
| 9 | 模拟器完整一局冒烟 | - | **待用户执行** | 见下「验收指引」 |

**验收指引（用户执行）**：项目目录运行 `npx expo start`，模拟器按 `i`（或手机 Expo Go 扫码）→ 点「开始游戏」→ 用底部按钮（◀ ▼ ▶ ⟳ ⤓ + ❚❚）完整玩一局至 Game Over → 点「再来一局」。异常现象记入本文件 §7。

## 7. 问题与解决方案记录

| 日期 | 问题症状 | 根因 | 解决方案 | 状态 |
|---|---|---|---|---|
| 2026-09-24 | typecheck 报 `absoluteFillObject` 不存在 | RN 0.86 移除了该属性（仅剩 absoluteFill 注册样式，不可 spread） | 手写 position/top/left/right/bottom 四属性 | ✅ 已解决 |

## 8. 遗留想法（不进当前版本）

-

## 9. 阶段验收（对应 M3 检查清单）

- [ ] 逐项核对 MILESTONES.md 中 M3 的全部验收标准
- [ ] 已更新 PROJECT.md §6 阶段状态
- [ ] 已更新 MILESTONES.md 完成情况
- [ ] 已 git commit（文档 + 代码）
