import bookingModel from "../../../../models/bookingModel.js";
import paymentModel from "../../../../models/paymentModel.js";
import userModel from "../../../../models/userModel.js";
import doctorModel from "../../../../models/doctorModel.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";
import { handleResponse } from "../../../../utils/handlers.js";
import { Op, Sequelize, where } from "sequelize";
import admin from "firebase-admin";
import serviceAccount from "../../../../utils/chillarprototype-firebase-adminsdk-7wsnl-aff859ec9b.json" assert { type: "json" };
import tokenModel from "../../../../models/tokenModel.js";
import paymentGatewayModel from "../../../../models/paymentGatewayModel.js";
import Razorpay from "razorpay";
import pgFn from "../../../../utils/pg.js";
import axios from "axios";
import smsHandler from "../../../../utils/smsHandler.js";
import logModel from "../../../../models/logModel.js";

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
      // weeklyTimeSlotsModel.update(
      //   // { booking_status: 0 },
      //   { booking_status: 1 },
      //   { where: { time_slot_id: timeSlot.workSlotId } }
      // ),
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
      attributes: ["bookingId", "workSlotId"],
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

    // const [timeslotUpdate] = await weeklyTimeSlotsModel.update(
    //   { booking_status: 0 },
    //   { where: { time_slot_id: bookingDetails.workSlotId } }
    // );

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

const getPgReport = async (requestData, res) => {
  try {
    const { startDate, endDate, pg } = requestData;
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;

    let report = [];

    if (pg == 1) {
      report = await pgFn.getPgReportOfRazorpay(startDate, endDate);
    } else if (pg == 2) {
      report = await pgFn.getPgReportOfCashfree(startDate, endDate);
    }

    // console.log({report});

    // Search functionality
    const filteredItems = searchQuery
      ? report
          .filter((item) =>
            Object.values(item).some((value) =>
              value
                ? value
                    .toString()
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                : false
            )
          )
          .map((item, index) => ({
            slNo: index + 1,
            ...item,
          }))
      : report.map((item, index) => ({
          slNo: index + 1,
          ...item,
        }));

    // Pagination functionality
    const totalCount = filteredItems?.length;

    const paginatedReport = filteredItems?.slice(offset, offset + pageSize);
    const totalPages = Math.ceil(totalCount / pageSize);

    if (paginatedReport?.length !== 0) {
      return handleResponse({
        res,
        message: "Successfully fetched Pg Report",
        statusCode: 200,
        data: {
          report: paginatedReport,
          totalCount,
          totalPages,
          currentPage: page,
        },
      });
    } else {
      return handleResponse({
        res,
        message: "No data found",
        statusCode: 200,
        data: {
          report: [],
          totalCount,
          totalPages,
          currentPage: page,
        },
      });
    }
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Something went wrong !",
      statusCode: 500,
    });
  }
};

const paymentVerify = async (body, res) => {
  const { orderId } = body;
  try {
    const options = {
      method: "GET",
      url: `${process.env.ORDER_URL}/${orderId}`,
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP,
        "x-client-secret": process.env.CASHFREE_SECRET,
      },
    };

    // Await the axios request
    const response = await axios.request(options);
    const data = response.data;

    if (data.order_status === "PAID") {
      // Await the bookingModel query
      let bookingData = await bookingModel.findOne({
        where: { orderId },
        include: [
          {
            model: weeklyTimeSlotsModel,
            attributes: ["doctor_id", "time_slot"],
            include: [
              {
                model: doctorModel,
                attributes: ["doctor_name"],
              },
            ],
          },
        ],
      });

      if (bookingData && bookingData.weeklyTimeSlot) {
        let weeklyTimeSlot = bookingData.weeklyTimeSlot;
        let doctor = weeklyTimeSlot.doctor;
        let docName = doctor?.doctor_name.replace(/Dr\s+/, "");
        docName = await docName?.split(" ")[0];
        const formatDate = (dateString) => {
          const date = new Date(dateString);

          const day = String(date.getUTCDate()).padStart(2, "0");
          const month = String(date.getUTCMonth() + 1).padStart(2, "0");
          const year = date.getUTCFullYear();

          // Format the date as "dd-mm-yyyy"
          return `${day}-${month}-${year}`;
        };
        const dateOfBooking = formatDate(bookingData.appointmentDate);
        const content = `Your appointment with Dr. ${docName} on ${dateOfBooking} at ${bookingData.appointmentDate} has been confirmed. Thank you. Chillar`;
        // const phone = bookingData.bookedPhoneNo;
        const phone = 8606500638;
        const templateId = "1607100000000323224";
        const smsRes = await smsHandler.sendSms(content, phone, templateId);

        if (smsRes) {
          return handleResponse({
            res,
            message: "verify status",
            statusCode: 200,
            data,
          });
        } else {
          return handleResponse({
            res,
            message: "Sms failed but payment verified",
            statusCode: 200,
            data,
          });
        }
      }
    }
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error verifying payment",
      statusCode: 500,
    });
  }
};

