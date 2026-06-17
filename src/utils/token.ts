/**
 * JWT 客户端工具
 *
 * 职责：
 * - 解码 JWT payload（仅读取，不校验签名——签名校验是服务端的事）
 * - 判断 token 是否已过期 / 即将过期
 *
 * 企业要求：客户端应主动检测 token 有效期，避免过期 token 残留在页面上。
 */

interface JwtPayload {
  exp?: number
  iat?: number
  user_id?: number
  username?: string
  role?: string
  token_type?: string
  version?: number
  [key: string]: unknown
}

/**
 * Base64 URL 解码。
 *
 * @param str - 待解码的 Base64 URL 字符串
 * @returns 解码后的原始字符串，失败返回空串
 */
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  try {
    return decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
  } catch {
    return ''
  }
}

/**
 * 解码 JWT token 的 payload 部分（不校验签名）。
 *
 * @param token - JWT token 字符串（或 null/undefined）
 * @returns 解码后的 payload，失败返回 null
 */
export function decodeToken(token: string | null | undefined): JwtPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = base64UrlDecode(parts[1])
    if (!payload) return null
    return JSON.parse(payload) as JwtPayload
  } catch {
    return null
  }
}

/**
 * 判断 token 是否已过期。
 *
 * 对比 token 中的 exp（秒级时间戳）与当前时间。
 *
 * @param token - JWT token 字符串（或 null/undefined）
 * @param graceSeconds - 宽限秒数，避免服务器-客户端时差导致误判，默认 30s
 * @returns 是否已过期
 */
export function isTokenExpired(token: string | null | undefined, graceSeconds = 30): boolean {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) {
    // 无法解码或没有 exp → 视为过期，强制重新验证
    return true
  }
  const now = Math.floor(Date.now() / 1000)
  return payload.exp + graceSeconds <= now
}

/**
 * 判断 token 是否即将过期。
 *
 * @param token - JWT token 字符串（或 null/undefined）
 * @param withinSeconds - 从现在起多少秒内过期视为"即将过期"，默认 300s（5 分钟）
 * @returns 是否即将过期
 */
export function willTokenExpireSoon(
  token: string | null | undefined,
  withinSeconds = 300,
): boolean {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return true
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now + withinSeconds
}

/**
 * 获取 token 剩余的秒数。
 *
 * @param token - JWT token 字符串（或 null/undefined）
 * @returns 剩余秒数；token 无效或已过期返回 0
 */
export function getTokenRemainingSeconds(token: string | null | undefined): number {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) return 0
  const now = Math.floor(Date.now() / 1000)
  return Math.max(0, payload.exp - now)
}
