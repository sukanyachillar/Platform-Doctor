import bookingModel from '../../../../models/bookingModel.js'
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import entityModel from '../../../../models/entityModel.js'
import { handleResponse } from '../../../../utils/handlers.js'
import admin from 'firebase-admin'
import serviceAccount from '../../../../utils/chillarprototype-firebase-adminsdk-7wsnl-aff859ec9b.json' assert { type: 'json' }

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
        console.log({ bookingData })
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
            attributes: ['workSlotId', 'customerName', 'entityId'],
            where: { orderId },
        })
        // const getEntity = await entityModel.findOne({
        //     where: { entity_id: timeSlot.entityId },
        //     attributes:['phone']
        // })
        await weeklyTimeSlotsModel.update(
            { booking_status: 1 },
            { where: { time_slot_id: timeSlot.workSlotId } }
        )
        let workSlotData = await weeklyTimeSlotsModel.findOne({
            where: { time_slot_id: timeSlot.workSlotId },
        })
       if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            })
       }

        // admin.initializeApp({
        //     credential: admin.credential.cert(serviceAccount)
        // });

        const registrationToken =
            'etfHl3VTQgSJkxZitec_gq:APA91bFToY4Qd4d93FqviQk3RN1SdJwkoZgSp_3t2CchmVENe8drTvgjyjN6dD4yjDYtl_f5pf0pKdf8FJoYN0jwZ0mdnqL0goXIgjVtfEzqG4lUcPPWb5fa83M2bbhVeJbNiNK2Xces'
        console.log(timeSlot.customerName, workSlotData.date, workSlotData.day)
        const payload = {
            notification: {
                title: 'Appointment scheduled!',
                body: `Mr/Mrs. ${timeSlot.customerName} has booked an appointment for ${workSlotData.date} at ${workSlotData.time_slot}.`,
            },
        }

        const options = {
            priority: 'high',
        }
        let message = {
            data: {data:JSON.stringify(payload)} ,
            token: registrationToken,
            // options
        }
        admin
            .messaging()
            .send(message)
            .then(function (response) {

                console.log('message succesfully sent !',response)
            })
            .catch(function (error) {
                console.log({ error })
            })

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

export default { paymentStatusCapture, paymentUpdate }
