import doctorProfileModel from "../../../../models/doctorModel.js";
import { handleResponse } from "../../../../utils/handlers.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";
import entityModel from "../../../../models/entityModel.js";
import bookingModel from "../../../../models/bookingModel.js";
import payment from "../../../../utils/pg.js";
import { Op, where } from "sequelize";
import doctorModel from "../../../../models/doctorModel.js";
import paymentModel from "../../../../models/paymentModel.js";
import userModel from "../../../../models/userModel.js";
import { generateUuid } from "../../../../utils/generateUuid.js";
import paymentSplitModel from "../../../../models/paymentSplitModel.js";
import doctorEntityModel from "../../../../models/doctorEntityModel.js";
import { getEntityDetailsOfTheDr } from "../../../authentication/v1/services/authenticationService.js";
import { decrypt, encrypt } from "../../../../utils/token.js";
import paymentGatewayModel from "../../../../models/paymentGatewayModel.js";
import PgFunctions from "../../../../utils/pg.js";
import bookingFeeModel from "../../../../models/bookingFeeModel.js";

const bookAppointment = async (req, res) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      customerName,
      customerPhone,
      // amount,
      paymentMethod,
      entityId,
    } = req.body;

    const bookingFee = await bookingFeeModel.findOne({
      where: { status: 1 }, attributes: ["fee"]
    })
    const amount =await bookingFee.fee;


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
        booking_status:3
      },
    });

    if (!existingTimeslot) {
      return handleResponse({
        res,
        message: "Slot not found on this date",
        statusCode: 404,
      });
    }

    if (doctorProfile.status === 0) {
      return handleResponse({
        res,
        message: "Doctor not available",
        statusCode: 404,
      });
    }

    if (getEntity.status === 0) {
      return handleResponse({
        res,
        message: "Clinic is closed.",
        statusCode: 404,
      });
    }

    if (customerPhone.length !== 10) {
      return handleResponse({
        res,
        message: "Invalid Phone No.",
        statusCode: 403,
      });
    }

    if (!existingTimeslot) {
      return handleResponse({
        res,
        message: "Slot not found on this date",
        statusCode: 404,
      });
    }
    if (existingTimeslot.booking_status === 1) {
      return handleResponse({
        res,
        message: "Slot already booked",
        statusCode: 400,
      });
    }

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
          // booking_status: 0,
          booking_status: 3,
        },
        {
          where: {
            time_slot: timeSlot,
            doctor_id: doctorId,
            date: appointmentDate,
            doctorEntityId: doctorEntityData.doctorEntityId,
          },
        }
      );
    }

    let orderIDFree;
    let data;
    let pg;
    if (amount === 0) {
      pg={
        id:null,
        name:"FREE"
      };
      orderIDFree = PgFunctions.createOrderId();
      data = {
        id: orderIDFree,
        payment_session_id: "pay@0000",
      };
    } else {
       pg = await paymentGatewayModel.findOne({
        where: {
          status: 1,
        },
        attributes: ["id", "name", "key1", "key2", "status"],
      });

      if (pg.id == 1) {
        data = await payment.createPaymentLink({
          name: customerName,
          phone: customerPhone,
          amount: amount,
        });
      } else if (pg.id == 2) {
        data = await payment.createCashfreeOrderData({
          name: customerName,
          phone: customerPhone,
          amount: amount,
        });
      }

    }


    if (data?.Error?.statusCode == 400)
      return handleResponse({
        res,
        statusCode: "400",
        message: "Something went wrong",
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
    }

    const customerData = {
      customerId: newCustomer.userId,
      entityId: entityId,
      departmentId: doctorProfile.department_id,
      bookingType: 1,
      amount,
      bookingDate: new Date(),
      appointmentDate,
      bookingStatus:3,
      // orderId: data?.id,
      orderId: data?.id,
      workSlotId: existingTimeslot.time_slot_id,
      patientName: customerName,
      bookedPhoneNo: customerPhone,
    };

    const newBooking = new bookingModel(customerData);
    const addedBooking = await newBooking.save();

    await paymentModel.create({
      bookingId: addedBooking.bookingId,
      orderId: data?.id,
      amount,
      paymentMethod: pg?.name,
      paymentStatus: 0,
    });
    return handleResponse({
      res,
      statusCode: "200",
      message: "Appointment booked successfully",
      data: {
        orderId: data?.id,
        amount: amount,
        bookingId: addedBooking.bookingId,
        payment_session_id: data?.payment_session_id,
        currentPg: pg.id,
      },
    });
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      message: "Error while booking appointment.",
      statusCode: 422,
    });
  }
};

