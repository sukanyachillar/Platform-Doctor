<<<<<<< HEAD
import userModel from './userModel.js';
import doctorProfileModel from './doctorModel.js';
=======
// index.js

import userModel from './userModel.js';
import doctorModel from './doctorModel.js';
>>>>>>> dce19f1faf5d3f793c5b7295112d023eb28c394c
import bookingModel from './bookingModel.js';
import weeklyTimeSlotsModel from './weeklyTimeSlotsModel.js';
import paymentModel from './paymentModel.js';

// Define Associations
bookingModel.belongsTo(userModel, { foreignKey: 'customerId', as: 'customer' });
<<<<<<< HEAD
bookingModel.belongsTo(doctorProfileModel, { foreignKey: 'entityId', as: 'doctor' });
=======
bookingModel.belongsTo(doctorModel, { foreignKey: 'entityId', as: 'doctor' });
>>>>>>> dce19f1faf5d3f793c5b7295112d023eb28c394c
bookingModel.hasOne(paymentModel, { foreignKey: 'bookingId' });

// Add more associations as needed

// Export the models
<<<<<<< HEAD
export default {
  userModel,
  doctorProfileModel,
  bookingModel,
  weeklyTimeSlotsModel,
  paymentModel,
};
=======
export {
    userModel,
    doctorModel,
    bookingModel,
    weeklyTimeSlotsModel,
    paymentModel,
  };
>>>>>>> dce19f1faf5d3f793c5b7295112d023eb28c394c
