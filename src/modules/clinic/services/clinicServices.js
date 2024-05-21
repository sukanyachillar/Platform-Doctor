import { hashPassword, comparePasswords } from '../../../utils/password.js';
import { generateTokens } from '../../../utils/token.js';
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

        let tokens = await generateTokens(phone);

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully signed In',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                clinicId: getClinic.entity_id,
                clinicName: getClinic.entity_name,
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

const listAllBooking = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1;
        const pageSize = parseInt(requestData.limit) || 10;
        const date = requestData.date;
        const offset = (page - 1) * pageSize;
        const entityId = requestData.entityId;
        const doctorId = requestData.doctorId; 
        const searchText = requestData.searchText;

        let whereCondition = { date };

        whereCondition = doctorId ? { doctor_id: doctorId } : whereCondition;

        const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
            where: whereCondition,
            attributes: ['time_slot_id', 'doctor_id', 'time_slot'],
        });

        const workSlotIds = weeklyTimeSlots.map(slot => slot.time_slot_id);

        // const totalCount = await bookingModel.count({
        //     where: {
        //         workSlotId: { [Op.in]: workSlotIds },
        //     },
        // });

        
        const whereClause = {
            workSlotId: { [Op.in]: workSlotIds },
            entityId,
            bookingStatus: {
                [Op.not]: 3,
            },
        };
        if (searchText) {
            whereClause[Op.or] = [
                { patientName: { [Op.like]: `%${searchText}%` } }, // Case-insensitive search on patient name
                { bookedPhoneNo: { [Op.like]: `%${searchText}%` } }, // Case-insensitive search on booked phone number
            ];
        }

        // const totalCount = await bookingModel.count({
        //     where: {
        //         workSlotId: { [Op.in]: workSlotIds },
        //         bookingStatus: {
        //             [Op.not]: 3,
        //         },
        //         entityId,
        //         ...searchObj,
        //     }
        // });

        const totalCount = await bookingModel.count({
            where: whereClause,
        });
               
                
        const totalPages = Math.ceil(totalCount / pageSize);

        const bookingReport = await bookingModel.findAll({
            where: whereClause,
            attributes: [
                'bookingId',
                'amount',
                'bookingStatus',
                'appointmentDate',
                'orderId',
                'workSlotId',
                'customerId',
                'patientName',
                'bookedPhoneNo',
            ],
            limit: pageSize,
            offset: offset,
        });

        const appointments = [];
        let pendingAppointments = 0;
        let completedAppointments = 0;
        let timeSlot1

        for (const booking of bookingReport) {
            const user = await userModel.findOne({
                where: { userId: booking.customerId },
                attributes: ['name', 'phone'],
            });

            const timeSlot = weeklyTimeSlots.find(slot => slot.time_slot_id === booking.workSlotId);
            timeSlot1 = timeSlot.time_slot;
            const associatedDoctor = await doctorModel.findOne({
                where: { doctor_id: timeSlot.doctor_id },
                attributes: ['doctor_name', 'doctor_id'],
            });

            const doctorName = associatedDoctor?.doctor_name || '';
            const orderId = booking.orderId || '';
            const appointment = {
                bookingId: booking.bookingId,
                timeSlot: timeSlot1,
                bookingStatus: booking.bookingStatus,
                doctorName: doctorName,
                doctorId: associatedDoctor?.doctor_id || '',
                // customer: {
                //     name: user?.name || '',
                //     phone: user?.phone || '',
                // },
                customer: {
                    name: booking.patientName? booking.patientName: user?.name,
                    phone: booking.bookedPhoneNo? booking.bookedPhoneNo: user?.phone,
                },
            };

            appointments.push(appointment);

            if (booking.bookingStatus === 1) {
                completedAppointments++;
            } else {
                pendingAppointments++;
            }
        };

        appointments.sort((a, b) => {
            const timeA = a.timeSlot.toLowerCase(); 
            const timeB = b.timeSlot.toLowerCase();
            const timeAIsAM = timeA.includes("am");
            const timeBIsAM = timeB.includes("am");
            
            // If both times are AM, sort based on the time values
            if (timeAIsAM && timeBIsAM) {
                return timeA.localeCompare(timeB);
            } 
            // If one is AM and the other is PM, prioritize AM
            else if (timeAIsAM) {
                return -1; // a (AM) comes before b (PM)
            } 
            else if (timeBIsAM) {
                return 1; // b (AM) comes after a (PM)
            } 
            else {
                // Both times are PM, sort based on the time values
                return timeA.localeCompare(timeB);
            }
        });

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully fetched booking list.',
            data: {
                bookingList: appointments,
                totalCount: totalCount,
                totalPages: totalPages,
                currentPage: page,
                completedAppointments: completedAppointments,
                pendingAppointments: pendingAppointments
            },
        });
    } catch (error) {
        console.log({ error });
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        });
    }
};

// const AllBookingReport = async (req, res) => {
//     try {
//         const { date, doctorId } = req.body;

//         const whereCondition = {
//             appointmentDate: { [Op.eq]: new Date(date) }, 
//         };

//         // Include doctorModel only if doctorId is provided
//         const includeDoctor = doctorId ? [
//             {
//                 model: weeklyTimeSlotsModel,
//                 include: [
//                     {
//                         model: doctorModel,
//                         where: { doctor_id: doctorId }, 
//                         attributes: ['doctor_name'], 
//                     },
//                 ],
//                 attributes: [], // We only need to include the associated doctor
//             }
//         ] : [];

//         const bookingReport = await bookingModel.findAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: userModel,
//                     attributes: ['name', 'phone'], 
//                 },
//                 ...includeDoctor, 
//             ],
//             attributes: ['bookingId', 'amount', 'bookingStatus', 'appointmentDate'], 
//         });

