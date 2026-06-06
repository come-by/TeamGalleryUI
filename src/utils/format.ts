/**
 * 格式化日期为本地日期字符串
 *
 * @param dateStr - ISO 日期字符串
 * @returns 格式化的日期字符串（如 "2024/1/1"）
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
}

/**
 * 格式化日期为本地日期时间字符串
 *
 * @param dateStr - ISO 日期字符串
 * @returns 格式化的日期时间字符串（如 "2024/1/1 12:00:00"）
 */
export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

/**
 * 格式化相对时间（如 "3天前"、"2小时前"）
 *
 * @param dateStr - ISO 日期字符串
 * @returns 相对时间描述字符串
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)

  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

/**
 * 格式化数字（如 10000 → "1.0w"）
 *
 * @param num - 需要格式化的数字
 * @returns 格式化后的字符串
 */
export function formatNumber(num: number): string {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}w`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

/**
 * 截断文本并添加省略号
 *
 * @param text - 原始文本
 * @param maxLength - 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
