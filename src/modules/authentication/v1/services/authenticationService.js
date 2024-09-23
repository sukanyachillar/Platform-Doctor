import authenticationModel from "../../../../models/entityModel.js";
import profileModel from "../../../../models/doctorModel.js";
import businessModel from "../../../../models/businessModel.js";
import { handleResponse } from "../../../../utils/handlers.js";
import {
  generateTokens,
  generateAdminTokens,
} from "../../../../utils/token.js";
import { Op, where } from "sequelize";
// import upload from '../../../../middlewares/multerConfig.js';
import awsUtils from "../../../../utils/aws.js";
import DigitalOceanUtils from "../../../../utils/DOFileUpload.js";
import entityModel from "../../../../models/entityModel.js";
import departmentModel from "../../../../models/departmentModel.js";
import workScheduleModel from "../../../../models/workScheduleModel.js";
import { generateUuid } from "../../../../utils/generateUuid.js";
import doctorEntityModel from "../../../../models/doctorEntityModel.js";
import userModel from "../../../../models/userModel.js";
import doctorModel from "../../../../models/doctorModel.js";
import tokenModel from "../../../../models/tokenModel.js";
import { hashPassword, comparePasswords } from "../../../../utils/password.js";
import { decrypt } from "../../../../utils/token.js";
import guestUserModel from "../../../../models/guestUserModel.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";

