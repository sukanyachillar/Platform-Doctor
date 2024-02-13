import bookingModel from '../../../../models/bookingModel.js'
const paymentStatusCapture = async(req,res)=>{
    try{
        console.log("webhook",req.body);
        console.log({payment:req.body?.payload?.order})
        if(req.body?.payload?.order){
            if(req.body?.payload?.order?.entity?.status == 'paid'){
               
                let data = await bookingModel.update(
                    {
                        paymentStatus:1
                    }, {
                    where: {
                        orderId:req.body?.payload?.order?.entity?.id
                    },
                  })
            }
        }

        return true;


    }catch(error){
        console.log({error})
    }
}

export default { paymentStatusCapture }