import jwt from 'jsonwebtoken';
import config from '../../config.js'
import CryptoJS from 'crypto-js';
import { handleResponse } from './handlers.js';
import entityModel from '../models/entityModel.js'

let accessTokenSecret = config.JWT_SECRET;
let accessExpiry = config.JWT_REFRESH_EXPIRATION;

let refreshTokenSecret = config.REFRESH_JWT_SECRET;
let refreshExpiry = config.REFRESH_EXPIRY;

export const generateTokens = async(phone)=>{
    try{
        let encryptData = await encrypt(phone,process.env.CRYPTO_SECRET)
        let accessToken = jwt.sign({phone:encryptData},accessTokenSecret, {
            expiresIn: accessExpiry,
        });
        let refreshToken = jwt.sign({phone:encryptData},refreshTokenSecret, {
            expiresIn: refreshExpiry
        });
        return {accessToken,refreshToken}

    }catch(err){
        console.log({err})
        return false;
    }
}

export const verifyToken =async(req,res,next)=>{
    try{
        let authHeader = req.headers.authorization;
        let accessToken = authHeader.split(' ')[1];
        let verify = jwt.verify(accessToken, accessTokenSecret)
        if(verify){
            let phone = await decrypt(verify.phone,process.env.CRYPTO_SECRET);
            verify.phone = phone
            let entity = await entityModel.findOne({where:{phone},attributes:['entity_id']})
            let dataValues = entity.get();
            verify.entity_id = dataValues.entity_id
            req.user = verify
            next();
        }
    }catch(err){
        console.log({err});

        return res.status(403).json({ statusCode:403, message:'Token expired' });
    }
}

export const verifyRefreshToken =async(req,res)=>{
    try{
        let authHeader = req.headers.authorization;
        let refreshToken = authHeader.split(' ')[1];
        let verify = jwt.verify(refreshToken,refreshTokenSecret)
 
        let accessToken = jwt.sign({phone:verify.phone},accessTokenSecret, {
            expiresIn: accessExpiry
        });
        return res.status(200).json({
            statusCode:200,
            message:"Successfully generated access token.",
            data:{
                accessToken
            }
        })

    }catch(err){
        console.log({err});
        return res.status(403).json({ statusCode:403, message:'Token expired' });

    }
}





const  encrypt = async(data, key)=> {
    const encryptedData = CryptoJS.AES.encrypt(data, key).toString();
    return encryptedData;
}

// Function to decrypt data
const decrypt= async(encryptedData, key) =>{
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decryptedData;
}





