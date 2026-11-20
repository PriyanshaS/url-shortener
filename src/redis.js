import Redis from "ioredis";

export const client =
  process.env.REDIS_HOST && process.env.REDIS_PORT
    ? new Redis({
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        tls: process.env.REDIS_TLS === "false" ? undefined : {},
        lazyConnect: true,
        connectTimeout: 3000,
      })
    : null;

if (client) {
  client.on("error", () => {});
  client.on("ready", () => {
    console.log("Redis successfully connected");
  });
  client.connect().catch((err) => {
    console.warn("WARNING !! Redis unavailable:", err.message);
  });
}
