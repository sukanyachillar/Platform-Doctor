
import { where } from 'sequelize';
import authenticationModel from '../../../../models/entityModel.js';
import profileModel from '../../../../models/doctorModel.js';
import deptModel from '../../../../models/departmentModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import {generateTokens} from '../../../../utils/token.js'


const register = async (userData, res) => {
  try {
    const { phone } = userData;
    const getUser = await authenticationModel.findOne({ where: { phone} });
    let tokens = await generateTokens(phone);
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
		      entity_type: addedUser.entity_type,
          access_token :tokens.accessToken,
          refresh_token:tokens.refreshToken,
	   }
	})
  } catch (error) {
    console.log(error)
  }
};

const addProfile = async(userData,res)=>{
  try{

    let {
      phone,entity_name,
      email,business_type,
      account_no,ifsc_code,
      bank_name,account_holder_name,
      doctor_name,qualification,
      consultation_time,consultation_charge
    } = userData;

    let getUser = await authenticationModel.findOne({where:{phone}});

    getUser.entity_name = entity_name;
    getUser.business_type_id = business_type =='individual'? 1 : 0 ;
    getUser.email = email;
    getUser.account_no = account_no;
    getUser.ifsc_code = ifsc_code;
    getUser.bank_name = bank_name;
    getUser.account_holder_name = account_holder_name ;

    let profile_completed = account_no ? 1:0 ;
    let entityData = await getUser.save();

    let entity_id = entityData.entity_id;
    let userProfile = await profileModel.findOne({where:{phone}});
    if(!userProfile){
      userProfile = new profileModel({
      doctor_name,qualification,
      consultation_charge,consultation_time,
      entity_id,profile_completed,phone});
    }else{
      userProfile.doctor_name =doctor_name;
      userProfile.phone = phone;
      userProfile.qualification = qualification;
      userProfile.consultation_charge = consultation_charge ;
      userProfile.consultation_time = consultation_time;
      userProfile.entity_id = entity_id ;
      userProfile.profile_completed = profile_completed ;
    }
    let profile = await userProfile.save();
    return handleResponse({
      res,
      statusCode:200,
      message:"Profile created succesfully",
      data:{
          entity_id: entityData.entity_id,
          phone: entityData.phone,
          profile_completed: entityData.profile_completed,
          status: entityData.status,
		      entity_type: entityData.entity_type,
          profile
      }
    })

  }catch(error){
    console.log({error})
  }
}

const getProfile = async({ phone }, res)=>{
  try{
    let getUser = await authenticationModel.findOne({ where:{ phone } });
    let userProfile = await profileModel.findOne({ where:{ entity_id: getUser.entity_id } });
    return handleResponse({
      res,
      statusCode:200,
      message:"Profile fetched succesfully",
      data:{
          entity_id: getUser.entity_id,
          phone: getUser.phone,
          doctor_name: userProfile.doctor_name,
          qualification: userProfile.qualification,
          consultation_time: userProfile.consultation_time,
          consultation_charge: userProfile.consultation_charge
      }
    })

  } catch(error) {
    console.log({error})
  }
}

const addDept = async(deptData,userData,res)=>{
  try{
    let {department_name} = deptData ;
    let {entity_id} = userData;
    let status = 1 ;
    let dept ,message;
    dept  = await deptModel.findOne({where:{entity_id,department_name}})
    message = 'Department already exist.'
    if(!dept){  
      let newDept = new deptModel({entity_id,department_name,status}) ;
      dept = await newDept.save();
      message = 'Department added'
    }
    return handleResponse({ 
      res, 
      statusCode: "200", 
      message, 
      data: {
        department_id:dept.department_id,
        entity_id: dept.entity_id,
        status: dept.status,
        department_name: dept.department_name
      }
    })
  }catch(error){
    console.log({error})
  }
};

export default { register, addProfile, addDept, getProfile};
