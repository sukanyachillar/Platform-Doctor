import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";

const logModel = sequelize.define("log", {
  logId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  apiEndpoint: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  requestData: {
    type: DataTypes.JSON, // Store request payload as JSON
    allowNull: true,
  },
  responseStatus: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  responseData: {
    type: DataTypes.JSON, // Store response data as JSON
    allowNull: true,
  },
  errorMessage: {
    type: DataTypes.TEXT, // Store error messages, if any
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER, // Optional: Track which user made the request
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    // defaultValue: sequelize.literal("CURRENT_TIMESTAMP + INTERVAL 30 DAY"),
    allowNull: true,
  },
});

export default logModel;
