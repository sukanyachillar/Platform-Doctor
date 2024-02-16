// awsUtils.js

import aws from 'aws-sdk'
import path from 'path'
// awsUtils.js

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})

const s3 = new aws.S3()

const uploadToS3 = async (file) => {
    const filename = file?.originalname
    const fileExtension = filename.split('.').pop()

    try {
        const uploadParams = {
            Bucket: 'chillar-platform-assets',
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
        const params = {
            Bucket:'chillar-platform-assets',
            Key: file.originalname,
           
          };

        const uploadResponse = await s3.upload(uploadParams).promise()
        const url = await getPresignUrlPromiseFunction(s3, params);

        console.log({url})
       //let data = await data(file)
       // console.log('uploadResponse', uploadResponse)

        return url;
    } catch (error) {
        console.error('Error uploading to S3:', error)
        throw error
    }
}

const getPresignUrlPromiseFunction=(s3, s3Params)=>{
    return new Promise(async (resolve, reject) => {
    try {
        await s3.getSignedUrl('getObject', s3Params, function (err,         data) {
    if (err) {
    return reject(err);
    }
    resolve(data);
  });
} catch (error) {
    return reject(error);
    }
  });
}


 

export default { uploadToS3 }
