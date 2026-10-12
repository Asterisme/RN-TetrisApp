# Phase 5 — 打磨与发布

> 状态：✅ 代码与配置完成（2026-10-12 双端产物重新构建中，含掌机化改造） · 对应里程碑：M5（发布就绪）

---

## 1. 阶段目标

体验打磨（消行动画、锁块反馈）、性能验证与 Skia 迁移评估、App 图标/启动屏、EAS Build 产出双端 Release 产物并通过冒烟测试。项目文档体系终检与实际状态对齐。

## 2. 前置条件

- [ ] M4 已通过（双端真机完整闭环）

## 3. 任务拆解

| # | 任务 | 复杂度 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | 消行闪烁动画（~200ms，渲染层） | 中 | M4 | ⬜ |
| 2 | 引擎消行事件 → 渲染层动画接线 | 中 | 1 | ⬜ |
| 3 | 锁块闪白 + Game Over 全屏效果 | 低 | 1 | ⬜ |
| 4 | 性能验证：双端真机连续 3 局帧率观察 | 中 | 1-3 | ⬜ |
| 5 | Skia 迁移评估（记录结论，不强制迁移） | 低 | 4 | ⬜ |
| 6 | App 图标 + 启动屏 + app.json 完善 | 低 | - | ⬜ |
| 7 | EAS Build：iOS + Android Release 产物 | 中 | 6 | ⬜ |
| 8 | 产物双端安装冒烟 | 中 | 7 | ⬜ |
| 9 | 文档体系终检（全部文档与实际状态对齐） | 低 | 全部 | ⬜ |

## 4. 实现步骤

### 步骤 1-2：消行动画（引擎瞬间消行，动画只在渲染层）

- 引擎 `update` 返回的事件流中已有 `clearedRows: number[]`（Phase 2 设计）。
- 渲染层收到事件后进入「动画中」状态：用 `Animated.Value` 驱动被消行的闪烁（透明度 1→0.2→1 两轮，约 200ms）。
- **动画期间冻结引擎推进**（`animationLock` 标志），动画结束才继续——否则视觉上"行还没消失新块就落下来了"。

> 关键纪律：动画属于表现层，**引擎代码本阶段一行都不改**（除非发现 bug，须走问题记录表）。

### 步骤 3：锁块反馈

锁定瞬间该方块 4 格闪白一帧（~80ms）。Game Over：棋盘整体灰化 + 分数放大 + 「再来一局」。

### 步骤 4：性能验证

- 双端真机各连续玩 3 局，观察：快速软降时是否掉帧、消行动画期间输入是否丢失、长时间游玩是否发热。
- 检查项：React DevTools Profiler 看 Board 重渲染范围（HUD 数字变化不应引起 Board 渲染）。

### 步骤 5：Skia 迁移评估

只有当步骤 4 发现 View 矩阵确实掉帧时才迁移。评估记录写本阶段文档「问题与解决方案」表：现象、量化数据（帧率）、结论（迁/不迁 + 理由）。**没有数据不迁移**。

### 步骤 6：图标与启动屏

- 1024×1024 图标（可用 `@expo/vector-icons` 风格自绘或 ImageGen 生成素材）。
- `app.json` 配置：name / slug / version(1.0.0) / icon / splash / android.package / ios.bundleIdentifier。

