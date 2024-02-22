import authenticationModel from '../../../../models/entityModel.js'
import profileModel from '../../../../models/doctorModel.js'
import deptModel from '../../../../models/departmentModel.js'
import { handleResponse } from '../../../../utils/handlers.js'
import { generateTokens, generateAdminTokens } from '../../../../utils/token.js'
import { Op } from 'sequelize'

// import upload from '../../../../middlewares/multerConfig.js';
import awsUtils from '../../../../utils/aws.js'
import entityModel from '../../../../models/entityModel.js'
import departmentModel from '../../../../models/departmentModel.js'
import workScheduleModel from '../../../../models/workScheduleModel.js'
import { generateUuid } from '../../../../utils/generateUuid.js'
import userModel from '../../../../models/userModel.js'
import doctorModel from '../../../../models/doctorModel.js'
import { hashPassword, comparePasswords } from '../../../../utils/password.js'

const adminRegister = async (credentials, res) => {
    try {
        let { email, phone, password, name } = credentials
        let data = await userModel.findOne({ where: { phone } })
        if (data) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'Admin registeration not possible',
            })
        }
        let uuid = await generateUuid()
        let hashedPassword = await hashPassword(password)

        let newData = await userModel({
            phone,
            name,
            uuid,
            userType: 0,
            email,
            password: hashedPassword,
        })
        await newData.save()
    } catch (err) {
        console.log({ err })
    }
}

const adminLogin = async (credentials, res) => {
    try {
        let { email, password } = credentials
        let userData = await userModel.findOne({
            where: { email },
            attributes: ['password'],
        })
        let passwordCheck = await comparePasswords(password, userData.password)
        if (!passwordCheck)
            return handleResponse({
                res,
                message: 'Please check the credentials',
                statusCode: 404,
            })
        let tokens = await generateAdminTokens(email)
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Successfully signed in.',
            data: {
                refreshToken: tokens.refreshToken,
                accessToken: tokens.accessToken,
            },
        })
    } catch (err) {
        console.log({ err })
        return handleResponse({
            res,
            message: 'Sorry! Unable to login',
            statusCode: 404,
        })
    }
}

const register = async (userData, res) => {
    // enitity add
    try {
        const { phone } = userData
        const getUser = await authenticationModel.findOne({ where: { phone } })
        let tokens = await generateTokens(phone)
        if (getUser) {
            return handleResponse({
                res,
                statusCode: '200',
                message: 'User already exists',
                data: {
                    entity_id: getUser.entity_id,
                    phone: getUser.phone,
                    access_token: tokens.accessToken,
                    refresh_token: tokens.refreshToken,
                    profile_completed: getUser.profile_completed,
                    status: getUser.status,
                    entity_type: getUser.entity_type ? getUser.entity_type : '',
                },
            })
        }
        const newUser = new authenticationModel(userData)
        const addedUser = await newUser.save()
        return handleResponse({
            res,
            statusCode: '200',
            message: 'User added',
            data: {
                entity_id: addedUser.entity_id,
                phone: addedUser.phone,
                profile_completed: addedUser.profile_completed,
                status: addedUser.status,
                entity_type: addedUser.entity_type ? addedUser.entity_type : '',
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken,
            },
        })
    } catch (error) {
        console.log({ 'Error while registeration': error })
        return handleResponse({
            res,
            message: 'Sorry error while registering.',
            statusCode: 422,
        })
    }
}

