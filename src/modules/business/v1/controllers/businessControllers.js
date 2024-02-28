import businessService from "../services/businessService.js";

const addBusiness = async (req, res) => {
  try {
    let data = await businessService.addBusiness(req.body, res);
    return data;
  } catch (error) {
    console.log({ error });
  }
};

const listBusiness = async (req, res) => {
  try {
    let data = await businessService.listBusiness(req.query, res);
    return data;
  } catch (error) {
    console.log({ error });
  }
};

export default {
  addBusiness,
  listBusiness,
};
