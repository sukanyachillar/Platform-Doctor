import { hashPassword, comparePasswords } from '../../../utils/password.js';
import { generateAdminTokens } from '../../../utils/token.js';
import { generateUuid } from '../../../utils/generateUuid.js';
import { handleResponse } from '../../../utils/handlers.js';
import { Op, Sequelize } from 'sequelize';
// import { encrypt } from '../../../../utils/token.js';
import entityModel from '../../../models/entityModel.js';
import userModel from '../../../models/userModel.js';


// const adminRegister = async (credentials, res) => {
//     try {
//         let { email, phone, password, name } = credentials
//         let data = await userModel.findOne({ where: { phone } })
//         if (data) {
//             return handleResponse({
//                 res,
//                 statusCode: 404,
//                 message: 'Admin registeration not possible',
//             })
//         }
//         let uuid = await generateUuid()
//         let hashedPassword = await hashPassword(password)

//         let newData = await new userModel({
//             phone,
//             name,
//             uuid,
//             userType: 0,
//             email,
//             password: hashedPassword,
//         })
//         await newData.save()
//         return handleResponse({
//             res,
//             message: 'Successfully registered user',
//             statusCode: 200,
//         })
//     } catch (err) {
//         console.log({ err })
//     }
// }

const clinicLogin = async (credentials, res) => {
    try {
        let { email, password } = credentials;
        let userData = await userModel.findOne({
            where: { email },
            attributes: ['password', 'userType'],
        });
        let passwordCheck = await comparePasswords(password, userData.password)
        if (!passwordCheck)
            return handleResponse({
                res,
                message: 'Please check the credentials',
                statusCode: 404,
            });
        let tokens = await generateAdminTokens(email);
        const getClinic = await entityModel.findOne({ where : { email }, attributes: ['entity_id'], });
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully signed in.',
            data: {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
                clinicId: getClinic.entity_id,
                userType: userData.userType,
            },
        })
    } catch (err) {
        console.log({ err })
        return handleResponse({
            res,
            message: 'Sorry! Unable to login',
            statusCode: 404,
        })
    }
}



export default {
    clinicLogin,
    // adminRegister,
   
}
