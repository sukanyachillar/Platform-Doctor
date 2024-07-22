import bookingModel from "../../../../models/bookingModel.js";
import paymentModel from "../../../../models/paymentModel.js";
import userModel from "../../../../models/userModel.js";
import doctorModel from "../../../../models/doctorModel.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";
import { handleResponse } from "../../../../utils/handlers.js";
import { Op, Sequelize } from "sequelize";
import admin from "firebase-admin";
import serviceAccount from "../../../../utils/chillarprototype-firebase-adminsdk-7wsnl-aff859ec9b.json" assert { type: "json" };
import tokenModel from "../../../../models/tokenModel.js";
import paymentGatewayModel from "../../../../models/paymentGatewayModel.js";

const paymentStatusCapture = async (req, res) => {
  try {
    console.log("webhook", req.body);
    console.log({ order: req.body?.payload?.order });
    console.log({ payment: req.body?.payload?.payment });
    if (req.body?.payload?.order) {
      if (req.body?.payload?.order?.entity?.status == "paid") {
        await bookingModel.update(
          {
            // paymentStatus: 1,
            bookingStatus: 0,
            updatedAt: new Date(),
            // transactionId: req.body?.payload?.payment?.entity?.id,
          },
          {
            where: {
              orderId: req.body?.payload?.order?.entity?.id,
            },
          }
        );
        const timeSlot = await bookingModel.findOne({
          attributes: ["workSlotId"],
          where: { orderId: req.body?.payload?.order?.entity?.id },
        });
        await weeklyTimeSlotsModel.update(
          { booking_status: 1 },
          { where: { time_slot_id: timeSlot.workSlotId } }
        );
        await paymentModel.update(
          {
            paymentStatus: 1,
            transactionId: req.body?.payload?.payment?.entity?.id,
          },
          { where: { orderId: req.body?.payload?.order?.entity?.id } }
        );
      }
    }

    return true;
  } catch (error) {
    console.log({ error });
  }
};

// const paymentUpdate = async (bookingData, res) => {
//     try {
//         console.log({ bookingData })
//         let { paymentId, orderId } = bookingData;
//         await bookingModel.update(
//             {
//                 // paymentStatus: 1,
//                 bookingStatus: 0,
//                 updatedAt: new Date(),
//                 // transactionId: paymentId,
//             },
//             {
//                 where: {
//                     orderId,
//                 },
//             },
//         );

//         const timeSlot = await bookingModel.findOne({
//             attributes: ['workSlotId', 'entityId'],
//             where: { orderId },
//         });
//         let registration_id = await tokenModel.findAll({
//             where: { userId: timeSlot.entityId },
//             attributes: ['token'],
//         });

//         const registration_ids = registration_id.map((token) => token.token)
//         console.log({ registration_ids: registration_ids })

//         await weeklyTimeSlotsModel.update(
//             { booking_status: 1 },
//             { where: { time_slot_id: timeSlot.workSlotId } }
//         );

//         await paymentModel.update(
//             {
//                 paymentStatus: 1,
//                 transactionId: paymentId,
//             },
//             { where: { orderId } },
//         );
//         let timeData = await weeklyTimeSlotsModel.findOne({
//             where: { time_slot_id: timeSlot.workSlotId },
//         });
//         // admin.initializeApp({
//         //     credential: admin.credential.cert(serviceAccount),
//         // })

//         // const messaging = admin.messaging()

//         // const message = {
//         //     notification: {
//         //         title: 'Appointment Booking',
//         //         body: `You have got an booking on ${timeData.date} at ${timeData.time_slot}`,
//         //     },
//         //     tokens: registration_ids,
//         // }

//         // messaging
//         //    // .send(message)
//         //    .sendEachForMulticast(message)
//         //     .then((response) => {
//         //         console.log('Successfully sent message:', response)
//         //     })
//         //     .catch((error) => {
//         //         console.log('Error sending message:', error)
//         //     })

//         if (!admin.apps.length) {
//             // Initialize the Firebase app
//             admin.initializeApp({
//                 credential: admin.credential.cert(serviceAccount),
//             });
//         };
//         const messaging = admin.messaging();

//         const message = {
//             notification: {
//                 title: 'Appointment Booking',
//                 body: `You have got a booking on ${timeData.date} at ${timeData.time_slot}`,
//             },
//             tokens: registration_ids,
//         };