//         return handleResponse({
//             res,
//             statusCode: 200,
//             message: 'Successfully fetched booking report.',
//             data: { bookingReport },
//         });
//     } catch (error) {
//         console.log({ error });
//         return handleResponse({
//             res,
//             statusCode: 500,
//             message: 'Something went wrong',
//             data: {},
//         });
//     }
// };

// const AllBookingReport = async (req, res) => {
//     try {
//         const { date, doctorId } = req.body;

//         const whereCondition = {
//             appointmentDate: { [Op.eq]: new Date(date) }, 
//         };

//         // Include doctorModel only if doctorId is provided
//         const includeDoctor = doctorId ? [
//             {
//                 model: weeklyTimeSlotsModel,
//                 include: [
//                     {
//                         model: doctorModel,
//                         where: { doctor_id: doctorId }, 
//                         attributes: ['doctor_name'], 
//                     },
//                 ],
//                 attributes: [], // We only need to include the associated doctor
//             }
//         ] : [];

//         const bookingReport = await bookingModel.findAll({
//             where: whereCondition,
//             include: [
//                 {
//                     model: userModel,
//                     attributes: ['name', 'phone'], 
//                 },
//                 ...includeDoctor, 
//             ],
//             attributes: ['bookingId', 'amount', 'bookingStatus', 'appointmentDate', 'orderId', 'workSlotId'], 
//         });


//         const modifiedBookingReport = bookingReport.map((booking) => {
//             const doctorName = booking.weeklyTimeSlots?.doctor?.doctor_name || 'Unknown Doctor';
//             const orderId = booking.orderId || 'Unknown';

//             return {
//                 bookingId: booking.bookingId,
//                 amount: booking.amount,
//                 bookingStatus: booking.bookingStatus,
//                 appointmentDate: booking.appointmentDate,
//                 doctorName: doctorName,
//                 orderId: orderId,
//                 customer: {
//                     name: booking.user.name,
//                     phone: booking.user.phone,
//                 },
//             };
//         });

//         return handleResponse({
//             res,
//             statusCode: 200,
//             message: 'Successfully fetched booking report.',
//             data: { bookingReport: modifiedBookingReport },
//         });
//     } catch (error) {
//         console.log({ error });
//         return handleResponse({
//             res,
//             statusCode: 500,
//             message: 'Something went wrong',
//             data: {},
//         });
//     }
// };

const AllBookingReport = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1;
        const pageSize = parseInt(requestData.limit) || 10;
        const date = requestData.date;
        const offset = (page - 1) * pageSize;
        const doctorId = requestData.doctorId;
        const entityId = requestData.entityId;

        let whereCondition = { date };

        whereCondition = doctorId ? { doctor_id: doctorId } : whereCondition;

        const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
            where: whereCondition,
            attributes: ['time_slot_id', 'doctor_id'],
        });

        const workSlotIds = weeklyTimeSlots.map(slot => slot.time_slot_id);

        const totalCount = await bookingModel.count({
            where: {
                workSlotId: { [Op.in]: workSlotIds },
                entityId,
                bookingStatus: {
                    [Op.not]: 3,
                },
            },
        });
        const totalPages = Math.ceil(totalCount / pageSize);

        const bookingReport = await bookingModel.findAll({
            where: {
                workSlotId: { [Op.in]: workSlotIds },
                entityId,
                bookingStatus: {
                    [Op.not]: 3,
                },
            },
            attributes: [
                         'bookingId',
                         'amount',
                         'bookingStatus', 
                         'appointmentDate',
                         'orderId',
                         'workSlotId',
                         'customerId',
                         'patientName',
                         'bookedPhoneNo'
                        ], 
                        
            limit: pageSize,
            offset: offset,
        });

        const modifiedBookingReport = await Promise.all(bookingReport.map(async (booking) => {
            let doctorName = '';
            let doctorId 

            if (doctorId) {
                const associatedDoctor = await doctorModel.findOne({
                    where: { doctor_id: doctorId },
                    attributes: ['doctor_name', 'doctor_id'],
                });

                doctorName = associatedDoctor?.doctor_name || '';
                doctorId = associatedDoctor?.doctor_id || '';

            } else {
                const weeklyTimeSlot = weeklyTimeSlots.find(slot => slot.time_slot_id === booking.workSlotId);
                if (weeklyTimeSlot) {
                    const associatedDoctor = await doctorModel.findOne({
                        where: { doctor_id: weeklyTimeSlot.doctor_id },
                        attributes: ['doctor_name', 'doctor_id'],
                    });

                    doctorName = associatedDoctor?.doctor_name || '';
                    doctorId = associatedDoctor?.doctor_id || '';
                }
            }

            const orderId = booking.orderId || '';
            
            const user = await userModel.findOne({
                where: { userId: booking.customerId },
                attributes: ['name', 'phone'],
            });

            return {
                bookingId: booking.bookingId,
                amount: booking.amount,
                bookingStatus: booking.bookingStatus,
                appointmentDate: booking.appointmentDate,
                doctorName: doctorName,
                doctorId,
                orderId: orderId,
                // customer: {
                //     name: user?.name || '',
                //     phone: user?.phone || '',
                // },
                customer: {
                    name: booking.patientName? booking.patientName: user?.name,
                    phone: booking.bookedPhoneNo? booking.bookedPhoneNo: user?.phone,
                },
            };
        }));

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully fetched booking report.',
            data: { 
                    bookingReport: modifiedBookingReport,
                    totalCount: totalCount,
                    totalPages: totalPages,
                    currentPage: page,
                
                },
           
        });
    } catch (error) {
        console.log({ error });
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        });
    }
};

export default {
    generateOTP,
    clinicLogin,
    listAllBooking,
    AllBookingReport
};
