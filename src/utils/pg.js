import Razorpay from "razorpay";
import { nanoid } from "nanoid";

const createPaymentLink = async(body)=>{
    let reference_id = nanoid();
    let {name,phone,amount} = body
    try{
        let body = {
            amount: amount,
            currency: 'INR',
            payment_capture: 1
        }
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        let response = await razorpay.orders.create(
            body
        )
    
        console.log({response})
        return response;

    }catch(err){
        console.log({Error:err})
    }
}

export default { createPaymentLink };