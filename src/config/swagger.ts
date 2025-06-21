import swaggerJsdoc from "swagger-jsdoc"
import { config } from "./app"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Metrics Analytics API",
      version: "1.0.0",
      description: "A comprehensive API for metrics and events analytics with correlation analysis",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // paths to files containing OpenAPI definitions
}

export const specs = swaggerJsdoc(options)
