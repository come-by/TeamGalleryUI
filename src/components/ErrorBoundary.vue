<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <slot name="fallback" :error="error" :retry="reset">
      <div class="error-fallback">
        <p class="error-message">{{ message }}</p>
        <button class="retry-btn" @click="reset">重试</button>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'ErrorBoundary' })
import { computed, onErrorCaptured, ref } from 'vue'

import { addBreadcrumb, reportError } from '@/utils/error-report'

const props = defineProps<{
  // 自定义错误消息
  message?: string
  // 是否自动上报（默认 true）
  report?: boolean
}>()

const hasError = ref(false)
const error = ref<Error | null>(null)

const defaultMessage = '加载失败，请重试'

const message = computed(() => props.message || defaultMessage)

onErrorCaptured((err, instance, info) => {
  hasError.value = true
  error.value = err instanceof Error ? err : new Error(String(err))

  // 上报错误
  if (props.report !== false) {
    reportError(error.value, {
      type: 'error-boundary',
      component: instance?.$options?.name || 'Anonymous',
      info,
    })
    addBreadcrumb(
      `组件错误: ${instance?.$options?.name || 'Anonymous'}`,
      'vue.errorCaptured',
      'error'
    )
  }

  // 阻止错误继续向上传播
  return false
})

const reset = () => {
  hasError.value = false
  error.value = null
}
</script>

<style scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
}

.error-message {
  color: var(--color-text-regular);
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 24px;
  border: 1px solid var(--color-primary);
  border-radius: 4px;
  background: var(--color-primary);
  color: var(--color-bg-white);
  cursor: pointer;
  transition: opacity 0.2s;
}

.retry-btn:hover {
  opacity: 0.8;
}
</style>
