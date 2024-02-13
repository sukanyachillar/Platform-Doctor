const paymentStatusCapture = async(req,res)=>{
    try{
        console.log("body",req.body);
        console.log({orders:req.body?.payload});
        console.log({payment:req.body?.payload?.order})
        console.log({inside:req.body?.payload?.order?.order})
        console.log({outside:req.body?.payload?.order?.payment})

        return true;


    }catch(error){
        console.log({error})
    }
}

export default { paymentStatusCapture }