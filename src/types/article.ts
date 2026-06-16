import type { User } from './user'

export interface Article {
  id: number
  title: string
  content: string
  summary?: string
  type: 'article' | 'manual' | 'notification'
  status: 'draft' | 'published' | 'archived'
  user_id: number
  user?: User
  category_id?: number
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  published_at?: string
  updated_at: string
}

export interface ArticleListParams {
  page?: number
  page_size?: number
  keyword?: string
  status?: string
}

export interface ArticleCreateParams {
  title: string
  content: string
  summary?: string
  type?: 'article' | 'manual' | 'notification'
  status?: 'draft' | 'published'
  category_id?: number
}

export interface ArticleUpdateParams extends Partial<ArticleCreateParams> {
  id: number
}
