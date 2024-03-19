import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
import doctorModel from './doctorModel.js';

const entityModel = sequelize.define('entity', {
    entity_id: {
        type: DataTypes.INTEGER, 
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    entity_type: {  //refering business model // actually businessId // clinic/saloon
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    entity_name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    location: {
        type: DataTypes.JSON,
        allowNull: true, 
        defaultValue: {},
        unique: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true,
        },
    },
    business_type_id: { // event_type
        type: DataTypes.INTEGER, // individual = 0, group =1
        allowNull: true,
        unique: false,
    },

    account_no: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    ifsc_code: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    bank_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },

    account_holder_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    UPI_ID: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
    },

    profile_completed: {
        type: DataTypes.INTEGER, //1: completed
        allowNull: true,
        defaultValue: 0,
    },
    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
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


export default entityModel
