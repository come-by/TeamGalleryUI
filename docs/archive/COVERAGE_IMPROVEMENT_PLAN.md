# 前端代码覆盖率提升 — 分步实施任务书

> 档案性质：临时工作计划（非正式文档）  
> 目标读者：实施开发人员  
> 创建日期：2026-06-23  
> 状态：待执行

---

## 概述

| 项目       | 当前 | 第一阶段目标 | 最终目标 |
| ---------- | ---- | ------------ | -------- |
| lines      | ~40% | 55%          | 80%      |
| functions  | ~25% | 40%          | 70%      |
| branches   | ~25% | 35%          | 65%      |
| statements | ~40% | 55%          | 80%      |
| 测试文件数 | 14   | 30+          | 60+      |

---

## 第一步：基础设施准备（预计 2-3 小时）

> 责任人：**待指派**  
> 前置依赖：无  
> 完成后可并行开展第二步的所有子任务

### 任务 1.1：完善 `src/test/setup.ts`

**文件**：`src/test/setup.ts`  
**现状**：仅一行注释，无任何 mock 配置  
**目标**：提供全局 mock，使组件测试无需逐个处理常见依赖

**具体操作**：

```ts
// 需要添加的全局 mock：
// 1. ResizeObserver — Element Plus 组件依赖
// 2. IntersectionObserver — 虚拟滚动等组件依赖
// 3. vue-router 的 useRouter / useRoute — 几乎所有视图组件依赖
// 4. Element Plus 全局组件 stub — 避免弹窗/下拉菜单注册警告
```

**验收标准**：

- 运行 `npx vitest run` 不产生 `ResizeObserver is not defined` 等全局错误
- 任意 mount 一个引用了 `useRouter` 的 Vue 组件不会报错

### 任务 1.2：更新 `vitest.config.ts` 覆盖率配置

**文件**：`vitest.config.ts`  
**现状**：`include` 未写 `.vue`，阈值极低  
**目标**：纳入 `.vue` 文件统计，阈值分阶段提升

**具体操作**：

```ts
// coverage.include 增加 'src/**/*.vue'
// coverage.thresholds 改为：
//   lines: 55, functions: 40, branches: 35, statements: 55
// 删除 thresholds 中的 25 这种无意义底线
```

**验收标准**：

- `npx vitest run --coverage` 报告包含 `.vue` 文件覆盖率
- 当前覆盖率不达标时命令 exit code 非 0

### 任务 1.3：创建覆盖率门禁脚本

**新建文件**：`scripts/check-coverage.js`  
**目标**：读取 `coverage/coverage-summary.json`，与阈值比对，不达标则 process.exit(1)

**脚本要点**：

```
1. 读取 coverage/coverage-summary.json
2. 取 totals 字段
3. 与内置阈值比较（lines:55, functions:40, branches:35, statements:55）
4. 达标输出绿色 ✓，不达标输出红色 ✗ 并 exit(1)
```

### 任务 1.4：更新 `package.json` 脚本

**文件**：`package.json`  
**操作**：新增一条 script

```json
{
  "scripts": {
    "test:coverage:check": "vitest run --coverage && node scripts/check-coverage.js"
  }
}
```

### 任务 1.5：更新 CI 流水线

**文件**：`.github/workflows/ci.yml`  
**操作**：

- 测试步骤改用 `npm run test:coverage:check`（带门禁）
- 在 check job 末尾增加 coverage artifact 上传（保留 14 天）
- pre-push hook 中增加 `npm run test:coverage:check`

---

## 第二步：补齐工具层测试（预计 3-5 天）

> 责任人：**待指派**  
> 前置依赖：第一步完成  
> 说明：以下子任务互不依赖，可多人并行

### 子任务 2.1：`src/utils/token.ts` 测试 ⭐ P0

**新建文件**：`src/utils/token.test.ts`  
**被测函数**：`decodeToken`, `isTokenExpired`, `willTokenExpireSoon`  
**预估用例**：6-8 个

