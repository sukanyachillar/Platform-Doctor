import axios from "axios";

const sendSms = async (content,phone) => {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `http://sapteleservices.in/SMS_API/sendsms.php?username=chillar&password=chillar@123&mobile=${phone}&sendername=CHLLAR&message=${content}&routetype=1&tid=1607100000000323224`,
    headers: {},
  };
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

export default {
  sendSms,
};
