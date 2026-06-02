export const APP_NAME = 'TeamGallery'

export const DEFAULT_PAGE_SIZE = 10

export const ARTICLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const

export const USER_ROLE = {
  ADMIN: 'admin',
  USER: 'user',
} as const

export const COMMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const
