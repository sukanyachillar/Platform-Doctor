import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js'
import doctorModel from './doctorModel.js'

const departmentModel = sequelize.define('department', {
    department_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    department_name: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
    },

    status: {
        type: DataTypes.INTEGER, // 1: active, 0: inactive
        allowNull: true,
        unique: false,
    },
    created_date_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },

    update_date_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false,
    },
});

departmentModel.associate = function(models) {
    departmentModel.hasMany(models.doctorModel, { foreignKey: 'department_id' }); // Assuming each department can have multiple doctors
};

export default departmentModel;
