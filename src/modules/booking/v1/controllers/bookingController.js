
import customerService from "../services/bookingService.js";

const bookAppointment = async(req, res) => {
  try {
    const bookinResponse = await customerService.bookAppointment(req.body, res);
    return bookinResponse
  } catch (error) {
    console.log("error", error)
  }
};

export default { bookAppointment };







