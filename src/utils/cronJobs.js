// consolidatedScript.js


import doctorModel from '../models/doctorModel.js';
import weeklyTimeSlotsModel from '../models/weeklyTimeSlotsModel.js';
import workScheduleModel from '../models/workScheduleModel.js';
import { Op, Sequelize } from 'sequelize'

const generateTimeslots = (startTime, endTime, consultationTime) => {
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${endTime}`);
  
    // Calculate time difference in minutes
    const timeDifference = (endDate - startDate) / (1000 * 60);
  
    // Calculate the number of time slots based on consultation time
    const numberOfSlots = Math.floor(timeDifference / consultationTime);
  
    // Generate time slots
    const timeSlots = [];
    let currentSlot = new Date(startDate);
  
    for (let i = 0; i < numberOfSlots; i++) {
      const formattedTime = currentSlot.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
  
      timeSlots.push(formattedTime);
      currentSlot.setMinutes(currentSlot.getMinutes() + consultationTime);
    }
    console.log("timeSlots", timeSlots)
    return timeSlots;
  };

  const getNextWeekDate = (date) => {
    const nextWeekDate = new Date(date);
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    return formatDate(nextWeekDate);
  };
  
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };


// Run the script initially
// (async () => {
//     const doctors = getActiveDoctors();
//     console.log("active doctors", doctors)

//     for (const doctor of doctors) {
//         const lastDate = await getLastDateForDoctor(doctor.doctor_id);
//         const startDate = lastDate || new Date(); // If no last date found, use the current date

//         const endDate = new Date(startDate);
//         endDate.setDate(endDate.getDate() + 7);

//         await generateAndInsertTimeSlots(doctor, startDate, endDate);
//     }
// })();

// Schedule the cron job to run daily at midnight
// cron.schedule('* * * * *', async () => {
//      timeSlotCron();
// });

async function getPreviousDayName() {
    // Days of the week
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Get today's date
    const today = new Date();
    
    // Calculate the previous day's index
    const previousDayIndex = (today.getDay() + 6) % 7; // Adding 6 and modulo 7 ensures the result is between 0 and 6
    
    // Get the name of the previous day
    const previousDayName = daysOfWeek[previousDayIndex];

    return previousDayName;
}

const timeSlotCron = async() => {
    console.log("inside crone")
    const previousDateDay = await getPreviousDayName();

    let previousDateData = await workScheduleModel.findAll({
        where: {day: previousDateDay}
    })

    console.log('previousDateDay:', previousDateDay);
    // console.log('previousDateData:', previousDateData);
   
   for (const record of previousDateData) {
      const doctorData = await doctorModel.findOne({
          attributes: [
              'doctor_id',
              'doctor_name',
              'consultation_time',
          ],
          where: { doctor_id: record.doctor_id },
        
      })
    //   console.log("doctorData", doctorData)
      const startTime = record.startTime;
      const endTime = record.endTime;
      const consultationTime = doctorData.consultation_time;
   
      const timeslots =  generateTimeslots(startTime, endTime, consultationTime );
    //   console.log("timeslots", timeslots)y
      
      const nextWeekDate = await dateFromDay(record.day);
    //   const nextWeekDate = getNextWeekDate(date);
      console.log("nextWeekDate>>>>>>>", nextWeekDate)

    //   console.log("record", record)

      for (const ele of timeslots) {

          const existingTimeslot = await weeklyTimeSlotsModel.findOne({
              where: {
                  time_slot: ele,
                  doctor_id: record.doctor_id,
                  date: nextWeekDate,
              },
          })
          if (!existingTimeslot) {
              await weeklyTimeSlotsModel.create({
                  date: nextWeekDate,
                  day: record.day,
                  time_slot: ele,
                  doctor_id: record.doctor_id,
                  booking_status: 0, // Default value for availability
                });
          }
        
        }
    }
}

const dateFromDay = async (day) => {
    try {
        const currentDate = new Date()
        const currentDayOfWeek = currentDate.getDay()
        let daysToAdd = day - currentDayOfWeek
        if (daysToAdd <= 0) {
            daysToAdd += 7
        }
        const nextDate = new Date(currentDate)
        nextDate.setDate(currentDate.getDate() + daysToAdd)
        return nextDate
    } catch (error) {
        console.log({ error })
    }
}

// const startTest = async () => {
//     const currentDate = new Date();
  
//       const previousDateData = await workScheduleModel.findAll({
//         where: {
//             created_date_time: {
//             [Op.lt]: currentDate,
//           },
//         },
//       });
  
//     //   console.log('Previous date data:', previousDateData);
     
//      for (const record of previousDateData) {
//         const doctorData = await doctorModel.findOne({
//             attributes: [
//                 'doctor_id',
//                 'doctor_name',
//                 'consultation_time',
//                 'consultation_charge',
//                 'status',
//                 'description',
//                 'department_id',
//                 'entity_id',
//             ],
//             where: { doctor_id: record.doctor_id },
          
//         })
//         // console.log("doctorData", doctorData)
//         const startTime = record.startTime;
//         const endTime = record.endTime;
//         const consultationTime = doctorData.consultation_time;
  
//         console.log(`Doctor ${record.doctor_id} consultation time: ${startTime} - ${endTime}`);
     
//         const timeslots =  generateTimeslots(startTime, endTime, consultationTime );
//         console.log("timeslots", timeslots)
//         const nextWeekDate = getNextWeekDate(record.created_date_time);
//         console.log("nextWeekDate>>>>>>>", nextWeekDate)

//         console.log("record", record)

//         for (const ele of timeslots) {

//             const existingTimeslot = await weeklyTimeSlotsModel.findOne({
//                 where: {
//                     time_slot: ele,
//                     doctor_id: record.doctor_id,
//                     date: nextWeekDate,
//                 },
//             })
//             if (!existingTimeslot) {
//                 await weeklyTimeSlotsModel.create({
//                     date: nextWeekDate,
//                     day: record.day,
//                     time_slot: ele,
//                     doctor_id: record.doctor_id,
//                     booking_status: 0, // Default value for availability
//                   });
//             }
          
//           }
//       }
// }


export default { timeSlotCron } 