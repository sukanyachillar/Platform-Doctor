import authenticationModel from '../../../../models/entityModel.js'
import profileModel from '../../../../models/doctorModel.js'
import deptModel from '../../../../models/departmentModel.js'
import { handleResponse } from '../../../../utils/handlers.js'
import { generateTokens, generateAdminTokens } from '../../../../utils/token.js'
import { Op } from 'sequelize'
// import upload from '../../../../middlewares/multerConfig.js';
import awsUtils from '../../../../utils/aws.js';
import DigitalOceanUtils from '../../../../utils/DOFileUpload.js';
import entityModel from '../../../../models/entityModel.js';
import departmentModel from '../../../../models/departmentModel.js';
import workScheduleModel from '../../../../models/workScheduleModel.js';
import { generateUuid } from '../../../../utils/generateUuid.js';
import doctorEntityModel from '../../../../models/doctorEntityModel.js';
import userModel from '../../../../models/userModel.js'
import doctorModel from '../../../../models/doctorModel.js'
import tokenModel from '../../../../models/tokenModel.js'
import { hashPassword, comparePasswords } from '../../../../utils/password.js';
import { decrypt } from '../../../../utils/token.js';


const register = async (userData, res) => {
    try {
        let { phone, token } = userData;
        let doctorExists;
        const getUser = await authenticationModel.findOne({ where: { phone } });
        if(!getUser) {
            doctorExists =  await profileModel.findOne({ where: { doctor_phone: phone } });
            if (doctorExists) {
               phone = doctorExists.doctor_phone;
            };
        }
        let tokens = await generateTokens(phone);
        let userId, newToken;
    
        const entityDetails = await getEntityDetails(phone);
        console.log("entityDetails", entityDetails)
        if (getUser) {
            userId = getUser.entity_id
            newToken = await new tokenModel({
                userId,
                token,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await newToken.save();
            return handleResponse({
                res,
                statusCode: '200',
                message: 'User already exists',
                data: {
                    entity_id: getUser.entity_id,
                    phone: getUser.phone,
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                    profile_completed: getUser.profile_completed,
                    status: getUser.status,
                    entity_type: getUser.entity_type ?  getUser.entity_type : '',
                    entityDetails: entityDetails,
                },
            })
        };
        if (doctorExists) {
            const existingDoctorEntity = await doctorEntityModel.findOne({
                where: { 
                    doctorId: doctorExists.doctor_id,
                }
            });
            if(existingDoctorEntity) {
                userId = existingDoctorEntity.entityId;

            } else{
                userId = doctorExists.entity_id
            };

            const getEntity = await authenticationModel.findOne({ where: { entity_id: userId } });

            newToken = await new tokenModel({
                userId,
                token,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await newToken.save();
            return handleResponse({
                res,
                statusCode: '200',
                message: 'Succusfully loggedIn',
                data: {
                    entity_id: userId, // doctorExists.entity_id,
                    phone: doctorExists.doctor_phone,
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                    profile_completed: 1, // getUser.profile_completed,
                    status: getEntity.status,
                    entity_type: getEntity.entity_type ?  getEntity.entity_type : '',
                    entityDetails: entityDetails,

                },
            })
        };
        const newUser = new authenticationModel(userData)
        const addedUser = await newUser.save();
        newToken = await new tokenModel({
            userId: addedUser.entity_id,
            token,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        await newToken.save();
        return handleResponse({
            res,
            statusCode: '200',
            message: 'User added',
            data: {
                entity_id: addedUser.entity_id,
                phone: addedUser.phone,
                profile_completed: addedUser.profile_completed,
                status: addedUser.status,
                entity_type: addedUser.entity_type ? addedUser.entity_type : '',
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
            },
        });
    } catch (error) {
        console.log({ 'Error while registeration': error })
        return handleResponse({
            res,
            message: 'Sorry error while registering.',
            statusCode: 422,
        })
    }
};

const getEntityDetails = async (doctorPhone) => {
    try {
        const doctor = await doctorModel.findOne({ where: { doctor_phone: doctorPhone } });

        const entities = await doctorEntityModel.findAll({ 
            where: { doctorId: doctor.doctor_id }, 
            include: [{ 
                model: entityModel,
                attributes: [
                              'entity_id', 
                              'entity_name', 
                              'entity_type',
                              'phone',
                            ],
            }],
        });

        const entityDetails = entities.map(entity => ({
            entityId: entity.entity.entity_id,
            entityName: entity.entity.entity_name,
            phone: entity.entity.phone,
            entityType: entity.entity.entity_type,
           
        }));

        return entityDetails;
    } catch (error) {
        console.error(error);
        return null; // Return null in case of any error
    }
};




const addProfile = async (userData, user, image, res) => {
    // Individual doctor add
    try {
        let {
            entity_name,
            entity_type,  // clinic/saloon id
            email,
            business_type,  //individual or
            account_no,
            ifsc_code,
            bank_name,
            UPI_ID,
            account_holder_name,
            doctor_name,
            qualification,
            consultation_time,
            consultation_charge,
            department_id,
            description,
            doctor_phone,
        } = userData

        let getUser = await authenticationModel.findOne({
            where: { phone: user.phone },
        });

        // let imageUrl = await awsUtils.uploadToS3(image);
        let imageUrl = await DigitalOceanUtils.uploadObject (image); 
        getUser.entity_name = entity_name;
        // getUser.business_type_id = business_type == 'individual' ? 1 : 0
        getUser.business_type_id = 0;  // 0 for individual entity. 
        getUser.email = email;
        getUser.account_no = account_no;
        getUser.ifsc_code = ifsc_code;
        getUser.bank_name = bank_name;
        getUser.UPI_ID = UPI_ID;
        getUser.account_holder_name = account_holder_name;
        // getUser.entity_type = entity_type
        getUser.entity_type = 2; // 2 for individual 1 for clinic
        let profile_completed = 0
        let entityData = await getUser.save();

        let entity_id = entityData.entity_id;
        let userProfile = await profileModel.findOne({
            where: { doctor_phone },
        });
        const getDepartment = await departmentModel.findOne({
            where: { department_id },
        });

        if (!userProfile) {
            userProfile = new profileModel({
                doctor_name,
                qualification,
                consultation_charge,
                consultation_time,
                entity_id,
                profile_completed,
                doctor_phone,
                department_id,
                description,
                // profileImageUrl: imageUrl.Key ? imageUrl.Key : "",
                profileImageUrl: imageUrl? imageUrl: "",
            })
        } else {
            userProfile.doctor_name = doctor_name;
            // userProfile.doctor_phone = doctor_phone
            userProfile.qualification = qualification
                ? qualification.trim()
                : ''
            userProfile.consultation_charge = consultation_charge
            userProfile.consultation_time = consultation_time
            userProfile.entity_id = entity_id
            userProfile.profile_completed = profile_completed
            userProfile.department_id = department_id
            userProfile.description = description ? description.trim() : ''
            //  userProfile.profileImageUrl = imageUrl.Key ? imageUrl.Key : "";
             userProfile.profileImageUrl = imageUrl ? imageUrl : "";

        }
        let profile = await userProfile.save();
        const randomUUID = await generateUuid();

        let alreadyUser = await userModel.findOne({
            where: { phone: doctor_phone },
        })
        let data = await new userModel({
            uuid: randomUUID,
            userType: 2,
            name: doctor_name,
            phone: doctor_phone,
        })
        if(!alreadyUser) await data.save();
        
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Profile created succesfully',
            data: {
                entity_id: entityData.entity_id,
                phone: entityData.phone,
                profile_completed: entityData.profile_completed,
                status: entityData.status,
                entity_type: entityData.entity_type,
                designation: getDepartment.department_name,
                profile,
            },
        })
    } catch (error) {
        console.log({ 'Error while registeration': error })
        return handleResponse({
            res,
            message: 'Sorry error while adding profile.',
            statusCode: 422,
        })
    }
};

const getProfile = async (req, res) => {
    try {
        const phone = req.user.phone
        let getUser = await authenticationModel.findOne({ where: { phone } });
        let entityId, userProfile


        if(getUser){
            userProfile = await profileModel.findOne({  //doctorModel
               where: { entity_id: getUser.entity_id },
            });
            console.log("userProfile  1", userProfile)
            entityId = getUser.entity_id;
       } else {
           userProfile = await profileModel.findOne({  //doctorModel
               where: { doctor_phone: phone },
           });
           console.log("userProfile2", userProfile)
           entityId = userProfile.entity_id;
       }

       console.log("entityId>>>>>>>>>>>",entityId)

        // let userProfile = await profileModel.findOne({
        //     where: { entity_id: getUser.entity_id },
        // })
        let statusCode, message, getDepartment
        if (!userProfile) { 
            ;(message =
                'Sorry! Unable to fetch user profile associated with this phone.'),
                (statusCode = 404)
        }
        let availableSlots = await workScheduleModel.findAll({
            where: { entity_id: entityId, status: 1 },
            attributes: ['Day'],
        });
        if (!availableSlots) {
            ;(message =
                'Sorry! Unable to fetch available slots associated with this phone.'),
                (statusCode = 404)
        }
        let uniqueDays = []
        let seenDays = new Set()
        if (availableSlots) {
            availableSlots.forEach((slot) => {
                if (
                    slot &&
                    slot.dataValues &&
                    slot.dataValues.Day &&
                    !seenDays.has(slot.dataValues.Day)
                ) {
                    uniqueDays.push(slot.dataValues.Day)
                    seenDays.add(slot.dataValues.Day)
                }
            })
            message = 'Profile fetched succesfully'
            statusCode = 200
            getDepartment = await departmentModel.findOne({
                where: { department_id: userProfile.department_id },
            })
        }
         let key = userProfile?.profileImageUrl;
        //  const url = await DigitalOceanUtils.getPresignedUrl(key);

        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                entity_id: entityId, //getUser?.entity_id,
                phone: phone, //getUser?.phone,
                doctor_name: userProfile?.doctor_name,
                qualification: userProfile?.qualification,
                consultation_time: userProfile?.consultation_time,
                consultation_charge: userProfile?.consultation_charge,
                doctor_id: userProfile?.doctor_id,
                profileImageUrl: key,
                description: userProfile?.description,
                // uniqueDays, 
                designation: getDepartment?.department_name,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching profile',
            statusCode: 422,
        })
    }
}

const getProfileForCustomer = async ({ phone, encryptedPhone }, res) => {
// const getProfileForCustomer = async ({ encryptedPhone }, res) => {

    try {
        let decryptedPhone
        let userProfile 
        let phoneNo
        if(encryptedPhone) {
            decryptedPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);
            phoneNo = decryptedPhone;
        } else {
            phoneNo = phone
        }
        console.log("phoneNo>>>>>", phoneNo);
        let getUser = await authenticationModel.findOne({ where: { phone: phoneNo } }); //entityModel
        if(getUser){
            console.log("inside getUser")
             userProfile = await profileModel.findOne({  //doctorModel
                where: { entity_id: getUser.entity_id },
            });
            console.log("userProfile>>>>>>>>.", userProfile)
        } else {
            userProfile = await profileModel.findOne({  //doctorModel
                where: { doctor_phone: phoneNo },
            });
            console.log("userProfile>>>>2", userProfile)
        }
        console.log("userProfile outside", userProfile )
        let statusCode, message, getDepartment
        if (!userProfile) {
            ;(message =
                'Sorry! Unable to fetch user profile associated with this phone.'),
                (statusCode = 404)
        }
        let availableSlots = await workScheduleModel.findAll({
            where: { entity_id: userProfile.entity_id, status: 1 },
            attributes: ['Day'],
        })
        if (!availableSlots) {
            ;(message =
                'Sorry! Unable to fetch available slots associated with this phone.'),
                (statusCode = 404)
        }
        let uniqueDays = []
        let seenDays = new Set()
        if (availableSlots) {
            availableSlots.forEach((slot) => {
                if (
                    slot &&
                    slot.dataValues &&
                    slot.dataValues.Day &&
                    !seenDays.has(slot.dataValues.Day)
                ) {
                    uniqueDays.push(slot.dataValues.Day)
                    seenDays.add(slot.dataValues.Day)
                }
            })
            message = 'Profile fetched succesfully'
            statusCode = 200
            getDepartment = await departmentModel.findOne({
                where: { department_id: userProfile.department_id },
            })
        }
         let key = userProfile?.profileImageUrl
        //  const url = await DigitalOceanUtils.getPresignedUrl(key);

        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                entity_id: getUser? getUser.entity_id: userProfile.entity_id,
                phone: getUser?.phone,
                doctor_name: userProfile?.doctor_name,
                qualification: userProfile?.qualification,
                consultation_time: userProfile?.consultation_time,
                consultation_charge: userProfile?.consultation_charge,
                doctor_id: userProfile?.doctor_id,
                profileImageUrl: key,
                description: userProfile?.description,
                uniqueDays,
                designation: getDepartment?.department_name,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching profile',
            statusCode: 422,
        })
    }
}

