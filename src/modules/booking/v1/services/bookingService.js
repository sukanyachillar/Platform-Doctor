import doctorProfileModel from '../../../../models/doctorModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import entityModel from '../../../../models/entityModel.js'
import bookingModel from '../../../../models/bookingModel.js'
import payment from '../../../../utils/pg.js'
import { Op } from 'sequelize';
import doctorModel from '../../../../models/doctorModel.js'
import paymentModel from '../../../../models/paymentModel.js'
import userModel from '../../../../models/userModel.js'
import { generateUuid } from '../../../../utils/generateUuid.js'
import Sequelize from 'sequelize';
import doctorEntityModel from '../../../../models/doctorEntityModel.js';
import { getEntityDetailsOfTheDr } from '../../../authentication/v1/services/authenticationService.js';

const bookAppointment = async (req, res) => {
    try {
        const {
            doctorId,
            appointmentDate,
            timeSlot,
            customerName,
            customerPhone,
            amount,
            paymentMethod,
            entityId,
        } = req.body;

        const doctorProfile = await doctorProfileModel.findOne({
            where: { doctor_id: doctorId },
        });
        const getEntity = await entityModel.findOne({
            where: { entity_id: entityId }, // doctorProfile.entity_id
        });
        const existingTimeslot = await weeklyTimeSlotsModel.findOne({
            where: {
                time_slot: timeSlot,
                doctor_id: doctorId,
                date: appointmentDate,
            },
        });

        if (!existingTimeslot) {
            return handleResponse({
                res,
                message: 'Slot not found on this date',
                statusCode: 404,
            });
        };

        if (doctorProfile.status === 0) {
            return handleResponse({
                res,
                message: 'Doctor not available',
                statusCode: 404,
            })
        };

        if (getEntity.status === 0) {
            return handleResponse({
                res,
                message: 'Clinic is closed.',
                statusCode: 404,
            })
        };

        if (customerPhone.length !== 10) {
            return handleResponse({
                res,
                message: 'Invalid Phone No.',
                statusCode: 403,
            })
        };

        if (!existingTimeslot) {
            return handleResponse({
                res,
                message: 'Slot not found on this date',
                statusCode: 404,
            })
        };
        if (existingTimeslot.booking_status === 1) {
            return handleResponse({
                res,
                message: 'Slot already booked',
                statusCode: 400,
            })
        };

        const doctorEntityData = await doctorEntityModel.findOne({
            where: { 
                doctorId: doctorId,
                entityId,
            },
        });
        // existingTimeslot.booking_status= 1;
        if (existingTimeslot) {
            await weeklyTimeSlotsModel.update(
                {
                    booking_status: 0,
                },
                {
                    where: {
                        time_slot: timeSlot,
                        doctor_id: doctorId,
                        date: appointmentDate,
                        doctorEntityId: doctorEntityData.doctorEntityId,
                    },
                }
            )
        };

        let data = await payment.createPaymentLink({
            name: customerName,
            phone: customerPhone,
            amount: 1000,
        });
        if (data?.Error?.statusCode == 400)
            return handleResponse({
                res,
                statusCode: '400',
                message: 'Something went wrong',
                data: {
                    message: data?.Error?.error?.description,
                },
            });

        const randomUUID = await generateUuid();
        let newCustomer;
        newCustomer = await userModel.findOne({
            where: { phone: customerPhone },
        });

        if (!newCustomer) {
            newCustomer = await userModel.create({
                uuid: randomUUID,
                userType: 1,
                name: customerName,
                phone: customerPhone,
            });
        };

        const customerData = {
            customerId: newCustomer.userId,
            entityId: entityId,
            departmentId: doctorProfile.department_id,
            bookingType: 1,
            amount,
            bookingDate: new Date(),
            appointmentDate,
            orderId: data?.id,
            workSlotId: existingTimeslot.time_slot_id,
            patientName: customerName,
            bookedPhoneNo: customerPhone,
        };

        const newBooking = new bookingModel(customerData);
        const addedBooking = await newBooking.save();

        // const { appCharge, doctorFee } = calcSplitAmt(entityId, doctorId, amount);
        
        await paymentModel.create({
            bookingId: addedBooking.bookingId,
            orderId: data?.id,
            amount,
        });

        return handleResponse({
            res,
            statusCode: '200',
            message: 'Appointment booked successfully',
            data: {
                orderId: data?.id,
                amount: 1000,
                bookingId: addedBooking.bookingId,
            },
        });
    } catch (error) {
        console.log(error)
        return handleResponse({
            res,
            message: 'Error while booking appointment.',
            statusCode: 422,
        })
    }
};

