import type { Insight, PeriodComparison } from "../models/analytics"
import type { MetricData } from "../models/metric"
import type { BusinessEvent } from "../models/event"

export class AnalyticsService {
  async generateInsights(
    metricData: MetricData[],
    events: BusinessEvent[],
    selectedMetrics: string[],
  ): Promise<Insight[]> {
    const insights: Insight[] = []

    // Анализ трендов
    for (const metricId of selectedMetrics) {
      const trendInsight = await this.analyzeTrend(metricData, metricId)
      if (trendInsight) insights.push(trendInsight)
    }

    // Анализ событий
    const eventInsights = await this.analyzeEvents(events)
    insights.push(...eventInsights)

    // Анализ волатильности
    const volatilityInsights = await this.analyzeVolatility(metricData, selectedMetrics)
    insights.push(...volatilityInsights)

    return this.prioritizeInsights(insights)
  }

  async comparePeriods(
    data: MetricData[],
    period1: { start: string; end: string },
    period2: { start: string; end: string },
    metrics: string[],
  ): Promise<PeriodComparison> {
    const period1Data = this.filterDataByPeriod(data, period1.start, period1.end)
    const period2Data = this.filterDataByPeriod(data, period2.start, period2.end)

    const results = metrics.map((metricId) => {
      const avg1 = this.calculateAverage(period1Data, metricId)
      const avg2 = this.calculateAverage(period2Data, metricId)
      const change = avg2 - avg1
      const changePercent = avg1 !== 0 ? (change / avg1) * 100 : 0

      return {
        metricId,
        value1: avg1,
        value2: avg2,
        change,
        changePercent,
        significance: this.determineSignificance(changePercent),
      }
    })

    return {
      id: this.generateId(),
      name: `Comparison ${new Date().toISOString()}`,
      period1: { name: "Period 1", start: period1.start, end: period1.end },
      period2: { name: "Period 2", start: period2.start, end: period2.end },
      metrics,
      results,
      createdAt: new Date(),
    }
  }

  async calculateVolatility(data: MetricData[], metricId: string): Promise<number> {
    const values = data
      .filter((d) => d.metricId === metricId)
      .map((d) => d.value)
      .filter(Boolean)

    if (values.length < 2) return 0

    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length

    return (Math.sqrt(variance) / mean) * 100
  }

  private async analyzeTrend(data: MetricData[], metricId: string): Promise<Insight | null> {
    const metricData = data.filter((d) => d.metricId === metricId)
    if (metricData.length < 2) return null

    const firstValue = metricData[0].value
    const lastValue = metricData[metricData.length - 1].value
    const trendPercent = ((lastValue - firstValue) / firstValue) * 100

    if (Math.abs(trendPercent) > 20) {
      return {
        id: this.generateId(),
        type: trendPercent > 0 ? "positive" : "critical",
        title: `Метрика ${metricId}: ${trendPercent > 0 ? "Сильный рост" : "Критическое снижение"}`,
        description: `Изменение на ${trendPercent.toFixed(1)}% за период`,
        priority: "high",
        actionItems:
          trendPercent > 0
            ? ["Изучить факторы успеха", "Масштабировать инициативы"]
            : ["Провести анализ причин", "Разработать план восстановления"],
        metricIds: [metricId],
        eventIds: [],
        confidence: 0.8,
        createdAt: new Date(),
      }
    }

    return null
  }

  private async analyzeEvents(events: BusinessEvent[]): Promise<Insight[]> {
    const insights: Insight[] = []

    const highImpactEvents = events.filter((e) => e.impact === "high")
    if (highImpactEvents.length > 0) {
      insights.push({
        id: this.generateId(),
        type: "info",
        title: `Высокоэффективные инициативы: ${highImpactEvents.length}`,
        description: "Выявлены события с высоким влиянием на метрики",
        priority: "medium",
        actionItems: ["Проанализировать успешные события", "Создать шаблоны инициатив"],
        metricIds: [],
        eventIds: highImpactEvents.map((e) => e.id),
        confidence: 0.7,
        createdAt: new Date(),
      })
    }

    return insights
  }

  private async analyzeVolatility(data: MetricData[], metrics: string[]): Promise<Insight[]> {
    const insights: Insight[] = []

    for (const metricId of metrics) {
      const volatility = await this.calculateVolatility(data, metricId)

      if (volatility > 30) {
        insights.push({
          id: this.generateId(),
          type: "warning",
          title: `Метрика ${metricId}: Высокая волатильность`,
          description: `Показатель сильно колеблется (${volatility.toFixed(1)}% от среднего)`,
          priority: "medium",
          actionItems: ["Стабилизировать процессы", "Выявить источники колебаний"],
          metricIds: [metricId],
          eventIds: [],
          confidence: 0.6,
          createdAt: new Date(),
        })
      }
    }

    return insights
  }

  private prioritizeInsights(insights: Insight[]): Insight[] {
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private filterDataByPeriod(data: MetricData[], start: string, end: string): MetricData[] {
    return data.filter((item) => {
      const date = new Date(item.date)
      return date >= new Date(start) && date <= new Date(end)
    })
  }

  private calculateAverage(data: MetricData[], metricId: string): number {
    const values = data
      .filter((d) => d.metricId === metricId)
      .map((d) => d.value)
      .filter(Boolean)

    return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  }

  private determineSignificance(changePercent: number): "critical" | "significant" | "stable" {
    if (Math.abs(changePercent) > 20) return "critical"
    if (Math.abs(changePercent) > 10) return "significant"
    return "stable"
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}
