import axios from 'axios'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import type { ApiResponse } from '@/types'
import { reportApiError } from '@/utils/error-report'

export interface UploadFileItem {
  uid: string
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled'
  url?: string
  error?: string
  file: File
  thumbUrl?: string
}

export interface UploadOptions {
  url?: string
  accept?: string
  maxSize?: number // bytes, default 100MB
  maxFiles?: number // 0 means unlimited
  concurrency?: number // default 3
  retries?: number // default 3
  autoUpload?: boolean // default true
}

const DEFAULT_OPTIONS: UploadOptions = {
  url: '/upload/file',
  maxSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 0,
  concurrency: 3,
  retries: 3,
  autoUpload: true,
}

let uidCounter = 0
function generateUid(): string {
  return `upload_${Date.now()}_${++uidCounter}`
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}

/**
 * 文件上传组合式函数
 * 提供文件选择、上传、进度跟踪和取消功能
 *
 * @param options - 上传配置选项
 * @returns 上传状态对象和操作方法
 */
export function useUpload(options: UploadOptions = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const fileList = reactive<UploadFileItem[]>([])
  const uploading = ref(false)
  const totalProgress = ref(0)
  const abortControllers = new Map<string, AbortController>()

  const apiBase = `${import.meta.env.VITE_API_BASE_URL || '/api'}/v1`

  // 验证文件
  function validateFile(file: File): string | null {
    if (opts.accept) {
      const allowedTypes = opts.accept.split(',')
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase()
      const fileType = file.type.toLowerCase()
      const isValid = allowedTypes.some((t) => {
        const trimmed = t.trim().toLowerCase()
        return trimmed === fileExt || trimmed === fileType || trimmed.endsWith('/*')
      })
      if (!isValid) return `文件类型 ${fileExt} 不允许`
    }

    if (opts.maxSize && file.size > opts.maxSize) {
      return `文件 ${file.name} 超过大小限制 ${formatFileSize(opts.maxSize!)}`
    }

    return null
  }

  // 添加文件
  function addFiles(files: FileList | File[]): UploadFileItem[] {
    const arr = Array.from(files)
    const added: UploadFileItem[] = []

    for (const file of arr) {
      if (opts.maxFiles && fileList.length >= opts.maxFiles) break

      const error = validateFile(file)
      const item: UploadFileItem = {
        uid: generateUid(),
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: error ? 'error' : 'pending',
        error: error || undefined,
        file,
        thumbUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }

      fileList.push(item)
      added.push(item)
    }

    if (opts.autoUpload) {
      upload()
    }

    return added
  }

  // 移除文件
  function removeFile(uid: string) {
    const controller = abortControllers.get(uid)
    if (controller) {
      controller.abort()
      abortControllers.delete(uid)
    }
    const index = fileList.findIndex((f) => f.uid === uid)
    if (index !== -1) {
      const item = fileList[index]
      if (item.thumbUrl) URL.revokeObjectURL(item.thumbUrl)
      fileList.splice(index, 1)
    }
  }

  // 上传单个文件（带重试）
  async function uploadSingleFile(item: UploadFileItem, retriesLeft: number): Promise<void> {
    const controller = new AbortController()
    abortControllers.set(item.uid, controller)

    item.status = 'uploading'
    item.progress = 0
    item.error = undefined

    const formData = new FormData()
    formData.append('file', item.file)

    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.post<ApiResponse<{ url: string; filename: string }>>(
        `${apiBase}${opts.url}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal: controller.signal,
          timeout: 60000, // 上传超时 60s
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              item.progress = Math.round((progressEvent.loaded / progressEvent.total) * 100)
              updateTotalProgress()
            }
          },
        }
      )

      const body = response.data
      if (body.success && body.data) {
        item.status = 'success'
        item.progress = 100
        item.url = body.data.url
        item.error = undefined
      } else {
        throw new Error(body.error?.message || '上传失败')
      }
      updateTotalProgress()
    } catch (err: unknown) {
      if (axios.isCancel(err)) {
        item.status = 'cancelled'
        item.progress = 0
        return
      }

      if (retriesLeft > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return uploadSingleFile(item, retriesLeft - 1)
      }

      item.status = 'error'
      item.error = err instanceof Error ? err.message : '上传失败'
      item.progress = 0

      const msg = err instanceof Error ? err.message : '上传失败'
      ElMessage.error(`${item.name}: ${msg}`)

      reportApiError(
        { code: 'FILE_UPLOAD_FAILED', message: `上传失败: ${item.name}` },
        { url: item.name, params: { filename: item.name, size: item.size } }
      )
      updateTotalProgress()
    } finally {
      abortControllers.delete(item.uid)
    }
  }

  // 更新总进度
  function updateTotalProgress() {
    const active = fileList.filter((f) => f.status === 'uploading' || f.status === 'success')
    if (active.length === 0) {
      totalProgress.value = 0
      uploading.value = false
      return
    }
    const total = active.reduce((sum, f) => sum + f.progress, 0)
    totalProgress.value = Math.round(total / active.length)
    uploading.value = fileList.some((f) => f.status === 'uploading')
  }

  // 并发控制上传
  async function upload() {
    const pending = fileList.filter((f) => f.status === 'pending' || f.status === 'error')
    if (pending.length === 0) return

    uploading.value = true

    const queue = pending.slice()
    const concurrency = opts.concurrency || 3

    async function worker() {
      while (queue.length > 0) {
        const item = queue.shift()!
        await uploadSingleFile(item, opts.retries || 3)
      }
    }

    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, () => worker())
    await Promise.all(workers)

    uploading.value = false
    updateTotalProgress()
  }

  // 取消所有上传
  function cancelAll() {
    abortControllers.forEach((controller) => controller.abort())
    abortControllers.clear()
    fileList.forEach((f) => {
      if (f.status === 'uploading') {
        f.status = 'cancelled'
        f.progress = 0
      }
    })
    uploading.value = false
    totalProgress.value = 0
  }

  // 重试失败的文件
  function retry(uid?: string) {
    if (uid) {
      const item = fileList.find((f) => f.uid === uid)
      if (item) {
        item.status = 'pending'
        item.progress = 0
        item.error = undefined
        upload()
      }
    } else {
      fileList.forEach((f) => {
        if (f.status === 'error' || f.status === 'cancelled') {
          f.status = 'pending'
          f.progress = 0
          f.error = undefined
        }
      })
      upload()
    }
  }

  // 清空列表
  function clearFiles() {
    cancelAll()
    fileList.forEach((f) => {
      if (f.thumbUrl) URL.revokeObjectURL(f.thumbUrl)
    })
    fileList.splice(0, fileList.length)
    totalProgress.value = 0
    uploading.value = false
  }

  return {
    fileList,
    uploading,
    totalProgress,
    addFiles,
    removeFile,
    upload,
    cancelAll,
    retry,
    clearFiles,
  }
}
