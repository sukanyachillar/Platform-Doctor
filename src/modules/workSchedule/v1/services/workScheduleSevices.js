import doctorModel from "../../../../models/doctorModel.js";
import entityModel from "../../../../models/entityModel.js";
import weeklyTimeSlots from "../../../../models/weeklyTimeSlotsModel.js";
import workScheduleModel from "../../../../models/workScheduleModel.js";
import { handleResponse } from "../../../../utils/handlers.js";
import { decrypt } from "../../../../utils/token.js";
import doctorEntityModel from "../../../../models/doctorEntityModel.js";
import { Op } from "sequelize";

//Workschedule on weekely basis
// const addWorkSchedule = async (data, userData, res) => {
//   try {
//     let { entity_id } = userData;
//     let { day, startTime, endTime, doctor_id, session, entityId } = data;
//     let errorMessages = [];
//     let daysArray = [
//       "monday",
//       "tuesday",
//       "wednesday",
//       "thursday",
//       "friday",
//       "saturday",
//       "sunday",
//     ];
//     let dayIn = daysArray.includes(day.toLowerCase());
//     if (!dayIn) {
//       return handleResponse({
//         res,
//         message: "Please check the day.",
//         statusCode: 404,
//       });
//     }
//     let dayOfWeek = await getDayOfWeekIndex(day);
//     let datefromDay = await dateFromDay(dayOfWeek);
//     let status = 1;
//     let message;

//     let doctorData = await doctorModel.findOne({
//       where: { status: 1, doctor_id },
//       attributes: ["doctor_id", "consultation_time", "tokens", "bookingType"],
//     });

//     if (!doctorData) {
//       return handleResponse({
//         res,
//         message: "Please enable your status to active.",
//         statusCode: 204,
//       });
//     }
//     const entityData = await entityModel.findOne({
//       where: { entity_id: entityId },
//       attributes: ["account_no"],
//     });
//     const doctorEntityData = await doctorEntityModel.findOne({
//       where: { doctorId: doctor_id, entityId },
//     });

//     if (!doctorEntityData) {
//       return handleResponse({
//         res,
//         message: "Invalid input data",
//         statusCode: 204,
//       });
//     }

//     let workData = await workScheduleModel.findOne({
//       where: { entity_id: entityId, day, doctor_id, startTime, endTime },
//     });

//     const consultation_time = doctorEntityData.consultationTime;

//     let time_slots;

//     if (doctorData?.bookingType == "token") {
//       time_slots = await generateTokenBasedTimeSlots(
//         startTime,
//         endTime,
//         doctorData.tokens
//       );
//     } else {
//       time_slots = await generateTimeSlots(
//         startTime,
//         endTime,
//         consultation_time
//       );
//     }

//     const currentDate = new Date(datefromDay);
//     const year = currentDate.getFullYear();
//     const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Adding 1 to month as it's zero-based
//     const date = String(currentDate.getDate()).padStart(2, "0");
//     const formattedDate = `${year}-${month}-${date}`;

//     await Promise.all(
//       time_slots.map(async (ele, index) => {
//         let existingTimeSlot = await weeklyTimeSlots.findOne({
//           where: {
//             date: formattedDate,
//             day: day,
//             time_slot: ele,
//             doctor_id: doctor_id,
//             // doctorEntityId: doctorEntityData ? doctorEntityData.doctorEntityId : null
//           },+
//         });

//         if (existingTimeSlot) {
//           errorMessages.push("This time slot already exists for this doctor");
//         } else {
//           let newTimeSlot = new weeklyTimeSlots({
//             date: formattedDate,
//             day,
//             time_slot: ele,
//             doctor_id,
//             doctorEntityId: doctorEntityData
//               ? doctorEntityData.doctorEntityId
//               : null,
//             token_number: doctorData?.bookingType == "token" ? index + 1 : null,
//           });
//           await newTimeSlot.save();
//         }
//       })
//     );

//     if (errorMessages.length > 0) {
//       return handleResponse({
//         res,
//         message: "This time slot already exists for this doctor",
//         statusCode: 422,
//         data: {},
//       });
//     }
//     if (!workData) {
//       workData = new workScheduleModel({
//         entity_id: entityId,
//         day,
//         session,
//         endTime,
//         startTime,
//         day,
//         status,
//         doctor_id,
//       });
//       message = "successfully added work schedule.";
//     } else {
//       workData.startTime = startTime;
//       workData.endTime = endTime;
//       workData.status = status;
//       workData.doctor_id = doctor_id;
//       message = "Successfully updated work schedule.";
//     }

