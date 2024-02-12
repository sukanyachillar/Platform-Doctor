import doctorModel from "../../../../models/doctorModel.js";
import weeklyTimeSlots from "../../../../models/weeklyTimeSlotsModel.js";
import workScheduleModel from "../../../../models/workScheduleModel.js";
import { handleResponse } from "../../../../utils/handlers.js";


const addWorkSchedule = async(data,userData,res)=>{
    try{
        let {entity_id} = userData ;
        let {day, startTime,endTime,doctor_id,session} = data;
        let dayOfWeek = await getDayOfWeekIndex(day);
        let datefromDay = await dateFromDay(dayOfWeek);
        let status = 1 ;
        let message ;
        let  workData ;
        let time_slots ;
        workData = await workScheduleModel.findOne({where:{entity_id,day,doctor_id,startTime,endTime}});
        let doctorData = await doctorModel.findOne({where:{status:1,doctor_id},attributes:['consultation_time']});
        if(!doctorData){
            return handleResponse({
                res,
                message:'Please enable your status to active.',
                statusCode:204
            })
        }else{
            time_slots = await generateTimeSlots(startTime,endTime,doctorData.consultation_time);
            const currentDate = new Date(datefromDay);
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 to month as it's zero-based
            const date = String(currentDate.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${date}`;
            time_slots.map(async(ele)=>{
                let newTimeSlot = new weeklyTimeSlots({
                    date:formattedDate,
                    day,
                    time_slot:ele,
                    doctor_id
                });
                let data = await newTimeSlot.save()
            })
            if(!workData){
                workData = new workScheduleModel({entity_id,day,session,endTime,startTime,day,status,doctor_id})
                message = 'Succesfully added work schedule.';
               
            }else{
                workData.startTime = startTime;
                workData.endTime = endTime;
                workData.status = status ;
                workData.doctor_id = doctor_id;
                message = 'Successfully updated work schedule.'
            }

        }
        let workSchedule = await workData.save()
        return handleResponse({
            res,
            message,
            statusCode:200,
            data:{
                day:workSchedule.day,
                session:workSchedule.session,
                startTime:workSchedule.startTime,
                endTime:workSchedule.endTime,
                doctor_id:workSchedule.doctor_id
            }
        })
    }catch(error){
        console.log({error})
        return handleResponse({
            res,
            message:"Error while adding work Schedule",
            statusCode:500
        })
    }
}

const addWork = async(data,userData,res)=>{
    try{
        let {doctor_id,day,session} = userData ;
        let {entity_id} = data;
        let status = 0 ;
        let message
        let workData,newData
        console.log(doctor_id,day,session)
        workData = await workScheduleModel.findOne({where:{entity_id,day,doctor_id,session}});
        if(!workData){
           newData = new workScheduleModel({session,status,doctor_id,day,entity_id} )
            message = 'Successfully updated work schedule.'
        }else{
            return handleResponse(
                {res,
                message:"Data already available.",
                statusCode:404
            })
        }
        let workSchedule = await newData.save()
        return handleResponse({
            res,
            message,
            statusCode:200,
           
        })
    }catch(error){
        console.log({error})
        return handleResponse({
            res,
            message:"Error while adding work.",
            statusCode:422
        })
    }
}

const updateWorkScheduleStatus = async(workData,res)=>{
    try{
        let {work_schedule_id,status} = workData;
        let workSchedule = await workScheduleModel.findOne({where:{work_schedule_id}})
        if(workSchedule)
            workSchedule.status = status;
        let workScheduleData = await workSchedule.save();
        return handleResponse({
            res,
            statusCode:200,
            message:'Updated the work schedule status.',
            data:{
                work_schedule_id:workScheduleData.work_schedule_id,
                status:workScheduleData.status,
                day:workScheduleData.day,
                session:workScheduleData.session,
                startTime:workScheduleData.startTime,
                endTime:workScheduleData.endTime
            }
        })

    }catch(error){
        console.log(error)
        return handleResponse({
            res,
            message:"Error while updating work schedule.",
            statusCode:422
        })
    }
}

const getWorkSchedule = async(data,res)=>{
    try{
        let {doctor_id} = data;
        let workScheduleData = await workScheduleModel.findAll({where:{doctor_id:doctor_id}});
        workScheduleData.sort((a, b) => {
            if (a.day !== b.day) {
                const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                return daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
            }
            else {
                const sessions = ["Morning", "Afternoon", "Evening"];
                return sessions.indexOf(a.session) - sessions.indexOf(b.session);
            }
        });

        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const daysWithStatus1 = workScheduleData.map(row => row.day);
        const availableDays = daysOfWeek.map(day => {
        return {
            day,
            status: daysWithStatus1.includes(day) ? 1 : 0 // Set status to 1 if it's in daysWithStatus1, otherwise set to 0
            };
        });
        return handleResponse({
            res,
            message:"Successfully fetched data.",
            statusCode:200,
            data:{
                workScheduleData,
                availableDays
            }
        })
    }catch(error){
        console.log({error})
        return handleResponse({
            res,
            message:"Error while fetching data.",
            statusCode:422
        })
    }
}

const getSingleWorkSchedule = async (req,res)=>{
    try{ 
        let {date,phone} = req.body;
        date = new Date(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const slotDate = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${slotDate}`;
        let doctorData = await doctorModel.findOne({where:{phone},attributes:['doctor_id']})
        let workSlots = await weeklyTimeSlots.findAll({where:{date:formattedDate,doctor_id:doctorData.doctor_id}});
        return handleResponse({
            res,
            statusCode:200,
            message:"Sucessfully fetched work slots",
            data:{
                workSlots
            }
        })
    }catch(error){
        console.log({error});
        return handleResponse({
            res,
            message:"Error while fetching single work schedule.",
            statusCode:422
        })
    }
}

const generateTimeSlots = async(startTime, endTime,consultationTime)=> {
    try{
        console.log(startTime,endTime,consultationTime)
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; // Months are zero-based (0 for January)
        const currentDay = currentDate.getDate();
        const startDateTime = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}T${startTime}`;
        const endDateTime = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}T${endTime}`;
        const start = new Date(startDateTime);
        const end = new Date(endDateTime); 
        const timeSlots = [];
        let current = new Date(start);
        while (current < end) {
            const formattedTime = current.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            timeSlots.push(formattedTime);
            current.setMinutes(current.getMinutes() + consultationTime);
        }
      return timeSlots;
    }catch(error){
      console.log({error})
    }
}

const dateFromDay = async(day)=>{
    try{
        const currentDate = new Date();
        const currentDayOfWeek = currentDate.getDay();
        const daysUntilNextDay = day + (7 - currentDayOfWeek) % 7;
        const nextDate = new Date(currentDate);
        nextDate.setDate(currentDate.getDate() + daysUntilNextDay);
        return nextDate;
    }catch(error){
        console.log({error})
    }
}

const getDayOfWeekIndex = async(dayName)=> {
    try{
        console.log({dayName})
        const lowercaseDayName = dayName.toLowerCase();
        const dayOfWeekMap = {
            sunday: 0,
            monday: 1,
            tuesday: 2,
            wednesday: 3,
            thursday: 4,
            friday: 5,
            saturday: 6
        };
    
        return dayOfWeekMap[lowercaseDayName] !== undefined ? dayOfWeekMap[lowercaseDayName] : null;
    }catch(err){
        console.log({err})
    }
}

export default { addWorkSchedule,updateWorkScheduleStatus,getWorkSchedule,generateTimeSlots,addWork,getSingleWorkSchedule };