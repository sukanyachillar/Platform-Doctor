import authenticationController from '../controllers/authenticationController.js'

import express from 'express';

const router = express.Router();

router.post("/register", authenticationController.register);
router.post('/addProfile',authenticationController.addProfile);

export default router
