import type { Article } from './article'

export interface NotificationItem extends Article {
  is_read: boolean
}

export interface UnreadCountResponse {
  unread_count: number
}
