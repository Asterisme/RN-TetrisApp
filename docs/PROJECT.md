# 俄罗斯方块 APP — 项目主文档

> 项目代号：`tetris-app` · 技术栈：React Native (Expo) + TypeScript
> 本文档是项目的单一事实来源（SSOT），随开发进度同步更新。

---

## 1. 项目概述与目标

**一句话描述**：用 React Native (Expo) 开发的跨平台（iOS / Android）俄罗斯方块单机游戏。

| 维度 | 内容 |
|---|---|
| 核心目标 | 一套 TypeScript 代码同时产出 iOS / Android 双端可玩的俄罗斯方块 |
| 架构目标 | 游戏引擎与 UI 完全分离：引擎为纯 TS（零 RN 依赖），可单测、可复用至 Web |
| 质量目标 | 引擎层单测覆盖率 ≥ 90%；双端真机 60fps 无可感知掉帧 |
| 交付目标 | 5 个阶段推进，每阶段以里程碑检查清单验收（见 [MILESTONES.md](./MILESTONES.md)） |

**非目标（v1 明确不做）**：音效/震动、Hold 暂存、在线排行榜、多主题皮肤、多人对战。
> 非目标是范围防线：开发过程中任何"顺手加上"的诱惑，先记录到阶段文档的"遗留想法"区，不进当前版本。

---

## 2. 技术决策记录（ADR 摘要）

| # | 决策点 | 结论 | 理由 | 日期 |
|---|---|---|---|---|
| 1 | 开发框架 | **Expo（SDK 50+）+ expo-dev-client** | 无原生模块需求，一套配置覆盖双端，调试效率最高 | 2026-09-23 |
| 2 | 项目路径 | `/Users/huanghua/Projects/tetris-app` | 用户指定 | 2026-09-23 |
| 3 | v1 功能范围 | **标准单机版** | 核心玩法 + 暂停/恢复 + 本地最高分 + 基础设置，聚焦跑通架构 | 2026-09-23 |
| 4 | 引擎与 UI 分离 | 纯 TS 引擎目录，零 RN 依赖 | 可 Jest 直接单测（不需要模拟器），可复用到 Web 版 | 2026-09-23 |
| 5 | 游戏循环驱动 | rAF + 固定时间步长 + dt 钳制 | 规避 setInterval 在双端后台挂起的漂移问题 | 2026-09-23 |
| 6 | 状态管理 | Zustand（精确订阅 + transient updates） | 60fps 高频更新下避免 React 全量重渲染 | 2026-09-23 |
| 7 | 棋盘渲染 | 首版 View 矩阵（200 个绝对定位 View） | 新架构 Fabric 可扛；性能不足时仅迁移 Board 组件到 Skia | 2026-09-23 |
| 8 | 随机算法 | 7-bag | 业内标准，杜绝"干旱"体验 | 2026-09-23 |
| 9 | 旋转系统 | SRS（Super Rotation System）标准踢墙表 | 手感与主流实现一致，I 块独立踢墙表 | 2026-09-23 |

---

## 3. 功能需求清单

优先级：P0 = 必须交付；P1 = 应该交付；P2 = 可延后。

### 3.1 核心玩法

| 编号 | 需求 | 优先级 | 验收要点 |
|---|---|---|---|
| F-01 | 7-bag 随机生成方块，Next 预览 ≥ 3 个 | P0 | 任意连续 7 块包含全部 7 种 |
| F-02 | 方块移动（左/右）、旋转（SRS 踢墙）、软降、硬降 | P0 | 贴墙/贴堆旋转按踢墙表生效 |
| F-03 | 幽灵方块（落点预览，可在设置中关闭） | P1 | 与硬降落点一致 |
| F-04 | 碰撞检测：越界、堆叠判定 | P0 | 生成区允许上方溢出 |
| F-05 | 消行：单/双/三/四行消除 | P0 | 消行后上方整体下移 |
| F-06 | 计分：100/300/500/800 × 等级；软降 +1/格；硬降 +2/格 | P0 | 有单测覆盖 |
| F-07 | 等级系统：每消 10 行升 1 级，下落间隔递减（下限 60ms） | P0 | 有单测覆盖 |
| F-08 | 游戏结束判定：新方块生成即碰撞 | P0 | 触发 Game Over 界面 |

### 3.2 会话与数据

