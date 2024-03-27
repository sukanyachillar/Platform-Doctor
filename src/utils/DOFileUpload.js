import { PutObjectCommand, S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadObject = async (file) => {
  try {
    const filename = file?.originalname;
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
      ACL: "private",   
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

// // Exporting the function to be used elsewhere
// export default { uploadObject };


// import AWS from "aws-sdk";

// const uploadObject = async (file) => {
//     const filename = file?.originalname;
//     const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

//     const s3 = new AWS.S3({
//                          endpoint: spacesEndpoint, 
//                          accessKeyId: process.env.DO_SPACES_KEY, 
//                          secretAccessKey: process.env.DO_SPACES_SECRET
//                         });

    
//     s3.putObject({
//           Bucket: process.env.DO_SPACES_NAME, 
//           Key: filename, 
//           Body: file.buffer, 
//           ACL: "public"}, (err, data) => {
//         if (err) return console.log(err);
//         console.log("Your file has been uploaded successfully!", data);
//     });
// }


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

    const params = {
      Bucket: process.env.DO_SPACES_NAME,
      Key: objectKey,
      // Expires: expirationInSeconds
    };

    const command = new GetObjectCommand(params);
    const url = await getSignedUrl(s3Client, command, { expiresIn: expirationInSeconds });
   

    // const command = new GetObjectCommand(params);
    // const url = await s3Client.getSignedUrl(command);
    // console.log("url", url)
    return url;
  } catch (err) {
    console.error("Error generating pre-signed URL:", err);
    throw err;
  }
};

// Usage example:
// const presignedUrl = await getPresignedUrl('example.jpg', 3600); // Generates a URL valid for 1 hour
// console.log("Pre-signed URL:", presignedUrl);

export default { uploadObject, getPresignedUrl };