import Taro from "@tarojs/taro";

const CACHE_PREFIX = "mp_cache_";
const CACHE_META_KEY = "mp_cache_meta";

interface CacheMeta {
  key: string;
  timestamp: number;
  expireTime: number;
}

interface CacheItem<T> {
  data: T;
  meta: CacheMeta;
}

const DEFAULT_EXPIRE_MS = 24 * 60 * 60 * 1000;

function getCacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

function getAllCacheMeta(): Record<string, CacheMeta> {
  try {
    return Taro.getStorageSync(CACHE_META_KEY) || {};
  } catch {
    return {};
  }
}

function saveCacheMeta(meta: Record<string, CacheMeta>): void {
  try {
    Taro.setStorageSync(CACHE_META_KEY, meta);
  } catch (e) {
    console.error("Save cache meta error:", e);
  }
}

export const cacheManager = {
  set<T>(key: string, data: T, expireMs: number = DEFAULT_EXPIRE_MS): void {
    const cacheKey = getCacheKey(key);
    const now = Date.now();

    const meta: CacheMeta = {
      key,
      timestamp: now,
      expireTime: now + expireMs,
    };

    const cacheItem: CacheItem<T> = { data, meta };

    try {
      Taro.setStorageSync(cacheKey, cacheItem);
      const allMeta = getAllCacheMeta();
      allMeta[key] = meta;
      saveCacheMeta(allMeta);
    } catch {
      this.clearExpired();
    }
  },

  get<T>(key: string): T | null {
    const cacheKey = getCacheKey(key);
    try {
      const cacheItem = Taro.getStorageSync(cacheKey) as CacheItem<T> | null;
      if (!cacheItem) return null;

      if (Date.now() > cacheItem.meta.expireTime) {
        this.remove(key);
        return null;
      }
      return cacheItem.data;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    const cacheKey = getCacheKey(key);
    try {
      Taro.removeStorageSync(cacheKey);
      const allMeta = getAllCacheMeta();
      delete allMeta[key];
      saveCacheMeta(allMeta);
    } catch {}
  },

  clearExpired(): void {
    const allMeta = getAllCacheMeta();
    const now = Date.now();
    Object.entries(allMeta).forEach(([key, meta]) => {
      if (now > meta.expireTime) {
        this.remove(key);
      }
    });
  },

  clearAll(): void {
    const allMeta = getAllCacheMeta();
    Object.keys(allMeta).forEach((key) => this.remove(key));
  },
};

export const dataCache = {
  KEYS: {
    POSITIONS: "positions",
    POSITION: (id: number) => `position_${id}`,
    ANNOUNCEMENTS: "announcements",
    MATCH_RESULT: "match_result",
    FILTER_OPTIONS: "filter_options",
  },

  cachePositions(data: any[], page = 1): void {
    cacheManager.set(`${this.KEYS.POSITIONS}_${page}`, data, 30 * 60 * 1000);
  },

  getPositions(page = 1): any[] | null {
    return cacheManager.get(`${this.KEYS.POSITIONS}_${page}`);
  },

  cachePosition(id: number, data: any): void {
    cacheManager.set(this.KEYS.POSITION(id), data, 60 * 60 * 1000);
  },

  getPosition(id: number): any | null {
    return cacheManager.get(this.KEYS.POSITION(id));
  },

  cacheAnnouncements(data: any[]): void {
    cacheManager.set(this.KEYS.ANNOUNCEMENTS, data, 30 * 60 * 1000);
  },

  getAnnouncements(): any[] | null {
    return cacheManager.get(this.KEYS.ANNOUNCEMENTS);
  },

  cacheMatchResult(data: any): void {
    cacheManager.set(this.KEYS.MATCH_RESULT, data, 10 * 60 * 1000);
  },

  getMatchResult(): any | null {
    return cacheManager.get(this.KEYS.MATCH_RESULT);
  },

  cacheFilterOptions(data: any): void {
    cacheManager.set(this.KEYS.FILTER_OPTIONS, data, 24 * 60 * 60 * 1000);
  },

  getFilterOptions(): any | null {
    return cacheManager.get(this.KEYS.FILTER_OPTIONS);
  },
};

export function initCache(): void {
  cacheManager.clearExpired();
}
