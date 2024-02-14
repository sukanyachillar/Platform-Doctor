import paymentService from '../services/paymentServices.js'

const paymentCapture = async (req, res) => {
    try {
        let payment = await paymentService.paymentStatusCapture(req, res)
        return payment
    } catch (err) {
        console.log({ err })
    }
}

const paymentUpdate = async(req,res)=>{
    try{
        let payment = await paymentService.paymentUpdate(req.body,res);
        return payment;

    }catch(err){
        console.log({err})
    }
}

export default { paymentCapture,paymentUpdate }
