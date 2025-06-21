import request from "supertest"
import app from "../../app"
import { UserService } from "../../services/UserService"

describe("Auth Routes", () => {
  let userService: UserService

  beforeEach(() => {
    userService = new UserService()
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst",
      }

      const response = await request(app).post("/api/auth/register").send(userData).expect(201)

      expect(response.body.message).toBe("User created successfully")
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user.name).toBe(userData.name)
      expect(response.body.user.role).toBe(userData.role)
    })

    it("should return validation error for invalid data", async () => {
      const invalidData = {
        name: "",
        email: "invalid-email",
        password: "123", // Too short
      }

      const response = await request(app).post("/api/auth/register").send(invalidData).expect(400)

      expect(response.body.error).toBe("Validation error")
    })
  })

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // First register a user
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "analyst",
      }

      await userService.createUser(userData)

      const loginData = {
        email: userData.email,
        password: userData.password,
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(200)

      expect(response.body.message).toBe("Login successful")
      expect(response.body.token).toBeDefined()
      expect(response.body.user.email).toBe(userData.email)
    })

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "wrongpassword",
      }

      const response = await request(app).post("/api/auth/login").send(loginData).expect(401)

      expect(response.body.error).toBe("Invalid credentials")
    })
  })
})
