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
        orderId: data?.id,
        workSlotId: existingTimeslot.time_slot_id,
      }
      const newBooking = new bookingModel(customerData);
      const addedBooking = await newBooking.save();
      return handleResponse({ 
        res, 
        statusCode: "200", 
        message: "Appointment booked successfully",
        data: {
          orderId: data?.id,
          amount:1000,
          bookingId:addedBooking.id
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

const listBooking = async ({ doctorId, date }, res) => {
    try {
        const appointmentList = await weeklyTimeSlotsModel.findAll({
            attributes: ['time_slot', 'time_slot_id'],
            where: {
                doctor_id: doctorId,
                date,
            },
            include: [{
                model: bookingModel,
                attributes: [
                    'customerName',
                    'customerPhone',
                    'bookingStatus',
                    'bookingId',
                ],
                where: {
                    bookingStatus: {
                        [Op.not]: 3,
                    },
                },
                as: 'booking',
            }],
        });

        console.log({ appointmentList })
        if (!appointmentList || appointmentList.length === 0) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'No appointments found',
            });
        }

        const totalAppointments =  await bookingModel.count({
          where: {
              workSlotId: { [Op.in]: appointmentList.map(appointment => appointment.time_slot_id) },
          },
      });

        const formattedAppointments = appointmentList.map(({ time_slot, bookings }) => {
            const formattedBookings = bookings.map(({ bookingId, customerName, customerPhone, bookingStatus }) => {
                totalAppointments++;
                if (bookingStatus === 1) {
                    completedAppointments++;
                } else {
                    pendingAppointments++;
                }

                return {
                    bookingId,
                    timeSlot: time_slot,
                    customerName,
                    customerPhone,
                    bookingStatus,
                };
            });

            return formattedBookings;
        }).flat();

        const doctorProfile = await doctorProfileModel.findOne({
            attributes: ['doctor_name'],
            where: { doctor_id: doctorId },
        });

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Appointment listing fetched successfully',
            data: {
                appointmentList: formattedAppointments,
                totalAppointments,
                completedAppointments,
                pendingAppointments,
                appointmentDate: date,
                doctorName: doctorProfile?.doctor_name || '',
            },
        });
    } catch (error) {
        console.error({ error });
        // Handle the error appropriately
    }
};


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

const bookingConfirmationData = async(bookingData,res)=>{
  try{
    let {bookingId} = bookingData;
    let response = await bookingModel.findOne({where:{id:bookingId}});
    let data, message,statusCode; 
    if(response){
      data = response,
      message = 'Sucessfully fetched booking details.',
      statusCode = 200
    }else{
      message = 'Sorry no data found for this bookingId.',
      statusCode = 404
    }
    return handleResponse({
      res,
      message,
      statusCode,
      data
    })
  }catch(error){
    console.log({"Error while fetching booking details":error})
    return handleResponse({
      res,
      message:"Error while fetching booking details",
      statusCode:422
    })
  }

}

export default { bookAppointment, listBooking, getBookingReport,bookingConfirmationData };