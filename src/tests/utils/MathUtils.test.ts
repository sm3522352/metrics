import { MathUtils } from "../../utils/mathUtils"

describe("MathUtils", () => {
  describe("calculatePercentageChange", () => {
    it("should calculate positive percentage change", () => {
      const result = MathUtils.calculatePercentageChange(100, 120)
      expect(result).toBe(20)
    })

    it("should calculate negative percentage change", () => {
      const result = MathUtils.calculatePercentageChange(100, 80)
      expect(result).toBe(-20)
    })

    it("should handle zero old value", () => {
      const result = MathUtils.calculatePercentageChange(0, 100)
      expect(result).toBe(100)
    })

    it("should handle both values being zero", () => {
      const result = MathUtils.calculatePercentageChange(0, 0)
      expect(result).toBe(0)
    })
  })

  describe("calculateCorrelation", () => {
    it("should calculate perfect positive correlation", () => {
      const x = [1, 2, 3, 4, 5]
      const y = [2, 4, 6, 8, 10]
      const result = MathUtils.calculateCorrelation(x, y)
      expect(result).toBeCloseTo(1, 5)
    })

    it("should calculate perfect negative correlation", () => {
      const x = [1, 2, 3, 4, 5]
      const y = [10, 8, 6, 4, 2]
      const result = MathUtils.calculateCorrelation(x, y)
      expect(result).toBeCloseTo(-1, 5)
    })

    it("should return 0 for mismatched array lengths", () => {
      const x = [1, 2, 3]
      const y = [1, 2]
      const result = MathUtils.calculateCorrelation(x, y)
      expect(result).toBe(0)
    })
  })

  describe("detectAnomalies", () => {
    it("should detect anomalies in data", () => {
      const values = [10, 12, 11, 13, 50, 12, 11] // 50 is an anomaly
      const anomalies = MathUtils.detectAnomalies(values, 2)
      expect(anomalies).toContain(50)
    })

    it("should return empty array for normal data", () => {
      const values = [10, 12, 11, 13, 12, 11, 10]
      const anomalies = MathUtils.detectAnomalies(values, 2)
      expect(anomalies).toHaveLength(0)
    })
  })

  describe("calculateTrend", () => {
    it("should detect increasing trend", () => {
      const values = [10, 15, 20, 25, 30]
      const trend = MathUtils.calculateTrend(values)
      expect(trend).toBe("increasing")
    })

    it("should detect decreasing trend", () => {
      const values = [30, 25, 20, 15, 10]
      const trend = MathUtils.calculateTrend(values)
      expect(trend).toBe("decreasing")
    })

    it("should detect stable trend", () => {
      const values = [20, 21, 19, 20, 21]
      const trend = MathUtils.calculateTrend(values)
      expect(trend).toBe("stable")
    })
  })
})
