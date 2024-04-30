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

};

export default doctorEntityModel;