//     let workSchedule = await workData.save();
//     if (entityData.account_no) {
//       await entityModel.update(
//         { profile_completed: 1 },
//         { where: { entity_id: entityId } }
//       );
//     }
//     return handleResponse({
//       res,
//       message,
//       statusCode: 200,
//       data: {
//         day: workSchedule.day,
//         session: workSchedule.session,
//         startTime: workSchedule.startTime,
//         endTime: workSchedule.endTime,
//         doctor_id: workSchedule.doctor_id,
//       },
//     });
//   } catch (error) {
//     console.log({ error });
//     return handleResponse({
//       res,
//       message: "Error while adding work Schedule",
//       statusCode: 500,
//     });
//   }
// };

//Workschedule on 4weeks basis
const addWorkSchedule = async (data, userData, res) => {
  try {
    let { entity_id } = userData;
    let { day, startTime, endTime, doctor_id, session, entityId } = data;
    let errorMessages = [];
    let daysArray = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    let dayIn = daysArray.includes(day.toLowerCase());
    if (!dayIn) {
      return handleResponse({
        res,
        message: "Please check the day.",
        statusCode: 404,
      });
    }
    let dayOfWeek = await getDayOfWeekIndex(day);
    let datefromDay = await dateFromDay(dayOfWeek);
    let status = 1;
    let message = "";

    let doctorData = await doctorModel.findOne({
      where: { status: 1, doctor_id },
      attributes: ["doctor_id", "consultation_time", "tokens", "bookingType"],
    });

    if (!doctorData) {
      return handleResponse({
        res,
        message: "Please enable your status to active.",
        statusCode: 204,
      });
    }
    const entityData = await entityModel.findOne({
      where: { entity_id: entityId },
      attributes: ["account_no"],
    });
    const doctorEntityData = await doctorEntityModel.findOne({
      where: { doctorId: doctor_id, entityId },
    });

    if (!doctorEntityData) {
      return handleResponse({
        res,
        message: "Invalid input data",
        statusCode: 204,
      });
    }

    let workData = await workScheduleModel.findOne({
      where: { entity_id: entityId, day, doctor_id, startTime, endTime },
    });

    const consultation_time = doctorEntityData.consultationTime;

    let time_slots;
    let slotsAdded = false;

    if (doctorData?.bookingType == "token") {
      time_slots = await generateTokenBasedTimeSlots(
        startTime,
        endTime,
        doctorData.tokens
      );
    } else {
      time_slots = await generateTimeSlots(
        startTime,
        endTime,
        consultation_time
      );
    }

    for (let i = 0; i < 4; i++) {
      const currentDate = new Date(datefromDay);
      currentDate.setDate(currentDate.getDate() + i * 7);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const date = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${date}`;

      await Promise.all(
        time_slots.map(async (ele, index) => {
          let existingTimeSlot = await weeklyTimeSlots.findOne({
            where: {
              date: formattedDate,
              day: day,
              time_slot: ele,
              doctor_id: doctor_id,
            },
          });

          if (existingTimeSlot) {
            errorMessages.push(
              `This time slot already exists for this doctor on ${formattedDate}`
            );
          } else {
            let newTimeSlot = new weeklyTimeSlots({
              date: formattedDate,
              day,
              time_slot: ele,
              doctor_id,
              doctorEntityId: doctorEntityData
                ? doctorEntityData.doctorEntityId
                : null,
              token_number:
                doctorData?.bookingType == "token" ? index + 1 : null,
            });
            const result = await newTimeSlot.save();
            if (result) {
              message = `This time slot is added for this doctor on ${formattedDate}`;
            }
          }
        })
      );
    }

    if (!workData) {
      workData = new workScheduleModel({
        entity_id: entityId,
        day,
        session,
        endTime,
        startTime,
        day,
        status,
        doctor_id,
      });
      message = "successfully added work schedule.";
    } else {
      workData.startTime = startTime;
      workData.endTime = endTime;
      workData.status = status;
      workData.doctor_id = doctor_id;
      message = "Successfully updated work schedule.";
    }

    let workSchedule = await workData.save();
    if (entityData.account_no) {
      await entityModel.update(
        { profile_completed: 1 },
        { where: { entity_id: entityId } }
      );
    }
    if (errorMessages.length > 0 && message != "") {
      return handleResponse({
        res,
        message: errorMessages.join(", "),
        statusCode: 422,
        data: {},
      });
    }
    return handleResponse({
      res,
      message:
        errorMessages.length > 0
          ? errorMessages.join(", ") + ". " + message
          : message,
      statusCode: 200,
      data: {
        day: workSchedule.day,
        session: workSchedule.session,
        startTime: workSchedule.startTime,
        endTime: workSchedule.endTime,
        doctor_id: workSchedule.doctor_id,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while adding work Schedule",
      statusCode: 500,
    });
  }
};

//Workschedule on 4weeks basis
const addWorkScheduleFromAdmin = async (body, res) => {
  try {
    let { day, startTime, endTime, doctor_id, session, entityId } = body;
    let errorMessages = [];
    let daysArray = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    let dayIn = daysArray.includes(day.toLowerCase());
    if (!dayIn) {
      return handleResponse({
        res,
        message: "Please check the day.",
        statusCode: 404,
      });
    }
    let dayOfWeek = await getDayOfWeekIndex(day);
    let datefromDay = await dateFromDay(dayOfWeek);
    let status = 1;
    let message = "";

    let doctorData = await doctorModel.findOne({
      where: { status: 1, doctor_id },
      attributes: ["doctor_id", "consultation_time", "tokens", "bookingType"],
    });

    if (!doctorData) {
      return handleResponse({
        res,
        message: "Please enable your status to active.",
        statusCode: 204,
      });
    }
    const entityData = await entityModel.findOne({
      where: { entity_id: entityId },
      attributes: ["account_no"],
    });
    const doctorEntityData = await doctorEntityModel.findOne({
      where: { doctorId: doctor_id, entityId },
    });

    if (!doctorEntityData) {
      return handleResponse({
        res,
        message: "Invalid input data",
        statusCode: 204,
      });
    }

    let workExists = await workScheduleModel.findOne({
      where: { entity_id: entityId, day,session, doctor_id },
    });
    if (workExists) {
      return handleResponse({
        res,
        message: "Work schedule already exists for this day for this session ",
        statusCode: 409,
      });
    }

    let workData = await workScheduleModel.findOne({
      where: { entity_id: entityId, day,session, doctor_id, startTime, endTime },
    });
    

    const consultation_time = doctorEntityData.consultationTime;

    let time_slots;
    let slotsAdded = false;

    if (doctorData?.bookingType == "token") {
      time_slots = await generateTokenBasedTimeSlots(
        startTime,
        endTime,
        doctorData.tokens
      );
    } else {
      time_slots = await generateTimeSlots(
        startTime,
        endTime,
        consultation_time
      );
    }

    for (let i = 0; i < 4; i++) {
      const currentDate = new Date(datefromDay);
      currentDate.setDate(currentDate.getDate() + i * 7);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const date = String(currentDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${date}`;

      await Promise.all(
        time_slots.map(async (ele, index) => {
          let existingTimeSlot = await weeklyTimeSlots.findOne({
            where: {
              date: formattedDate,
              day: day,
              time_slot: ele,
              doctor_id: doctor_id,
            },
          });

          if (existingTimeSlot) {
            return handleResponse({
              res,
              message: "This time slot already exists for this doctor",
              statusCode: 422,
              data: {},
            });
          } else {
            let newTimeSlot = new weeklyTimeSlots({
              date: formattedDate,
              day,
              time_slot: ele,
              doctor_id,
              doctorEntityId: doctorEntityData
                ? doctorEntityData.doctorEntityId
                : null,
              token_number:
                doctorData?.bookingType == "token" ? index + 1 : null,
            });
            const result = await newTimeSlot.save();
            if (result) {
              message = `This time slot is added for this doctor on ${formattedDate}`;
            }
          }
        })
      );
    }

    if (!workData) {
      workData = new workScheduleModel({
        entity_id: entityId,
        day,
        session,
        endTime,
        startTime,
        day,
        status,
        doctor_id,
      });
      message = "successfully added work schedule.";
    } else {
      // workData.startTime = startTime;
      // workData.endTime = endTime;
      // workData.status = status;
      // workData.doctor_id = doctor_id;
      // message = "Successfully updated work schedule.";
    }

    let workSchedule = await workData.save();
    if (entityData.account_no) {
      await entityModel.update(
        { profile_completed: 1 },
        { where: { entity_id: entityId } }
      );
    }
    if (errorMessages.length > 0 && message == "") {

    }
    return handleResponse({
      res,
      message:
        errorMessages.length > 0
          ? errorMessages.join(", ") + ". " + message
          : message,
      statusCode: 200,
      data: {
        day: workSchedule.day,
        session: workSchedule.session,
        startTime: workSchedule.startTime,
        endTime: workSchedule.endTime,
        doctor_id: workSchedule.doctor_id,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while adding work Schedule",
      statusCode: 500,
    });
  }
};

const listWorkSchedule = async (req, res) => {
  let { doctorId, entityId, search } = req.body;
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 10;
  const offset = (page - 1) * pageSize;
  try {
    let whereCondition = {
      doctor_id: doctorId,
      entity_id: entityId,
      [Op.or]: [
        { day: { [Op.like]: `%${search}%` } },
        { startTime: { [Op.like]: `%${search}%` } },
        { session: { [Op.like]: `%${search}%` } },
        { endTime: { [Op.like]: `%${search}%` } },
        { status: { [Op.like]: `%${search}%` } },
        { created_date_time: { [Op.like]: `%${search}%` } },
        { update_date_time: { [Op.like]: `%${search}%` } },
      ],
    };

    let { count, rows: workScheduleData } = await workScheduleModel.findAndCountAll({
      where: whereCondition,
      limit: pageSize,
      offset: offset,
    });

    const workScheduleListWithSerial = workScheduleData.map((item, index) => ({
      SlNo: offset + index + 1,
      ...item.dataValues,  // Include all existing fields of workScheduleData
    }));

    if (count > 0) {
      return handleResponse({
        res,
        data: {
          workScheduleList: workScheduleListWithSerial,
          totalCount: count,
        },
        message: "Successfully fetched workschedule list",
        statusCode: 200,
      });
    } else {
      return handleResponse({
        res,
        data: { workScheduleList: workScheduleData },
        message: "No workschedules found !",
        statusCode: 200,
      });
    }
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while fetching data.",
      statusCode: 422,
    });
  }
};

