import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";
import bookingModel from "../models/bookingModel.js";
import paymentGatewayModel from "./paymentGatewayModel.js";

const paymentModel = sequelize.define("payment", {
  paymentId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  bookingId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentStatus: {
    // 0 payment initiated, 1.completed 2.cancelled
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  orderId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    unique: false,
  },
  // pgId: {
  //   type: DataTypes.INTEGER,
  //   allowNull: true,
  //   references: {
  //     model: "paymentGatewayModel", // 'paymentGatewayModel' refers to table name
  //     key: "id", // 'id' refers to column name in paymentGatewayModel table
  //   },
  // },
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
});

// paymentModel.belongsTo(paymentGatewayModel, { foreignKey: 'pgId' });
// paymentGatewayModel.hasMany(paymentModel, { foreignKey: 'pgId' });

// paymentModel.associate = function(models) {
//     paymentModel.hasOne(models.bookingModel, { foreignKey: 'bookingId' });
// };

export default paymentModel;
