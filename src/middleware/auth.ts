import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config/app"
import { User } from "../models"

export interface AuthenticatedRequest extends Request {
  user?: User
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      res.status(401).json({ error: "Access denied. No token provided." })
      return
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string }
    const user = await User.findByPk(decoded.userId)

    if (!user || !user.isActive) {
      res.status(401).json({ error: "Invalid token or user not active." })
      return
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ error: "Invalid token." })
  }
}

export const authorize = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Authentication required." })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: "Insufficient permissions." })
      return
    }

    next()
  }
}

export const tenantFilter = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required." })
    return
  }

  // Add tenant filter to query if user is not admin
  if (req.user.role !== "admin" && req.user.tenantId) {
    req.query.tenantId = req.user.tenantId
  }

  next()
}
