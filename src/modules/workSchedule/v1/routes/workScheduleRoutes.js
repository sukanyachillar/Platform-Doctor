import cronJobs from '../../../../utils/cronJobs.js'
import { verifyToken } from '../../../../utils/token.js'
import workScheduleController from '../controllers/workScheduleController.js'

import express from 'express'

const router = express.Router()

router.post(
    '/create-work-schedule',
    verifyToken,
    workScheduleController.addWorkSchedule
)
router.post(
    '/create-work-schedule-admin',
    workScheduleController.addWorkScheduleFromAdmin
)
router.post(
    '/update-work-status',
    verifyToken,
    workScheduleController.updateWorkScheduleStatus
)
router.post(
    '/get-work-schedule',
    verifyToken,
    workScheduleController.getWorkSchedule
)
router.post(
    '/list-work-schedule',
    workScheduleController.listWorkSchedule
)
router.post('/get-work-slots', workScheduleController.getWorkSlot)
router.post('/addWork', verifyToken, workScheduleController.addWork)
router.post('/doc-availability', verifyToken, workScheduleController.docAvailability)
router.post('/cron-test',  cronJobs.timeSlotCron)
router.post('/uuid-test',  cronJobs.genUuidUpdate)

export default router