const getGeneralSettings = async (req, res) => {
    try {
        const phone = req.user.phone;
        let entityId, doctorEntity ;
        let getEntity = await authenticationModel.findOne({ where: { phone } }) // entitymodel single enity
        if (!getEntity) {
            const isDoctorUnderTheClinic = await doctorModel.findOne({ where: { doctor_phone: phone } });
            if (isDoctorUnderTheClinic) {
                const getDoctorEntity = await doctorEntityModel.findOne({ where: { doctorId: isDoctorUnderTheClinic.doctor_id } });
                entityId = getDoctorEntity.entityId;
                doctorEntity = await authenticationModel.findOne({ where: { entity_id: entityId } });
            }
        } else {
            entityId = getEntity.entity_id;
        }
        if(!entityId) {
            return handleResponse({
                res,
                message: 'Something went wrong with entity',
                statusCode: 422,
            })
        }
        let doctorProfile = await profileModel.findOne({
            where: { doctor_phone: phone },
        });
        
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Fetched general settings ',
            data: {
                doctor_id: doctorProfile.doctor_id,
                phone: doctorProfile.phone,
                bookingLinkStatus: doctorProfile.status,
                consultationDuration: doctorProfile.consultation_time,
                addStaff: getEntity? getEntity.add_staff: doctorEntity? doctorEntity.add_staff: "",
                addService: getEntity? getEntity.add_service: doctorEntity? doctorEntity.add_service: "",
                entityStatus: getEntity? getEntity.status: doctorEntity? doctorEntity.status: "",
                profile_completed: getEntity? getEntity.profile_completed: doctorEntity? doctorEntity.profile_completed: "",
            },
        });
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching.',
            statusCode: 422,
        });
    }
}

