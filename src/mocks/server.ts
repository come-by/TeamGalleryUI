// Node 环境 MSW 配置（用于 Vitest 测试）
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
