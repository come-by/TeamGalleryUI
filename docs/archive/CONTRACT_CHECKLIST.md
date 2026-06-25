# API 契约防漂移 — 验证与扩展执行清单

> 本文档是 [API 契约管理](./DEVELOPMENT.md#5-api-%E5%A5%91%E7%BA%A6%E7%AE%A1%E7%90%86%E9%98%B2%E6%BC%82%E7%A7%BB) 方案的后续执行计划，
> 由架构师和高级工程师编写，按依赖顺序排列，每个任务都可独立验证。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 作者     | 架构评审   |
| 最后更新 | 2026-06-24 |

---

## 一、当前状态

| 已完成 | 内容                                                                                |
| ------ | ----------------------------------------------------------------------------------- |
| ✅     | [src/api/contract.ts](../src/api/contract.ts) — 类型安全契约客户端                  |
| ✅     | [scripts/gen-api.ts](../scripts/gen-api.ts) — 增强版生成器（自动映射、多路径源）    |
| ✅     | [.github/workflows/api-check.yml](../.github/workflows/api-check.yml) — CI 契约校验 |
| ✅     | [.husky/pre-push](../.husky/pre-push) — pre-push 漂移检测                           |

---

## 二、阶段 1：验证 — 确保方案正确可用

> 目标：逐项验证契约系统的每个环节都能正常工作，不产生误报/漏报。
>
> 设计原则：
>
> - **可自动化优先**：所有验证必须能在 CI 中自动执行，消除人工判断
> - **零破坏性**：不修改源代码、不删除文件、不污染 git 历史
> - **防御性设计**：动态检查替代硬编码（端点数量、类型名称等）
> - **单一入口**：`npm run contract:verify` 一键执行全部验证
> - **对齐现有工具链**：复用 vitest、vue-tsc、eslint 基础设施

---

### 1.0 统一验证入口

> 优化说明：增加 `npm run contract:verify` 命令，将所有验证串联为一条命令，在 CI 和本地均可一键执行。

已在 `package.json` 的 `scripts` 中新增：

```json
{
  "contract:verify": "npm run contract:typecheck && npm run contract:test && npm run contract:validate",
  "contract:typecheck": "npx vue-tsc --noEmit",
  "contract:test": "npx vitest run src/api/contract.test.ts src/api/contract.typecheck.test.ts --coverage",
  "contract:validate": "tsx scripts/validate-contract.ts",
  "contract:drift-sim": "tsx scripts/simulate-drift.ts"
}
```

**使用方式**：

```bash
# 一键全量验证（CI 和本地均可用）
npm run contract:verify

# 仅类型检查
npm run contract:typecheck

# 仅测试 + 覆盖率
npm run contract:test

# schemas.ts 完整性校验
npm run contract:validate

# 漂移模拟（需要后端仓库在平级目录）
npm run contract:drift-sim
```

**通过标准**：`npm run contract:verify` 返回 exit code 0，且覆盖率报告中 `contract.ts` ≥ 80%。

---

### 1.1 编译期类型校验验证

> 优化说明：
>
> - 原有方案（创建临时文件 + 手动执行 `vue-tsc`）不可自动化、不可复现。
> - 优化为 vitest 类型级测试 + `@ts-expect-error` 模式，与现有测试框架对齐，CI 可直接执行。
> - 测试文件放在 `src/api/` 下与 contract.ts 同级，文件名为 `contract.typecheck.test.ts`。

**目的**：确认 `contract.ts` 的 TypeScript 类型约束在真实场景下能捕获错误。

**测试文件**：[`src/api/contract.typecheck.test.ts`](../src/api/contract.typecheck.test.ts)

```typescript
// src/api/contract.typecheck.test.ts
// 编译期类型校验测试 — 验证契约客户端的类型约束是否正确
//
// 此文件通过 vitest 的 expectTypeOf 验证编译期行为。
// 同时使用 @ts-expect-error 验证错误用法确实被 TS 编译器拒绝。
// 运行方式: npx vitest run src/api/contract.typecheck.test.ts

import { describe, expect, expectTypeOf, it } from 'vitest'
import { contract } from './contract'

describe('contract 类型约束 — 编译期校验', () => {
  describe('路径名必须存在于 swagger', () => {
    it('合法路径编译通过', () => {
      expectTypeOf(contract.get).toBeCallableWith('/articles')
    })

    it('非法路径编译报错', () => {
      // @ts-expect-error: 路径 '/nonexistent-route' 不在 swagger paths 中
      contract.get('/nonexistent-route')
    })
  })

  describe('路径参数必填校验', () => {
    it('缺少 path params 时编译报错', () => {
      // @ts-expect-error: 路径 '/articles/{id}' 需要 path.id 参数
      contract.get('/articles/{id}')
    })

    it('提供非法 path params 类型时编译报错', () => {
      // @ts-expect-error: path.id 应为 number 而非 string
      contract.get('/articles/{id}', {
        params: { path: { id: 'string-not-number' } },
      })
    })
  })

  describe('请求体可选性校验', () => {
    it('POST 缺少 body（取决于 swagger 定义）', () => {
      // 编译通过：取决于 swagger 中 body 是否标记 required
      expectTypeOf(contract.post).toBeCallableWith('/articles')
    })
  })

  describe('返回值类型推导', () => {
    it('GET 返回值自动推导', () => {
      type ArticlesResponse = Awaited<ReturnType<typeof contract.get<'/articles'>>>
      expectTypeOf<ArticlesResponse>().toBeObject()
    })
  })
})
```

**步骤**：

| 序号  | 操作                                                | 验证点                   | 预期结果                                       |
| ----- | --------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| 1.1.1 | `npm run gen:api` 确保 schemas.ts 最新              | 生成脚本正常运行         | Exit code 0                                    |
| 1.1.2 | `npx vitest run src/api/contract.typecheck.test.ts` | 类型校验测试自动化可执行 | 全部通过（含 `@ts-expect-error` 的预期报错项） |
| 1.1.3 | `npx vue-tsc --noEmit`                              | 全量编译期类型检查       | Exit code 0（无意外类型错误）                  |

**结论判定**：1.1.2 和 1.1.3 必须全部通过，否则 contract.ts 的类型约束未生效。

**注意事项**：

- `@ts-expect-error` 注释：若下一行代码**不**产生类型错误，TypeScript 会报 `Unused '@ts-expect-error' directive` ——这正是我们期望的行为：如果 "非法路径" 没有报错，说明类型校验失效。
- 此测试文件依赖 `gen:api` 生成的 `schemas.ts`，需要在生成后运行。

---

### 1.2 contract.ts 单元测试（运行时行为）

> 优化说明：
>
> - 原有 7 个测试只覆盖了正常路径，缺少错误场景和边界条件。
> - 抽取公共 mock 设置到 `beforeEach`，消除重复的 `import('./contract')` 样板。
> - 新增：运行时错误透传、多级占位符 `/{a}/{b}`、无 params 边界、无占位符路径测试。

**测试文件**：[`src/api/contract.test.ts`](../src/api/contract.test.ts)

测试覆盖 13 个用例：

| 方法   | 用例                    | 验证点                 |
| ------ | ----------------------- | ---------------------- |
| GET    | 路径 + 查询参数传递     | 参数正确转发           |
| GET    | 路径占位符替换          | `{id}` → 实际值        |
| GET    | 同时处理路径 + 查询参数 | 两者独立传递           |
| GET    | 多级占位符 `/{a}/{b}`   | 全部替换               |
| GET    | config 透传             | timeout 等配置原样传递 |
| GET    | 无参数边界              | 不传 options 正常调用  |
| GET    | 无占位符路径            | 保持原路径不变         |
| GET    | 底层错误透传            | rejects 原样抛出       |
| POST   | body + 查询参数传递     | body 和 params 独立    |
| POST   | 路径替换后传 body       | 路径替换不影响 body    |
| POST   | body 为 undefined       | 允许空 body            |
| PUT    | path params + body      | 同时传递               |
| DELETE | path params + 无 params | 两个场景               |
| PATCH  | body 传递               | body 原样转发          |

**步骤**：

| 序号  | 操作                                                 | 验证点           | 预期结果            |
| ----- | ---------------------------------------------------- | ---------------- | ------------------- |
| 1.2.1 | `npm run gen:api` 确保 schemas.ts 是最新的           | 生成脚本正常运行 | Exit code 0         |
| 1.2.2 | `npx vitest run src/api/contract.test.ts`            | 所有测试通过     | 13/13 passed        |
| 1.2.3 | `npx vitest run src/api/contract.test.ts --coverage` | 覆盖率达标       | `contract.ts` ≥ 80% |

**风险点**：测试中使用了 `as never` 绕过 TypeScript 类型检查，因为 vitest 使用 esbuild 转换阶段不做类型校验，类型约束由独立的 [1.1 类型校验测试](#11-编译期类型校验验证) 覆盖。这是预期的分层验证策略。

---

### 1.3 gen-api.ts 脚本验证

> 优化说明：
>
> - 原 1.3.2（删除源文件）已移除，改为 CLI 参数指定不存在文件——零破坏性。
> - 硬编码 "52 个端点" 改为动态脚本 `validate-contract.ts`。
> - 原 1.3.5/1.3.6/1.3.7 已整合入自动化脚本，一条命令覆盖所有检查。

**目的**：确保生成脚本在各种场景下能正确工作。

**自动化验证脚本**：[`scripts/validate-contract.ts`](../scripts/validate-contract.ts)

自动检查项：

- schemas.ts 文件存在
- `export type paths` 和 `export type components` 关键导出
- 端点数量动态统计（替代硬编码数字）
- Go 包路径前缀残留检测（`TeamGalleryGo_` / `GoVueBlog_`）
- HTTP 方法定义完整性（get/post/put/delete）

**步骤**：

| 序号  | 操作                                                                                   | 验证点                   | 预期结果                                           |
| ----- | -------------------------------------------------------------------------------------- | ------------------------ | -------------------------------------------------- |
| 1.3.1 | `npm run gen:api`（默认路径，需后端仓库在平级目录）                                    | 默认路径解析             | 正常生成                                           |
| 1.3.2 | `npm run gen:api -- ./nonexistent.json`                                                | CLI 参数指定不存在的文件 | 清晰的错误信息 + exit 1                            |
| 1.3.3 | `$env:SWAGGER_PATH="E:\TeamGalleryGo\docs\swagger.json"; npm run gen:api` (PowerShell) | 环境变量指定路径         | 正常生成                                           |
| 1.3.4 | `npm run contract:validate`                                                            | schemas.ts 自动化校验    | 全部通过（无前缀残留、关键导出存在、端点数量 > 0） |
| 1.3.5 | 手动抽查：打开生成的 `schemas.ts`，确认 `paths` 内的路径与实际 API 对应                | 端点完整性               | 无遗漏                                             |

---

### 1.4 真实漂移模拟测试

**目的**：模拟后端 API 变更，验证整套系统能否捕获。

**步骤**：

| 序号  | 操作                                                                                                           | 验证点          | 预期结果                                                       |
| ----- | -------------------------------------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------- |
| 1.4.1 | **模拟后端改路径**：在后端 Go 代码中把 `/articles/{id}` 的 `@Router` 改成 `/articles/{slug}`，运行 `swag init` | swagger 更新    | `swagger.json` 中路径变更                                      |
| 1.4.2 | 在前端运行 `npm run gen:api`                                                                                   | schemas.ts 更新 | `paths` 类型中 `/articles/{id}` 消失，出现 `/articles/{slug}`  |
| 1.4.3 | 运行 `npx vue-tsc --noEmit`                                                                                    | 编译期发现错误  | 所有使用了 `contract.get('/articles/{id}')` 的地方都报类型错误 |
| 1.4.4 | 运行 `npx vitest run`                                                                                          | 测试失败        | 相关测试因找不到旧路径而失败                                   |
| 1.4.5 | 恢复后端代码和 swagger，再 `npm run gen:api` 恢复                                                              | 可逆性          | 所有检查恢复通过                                               |

---

### 1.5 CI 流水线验证

**目的**：确保 GitHub Actions 能正常运行。

**步骤**：

| 序号  | 操作                                                             | 验证点          | 预期结果                                    |
| ----- | ---------------------------------------------------------------- | --------------- | ------------------------------------------- |
| 1.5.1 | 提交 api-check.yml 到 PR 分支，观察 CI 运行                      | PR 触发         | api-check job 执行                          |
| 1.5.2 | 检查 CI 日志中的 Checkout backend repository 步骤                | 后端仓库检出    | `../TeamGalleryGo` 存在                     |
| 1.5.3 | 检查 swag init 步骤                                              | swag 安装和运行 | 生成 `swagger.json`                         |
| 1.5.4 | 检查 gen:api 步骤                                                | 类型生成        | schemas.ts 生成成功                         |
| 1.5.5 | 检查 contract drift detection 步骤                               | 漂移检测        | 无差异则通过                                |
| 1.5.6 | 故意修改一个 API 文件（如把 `article.ts` 中的路径写错），推送 PR | CI 失败         | CI 报 CONTRACT DRIFT DETECTED               |
| 1.5.7 | 确认 CI 失败后，`npm run gen:api` 然后提交生成的 schemas.ts      | CI 恢复通过     | 第二次 CI 通过                              |
| 1.5.8 | 验证定时任务（schedule）在 `api-check.yml` 中配置正确            | 凌晨 2 点触发   | workflow 中 `schedule: cron: '0 2 * * 1-5'` |
| 1.5.9 | 手动触发 `workflow_dispatch`                                     | 手动运行        | 从 GitHub Actions 页面可手动触发            |

---

## 三、阶段 2：迁移 — 逐步替换手写 API 函数

> 目标：用 `contract.*` 替代 13 个手写 API 文件，每次一个模块，保证渐进式安全迁移。

### 3.1 迁移策略

```
当前状态:  13 个手写 API 文件 + contract.ts（共存）
               │
阶段 2.1:  composables 层切换到 contract（不动 API 文件本身）
               │
阶段 2.2:  新增 API 调用强制使用 contract（ESLint rule）
               │
阶段 2.3:  逐模块迁移旧代码，删除原 API 文件
               │
目标状态:  全部使用 contract.ts，0 个手写 API 文件
```

### 3.2 第一步：补全 contract.ts 的多态返回类型

**问题**：`contract.get('/articles')` 返回 `ApiResponse<PaginatedResponse<Article>>`，但调用方通常解构 `res.data`，需要显式处理 `ApiResponse` 包装。

**决策点**（需要团队讨论）：

| 方案 | 做法                                                            | 优点     | 缺点                      |
| ---- | --------------------------------------------------------------- | -------- | ------------------------- |
| A    | `contract` 直接返回 `ApiResponse<T>`，调用方自己解              | 透明     | 每个调用都要 `res.data`   |
| B    | `contract` 自动解包：去掉 `ApiResponse` 包装，失败时抛异常      | 调用简洁 | 与当前 API 文件行为不一致 |
| C    | 提供两个版本：`contract.*` 返回原始 + `contractSafe.*` 返回解包 | 灵活     | 增加 API 表面             |

**建议**：先用方案 A（当前实现），调用方统一处理。后续如果团队觉得繁琐再引入方案 C。

### 3.3 第二步：composables 层迁移（优先级最高）

现有 composables 全部引用手写 API 文件。逐个迁移，每个迁移完跑一次测试。

**迁移清单**：

| 序号  | 文件                                                                        | 涉及的 API 调用          | 当前状态 |
| ----- | --------------------------------------------------------------------------- | ------------------------ | -------- |
| 2.3.1 | [src/composables/useAuth.ts](../src/composables/useAuth.ts)                 | login, register, refresh | 待迁移   |
| 2.3.2 | [src/composables/useProject.ts](../src/composables/useProject.ts)           | projects CRUD            | 待迁移   |
| 2.3.3 | [src/composables/useMilestone.ts](../src/composables/useMilestone.ts)       | milestones CRUD          | 待迁移   |
| 2.3.4 | [src/composables/useChat.ts](../src/composables/useChat.ts)                 | chat WebSocket + REST    | 待评估   |
| 2.3.5 | [src/composables/useNotification.ts](../src/composables/useNotification.ts) | notifications CRUD       | 待迁移   |
| 2.3.6 | [src/composables/useSearch.ts](../src/composables/useSearch.ts)             | search APIs              | 待迁移   |
| 2.3.7 | [src/composables/useUpload.ts](../src/composables/useUpload.ts)             | upload                   | 待迁移   |

**每个模块的迁移步骤**（以 useProject.ts 为例）：

```
1. git checkout -b migrate/use-project-to-contract
2. 打开 src/composables/useProject.ts
3. 将 import { getProjects, ... } from '@/api/project' 替换为 import { contract } from '@/api/contract'
4. 替换每个 API 调用：
     旧: const res = await getProjects(params)
     新: const res = await contract.get('/projects', { params: { query: params } })
5. 运行: npx vitest run src/composables/useProject.spec.ts（如果存在）
6. 运行: npx vue-tsc --noEmit
7. 运行: npm run dev，手动验证项目列表页和详情页
8. 提交: git commit -m "refactor: migrate useProject to contract client"
9. 创建 PR
```

---

### 3.4 第三步：清理手写 API 文件

当某个模块的 **所有调用方** 都已迁移到 contract 后，删除对应的 API 文件。

**删除清单**（按依赖顺序）：

| 顺序 | 文件                         | 依赖它的 composable       | 迁移状态               |
| ---- | ---------------------------- | ------------------------- | ---------------------- |
| 1    | `src/api/project.ts`         | useProject                | 待迁移                 |
| 2    | `src/api/milestone.ts`       | useMilestone              | 待迁移                 |
| 3    | `src/api/project-comment.ts` | ProjectCommentSection     | 待迁移                 |
| 4    | `src/api/comment.ts`         | CommentSection            | 待迁移                 |
| 5    | `src/api/interaction.ts`     | 多个 view                 | 待迁移                 |
| 6    | `src/api/article.ts`         | 多个 view                 | 待迁移                 |
| 7    | `src/api/manual.ts`          | ManualListView/DetailView | 待迁移                 |
| 8    | `src/api/notification.ts`    | useNotification + views   | 待迁移                 |
| 9    | `src/api/search.ts`          | useSearch                 | 待迁移                 |
| 10   | `src/api/user.ts`            | useAuth + ProfileView     | 待迁移                 |
| 11   | `src/api/admin.ts`           | Admin views               | 待迁移                 |
| 12   | `src/api/upload.ts`          | useUpload                 | 待迁移                 |
| 13   | `src/api/chat.ts`            | useChat                   | 待评估（含 WebSocket） |

---

## 四、阶段 3：扩展 — 进一步提升契约安全性

> 目标：在核心方案稳定后，逐步纳入以下扩展能力。

### 4.1 MSW Mock 自动生成 ⭐ 推荐优先做

**现状**：[`src/mocks/handlers/`](../src/mocks/handlers/) 中的 mock 是手写的，和 swagger 没有关联，容易漂移。

**方案**：从 `schemas.ts` 的 `paths` 类型自动生成 MSW handlers，至少生成路径和方法骨架，响应体可自定义。

**步骤**：

| 序号  | 操作                                                                         | 说明                               |
| ----- | ---------------------------------------------------------------------------- | ---------------------------------- |
| 4.1.1 | `npm install -D openapi-msw`                                                 | 安装 openapi → MSW 生成工具        |
| 4.1.2 | 在 `scripts/gen-api.ts` 末尾新增步骤：从 `openapi3.json` 生成 MSW handlers   | 复用已有的 openapi3.json           |
| 4.1.3 | 生成到 `src/mocks/generated/handlers.ts`                                     | 与手写 handlers 分开               |
| 4.1.4 | 在 `src/mocks/browser.ts` 和 `src/mocks/server.ts` 中合并 generated handlers | 合并使用                           |
| 4.1.5 | 提供 `customResponse` 覆盖机制                                               | 允许测试中替换特定端点的 mock 返回 |

**预期收益**：手写 mock 从 6 个 handler 文件减少到 0。新增 API 时自动获得 mock。

---

### 4.2 Breaking Change 检测

**目的**：后端 PR 中自动发现破坏性 API 变更，阻止不合规的合并。

**方案**：在后端 CI (`api-contract.yml`) 中集成 `openapi-diff`。

**步骤**：

| 序号  | 操作                                                        | 说明                                      |
| ----- | ----------------------------------------------------------- | ----------------------------------------- |
| 4.2.1 | 在后端 CI 中增加 `openapi-diff` 步骤                        | 对比 main 分支的 swagger 和 PR 的 swagger |
| 4.2.2 | 如果检测到 Breaking Change：CI 标记为 warning（不阻止合并） | 给团队可见性                              |
| 4.2.3 | 积累经验后：将 Breaking Change 升级为 error（阻止合并）     | 要求显式 approve                          |

**关键配置**（在 `api-contract.yml` 的 `steps` 中添加）：

```yaml
- name: Checkout main branch swagger
  run: |
    git fetch origin main
    git show origin/main:docs/swagger.json > /tmp/swagger-main.json

- name: API diff
  run: |
    npx openapi-diff /tmp/swagger-main.json docs/swagger.json
  continue-on-error: true # 先 warn，不 block
```

---

### 4.3 响应运行时校验 ⭐ 推荐

**目的**：即使编译期通过了，运行时也要验证后端返回的数据形状与 swagger 定义一致。

**方案**：在 axios 响应拦截器中增加 schema 校验（开发环境开启，生产环境可选）。

**步骤**：

| 序号  | 操作                                                  | 说明                              |
| ----- | ----------------------------------------------------- | --------------------------------- |
| 4.3.1 | `npm install -D ajv`                                  | JSON Schema 校验库                |
| 4.3.2 | 从 `openapi3.json` 提取每个接口的 200 response schema | 构建运行时校验 schema map         |
| 4.3.3 | 在 `request.ts` 的响应拦截器中添加校验                | 仅在 `import.meta.env.DEV` 时启用 |
| 4.3.4 | schema 校验失败时 `console.warn` + 上报 Sentry        | 不阻塞渲染                        |

**示例拦截器插入点**（在 `request.ts` 的 response fulfilled handler 中）：

```typescript
// 开发环境：响应 schema 校验
if (import.meta.env.DEV) {
  const schema = responseSchemas[originalRequest.url]
  if (schema && response.data) {
    const valid = ajv.validate(schema, response.data)
    if (!valid) {
      console.warn(`[API Schema Mismatch] ${config.url}`, ajv.errors)
      reportApiSchemaError(originalRequest.url, ajv.errors)
    }
  }
}
```

---

### 4.4 Swagger 作为 NPM 包发布

**目的**：解除前后端仓库的物理位置耦合。

**方案**：后端 CI 构建时打包 `swagger.json` → 发布到私有 npm registry → 前端 `npm install @teamgallery/api-types`。

**步骤**：

| 序号  | 操作                                                                             | 说明                               |
| ----- | -------------------------------------------------------------------------------- | ---------------------------------- |
| 4.4.1 | 在 TeamGalleryGo 后端创建 `api-types/package.json`                               | 包名 `@teamgallery/api-types`      |
| 4.4.2 | 后端 CI 在 API 变更时自动发布到 GitHub Packages                                  | 版本号与后端 release 对齐          |
| 4.4.3 | 前端 `gen-api.ts` 支持从 `node_modules/@teamgallery/api-types/swagger.json` 读取 | 新增解析路径                       |
| 4.4.4 | 前端 `package.json` 添加 `@teamgallery/api-types` 为 devDependency               | `npm install` 即可获取最新 swagger |
| 4.4.5 | Renovate/Dependabot 自动提 PR 更新 `@teamgallery/api-types` 版本                 | 自动化流程                         |

---

### 4.5 API 文档自动同步

**目的**：前端 [docs/API.md](../docs/API.md) 与 swagger 保持同步。

**方案**：从 `openapi3.json` 自动生成 API 文档的 "API 端点速查表" 章节。

**步骤**：

| 序号  | 操作                                       | 说明                          |
| ----- | ------------------------------------------ | ----------------------------- | ---- | ---- | ------ | ---- | ---------------------------------------- |
| 4.5.1 | 在 `scripts/gen-api.ts` 中添加文档生成步骤 | 从 openapi3.json 提取端点信息 |
| 4.5.2 | 生成 Markdown 表格：路径                   | 方法                          | 描述 | 认证 | 请求体 | 响应 | 生成到 `docs/generated/api-reference.md` |
| 4.5.3 | `docs/API.md` 中引用自动生成的文档         | 避免手动维护                  |

---

## 五、阶段 4：治理 — 长期维护规则

### 5.1 ESLint 规则强化

| 序号  | 操作                                                                 | 说明                    |
| ----- | -------------------------------------------------------------------- | ----------------------- |
| 5.1.1 | 添加 ESLint rule：禁止从 `@/api/*`（除 `request` 和 `contract`）导入 | 强制新代码使用 contract |
| 5.1.2 | 对旧文件添加 `// eslint-disable-next-line` 豁免                      | 逐文件迁移后删除豁免    |

**ESLint 配置示例**：

```javascript
// eslint.config.js 中添加
{
  files: ['src/composables/**/*.ts', 'src/views/**/*.vue'],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: ['@/api/article', '@/api/user', '@/api/comment',
                '@/api/project', '@/api/interaction', '@/api/search',
                '@/api/upload', '@/api/admin', '@/api/manual',
                '@/api/milestone', '@/api/notification', '@/api/chat',
                '@/api/project-comment'],
        message: '请使用 import { contract } from "@/api/contract" 替代手写 API 文件',
      }],
    }],
  },
}
```

### 5.2 后端开发者前置检查

在 [TeamGalleryGo/.husky/pre-push](../TeamGalleryGo/.husky/pre-push) 中添加：

```bash
# 检查 swagger 是否是最新的
swag init -g cmd/server/main.go -o docs --parseDependency --parseInternal
if [ -n "$(git diff --name-only docs/swagger.json)" ]; then
  echo "⚠️  swagger.json 不是最新的！请提交 swagger 变更。"
  exit 1
fi
```

### 5.3 Code Review Checklist

PR 模板中添加：

```markdown
## API 变更检查

- [ ] 后端 API 有变更时，已在后端 PR 中更新 `docs/swagger.json`
- [ ] 前端对应的 `npm run gen:api` 已运行，`schemas.ts` 已提交
- [ ] 新增 API 调用使用 `contract.*` 而非手写 API 文件
- [ ] `npx vue-tsc --noEmit` 通过
```

---

## 六、执行优先级总览

```
                    紧急度
                    高 ▲
                      │
  ┌───────────────────┼───────────────────┐
  │ 1.2 单元测试       │ 1.5 CI 验证       │
  │ 1.3 脚本验证       │ 1.1 类型校验       │
  │                    │                   │
  │      现在就做       │     本周内         │
  └───────────────────┼───────────────────┘
                      │
  ─────────────────────┼──────────────────────→ 重要度
                      │
  ┌───────────────────┼───────────────────┐
  │ 4.3 响应校验       │ 3.X composables   │
  │ 5.1 ESLint 规则    │     迁移           │
  │                    │ 4.1 MSW 自动生成   │
  │      本月内         │ 4.2 Breaking Change│
  └───────────────────┼───────────────────┘
                      │
                      ▼ 低
```

**建议执行顺序**：

```
第 1 天： 1.2 (contract 单元测试) + 1.3 (gen-api 脚本验证)
第 2 天： 1.1 (编译期类型校验) + 1.5 (CI 流水线验证)
第 3 天： 1.4 (真实漂移模拟)
第 4 天： 3.2+3.3 (composables 迁移，从 useProject 开始)
第 1 周： 4.1 (MSW 自动生成) 或 4.2 (Breaking Change 检测)
第 2 周： 5.1 (ESLint 规则) + 完成所有 composables 迁移
第 3 周： 3.4 (清理手写 API 文件)
第 4 周： 4.3 (响应运行时校验)
```

---

## 七、相关文档

- [API 契约管理](../guides/CONTRACT_MANAGEMENT.md)
- [架构设计](../project/ARCHITECTURE.md)
- [测试指南](../guides/TESTING.md)
- [代码规范](../project/CODING_STANDARDS.md)
- [开发路线图](../project/ROADMAP.md)
