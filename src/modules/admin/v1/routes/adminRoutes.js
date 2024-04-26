import express from 'express'
import adminController from '../controllers/adminController.js'
import { verifyAdminToken } from '../../../../utils/token.js';

import multer from 'multer'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
})


const router = express.Router()

router.post('/admin-register', adminController.adminRegister)
router.post('/admin-login', adminController.adminLogin)
router.post('/add-dept', verifyAdminToken, adminController.addDepart)
router.post('/list-doctors', adminController.listDoctors)
router.post('/list-entity', adminController.listEntity) // meant list buisness
router.post('/transaction-history', adminController.transactionHistory)
router.post('/add-profile', upload.single('file'), adminController.addProfile)
router.post('/customer-listing', adminController.listAllCustomers)
router.post('/add-bank', adminController.addBankDetails)
router.post('/customer-history', adminController.customerHistory)
router.post('/customer-listing', adminController.listAllCustomers);
router.post('/add-entity', upload.single('file'), adminController.addEntity);
router.post('/list-district', adminController.listDistrict);


export default router