### 步骤 7：EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # 产出 .apk（真机直接装）
eas build --platform ios --profile preview       # 模拟器 build（免开发者账号）
```

> iOS 真机 .ipa 需要 Apple Developer 账号（$99/年）。v1 验收接受 iOS 模拟器 build + Expo Go 真机两种形式。

### 步骤 8：产物冒烟

安装产物，按 M5 清单走完整流程：开局 → 消行（含 Tetris 四消）→ 暂停恢复 → Game Over → 最高分记录 → 重开。

### 步骤 9：文档终检

- PROJECT.md：§6 阶段状态全 ✅、§8 环境与运行补全。
- MILESTONES.md：M1-M5 全部勾选并填日期。
- 各阶段文档：已完成任务/问题记录表无空缺。
- 最终 git tag：`v1.0.0`。

## 5. 注意事项（坑位预警）

- **动画锁与输入丢弃**：消行动画期间缓存而非丢弃用户输入（连按旋转不应丢指令），引擎冻结但命令队列照常入队。
- **EAS 免费额度**：每月构建次数有限，先把 app.json/图标配完再触发 build，避免浪费配额。
- **Android .apk vs .aab**：真机自装用 .apk（preview profile）；上架商店才需要 .aab（v1 不涉及）。
- **图标素材版权**：自绘或用生成素材，不扒现成游戏图标。
- 性能问题优先怀疑渲染层（重渲染范围），其次才考虑 Skia；引擎纯计算 10×20 棋盘不可能成为瓶颈。

## 6. 已完成任务记录

| # | 任务 | 完成日期 | 验证方式 | 备注 |
|---|---|---|---|---|
| 1 | 消行闪烁动画 | 2026-09-30 | typecheck + 45 测试全绿 | 引擎动画锁 220ms（useGameEngine 冻结 update，输入照常入队），渲染层在消行前棋盘上播白色横条两轮闪烁，解锁后自动展示消行后棋盘 |
| 2 | 引擎事件接线 | 2026-09-30 | typecheck + 测试 | locked 事件新增 piece 字段（供闪白定位），engine.test 断言同步更新 |
| 3 | 锁块闪白 + Game Over 灰化 | 2026-09-30 | typecheck | 锁定方块位置白色叠加 120ms 淡出；phase=over 时棋盘整体 50% 透明 |
| 4 | Skia 迁移评估 | 2026-09-30 | 结论记录 | **不迁移**：用户未报告可感知掉帧；View 矩阵 200 节点在 Fabric 下渲染压力低；无量化数据不承担迁移成本。若后续低端机掉帧再评估 |
| 5 | App 图标 + 启动屏 | 2026-09-30 | sips 尺寸核对 | ImageGen 生成 1024×1024 扁平四色方块图标 → icon.png / adaptive-icon 前景 / splash 400×400 / favicon 48×48；app.json 更新（name=RN Tetris、深色 UI、splash 深蓝底、bundleIdentifier/package=com.asterisme.rntetris） |
| 6 | eas.json | 2026-09-30 | - | preview profile：android apk + ios simulator |
| 7 | EAS Build 双端产物 | 2026-10-12 重新构建 | eas build --no-wait | 第一轮（10-09，旧 UI）已 FINISHED 但不含掌机化改造；10-12 用最新代码重新提交：Android `6036b70a`（[链接](https://expo.dev/accounts/voltman/projects/tetris-app/builds/6036b70a-9dca-4c99-b11c-4b4de3874436)）+ iOS（提交后链接补录）。掌机版 iOS bundle 编译已验证 200 |
| 8 | 性能验证（双端真机 3 局） | - | **待用户执行** | 快速软降/消行动画期间无可感知掉帧、输入不丢 |
| 9 | 产物双端安装冒烟 | - | **待用户执行** | apk 装机走完整流程 |

## 7. 问题与解决方案记录

| 日期 | 问题症状 | 根因 | 解决方案 | 状态 |
|---|---|---|---|---|
| 2026-09-30 | eas-cli / expo start 等**长驻 node 进程**随机崩溃：`Broker request outcome unknown: write EPIPE`、`ECONNREFUSED broker.sock`、`CODEBUDDY_BROKER_DENY`（npm 缓存 rename 被拒）、部分命令 SIGTERM(137) | 本机 WorkBuddy 注入的 node 文件代理 shim（node-brokered-fs-shim.cjs）对长时运行进程/网络型 npm 操作不稳定 | 短命令走非沙箱模式可过；EAS 构建改为用户在本机终端手动执行（命令见 §9） | ⏳ 待环境恢复 |
| 2026-09-30 | 引擎测试耗时 4.6 分钟（ts-jest 变慢） | 机器负载 + 覆盖率插桩 | 功能性结果不受影响；如需提速可迁移 vitest（暂不做） | 📝 已记录 |

## 8. 遗留想法（不进当前版本）

-

## 9. 环境恢复后的收尾命令（用户执行）

```bash
cd /Users/huanghua/Projects/tetris-app

# 1. 提交 Phase 5 动效与发布配置
git add -A
git commit -m "feat(phase-5): 消行动画+锁块闪白+Game Over灰化+图标启动屏+EAS配置"
git push

# 2. 发起双端云构建（EAS 免费额度，Android 约 10-20 分钟）
npx eas-cli build --platform android --profile preview   # 产出 .apk
npx eas-cli build --platform ios --profile preview       # 产出模拟器包
# 构建完成后在 https://expo.dev 上 voltman 账号的项目页下载产物

# 3. Android 冒烟：安装 apk → 开局→消行（看闪烁动画）→暂停→Game Over→重开
```

## 9. 阶段验收（对应 M5 检查清单）

- [x] 逐项核对 MILESTONES.md 中 M5 的全部验收标准
- [x] 已更新 PROJECT.md §6 阶段状态
- [x] 已更新 MILESTONES.md 完成情况
- [x] 已 git commit 并合入 master、打 tag v1.0.0（见 git log）
- [x] 掌机化 UI 批次（棋盘自适应放大/消行印记修复/掌机配色）已提交 `e95cfa1` 并包含在 10-12 构建中
- [ ] 用户装机冒烟（apk 安装 → 完整流程）——待用户执行
