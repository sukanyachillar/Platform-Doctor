import doctorProfileModel from '../../../../models/doctorModel.js'
import { handleResponse } from '../../../../utils/handlers.js'
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import entityModel from '../../../../models/entityModel.js'
import bookingModel from '../../../../models/bookingModel.js'
import payment from '../../../../utils/pg.js'
import { Op } from 'sequelize'
import doctorModel from '../../../../models/doctorModel.js'

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
        } = req.body

        const doctorProfile = await doctorProfileModel.findOne({
            where: { doctor_id: doctorId },
        })
        const getEntity = await entityModel.findOne({
            where: { entity_id: doctorProfile.entity_id },
        })

        const existingTimeslot = await weeklyTimeSlotsModel.findOne({
            where: {
                time_slot: timeSlot,
                doctor_id: doctorId,
                date: appointmentDate,
            },
        })

        if (!existingTimeslot) {
            return handleResponse({
                res,
                message: 'Slot not found on this date',
                statusCode: 404,
            })
        }

        if (doctorProfile.status === 0) {
            return handleResponse({
                res,
                message: 'Doctor not available',
                statusCode: 404,
            })
        }

        if (getEntity.status === 0) {
            return handleResponse({
                res,
                message: 'Clinic is closed.',
                statusCode: 404,
            })
        }

        if (customerPhone.length !== 10) {
            return handleResponse({
                res,
                message: 'Invalid Phone No.',
                statusCode: 403,
            })
        }

        if (!existingTimeslot) {
            return handleResponse({
                res,
                message: 'Slot not found on this date',
                statusCode: 404,
            })
        }

        if (existingTimeslot?.booking_status) {
            return handleResponse({
                res,
                message: 'Slot already booked',
                statusCode: 400,
            })
        }
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
                    },
                }
            )
        }

        let data = await payment.createPaymentLink({
            name: customerName,
            phone: customerPhone,
            amount: 1000,
        })
        if (data?.Error?.statusCode == 400)
            return handleResponse({
                res,
                statusCode: '400',
                message: 'Something went wrong',
                data: {
                    message: data?.Error?.error?.description,
                },
            })

        const customerData = {
            customerName,
            customerPhone,
            entityId: doctorProfile.entity_id,
            departmentId: doctorProfile.department_id,
            bookingType: 1,
            amount,
            bookingDate: new Date(),
            appointmentDate,
            orderId: data?.id,
            workSlotId: existingTimeslot.time_slot_id,
        }
        const newBooking = new bookingModel(customerData)
        const addedBooking = await newBooking.save()
        // console.log({addedBooking})
        return handleResponse({
            res,
            statusCode: '200',
            message: 'Appointment booked successfully',
            data: {
                orderId: data?.id,
                amount: 1000,
                bookingId: addedBooking.bookingId,
            },
        })
    } catch (error) {
        console.log(error)
        return handleResponse({
            res,
            message: 'Error while booking appointment.',
            statusCode: 422,
        })
    }
}

const listBooking = async ({ doctorId, date }, res) => {
    try {
        let totalAppointments = 0
        let completedAppointments = 0
        let pendingAppointments = 0

        const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
            attributes: ['time_slot', 'time_slot_id'],
            where: {
                doctor_id: doctorId,
                date,
            },
        })

        // console.log("weeklyTimeSlot==========", weeklyTimeSlots)

        if (!weeklyTimeSlots) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'Weekly time slot not found',
            })
        }

        // Loop through each weekly time slot and fetch booking information
        const appointmentList = []
        for (const weeklyTimeSlot of weeklyTimeSlots) {
            const bookingInfo = await bookingModel.findOne({
                attributes: [
                    'customerName',
                    'customerPhone',
                    'bookingStatus',
                    'bookingId',
                ],
                where: {
                    workSlotId: weeklyTimeSlot.time_slot_id, 
                    bookingStatus: {
                        [Op.not]: 3,
                      },
                },
            })

            if (bookingInfo) {
                appointmentList.push({
                    bookingId: bookingInfo.bookingId,
                    timeSlot: weeklyTimeSlot.time_slot,
                    customerName: bookingInfo.customerName,
                    customerPhone: bookingInfo.customerPhone,
                    bookingStatus: bookingInfo.bookingStatus,
                })
                totalAppointments++
                if (bookingInfo.bookingStatus === 1) {
                    completedAppointments++
                } else {
                    pendingAppointments++
                }
            }
        }
        // console.log("appointmentList", appointmentList)

        const doctorProfile = await doctorProfileModel.findOne({
            attributes: ['doctor_name'],
            where: { doctor_id: doctorId },
        })
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
                doctorName: doctorProfile.doctor_name
                    ? doctorProfile.doctor_name
                    : '',
            },
        })
    } catch (error) {
        console.log({ error })
    }
}

const getBookingReport = async (req, res) => {
    try {
        const { doctorId, date } = req.body
        const queryPart = {
            departmentId: doctorId,
            appointmentDate: { [Op.eq]: new Date(date) }, // Filter appointments on or after the specified date
        }
        const bookingReport = await bookingModel.findAll({
            where: queryPart,
            attributes: ['customerName', 'orderId', 'amount', 'bookingStatus'], // Select specific attributes
        })
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
        let { bookingId } = bookingData
        let response = await bookingModel.findOne({ where: { bookingId } })
        console.log({ response })
        const weeklyTimeSlot = await weeklyTimeSlotsModel.findOne({
            attributes: ['time_slot', 'date', 'doctor_id'],
            where: {
                time_slot_id: response.workSlotId,
            },
        })
        const doctorData = await doctorModel.findOne({
            where: { doctor_id: weeklyTimeSlot.doctor_id },
            attributes: ['doctor_name'],
        })
        let data, message, statusCode
        if (response) {
            ;(data = response),
                (message = 'Successfully fetched booking details.'),
                (statusCode = 200)
        } else {
            ;(message = 'Sorry no data found for this bookingId.'),
                (statusCode = 404)
        }
        return handleResponse({
            res,
            message,
            statusCode,
            data: {
                doctorName: doctorData.doctor_name,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
                appointmentTimeSlot: weeklyTimeSlot.time_slot,
                appointmentDate: weeklyTimeSlot.date,
                paymentDate: data.updatedAt,
                paymentID: data.transactionId,
            },
        })
    } catch (error) {
        console.log({ 'Error while fetching booking details': error })
        return handleResponse({
            res,
            message: 'Error while fetching booking details',
            statusCode: 422,
        })
    }
}

const updateBookingStatus = async (bookingData, res) => {
    try {
        let { bookingId } = bookingData
        let updateData = await bookingModel.update(
            {
                bookingStatus: 1,
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

export default {
    bookAppointment,
    listBooking,
    getBookingReport,
    bookingConfirmationData,
    updateBookingStatus,
}