| 用例编号 | 场景           | 输入           | 期望                             |
| -------- | -------------- | -------------- | -------------------------------- |
| T-01     | 解码有效 JWT   | 有效 token 串  | 返回 payload 对象                |
| T-02     | 解码无效字符串 | 非 JWT 格式    | 返回 null 或抛错                 |
| T-03     | 解码空字符串   | `""`           | 返回 null                        |
| T-04     | 已过期 token   | exp 在过去     | `isTokenExpired` 返回 true       |
| T-05     | 未过期 token   | exp 在未来     | `isTokenExpired` 返回 false      |
| T-06     | 即将过期 token | exp 在阈值内   | `willTokenExpireSoon` 返回 true  |
| T-07     | 长期有效 token | exp 远超阈值   | `willTokenExpireSoon` 返回 false |
| T-08     | 无 exp 字段    | payload 无 exp | 边界处理                         |

### 子任务 2.2：`src/utils/sanitize.ts` 测试 ⭐ P0

**新建文件**：`src/utils/sanitize.test.ts`  
**预估用例**：5-6 个

| 用例编号 | 场景                 | 输入                             | 期望             |
| -------- | -------------------- | -------------------------------- | ---------------- |
| S-01     | 正常文本             | `"hello world"`                  | 原样返回         |
| S-02     | XSS script 标签      | `<script>alert(1)</script>`      | 移除 script      |
| S-03     | XSS img onerror      | `<img src=x onerror=alert(1)>`   | 移除 onerror     |
| S-04     | XSS javascript: 协议 | `<a href="javascript:alert(1)">` | 移除或转义       |
| S-05     | 空字符串             | `""`                             | 返回空           |
| S-06     | 合法 HTML            | `<b>bold</b>`                    | 按策略保留或转义 |

### 子任务 2.3：`src/utils/constants.ts` 测试 ⭐ P0

**新建文件**：`src/utils/constants.test.ts`  
**预估用例**：2-3 个

| 用例编号 | 场景                             |
| -------- | -------------------------------- |
| C-01     | 验证所有常量值为预期（快照测试） |
| C-02     | 验证枚举值不重复                 |
| C-03     | 验证关键常量非空                 |

### 子任务 2.4：`src/composables/usePagination.ts` 测试 ⭐ P1

**新建文件**：`src/composables/usePagination.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景                                         |
| -------- | -------------------------------------------- |
| P-01     | 初始状态（page=1, pageSize=默认值, total=0） |
| P-02     | setPage 跳转到指定页                         |
| P-03     | nextPage 前进一页                            |
| P-04     | prevPage 后退一页（边界：第1页不能再退）     |
| P-05     | nextPage 不超过最大页数                      |
| P-06     | setPageSize 改变每页条数，自动回到第1页      |
| P-07     | setTotal 更新总条数                          |
| P-08     | totalPages 计算正确                          |

### 子任务 2.5：`src/composables/useDebounce.ts` 测试补充 ⭐ P1

**文件**：`src/composables/useDebounce.test.ts`（已有）  
**操作**：审查现有用例，补充以下场景

| 用例编号 | 场景                                       |
| -------- | ------------------------------------------ |
| D-01     | 验证防抖延迟生效（vi.advanceTimersByTime） |
| D-02     | 验证连续调用只触发最后一次                 |
| D-03     | 验证 cancel 方法取消待执行回调             |
| D-04     | 验证 immediate 模式立即执行首次            |

### 子任务 2.6：`src/composables/useChat.ts` 测试 ⭐ P1

**新建文件**：`src/composables/useChat.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景                             |
| -------- | -------------------------------- |
| CH-01    | 初始 messages 为空数组           |
| CH-02    | sendMessage 发送消息（mock API） |
| CH-03    | sendMessage 失败处理             |
| CH-04    | loadMessages 加载历史消息        |
| CH-05    | 消息列表去重                     |
| CH-06    | WebSocket 消息接收（mock ws）    |

### 子任务 2.7：`src/composables/useNotification.ts` 测试 ⭐ P1

