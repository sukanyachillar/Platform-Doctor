import { DataTypes } from 'sequelize';
import sequelize from '../dbConnect.js';

const paymentSplitModel = sequelize.define('paymentSplit', {
    splitId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    paymentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    doctorFee: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    appServiceCharge: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    totalAmount: {
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
});

export default paymentSplitModel;
