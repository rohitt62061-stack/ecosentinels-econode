const CACHE_KEY = 'econode_offline_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  data: any;
  timestamp: number;
}

export function saveToCache(key: string, data: any) {
  const cache = getCache();
  cache[key] = { data, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function getFromCache(key: string): any | null {
  const cache = getCache();
  const item = cache[key];
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) return null;
  return item.data;
}

function getCache(): Record<string, CacheItem> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}
