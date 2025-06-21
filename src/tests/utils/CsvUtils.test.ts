import { CsvUtils } from "../../utils/csvUtils"

describe("CsvUtils", () => {
  describe("parseCSV", () => {
    it("should parse valid CSV data", async () => {
      const csvData = "name,value,date\nTest Metric,100,2024-01-01\nAnother Metric,200,2024-01-02"
      const buffer = Buffer.from(csvData)

      const result = await CsvUtils.parseCSV(buffer)

      expect(result.data).toHaveLength(2)
      expect(result.errors).toHaveLength(0)
      expect(result.data[0]).toEqual({
        name: "Test Metric",
        value: "100",
        date: "2024-01-01",
      })
    })

    it("should handle parsing errors", async () => {
      const invalidCsvData = "invalid,csv\ndata"
      const buffer = Buffer.from(invalidCsvData)

      const result = await CsvUtils.parseCSV(buffer)

      expect(result.data).toBeDefined()
      expect(result.errors).toBeDefined()
    })
  })

  describe("validateMetricData", () => {
    it("should validate correct metric data", () => {
      const validRow = {
        metricName: "test_metric",
        date: "2024-01-01",
        value: 100,
      }

      const errors = CsvUtils.validateMetricData(validRow, 1)
      expect(errors).toHaveLength(0)
    })

    it("should detect missing required fields", () => {
      const invalidRow = {
        metricName: "",
        date: "invalid-date",
        value: "not-a-number",
      }

      const errors = CsvUtils.validateMetricData(invalidRow, 1)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.includes("metricName"))).toBe(true)
      expect(errors.some((error) => error.includes("date"))).toBe(true)
      expect(errors.some((error) => error.includes("value"))).toBe(true)
    })
  })

  describe("validateEventData", () => {
    it("should validate correct event data", () => {
      const validRow = {
        name: "Test Event",
        category: "marketing",
        startDate: "2024-01-01",
        impact: "high",
      }

      const errors = CsvUtils.validateEventData(validRow, 1)
      expect(errors).toHaveLength(0)
    })

    it("should detect invalid event data", () => {
      const invalidRow = {
        name: "",
        category: "",
        startDate: "invalid-date",
        impact: "invalid-impact",
      }

      const errors = CsvUtils.validateEventData(invalidRow, 1)
      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
