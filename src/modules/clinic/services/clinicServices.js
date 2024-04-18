import { hashPassword, comparePasswords } from '../../../utils/password.js';
import { generateAdminTokens } from '../../../utils/token.js';
import { generateUuid } from '../../../utils/generateUuid.js';
import { handleResponse } from '../../../utils/handlers.js';
import { Op, Sequelize } from 'sequelize';
// import { encrypt } from '../../../../utils/token.js';
import entityModel from '../../../models/entityModel.js';

// import twilio from ('twilio');

// const twilioClient = twilio('YOUR_TWILIO_ACCOUNT_SID', 'YOUR_TWILIO_AUTH_TOKEN');

const getOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const sendOTPSMS = async (phone, otp) => {
    // try {
    //     await twilioClient.messages.create({
    //         to: phone,
    //         from: 'YOUR_TWILIO_PHONE_NUMBER', 
    //         body: `Your OTP for Clinic Login is: ${otp}`
    //     });

    //     console.log('OTP sent successfully to phone:', phone);
    // } catch (error) {
    //     console.error('Error sending OTP via SMS:', error);
    //     throw error; 
    // }
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

        sendOTPSMS(phone, otp); // Send OTP via SMS to the provided phone number

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

        // const otpVerification = await verifyOTPTextbelt(phone, otp);
        // if (!otpVerification.success) {
        //     return handleResponse({
        //         res,
        //         message: 'Invalid OTP',
        //         statusCode: 400,
        //     });
        // }

        if(!otp === "123456") {
            return handleResponse({
                res,
                message: 'Invalid OTP',
                statusCode: 400,
            });
        }

        // const otpVerification = await verifyOTPTextbelt(phone, otp);

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
            message: 'Successfully signed in.',
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




export default {
    generateOTP,
    clinicLogin
   
}
