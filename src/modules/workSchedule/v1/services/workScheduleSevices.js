import workScheduleModel from "../../../../models/workScheduleModel.js";
import { handleResponse } from "../../../../utils/handlers.js";


const addWorkSchedule = async(data,userData,res)=>{
    try{
        let {entity_id} = userData ;
        let {day, startTime,endTime,doctor_id,session} = data;
        let status = 1 ;
        let message ;
        let  workData ;
        workData = await workScheduleModel.findOne({where:{entity_id,day,doctor_id,startTime,endTime}})
        if(!workData){
            workData = new workScheduleModel({entity_id,day,session,endTime,startTime,day,status})
            message = 'Succesfully added work schedule.'
        }else{
            workData.startTime = startTime;
            workData.endTime = endTime;
            workData.status = status ;
            message = 'Successfully updated work schedule.'
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
    }
}

const getWorkSchedule = async(data,res)=>{
    try{
       
        let {doctor_id} = data;
        let workScheduleData = await workScheduleModel.findAll({where:{doctor_id:doctor_id}});

        return handleResponse({
            res,
            message:"Successfully fetched file data.",
            data:{workScheduleData}
        })

    }catch(error){

    }
}

export default { addWorkSchedule,updateWorkScheduleStatus,getWorkSchedule};