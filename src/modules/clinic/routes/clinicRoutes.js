import express from 'express';
import clinicController from '../controllers/clinicController.js';
// import { verifyAdminToken } from '../../../utils/token.js';

const router = express.Router();

router.post('/generate-otp', clinicController.generateOTP);
router.post('/clinic-login', clinicController.clinicLogin);


export default router;