| 编号 | 需求 | 优先级 | 验收要点 |
|---|---|---|---|
| F-09 | 开始 / 暂停 / 恢复 / 重新开始 | P0 | 暂停时游戏循环停止但状态完整 |
| F-10 | App 进后台自动暂停，回前台保持暂停待用户恢复 | P0 | AppState 监听 background 事件 |
| F-11 | 本地最高分持久化（AsyncStorage） | P0 | 杀进程后仍保留 |
| F-12 | Android 返回键 → 暂停弹窗（而非退出） | P0 | BackHandler 接管 |

### 3.3 交互与界面

| 编号 | 需求 | 优先级 | 验收要点 |
|---|---|---|---|
| F-13 | 手势：左右滑移动、下滑软降、快速下滑硬降、点击旋转 | P0 | 设 moveThreshold 防误触，双端行为一致 |
| F-14 | HUD：分数 / 等级 / 行数 / 最高分 | P0 | 数字变化不引起棋盘重渲染 |
| F-15 | 设置页：幽灵方块开关、手势灵敏度档位 | P1 | 设置持久化 |
| F-16 | SafeArea 适配（刘海/挖孔/手势条） | P0 | 双端真机无遮挡 |
| F-17 | 消行闪烁动画（~200ms，渲染层实现） | P1 | 引擎瞬间消行，动画只在渲染层 |

---

## 4. 技术方案

### 4.1 架构分层（三层 + 单向数据流）

```
渲染层 (RN 组件)  ──用户输入→ 命令队列 ──→ 游戏引擎 (纯 TS)
      ↑                                          │
      └──────── 快照订阅 ←── Zustand Store ←── 快照推送
```

- **渲染层**：Board（View 矩阵）、NextPanel、HUD、TouchLayer（手势）。只消费快照，不含游戏逻辑。
- **状态桥（Zustand Store）**：持有游戏快照 + 输入命令队列。引擎每帧拉取命令、推送新快照。
- **游戏引擎**：7-bag 生成、SRS 旋转、碰撞检测、消行计分、游戏循环（rAF + 固定步长 + dt 钳制 `Math.min(dt, 100)`）。零 RN 依赖，Jest 直接测。

### 4.2 核心逻辑要点

| 模块 | 关键实现 |
|---|---|
| 方块表示 | 坐标矩阵（I 用 4×4，其余 3×3），元素 0/1 |
| 7-bag | 袋内抽完才补新洗牌袋（Fisher-Yates），peek(n) 维持预览队列 |
| SRS 旋转 | `newGrid[y][x] = old[N-1-x][y]` + 踢墙偏移表（JLSTZ 通用 / I 独立），第一个合法偏移即生效 |
| 碰撞检测 | 唯一闸门函数 `collides()`：所有操作先施加到临时副本 → 判定 → 合法提交/非法回滚 |
| 消行 | `filter` 掉满行 + 顶部补空行；引擎瞬间完成，动画由渲染层播放 |
| 游戏循环 | `dropCounter += dt`，超过 `interval` 则尝试下落；碰撞则锁定→消行→计分→生成新块 |

### 4.3 状态管理（Zustand）

- 精确订阅：`useGameStore(s => s.score)` —— 字段不变不重渲染。
- 棋盘用引用相等 + `shallow` 比较跳过无变化渲染。
- 高频插值动画走 transient updates（直接 setValue，绕过 React）。

### 4.4 双端关键技术点

| 技术点 | 方案 | 坑 |
|---|---|---|
| 手势 | react-native-gesture-handler | 设 moveThreshold 防误触；裸 PanResponder 双端行为不一致 |
| 定时 | rAF（禁用 setInterval） | 后台恢复 dt 钳制 `Math.min(dt, 100)` |
| 后台切换 | AppState 监听 | background → 暂停 + 落盘 |
| 返回键 | BackHandler（Android） | 接管为暂停弹窗 |
| 持久化 | AsyncStorage | 仅存最高分与设置，游戏现场不持久化（v1） |
| SafeArea | react-native-safe-area-context | 棋盘居中布局必须包裹 |

---

## 5. 项目目录结构