const userCheck = async (body, res) => {
  try {
    let { phone } = body;
    let doctorExists;
    const getUser = await entityModel.findOne({ where: { phone } });
    if (!getUser) {
      doctorExists = await profileModel.findOne({
        where: { doctor_phone: phone },
      });
    } else {
      return handleResponse({
        res,
        statusCode: 200,
        message: "User exists",
        data: { phone },
      });
    }
    if (doctorExists) {
      return handleResponse({
        res,
        statusCode: 200,
        message: "User exists",
        data: { phone },
      });
    }

    if (!getUser || !doctorExists) {
      const existingGuestUser = await guestUserModel.findOne({
        where: { phone },
      });
      if (!existingGuestUser) {
        const newGuestUser = new guestUserModel({ phone });
        await newGuestUser.save();
      }
      return handleResponse({
        res,
        statusCode: 404,
        message:
          "Not a registered phone number.Please contact customer support !",
        data: { phone },
      });
    }
  } catch (error) {
    console.log({ "Error while userCheck": error });
    return handleResponse({
      res,
      message: "Internal error",
      statusCode: "500",
    });
  }
};
const register = async (userData, res) => {
  try {
    let { phone, token } = userData;
    let doctorExists;
    const getUser = await entityModel.findOne({ where: { phone } });
    if (!getUser) {
      doctorExists = await profileModel.findOne({
        where: { doctor_phone: phone },
      });
      if (doctorExists) {
        phone = doctorExists.doctor_phone;
      }
    }
    let tokens = await generateTokens(phone);
    let userId, newToken;

    const entityDetails = await getEntityDetailsOfTheDr(phone);
    if (getUser) {
      const doctorData = await doctorModel.findOne({
        where: { doctor_phone: phone },
        attributes: ["doctor_id"],
      });
      userId = getUser.entity_id;
      newToken = await new tokenModel({
        userId,
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newToken.save();
      return handleResponse({
        res,
        statusCode: "200",
        message: "User already exists",
        data: {
          entity_id: getUser.entity_id,
          phone: getUser.phone,
          doctor_id: doctorData.doctor_id,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          profile_completed: getUser.profile_completed,
          status: getUser.status,
          entity_type: getUser.entity_type ? getUser.entity_type : null,
          entityDetails: entityDetails,
        },
      });
    }
    if (doctorExists) {
      const existingDoctorEntity = await doctorEntityModel.findOne({
        where: {
          doctorId: doctorExists.doctor_id,
        },
      });
      if (existingDoctorEntity) {
        userId = existingDoctorEntity.entityId;
      } else {
        userId = doctorExists.entity_id;
      }

      const getEntity = await authenticationModel.findOne({
        where: { entity_id: userId },
      });

      newToken = await new tokenModel({
        userId,
        token,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await newToken.save();
      return handleResponse({
        res,
        statusCode: "200",
        message: "successfully loggedIn",
        data: {
          entity_id: userId, // doctorExists.entity_id,
          phone: doctorExists.doctor_phone,
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          profile_completed: 1, // getUser.profile_completed,
          status: getEntity.status,
          entity_type: getEntity.entity_type ? getEntity.entity_type : "",
          entityDetails: entityDetails,
        },
      });
    }
    if (!getUser || !doctorExists) {
      const existingGuestUser = await guestUserModel.findOne({
        where: { phone },
      });
      if (!existingGuestUser) {
        const newGuestUser = new guestUserModel(userData);
        await newGuestUser.save();
      }
      return handleResponse({
        res,
        statusCode: "200",
        message: "Admin will contact you soon !",
        data: { phone },
      });
    }
    // const newUser = new authenticationModel(userData);
    // const addedUser = await newUser.save();
    // newToken = await new tokenModel({
    //   userId: addedUser.entity_id,
    //   token,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });
    // await newToken.save();
    // return handleResponse({
    //   res,
    //   statusCode: "200",
    //   message: "User added",
    //   data: {
    //     entity_id: addedUser.entity_id,
    //     phone: addedUser.phone,
    //     profile_completed: addedUser.profile_completed,
    //     status: addedUser.status,
    //     entity_type: addedUser.entity_type ? addedUser.entity_type : "",
    //     access_token: tokens.accessToken,
    //     refresh_token: tokens.refreshToken,
    //   },
    // });
  } catch (error) {
    console.log({ "Error while registeration": error });
    return handleResponse({
      res,
      message: "Sorry error while registering.",
      statusCode: "422",
    });
  }
};

export const getEntityDetailsOfTheDr = async (doctorPhone, type = 0) => {
  try {
    const doctor = await doctorModel.findOne({
      where: { doctor_phone: doctorPhone },
    });

    const entities = doctor
      ? await doctorEntityModel.findAll({
          where: { doctorId: doctor.doctor_id },
          include: [
            {
              model: entityModel,
              attributes: ["entity_id", "entity_name", "entity_type", "phone"],
            },
          ],
        })
      : null;

    let entityDetails = entities?.map((entity) => ({
      entityId: entity.entity.entity_id,
      entityName: entity.entity.entity_name,
      phone: entity.entity.phone,
      entityType: entity.entity.entity_type,
    }));

    if (type === 1) {
      entityDetails = entities?.map((entity) => ({
        entityId: entity.entity.entity_id,
        entityName: entity.entity.entity_name,
        entityPhone: entity.entity.phone,
        entityType: entity.entity.entity_type,
        consultationCharge: entity.consultationCharge,
        consultationTime: entity.consultationTime,
      }));

      return entityDetails;
    }

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
      entity_type, // clinic/saloon id
      email,
      business_type, //individual or
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
    } = userData;

    let getUser = await authenticationModel.findOne({
      where: { phone: user.phone },
    });

    // let imageUrl = await awsUtils.uploadToS3(image);
    let imageUrl = await DigitalOceanUtils.uploadObject(image);
    getUser.entity_name = entity_name;
    // getUser.business_type_id = business_type == 'individual' ? 1 : 0
    getUser.business_type_id = 0; // 0 for individual entity.
    getUser.email = email;
    getUser.account_no = account_no;
    getUser.ifsc_code = ifsc_code;
    getUser.bank_name = bank_name;
    getUser.UPI_ID = UPI_ID;
    getUser.account_holder_name = account_holder_name;
    // getUser.entity_type = entity_type
    getUser.entity_type = 2; // 2 for individual 1 for clinic
    let profile_completed = 0;
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
        profileImageUrl: imageUrl ? imageUrl : "",
      });
    } else {
      userProfile.doctor_name = doctor_name;
      // userProfile.doctor_phone = doctor_phone
      userProfile.qualification = qualification ? qualification.trim() : "";
      userProfile.consultation_charge = consultation_charge;
      userProfile.consultation_time = consultation_time;
      userProfile.entity_id = entity_id;
      userProfile.profile_completed = profile_completed;
      userProfile.department_id = department_id;
      userProfile.description = description ? description.trim() : "";
      //  userProfile.profileImageUrl = imageUrl.Key ? imageUrl.Key : "";
      userProfile.profileImageUrl = imageUrl ? imageUrl : "";
    }
    let profile = await userProfile.save();
    const randomUUID = await generateUuid();

    let alreadyUser = await userModel.findOne({
      where: { phone: doctor_phone },
    });
    let data = await new userModel({
      uuid: randomUUID,
      userType: 2,
      name: doctor_name,
      phone: doctor_phone,
    });
    if (!alreadyUser) await data.save();

    return handleResponse({
      res,
      statusCode: 200,
      message: "Profile created successfully",
      data: {
        entity_id: entityData.entity_id,
        phone: entityData.phone,
        profile_completed: entityData.profile_completed,
        status: entityData.status,
        entity_type: entityData.entity_type,
        designation: getDepartment.department_name,
        profile,
      },
    });
  } catch (error) {
    console.log({ "Error while registeration": error });
    return handleResponse({
      res,
      message: "Sorry error while adding profile.",
      statusCode: 422,
    });
  }
};

