const paymentStatusCapture = async(req,res)=>{
    try{
        console.log("Webhook worked",req);
        console.log("body",req.body);
        return true;


    }catch(error){
        console.log({error})
    }
}

export default{paymentStatusCapture}