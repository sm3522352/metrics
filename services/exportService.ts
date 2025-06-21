export class ExportService {
  async exportToCSV(data: any[], filename: string): Promise<Blob> {
    if (data.length === 0) {
      throw new Error("No data to export")
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(","),
      ...data.map((row) => headers.map((header) => this.escapeCsvValue(row[header])).join(",")),
    ].join("\n")

    return new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  }

  async exportToExcel(data: any[], filename: string): Promise<Blob> {
    // Реализация экспорта в Excel
    // Можно использовать библиотеку типа xlsx
    throw new Error("Excel export not implemented yet")
  }

  async exportDashboardReport(
    metrics: any[],
    events: any[],
    insights: any[],
    period: string,
  ): Promise<{ metrics: Blob; events: Blob; insights: Blob }> {
    const metricsBlob = await this.exportToCSV(metrics, `metrics-${period}`)
    const eventsBlob = await this.exportToCSV(events, `events-${period}`)
    const insightsBlob = await this.exportToCSV(insights, `insights-${period}`)

    return {
      metrics: metricsBlob,
      events: eventsBlob,
      insights: insightsBlob,
    }
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return ""

    const stringValue = String(value)

    // Если значение содержит запятую, кавычки или переносы строк, оборачиваем в кавычки
    if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }
}
