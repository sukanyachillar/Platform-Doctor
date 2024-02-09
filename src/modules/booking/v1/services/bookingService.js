
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
     
      console.log("appointmentDate.", appointmentDate);
      console.log("doctorId", doctorId)
      const doctorProfile = await doctorProfileModel.findOne({ where: {doctor_id:  doctorId}  });
      console.log( {
        time_slot: timeSlot,
        doctor_id: doctorId,
        date: appointmentDate,
      });
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
      existingTimeslot.booking_status= 1;
      if (existingTimeslot) {
        // Update the existing record
        await weeklyTimeSlotsModel.update(
          {
            // Specify the fields you want to update
            // For example, you might update the 'status' field
            status: 1,
          },
          {
            where: {
              time_slot: '10:30 am',
              doctor_id: 1,
              date: '2024-02-12',
            },
          }
        );
      }
   //   let newSlotData = new existingTimeslot.save();
      // const getTimeSlot = await workScheduleModel.findOne({ where: {
      //                        time_slot: timeSlot,
      //                        doctor_id: doctorId,
      //                        date: appointmentDate.toLocaleDateString()
      // } });

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
      if(addedBooking){
        let data = await payment.createPaymentLink({ name:customerName, phone:customerPhone, amount})
        console.log({paymentDt:data})
      }

      return handleResponse({ 
            res, 
            statusCode: "200", 
            message: "Appointment booked Sucusfully",
			      data: {
				        
			      }
		})
    
  } catch (error) {
    console.log(error)
  }
};

export default { bookAppointment };
