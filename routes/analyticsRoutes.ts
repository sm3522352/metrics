import { Router } from "express"
import { AnalyticsService } from "../services/analyticsService"
import { MetricService } from "../services/metricService"
import { EventService } from "../services/eventService"
import { AuthMiddleware } from "../middleware/auth"

const router = Router()
const analyticsService = new AnalyticsService()
const metricService = new MetricService()
const eventService = new EventService()

// GET /api/analytics/insights - Получить инсайты
router.get("/insights", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { metricIds, startDate, endDate } = req.query

    const metricData = await metricService.getMetricData(
      (metricIds as string).split(","),
      startDate as string,
      endDate as string,
    )

    const events = await eventService.getEventsByPeriod(startDate as string, endDate as string)

    const insights = await analyticsService.generateInsights(metricData, events, (metricIds as string).split(","))

    res.json(insights)
  } catch (error) {
    res.status(500).json({ error: "Failed to generate insights" })
  }
})

// POST /api/analytics/compare - Сравнить периоды
router.post("/compare", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { period1, period2, metrics } = req.body

    const allData = await metricService.getMetricData(metrics, period1.start, period2.end)

    const comparison = await analyticsService.comparePeriods(allData, period1, period2, metrics)

    res.json(comparison)
  } catch (error) {
    res.status(500).json({ error: "Failed to compare periods" })
  }
})

// GET /api/analytics/volatility/:metricId - Получить волатильность метрики
router.get("/volatility/:metricId", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const data = await metricService.getMetricData([req.params.metricId], startDate as string, endDate as string)

    const volatility = await analyticsService.calculateVolatility(data, req.params.metricId)

    res.json({ volatility })
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate volatility" })
  }
})

export default router
