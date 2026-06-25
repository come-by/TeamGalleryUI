/**
 * 类型安全的 API 契约客户端
 *
 * 基于 openapi-typescript 生成的 paths 类型，提供编译期路径/参数/返回值校验。
 * 底层复用现有的 axios 拦截器（auth、错误处理、重试、防重放等）。
 *
 * 当后端 Swagger 变更后，运行 `npm run gen:api` 重新生成 schemas.ts，
 * 此文件会立即反映出所有 API 变更，TypeScript 编译器会在编译期捕获不匹配。
 *
 * @example
 * ```typescript
 * import { contract } from '@/api/contract'
 *
 * // 参数和返回值完全类型推导
 * const res = await contract.get('/articles/{id}', {
 *   params: { path: { id: 1 } }
 * })
 * // res 类型自动推导为 ApiResponse<Article>
 * ```
 */
import type { paths } from '@/types/generated/schemas'

import request from './request'

// ============================================================
// 类型工具：从 paths 类型中提取请求/响应类型
// ============================================================

/** 提取某个操作的 path 参数类型 */
type PathParams<Op> = Op extends { parameters: { path: infer P } } ? P : never

/** 提取某个操作的 query 参数类型 */
type QueryParams<Op> = Op extends { parameters: { query: infer P } } ? P : never

/** 提取某个操作的请求体类型 */
type RequestBody<Op> = Op extends { requestBody: { content: { 'application/json': infer B } } }
  ? B
  : never

/** 提取某个操作的 200 响应体类型 */
type ResponseBody<Op> = Op extends {
  responses: { 200: { content: { 'application/json': infer R } } }
}
  ? R
  : Op extends { responses: { 201: { content: { 'application/json': infer R } } } }
    ? R
    : Op extends { responses: { 204: { content: infer _C } } }
      ? void
      : never

// ============================================================
// 操作方法类型
// ============================================================

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head' | 'options'

/** 获取某个路径下指定方法对应的操作类型 */
type Operation<P extends keyof paths, M extends Method> =
  paths[P] extends Record<M, infer Op> ? Op : never

// ============================================================
// 请求参数
// ============================================================

interface RequestOptions<P extends keyof paths, M extends Method> {
  /** 路径参数，如 /articles/{id} 中的 {id} */
  params?: {
    path?: PathParams<Operation<P, M>>
    query?: QueryParams<Operation<P, M>>
  }
  /** 请求体（仅 POST/PUT/PATCH） */
  body?: RequestBody<Operation<P, M>>
  /** axios 额外配置 */
  config?: Record<string, unknown>
}

// ============================================================
// 类型安全契约客户端
// ============================================================

/**
 * 发送类型安全的 GET 请求
 *
 * @param path - API 路径（从 swagger 生成，如 '/articles/{id}'）
 * @param options - 路径参数和查询参数
 * @returns 类型推导的响应数据
 */
async function contractGet<P extends keyof paths>(
  path: P,
  options?: Omit<RequestOptions<P, 'get'>, 'body'>,
): Promise<ResponseBody<Operation<P, 'get'>>> {
  // 替换路径参数
  let resolvedPath = path as string
  if (options?.params?.path) {
    for (const [key, value] of Object.entries(options.params.path)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value))
    }
  }
  return request.get(resolvedPath, options?.params?.query, options?.config)
}

/**
 * 发送类型安全的 POST 请求
 *
 * @param path - API 路径（从 swagger 生成，如 '/articles/{id}'）
 * @param options - 路径参数、请求体和额外配置
 * @returns 类型推导的响应数据
 */
async function contractPost<P extends keyof paths>(
  path: P,
  options?: RequestOptions<P, 'post'>,
): Promise<ResponseBody<Operation<P, 'post'>>> {
  let resolvedPath = path as string
  if (options?.params?.path) {
    for (const [key, value] of Object.entries(options.params.path)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value))
    }
  }
  return request.post(resolvedPath, options?.body, {
    params: options?.params?.query,
    ...options?.config,
  })
}

