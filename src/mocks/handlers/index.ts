import { authHandlers } from './auth'
import { articleHandlers } from './article'
import { userHandlers } from './user'
import { searchHandlers } from './search'
import { uploadHandlers } from './upload'

// 汇总所有 Mock handlers
export const handlers = [
  ...authHandlers,
  ...articleHandlers,
  ...userHandlers,
  ...searchHandlers,
  ...uploadHandlers,
]
