import userModel from '../../../models/userModel.js';
import doctorModel from '../../../models/doctorModel.js'
import entityModel from '../../../models/entityModel.js'
import departmentModel from '../../../models/departmentModel.js'
import { handleResponse } from '../../../utils/handlers.js'
import { Op, Sequelize } from 'sequelize';
import { encrypt } from '../../../utils/token.js';
import stateModel from '../../../models/stateModel.js';
import districtModel from '../../../models/districtModel.js';
import pincodeModel from '../../../models/pincodeModel.js';
import entityAddressModel from '../../../models/entityAddressModel.js';
import DigitalOceanUtils from '../../../utils/DOFileUpload.js';
import doctorEntityModel from '../../../models/doctorEntityModel.js';


// const listDoctorsForCustomers = async (requestData, res) => {
//     try {

//         const page = requestData.page|| 1;
//         const pageSize = requestData.limit || 10;
//         const searchQuery = requestData.searchQuery || '';
//         const offset = (page - 1) * pageSize;
//         const entityId = requestData.entityId || null;

//         const whereClause = {
//             [Op.and]: [
//                 { doctor_name: { [Op.not]: null } }, 
//                 {
//                     [Op.or]: [
//                         { doctor_name: { [Op.like]: `%${searchQuery}%` } },
//                         { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
//                     ],
//                 },
//             ],
//         };

//         if (entityId) {
//             whereClause.entity_id = entityId;
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
//                 'department_id',
//                 'entity_id',
//                 'profileImageUrl',
//             ],
//             // where: {
//             //     [Op.or]: [
//             //         { doctor_name: { [Op.like]: `%${searchQuery}%` } },
//             //         { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
//             //     ],
//             // },
//             // where: {
//             //     [Op.and]: [
//             //         { doctor_name: { [Op.not]: null } }, // Ensuring doctor_name is not null
//             //         {
//             //             [Op.or]: [
//             //                 { doctor_name: { [Op.like]: `%${searchQuery}%` } },
//             //                 { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
//             //             ],
//             //         },
//             //     ],
//             // },
//             where: whereClause,
//             limit: pageSize,
//             offset: offset,
//         });
//         const dataWithSignedUrls = await Promise.all(records.map(async (record) => {
//             const preSignedUrl = await DigitalOceanUtils.getPresignedUrl(record.profileImageUrl);
//             return { ...record.toJSON() };
//         }));

//         const totalPages = Math.ceil(count / pageSize);

//         const departmentIds = dataWithSignedUrls.map((record) => record.department_id);
//         const entityIds = dataWithSignedUrls.map((record) => record.entity_id);
//         const departments = await departmentModel.findAll({
//             where: {
//                 department_id: departmentIds,
//             },
//             attributes: ['department_id', 'department_name'],
//         });

//         const entities = await entityModel.findAll({
//             where: {
//                 entity_id: entityIds,
//             },
//             attributes: ['entity_id', 'entity_name'],
//         });

//         const departmentMap = {};
//         departments.forEach((department) => {
//             departmentMap[department.department_id] = department.department_name;
//         });

//         const entityMap = {};
//         entities.forEach((entity) => {
//             entityMap[entity.entity_id] = entity.entity_name;
//         });

//         const encryptedRecords = await Promise.all(dataWithSignedUrls.map(async (record) => {

//             const encryptedPhone = await encrypt(record.doctor_phone, process.env.CRYPTO_SECRET);
//             record.doctor_phone_encrypted = encryptedPhone;
//             return record;
//         }));

//         // Merging department_name, entity_name, and encrypted phone into doctor records
//         const response = {
//             records: encryptedRecords.map((record) => ({
//                 ...record,
//                 department_name: departmentMap[record.department_id],
//                 entity_name: entityMap[record.entity_id],
//                 encryptedPhone: record.doctor_phone_encrypted,
//             })),
//         };

//         return handleResponse({
//             res,
//             statusCode: '200',
//             message : 'Dr list fetched succesfully',
//             data: {
//                 response: response.records,
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
//         })
//     }
// };

