import userModel from '../../../../models/userModel.js'
import doctorModel from '../../../../models/doctorModel.js'
import entityModel from '../../../../models/entityModel.js'
import departmentModel from '../../../../models/departmentModel.js'
import paymentModel from '../../../../models/paymentModel.js'
import bookingModel from '../../../../models/bookingModel.js'
import weeklyTimeSlotsModel from '../../../../models/weeklyTimeSlotsModel.js'
import { hashPassword, comparePasswords } from '../../../../utils/password.js'
import { generateAdminTokens } from '../../../../utils/token.js'
import { generateUuid } from '../../../../utils/generateUuid.js'
import { handleResponse } from '../../../../utils/handlers.js'
import { Op, Sequelize } from 'sequelize';
import businessModel from '../../../../models/businessModel.js'

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

        let newData = await new userModel({
            phone,
            name,
            uuid,
            userType: 0,
            email,
            password: hashedPassword,
        })
        await newData.save()
        return handleResponse({
            res,
            message: 'Successfully registered user',
            statusCode: 200,
        })
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

const addDept = async (deptData, userData, res) => {
    try {
        let { department_name } = deptData
        let { entity_id } = userData
        let status = 1
        let dept, message, statusCode
        dept = await departmentModel.findOne({
            where: { entity_id, department_name },
        })
        message = 'Department already exist.'
        statusCode = 422
        if (!dept) {
            let newDept = new departmentModel({
                entity_id,
                department_name,
                status,
            })
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

const entityList = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1
        const pageSize = parseInt(requestData.limit) || 10
        const offset = (page - 1) * pageSize
        const { count, rows: data } = await entityModel.findAndCountAll({
            attributes: ['entity_name', 'entity_id', 'status'],
            where: {
                status: 1,
            },
            limit: pageSize,
            offset: offset,
        })
        const totalPages = Math.ceil(count / pageSize)
        let message
        if (data) message = 'Sucessfully fetched data'
        else message = 'No data found'
        return handleResponse({
            res,
            message,
            statusCode: 200,
            data: {
                data,
                currentPage: page,
                totalCount: count,
                data,
                totalPages,
            },
        })
    } catch (err) {
        console.log({ err })
    }
}

const transactionHistory = async (requestData, res) => {
    try {
        const page = parseInt(requestData.page) || 1
        const pageSize = parseInt(requestData.limit) || 10
        const searchQuery = requestData.searchQuery || ''
        const offset = (page - 1) * pageSize

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
                'customerId',
                'amount',
                'bookingId',
                'workSlotId',
                'bookingStatus',
                'appointmentDate',
            ],
            limit: pageSize,
            offset: offset,
        });
        
        // Extracting bookingIds from the result for the next query
        const bookingIds = bookings.map((booking) => booking.bookingId);
        
        // Query to retrieve associated payment information
        const payments = await paymentModel.findAll({
            attributes: [
                'orderId',
                'transactionId',
                [Sequelize.literal('`payment`.`updatedAt`'), 'paymentDate'],
            ],
            where: {
                orderId: {
                    [Op.in]: bookingIds,
                },
                paymentStatus: 1,
            },
        });
        
        // Merging booking and payment information based on the orderId
        const transactions = bookings.map((booking) => {
            const associatedPayment = payments.find((payment) => payment.orderId === booking.bookingId);
        
            return {
                ...booking.toJSON(),
                paymentOrderId: associatedPayment ? associatedPayment.orderId : null,
                paymentTransactionId: associatedPayment ? associatedPayment.transactionId : null,
                paymentDate: associatedPayment ? associatedPayment.paymentDate : null,
            };
        });
        
        const totalPages = Math.ceil(count / pageSize) // Calculate total number of pages

        // Extract unique customerIds and workSlotIds
        const customerIds = new Set(
            transactions.map((transaction) => transaction.customerId)
        )
        const workSlotIds = new Set(
            transactions.map((transaction) => transaction.workSlotId)
        )

        // Fetch doctors corresponding to workSlotIds
        const doctorIds = await weeklyTimeSlotsModel.findAll({
            where: {
                time_slot_id: {
                    [Op.in]: [...workSlotIds],
                },
            },
            attributes: ['doctor_id', 'time_slot_id'],
        })

        // Create a map of workSlotIds to doctorIds
        const doctorIdMap = {}
        doctorIds.forEach((doctor) => {
            doctorIdMap[doctor.time_slot_id] = doctor.doctor_id
        })

        // Fetch doctors corresponding to uniqueDoctorIds
        const doctors = await doctorModel.findAll({
            where: {
                doctor_id: {
                    [Op.in]: Object.values(doctorIdMap),
                },
            },
            attributes: ['doctor_id', 'doctor_name'],
        })

        // Create a map of doctorIds to doctor names
        const doctorNameMap = {}
        doctors.forEach((doctor) => {
            doctorNameMap[doctor.doctor_id] = doctor.doctor_name
        })
       console.log("transactions====", transactions)
        // Update transactions with doctorName, customerName, and customerPhone
        transactions = transactions.map((transaction) => ({
            ...transaction,
            doctorName: doctorNameMap[doctorIdMap[transaction.workSlotId]],
        }))
      
        // Fetch customer names and phone numbers
        const customers = await userModel.findAll({
            where: {
                userId: {
                    [Op.in]: [...customerIds],
                },
            },
            attributes: ['userId', 'name', 'phone'],
        })

        // Create a map of customerIds to customer details
        const customerMap = {}
        customers.forEach((customer) => {
            customerMap[customer.userId] = {
                customerName: customer.name,
                customerPhone: customer.phone,
            }
        })

        // Update transactions with customerName and customerPhone
        transactions.forEach((transaction) => {
            const customerDetails = customerMap[transaction.customerId]
            transaction.customerName = customerDetails
                ? customerDetails.customerName
                : null
            transaction.customerPhone = customerDetails
                ? customerDetails.customerPhone
                : null
        })

        console.log(transactions)
        let message, data

        if (!transactions) {
            message = 'Sorry! no transaction history.'
        } else {
            message = 'Successfully fetched transaction details.'
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
        })
    } catch (err) {
        console.log({ err })
        return handleResponse({
            res,
            message: 'Error in fetching transaction history.',
            statusCode: 500,
        })
    }
}

