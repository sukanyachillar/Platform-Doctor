
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
    try {
        const uploadParams = {
            Bucket: 'chillar-platform-assets',
            Key: filename,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
        const uploadResponse = await s3.upload(uploadParams).promise()
        return uploadResponse
    } catch (error) {
        console.error('Error uploading to S3:', error)
        throw error
    }
}

const getPresignUrlPromiseFunction = async (Key) => {
    return new Promise(async (resolve, reject) => {
        try {
            let s3Params = {
                Bucket: 'chillar-platform-assets',
                Key,
            }
            console.log({ s3 })
             s3.getSignedUrl('getObject', s3Params, function (err, data) {
                if (err) {
                    return reject(err)
                }
                resolve(data)
            })
        } catch (error) {
            return reject(error)
        }
    })
}

export default { uploadToS3, getPresignUrlPromiseFunction }
