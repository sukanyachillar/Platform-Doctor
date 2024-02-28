import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
// import bookingModel from './bookingModel.js'
<<<<<<< HEAD
// In other files
// import { userModel, doctorModel, bookingModel, paymentModel } from'../models';

=======
>>>>>>> dce19f1faf5d3f793c5b7295112d023eb28c394c

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
    doctor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    booking_status: {
        type: DataTypes.INTEGER, //1- booked 0-available,
        allowNull: false,
        defaultValue: 0,
    },
})

// weeklyTimeSlotsModel.belongsTo(bookingModel, { foreignKey: 'workSlotId', as: 'booking' });
// weeklyTimeSlotsModel.belongsTo(doctorModel, { foreignKey: 'doctor_id', as: 'doctor' });

export default weeklyTimeSlotsModel