//         // Wrap the notification sending logic in a try-catch block
//         try {
//             await messaging.sendEachForMulticast(message)
//             console.log('Successfully sent message')
//         } catch (notificationError) {
//             console.log('Error sending notification:', notificationError)
//             // Handle the notification error as needed, without affecting the overall process
//         };

//         return handleResponse({
//             res,
//             message: 'Successfully updated with status',
//             statusCode: 200,
//         });
//     } catch (error) {
//         console.log({ error })
//         return handleResponse({
//             res,
//             message: 'Unable to update status.',
//             statusCode: 404,
//         });
//     };
// };

const paymentUpdate = async (bookingData, res) => {
  try {
    const { paymentId, orderId } = bookingData;

    const [updateBooking, timeSlot, updatePayment] = await Promise.all([
      bookingModel.update(
        {
          bookingStatus: 0,
          updatedAt: new Date(),
        },
        { where: { orderId } }
      ),
      bookingModel.findOne({
        attributes: ["workSlotId", "entityId"],
        where: { orderId },
      }),
      paymentModel.update(
        {
          paymentStatus: 1,
          transactionId: paymentId,
        },
        { where: { orderId } }
      ),
    ]);
    console.log("TTT=>", timeSlot);

    const [registrationIds, updateTimeSlot] = await Promise.all([
      tokenModel.findAll({
        where: { userId: timeSlot.entityId },
        attributes: ["token"],
      }),
      weeklyTimeSlotsModel.update(
        // { booking_status: 0 },
        { booking_status: 1 },
        { where: { time_slot_id: timeSlot.workSlotId } }
      ),
    ]);

    const registration_tokens = registrationIds.map((token) => token.token);
    console.log({ registration_ids: registration_tokens });

    // Fetch time data for the notification
    const timeData = await weeklyTimeSlotsModel.findOne({
      where: { time_slot_id: timeSlot.workSlotId },
    });

    if (!timeData) {
      return handleResponse({
        res,
        message: "Time data not found.",
        statusCode: 404,
      });
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    const messaging = admin.messaging();

    const message = {
      notification: {
        title: "Appointment Booking",
        body: `You have got a booking on ${timeData.date} at ${timeData.time_slot}`,
      },
      tokens: registration_tokens,
    };

    try {
      await messaging.sendEachForMulticast(message);
      console.log("Successfully sent message");
    } catch (notificationError) {
      console.log("Error sending notification:", notificationError);
      // Log the notification error and continue
    }

    return handleResponse({
      res,
      message: "Successfully updated with status",
      statusCode: 200,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Unable to update status.",
      statusCode: 404,
    });
  }
};

const paymentFailUpdate = async (bookingData, res) => {
  try {
    const { orderId, paymentId } = bookingData;

    const bookingDetails = await bookingModel.findOne({
      attributes: ['bookingId', 'workSlotId'],
      where: { orderId: orderId },
    });

    if (!bookingDetails) {
      return handleResponse({
        res,
        message: "No bookings found !",
        statusCode: 404,
      });
    }
    const [bookingUpdate] = await bookingModel.update(
      { bookingStatus: 2 },
      { where: { orderId: orderId } }
    );

    if (!bookingUpdate > 0) {
      return handleResponse({
        res,
        message: "Unable to update Booking status !",
        statusCode: 404,
      });
    }

    const [paymentUpdate] = await paymentModel.update(
      { paymentStatus: 2, transactionId: paymentId },
      { where: { orderId: orderId } }
    );

    if (!paymentUpdate > 0) {
      return handleResponse({
        res,
        message: "Unable to update Payment status !",
        statusCode: 404,
      });
    }

    const [timeslotUpdate] = await weeklyTimeSlotsModel.update(
      { booking_status: 0 },
      { where: { time_slot_id: bookingDetails.workSlotId } }
    );

    if (!timeslotUpdate > 0) {
      return handleResponse({
        res,
        message: "Unable to update time slot status !",
        statusCode: 404,
      });
    }
    return handleResponse({
      res,
      message: "Payment failed",
      statusCode: 200,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Unable to update payment failed status.",
      statusCode: 404,
    });
  }
};

const findPaymentGateway = async (bookingData, res) => {
  try {
    const pg = await paymentGatewayModel.findOne({
      where: {
        status: 1,
      },
      attributes: ["id", "name", "key1", "key2", "status"],
    });

    return handleResponse({
      res,
      message: "Successfully fetched pg status",
      statusCode: 200,
      data: {
        id: pg.id,
        name: pg.name,
        key1: pg.key1,
        key2: pg.key2,
        status: pg.status,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Unable to fetch pg status.",
      statusCode: 404,
    });
  }
};

const transactionHistory = async (requestData, res) => {
  try {
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;

    let { count, rows: transactions } = await bookingModel.findAndCountAll({
      where: {
        bookingStatus: {
          [Op.in]: [0, 1],
        },
      },
      include: [
        {
          model: paymentModel,
          attributes: ["orderId", "transactionId"],
          where: {
            paymentStatus: 1,
          },
        },
      ],
      attributes: [
        "customerId",
        "amount",
        "bookingId",
        "workSlotId",
        "bookingStatus",
        "appointmentDate",
        [Sequelize.literal("`payment`.`orderId`"), "paymentOrderId"],
        [
          Sequelize.literal("`payment`.`transactionId`"),
          "paymentTransactionId",
        ],
        [Sequelize.literal("`payment`.`updatedAt`"), "paymentDate"],
      ],
      limit: pageSize,
      offset: offset,
    });
    const totalPages = Math.ceil(count / pageSize); // Calculate total number of pages

    // Extract unique customerIds and workSlotIds
    const customerIds = new Set(
      transactions.map((transaction) => transaction.customerId)
    );
    const workSlotIds = new Set(
      transactions.map((transaction) => transaction.workSlotId)
    );

    // Fetch doctors corresponding to workSlotIds
    const doctorIds = await weeklyTimeSlotsModel.findAll({
      where: {
        time_slot_id: {
          [Op.in]: [...workSlotIds],
        },
      },
      attributes: ["doctor_id", "time_slot_id"],
    });

    // Create a map of workSlotIds to doctorIds
    const doctorIdMap = {};
    doctorIds.forEach((doctor) => {
      doctorIdMap[doctor.time_slot_id] = doctor.doctor_id;
    });

    // Fetch doctors corresponding to uniqueDoctorIds
    const doctors = await doctorModel.findAll({
      where: {
        doctor_id: {
          [Op.in]: Object.values(doctorIdMap),
        },
      },
      attributes: ["doctor_id", "doctor_name"],
    });

    // Create a map of doctorIds to doctor names
    const doctorNameMap = {};
    doctors.forEach((doctor) => {
      doctorNameMap[doctor.doctor_id] = doctor.doctor_name;
    });

    // Update transactions with doctorName, customerName, and customerPhone
    transactions = transactions.map((transaction) => ({
      ...transaction.toJSON(),
      doctorName: doctorNameMap[doctorIdMap[transaction.workSlotId]],
    }));

    // Fetch customer names and phone numbers
    const customers = await userModel.findAll({
      where: {
        userId: {
          [Op.in]: [...customerIds],
        },
      },
      attributes: ["userId", "name", "phone"],
    });

    // Create a map of customerIds to customer details
    const customerMap = {};
    customers.forEach((customer) => {
      customerMap[customer.userId] = {
        customerName: customer.name,
        customerPhone: customer.phone,
      };
    });

    // Update transactions with customerName and customerPhone
    transactions.forEach((transaction) => {
      const customerDetails = customerMap[transaction.customerId];
      transaction.customerName = customerDetails
        ? customerDetails.customerName
        : null;
      transaction.customerPhone = customerDetails
        ? customerDetails.customerPhone
        : null;
    });

    console.log(transactions);
    let message, data;

    if (!transactions) {
      message = "Sorry! no transaction history.";
    } else {
      message = "Successfully fetched transaction details.";
    }
    return handleResponse({
      res,
      statusCode: 200,
      message,
      data: {
        transactions,
        totalPages,
        currentPage: page,
        totalCount: count,
      },
    });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error in fetching transaction history.",
      statusCode: 500,
    });
  }
};

export default {
  paymentStatusCapture,
  paymentUpdate,
  transactionHistory,
  findPaymentGateway,
  paymentFailUpdate,
};
