import { PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadObject = async (file) => {
  console.log("inside upload object", file)
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
    const objectUrl = `${process.env.DO_SPACES_ENDPOINT}${process.env.DO_SPACES_NAME}/${filename}`;
    
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

    // Construct the GetObjectCommand to retrieve the uploaded object
    const command = new GetObjectCommand({
      Bucket: process.env.DO_SPACES_NAME,
      Key: objectKey,
    });

    // Generate the pre-signed URL for the GetObjectCommand
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    // console.log("url===============>", url)

    return url;
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
    throw err;
  }
};

export default { uploadObject, getPresignedUrl };