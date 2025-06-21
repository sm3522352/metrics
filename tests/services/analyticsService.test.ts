import { AnalyticsService } from "../../services/analyticsService"
import type { MetricData } from "../../models/metric"
import type { BusinessEvent } from "../../models/event"

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService

  beforeEach(() => {
    analyticsService = new AnalyticsService()
  })

  describe("calculateVolatility", () => {
    it("should calculate volatility correctly", async () => {
      const testData: MetricData[] = [
        { id: "1", metricId: "test", date: "2024-01-01", month: "Jan", value: 100, createdAt: new Date() },
        { id: "2", metricId: "test", date: "2024-01-02", month: "Jan", value: 120, createdAt: new Date() },
        { id: "3", metricId: "test", date: "2024-01-03", month: "Jan", value: 80, createdAt: new Date() },
        { id: "4", metricId: "test", date: "2024-01-04", month: "Jan", value: 110, createdAt: new Date() },
      ]

      const volatility = await analyticsService.calculateVolatility(testData, "test")

      expect(typeof volatility).toBe("number")
      expect(volatility).toBeGreaterThan(0)
    })

    it("should return 0 for insufficient data", async () => {
      const testData: MetricData[] = [
        { id: "1", metricId: "test", date: "2024-01-01", month: "Jan", value: 100, createdAt: new Date() },
      ]

      const volatility = await analyticsService.calculateVolatility(testData, "test")

      expect(volatility).toBe(0)
    })
  })

  describe("generateInsights", () => {
    it("should generate insights for significant trends", async () => {
      const metricData: MetricData[] = [
        { id: "1", metricId: "revenue", date: "2024-01-01", month: "Jan", value: 1000, createdAt: new Date() },
        { id: "2", metricId: "revenue", date: "2024-02-01", month: "Feb", value: 1500, createdAt: new Date() },
      ]

      const events: BusinessEvent[] = []
      const selectedMetrics = ["revenue"]

      const insights = await analyticsService.generateInsights(metricData, events, selectedMetrics)

      expect(Array.isArray(insights)).toBe(true)
      expect(insights.length).toBeGreaterThan(0)
      expect(insights[0]).toHaveProperty("type")
      expect(insights[0]).toHaveProperty("title")
      expect(insights[0]).toHaveProperty("priority")
    })
  })

  describe("comparePeriods", () => {
    it("should compare two periods correctly", async () => {
      const testData: MetricData[] = [
        { id: "1", metricId: "revenue", date: "2024-01-01", month: "Jan", value: 1000, createdAt: new Date() },
        { id: "2", metricId: "revenue", date: "2024-01-15", month: "Jan", value: 1100, createdAt: new Date() },
        { id: "3", metricId: "revenue", date: "2024-02-01", month: "Feb", value: 1200, createdAt: new Date() },
        { id: "4", metricId: "revenue", date: "2024-02-15", month: "Feb", value: 1300, createdAt: new Date() },
      ]

      const period1 = { start: "2024-01-01", end: "2024-01-31" }
      const period2 = { start: "2024-02-01", end: "2024-02-28" }
      const metrics = ["revenue"]

      const comparison = await analyticsService.comparePeriods(testData, period1, period2, metrics)

      expect(comparison).toHaveProperty("results")
      expect(comparison.results).toHaveLength(1)
      expect(comparison.results[0]).toHaveProperty("metricId", "revenue")
      expect(comparison.results[0]).toHaveProperty("changePercent")
    })
  })
})
