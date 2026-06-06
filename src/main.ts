import 'element-plus/dist/index.css'
import './style.css'

import * as _Sentry from '@sentry/vue'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import {
  clearUserContext,
  initErrorReport,
  reportError,
  setUserContext,
} from '@/utils/error-report'

import App from './App.vue'
import router from './router'

// 初始化 MSW Mock（开发环境）
if (import.meta.env.VITE_ENABLE_MOCK === 'true') {
  const { worker } = await import('./mocks/browser')
  worker.start()
}

const app = createApp(App)

// 初始化 Sentry 错误上报
initErrorReport({
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE,
  app,
  router,
})

// 全局未捕获的 Promise rejection
window.addEventListener('unhandledrejection', (event) => {
  reportError(event.reason, {
    type: 'unhandledrejection',
  })
})

// 全局未捕获的 JS 错误
window.addEventListener('error', (event) => {
  reportError(event.error, {
    type: 'window.error',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  })
})

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// Vue 组件错误处理
app.config.errorHandler = (error, instance, info) => {
  reportError(error, {
    type: 'vue.errorHandler',
    component: instance?.$options?.name || 'Anonymous',
    info,
  })
}

app.mount('#app')

// 导出用户上下文方法供其他模块使用
export { clearUserContext, setUserContext }
