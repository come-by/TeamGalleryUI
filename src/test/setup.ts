/**
 * Vitest 全局测试环境配置
 *
 * 提供项目范围内通用的 mock 与 polyfill，
 * 使组件测试无需逐个处理常见依赖（vue-router、Element Plus 等）。
 *
 * 各测试文件如需覆盖某个 mock 的行为，在自身作用域内重新调用 vi.mock() 即可。
 */

import { vi } from 'vitest'

// ---------------------------------------------------------------------------
// 1. 浏览器 API polyfill — happy-dom 可能已内置，此处做兜底
// ---------------------------------------------------------------------------

// 1.1 ResizeObserver（Element Plus 组件依赖）
if (typeof globalThis.ResizeObserver === 'undefined') {
  vi.stubGlobal(
    'ResizeObserver',
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })),
  )
}

// 1.2 IntersectionObserver（vue-virtual-scroller 等组件依赖）
if (typeof globalThis.IntersectionObserver === 'undefined') {
  vi.stubGlobal(
    'IntersectionObserver',
    vi.fn(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
      root: null,
      rootMargin: '',
      thresholds: [],
      takeRecords: vi.fn(() => []),
    })),
  )
}

// ---------------------------------------------------------------------------
// 2. vue-router 全局 mock
//    覆盖 useRouter / useRoute，Mounted 组件不再因缺少路由实例而报错。
//    所有方法均为 vi.fn()，方便在单个测试中 assert 调用。
// ---------------------------------------------------------------------------

vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()

  const mockPush = vi.fn()
  const mockReplace = vi.fn()
  const mockGo = vi.fn()
  const mockBack = vi.fn()
  const mockForward = vi.fn()

  return {
    ...actual,
    useRouter: vi.fn(() => ({
      push: mockPush,
      replace: mockReplace,
      go: mockGo,
      back: mockBack,
      forward: mockForward,
      currentRoute: { value: { path: '/', query: {}, params: {}, meta: {} } },
      addRoute: vi.fn(),
      removeRoute: vi.fn(),
      getRoutes: vi.fn(() => []),
      hasRoute: vi.fn(() => false),
      resolve: vi.fn(() => ({ path: '/' })),
    })),
    useRoute: vi.fn(() => ({
      path: '/',
      params: {},
      query: {},
      hash: '',
      fullPath: '/',
      name: undefined,
      matched: [],
      meta: {},
      redirectedFrom: undefined,
    })),
  }
})

// ---------------------------------------------------------------------------
// 3. Element Plus 命令式 API stub
//    避免组件内直接调用 ElMessage / ElNotification 等触发 "not registered" 警告
// ---------------------------------------------------------------------------

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>()

  const elMessageStub = Object.assign(vi.fn(), {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    closeAll: vi.fn(),
  })

  const elNotificationStub = Object.assign(vi.fn(), {
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    closeAll: vi.fn(),
  })

  const elMessageBoxStub = Object.assign(vi.fn(), {
    alert: vi.fn(() => Promise.resolve()),
    confirm: vi.fn(() => Promise.resolve()),
    prompt: vi.fn(() => Promise.resolve()),
    close: vi.fn(),
  })

  return {
    ...actual,
    ElMessage: elMessageStub,
    ElNotification: elNotificationStub,
    ElMessageBox: elMessageBoxStub,
    ElLoading: Object.assign(vi.fn(), {
      service: vi.fn(() => ({ close: vi.fn() })),
    }),
  }
})
