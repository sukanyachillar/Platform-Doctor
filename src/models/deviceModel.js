import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'

const deviceModel = sequelize.define('device', {
    deviceId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    deviceToken: {
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
})

export default deviceModel;
