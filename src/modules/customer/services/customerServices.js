import userModel from '../../../models/userModel.js';
import doctorModel from '../../../models/doctorModel.js'
import entityModel from '../../../models/entityModel.js'
import departmentModel from '../../../models/departmentModel.js'
import { handleResponse } from '../../../utils/handlers.js'
import { Op, Sequelize } from 'sequelize';
import { encrypt } from '../../../utils/token.js';

const listDoctorsForCustomers = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1;
        const pageSize = parseInt(requestData.limit) || 10;
        const searchQuery = requestData.searchQuery || '';
        const offset = (page - 1) * pageSize;

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
            ],
            // where: {
            //     [Op.or]: [
            //         { doctor_name: { [Op.like]: `%${searchQuery}%` } },
            //         { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
            //     ],
            // },
            where: {
                [Op.and]: [
                    { doctor_name: { [Op.not]: null } }, // Ensuring doctor_name is not null
                    {
                        [Op.or]: [
                            { doctor_name: { [Op.like]: `%${searchQuery}%` } },
                            { doctor_phone: { [Op.like]: `%${searchQuery}%` } },
                        ],
                    },
                ],
            },
            limit: pageSize,
            offset: offset,
        });

        const totalPages = Math.ceil(count / pageSize);

        const departmentIds = records.map((record) => record.department_id);
        const entityIds = records.map((record) => record.entity_id);
        const departments = await departmentModel.findAll({
            where: {
                department_id: departmentIds,
            },
            attributes: ['department_id', 'department_name'],
        });

        const entities = await entityModel.findAll({
            where: {
                entity_id: entityIds,
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

        // Encrypt doctor_phone for each record
        const encryptedRecords = await Promise.all(records.map(async (record) => {
            const encryptedPhone = await encrypt(record.doctor_phone, process.env.CRYPTO_SECRET);

            // Update the record with the encrypted phone
            record.doctor_phone_encrypted = encryptedPhone;

            return record;
        }));

        // Merging department_name, entity_name, and encrypted phone into doctor records
        const response = {
            records: encryptedRecords.map((record) => ({
                ...record.dataValues,
                department_name: departmentMap[record.department_id],
                entity_name: entityMap[record.entity_id],
                encryptedPhone: record.doctor_phone_encrypted,
            })),
        };

        // Return the response
        return handleResponse({
            res,
            statusCode: '200',
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


export default { listDoctorsForCustomers }
