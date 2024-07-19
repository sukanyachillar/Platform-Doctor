import userModel from "../../../../models/userModel.js";
import doctorModel from "../../../../models/doctorModel.js";
import entityModel from "../../../../models/entityModel.js";
import departmentModel from "../../../../models/departmentModel.js";
import paymentModel from "../../../../models/paymentModel.js";
import bookingModel from "../../../../models/bookingModel.js";
import weeklyTimeSlotsModel from "../../../../models/weeklyTimeSlotsModel.js";
import entityAddressModel from "../../../../models/entityAddressModel.js";
import doctorEntityModel from "../../../../models/doctorEntityModel.js";
import { hashPassword, comparePasswords } from "../../../../utils/password.js";
import { generateAdminTokens } from "../../../../utils/token.js";
import { generateUuid } from "../../../../utils/generateUuid.js";
import { handleResponse } from "../../../../utils/handlers.js";
import { Op, Sequelize } from "sequelize";
import DigitalOceanUtils from "../../../../utils/DOFileUpload.js";
import { encrypt } from "../../../../utils/token.js";
import districtModel from "../../../../models/districtModel.js";
import stateModel from "../../../../models/stateModel.js";
import moment from "moment";
import { getEntityDetailsOfTheDr } from "../../../authentication/v1/services/authenticationService.js";

const adminRegister = async (credentials, res) => {
  try {
    let { email, phone, password, name } = credentials;
    let data = await userModel.findOne({ where: { phone } });
    if (data) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Admin registeration not possible",
      });
    }
    let uuid = await generateUuid();
    let hashedPassword = await hashPassword(password);

    let newData = await new userModel({
      phone,
      name,
      uuid,
      userType: 0,
      email,
      password: hashedPassword,
    });
    await newData.save();
    return handleResponse({
      res,
      message: "Successfully registered user",
      statusCode: 200,
    });
  } catch (err) {
    console.log({ err });
  }
};

const adminLogin = async (credentials, res) => {
  try {
    let { email, password } = credentials;
    let userData = await userModel.findOne({
      where: { email },
      attributes: ["password"],
    });
    let passwordCheck = await comparePasswords(password, userData.password);
    if (!passwordCheck)
      return handleResponse({
        res,
        message: "Please check the credentials",
        statusCode: 404,
      });
    let tokens = await generateAdminTokens(email);
    return handleResponse({
      res,
      statusCode: 200,
      message: "Successfully signed in.",
      data: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        userType: 0,
      },
    });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Sorry! Unable to login",
      statusCode: 404,
    });
  }
};

const addDept = async (deptData, res) => {
  try {
    let { department_name } = deptData;
    // let { entity_id } = userData
    let status = 1;
    let dept, message, statusCode;
    dept = await departmentModel.findOne({
      where: { department_name },
    });
    message = "Department already exist.";
    statusCode = 422;
    if (!dept) {
      let newDept = new departmentModel({
        // entity_id,
        department_name,
        status,
      });
      dept = await newDept.save();
      message = "Department added";
      statusCode = 200;
    }
    return handleResponse({
      res,
      statusCode,
      message,
      data: {
        department_id: dept.department_id,
        // entity_id: dept.entity_id,
        status: dept.status,
        department_name: dept.department_name,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while adding department.",
    });
  }
};

const updateDept = async (deptData, res) => {
  try {
    let { department_id, department_name, status } = deptData;
    let dept = await departmentModel.findByPk(department_id);
    let isDept = await departmentModel.findOne({
      where: { department_name },
    });
    if (isDept) {
      return handleResponse({
        res,
        statusCode: 422,
        message: "Department already exist !",
      });
    }
    if (!dept) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Department not found.",
      });
    }

    dept.department_name = department_name;
    dept.status = status;

    await dept.save();

    return handleResponse({
      res,
      statusCode: 200,
      message: "Department updated successfully.",
      data: {
        department_id: dept.department_id,
        status: dept.status,
        department_name: dept.department_name,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while updating department.",
    });
  }
};

const departmentList = async (requestData, params, res) => {
  try {
    // let { clinicId } = requestData;
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.limit) || 100;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;

    let whereCondition = {
      status: 1,
      [Op.or]: [{ department_name: { [Op.like]: `%${searchQuery}%` } }],
    };

    // if (clinicId) {
    //     whereCondition.clinicId = clinicId;
    // }

    const { count, rows: data } = await departmentModel.findAndCountAll({
      attributes: ["department_id", "department_name", "status"],
      where: whereCondition,
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(count / pageSize);
    if (data) {
      return handleResponse({
        res,
        message: "Successfully fetched data",
        statusCode: 200,
        data: {
          data,
          currentPage: page,
          totalPages,
          totalCount: count,
        },
      });
    }
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Failed in loading department list.",
      statusCode: 404,
    });
  }
};

const deleteDept = async ({ department_id }, res) => {
  try {
    let dept = await departmentModel.findByPk(department_id);
    if (!dept) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Department not found.",
      });
    }

    await dept.destroy();

    return handleResponse({
      res,
      statusCode: 200,
      message: "Department deleted successfully.",
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while deleting department.",
    });
  }
};

// const doctorsList = async (requestData, res) => {
//     try {
//         const page = parseInt(requestData.page) || 1
//         const pageSize = parseInt(requestData.limit) || 10
//         const searchQuery = requestData.searchQuery || ''
//         const offset = (page - 1) * pageSize

//         const { count, rows: records } = await doctorModel.findAndCountAll({
//             attributes: [
//                 'doctor_id',
//                 'doctor_name',
//                 'qualification',
//                 'doctor_phone',
//                 'consultation_time',
//                 'consultation_charge',
//                 'status',
//                 'description',
//                 'department_id',
//                 'entity_id',
//             ],
//             where: {
//                 [Op.or]: [
//                     { doctor_name: { [Op.like]: `%${searchQuery}%` } }, // Search for doctor_name containing the search query
//                     { doctor_phone: { [Op.like]: `%${searchQuery}%` } }, // Search for phone containing the search query
//                 ],
//             },
//             limit: pageSize,
//             offset: offset,
//         })
//         const totalPages = Math.ceil(count / pageSize) // Calculate total number of pages

//         const departmentIds = records.map((record) => record.department_id)
//         const entityIds = records.map((record) => record.entity_id)
//         const departments = await departmentModel.findAll({
//             where: {
//                 department_id: departmentIds,
//             },
//             attributes: ['department_id', 'department_name'],
//         })

//         const entities = await entityModel.findAll({
//             where: {
//                 entity_id: entityIds,
//             },
//             attributes: ['entity_id', 'entity_name'],
//         })
//         const departmentMap = {}
//         departments.forEach((department) => {
//             departmentMap[department.department_id] = department.department_name
//         })

//         const entityMap = {}
//         entities.forEach((entity) => {
//             entityMap[entity.entity_id] = entity.entity_name
//         })

//         // Merging department_name and entity_name into doctor records
//         records.forEach((record) => {
//             record.department_name = departmentMap[record.department_id]
//             record.entity_name = entityMap[record.entity_id]
//             delete record.department_id // Optional: Remove department_id and entity_id from the record
//             delete record.entity_id
//         })
//         const response = {
//             records: records.map((record) => ({
//                 ...record.dataValues,
//                 department_name: record.department_name,
//                 entity_name: record.entity_name,
//             })),
//         }
//         console.log(response)
//         return handleResponse({
//             res,
//             statusCode: '200',
//             data: {
//                 response: response.records,
//                 currentPage: page,
//                 totalPages,
//                 totalCount: count,
//             },
//         })
//     } catch (error) {
//         console.log({ error })
//     }
// };