const slotOnHold = async (req, res) => {
  const { encryptedPhone, appointmentDate, timeSlot, entityId } = req.body;
  const doctorPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);
  try {
    const docData = await doctorProfileModel.findOne({
      where: {
        doctor_phone: doctorPhone,
      },
    });
    if (!docData) {
      return handleResponse({
        res,
        message: "No doctor found !",
        statusCode: 404,
      });
    }
    const existingTimeslot = await weeklyTimeSlotsModel.findOne({
      where: {
        time_slot: timeSlot,
        doctor_id: docData.doctor_id,
        date: appointmentDate,
      },
    });

    if (!existingTimeslot) {
      return handleResponse({
        res,
        message: "Slot not found on this date",
        statusCode: 404,
      });
    }

    const doctorEntityData = await doctorEntityModel.findOne({
      where: {
        doctorId: docData.doctor_id,
        entityId,
      },
    });

    const [updatedRows] = await weeklyTimeSlotsModel.update(
      {
        booking_status: 3,
      },
      {
        where: {
          time_slot: timeSlot,
          doctor_id: docData.doctor_id,
          date: appointmentDate,
          doctorEntityId: doctorEntityData.doctorEntityId,
        },
      }
    );

    if (updatedRows > 0) {
      return handleResponse({
        res,
        statusCode: 200,
        message: "Slot on hold",
      });
    }
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      message: "Error while allocating slot.",
      statusCode: 422,
    });
  }
};

// const bookAppointment = async (req, res) => {
//     try {
//         const {
//             doctorId,
//             appointmentDate,
//             timeSlot,
//             customerName,
//             customerPhone,
//             amount,
//             paymentMethod,
//             entityId,
//         } = req.body;

//         if (customerPhone.length !== 10) {
//             return handleResponse({
//                 res,
//                 message: 'Invalid Phone No.',
//                 statusCode: 403,
//             });
//         };

//         const [ doctorProfile, getEntity, existingTimeslot, doctorEntityData ] = await Promise.all([

//             doctorProfileModel.findOne({ where: { doctor_id: doctorId } }),
//             entityModel.findOne({ where: { entity_id: entityId } }),
//             weeklyTimeSlotsModel.findOne({
//                 where: {
//                     time_slot: timeSlot,
//                     doctor_id: doctorId,
//                     date: appointmentDate,
//                 },
//             }),

//             doctorEntityModel.findOne({
//                 where: {
//                     doctorId: doctorId,
//                     entityId,
//                 },
//             }),
//         ]);

//         if (!existingTimeslot) {
//             return handleResponse({
//                 res,
//                 message: 'Slot not found on this date',
//                 statusCode: 404,
//             });
//         };

//         if (doctorProfile.status === 0) {
//             return handleResponse({
//                 res,
//                 message: 'Doctor not available',
//                 statusCode: 404,
//             });
//         };

//         if (getEntity.status === 0) {
//             return handleResponse({
//                 res,
//                 message: 'Clinic is closed.',
//                 statusCode: 404,
//             });
//         };

//         if (existingTimeslot.booking_status === 1) {
//             return handleResponse({
//                 res,
//                 message: 'Slot already booked',
//                 statusCode: 400,
//             });
//         };

//         await weeklyTimeSlotsModel.update(
//             { booking_status: 0 },
//             {
//                 where: {
//                     time_slot: timeSlot,
//                     doctor_id: doctorId,
//                     date: appointmentDate,
//                     doctorEntityId: doctorEntityData?.doctorEntityId,
//                 },
//             }
//         );

