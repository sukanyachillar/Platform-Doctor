import doctorEntityModel from "../models/doctorEntityModel.js";
import doctorModel from "../models/doctorModel.js";
import weeklyTimeSlotsModel from "../models/weeklyTimeSlotsModel.js";
import workScheduleModel from "../models/workScheduleModel.js";

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
      hour: "2-digit",
      minute: "2-digit",
    });

    timeSlots.push(formattedTime);
    currentSlot.setMinutes(currentSlot.getMinutes() + consultationTime);
  }
  // console.log("timeSlots", timeSlots)
  return timeSlots;
};

const generateTokenBasedTimeSlots = async (startTime, endTime, tokens) => {
  try {
    console.log("startTime, endTime, tokens", startTime, endTime, tokens);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const startDateTime = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-${currentDay
      .toString()
      .padStart(2, "0")}T${startTime}`;
    const endDateTime = `${currentYear}-${currentMonth
      .toString()
      .padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}T${endTime}`;

    const start = new Date(startDateTime);
    const end = new Date(endDateTime);

    const totalTime = (end - start) / 60000;

    const consultationTime = totalTime / tokens;

    const timeSlots = [];
    let current = new Date(start);

    while (current < end) {
      const formattedTime = current.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      timeSlots.push(formattedTime);
      current.setMinutes(current.getMinutes() + consultationTime);
    }

    return timeSlots;
  } catch (error) {
    console.log({ error });
  }
};

const getNextWeekDate = (date) => {
  const nextWeekDate = new Date(date);
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  return formatDate(nextWeekDate);
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getCurrentDateAndTimezone=()=> {
  const currentDate = new Date();
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  console.log("Current Date:", currentDate);
  console.log("Current Timezone:", timezone);
}

getCurrentDateAndTimezone();


async function getPreviousDayName() {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const today = new Date();

  const previousDayIndex = (today.getDay() + 6) % 7; // Adding 6 and modulo 7 ensures the result is between 0 and 6
  const previousDayName = daysOfWeek[previousDayIndex];

  return previousDayName;
}

const timeSlotCron = async () => {
  console.log("Inside crone");
  try {   
    const previousDateDay = await getPreviousDayName();

    let previousDateData = await workScheduleModel.findAll({
      where: { day: previousDateDay },
    });

    console.log("previousDateDay:", previousDateDay);
    console.log("previousDateData:", previousDateData);

    for (const record of previousDateData) {
      // console.log("record", record);
      const { doctor_id, entity_id } = record;
      // const doctorData = await doctorModel.findOne({
      //     attributes: [
      //         'doctor_id',
      //         'doctor_name',
      //         'consultation_time',
      //     ],
      //     where: { doctor_id: record.doctor_id },

      // })
      const doctorEntityData = await doctorEntityModel.findOne({
        where: { doctorId: doctor_id, entityId: entity_id },
      });
      const doctorData = await doctorModel.findOne({
        where: { doctor_id: doctor_id },
      });
      // console.log("doctorEntityData", doctorEntityData)
      const startTime = record.startTime;
      const endTime = record.endTime;
      const consultationTime = doctorEntityData?.consultationTime;
      console.log("consultationTime", consultationTime);
      console.log("startTime", startTime);
      console.log("endTime", endTime);
      let timeslots;

      if (doctorData?.bookingType == "token") {
        timeslots = await generateTokenBasedTimeSlots(
          startTime,
          endTime,
          doctorData.tokens
        );
      } else {
        timeslots = await generateTimeslots(
          startTime,
          endTime,
          consultationTime
        );
      }

      // const timeslots =  generateTimeslots(startTime, endTime, consultationTime );
      console.log("timeslots", timeslots);

      let index = await getDayOfWeekIndex(record.day);
      const nextWeekDate = await dateFromDay(index);
      const currentDate = new Date(nextWeekDate);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it's zero-based
      const date = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${date}`;

      // console.log("formattedDate", formattedDate)
      let tokenNumber = 1;

      for (const ele of timeslots) {
        const existingTimeslot = await weeklyTimeSlotsModel.findOne({
          where: {
            time_slot: ele,
            doctor_id: record.doctor_id,
            date: formattedDate,
          },
        });
        if (!existingTimeslot) {
          const slotCreatedRes = await weeklyTimeSlotsModel.create({
            date: formattedDate,
            day: record.day,
            time_slot: ele,
            doctor_id: record.doctor_id,
            booking_status: 0, // Default value for availability
            doctorEntityId: doctorEntityData
              ? doctorEntityData.doctorEntityId
              : null,
            token_number:
              doctorData?.bookingType == "token" ? tokenNumber : null,
              createdBy:"cron",
          });
          tokenNumber++;
          console.log("slotCreatedRes==>", slotCreatedRes);
        }
      }
    }
  } catch (error) {
    console.log("Crone ERROR==>", error);
  }
};

const dateFromDay = async (day) => {
  try {
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay();
    let daysToAdd = day - currentDayOfWeek;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
  } catch (error) {
    console.log({ error });
  }
};
const getDayOfWeekIndex = async (dayName) => {
  try {
    console.log({ dayName });
    const lowercaseDayName = dayName.toLowerCase();
    const dayOfWeekMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    return dayOfWeekMap[lowercaseDayName] !== undefined
      ? dayOfWeekMap[lowercaseDayName]
      : null;
  } catch (err) {
    console.log({ err });
  }
};

export default { timeSlotCron };