// const entityList = async (requestData, res) => {
//     try {
//         const page = parseInt(requestData.page) || 1;
//         const pageSize = parseInt(requestData.limit) || 10;
//         const businessType = parseInt(requestData.businessType) || 0;
//         const searchQuery = requestData.searchQuery || '';
//         const offset = (page - 1) * pageSize

//         let whereCondition = {
//             status: 1,
//             entity_name: {
//                 [Sequelize.Op.ne]: null,
//             }
//         };

//         if (businessType !== 0) {
//             whereCondition.entity_type = businessType;
//         }

//         if (searchQuery) {
//             whereCondition[Sequelize.Op.or] = [
//                 { entity_name: { [Sequelize.Op.like]: `%${searchQuery}%` } },
//                 { description: { [Sequelize.Op.like]: `%${searchQuery}%` } },
//                 { phone: { [Sequelize.Op.like]: `%${searchQuery}%` } },
//                 { email: { [Sequelize.Op.like]: `%${searchQuery}%` } },
//             ];
//         }
//         const { count, rows: data } = await entityModel.findAndCountAll({
//             attributes: [
//                 'entity_id',
//                 'entity_name',
//                 'description',
//                 'status',
//                 'imageUrl',
//                 'phone',
//                 'location',
//                 'email',
//             ],
//             where: whereCondition,
//             limit: pageSize,
//             offset: offset,
//         })

//         const preSignedUrls = await Promise.all(data.map(async (entity) => {
//             const preSignedUrl = await DigitalOceanUtils.getPresignedUrl(entity.imageUrl);
//             return { ...entity.toJSON() };
//         }));

//         const totalPages = Math.ceil(count / pageSize)
//         let message
//         if (data) message = 'Sucessfully fetched data'
//         else message = 'No data found'

//         const encryptedEntities = await Promise.all(preSignedUrls.map(async (entity) => {
//             const encryptedEntityId = await encrypt(entity.entity_id.toString(), process.env.CRYPTO_SECRET);
//             return { ...entity, encryptedEntityId };
//         }));
//         return handleResponse({
//             res,
//             message,
//             statusCode: 200,
//             data: {
//                 data: encryptedEntities,
//                 currentPage: page,
//                 totalCount: count,
//                 // data,
//                 totalPages,
//             },
//         })
//     } catch (err) {
//         console.log({ err })
//     }
// }

