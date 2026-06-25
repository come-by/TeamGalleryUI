/**
 * 编译期类型校验测试 — 验证契约客户端的类型约束是否正确
 *
 * 此文件通过 vitest 的 expectTypeOf 验证编译期行为。
 * 同时使用 `@ts-expect-error` 验证错误用法确实被 TS 编译器拒绝。
 *
 * 运行方式: npx vitest run src/api/contract.typecheck.test.ts
 *
 * 注意：此文件依赖 npm run gen:api 生成的 schemas.ts，
 * 需要在生成后运行。
 */
import { describe, expectTypeOf, it, vi } from 'vitest'

// Mock 底层 request 模块，防止运行时发出真实 HTTP 请求
vi.mock('./request', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}))

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

  describe('路径参数可选校验', () => {
    it('params 可选 — 不传 params 编译通过', () => {
      // 路径参数标记为可选，不传 params 也编译通过
      expectTypeOf(contract.get).toBeCallableWith('/articles/{id}')
    })
  })

  describe('路径参数类型校验', () => {
    it('提供非法 path params 类型时编译报错', () => {
      // @ts-expect-error: path.id 应为 number 而非 string
      contract.get('/articles/{id}', { params: { path: { id: 'string-not-number' } } })
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
      // 验证返回值类型推导正确（类型级断言，不实际执行请求）
      type ArticlesResponse = Awaited<ReturnType<typeof contract.get<'/articles'>>>
      expectTypeOf<ArticlesResponse>().toEqualTypeOf<object>()
    })
  })
})