// const calcSplitAmt = async (entityId, doctorId, amount) => {

//     const getEntity = await entityModel.findOne({ where: { entity_id: entityId }, 
//                                         attributes: ['gstNo', 'entity_type', 'entity_id']});

//     const getDoctor = await doctorModel.findOne({ where: { doctor_id: doctorId },
//                                         attributes: ['gstNo', 'doctor_id'] });
    
//     const entityGSTRate = 18;  // getGSTRateForEntity(entityId);
//     const doctorGSTRate = 12;  // getGSTRateForDoctor(doctorId);

//     const entityGSTAmount = (amount * entityGSTRate) / 100;
//     const doctorGSTAmount = (amount * doctorGSTRate) / 100;

//     const totalAmountWithoutGST = amount - entityGSTAmount - doctorGSTAmount;

//     // Perform split between entity and doctor (example: 70% to entity, 30% to doctor)
//     const entityAmount = totalAmountWithoutGST * 0.7; // 70%
//     const doctorAmount = totalAmountWithoutGST * 0.3; // 30%

//     return {
//         entityAmountWithGST: entityAmount + entityGSTAmount,
//         doctorAmountWithGST: doctorAmount + doctorGSTAmount
//     };
// };

// const listBooking = async ({ doctorId, date, entityId }, res) => { 
//     try {
//         let totalAppointments = 0;
//         let completedAppointments = 0;
//         let pendingAppointments = 0;

//         const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
//             attributes: ['time_slot', 'time_slot_id'],
//             where: {
//                 doctor_id: doctorId,
//                 date,
//             },
//         })

//         if (!weeklyTimeSlots) {
//             return handleResponse({
//                 res,
//                 statusCode: 404,
//                 message: 'Weekly time slot not found',
//             })
//         }

//         const appointmentList = [];
     
//         for (const weeklyTimeSlot of weeklyTimeSlots) {
//             const bookingInfo = await bookingModel.findOne({
//                 attributes: [
//                     'bookingStatus',
//                     'bookingId',
//                     'customerId',
//                     'patientName',
//                     'bookedPhoneNo'
//                 ],
//                 // where: {
//                 //     workSlotId: weeklyTimeSlot.time_slot_id,
//                 //     bookingStatus: {
//                 //         [Op.not]: 3,
//                 //     },
//                 // },
//                 where: bookingWhereCond,
//             });
//             if (bookingInfo) {
//                 const customerInfo = await userModel.findOne({
//                     attributes: ['name', 'phone'],
//                     where: {
//                         userId: bookingInfo.customerId,
//                     },
//                 });

//                 appointmentList.push({
//                     bookingId: bookingInfo.bookingId,
//                     timeSlot: weeklyTimeSlot.time_slot,
//                     // customerName: customerInfo ? customerInfo.name : '',
//                     // customerPhone: customerInfo ? customerInfo.phone : '',
//                     customerName: bookingInfo.patientName? bookingInfo.patientName: customerInfo.name,
//                     customerPhone: bookingInfo.bookedPhoneNo? bookingInfo.bookedPhoneNo: customerInfo.phone,
//                     bookingStatus: bookingInfo.bookingStatus,
//                 })
//                 totalAppointments++
//                 if (bookingInfo.bookingStatus === 1) {
//                     completedAppointments++
//                 } else {
//                     pendingAppointments++
//                 }
//             };
//         };

//         const doctorProfile = await doctorProfileModel.findOne({
//             attributes: ['doctor_name', 'doctor_phone'],
//             where: { doctor_id: doctorId },
//         });

//         const getEntities = await getEntityDetailsOfTheDr(doctorProfile.doctor_phone)

//         return handleResponse({
//             res,
//             statusCode: 200,
//             message: 'Appointment listing fetched successfully',
//             data: {
//                 appointmentList,
//                 totalAppointments,
//                 completedAppointments,
//                 pendingAppointments,
//                 appointmentDate: date,
//                 doctorName: doctorProfile.doctor_name
//                     ? doctorProfile.doctor_name
//                     : '',
//                 entityDetails: getEntities,
//             },
//         })
//     } catch (error) {
//         console.log({ error })
//     }
// };


