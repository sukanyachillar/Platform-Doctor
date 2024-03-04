import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';

const pincodeModel = sequelize.define('pincode', {
    pincodeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
})

export default pincodeModel;
