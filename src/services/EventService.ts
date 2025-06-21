import { Op } from "sequelize"
import { Event, EventMetric, Comment, Metric, type EventCreationAttributes, User } from "../models"

export interface EventQuery {
  category?: string
  status?: string
  startDate?: Date
  endDate?: Date
  metricId?: string
  tenantId?: string
}

export class EventService {
  async createEvent(eventData: EventCreationAttributes & { metricIds?: string[] }): Promise<Event> {
    const { metricIds, ...eventInfo } = eventData

    const event = await Event.create(eventInfo)

    // Associate with metrics if provided
    if (metricIds && metricIds.length > 0) {
      const eventMetrics = metricIds.map((metricId) => ({
        eventId: event.id,
        metricId,
      }))

      await EventMetric.bulkCreate(eventMetrics)
    }

    return event
  }

  async getEventById(id: string, tenantId?: string): Promise<Event | null> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return Event.findOne({
      where: whereClause,
      include: [
        {
          model: Metric,
          as: "metrics",
          through: { attributes: ["expectedImpact", "actualImpact", "correlation"] },
        },
        {
          model: Comment,
          as: "comments",
          include: [{ model: User, as: "author", attributes: ["id", "name"] }],
        },
      ],
    })
  }

  async getAllEvents(query: EventQuery): Promise<Event[]> {
    const whereClause: any = {}

    if (query.category) {
      whereClause.category = query.category
    }

    if (query.status) {
      whereClause.status = query.status
    }

    if (query.startDate && query.endDate) {
      whereClause.startDate = {
        [Op.between]: [query.startDate, query.endDate],
      }
    }

    if (query.tenantId) {
      whereClause.tenantId = query.tenantId
    }

    const include: any[] = [
      {
        model: Metric,
        as: "metrics",
        attributes: ["id", "name", "displayName"],
      },
    ]

    // Filter by metric if specified
    if (query.metricId) {
      include[0].where = { id: query.metricId }
      include[0].required = true
    }

    return Event.findAll({
      where: whereClause,
      include,
      order: [["startDate", "DESC"]],
    })
  }

  async updateEvent(id: string, updates: Partial<Event>, tenantId?: string): Promise<Event | null> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    const event = await Event.findOne({ where: whereClause })

    if (!event) {
      return null
    }

    await event.update(updates)
    return event
  }

  async deleteEvent(id: string, tenantId?: string): Promise<boolean> {
    const whereClause: any = { id }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    const event = await Event.findOne({ where: whereClause })

    if (!event) {
      return false
    }

    // Delete associated records
    await EventMetric.destroy({ where: { eventId: id } })
    await Comment.destroy({ where: { eventId: id } })
    await event.destroy()

    return true
  }

  async addComment(eventId: string, content: string, authorId: string, tenantId?: string): Promise<Comment> {
    return Comment.create({
      eventId,
      content,
      authorId,
      tenantId,
    })
  }

  async updateEventMetricImpact(
    eventId: string,
    metricId: string,
    impact: { expectedImpact?: number; actualImpact?: number; correlation?: number },
  ): Promise<EventMetric | null> {
    const eventMetric = await EventMetric.findOne({
      where: { eventId, metricId },
    })

    if (!eventMetric) {
      return null
    }

    await eventMetric.update(impact)
    return eventMetric
  }

  async bulkImportEvents(
    data: Array<{
      name: string
      category: string
      description?: string
      startDate: string
      endDate?: string
      impact?: string
      metricNames?: string[]
    }>,
    createdBy: string,
    tenantId?: string,
  ): Promise<{ success: number; errors: string[] }> {
    const results = { success: 0, errors: [] as string[] }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]

      try {
        const eventData: any = {
          name: row.name,
          category: row.category,
          description: row.description,
          startDate: new Date(row.startDate),
          impact: row.impact || "medium",
          createdBy,
          tenantId,
        }

        if (row.endDate) {
          eventData.endDate = new Date(row.endDate)
        }

        const event = await Event.create(eventData)

        // Associate with metrics if provided
        if (row.metricNames && row.metricNames.length > 0) {
          const metrics = await Metric.findAll({
            where: {
              name: { [Op.in]: row.metricNames },
              ...(tenantId && { tenantId }),
            },
          })

          const eventMetrics = metrics.map((metric) => ({
            eventId: event.id,
            metricId: metric.id,
          }))

          await EventMetric.bulkCreate(eventMetrics)
        }

        results.success++
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`)
      }
    }

    return results
  }

  async getEventsByMetric(metricId: string, tenantId?: string): Promise<Event[]> {
    return Event.findAll({
      include: [
        {
          model: Metric,
          as: "metrics",
          where: { id: metricId },
          required: true,
        },
      ],
      where: tenantId ? { tenantId } : {},
      order: [["startDate", "DESC"]],
    })
  }
}