const listBooking = async ({ doctorId, date, entityId }, res) => { 
    try {
        console.log(doctorId, date, entityId)
        let whereBookingCond = {};
        
        if (entityId) {
            whereBookingCond = { entityId: entityId };
        };

        console.log("whereBookingCond", whereBookingCond)

        const getDoctor = await doctorModel.findOne( { where: { doctor_id : doctorId }, 
                                            attributes: ['doctor_id', 'doctor_phone'], } );

        if (!getDoctor) {
            return handleResponse({
                res,
                statusCode: '404',
                message : 'Doctor ID not found',
                data: {},
            });
        };

        const [ totalAppointments, getEntities, bookingList ] = await Promise.all([
            weeklyTimeSlotsModel.count({
                where: {
                    doctor_id: doctorId,
                    date: date,
                    // bookingStatus: 0,
                }
            }),

            getEntityDetailsOfTheDr(getDoctor.doctor_phone),
        
            bookingModel.findAll({
                attributes: [
                    'bookingStatus',
                    'bookingId',
                    'customerId',
                    'patientName',
                    'bookedPhoneNo'
                ],
                include: [
                    {
                        model: userModel,
                        attributes: ['name', 'phone']
                    }
                ],
                where: {
                    bookingStatus: {
                        [Op.not]: 3,
                    },
                    ...whereBookingCond,
                },
                include: [
                    {
                        model: weeklyTimeSlotsModel,
                        attributes: ['time_slot'],
                        where: {
                            doctor_id: doctorId,
                            date: date,
                        },
                    },
                ]
            })
        ]);

        if (bookingList.length === 0) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'No appointments found.',
            });
        };

        const appointmentList = bookingList.map(booking => ({
            bookingId: booking.bookingId,
            timeSlot: booking.weeklyTimeSlot.time_slot,
            customerName: booking.patientName ? booking.patientName : "",
            customerPhone: booking.bookedPhoneNo ? booking.bookedPhoneNo : "",
            bookingStatus: booking.bookingStatus,
        }));

        const completedAppointments = appointmentList.filter(appointment => appointment.bookingStatus === 1).length;
        const pendingAppointments = totalAppointments - completedAppointments;

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Appointment listing fetched successfully',
            data: {
                appointmentList,
                totalAppointments,
                completedAppointments,
                pendingAppointments,
                appointmentDate: date,
                doctorName: getDoctor.doctor_name || '',
                entityDetails: getEntities,
            },
        });
    } catch (error) {
        console.log({ error });
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Internal server error',
            data: {},
        });
    }
};


const getBookingReport = async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        const whereCondition = {
            appointmentDate: { [Op.eq]: new Date(date) }, 
        }

        const weeklyTimeSlotData = await weeklyTimeSlotsModel.findAll({ date: date, doctor_id: doctorId });
        const workSlotIds = weeklyTimeSlotData.map(slot => slot.time_slot_id);
        
        // const bookingList = await bookingModel.findAll({
        //     where: whereCondition,
        //     attributes: ['orderId', 'amount', 'bookingStatus', 'workSlotId'
        //                 'customerId', 'patientName', 'bookedPhoneNo'], // Include customerId for later use
        // });

        const bookingList = await bookingModel.findAll({
            where: {
                ...whereCondition, 
                workSlotId: { [Op.in]: workSlotIds } 
            },
            attributes: ['orderId', 'amount', 'bookingStatus', 
            'workSlotId', 'customerId', 'patientName', 'bookedPhoneNo'],
        });
     
        const customerIds = bookingList.map((booking) => booking.customerId);
        const userRecords = await userModel.findAll({
            where: {
                userId: {
                    [Op.in]: customerIds,
                },
            },
            attributes: ['userId', 'name'],
        });
        const customerNameMap = {};
        userRecords.forEach((user) => {
            customerNameMap[user.userId] = user.name;
        });
        // const bookingReport = bookingList.map((booking) => ({
           
        //     ...booking.toJSON(),
        //     // customerName: customerNameMap[booking.customerId],
        //     customerName: booking.patientName? booking.patientName: customerNameMap[booking.customerId] ,
        // }));
        
        const bookingReport = bookingList.map((booking) => {
            const modifiedBooking = {
                // ...booking.toJSON(),
                orderId: booking.orderId,
                amount: booking.amount,
                bookingStatus: booking.bookingStatus,
                customerId: booking.customerId,
                customerName: booking.patientName ? booking.patientName : customerNameMap[booking.customerId]
            };
            return modifiedBooking;
        });

        // const getBookings = await bookingModel.findAll({
        //   where: queryPart,
        //   include: [
        //     {
        //       model: paymentModel,
        //       attributes: ['orderId'],
        //     },
        //   ],
        //   attributes: ['customerName', 'amount', 'bookingStatus', 'payment.orderId'],
        // });

        // const bookingReport = getBookings.map((booking) => ({
        //     customerName: booking.customerName,
        //     orderId: booking.payment ? booking.payment.orderId : "",
        //     amount: booking.amount,
        //     bookingStatus: booking.bookingStatus,
        //   }))

    

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully fetched booking report.',
            data: { bookingReport },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        })
    }
}