**新建文件**：`src/composables/useNotification.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景                        |
| -------- | --------------------------- |
| N-01     | 初始通知列表为空            |
| N-02     | fetchNotifications 加载列表 |
| N-03     | 未读数量统计正确            |
| N-04     | markAsRead 标记已读         |
| N-05     | markAllAsRead 全部已读      |
| N-06     | 空列表时 unreadCount 为 0   |

### 子任务 2.8：`src/composables/useMilestone.ts` 测试 ⭐ P2

**新建文件**：`src/composables/useMilestone.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景                     |
| -------- | ------------------------ |
| M-01     | 初始里程碑列表为空       |
| M-02     | fetchMilestones 加载数据 |
| M-03     | createMilestone 创建     |
| M-04     | updateMilestone 更新     |
| M-05     | deleteMilestone 删除     |
| M-06     | 进度百分比计算           |

### 子任务 2.9：`src/composables/useProject.ts` 测试 ⭐ P2

**新建文件**：`src/composables/useProject.test.ts`  
**预估用例**：8-10 个

| 用例编号 | 场景                          |
| -------- | ----------------------------- |
| PR-01    | 初始 project 为 null          |
| PR-02    | fetchProjects 加载项目列表    |
| PR-03    | fetchProject 加载单个项目详情 |
| PR-04    | createProject 创建项目        |
| PR-05    | updateProject 更新项目        |
| PR-06    | deleteProject 删除项目        |
| PR-07    | 项目成员管理                  |
| PR-08    | 项目搜索/过滤                 |

### 子任务 2.10：`src/composables/useIdleTimeout.ts` 测试 ⭐ P2

**新建文件**：`src/composables/useIdleTimeout.test.ts`  
**预估用例**：4-6 个

| 用例编号 | 场景                     |
| -------- | ------------------------ |
| I-01     | 指定时间无操作后触发回调 |
| I-02     | 有操作时重置计时器       |
| I-03     | reset 方法重置           |
| I-04     | stop 方法停止监听        |
| I-05     | start 方法重新开始       |

### 子任务 2.11：`src/composables/useSessionMonitor.ts` 测试 ⭐ P2

**新建文件**：`src/composables/useSessionMonitor.test.ts`  
**预估用例**：4-6 个

### 子任务 2.12：`src/stores/chat.ts` 测试 ⭐ P1

**新建文件**：`src/stores/chat.test.ts`  
**预估用例**：8-10 个  
**测试模式**：参考已有的 `src/stores/user.test.ts`

### 子任务 2.13：`src/stores/project.ts` 测试 ⭐ P1

**新建文件**：`src/stores/project.test.ts`  
**预估用例**：8-10 个  
**测试模式**：参考已有的 `src/stores/user.test.ts`

### 子任务 2.14：补全 MSW Mock Handlers ⭐ P1

**现状**：5 个 handler 模块（article / auth / search / upload / user）  
**缺少**：8 个模块

| 新建文件                                | Mock 的 API 模块             |
| --------------------------------------- | ---------------------------- |
| `src/mocks/handlers/chat.ts`            | `src/api/chat.ts`            |
| `src/mocks/handlers/comment.ts`         | `src/api/comment.ts`         |
| `src/mocks/handlers/interaction.ts`     | `src/api/interaction.ts`     |
| `src/mocks/handlers/manual.ts`          | `src/api/manual.ts`          |
| `src/mocks/handlers/milestone.ts`       | `src/api/milestone.ts`       |
| `src/mocks/handlers/notification.ts`    | `src/api/notification.ts`    |
| `src/mocks/handlers/project.ts`         | `src/api/project.ts`         |
| `src/mocks/handlers/project-comment.ts` | `src/api/project-comment.ts` |

**操作**：

1. 参考已有 handler（如 `src/mocks/handlers/user.ts`）的写法
2. 每个 handler 至少提供 list / detail / create 三个基本操作的 mock
3. 在 `src/mocks/handlers/index.ts` 中注册

---

## 第三步：核心组件测试（预计 5-7 天）

> 前置依赖：第一步 + 第二步 MSW handlers 补齐  
> 说明：P0 组件先做，P1/P2/P3 可以并行（互不依赖）

### 3.1 `ProjectForm.vue` ⭐ P0

**新建文件**：`src/components/project/ProjectForm.test.ts`  
**预估用例**：10-15 个

