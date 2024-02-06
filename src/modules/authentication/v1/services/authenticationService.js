
import authenticationModel from '../../../../models/entityModel.js';
import { handleResponse } from '../../../../utils/handlers.js'
// import bcrypt from 'bcrypt';
// import jwt from 'jsonwebtoken';
// import currentConfig from '../../config.js'

const register = async (userData, res) => {
  try {
    const { phone } = userData;
    const getUser = await authenticationModel.findOne({ where: { phone} });

    if (getUser) {
         return handleResponse({ 
            res, 
            statusCode: "200", 
            message: "User already exists",
			data: {
				entity_id: getUser.entity_id,
				phone: getUser.phone,
				profile_completed: getUser.profile_completed,
				status: getUser.status,
				entity_type: getUser.entity_type
			   }
		})
    }
    const newUser = new authenticationModel(userData);
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
		entity_type: addedUser.entity_type
	   }
	})
  } catch (error) {
    console.log(error)
  }
};

export default { register };