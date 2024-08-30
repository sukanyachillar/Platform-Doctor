import express from 'express'
import paymentController from '../controllers/paymentController.js'

const router = express.Router()

router.post('/capture-payment-status', paymentController.paymentCapture);
router.post('/payment-update',paymentController.paymentUpdate);
router.post('/payment-failed',paymentController.paymentFailed);
router.post('/payment-verify',paymentController.paymentVerify);
router.post('/payment-success-webhook',paymentController.verifySuccessPaymentWebhook);
router.post('/payment-fail-webhook',paymentController.verifyFailPaymentWebhook);
router.post('/get-pg',paymentController.getPg);
router.post('/get-pg-report',paymentController.getPgReport);

export default router
