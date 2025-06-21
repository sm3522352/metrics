import { Op } from "sequelize"
import { Metric, MetricValue, Event } from "../models"
import { MathUtils } from "../utils/mathUtils"
import { DateUtils } from "../utils/dateUtils"

export interface AnalyticsQuery {
  metricIds?: string[]
  startDate: Date
  endDate: Date
  tenantId?: string
}

export interface MetricAnalysis {
  metricId: string
  metricName: string
  startValue: number
  endValue: number
  absoluteChange: number
  percentageChange: number
  trend: "increasing" | "decreasing" | "stable"
  volatility: number
  anomalies: number[]
  isAnomalous: boolean
}

export interface Insight {
  type: "critical" | "warning" | "positive" | "info"
  title: string
  description: string
  recommendations: string[]
  confidence: number
  metricIds: string[]
  eventIds?: string[]
}

export interface WhatIfScenario {
  scenarioName: string
  assumptions: Record<string, number>
  projectedValues: Record<string, number>
  confidence: number
}

export class AnalyticsService {
  async analyzeMetrics(query: AnalyticsQuery): Promise<MetricAnalysis[]> {
    const metricValues = await this.getMetricValuesForAnalysis(query)
    const analyses: MetricAnalysis[] = []

    // Group values by metric
    const valuesByMetric = metricValues.reduce(
      (acc, value) => {
        if (!acc[value.metricId]) {
          acc[value.metricId] = []
        }
        acc[value.metricId].push(value)
        return acc
      },
      {} as Record<string, MetricValue[]>,
    )

    for (const [metricId, values] of Object.entries(valuesByMetric)) {
      if (values.length < 2) continue

      const sortedValues = values.sort((a, b) => a.date.getTime() - b.date.getTime())
      const numericValues = sortedValues.map((v) => Number(v.value))

      const startValue = numericValues[0]
      const endValue = numericValues[numericValues.length - 1]
      const absoluteChange = endValue - startValue
      const percentageChange = MathUtils.calculatePercentageChange(startValue, endValue)
      const trend = MathUtils.calculateTrend(numericValues)
      const volatility = MathUtils.calculateStandardDeviation(numericValues)
      const anomalies = MathUtils.detectAnomalies(numericValues)

      const metric = await Metric.findByPk(metricId)

      analyses.push({
        metricId,
        metricName: metric?.displayName || "Unknown",
        startValue,
        endValue,
        absoluteChange,
        percentageChange: MathUtils.roundToDecimals(percentageChange, 2),
        trend,
        volatility: MathUtils.roundToDecimals(volatility, 2),
        anomalies,
        isAnomalous: Math.abs(percentageChange) > 20 || anomalies.length > 0,
      })
    }

    return analyses
  }

  async generateInsights(query: AnalyticsQuery): Promise<Insight[]> {
    const analyses = await this.analyzeMetrics(query)
    const events = await this.getEventsInPeriod(query.startDate, query.endDate, query.tenantId)
    const insights: Insight[] = []

    // Critical changes
    const criticalMetrics = analyses.filter((a) => Math.abs(a.percentageChange) > 30)
    if (criticalMetrics.length > 0) {
      insights.push({
        type: "critical",
        title: `Critical Changes Detected in ${criticalMetrics.length} Metrics`,
        description: `Significant changes (>30%) detected in: ${criticalMetrics.map((m) => m.metricName).join(", ")}`,
        recommendations: [
          "Investigate root causes immediately",
          "Review recent events and changes",
          "Consider corrective actions",
        ],
        confidence: 0.9,
        metricIds: criticalMetrics.map((m) => m.metricId),
      })
    }

    // Positive trends
    const positiveMetrics = analyses.filter((a) => a.trend === "increasing" && a.percentageChange > 10)
    if (positiveMetrics.length > 0) {
      insights.push({
        type: "positive",
        title: `Strong Growth in ${positiveMetrics.length} Metrics`,
        description: `Positive trends detected in: ${positiveMetrics.map((m) => m.metricName).join(", ")}`,
        recommendations: ["Analyze success factors", "Scale successful initiatives", "Document best practices"],
        confidence: 0.8,
        metricIds: positiveMetrics.map((m) => m.metricId),
      })
    }

    // High volatility warning
    const volatileMetrics = analyses.filter((a) => a.volatility > 15)
    if (volatileMetrics.length > 0) {
      insights.push({
        type: "warning",
        title: `High Volatility in ${volatileMetrics.length} Metrics`,
        description: `Unstable patterns detected in: ${volatileMetrics.map((m) => m.metricName).join(", ")}`,
        recommendations: [
          "Stabilize underlying processes",
          "Identify volatility sources",
          "Implement monitoring controls",
        ],
        confidence: 0.7,
        metricIds: volatileMetrics.map((m) => m.metricId),
      })
    }

    // Event correlation insights
    const eventInsights = await this.analyzeEventCorrelations(events, analyses)
    insights.push(...eventInsights)

    return insights.sort((a, b) => b.confidence - a.confidence)
  }

