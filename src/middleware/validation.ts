import type { Request, Response, NextFunction } from "express"
import Joi from "joi"

export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body)

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      res.status(400).json({
        error: "Validation error",
        details: errorMessage,
      })
      return
    }

    next()
  }
}

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.query)

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(", ")
      res.status(400).json({
        error: "Query validation error",
        details: errorMessage,
      })
      return
    }

    next()
  }
}

// Common validation schemas
export const schemas = {
  user: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid("admin", "analyst", "viewer").default("viewer"),
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(100),
      email: Joi.string().email(),
      role: Joi.string().valid("admin", "analyst", "viewer"),
      isActive: Joi.boolean(),
    }),
  },

  metric: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      displayName: Joi.string().min(2).max(100).required(),
      category: Joi.string().min(2).max(50).required(),
      description: Joi.string().max(500),
      unit: Joi.string().max(20),
      frequency: Joi.string().valid("daily", "weekly", "monthly", "quarterly", "yearly").default("monthly"),
    }),
    update: Joi.object({
      displayName: Joi.string().min(2).max(100),
      category: Joi.string().min(2).max(50),
      description: Joi.string().max(500),
      unit: Joi.string().max(20),
      frequency: Joi.string().valid("daily", "weekly", "monthly", "quarterly", "yearly"),
      isActive: Joi.boolean(),
    }),
  },

  event: {
    create: Joi.object({
      name: Joi.string().min(2).max(200).required(),
      category: Joi.string().min(2).max(50).required(),
      description: Joi.string().max(1000),
      startDate: Joi.date().required(),
      endDate: Joi.date().greater(Joi.ref("startDate")),
      impact: Joi.string().valid("low", "medium", "high").default("medium"),
      metricIds: Joi.array().items(Joi.string().uuid()),
    }),
    update: Joi.object({
      name: Joi.string().min(2).max(200),
      category: Joi.string().min(2).max(50),
      description: Joi.string().max(1000),
      startDate: Joi.date(),
      endDate: Joi.date(),
      impact: Joi.string().valid("low", "medium", "high"),
      status: Joi.string().valid("planned", "active", "completed", "cancelled"),
    }),
  },

  query: {
    pagination: Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20),
      sortBy: Joi.string(),
      sortOrder: Joi.string().valid("asc", "desc").default("desc"),
    }),
    dateRange: Joi.object({
      startDate: Joi.date(),
      endDate: Joi.date().greater(Joi.ref("startDate")),
    }),
  },
}
