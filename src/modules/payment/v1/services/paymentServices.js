import bookingModel from '../../../../models/bookingModel.js';
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js';

const paymentStatusCapture = async(req, res)=>{
    try{
        console.log("webhook",req.body);
        console.log({order: req.body?.payload?.order });
        console.log({payment:  req.body?.payload?.payment })
        if(req.body?.payload?.order){
            if(req.body?.payload?.order?.entity?.status == 'paid'){
               
                let data = await bookingModel.update(
                    {
                        paymentStatus: 1,
                        bookingStatus: 1,
                        updatedAt: new Date(),
                    }, 
                    {
                    where: {
                        orderId: req.body?.payload?.order?.entity?.id
                    },
                  });

                  await weeklyTimeSlotsModel.update({ booking_status: 1 }, { where: { time_slot_id: data.workSlotId }});
            };
        }

        return true;


    }catch(error){
        console.log({error})
    }
}

export default { paymentStatusCapture }