| 用例编号 | 分类 | 场景                         |
| -------- | ---- | ---------------------------- |
| PF-01    | 渲染 | create 模式下渲染空表单      |
| PF-02    | 渲染 | edit 模式下渲染预填数据      |
| PF-03    | 渲染 | 所有必填字段存在             |
| PF-04    | 验证 | 提交空表单显示校验错误       |
| PF-05    | 验证 | 项目名称为空时提示           |
| PF-06    | 验证 | 项目名称超长时提示           |
| PF-07    | 交互 | 输入字段后值正确绑定         |
| PF-08    | 交互 | 正常填写后提交触发 emit      |
| PF-09    | 交互 | 提交按钮 loading 状态        |
| PF-10    | 交互 | 取消按钮触发 emit/cancel     |
| PF-11    | 边界 | 网络错误时显示错误提示       |
| PF-12    | 边界 | edit 模式下 initialData 为空 |

> **架构师提示**：`ProjectForm` 是 MVP（最小可行产品路径），做好这一个组件的测试可以建立组件测试的模板和规范，后续所有组件测试都参照这个模式。

### 3.2 `MilestoneForm.vue` ⭐ P0

**新建文件**：`src/components/milestone/MilestoneForm.test.ts`  
**预估用例**：8-12 个

| 用例编号 | 场景                      |
| -------- | ------------------------- |
| MF-01    | 渲染空表单（create 模式） |
| MF-02    | 渲染预填数据（edit 模式） |
| MF-03    | 里程碑标题必填校验        |
| MF-04    | 日期选择器渲染正常        |
| MF-05    | 截止日期不能早于开始日期  |
| MF-06    | 正常提交触发 emit         |
| MF-07    | 提交按钮 loading 态       |
| MF-08    | 取消按钮行为              |

### 3.3 `FileUpload.vue` ⭐ P0

**新建文件**：`src/components/FileUpload.test.ts`  
**预估用例**：8-12 个

| 用例编号 | 场景                         |
| -------- | ---------------------------- |
| FU-01    | 渲染上传区域                 |
| FU-02    | 文件类型限制生效             |
| FU-03    | 文件大小限制生效（超限提示） |
| FU-04    | 上传进度显示                 |
| FU-05    | 上传成功回调                 |
| FU-06    | 上传失败错误处理             |
| FU-07    | 拖拽上传触发                 |
| FU-08    | 多文件上传                   |
| FU-09    | 空文件列表时无上传按钮       |

### 3.4 `CommentSection.vue` ⭐ P1

**新建文件**：`src/components/comment/CommentSection.test.ts`  
**预估用例**：10-14 个

| 用例编号 | 场景                      |
| -------- | ------------------------- |
| CS-01    | 空评论列表渲染"暂无评论"  |
| CS-02    | 评论列表正常渲染          |
| CS-03    | 发表评论（输入框 + 按钮） |
| CS-04    | 空内容无法发表            |
| CS-05    | 删除自己的评论            |
| CS-06    | 编辑评论                  |
| CS-07    | 加载态显示骨架屏/Loading  |
| CS-08    | 加载失败错误提示          |
| CS-09    | 分页加载更多              |

### 3.5 `MemberManager.vue` ⭐ P1

**新建文件**：`src/components/project/MemberManager.test.ts`  
**预估用例**：8-10 个

### 3.6 `ChatWindow.vue` ⭐ P1

**新建文件**：`src/components/chat/ChatWindow.test.ts`  
**预估用例**：8-12 个

| 用例编号 | 场景                 |
| -------- | -------------------- |
| CW-01    | 空消息列表渲染       |
| CW-02    | 消息列表渲染         |
| CW-03    | 发送文本消息         |
| CW-04    | 空消息无法发送       |
| CW-05    | 新消息自动滚动到底部 |
| CW-06    | 加载历史消息         |
| CW-07    | 发送失败重试         |

### 3.7 `ProjectCard.vue` ⭐ P1

**新建文件**：`src/components/project/ProjectCard.test.ts`  
**预估用例**：6-8 个

### 3.8 `MilestoneTimeline.vue` ⭐ P2

