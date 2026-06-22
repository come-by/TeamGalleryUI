import type { Article } from './article'

export interface NotificationItem extends Article {
  is_read: boolean
  notif_target_type?: string
  notif_target_data?: string
}

export interface UnreadCountResponse {
  unread_count: number
}

export interface NotificationCreateParams {
  title: string
  content: string
  summary?: string
  category?: 'system' | 'project' | 'announcement'
  urgency?: 'normal' | 'important' | 'urgent'
  scheduled_at?: string
}

// 批量通知目标
export interface BatchTarget {
  type: 'all' | 'specific_users' | 'by_role' | 'by_project' | 'by_team'
  user_ids?: number[]
  roles?: string[]
  project_ids?: number[]
  team_ids?: number[]
}

// 批量通知创建参数
export interface BatchNotificationCreateParams extends NotificationCreateParams {
  targets: BatchTarget
}

// 批量创建结果
export interface BatchCreateResult {
  notification: NotificationItem
  target_type: string
  target_summary: string
  resolved_count: number
}

// 通知模板
export interface NotificationTemplate {
  id: number
  name: string
  title: string
  content: string
  summary: string
  category: string
  urgency: string
  is_system: boolean
  sort_order: number
  created_by: number
  created_at: string
  updated_at: string
  creator?: {
    id: number
    username: string
    nickname: string
  }
}

export interface NotificationTemplateCreateParams {
  name: string
  title: string
  content: string
  summary?: string
  category?: string
  urgency?: string
}

export interface NotificationTemplateUpdateParams {
  name?: string
  title?: string
  content?: string
  summary?: string
  category?: string
  urgency?: string
  sort_order?: number
}
