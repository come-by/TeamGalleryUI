import { articleHandlers } from './article'
import { authHandlers } from './auth'
import { searchHandlers } from './search'
import { uploadHandlers } from './upload'
import { userHandlers } from './user'

// 汇总所有 Mock handlers
export const handlers = [
  ...authHandlers,
  ...articleHandlers,
  ...userHandlers,
  ...searchHandlers,
  ...uploadHandlers,
]
