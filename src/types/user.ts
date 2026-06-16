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
  refresh_token: string
  expires_in: number
  user: User
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
