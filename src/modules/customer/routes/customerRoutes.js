import express from 'express'
import customerController from '../controllers/customerController.js';

const router = express.Router()

router.post('/list-doctors', customerController.listDoctorsForCustomers);
router.post('/entity-details', customerController.getSingleEntityDetails);


export default router;
