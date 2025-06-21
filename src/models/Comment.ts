import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"

export interface CommentAttributes {
  id: string
  eventId: string
  content: string
  authorId: string
  tenantId?: string
  createdAt: Date
  updatedAt: Date
}

export interface CommentCreationAttributes extends Optional<CommentAttributes, "id" | "createdAt" | "updatedAt"> {}

export class Comment extends Model<CommentAttributes, CommentCreationAttributes> implements CommentAttributes {
  public id!: string
  public eventId!: string
  public content!: string
  public authorId!: string
  public tenantId?: string
  public createdAt!: Date
  public updatedAt!: Date
}

Comment.init(
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
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
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    indexes: [
      {
        fields: ["eventId"],
      },
      {
        fields: ["authorId"],
      },
    ],
  },
)
