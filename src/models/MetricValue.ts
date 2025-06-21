import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"

export interface MetricValueAttributes {
  id: string
  metricId: string
  value: number
  date: Date
  period?: string
  metadata?: Record<string, any>
  tenantId?: string
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface MetricValueCreationAttributes
  extends Optional<MetricValueAttributes, "id" | "createdAt" | "updatedAt"> {}

export class MetricValue
  extends Model<MetricValueAttributes, MetricValueCreationAttributes>
  implements MetricValueAttributes
{
  public id!: string
  public metricId!: string
  public value!: number
  public date!: Date
  public period?: string
  public metadata?: Record<string, any>
  public tenantId?: string
  public createdAt!: Date
  public updatedAt!: Date
  public createdBy!: string
}

MetricValue.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    metricId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "metrics",
        key: "id",
      },
    },
    value: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    period: {
      type: DataTypes.STRING,
      allowNull: true,
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
    modelName: "MetricValue",
    tableName: "metric_values",
    indexes: [
      {
        fields: ["metricId", "date"],
        unique: true,
      },
      {
        fields: ["date"],
      },
      {
        fields: ["tenantId"],
      },
    ],
  },
)
