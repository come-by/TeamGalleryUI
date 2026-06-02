import type { User } from './user'

export interface Comment {
  id: number
  content: string
  article_id: number
  user_id: number
  user?: User
  parent_id?: number
  like_count: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  replies?: Comment[]
}

export interface CreateCommentParams {
  content: string
  parent_id?: number
}

export interface CommentListParams {
  page?: number
  page_size?: number
}
