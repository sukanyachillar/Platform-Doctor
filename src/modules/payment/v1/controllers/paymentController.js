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
const getPgReport = async (req, res) => {
  try {
    let paymentReport = await paymentService.getPgReport(req.body, res);
    return paymentReport;
  } catch (err) {
    console.log({ err });
  }
};

const paymentVerify = async (req, res) => {
  try {
    let paymentVerify = await paymentService.paymentVerify(req.body, res);
    return paymentVerify;
  } catch (err) {
    console.log({ err });
  }
};

const verifyPaymentWebhook = async (req, res) => {
  try {
    let verifyPaymentWebhook = await paymentService.verifyPaymentWebhook(
      req.body,
      res
    );
    return verifyPaymentWebhook;
  } catch (err) {
    console.log({ err });
  }
};

export default {
  paymentCapture,
  paymentUpdate,
  paymentVerify,
  getPg,
  paymentFailed,
  getPgReport,
  verifyPaymentWebhook,
};
