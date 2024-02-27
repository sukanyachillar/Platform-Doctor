import userModel from './userModel.js';
import doctorProfileModel from './doctorModel.js';
import bookingModel from './bookingModel.js';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js';
import paymentModel from './paymentModel.js';

// Define Associations
bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
bookingModel.belongsTo(doctorProfileModel, { foreignKey: 'entityId', as: 'doctor' });
bookingModel.hasOne(paymentModel, { foreignKey: 'bookingId' });

// Add more associations as needed

// Export the models
export default {
  userModel,
  doctorProfileModel,
  bookingModel,
  weeklyTimeSlotsModel,
  paymentModel,
};