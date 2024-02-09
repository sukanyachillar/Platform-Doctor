
import authenticationModel from '../../../../models/entityModel.js';
import profileModel from '../../../../models/doctorModel.js';
import deptModel from '../../../../models/departmentModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import { generateTokens } from '../../../../utils/token.js';
// import upload from '../../../../middlewares/multerConfig.js';
import awsUtils from '../../../../utils/aws.js';
import entityModel from '../../../../models/entityModel.js';
import departmentModel from '../../../../models/departmentModel.js';
import workScheduleModel from '../../../../models/workScheduleModel.js';

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

const addProfile = async(userData, image, res)=>{
  try{
    let {
      phone,
      entity_name,
      email, 
      business_type,
      account_no,
      ifsc_code,
      bank_name,
      account_holder_name,
      doctor_name, 
      qualification,
      consultation_time, 
      consultation_charge,
      department_id, 
      description,
    } = userData;
   
    let getUser = await authenticationModel.findOne({ where:{ phone } });
    
    let imageUrl = await awsUtils.uploadToS3(image);
    console.log('imageUrl', imageUrl.Location)    
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
    let userProfile = await profileModel.findOne({ where: { phone }});
    const getDepartment = await departmentModel.findOne({ where:{ department_id } });

    if(!userProfile) {
      userProfile = new profileModel({
        doctor_name,
        qualification,
        consultation_charge,
        consultation_time,
        entity_id, 
        profile_completed, 
        phone,
        department_id, 
        description,
        profileImageUrl: imageUrl.Location ? imageUrl.Location: ""
    });
    } else {
      userProfile.doctor_name =doctor_name;
      userProfile.phone = phone;
      userProfile.qualification = qualification? qualification.trim(): '';
      userProfile.consultation_charge = consultation_charge ;
      userProfile.consultation_time = consultation_time;
      userProfile.entity_id = entity_id ;
      userProfile.profile_completed = profile_completed ;
      userProfile.department_id = department_id;
      userProfile.description = description ? description.trim() : '';
      userProfile.profileImageUrl = imageUrl.Location ? imageUrl.Location: "" ;
    }
    let profile = await userProfile.save();

    return handleResponse({
      res,
      statusCode:200,
      message:"Profile created succesfully",
      data: {
          entity_id: entityData.entity_id,
          phone: entityData.phone,
          profile_completed: entityData.profile_completed,
          status: entityData.status,
		      entity_type: entityData.entity_type,
          designation: getDepartment.department_name,
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
    console.log('userProfile', userProfile)
    let availableSlots = await workScheduleModel.findAll({where:{entity_id:getUser.entity_id,status:1},attributes:['Day']})
   console.log(availableSlots)
 
    let uniqueDays = [];
    let seenDays = new Set();

    availableSlots.forEach(slot => {
        if (slot && slot.dataValues && slot.dataValues.Day && !seenDays.has(slot.dataValues.Day)) {
            uniqueDays.push(slot.dataValues.Day);
            seenDays.add(slot.dataValues.Day);
        }
    });


    

    const getDepartment = await departmentModel.findOne({ where:{ department_id: userProfile.department_id } });
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
          consultation_charge: userProfile.consultation_charge,
          doctor_id :userProfile.doctor_id,
          profileImageUrl: userProfile.profileImageUrl,
          description: userProfile.description,
          uniqueDays,
         
          designation: getDepartment.department_name,
      }
    })

  } catch(error) {
    console.log({error})
  }
}

const getGeneralSettings = async(req, res)=>{
  try{
    console.log('inside getGeneralSettings', req)
    const phone = req.user.phone
    console.log("phone===>", phone)
    let getEntity = await authenticationModel.findOne({ where:{ phone } }); // entitymodel
    let doctorProfile = await profileModel.findOne({ where: { entity_id: getEntity.entity_id } });
    console.log('doctorProfile', doctorProfile)
    return handleResponse({
      res,
      statusCode:200,
      message:"General settings succesfully fetched",
      data: {
          doctor_id : doctorProfile.doctor_id,
          phone: doctorProfile.phone,
          bookingLinkStatus: doctorProfile.status,
          consultationDuration: doctorProfile.consultation_time,
          addStaff: getEntity.add_staff,
          addService: getEntity.add_service,
       
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

const getBankDetails = async(userData ,res)=>{
  try{
    let {entity_id} = userData;
    let bankdata = await entityModel.findOne({where:{entity_id},attributes:['account_no','ifsc_code','bank_name','account_holder_name']})
    if(!handleResponse){
      return handleResponse({
        res,
        statusCode:404,
        message:"Sorry unable to fetch."

      })
    }else{
      return handleResponse({
        res,
        statusCode:200,
        message:"Successfully fetched data",
        data:{
          bankdata
        }
      })
    }
  }catch(error){
    console.log({error})
  }
}

export default { register, addProfile, addDept, getProfile, getGeneralSettings, getBankDetails};