const listDoctors_admin = async (requestParams, requestData, res) => {
  try {
    const page = parseInt(requestParams.page) || 1;
    const pageSize = parseInt(requestParams.limit) || 10;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;
    let whereCondition = {};
    const entityType = requestData.entityType;
    let entityWhereCond = {};

    if (searchQuery) {
      whereCondition[Op.or] = [
        { doctor_name: { [Op.like]: `%${searchQuery}%` } },
        { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
        { "$department.department_name$": { [Op.like]: `%${searchQuery}%` } },
        {
          "$doctorEntity.entity.entity_name$": {
            [Op.like]: `%${searchQuery}%`,
          },
        },
      ];
    }

    if (entityType) entityWhereCond = { entity_type: entityType };

    const { count, rows: records } = await doctorModel.findAndCountAll({
      attributes: [
        "doctor_id",
        "doctor_name",
        "qualification",
        "doctor_phone",
        "status",
        "profileImageUrl",
        "department_id",
      ],
      where: whereCondition,
      include: [
        {
          model: departmentModel,
          attributes: ["department_name"],
        },
        {
          model: doctorEntityModel,
          attributes: ["consultationTime", "consultationCharge"],
          required: true,
          include: [
            {
              model: entityModel,
              attributes: ["entity_name", "entity_id", "entity_type"],
              where: entityWhereCond,
              required: true,
            },
          ],
        },
      ],
      limit: pageSize,
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    const totalPages = Math.ceil(count / pageSize);

    const formattedResponse = {
      records: records.map((record) => ({
        doctorId: record.doctor_id,
        doctorName: record.doctor_name,
        department: record.department.department_name,
        entityId: record.doctorEntity
          ? record.doctorEntity.entity.entity_id
          : "",
        entityName: record.doctorEntity
          ? record.doctorEntity.entity.entity_name
          : "",
        entityType: record.doctorEntity
          ? record.doctorEntity.entity.entity_type
          : "",
        doctorPhone: record.doctor_phone,
        profileImageUrl: record.profileImageUrl,
        status: record.status,
      })),
      currentPage: page,
      totalPages: Math.ceil(count / pageSize),
      totalCount: count,
    };

    return handleResponse({
      res,
      statusCode: 200,
      data: {
        doctorList: formattedResponse.records,
        currentPage: page,
        totalPages,
        totalCount: count,
      },
    });
  } catch (error) {
    console.error({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

// const doctorsList = async (requestData, res) => {
//     try {
//         const page = parseInt(requestData.page) || 1;
//         const pageSize = parseInt(requestData.limit) || 10;
//         const searchQuery = requestData.searchQuery || '';
//         const entityId = requestData.entityId;
//         const offset = (page - 1) * pageSize;

//         const whereCondition = {
//             [Op.or]: [
//                 { doctor_name: { [Op.like]: `%${searchQuery}%` } },
//                 { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
//             ],
//         };

//         if (entityId) {
//             whereCondition.entity_id = entityId;
//         }

//         const { count, rows: records } = await doctorModel.findAndCountAll({
//             attributes: [
//                 'doctor_id',
//                 'doctor_name',
//                 'qualification',
//                 'doctor_phone',
//                 'consultation_time',
//                 'consultation_charge',
//                 'status',
//                 'description',
//             ],
//             where: whereCondition,
//             include: [
//                 {
//                     model: departmentModel,
//                     attributes: ['department_name'],
//                 },
//                 {
//                     model: entityModel,
//                     attributes: ['entity_name'],
//                     where: {
//                         entity_name: { [Op.like]: `%${searchQuery}%` },
//                     },
//                     required: true,
//                 },
//             ],
//             limit: pageSize,
//             offset: offset,
//         });

//         const totalPages = Math.ceil(count / pageSize);

//         return handleResponse({
//             res,
//             statusCode: 200,
//             data: {
//                 records,
//                 currentPage: page,
//                 totalPages,
//                 totalCount: count,
//             },
//         });
//     } catch (error) {
//         console.error({ error });
//         return handleResponse({
//             res,
//             statusCode: 500,
//             message: 'Something went wrong',
//             data: {},
//         });
//     }
// };

const entityList = async (requestData, res) => {
  try {
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const businessType = parseInt(requestData.businessType) || 0;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;

    let whereCondition = {
      status: 1,
      entity_name: {
        [Sequelize.Op.ne]: null,
      },
    };

    if (businessType !== 0) {
      whereCondition.entity_type = businessType;
    }

    if (searchQuery) {
      whereCondition[Sequelize.Op.or] = [
        { entity_name: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { description: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { phone: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { email: { [Sequelize.Op.like]: `%${searchQuery}%` } },
      ];
    }
    const { count, rows: data } = await entityModel.findAndCountAll({
      attributes: [
        "entity_id",
        "entity_name",
        "description",
        "status",
        "phone",
        "imageUrl",
        "location",
        "email",
      ],
      where: whereCondition,
      limit: pageSize,
      offset: offset,
    });

    const totalPages = Math.ceil(count / pageSize);
    let message;
    if (data) message = "Successfully fetched data";
    else message = "No data found";

    const encryptedEntities = await Promise.all(
      data.map(async (entity) => {
        const encryptedEntityId = await encrypt(
          entity.entity_id.toString(),
          process.env.CRYPTO_SECRET
        );
        return { ...entity.toJSON(), encryptedEntityId };
      })
    );

    return handleResponse({
      res,
      message,
      statusCode: 200,
      data: {
        data: encryptedEntities,
        currentPage: page,
        totalCount: count,
        totalPages,
      },
    });
  } catch (err) {
    console.log({ err });
  }
};

const transactionHistory = async (requestData, res) => {
  try {
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;
    const dateFilter = requestData.dateFilter;

    let dateFilterInput;

    console.log("dateFilter", dateFilter);

    if (dateFilter) {
      const year = new Date(dateFilter).getFullYear().toString().slice(2);
      const month = (new Date(dateFilter).getMonth() + 1)
        .toString()
        .padStart(2, "0");
      const day = new Date(dateFilter).getDate().toString().padStart(2, "0");
      dateFilterInput = `${day}/${month}/${year}`;
      console.log("dateFilterInput>>>>", dateFilterInput);
    }

    // let { count, rows: transactions } = await bookingModel.findAndCountAll({
    //     where: {
    //         bookingStatus: {
    //             [Op.in]: [0, 1],
    //         },
    //     },
    //     include: [
    //         {
    //             model: paymentModel,
    //             attributes: ['orderId', 'transactionId'],
    //             where: {
    //                 paymentStatus: 1,
    //             },
    //         },
    //     ],
    //     attributes: [
    //         'customerId',
    //         'amount',
    //         'bookingId',
    //         'workSlotId',
    //         'bookingStatus',
    //         'appointmentDate',
    //         [Sequelize.literal('`payment`.`orderId`'), 'paymentOrderId'],
    //         [
    //             Sequelize.literal('`payment`.`transactionId`'),
    //             'paymentTransactionId',
    //         ],
    //         [Sequelize.literal('`payment`.`updatedAt`'), 'paymentDate'],
    //     ],
    //     limit: pageSize,
    //     offset: offset,
    // })

    const { count, rows: bookings } = await bookingModel.findAndCountAll({
      where: {
        bookingStatus: {
          [Op.in]: [0, 1],
        },
      },
      attributes: [
        "customerId",
        "amount",
        "bookingId",
        "workSlotId",
        "bookingStatus",
        "appointmentDate",
        "orderId",
      ],
      limit: pageSize,
      offset: offset,
    });

    // Extracting bookingIds from the result for the next query
    const bookingIds = bookings.map((booking) => booking.orderId);

    // Query to retrieve associated payment information
    const payments = await paymentModel.findAll({
      attributes: [
        "orderId",
        "transactionId",
        "createdAt",
        [Sequelize.literal("`payment`.`updatedAt`"), "paymentDate"],
      ],
      where: {
        orderId: {
          [Op.in]: bookingIds,
        },
        paymentStatus: 1,
      },
    });

    // Merging booking and payment information based on the orderId
    let transactions = bookings.map((booking) => {
      const associatedPayment = payments.find(
        (payment) => payment.orderId === booking.orderId
      );

      return {
        ...booking.toJSON(),
        paymentOrderId: associatedPayment ? associatedPayment.orderId : null,
        paymentTransactionId: associatedPayment
          ? associatedPayment.transactionId
          : null,
        paymentDate: associatedPayment ? associatedPayment.createdAt : null,
      };
    });

    const totalPages = Math.ceil(count / pageSize); // Calculate total number of pages

    // Extract unique customerIds and workSlotIds
    const customerIds = new Set(
      transactions.map((transaction) => transaction.customerId)
    );
    const workSlotIds = new Set(
      transactions.map((transaction) => transaction.workSlotId)
    );

    // Fetch doctors corresponding to workSlotIds
    const doctorIds = await weeklyTimeSlotsModel.findAll({
      where: {
        time_slot_id: {
          [Op.in]: [...workSlotIds],
        },
      },
      attributes: ["doctor_id", "time_slot_id"],
    });

    // Create a map of workSlotIds to doctorIds
    const doctorIdMap = {};
    doctorIds.forEach((doctor) => {
      doctorIdMap[doctor.time_slot_id] = doctor.doctor_id;
    });

    // Fetch doctors corresponding to uniqueDoctorIds
    const doctors = await doctorModel.findAll({
      where: {
        doctor_id: {
          [Op.in]: Object.values(doctorIdMap),
        },
      },
      attributes: ["doctor_id", "doctor_name"],
    });

    // Create a map of doctorIds to doctor names
    const doctorNameMap = {};
    doctors.forEach((doctor) => {
      doctorNameMap[doctor.doctor_id] = doctor.doctor_name;
    });
    // Update transactions with doctorName, customerName, and customerPhone
    transactions = transactions.map((transaction) => ({
      ...transaction,
      doctorName: doctorNameMap[doctorIdMap[transaction.workSlotId]],
    }));

    // Fetch customer names and phone numbers
    const customers = await userModel.findAll({
      where: {
        userId: {
          [Op.in]: [...customerIds],
        },
      },
      attributes: ["userId", "name", "phone"],
    });

    // Create a map of customerIds to customer details
    const customerMap = {};
    customers.forEach((customer) => {
      customerMap[customer.userId] = {
        customerName: customer.name,
        customerPhone: customer.phone,
      };
    });

    // Update transactions with customerName and customerPhone
    transactions.forEach((transaction) => {
      const customerDetails = customerMap[transaction.customerId];
      transaction.customerName = customerDetails
        ? customerDetails.customerName
        : null;
      transaction.customerPhone = customerDetails
        ? customerDetails.customerPhone
        : null;
    });

    let message, data;

    if (!transactions) {
      message = "Sorry! no transaction history.";
    } else {
      message = "Successfully fetched transaction details.";
    }

    if (searchQuery || dateFilter) {
      const filteredTransactions = transactions.filter((transaction) => {
        const {
          customerPhone,
          customerName,
          doctorName,
          orderId,
          paymentTransactionId,
          paymentDate,
        } = transaction;

        const year = paymentDate.getFullYear().toString().slice(2);
        const month = (paymentDate.getMonth() + 1).toString().padStart(2, "0");
        const day = paymentDate.getDate().toString().padStart(2, "0");
        const dateTobeFilterd = `${day}/${month}/${year}`;
        console.log("dateTobeFilterd", dateTobeFilterd);

        const normalizedSearchQuery = searchQuery.toLowerCase();
        return (
          customerPhone === searchQuery ||
          (customerName.toLowerCase().includes(normalizedSearchQuery) &&
            customerName.length >= 2) ||
          (doctorName &&
            doctorName.toLowerCase().includes(normalizedSearchQuery) &&
            doctorName.length >= 3) ||
          orderId === searchQuery ||
          paymentTransactionId === searchQuery ||
          (dateTobeFilterd && dateTobeFilterd.includes(dateFilterInput))
        );
      });
      transactions = filteredTransactions;
    }

    return handleResponse({
      res,
      statusCode: 200,
      message,
      data: {
        transactions,
        totalPages,
        currentPage: page,
        totalCount: count,
      },
    });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error in fetching transaction history.",
      statusCode: 500,
    });
  }
};

const addNewDoctor = async (docData, image, res) => {
  try {
    let redirection, response, statusCode, imageUrl;
    if (image) {
      imageUrl = await DigitalOceanUtils.uploadObject(image);
    }
    if (docData.businessType == "individual") {
      response = await addIndvDoctor(docData, imageUrl, res);
      redirection = true;
    } else {
      response = await addDoctorByClinic(docData, imageUrl, res);
      redirection = false;
    }

    statusCode = response.success ? 200 : 404;
    return handleResponse({
      res,
      message: response.message,
      statusCode,
      data: {
        entityId: response.entityId,
        redirection,
        validateMessages: response.validateMessages
          ? response.validateMessages
          : [],
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while adding doctor",
      statusCode: 404,
    });
  }
};

const addIndvDoctor = async (
  {
    doctor_name,
    doctor_phone,
    qualification,
    email,
    consultation_time,
    consultation_charge,
    department_id,
    description,
    gstNo,
    paymentMethod,
    entityName,
    bookingType,
    tokens,
  },
  imageUrl
) => {
  if (!tokens || tokens.trim() === "") {
    tokens = 0; // setting a default value
  }

  try {
    let existingIndvEntity = await entityModel.findOne({
      where: { phone: doctor_phone },
    });

    if (existingIndvEntity) {
      return {
        success: false,
        message: "Individual Entity already exists with this Phone No",
      };
    }

    let existingDr = await doctorModel.findOne({
      where: { doctor_phone: doctor_phone },
    });

    let emailAlreadyExists = await doctorModel.findOne({
      where: { email },
      attributes: ["doctor_id", "doctor_phone"],
    });

    if (
      emailAlreadyExists &&
      emailAlreadyExists.doctor_phone !== doctor_phone
    ) {
      return {
        success: false,
        message: "This Email ID already exists with another Phone No",
      };
    }

    let addedDoctor, addedIndvEntity;
    const capitalizedEntityName =
      entityName.charAt(0).toUpperCase() + entityName.slice(1);

    if (!existingIndvEntity) {
      const newIndvEntity = await new entityModel({
        phone: doctor_phone,
        entity_name: entityName ? capitalizedEntityName : null,
        business_type_id: 0,
        entity_type: 2, // entity_type : businessData.businessId
        description,
        email,
        imageUrl,
        gstNo,
      });

      addedIndvEntity = await newIndvEntity.save();

      const capitalizedDoctorName =
        doctor_name.charAt(0).toUpperCase() + doctor_name.slice(1);

      const newDoctor = await new doctorModel({
        doctor_name: capitalizedDoctorName,
        doctor_phone,
        qualification,
        description,
        email,
        bookingType,
        department_id,
        entity_id: addedIndvEntity.entity_id,
        profileImageUrl: imageUrl,
        gstNo,
        paymentMethod,
        tokens,
      });

      if (!existingDr) {
        addedDoctor = await newDoctor.save();
      }

      const doctorId = addedDoctor
        ? addedDoctor.doctor_id
        : existingDr.doctor_id;

      const userExists = await userModel.findOne({
        where: { phone: doctor_phone },
      });
      if (!userExists) {
        userModel.create({
          uuid: await generateUuid(),
          userType: 2,
          name: capitalizedDoctorName,
          phone: doctor_phone,
        });
      }

      await doctorEntityModel.create({
        doctorId: doctorId,
        entityId: addedIndvEntity.entity_id,
        consultationTime: consultation_time,
        consultationCharge: consultation_charge,
      });
    }

    let getEntity = await entityModel.findOne({
      where: { phone: doctor_phone },
    });

    return {
      entityId: getEntity.entity_id,
      message: "Individual doctor added successfully",
      success: true,
    };
  } catch (error) {
    console.log({ error });
    return {
      message: "Error while adding docotr under the clinic",
      success: false,
    };
  }
};

const addDoctorByClinic = async (
  {
    doctor_name,
    doctor_phone,
    qualification,
    email,
    consultation_time,
    consultation_charge,
    department_id,
    description,
    entity_id,
    gstNo,
    paymentMethod,
    bookingType,
    tokens,
  },
  imageUrl
) => {
  if (!tokens || tokens.trim() === "") {
    tokens = 0; // setting a default value
  }

  try {
    let existingDrwithClinic;
    const existingDr = await doctorModel.findOne({
      where: { doctor_phone },
      attributes: ["doctor_phone", "email", "doctor_id"],
    });

    if (existingDr) {
      existingDrwithClinic = await doctorEntityModel.findOne({
        where: { doctorId: existingDr.doctor_id, entityId: entity_id },
      });
    }

    if (existingDrwithClinic) {
      return {
        success: false,
        message: "Doctor already exists with this Clinic",
      };
    }

    const emailAlreadyExists = await doctorModel.findOne({
      where: { email },
      attributes: ["doctor_phone", "email"],
    });

    if (
      emailAlreadyExists &&
      emailAlreadyExists.doctor_phone !== doctor_phone
    ) {
      return {
        success: false,
        message: "This Email ID already exists with another Phone No",
      };
    }

    // if (existingDr && !existingDrwithClinic) {
    //         const validateMessages = [];

    //         if (existingDr.doctor_name !== doctor_name) {
    //             validateMessages.push('Doctor name does not match the existing record.');
    //         };
    //         if (existingDr.qualification !== qualification) {
    //             validateMessages.push('Qualification does not match the existing record.');
    //         };
    //         if (existingDr.email !== email) {
    //             validateMessages.push('Email does not match the existing record.');
    //         };
    //         if (existingDr.department_id !== department_id) {
    //             validateMessages.push('Department ID does not match the existing record.');
    //         };
    //         if (existingDr.gstNo !== gstNo) {
    //             validateMessages.push('GST No does not match the existing record.');
    //         };
    //         if (existingDr.paymentMethod !== paymentMethod) {
    //             validateMessages.push('Payment method does not match the existing record.');
    //         };

    //         if (validateMessages.length > 0) {
    //             return {
    //                 success: false,
    //                 message: 'Input data does not match the existing doctor details.',
    //                 validateMessages: validateMessages,
    //             };
    //         };
    //     };

    const capitalizedDoctorName =
      doctor_name.charAt(0).toUpperCase() + doctor_name.slice(1);

    const newDoctor = await new doctorModel({
      doctor_name: capitalizedDoctorName,
      doctor_phone,
      qualification,
      bookingType,
      email,
      department_id,
      description,
      entity_id,
      profileImageUrl: imageUrl,
      gstNo,
      paymentMethod,
      tokens,
    });

    let addedDoctor;
    if (!existingDr) {
      addedDoctor = await newDoctor.save();
    }

    const doctorId = addedDoctor ? addedDoctor.doctor_id : existingDr.doctor_id;

    await doctorEntityModel.create({
      doctorId: doctorId,
      entityId: entity_id,
      consultationCharge: consultation_charge,
      consultationTime: consultation_time,
    });

    const userExists = await userModel.findOne({
      where: { phone: doctor_phone },
    });
    if (!userExists) {
      userModel.create({
        uuid: await generateUuid(),
        userType: 2,
        name: capitalizedDoctorName,
        phone: doctor_phone,
      });
    }

    return {
      entityId: entity_id,
      message: "Doctor under the clinic added successfully",
      success: true,
    };
  } catch (error) {
    console.log({ error });
    return {
      message: "Error while adding doctor",
      success: false,
    };
  }
};

const viewDoctor = async ({ doctorId, entityId }, res) => {
  try {
    const isValidDr = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      attributes: ["doctor_id"],
    });
    const isValidClinic = await entityModel.findOne({
      where: { entity_id: entityId },
      attributes: ["entity_id"],
    });

    if (!isValidDr) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Doctor Not found",
        data: {},
      });
    }

    if (!isValidClinic) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Clinic Not found",
        data: {},
      });
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      include: [
        {
          model: departmentModel,
          attributes: ["department_name", "department_id"],
        },
        {
          model: doctorEntityModel,
          attributes: ["consultationTime", "consultationCharge", "entityId"],
          where: { entityId, doctorId },
          include: [
            {
              model: entityModel,
              attributes: ["entity_name"],
            },
          ],
        },
      ],
    });
    // console.log("getDoctor==>", getDoctor);
    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "No Doctor details found",
        data: {},
      });
    }
    const formattedResponse = {
      doctorId: getDoctor.doctor_id,
      doctorName: getDoctor.doctor_name,
      department: getDoctor.department?.department_name,
      departmentId: getDoctor.department?.department_id,
      entityName: getDoctor.doctorEntity.entity?.entity_name,
      doctorPhone: getDoctor.doctor_phone,
      qualification: getDoctor.qualification,
      consultationTime: getDoctor.doctorEntity?.consultationTime,
      consultationCharge: getDoctor.doctorEntity?.consultationCharge,
      description: getDoctor.description,
      email: getDoctor.email,
      profileImageUrl: getDoctor.profileImageUrl,
      gstNo: getDoctor.gstNo,
    };

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor details fetched successfully",
      data: {
        formattedResponse,
      },
    });
  } catch (error) {
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while fetching doctor data",
      data: {},
    });
  }
};

