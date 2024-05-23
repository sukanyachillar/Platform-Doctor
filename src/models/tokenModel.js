import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'

const tokenModel = sequelize.define('token', {
    tokenId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.STRING, // entity id
        primaryKey: true,
        allowNull: false,
    },
    token: {
        type: DataTypes.STRING, 
        allowNull: true,
        unique: false,
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

export default tokenModel; //Model used to store FCM tokens of devices.