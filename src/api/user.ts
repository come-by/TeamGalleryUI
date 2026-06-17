import type {
  ApiResponse,
  LoginParams,
  LoginResponse,
  ProfileUpdateParams,
  RefreshTokenResponse,
  RegisterParams,
  User,
} from '@/types'

import request from './request'

export type { LoginParams, LoginResponse, RegisterParams, User }

/**
 * 用户登录
 *
 * @param data - 登录参数（用户名、密码）
 * @returns 登录响应（含 access_token 和用户信息）
 */
export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request.post<ApiResponse<LoginResponse>>('/login', data)
}

/**
 * 用户注册
 *
 * @param data - 注册参数
 * @returns 操作结果
 */
export const register = (data: RegisterParams): Promise<ApiResponse> => {
  return request.post<ApiResponse>('/register', data)
}

/**
 * 获取当前用户资料
 *
 * @returns 用户资料数据
 */
export const getProfile = (): Promise<ApiResponse<User>> => {
  return request.get<ApiResponse<User>>('/profile')
}

/**
 * 更新当前用户资料
 *
 * @param data - 资料更新参数
 * @returns 更新后的用户数据
 */
export const updateProfile = (data: ProfileUpdateParams): Promise<ApiResponse<User>> => {
  return request.put<ApiResponse<User>>('/profile', data)
}

/**
 * 注销当前用户账户
 *
 * @returns 操作结果
 */
export const deleteUser = (): Promise<ApiResponse> => {
  return request.delete<ApiResponse>('/user')
}

/**
 * 刷新访问令牌
 *
 * 使用 refresh token 换取新的双 token。
 * refresh token 通过请求体传递（与后端 /auth/refresh 对齐）。
 *
 * @returns 新的令牌数据
 */
export const refreshToken = (): Promise<ApiResponse<RefreshTokenResponse>> => {
  const rtk = localStorage.getItem('refresh_token')
  return request.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', {
    refresh_token: rtk || '',
  })
}

/**
 * 登出（服务端撤销 refresh token）
 *
 * @param refreshTokenStr 要撤销的 refresh token
 * @returns 操作结果
 */
export const logoutApi = (refreshTokenStr: string): Promise<ApiResponse> => {
  return request.post<ApiResponse>('/auth/logout', {
    refresh_token: refreshTokenStr,
  })
}
