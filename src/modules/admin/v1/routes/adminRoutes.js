import express from 'express'
import adminController from '../controllers/adminController.js'
import { verifyAdminToken, verifyAdminRefreshToken } from '../../../../utils/token.js';

import multer from 'multer'

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
})


const router = express.Router();

router.post('/admin-register', adminController.adminRegister);
router.post('/admin-login', adminController.adminLogin);
router.post('/add-dept',  adminController.addDepart);
router.post('/update-dept',  adminController.updateDept);
router.post('/delete-dept',  adminController.deleteDept);
router.post('/view-dept',  adminController.getDeptDetails);
router.post('/list-departments', adminController.listDepartments);
router.post('/list-dept-clinic', adminController.listDeptByClinic);
router.post('/list-doctors', adminController.listDoctors_admin);
router.post('/list-entity', adminController.listEntity) // meant list buisness for clinic side
router.post('/transaction-history', adminController.transactionHistory);
router.post('/add-doctor', upload.single('file'), adminController.addNewDoctor);
router.post('/view-doctor', adminController.viewDoctor);
router.post('/update-doctor', upload.single('file'), adminController.updateDoctor);
router.post('/customer-listing', adminController.listAllCustomers);
router.post('/add-bank', adminController.addBankDetails);
router.post('/customer-history', adminController.customerHistory);
router.post('/customer-listing', adminController.listAllCustomers);
router.post('/add-clinic', upload.single('file'), adminController.addClinic);
router.post('/list-district', adminController.listDistrict);
router.post('/list-state', adminController.listState);
router.post('/list-clinic', adminController.listClinic); // for admin
router.post('/update-clinic-status', adminController.updateClinicStatus);
router.post('/list-doctor-by-clinic', adminController.listDoctorsByClinic);
router.post('/clinic-profile', adminController.clinicProfile);
router.post('/admin-verify-refreshToken', verifyAdminRefreshToken);
router.post('/total-booking', adminController.totalNoOfbookings);
router.post('/graph-data', adminController.graphData);
router.post('/booking-report', adminController.bookingReport_admin);
router.post('/list-clinic-name', adminController.listClinicName);
router.post('/search-doctor-by-phone', adminController.findDrByPhoneNo);
router.post('/find-doctor-by-id', adminController.findDoctorByID);
router.post('/list-booking', adminController.listBooking_admin);

export default router;
