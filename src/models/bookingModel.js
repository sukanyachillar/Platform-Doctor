
import { DataTypes } from 'sequelize' ;
import sequelize from '../dbConnect.js';

const bookingModel = sequelize.define('booking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  customer_name: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  customer_phone: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  entity_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  department_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  booking_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: false,
  },
  booking_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  appointment_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  booking_status: {
    type: DataTypes.INTEGER, // 1: bookingInitiated, booked, completed, cancelled
    allowNull: true,
    unique: false,
  },
  work_schedule_id: {
    type: DataTypes.STRING, 
    allowNull: true,
    unique: false,
  },
  created_date_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  update_date_time: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
  
});

export default bookingModel;

