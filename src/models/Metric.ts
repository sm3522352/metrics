import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"

export interface MetricAttributes {
  id: string
  name: string
  displayName: string
  category: string
  description?: string
  unit?: string
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  isActive: boolean
  tenantId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface MetricCreationAttributes
  extends Optional<MetricAttributes, "id" | "createdAt" | "updatedAt" | "isActive"> {}

export class Metric extends Model<MetricAttributes, MetricCreationAttributes> implements MetricAttributes {
  public id!: string
  public name!: string
  public displayName!: string
  public category!: string
  public description?: string
  public unit?: string
  public frequency!: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
  public isActive!: boolean
  public tenantId?: string
  public createdAt!: Date
  public updatedAt!: Date
  public createdBy!: string
}

Metric.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    displayName: {
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
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM("daily", "weekly", "monthly", "quarterly", "yearly"),
      allowNull: false,
      defaultValue: "monthly",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    modelName: "Metric",
    tableName: "metrics",
    indexes: [
      {
        fields: ["name"],
        unique: true,
      },
      {
        fields: ["category"],
      },
      {
        fields: ["tenantId"],
      },
    ],
  },
)
