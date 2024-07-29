import userModel from '../../../models/userModel.js';
import doctorModel from '../../../models/doctorModel.js'
import entityModel from '../../../models/entityModel.js'
import departmentModel from '../../../models/departmentModel.js'
import { handleResponse } from '../../../utils/handlers.js'
import { Op, Sequelize } from 'sequelize';
import { encrypt } from '../../../utils/token.js';
import stateModel from '../../../models/stateModel.js';
import districtModel from '../../../models/districtModel.js';
import entityAddressModel from '../../../models/entityAddressModel.js';
import DigitalOceanUtils from '../../../utils/DOFileUpload.js';
import doctorEntityModel from '../../../models/doctorEntityModel.js';
import adminServices from '../../admin/v1/services/adminServices.js';
import { calcAmountDetails } from '../../authentication/v1/services/authenticationService.js';
import { decrypt } from '../../../utils/token.js';
import bookingFeeModel from '../../../models/bookingFeeModel.js';


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

//         const doctorIds =  await doctorEntityModel.findAll({
//             where: {
//                 entityId: entityId,
//             },
//             attributes: ['doctorId'],
//         });
//         const extractedDoctorIds = doctorIds.map(doctor => doctor.doctorId);

//         if (entityId) {
//             whereClause.doctor_id = extractedDoctorIds;
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
//                 entity_id: entityId,
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
//         console.log("entityMap", entityMap)

//         const encryptedRecords = await Promise.all(dataWithSignedUrls.map(async (record) => {

//             const encryptedPhone = await encrypt(record.doctor_phone, process.env.CRYPTO_SECRET);
//             record.doctor_phone_encrypted = encryptedPhone;
//             return record;
//         }));

//         // Merging department_name, entity_name, and encrypted phone into doctor records
//         const response = {
//             records: encryptedRecords.map((record) => ({
//                 ...record,
//                 entity_id: entityId,
//                 department_name: departmentMap[record.department_id],
//                 entity_name: entityMap[record.entity_id],
//                 encryptedPhone: record.doctor_phone_encrypted,
//             })),
//         };

//         return handleResponse({
//             res,
//             statusCode: '200',
//             message : 'Dr list fetched successfully',
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
        const page = requestData.page || 1;
        const pageSize = requestData.limit || 10;
        const searchQuery = requestData.searchQuery || '';
        const offset = (page - 1) * pageSize;
        const entityId = requestData.entityId || null;
        const statusCheck = requestData.statusCheck || false;

        let entityWhereCond = {};

        let whereCondition = {
            [Op.and]: [
                { doctor_name: { [Op.not]: null } },
            ],
        };

        if (statusCheck) whereCondition[Op.and].push({ status: 1 });

        // if (entityId) {
        //     whereCondition['$doctorEntities.entity.entity_id$'] = entityId;
        // };

        // if (entityType) {
        //     whereCondition['$doctorEntities.entity.entity_type$'] = entityType;
        // }

        if (entityId) entityWhereCond = { entity_id: entityId };

        if (searchQuery) {
            whereCondition[Op.or] = [
                { doctor_name: { [Op.like]: `%${searchQuery}%` } },
                { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
                { '$department.department_name$': { [Op.like]: `%${searchQuery}%` } },
                { '$doctorEntity.entity.entity_name$': { [Op.like]: `%${searchQuery}%` } }
            ];
        };
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
                'profileImageUrl',
                'department_id',
            ],
            where: whereCondition,

            include: [
                {
                    model: departmentModel,
                    attributes: ['department_name'],
                },
                {
                    model: doctorEntityModel,
                    attributes: ['consultationTime', 'consultationCharge'],
                    required: true,
                    include: [
                        {
                            model: entityModel,
                            attributes: ['entity_name', 'entity_id', 'entity_type'],
                            where: entityWhereCond,
                            required: true,

                        },
                    ],
                },

            ],

            limit: pageSize,
            offset: offset,
        });

        const totalPages = Math.ceil(count / pageSize);

        const response = {
            response: await Promise.all(records.map(async (record) => {
                const encryptedPhone = await encrypt(record.doctor_phone, process.env.CRYPTO_SECRET);
                return {
                    doctor_id: record.doctor_id,
                    doctor_name: record.doctor_name,
                    qualification: record.qualification,
                    doctor_phone: record.doctor_phone,
                    consultation_time: record.consultation_time,
                    consultation_charge: record.consultation_charge,
                    status: record.status,
                    description: record.description,
                    department_id: record.department ? record.department.department_id : '',
                    entity_id: record.doctorEntity ? record.doctorEntity.entity.entity_id : '',
                    profileImageUrl: record.profileImageUrl,
                    doctor_phone_encrypted: encryptedPhone,
                    department_name: record.department ? record.department.department_name : '',
                    entity_name: record.doctorEntity ? record.doctorEntity.entity.entity_name : '',
                    encryptedPhone: encryptedPhone,
                };
            })),
            currentPage: page,
            totalPages,
            totalCount: count,
        };

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Doctor list fetched successfully',
            data: response,
        });
    } catch (error) {
        console.error({ error });
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        });
    }
};


