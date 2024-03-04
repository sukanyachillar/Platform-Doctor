import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';

const stateModel = sequelize.define('state', {
    stateId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    stateName: {
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

export default stateModel;
