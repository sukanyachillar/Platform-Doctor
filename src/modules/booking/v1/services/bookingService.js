
import doctorModel from '../../../../models/doctorModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import workScheduleModel from '../../../../models/workScheduleModel.js'
import bookingModel from '../../../../models/bookingModel.js'

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

      const { entityId } = req.user
      console.log('req.user.entityId', req.user.entityId)
      console.log('req.user.entity_Id', req.user.entity_id)
      const doctorProfile = await doctorModel.findOne({ where: { doctor_id: doctorId } });
      
      const timeSlotData = {
         date: appointmentDate,
         day: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' }),
         timeSlot,
         doctorId,
         bookingStatus: 1
      }
    
      // const appointmentDay = appointmentDate.getDate();
      const existingTimeslot = await workScheduleModel.findOne({
        where: {
          time_slot: timeSlot,
          doctor_id: doctorId,
          // day: appointmentDate.toLocaleDateString('en-US', { weekday: 'long' })
          date: appointmentDate.toLocaleDateString()
        },
      });
  
      if (!existingTimeslot) {
        return handleResponse({
          res,
          message:'Slot already booked',
          statusCode: 400
      })
      }

      const updatedTimeSlot = await workScheduleModel.update(
        {
          booking_status: 1,
        },
        {
          where: {
            time_slot: timeSlot,
            doctor_id: doctorId,
            date: appointmentDate.toLocaleDateString()
          },
        }
      );
      const getTimeSlot = await workScheduleModel.findOne({ where: {
                             time_slot: timeSlot,
                             doctor_id: doctorId,
                             date: appointmentDate.toLocaleDateString()
      } });

      const customerData = {
        customerName,
        customerPhone,
        entityId,
        departmentId: doctorModel.department_id,
        bookingType: "appointment",
        amount,
        bookingDate: new Date(),
        appointmentDate,
        workSlotId: getTimeSlot.time_slot_id

      }

      const newBooking = new bookingModel(customerData);
      const addedBooking = await newBooking.save();

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
