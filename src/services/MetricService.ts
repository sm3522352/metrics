import { Op } from "sequelize"
import { Metric, MetricValue, type MetricCreationAttributes } from "../models"

export interface MetricWithValues extends Metric {
  values?: MetricValue[]
}

export interface TimeSeriesQuery {
  metricIds?: string[]
  startDate?: Date
  endDate?: Date
  tenantId?: string
  groupBy?: "day" | "week" | "month" | "quarter" | "year"
}

export class MetricService {
  async createMetric(metricData: MetricCreationAttributes): Promise<Metric> {
    return Metric.create(metricData)
  }

  async getMetricById(id: string, tenantId?: string): Promise<Metric | null> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Metric.findOne({
      where: whereClause,
      include: [
        {
          model: MetricValue,
          as: "values",
          limit: 100,
          order: [["date", "DESC"]],
        },
      ],
    })
  }

  async getAllMetrics(tenantId?: string): Promise<Metric[]> {
    const whereClause: any = { isActive: true }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Metric.findAll({
      where: whereClause,
      order: [["displayName", "ASC"]],
    })
  }

  async updateMetric(id: string, updates: Partial<Metric>, tenantId?: string): Promise<Metric | null> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    const metric = await Metric.findOne({ where: whereClause })

    if (!metric) {
      return null
    }

    await metric.update(updates)
    return metric
  }

  async deleteMetric(id: string, tenantId?: string): Promise<boolean> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    const metric = await Metric.findOne({ where: whereClause })

    if (!metric) {
      return false
    }

    await metric.update({ isActive: false })
    return true
  }

  async addMetricValue(
    metricId: string,
    value: number,
    date: Date,
    createdBy: string,
    tenantId?: string,
  ): Promise<MetricValue> {
    return MetricValue.create({
      metricId,
      value,
      date,
      createdBy,
      tenantId,
    })
  }

  async getTimeSeries(query: TimeSeriesQuery): Promise<MetricValue[]> {
    const whereClause: any = {}

    if (query.metricIds && query.metricIds.length > 0) {
      whereClause.metricId = { [Op.in]: query.metricIds }
    }

    if (query.startDate && query.endDate) {
      whereClause.date = {
        [Op.between]: [query.startDate, query.endDate],
      }
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
          attributes: ["id", "name", "displayName", "unit"],
        },
      ],
      order: [["date", "ASC"]],
    })
  }

  async bulkImportMetricValues(
    data: Array<{
      metricName: string
      value: number
      date: string
    }>,
    createdBy: string,
    tenantId?: string,
  ): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      try {
        // Find metric by name
        const metric = await Metric.findOne({
          where: {
            name: row.metricName,
            ...(tenantId && { tenantId }),
          },
        })

        if (!metric) {
          results.errors.push(`Row ${i + 1}: Metric '${row.metricName}' not found`)
          continue
        }

        // Create or update metric value
        await MetricValue.upsert({
          metricId: metric.id,
          value: row.value,
          date: new Date(row.date),
          createdBy,
          tenantId,
        })

        results.success++
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return results
  }

  async getMetricsByCategory(category: string, tenantId?: string): Promise<Metric[]> {
    const whereClause: any = { category, isActive: true }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Metric.findAll({
      where: whereClause,
      order: [["displayName", "ASC"]],
    })
  }

  async searchMetrics(searchTerm: string, tenantId?: string): Promise<Metric[]> {
    const whereClause: any = {
      isActive: true,
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchTerm}%` } },
        { displayName: { [Op.iLike]: `%${searchTerm}%` } },
        { description: { [Op.iLike]: `%${searchTerm}%` } },
      ],
    }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Metric.findAll({
      where: whereClause,
      order: [["displayName", "ASC"]],
    })
  }
}
