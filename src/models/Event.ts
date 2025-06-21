import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"

export interface EventAttributes {
  id: string
  name: string
  category: string
  description?: string
  startDate: Date
  endDate?: Date
  impact: "low" | "medium" | "high"
  status: "planned" | "active" | "completed" | "cancelled"
  metadata?: Record<string, any>
  tenantId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface EventCreationAttributes
  extends Optional<EventAttributes, "id" | "createdAt" | "updatedAt" | "status"> {}

export class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: string
  public name!: string
  public category!: string
  public description?: string
  public startDate!: Date
  public endDate?: Date
  public impact!: "low" | "medium" | "high"
  public status!: "planned" | "active" | "completed" | "cancelled"
  public metadata?: Record<string, any>
  public tenantId?: string
  public createdAt!: Date
  public updatedAt!: Date
  public createdBy!: string
}

Event.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    impact: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    status: {
      type: DataTypes.ENUM("planned", "active", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "planned",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    indexes: [
      {
        fields: ["category"],
      },
      {
        fields: ["startDate"],
      },
      {
        fields: ["status"],
      },
      {
        fields: ["tenantId"],
      },
    ],
  },
)
