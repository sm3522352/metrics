import { AnalyticsService } from "../../services/AnalyticsService"
import { MetricService } from "../../services/MetricService"
import { EventService } from "../../services/EventService"
import { UserService } from "../../services/UserService"

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService
  let metricService: MetricService
  let eventService: EventService
  let userService: UserService
  let testUser: any
  let testMetric: any

  beforeEach(async () => {
    analyticsService = new AnalyticsService()
    metricService = new MetricService()
    eventService = new EventService()
    userService = new UserService()

    // Create test user
    testUser = await userService.createUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "admin",
    })

    // Create test metric
    testMetric = await metricService.createMetric({
      name: "test_revenue",
      displayName: "Test Revenue",
      category: "financial",
      createdBy: testUser.id,
    })
  })

  describe("analyzeMetrics", () => {
    it("should analyze metrics and return analysis", async () => {
      // Add metric values with trend
      const dates = [new Date("2024-01-01"), new Date("2024-02-01"), new Date("2024-03-01"), new Date("2024-04-01")]

      const values = [100, 110, 120, 130] // Increasing trend

      for (let i = 0; i < dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, values[i], dates[i], testUser.id)
      }

      const analysis = await analyticsService.analyzeMetrics({
        metricIds: [testMetric.id],
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-04-30"),
      })

      expect(analysis).toBeDefined()
      expect(analysis.length).toBe(1)

      const metricAnalysis = analysis[0]
      expect(metricAnalysis.metricId).toBe(testMetric.id)
      expect(metricAnalysis.startValue).toBe(100)
      expect(metricAnalysis.endValue).toBe(130)
      expect(metricAnalysis.trend).toBe("increasing")
      expect(metricAnalysis.percentageChange).toBeGreaterThan(0)
    })

    it("should detect anomalies in metric data", async () => {
      // Add metric values with one anomaly
      const dates = [new Date("2024-01-01"), new Date("2024-02-01"), new Date("2024-03-01"), new Date("2024-04-01")]

      const values = [100, 110, 500, 120] // 500 is an anomaly

      for (let i = 0; i < dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, values[i], dates[i], testUser.id)
      }

      const analysis = await analyticsService.analyzeMetrics({
        metricIds: [testMetric.id],
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-04-30"),
      })

      expect(analysis).toBeDefined()
      expect(analysis.length).toBe(1)

      const metricAnalysis = analysis[0]
      expect(metricAnalysis.anomalies.length).toBeGreaterThan(0)
      expect(metricAnalysis.isAnomalous).toBe(true)
    })
  })

  describe("generateInsights", () => {
    it("should generate insights for significant changes", async () => {
      // Add metric values with significant change
      const dates = [new Date("2024-01-01"), new Date("2024-02-01")]
      const values = [100, 150] // 50% increase

      for (let i = 0; i < dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, values[i], dates[i], testUser.id)
      }

      const insights = await analyticsService.generateInsights({
        metricIds: [testMetric.id],
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-28"),
      })

      expect(insights).toBeDefined()
      expect(insights.length).toBeGreaterThan(0)

      const insight = insights.find((i) => i.type === "positive")
      expect(insight).toBeDefined()
      expect(insight!.metricIds).toContain(testMetric.id)
    })

    it("should generate insights for high volatility", async () => {
      // Add highly volatile metric values
      const dates = [new Date("2024-01-01"), new Date("2024-02-01"), new Date("2024-03-01"), new Date("2024-04-01")]

      const values = [100, 200, 50, 180] // High volatility

      for (let i = 0; i < dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, values[i], dates[i], testUser.id)
      }

      const insights = await analyticsService.generateInsights({
        metricIds: [testMetric.id],
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-04-30"),
      })

      expect(insights).toBeDefined()

      const volatilityInsight = insights.find((i) => i.title.includes("Volatility"))
      expect(volatilityInsight).toBeDefined()
      expect(volatilityInsight!.type).toBe("warning")
    })
  })

  describe("calculateEventCorrelations", () => {
    it("should calculate correlations between events and metrics", async () => {
      // Create an event
      const event = await eventService.createEvent({
        name: "Test Campaign",
        category: "marketing",
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-02-28"),
        impact: "high",
        createdBy: testUser.id,
      })

      // Add metric values before and after event
      await metricService.addMetricValue(testMetric.id, 100, new Date("2024-01-15"), testUser.id)
      await metricService.addMetricValue(testMetric.id, 150, new Date("2024-03-15"), testUser.id)

      const correlations = await analyticsService.calculateEventCorrelations(event.id, [testMetric.id])

      expect(correlations).toBeDefined()
      expect(correlations[testMetric.id]).toBeDefined()
      expect(typeof correlations[testMetric.id]).toBe("number")
    })
  })

  describe("getMetricComparison", () => {
    it("should compare metrics between two periods", async () => {
      // Add metric values for two different periods
      const period1Dates = [new Date("2024-01-01"), new Date("2024-01-15")]
      const period1Values = [100, 110]

      const period2Dates = [new Date("2024-02-01"), new Date("2024-02-15")]
      const period2Values = [120, 130]

      // Add period 1 values
      for (let i = 0; i < period1Dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, period1Values[i], period1Dates[i], testUser.id)
      }

      // Add period 2 values
      for (let i = 0; i < period2Dates.length; i++) {
        await metricService.addMetricValue(testMetric.id, period2Values[i], period2Dates[i], testUser.id)
      }

      const comparison = await analyticsService.getMetricComparison(
        testMetric.id,
        { start: new Date("2024-01-01"), end: new Date("2024-01-31") },
        { start: new Date("2024-02-01"), end: new Date("2024-02-28") },
      )

      expect(comparison).toBeDefined()
      expect(comparison.period1Avg).toBe(105) // (100 + 110) / 2
      expect(comparison.period2Avg).toBe(125) // (120 + 130) / 2
      expect(comparison.change).toBe(20) // 125 - 105
      expect(comparison.changePercent).toBeCloseTo(19.05, 1) // ((125 - 105) / 105) * 100
      expect(comparison.significance).toBe("medium") // > 10% change
    })
  })

  describe("generateWhatIfScenario", () => {
    it("should generate what-if scenario with assumptions", async () => {
      // Add some baseline metric values
      await metricService.addMetricValue(testMetric.id, 100, new Date("2024-01-01"), testUser.id)
      await metricService.addMetricValue(testMetric.id, 110, new Date("2024-02-01"), testUser.id)

      const scenario = await analyticsService.generateWhatIfScenario(
        "Growth Scenario",
        { [testMetric.id]: 20 }, // 20% increase assumption
        {
          metricIds: [testMetric.id],
          startDate: new Date("2024-01-01"),
          endDate: new Date("2024-02-28"),
        },
      )

      expect(scenario).toBeDefined()
      expect(scenario.scenarioName).toBe("Growth Scenario")
      expect(scenario.assumptions[testMetric.id]).toBe(20)
      expect(scenario.projectedValues[testMetric.id]).toBeDefined()
      expect(scenario.confidence).toBeGreaterThan(0)
      expect(scenario.confidence).toBeLessThanOrEqual(1)
    })
  })
})
