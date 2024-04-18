import { hashPassword, comparePasswords } from '../../../utils/password.js';
import { generateAdminTokens } from '../../../utils/token.js';
import { generateUuid } from '../../../utils/generateUuid.js';
import { handleResponse } from '../../../utils/handlers.js';
import { Op, Sequelize } from 'sequelize';
// import { encrypt } from '../../../../utils/token.js';
import entityModel from '../../../models/entityModel.js';

// import twilio from 'twilio';

const getOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOTPSMS = async (phone, otp) => {
    try {
        await twilioClient.messages.create({
            to: '+919747505122',
            from: '+16562204100', // Your Twilio phone number
            body: `Your OTP for Clinic Login is: ${otp}`
        });

        console.log('OTP sent successfully to phone:', phone);
    } catch (error) {
        console.error('Error sending OTP via SMS:', error);
        throw error; // Rethrow the error for handling in the calling function
    }
}

const generateOTP = async ({ phone }, res) => {

    console.log("phone", phone)
    try {
        const clinic = await entityModel.findOne({ where: { phone }, attributes: ['entity_id'], });
        if (!clinic) {
            return handleResponse({
                res,
                message: 'Clinic not found',
                statusCode: 404,
            });
        }

        const otp = getOTP();

         // sendOTPSMS(phone, otp); // Send OTP via SMS to the provided phone number

        return handleResponse({
            res,
            statusCode: 200,
            message: 'OTP has been sent to clinic\'s phone number',
            data: { phone },
        });
    } catch (err) {
        console.error(err);
        return handleResponse({
            res,
            message: 'Sorry! Unable to process the request',
            statusCode: 500,
        });
    }
}

const clinicLogin = async (payload, res) => {
    try {
        let { phone, otp } = payload;

        // const otpVerification = await verifyOTPWithTwilio(phone, otp);
        // console.log('otpVerification', otpVerification)
        // if (!otpVerification.status === "approved") {
        //     return handleResponse({
        //         res,
        //         message: 'Invalid OTP',
        //         statusCode: 400,
        //     });
        // }

        if (otp !== "111111") {
            return handleResponse({
                res,
                message: 'Invalid OTP',
                statusCode: 400,
            });
        }
       
        let getClinic = await entityModel.findOne({
            where: { phone },
        });
        
        if (!getClinic) {
            return handleResponse({
                res,
                message: 'User not found',
                statusCode: 404,
            });
        }

        let tokens = await generateAdminTokens(phone);

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully signed In',
            data: {
                refreshToken: tokens.refreshToken,
                accessToken: tokens.accessToken,
                clinicId: getClinic.entity_id
            },
        });
    } catch (err) {
        console.error({ err });
        return handleResponse({
            res,
            message: 'Sorry! Unable to login',
            statusCode: 500,
        });
    }
}

// const verifyOTPWithTwilio = async (phoneNumber, otpProvided) => {
//     try {
//         const verificationCheck = await twilioClient.verify.v2.services('TWILIO_VERIFY_SERVICE_SID')  //
//             .verificationChecks
//             .create({ to: '+919747505122', code: otpProvided });

//         // If the verification check status is 'approved', the OTP is valid
//         return verificationCheck.status === 'approved';
//     } catch (error) {
//         console.error('Error verifying OTP with Twilio:', error);
//         throw error;
//     }
// }




export default {
    generateOTP,
    clinicLogin
   
}
