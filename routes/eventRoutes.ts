import { Router } from "express"
import { EventService } from "../services/eventService"
import { AuthMiddleware } from "../middleware/auth"
import { ValidationMiddleware } from "../middleware/validation"

const router = Router()
const eventService = new EventService()

// GET /api/events - Получить все события
router.get("/", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const { startDate, endDate, categories } = req.query

    let events
    if (startDate && endDate) {
      events = await eventService.getEventsByPeriod(startDate as string, endDate as string)
    } else if (categories) {
      events = await eventService.getEventsByCategory((categories as string).split(","))
    } else {
      events = await eventService.getAllEvents()
    }

    res.json(events)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events" })
  }
})

// POST /api/events - Создать новое событие
router.post(
  "/",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(["create_events"]),
  ValidationMiddleware.validateEventData,
  async (req, res) => {
    try {
      const event = await eventService.createEvent({
        ...req.body,
        createdBy: req.user?.id,
      })
      res.status(201).json(event)
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" })
    }
  },
)

// PUT /api/events/:id - Обновить событие
router.put("/:id", AuthMiddleware.authenticate, AuthMiddleware.authorize(["update_events"]), async (req, res) => {
  try {
    const event = await eventService.updateEvent(Number.parseInt(req.params.id), req.body)
    if (!event) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.json(event)
  } catch (error) {
    res.status(500).json({ error: "Failed to update event" })
  }
})

// DELETE /api/events/:id - Удалить событие
router.delete("/:id", AuthMiddleware.authenticate, AuthMiddleware.authorize(["delete_events"]), async (req, res) => {
  try {
    const success = await eventService.deleteEvent(Number.parseInt(req.params.id))
    if (!success) {
      return res.status(404).json({ error: "Event not found" })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event" })
  }
})

// GET /api/events/:id/correlation/:metricId - Получить корреляцию события с метрикой
router.get("/:id/correlation/:metricId", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const correlation = await eventService.calculateCorrelation(Number.parseInt(req.params.id), req.params.metricId)
    res.json({ correlation })
  } catch (error) {
    res.status(500).json({ error: "Failed to calculate correlation" })
  }
})

export default router
