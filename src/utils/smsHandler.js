import axios from "axios";

const sendSms = async (content, phone,templateId) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `http://sapteleservices.in/SMS_API/sendsms.php?username=chillar&password=chillar@123&mobile=${phone}&sendername=CHLLAR&message=${content}&routetype=1&tid=${templateId}`,
    headers: {},
  };

  try {
    const response = await axios.request(config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


export default {
  sendSms,
};
