import { hashPassword, comparePasswords } from '../../../utils/password.js';
import { generateAdminTokens } from '../../../utils/token.js';
import { generateUuid } from '../../../utils/generateUuid.js';
import { handleResponse } from '../../../utils/handlers.js';
import { Op, fn, Sequelize } from 'sequelize';
// import { encrypt } from '../../../../utils/token.js';
import entityModel from '../../../models/entityModel.js';
import doctorModel from '../../../models/doctorModel.js';
import weeklyTimeSlotsModel from '../../../models/weeklyTimeSlotsModel.js';
import bookingModel from '../../../models/bookingModel.js';
import userModel from '../../../models/userModel.js';
// import twilio from 'twilio';

const getOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOTPSMS = async (phone, otp) => {
    try {
        await twilioClient.messages.create({
            to: '+919747505122',
            from: '+16562204100', // Your Twilio phone number
            body: `Your OTP for Clinic Login is: ${otp}`
        });

        console.log('OTP sent successfully to phone:', phone);
    } catch (error) {
        console.error('Error sending OTP via SMS:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
}

const generateOTP = async ({ phone }, res) => {

    console.log("phone", phone)
    try {
        const clinic = await entityModel.findOne({ where: { phone }, attributes: ['entity_id'], });
        if (!clinic) {
            return handleResponse({
                res,
                message: 'Clinic not found',
                statusCode: 404,
            });
        }

        const otp = getOTP();

         // sendOTPSMS(phone, otp); // Send OTP via SMS to the provided phone number

        return handleResponse({
            res,
            statusCode: 200,
            message: 'OTP has been sent to clinic\'s phone number',
            data: { phone },
        });
    } catch (err) {
        console.error(err);
        return handleResponse({
            res,
            message: 'Sorry! Unable to process the request',
            statusCode: 500,
        });
    }
}

const clinicLogin = async (payload, res) => {
    try {
        let { phone, otp } = payload;

        // const otpVerification = await verifyOTPWithTwilio(phone, otp);
        // console.log('otpVerification', otpVerification)
        // if (!otpVerification.status === "approved") {
        //     return handleResponse({
        //         res,
        //         message: 'Invalid OTP',
        //         statusCode: 400,
        //     });
        // }

        if (otp !== "111111") {
            return handleResponse({
                res,
                message: 'Invalid OTP',
                statusCode: 400,
            });
        }
       
        let getClinic = await entityModel.findOne({
            where: { phone },
        });
        
        if (!getClinic) {
            return handleResponse({
                res,
                message: 'User not found',
                statusCode: 404,
            });
        }

        let tokens = await generateAdminTokens(phone);

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully signed In',
            data: {
                refreshToken: tokens.refreshToken,
                accessToken: tokens.accessToken,
                clinicId: getClinic.entity_id,
                userType: 3
            },
        });
    } catch (err) {
        console.error({ err });
        return handleResponse({
            res,
            message: 'Sorry! Unable to login',
            statusCode: 500,
        });
    }
}

// const verifyOTPWithTwilio = async (phoneNumber, otpProvided) => {
//     try {
//         const verificationCheck = await twilioClient.verify.v2.services('TWILIO_VERIFY_SERVICE_SID')  //
//             .verificationChecks
//             .create({ to: '+919747505122', code: otpProvided });

//         // If the verification check status is 'approved', the OTP is valid
//         return verificationCheck.status === 'approved';
//     } catch (error) {
//         console.error('Error verifying OTP with Twilio:', error);
//         throw error;
//     }
// }

// const listAllBooking = async ({ date }, res) => { //for all doctors
//     try {
//         let totalAppointments = 0;
//         let completedAppointments = 0;
//         let pendingAppointments = 0;

//         const doctors = await doctorModel.findAll({
//             attributes: ['doctor_id', 'doctor_name'],
//         });

//         const allAppointments = [];

//         for (const doctor of doctors) {
//             const doctorId = doctor.doctor_id;
//             const doctorName = doctor.doctor_name;

//             const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
//                 attributes: ['time_slot', 'time_slot_id'],
//                 where: {
//                     doctor_id: doctorId,
//                     date,
//                 },
//             });

