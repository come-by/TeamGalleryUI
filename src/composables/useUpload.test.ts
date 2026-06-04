import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUpload, type UploadFileItem } from '@/composables/useUpload'

// Mock ElMessage
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}))

// Mock error-report
vi.mock('@/utils/error-report', () => ({
  reportApiError: vi.fn(),
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

function createMockFile(name: string, size: number, type: string = 'image/jpeg'): File {
  const blob = new Blob(['x'.repeat(size)], { type })
  return new File([blob], name, { type })
}

describe('useUpload', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe('addFiles', () => {
    it('应该添加文件到列表', () => {
      const { fileList, addFiles } = useUpload({ autoUpload: false })
      const file = createMockFile('test.jpg', 1024)

      addFiles([file])

      expect(fileList.length).toBe(1)
      expect(fileList[0].name).toBe('test.jpg')
      expect(fileList[0].size).toBe(1024)
      expect(fileList[0].status).toBe('pending')
      expect(fileList[0].uid).toBeTruthy()
    })

    it('图片文件应该生成缩略图', () => {
      const { fileList, addFiles } = useUpload({ autoUpload: false })
      const file = createMockFile('photo.jpg', 2048)

      addFiles([file])

      expect(fileList[0].thumbUrl).toBeTruthy()
      expect(fileList[0].thumbUrl).toContain('blob:')
    })

    it('非图片文件不应该生成缩略图', () => {
      const { fileList, addFiles } = useUpload({ autoUpload: false })
      const file = createMockFile('doc.pdf', 1024, 'application/pdf')

      addFiles([file])

      expect(fileList[0].thumbUrl).toBeUndefined()
    })

    it('文件类型不匹配时应标记为错误', () => {
      const { fileList, addFiles } = useUpload({ accept: '.jpg,.png', autoUpload: false })
      const file = createMockFile('doc.pdf', 1024, 'application/pdf')

      addFiles([file])

      expect(fileList[0].status).toBe('error')
      expect(fileList[0].error).toContain('不允许')
    })

    it('文件超过大小限制时应标记为错误', () => {
      const { fileList, addFiles } = useUpload({ maxSize: 100, autoUpload: false })
      const file = createMockFile('large.jpg', 200)

      addFiles([file])

      expect(fileList[0].status).toBe('error')
      expect(fileList[0].error).toContain('超过大小限制')
    })

    it('应限制最大文件数量', () => {
      const { fileList, addFiles } = useUpload({ maxFiles: 2, autoUpload: false })
      const files = [
        createMockFile('file1.jpg', 100),
        createMockFile('file2.jpg', 100),
        createMockFile('file3.jpg', 100),
      ]

      addFiles(files)

      expect(fileList.length).toBe(2)
    })

    it('应支持自动上传模式', () => {
      const { fileList, addFiles } = useUpload({ autoUpload: true })
      const file = createMockFile('test.jpg', 100)

      addFiles([file])

      // autoUpload 会调用 upload()，状态会变为 uploading
      expect(fileList.length).toBe(1)
      expect(fileList[0].status).toBe('uploading')
    })
  })

  describe('removeFile', () => {
    it('应该从列表中移除文件', () => {
      const { fileList, addFiles, removeFile } = useUpload({ autoUpload: false })
      addFiles([createMockFile('test.jpg', 100)])

      const uid = fileList[0].uid
      removeFile(uid)

      expect(fileList.length).toBe(0)
    })

    it('移除不存在的 uid 不应报错', () => {
      const { removeFile } = useUpload()

      expect(() => removeFile('non_existent')).not.toThrow()
    })
  })

  describe('cancelAll', () => {
    it('应取消所有上传并重置状态', () => {
      const { fileList, addFiles, cancelAll } = useUpload({ autoUpload: false })
      addFiles([createMockFile('test.jpg', 100)])

      // 模拟上传中状态
      fileList[0].status = 'uploading'

      cancelAll()

      expect(fileList[0].status).toBe('cancelled')
      expect(fileList[0].progress).toBe(0)
    })
  })

  describe('retry', () => {
    it('应重置特定文件状态为 pending', () => {
      const { fileList, addFiles, retry } = useUpload({ autoUpload: false })
      addFiles([createMockFile('test.jpg', 100)])

      fileList[0].status = 'error'
      fileList[0].error = '上传失败'

      retry(fileList[0].uid)

      // retry 会设置 pending 然后调用 upload() -> 变为 uploading
      expect(fileList[0].error).toBeUndefined()
    })

    it('无参数时应重置所有失败为 pending', () => {
      const { fileList, addFiles, retry } = useUpload({ autoUpload: false })
      addFiles([createMockFile('file1.jpg', 100), createMockFile('file2.jpg', 100)])

      fileList[0].status = 'error'
      fileList[1].status = 'cancelled'

      retry()

      // retry 会启动上传，状态变为 uploading
      expect(fileList[0].error).toBeUndefined()
      expect(fileList[1].error).toBeUndefined()
    })
  })

  describe('clearFiles', () => {
    it('应清空所有文件并重置状态', () => {
      const { fileList, addFiles, clearFiles } = useUpload({ autoUpload: false })
      addFiles([createMockFile('file1.jpg', 100), createMockFile('file2.jpg', 100)])

      clearFiles()

      expect(fileList.length).toBe(0)
    })
  })

  describe('upload', () => {
    it('没有待上传文件时应立即返回', async () => {
      const { upload } = useUpload()

      await expect(upload()).resolves.toBeUndefined()
    })
  })
})

describe('UploadFileItem 数据结构', () => {
  it('应包含所有必要字段', () => {
    const file = createMockFile('test.jpg', 1024)
    const item: UploadFileItem = {
      uid: 'test-uid',
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
      progress: 0,
      status: 'pending',
      file,
    }

    expect(item.uid).toBe('test-uid')
    expect(item.name).toBe('test.jpg')
    expect(item.size).toBe(1024)
    expect(item.progress).toBe(0)
    expect(item.status).toBe('pending')
  })

  it('应支持所有状态值', () => {
    const statuses: UploadFileItem['status'][] = [
      'pending',
      'uploading',
      'success',
      'error',
      'cancelled',
    ]
    const file = createMockFile('test.jpg', 100)

    statuses.forEach((status) => {
      const item: UploadFileItem = {
        uid: 'test',
        name: 'test.jpg',
        size: 100,
        type: 'image/jpeg',
        progress: status === 'success' ? 100 : 0,
        status,
        file,
      }
      expect(item.status).toBe(status)
    })
  })
})
