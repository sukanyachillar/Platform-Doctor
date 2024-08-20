import { handleResponse } from "../../../../utils/handlers.js";
import workScheduleSevices from "../services/workScheduleSevices.js";

const addWorkSchedule = async (req, res) => {
  try {
    const workSchedule = await workScheduleSevices.addWorkSchedule(
      req.body,
      req.user,
      res
    );
    return workSchedule;
  } catch (error) {
    console.log({ error });
  }
};

const addWorkScheduleFromAdmin = async (req, res) => {
  try {
    const workSchedule = await workScheduleSevices.addWorkScheduleFromAdmin(
      req.body,
      res
    );
    return workSchedule;
  } catch (error) {
    console.log({ error });
  }
};

const addWork = async (req, res) => {
  try {
    const workSchedule = await workScheduleSevices.addWork(
      req.user,
      req.body,
      res
    );
    return workSchedule;
  } catch (error) {
    console.log({ error });
  }
};

const updateWorkScheduleStatus = async (req, res) => {
  try {
    const updatedStatus = await workScheduleSevices.updateWorkScheduleStatus(
      req.body,
      res
    );
    return updatedStatus;
  } catch (error) {
    console.log({ error });
  }
};

const getWorkSchedule = async (req, res) => {
  try {
    const workData = await workScheduleSevices.getWorkSchedule(
      req.body,
      req.user,
      res
    );
    return workData;
  } catch (error) {
    console.log({ error });
  }
};

const listWorkSchedule = async (req, res) => {
  try {
    const workData = await workScheduleSevices.listWorkSchedule(req, res);
    return workData;
  } catch (error) {
    console.log({ error });
  }
};

const getWorkSlot = async (req, res) => {
  try {
    let workScheduleSlot = await workScheduleSevices.getSingleWorkSchedule(
      req,
      res
    );
    return workScheduleSlot;
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error. Please try again later",
      statusCode: 404,
    });
  }
};
const docAvailability = async (req, res) => {
  try {
    let docAvailData = await workScheduleSevices.docAvail(
      req.body,
      req.user,
      res
    );
    return docAvailData;
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error. Please try again later",
      statusCode: 404,
    });
  }
};

export default {
  updateWorkScheduleStatus,
  addWorkSchedule,
  getWorkSchedule,
  getWorkSlot,
  addWork,
  listWorkSchedule,
  addWorkScheduleFromAdmin,
  docAvailability
};
