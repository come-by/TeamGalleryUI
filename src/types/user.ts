import type { UserBrief } from './chat'

export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  phone?: string
  role: 'admin' | 'user'
  created_at: string
  // 扩展资料字段（来自 ProfileResponse）
  bio?: string
  website?: string
  github?: string
  twitter?: string
  location?: string
  birthday?: string
  updated_at?: string
  // 隐私设置字段
  allow_project_invite?: boolean
}

/** 隐私设置更新参数 */
export interface PrivacyUpdateParams {
  allow_project_invite: boolean
}

/** 隐私设置响应 */
export interface PrivacyResponse {
  allow_project_invite: boolean
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
  email: string
  password: string
  nickname?: string
  phone?: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  user: User
  // 注：refresh_token 通过 HttpOnly Cookie 下发，不出现在 JSON body
}

export interface SearchUsersResponse {
  data: UserBrief[]
  pagination: {
    page: number
    page_size: number
    total: number
    total_pages: number
  }
}

export interface ProfileUpdateParams {
  nickname?: string
  email?: string
  phone?: string
  avatar?: string
  bio?: string
  website?: string
  github?: string
  twitter?: string
  location?: string
  birthday?: string
}
