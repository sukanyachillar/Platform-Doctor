// src/middleware/apiLogger.js

import apiLogModel from "../models/apiLogModel.js";

const apiLogger = async (req, res, next) => {
    let responseBody;
  const start = Date.now();

  try {
    // Capture the original res.json() method to intercept the response body
    const originalJson = res.json;
    res.json = function (data) {
      responseBody = data;
      return originalJson.apply(res, arguments);
    };
    console.log("RES===>", res);

    await next();

    const end = Date.now();
    const responseTime = end - start;

    // Log request and response details
    await apiLogModel.create({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      responseTime: responseTime,
      responseBodySize: res.get("Content-Length") || 0,
      requestData: req.body,
      responseData: res.status == 200 ? res.body : null,
      userId: req.user ? req.user.id : null,
    });
  } catch (error) {
    console.error("Error logging API request:", error);
  }
};

export default apiLogger;