const updateDoctor = async (data, profileImage, res) => {
  try {
    const {
      doctorId,
      entityId,
      doctor_name,
      qualification,
      email,
      consultation_time,
      consultation_charge,
      department_id,
      description,
      gstNo,
      newStatus,
    } = data;

    let imageUrl;

    if (profileImage) {
      imageUrl = await DigitalOceanUtils.uploadObject(profileImage);
    }

    const existingDoctor = await doctorModel.findOne({
      where: { doctor_id: doctorId },
    });
    const existingEntity = await entityModel.findOne({
      where: { entity_id: entityId },
    });

    if (!existingDoctor) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Doctor not found",
        data: {},
      });
    }

    if (!existingEntity) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Entity not found",
        data: {},
      });
    }

    if (email) {
      const emailAlreadyExists = await doctorModel.findOne({
        where: { email },
        attributes: ["doctor_phone", "email"],
      });
      if (
        emailAlreadyExists &&
        emailAlreadyExists.doctor_phone !== existingDoctor.doctor_phone
      ) {
        return handleResponse({
          res,
          statusCode: 404,
          message:
            "This email ID is already associated with a different Phone No.",
          data: {},
        });
      }
    }

    const existingDoctorEntity = await doctorEntityModel.findOne({
      where: { doctorId: doctorId, entityId: entityId },
    });

    if (!existingDoctorEntity) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Doctor entity not found",
        data: {},
      });
    }

    await doctorModel.update(
      {
        doctor_name,
        qualification,
        email,
        department_id,
        description,
        gstNo,
        profileImageUrl: imageUrl,
        status: newStatus,
      },
      { where: { doctor_id: doctorId } }
    );

    await doctorEntityModel.update(
      {
        consultationTime: consultation_time,
        consultationCharge: consultation_charge,
        status: newStatus,
      },
      { where: { doctorId: doctorId, entityId: entityId } }
    );

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor details updated successfully",
      data: {},
    });
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while updating doctor data",
      data: {},
    });
  }
};

