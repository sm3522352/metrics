import { MetricService } from "../../services/MetricService"
import { UserService } from "../../services/UserService"

describe("MetricService", () => {
  let metricService: MetricService
  let userService: UserService
  let testUser: any

  beforeEach(async () => {
    metricService = new MetricService()
    userService = new UserService()

    // Create a test user
    testUser = await userService.createUser({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      role: "admin",
    })
  })

  describe("createMetric", () => {
    it("should create a new metric", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        description: "A test metric",
        unit: "count",
        frequency: "monthly" as const,
        createdBy: testUser.id,
      }

      const metric = await metricService.createMetric(metricData)

      expect(metric.id).toBeDefined()
      expect(metric.name).toBe(metricData.name)
      expect(metric.displayName).toBe(metricData.displayName)
      expect(metric.category).toBe(metricData.category)
      expect(metric.isActive).toBe(true)
    })

    it("should throw error for duplicate metric name", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        createdBy: testUser.id,
      }

      await metricService.createMetric(metricData)

      await expect(metricService.createMetric(metricData)).rejects.toThrow()
    })
  })

  describe("getMetricById", () => {
    it("should return metric with values", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        createdBy: testUser.id,
      }

      const createdMetric = await metricService.createMetric(metricData)

      // Add some values
      await metricService.addMetricValue(createdMetric.id, 100, new Date(), testUser.id)
      await metricService.addMetricValue(createdMetric.id, 150, new Date(), testUser.id)

      const metric = await metricService.getMetricById(createdMetric.id)

      expect(metric).toBeDefined()
      expect(metric!.id).toBe(createdMetric.id)
      expect(metric!.values).toBeDefined()
      expect(metric!.values!.length).toBeGreaterThan(0)
    })

    it("should return null for non-existent metric", async () => {
      const metric = await metricService.getMetricById("non-existent-id")

      expect(metric).toBeNull()
    })
  })

  describe("addMetricValue", () => {
    it("should add metric value successfully", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        createdBy: testUser.id,
      }

      const metric = await metricService.createMetric(metricData)
      const value = 100
      const date = new Date()

      const metricValue = await metricService.addMetricValue(metric.id, value, date, testUser.id)

      expect(metricValue.id).toBeDefined()
      expect(metricValue.metricId).toBe(metric.id)
      expect(Number(metricValue.value)).toBe(value)
      expect(metricValue.date).toEqual(date)
    })
  })

  describe("getTimeSeries", () => {
    it("should return time series data for metrics", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        createdBy: testUser.id,
      }

      const metric = await metricService.createMetric(metricData)

      // Add multiple values
      const startDate = new Date("2024-01-01")
      const endDate = new Date("2024-01-31")

      await metricService.addMetricValue(metric.id, 100, new Date("2024-01-15"), testUser.id)
      await metricService.addMetricValue(metric.id, 150, new Date("2024-01-20"), testUser.id)

      const timeSeries = await metricService.getTimeSeries({
        metricIds: [metric.id],
        startDate,
        endDate,
      })

      expect(timeSeries).toBeDefined()
      expect(timeSeries.length).toBe(2)
      expect(timeSeries[0].metricId).toBe(metric.id)
    })
  })

  describe("bulkImportMetricValues", () => {
    it("should import metric values successfully", async () => {
      const metricData = {
        name: "test_metric",
        displayName: "Test Metric",
        category: "test",
        createdBy: testUser.id,
      }

      await metricService.createMetric(metricData)

      const importData = [
        {
          metricName: "test_metric",
          value: 100,
          date: "2024-01-01",
        },
        {
          metricName: "test_metric",
          value: 150,
          date: "2024-01-02",
        },
      ]

      const result = await metricService.bulkImportMetricValues(importData, testUser.id)

      expect(result.success).toBe(2)
      expect(result.errors).toHaveLength(0)
    })

    it("should handle errors for non-existent metrics", async () => {
      const importData = [
        {
          metricName: "non_existent_metric",
          value: 100,
          date: "2024-01-01",
        },
      ]

      const result = await metricService.bulkImportMetricValues(importData, testUser.id)

      expect(result.success).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain("not found")
    })
  })
})
