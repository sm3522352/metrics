export interface AppConfig {
  port: number
  env: string
  jwtSecret: string
  corsOrigins: string[]
  uploadLimits: {
    fileSize: number
    files: number
  }
  rateLimit: {
    windowMs: number
    max: number
  }
}

export const appConfig: AppConfig = {
  port: Number.parseInt(process.env.PORT || "3000"),
  env: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "your-secret-key",
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
  uploadLimits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
}
