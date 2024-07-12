import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";
import bookingModel from "../models/bookingModel.js";

const paymentGatewayModel = sequelize.define("paymentGateway", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: false,
  },
  key1: {
    type: DataTypes.STRING,    //for app id
    allowNull: true,
    unique: false,
  },
  key2: {
    type: DataTypes.STRING,    //for app secret
    allowNull: true,
    unique: false,
  },
  status: {
    type: DataTypes.INTEGER, // 1: active, 0: inactive
    allowNull: true,
    unique: false,
},
});



export default paymentGatewayModel;
