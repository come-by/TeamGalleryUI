import request from './request'
import type {
  ApiResponse,
  User,
  LoginParams,
  RegisterParams,
  LoginResponse,
  RefreshTokenResponse,
} from '@/types'

export type { User, LoginParams, RegisterParams, LoginResponse }

export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request.post<ApiResponse<LoginResponse>>('/login', data)
}

export const register = (data: RegisterParams): Promise<ApiResponse> => {
  return request.post<ApiResponse>('/register', data)
}

export const getProfile = (): Promise<ApiResponse<User>> => {
  return request.get<ApiResponse<User>>('/profile')
}

export const deleteUser = (): Promise<ApiResponse> => {
  return request.delete<ApiResponse>('/user')
}

export const refreshToken = (): Promise<ApiResponse<RefreshTokenResponse>> => {
  return request.post<ApiResponse<RefreshTokenResponse>>('/token/refresh')
}
