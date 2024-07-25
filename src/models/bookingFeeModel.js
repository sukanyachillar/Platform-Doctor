import { DataTypes } from "sequelize";
import sequelize from "../dbConnect.js";


const bookingFeeModel = sequelize.define("bookingfee", {
    bookingFeeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    fee: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: false,
    },
    status: {
        type: DataTypes.INTEGER,
        allowNull: false,
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


export default bookingFeeModel;
