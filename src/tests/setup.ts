import { sequelize } from "../config/database"
import { redis } from "../config/redis"
import { beforeAll, afterAll, beforeEach } from "@jest/globals"

beforeAll(async () => {
  // Connect to test database
  await sequelize.authenticate()
  await sequelize.sync({ force: true })

  // Connect to Redis
  if (!redis.isOpen) {
    await redis.connect()
  }
})

afterAll(async () => {
  // Clean up database
  await sequelize.drop()
  await sequelize.close()

  // Close Redis connection
  if (redis.isOpen) {
    await redis.quit()
  }
})

beforeEach(async () => {
  // Clear all tables before each test
  await sequelize.truncate({ cascade: true })
})
