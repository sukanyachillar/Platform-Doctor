import cronJobs from "../../../../utils/cronJobs.js";
import { verifyToken } from "../../../../utils/token.js";
import bookingController from "../controllers/bookingController.js";
import express from "express";

const router = express.Router();

router.post("/bookAppointment", bookingController.bookAppointment);
router.post("/slot-on-hold", bookingController.slotHoldForBooking);
router.post("/listBooking", verifyToken, bookingController.listBooking); // based on date
router.post(
  "/updateBooking",
  verifyToken,
  bookingController.updateBookingStatus
);
router.post("/bookingReport", verifyToken, bookingController.getBookingReport);
router.post(
  "/booking-confirmation-data",
  bookingController.bookingConfirmationData
);
router.post(
  "/booking-cancel-doctor",
  bookingController.doctorCancelBooking
);
router.post(
  "/get-booking-link",verifyToken,
  bookingController.getBookingLink
);
router.post('/cron-test-payment',  cronJobs.paymentVerifyCheck)
router.post('/cron-test-slot',  cronJobs.blockedSlotCheck)

export default router;
