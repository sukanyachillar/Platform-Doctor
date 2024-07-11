import Razorpay from "razorpay";
import { nanoid } from "nanoid";
import { Cashfree } from "cashfree-pg";

const createPaymentLink = async (body) => {
  let reference_id = nanoid();
  let { name, phone, amount } = body;
  try {
    // let body = {
    //     amount,
    //     currency: "INR",
    //     accept_partial: false,
    //     reference_id,
    //     customer: {
    //       name,
    //       contact: phone,
    //     },
    //     notify: {
    //       sms: true,
    //     },
    //     reminder_enable: true,
    //     callback_url: "https://example-callback-url.com/",
    //     callback_method: "get"
    // }   //Uncomment for payment link
    let body = {
      amount: 1000,
      currency: "INR",
      receipt: reference_id,
    };
    let razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    // let response = await razorpay.paymentLink.create(
    //     body
    // )
    let response = await razorpay.orders.create(body);
    console.log({ response });
    return response;
  } catch (err) {
    console.log({ Error: err });
    return err;
  }
};

const createCashfreeOrderData = async () => {
  Cashfree.XClientId = process.env.CASHFREE_APP;
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET;
  Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

  var request = {
    // order_id:"123sadassa45",
    order_amount: 1,
    order_currency: "INR",
    order_id: "order_346927455",
    customer_details: {
      customer_id: "walterwNrcMi",
      customer_phone: "9999999999",
    },
    order_meta: {
      return_url:
        "https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id={order_id}",
    },
  };
  Cashfree.PGCreateOrder("2022-09-01", request)
    .then((response) => {
      console.log("Order Created successfully:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error.response.data.message);
    });
};

// const createCashfreePaymentLink = async (body) => {
//   let referenceId = nanoid();
//   let { name, phone, amount } = body;

//   try {
//     let headers = {
//       "Content-Type": "application/json",
//       "x-client-id": process.env.CASHFREE_APP_ID,
//       "x-client-secret": process.env.CASHFREE_SECRET_KEY,
//     };

//     let data = {
//       order_id: referenceId,
//       order_amount: amount,
//       order_currency: "INR",
//       customer_details: {
//         customer_name: name,
//         customer_email: "your@email.com", // Use actual email
//         customer_phone: phone,
//       },
//       order_note: "Appointment Booking",
//       return_url: "https://example-callback-url.com/",
//       notify_url: "https://example-notify-url.com/",
//     };

//     let response = await axios.post(
//       "https://api.cashfree.com/pg/orders",
//       data,
//       { headers }
//     );

//     if (response.data.status === "OK") {
//       let paymentLink = response.data.payment_link;
//       console.log({ paymentLink });
//       return paymentLink;
//     } else {
//       throw new Error("Failed to create payment link");
//     }
//   } catch (err) {
//     console.log({ Error: err });
//     return err;
//   }
// };

export default {
  createPaymentLink,
  createCashfreeOrderData,
};
