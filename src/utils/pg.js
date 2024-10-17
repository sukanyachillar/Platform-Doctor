import Razorpay from "razorpay";
import { nanoid, customAlphabet } from "nanoid";
import { Cashfree } from "cashfree-pg";
import axios from "axios";
// import { customAlphabet }  from ("nanoid");

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
      amount: amount,
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
    console.log("RazorpayORDER=>", { response });
    return response;
  } catch (err) {
    console.log({ Error: err });
    return err;
  }
};

const createCashfreeOrderData = async (body) => {
  let { name, phone, amount } = body;

  Cashfree.XClientId = process.env.CASHFREE_APP;
  Cashfree.XClientSecret = process.env.CASHFREE_SECRET;
  Cashfree.XEnvironment = process.env.SANDBOX;

  const orderId = await createOrderId();
  const customerId = await createCustomerId(name, phone);

  let request = {
    // order_id:"123sadassa45",
    order_amount: amount,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: customerId,
      customer_phone: phone,
    },
    order_meta: {
      // return_url: `http://localhost:4200/#/verify-payment?order_id=${orderId}`,
      return_url: `${process.env.RETURN_URL}/#/verify-payment?order_id=${orderId}`,
    },
  };


  let createOrderRes;

  try {
    // Use await to wait for the promise to resolve
    const response = await Cashfree.PGCreateOrder("2022-09-01", request);
    console.log("Order Created successfully:", response.data);

    // Assign the response to a variable
    createOrderRes = {
      cf_order_id: response.data.cf_order_id,
      customer_id: response.data.customer_details.customer_id,
      order_amount: response.data.order_amount,
      id: response.data.order_id,
      payment_session_id: response.data.payment_session_id,
    };

    return createOrderRes; // Return the created order data
  } catch (error) {
    console.error("Error:", error.response.data.message);
    throw error.response.data.message; // Rethrow the error to propagate it
  }
};


const createOrderId = () => {
  // generateOrderId.js

  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  const nanoid = customAlphabet(alphabet, 13); // 13 is the length of the ID

  // Generate the order ID
  const orderId = `DOC_${nanoid()}`;

  return orderId;
  // console.log("Generated Order ID:", orderId);
};

const createCustomerId = (name, phoneNumber) => {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const nanoid = customAlphabet(alphabet, 8); // 8 is the length of the random part of the ID

  // Sanitize and prepare the name and phone number parts
  const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5); // Take up to 5 alphanumeric characters from the name
  const sanitizedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "").slice(-4); // Take the last 4 digits of the phone number

  // Generate the customer ID
  const randomPart = nanoid();
  const customerId = `customer_${sanitizedName}${sanitizedPhoneNumber}${randomPart}`;

  return customerId;
};

const getPgReportOfRazorpay = async (startDt, endDt) => {
  const start = new Date(startDt)
  const end = new Date(endDt)
  const startDate = Math.floor(start.getTime() / 1000);
  const endDate = Math.floor(end.getTime() / 1000);

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });
    const payments = await razorpay.payments.all({
      from: startDate,
      to: endDate,
    });
    const paymentData = payments?.items.map((data, index) => ({
      paymentId: data.id,
      amount:data.amount,
      status:data.status,
      currency:data.currency,
      order_id:data.order_id,
      method:data.method,
      bank:data.bank,
      wallet:data.wallet,
      vpa:data.vpa,
      email:data.email,
      contact:data.contact,
      description:data.description,
      bankTransactionId:data.acquirer_data.bank_transaction_id,
      errorCode:data.error_code,
      errorDescription:data.error_description,
      errorSource:data.error_source,
      errorStep:data.error_step,
      errorReason:data.error_reason,
    }))
    return paymentData;
  } catch (error) {
    console.log("getPgReportOfRazorpayERROR::>", error);
    return error;
  }
}

const getPgReportOfCashfree = async (startDt, endDt) => {
  const start = new Date(startDt)
  const end = new Date(endDt)
  const startDate = Math.floor(start.getTime() / 1000);
  const endDate = Math.floor(end.getTime() / 1000);
  try {



    const auth = await axios.post(`https://sandbox.cashfree.com/gc/authorize`, {}, {
      headers: {
        "x-client-id": process.env.CASHFREE_APP,
        "x-client-secret": process.env.CASHFREE_SECRET,
        "x-api-version": '2023-04-01',
      }
    });
    console.log(auth.data);
    

    // const response = await axios.get(`https://sandbox.cashfree.com/gc/transactions`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.CASHFREE_APP}`,
    //   },
    //   params: {
    //     from: startDate,
    //     to: endDate
    //   }
    // });
    // console.log(response.data);
    

    // return response.data;

  } catch (error) {
    console.log("getPgReportOfCashfreeERROR::>", error);
    return error;
  }
}

export default {
  createPaymentLink,
  createCashfreeOrderData,
  createOrderId,
  createCustomerId,
  getPgReportOfRazorpay,
  getPgReportOfCashfree
};
