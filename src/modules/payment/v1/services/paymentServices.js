import bookingModel from '../../../../models/bookingModel.js'
const paymentStatusCapture = async(req,res)=>{
    try{
        console.log("body",req.body);
        console.log({orders:req.body?.payload});
        console.log({payment:req.body?.payload?.order})
        console.log({inside:req.body?.payload?.orders?.order})
        console.log({outside:req.body?.payload?.orders?.payment})
        if(req.body?.payload?.order){
            if(req.body?.payload?.order?.status == 'paid'){
                let data = await bookingModel.update({paymentStatus:1}, {
                    where: {
                        orderId:req.body?.payload?.order?.id
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