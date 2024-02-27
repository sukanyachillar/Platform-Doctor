import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
import paymentModel from './paymentModel.js';


const bookingModel = sequelize.define('booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true, 
    allowNull: false,
  },
  customerId: {
    type: DataTypes.INTEGER, 
    allowNull: true,
    unique: false,
  },
  // customerName: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   unique: false,
  // },
  // customerPhone: {
  //   type: DataTypes.STRING,
  //   allowNull: true,
  //   unique: false,
  // },
  entityId: {
    type: DataTypes.INTEGER,
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
    type: DataTypes.INTEGER, //  0: booked, 1-completed, 2-cancelled 3 processing
    allowNull: true,
    unique: false,
    defaultValue: 3
  },
  // paymentStatus: {  // 0 payment initiated, 1.completed 2.cancelled
  //   type: DataTypes.INTEGER,
  //   allowNull: false,
  //   defaultValue: 0
  // },
  // paymentMethod: {
  //   type: DataTypes.STRING,
  //   allowNull: false,
  //   defaultValue: "Razorpay"
  // },
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

// bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
// bookingModel.belongsTo(doctorModel, { foreignKey: 'entityId', as: 'doctor' });
import userModel from './userModel.js';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js';

// bookingModel.hasOne(paymentModel, { foreignKey: 'bookingId' });
// bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'user' });

// bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
// bookingModel.hasMany(weeklyTimeSlotsModel, { foreignKey: 'workSlotId', as: 'weeklyTimeSlots' });


export default bookingModel;


