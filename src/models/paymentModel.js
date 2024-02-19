import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'

const paymentModel = sequelize.define('payment', {
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
  paymentStatus: {  // 0 payment initiated, 1.completed 2.cancelled
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Razorpay"
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

export default paymentModel;


