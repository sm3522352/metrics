export class MathUtils {
  static calculatePercentageChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue === 0 ? 0 : 100
    return ((newValue - oldValue) / oldValue) * 100
  }

  static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, value) => sum + value, 0) / values.length
  }

  static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0

    const sorted = [...values].sort((a, b) => a - b)
    const middle = Math.floor(sorted.length / 2)

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2
    }

    return sorted[middle]
  }

  static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0

    const mean = this.calculateAverage(values)
    const squaredDifferences = values.map((value) => Math.pow(value - mean, 2))
    const variance = this.calculateAverage(squaredDifferences)

    return Math.sqrt(variance)
  }

  static calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  static roundToDecimals(value: number, decimals: number): number {
    return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
  }
}
