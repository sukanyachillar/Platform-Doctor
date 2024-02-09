import { verifyToken } from '../../../../utils/token.js';
import bookingController from '../controllers/bookingController.js';
import express from 'express';

const router = express.Router();

router.post("/bookAppointment", bookingController.bookAppointment);
router.post("/updateBooking",verifyToken,bookingController.updateBookingStatus );


export default router;