// const getProfile = async (req, res) => {
//     try {
//         const phone = req.user.phone;
//         let getUser = await authenticationModel.findOne({ where: { phone } });
//         let entityId, userProfile;

//         if (getUser){
//             userProfile = await profileModel.findOne({  //doctorModel
//                where: { entity_id: getUser.entity_id },
//             });
//             entityId = getUser.entity_id;
//        } else {
//            userProfile = await profileModel.findOne({  //doctorModel
//                where: { doctor_phone: phone },
//            });
//            console.log("userProfile2", userProfile)
//            entityId = userProfile.entity_id;
//        }

//        console.log("entityId>>>>>>>>>>>",entityId)

//         // let userProfile = await profileModel.findOne({
//         //     where: { entity_id: getUser.entity_id },
//         // })
//         let statusCode, message, getDepartment
//         if (!userProfile) {
//             ;(message =
//                 'Sorry! Unable to fetch user profile associated with this phone.'),
//                 (statusCode = 404)
//         }
//         let availableSlots = await workScheduleModel.findAll({
//             where: { entity_id: entityId, status: 1 },
//             attributes: ['Day'],
//         });
//         if (!availableSlots) {
//             ;(message =
//                 'Sorry! Unable to fetch available slots associated with this phone.'),
//                 (statusCode = 404)
//         }
//         let uniqueDays = []
//         let seenDays = new Set()
//         if (availableSlots) {
//             availableSlots.forEach((slot) => {
//                 if (
//                     slot &&
//                     slot.dataValues &&
//                     slot.dataValues.Day &&
//                     !seenDays.has(slot.dataValues.Day)
//                 ) {
//                     uniqueDays.push(slot.dataValues.Day)
//                     seenDays.add(slot.dataValues.Day)
//                 }
//             })
//             message = 'Profile fetched successfully'
//             statusCode = 200
//             getDepartment = await departmentModel.findOne({
//                 where: { department_id: userProfile.department_id },
//             })
//         }
//          let key = userProfile?.profileImageUrl;
//         //  const url = await DigitalOceanUtils.getPresignedUrl(key);

//         return handleResponse({
//             res,
//             statusCode,
//             message,
//             data: {
//                 entity_id: entityId, //getUser?.entity_id,
//                 phone: phone, //getUser?.phone,
//                 doctor_name: userProfile?.doctor_name,
//                 qualification: userProfile?.qualification,
//                 consultation_time: userProfile?.consultation_time,
//                 consultation_charge: userProfile?.consultation_charge,
//                 doctor_id: userProfile?.doctor_id,
//                 profileImageUrl: key,
//                 description: userProfile?.description,
//                 // uniqueDays,
//                 designation: getDepartment?.department_name,
//             },
//         })
//     } catch (error) {
//         console.log({ error })
//         return handleResponse({
//             res,
//             message: 'Error while fetching profile',
//             statusCode: 422,
//         })
//     }
// }
const getProfile = async (req, res) => {
  // for APP
  try {
    const phone = req.user.phone;

    if (!phone) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "something went wrong with user",
        data: {},
      });
    }

    const isValidDr = await doctorModel.findOne({
      where: { doctor_phone: phone },
      attributes: ["doctor_id"],
    });

    if (!isValidDr) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Doctor Not found",
        data: {},
      });
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_phone: phone },
      attributes: [
        "doctor_id",
        "doctor_name",
        "department_id",
        "qualification",
        "doctor_phone",
        "status",
        "description",
        "profileImageUrl",
      ],
      include: [
        {
          model: departmentModel,
          attributes: ["department_name"],
        },
        {
          model: doctorEntityModel,
          attributes: ["consultationTime", "consultationCharge", "entityId"],
          include: [
            {
              model: entityModel,
              attributes: ["entity_name"],
            },
          ],
        },
      ],
    });

    const additionalInfo = await getEntityDetailsOfTheDr(phone, 1);

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor Profile fetched successfully.",
      data: {
        // getDoctor,
        phone: phone,
        doctor_name: getDoctor?.doctor_name,
        qualification: getDoctor?.qualification,
        doctor_id: getDoctor?.doctor_id,
        profileImageUrl: getDoctor?.profileImageUrl,
        description: getDoctor?.description,
        departmentName: getDoctor?.department.department_name,
        additionalInfo,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while fetching profile",
      statusCode: 422,
    });
  }
};

