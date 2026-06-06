const TOKEN_KEY = 'token'

/**
 * 获取本地存储的 Token
 *
 * @returns Token 字符串或 null
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * 设置本地存储的 Token
 *
 * @param token - Token 字符串
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * 移除本地存储的 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * 从本地存储获取数据
 *
 * @param key - 存储键名
 * @param defaultValue - 默认值（当键不存在时返回）
 * @returns 解析后的数据或默认值
 */
export function getFromStorage<T>(key: string, defaultValue: T | null = null): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * 将数据保存到本地存储
 *
 * @param key - 存储键名
 * @param value - 要存储的数据
 */
export function setToStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value))
}

/**
 * 从本地存储移除数据
 *
 * @param key - 存储键名
 */
export function removeFromStorage(key: string): void {
  localStorage.removeItem(key)
}
