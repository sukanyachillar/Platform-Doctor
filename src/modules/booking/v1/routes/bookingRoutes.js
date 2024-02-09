import { verifyToken } from '../../../../utils/token.js';
import bookingController from '../controllers/bookingController.js';
import express from 'express';

const router = express.Router();

router.post("/bookAppointment", bookingController.bookAppointment);
router.post("/updateBooking",verifyToken,bookingController.updateBookingStatus );
router.post("/bookingReport",verifyToken,bookingController.getBookingReport );


export default router;
