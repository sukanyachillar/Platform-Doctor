import { verifyToken } from '../../../../utils/token.js'
import bookingController from '../controllers/bookingController.js'
import express from 'express'

const router = express.Router()

router.post('/bookAppointment', bookingController.bookAppointment)
router.post('/listBooking', verifyToken, bookingController.listBooking) // based on date
router.post(
    '/updateBooking',
    verifyToken,
    bookingController.updateBookingStatus
)
router.post('/bookingReport', verifyToken, bookingController.getBookingReport)
router.post(
    '/booking-confirmation-data',
    bookingController.bookingConfirmationData
)

export default router
