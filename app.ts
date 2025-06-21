import express from "express"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { appConfig } from "./config/app"

// Routes
import metricRoutes from "./routes/metricRoutes"
import eventRoutes from "./routes/eventRoutes"
import analyticsRoutes from "./routes/analyticsRoutes"

const app = express()

// Security middleware
app.use(helmet())
app.use(
  cors({
    origin: appConfig.corsOrigins,
    credentials: true,
  }),
)

// Rate limiting
const limiter = rateLimit(appConfig.rateLimit)
app.use(limiter)

// Body parsing
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api/metrics", metricRoutes)
app.use("/api/events", eventRoutes)
app.use("/api/analytics", analyticsRoutes)

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Error handling
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", error)
  res.status(500).json({
    error: appConfig.env === "production" ? "Internal server error" : error.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

const PORT = appConfig.port

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${appConfig.env}`)
})

export default app
