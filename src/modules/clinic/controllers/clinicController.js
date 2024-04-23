import clinicServices from '../services/clinicServices.js'

// const adminRegister = async (req, res) => {
//     try {
//         let data = await adminServices.adminRegister(req.body, res)
//         return data
//     } catch (error) {
//         console.log({ error })
//     }
// }

const generateOTP = async (req, res) => {
    try {
        let data = await clinicServices.generateOTP(req.body, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

const resendOTP = async (req, res) => {
    try {
        let data = await clinicServices.generateOTP(req.body, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

const clinicLogin = async (req, res) => {
    try {
        let data = await clinicServices.clinicLogin(req.body, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

const listAllBooking = async (req, res) => {
    try {
        let data = await clinicServices.listAllBooking(req.query, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}
const AllBookingReport = async (req, res) => {
    try {
        let data = await clinicServices.AllBookingReport(req.query, res)
        return data
    } catch (error) {
        console.log({ error })
    }
}

export default {
    generateOTP,  
    resendOTP,
    clinicLogin,
    listAllBooking,
    AllBookingReport
}
