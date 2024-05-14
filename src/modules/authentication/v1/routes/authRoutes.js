import authenticationController from '../controllers/authenticationController.js'
import { verifyRefreshToken, verifyToken } from '../../../../utils/token.js'
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // limit file size to 5MB
    },
})

import express from 'express';

const router = express.Router();

router.post('/register', authenticationController.register);
router.post('/getProfile', verifyToken, authenticationController.getProfile);
router.post('/profile', authenticationController.getProfileForCustomer);
router.post(
    '/addprofile',
    // verifyToken,
    upload.single('file'),
    authenticationController.addProfile
);
router.post('/adddept', verifyToken, authenticationController.addDept);

router.post('/refreshToken', verifyRefreshToken);
router.get(
    '/generalSettings',
    verifyToken,
    authenticationController.getGeneralSettings
);
router.post('/bankdata', verifyToken, authenticationController.fetchBankDetails);
router.post(
    '/update-status',
    verifyToken,
    authenticationController.updateEntityStatus
);
router.post('/update-profile', authenticationController.updateProfile);

export default router;
