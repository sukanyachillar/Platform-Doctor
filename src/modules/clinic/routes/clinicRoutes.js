import express from 'express';
import clinicController from '../controllers/clinicController.js';
import { verifyToken } from '../../../utils/token.js';

const router = express.Router();

router.post('/generate-otp', clinicController.generateOTP);
router.post('/resend-otp', clinicController.resendOTP);
router.post('/clinic-login', clinicController.clinicLogin);
router.post('/list-booking', verifyToken, clinicController.listAllBooking);
router.post('/booking-report', clinicController.AllBookingReport);

export default router;
