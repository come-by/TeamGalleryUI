import request from './request'
import type { ApiResponse } from './request'

export interface UploadResponse {
  url: string
  filename: string
}

export const uploadImage = (formData: FormData): Promise<ApiResponse<UploadResponse>> => {
  return request.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const uploadFile = (formData: FormData): Promise<ApiResponse<UploadResponse>> => {
  return request.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const deleteFile = (path: string): Promise<ApiResponse> => {
  return request.delete(`/upload/${path}`)
}
