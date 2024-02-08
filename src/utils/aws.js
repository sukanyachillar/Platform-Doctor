
import aws from 'aws-sdk';
import path from 'path';

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const s3 = new aws.S3();

const uploadToS3 = async (file) => {
  
  const filename = file?.originalname;
  const fileExtension = filename.split(".").pop();

  try {
    const uploadParams = {
      Bucket: 'chillar-platform-assets',
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const uploadResponse = await s3.upload(uploadParams).promise();
    
    console.log("uploadResponse", uploadResponse);
    
    return uploadResponse;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

export default { uploadToS3 };
