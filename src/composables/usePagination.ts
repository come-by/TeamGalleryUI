import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface UsePaginationOptions {
  page?: number
  pageSize?: number
}

export function usePagination<T>(
  fetchFn: (params: { page: number; page_size: number }) => Promise<T[]>,
  options: UsePaginationOptions = {}
) {
  const currentPage = ref(options.page ?? 1)
  const pageSize = ref(options.pageSize ?? 10)
  const items = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const loading = ref(false)

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value))
  const hasPrevPage = computed(() => currentPage.value > 1)
  const hasNextPage = computed(() => currentPage.value < totalPages.value)

  async function fetch() {
    loading.value = true
    try {
      const result = await fetchFn({
        page: currentPage.value,
        page_size: pageSize.value,
      })
      if (Array.isArray(result)) {
        items.value = result
      }
    } finally {
      loading.value = false
    }
  }

  function goToPage(page: number) {
    currentPage.value = page
    fetch()
  }

  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
      fetch()
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
      fetch()
    }
  }

  function reset() {
    currentPage.value = 1
    items.value = []
    total.value = 0
  }

  return {
    currentPage,
    pageSize,
    items,
    total,
    loading,
    totalPages,
    hasPrevPage,
    hasNextPage,
    fetch,
    goToPage,
    nextPage,
    prevPage,
    reset,
  }
}
