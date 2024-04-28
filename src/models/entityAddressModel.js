import { DataTypes } from 'sequelize'
import sequelize from '../dbConnect.js';
import stateModel from './stateModel.js';
import districtModel from './districtModel.js';
import pincodeModel from './pincodeModel.js';

const entityAddressModel = sequelize.define('entityAddress', {
    entityAddressId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    streetName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cityName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    stateId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    districtId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    pincode: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    // pincodeId: {
    //     type: DataTypes.INTEGER,
    //     allowNull: true,
    // },
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

entityAddressModel.belongsTo(stateModel, { foreignKey: 'stateId' });
entityAddressModel.belongsTo(districtModel, { foreignKey: 'districtId' });
// entityAddressModel.belongsTo(pincodeModel, { foreignKey: 'pincodeId' });

export default entityAddressModel;
