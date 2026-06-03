<template>
  <div class="error-page">
    <div class="error-content">
      <h1 class="error-code">{{ errorCode }}</h1>
      <p class="error-title">{{ errorTitle }}</p>
      <p class="error-description">{{ errorDescription }}</p>
      <div class="error-actions">
        <button class="action-btn primary" @click="handleAction">
          {{ actionText }}
        </button>
        <button class="action-btn" @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { addBreadcrumb } from '@/utils/error-report'

const route = useRoute()
const router = useRouter()

const errorCode = computed(() => {
  return (route.params.code as string) || '500'
})

const errorConfig: Record<string, { title: string; description: string; action: string }> = {
  '404': {
    title: '页面未找到',
    description: '您访问的页面不存在或已被移除',
    action: '返回上一页',
  },
  '403': {
    title: '无权访问',
    description: '您没有权限访问此页面，请联系管理员',
    action: '返回上一页',
  },
  '500': {
    title: '服务器错误',
    description: '服务器出了点问题，请稍后重试',
    action: '重新加载',
  },
  'network': {
    title: '网络错误',
    description: '网络连接失败，请检查网络设置',
    action: '重新加载',
  },
}

const config = computed(() => errorConfig[errorCode.value] || errorConfig['500'])

const errorTitle = computed(() => config.value.title)
const errorDescription = computed(() => config.value.description)
const actionText = computed(() => config.value.action)

const handleAction = () => {
  if (errorCode.value === '500' || errorCode.value === 'network') {
    window.location.reload()
  } else {
    router.back()
  }
}

const goHome = () => {
  router.push('/')
}

addBreadcrumb(`访问错误页面: ${errorCode.value}`, 'router', 'warning')
</script>

<style scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.error-content {
  text-align: center;
  padding: 48px;
}

.error-code {
  font-size: 120px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 24px;
  color: #303133;
  margin: 16px 0 8px;
}

.error-description {
  font-size: 14px;
  color: #909399;
  margin-bottom: 32px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  padding: 10px 24px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.action-btn.primary {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.action-btn.primary:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}
</style>
