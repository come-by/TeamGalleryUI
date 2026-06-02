import { ref } from 'vue'
import { getSuggestions } from '@/api/search'

export function useSearch() {
  const searchQuery = ref('')
  const suggestions = ref<string[]>([])
  const searchLoading = ref(false)

  let searchTimer: ReturnType<typeof setTimeout> | null = null

  async function handleSearch(query: string) {
    clearTimeout(searchTimer!)
    if (!query) {
      suggestions.value = []
      return
    }

    searchLoading.value = true
    searchTimer = setTimeout(async () => {
      try {
        const res = await getSuggestions(query, 10)
        if (res.success) {
          suggestions.value = res.data || []
        }
      } catch (error) {
        console.error('获取搜索建议失败:', error)
      } finally {
        searchLoading.value = false
      }
    }, 300)
  }

  function clearSuggestions() {
    suggestions.value = []
    searchQuery.value = ''
  }

  return {
    searchQuery,
    suggestions,
    searchLoading,
    handleSearch,
    clearSuggestions,
  }
}