const listDoctorsForCustomers = async (requestData, res) => {
    try {

        const page = requestData.page|| 1;
        const pageSize = requestData.limit || 10;
        const searchQuery = requestData.searchQuery || '';
        const offset = (page - 1) * pageSize;
        const entityId = requestData.entityId || null;

        const whereClause = {
            [Op.and]: [
                { doctor_name: { [Op.not]: null } }, 
                {
                    [Op.or]: [
                        { doctor_name: { [Op.like]: `%${searchQuery}%` } },
                        { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
                    ],
                },
            ],
        };

        const doctorIds =  await doctorEntityModel.findAll({
            where: {
                entityId: entityId,
            },
            attributes: ['doctorId'],
        });
        const extractedDoctorIds = doctorIds.map(doctor => doctor.doctorId);

        if (entityId) {
            whereClause.doctor_id = extractedDoctorIds;
        }

        const { count, rows: records } = await doctorModel.findAndCountAll({
            attributes: [
                'doctor_id',
                'doctor_name',
                'qualification',
                'doctor_phone',
                'consultation_time',
                'consultation_charge',
                'status',
                'description',
                'department_id',
                'entity_id',
                'profileImageUrl',
            ],
            // where: {
            //     [Op.or]: [
            //         { doctor_name: { [Op.like]: `%${searchQuery}%` } },
            //         { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
            //     ],
            // },
            // where: {
            //     [Op.and]: [
            //         { doctor_name: { [Op.not]: null } }, // Ensuring doctor_name is not null
            //         {
            //             [Op.or]: [
            //                 { doctor_name: { [Op.like]: `%${searchQuery}%` } },
            //                 { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
            //             ],
            //         },
            //     ],
            // },
            where: whereClause,
            limit: pageSize,
            offset: offset,
        });
        const dataWithSignedUrls = await Promise.all(records.map(async (record) => {
            const preSignedUrl = await DigitalOceanUtils.getPresignedUrl(record.profileImageUrl);
            return { ...record.toJSON() };
        }));

        const totalPages = Math.ceil(count / pageSize);

        const departmentIds = dataWithSignedUrls.map((record) => record.department_id);
        const entityIds = dataWithSignedUrls.map((record) => record.entity_id);
        const departments = await departmentModel.findAll({
            where: {
                department_id: departmentIds,
            },
            attributes: ['department_id', 'department_name'],
        });

        const entities = await entityModel.findAll({
            where: {
                entity_id: entityId,
            },
            attributes: ['entity_id', 'entity_name'],
        });

        const departmentMap = {};
        departments.forEach((department) => {
            departmentMap[department.department_id] = department.department_name;
        });

        const entityMap = {};
        entities.forEach((entity) => {
            entityMap[entity.entity_id] = entity.entity_name;
        });
        console.log("entityMap", entityMap)

        const encryptedRecords = await Promise.all(dataWithSignedUrls.map(async (record) => {

            const encryptedPhone = await encrypt(record.doctor_phone, process.env.CRYPTO_SECRET);
            record.doctor_phone_encrypted = encryptedPhone;
            return record;
        }));

        // Merging department_name, entity_name, and encrypted phone into doctor records
        const response = {
            records: encryptedRecords.map((record) => ({
                ...record,
                entity_id: entityId,
                department_name: departmentMap[record.department_id],
                entity_name: entityMap[record.entity_id],
                encryptedPhone: record.doctor_phone_encrypted,
            })),
        };

        return handleResponse({
            res,
            statusCode: '200',
            message : 'Dr list fetched succesfully',
            data: {
                response: response.records,
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
            message: 'Something went wrong',
            data: {},
        })
    }
};
const getOneEntityDetails = async (req, res) => {

    try {
        const { entityId } = req.body;

        const entityDetails = await entityModel.findOne({
            where: { entity_id: entityId },
            include: [{
                model: entityAddressModel,
                include: [{
                    model: stateModel,
                }, {
                    model: districtModel,
                }, {
                    model: pincodeModel,
                }],
            }],
        });
        
        if (!entityDetails) {
            return handleResponse({
                res,
                statusCode: 400,
                message: 'Not found',
                data: {},
            })
        }

        const { entity_name, phone, email, entityAddress, imageUrl, description } = entityDetails;

        let streetName, cityName, districtName, stateName, pincodeValue, pincode;
        if (entityAddress) {
            streetName = entityAddress.streetName;
            cityName = entityAddress.cityName;
            const district = entityAddress.district;
            districtName = district && district.districtName ? district.districtName : "";
            const state = entityAddress.state;
            stateName = state && state.stateName ? state.stateName : "";
            pincode = entityAddress.pincode? entityAddress.pincode: "";
            // pincodeValue = pincode ? pincode.pincodeValue : "";
           
        }
        
        const entityResponse = {
            entityName: entity_name ? entity_name : "",
            phone: phone ? phone : "",
            email: email ? email : "",
            entityImage: imageUrl ? imageUrl : "",
            description: description ? description : "",
            streetName: streetName ? streetName : "",
            cityName: cityName ? cityName : "",
            district: districtName ? districtName : "",
            state: stateName ? stateName : "",
            pincode: pincode? pincode: "",
        };

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Entity details fetched successfully',
            data: {
                entityResponse
            },
        })
    } catch (error) {
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {
                
            },
        })
    }

}

export default {
                  listDoctorsForCustomers,
                  getOneEntityDetails

             }
