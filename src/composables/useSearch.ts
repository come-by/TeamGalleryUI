import { ref, watch } from 'vue'

import { getSuggestions } from '@/api/search'
import { useDebounce } from '@/composables/useDebounce'

/**
 * 搜索组合式函数
 * 提供搜索输入、防抖和搜索建议功能
 *
 * @param delay - 搜索防抖延迟时间（毫秒），默认 300ms
 * @returns 搜索状态和方法
 */
export function useSearch(delay: number = 300) {
  const searchQuery = ref('')
  const suggestions = ref<string[]>([])
  const searchLoading = ref(false)

  const { debouncedValue, cancel: cancelDebounce } = useDebounce(searchQuery, delay)

  let requestTimer: ReturnType<typeof setTimeout> | null = null

  // 监听防抖后的值变化，请求搜索建议
  watch(debouncedValue, async (query) => {
    if (requestTimer) {
      clearTimeout(requestTimer)
    }

    if (!query) {
      suggestions.value = []
      searchLoading.value = false
      return
    }

    searchLoading.value = true
    requestTimer = setTimeout(async () => {
      try {
        const res = await getSuggestions(query, 10)
        if (res.success) {
          suggestions.value = res.data || []
        }
      } catch {
        suggestions.value = []
      } finally {
        searchLoading.value = false
      }
    }, 200)
  })

  function clearSuggestions() {
    suggestions.value = []
    searchQuery.value = ''
    cancelDebounce()
  }

  // 供 el-select remote-method 使用
  function handleSearch(query: string) {
    searchQuery.value = query
  }

  return {
    searchQuery,
    suggestions,
    searchLoading,
    handleSearch,
    clearSuggestions,
  }
}
