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

  describe("calculateStandardDeviation", () => {
    it("should calculate standard deviation correctly", () => {
      const values = [2, 4, 4, 4, 5, 5, 7, 9]
      const result = MathUtils.calculateStandardDeviation(values)
      expect(result).toBeCloseTo(2, 1)
    })

    it("should return 0 for empty array", () => {
      const result = MathUtils.calculateStandardDeviation([])
      expect(result).toBe(0)
    })
  })
})
