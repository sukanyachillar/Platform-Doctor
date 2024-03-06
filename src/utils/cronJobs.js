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


async function getPreviousDayName() {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = new Date();
    
    const previousDayIndex = (today.getDay() + 6) % 7; // Adding 6 and modulo 7 ensures the result is between 0 and 6
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
      console.log('record.day', record.day)

      let index = await getDayOfWeekIndex(record.day)
      const nextWeekDate = await dateFromDay(index);
      console.log("nextWeekDate", nextWeekDate )
      const currentDate = new Date(nextWeekDate)
            const year = currentDate.getFullYear()
            const month = String(currentDate.getMonth() + 1).padStart(2, '0') // Adding 1 to month as it's zero-based
            const date = String(currentDate.getDate()).padStart(2, '0')
            const formattedDate = `${year}-${month}-${date}`
    //   const nextWeekDate = getNextWeekDate(date);
      console.log("formattedDate", formattedDate)

    //   console.log("record", record)

      for (const ele of timeslots) {

          const existingTimeslot = await weeklyTimeSlotsModel.findOne({
              where: {
                  time_slot: ele,
                  doctor_id: record.doctor_id,
                  date: formattedDate,
              },
          })
          if (!existingTimeslot) {
              await weeklyTimeSlotsModel.create({
                  date: formattedDate,
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
const getDayOfWeekIndex = async (dayName) => {
    try {
        console.log({ dayName })
        const lowercaseDayName = dayName.toLowerCase()
        const dayOfWeekMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6,
        }

        return dayOfWeekMap[lowercaseDayName] !== undefined
            ? dayOfWeekMap[lowercaseDayName]
            : null
    } catch (err) {
        console.log({ err })
    }
}

export default { timeSlotCron } 