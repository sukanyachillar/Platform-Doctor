import express from 'express'
import adminController from '../controllers/adminController.js'
import { verifyAdminToken } from '../../../../utils/token.js'

const router = express.Router()

router.post('/admin-register', adminController.adminRegister)
router.post('/admin-login', adminController.adminLogin)
router.post('/add-dept', verifyAdminToken, adminController.addDepart)
router.post('/list-doctors', adminController.listDoctors)
router.post('/list-entity', adminController.listEntity)
router.post('/transaction-history', adminController.transactionHistory)
router.post('/add-profile', adminController.addProfile)
router.post('/customer-listing', adminController.listAllCustomers)
router.post('/add-bank',adminController.addBankDetails)
router.post('/customer-history', adminController.customerHistory)
router.post('/customer-listing', adminController.listAllCustomers);
router.post('/add-entity',  adminController.addEntity);
router.post('/add-staff',  adminController.addEntity);

export default router
