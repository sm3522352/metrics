import { DataTypes, Model } from "sequelize"
import { sequelize } from "../config/database"

export interface EventMetricAttributes {
  id: string
  eventId: string
  metricId: string
  expectedImpact?: number
  actualImpact?: number
  correlation?: number
  createdAt: Date
  updatedAt: Date
}

export class EventMetric extends Model<EventMetricAttributes> implements EventMetricAttributes {
  public id!: string
  public eventId!: string
  public metricId!: string
  public expectedImpact?: number
  public actualImpact?: number
  public correlation?: number
  public createdAt!: Date
  public updatedAt!: Date
}

EventMetric.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    metricId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "metrics",
        key: "id",
      },
    },
    expectedImpact: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    actualImpact: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: true,
    },
    correlation: {
      type: DataTypes.DECIMAL(5, 4),
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
  },
  {
    sequelize,
    modelName: "EventMetric",
    tableName: "event_metrics",
    indexes: [
      {
        fields: ["eventId", "metricId"],
        unique: true,
      },
    ],
  },
)
