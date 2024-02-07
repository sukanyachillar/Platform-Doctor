import authenticationController from '../controllers/authenticationController.js';
import {verifyToken} from '../../../../utils/token.js'

import express from 'express';

const router = express.Router();

router.post("/register", authenticationController.register);
router.get('/getProfile', verifyToken, authenticationController.getProfile);
router.post('/addprofile', verifyToken, authenticationController.addProfile);
router.post('/adddept', verifyToken, authenticationController.addDept);

export default router
