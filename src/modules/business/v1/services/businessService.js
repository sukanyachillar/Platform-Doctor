import { handleResponse } from "../../../../utils/handlers.js";
import businessModel from "../../../../models/businessModel.js";
import { Op } from 'sequelize';

const addBusiness = async (data, res) => {
  try {
    let { businessName } = data;
    let businessData = await businessModel.findOne({ where:{businessName} });
    console.log({businessData})
    let message, statusCode, response, newData;
    if (businessData) {
      message = "Business with same name already exist.";
      statusCode = 422;
    } else {
      newData = await new businessModel({ businessName });
      response = await newData.save();
      message = "Business registered.";
      statusCode = 200;
    }
    return handleResponse({
      res,
      statusCode,
      message,
      data: {
        response,
      },
    });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error while adding data.",
      statusCode: 404,
    });
  }
};

const listBusiness = async (requestData, res) => {
  try {
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;
    const { count, rows: categoryList } = await businessModel.findAndCountAll({
      where: {
        [Op.or]: [
          { businessName: { [Op.like]: `%${searchQuery}%` } }, 
        ],
      },
      attributes: ["businessName", "businessId", "categoryKey", "status"],
      limit: pageSize,
      offset: offset,
    });

    const formattedResponse = categoryList.map(category => ({
      catId: category.businessId,
      catName: category.businessName,
      catKey: category.categoryKey,
      catStatus: category.status,
   }));

    const totalPages = Math.ceil(count / pageSize);
    return handleResponse({
      res,
      message: "Sucessfully fetched business list",
      statusCode: 200,
      data: {
        categoryList: formattedResponse,
        totalPages,
        totalCount: count,
        page,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Unable to fetch business list",
      statusCode: 404,
    });
  }
};

export default { addBusiness, listBusiness };
