import { PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadObject = async (file) => {
  try {
    const filename = file?.originalname;
    console.log("filename", filename)
    const s3Client = new S3Client({
        endpoint: process.env.DO_SPACES_ENDPOINT,
        region: "us-east-1",
        forcePathStyle: true,
        credentials: {
            accessKeyId: process.env.DO_SPACES_KEY,
            secretAccessKey: process.env.DO_SPACES_SECRET
        }
    });
    const params = {
      Bucket: process.env.DO_SPACES_NAME, 
      Key: filename,    
      Body: file.buffer, 
      ACL: "public-read",   
    };

    const data = await s3Client.send(new PutObjectCommand(params));
    const objectUrl = `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_NAME}/${filename}`;

    console.log("Successfully uploaded object:", params.Bucket + "/" + params.Key);
    return objectUrl;
  } catch (err) {
    // Logging any errors encountered during the upload process
    console.log("Error:", err);
  }
};


const getPresignedUrl = async (objectKey, expirationInSeconds) => {
  try {
    const s3Client = new S3Client({
      endpoint: process.env.DO_SPACES_ENDPOINT,
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.DO_SPACES_KEY,
        secretAccessKey: process.env.DO_SPACES_SECRET
      }
    });

    const command = new GetObjectCommand({
      Bucket: process.env.DO_SPACES_NAME,
      Key: objectKey,
    });
    let url;
    if(objectKey) {
      url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } else {
      url = ""
    }

    // console.log("url===============>", url)

    return url;
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
    throw err;
  }
};

export default { uploadObject, getPresignedUrl };