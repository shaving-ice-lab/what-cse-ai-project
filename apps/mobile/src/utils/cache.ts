import Taro from "@tarojs/taro";

const CACHE_PREFIX = "cache_";
const CACHE_META_KEY = "cache_meta";

interface CacheMeta {
  key: string;
  timestamp: number;
  expireTime: number;
  version: string;
}

interface CacheItem<T> {
  data: T;
  meta: CacheMeta;
}

interface CacheConfig {
  expireMs?: number;
  version?: string;
}

const DEFAULT_EXPIRE_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = "1.0.0";

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
  set<T>(key: string, data: T, config?: CacheConfig): void {
    const { expireMs = DEFAULT_EXPIRE_MS, version = CACHE_VERSION } = config || {};
    const cacheKey = getCacheKey(key);
    const now = Date.now();

    const meta: CacheMeta = {
      key,
      timestamp: now,
      expireTime: now + expireMs,
      version,
    };

    const cacheItem: CacheItem<T> = { data, meta };

    try {
      Taro.setStorageSync(cacheKey, cacheItem);

      const allMeta = getAllCacheMeta();
      allMeta[key] = meta;
      saveCacheMeta(allMeta);
    } catch (e) {
      console.error("Cache set error:", e);
      this.clearExpired();
      try {
        Taro.setStorageSync(cacheKey, cacheItem);
      } catch {
        console.error("Cache set retry failed");
      }
    }
  },

  get<T>(key: string): T | null {
    const cacheKey = getCacheKey(key);

    try {
      const cacheItem = Taro.getStorageSync(cacheKey) as CacheItem<T> | null;
      if (!cacheItem) return null;

      const { data, meta } = cacheItem;

      if (Date.now() > meta.expireTime) {
        this.remove(key);
        return null;
      }

      if (meta.version !== CACHE_VERSION) {
        this.remove(key);
        return null;
      }

      return data;
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
    } catch (e) {
      console.error("Cache remove error:", e);
    }
  },

  clearExpired(): void {
    const allMeta = getAllCacheMeta();
    const now = Date.now();

    Object.entries(allMeta).forEach(([key, meta]) => {
      if (now > meta.expireTime || meta.version !== CACHE_VERSION) {
        this.remove(key);
      }
    });
  },

  clearAll(): void {
    const allMeta = getAllCacheMeta();
    Object.keys(allMeta).forEach((key) => {
      this.remove(key);
    });
  },

  isValid(key: string): boolean {
    const allMeta = getAllCacheMeta();
    const meta = allMeta[key];

    if (!meta) return false;
    if (Date.now() > meta.expireTime) return false;
    if (meta.version !== CACHE_VERSION) return false;

    return true;
  },

  getAge(key: string): number | null {
    const allMeta = getAllCacheMeta();
    const meta = allMeta[key];
    if (!meta) return null;
    return Date.now() - meta.timestamp;
  },
};

export const positionCache = {
  KEYS: {
    POSITION_LIST: "position_list",
    POSITION_DETAIL: (id: number) => `position_detail_${id}`,
    FAVORITES: "favorites",
    SEARCH_HISTORY: "search_history",
    FILTER_OPTIONS: "filter_options",
  },

  cachePositionList(data: any[], page: number = 1): void {
    const key = `${this.KEYS.POSITION_LIST}_page_${page}`;
    cacheManager.set(key, data, { expireMs: 30 * 60 * 1000 });
  },

  getPositionList(page: number = 1): any[] | null {
    const key = `${this.KEYS.POSITION_LIST}_page_${page}`;
    return cacheManager.get(key);
  },

  cachePositionDetail(id: number, data: any): void {
    cacheManager.set(this.KEYS.POSITION_DETAIL(id), data, {
      expireMs: 60 * 60 * 1000,
    });
  },

  getPositionDetail(id: number): any | null {
    return cacheManager.get(this.KEYS.POSITION_DETAIL(id));
  },

  cacheFavorites(data: any[]): void {
    cacheManager.set(this.KEYS.FAVORITES, data, {
      expireMs: 7 * 24 * 60 * 60 * 1000,
    });
  },

  getFavorites(): any[] | null {
    return cacheManager.get(this.KEYS.FAVORITES);
  },

  cacheSearchHistory(history: string[]): void {
    cacheManager.set(this.KEYS.SEARCH_HISTORY, history, {
      expireMs: 30 * 24 * 60 * 60 * 1000,
    });
  },

  getSearchHistory(): string[] {
    return cacheManager.get(this.KEYS.SEARCH_HISTORY) || [];
  },

  addSearchHistory(keyword: string): void {
    const history = this.getSearchHistory();
    const filtered = history.filter((k) => k !== keyword);
    const updated = [keyword, ...filtered].slice(0, 20);
    this.cacheSearchHistory(updated);
  },

  cacheFilterOptions(options: any): void {
    cacheManager.set(this.KEYS.FILTER_OPTIONS, options, {
      expireMs: 24 * 60 * 60 * 1000,
    });
  },

  getFilterOptions(): any | null {
    return cacheManager.get(this.KEYS.FILTER_OPTIONS);
  },

  clearPositionCache(): void {
    const allMeta = getAllCacheMeta();
    Object.keys(allMeta).forEach((key) => {
      if (key.startsWith("position_")) {
        cacheManager.remove(key);
      }
    });
  },
};

export function initCache(): void {
  cacheManager.clearExpired();
}
