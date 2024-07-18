import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";

const outsideUserModel = sequelize.define("outsideUser", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  status: {
    type: DataTypes.INTEGER, // 1: active, 0: inactive
    allowNull: true,
    unique: false,
    defaultValue: 0,
  },
});

export default outsideUserModel;
