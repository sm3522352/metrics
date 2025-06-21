import type { User } from "../models/user"
import type { Request, Response, NextFunction } from "express"

export interface AuthRequest extends Request {
  user?: User
}

export class AuthMiddleware {
  static authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    try {
      const decoded = this.verifyToken(token)
      req.user = decoded.user
      next()
    } catch (error) {
      return res.status(401).json({ error: "Invalid token" })
    }
  }

  static authorize(permissions: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" })
      }

      const hasPermission = permissions.some((permission) => req.user?.permissions.some((p) => p.name === permission))

      if (!hasPermission) {
        return res.status(403).json({ error: "Insufficient permissions" })
      }

      next()
    }
  }

  static requireRole(roles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" })
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Insufficient role" })
      }

      next()
    }
  }

  private static verifyToken(token: string): { user: User } {
    // Здесь должна быть реальная верификация JWT токена
    // Для примера возвращаем мок
    return {
      user: {
        id: "1",
        email: "user@example.com",
        name: "Test User",
        role: "analyst",
        permissions: [],
        preferences: {
          defaultMetrics: [],
          defaultPeriod: "6m",
          theme: "light",
          notifications: {
            email: true,
            push: false,
            criticalChanges: true,
            weeklyReports: false,
          },
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      },
    }
  }
}
