
import { DataTypes } from 'sequelize' ;
import sequelize from '../dbConnect.js';

const workScheduleModel = sequelize.define('workSchedule', {
  work_schedule_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  day: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  entity_id: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true,
    unique: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
    unique: false,
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: false,
  },
  session:{
    

  },
  status: {
    type: DataTypes.INTEGER, 
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

export default workScheduleModel;

