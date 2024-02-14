import express from 'express'
import paymentController from '../controllers/paymentController.js'

const router = express.Router()

router.post('/capture-payment-status', paymentController.paymentCapture);
router.post('/payment-update',paymentController.paymentUpdate)

export default router