// const getProfileForCustomer = async ({ phone, encryptedPhone, entityId }, res) => {

//     try {
//         let decryptedPhone;
//         let userProfile;
//         let phoneNo;
//         if (encryptedPhone) {
//             decryptedPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);
//             phoneNo = decryptedPhone;
//         } else {
//             phoneNo = phone
//         };

//         let getUser = await authenticationModel.findOne({ where: { phone: phoneNo } }); //entityModel
//         if (getUser){
//             console.log("inside getUser")
//              userProfile = await profileModel.findOne({  //doctorModel
//                 where: { entity_id: getUser.entity_id },
//             });
//             console.log("userProfile>>>>>>>>.", userProfile)
//         } else {
//             userProfile = await profileModel.findOne({  //doctorModel
//                 where: { doctor_phone: phoneNo },
//             });
//             console.log("userProfile>>>>2", userProfile)
//         }
//         console.log("userProfile outside", userProfile )
//         let statusCode, message, getDepartment
//         if (!userProfile) {
//             ;(message =
//                 'Sorry! Unable to fetch user profile associated with this phone.'),
//                 (statusCode = 404)
//         }
//         let availableSlots = await workScheduleModel.findAll({
//             where: { entity_id: userProfile.entity_id, status: 1 },
//             attributes: ['Day'],
//         })
//         if (!availableSlots) {
//             ;(message =
//                 'Sorry! Unable to fetch available slots associated with this phone.'),
//                 (statusCode = 404)
//         }
//         let uniqueDays = []
//         let seenDays = new Set()
//         if (availableSlots) {
//             availableSlots.forEach((slot) => {
//                 if (
//                     slot &&
//                     slot.dataValues &&
//                     slot.dataValues.Day &&
//                     !seenDays.has(slot.dataValues.Day)
//                 ) {
//                     uniqueDays.push(slot.dataValues.Day)
//                     seenDays.add(slot.dataValues.Day)
//                 }
//             })
//             message = 'Profile fetched successfully'
//             statusCode = 200
//             getDepartment = await departmentModel.findOne({
//                 where: { department_id: userProfile.department_id },
//             })
//         }
//          let key = userProfile?.profileImageUrl
//         //  const url = await DigitalOceanUtils.getPresignedUrl(key);

//         return handleResponse({
//             res,
//             statusCode,
//             message,
//             data: {
//                 entity_id: getUser? getUser.entity_id: userProfile.entity_id,
//                 phone: getUser?.phone,
//                 doctor_name: userProfile?.doctor_name,
//                 qualification: userProfile?.qualification,
//                 consultation_time: userProfile?.consultation_time,
//                 consultation_charge: userProfile?.consultation_charge,
//                 doctor_id: userProfile?.doctor_id,
//                 profileImageUrl: key,
//                 description: userProfile?.description,
//                 uniqueDays,
//                 designation: getDepartment?.department_name,
//             },
//         })
//     } catch (error) {
//         console.log({ error })
//         return handleResponse({
//             res,
//             message: 'Error while fetching profile',
//             statusCode: 422,
//         })
//     }
// }