const getUserDetails = async (search) => {
  const whereCondition = {};
  if (search) {
    whereCondition.name = { [Sequelize.Op.like]: `%${search}%` };
  }
  const usersWithDetails = await userModel.findAll({
    attributes: ["userId", "name", "phone"],
    where: {
      userType: 1,
      ...whereCondition,
    },
    raw: true,
  });

  return usersWithDetails;
};

const getBookingDetails = async (customerId) => {
  const bookingDetails = await bookingModel.findAll({
    attributes: [
      "bookingId",
      "bookingDate",
      "appointmentDate",
      "bookingStatus",
      "workSlotId",
    ],
    where: {
      customerId,
      bookingStatus: {
        [Op.not]: 3,
      },
    },
    raw: true,
  });

  return bookingDetails;
};

const getDoctorDetails = async (workSlotId) => {
  const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
    attributes: ["time_slot", "time_slot_id", "date", "day", "doctor_id"],
    where: {
      time_slot_id: workSlotId,
    },
    raw: true,
  });

  if (!weeklyTimeSlots.length) {
    return [];
  }

  const doctorDetails = await doctorModel.findAll({
    attributes: ["doctor_id", "doctor_name"],
    where: {
      doctor_id: weeklyTimeSlots[0].doctor_id,
    },
    raw: true,
  });

  return doctorDetails;
};

