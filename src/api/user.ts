import request from './request'
import type { ApiResponse, User, LoginParams, RegisterParams, LoginResponse } from '@/types'

export type { User, LoginParams, RegisterParams, LoginResponse }

export const login = (data: LoginParams): Promise<ApiResponse<LoginResponse>> => {
  return request.post('/login', data)
}

export const register = (data: RegisterParams): Promise<ApiResponse> => {
  return request.post('/register', data)
}

export const getProfile = (): Promise<ApiResponse<User>> => {
  return request.get('/profile')
}

export const deleteUser = (): Promise<ApiResponse> => {
  return request.delete('/user')
}
