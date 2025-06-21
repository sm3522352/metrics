import { UserService } from "../../services/UserService"
import { User } from "../../models/User"

describe("UserService", () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
  })

  describe("createUser", () => {
    it("should create a new user with hashed password", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      const user = await userService.createUser(userData)

      expect(user.id).toBeDefined()
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe(userData.role)
      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe(userData.password)
      expect(user.isActive).toBe(true)
    })

    it("should throw error for duplicate email", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      await userService.createUser(userData)

      await expect(userService.createUser(userData)).rejects.toThrow()
    })
  })

  describe("authenticateUser", () => {
    it("should authenticate user with correct credentials", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      await userService.createUser(userData)

      const result = await userService.authenticateUser(userData.email, userData.password)

      expect(result).toBeDefined()
      expect(result!.user.email).toBe(userData.email)
      expect(result!.token).toBeDefined()
    })

    it("should return null for incorrect password", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      await userService.createUser(userData)

      const result = await userService.authenticateUser(userData.email, "wrongpassword")

      expect(result).toBeNull()
    })

    it("should return null for non-existent user", async () => {
      const result = await userService.authenticateUser("nonexistent@example.com", "password123")

      expect(result).toBeNull()
    })
  })

  describe("getUserById", () => {
    it("should return user by ID", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      const createdUser = await userService.createUser(userData)
      const foundUser = await userService.getUserById(createdUser.id)

      expect(foundUser).toBeDefined()
      expect(foundUser!.id).toBe(createdUser.id)
      expect(foundUser!.email).toBe(userData.email)
    })

    it("should return null for non-existent ID", async () => {
      const foundUser = await userService.getUserById("non-existent-id")

      expect(foundUser).toBeNull()
    })
  })

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      const createdUser = await userService.createUser(userData)
      const updates = { name: "Updated Name", role: "admin" as const }

      const updatedUser = await userService.updateUser(createdUser.id, updates)

      expect(updatedUser).toBeDefined()
      expect(updatedUser!.name).toBe(updates.name)
      expect(updatedUser!.role).toBe(updates.role)
    })

    it("should return null for non-existent user", async () => {
      const updates = { name: "Updated Name" }
      const result = await userService.updateUser("non-existent-id", updates)

      expect(result).toBeNull()
    })
  })

  describe("deleteUser", () => {
    it("should soft delete user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst" as const,
      }

      const createdUser = await userService.createUser(userData)
      const result = await userService.deleteUser(createdUser.id)

      expect(result).toBe(true)

      const foundUser = await User.findByPk(createdUser.id)
      expect(foundUser!.isActive).toBe(false)
    })

    it("should return false for non-existent user", async () => {
      const result = await userService.deleteUser("non-existent-id")

      expect(result).toBe(false)
    })
  })
})
