import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getToken,
  setToken,
  removeToken,
  getFromStorage,
  setToStorage,
  removeFromStorage,
} from '@/utils/storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('token functions', () => {
    it('should return null when no token is set', () => {
      expect(getToken()).toBeNull()
    })

    it('should set and get token', () => {
      setToken('test-token-123')
      expect(getToken()).toBe('test-token-123')
    })

    it('should remove token', () => {
      setToken('test-token')
      removeToken()
      expect(getToken()).toBeNull()
    })
  })

  describe('generic storage functions', () => {
    it('should return default value when key does not exist', () => {
      expect(getFromStorage('nonexistent', 'default')).toBe('default')
      expect(getFromStorage('nonexistent')).toBeNull()
    })

    it('should store and retrieve objects', () => {
      const data = { name: 'test', value: 123 }
      setToStorage('test-key', data)
      expect(getFromStorage('test-key')).toEqual(data)
    })

    it('should store and retrieve arrays', () => {
      const arr = [1, 2, 3]
      setToStorage('array-key', arr)
      expect(getFromStorage('array-key')).toEqual(arr)
    })

    it('should return default value on JSON parse error', () => {
      localStorage.setItem('bad-json', '{invalid json}')
      expect(getFromStorage('bad-json', 'fallback')).toBe('fallback')
    })

    it('should remove item from storage', () => {
      setToStorage('remove-key', 'value')
      removeFromStorage('remove-key')
      expect(getFromStorage('remove-key')).toBeNull()
    })
  })
})
