// src/models/apiLog.js

import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";

const ApiLog = sequelize.define("apiLog", {
  logId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  method: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  responseBodySize: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  requestData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  responseData: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'apiLogs',
  timestamps: true, 
});

export default ApiLog;
