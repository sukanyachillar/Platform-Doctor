import workScheduleSevices from "../services/workScheduleSevices.js";

const addWorkSchedule = async (req,res) =>{
    try{
        const workSchedule = await workScheduleSevices.addWorkSchedule(req.body,req.user,res);
        return workSchedule;
    }catch(error){
        console.log({error})
    }
}

const updateWorkScheduleStatus = async(req,res)=>{
    try{
        const updatedStatus = await workScheduleSevices.updateWorkScheduleStatus(req.body,res);
        return updatedStatus;
    }catch(error){
        console.log({error})
    }
}

const getWorkSchedule = async(req,res)=>{
    try{
        const workData = await workScheduleSevices.getWorkSchedule(req.body,res);
        return workData;

    }catch(error){
        console.log({error})
    }
}

export default {updateWorkScheduleStatus,addWorkSchedule,getWorkSchedule};