const getProfileForCustomer = async (
  { phone, encryptedPhone, entityId },
  res
) => {
  try {
    const isValidEntity = await entityModel.findOne({
      where: { entity_id: entityId },
      attributes: ["entity_id"],
    });
    console.log("isValidEntity=>", isValidEntity);

    if (!isValidEntity) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Invalid entity ID",
        data: {},
      });
    }

    let decryptedPhone;
    let phoneNo;
    if (encryptedPhone) {
      decryptedPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);
      phoneNo = decryptedPhone;
    } else {
      phoneNo = phone;
    }

    const isValidDr = await doctorModel.findOne({
      where: { doctor_phone: phoneNo },
      attributes: ["doctor_id"],
    });
    console.log("isValidDr=>", isValidDr);

    if (!isValidDr) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Doctor Not found",
        data: {},
      });
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_id: isValidDr.doctor_id },
      include: [
        {
          model: departmentModel,
          attributes: ["department_name"],
        },
        // {
        //   model: doctorEntityModel,
        //   attributes: ["consultationTime", "consultationCharge", "entityId"],
        //   where: { entityId, doctorId: isValidDr.doctor_id },
        //   // include: [
        //   //   {
        //   //     model: entityModel,
        //   //     attributes: ["entity_name"],
        //   //   },
        //   // ],
        // },
      ],
    });

    console.log("getDoctor=>", getDoctor);

    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Error while fetching doctor details",
        data: {},
      });
    }

    let availableSlots = await workScheduleModel.findAll({
      where: { entity_id: entityId, status: 1 },
      attributes: ["Day"],
    });

    if (!availableSlots) {
      (message = "Unable to fetch available slots associated with this phone."),
        (statusCode = 404);
    }
    let uniqueDays = [];
    let seenDays = new Set();
    if (availableSlots) {
      availableSlots.forEach((slot) => {
        if (
          slot &&
          slot.dataValues &&
          slot.dataValues.Day &&
          !seenDays.has(slot.dataValues.Day)
        ) {
          uniqueDays.push(slot.dataValues.Day);
          seenDays.add(slot.dataValues.Day);
        }
      });
    }

    const consultationCharge = getDoctor.doctorEntity
      ? getDoctor.doctorEntity.consultationCharge
      : 0;

    // const amountDetails = await calcAmountDetails(entityId, consultationCharge);

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor data fetched successfully.",
      data: {
        entity_id: entityId,
        phone: phoneNo,
        doctor_name: getDoctor.doctor_name,
        qualification: getDoctor.qualification,
        consultation_time: getDoctor.doctorEntity
          ? getDoctor.doctorEntity.consultationTime
          : null,
        consultation_charge: consultationCharge || null,
        doctor_id: getDoctor.doctor_id,
        profileImageUrl: getDoctor.profileImageUrl,
        description: getDoctor.description,
        uniqueDays,
        designation: getDoctor.department
          ? getDoctor.department.department_name
          : null,
        // amountDetails,
      },
    });
  } catch (error) {
    console.log("ProfileCustomerERROR=>", error);
    return handleResponse({
      res,
      message: "Error while fetching profile",
      statusCode: 422,
    });
  }
};

export const calcAmountDetails = async (entityId, consultationCharge) => {
  const getEntity = await entityModel.findOne({
    where: { entity_id: entityId },
    attributes: ["entity_id", "entity_type"],
  });
  const gstData = await businessModel.findOne({
    where: { businessId: getEntity.entity_type },
    attributes: ["gstPercentage"],
  });

  const appServiceCharge = parseFloat(process.env.APP_SERVICE_CHARGE) || 10;
  const gstPercentage = parseFloat(gstData.gstPercentage);

  const drFeeWithoutTax = parseFloat(consultationCharge);
  const gstAmount = (drFeeWithoutTax * gstPercentage) / 100;
  const drFeeWithTax = drFeeWithoutTax + gstAmount;
  const totalAmount = drFeeWithTax + appServiceCharge;

  const roundedDrFeeWithoutTax = parseFloat(drFeeWithoutTax.toFixed(2));
  const roundedGstAmount = parseFloat(gstAmount.toFixed(2));
  const roundedDrFeeWithTax = parseFloat(drFeeWithTax.toFixed(2));
  const roundedTotalAmount = parseFloat(totalAmount.toFixed(2));
  const roundedAppServiceCharge = parseFloat(appServiceCharge.toFixed(2));

  const response = {
    consultationChargeWithoutTax: roundedDrFeeWithoutTax.toFixed(2),
    gstPercentage: gstPercentage.toFixed(2),
    gstAmount: roundedGstAmount.toFixed(2),
    consultationChargeWithTax: roundedDrFeeWithTax.toFixed(2),
    appServiceCharge: roundedAppServiceCharge.toFixed(2),
    totalAmount: roundedTotalAmount.toFixed(2),
  };

  return response;
};