const getBankDetails = async (userData, res) => {
    try {
        console.log("userData", userData)
        let { entity_id } = userData
        let message, statusCode
        let bankdata = await entityModel.findOne({
            where: { entity_id },
            attributes: [
                'account_no',
                'ifsc_code',
                'bank_name',
                'account_holder_name',
                'UPI_ID',
            ],
        });
        if (!handleResponse) {
            statusCode = 422
            message = 'Sorry unable to fetch.'
        } else {
            ;(statusCode = 200), (message = 'Successfully fetched data')
        }
        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                bankdata,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Error while fetching bank details.',
        })
    }
}

const updateEntityStatus = async (userData, res) => {
    try {
        let { entity_id } = userData
        let authData = await authenticationModel.findOne({
            where: { entity_id },
            attributes: ['status'],
        })

        let data = await authenticationModel.update(
            {
                status: !authData.status,
            },
            {
                where: {
                    entity_id,
                },
            }
        )
        return handleResponse({
            res,
            message: 'Successfully updated status.',
            statusCode: 200,
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while updating the status.',
            statusCode: 422,
        })
    }
}
const updateProfileDetails = async (doctorProfile, params, res) => {
    try {
        let { id } = params
        console.log({ doctorProfile, id })
        let updatedProfile = await doctorModel.update(
            { ...doctorProfile },
            { where: { doctor_id: id } }
        )
        let doctorData = await doctorModel.findOne({
            where: { doctor_id: id },
            attributes: ['entity_id'],
        })
        let updatedEntity = await entityModel.update(
            {
                ...doctorProfile,
            },
            { where: { entity_id: doctorData.entity_id } }
        )
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Sucessfully updated the doctor profile.',
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Sorry! Try after sometime.',
            statusCode: 404,
        })
    }
};



export default {
    register,
    addProfile,
    getProfile,
    getGeneralSettings,
    getBankDetails,
    getProfileForCustomer,
    updateEntityStatus,
    updateProfileDetails,
}
