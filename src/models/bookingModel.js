import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js'

const bookingModel = sequelize.define('booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
    allowNull: false,
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  entityId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  departmentId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  bookingType: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: false,
  },
  bookingDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  appointmentDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  bookingStatus: {
    type: DataTypes.INTEGER, //  0: booked, 1-completed, 2-cancelled
    allowNull: true,
    unique: false,
    // defaultValue: 0
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
  workSlotId: {
    type: DataTypes.INTEGER, 
    allowNull: true,
    unique: false,
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

export default bookingModel;


