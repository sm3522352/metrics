import { MetricService } from "../../services/metricService"

describe("MetricService", () => {
  let metricService: MetricService

  beforeEach(() => {
    metricService = new MetricService()
  })

  describe("createMetric", () => {
    it("should create a new metric with generated id and timestamps", async () => {
      const metricData = {
        name: "test_metric",
        label: "Test Metric",
        color: "#ff0000",
        icon: "test-icon",
        unit: "%",
        category: "conversion" as const,
        format: (value: number) => `${value}%`,
        isActive: true,
      }

      const result = await metricService.createMetric(metricData)

      expect(result.id).toBeDefined()
      expect(result.name).toBe(metricData.name)
      expect(result.label).toBe(metricData.label)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })
  })

  describe("importMetricData", () => {
    it("should import valid data and return success count", async () => {
      const testData = [
        { date: "2024-01-01", month: "Jan 2024", value: 100 },
        { date: "2024-01-02", month: "Jan 2024", value: 150 },
      ]

      const result = await metricService.importMetricData(testData)

      expect(result.success).toBe(2)
      expect(result.errors).toHaveLength(0)
    })

    it("should handle invalid data and return errors", async () => {
      const testData = [
        { date: "2024-01-01", month: "Jan 2024", value: 100 },
        { date: "", month: "Jan 2024", value: 150 }, // Invalid: missing date
        { date: "2024-01-03", month: "Jan 2024" }, // Invalid: missing value
      ]

      const result = await metricService.importMetricData(testData)

      expect(result.success).toBe(1)
      expect(result.errors).toHaveLength(2)
    })
  })

  describe("exportMetricData", () => {
    it("should format data for export", async () => {
      const metricIds = ["metric1", "metric2"]
      const startDate = "2024-01-01"
      const endDate = "2024-01-31"

      const result = await metricService.exportMetricData(metricIds, startDate, endDate)

      expect(Array.isArray(result)).toBe(true)
      // Add more specific assertions based on your export format
    })
  })
})