const listAllCustomers = async (
  { page = 1, limit = 10, searchQuery = "", filter = {} },
  res
) => {
  try {
    const users = await getUserDetails(searchQuery);

    const totalUsersCount = users.length;
    const totalPages = Math.ceil(totalUsersCount / limit);

    const paginatedUsers = users.slice((page - 1) * limit, page * limit);

    const customers = await Promise.all(
      paginatedUsers.map(async (user) => {
        const bookingDetails = await getBookingDetails(user.userId);

        const appointments = await Promise.all(
          bookingDetails.map(async (booking) => {
            const doctorDetails = await getDoctorDetails(
              booking.workSlotId,
              filter
            );

            return {
              bookingId: booking.bookingId,
              appointmentDate: booking.appointmentDate,
              bookingStatus: booking.bookingStatus,
              doctorName: doctorDetails.length
                ? doctorDetails[0].doctor_name
                : "",
              doctorId: doctorDetails.length ? doctorDetails[0].doctor_id : "",
            };
          })
        );

        return {
          userId: user.userId,
          customerName: user.name,
          phone: user.phone,
          appointmentsDetails: appointments,
        };
      })
    );

    let finalCustomerList = customers;
    if (filter.doctorId) {
      const filteredCustomers = customers.filter((customer) => {
        const matchingAppointments = customer.appointmentsDetails.filter(
          (appointment) => appointment.doctorId === filter.doctorId
        );

        if (matchingAppointments.length > 0) {
          console.log("Matching Customer:", customer);
        }

        return matchingAppointments.length > 0;
      });
      finalCustomerList = filteredCustomers.length > 0 ? filteredCustomers : [];
    }
    return handleResponse({
      res,
      statusCode: 200,
      message: "Customer listing fetched successfully",
      data: {
        customers: finalCustomerList,
        totalCount: totalUsersCount,
        currentPage: page,
        limit: limit,
        totalPages,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const addBankDetails = async (
  { entityId, account_no, ifsc_code, bank_name, account_holder_name, UPI_ID },
  res
) => {
  try {
    let entityData = await entityModel.findOne({
      where: { entity_id: entityId },
    });
    let newData, message, statusCode;
    if (!entityData) {
      message = "No entity data available with this ID.";
      statusCode = 404;
    } else {
      entityData.account_no = account_no;
      entityData.ifsc_code = ifsc_code;
      entityData.bank_name = bank_name;
      entityData.account_holder_name = account_holder_name;
      entityData.UPI_ID = UPI_ID;
      entityData.profile_completed = 1;
      message = "Successfully added bank details";
      statusCode = 200;
      newData = await entityData.save();
    }
    return handleResponse({
      res,
      statusCode,
      message,
      data: { newData },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      message: "Error while updating bank details",
      statusCode: 404,
    });
  }
};

const customerHistory = async (req, res) => {
  try {
    const { customerId, filter = {} } = req.body;
    let userDetails = await userModel.findOne({
      where: { userId: customerId },
    });

    if (!userDetails) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "User not found",
        data: {},
      });
    }

    const bookingDetails = await getBookingDetails(userDetails.userId);

    const visitingHistory = {};
    await Promise.all(
      bookingDetails.map(async (booking) => {
        const doctorDetails = await getDoctorDetails(booking.workSlotId);
        const paymentDetails = await paymentModel.findOne({
          where: { bookingId: booking.bookingId },
        });

        if (doctorDetails.length) {
          const doctorId = doctorDetails[0].doctor_id;
          const appointmentDate = booking.appointmentDate.toISOString(); // Convert to ISO string for direct comparison

          // Apply filters
          const matchesDoctorId =
            !filter.doctorId || doctorId === filter.doctorId;
          const matchesAppointmentDate =
            !filter.appointmentDate ||
            appointmentDate.includes(filter.appointmentDate);

          if (matchesDoctorId && matchesAppointmentDate) {
            if (!visitingHistory[doctorId]) {
              visitingHistory[doctorId] = {
                doctorId: doctorId,
                doctorName: doctorDetails[0].doctor_name,
                appointments: [],
              };
            }

            visitingHistory[doctorId].appointments.push({
              bookingId: booking.bookingId,
              bookingDate: booking.bookingDate,
              appointmentDate: appointmentDate,
              visitingStatus: booking.bookingStatus,
              transactionId: paymentDetails ? paymentDetails.transactionId : "",
            });
          }
        }
      })
    );

    const customerDetailsWithHistory = {
      userId: userDetails.userId,
      customerName: userDetails.name,
      phone: userDetails.phone,
      visitingHistory: Object.values(visitingHistory),
    };

    return handleResponse({
      res,
      statusCode: 200,
      message: "Customer details with visiting history fetched successfully",
      data: customerDetailsWithHistory,
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const addClinic = async (entityData, image, res) => {
  try {
    const {
      businessId,
      entityType,
      entityName,
      phone,
      location,
      streetName,
      cityName,
      stateId,
      districtId,
      pincodeId,
      description,
      email,
      pincode,
      gstNo,
    } = entityData;

    let imageUrl;

    if (image) {
      imageUrl = await DigitalOceanUtils.uploadObject(image);
    }
    const capitalizedEntityName =
      entityName.charAt(0).toUpperCase() + entityName.slice(1);

    let existingEntity = await entityModel.findOne({ where: { phone } });

    if (existingEntity) {
      existingEntity = await existingEntity.update({
        entity_type: 1 || businessId,
        business_type_id: 1 || entityType,
        entity_name: capitalizedEntityName,
        phone,
        location,
        imageUrl,
        description,
        email,
        gstNo,
      });

      await entityAddressModel.update(
        {
          streetName,
          cityName,
          stateId,
          districtId,
          pincodeId: null,
          pincode,
        },
        { where: { entityId: existingEntity.entity_id } }
      );

      return handleResponse({
        res,
        statusCode: 200,
        message: "Clinic updated successfully",
        data: { entityId: existingEntity.entity_id },
      });
    }
    // If the entity does not exist, create a new one
    const newEntity = await entityModel.create({
      entity_type: 1 || businessId,
      business_type_id: 1 || entityType,
      entity_name: capitalizedEntityName,
      phone,
      location,
      imageUrl,
      description,
      email,
      gstNo,
    });

    // Create a new entity address
    await entityAddressModel.create({
      streetName,
      cityName,
      stateId,
      districtId,
      pincodeId: null,
      entityId: newEntity.entity_id,
      pincode,
    });

    return handleResponse({
      res,
      statusCode: 200,
      message: "Clinic added successfully",
      data: {
        entityId: newEntity.entity_id
          ? newEntity.entity_id
          : existingEntity.entity_id,
      }, // Sending the entityId in the response data
    });
  } catch (error) {
    console.error(error);
    return handleResponse({
      res,
      message: "Internal Server Error",
      statusCode: 500,
    });
  }
};

const listState = async (req, res) => {
  try {
    const states = await stateModel.findAll({});

    return handleResponse({
      res,
      message: "Successfully fetched states",
      data: states,
      statusCode: 200,
    });
  } catch (err) {
    console.log({ err });
  }
};

const listDistrict = async (req, res) => {
  try {
    let { stateId } = req.body;

    if (!stateId) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "State ID not found",
      });
    }
    const districts = await districtModel.findAll({
      where: { stateId: stateId },
      // order: [['createdAt', 'DESC']]
    });

    return handleResponse({
      res,
      message: "Successfully fetched districts",
      data: districts,
      statusCode: 200,
    });
  } catch (err) {
    console.log({ err });
  }
};

const listClinic = async (requestData, res) => {
  try {
    const page = parseInt(requestData.page) || 1;
    const pageSize = parseInt(requestData.limit) || 10;
    const businessType = parseInt(requestData.businessType) || 0;
    const searchQuery = requestData.searchQuery || "";
    const offset = (page - 1) * pageSize;

    let whereCondition = {
      // status: 1,
      entity_name: {
        [Sequelize.Op.ne]: null,
      },
    };

    if (businessType !== 0) {
      whereCondition.entity_type = businessType;
    }

    const includeOptions = [
      {
        model: entityAddressModel,
        as: "entityAddress",
        attributes: ["streetName"],
      },
    ];

    if (searchQuery) {
      whereCondition[Sequelize.Op.or] = [
        { entity_name: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { description: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { phone: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        { email: { [Sequelize.Op.like]: `%${searchQuery}%` } },
        {
          "$entityAddress.streetName$": {
            [Sequelize.Op.like]: `%${searchQuery}%`,
          },
        },
      ];

      // includeOptions[0].where = {
      //     streetName: { [Sequelize.Op.like]: `%${searchQuery}%` }
      // };
    }
    const orderOption = [["created_date_time", "DESC"]];
    const { count, rows: data } = await entityModel.findAndCountAll({
      attributes: [
        "entity_id",
        "entity_name",
        "description",
        "status",
        "phone",
        "location",
        "email",
      ],

      where: whereCondition,
      limit: pageSize,
      offset: offset,
      // include: [{
      //     model: entityAddressModel,
      //     attributes: ['streetName'],

      // },
      //    ],
      include: includeOptions,
      order: orderOption,
    });

    const totalPages = Math.ceil(count / pageSize);
    let message;
    if (data) message = "Successfully fetched data";
    else message = "No data found";

    const encryptedEntities = await Promise.all(
      data.map(async (entity) => {
        const streetName = entity.entityAddress?.streetName;
        const encryptedEntityId = await encrypt(
          entity.entity_id.toString(),
          process.env.CRYPTO_SECRET
        );
        const responseData = {
          entity_id: entity.entity_id,
          entity_name: entity.entity_name,
          description: entity.description,
          status: entity.status,
          phone: entity.phone,
          location: entity.location,
          email: entity.email,
          streetName,
          encryptedEntityId,
        };

        return responseData;
      })
    );

    return handleResponse({
      res,
      message,
      statusCode: 200,
      data: {
        data: encryptedEntities,
        currentPage: page,
        totalCount: count,
        totalPages,
      },
    });
  } catch (err) {
    console.log({ err });
  }
};

const updateClinicStatus = async (requestData, res) => {
  try {
    const { clinicId, newStatus } = requestData;
    const entity = await entityModel.findOne({
      where: { entity_id: clinicId },
    });
    if (!entity) {
      return handleResponse({
        res,
        message: "Clinic not found",
        statusCode: 404,
      });
    }

    entity.status = newStatus;
    await entity.save();
    return handleResponse({
      res,
      message: "successfully updated the status",
      statusCode: 200,
    });
  } catch (err) {
    console.log({ err });
    return handleResponse({
      res,
      message: "Error in clinic update status",
      statusCode: 404,
    });
  }
};

const getDeptDetails = async ({ department_id }, res) => {
  try {
    let dept = await departmentModel.findByPk(department_id);
    if (!dept) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "Department not found.",
      });
    }

    return handleResponse({
      res,
      statusCode: 200,
      message: "Department data fetched successfully",
      data: {
        department_id: dept.department_id,
        department_name: dept.department_name,
        status: dept.status,
      },
    });
  } catch (error) {
    console.log({ error });
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while fetching department.",
    });
  }
};

const listDeptByClinic = async ({ entityId }, res, type = 0) => {
  try {
    const doctorEntities = await doctorEntityModel.findAll({
      where: { entityId },
      include: [
        {
          model: doctorModel,
          attributes: ["doctor_id", "doctor_name"],
          required: true,
          include: [
            {
              model: departmentModel,
              attributes: ["department_name"],
              required: true,
            },
          ],
        },
      ],
    });

    // const departmentNames = doctorEntities.map((doctorEntity) => doctorEntity?.doctor?.department?.department_name ?? null);;

    const departmentNamesSet = new Set(
      doctorEntities.map((doctorEntity) => {
        if (
          doctorEntity &&
          doctorEntity.doctor &&
          doctorEntity.doctor.department
        ) {
          return doctorEntity.doctor.department.department_name;
        } else {
          return null;
        }
      })
    );

    const departmentNames = Array.from(departmentNamesSet);

    if (type === 1) return departmentNames;

    return handleResponse({
      res,
      message: "successfully fetched departments",
      statusCode: 200,
      data: {
        departmentNames,
      },
    });
  } catch (error) {
    console.log(error);
    return handleResponse({
      res,
      message: "Error while fetching clinic wise departments",
      statusCode: 404,
    });
  }
};

const totalNoOfbookings = async (req, res) => {
  try {
    // const totalBookings = await bookingModel.count(
    //     {
    //         where: {
    //             bookingStatus: {
    //                 [Op.not]: 3
    //             }
    //         }
    //     }
    // );
    const [totalBookings, todaysBookings, completedBookings, pendingBookings] =
      await Promise.all([
        bookingModel.count({
          where: {
            bookingStatus: {
              [Op.not]: 3,
            },
          },
        }),
        bookingModel.count({
          where: {
            bookingStatus: {
              [Op.not]: 3,
            },
            createdAt: {
              [Op.between]: [
                new Date().setHours(0, 0, 0, 0),
                new Date().setHours(23, 59, 59, 999),
              ],
            },
          },
        }),
        bookingModel.count({
          where: {
            bookingStatus: 1,
          },
        }),
        bookingModel.count({
          where: {
            bookingStatus: 0,
            appointmentDate: { [Op.lt]: new Date() },
          },
        }),
      ]);

    return handleResponse({
      res,
      statusCode: 200,
      message: "Total no of booking count",
      data: {
        totalBookings,
        todaysBookings,
        completedBookings,
        pendingBookings,
      },
    });
  } catch (err) {
    console.error("Error while fetching booking count", err);
    return handleResponse({
      res,
      statusCode: 404,
      message: "Error while fetching booking count",
      data: {},
    });
  }
};

const graphData = async (req, res) => {
  try {
    const graphData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = moment().subtract(i, "days").startOf("day").toDate();
      const nextDate = moment(currentDate).add(1, "days").toDate();

      const count = await bookingModel.count({
        where: {
          bookingDate: {
            [Op.between]: [currentDate, nextDate],
          },
          bookingStatus: {
            [Op.not]: 3,
          },
        },
      });

      graphData.push({
        date: moment(currentDate).format("YYYY-MM-DD"),
        count,
      });
    }

    return handleResponse({
      res,
      statusCode: 200,
      message: "Graph data fetched succfully",
      data: {
        graphData,
      },
    });
  } catch (err) {
    console.error("Error in getting total bookings for last seven days:", err);
    return handleResponse({
      res,
      statusCode: 404,
      message: "Error while fetching graph data",
      data: {},
    });
  }
};

