import userModel from './userModel';
import doctorModel from './doctorModel';
import bookingModel from './bookingModel';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel';
import paymentModel from './paymentModel';

// Define Associations
bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
bookingModel.belongsTo(doctorModel, { foreignKey: 'entityId', as: 'doctor' });
bookingModel.hasOne(paymentModel, { foreignKey: 'bookingId' });

// Add more associations as needed

// Export the models
module.exports = {
  userModel,
  doctorModel,
  bookingModel,
  weeklyTimeSlotsModel,
  paymentModel,
};