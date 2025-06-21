import { Router } from "express"
import { MetricService } from "../services/metricService"
import { AuthMiddleware } from "../middleware/auth"
import { ValidationMiddleware } from "../middleware/validation"

const router = Router()
const metricService = new MetricService()

// GET /api/metrics - Получить все метрики
router.get("/", AuthMiddleware.authenticate, async (req, res) => {
  try {
    const metrics = await metricService.getAllMetrics()
    res.json(metrics)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metrics" })
  }
})

// GET /api/metrics/data - Получить данные метрик
router.get("/data", AuthMiddleware.authenticate, ValidationMiddleware.validateMetricData, async (req, res) => {
  try {
    const { metricIds, startDate, endDate } = req.query
    const data = await metricService.getMetricData(
      (metricIds as string).split(","),
      startDate as string,
      endDate as string,
    )
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch metric data" })
  }
})

// POST /api/metrics - Создать новую метрику
router.post("/", AuthMiddleware.authenticate, AuthMiddleware.authorize(["create_metrics"]), async (req, res) => {
  try {
    const metric = await metricService.createMetric(req.body)
    res.status(201).json(metric)
  } catch (error) {
    res.status(500).json({ error: "Failed to create metric" })
  }
})

// PUT /api/metrics/:id - Обновить метрику
router.put("/:id", AuthMiddleware.authenticate, AuthMiddleware.authorize(["update_metrics"]), async (req, res) => {
  try {
    const metric = await metricService.updateMetric(req.params.id, req.body)
    if (!metric) {
      return res.status(404).json({ error: "Metric not found" })
    }
    res.json(metric)
  } catch (error) {
    res.status(500).json({ error: "Failed to update metric" })
  }
})

// DELETE /api/metrics/:id - Удалить метрику
router.delete("/:id", AuthMiddleware.authenticate, AuthMiddleware.authorize(["delete_metrics"]), async (req, res) => {
  try {
    const success = await metricService.deleteMetric(req.params.id)
    if (!success) {
      return res.status(404).json({ error: "Metric not found" })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: "Failed to delete metric" })
  }
})

// POST /api/metrics/import - Импорт данных метрик
router.post(
  "/import",
  AuthMiddleware.authenticate,
  AuthMiddleware.authorize(["import_data"]),
  ValidationMiddleware.validateImportFile,
  async (req, res) => {
    try {
      // Здесь должна быть логика обработки файла
      const results = await metricService.importMetricData([])
      res.json(results)
    } catch (error) {
      res.status(500).json({ error: "Failed to import data" })
    }
  },
)

// GET /api/metrics/export - Экспорт данных метрик
router.get("/export", AuthMiddleware.authenticate, ValidationMiddleware.validateMetricData, async (req, res) => {
  try {
    const { metricIds, startDate, endDate } = req.query
    const data = await metricService.exportMetricData(
      (metricIds as string).split(","),
      startDate as string,
      endDate as string,
    )

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", "attachment; filename=metrics.csv")
    res.send(data)
  } catch (error) {
    res.status(500).json({ error: "Failed to export data" })
  }
})

export default router
