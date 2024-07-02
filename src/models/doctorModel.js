import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';
import userModel from './userModel.js';
import doctorEntityModel from './doctorEntityModel.js';

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
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    doctor_phone: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    consultation_time: {
        type: DataTypes.INTEGER, // 20mins
        allowNull: true,
        unique: false,
    },
    tokens: {
        type: DataTypes.INTEGER, 
        allowNull: false,
        unique: false,
        defaultValue: 0,
    },
    consultation_charge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    bookingType: {
        type: DataTypes.STRING,
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
    razorpayId: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    gstNo: {
        type: DataTypes.STRING, 
        allowNull: true,
    },
    paymentMethod: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'Razorpay',
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

doctorModel.associate = function(models) {
    doctorModel.belongsTo(models.departmentModel, { foreignKey: 'department_id' }); // Assuming each doctor belongs to one department
    doctorModel.hasOne(models.doctorEntityModel, { foreignKey: 'doctorId' });
};

export default doctorModel;