const getSingleEntityDetails = async (req, res) => {

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
                },
                    // {
                    //     model: pincodeModel,
                    // }
                ],
            }],
        });

        if (!entityDetails) {
            return handleResponse({
                res,
                statusCode: 400,
                message: 'Not found',
                data: {},
            });
        };

        const {
            entity_name,
            phone,
            email,
            entityAddress,
            imageUrl,
            description,
            status,
            gstNo,
        } = entityDetails;

        let streetName, cityName, districtName, stateName, pincode, stateId;
        if (entityAddress) {
            streetName = entityAddress.streetName;
            cityName = entityAddress.cityName;
            const district = entityAddress.district;
            districtName = district && district.districtName ? district.districtName : "";
            const state = entityAddress.state;
            stateName = state && state.stateName ? state.stateName : "";
            pincode = entityAddress.pincode ? entityAddress.pincode : "";
            // pincodeValue = pincode ? pincode.pincodeValue : "";
            stateId = entityAddress.stateId ? entityAddress.stateId : "";
        };

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
            pincode: pincode ? pincode : "",
            stateId: stateId ? stateId : "",
            status,
            gstNo,
        };

        const departmentList = await adminServices.listDeptByClinic({ entityId }, res, 1)

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Entity details fetched successfully',
            data: {
                entityResponse,
                departmentList,
            },
        });
    } catch (error) {
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {

            },
        })
    }

};

const amountDetails = async (req, res) => {

    try {
        const { entityId, encryptedPhone } = req.body;
        const doctorPhone = await decrypt(encryptedPhone, process.env.CRYPTO_SECRET);

        const isValidDr = await doctorModel.findOne({ where: { doctor_phone: doctorPhone }, attributes: ['doctor_id'] });

        if (!isValidDr) {
            return handleResponse({
                res,
                statusCode: 400,
                message: 'Doctor Not found',
                data: {},
            });
        };
        const isValidEntity = await entityModel.findOne({ where: { entity_id: entityId }, attributes: ['entity_id'] });

        if (!isValidEntity) {
            return handleResponse({
                res,
                statusCode: 400,
                message: 'Invalid entity ID',
                data: {},
            });
        };

        const getDoctor = await doctorModel.findOne({
            where: { doctor_id: isValidDr.doctor_id },
            include: [

                {
                    model: doctorEntityModel,
                    attributes: ['consultationTime', 'consultationCharge', 'entityId'],
                    where: { entityId, doctorId: isValidDr.doctor_id },
                    include: [
                        {
                            model: entityModel,
                            attributes: ['entity_name'],
                        },
                    ],
                },
            ],
        });
        if (!getDoctor) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'Error while fetching doctor details',
                data: {},
            })
        };
        const bookingFee = await bookingFeeModel.findOne({
            where: { status: 1 },
            attributes: ['bookingFeeId', 'fee']
        });
        if (!bookingFee) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'Booking Fee Error',
                data: {},
            })
        };
        if (!getDoctor.doctorEntity) {
            return handleResponse({
                res,
                statusCode: 500,
                message: 'Doctor not assosiateed with this entity',
                data: {},
            });
        };

        const consultationCharge = getDoctor.doctorEntity ? getDoctor.doctorEntity.consultationCharge : 0;

        // const amountDetails = await calcAmountDetails(entityId, consultationCharge);
        const amountDetails = { consultationCharge ,bookingFee:parseInt(bookingFee.fee)};

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Amount details fetched successfully',
            data: amountDetails,
        });

    } catch (error) {
        console.log(error)
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        });
    }
};


export default { listDoctorsForCustomers, getSingleEntityDetails, amountDetails };
