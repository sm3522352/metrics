import Redis from "redis"
import { config } from "./app"

export const redis = Redis.createClient({
  url: config.redis.url,
})

redis.on("error", (err) => {
  console.error("Redis Client Error", err)
})

redis.on("connect", () => {
  console.log("Redis connected successfully")
})

export const connectRedis = async (): Promise<void> => {
  try {
    await redis.connect()
  } catch (error) {
    console.error("Failed to connect to Redis:", error)
  }
}
