import dotenv from "dotenv"

dotenv.config()

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "3000", 10),

  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
    name: process.env.DB_NAME || "metrics_analytics",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-jwt-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  upload: {
    maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "10485760", 10), // 10MB
    allowedTypes: [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
}
