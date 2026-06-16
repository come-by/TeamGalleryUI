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

export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request.post<ApiResponse<LoginResponse>>('/login', data)
}

export const register = (data: RegisterParams): Promise<ApiResponse> => {
  return request.post<ApiResponse>('/register', data)
}

export const getProfile = (): Promise<ApiResponse<User>> => {
  return request.get<ApiResponse<User>>('/profile')
}

export const updateProfile = (data: ProfileUpdateParams): Promise<ApiResponse<User>> => {
  return request.put<ApiResponse<User>>('/profile', data)
}

export const deleteUser = (): Promise<ApiResponse> => {
  return request.delete<ApiResponse>('/user')
}

export const refreshToken = (): Promise<ApiResponse<RefreshTokenResponse>> => {
  return request.post<ApiResponse<RefreshTokenResponse>>('/token/refresh')
}
