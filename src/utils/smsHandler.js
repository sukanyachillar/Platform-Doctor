import axios from "axios";

const sendSms = async (content, phone) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `http://sapteleservices.in/SMS_API/sendsms.php?username=chillar&password=chillar@123&mobile=${phone}&sendername=CHLLAR&message=${content}&routetype=1&tid=1607100000000323224`,
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
