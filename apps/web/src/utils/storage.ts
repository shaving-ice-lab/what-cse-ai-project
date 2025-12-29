const PREFIX = 'cse_'

export const storage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(PREFIX + key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch {
      return defaultValue ?? null
    }
  },

  set(key: string, value: unknown): void {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('localStorage set error:', error)
    }
  },

  remove(key: string): void {
    localStorage.removeItem(PREFIX + key)
  },

  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  },
}

export const sessionStorage = {
  get<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = window.sessionStorage.getItem(PREFIX + key)
      if (item === null) return defaultValue ?? null
      return JSON.parse(item) as T
    } catch {
      return defaultValue ?? null
    }
  },

  set(key: string, value: unknown): void {
    try {
      window.sessionStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch (error) {
      console.error('sessionStorage set error:', error)
    }
  },

  remove(key: string): void {
    window.sessionStorage.removeItem(PREFIX + key)
  },
}
