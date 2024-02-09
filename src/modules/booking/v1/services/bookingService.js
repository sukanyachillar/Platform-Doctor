
import authenticationModel from '../../../../models/entityModel.js';
import profileModel from '../../../../models/doctorModel.js';
import deptModel from '../../../../models/departmentModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import { generateTokens } from '../../../../utils/token.js';

const bookAppointment = async (customerData, res) => {
  try {

     const {
         appointmentDate,
         timeSlot,
         patientName,
         contactNumber,
         amount,
         paymentMethod,
  } = customerData;

    const existingTimeslot = await Timeslot.findOne({ timeSlot });
  if (!existingTimeslot) {
    return res.status(400).json({ error: 'Invalid timeslot' });
  }

    const newUser = new authenticationModel(userData);
    if (getUser) {
         return handleResponse({ 
            res, 
            statusCode: "200", 
            message: "User already exists",
			data: {
				entity_id: getUser.entity_id,
				phone: getUser.phone,
        access_token :tokens.accessToken,
        refresh_token:tokens.refreshToken,
				profile_completed: getUser.profile_completed,
				status: getUser.status,
				entity_type: getUser.entity_type
			   }
		})
    }
    
    const addedUser = await newUser.save();
    return handleResponse({ 
       res, 
       statusCode: "200", 
       message: "User added", 
       data: {
          entity_id: addedUser.entity_id,
          phone: addedUser.phone,
          profile_completed: addedUser.profile_completed,
          status: addedUser.status,
		      entity_type: addedUser.entity_type,
          access_token : tokens.accessToken,
          refresh_token: tokens.refreshToken,
	   }
	})
  } catch (error) {
    console.log(error)
  }
};

export default { bookAppointment };
