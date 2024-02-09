
import doctorProfileModel from '../../../../models/doctorModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlots.js'
import bookingModel from '../../../../models/bookingModel.js';
import payment from '../../../../utils/pg.js'

const bookAppointment = async (req, res) => {
  try {
     const {
         doctorId,
         appointmentDate,
         timeSlot,
         customerName,
         customerPhone,
         amount,
         paymentMethod,
      } = req.body;

      const doctorProfile = await doctorProfileModel.findOne({ where: {doctor_id:  doctorId}  });
      const existingTimeslot = await weeklyTimeSlotsModel.findOne({
        where: {
          time_slot: timeSlot,
          doctor_id: doctorId,
          date: appointmentDate,
        },
      });
  
      if (existingTimeslot?.booking_status) {
        return handleResponse({
          res,
          message:'Slot already booked',
          statusCode: 400
      })
      }
      // existingTimeslot.booking_status= 1;
      if (existingTimeslot) {
        await weeklyTimeSlotsModel.update(
          {
            booking_status: 1,
          },
          {
            where: {
              time_slot: timeSlot,
              doctor_id: doctorId,
              date: appointmentDate,
            },
          }
        );
      }
    
      let data = await payment.createPaymentLink({ name:customerName, phone:customerPhone, amount:1000})
      
      const customerData = {
        customerName,
        customerPhone,
        entityId: doctorProfile.entity_id,
        departmentId: doctorProfile.department_id,
        bookingType: 1,
        amount,
        bookingDate: new Date(),
        appointmentDate,
        workSlotId: existingTimeslot.time_slot_id,
      }
      const newBooking = new bookingModel(customerData);
      const addedBooking = await newBooking.save();
      return handleResponse({ 
        res, 
        statusCode: "200", 
        message: "Appointment booked Sucusfully",
        data: {
          orderId:data.short_url,
          
        }
		})
    
  } catch (error) {
    console.log(error)
  }
};

const updateBookingStatus = async(req,res)=>{
  try{
    let bookingId = req.body.bookingId;
    let data = await bookingModel.update(
      {
        booking_status: 2,
      },
      {
        where: {
          bookingId
        },
      }
    );
    return handleResponse({
      res,
      message:"Successfully updated appointment status.",
      data:{data}
    })

  }catch(error){
    console.log({error})
  }
}

export default { bookAppointment ,updateBookingStatus };
