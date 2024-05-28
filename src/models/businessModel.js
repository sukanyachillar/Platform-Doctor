import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';


const businessModel = sequelize.define('business', {
    businessId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    businessName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    categoryKey: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gstPercentage: { 
        type: DataTypes.FLOAT,
        allowNull: true,
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

export default businessModel;