const bookingConfirmationData = async (bookingData, res) => {
    try {
        let { bookingId } = bookingData;
        let response = await bookingModel.findOne({ where: { bookingId } });
        let paymentData = await paymentModel.findOne({ where: { bookingId } });

        console.log({ response })
        const weeklyTimeSlot = await weeklyTimeSlotsModel.findOne({
            attributes: ['time_slot', 'date', 'doctor_id'],
            where: {
                time_slot_id: response.workSlotId,
            },
        });
        const doctorData = await doctorModel.findOne({
            where: { doctor_id: weeklyTimeSlot.doctor_id },
            attributes: ['doctor_name'],
        });
        let userData;
        let data, message, statusCode;
        let dataValues = response.toJSON()
        let userId = dataValues.customerId;
        userData = await userModel.findOne({
            where: { userId },
        });
        if (response) {
            data = dataValues
            ;(message = 'Successfully fetched booking details.'),
                (statusCode = 200)
        } else {
            ;(message = 'Sorry no data found for this bookingId.'),
                (statusCode = 404)
        };
        return handleResponse({
            res,
            message,
            statusCode,
            data: {
                doctorName: doctorData?.doctor_name,
                // customerName: userData?.name,
                // customerPhone: userData.phone,
                customerName: response.patientName? response.patientName : userData?.name,
                bookedPhoneNo: response.bookedPhoneNo? response.bookedPhoneNo : userData.phone,
                appointmentTimeSlot: weeklyTimeSlot.time_slot,
                appointmentDate: weeklyTimeSlot.date,
                paymentDate: data.updatedAt,
                // paymentID: data.transactionId,
                paymentID: paymentData ? paymentData.transactionId : '',
            },
        });
    } catch (error) {
        console.log({ 'Error while fetching booking details': error })
        return handleResponse({
            res,
            message: 'Error while fetching booking details',
            statusCode: 422,
        })
    }
}

const updateBookingStatus = async (req, res) => {
    try {
        let { bookingId } = req.body;
        let { userType } = req.user;
       
        let updateData = await bookingModel.update(
            {
                bookingStatus: 1,
                statusUpdatedBy: userType? userType : '',
                updatedAt: new Date(),
            },
            {
                where: {
                    bookingId,
                },
            }
        )

        return handleResponse({
            res,
            message: 'Sucessfully updated booking status to completed',
            statusCode: 200,
        })
    } catch (err) {
        console.log({ 'Error while updating booking': err })
        return handleResponse({
            res,
            message: 'Error while updating booking status',
            statusCode: 422,
        })
    }
}

// const listCustomers = async ({ page = 1, pageSize = 10, filter= {} } , res) => {
//     try {
//         // const filterConditions = {};

//         //      if (filter.appointmentDate) {
//         //        filterConditions.appointmentDate = filter.appointmentDate;
//         //      }
//         //      if (filter.doctorId) {
//         //         filterConditions.doctor_id = filter.doctorId;
//         //      }
//         // const usersWithDetails = await userModel.findAndCountAll({
//         //     attributes: ['userId', 'name', 'phone'],
//         //     where: {
//         //       userType: 1, // Assuming userType 1 is for customers
//         //     },
//         //     include: [
//         //       {
//         //         model: bookingModel,
//         //         as: 'customer', // Specify the alias for the association
//         //         attributes: ['bookingId', 'bookingDate', 'appointmentDate', 'bookingStatus', 'customerId', 'workSlotId'],
//         //         where: {
//         //           customerId: Sequelize.col('customer.userId'),
//         //         },
//         //         include: [
//         //           {
//         //             model: weeklyTimeSlotsModel,
//         //             as: 'weeklyTimeSlots', // Specify the alias for the association
//         //             attributes: ['time_slot', 'time_slot_id', 'date', 'day', 'doctor_id'],
//         //             where: {
//         //               time_slot_id: Sequelize.col('bookings.workSlotId'),
//         //             },
//         //             include: [
//         //               {
//         //                 model: doctorModel,
//         //                 as: 'doctor', // Specify the alias for the association
//         //                 attributes: ['doctor_id', 'doctor_name'],
//         //                 where: {
//         //                   doctor_id: Sequelize.col('weeklyTimeSlots.doctor_id'),
//         //                 },
//         //               },
//         //             ],
//         //           },
//         //         ],
//         //       },
//         //     ],
//         //     limit: pageSize,
//         //     offset: (page - 1) * pageSize,
//         //     order: [['createdAt', 'ASC']], // Adjust the order as needed
//         //   });

