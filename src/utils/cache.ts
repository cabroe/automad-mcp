/**
 * Centralized cache management for the MCP server.
 * Provides stats and control for all cached data.
 */

import { cache as scraperCache, CACHE_TTL_MS as SCRAPER_TTL } from "./scraper.js";
import { cache as starterKitCache, CACHE_TTL_MS as STARTER_KIT_TTL } from "../tools/get-starter-kit-file.js";

export interface CacheStats {
  scraper: {
    entries: number;
    ttlMs: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  };
  starterKit: {
    entries: number;
    ttlMs: number;
    oldestEntry: string | null;
    newestEntry: string | null;
  };
}

export function getCacheStats(): CacheStats {
  return {
    scraper: getCacheInfo(scraperCache, SCRAPER_TTL),
    starterKit: getCacheInfo(starterKitCache, STARTER_KIT_TTL),
  };
}

export function clearAllCaches(): void {
  scraperCache.clear();
  starterKitCache.clear();
}

export function clearCache(cacheName: "scraper" | "starterKit"): void {
  if (cacheName === "scraper") {
    scraperCache.clear();
  } else {
    starterKitCache.clear();
  }
}

function getCacheInfo(cache: Map<string, { timestamp: number; content: string }>, ttlMs: number) {
  const entries = cache.size;
  let oldest: string | null = null;
  let newest: string | null = null;
  let oldestTime = Infinity;
  let newestTime = 0;

  for (const [url, entry] of cache) {
    if (entry.timestamp < oldestTime) {
      oldestTime = entry.timestamp;
      oldest = url;
    }
    if (entry.timestamp > newestTime) {
      newestTime = entry.timestamp;
      newest = url;
    }
  }

  return {
    entries,
    ttlMs,
    oldestEntry: oldest,
    newestEntry: newest,
  };
}
