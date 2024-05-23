import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
import bookingModel from './bookingModel.js';

const userModel = sequelize.define('user', {
    userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    uuid: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    userType: {
        type: DataTypes.INTEGER, // 1. cutomer, 2. doctor
        allowNull: true,
        unique: false,
    },
    name: {
        type: DataTypes.STRING, 
        allowNull: true,
        unique: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
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
})
bookingModel.belongsTo(userModel, { foreignKey: 'customerId' }); // Define association with bookingModel


export default userModel;