//             // Loop through each weekly time slot and fetch booking information
//             const appointmentList = [];
//             for (const weeklyTimeSlot of weeklyTimeSlots) {
//                 const bookingInfo = await bookingModel.findOne({
//                     attributes: [
//                         'bookingStatus',
//                         'bookingId',
//                         'customerId',
//                     ],
//                     where: {
//                         workSlotId: weeklyTimeSlot.time_slot_id,
//                         bookingStatus: {
//                             [Op.not]: 3,
//                         },
//                     },
//                 });

//                 if (bookingInfo) {
//                     const customerInfo = await userModel.findOne({
//                         attributes: ['name', 'phone'],
//                         where: {
//                             userId: bookingInfo.customerId,
//                         },
//                     });

//                     appointmentList.push({
//                         bookingId: bookingInfo.bookingId,
//                         timeSlot: weeklyTimeSlot.time_slot,
//                         customerName: customerInfo ? customerInfo.name : '',
//                         customerPhone: customerInfo ? customerInfo.phone : '',
//                         bookingStatus: bookingInfo.bookingStatus,
//                     });

//                     totalAppointments++;
//                     if (bookingInfo.bookingStatus === 1) {
//                         completedAppointments++;
//                     } else {
//                         pendingAppointments++;
//                     }
//                 }
//             }

//             // Add appointment listings for the current doctor to the overall appointments list
//             if (appointmentList.length > 0) {
//                 allAppointments.push({
//                     doctorId,
//                     doctorName,
//                     appointmentList,
//                 });
//             }


//         }

//         return handleResponse({
//             res,
//             statusCode: 200,
//             message: 'Appointment listings fetched successfully',
//             data: {
//                 allAppointments,
//                 totalAppointments,
//                 completedAppointments,
//                 pendingAppointments,
//                 appointmentDate: date,
//             },
//         });
//     } catch (error) {
//         console.error({ error });
//         return handleResponse({
//             res,
//             message: 'Error fetching appointment listings',
//             statusCode: 500,
//         });
//     }
// };

const listAllBooking = async (requestData, res) => { //for all doctors
    try {
        const page = parseInt(requestData.page) || 1;
        const pageSize = parseInt(requestData.limit) || 10;
        let date = requestData.date;
        const offset = (page - 1) * pageSize;

        console.log("date", date)
        // Fetch bookings for the given date with pagination
        const { count, rows: bookingInfos } = await bookingModel.findAndCountAll({
            attributes: ['bookingStatus', 'bookingId', 'customerId', 'workSlotId'],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('appointmentDate')), '=', date),
                    { bookingStatus: { [Op.not]: 3 } }
                ]
            },
            offset,
            limit: pageSize,
        });

        const appointments = [];
        let completedAppointments = 0;
        let pendingAppointments = 0;

        for (const bookingInfo of bookingInfos) {
            // const { doctorName } = await weeklyTimeSlotsModel.findOne({
            //     attributes: [],
            //     include: [{
            //         model: doctorModel,
            //         attributes: ['doctor_name'],
            //     }],
            //     where: { time_slot_id: bookingInfo.workSlotId },
            // });
            const doctorData = await weeklyTimeSlotsModel.findOne({
                attributes: [],
                include: [{
                    model: doctorModel,
                    attributes: ['doctor_name'],
                }],
                where: { time_slot_id: bookingInfo.workSlotId },
            });

            const customerInfo = await userModel.findOne({
                attributes: ['name', 'phone'],
                where: { userId: bookingInfo.customerId },
            });

            appointments.push({
                bookingId: bookingInfo.bookingId,
                timeSlot: bookingInfo.time_slot, // Assuming there's a time_slot attribute in bookingInfo
                customerName: customerInfo ? customerInfo.name : '',
                customerPhone: customerInfo ? customerInfo.phone : '',
                bookingStatus: bookingInfo.bookingStatus,
                doctorName: doctorData?.doctor?.dataValues?.doctor_name ?? '', // Include doctor's name in the appointment
            });

            if (bookingInfo.bookingStatus === 1) {
                completedAppointments++;
            } else {
                pendingAppointments++;
            }
        }

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Appointment listings fetched successfully',
            data: {
                appointments,
                totalAppointments: count,
                completedAppointments,
                pendingAppointments,
                appointmentDate: date,
                totalPages: Math.ceil(count / pageSize), // Calculate total pages based on total appointments and limit
                currentPage: page,
            },
        });
    } catch (error) {
        console.error({ error });
        return handleResponse({
            res,
            message: 'Error fetching appointment listings',
            statusCode: 500,
        });
    }
};





export default {
    generateOTP,
    clinicLogin,
    listAllBooking,
}