const bookingReport_admin = async (requestParams, requestData, res) => {
  try {
    const page = parseInt(requestParams.page) || 1;
    const pageSize = parseInt(requestParams.limit) || 10;
    const startDate = requestData.startDate;
    const endDate = requestData.endDate;
    const offset = (page - 1) * pageSize;
    const doctorId = requestData.doctorId;
    const entityId = requestData.entityId;
    // const date  = requestData.date
    const searchQuery = requestData.searchQuery;
    const reportStatus = requestData.reportStatus || 0;

    let whereCondition = {
      date: {
        [Op.gte]: startDate,
        [Op.lte]: endDate,
      },
    };

    let bookingCondition = {};

    if (reportStatus === 0)
      bookingCondition = { bookingStatus: { [Op.not]: 3 } };
    if (reportStatus === 1) bookingCondition = { bookingStatus: 1 };
    if (reportStatus === 2)
      whereCondition = { date: { [Op.lt]: new Date() }, booking_status: 1 };
    if (entityId) bookingCondition = { ...bookingCondition, entityId };
    if (doctorId) whereCondition = { ...whereCondition, doctor_id: doctorId };

    if (searchQuery) {
      whereCondition[Op.or] = [
        { "$booking.patientName$": { [Op.like]: `%${searchQuery}%` } },
        { "$booking.orderId$": { [Op.like]: `%${searchQuery}%` } },
        {
          "$booking.payment.transactionId$": { [Op.like]: `%${searchQuery}%` },
        },
        { "$doctor.doctor_name$": { [Op.like]: `%${searchQuery}%` } },
      ];
    }

    const { count, rows: bookingReport } =
      await weeklyTimeSlotsModel.findAndCountAll({
        where: whereCondition,
        attributes: ["time_slot_id", "doctor_id"],
        include: [
          {
            model: bookingModel,
            where: bookingCondition,
            attributes: [
              "bookingId",
              "amount",
              "bookingStatus",
              "appointmentDate",
              "orderId",
              // 'workSlotId',
              "customerId",
              "patientName",
              "bookedPhoneNo",
            ],
            include: [
              {
                model: paymentModel,
                attributes: ["transactionId"],
              },
            ],
          },
          {
            model: doctorModel,
            attributes: ["doctor_name"],
          },
        ],
        order: [
          [{ model: bookingModel, as: "booking" }, "appointmentDate", "DESC"],
        ],
        limit: pageSize,
        offset: offset,
      });

    const totalPages = Math.ceil(count / pageSize);
    const modifiedBookingReport = bookingReport.map((booking) => {
      return {
        time_slot_id: booking.dataValues.time_slot_id,
        doctor_id: booking.dataValues.doctor_id,
        bookingId: booking.booking.dataValues.bookingId,
        amount: booking.booking.dataValues.amount,
        bookingStatus: booking.booking.dataValues.bookingStatus,
        appointmentDate: booking.booking.dataValues.appointmentDate,
        orderId: booking.booking.dataValues.orderId,
        customerId: booking.booking.dataValues.customerId,
        patientName: booking.booking.dataValues.patientName,
        bookedPhoneNo: booking.booking.dataValues.bookedPhoneNo,
        doctorName: booking.doctor.dataValues.doctor_name || "",
        transactionId: booking.booking.dataValues.payment
          ? booking.booking.dataValues.payment.dataValues.transactionId || ""
          : "",
      };
      // const weeklyTimeSlotData = {
      //     time_slot_id: booking.dataValues.time_slot_id,
      //     doctor_id: booking.dataValues.doctor_id,
      //     bookingId: booking.booking.dataValues.bookingId,
      //     amount: booking.booking.dataValues.amount,
      //     bookingStatus: booking.booking.dataValues.bookingStatus,
      //     appointmentDate: booking.booking.dataValues.appointmentDate,
      //     orderId: booking.booking.dataValues.orderId,
      //     customerId: booking.booking.dataValues.customerId,
      //     patientName: booking.booking.dataValues.patientName,
      //     bookedPhoneNo: booking.booking.dataValues.bookedPhoneNo,
      //     doctorName: booking.doctor.dataValues.doctor_name || '',
      //     transactionId: booking.booking.dataValues.payment.dataValues.transactionId
      // };

      // const bookingData = {
      //     bookingId: booking.booking.dataValues.bookingId,
      //     amount: booking.booking.dataValues.amount,
      //     bookingStatus: booking.booking.dataValues.bookingStatus,
      //     appointmentDate: booking.booking.dataValues.appointmentDate,
      //     orderId: booking.booking.dataValues.orderId,
      //     customerId: booking.booking.dataValues.customerId,
      //     patientName: booking.booking.dataValues.patientName,
      //     bookedPhoneNo: booking.booking.dataValues.bookedPhoneNo
      // };

      // const doctorData = {
      //     doctorName: booking.doctor.dataValues.doctor_name || ''
      // };

      // const paymentData = booking.booking.dataValues.payment ? {
      //     transactionId: booking.booking.dataValues.payment.dataValues.transactionId
      // } : {};

      // return {
      // weeklyTimeSlotData,
      // bookingData,
      // doctorData,
      // paymentData
      // };
    });

    return handleResponse({
      res,
      statusCode: 200,
      message: "Successfully fetched booking report.",
      data: {
        bookingReport: modifiedBookingReport,
        totalCount: count,
        totalPages: totalPages,
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return handleResponse({
      res,
      statusCode: 500,
      message: "Something went wrong",
      data: {},
    });
  }
};

const listClinicName = async (req, res) => {
  try {
    const clinicName = await entityModel.findAll({
      where: { status: 1, entity_type: 1 },
      attributes: ["entity_id", "entity_name"],
    });
    return handleResponse({
      res,
      statusCode: 200,
      message: "Clinic name fetched successfully",
      data: { clinicData: clinicName },
    });
  } catch (err) {
    console.error("Error while fetching clinic name", err);
    return handleResponse({
      res,
      statusCode: 404,
      message: "Error while fetching clinic name",
      data: {},
    });
  }
};

const findDrByPhoneNo = async ({ doctorPhone }, res) => {
  try {
    const isValidDr = await doctorModel.findOne({
      where: { doctor_phone: doctorPhone },
      attributes: ["doctor_id"],
    });

    if (!isValidDr) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Doctor Not found with this Phone No",
        data: {},
      });
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_phone: doctorPhone },
      attributes: [
        "doctor_id",
        "doctor_name",
        "department_id",
        "qualification",
        "doctor_phone",
        "status",
        "description",
        "profileImageUrl",
        "email",
      ],
      include: [
        {
          model: departmentModel,
          attributes: ["department_name"],
        },
      ],
    });

    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "No Doctor details found",
        data: {},
      });
    }
    const additionalInfo = await getEntityDetailsOfTheDr(doctorPhone, 1);
    const doctorData = {
      doctorId: getDoctor.doctor_id,
      doctorName: getDoctor.doctor_name,
      department: getDoctor.department
        ? getDoctor.department.department_name
        : null,
      doctorPhone: getDoctor.doctor_phone,
      qualification: getDoctor.qualification,
      description: getDoctor.description,
      email: getDoctor.email,
      profileImageUrl: getDoctor.profileImageUrl,
      gstNo: getDoctor.gstNo,
      additionalInfo,
    };

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor details fetched successfully",
      data: {
        doctorData,
      },
    });
  } catch (error) {
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while fetching doctor data with phone No",
      data: {},
    });
  }
};