/**
 * 发送类型安全的 PUT 请求
 *
 * @param path - API 路径（从 swagger 生成，如 '/articles/{id}'）
 * @param options - 路径参数、请求体和额外配置
 * @returns 类型推导的响应数据
 */
async function contractPut<P extends keyof paths>(
  path: P,
  options?: RequestOptions<P, 'put'>,
): Promise<ResponseBody<Operation<P, 'put'>>> {
  let resolvedPath = path as string
  if (options?.params?.path) {
    for (const [key, value] of Object.entries(options.params.path)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value))
    }
  }
  return request.put(resolvedPath, options?.body, {
    params: options?.params?.query,
    ...options?.config,
  })
}

/**
 * 发送类型安全的 DELETE 请求
 *
 * @param path - API 路径（从 swagger 生成，如 '/articles/{id}'）
 * @param options - 路径参数、查询参数和额外配置
 * @returns 类型推导的响应数据
 */
async function contractDelete<P extends keyof paths>(
  path: P,
  options?: Omit<RequestOptions<P, 'delete'>, 'body'>,
): Promise<ResponseBody<Operation<P, 'delete'>>> {
  let resolvedPath = path as string
  if (options?.params?.path) {
    for (const [key, value] of Object.entries(options.params.path)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value))
    }
  }
  return request.delete(resolvedPath, options?.params?.query, options?.config)
}

/**
 * 发送类型安全的 PATCH 请求
 *
 * @param path - API 路径（从 swagger 生成，如 '/articles/{id}'）
 * @param options - 路径参数、请求体和额外配置
 * @returns 类型推导的响应数据
 */
async function contractPatch<P extends keyof paths>(
  path: P,
  options?: RequestOptions<P, 'patch'>,
): Promise<ResponseBody<Operation<P, 'patch'>>> {
  let resolvedPath = path as string
  if (options?.params?.path) {
    for (const [key, value] of Object.entries(options.params.path)) {
      resolvedPath = resolvedPath.replace(`{${key}}`, String(value))
    }
  }
  return request.patch(resolvedPath, options?.body, {
    params: options?.params?.query,
    ...options?.config,
  })
}

/** 类型安全契约客户端 */
export const contract = {
  get: contractGet,
  post: contractPost,
  put: contractPut,
  delete: contractDelete,
  patch: contractPatch,
}

// ============================================================
// 迁移辅助：从旧 API 模块到契约客户端的对照
// ============================================================

/**
 * 迁移对照表
 *
 * 旧方式（手写，无编译期校验）:
 *   import { getArticles } from '@/api/article'
 *   const res = await getArticles({ page: 1 })
 *
 * 新方式（契约校验，编译期可发现路径/参数变更）:
 *   import { contract } from '@/api/contract'
 *   const res = await contract.get('/articles', {
 *     params: { query: { page: 1 } }
 *   })
 *
 * 常用端点速查:
 *   GET    /articles            → contract.get('/articles')
 *   GET    /articles/{id}       → contract.get('/articles/{id}', { params: { path: { id: 1 } } })
 *   POST   /articles            → contract.post('/articles', { body: { ... } })
 *   PUT    /articles/{id}       → contract.put('/articles/{id}', { params: { path: { id: 1 } }, body: { ... } })
 *   DELETE /articles/{id}       → contract.delete('/articles/{id}', { params: { path: { id: 1 } } })
 *   GET    /projects            → contract.get('/projects')
 *   POST   /projects            → contract.post('/projects', { body: { ... } })
 *   GET    /projects/{id}       → contract.get('/projects/{id}', { params: { path: { id: 1 } } })
 *   PUT    /projects/{id}       → contract.put('/projects/{id}', { params: { path: { id: 1 } }, body: { ... } })
 *   GET    /users/{user_id}/articles → contract.get('/users/{user_id}/articles', { params: { path: { user_id: 1 } } })
 */