const getGeneralSettings = async (req, res) => {
  try {
    const phone = req.user.phone;
    let entityId, doctorEntity;
    let getEntity = await authenticationModel.findOne({ where: { phone } }); // entitymodel single enity
    if (!getEntity) {
      const isDoctorUnderTheClinic = await doctorModel.findOne({
        where: { doctor_phone: phone },
      });
      if (isDoctorUnderTheClinic) {
        const getDoctorEntity = await doctorEntityModel.findOne({
          where: { doctorId: isDoctorUnderTheClinic.doctor_id },
        });
        entityId = getDoctorEntity.entityId;
        doctorEntity = await authenticationModel.findOne({
          where: { entity_id: entityId },
        });
      }
    } else {
      entityId = getEntity.entity_id;
    }
    if (!entityId) {
      return handleResponse({
        res,
        message: "Something went wrong with entity",
        statusCode: 422,
      });
    }
    let doctorProfile = await profileModel.findOne({
      where: { doctor_phone: phone },
    });
    const getEntities = await getEntityDetailsOfTheDr(
      doctorProfile.doctor_phone
    );

    return handleResponse({
      res,
      statusCode: 200,
      message: "Fetched general settings ",
      data: {
        doctor_id: doctorProfile.doctor_id,
        phone: doctorProfile.phone,
        bookingLinkStatus: doctorProfile.status,
        consultationDuration: doctorProfile.consultation_time,
        addStaff: getEntity
          ? getEntity.add_staff
          : doctorEntity
          ? doctorEntity.add_staff
          : "",
        addService: getEntity
          ? getEntity.add_service
          : doctorEntity
          ? doctorEntity.add_service
          : "",
        entityStatus: getEntity
          ? getEntity.status
          : doctorEntity
          ? doctorEntity.status
          : "",
        profile_completed: getEntity
          ? getEntity.profile_completed
          : doctorEntity
          ? doctorEntity.profile_completed
          : "",
        entityDetails: getEntities,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while fetching.",
      statusCode: 422,
    });
  }
};

const getBankDetails = async (userData, res) => {
  try {
    let { entity_id } = userData;
    let message, statusCode;
    let bankdata = await entityModel.findOne({
      where: { entity_id },
      attributes: [
        "account_no",
        "ifsc_code",
        "bank_name",
        "account_holder_name",
        "UPI_ID",
      ],
    });
    if (!handleResponse) {
      statusCode = 422;
      message = "Sorry unable to fetch.";
    } else {
      (statusCode = 200), (message = "Successfully fetched data");
    }
    return handleResponse({
      res,
      statusCode,
      message,
      data: {
        bankdata,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while fetching bank details.",
    });
  }
};

const updateEntityStatus = async (userData, res) => {
  try {
    let { entity_id } = userData;
    let authData = await authenticationModel.findOne({
      where: { entity_id },
      attributes: ["status"],
    });

    let data = await authenticationModel.update(
      {
        status: !authData.status,
      },
      {
        where: {
          entity_id,
        },
      }
    );
    return handleResponse({
      res,
      message: "Successfully updated status.",
      statusCode: 200,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while updating the status.",
      statusCode: 422,
    });
  }
};
const updateProfileDetails = async (doctorProfile, params, res) => {
  try {
    let { id } = params;
    console.log({ doctorProfile, id });
    let updatedProfile = await doctorModel.update(
      { ...doctorProfile },
      { where: { doctor_id: id } }
    );
    let doctorData = await doctorModel.findOne({
      where: { doctor_id: id },
      attributes: ["entity_id"],
    });
    let updatedEntity = await entityModel.update(
      {
        ...doctorProfile,
      },
      { where: { entity_id: doctorData.entity_id } }
    );
    return handleResponse({
      res,
      statusCode: 200,
      message: "Sucessfully updated the doctor profile.",
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Sorry! Try after sometime.",
      statusCode: 404,
    });
  }
};

const phoneRegisterService = async (data, res) => {
  try {
    const { phone } = data;
    if (phone) {
      let phoneExists = await doctorModel.findOne({
        where: { doctor_phone: phone },
      });
      let phoneExistsEntity = await entityModel.findOne({
        where: { phone },
      });
      if (phoneExists && phoneExistsEntity) {
        return handleResponse({
          res,
          statusCode: 200,
          message: "Phone number already exists",
          data: {
            entity_id: phoneExistsEntity?.entity_id,
            doctor_id: phoneExists?.doctor_id,
            profile_completed: 0,
          },
        });
      } else {
        let phoneAddEntity = await entityModel.create({ phone });
        if (phoneAddEntity) {
          let phoneAdd = await doctorModel.create({
            doctor_phone: phone,
            entity_id: phoneAddEntity.entity_id,
          });
          if (phoneAdd) {
            return handleResponse({
              res,
              statusCode: 200,
              message: "Phone number added successfully",
              data: {
                entityId: phoneAddEntity.entity_id,
                doctorId: phoneAdd.doctor_id,
                doctorPhone: phoneAdd.doctor_phone,
                profile_completed: 0,
              },
            });
          } else {
            return handleResponse({
              res,
              statusCode: 500,
              message: "Error while adding phone number",
            });
          }
        }
      }
    } else {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Phone number is mandatory",
      });
    }
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Internal error",
      statusCode: 500,
    });
  }
};
const listSpecialityService = async (data, res) => {
  try {
    let specialities = await departmentModel.findAll({
      attributes: ["department_id", "department_name", "status"],
    });
    if (specialities) {
      return handleResponse({
        res,
        statusCode: 200,
        message: "Specialities feteched successfully",
        data: specialities,
      });
    } else {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Error while fetching specialities",
        data: specialities,
      });
    }
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Internal error",
      statusCode: 500,
    });
  }
};