//         const data = await payment.createPaymentLink({
//             name: customerName,
//             phone: customerPhone,
//             amount: 1000,
//         });

//         if (data?.Error?.statusCode === 400) {
//             return handleResponse({
//                 res,
//                 statusCode: 400,
//                 message: 'Something went wrong in payment',
//                 data: { message: data?.Error?.error?.description },
//             });
//         };

//         let newCustomer = await userModel.findOne({ where: { phone: customerPhone } });
//         const capitalizedUserName = customerName.charAt(0).toUpperCase() + customerName.slice(1);

//         if (!newCustomer) {
//             newCustomer = await userModel.create({
//                 uuid: await generateUuid(),
//                 userType: 1,
//                 name: capitalizedUserName,
//                 phone: customerPhone,
//             });
//         };

//         const customerData = {
//             customerId: newCustomer.userId,
//             entityId,
//             departmentId: doctorProfile.department_id,
//             bookingType: 1,
//             amount,
//             bookingDate: new Date(),
//             appointmentDate,
//             orderId: data?.id,
//             workSlotId: existingTimeslot.time_slot_id,
//             patientName: customerName,
//             bookedPhoneNo: customerPhone,
//         };

//         const newBooking = await bookingModel.create(customerData);

//         const paymentCreated = await paymentModel.create({
//             bookingId: newBooking.bookingId,
//             orderId: data?.id,
//             amount,
//         });

//         // calculateAndSavePaymentSplit(amount, paymentCreated.paymentId, doctorId, entityId);

//         return handleResponse({
//             res,
//             statusCode: 200,
//             message: 'Appointment booked successfully',
//             data: {
//                 orderId: data?.id,
//                 amount: 1000,
//                 bookingId: newBooking.bookingId,
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         return handleResponse({
//             res,
//             message: 'Error while booking appointment.',
//             statusCode: 422,
//         });
//     };
// };

// const calculateAndSavePaymentSplit = async (amountPaidByCustomer, paymentId, doctorId, entityId) => {

//     const [ getDoctor, getClinic ] = await Promise.all([
//         doctorModel.findOne({ where: { doctor_id: doctorId }, attributes: ['gstNo'] }),
//         entityModel.findOne({ where: { entity_id: entityId }, attributes: ['gstNo'] }),
//     ]);

//     const clinicHasGst = getClinic.gstNo? true: false;
//     const doctorHasGst = getDoctor.gstNo? true: false;
//     const clinicGstPercentage = 18;
//     const doctorGstPercentage = 9;
//     const appServiceGstPercentage = 18;
//     const appServiceChargeWithoutGst = 10;
//     const doctorFees = amountPaidByCustomer - appServiceChargeWithoutGst

//     const clinicGstAmount = clinicHasGst ? amountPaidByCustomer * (clinicGstPercentage / 100) : 0;
//     const doctorGstAmount = doctorHasGst ? doctorFees * (doctorGstPercentage / 100) : 0;
//     const appServiceGstAmount = amountPaidByCustomer * (appServiceGstPercentage / 100);

//     const doctorFee = amount - appServiceCharge;

//     const paymentSplitData = {
//         doctorFee,
//         appServiceCharge,
//         totalAmount: amount,
//         paymentId
//     };

//     const paymentSplitRecord = await paymentSplitModel.create(paymentSplitData);

//     return paymentSplitRecord;
// };

const listBooking = async ({ doctorId, date, entityId }, res) => {
  try {
    let whereBookingCond = {};

    if (entityId) {
      whereBookingCond = { entityId: entityId };
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      attributes: ["doctor_id", "doctor_phone", "doctor_name"],
    });

    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: "404",
        message: "Doctor ID not found",
        data: {},
      });
    }

    const [totalAppointments, getEntities, bookingList] = await Promise.all([
      weeklyTimeSlotsModel.count({
        where: {
          doctor_id: doctorId,
          date: date,
          // bookingStatus: 0,
        },
      }),

      getEntityDetailsOfTheDr(getDoctor.doctor_phone),

      bookingModel.findAll({
        attributes: [
          "bookingStatus",
          "bookingId",
          "customerId",
          "patientName",
          "bookedPhoneNo",
        ],
        include: [
          {
            model: userModel,
            attributes: ["name", "phone"],
          },
        ],
        where: {
          [Op.and]: [
            { bookingStatus: { [Op.ne]: 4 } },
            { bookingStatus: { [Op.not]: 3 } },
            { ...whereBookingCond },
          ],
        },
        include: [
          {
            model: weeklyTimeSlotsModel,
            attributes: ["time_slot"],
            where: {
              doctor_id: doctorId,
              date: date,
            },
          },
        ],
      }),
    ]);

    if (bookingList.length === 0) {
      return handleResponse({
        res,
        statusCode: 200,
        message: "No appointments found.",
        data: {
          appointmentList: [],
          totalAppointments: 0,
          completedAppointments: 0,
          pendingAppointments: 0,
          appointmentDate: date,
          doctorName: getDoctor.doctor_name || "",
          entityDetails: getEntities,
        },
      });
    }

    const appointmentList = bookingList.map((booking) => ({
      bookingId: booking.bookingId,
      timeSlot: booking.weeklyTimeSlot.time_slot,
      customerName: booking.patientName ? booking.patientName : "",
      customerPhone: booking.bookedPhoneNo ? booking.bookedPhoneNo : "",
      bookingStatus: booking.bookingStatus,
    }));
    console.log("APP==>", appointmentList);

    const completedAppointments = appointmentList.filter(
      (appointment) => appointment.bookingStatus === 1
    ).length;
    let totalBooking = bookingList.length;
    const pendingAppointments = totalBooking - completedAppointments;

    return handleResponse({
      res,
      statusCode: 200,
      message: "Appointment listing fetched successfully",
      data: {
        appointmentList,
        totalBooking,
        completedAppointments,
        pendingAppointments,
        appointmentDate: date,
        doctorName: getDoctor.doctor_name || "",
        entityDetails: getEntities,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Internal server error",
      data: {},
    });
  }
};

