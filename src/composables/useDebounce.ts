import { type Ref, ref, watch } from 'vue'

/**
 * 通用防抖 Hook
 *
 * @param value - 需要防抖的响应式值
 * @param delay - 防抖延迟时间（毫秒），默认 300ms
 * @returns 防抖后的响应式值和是否正在等待
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300) {
  const debouncedValue = ref(value.value) as Ref<T>
  const isPending = ref(false)

  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    isPending.value = false
  }

  const flush = () => {
    cancel()
    debouncedValue.value = value.value
  }

  watch(
    value,
    (newVal) => {
      cancel()
      isPending.value = true

      timer = setTimeout(() => {
        debouncedValue.value = newVal
        isPending.value = false
        timer = null
      }, delay)
    },
    { immediate: false },
  )

  return {
    debouncedValue,
    isPending,
    cancel,
    flush,
  }
}
