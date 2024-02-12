
import bookingService from "../services/bookingService.js";

const bookAppointment = async(req, res) => {
  try {
    const bookinResponse = await bookingService.bookAppointment(req, res);
    return bookinResponse
  } catch (error) {
    console.log("error", error)
  }
};

const listBooking = async(req, res) => {
  try {
    const listBookingResponse = await bookingService.listBooking(req.body, res);
    return listBookingResponse
  } catch (error) {
    console.log("error", error)
  }
};
export default { bookAppointment, listBooking };







