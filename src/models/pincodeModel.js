import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';

const pincodeModel = sequelize.define('pincode', {
    pincodeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    districtId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pincodeValue: {
        type: DataTypes.STRING,
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
});

export default pincodeModel;