const addWork = async (data, userData, res) => {
  try {
    let { doctor_id, day, session } = userData;
    let { entity_id } = data;
    let status = 0;
    let message;
    let workData, newData;
    console.log(doctor_id, day, session);
    workData = await workScheduleModel.findOne({
      where: { entity_id, day, doctor_id, session },
    });
    if (!workData) {
      newData = new workScheduleModel({
        session,
        status,
        doctor_id,
        day,
        entity_id,
      });
      message = "Successfully updated work schedule.";
    } else {
      return handleResponse({
        res,
        message: "Data already available.",
        statusCode: 404,
      });
    }
    let workSchedule = await newData.save();
    return handleResponse({
      res,
      message,
      statusCode: 200,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while adding work.",
      statusCode: 422,
    });
  }
};

const updateWorkScheduleStatus = async (workData, res) => {
  try {
    let { work_schedule_id, status } = workData;
    let workSchedule = await workScheduleModel.findOne({
      where: { work_schedule_id },
    });
    if (workSchedule) workSchedule.status = status;
    let workScheduleData = await workSchedule.save();
    return handleResponse({
      res,
      statusCode: 200,
      message: "Updated the work schedule status.",
      data: {
        work_schedule_id: workScheduleData.work_schedule_id,
        status: workScheduleData.status,
        day: workScheduleData.day,
        session: workScheduleData.session,
        startTime: workScheduleData.startTime,
        endTime: workScheduleData.endTime,
      },
    });
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      message: "Error while updating work schedule.",
      statusCode: 422,
    });
  }
};

