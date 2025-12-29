import Taro from '@tarojs/taro'

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const value = Taro.getStorageSync(key)
      return value || defaultValue || null
    } catch {
      return defaultValue || null
    }
  },

  set(key: string, value: any): void {
    try {
      Taro.setStorageSync(key, value)
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  },

  clear(): void {
    try {
      Taro.clearStorageSync()
    } catch (e) {
      console.error('Storage clear error:', e)
    }
  },
}
