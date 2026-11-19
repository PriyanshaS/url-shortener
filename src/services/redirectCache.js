import { pool } from "../db.js";
import Redis from "ioredis";

const client =
  process.env.REDIS_HOST && process.env.REDIS_PORT
    ? new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        tls: {},
        lazyConnect: true,
        connectTimeout: 3000,
      })
    : null;

if (client) {
  client.on("error", () => {});
  client.connect().catch((err) => {
    console.warn(
      "WARNING !! Cache unavailable; using PostgreSQL:",
      err.message,
    );
  });
}

const memory = new Map();
const MEMORY_MAX = 10000;
const MEMORY_TTL_MS = 60 * 1000;
const REDIS_TTL_SECONDS = 24 * 60 * 60;

export async function getLongUrl(code) {
  if (memory.has(code)) return memory.get(code);
  if (client?.status === "ready") {
    try {
      const cached = await client.get(code);
      if (cached) {
        saveToMemory(code, cached);
        return cached;
      }
    } catch (err) {}
  }

  const { rows } = await pool.query(
    `SELECT long_url FROM urls
     WHERE code = $1 AND (expires_at IS NULL OR expires_at > now())`,
    [code],
  );
  if (rows.length === 0) return null;

  const longUrl = rows[0].long_url;

  saveToMemory(code, longUrl);
  if (client?.status === "ready") {
    client.set(code, longUrl, "EX", REDIS_TTL_SECONDS).catch(() => {});
  }

  return longUrl;
}

function saveToMemory(code, longUrl) {
  if (memory.size >= MEMORY_MAX) {
    memory.delete(memory.keys().next().value);
  }
  memory.set(code, longUrl);
  setTimeout(() => memory.delete(code), MEMORY_TTL_MS).unref();
}
