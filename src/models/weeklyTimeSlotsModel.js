import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";
import doctorModel from "./doctorModel.js";
// import bookingModel from './bookingModel.js'

const weeklyTimeSlotsModel = sequelize.define("weeklyTimeSlots", {
  time_slot_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  date: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time_slot: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  token_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  doctor_id: {
    // and entityid
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  booking_status: {
    type: DataTypes.INTEGER, // 0-open , 1- booked , 3-processing
    allowNull: false,
    defaultValue: 0,
  },
  doctorEntityId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

weeklyTimeSlotsModel.associate = function (models) {
  weeklyTimeSlotsModel.hasOne(models.bookingModel, {
    foreignKey: "workSlotId",
  });
  weeklyTimeSlotsModel.belongsTo(models.doctorModel, {
    foreignKey: "doctor_id",
  });
};

export default weeklyTimeSlotsModel;
