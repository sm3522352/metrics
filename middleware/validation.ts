import type { Request, Response, NextFunction } from "express"

export class ValidationMiddleware {
  static validateMetricData(req: Request, res: Response, next: NextFunction) {
    const { metricIds, startDate, endDate } = req.query

    const errors: string[] = []

    if (!metricIds) {
      errors.push("metricIds is required")
    }

    if (!startDate || !this.isValidDate(startDate as string)) {
      errors.push("Valid startDate is required")
    }

    if (!endDate || !this.isValidDate(endDate as string)) {
      errors.push("Valid endDate is required")
    }

    if (startDate && endDate && new Date(startDate as string) > new Date(endDate as string)) {
      errors.push("startDate must be before endDate")
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    next()
  }

  static validateEventData(req: Request, res: Response, next: NextFunction) {
    const { title, date, category, impact } = req.body

    const errors: string[] = []

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      errors.push("Valid title is required")
    }

    if (!date || !this.isValidDate(date)) {
      errors.push("Valid date is required")
    }

    const validCategories = ["marketing", "operations", "finance", "hr", "product"]
    if (!category || !validCategories.includes(category)) {
      errors.push("Valid category is required")
    }

    const validImpacts = ["low", "medium", "high"]
    if (!impact || !validImpacts.includes(impact)) {
      errors.push("Valid impact is required")
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }

    next()
  }

  static validateImportFile(req: Request, res: Response, next: NextFunction) {
    if (!req.file) {
      return res.status(400).json({ error: "File is required" })
    }

    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Invalid file type. Only CSV and Excel files are allowed" })
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: "File too large. Maximum size is 10MB" })
    }

    next()
  }

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }
}