const addProfile = async (userData, user, image, res) => {
    // doctor add
    try {
        let {
            entity_name,
            email,
            business_type,
            account_no,
            ifsc_code,
            bank_name,
            UPI_ID,
            account_holder_name,
            doctor_name,
            qualification,
            consultation_time,
            consultation_charge,
            department_id,
            description,
            doctor_phone,
        } = userData

        let getUser = await authenticationModel.findOne({
            where: { phone: user.phone },
        })

        // let imageUrl = await awsUtils.uploadToS3(image);
        getUser.entity_name = entity_name
        getUser.business_type_id = business_type == 'individual' ? 1 : 0
        getUser.email = email
        getUser.account_no = account_no
        getUser.ifsc_code = ifsc_code
        getUser.bank_name = bank_name
        getUser.UPI_ID = UPI_ID
        getUser.account_holder_name = account_holder_name

        let profile_completed = 0
        let entityData = await getUser.save()

        let entity_id = entityData.entity_id
        let userProfile = await profileModel.findOne({
            where: { doctor_phone },
        })
        console.log({ userProfile })
        const getDepartment = await departmentModel.findOne({
            where: { department_id },
        })

        if (!userProfile) {
            userProfile = new profileModel({
                doctor_name,
                qualification,
                consultation_charge,
                consultation_time,
                entity_id,
                profile_completed,
                doctor_phone,
                department_id,
                description,
                // profileImageUrl: imageUrl.Key ? imageUrl.Key : "",
            })
        } else {
            userProfile.doctor_name = doctor_name
            userProfile.doctor_phone = doctor_phone
            userProfile.qualification = qualification
                ? qualification.trim()
                : ''
            userProfile.consultation_charge = consultation_charge
            userProfile.consultation_time = consultation_time
            userProfile.entity_id = entity_id
            userProfile.profile_completed = profile_completed
            userProfile.department_id = department_id
            userProfile.description = description ? description.trim() : ''
            //  userProfile.profileImageUrl = imageUrl.Key ? imageUrl.Key : "";
        }
        let profile = await userProfile.save()
        const randomUUID = await generateUuid()
        await userModel.create({
            uuid: randomUUID,
            userType: 'doctor',
            name: doctor_name,
            phone: doctor_phone,
        })

        return handleResponse({
            res,
            statusCode: 200,
            message: 'Profile created succesfully',
            data: {
                entity_id: entityData.entity_id,
                phone: entityData.phone,
                profile_completed: entityData.profile_completed,
                status: entityData.status,
                entity_type: entityData.entity_type,
                designation: getDepartment.department_name,
                profile,
            },
        })
    } catch (error) {
        console.log({ 'Error while registeration': error })
        return handleResponse({
            res,
            message: 'Sorry error while adding profile.',
            statusCode: 422,
        })
    }
}

const getProfile = async (req, res) => {
    try {
        const phone = req.user.phone
        let getUser = await authenticationModel.findOne({ where: { phone } })
        let userProfile = await profileModel.findOne({
            where: { entity_id: getUser.entity_id },
        })
        let statusCode, message, getDepartment
        if (!userProfile) {
            ;(message =
                'Sorry! Unable to fetch user profile associated with this phone.'),
                (statusCode = 404)
        }
        let availableSlots = await workScheduleModel.findAll({
            where: { entity_id: getUser.entity_id, status: 1 },
            attributes: ['Day'],
        })
        if (!availableSlots) {
            ;(message =
                'Sorry! Unable to fetch available slots associated with this phone.'),
                (statusCode = 404)
        }
        let uniqueDays = []
        let seenDays = new Set()
        if (availableSlots) {
            availableSlots.forEach((slot) => {
                if (
                    slot &&
                    slot.dataValues &&
                    slot.dataValues.Day &&
                    !seenDays.has(slot.dataValues.Day)
                ) {
                    uniqueDays.push(slot.dataValues.Day)
                    seenDays.add(slot.dataValues.Day)
                }
            })
            message = 'Profile fetched succesfully'
            statusCode = 200
            getDepartment = await departmentModel.findOne({
                where: { department_id: userProfile.department_id },
            })
        }
        let key = userProfile?.profileImageUrl
        const url = await awsUtils.getPresignUrlPromiseFunction(key)

        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                entity_id: getUser?.entity_id,
                phone: getUser?.phone,
                doctor_name: userProfile?.doctor_name,
                qualification: userProfile?.qualification,
                consultation_time: userProfile?.consultation_time,
                consultation_charge: userProfile?.consultation_charge,
                doctor_id: userProfile?.doctor_id,
                profileImageUrl: url,
                description: userProfile?.description,
                // uniqueDays,
                designation: getDepartment?.department_name,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching profile',
            statusCode: 422,
        })
    }
}

