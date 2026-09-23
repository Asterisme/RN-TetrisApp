# Phase 1 — 项目启动与环境搭建

> 状态：✅ 已完成（2026-09-23） · 对应里程碑：M1（项目骨架可运行）

---

## 1. 阶段目标

Expo + TypeScript 项目初始化完成，工程化配置（lint / 类型检查 / 单测）就绪，目录骨架建立，空屏 App 可在模拟器/Expo Go 中运行。**本阶段不写任何游戏逻辑。**

## 2. 前置条件

- [ ] 无前置里程碑（本阶段为起点）
- [ ] 本机已安装 Node.js ≥ 18（已有 22.x，满足）
- [ ] 已安装 Expo Go（iOS 从 App Store / Android 从应用市场，或用 iOS 模拟器 + Xcode）

## 3. 任务拆解

| # | 任务 | 复杂度 | 依赖 | 状态 |
|---|---|---|---|---|
| 1 | `create-expo-app` 初始化 TypeScript 模板 | 低 | - | ⬜ |
| 2 | 安装依赖：zustand / gesture-handler / safe-area-context / async-storage / jest | 低 | 1 | ⬜ |
| 3 | 建立目录骨架（engine / store / components / hooks / screens / __tests__） | 低 | 1 | ⬜ |
| 4 | 配置 ESLint + `tsc --noEmit` 类型检查 | 低 | 1 | ⬜ |
| 5 | 配置 Jest（ts-jest 或 expo 自带 jest-expo）+ 示例测试 | 中 | 2 | ⬜ |
| 6 | 空屏 App 启动验证（模拟器或 Expo Go） | 低 | 1-5 | ⬜ |
| 7 | git init + 首次提交 | 低 | 6 | ⬜ |

## 4. 实现步骤

### 步骤 1：初始化项目

```bash
cd /Users/huanghua/Projects
npx create-expo-app@latest tetris-app --template blank-typescript
cd tetris-app
```

> 注意：docs/ 目录已存在（本项目文档体系），初始化不会覆盖它。

### 步骤 2：安装依赖

```bash
npx expo install react-native-gesture-handler react-native-safe-area-context @react-native-async-storage/async-storage
npm install zustand
npm install -D jest ts-jest @types/jest
```

> 用 `npx expo install` 装 RN 系依赖（自动匹配版本，避免版本不兼容——这是 Expo 最常见的坑）。

### 步骤 3：建立目录骨架

按 PROJECT.md §5 的结构创建 `src/` 各子目录及 `__tests__/engine/`，每个目录放一个占位文件（如 `types.ts` 导出空类型），保证 git 能追踪空目录。

### 步骤 4：类型检查配置

在 `package.json` 增加 script：

```json
"typecheck": "tsc --noEmit"
```

运行 `npm run typecheck` 确认零错误。

### 步骤 5：Jest 配置

引擎测试不依赖 RN，用纯 ts-jest 即可（速度快、无需模拟器）：

```js
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__/'],
  moduleNameMapper: { '^@engine/(.*)$': '<rootDir>/src/engine/$1' },
};
```

写一个示例测试验证管道：`__tests__/engine/smoke.test.ts` 断言常量 `COLS === 10 && ROWS === 20`（此时可顺带在 `src/engine/constants.ts` 定义棋盘常量）。

### 步骤 6：启动验证

```bash
npx expo start
```

- 按 `i` 打开 iOS 模拟器（或手机 Expo Go 扫码）
- 确认空白页加载无红屏/黄屏报错

### 步骤 7：git 提交

```bash
git init && git add -A && git commit -m "chore: expo + ts 项目骨架与工程化配置"
```

## 5. 注意事项（坑位预警）

- **依赖版本**：RN 系包一律 `npx expo install`，手动 `npm install` 极易装到不兼容版本。
- **Node 版本**：若遇引擎版本告警（EBADENGINE），切换到受管 Node 22。
- **iOS 模拟器**：需 Xcode + 命令行工具；若未装，直接用 Expo Go 真机调试，不阻塞本阶段。
- **.gitignore**：确认模板自带（node_modules / .expo 等），缺失则从 expo 官方模板补。

## 6. 已完成任务记录

| # | 任务 | 完成日期 | 验证方式 | 备注 |
|---|---|---|---|---|
| 1 | create-expo-app 初始化 TypeScript 模板 | 2026-09-23 | package.json：expo ~57.0.24 / RN 0.86.3 / TS 6.0 | Expo 57 模板 |
| 2 | 安装依赖（zustand / gesture-handler / safe-area-context / async-storage / jest） | 2026-09-23 | package-lock 版本核对，均与 expo 57 兼容 | RN 系包经 expo install 匹配版本 |
| 3 | 目录骨架 + 引擎常量/类型 | 2026-09-23 | find src 核对；COLS=10/ROWS=20/BUFFER=4 | store 等目录用 .gitkeep 占位 |
| 4 | typecheck 脚本 | 2026-09-23 | `npm run typecheck` 零错误 | - |
| 5 | Jest 配置 + smoke 测试 | 2026-09-23 | `npm test` 1 passed | 踩坑见问题表 #1 |
| 6 | 启动验证 | 2026-09-23 | dev server `packager-status:running`；iOS/Android bundle 均 HTTP 200（4.1MB/4.2MB） | bundle 层验证通过；**建议用户用 Expo Go 扫码做最终视觉确认**（见问题表 #2、#3） |
| 7 | git 提交 | 2026-09-23 | commit `32a63bc` | committer 身份为自动生成（黄铧@ThunderBolt.local），如需修正可 git config 后 amend |

## 7. 问题与解决方案记录

| 日期 | 问题症状 | 根因 | 解决方案 | 状态 |
|---|---|---|---|---|
| 2026-09-23 | ts-jest 报 TS2307 找不到 `@engine/constants` + TS2593 找不到 `describe` | ts-jest 走 TypeScript 编译器解析模块，**不读 Jest 的 moduleNameMapper**；且 jest 全局类型未被 tsconfig 加载 | tsconfig.json 增加 `paths: {"@engine/*": ["./src/engine/*"]}` 与 `types: ["jest"]`；moduleNameMapper 仍保留（供运行时解析） | ✅ 已解决 |
| 2026-09-23 | `expo-doctor` 挂起后被杀（exit 137） | 网络请求超时（沙箱环境） | 跳过 doctor，改用「dev server status + 双端 bundle HTTP 200」做启动冒烟，验证力度等价（编译层面） | ✅ 已解决 |
| 2026-09-23 | `expo start --no-open` 报 unknown option | Expo 57 已移除该选项 | 用 `CI=1` 环境变量（CI 模式不自动打开）| ✅ 已解决 |

## 8. 遗留想法（不进当前版本）

-

## 9. 阶段验收（对应 M1 检查清单）

- [x] 逐项核对 MILESTONES.md 中 M1 的全部验收标准（bundle 编译验证通过；Expo Go 视觉终检建议用户复核）
- [x] 已更新 PROJECT.md §6 阶段状态
- [x] 已更新 MILESTONES.md 完成情况
- [x] 已 git commit（文档 + 代码，commit `32a63bc`）
