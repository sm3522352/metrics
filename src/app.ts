import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import swaggerUi from "swagger-ui-express"
import { config } from "./config/app"
import { connectDatabase } from "./config/database"
import { connectRedis } from "./config/redis"
import { specs } from "./config/swagger"
import { errorHandler, notFound } from "./middleware/errorHandler"
import { logger } from "./utils/logger"

// Import routes
import authRoutes from "./routes/authRoutes"
import metricRoutes from "./routes/metricRoutes"
import eventRoutes from "./routes/eventRoutes"
import analyticsRoutes from "./routes/analyticsRoutes"

// Import models to ensure associations are set up
import "./models"

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: config.cors.origins,
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit(config.rateLimit)
app.use(limiter)

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs))

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.env,
    version: "1.0.0",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/metrics", metricRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/analytics", analyticsRoutes)

// 404 handler
app.use(notFound)

// Error handling
app.use(errorHandler)

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase()

    // Connect to Redis
    await connectRedis()

    // Start server
    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
      logger.info(`Environment: ${config.env}`)
      logger.info(`API Documentation: http://localhost:${config.port}/api-docs`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("Unhandled Promise Rejection:", err)
  process.exit(1)
})

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("Uncaught Exception:", err)
  process.exit(1)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully")
  process.exit(0)
})

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully")
  process.exit(0)
})

startServer()

export default app