  async calculateEventCorrelations(
    eventId: string,
    metricIds: string[],
    tenantId?: string,
  ): Promise<Record<string, number>> {
    const event = await Event.findByPk(eventId)
    if (!event) return {}

    const correlations: Record<string, number> = {}

    // Get metric values before and after the event
    const beforeStart = DateUtils.addDays(event.startDate, -30)
    const beforeEnd = event.startDate
    const afterStart = event.endDate || event.startDate
    const afterEnd = DateUtils.addDays(afterStart, 30)

    for (const metricId of metricIds) {
      const beforeValues = await MetricValue.findAll({
        where: {
          metricId,
          date: { [Op.between]: [beforeStart, beforeEnd] },
          ...(tenantId && { tenantId }),
        },
        order: [["date", "ASC"]],
      })

      const afterValues = await MetricValue.findAll({
        where: {
          metricId,
          date: { [Op.between]: [afterStart, afterEnd] },
          ...(tenantId && { tenantId }),
        },
        order: [["date", "ASC"]],
      })

      if (beforeValues.length > 0 && afterValues.length > 0) {
        const beforeAvg = MathUtils.calculateAverage(beforeValues.map((v) => Number(v.value)))
        const afterAvg = MathUtils.calculateAverage(afterValues.map((v) => Number(v.value)))
        const change = MathUtils.calculatePercentageChange(beforeAvg, afterAvg)

        // Simple correlation based on change magnitude and direction
        correlations[metricId] = MathUtils.roundToDecimals(change / 100, 4)
      }
    }

    return correlations
  }

  async generateWhatIfScenario(
    scenarioName: string,
    assumptions: Record<string, number>,
    baseQuery: AnalyticsQuery,
  ): Promise<WhatIfScenario> {
    const currentAnalyses = await this.analyzeMetrics(baseQuery)
    const projectedValues: Record<string, number> = {}

    for (const analysis of currentAnalyses) {
      const metricId = analysis.metricId
      const currentValue = analysis.endValue

      // Apply assumption if exists, otherwise use trend projection
      if (assumptions[metricId] !== undefined) {
        projectedValues[metricId] = currentValue * (1 + assumptions[metricId] / 100)
      } else {
        // Simple trend-based projection
        const trendMultiplier = analysis.trend === "increasing" ? 1.05 : analysis.trend === "decreasing" ? 0.95 : 1.0
        projectedValues[metricId] = currentValue * trendMultiplier
      }
    }

    // Calculate confidence based on historical volatility
    const avgVolatility = MathUtils.calculateAverage(currentAnalyses.map((a) => a.volatility))
    const confidence = Math.max(0.1, 1 - avgVolatility / 100)

    return {
      scenarioName,
      assumptions,
      projectedValues,
      confidence: MathUtils.roundToDecimals(confidence, 2),
    }
  }

