import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';


const doctorEntityModel = sequelize.define('doctorEntity', {
    doctorEntityId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    consultationTime: {
        type: DataTypes.INTEGER, // 20mins
        allowNull: true,
        unique: false,
    },
    consultationCharge: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    status: {
        type: DataTypes.INTEGER, // 1: active, 0: inactive
        allowNull: true,
        unique: false,
        defaultValue: 1,
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

doctorEntityModel.associate = function(models) {
    doctorEntityModel.belongsTo(models.doctorModel, { foreignKey: 'doctorId' });
    doctorEntityModel.belongsTo(models.entityModel, { foreignKey: 'entityId' });
};

export default doctorEntityModel;
