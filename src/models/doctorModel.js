import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'

const doctorModel = sequelize.define('doctor', {
    doctor_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    doctor_name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    department_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    qualification: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    entity_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    doctor_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    consultation_time: {
        type: DataTypes.INTEGER, // 20mins
        allowNull: true,
        unique: false,
    },

    consultation_charge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    status: {
        type: DataTypes.INTEGER, // 1: active, 0: inactive
        allowNull: true,
        unique: false,
        defaultValue: 1,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    profileImageUrl: {
        type: DataTypes.STRING,
        type: DataTypes.TEXT,
        allowNull: true,
    },
    add_staff: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, //1 can add
    },
    add_service: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0, //1 can add
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
})

export default doctorModel;

