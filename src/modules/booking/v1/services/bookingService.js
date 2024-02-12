import doctorProfileModel from '../../../../models/doctorModel.js';
import { handleResponse } from '../../../../utils/handlers.js';
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import bookingModel from '../../../../models/bookingModel.js';
import payment from '../../../../utils/pg.js';
import { Op } from 'sequelize';

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

      if (!existingTimeslot){
        return handleResponse({
          res,
          message:'Slot not found on this date',
          statusCode: 404
      })
      }
  
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
    
      let data = await payment.createPaymentLink({ name:customerName, phone:customerPhone, amount:1000});
      if (data?.Error?.statusCode == 400) return handleResponse({
        res,
        statusCode: "400", 
        message: "Something went wrong",
        data: {
          message: data?.Error?.error?.description
      }})
      
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
          paymentUrl: data?.short_url
          
        }
		})
    
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      message:"Error while booking appointment.",
      statusCode:422
  })
  }
};

const listBooking = async( { doctorId, date } , res)=> {
  try {
    let totalAppointments = 0;
    let completedAppointments = 0;
    let pendingAppointments = 0;

    const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
      attributes: ['time_slot', 'time_slot_id'],
      where: {
        doctor_id: doctorId,
        date
      },
    });

    console.log("weeklyTimeSlot==========", weeklyTimeSlots)
  
    if (!weeklyTimeSlots) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Weekly time slot not found",
      });
    }
  
        // Loop through each weekly time slot and fetch booking information
        const appointmentList = [];
        for (const weeklyTimeSlot of weeklyTimeSlots) {
          const bookingInfo = await bookingModel.findOne({
            attributes: ['customerName', 'customerPhone', 'bookingStatus', 'bookingId'],
            where: {
              workSlotId: weeklyTimeSlot.time_slot_id,
            },
          });
    
          if (bookingInfo) {
            appointmentList.push({
              bookingId: bookingInfo.bookingId,
              timeSlot: weeklyTimeSlot.time_slot,
              customerName: bookingInfo.customerName,
              customerPhone: bookingInfo.customerPhone,
              bookingStatus: bookingInfo.bookingStatus,
            });
            totalAppointments++;
            if (bookingInfo.bookingStatus === 1) {
              completedAppointments++;
            } else {
              pendingAppointments++;
            }
          }
        }
    console.log("appointmentList", appointmentList)
  
    return handleResponse({
      res,
      statusCode: 200,
      message: "Appointment listing fetched successfully",
      data: {
        appointmentList,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        appointmentDate: date,
      }
    });
  } catch (error) {
    console.log({ error });
  }
}
const getBookingReport = async (req, res) => {
  try {
    const { doctorId, date } = req.body;
    const queryPart = {
      departmentId: doctorId,
      appointmentDate: { [Op.eq]: new Date(date) }, // Filter appointments on or after the specified date
    };
    const bookingReport = await bookingModel.findAll({
      where: queryPart,
      attributes: ['customerName', 'orderId', 'amount', 'bookingStatus'], // Select specific attributes
    });
    return handleResponse({
      res,
      statusCode: 200,
      message: "Successfully fetched booking report.",
      data: { bookingReport },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: { },
    });
  }
};

export default { bookAppointment, listBooking, getBookingReport };