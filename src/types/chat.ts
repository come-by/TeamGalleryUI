/** 用户简要信息（用于会话列表和消息发送者展示） */
export interface UserBrief {
  id: number
  username: string
  nickname: string
  avatar: string
}

/** 会话列表项（列表展示用） */
export interface ConversationItem {
  conversation_id: number
  target_user: UserBrief
  last_message: string
  last_message_at: string
  unread_count: number
  is_pinned: boolean
  is_muted: boolean
}

/** 会话列表响应 */
export interface ConversationListResponse {
  conversations: ConversationItem[]
  total: number
  page: number
  page_size: number
}

/** 会话详情（单条会话），含双方用户 */
export interface ConversationDetail {
  conversation_id: number
  user1: UserBrief
  user2: UserBrief
  setting: ConversationSetting | null
}

/** 会话个人设置 */
export interface ConversationSetting {
  conversation_id: number
  user_id: number
  is_pinned: boolean
  is_muted: boolean
}

/** 消息列表项 */
export interface MessageItem {
  id: number
  conversation_id: number
  sender_id: number
  sender: UserBrief
  content: string
  is_recalled: boolean
  is_read: boolean
  created_at: string
}

/** 消息列表响应 */
export interface MessageListResponse {
  messages: MessageItem[]
  total: number
  page: number
  page_size: number
}

/** 创建会话请求 */
export interface CreateConversationParams {
  target_user_id: number
}

/** 发送消息请求 */
export interface SendMessageParams {
  content: string
}

/** 更新会话设置请求 */
export interface UpdateSettingsParams {
  is_pinned?: boolean
  is_muted?: boolean
}
