import bookingService from '../services/bookingService.js'

const bookAppointment = async (req, res) => {
    try {
        const bookinResponse = await bookingService.bookAppointment(req, res)
        return bookinResponse
    } catch (error) {
        console.log('error', error)
    }
}

const listBooking = async (req, res) => {
    try {
        const listBookingResponse = await bookingService.listBooking(
            req.body,
            res
        )
        return listBookingResponse
    } catch (error) {
        console.log('error', error)
    }
}

const updateBookingStatus = async (req, res) => {
    try {
        const updateData = await bookingService.updateBookingStatus(
            req.body,
            res
        )
        return updateData
    } catch (err) {
        console.log({ err })
    }
}

const getBookingReport = async (req, res) => {
    try {
        const bookingReport = await bookingService.getBookingReport(req, res)
        return bookingReport
    } catch (err) {
        console.log({ err })
    }
}

const bookingConfirmationData = async (req, res) => {
    try {
        let response = await bookingService.bookingConfirmationData(
            req.body,
            res
        )
        return response
    } catch (err) {
        console.log(err)
    }
}

export default {
    bookAppointment,
    updateBookingStatus,
    listBooking,
    getBookingReport,
    bookingConfirmationData,
}
