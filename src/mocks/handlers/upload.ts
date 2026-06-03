import { http } from 'msw'
import { delay, successResponse, errorResponse, verifyToken } from '../utils'

interface MockFile {
  filename: string
  url: string
  size: number
  mimetype: string
}

const uploadedFiles: MockFile[] = []

export const uploadFileHandler = http.post('/api/v1/upload/file', async ({ request }) => {
  await delay(500)

  const isValidToken = verifyToken(request)
  if (!isValidToken) {
    return errorResponse('UNAUTHORIZED', '未登录', 401)
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return errorResponse('BAD_REQUEST', '请选择要上传的文件', 400)
  }

  // 检查文件大小（超过 10MB 模拟失败）
  if (file.size > 10 * 1024 * 1024) {
    return errorResponse('FILE_TOO_LARGE', '文件过大，请上传 10MB 以内的文件', 400)
  }

  // 检查文件类型
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx', '.zip']
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!allowedTypes.includes(ext)) {
    return errorResponse('FILE_TYPE_NOT_ALLOWED', `文件类型 ${ext} 不允许上传`, 400)
  }

  const fileRecord: MockFile = {
    filename: file.name,
    url: `/uploads/${Date.now()}_${file.name}`,
    size: file.size,
    mimetype: file.type,
  }

  uploadedFiles.push(fileRecord)

  return successResponse({
    url: fileRecord.url,
    filename: fileRecord.filename,
  })
})

export const uploadImageHandler = http.post('/api/v1/upload/image', async ({ request }) => {
  await delay(500)

  const isValidToken = verifyToken(request)
  if (!isValidToken) {
    return errorResponse('UNAUTHORIZED', '未登录', 401)
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return errorResponse('BAD_REQUEST', '请选择要上传的图片', 400)
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  if (!imageTypes.includes(ext)) {
    return errorResponse('FILE_TYPE_NOT_ALLOWED', '请上传图片格式的文件', 400)
  }

  if (file.size > 5 * 1024 * 1024) {
    return errorResponse('FILE_TOO_LARGE', '图片过大，请上传 5MB 以内的图片', 400)
  }

  return successResponse({
    url: `/uploads/${Date.now()}_${file.name}`,
    filename: file.name,
  })
})

export const deleteFileHandler = http.delete('/api/v1/upload/:path', async ({ request, params }) => {
  await delay(200)

  const isValidToken = verifyToken(request)
  if (!isValidToken) {
    return errorResponse('UNAUTHORIZED', '未登录', 401)
  }

  // 404 模拟
  if (params.path === 'not_found.txt') {
    return errorResponse('FILE_NOT_FOUND', '文件不存在', 404)
  }

  return successResponse(null)
})

export const uploadHandlers = [
  uploadFileHandler,
  uploadImageHandler,
  deleteFileHandler,
]