//         //   const totalPages = Math.ceil(usersWithDetails.count / pageSize);

//         //   return handleResponse({
//         //     res,
//         //     message: 'Successfully fetched all customers',
//         //     statusCode: 200,
//         //     data: {
//         //       users: usersWithDetails.rows,
//         //       totalPages,
//         //       currentPage: page,
//         //       totalCount: usersWithDetails.count,
//         //     },
//         //   });

// const getUserDetails = async (search) => {
//     const whereCondition = {};
//     if (search) {
//         whereCondition.name = { [Sequelize.Op.like]: `%${search}%` };
//       }
//     const usersWithDetails = await userModel.findAll({
//       attributes: ['userId', 'name', 'phone'],
//       where: {
//         userType: 1,
//         ...whereCondition,
//       },
//       raw: true,
//     });

//     return usersWithDetails;
//   };

//   const getBookingDetails = async (customerId) => {
//     const bookingDetails = await bookingModel.findAll({
//       attributes: ['bookingId', 'bookingDate', 'appointmentDate', 'bookingStatus', 'workSlotId'],
//       where: {
//         customerId,
//       },
//       raw: true,
//     });

//     return bookingDetails;
//   };

//   const getDoctorDetails = async (workSlotId) => {
//     const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
//       attributes: ['time_slot', 'time_slot_id', 'date', 'day', 'doctor_id'],
//       where: {
//         time_slot_id: workSlotId,
//       },
//       raw: true,
//     });

//     if (!weeklyTimeSlots.length) {
//       return [];
//     }

//     const doctorDetails = await doctorModel.findAll({
//       attributes: ['doctor_id', 'doctor_name'],
//       where: {
//         doctor_id: weeklyTimeSlots[0].doctor_id,
//       },
//       raw: true,
//     });

//     return doctorDetails;
//   };

//   const listAllCustomers = async ({ page = 1, limit = 10, searchQuery= '', filter = {} }, res) => {
//     try {
//       const users = await getUserDetails(searchQuery);

//       const totalUsersCount = users.length;
//       const totalPages = Math.ceil(totalUsersCount / limit);

//       const paginatedUsers = users.slice((page - 1) * limit, page * limit);

//       const customers = await Promise.all(
//         paginatedUsers.map(async (user) => {
//           const bookingDetails = await getBookingDetails(user.userId);

//           const appointments = await Promise.all(
//             bookingDetails.map(async (booking) => {
//               const doctorDetails = await getDoctorDetails(booking.workSlotId, filter);

//               return {
//                 bookingId: booking.bookingId,
//                 appointmentDate: booking.appointmentDate,
//                 bookingStatus: booking.bookingStatus,
//                 doctorName: doctorDetails.length ? doctorDetails[0].doctor_name : '',
//                 doctorId: doctorDetails.length ? doctorDetails[0].doctor_id : '',
//               };
//             })
//           );

//           return {
//             userId: user.userId,
//             customerName: user.name,
//             phone: user.phone,
//             appointmentsDetails: appointments,
//           };
//         })
//       );

//       let finalCustomerList = customers;
//       if (filter.doctorId) {
//         const filteredCustomers = customers.filter(customer => {
//             const matchingAppointments = customer.appointmentsDetails.filter(appointment => appointment.doctorId === filter.doctorId);

//             if (matchingAppointments.length > 0) {
//               console.log('Matching Customer:', customer);
//             }

//             return matchingAppointments.length > 0;
//           });
//           finalCustomerList = filteredCustomers.length > 0 ? filteredCustomers: [];
//       }
//       return handleResponse({
//         res,
//         statusCode: 200,
//         message: 'Customer listing fetched successfully',
//         data: {
//           customers: finalCustomerList,
//           totalCount: totalUsersCount,
//           currentPage: page,
//           limit: limit,
//           totalPages,
//         },
//       });
//     } catch (error) {
//       console.log({ error });
//       return handleResponse({
//         res,
//         statusCode: 500,
//         message: 'Something went wrong',
//         data: {},
//       });
//     }
//   };

export default {
    bookAppointment,
    listBooking,
    getBookingReport,
    bookingConfirmationData,
    updateBookingStatus,
}
