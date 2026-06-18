import type {
  ApiResponse,
  LoginParams,
  LoginResponse,
  PrivacyUpdateParams,
  ProfileUpdateParams,
  RefreshTokenResponse,
  RegisterParams,
  SearchUsersResponse,
  User,
} from '@/types'

import request from './request'

export type { LoginParams, LoginResponse, RegisterParams, User }

/**
 * 用户登录
 *
 * refresh_token 通过 HttpOnly Cookie 下发，不出现在 JSON body。
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
 * RefreshToken 通过 HttpOnly Cookie 自动携带，无需在请求体中传递。
 * 新的 refresh_token 通过 Set-Cookie 下发，JS 不可见。
 *
 * @returns 新的令牌数据
 */
export const refreshToken = (): Promise<ApiResponse<RefreshTokenResponse>> => {
  return request.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh')
}

/**
 * 登出（服务端清除 Cookie + 撤销 Refresh Token）
 *
 * Cookie 自动携带，无需请求体传参。
 *
 * @returns 操作结果
 */
export const logoutApi = (): Promise<ApiResponse> => {
  return request.post<ApiResponse>('/auth/logout')
}

/**
 * 用户搜索
 *
 * @param keyword - 搜索关键词（匹配用户名/昵称）
 * @param page - 页码，默认 1
 * @param pageSize - 每页数量，默认 10
 * @returns 用户搜索结果
 */
export const searchUsers = (
  keyword: string,
  page = 1,
  pageSize = 10,
): Promise<ApiResponse<SearchUsersResponse>> => {
  return request.get<ApiResponse<SearchUsersResponse>>('/users/search', {
    keyword,
    page,
    page_size: pageSize,
  })
}

/**
 * 更新用户隐私设置
 *
 * @param data - 隐私设置参数
 * @returns 操作结果
 */
export const updatePrivacy = (data: PrivacyUpdateParams): Promise<ApiResponse> => {
  return request.put<ApiResponse>('/user/privacy', data)
}
