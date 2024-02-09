import express from 'express';
import paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.post('/capture-payment-status',paymentController.paymentCapture);


export default router;