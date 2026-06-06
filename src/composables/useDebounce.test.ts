import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useDebounce } from '@/composables/useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该在延迟后更新防抖值', async () => {
    const source = ref('hello')
    const { debouncedValue } = useDebounce(source, 300)

    expect(debouncedValue.value).toBe('hello')

    source.value = 'world'
    await nextTick() // 触发 watch 回调，启动 setTimeout

    // 延迟时间未到，值不应改变
    expect(debouncedValue.value).toBe('hello')

    vi.advanceTimersByTime(300)
    expect(debouncedValue.value).toBe('world')
  })

  it('应该取消防抖', async () => {
    const source = ref('hello')
    const { debouncedValue, cancel } = useDebounce(source, 300)

    source.value = 'world'
    await nextTick() // 触发 watch，启动 setTimeout

    cancel()

    vi.advanceTimersByTime(300)
    // 取消后不应更新
    expect(debouncedValue.value).toBe('hello')
  })

  it('应该立即刷新', async () => {
    const source = ref('hello')
    const { debouncedValue, flush } = useDebounce(source, 300)

    source.value = 'world'
    await nextTick()

    flush()

    expect(debouncedValue.value).toBe('world')
  })

  it('快速连续更新只应触发一次', async () => {
    const source = ref('a')
    const { debouncedValue } = useDebounce(source, 300)

    source.value = 'b'
    await nextTick()
    vi.advanceTimersByTime(100)

    source.value = 'c'
    await nextTick()
    vi.advanceTimersByTime(100)

    source.value = 'd'
    await nextTick()

    // 前几次更新都被取消，值还是初始值
    expect(debouncedValue.value).toBe('a')

    vi.advanceTimersByTime(300)
    // 只有最后一次更新生效
    expect(debouncedValue.value).toBe('d')
  })

  it('应该显示等待状态', async () => {
    const source = ref('hello')
    const { debouncedValue, isPending } = useDebounce(source, 300)

    expect(isPending.value).toBe(false)

    source.value = 'world'
    await nextTick() // 触发 watch，设置 isPending = true
    expect(isPending.value).toBe(true)

    vi.advanceTimersByTime(300)
    expect(isPending.value).toBe(false)
    expect(debouncedValue.value).toBe('world')
  })

  it('应该使用默认 300ms 延迟', async () => {
    const source = ref('hello')
    const { debouncedValue } = useDebounce(source)

    source.value = 'world'
    await nextTick()

    vi.advanceTimersByTime(299)
    expect(debouncedValue.value).toBe('hello')

    vi.advanceTimersByTime(1)
    expect(debouncedValue.value).toBe('world')
  })

  it('空查询应正确清空', async () => {
    const source = ref('hello')
    const { debouncedValue } = useDebounce(source, 300)

    source.value = ''
    await nextTick()

    vi.advanceTimersByTime(300)
    expect(debouncedValue.value).toBe('')
  })
})

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('应该导出搜索相关的状态', async () => {
    const { useSearch } = await import('@/composables/useSearch')
    const search = useSearch()

    expect(search.searchQuery).toBeDefined()
    expect(search.suggestions).toBeDefined()
    expect(search.searchLoading).toBeDefined()
    expect(search.clearSuggestions).toBeDefined()
    expect(typeof search.handleSearch).toBe('function')

    expect(search.searchQuery.value).toBe('')
    expect(search.suggestions.value).toEqual([])
    expect(search.searchLoading.value).toBe(false)
  })

  it('clearSuggestions 应该清空搜索状态', async () => {
    const { useSearch } = await import('@/composables/useSearch')
    const search = useSearch()

    search.searchQuery.value = 'test'
    search.suggestions.value = ['test1', 'test2']
    search.clearSuggestions()

    expect(search.searchQuery.value).toBe('')
    expect(search.suggestions.value).toEqual([])
  })
})
