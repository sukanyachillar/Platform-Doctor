import bookingService from "../services/bookingService.js";

const bookAppointment = async (req, res) => {
  try {
    const bookinResponse = await bookingService.bookAppointment(req, res);
    return bookinResponse;
  } catch (error) {
    console.log("error", error);
  }
};

const slotHoldForBooking = async (req, res) => {
  try {
    const bookinResponse = await bookingService.slotOnHold(req, res);
    return bookinResponse;
  } catch (error) {
    console.log("error", error);
  }
};

const listBooking = async (req, res) => {
  try {
    const listBookingResponse = await bookingService.listBooking(req.body, res);
    return listBookingResponse;
  } catch (error) {
    console.log("error", error);
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const updateData = await bookingService.updateBookingStatus(req.user,req, res);
    return updateData;
  } catch (err) {
    console.log({ err });
  }
};

const getBookingReport = async (req, res) => {
  try {
    const bookingReport = await bookingService.getBookingReport(req, res);
    return bookingReport;
  } catch (err) {
    console.log({ err });
  }
};

const bookingConfirmationData = async (req, res) => {
  try {
    let response = await bookingService.bookingConfirmationData(req.body, res);
    return response;
  } catch (err) {
    console.log(err);
  }
};
const getBookingLink = async (req, res) => {
  try {
    console.log("USER==>",req.user);
    let response = await bookingService.generateBookingLink(req.user, res);
    return response;
  } catch (err) {
    console.log(err);
  }
};

const doctorCancelBooking = async (req, res) => {
  try {
    let user;
    if (req.user) {
      user = req.user.userType
    } else {
      user = null
    }
    let response = await bookingService.cancelBookingFromDoctor(
      user,
      req.body,
      res
    );
    return response;
  } catch (err) {
    console.log(err);
  }
};

// const listAllCustomers = async (req, res) => {
//     try {
//         let response = await bookingService.listAllCustomers(
//             req.body,
//             res
//         )
//         return response
//     } catch (err) {
//         console.log(err)
//     }
// }

export default {
  bookAppointment,
  slotHoldForBooking,
  updateBookingStatus,
  listBooking,
  getBookingReport,
  bookingConfirmationData,
  doctorCancelBooking,
  getBookingLink,
  // listAllCustomers,
};