const findDoctorByID = async ({ doctorId }, res) => {
  try {
    const isValidDr = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      attributes: ["doctor_phone"],
    });

    if (!isValidDr) {
      return handleResponse({
        res,
        statusCode: 400,
        message: "Doctor ID not found.",
        data: {},
      });
    }

    const getDoctor = await doctorModel.findOne({
      where: { doctor_id: doctorId },
      attributes: [
        "doctor_id",
        "doctor_name",
        "department_id",
        "qualification",
        "doctor_phone",
        "status",
        "description",
        "profileImageUrl",
        "email",
      ],
      include: [
        {
          model: departmentModel,
          attributes: ["department_name"],
        },
      ],
    });

    if (!getDoctor) {
      return handleResponse({
        res,
        statusCode: 404,
        message: "No Doctor details found.",
        data: {},
      });
    }
    const additionalInfo = await getEntityDetailsOfTheDr(
      isValidDr.doctor_phone,
      1
    );
    const doctorData = {
      doctorId: getDoctor.doctor_id,
      doctorName: getDoctor.doctor_name,
      department: getDoctor.department
        ? getDoctor.department.department_name
        : null,
      doctorPhone: getDoctor.doctor_phone,
      qualification: getDoctor.qualification,
      description: getDoctor.description,
      email: getDoctor.email,
      profileImageUrl: getDoctor.profileImageUrl,
      gstNo: getDoctor.gstNo,
      additionalInfo,
    };

    return handleResponse({
      res,
      statusCode: 200,
      message: "Doctor details fetched successfully",
      data: {
        doctorData,
      },
    });
  } catch (error) {
    return handleResponse({
      res,
      statusCode: 500,
      message: "Error while fetching doctor data with ID",
      data: {},
    });
  }
};

export default {
  adminLogin,
  adminRegister,
  addDept,
  listDoctors_admin,
  entityList,
  transactionHistory,
  addNewDoctor,
  updateDoctor,
  listAllCustomers,
  addBankDetails,
  customerHistory,
  addClinic,
  listState,
  listDistrict,
  listClinic,
  updateClinicStatus,
  updateDept,
  deleteDept,
  departmentList,
  listDeptByClinic,
  getDeptDetails,
  totalNoOfbookings,
  graphData,
  bookingReport_admin,
  listClinicName,
  viewDoctor,
  findDrByPhoneNo,
  findDoctorByID,
};
