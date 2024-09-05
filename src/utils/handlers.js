// export const handleResponse = async (responseObj) => {

import logModel from "../models/logModel.js";

//     const { res, statusCode, message, data } = responseObj;
//     try {
//         return res.status(200).json({ statusCode, message, data })
//     } catch (error) {
//         console.log(error)
//         return res
//             .status(500)
//             .json({ statusCode: '500', message: 'INTERNAL_ERROR' })
//     }
// }

export const handleResponse = async (responseObj) => {
  const { res, statusCode, message, data } = responseObj;
  const { logId } = res;

  try {
    // Send the response
    const response = res.status(200).json({ statusCode, message, data });

    // Update the log entry with response data
    if (logId) {
      await logModel.update(
        {
          responseStatus: statusCode,
          responseData: data,
        },
        {
          where: { logId },
        }
      );
    }

    return response;
  } catch (error) {
    console.log(error);

    // Update the log entry with error information
    if (logId) {
      await logModel.update(
        {
          responseStatus: 500,
          errorMessage: "INTERNAL_ERROR",
        },
        {
          where: { logId },
        }
      );
    }

    return res
      .status(500)
      .json({ statusCode: "500", message: "INTERNAL_ERROR" });
  }
};
