# API 契约管理

> 本文档描述 TeamGallery 前端的 API 契约生成与防漂移机制。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-25 |

## 目录

## 1. 核心原则

## 2. 契约生成

## 3. 类型安全的 API 调用

## 4. 四层防漂移机制

## 5. 契约验证

## 6. CI/CD 集成

## 相关文档

---

> **核心原则：后端 Swagger 是唯一真理源，前端代码必须与其保持一致。**

## 1. 契约生成

后端接口变更后，运行以下命令重新生成前端类型和契约客户端：

```bash
npm run gen:api
```

生成文件：

| 文件                             | 说明                                                      |
| -------------------------------- | --------------------------------------------------------- |
| `src/types/generated/schemas.ts` | OpenAPI 3.0 TypeScript 类型（含 `paths` 和 `components`） |
| `src/api/contract.ts`            | 类型安全的 API 契约客户端                                 |

> 也可通过 `SWAGGER_PATH=./custom.json npm run gen:api` 指定自定义 swagger 路径。

## 2. 类型安全的 API 调用

**推荐方式：使用契约客户端**（编译期路径/参数/返回值校验）

```typescript
import { contract } from '@/api/contract'

// 路径、参数、返回值全部类型推导
const res = await contract.get('/articles/{id}', {
  params: { path: { id: 1 } },
})
// res 类型自动推导为 ApiResponse<Article>

// POST 请求
const created = await contract.post('/articles', {
  body: { title: '标题', content: '内容' },
})

// 带查询参数
const list = await contract.get('/articles', {
  params: { query: { page: 1, page_size: 10 } },
})
```

**向后兼容：手写 API 函数仍可使用**（无编译期校验，存在漂移风险）

```typescript
import { getArticles } from '@/api/article'
const res = await getArticles({ page: 1 })
```

## 3. 四层防漂移机制

```
Layer 1: pre-push hook
   └─ 本地推送前，若检测到后端仓库存在，自动对比 swagger 并阻止推送

Layer 2: CI 契约校验 (api-check.yml)
   └─ PR 时自动检出后端仓库，运行 gen:api，对比生成结果是否与提交一致

Layer 3: 后端发布时通知 (api-contract.yml)
   └─ 后端 push main 后，自动发布 swagger artifact，标记 API 变更

Layer 4: 定时巡检 (schedule)
   └─ 工作日凌晨自动运行契约校验，捕获遗漏的 API 变更
```

## 4. 契约验证

### 4.1 统一验证入口

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

### 4.2 验证包含

| 验证项            | 命令                                                | 说明                             |
| ----------------- | --------------------------------------------------- | -------------------------------- |
| 编译期类型校验    | `npx vitest run src/api/contract.typecheck.test.ts` | 验证非法路径/参数被 TS 拒绝      |
| 运行时行为测试    | `npx vitest run src/api/contract.test.ts`           | 验证路径替换、参数转发、错误透传 |
| schemas.ts 完整性 | `npm run contract:validate`                         | 检查生成的类型是否存在空文件     |
| 全量类型检查      | `npx vue-tsc --noEmit`                              | 无意外类型错误                   |

**通过标准**：`npm run contract:verify` 返回 exit code 0，且 `contract.ts` 覆盖率 >= 80%。

## 5. CI/CD 集成

契约校验已整合到以下 CI 流程：

| 文件                              | 触发条件       |
| --------------------------------- | -------------- |
| `.github/workflows/api-check.yml` | PR 时自动运行  |
| `.husky/pre-push`                 | 本地推送前检测 |

## 6. 后端开发者 checklist

当你修改后端 API 时：

1. 运行 `swag init -g cmd/server/main.go -o docs --parseDependency --parseInternal` 更新 swagger
2. 提交 `docs/swagger.json` 和 `docs/swagger.yaml` 的变更
3. 前端 CI 将在下一次 PR 时自动检测到契约变更
4. **建议**：同时在前端仓库提交对应的类型更新 PR

## 相关文档

- [开发指南](./DEVELOPMENT.md)
- [API 接口参考](../reference/API.md)
- [契约验证执行清单](../archive/CONTRACT_CHECKLIST.md)（已完成的验证方案）
