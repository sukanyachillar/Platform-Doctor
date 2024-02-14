import bookingModel from '../../../../models/bookingModel.js'
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import { handleResponse } from '../../../../utils/handlers.js'

const paymentStatusCapture = async (req, res) => {
    try {
        console.log('webhook', req.body)
        console.log({ order: req.body?.payload?.order })
        console.log({ payment: req.body?.payload?.payment })
        if (req.body?.payload?.order) {
            if (req.body?.payload?.order?.entity?.status == 'paid') {
                await bookingModel.update(
                    {
                        paymentStatus: 1,
                        bookingStatus: 0,
                        updatedAt: new Date(),
                        transactionId: req.body?.payload?.payment?.entity?.id,
                    },
                    {
                        where: {
                            orderId: req.body?.payload?.order?.entity?.id,
                        },
                    }
                )
                const timeSlot = await bookingModel.findOne({
                    attributes: ['workSlotId'],
                    where: { orderId: req.body?.payload?.order?.entity?.id },
                })
                await weeklyTimeSlotsModel.update(
                    { booking_status: 1 },
                    { where: { time_slot_id: timeSlot.workSlotId } }
                )
            }
        }

        return true
    } catch (error) {
        console.log({ error })
    }
}

const paymentUpdate = async (bookingData, res) => {
    try {
        console.log({bookingData})
        let { paymentId, orderId } = bookingData
        await bookingModel.update(
            {
                paymentStatus: 1,
                bookingStatus: 0,
                updatedAt: new Date(),
                transactionId: paymentId,
            },
            {
                where: {
                    orderId,
                },
            }
        )
        const timeSlot = await bookingModel.findOne({
            attributes: ['workSlotId'],
            where: { orderId },
        })
        await weeklyTimeSlotsModel.update(
            { booking_status: 1 },
            { where: { time_slot_id: timeSlot.workSlotId } }
        )
        return handleResponse({
            res,
            message: 'Successfully updated with status',
            statusCode: 200,
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Unable to update status.',
            statusCode: 404,
        })
    }
}

export default { paymentStatusCapture,paymentUpdate }
