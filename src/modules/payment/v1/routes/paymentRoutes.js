import express from 'express'
import paymentController from '../controllers/paymentController.js'

const router = express.Router()

router.post('/capture-payment-status', paymentController.paymentCapture);
router.post('/payment-update',paymentController.paymentUpdate);
router.post('/transaction-history',paymentController.transactionHistory)

export default router
