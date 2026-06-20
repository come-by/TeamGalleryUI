import type { Article } from './article'

export interface NotificationItem extends Article {
  is_read: boolean
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
