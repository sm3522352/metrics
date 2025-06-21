import { Sequelize } from "sequelize"
import { config } from "./app"

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.username,
  password: config.database.password,
  logging: config.env === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
})

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    console.log("Database connection established successfully.")

    if (config.env === "development") {
      await sequelize.sync({ alter: true })
      console.log("Database synchronized.")
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error)
    process.exit(1)
  }
}
