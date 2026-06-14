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

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
} as const

export const PROJECT_STATUS_LABEL: Record<string, string> = {
  active: '进行中',
  archived: '已归档',
}

export const PROJECT_ROLE = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
} as const

export const PROJECT_ROLE_LABEL: Record<string, string> = {
  owner: '创建者',
  admin: '管理员',
  member: '成员',
}

export const MILESTONE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
} as const

export const MILESTONE_STATUS_LABEL: Record<string, string> = {
  pending: '待开始',
  in_progress: '进行中',
  completed: '已完成',
  overdue: '已逾期',
}

export const MILESTONE_STATUS_COLOR: Record<string, string> = {
  pending: '#909399',
  in_progress: '#409EFF',
  completed: '#67C23A',
  overdue: '#F56C6C',
}