```
tetris-app/
├── docs/                        # 项目文档（本体系）
│   ├── PROJECT.md               # 主文档（本文件）
│   ├── MILESTONES.md            # 里程碑检查清单
│   ├── GIT.md                   # Git 协作规范与操作手册
│   ├── phases/                  # 各阶段开发文档
│   │   ├── phase-1-项目启动与环境搭建.md
│   │   ├── phase-2-游戏引擎核心.md
│   │   ├── phase-3-状态桥与渲染壳.md
│   │   ├── phase-4-手势交互与完整闭环.md
│   │   └── phase-5-打磨与发布.md
│   └── templates/
│       └── phase-template.md    # 阶段文档模板
├── src/
│   ├── engine/                  # 纯 TS 游戏引擎（零 RN 依赖）
│   │   ├── constants.ts         # 棋盘尺寸、形状表、踢墙表、计分表
│   │   ├── bag.ts               # 7-bag 随机生成
│   │   ├── rotation.ts          # SRS 旋转 + 踢墙
│   │   ├── collision.ts         # 碰撞检测
│   │   ├── board.ts             # 棋盘操作：锁定/消行
│   │   ├── scoring.ts           # 计分与等级
│   │   ├── GameEngine.ts        # 引擎主体：状态机 + 命令处理
│   │   └── types.ts             # 引擎类型定义
│   ├── store/
│   │   └── gameStore.ts         # Zustand store
│   ├── components/              # Board / NextPanel / HUD / TouchLayer / GhostView
│   ├── hooks/                   # useGameEngine / useAppState / useBackHandler
│   ├── screens/                 # GameScreen / MenuScreen / SettingsScreen
│   └── utils/                   # storage.ts（AsyncStorage 封装）等
├── __tests__/engine/            # 引擎单测（Node 环境直接跑）
├── App.tsx                      # 导航入口
├── app.json                     # Expo 配置
└── package.json
```

---

## 6. 开发阶段划分

| 阶段 | 名称 | 核心产出 | 里程碑 | 状态 |
|---|---|---|---|---|
| Phase 1 | [项目启动与环境搭建](./phases/phase-1-项目启动与环境搭建.md) | Expo 骨架 + Jest 环境 + 目录结构 | M1 | ✅ 已完成 2026-09-23 |
| Phase 2 | [游戏引擎核心](./phases/phase-2-游戏引擎核心.md) | 纯 TS 引擎全量实现 + 单测 | M2 | ✅ 已完成 2026-09-24 |
| Phase 3 | [状态桥与渲染壳](./phases/phase-3-状态桥与渲染壳.md) | Zustand + Board 渲染 + 临时按钮操控 | M3 | 未开始 |
| Phase 4 | [手势交互与完整闭环](./phases/phase-4-手势交互与完整闭环.md) | 手势 + 暂停/恢复 + 最高分 + 双端适配 | M4 | 未开始 |
| Phase 5 | [打磨与发布](./phases/phase-5-打磨与发布.md) | 动效 + 性能验证 + EAS Build 双端产物 | M5 | 未开始 |

各阶段详细任务列表见对应阶段文档（`docs/phases/`）。

---

## 7. 文档管理机制

**规则**（开发与文档同步的强制约定）：

1. **阶段开始时**：打开对应阶段文档，通读「目标与任务拆解」，确认无异议后开工。
2. **任务完成时**：立即在阶段文档「已完成任务」表打勾并填写完成日期。
3. **遇到问题时**：先记入「问题与解决方案」表（症状 → 根因 → 解法），再动手修。
4. **阶段结束时**：
   - 填写阶段文档底部「阶段验收」检查清单；
   - 更新本文件 §6 的阶段状态；
   - 更新 [MILESTONES.md](./MILESTONES.md) 对应里程碑的完成情况与日期；
   - git commit（文档与代码同一次提交）。
5. **新增阶段或重大变更**：从 `templates/phase-template.md` 复制新文档，并在本文件 §6 登记。

**当前状态速览**：Phase 2 已完成（M2 通过，2026-09-24）· 下一阶段 Phase 3 · 最近更新 2026-09-24

---

## 8. 环境与运行

- 初始化：`npx create-expo-app@latest tetris-app --template blank-typescript`（Expo ~57.0.24 / RN 0.86.3 / TS 6.0）
- 启动开发：`CI=1 npx expo start`（Expo 57 已移除 `--no-open`；CI=1 模式不自动打开）
- 类型检查：`npm run typecheck`
- 运行测试：`npm test`（ts-jest + node 环境，`@engine/*` 别名已同时配置于 jest.config.js 与 tsconfig paths）