const getWorkSchedule = async (data, user, res) => {
  try {
    let { doctor_id } = data;
    let workScheduleData = await workScheduleModel.findAll({
      where: { doctor_id: doctor_id },
    });

    workScheduleData.sort((a, b) => {
      if (a.day !== b.day) {
        const daysOfWeek = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
      } else {
        const sessions = ["Morning", "Afternoon", "Evening"];
        return sessions.indexOf(a.session) - sessions.indexOf(b.session);
      }
    });

    const workSchedule = {};

    const daysOfWeek = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const isSessionAvailable = (day) => {
      return workScheduleData.some(
        (entry) =>
          entry.day === day &&
          (entry.session === "Morning" || entry.session === "Evening")
      );
    };
    const result = [];

    daysOfWeek.forEach((day) => {
      const dayStatus = isSessionAvailable(day) ? 1 : 0;

      const daySchedule = workScheduleData.filter((entry) => entry.day === day);

      result.push({
        dayStatus,
        day,
        workSchedule:
          daySchedule.length > 0
            ? daySchedule
            : [
              {
                day,
                status: dayStatus,
                startTime: null,
                endTime: null,
                work_schedule_id: null,
                entity_id: parseInt(user?.entity_id),
                session: null,
                doctor_id: Number(doctor_id),
                created_date_time: null,
                update_date_time: null,
                createdAt: null,
                updatedAt: null,
              },
            ],
      });
    });

    return handleResponse({
      res,
      message: "Successfully fetched data.",
      statusCode: 200,
      data: {
        //  workScheduleData,
        result,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while fetching data.",
      statusCode: 422,
    });
  }
};

const getSingleWorkSchedule = async (req, res) => {
  try {
    let { date, phone, encryptedPhone, entityId } = req.body;
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const slotDate = String(date.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${slotDate}`;
    let phoneNo;
    let decryptedPhone;
    if (encryptedPhone) {
      decryptedPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);
      phoneNo = decryptedPhone;
      console.log("phoneNo", phoneNo, decryptedPhone);
    } else {
      phoneNo = phone;
    }
    console.log("phoneNo", phoneNo);
    let doctorData = await doctorModel.findOne({
      where: { doctor_phone: phoneNo },
      attributes: ["doctor_id", "entity_id", "bookingType"],
    });
    let getEntity = await entityModel.findOne({
      where: { entity_id: entityId, status: 0 },
    });
    if (getEntity) {
      return handleResponse({
        res,
        message: "Clinic is closed please check other dates.",
        statusCode: 404,
      });
    }

    const doctorEntityData = await doctorEntityModel.findOne({
      where: {
        doctorId: doctorData.doctor_id,
        entityId,
      },
    });

    let doctorEntityId;
    if (doctorEntityData) {
      doctorEntityId = doctorEntityData.doctorEntityId;
    } else {
      doctorEntityId = null;
    }
    let attbr = [
      "time_slot_id",
      "date",
      "day",
      "time_slot",
      "doctor_id",
      "booking_status",
      "doctorEntityId",
      "status",
      "createdAt",
      "updatedAt",
    ];

    if (doctorData?.bookingType === "token") {
      attbr.push("token_number");
    }

    let data = await weeklyTimeSlots.findAll({
      where: {
        date: formattedDate,
        doctor_id: doctorData.doctor_id,
        doctorEntityId: doctorEntityId,
      },
      attributes: attbr,
      // order: [
      //     [Sequelize.fn('TIME_TO_SEC', Sequelize.fn('STR_TO_DATE', Sequelize.literal("CONCAT(date, ' ', time_slot)"), '%Y-%m-%d %h:%i %p')), 'ASC']
      // ],
    });
    if (data.length > 0 && data[0].status === 0) {
      return handleResponse({
        res,
        statusCode: 200,
        message: "Doctor not available today",
        data: {
          workSlots: [],
          isDocUnavailable: true,
        },
      });
    }
    console.log({ formattedDate });
    let availableWorkSlots = await weeklyTimeSlots.findAll({
      where: {
        date: formattedDate,
        doctor_id: doctorData.doctor_id,
        booking_status: 0,
      },
    });

    const now = new Date();
    // data = data.filter((slot) => {
    //   const timeSlot = slot.time_slot.trim().toLowerCase();
    //   const [time, modifier] = timeSlot.split(" ");

    //   let [slotHours, slotMinutes] = time.split(":").map(Number);

    //   if (modifier === "pm" && slotHours !== 12) {
    //     slotHours += 12;
    //   } else if (modifier === "am" && slotHours === 12) {
    //     slotHours = 0;
    //   }

    //   const nowHours = now.getHours();
    //   const nowMinutes = now.getMinutes();

    //   // Debugging logs
    //   console.log(`Current time: ${nowHours}:${nowMinutes}`);
    //   console.log(`Slot time: ${slotHours}:${slotMinutes} (${slot.time_slot})`);

    //   // Compare hours and then minutes
    //   if (slotHours > nowHours) {
    //     return true;
    //   } else if (slotHours === nowHours && slotMinutes > nowMinutes) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // });

    // Debugging log
    // console.log("Filtered data:", data);
    data = data.filter((slot) => {
      const slotDate = new Date(slot.date);
      const slotTime = new Date(`${slot.date}T${slot.time_slot}`);

      // If the slot date is not the current date, keep it
      if (slotDate.toDateString() !== now.toDateString()) {
        return true;
      }

      // If the slot date is the current date, compare times
      return slotTime > now;
    });

    const customSort = (a, b) => {
      const timeA = new Date("1970-01-01 " + a.time_slot);
      const timeB = new Date("1970-01-01 " + b.time_slot);

      return timeA - timeB;
    };

    // Sorting the workSlots array using the custom sorting function
    const sortedWorkSlots = data.sort(customSort);

    // console.log(sortedWorkSlots);

    return handleResponse({
      res,
      statusCode: 200,
      message: "Sucessfully fetched work slots",
      data: {
        workSlots: sortedWorkSlots,
        // sortedWorkSlots,
        availableWorkSlots: data.length,
        type: doctorData?.bookingType,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while fetching single work schedule.",
      statusCode: 422,
    });
  }
};

const generateTimeSlots = async (startTime, endTime, consultationTime) => {
  try {
    console.log(
      "startTime, endTime, consultationTime",
      startTime,
      endTime,
      consultationTime
    );
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Months are zero-based (0 for January)
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

// const generateTokenBasedTimeSlots = async (startTime, endTime, tokens) => {
//   try {
//     console.log("startTime, endTime, tokens", startTime, endTime, tokens);

//     const currentDate = new Date();
//     const currentYear = currentDate.getFullYear();
//     const currentMonth = currentDate.getMonth() + 1;
//     const currentDay = currentDate.getDate();

//     const startDateTime = `${currentYear}-${currentMonth
//       .toString()
//       .padStart(2, "0")}-${currentDay
//       .toString()
//       .padStart(2, "0")}T${startTime}`;
//     const endDateTime = `${currentYear}-${currentMonth
//       .toString()
//       .padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}T${endTime}`;

//     const start = new Date(startDateTime);
//     const end = new Date(endDateTime);

//     const totalTime = (end - start) / 60000;

//     const consultationTime = totalTime / tokens;

//     const timeSlots = [];
//     let current = new Date(start);

//     while (current < end) {
//       const formattedTime = current.toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//       timeSlots.push(formattedTime);
//       current.setMinutes(current.getMinutes() + consultationTime);
//     }

//     return timeSlots;
//   } catch (error) {
//     console.log({ error });
//   }
// };

const generateTokenBasedTimeSlots = async (startTime, endTime, tokens) => {
  try {
    console.log("startTime, endTime, tokens", startTime, endTime, tokens);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Parse start and end times correctly with AM/PM
    const startDateTime = new Date(
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay
        .toString()
        .padStart(2, "0")} ${startTime}`
    );
    const endDateTime = new Date(
      `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay
        .toString()
        .padStart(2, "0")} ${endTime}`
    );

    const totalTime = (endDateTime - startDateTime) / 60000; // Total time in minutes

    const consultationTime = totalTime / tokens; // Time per token in minutes

    const timeSlots = [];
    let current = new Date(startDateTime);

    for (let i = 0; i < tokens; i++) {
      const formattedTime = current.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      timeSlots.push(formattedTime);

      // Increment current time by consultationTime, rounding to avoid floating point issues
      current.setMinutes(current.getMinutes() + Math.floor(consultationTime));
      if (consultationTime % 1 !== 0) {
        current.setSeconds(current.getSeconds() + 30);
      }
    }

    return timeSlots;
  } catch (error) {
    console.log({ error });
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

export default {
  addWorkSchedule,
  updateWorkScheduleStatus,
  getWorkSchedule,
  generateTimeSlots,
  addWork,
  getSingleWorkSchedule,
  listWorkSchedule,
  addWorkScheduleFromAdmin
};
