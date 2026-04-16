const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes default
const chartCache = new Map();
const pendingRequests = new Map(); // For request deduplication

/**
 * Generates a cache key for symbol and timeframe
 */
const getCacheKey = (symbol, timeframe) => `${symbol}:${timeframe}`;

/**
 * Retrieves data from cache if valid
 */
export const getCachedData = (symbol, timeframe) => {
  const key = getCacheKey(symbol, timeframe);
  const entry = chartCache.get(key);

  if (!entry) return null;

  if (Date.now() > entry.expiry) {
    chartCache.delete(key);
    return null;
  }

  return entry.data;
};

/**
 * Sets data in cache
 */
export const setCachedData = (symbol, timeframe, data, ttl = CACHE_TTL_MS) => {
  const key = getCacheKey(symbol, timeframe);
  chartCache.set(key, {
    data,
    expiry: Date.now() + ttl
  });
  
  // Run a quick cleanup if cache gets too big (simple strategy)
  if (chartCache.size > 100) {
    cleanupCache();
  }
};

/**
 * Manages request deduplication to prevent spamming the API
 * @param {string} symbol 
 * @param {string} timeframe 
 * @param {Function} fetcher - Async function to fetch data
 * @returns {Promise}
 */
export const fetchWithDeduplication = async (symbol, timeframe, fetcher) => {
  const key = getCacheKey(symbol, timeframe);

  // 1. Check Cache
  const cached = getCachedData(symbol, timeframe);
  if (cached) return cached;

  // 2. Check Pending Requests
  if (pendingRequests.has(key)) {
    return pendingRequests.get(key);
  }

  // 3. Execute Fetch
  const promise = fetcher()
    .then(data => {
      setCachedData(symbol, timeframe, data);
      pendingRequests.delete(key);
      return data;
    })
    .catch(err => {
      pendingRequests.delete(key);
      throw err;
    });

  pendingRequests.set(key, promise);
  return promise;
};

/**
 * Removes expired entries
 */
export const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of chartCache.entries()) {
    if (now > entry.expiry) {
      chartCache.delete(key);
    }
  }
};

export default {
  getCachedData,
  setCachedData,
  fetchWithDeduplication,
  cleanupCache
};