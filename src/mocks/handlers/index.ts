import { authHandlers } from './auth'
import { articleHandlers } from './article'
import { userHandlers } from './user'

// 汇总所有 Mock handlers
export const handlers = [
  ...authHandlers,
  ...articleHandlers,
  ...userHandlers,
]