const addProfile = async (docData, res) => {
    try {
        let redirection, addValue, message, statusCode
        if (docData.businessType == 'individual') {
            addValue = await individualProfile(docData)
            redirection = true
        } else {
            addValue = await staffProfile(docData)
            redirection = false
        }
        message = addValue
            ? 'Successfully added profile.'
            : 'Sorry try after sometime.'
        statusCode = addValue ? 200 : 404
        return handleResponse({
            res,
            message,
            statusCode,
            data: {
                entityId: addValue.entityId,
                redirection,
            },
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

const individualProfile = async ({
    doctor_name,
    doctor_phone,
    qualification,
    email,
    consultation_time,
    consultation_charge,
    department_id,
    description,
    // business_type_id,
}) => {
    try {
        let entityData = await entityModel.findOne({
            where: { phone: doctor_phone },
        })
       let business_type_id = await businessModel.findOne({where:{businessName:'Clinic'},attributes:['businessId']})

        let docData, newEntity, newDocData
        if (!entityData) {
            entityData = await new entityModel({
                phone: doctor_phone,
                entity_name: doctor_name,
                business_type_id:business_type_id.businessId,
            })
            newEntity = await entityData.save()
            docData = await new doctorModel({
                doctor_name,
                doctor_phone,
                qualification,
                description,
                email,
                consultation_time,
                consultation_charge,
                department_id,
                entity_id: newEntity.entity_id,
            })
        } else {
            docData = await doctorModel.findOne({ where: { doctor_phone } })
            if (!docData) {
                docData = await new doctorModel({
                    doctor_name,
                    doctor_phone,
                    qualification,
                    description,
                    email,
                    consultation_time,
                    consultation_charge,
                    department_id,
                    entity_id: entityData.entity_id,
                })
                console.log({ docData })
            } else {
                docData.doctor_name = doctor_name
                docData.qualification = qualification
                docData.email = email
                docData.consultation_time = consultation_time
                docData.consultation_charge = consultation_charge
                docData.department_id = department_id
                docData.description = description
                docData.entity_id = entityData.entity_id
            }
        }
        newDocData = await docData.save()
        return { entityId: newDocData.entity_id }
    } catch (error) {
        console.log({ error })
        return false
    }
}

const staffProfile = async ({
    doctorName,
    doctorPhone,
    qualification,
    email,
    consultationTime,
    consultationCharge,
    department_id,
    description,
    entity_id,
}) => {
    try {
        let docData, newDocData
        docData = await doctorModel.findOne({
            where: { doctorPhone, entity_id },
        })
        if (!docData) {
            docData = await new doctorModel({
                doctorName,
                doctorPhone,
                qualification,
                email,
                consultationTime,
                consultationCharge,
                department_id,
                description,
                entity_id,
            })
        } else {
            docData.doctorName = doctorName
            docData.doctorPhone = doctorPhone
            docData.qualification = qualification
            ;(docData.email = email),
                (docData.consultationTime = consultationTime)
            docData.consultationCharge = consultationCharge
            docData.department_id = department_id
            docData.department_id = department_id
            docData.entity_id = entity_id
        }
        newDocData = await docData.save()
        return { entityId: newDocData.entity_id }
    } catch (error) {
        console.log({ error })
        return false
    }
}
const getUserDetails = async (search) => {
    const whereCondition = {}
    if (search) {
        whereCondition.name = { [Sequelize.Op.like]: `%${search}%` }
    }
    const usersWithDetails = await userModel.findAll({
        attributes: ['userId', 'name', 'phone'],
        where: {
            userType: 1,
            ...whereCondition,
        },
        raw: true,
    })

    return usersWithDetails
}

const getBookingDetails = async (customerId) => {
    const bookingDetails = await bookingModel.findAll({
        attributes: [
            'bookingId',
            'bookingDate',
            'appointmentDate',
            'bookingStatus',
            'workSlotId',
        ],
        where: {
            customerId,
            bookingStatus: {
                [Op.not]: 3,
            },
        },
        raw: true,
    })

    return bookingDetails
}

const getDoctorDetails = async (workSlotId) => {
    const weeklyTimeSlots = await weeklyTimeSlotsModel.findAll({
        attributes: ['time_slot', 'time_slot_id', 'date', 'day', 'doctor_id'],
        where: {
            time_slot_id: workSlotId,
        },
        raw: true,
    })

    if (!weeklyTimeSlots.length) {
        return []
    }

    const doctorDetails = await doctorModel.findAll({
        attributes: ['doctor_id', 'doctor_name'],
        where: {
            doctor_id: weeklyTimeSlots[0].doctor_id,
        },
        raw: true,
    })

    return doctorDetails
}

const listAllCustomers = async (
    { page = 1, limit = 10, searchQuery = '', filter = {} },
    res
) => {
    try {
        const users = await getUserDetails(searchQuery)

        const totalUsersCount = users.length
        const totalPages = Math.ceil(totalUsersCount / limit)

        const paginatedUsers = users.slice((page - 1) * limit, page * limit)

        const customers = await Promise.all(
            paginatedUsers.map(async (user) => {
                const bookingDetails = await getBookingDetails(user.userId)

                const appointments = await Promise.all(
                    bookingDetails.map(async (booking) => {
                        const doctorDetails = await getDoctorDetails(
                            booking.workSlotId,
                            filter
                        )

                        return {
                            bookingId: booking.bookingId,
                            appointmentDate: booking.appointmentDate,
                            bookingStatus: booking.bookingStatus,
                            doctorName: doctorDetails.length
                                ? doctorDetails[0].doctor_name
                                : '',
                            doctorId: doctorDetails.length
                                ? doctorDetails[0].doctor_id
                                : '',
                        }
                    })
                )

                return {
                    userId: user.userId,
                    customerName: user.name,
                    phone: user.phone,
                    appointmentsDetails: appointments,
                }
            })
        )

        let finalCustomerList = customers
        if (filter.doctorId) {
            const filteredCustomers = customers.filter((customer) => {
                const matchingAppointments =
                    customer.appointmentsDetails.filter(
                        (appointment) =>
                            appointment.doctorId === filter.doctorId
                    )

                if (matchingAppointments.length > 0) {
                    console.log('Matching Customer:', customer)
                }

                return matchingAppointments.length > 0
            })
            finalCustomerList =
                filteredCustomers.length > 0 ? filteredCustomers : []
        }
        return handleResponse({
            res,
            statusCode: 200,
            message: 'Customer listing fetched successfully',
            data: {
                customers: finalCustomerList,
                totalCount: totalUsersCount,
                currentPage: page,
                limit: limit,
                totalPages,
            },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        })
    }
}

const addBankDetails = async (
    { entityId, account_no, ifsc_code, bank_name, account_holder_name, UPI_ID },
    res
) => {
    try {
        let entityData = await entityModel.findOne({
            where: { entity_id: entityId },
        })
        let newData, message, statusCode
        if (!entityData) {
            message = 'Sorry no entity data available with this ID.'
            statusCode = 404
        } else {
            entityData.account_no = account_no
            entityData.ifsc_code = ifsc_code
            entityData.bank_name = bank_name
            entityData.account_holder_name = account_holder_name
            entityData.UPI_ID = UPI_ID
            message = 'Successfully added bank details'
            statusCode = 200
            newData = await entityData.save()
        }
        return handleResponse({
            res,
            statusCode,
            message,
            data: { newData },
        })
    } catch (error) {
        console.log({ error })
        return handleResponse({
            res,
            message: 'Sorry try after sometime.',
            statusCode: 404,
        })
    }
}

const customerHistory = async (req, res) => {
    try {

        const { customerId, filter={} } = req.body;
        let userDetails = await userModel.findOne({ where: { userId: customerId } })

        if (!userDetails) {
            return handleResponse({
                res,
                statusCode: 404,
                message: 'User not found',
                data: {},
            });
        }

        const bookingDetails = await getBookingDetails(userDetails.userId);

        const visitingHistory = {};
        await Promise.all(
            bookingDetails.map(async (booking) => {
                const doctorDetails = await getDoctorDetails(booking.workSlotId);
                const paymentDetails = await paymentModel.findOne({ where: { bookingId: booking.bookingId } });

                if (doctorDetails.length) {
                    const doctorId = doctorDetails[0].doctor_id;
                    const appointmentDate = booking.appointmentDate.toISOString(); // Convert to ISO string for direct comparison

                    // Apply filters
                    const matchesDoctorId = !filter.doctorId || doctorId === filter.doctorId;
                    const matchesAppointmentDate = !filter.appointmentDate || appointmentDate.includes(filter.appointmentDate);

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
            message: 'Customer details with visiting history fetched successfully',
            data: customerDetailsWithHistory,
        });

    } catch (error) {
        console.log({ error });
        return handleResponse({
            res,
            statusCode: 500,
            message: 'Something went wrong',
            data: {},
        });
    }
}

export default {
    adminLogin,
    adminRegister,
    addDept,
    doctorsList,
    entityList,
    transactionHistory,
    addProfile,
    listAllCustomers,
    addBankDetails,
    customerHistory,
}
