import axios from "axios";
import { handleResponse } from "../../../../utils/handlers.js";
import paymentService from "../services/paymentServices.js";

const paymentCapture = async (req, res) => {
  try {
    let payment = await paymentService.paymentStatusCapture(req, res);
    return payment;
  } catch (err) {
    console.log({ err });
  }
};

const paymentUpdate = async (req, res) => {
  try {
    let payment = await paymentService.paymentUpdate(req.body, res);
    return payment;
  } catch (err) {
    console.log({ err });
  }
};

const paymentFailed = async (req, res) => {
  try {
    let payment = await paymentService.paymentFailUpdate(req.body, res);
    return payment;
  } catch (err) {
    console.log({ err });
  }
};

const getPg = async (req, res) => {
  try {
    let payment = await paymentService.findPaymentGateway(req.body, res);
    return payment;
  } catch (err) {
    console.log({ err });
  }
};

const paymentVerify = async (req, res) => {
  const { orderId } = req.body;
  try {
    const options = {
      method: "GET",
      url: `https://sandbox.cashfree.com/pg/orders/${orderId}`,
      headers: {
        accept: "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": process.env.CASHFREE_APP,
        "x-client-secret": process.env.CASHFREE_SECRET,
      },
    };

    axios
      .request(options)
      .then(function (response) {
        console.log("GETorders==>",response.data);
        const data = response.data;
        return handleResponse({
          res,
          message: "verify status",
          statusCode: 200,
          data,
        });
      })
      .catch(function (error) {
        console.error(error);
      });
  } catch (err) {
    console.log({ err });
  }
};

export default { paymentCapture, paymentUpdate, paymentVerify,getPg ,paymentFailed};
