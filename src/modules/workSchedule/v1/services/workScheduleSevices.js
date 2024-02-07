import workScheduleModel from "../../../../models/workScheduleModel";


const addWorkSchedule = async(workData,userData,res)=>{
    try{
        let {entity_id} = userData ;
        let {day, startTime,endTime,doctor_id} = workData;
        let  workData ;
        workData = await workScheduleModel.findOne({where:{entity_id,day,doctor_id,startTime,endTime}})

      
         
          
         
          
         

    }catch(error){
        console.log({error})
    }
}