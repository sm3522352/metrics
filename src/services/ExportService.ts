import { CsvUtils } from "../utils/csvUtils"
import { MetricService } from "./MetricService"
import { EventService } from "./EventService"
import { AnalyticsService } from "./AnalyticsService"

export interface ExportQuery {
  metricIds?: string[]
  eventIds?: string[]
  startDate: Date
  endDate: Date
  tenantId?: string
  includeAnalytics?: boolean
}

export class ExportService {
  private metricService = new MetricService()
  private eventService = new EventService()
  private analyticsService = new AnalyticsService()

  async exportMetricsTemplate(): Promise<Buffer> {
    const templateData = [
      {
        metricName: "revenue",
        date: "2024-01-01",
        value: 10000,
        period: "2024-01",
      },
    ]

    const headers = [
      { id: "metricName", title: "Metric Name" },
      { id: "date", title: "Date (YYYY-MM-DD)" },
      { id: "value", title: "Value" },
      { id: "period", title: "Period (Optional)" },
    ]

    return CsvUtils.generateCSV(templateData, headers, "metrics-template.csv")
  }

  async exportEventsTemplate(): Promise<Buffer> {
    const templateData = [
      {
        name: "Product Launch",
        category: "marketing",
        description: "Launch of new product line",
        startDate: "2024-01-01",
        endDate: "2024-01-31",
        impact: "high",
        metricNames: "revenue,customers",
      },
    ]

    const headers = [
      { id: "name", title: "Event Name" },
      { id: "category", title: "Category" },
      { id: "description", title: "Description" },
      { id: "startDate", title: "Start Date (YYYY-MM-DD)" },
      { id: "endDate", title: "End Date (YYYY-MM-DD)" },
      { id: "impact", title: "Impact (low/medium/high)" },
      { id: "metricNames", title: "Related Metrics (comma-separated)" },
    ]

    return CsvUtils.generateCSV(templateData, headers, "events-template.csv")
  }

  async exportMetricsData(query: ExportQuery): Promise<Buffer> {
    const timeSeries = await this.metricService.getTimeSeries({
      metricIds: query.metricIds,
      startDate: query.startDate,
      endDate: query.endDate,
      tenantId: query.tenantId,
    })

    const exportData = timeSeries.map((value) => ({
      metricName: value.metric?.name || "Unknown",
      metricDisplayName: value.metric?.displayName || "Unknown",
      date: value.date.toISOString().split("T")[0],
      value: Number(value.value),
      period: value.period || "",
      unit: value.metric?.unit || "",
    }))

    const headers = [
      { id: "metricName", title: "Metric Name" },
      { id: "metricDisplayName", title: "Display Name" },
      { id: "date", title: "Date" },
      { id: "value", title: "Value" },
      { id: "period", title: "Period" },
      { id: "unit", title: "Unit" },
    ]

    return CsvUtils.generateCSV(exportData, headers, "metrics-export.csv")
  }

  async exportEventsData(query: ExportQuery): Promise<Buffer> {
    const events = await this.eventService.getAllEvents({
      startDate: query.startDate,
      endDate: query.endDate,
      tenantId: query.tenantId,
    })

    const exportData = events.map((event) => ({
      name: event.name,
      category: event.category,
      description: event.description || "",
      startDate: event.startDate.toISOString().split("T")[0],
      endDate: event.endDate?.toISOString().split("T")[0] || "",
      impact: event.impact,
      status: event.status,
      relatedMetrics: event.metrics?.map((m) => m.name).join(", ") || "",
    }))

    const headers = [
      { id: "name", title: "Event Name" },
      { id: "category", title: "Category" },
      { id: "description", title: "Description" },
      { id: "startDate", title: "Start Date" },
      { id: "endDate", title: "End Date" },
      { id: "impact", title: "Impact" },
      { id: "status", title: "Status" },
      { id: "relatedMetrics", title: "Related Metrics" },
    ]

    return CsvUtils.generateCSV(exportData, headers, "events-export.csv")
  }

  async exportAnalyticsReport(query: ExportQuery): Promise<Buffer> {
    const analyses = await this.analyticsService.analyzeMetrics({
      metricIds: query.metricIds,
      startDate: query.startDate,
      endDate: query.endDate,
      tenantId: query.tenantId,
    })

    const insights = await this.analyticsService.generateInsights({
      metricIds: query.metricIds,
      startDate: query.startDate,
      endDate: query.endDate,
      tenantId: query.tenantId,
    })

    // Create multiple sheets in Excel format
    const analyticsData = analyses.map((analysis) => ({
      metricName: analysis.metricName,
      startValue: analysis.startValue,
      endValue: analysis.endValue,
      absoluteChange: analysis.absoluteChange,
      percentageChange: analysis.percentageChange,
      trend: analysis.trend,
      volatility: analysis.volatility,
      isAnomalous: analysis.isAnomalous ? "Yes" : "No",
    }))

    const insightsData = insights.map((insight) => ({
      type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence: insight.confidence,
      recommendations: insight.recommendations.join("; "),
    }))

    // For now, export analytics as CSV (could be enhanced to Excel with multiple sheets)
    const headers = [
      { id: "metricName", title: "Metric Name" },
      { id: "startValue", title: "Start Value" },
      { id: "endValue", title: "End Value" },
      { id: "absoluteChange", title: "Absolute Change" },
      { id: "percentageChange", title: "Percentage Change" },
      { id: "trend", title: "Trend" },
      { id: "volatility", title: "Volatility" },
      { id: "isAnomalous", title: "Anomalous" },
    ]

    return CsvUtils.generateCSV(analyticsData, headers, "analytics-report.csv")
  }

  async exportCompleteReport(query: ExportQuery): Promise<{
    metrics: Buffer
    events: Buffer
    analytics: Buffer
  }> {
    const [metrics, events, analytics] = await Promise.all([
      this.exportMetricsData(query),
      this.exportEventsData(query),
      this.exportAnalyticsReport(query),
    ])

    return { metrics, events, analytics }
  }
}