const listBooking_admin = async (
  { doctorId, date, entityId, searchQuery },
  params,
  res
) => {
  try {
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.limit) || 10;
    const offset = (page - 1) * pageSize;

    let whereBookingCond = {};

    if (entityId) {
      whereBookingCond = { entityId: entityId };
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      attributes: ["doctor_id", "doctor_name", "doctor_phone"],
    });

    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: "404",
        message: "Doctor ID not found",
        data: {},
      });
    }

    let searchCondition = {};
    if (searchQuery) {
      searchCondition = {
        [Op.or]: [
          { patientName: { [Op.like]: `%${searchQuery}%` } },
          { bookedPhoneNo: { [Op.like]: `%${searchQuery}%` } },
        ],
      };
    }

    const totalCount = await bookingModel.count({
      where: {
        bookingStatus: 0,
        ...whereBookingCond,
        ...searchCondition,
      },
      include: [
        {
          model: weeklyTimeSlotsModel,
          where: {
            doctor_id: doctorId,
            date: date,
          },
        },
      ],
    });

    const totalPages = Math.ceil(totalCount / pageSize);

    const [totalAppointments, getEntities, bookingList] = await Promise.all([
      weeklyTimeSlotsModel.count({
        where: {
          doctor_id: doctorId,
          date: date,
        },
      }),

      getEntityDetailsOfTheDr(getDoctor.doctor_phone),

      bookingModel.findAll({
        attributes: [
          "bookingStatus",
          "bookingId",
          "customerId",
          "patientName",
          "bookedPhoneNo",
        ],
        include: [
          {
            model: userModel,
            attributes: ["name", "phone"],
          },
        ],
        where: {
          bookingStatus: 0,
          ...whereBookingCond,
          ...searchCondition,
        },
        include: [
          {
            model: weeklyTimeSlotsModel,
            attributes: ["time_slot"],
            where: {
              doctor_id: doctorId,
              date: date,
            },
          },
        ],
        limit: pageSize,
        offset: offset,
      }),
    ]);

    console.log("BookingList==>", bookingList);

    if (bookingList.length === 0) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "No appointments found.",
      });
    }

    const appointmentList = bookingList.map((booking) => ({
      bookingId: booking.bookingId,
      timeSlot: booking.weeklyTimeSlot.time_slot,
      customerName: booking.patientName ? booking.patientName : "",
      customerPhone: booking.bookedPhoneNo ? booking.bookedPhoneNo : "",
      bookingStatus: booking.bookingStatus,
    }));

    const completedAppointments = appointmentList.filter(
      (appointment) => appointment.bookingStatus === 1
    ).length;
    const pendingAppointments = totalAppointments - completedAppointments;

    return handleResponse({
      res,
      statusCode: 200,
      message: "Appointment listing fetched successfully",
      data: {
        appointmentList,
        // totalAppointments,
        // completedAppointments,
        // pendingAppointments,
        appointmentDate: date,
        doctorName: getDoctor.doctor_name || "",
        // entityDetails: getEntities,
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Internal server error",
      data: {},
    });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    // console.log("DOC=>", doctorId);
    const whereCondition = {
      appointmentDate: { [Op.eq]: new Date(date) },
      bookingStatus: { [Op.ne]: 3 },
    };

    const weeklyTimeSlotData = await weeklyTimeSlotsModel.findAll({
      where: {
        date: date,
        doctor_id: doctorId,
      },
    });
    const workSlotIds = weeklyTimeSlotData.map((slot) => slot.time_slot_id);

    // const bookingList = await bookingModel.findAll({
    //     where: whereCondition,
    //     attributes: ['orderId', 'amount', 'bookingStatus', 'workSlotId'
    //                 'customerId', 'patientName', 'bookedPhoneNo'], // Include customerId for later use
    // });

    const bookingList = await bookingModel.findAll({
      where: {
        ...whereCondition,
        workSlotId: { [Op.in]: workSlotIds },
      },
      attributes: [
        "orderId",
        "amount",
        "bookingStatus",
        "workSlotId",
        "customerId",
        "patientName",
        "bookedPhoneNo",
      ],
    });
    // console.log("BL=>>", bookingList);

    const customerIds = bookingList.map((booking) => booking.customerId);
    const userRecords = await userModel.findAll({
      where: {
        userId: {
          [Op.in]: customerIds,
        },
      },
      attributes: ["userId", "name"],
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
        customerName: booking.patientName
          ? booking.patientName
          : customerNameMap[booking.customerId],
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
      message: "Successfully fetched booking report.",
      data: { bookingReport },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const generateBookingLink = async (userData, res) => {
  const { encryptPh, entity_id } = userData;

  // Encode the parameters
  const encodedId = encodeURIComponent(encryptPh);
  const encodedEntity = encodeURIComponent(entity_id);
  try {
    const link = `https://booking.chillarpayments.com/#/doctor?id=${encodedId}&entity=${encodedEntity}`;

    return handleResponse({
      res,
      statusCode: 200,
      message: "Successfully fetched booking link.",
      data: link,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const bookingConfirmationData = async (bookingData, res) => {
  try {
    let { bookingId } = bookingData;
    let response = await bookingModel.findOne({ where: { bookingId } });
    let paymentData = await paymentModel.findOne({ where: { bookingId } });

    console.log({ response });
    const weeklyTimeSlot = await weeklyTimeSlotsModel.findOne({
      attributes: ["time_slot", "date", "doctor_id"],
      where: {
        time_slot_id: response.workSlotId,
      },
    });
    const doctorData = await doctorModel.findOne({
      where: { doctor_id: weeklyTimeSlot.doctor_id },
      attributes: ["doctor_name"],
    });
    let userData;
    let data, message, statusCode;
    let dataValues = response.toJSON();
    let userId = dataValues.customerId;
    userData = await userModel.findOne({
      where: { userId },
    });
    if (response) {
      data = dataValues;
      (message = "Successfully fetched booking details."), (statusCode = 200);
    } else {
      (message = "Sorry no data found for this bookingId."), (statusCode = 404);
    }
    return handleResponse({
      res,
      message,
      statusCode,
      data: {
        doctorName: doctorData?.doctor_name,
        // customerName: userData?.name,
        // customerPhone: userData.phone,
        customerName: response.patientName
          ? response.patientName
          : userData?.name,
        bookedPhoneNo: response.bookedPhoneNo
          ? response.bookedPhoneNo
          : userData.phone,
        appointmentTimeSlot: weeklyTimeSlot.time_slot,
        appointmentDate: weeklyTimeSlot.date,
        paymentDate: data.updatedAt,
        // paymentID: data.transactionId,
        paymentID: paymentData ? paymentData.transactionId : "",
      },
    });
  } catch (error) {
    console.log({ "Error while fetching booking details": error });
    return handleResponse({
      res,
      message: "Error while fetching booking details",
      statusCode: 422,
    });
  }
};

const updateBookingStatus = async (userData, req, res) => {
  try {
    let { bookingId } = req.body;
    let { userType } = req.user;

    let updateData = await bookingModel.update(
      {
        bookingStatus: 1,
        statusUpdatedBy: userType ? userType : "",
        updatedAt: new Date(),
      },
      {
        where: {
          bookingId,
        },
      }
    );

    return handleResponse({
      res,
      message: "Sucessfully updated booking status to completed",
      statusCode: 200,
    });
  } catch (err) {
    console.log({ "Error while updating booking": err });
    return handleResponse({
      res,
      message: "Error while updating booking status",
      statusCode: 422,
    });
  }
};

const cancelBookingFromDoctor = async (userType, req, res) => {
  try {
    let { bookingIds } = req;

    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return handleResponse({
        res,
        message: "Booking IDs should be a non-empty array.",
        statusCode: 400,
      });
    }

    const results = await Promise.all(
      bookingIds.map(async (bookingId) => {
        const bookingData = await bookingModel.findOne({
          where: {
            bookingId: bookingId,
            bookingStatus: 0,
          },
        });
        // console.log("BOOKINGDATA =>>", bookingData);

        if (!bookingData) {
          return { bookingId, status: "Booking not found" };
        }

        try {
          if (bookingData != null) {
            const [updateCount] = await bookingModel.update(
              {
                bookingStatus: 4,
                statusUpdatedBy: userType ? userType : "",
                updatedAt: new Date(),
              },
              {
                where: {
                  bookingId,
                  bookingStatus: 0,
                },
              }
            );

            if (updateCount > 0) {
              return { bookingId, status: "Booking cancelled" };
            } else {
              return { bookingId, status: "Update failed" };
            }
          }
        } catch (updateError) {
          console.error("Update error:", updateError);
          return {
            bookingId,
            status: "Update error",
            error: updateError.message,
          };
        }
      })
    );

    const notFoundBookings = results.filter(
      (result) => result.status === "Booking not found"
    );
    const failedUpdates = results.filter(
      (result) => result.status === "Update failed"
    );
    const successfulCancellations = results.filter(
      (result) => result.status === "Booking cancelled"
    );
    let message = "";
    if (successfulCancellations.length > 0) {
      message += `${successfulCancellations.length} bookings cancelled successfully.`;
    }

    if (notFoundBookings.length > 0) {
      message += ` ${notFoundBookings.length
        } bookings not found: ${notFoundBookings
          .map((b) => b.bookingId)
          .join(", ")}.`;
    }
    if (failedUpdates.length > 0) {
      message += ` ${failedUpdates.length
        } bookings failed to update: ${failedUpdates
          .map((b) => b.bookingId)
          .join(", ")}.`;
    }

    return handleResponse({
      res,
      message,
      statusCode: 200,
    });
  } catch (err) {
    console.log({ "Error while cancelling booking": err });
    return handleResponse({
      res,
      message: "Error while cancelling booking",
      statusCode: 422,
    });
  }
};

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
  listBooking_admin,
  cancelBookingFromDoctor,
  generateBookingLink,
  slotOnHold,
};
