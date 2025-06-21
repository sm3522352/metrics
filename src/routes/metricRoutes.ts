import { Router } from "express"
import { MetricService } from "../services/MetricService"
import { ImportService } from "../services/ImportService"
import { ExportService } from "../services/ExportService"
import { authenticate, authorize, tenantFilter, type AuthenticatedRequest } from "../middleware/auth"
import { validate, validateQuery, schemas } from "../middleware/validation"
import { upload } from "../middleware/upload"
import { asyncHandler } from "../middleware/errorHandler"
import Joi from "joi"

const router = Router()
const metricService = new MetricService()
const importService = new ImportService()
const exportService = new ExportService()

// Apply authentication to all routes
router.use(authenticate)

/**
 * @swagger
 * /metrics:
 *   get:
 *     summary: Get all metrics
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, display name, or description
 *     responses:
 *       200:
 *         description: List of metrics
 */
router.get(
  "/",
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { category, search } = req.query

    let metrics

    if (search) {
      metrics = await metricService.searchMetrics(search as string, req.query.tenantId as string)
    } else if (category) {
      metrics = await metricService.getMetricsByCategory(category as string, req.query.tenantId as string)
    } else {
      metrics = await metricService.getAllMetrics(req.query.tenantId as string)
    }

    res.json({ metrics })
  }),
)

/**
 * @swagger
 * /metrics/{id}:
 *   get:
 *     summary: Get metric by ID
 *     tags: [Metrics]
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
 *         description: Metric details
 *       404:
 *         description: Metric not found
 */
router.get(
  "/:id",
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const metric = await metricService.getMetricById(req.params.id, req.query.tenantId as string)

    if (!metric) {
      res.status(404).json({ error: "Metric not found" })
      return
    }

    res.json({ metric })
  }),
)

/**
 * @swagger
 * /metrics:
 *   post:
 *     summary: Create a new metric
 *     tags: [Metrics]
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
 *               - displayName
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               unit:
 *                 type: string
 *               frequency:
 *                 type: string
 *                 enum: [daily, weekly, monthly, quarterly, yearly]
 *     responses:
 *       201:
 *         description: Metric created successfully
 */
router.post(
  "/",
  authorize(["admin", "analyst"]),
  validate(schemas.metric.create),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const metricData = {
      ...req.body,
      createdBy: req.user!.id,
      tenantId: req.user!.tenantId,
    }

    const metric = await metricService.createMetric(metricData)

    res.status(201).json({
      message: "Metric created successfully",
      metric,
    })
  }),
)

/**
 * @swagger
 * /metrics/{id}:
 *   put:
 *     summary: Update metric
 *     tags: [Metrics]
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
 *         description: Metric updated successfully
 *       404:
 *         description: Metric not found
 */
router.put(
  "/:id",
  authorize(["admin", "analyst"]),
  validate(schemas.metric.update),
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const metric = await metricService.updateMetric(req.params.id, req.body, req.query.tenantId as string)

    if (!metric) {
      res.status(404).json({ error: "Metric not found" })
      return
    }

    res.json({
      message: "Metric updated successfully",
      metric,
    })
  }),
)

/**
 * @swagger
 * /metrics/{id}:
 *   delete:
 *     summary: Delete metric
 *     tags: [Metrics]
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
 *         description: Metric deleted successfully
 *       404:
 *         description: Metric not found
 */
router.delete(
  "/:id",
  authorize(["admin"]),
  tenantFilter,
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const success = await metricService.deleteMetric(req.params.id, req.query.tenantId as string)

    if (!success) {
      res.status(404).json({ error: "Metric not found" })
      return
    }

    res.json({ message: "Metric deleted successfully" })
  }),
)

// Time series endpoints
const timeSeriesQuerySchema = Joi.object({
  metricIds: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  groupBy: Joi.string().valid("day", "week", "month", "quarter", "year"),
})

/**
 * @swagger
 * /metrics/timeseries:
 *   get:
 *     summary: Get time series data
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metricIds
 *         schema:
 *           type: string
 *         description: Comma-separated metric IDs
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Time series data
 */
router.get(
  "/timeseries",
  tenantFilter,
  validateQuery(timeSeriesQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricIds, startDate, endDate, groupBy } = req.query

    const timeSeries = await metricService.getTimeSeries({
      metricIds: metricIds ? (metricIds as string).split(",") : undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
      groupBy: groupBy as any,
    })

    res.json({ timeSeries })
  }),
)

// Import/Export endpoints
/**
 * @swagger
 * /metrics/import:
 *   post:
 *     summary: Import metrics data
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Import completed
 */
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

    const result = await importService.importMetrics(req.file.buffer, fileType, req.user!.id, req.user!.tenantId)

    res.json({
      message: "Import completed",
      result,
    })
  }),
)

/**
 * @swagger
 * /metrics/export:
 *   get:
 *     summary: Export metrics data
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metricIds
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, excel]
 *           default: csv
 *     responses:
 *       200:
 *         description: Exported file
 */
router.get(
  "/export",
  tenantFilter,
  validateQuery(timeSeriesQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricIds, startDate, endDate, format = "csv" } = req.query

    const exportData = await exportService.exportMetricsData({
      metricIds: metricIds ? (metricIds as string).split(",") : undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
    })

    const filename = `metrics-export-${new Date().toISOString().split("T")[0]}.${format}`

    res.setHeader(
      "Content-Type",
      format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(exportData)
  }),
)

/**
 * @swagger
 * /metrics/template:
 *   get:
 *     summary: Download import template
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Template file
 */
router.get(
  "/template",
  asyncHandler(async (req, res) => {
    const template = await exportService.exportMetricsTemplate()

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", 'attachment; filename="metrics-template.csv"')
    res.send(template)
  }),
)

export default router
