# Phase 2 — 游戏引擎核心

> 状态：⬜ 未开始 · 对应里程碑：M2（引擎全量可用）
> 本阶段**完全不碰 RN**，所有代码在 `src/engine/` 纯 TS 环境中开发并用 Jest 验证。

---

## 1. 阶段目标

实现完整可单测的游戏引擎：7-bag 生成、SRS 旋转、碰撞检测、消行计分、等级曲线、游戏循环状态机。结束时可在 Node 环境用脚本「自动模拟一局」验证引擎正确性。

## 2. 前置条件

- [ ] M1 已通过（项目骨架 + Jest 可运行）
- [ ] 已通读 PROJECT.md §4.2 核心逻辑要点

## 3. 任务拆解

| # | 任务 | 复杂度 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | types.ts + constants.ts：类型定义、形状表、踢墙表、计分表 | 低 | - | ⬜ |
| 2 | bag.ts：7-bag 随机生成 + peek 预览 | 低 | 1 | ⬜ |
| 3 | collision.ts：碰撞检测唯一闸门 | 中 | 1 | ⬜ |
| 4 | rotation.ts：矩阵旋转 + SRS 踢墙尝试 | 高 | 3 | ⬜ |
| 5 | board.ts：锁定、消行、行下移 | 中 | 3 | ⬜ |
| 6 | scoring.ts：计分与等级/速度曲线 | 低 | 1 | ⬜ |
| 7 | GameEngine.ts：状态机 + 命令处理 + tick 循环 | 高 | 2-6 | ⬜ |
| 8 | 全量单测（7 个模块各一组用例） | 高 | 1-7 | ⬜ |
| 9 | Node 模拟一局冒烟脚本 | 中 | 7 | ⬜ |

## 4. 实现步骤

### 步骤 1：types.ts + constants.ts（地基）

```ts
// types.ts 核心类型
export type PieceType = 'I'|'O'|'T'|'S'|'Z'|'J'|'L';
export type Cell = PieceType | 0;            // 0 = 空
export type Board = Cell[][];                // 20×10
export interface Piece { type: PieceType; matrix: number[][]; x: number; y: number; rot: 0|1|2|3 }
export type Command = 'left'|'right'|'rotate'|'softDrop'|'hardDrop'|'hold'(v1 不实现 hold);
export type Phase = 'ready'|'playing'|'paused'|'over';
```

constants.ts 内容：`COLS=10, ROWS=20`、7 种形状矩阵（I 4×4、O 2×2 嵌 4×4、其余 3×3）、SRS 踢墙表（JLSTZ 一张 + I 一张，**直接抄标准表，不凭记忆写**）、`LINE_SCORE=[0,100,300,500,800]`。

> 踢墙表数据来源：SRS 官方文档。注意偏移坐标系约定（本引擎统一用 [dx, dy]，y 向下为正），抄表后必须用「贴墙旋转」单测验证方向没搞反。

### 步骤 2：bag.ts — 7-bag

```ts
export class SevenBag {
  next(): PieceType;      // 袋空则重洗（Fisher-Yates）
  peek(n: number): PieceType[];  // 维持预览队列 ≥ n
}
```

单测关键用例：连续 14 次 next()，前 7 个与后 7 个各自都恰好包含全部 7 种。

### 步骤 3：collision.ts — 唯一闸门

```ts
export function collides(board: Board, piece: Piece): boolean;
```

遍历 piece.matrix 的非零格，检查：`bx<0 || bx>=COLS || by>=ROWS` 越界；`by>=0 && board[by][bx]!==0` 堆叠。**上方（by<0）允许溢出**——这是生成区逻辑的关键。

单测用例：左墙/右墙/地板越界各一、落在堆上、生成区上方溢出不判碰。

### 步骤 4：rotation.ts — SRS

```ts
export function rotateCW(m: number[][]): number[][];  // newGrid[y][x] = old[N-1-x][y]
export function tryRotate(board: Board, piece: Piece): Piece | null;
```

