import paymentService from '../services/paymentServices.js'

const paymentCapture = async(req,res)=>{
    try{
        let payment = await paymentService.paymentStatusCapture(req,res);
        return payment;

    }catch(err){
        console.log({error})
    }
}

export default {paymentCapture}