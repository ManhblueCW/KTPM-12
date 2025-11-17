import redis from "redis";

const client = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

client.connect().catch(console.error);

export async function getCache (key) {
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET error:", err);
    return null;
  }
}

export async function setCache (key, value, ttl = 60) {
  try {
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET error:", err);
  }
}

export async function delCache (pattern) {
  try {
    const keys = await client.keys(pattern);
    for (const key of keys) await client.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err);
  }
}