const getProfileForCustomer = async ({ phone }, res) => {
    try {
        let getUser = await authenticationModel.findOne({ where: { phone } })
        let userProfile = await profileModel.findOne({
            where: { entity_id: getUser.entity_id },
        })
        let statusCode, message, getDepartment
        if (!userProfile) {
            ;(message =
                'Sorry! Unable to fetch user profile associated with this phone.'),
                (statusCode = 404)
        }
        let availableSlots = await workScheduleModel.findAll({
            where: { entity_id: getUser.entity_id, status: 1 },
            attributes: ['Day'],
        })
        if (!availableSlots) {
            ;(message =
                'Sorry! Unable to fetch available slots associated with this phone.'),
                (statusCode = 404)
        }
        let uniqueDays = []
        let seenDays = new Set()
        if (availableSlots) {
            availableSlots.forEach((slot) => {
                if (
                    slot &&
                    slot.dataValues &&
                    slot.dataValues.Day &&
                    !seenDays.has(slot.dataValues.Day)
                ) {
                    uniqueDays.push(slot.dataValues.Day)
                    seenDays.add(slot.dataValues.Day)
                }
            })
            message = 'Profile fetched succesfully'
            statusCode = 200
            getDepartment = await departmentModel.findOne({
                where: { department_id: userProfile.department_id },
            })
        }
        let key = userProfile?.profileImageUrl
        const url = await awsUtils.getPresignUrlPromiseFunction(key)

        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                entity_id: getUser?.entity_id,
                phone: getUser?.phone,
                doctor_name: userProfile?.doctor_name,
                qualification: userProfile?.qualification,
                consultation_time: userProfile?.consultation_time,
                consultation_charge: userProfile?.consultation_charge,
                doctor_id: userProfile?.doctor_id,
                profileImageUrl: url,
                description: userProfile?.description,
                uniqueDays,
                designation: getDepartment?.department_name,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching profile',
            statusCode: 422,
        })
    }
}

const getGeneralSettings = async (req, res) => {
    try {
        const phone = req.user.phone
        let getEntity = await authenticationModel.findOne({ where: { phone } }) // entitymodel
        let doctorProfile = await profileModel.findOne({
            where: { entity_id: getEntity.entity_id },
        })
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Fetched general settings ',
            data: {
                doctor_id: doctorProfile.doctor_id,
                phone: doctorProfile.phone,
                bookingLinkStatus: doctorProfile.status,
                consultationDuration: doctorProfile.consultation_time,
                addStaff: getEntity.add_staff,
                addService: getEntity.add_service,
                entityStatus: getEntity.status,
                profile_completed: getEntity.profile_completed,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while fetching.',
            statusCode: 422,
        })
    }
}

const addDept = async (deptData, userData, res) => {
    try {
        let { department_name } = deptData
        let { entity_id } = userData
        let status = 1
        let dept, message, statusCode
        dept = await deptModel.findOne({
            where: { entity_id, department_name },
        })
        message = 'Department already exist.'
        statusCode = 422
        if (!dept) {
            let newDept = new deptModel({ entity_id, department_name, status })
            dept = await newDept.save()
            message = 'Department added'
            statusCode = 200
        }
        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                department_id: dept.department_id,
                entity_id: dept.entity_id,
                status: dept.status,
                department_name: dept.department_name,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Error while adding department.',
        })
    }
}

