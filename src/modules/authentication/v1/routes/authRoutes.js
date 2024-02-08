import authenticationController from '../controllers/authenticationController.js';
import {verifyRefreshToken, verifyToken} from '../../../../utils/token.js'
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // limit file size to 5MB
  },
});

import express from 'express';

const router = express.Router();

router.post("/register", authenticationController.register);
router.post("/getProfile", verifyToken, authenticationController.getProfile);
router.post("/profile", authenticationController.getProfile);
router.post("/addprofile", verifyToken,  upload.single('file'), authenticationController.addProfile);
router.post('/adddept', verifyToken, authenticationController.addDept);
router.post('/refreshToken', verifyRefreshToken)
router.get('/generalSettings', verifyToken, authenticationController.getGeneralSettings)

export default router;
