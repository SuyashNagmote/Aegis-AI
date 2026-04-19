import Redis from "ioredis";

let client: Redis | null = null;
const fallbackCache = new Map<string, string>();

function getClient() {
  if (!process.env.REDIS_URL) return null;
  if (!client) {
    client = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
  }
  return client;
}

export async function readCache(key: string) {
  const redis = getClient();
  if (!redis) return fallbackCache.get(key) ?? null;

  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    return await redis.get(key);
  } catch {
    return fallbackCache.get(key) ?? null;
  }
}

export async function writeCache(key: string, value: string) {
  const redis = getClient();
  fallbackCache.set(key, value);

  if (!redis) return;
  try {
    if (redis.status === "wait") {
      await redis.connect();
    }
    await redis.set(key, value, "EX", 300);
  } catch {
    return;
  }
}
