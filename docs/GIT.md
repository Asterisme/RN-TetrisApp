# Git 协作规范与操作手册

> 适用仓库：`tetris-app` · 远程：`origin` → https://github.com/Asterisme/RN-TetrisApp.git
> 分支模型：**master（稳定主干）+ develop（日常开发线）**

---

## 1. 分支模型

| 分支 | 用途 | 保护规则 |
|---|---|---|
| `master` | 稳定版本，仅在 Phase 收尾合入 | 不直接在上面开发 |
| `develop` | 日常开发主线，所有代码先提交到这里 | 提交前确保 typecheck + test 通过 |
| `feature/*`（可选） | 大功能的独立分支，如 `feature/phase-2-engine` | 完成后合回 develop |

**GitHub 仓库现状**：远程存在 `main` / `master` / `develop` 三分支，默认分支指向 `main`。待统一：以 master 为主干（删除空壳 main），或以 main 为主干（合并后删除 master）。统一前新推送默认推 `develop`。

## 2. 提交信息规范

格式：`type(scope): 描述`（scope 用 phase-N 或模块名）

| type | 用途 | 示例 |
|---|---|---|
| `feat` | 新功能 | `feat(phase-2): 实现 7-bag 随机生成` |
| `fix` | 修 bug | `fix(engine): 修正 SRS 踢墙表 dy 方向` |
| `docs` | 仅文档 | `docs(phase-1): M1 验收记录` |
| `test` | 仅测试 | `test(engine): 补充消行边界用例` |
| `chore` | 构建/配置 | `chore: 升级 expo 依赖` |
| `refactor` | 重构 | `refactor(store): 快照推送引用比较` |

**文档与代码同 commit**：阶段收尾时，阶段文档更新和代码变更放同一次提交（项目文档管理规则 §7）。

## 3. 日常操作速查

### 3.1 日常开发（develop 上）

```bash
git checkout develop              # 确保在开发分支
# ……写代码……
npm run typecheck && npm test     # 提交前自检（强制习惯）
git add -A
git commit -m "feat(phase-2): 实现 SRS 旋转与踢墙"
git push                          # 已建立跟踪，裸 push 即可
```

### 3.2 Phase 收尾合入 master

```bash
git checkout master
git merge develop
git push
git checkout develop              # 切回继续开发
# （Phase 5 结束时）打版本标签：
git tag v1.0.0 && git push --tags
```

### 3.3 建新分支（feature 或新环境）

```bash
git checkout -b feature/xxx develop   # 基于 develop 创建并切换
git push -u origin feature/xxx        # 首推需 -u 绑定远程
```

### 3.4 查看状态

```bash
git status -sb          # 当前分支 + 领先/落后 + 改动文件
git branch -vv          # 本地分支与跟踪关系
git log --oneline -5    # 最近 5 条提交
git diff                # 未暂存改动
```

## 4. 高频坑与解法

| 症状 | 原因 | 解法 |
|---|---|---|
| `push` 报 `no upstream` | 分支未绑定远程 | `git push -u origin <分支名>` 推一次即可 |
| 切分支提示改动会被带过去/冲突 | 工作区有未提交改动 | 临时存：`git stash` → 切完 `git stash pop`；或先 commit |
| `push` 被拒 `rejected (non-fast-forward)` | 远程有你本地没有的提交（别处推过） | 先 `git pull --rebase` 再 push |
| 不想提交某文件又怕误 add | - | `git stash` 或加进 `.gitignore`（仅限非追踪文件） |
| 想撤销工作区某文件的修改 | - | `git checkout -- <文件>`（丢弃未提交修改，不可恢复） |
| commit 信息写错了 | - | `git commit --amend -m "新信息"`（**仅未 push 时**） |

**危险操作红线**：
- `git reset --hard` / `git push --force`：会不可逆丢弃提交。force push 仅在确知远程历史可丢弃时使用，且优先 `--force-with-lease`（有他人新提交时会拒绝，更安全）。

## 5. 认证说明

远程为 HTTPS 方式。首次 push 弹窗时：
- **浏览器 OAuth**（推荐）：macOS 凭据管理器自动弹浏览器授权；
- **PAT**：GitHub → Settings → Developer settings → Personal access tokens 生成（勾 `repo` 权限），弹窗中密码栏填 token。

## 6. 本仓库已固化的约定

1. 主干 `master`、开发线 `develop`，日常 push 只推 develop；
2. 每次提交前 `npm run typecheck && npm test` 必须绿；
3. 提交信息用 §2 规范，中文描述；
4. 阶段收尾：文档更新 + 代码同 commit，合入 master 后更新 PROJECT.md §6 状态；
5. committer 身份：`git config --global user.name "Asterisme"` + GitHub 邮箱（首次已提示，若未设置请先设置再继续提交）。