**新建文件**：`src/components/milestone/MilestoneTimeline.test.ts`  
**预估用例**：5-7 个

### 3.9 `MilestoneProgress.vue` ⭐ P2

**新建文件**：`src/components/milestone/MilestoneProgress.test.ts`  
**预估用例**：5-7 个

### 3.10 `ProjectCommentSection.vue` ⭐ P2

**新建文件**：`src/components/project/ProjectCommentSection.test.ts`  
**预估用例**：8-10 个（模式同 CommentSection）

### 3.11 `AppHeader.vue` ⭐ P3

**新建文件**：`src/components/layout/AppHeader.test.ts`  
**预估用例**：5-7 个

### 3.12 `ErrorBoundary.vue` ⭐ P3

**新建文件**：`src/components/ErrorBoundary.test.ts`  
**预估用例**：4-6 个

### 3.13 Selector 组件群 ⭐ P3

| 新建文件                                              | 预估用例 |
| ----------------------------------------------------- | -------- |
| `src/components/notification/ProjectSelector.test.ts` | 3-5      |
| `src/components/notification/RoleSelector.test.ts`    | 3-5      |
| `src/components/notification/TeamSelector.test.ts`    | 3-5      |
| `src/components/notification/UserSelector.test.ts`    | 3-5      |

---

## 第四步：关键视图 Smoke 测试（预计 5-7 天）

> 前置依赖：第一步 + 第二步 MSW + 第三步组件测试完成后  
> 说明：视图测试使用 MSW mock API，只验证关键渲染路径，不追求完整交互

### 4.1 `LoginView.vue` ⭐ P0

**新建文件**：`src/views/auth/LoginView.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景                 |
| -------- | -------------------- |
| LV-01    | 渲染登录表单         |
| LV-02    | 用户名密码输入绑定   |
| LV-03    | 空提交显示校验错误   |
| LV-04    | 登录成功跳转到首页   |
| LV-05    | 登录失败显示错误信息 |
| LV-06    | 已登录状态自动跳转   |

### 4.2 `HomeView.vue` ⭐ P0

**新建文件**：`src/views/home/HomeView.test.ts`  
**预估用例**：6-8 个

| 用例编号 | 场景             |
| -------- | ---------------- |
| HV-01    | 渲染首页布局     |
| HV-02    | 加载项目列表展示 |
| HV-03    | 空项目列表展示   |
| HV-04    | 加载失败错误展示 |
| HV-05    | 项目卡片点击跳转 |

### 4.3 `ProjectDetailView.vue` ⭐ P0

**新建文件**：`src/views/project/ProjectDetailView.test.ts`  
**预估用例**：8-10 个

| 用例编号 | 场景                         |
| -------- | ---------------------------- |
| PD-01    | 渲染项目详情                 |
| PD-02    | 加载态                       |
| PD-03    | 项目不存在错误态             |
| PD-04    | Tab 切换（详情/成员/里程碑） |
| PD-05    | 编辑按钮跳转                 |
| PD-06    | 删除按钮行为                 |

### 4.4 `ProjectListView.vue` ⭐ P1

**新建文件**：`src/views/project/ProjectListView.test.ts`  
**预估用例**：6-8 个

### 4.5 `ArticleListView.vue` ⭐ P1

**新建文件**：`src/views/article/ArticleListView.test.ts`  
**预估用例**：6-8 个

### 4.6 `SearchView.vue` ⭐ P1

**新建文件**：`src/views/search/SearchView.test.ts`  
**预估用例**：6-8 个

### 4.7 `RegisterView.vue` ⭐ P2

**新建文件**：`src/views/auth/RegisterView.test.ts`  
**预估用例**：6-8 个

### 4.8 `ProfileView.vue` ⭐ P2

**新建文件**：`src/views/user/ProfileView.test.ts`  
**预估用例**：5-7 个

### 4.9 其余视图 ⭐ P3

| 新建文件                                                | 预估用例 |
| ------------------------------------------------------- | -------- |
| `src/views/article/ArticleDetailView.test.ts`           | 5-7      |
| `src/views/article/CreateArticleView.test.ts`           | 5-7      |
| `src/views/article/EditArticleView.test.ts`             | 5-7      |
| `src/views/chat/ChatView.test.ts`                       | 5-7      |
| `src/views/manual/ManualDetailView.test.ts`             | 3-5      |
| `src/views/manual/ManualListView.test.ts`               | 3-5      |
| `src/views/notification/CreateNotificationView.test.ts` | 5-7      |
| `src/views/notification/NotificationDetailView.test.ts` | 5-7      |
| `src/views/notification/NotificationListView.test.ts`   | 5-7      |
| `src/views/notification/NotificationPreview.test.ts`    | 3-5      |
| `src/views/notification/TemplateManageView.test.ts`     | 5-7      |
| `src/views/project/CreateProjectView.test.ts`           | 5-7      |
| `src/views/project/EditProjectView.test.ts`             | 5-7      |
| `src/views/user/FavoritesView.test.ts`                  | 3-5      |
| `src/views/user/LikesView.test.ts`                      | 3-5      |
| `src/views/ErrorView.test.ts`                           | 3-5      |

---

## 第五步：Router 与 Layout 测试（预计 2-3 天）

> 前置依赖：第三步完成后

### 5.1 Router 配置测试

**新建文件**：`src/router/index.test.ts`  
**预估用例**：8-10 个

| 用例编号 | 场景                                  |
| -------- | ------------------------------------- |
| R-01     | 所有路由路径可解析                    |
| R-02     | 需要登录的路由未登录时重定向到 /login |
| R-03     | admin 路由被非 admin 用户拒绝         |
| R-04     | 动态路由参数正确提取                  |
| R-05     | 404 路由兜底                          |
| R-06     | meta.title 设置正确                   |

### 5.2 Layout 测试

| 新建文件                            | 预估用例 |
| ----------------------------------- | -------- |
| `src/layouts/DefaultLayout.test.ts` | 3-5      |
| `src/layouts/AdminLayout.test.ts`   | 3-5      |

---

## 第六步：CI 门禁强化与持续监控（预计 1-2 天）

### 6.1 pre-push hook 增加覆盖率检查

**文件**：`.husky/pre-push`  
**操作**：增加 `npm run test:coverage:check`

### 6.2 CI artifact 上传

**文件**：`.github/workflows/ci.yml`  
**已在上一步 1.5 中完成，此处确认**

### 6.3 PR 模板补充测试要求

**文件**：`.github/PULL_REQUEST_TEMPLATE.md`  
**操作**：增加测试检查项

```markdown
## 测试