const getBankDetails = async (userData, res) => {
    try {
        let { entity_id } = userData
        let message, statusCode
        let bankdata = await entityModel.findOne({
            where: { entity_id },
            attributes: [
                'account_no',
                'ifsc_code',
                'bank_name',
                'account_holder_name',
                'UPI_ID',
            ],
        })
        if (!handleResponse) {
            statusCode = 422
            message = 'Sorry unable to fetch.'
        } else {
            ;(statusCode = 200), (message = 'Successfully fetched data')
        }
        return handleResponse({
            res,
            statusCode,
            message,
            data: {
                bankdata,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Error while fetching bank details.',
        })
    }
}

const updateEntityStatus = async (userData, res) => {
    try {
        let { entity_id } = userData
        let authData = await authenticationModel.findOne({
            where: { entity_id },
            attributes: ['status'],
        })

        let data = await authenticationModel.update(
            {
                status: !authData.status,
            },
            {
                where: {
                    entity_id,
                },
            }
        )
        return handleResponse({
            res,
            message: 'Successfully updated status.',
            statusCode: 200,
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Error while updating the status.',
            statusCode: 422,
        })
    }
}

const updateProfileDetails = async (doctorProfile, params, res) => {
    try {
        let { id } = params
        console.log({ doctorProfile, id })
        let updatedProfile = await doctorModel.update(
            { ...doctorProfile },
            { where: { doctor_id: id } }
        )
        let doctorData = await doctorModel.findOne({
            where: { doctor_id: id },
            attributes: ['entity_id'],
        })
        let updatedEntity = await entityModel.update(
            {
                ...doctorProfile,
            },
            { where: { entity_id: doctorData.entity_id } }
        )
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Sucessfully updated the doctor profile.',
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Sorry! Try after sometime.',
            statusCode: 404,
        })
    }
}
const doctorsList = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1
        const pageSize = parseInt(requestData.limit) || 10
        const searchQuery = requestData.searchQuery || ''
        const offset = (page - 1) * pageSize

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
            where: {
                [Op.or]: [
                    { doctor_name: { [Op.like]: `%${searchQuery}%` } }, // Search for doctor_name containing the search query
                    { doctor_phone: { [Op.like]: `%${searchQuery}%` } }, // Search for phone containing the search query
                ],
            },
            limit: pageSize,
            offset: offset,
        })
        const totalPages = Math.ceil(count / pageSize) // Calculate total number of pages

        const departmentIds = records.map((record) => record.department_id)
        const entityIds = records.map((record) => record.entity_id)
        const departments = await departmentModel.findAll({
            where: {
                department_id: departmentIds,
            },
            attributes: ['department_id', 'department_name'],
        })

        const entities = await entityModel.findAll({
            where: {
                entity_id: entityIds,
            },
            attributes: ['entity_id', 'entity_name'],
        })
        const departmentMap = {}
        departments.forEach((department) => {
            departmentMap[department.department_id] = department.department_name
        })

        const entityMap = {}
        entities.forEach((entity) => {
            entityMap[entity.entity_id] = entity.entity_name
        })

        // Merging department_name and entity_name into doctor records
        records.forEach((record) => {
            record.department_name = departmentMap[record.department_id]
            record.entity_name = entityMap[record.entity_id]
            delete record.department_id // Optional: Remove department_id and entity_id from the record
            delete record.entity_id
        })
        const response = {
            records: records.map((record) => ({
                ...record.dataValues,
                department_name: record.department_name,
                entity_name: record.entity_name,
            })),
        }
        console.log(response)
        return handleResponse({
            res,
            statusCode: '200',
            data: {
                response: response.records,
                currentPage: page,
                totalPages,
                totalCount: count,
            },
        })
    } catch (error) {
        console.log({ error })
    }
}

const departmentList = async (requestData, res) => {
    try {
        //  let { entity_id } = requestData
        const page = parseInt(requestData.page) || 1
        const pageSize = parseInt(requestData.limit) || 10
        const searchQuery = requestData.searchQuery || ''
        const offset = (page - 1) * pageSize
        const { count, rows: data } = await departmentModel.findAndCountAll(
            //{where:{entity_id}}
            {
                attributes: ['department_name', 'department_id', 'entity_id'],
                where: {
                    [Op.or]: [
                        { department_name: { [Op.like]: `%${searchQuery}%` } },
                    ],
                },
                limit: pageSize,
                offset: offset,
            }
        )
        const totalPages = Math.ceil(count / pageSize)
        if (data)
            return handleResponse({
                res,
                message: 'Successfully fetched data',
                statusCode: 200,
                data: {
                    data,
                    currentPage: page,
                    totalPages,
                    totalCount: count,
                },
            })
    } catch (err) {
        console.log({ err })
        return handleResponse({
            res,
            message: 'Failed in loading department list.',
            statusCode: 404,
        })
    }
}

export default {
    register,
    addProfile,
    addDept,
    getProfile,
    getGeneralSettings,
    getBankDetails,
    getProfileForCustomer,
    updateEntityStatus,
    updateProfileDetails,
    adminLogin,
    adminRegister,
    doctorsList,
    departmentList,
}
