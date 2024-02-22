import bookingModel from "../../../../models/bookingModel.js";
import paymentModel from "../../../../models/paymentModel.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";
import { handleResponse } from "../../../../utils/handlers.js";

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

const paymentUpdate = async (bookingData, res) => {
  try {
    console.log({ bookingData });
    let { paymentId, orderId } = bookingData;
    await bookingModel.update(
      {
        // paymentStatus: 1,
        bookingStatus: 0,
        updatedAt: new Date(),
        // transactionId: paymentId,
      },
      {
        where: {
          orderId,
        },
      }
    );
    const timeSlot = await bookingModel.findOne({
      attributes: ["workSlotId"],
      where: { orderId },
    });

    await weeklyTimeSlotsModel.update(
      { booking_status: 1 },
      { where: { time_slot_id: timeSlot.workSlotId } }
    );
    await paymentModel.update(
      {
        paymentStatus: 1,
        transactionId: paymentId,
      },
      { where: { orderId } }
    );
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

const transactionHistory = async (req, res) => {
  try {
    let transaction = await bookingModel.findAll({
      where: {
        bookingStatus: {
          [Op.in]: [0, 1],
        },
        include: [
          {
            model: paymentModel,
            attributes: ["orderId", "transactionId"],
            where: {
              paymentStatus: 0,
            },
          },
        ],
        attributes: [
          "customerId",
          "amount",
          "bookingId",
          "doctorId",
          "bookingStatus",
          "payment.orderId",
          "payment.transactionId",
        ],
      },
    });
    console.log({ transaction });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error in fetching transaction history.",
      statusCode: 500,
    });
  }
};

export default { paymentStatusCapture, paymentUpdate, transactionHistory };