  async getMetricComparison(
    metricId: string,
    period1: { start: Date; end: Date },
    period2: { start: Date; end: Date },
    tenantId?: string,
  ): Promise<{
    period1Avg: number
    period2Avg: number
    change: number
    changePercent: number
    significance: "high" | "medium" | "low"
  }> {
    const period1Values = await MetricValue.findAll({
      where: {
        metricId,
        date: { [Op.between]: [period1.start, period1.end] },
        ...(tenantId && { tenantId }),
      },
    })

    const period2Values = await MetricValue.findAll({
      where: {
        metricId,
        date: { [Op.between]: [period2.start, period2.end] },
        ...(tenantId && { tenantId }),
      },
    })

    const period1Avg = MathUtils.calculateAverage(period1Values.map((v) => Number(v.value)))
    const period2Avg = MathUtils.calculateAverage(period2Values.map((v) => Number(v.value)))
    const change = period2Avg - period1Avg
    const changePercent = MathUtils.calculatePercentageChange(period1Avg, period2Avg)

    let significance: "high" | "medium" | "low" = "low"
    if (Math.abs(changePercent) > 20) significance = "high"
    else if (Math.abs(changePercent) > 10) significance = "medium"

    return {
      period1Avg: MathUtils.roundToDecimals(period1Avg, 2),
      period2Avg: MathUtils.roundToDecimals(period2Avg, 2),
      change: MathUtils.roundToDecimals(change, 2),
      changePercent: MathUtils.roundToDecimals(changePercent, 2),
      significance,
    }
  }

  private async getMetricValuesForAnalysis(query: AnalyticsQuery): Promise<MetricValue[]> {
    const whereClause: any = {
      date: { [Op.between]: [query.startDate, query.endDate] },
    }

    if (query.metricIds && query.metricIds.length > 0) {
      whereClause.metricId = { [Op.in]: query.metricIds }
    }

    if (query.tenantId) {
      whereClause.tenantId = query.tenantId
    }

    return MetricValue.findAll({
      where: whereClause,
      include: [
        {
          model: Metric,
          as: "metric",
          attributes: ["id", "name", "displayName"],
        },
      ],
      order: [["date", "ASC"]],
    })
  }

  private async getEventsInPeriod(startDate: Date, endDate: Date, tenantId?: string): Promise<Event[]> {
    const whereClause: any = {
      [Op.or]: [
        {
          startDate: { [Op.between]: [startDate, endDate] },
        },
        {
          endDate: { [Op.between]: [startDate, endDate] },
        },
        {
          [Op.and]: [{ startDate: { [Op.lte]: startDate } }, { endDate: { [Op.gte]: endDate } }],
        },
      ],
    }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Event.findAll({
      where: whereClause,
      include: [
        {
          model: Metric,
          as: "metrics",
          attributes: ["id", "name", "displayName"],
        },
      ],
    })
  }

  private async analyzeEventCorrelations(events: Event[], analyses: MetricAnalysis[]): Promise<Insight[]> {
    const insights: Insight[] = []

    const highImpactEvents = events.filter((e) => e.impact === "high")
    if (highImpactEvents.length > 0) {
      const affectedMetrics = analyses.filter((a) => Math.abs(a.percentageChange) > 15)

      if (affectedMetrics.length > 0) {
        insights.push({
          type: "info",
          title: `${highImpactEvents.length} High-Impact Events May Have Influenced Metrics`,
          description: `Events: ${highImpactEvents.map((e) => e.name).join(", ")}. Affected metrics: ${affectedMetrics.map((m) => m.metricName).join(", ")}`,
          recommendations: [
            "Analyze event-metric correlations",
            "Document successful interventions",
            "Plan similar events for positive outcomes",
          ],
          confidence: 0.6,
          metricIds: affectedMetrics.map((m) => m.metricId),
          eventIds: highImpactEvents.map((e) => e.id),
        })
      }
    }

    return insights
  }
}
