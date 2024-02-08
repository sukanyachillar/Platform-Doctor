
import {verifyToken} from '../../../../utils/token.js';
import workScheduleController from '../controllers/workScheduleController.js';

import express from 'express';

const router = express.Router();

router.post('/create-work-schedule',verifyToken,workScheduleController.addWorkSchedule);
router.post('/update-work-status',verifyToken,workScheduleController.updateWorkScheduleStatus);
router.get('/get-work-schedule',verifyToken,workScheduleController.getWorkSchedule);
router.post('/get-work-slots',workScheduleController.getWorkSlot);




export default router;