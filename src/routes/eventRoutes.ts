import { Router } from "express"
import { EventService } from "../services/EventService"
import { ImportService } from "../services/ImportService"
import { ExportService } from "../services/ExportService"
import { authenticate, authorize, tenantFilter, type AuthenticatedRequest } from "../middleware/auth"
import { validate, validateQuery, schemas } from "../middleware/validation"
import { upload } from "../middleware/upload"
import { asyncHandler } from "../middleware/errorHandler"
import Joi from "joi"

const router = Router()
const eventService = new EventService()
const importService = new ImportService()
const exportService = new ExportService()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [planned, active, completed, cancelled]
 *       - in: query
 *         name: metricId
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: List of events
 */
router.get(
  "/",
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { category, status, metricId, startDate, endDate } = req.query

    const events = await eventService.getAllEvents({
      category: category as string,
      status: status as string,
      metricId: metricId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      tenantId: req.query.tenantId as string,
    })

    res.json({ events })
  }),
)

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *       404:
 *         description: Event not found
 */
router.get(
  "/:id",
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const event = await eventService.getEventById(req.params.id, req.query.tenantId as string)

    if (!event) {
      res.status(404).json({ error: "Event not found" })
      return
    }

    res.json({ event })
  }),
)

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               impact:
 *                 type: string
 *                 enum: [low, medium, high]
 *               metricIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 */
router.post(
  "/",
  authorize(["admin", "analyst"]),
  validate(schemas.event.create),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const eventData = {
      ...req.body,
      createdBy: req.user!.id,
      tenantId: req.user!.tenantId,
    }

    const event = await eventService.createEvent(eventData)

    res.status(201).json({
      message: "Event created successfully",
      event,
    })
  }),
)

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event updated successfully
 *       404:
 *         description: Event not found
 */
router.put(
  "/:id",
  authorize(["admin", "analyst"]),
  validate(schemas.event.update),
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const event = await eventService.updateEvent(req.params.id, req.body, req.query.tenantId as string)

    if (!event) {
      res.status(404).json({ error: "Event not found" })
      return
    }

    res.json({
      message: "Event updated successfully",
      event,
    })
  }),
)

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 */
router.delete(
  "/:id",
  authorize(["admin"]),
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const success = await eventService.deleteEvent(req.params.id, req.query.tenantId as string)

    if (!success) {
      res.status(404).json({ error: "Event not found" })
      return
    }

    res.json({ message: "Event deleted successfully" })
  }),
)

// Comments
const commentSchema = Joi.object({
  content: Joi.string().min(1).max(1000).required(),
})

/**
 * @swagger
 * /events/{id}/comments:
 *   post:
 *     summary: Add comment to event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment added successfully
 */
router.post(
  "/:id/comments",
  validate(commentSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const comment = await eventService.addComment(req.params.id, req.body.content, req.user!.id, req.user!.tenantId)

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    })
  }),
)

// Import/Export
router.post(
  "/import",
  authorize(["admin", "analyst"]),
  upload.single("file"),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" })
      return
    }

    const fileType = req.file.mimetype.includes("csv") ? "csv" : "excel"

    const result = await importService.importEvents(req.file.buffer, fileType, req.user!.id, req.user!.tenantId)

    res.json({
      message: "Import completed",
      result,
    })
  }),
)

const exportQuerySchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  format: Joi.string().valid("csv", "excel").default("csv"),
})

router.get(
  "/export",
  tenantFilter,
  validateQuery(exportQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { startDate, endDate, format = "csv" } = req.query

    const exportData = await exportService.exportEventsData({
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
    })

    const filename = `events-export-${new Date().toISOString().split("T")[0]}.${format}`

    res.setHeader(
      "Content-Type",
      format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(exportData)
  }),
)

router.get(
  "/template",
  asyncHandler(async (req, res) => {
    const template = await exportService.exportEventsTemplate()

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment; filename="events-template.csv"')
    res.send(template)
  }),
)

export default router
