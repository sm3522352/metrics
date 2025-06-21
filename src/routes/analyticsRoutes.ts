import { Router } from "express"
import { AnalyticsService } from "../services/AnalyticsService"
import { ExportService } from "../services/ExportService"
import { authenticate, tenantFilter, type AuthenticatedRequest } from "../middleware/auth"
import { validateQuery } from "../middleware/validation"
import { asyncHandler } from "../middleware/errorHandler"
import Joi from "joi"

const router = Router()
const analyticsService = new AnalyticsService()
const exportService = new ExportService()

// Apply authentication to all routes
router.use(authenticate)

const analyticsQuerySchema = Joi.object({
  metricIds: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
})

/**
 * @swagger
 * /analytics/metrics:
 *   get:
 *     summary: Analyze metrics for a period
 *     tags: [Analytics]
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
 *         description: Metric analysis results
 */
router.get(
  "/metrics",
  tenantFilter,
  validateQuery(analyticsQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricIds, startDate, endDate } = req.query

    const analysis = await analyticsService.analyzeMetrics({
      metricIds: metricIds ? (metricIds as string).split(",") : undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
    })

    res.json({ analysis })
  }),
)

/**
 * @swagger
 * /analytics/insights:
 *   get:
 *     summary: Generate insights for metrics
 *     tags: [Analytics]
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
 *     responses:
 *       200:
 *         description: Generated insights
 */
router.get(
  "/insights",
  tenantFilter,
  validateQuery(analyticsQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricIds, startDate, endDate } = req.query

    const insights = await analyticsService.generateInsights({
      metricIds: metricIds ? (metricIds as string).split(",") : undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
    })

    res.json({ insights })
  }),
)

const correlationSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  metricIds: Joi.string().required(),
})

/**
 * @swagger
 * /analytics/correlations:
 *   get:
 *     summary: Calculate event-metric correlations
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: metricIds
 *         required: true
 *         schema:
 *           type: string
 *         description: Comma-separated metric IDs
 *     responses:
 *       200:
 *         description: Correlation results
 */
router.get(
  "/correlations",
  tenantFilter,
  validateQuery(correlationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { eventId, metricIds } = req.query

    const correlations = await analyticsService.calculateEventCorrelations(
      eventId as string,
      (metricIds as string).split(","),
      req.query.tenantId as string,
    )

    res.json({ correlations })
  }),
)

const comparisonSchema = Joi.object({
  metricId: Joi.string().uuid().required(),
  period1Start: Joi.date().required(),
  period1End: Joi.date().required(),
  period2Start: Joi.date().required(),
  period2End: Joi.date().required(),
})

/**
 * @swagger
 * /analytics/compare:
 *   get:
 *     summary: Compare metric between two periods
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: metricId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: period1Start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period1End
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period2Start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: period2End
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Comparison results
 */
router.get(
  "/compare",
  tenantFilter,
  validateQuery(comparisonSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricId, period1Start, period1End, period2Start, period2End } = req.query

    const comparison = await analyticsService.getMetricComparison(
      metricId as string,
      {
        start: new Date(period1Start as string),
        end: new Date(period1End as string),
      },
      {
        start: new Date(period2Start as string),
        end: new Date(period2End as string),
      },
      req.query.tenantId as string,
    )

    res.json({ comparison })
  }),
)

const whatIfSchema = Joi.object({
  scenarioName: Joi.string().required(),
  assumptions: Joi.object().pattern(Joi.string(), Joi.number()).required(),
  metricIds: Joi.string(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
})

/**
 * @swagger
 * /analytics/whatif:
 *   post:
 *     summary: Generate what-if scenario
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scenarioName
 *               - assumptions
 *               - startDate
 *               - endDate
 *             properties:
 *               scenarioName:
 *                 type: string
 *               assumptions:
 *                 type: object
 *               metricIds:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: What-if scenario results
 */
router.post(
  "/whatif",
  tenantFilter,
  validateQuery(whatIfSchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { scenarioName, assumptions, metricIds, startDate, endDate } = req.body

    const scenario = await analyticsService.generateWhatIfScenario(scenarioName, assumptions, {
      metricIds: metricIds ? metricIds.split(",") : undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      tenantId: req.query.tenantId as string,
    })

    res.json({ scenario })
  }),
)

/**
 * @swagger
 * /analytics/export:
 *   get:
 *     summary: Export analytics report
 *     tags: [Analytics]
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
 *         description: Analytics report file
 */
router.get(
  "/export",
  tenantFilter,
  validateQuery(analyticsQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res) => {
    const { metricIds, startDate, endDate, format = "csv" } = req.query

    const exportData = await exportService.exportAnalyticsReport({
      metricIds: metricIds ? (metricIds as string).split(",") : undefined,
      startDate: new Date(startDate as string),
      endDate: new Date(endDate as string),
      tenantId: req.query.tenantId as string,
    })

    const filename = `analytics-report-${new Date().toISOString().split("T")[0]}.${format}`

    res.setHeader(
      "Content-Type",
      format === "csv" ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
    res.send(exportData)
  }),
)

export default router
