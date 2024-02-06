import jwt from 'jsonwebtoken';
import config from '../../config.js'

let accessTokenSecret = config.JWT_SECRET;
let accessExpiry = config.JWT_REFRESH_EXPIRATION;

let refreshTokenSecret = config.REFRESH_JWT_SECRET;
let refreshExpiry = config.REFRESH_EXPIRY;


export const generateTokens = async(phone)=>{
    try{
        let accessToken = jwt.sign({phone},accessTokenSecret, {
            expiresIn: accessExpiry,
        });
        let refreshToken = jwt.sign({phone},refreshTokenSecret, {
            expiresIn: refreshExpiry
        });
        return {accessToken,refreshToken}

    }catch(err){
        console.log({err})
        return false;
    }
}

export const verifyToken =async(accessToken)=>{
    try{
        let verify = jwt.verify(accessToken,accessTokenSecret)
        return verify;

    }catch(err){
        console.log({err});
        return false;
    }
}

export const verifyRefreshToken =async(refreshToken)=>{
    try{
        let verify = jwt.verify(refreshToken,refreshTokenSecret)
        return verify;

    }catch(err){
        console.log({err});
        return false;
    }
}

