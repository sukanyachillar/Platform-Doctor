import bookingController from '../controllers/bookingController.js';
import express from 'express';

const router = express.Router();

router.post("/bookAppointment", bookingController.bookAppointment);

export default router;