- [ ] 新增功能对应的测试用例已添加
- [ ] 修改的组件/函数现有测试全部通过
- [ ] 本地运行 `npm run test:coverage:check` 通过
```

### 6.4 阶段性阈值提升时间表

| 里程碑      | 时间节点 | lines | functions | branches | statements |
| ----------- | -------- | ----- | --------- | -------- | ---------- |
| M1 基础补齐 | 第一周末 | 55    | 40        | 35       | 55         |
| M2 组件覆盖 | 第三周末 | 65    | 50        | 45       | 65         |
| M3 视图覆盖 | 第五周末 | 75    | 65        | 55       | 75         |
| M4 长期目标 | 持续迭代 | 80    | 70        | 65       | 80         |

每个里程碑达成后，将 `vitest.config.ts` 中 `coverage.thresholds` 同步更新为该里程碑值。

---

## 附录 A：组件测试编写模板

```ts
// 标准模板：src/components/xxx/XxxComponent.test.ts
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import XxxComponent from './XxxComponent.vue'

// 如有需要 mock API
vi.mock('@/api/xxx', () => ({
  fetchXxx: vi.fn(),
  createXxx: vi.fn(),
}))

describe('XxxComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // === 渲染测试 ===
  describe('渲染', () => {
    it('should render component', () => {
      const wrapper = mount(XxxComponent)
      expect(wrapper.exists()).toBe(true)
    })

    it('should display empty state when data is empty', () => {
      const wrapper = mount(XxxComponent)
      expect(wrapper.text()).toContain('暂无数据')
    })

    it('should display loading state', () => {
      const wrapper = mount(XxxComponent, { props: { loading: true } })
      expect(wrapper.find('.loading').exists()).toBe(true)
    })
  })

  // === 交互测试 ===
  describe('交互', () => {
    it('should handle click event', async () => {
      const wrapper = mount(XxxComponent)
      await wrapper.find('button.submit').trigger('click')
      expect(wrapper.emitted('submit')).toBeTruthy()
    })

    it('should update input value', async () => {
      const wrapper = mount(XxxComponent)
      await wrapper.find('input').setValue('test')
      expect(wrapper.find('input').element.value).toBe('test')
    })
  })

  // === 错误处理测试 ===
  describe('错误处理', () => {
    it('should display error message on failure', async () => {
      const { fetchXxx } = await import('@/api/xxx')
      vi.mocked(fetchXxx).mockRejectedValue(new Error('Network Error'))
      const wrapper = mount(XxxComponent)
      await flushPromises()
      expect(wrapper.text()).toContain('加载失败')
    })
  })

  // === 边界测试 ===
  describe('边界情况', () => {
    it('should handle null props gracefully', () => {
      const wrapper = mount(XxxComponent, { props: { data: null } })
      expect(wrapper.exists()).toBe(true)
    })
  })
})
```

## 附录 B：Git 分支建议

```
main
  └── feat/coverage-phase-1    ← 第一步 + 第二步（基础设施 + 工具层）
  └── feat/coverage-phase-2    ← 第三步（组件测试）
  └── feat/coverage-phase-3    ← 第四步（视图测试）
  └── feat/coverage-phase-4    ← 第五步 + 第六步（收尾）
