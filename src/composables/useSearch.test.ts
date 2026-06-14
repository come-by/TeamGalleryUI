import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

import { useSearch } from '@/composables/useSearch'

vi.mock('@/api/search', () => ({
  getSuggestions: vi.fn(),
}))

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该初始化为空状态', () => {
    const { searchQuery, suggestions, searchLoading } = useSearch()
    expect(searchQuery.value).toBe('')
    expect(suggestions.value).toEqual([])
    expect(searchLoading.value).toBe(false)
  })

  it('应该更新搜索关键词', () => {
    const { searchQuery, handleSearch } = useSearch()
    handleSearch('Vue')
    expect(searchQuery.value).toBe('Vue')
  })

  it('应该调用 API 获取搜索建议', async () => {
    const { getSuggestions } = await import('@/api/search')
    vi.mocked(getSuggestions).mockResolvedValue({
      success: true,
      data: ['Vue 3', 'Vue Router'],
    })

    const { handleSearch } = useSearch(100)

    handleSearch('Vue')

    // 等待防抖延迟 + 内部定时器
    await new Promise((resolve) => setTimeout(resolve, 500))
    await nextTick()

    expect(getSuggestions).toHaveBeenCalledWith('Vue', 10)
  })

  it('空查询应该清空建议', async () => {
    const { suggestions, searchLoading, handleSearch, searchQuery } = useSearch(100)

    // 先设置一个非空值，让 watch 能够响应对空字符串的变化
    handleSearch('test')
    await new Promise((resolve) => setTimeout(resolve, 150))
    await nextTick()

    suggestions.value = ['old suggestion']
    searchLoading.value = true

    // 再清空
    handleSearch('')
    expect(searchQuery.value).toBe('')
    await new Promise((resolve) => setTimeout(resolve, 300))
    await nextTick()

    expect(suggestions.value).toEqual([])
    expect(searchLoading.value).toBe(false)
  })

  it('clearSuggestions 应该清空所有状态', () => {
    const { searchQuery, suggestions, clearSuggestions, handleSearch } = useSearch()
    handleSearch('test')
    searchQuery.value = 'test'

    clearSuggestions()

    expect(suggestions.value).toEqual([])
    expect(searchQuery.value).toBe('')
  })

  it('搜索失败时应该静默处理', async () => {
    const { getSuggestions } = await import('@/api/search')
    vi.mocked(getSuggestions).mockRejectedValue(new Error('Network error'))

    const { suggestions, searchLoading, handleSearch } = useSearch(50)

    handleSearch('error')

    await new Promise((resolve) => setTimeout(resolve, 400))
    await nextTick()

    expect(suggestions.value).toEqual([])
    expect(searchLoading.value).toBe(false)
  })

  it('API 返回失败时应该设置空建议', async () => {
    const { getSuggestions } = await import('@/api/search')
    vi.mocked(getSuggestions).mockResolvedValue({
      success: false,
      error: { code: 'ERROR', message: 'Error' },
    })

    const { suggestions, handleSearch } = useSearch(50)
    handleSearch('test')

    await new Promise((resolve) => setTimeout(resolve, 400))
    await nextTick()

    expect(suggestions.value).toEqual([])
  })

  it('应该支持自定义防抖延迟', () => {
    const search = useSearch(500)
    expect(search.searchQuery.value).toBe('')
    expect(search.searchLoading.value).toBe(false)
  })

  it('连续快速输入应该只触发最后一次搜索', async () => {
    const { getSuggestions } = await import('@/api/search')
    vi.mocked(getSuggestions).mockResolvedValue({
      success: true,
      data: ['React'],
    })

    const { handleSearch } = useSearch(100)

    handleSearch('R')
    handleSearch('Re')
    handleSearch('Rea')
    handleSearch('Reac')
    handleSearch('React')

    await new Promise((resolve) => setTimeout(resolve, 500))
    await nextTick()

    expect(getSuggestions).toHaveBeenCalledTimes(1)
    expect(getSuggestions).toHaveBeenCalledWith('React', 10)
  })
})
