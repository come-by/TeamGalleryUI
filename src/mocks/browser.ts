// 浏览器环境 MSW 配置（用于开发时 Mock）
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

export const worker = setupWorker(...handlers)
