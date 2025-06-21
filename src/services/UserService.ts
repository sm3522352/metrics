import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { User, type UserCreationAttributes } from "../models/User"
import { config } from "../config/app"

export class UserService {
  async createUser(userData: UserCreationAttributes & { password: string }): Promise<User> {
    const { password, ...userInfo } = userData
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
      ...userInfo,
      passwordHash,
    })

    return user
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await User.findOne({ where: { email, isActive: true } })

    if (!user) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      return null
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() })

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn })

    return { user, token }
  }

  async getUserById(id: string): Promise<User | null> {
    return User.findByPk(id)
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await User.findByPk(id)

    if (!user) {
      return null
    }

    await user.update(updates)
    return user
  }

  async deleteUser(id: string): Promise<boolean> {
    const user = await User.findByPk(id)

    if (!user) {
      return false
    }

    await user.update({ isActive: false })
    return true
  }

  async getAllUsers(tenantId?: string): Promise<User[]> {
    const whereClause: any = { isActive: true }

    if (tenantId) {
      whereClause.tenantId = tenantId
    }

    return User.findAll({
      where: whereClause,
      attributes: { exclude: ["passwordHash"] },
    })
  }
}