```

建议按阶段开分支，每个阶段完成后合并回主分支，避免一个超大 PR。

## 附录 C：任务看板速览

```
第一步 [ ] 1.1 setup.ts 补全
     [ ] 1.2 vitest.config 更新
     [ ] 1.3 check-coverage.js 脚本
     [ ] 1.4 package.json 脚本
     [ ] 1.5 CI 更新

第二步 [ ] 2.1  token.test.ts
     [ ] 2.2  sanitize.test.ts
     [ ] 2.3  constants.test.ts
     [ ] 2.4  usePagination.test.ts
     [ ] 2.5  useDebounce 补充
     [ ] 2.6  useChat.test.ts
     [ ] 2.7  useNotification.test.ts
     [ ] 2.8  useMilestone.test.ts
     [ ] 2.9  useProject.test.ts
     [ ] 2.10 useIdleTimeout.test.ts
     [ ] 2.11 useSessionMonitor.test.ts
     [ ] 2.12 chat store test
     [ ] 2.13 project store test
     [ ] 2.14 8个 MSW handlers

第三步 [ ] 3.1  ProjectForm.test.ts          ⭐ P0
     [ ] 3.2  MilestoneForm.test.ts         ⭐ P0
     [ ] 3.3  FileUpload.test.ts            ⭐ P0
     [ ] 3.4  CommentSection.test.ts         P1
     [ ] 3.5  MemberManager.test.ts          P1
     [ ] 3.6  ChatWindow.test.ts             P1
     [ ] 3.7  ProjectCard.test.ts            P1
     [ ] 3.8  MilestoneTimeline.test.ts      P2
     [ ] 3.9  MilestoneProgress.test.ts      P2
     [ ] 3.10 ProjectCommentSection.test.ts  P2
     [ ] 3.11 AppHeader.test.ts              P3
     [ ] 3.12 ErrorBoundary.test.ts          P3
     [ ] 3.13 4个 Selector 组件测试           P3

第四步 [ ] 4.1  LoginView.test.ts            ⭐ P0
     [ ] 4.2  HomeView.test.ts               ⭐ P0
     [ ] 4.3  ProjectDetailView.test.ts      ⭐ P0
     [ ] 4.4-4.16 其余13个视图

第五步 [ ] 5.1 Router 测试
     [ ] 5.2 Layout 测试

第六步 [ ] 6.1 pre-push hook
     [ ] 6.2 CI artifact
     [ ] 6.3 PR 模板
     [ ] 6.4 阈值迭代
```
