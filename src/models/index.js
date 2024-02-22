// index.js

import userModel from './userModel.js';
import doctorModel from './doctorModel.js';
import bookingModel from './bookingModel.js';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js';
import paymentModel './paymentModel.js';

// Define Associations
bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
bookingModel.belongsTo(doctorModel, { foreignKey: 'entityId', as: 'doctor' });
bookingModel.hasOne(paymentModel, { foreignKey: 'bookingId' });

// Add more associations as needed

// Export the models
export {
    userModel,
    doctorModel,
    bookingModel,
    weeklyTimeSlotsModel,
    paymentModel,
  };
