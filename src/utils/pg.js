import Razorpay from "razorpay";
import { nanoid } from "nanoid";

const createPaymentLink = async(body)=>{
    let reference_id = nanoid();
    let {name,phone,amount} = body
    try{
        let body = {
            amount,
            currency: "INR",
            accept_partial: false,
            reference_id,
            customer: {
              name,
              contact: phone,
            },
            notify: {
              sms: true,
            },
            reminder_enable: true,
            callback_url: "https://example-callback-url.com/",
            callback_method: "get"
        }
        let razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET,
        });
        let response = await razorpay.paymentLink.create(
            body
        )
    
        console.log({response})
        return response;

    }catch(err){
        console.log({Error:err})
        return err;
    }
}

export default { createPaymentLink };