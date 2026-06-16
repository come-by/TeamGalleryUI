import type { AxiosRequestConfig } from 'axios'

import type { ApiResponse } from '@/types'

import request from './request'

export interface UploadResponse {
  url: string
  filename: string
}

export const uploadImage = (
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<ApiResponse<UploadResponse>> => {
  return request.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  } as AxiosRequestConfig)
}

export const uploadFile = (
  formData: FormData,
  onProgress?: (percent: number) => void,
): Promise<ApiResponse<UploadResponse>> => {
  return request.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onProgress
      ? (e) => e.total && onProgress(Math.round((e.loaded / e.total) * 100))
      : undefined,
  } as AxiosRequestConfig)
}

export const deleteFile = (path: string): Promise<ApiResponse> => {
  return request.delete(`/upload/${path}`)
}
