const Joi = require('joi')
const utils = require('../../../../config/utils/js/shared_utils')
const errorMsgs = require('../../../../enum/enum.errorMessages')

let validators = {
    init: (req, res, next) => {
        let schema = Joi.object({
            appVersion: Joi.string().required(),
            userID: Joi.string().required(),
            apiVersion: Joi.string().required(),
            cleverTapID: Joi.string().required(),
        })
        let { error, value } = schema.validate(req.body)

        if (error) {
            utils._initiate_Response(
                req,
                200,
                '415',
                { error: error['details'] },
                errorMsgs['PARAMETER_MISSING'].value['en'],
                res
            )
        } else {
            req.xop = value
            next()
        }
    },

    initDevice: (req, res, next) => {
        let schema = Joi.object({
            userID: Joi.string().allow('', null),
            publicKey: Joi.string().required(),
            deviceSpecs: Joi.object({
                osVersion: Joi.string(),
                brand: Joi.string(),
                device: Joi.string(),
                imei: Joi.string(),
                incremental: Joi.string(),
                manufacturer: Joi.string(),
                product: Joi.string(),
                model: Joi.string(),
                location: Joi.object({
                    area: Joi.string().allow('', null),
                    country: Joi.string().allow('', null),
                    latitude: Joi.string().allow('', null),
                    locality: Joi.string().allow('', null),
                    locatedAt: Joi.string().allow('', null),
                    longitude: Joi.string().allow('', null),
                    postalCode: Joi.string().allow('', null),
                    subLocality: Joi.string().allow('', null),
                }),
            }),
            cleverTapID: Joi.string().required(),
            deviceID: Joi.string().optional(),
        })
        let { error, value } = schema.validate(req.body)

        if (error) {
            utils._initiate_Response(
                req,
                200,
                '415',
                { error: error['details'] },
                errorMsgs['PARAMETER_MISSING'].value['en'],
                res
            )
        } else {
            req.xop = value
            next()
        }
    },
    getProfile: (req, res, next) => {
        let schema = Joi.object({
            userID: Joi.string().allow('', null),
        })
        let { error, value } = schema.validate(req.body)

        if (error) {
            utils._initiate_Response(
                req,
                200,
                '415',
                { error: error['details'] },
                errorMsgs['PARAMETER_MISSING'].value['en'],
                res
            )
        } else {
            req.xop = value
            next()
        }
    },
}

module.exports = validators
