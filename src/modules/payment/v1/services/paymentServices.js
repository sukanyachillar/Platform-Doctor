const paymentStatusCapture = async(req,res)=>{
    try{
        console.log("body",req.body);
        console.log({orders:req.body?.payload})
        return true;


    }catch(error){
        console.log({error})
    }
}

export default { paymentStatusCapture }