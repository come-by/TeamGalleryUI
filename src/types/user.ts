export interface User {
  id: number
  username: string
  email: string
  nickname?: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  created_at: string
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
}

export interface LoginResponse {
  token: string
  user: User
}

export interface ProfileUpdateParams {
  nickname?: string
  email?: string
  avatar?: string
}
