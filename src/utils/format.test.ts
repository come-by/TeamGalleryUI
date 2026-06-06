import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
  truncateText,
} from '@/utils/format'

describe('formatDate', () => {
  it('should format date string to Chinese date format', () => {
    const result = formatDate('2024-01-15T10:30:00Z')
    expect(result).toBe('2024/1/15')
  })

  it('should return empty string for empty input', () => {
    expect(formatDate('')).toBe('')
    expect(formatDate(null as unknown as string)).toBe('')
    expect(formatDate(undefined as unknown as string)).toBe('')
  })
})

describe('formatDateTime', () => {
  it('should format date string to Chinese datetime format', () => {
    const result = formatDateTime('2024-01-15T10:30:00Z')
    expect(result).toContain('2024')
    expect(result).toContain('1')
    expect(result).toContain('15')
  })

  it('should return empty string for empty input', () => {
    expect(formatDateTime('')).toBe('')
  })
})

describe('formatRelativeTime', () => {
  it('should return 刚刚 for recent time', () => {
    const now = new Date().toISOString()
    expect(formatRelativeTime(now)).toBe('刚刚')
  })

  it('should return empty string for empty input', () => {
    expect(formatRelativeTime('')).toBe('')
  })
})

describe('formatNumber', () => {
  it('should format numbers >= 10000 with w suffix', () => {
    expect(formatNumber(15000)).toBe('1.5w')
    expect(formatNumber(10000)).toBe('1.0w')
  })

  it('should format numbers >= 1000 with k suffix', () => {
    expect(formatNumber(1500)).toBe('1.5k')
    expect(formatNumber(1000)).toBe('1.0k')
  })

  it('should return original number for small values', () => {
    expect(formatNumber(999)).toBe('999')
    expect(formatNumber(0)).toBe('0')
  })
})

describe('truncateText', () => {
  it('should truncate text longer than maxLength', () => {
    expect(truncateText('hello world', 5)).toBe('hello...')
  })

  it('should not truncate text shorter than maxLength', () => {
    expect(truncateText('hello', 10)).toBe('hello')
  })

  it('should handle exact length', () => {
    expect(truncateText('hello', 5)).toBe('hello')
  })
})
