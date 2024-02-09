
import customerService from "../services/bookingService.js";

const bookAppointment = async(req, res) => {
  try {
    const bookinResponse = await customerService.bookAppointment(req, res);
    return bookinResponse
  } catch (error) {
    console.log("error", error)
  }
};

const updateBookingStatus = async(req,res)=>{
  try{
    const updateData = await customerService.updateBookingStatus(req,res);
    return updateData;

  }catch(err){
    console.log({err})
  }
}

export default { bookAppointment ,updateBookingStatus};







