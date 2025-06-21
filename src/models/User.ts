import { DataTypes, Model, type Optional } from "sequelize"
import { sequelize } from "../config/database"

export interface UserAttributes {
  id: string
  name: string
  email: string
  passwordHash: string
  role: "admin" | "analyst" | "viewer"
  tenantId?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  createdBy?: string
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "createdAt" | "updatedAt" | "lastLoginAt" | "isActive"> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string
  public name!: string
  public email!: string
  public passwordHash!: string
  public role!: "admin" | "analyst" | "viewer"
  public tenantId?: string
  public isActive!: boolean
  public lastLoginAt?: Date
  public createdAt!: Date
  public updatedAt!: Date
  public createdBy?: string
}

User.init(
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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "analyst", "viewer"),
      allowNull: false,
      defaultValue: "viewer",
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
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
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    indexes: [
      {
        fields: ["email"],
        unique: true,
      },
      {
        fields: ["tenantId"],
      },
    ],
  },
)