const onboardDoctorService = async (data, res) => {
  try {
    const {
      doctor_id,
      entity_id,
      doctor_phone,
      doctor_name,
      department_id,
      consultation_time,
      session,
      workingHours,
    } = data;

    // let imageUrl;
    // if (image) {
    //   imageUrl = await DigitalOceanUtils.uploadObject(image);
    // }
    let existingIndvEntity = await entityModel.findOne({
      where: { phone: doctor_phone },
    });

    let existingDr = await doctorModel.findOne({
      where: { doctor_phone: doctor_phone },
    });

    // const capitalizedEntityName =
    //   entityName.charAt(0).toUpperCase() + entityName.slice(1);

    if (existingIndvEntity) {
      const [entityUpdate, addedIndvEntity] = await entityModel.update(
        {
          phone: doctor_phone,
          business_type_id: 0,
          entity_type: 2,
        },
        {
          where: { phone: doctor_phone },
        }
      );
      if (existingDr) {
        let doctorName = doctor_name;

        if (doctorName.startsWith("Dr. ")) {
          doctorName = doctorName.slice(4);
        } else if (doctorName.startsWith("Dr ")) {
          doctorName = doctorName.slice(3);
        }

        const capitalizedDoctorName =
          doctorName.charAt(0).toUpperCase() + doctorName.slice(1);

        const [doctorUpdate, addedDoctor] = await doctorModel.update(
          {
            doctor_name: capitalizedDoctorName,
            doctor_phone,
            department_id,
            entity_id: addedIndvEntity?.entity_id,
            bookingType: "token",
            profileImageUrl:
              "https://cdn-icons-png.freepik.com/256/3983/3983551.png?ga=GA1.1.188670520.1712644471&semt=ais_hybrid",
          },
          {
            where: { doctor_phone },
          }
        );

        const doctorId = addedDoctor
          ? addedDoctor.doctor_id
          : existingDr.doctor_id;

        const userExists = await userModel.findOne({
          where: { phone: doctor_phone },
        });
        if (!userExists) {
          userModel.create({
            uuid: await generateUuid(),
            userType: 2,
            name: capitalizedDoctorName,
            phone: doctor_phone,
          });
        }

        await doctorEntityModel.create({
          doctorId: doctor_id,
          entityId: entity_id,
          consultationTime: consultation_time,
        });

        let tokens = await generateTokens(doctor_phone);

        if (entityUpdate > 0 && doctorUpdate > 0) {
          handleResponse({
            res,
            message: "Doctor onboarded successfully",
            statusCode: 200,
            data: {
              entity_id,
              doctor_id: doctorId,
              phone: doctor_phone,
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken,
              profile_completed: 1,
            },
          });
        } else {
          return handleResponse({
            res,
            message: "Update error",
            statusCode: 400,
          });
        }

        const workscheduleData = {
          doctor_id: doctorId,
          session,
          entityId: entity_id,
          workingHours,
          consultation_time,
        };

        createWorkScheduleFor28Days(workscheduleData);
      } else {
        return handleResponse({
          res,
          message: "Doctor not found",
          statusCode: 200,
        });
      }
    } else {
      return handleResponse({
        res,
        message: "Entity not found",
        statusCode: 200,
      });
    }
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Internal error",
      statusCode: 500,
    });
  }
};

