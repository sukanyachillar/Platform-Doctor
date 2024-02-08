import customerController from '../controllers/customerController.js';
import express from 'express';

const router = express.Router();

router.post("/bookAppointment", customerController.bookAppointment);

export default router;