const verifySuccessPaymentWebhook = async (body, res) => {
  try {
    const logAdded = await logModel.create({
      apiEndpoint: "/payment-success-webhook",
      requestMethod: "POST",
      requestData: body,
      responseStatus: 200,
    });

    const { order, payment } = body.data;
    const { order_id } = order;
    const { cf_payment_id, payment_status } = payment;

    if (payment_status === "SUCCESS") {
      const paymentId = cf_payment_id;
      const orderId = order_id;

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

      // if (timeSlot) {
      //   await weeklyTimeSlotsModel.update(
      //     { booking_status: 1 },
      //     { where: { time_slot_id: timeSlot.workSlotId } }
      //   );
      // } else {
      //   throw new Error("Time slot not found for the given orderId.");
      // }

      // let bookingData = await bookingModel.findOne({
      //   where: { orderId },
      //   include: [
      //     {
      //       model: weeklyTimeSlotsModel,
      //       attributes: ["doctor_id", "date", "time_slot"],
      //       include: [
      //         {
      //           model: doctorModel,
      //           attributes: ["doctor_name"],
      //         },
      //       ],
      //     },
      //   ],
      // });

      await logModel.update(
        {
          apiEndpoint: "/payment-success-webhook",
          requestMethod: "POST",
          responseStatus: 200,
          responseData: { message: "Webhook success", phone },
        },
        {
          where: {
            logId: logAdded?.logId,
          },
        }
      );

      if (updatePayment) {
        return handleResponse({
          res,
          message: "Payment verified",
          statusCode: 200,
        });
      } else {
        console.log("Payment update failed in payment success webhook");
        await logModel.update(
          {
            apiEndpoint: "/payment-success-webhook",
            requestMethod: "POST",
            responseStatus: 400,
            responseData: { message: "Payment update failed", phone },
          },
          {
            where: {
              logId: logAdded?.logId,
            },
          }
        );
      }

      if (updateBooking) {
        return handleResponse({
          res,
          message: "Payment verified",
          statusCode: 200,
        });
      } else {
        console.log("Booking update failed in payment success webhook");
        await logModel.update(
          {
            apiEndpoint: "/payment-success-webhook",
            requestMethod: "POST",
            responseStatus: 400,
            responseData: { message: "Booking update failed", phone },
          },
          {
            where: {
              logId: logAdded?.logId,
            },
          }
        );
      }

      // if (bookingData && bookingData.weeklyTimeSlot) {
      // let weeklyTimeSlot = bookingData.weeklyTimeSlot;
      // let doctor = weeklyTimeSlot.doctor;
      // let docName = doctor?.doctor_name.replace(/Dr\s+/, "");
      // docName = await docName?.split(" ")[0];
      // const formatDate = (dateString) => {
      //   const date = new Date(dateString);

      //   const day = String(date.getUTCDate()).padStart(2, "0");
      //   const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      //   const year = date.getUTCFullYear();

      //   // Format the date as "dd-mm-yyyy"
      //   return `${day}-${month}-${year}`;
      // };
      // const dateOfBooking = formatDate(weeklyTimeSlot.date);
      // const content = `Your appointment with Dr. ${docName} on ${dateOfBooking} at ${weeklyTimeSlot.time_slot} has been confirmed. Thank you. Chillar`;
      // const phone = bookingData.bookedPhoneNo;

      // const smsRes = await smsHandler.sendSms(content, phone);

      // }
    } else {
      return handleResponse({
        res,
        message: "Payment failed",
        statusCode: 200,
      });
    }
  } catch (error) {
    console.log({ error });

    await logModel.update(
      {
        apiEndpoint: "/payment-success-webhook",
        requestMethod: "POST",
        responseStatus: 500,
        errorMessage: error.message,
      },
      {
        where: {
          logId: logAdded?.logId,
        },
      }
    );

    return handleResponse({
      res,
      message: "Webhook error",
      statusCode: 500,
    });
  }
};

const verifyFailPaymentWebhook = async (body, res) => {
  const { order, payment } = body.data;
  const { order_id } = order;
  const { cf_payment_id, payment_status } = payment;

  try {
    await logModel.create({
      apiEndpoint: "/payment-fail-webhook",
      requestMethod: "POST",
      requestData: body,
      responseStatus: 200,
    });

    if (payment_status === "FAILED") {
      const paymentId = cf_payment_id;
      const orderId = order_id;

      const bookingDetails = await bookingModel.findOne({
        attributes: ["bookingId", "workSlotId"],
        where: { orderId: orderId },
      });

      const [bookingUpdate] = await bookingModel.update(
        { bookingStatus: 2 },
        { where: { orderId: orderId } }
      );

      const [paymentUpdate] = await paymentModel.update(
        { paymentStatus: 2, transactionId: paymentId },
        { where: { orderId: orderId } }
      );

      // const [timeslotUpdate] = await weeklyTimeSlotsModel.update(
      //   { booking_status: 0 },
      //   { where: { time_slot_id: bookingDetails.workSlotId } }
      // );

      return handleResponse({
        res,
        message: "Payment failed",
        statusCode: 200,
      });
    } else {
      return handleResponse({
        res,
        message: "Payment success",
        statusCode: 200,
      });
    }
  } catch (error) {
    console.log({ error });
    await logModel.create({
      apiEndpoint: "/payment-fail-webhook",
      requestMethod: "POST",
      responseStatus: 500,
      errorMessage: error.message,
    });
    return handleResponse({
      res,
      message: "Webhook error",
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
  getPgReport,
  paymentVerify,
  verifySuccessPaymentWebhook,
  verifyFailPaymentWebhook,
};
