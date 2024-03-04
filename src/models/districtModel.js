import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';

const districtModel = sequelize.define('district', {
    districtId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
    districtName: {
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

export default districtModel;