const createWorkScheduleFor28Days = async (data) => {
  console.log("Work schedule creation");
  try {
    let { workingHours, doctor_id, entityId, consultation_time } = data;
    let errorMessages = [];
    let status = 1;
    let message = "";

    // Fetch doctor data to verify status and booking type
    let doctorData = await doctorModel.findOne({
      where: { status: 1, doctor_id },
      attributes: ["doctor_id", "consultation_time", "tokens", "bookingType"],
    });

    if (!doctorData) {
      console.log("Invalid input doctor data!");
    }

    const doctorEntityData = await doctorEntityModel.findOne({
      where: { doctorId: doctor_id, entityId },
    });

    // Loop through working hours
    for (let work of workingHours) {
      const { day, startTime, endTime, session } = work;
      let daysArray = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];

      // Validate day
      let dayIn = daysArray.includes(day.toLowerCase());
      if (!dayIn) {
        console.log(`Invalid day: ${day}`);
        continue;
      }

      let dayOfWeek = await getDayOfWeekIndex(day);
      let datefromDay = await dateFromDay(dayOfWeek);

      // Check if work schedule exists
      let workExists = await workScheduleModel.findOne({
        where: { entity_id: entityId, day, session, doctor_id },
      });

      if (workExists) {
        console.log(
          `Work schedule already exists for ${day} for session: ${session}`
        );
        continue;
      }

      let time_slots;

      time_slots = await generateTokenBasedTimeSlots(
        startTime,
        endTime,
        consultation_time
      );

      // Loop through the next 4 weeks
      for (let i = 0; i < 4; i++) {
        const currentDate = new Date(datefromDay);
        currentDate.setDate(currentDate.getDate() + i * 7);
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const date = String(currentDate.getDate()).padStart(2, "0");
        const formattedDate = `${year}-${month}-${date}`;

        await Promise.all(
          time_slots.map(async (ele, index) => {
            // Check if time slot exists
            let existingTimeSlot = await weeklyTimeSlotsModel.findOne({
              where: {
                date: formattedDate,
                day: day,
                time_slot: ele,
                doctor_id: doctor_id,
              },
            });

            if (existingTimeSlot) {
              console.log(
                `Time slot ${ele} already exists for doctor on ${formattedDate}`
              );
            } else {
              // Create new time slot
              let newTimeSlot = new weeklyTimeSlotsModel({
                date: formattedDate,
                day,
                time_slot: ele,
                doctor_id,
                doctorEntityId: doctorEntityData
                  ? doctorEntityData.doctorEntityId
                  : null,
                token_number: index + 1,
              });

              const result = await newTimeSlot.save();
              if (result) {
                console.log(
                  `Time slot ${ele} added for doctor on ${formattedDate}`
                );
              }
            }
          })
        );
      }

      // Create new work schedule
      let workData = new workScheduleModel({
        entity_id: entityId,
        day,
        session,
        startTime,
        endTime,
        status,
        doctor_id,
      });

      let workSchedule = await workData.save();
      if (workSchedule) {
        console.log(
          `Successfully added work schedule for ${day}, session: ${session}.`
        );
      }
    }

    if (errorMessages.length > 0) {
      console.log("ERROR while creating workschedule =>>", errorMessages);
    }
  } catch (error) {
    console.log("Timeslot creation ERROR =>>", error);
  }
};

const generateTokenBasedTimeSlots = async (
  startTime,
  endTime,
  consultation_time
) => {
  try {
    console.log(
      "startTime, endTime, tokens",
      startTime,
      endTime,
      consultation_time
    );

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Parse start and end times correctly with AM/PM
    const startDateTime = new Date(
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay
        .toString()
        .padStart(2, "0")} ${startTime}`
    );
    const endDateTime = new Date(
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay
        .toString()
        .padStart(2, "0")} ${endTime}`
    );

    const totalTime = (endDateTime - startDateTime) / 60000; // Total time in minutes

    const tokens = Math.floor(totalTime / consultation_time); // Rounding down

    const timeSlots = [];
    let current = new Date(startDateTime);

    for (let i = 0; i < tokens; i++) {
      const formattedTime = current.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      timeSlots.push(formattedTime);

      // Increment current time by consultationTime, rounding to avoid floating point issues
      current.setMinutes(current.getMinutes() + Math.floor(consultation_time));
      if (consultation_time % 1 !== 0) {
        current.setSeconds(current.getSeconds() + 30);
      }
    }

    return timeSlots;
  } catch (error) {
    console.log({ error });
  }
};

const dateFromDay = async (day) => {
  try {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    let daysToAdd = day - currentDayOfWeek;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
  } catch (error) {
    console.log({ error });
  }
};

const getDayOfWeekIndex = async (dayName) => {
  try {
    console.log({ dayName });
    const lowercaseDayName = dayName.toLowerCase();
    const dayOfWeekMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayOfWeekMap[lowercaseDayName] !== undefined
      ? dayOfWeekMap[lowercaseDayName]
      : null;
  } catch (err) {
    console.log({ err });
  }
};

export default {
  register,
  userCheck,
  addProfile,
  getProfile,
  getGeneralSettings,
  getBankDetails,
  getProfileForCustomer,
  updateEntityStatus,
  updateProfileDetails,
  phoneRegisterService,
  listSpecialityService,
  onboardDoctorService,
};
