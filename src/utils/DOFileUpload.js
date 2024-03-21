// import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

// const uploadObject = async (file) => {
//   try {
//     const filename = file?.originalname;

//     const s3Client = new S3Client({
//         endpoint: "https://britto.blr1.digitaloceanspaces.com",
//         forcePathStyle: false,
//         region: "blr1",
//         credentials: {
//             accessKeyId: process.env.DO_SPACES_KEY,
//             secretAccessKey: process.env.DO_SPACES_SECRET
//         }
//     });
//     const params = {
//       Bucket: "britto", 
//       Key: filename,    
//       Body: file.buffer, 
//       ACL: "private",   
//     };

//     const data = await s3Client.send(new PutObjectCommand(params));
    
//     console.log("Successfully uploaded object:", params.Bucket + "/" + params.Key);
    
//     return data;
//   } catch (err) {
//     // Logging any errors encountered during the upload process
//     console.log("Error:", err);
//   }
// };

// // Exporting the function to be used elsewhere
// export default { uploadObject };


import AWS from "aws-sdk";

const uploadObject = async (file) => {
    const filename = file?.originalname;
    const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);

    const s3 = new AWS.S3({endpoint: spacesEndpoint, accessKeyId: process.env.DO_SPACES_KEY, secretAccessKey: process.env.DO_SPACES_SECRET});

    
    s3.putObject({Bucket: process.env.DO_SPACES_NAME, Key: filename, Body: file.buffer, ACL: "public"}, (err, data) => {
        if (err) return console.log(err);
        console.log("Your file has been uploaded successfully!", data);
    });
}


export default { uploadObject };