tryRotate 流程：算旋转后矩阵 → 查踢墙表 `${piece.rot}>${nextRot}` → 逐个偏移试探 collides → 第一个合法的返回；全失败返回 null。

单测：空场旋转任意块成功；I 块贴左墙旋转成功（验证 I 专用表）；O 块旋转等于不转；构造贴堆场景验证踢墙偏移生效。

### 步骤 5：board.ts — 锁定与消行

```ts
export function lockPiece(board: Board, piece: Piece): Board;   // 不可变：返回新棋盘
export function clearLines(board: Board): { board: Board; clearedRows: number[] };
```

消行用 filter + 顶部补空行。`clearedRows`（被消的原始行号）保留在返回值中，供渲染层做闪烁动画。

单测：0/1/2/3/4 行消除各一例；消行后上方行整体下移正确；跨行消除（1、3 行同时满）。

### 步骤 6：scoring.ts — 计分与等级

```ts
export function lineScore(cleared: number, level: number): number;  // LINE_SCORE[cleared] * level
export function dropInterval(level: number): number;  // Math.max(60, 1000 - (level-1)*80)
export function nextLevel(lines: number): number;     // Math.floor(lines / 10) + 1
```

### 步骤 7：GameEngine.ts — 状态机主体

```ts
export class GameEngine {
  phase: Phase;
  board: Board; current: Piece; nextQueue: PieceType[];
  score: number; level: number; lines: number;

  dispatch(cmd: Command): void;   // 处理输入命令（可随时调用）
  update(dt: number): EngineEvent[];  // 推进时间，返回本帧事件（locked/cleared/levelUp/over）
  getSnapshot(): Snapshot;        // 生成给 store 的快照
}
```

关键设计：
- **update(dt) 不感知 rAF**——引擎只接收时间增量，循环由外层（Phase 3 的 hook）驱动。这是引擎保持纯 TS 的前提。
- 内部累计 `dropCounter += dt`（dt 由外层钳制后传入），超 `dropInterval(level)` 触发下落。
- 下落碰撞 → lockPiece → clearLines → 计分 → 从 bag 取新块；新块生成即碰撞 → phase='over'。
- **事件数组返回**：渲染层靠事件触发动画/音效（v2），而非轮询 diff。

单测：dispatch 各命令效果；update 连续推进 500 帧自然下落并锁定；软降加分；硬降 +2/格；升级时 interval 变小；堆满触发 over。

### 步骤 8：全量单测

每个模块一个测试文件，放在 `__tests__/engine/`。跑 `npm test` 全绿。

### 步骤 9：Node 冒烟脚本

`scripts/simulate.ts`：创建引擎，随机派发 500 个命令 + 模拟 10 分钟 tick，断言引擎不崩溃、状态自洽（棋盘无负坐标方块、分数单调不减）。跑通即 M2 达成。

## 5. 注意事项（坑位预警）

- **踢墙表坐标系**：SRS 标准表 y 向上为正，本引擎 y 向下为正，抄表时 dy 取反——此处错误率最高，务必靠贴墙单测兜底。
- **I 块与 JLSTZ 踢墙表不同**，O 块旋转应为恒等。
- **不可变性**：引擎返回新棋盘/新 Piece 而非原地修改——Zustand 引用比较依赖这一点，否则 Phase 3 会莫名不刷新。
- **生成区**：棋盘上方预留 2~4 行隐形生成区（可让 Board 类型实际为 (ROWS+BUFFER)×COLS，渲染时只画下方 ROWS）。
- 所有随机数入口收敛到 bag.ts（便于未来注入种子做可复现测试）。

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

## 9. 阶段验收（对应 M2 检查清单）

- [ ] 逐项核对 MILESTONES.md 中 M2 的全部验收标准
- [ ] 已更新 PROJECT.md §6 阶段状态
- [ ] 已更新 MILESTONES.md 完成情况
- [ ] 已 git commit（文档 + 代码）
