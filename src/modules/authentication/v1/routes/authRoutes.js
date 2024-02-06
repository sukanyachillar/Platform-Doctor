import authenticationController from '../controllers/authenticationController.js'

import express from 'express';

const router = express.Router();

router.post("/register", authenticationController.register)

export default router
