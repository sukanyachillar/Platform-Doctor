import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';


const entityAddressModel = sequelize.define('entityAddress', {
    entityAddressId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    streetName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cityName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    districtId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pincodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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

export default entityAddressModel;
