import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
// import bookingModel from './bookingModel.js'

const weeklyTimeSlotsModel = sequelize.define('weeklyTimeSlots', {
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
    doctor_id: { // and entityid
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    booking_status: {
        type: DataTypes.INTEGER, //1- booked 0-available,
        allowNull: false,
        defaultValue: 0,
    },
    doctorEntityId: { 
        type: DataTypes.INTEGER,
        allowNull: true,
    },
})


export default weeklyTimeSlotsModel
